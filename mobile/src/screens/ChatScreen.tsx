import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Keyboard,
  Animated,
  ScrollView,
} from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import { sendMessageToChatbot } from '../services/api';

type Props = { navigation: NativeStackNavigationProp<RootStackParamList, 'Chat'> };

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

const QUICK_SUGGESTIONS = [
  { label: '🤒 Fever', text: 'What should I do for a fever?' },
  { label: '🤕 Headache', text: 'Remedies for a severe headache' },
  { label: '🤧 Cold & Cough', text: 'Tips for running nose and cold' },
  { label: '🛒 How to Order', text: 'How do I place an order?' },
];

export default function ChatScreen({ navigation }: Props) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      text: "👋 **Hello! Welcome to MediCart AI Health Assistant.**\n\nI'm here to help you with common symptoms, medicine details, and step-by-step guidance on using the app.\n\nWhat can I assist you with today?",
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [usedSuggestions, setUsedSuggestions] = useState<string[]>([]);
  const flatListRef = useRef<FlatList>(null);
  const pulseAnim = useRef(new Animated.Value(0.4)).current;

  // Pulsing online dot animation
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.4,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [pulseAnim]);

  // Scroll list to bottom whenever messages list changes
  const scrollToBottom = () => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 150);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (text: string, suggestionLabel?: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    // Hide this suggestion pill immediately
    if (suggestionLabel) {
      setUsedSuggestions((prev) => [...prev, suggestionLabel]);
    }

    // Add user message
    const userMsg: Message = {
      id: Math.random().toString(),
      text: trimmed,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);
    Keyboard.dismiss();

    try {
      const response = await sendMessageToChatbot(trimmed);
      const botMsg: Message = {
        id: Math.random().toString(),
        text: response.reply,
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      console.warn('Chatbot Service Error:', err.message);
      const errorMsg: Message = {
        id: Math.random().toString(),
        text: "⚠️ **Connection Error**\n\nUnable to reach the AI assistant. Please make sure the Python chatbot service is running and your device is connected to the local network.",
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const renderMessageItem = ({ item }: { item: Message }) => {
    const isUser = item.sender === 'user';
    return (
      <View style={[styles.messageRow, isUser ? styles.userRow : styles.botRow]}>
        {!isUser && (
          <View style={styles.avatarMini}>
            <Text style={styles.avatarMiniText}>🤖</Text>
          </View>
        )}
        <View style={[styles.bubble, isUser ? styles.userBubble : styles.botBubble]}>
          <Text style={[styles.messageText, isUser ? styles.userText : styles.botText]}>
            {item.text}
          </Text>
          <Text style={[styles.timeText, isUser ? styles.userTime : styles.botTime]}>
            {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#065F46" />

      {/* Custom Premium Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>◀</Text>
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>AI Health Assistant</Text>
          <View style={styles.statusRow}>
            <Animated.View style={[styles.onlineDot, { opacity: pulseAnim }]} />
            <Text style={styles.statusText}>Active Online</Text>
          </View>
        </View>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>🤖</Text>
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessageItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={
            isTyping ? (
              <View style={styles.typingContainer}>
                <View style={styles.avatarMini}>
                  <Text style={styles.avatarMiniText}>🤖</Text>
                </View>
                <View style={[styles.bubble, styles.botBubble, styles.typingBubble]}>
                  <Text style={styles.typingText}>AI Assistant is typing...</Text>
                </View>
              </View>
            ) : null
          }
        />

        {/* Quick Suggestions — pills disappear one by one as used */}
        {!isTyping && QUICK_SUGGESTIONS.filter((s) => !usedSuggestions.includes(s.label)).length > 0 && (
          <View style={styles.suggestionsContainer}>
            <Text style={styles.suggestionsTitle}>💬 Ask about:</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.suggestionsRow}
            >
              {QUICK_SUGGESTIONS
                .filter((item) => !usedSuggestions.includes(item.label))
                .map((item) => (
                  <TouchableOpacity
                    key={item.label}
                    style={styles.suggestionPill}
                    onPress={() => handleSend(item.text, item.label)}
                    activeOpacity={0.75}
                  >
                    <Text style={styles.suggestionPillText}>{item.label}</Text>
                  </TouchableOpacity>
                ))}
            </ScrollView>
          </View>
        )}

        {/* Input Bar */}
        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            placeholder="Type a message or ask a symptom..."
            placeholderTextColor="#9CA3AF"
            value={inputText}
            onChangeText={setInputText}
            multiline={false}
            onSubmitEditing={() => handleSend(inputText)}
            returnKeyType="send"
          />
          <TouchableOpacity
            style={[styles.sendBtn, !inputText.trim() && styles.sendBtnDisabled]}
            onPress={() => handleSend(inputText)}
            disabled={!inputText.trim()}
            activeOpacity={0.8}
          >
            <Text style={styles.sendBtnText}>▶</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#065F46' },
  container: { flex: 1, backgroundColor: '#F9FAFB' },

  // Header styles
  header: {
    backgroundColor: '#065F46',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  backBtn: {
    padding: 8,
    marginRight: 8,
  },
  backBtnText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#34D399',
    marginRight: 6,
  },
  statusText: {
    color: '#A7F3D0',
    fontSize: 12,
    fontWeight: '500',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 22,
  },

  // Message list styles
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 18,
    paddingBottom: 24,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 16,
    maxWidth: '85%',
  },
  userRow: {
    alignSelf: 'flex-end',
    flexDirection: 'row-reverse',
  },
  botRow: {
    alignSelf: 'flex-start',
  },
  avatarMini: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  avatarMiniText: {
    fontSize: 14,
  },

  // Bubble styles
  bubble: {
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  userBubble: {
    backgroundColor: '#065F46',
    borderBottomRightRadius: 2,
  },
  botBubble: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 2,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  userText: {
    color: '#fff',
  },
  botText: {
    color: '#1F2937',
  },
  timeText: {
    fontSize: 10,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  userTime: {
    color: 'rgba(255,255,255,0.7)',
  },
  botTime: {
    color: '#9CA3AF',
  },

  // Typing state
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 16,
    alignSelf: 'flex-start',
    maxWidth: '85%',
  },
  typingBubble: {
    backgroundColor: '#F3F4F6',
  },
  typingText: {
    color: '#6B7280',
    fontSize: 13,
    fontStyle: 'italic',
  },

  // Suggestions styles
  suggestionsContainer: {
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 8,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  suggestionsTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6B7280',
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  suggestionsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingRight: 14,
  },
  suggestionPill: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#A7F3D0',
    flexShrink: 0,
  },
  suggestionPillText: {
    color: '#065F46',
    fontSize: 12,
    fontWeight: '700',
  },

  // Input bar styles
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  input: {
    flex: 1,
    height: 44,
    backgroundColor: '#F3F4F6',
    borderRadius: 22,
    paddingHorizontal: 18,
    fontSize: 15,
    color: '#1F2937',
    marginRight: 10,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#065F46',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#065F46',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  sendBtnDisabled: {
    backgroundColor: '#D1D5DB',
    shadowOpacity: 0,
    elevation: 0,
  },
  sendBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    transform: [{ rotate: '-45deg' }, { translateX: 1 }, { translateY: -1 }],
  },
});
