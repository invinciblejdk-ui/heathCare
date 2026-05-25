import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ScrollView,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import { clearAll } from '../utils/storage';

type Props = { navigation: NativeStackNavigationProp<RootStackParamList, 'Home'> };

const { width } = Dimensions.get('window');

const HEALTH_TIPS = [
  { emoji: '💧', tip: 'Drink 8 glasses of water daily to stay hydrated and energized.', color: ['#0EA5E9', '#38BDF8'] },
  { emoji: '🏃', tip: '30 minutes of brisk walking reduces heart disease risk by 35%.', color: ['#8B5CF6', '#A78BFA'] },
  { emoji: '🥗', tip: 'Eat 5 portions of fruits & vegetables daily for a stronger immune system.', color: ['#10B981', '#34D399'] },
  { emoji: '😴', tip: '7–9 hours of quality sleep is essential for memory and recovery.', color: ['#F59E0B', '#FCD34D'] },
  { emoji: '🧘', tip: 'Just 10 minutes of meditation a day reduces anxiety significantly.', color: ['#EC4899', '#F9A8D4'] },
];

const WELLNESS_FACTS = [
  { icon: '🫀', label: 'Heart Rate', value: '72 bpm', sub: 'Normal' },
  { icon: '🩺', label: 'Blood Pressure', value: '120/80', sub: 'Healthy' },
  { icon: '💊', label: 'Medicines', value: '2 Active', sub: 'On Track' },
  { icon: '🛡️', label: 'Immunity', value: 'Good', sub: 'Monitored' },
];

const QUICK_ACTIONS = [
  { emoji: '🔍', label: 'Find Medicine', dest: 'Medicines', color: '#065F46' },
  { emoji: '📋', label: 'My Orders', dest: 'Orders', color: '#7C3AED' },
  { emoji: '🛒', label: 'View Cart', dest: 'Cart', color: '#EA580C' },
  { emoji: '🤖', label: 'Ask AI', dest: 'Chat', color: '#0369A1' },
];

export default function HomeScreen({ navigation }: Props) {
  const [tipIndex, setTipIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const handleLogout = async () => {
    await clearAll();
    navigation.replace('Login');
  };

  const handleNavigation = (label: string) => {
    switch (label) {
      case 'Medicines': navigation.navigate('Medicines'); break;
      case 'My Cart':   navigation.navigate('Cart');      break;
      case 'Orders':    navigation.navigate('Orders');    break;
      case 'Profile':   navigation.navigate('Profile');   break;
      case 'AI Chatbot':navigation.navigate('Chat');      break;
      default: break;
    }
  };

  // Rotate health tip every 4 seconds with fade animation
  useEffect(() => {
    const interval = setInterval(() => {
      Animated.timing(fadeAnim, { toValue: 0, duration: 400, useNativeDriver: true }).start(() => {
        setTipIndex((prev) => (prev + 1) % HEALTH_TIPS.length);
        Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
      });
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Gentle pulse on the "Live" dot
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.4, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const currentTip = HEALTH_TIPS[tipIndex];

  return (
    <View style={styles.outerContainer}>
      <StatusBar barStyle="dark-content" backgroundColor="#F0FDF4" />

      {/* Fixed Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Good morning 👋</Text>
          <Text style={styles.name}>Welcome to MediCart</Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Banner */}
        <LinearGradient
          colors={['#065F46', '#059669', '#0D9F6F']}
          style={styles.banner}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        >
          <View style={styles.bannerRow}>
            <View style={{ flex: 1 }}>
              <View style={styles.liveBadge}>
                <Animated.View style={[styles.liveDot, { transform: [{ scale: pulseAnim }] }]} />
                <Text style={styles.liveText}>Your Health Dashboard</Text>
              </View>
              <Text style={styles.bannerTitle}>You're logged in! 🎉</Text>
              <Text style={styles.bannerSubtitle}>Browse medicines, track orders, and get AI health guidance.</Text>
            </View>
            <Text style={styles.bannerEmoji}>🏥</Text>
          </View>
        </LinearGradient>

        {/* Wellness Stats Strip */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>📊 Wellness Overview</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statsScroll}>
          {WELLNESS_FACTS.map((fact) => (
            <View key={fact.label} style={styles.statCard}>
              <Text style={styles.statIcon}>{fact.icon}</Text>
              <Text style={styles.statValue}>{fact.value}</Text>
              <Text style={styles.statLabel}>{fact.label}</Text>
              <View style={styles.statBadge}>
                <Text style={styles.statBadgeText}>{fact.sub}</Text>
              </View>
            </View>
          ))}
        </ScrollView>

        {/* Main Nav Grid */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>⚡ Quick Navigation</Text>
        </View>
        <View style={styles.grid}>
          {[
            { icon: '💊', label: 'Medicines', bg: '#ECFDF5', accent: '#065F46' },
            { icon: '🛒', label: 'My Cart',   bg: '#FFF7ED', accent: '#C2410C' },
            { icon: '📦', label: 'Orders',    bg: '#EEF2FF', accent: '#4338CA' },
            { icon: '👤', label: 'Profile',   bg: '#FDF4FF', accent: '#7E22CE' },
          ].map((item) => (
            <TouchableOpacity
              key={item.label}
              style={[styles.gridCard, { backgroundColor: item.bg }]}
              onPress={() => handleNavigation(item.label)}
              activeOpacity={0.8}
            >
              <Text style={styles.gridIcon}>{item.icon}</Text>
              <Text style={[styles.gridLabel, { color: item.accent }]}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* AI Chatbot Card */}
        <TouchableOpacity
          style={styles.chatbotCard}
          onPress={() => handleNavigation('AI Chatbot')}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={['#064E3B', '#065F46', '#047857']}
            style={styles.chatbotGradient}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          >
            <View style={styles.chatbotContent}>
              <View style={styles.chatbotLeft}>
                <View style={styles.chatbotBadge}>
                  <Text style={styles.chatbotBadgeText}>✨ AI Powered</Text>
                </View>
                <Text style={styles.chatbotTitle}>🤖 AI Health Chatbot</Text>
                <Text style={styles.chatbotSubtitle}>
                  Get instant symptom guidance, medicine info & more.
                </Text>
              </View>
              <View style={styles.chatBtnWrap}>
                <View style={styles.chatbotBtn}>
                  <Text style={styles.chatbotBtnText}>Chat Now →</Text>
                </View>
              </View>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Rotating Health Tips */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>💡 Daily Health Tip</Text>
          <View style={styles.tipDots}>
            {HEALTH_TIPS.map((_, i) => (
              <View key={i} style={[styles.dot, i === tipIndex && styles.dotActive]} />
            ))}
          </View>
        </View>
        <Animated.View style={{ opacity: fadeAnim }}>
          <LinearGradient
            colors={currentTip.color as [string, string]}
            style={styles.tipCard}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          >
            <Text style={styles.tipEmoji}>{currentTip.emoji}</Text>
            <Text style={styles.tipText}>{currentTip.tip}</Text>
          </LinearGradient>
        </Animated.View>

        {/* Quick Action Buttons */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>🚀 Quick Actions</Text>
        </View>
        <View style={styles.quickActionsRow}>
          {QUICK_ACTIONS.map((qa) => (
            <TouchableOpacity
              key={qa.label}
              style={[styles.quickAction, { borderColor: qa.color + '40' }]}
              onPress={() => navigation.navigate(qa.dest as any)}
              activeOpacity={0.8}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: qa.color + '15' }]}>
                <Text style={styles.quickActionEmoji}>{qa.emoji}</Text>
              </View>
              <Text style={[styles.quickActionLabel, { color: qa.color }]}>{qa.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Health Reminder Footer Card */}
        <LinearGradient
          colors={['#FEF3C7', '#FDE68A']}
          style={styles.reminderCard}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
        >
          <Text style={styles.reminderIcon}>⏰</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.reminderTitle}>Medicine Reminder</Text>
            <Text style={styles.reminderSub}>Set reminders for your daily medicines to never miss a dose!</Text>
          </View>
        </LinearGradient>

        {/* Did You Know Section */}
        <View style={styles.didYouKnow}>
          <LinearGradient
            colors={['#1E1B4B', '#312E81']}
            style={styles.didYouKnowInner}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          >
            <Text style={styles.dykEmoji}>🧠</Text>
            <Text style={styles.dykTitle}>Did You Know?</Text>
            <Text style={styles.dykText}>
              The human body produces about 25 million new cells every second. A healthy lifestyle keeps this process running optimally!
            </Text>
            <View style={styles.dykTag}>
              <Text style={styles.dykTagText}># Health Fact</Text>
            </View>
          </LinearGradient>
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: { flex: 1, backgroundColor: '#F0FDF4' },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 20 },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 54,
    paddingBottom: 14,
    backgroundColor: '#F0FDF4',
  },
  greeting: { fontSize: 13, color: '#6B7280' },
  name: { fontSize: 21, fontWeight: '800', color: '#111827', marginTop: 2 },
  logoutBtn: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  logoutText: { color: '#DC2626', fontWeight: '700', fontSize: 13 },

  // Banner
  banner: {
    borderRadius: 22,
    padding: 22,
    marginBottom: 22,
    shadowColor: '#065F46',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  bannerRow: { flexDirection: 'row', alignItems: 'center' },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#34D399', marginRight: 6 },
  liveText: { color: '#A7F3D0', fontSize: 11, fontWeight: '600' },
  bannerTitle: { fontSize: 22, fontWeight: '800', color: '#fff', marginBottom: 6 },
  bannerSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.85)', lineHeight: 20 },
  bannerEmoji: { fontSize: 52, marginLeft: 12 },

  // Section Headers
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    marginTop: 4,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111827' },

  // Wellness Stats
  statsScroll: { marginBottom: 22 },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginRight: 12,
    width: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  statIcon: { fontSize: 26, marginBottom: 6 },
  statValue: { fontSize: 15, fontWeight: '800', color: '#111827', marginBottom: 2 },
  statLabel: { fontSize: 10, color: '#6B7280', textAlign: 'center', marginBottom: 6 },
  statBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  statBadgeText: { fontSize: 10, color: '#065F46', fontWeight: '600' },

  // Grid
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
    marginBottom: 18,
  },
  gridCard: {
    width: '46%',
    borderRadius: 18,
    padding: 22,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  gridIcon: { fontSize: 38, marginBottom: 10 },
  gridLabel: { fontSize: 14, fontWeight: '700' },

  // AI Chatbot Card
  chatbotCard: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 22,
    shadowColor: '#065F46',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 14,
    elevation: 6,
  },
  chatbotGradient: { padding: 20 },
  chatbotContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  chatbotLeft: { flex: 1, marginRight: 12 },
  chatbotBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  chatbotBadgeText: { color: '#A7F3D0', fontSize: 11, fontWeight: '600' },
  chatbotTitle: { fontSize: 17, fontWeight: '800', color: '#fff', marginBottom: 4 },
  chatbotSubtitle: { fontSize: 12, color: 'rgba(255,255,255,0.8)', lineHeight: 17 },
  chatBtnWrap: { alignItems: 'center' },
  chatbotBtn: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
  },
  chatbotBtnText: { color: '#065F46', fontSize: 13, fontWeight: '800' },

  // Health Tips
  tipDots: { flexDirection: 'row', gap: 5 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#D1D5DB' },
  dotActive: { backgroundColor: '#065F46', width: 18 },
  tipCard: {
    borderRadius: 18,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
  },
  tipEmoji: { fontSize: 40, marginRight: 16 },
  tipText: { flex: 1, fontSize: 14, color: '#fff', fontWeight: '600', lineHeight: 21 },

  // Quick Actions
  quickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 22,
  },
  quickAction: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    width: (width - 56) / 4,
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  quickActionIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  quickActionEmoji: { fontSize: 22 },
  quickActionLabel: { fontSize: 10, fontWeight: '700', textAlign: 'center' },

  // Reminder Card
  reminderCard: {
    borderRadius: 18,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },
  reminderIcon: { fontSize: 34, marginRight: 14 },
  reminderTitle: { fontSize: 15, fontWeight: '700', color: '#92400E', marginBottom: 4 },
  reminderSub: { fontSize: 12, color: '#B45309', lineHeight: 17 },

  // Did You Know
  didYouKnow: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#312E81',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 5,
  },
  didYouKnowInner: { padding: 22, alignItems: 'flex-start' },
  dykEmoji: { fontSize: 36, marginBottom: 10 },
  dykTitle: { fontSize: 16, fontWeight: '800', color: '#fff', marginBottom: 8 },
  dykText: { fontSize: 13, color: 'rgba(255,255,255,0.85)', lineHeight: 21, marginBottom: 14 },
  dykTag: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  dykTagText: { color: '#A5B4FC', fontSize: 11, fontWeight: '600' },
});
