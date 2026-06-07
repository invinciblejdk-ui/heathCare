import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Animated,
  ScrollView,
  Dimensions,
  StatusBar,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import { requestMobileOtp, requestEmailOtp } from '../services/api';

type Props = { navigation: NativeStackNavigationProp<RootStackParamList, 'Login'> };

type LoginMode = 'mobile' | 'email';

const { width } = Dimensions.get('window');

export default function LoginScreen({ navigation }: Props) {
  const [mode, setMode]       = useState<LoginMode>('mobile');
  const [value, setValue]     = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const shakeAnim  = useRef(new Animated.Value(0)).current;
  const fadeAnim   = useRef(new Animated.Value(1)).current;
  const slideAnim  = useRef(new Animated.Value(0)).current;

  // Animate mode switch
  const switchMode = (newMode: LoginMode) => {
    if (newMode === mode) return;
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
    ]).start(() => {
      setMode(newMode);
      setValue('');
      setError('');
      Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }).start();
    });
  };

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10,  duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 6,   duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0,   duration: 60, useNativeDriver: true }),
    ]).start();
  };

  const validate = () => {
    if (mode === 'mobile') {
      if (!/^\d{10}$/.test(value)) {
        setError('Enter a valid 10-digit mobile number');
        shake();
        return false;
      }
    } else {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        setError('Enter a valid email address');
        shake();
        return false;
      }
    }
    return true;
  };

  const handleSendOtp = async () => {
    if (!validate()) return;
    setLoading(true);
    setError('');
    try {
      if (mode === 'mobile') {
        await requestMobileOtp(value);
        navigation.navigate('Otp', { identifier: value, mode: 'mobile' });
      } else {
        await requestEmailOtp(value);
        navigation.navigate('Otp', { identifier: value, mode: 'email' });
      }
    } catch (e: any) {
      setError(e.message ?? 'Something went wrong');
      shake();
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={['#064E3B', '#065F46', '#0D9F6F']}
        style={styles.gradient}
        start={{ x: 0.2, y: 0 }}
        end={{ x: 0.8, y: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

          {/* Logo / Hero */}
          <View style={styles.hero}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoEmoji}>💊</Text>
            </View>
            <Text style={styles.appName}>MediCart</Text>
            <Text style={styles.tagline}>Your health, delivered fast</Text>
          </View>

          {/* Card */}
          <Animated.View style={[styles.card, { transform: [{ translateX: shakeAnim }] }]}>
            <Text style={styles.cardTitle}>Welcome Back</Text>
            <Text style={styles.cardSubtitle}>Sign in to continue</Text>

            {/* Mode Toggle */}
            <View style={styles.toggleContainer}>
              <TouchableOpacity
                style={[styles.toggleBtn, mode === 'mobile' && styles.toggleBtnActive]}
                onPress={() => switchMode('mobile')}
                activeOpacity={0.8}
              >
                <Text style={[styles.toggleText, mode === 'mobile' && styles.toggleTextActive]}>
                  📱 Mobile
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.toggleBtn, mode === 'email' && styles.toggleBtnActive]}
                onPress={() => switchMode('email')}
                activeOpacity={0.8}
              >
                <Text style={[styles.toggleText, mode === 'email' && styles.toggleTextActive]}>
                  ✉️ Email
                </Text>
              </TouchableOpacity>
            </View>

            {/* Input */}
            <Animated.View style={{ opacity: fadeAnim }}>
              <Text style={styles.inputLabel}>
                {mode === 'mobile' ? 'Mobile Number' : 'Email Address'}
              </Text>
              <View style={styles.inputWrapper}>
                {mode === 'mobile' && (
                  <View style={styles.countryCode}>
                    <Text style={styles.countryCodeText}>🇮🇳 +91</Text>
                  </View>
                )}
                <TextInput
                  style={[styles.input, mode === 'mobile' && styles.inputWithPrefix]}
                  value={value}
                  onChangeText={(t) => { setValue(t); setError(''); }}
                  placeholder={mode === 'mobile' ? '9876543210' : 'user@example.com'}
                  placeholderTextColor="#9CA3AF"
                  keyboardType={mode === 'mobile' ? 'phone-pad' : 'email-address'}
                  autoCapitalize="none"
                  maxLength={mode === 'mobile' ? 10 : 100}
                  returnKeyType="done"
                  onSubmitEditing={handleSendOtp}
                />
              </View>

              {error !== '' && (
                <Text style={styles.errorText}>⚠️  {error}</Text>
              )}

              <TouchableOpacity
                style={[styles.btn, loading && styles.btnDisabled]}
                onPress={handleSendOtp}
                disabled={loading}
                activeOpacity={0.85}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.btnText}>Send OTP →</Text>
                )}
              </TouchableOpacity>
            </Animated.View>

            <Text style={styles.disclaimer}>
              By continuing, you agree to our{' '}
              <Text style={styles.link}>Terms of Service</Text> and{' '}
              <Text style={styles.link}>Privacy Policy</Text>
            </Text>
          </Animated.View>

        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },

  gradient: { flex: 1 },

  scroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 40,
  },

  // ── Hero ─────────────────────────────────────────────────────────────────────
  hero: { alignItems: 'center', marginBottom: 36 },

  logoCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },

  logoEmoji: { fontSize: 38 },

  appName: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 1,
  },

  tagline: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 4,
  },

  // ── Card ─────────────────────────────────────────────────────────────────────
  card: {
    backgroundColor: '#fff',
    borderRadius: 28,
    padding: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 16,
  },

  cardTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },

  cardSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 24,
  },

  // ── Toggle ───────────────────────────────────────────────────────────────────
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 14,
    padding: 4,
    marginBottom: 24,
  },

  toggleBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 11,
    alignItems: 'center',
  },

  toggleBtnActive: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },

  toggleText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },

  toggleTextActive: {
    color: '#065F46',
    fontWeight: '700',
  },

  // ── Input ────────────────────────────────────────────────────────────────────
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  inputWrapper: {
    flexDirection: 'row',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#F9FAFB',
    marginBottom: 16,
  },

  countryCode: {
    paddingHorizontal: 12,
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
    borderRightWidth: 1,
    borderRightColor: '#E5E7EB',
  },

  countryCodeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },

  input: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#111827',
  },

  inputWithPrefix: { paddingHorizontal: 12 },

  // ── Error ────────────────────────────────────────────────────────────────────
  errorText: {
    color: '#DC2626',
    fontSize: 13,
    marginBottom: 12,
    marginTop: -8,
  },

  // ── Button ───────────────────────────────────────────────────────────────────
  btn: {
    backgroundColor: '#065F46',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#065F46',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },

  btnDisabled: { opacity: 0.7 },

  btnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  // ── Disclaimer ───────────────────────────────────────────────────────────────
  disclaimer: {
    textAlign: 'center',
    fontSize: 12,
    color: '#9CA3AF',
    lineHeight: 18,
  },

  link: {
    color: '#065F46',
    fontWeight: '600',
  },
});
