import React, { useEffect, useState, useRef } from 'react';
import { ActivityIndicator, View, Text, Animated, TouchableOpacity, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import messaging from '@react-native-firebase/messaging';

import LoginScreen from './src/screens/LoginScreen';
import OtpScreen   from './src/screens/OtpScreen';
import HomeScreen  from './src/screens/HomeScreen';
import MedicinesScreen from './src/screens/MedicinesScreen';
import CartScreen from './src/screens/CartScreen';
import OrdersScreen from './src/screens/OrdersScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import ChatScreen from './src/screens/ChatScreen';
import { getToken } from './src/utils/storage';

export type RootStackParamList = {
  Login:     undefined;
  Otp:       { identifier: string; mode: 'mobile' | 'email' };
  Home:      undefined;
  Medicines: undefined;
  Cart:      undefined;
  Orders:    undefined;
  Profile:   undefined;
  Chat:      undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

// ─── Background / Quit state handler (must be outside component) ────────────
messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('📩 Background FCM message:', remoteMessage);
});

// ─── In-App Notification Banner ──────────────────────────────────────────────
interface BannerProps {
  title: string;
  body: string;
  onDismiss: () => void;
}

function NotificationBanner({ title, body, onDismiss }: BannerProps) {
  const slideAnim = useRef(new Animated.Value(-120)).current;

  useEffect(() => {
    // Slide in
    Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, tension: 80, friction: 10 }).start();
    // Auto-dismiss after 4 seconds
    const timer = setTimeout(() => {
      Animated.timing(slideAnim, { toValue: -120, duration: 300, useNativeDriver: true }).start(() => onDismiss());
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Animated.View style={[bannerStyles.container, { transform: [{ translateY: slideAnim }] }]}>
      <TouchableOpacity style={bannerStyles.content} onPress={onDismiss} activeOpacity={0.9}>
        <Text style={bannerStyles.icon}>🔔</Text>
        <View style={bannerStyles.textBox}>
          <Text style={bannerStyles.title} numberOfLines={1}>{title}</Text>
          <Text style={bannerStyles.body} numberOfLines={2}>{body}</Text>
        </View>
        <TouchableOpacity onPress={onDismiss} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Text style={bannerStyles.close}>✕</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
}

const bannerStyles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    paddingTop: 44,
    paddingHorizontal: 12,
  },
  content: {
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  icon: { fontSize: 26, marginRight: 12 },
  textBox: { flex: 1 },
  title: { color: '#fff', fontWeight: '700', fontSize: 14, marginBottom: 2 },
  body:  { color: 'rgba(255,255,255,0.75)', fontSize: 12, lineHeight: 16 },
  close: { color: 'rgba(255,255,255,0.4)', fontSize: 16, paddingLeft: 8 },
});

// ─── Main App ────────────────────────────────────────────────────────────────
export default function App() {
  const [initialRoute, setInitialRoute] = useState<keyof RootStackParamList | null>(null);
  const [banner, setBanner] = useState<{ title: string; body: string } | null>(null);

  useEffect(() => {
    // Check saved JWT token → decide initial screen
    (async () => {
      const token = await getToken();
      setInitialRoute(token ? 'Home' : 'Login');
    })();

    // ── Foreground FCM listener ──────────────────────────────────────────────
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      console.log('📩 Foreground FCM message:', remoteMessage);
      const title = remoteMessage.notification?.title ?? 'New Notification';
      const body  = remoteMessage.notification?.body  ?? '';
      setBanner({ title, body });
    });

    return unsubscribe;
  }, []);

  if (!initialRoute) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#065F46' }}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName={initialRoute}
          screenOptions={{ headerShown: false, animation: 'slide_from_right' }}
        >
          <Stack.Screen name="Login"     component={LoginScreen} />
          <Stack.Screen name="Otp"       component={OtpScreen}   />
          <Stack.Screen name="Home"      component={HomeScreen}  />
          <Stack.Screen name="Medicines" component={MedicinesScreen} />
          <Stack.Screen name="Cart"      component={CartScreen}  />
          <Stack.Screen name="Orders"    component={OrdersScreen}  />
          <Stack.Screen name="Profile"   component={ProfileScreen} />
          <Stack.Screen name="Chat"      component={ChatScreen}  />
        </Stack.Navigator>
      </NavigationContainer>

      {/* Foreground push notification banner */}
      {banner && (
        <NotificationBanner
          title={banner.title}
          body={banner.body}
          onDismiss={() => setBanner(null)}
        />
      )}
    </View>
  );
}
