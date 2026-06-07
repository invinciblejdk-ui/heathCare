import React, { useState, useRef, useEffect } from 'react';
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
  StatusBar,
  Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import messaging from '@react-native-firebase/messaging';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '../../App';
import { verifyMobileOtp, verifyEmailOtp, requestMobileOtp, requestEmailOtp } from '../services/api';
import { saveToken } from '../utils/storage';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Otp'>;
  route: RouteProp<RootStackParamList, 'Otp'>;
};

const OTP_LENGTH = 6;
const RESEND_TIMEOUT = 30;

export default function OtpScreen({ navigation, route }: Props) {
  const { identifier, mode } = route.params;

  const [otp, setOtp]           = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [countdown, setCountdown] = useState(RESEND_TIMEOUT);
  const [canResend, setCanResend] = useState(false);
  const [fcmToken, setFcmToken] = useState<string | null>(null);

  // Fetch native Firebase FCM token directly — no Expo servers, no Expo SDK.
  useEffect(() => {
    (async () => {
      try {
        // Request notification permission from the user
        const authStatus = await messaging().requestPermission();
        const enabled =
          authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === messaging.AuthorizationStatus.PROVISIONAL;

        if (!enabled) {
          console.warn('⚠️ Notification permission denied — FCM token not fetched');
          return;
        }

        // Get the native Firebase FCM device token directly
        const token = await messaging().getToken();
        setFcmToken(token);
        console.log('✅ Native Firebase FCM Token:', token);

      } catch (err: any) {
        console.warn('⚠️ FCM token fetch failed:', err?.message ?? err);
        setFcmToken(null);
      }
    })();
  }, []);

  const inputRefs = useRef<(TextInput | null)[]>([]);
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const successScale = useRef(new Animated.Value(0)).current;

  // Countdown timer
  useEffect(() => {
    if (countdown <= 0) { setCanResend(true); return; }
    const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  // Auto-focus first box
  useEffect(() => {
    setTimeout(() => inputRefs.current[0]?.focus(), 400);
  }, []);

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10,  duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 6,   duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0,   duration: 60, useNativeDriver: true }),
    ]).start();
  };

  const successPulse = () => {
    Animated.spring(successScale, {
      toValue: 1,
      friction: 5,
      tension: 200,
      useNativeDriver: true,
    }).start();
  };

  const handleChange = (text: string, index: number) => {
    // Accept only digits
    const digit = text.replace(/\D/, '');
    const newOtp = [...otp];

    if (digit.length > 1) {
      // Handle paste — distribute across boxes
      const digits = digit.slice(0, OTP_LENGTH).split('');
      digits.forEach((d, i) => { if (index + i < OTP_LENGTH) newOtp[index + i] = d; });
      setOtp(newOtp);
      const nextFocus = Math.min(index + digits.length, OTP_LENGTH - 1);
      inputRefs.current[nextFocus]?.focus();
      return;
    }

    newOtp[index] = digit;
    setOtp(newOtp);
    setError('');

    if (digit && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all digits filled
    if (digit && newOtp.filter(Boolean).length === OTP_LENGTH) {
      submitOtp(newOtp.join(''));
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const submitOtp = async (code: string) => {
    if (code.length !== OTP_LENGTH) {
      setError('Please enter the complete 6-digit OTP');
      shake();
      return;
    }
    setLoading(true);
    setError('');
    try {
      // Pass fcmToken so the backend saves it immediately on login
      const res = mode === 'mobile'
        ? await verifyMobileOtp(identifier, code, fcmToken)
        : await verifyEmailOtp(identifier, code, fcmToken);

      if (res.token) {
        await saveToken(res.token);
        successPulse();
        // Navigate to home after short delay for animation
        setTimeout(() => navigation.replace('Home'), 700);
      } else {
        throw new Error('No token received');
      }
    } catch (e: any) {
      setError(e.message ?? 'Invalid OTP. Please try again.');
      shake();
      // Clear OTP boxes on error
      setOtp(Array(OTP_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    setCanResend(false);
    setCountdown(RESEND_TIMEOUT);
    setOtp(Array(OTP_LENGTH).fill(''));
    setError('');
    try {
      mode === 'mobile'
        ? await requestMobileOtp(identifier)
        : await requestEmailOtp(identifier);
      Alert.alert('OTP Sent', `A new OTP has been sent to ${identifier}`);
    } catch (e: any) {
      setError(e.message ?? 'Failed to resend OTP');
    }
    inputRefs.current[0]?.focus();
  };

  const maskedIdentifier =
    mode === 'mobile'
      ? `+91 XXXXXX${identifier.slice(-4)}`
      : identifier.replace(/(.{2}).+(@.+)/, '$1****$2');

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
        {/* Back Button */}
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>

        <View style={styles.container}>
          {/* Icon */}
          <Animated.View style={[styles.iconCircle, { transform: [{ scale: successScale.interpolate({
            inputRange: [0, 1],
            outputRange: [1, 1.3],
          }) }] }]}>
            <Text style={styles.icon}>🔐</Text>
          </Animated.View>

          <Text style={styles.title}>Verify OTP</Text>
          <Text style={styles.subtitle}>
            We sent a 6-digit code to{'\n'}
            <Text style={styles.identifier}>{maskedIdentifier}</Text>
          </Text>

          {/* OTP Boxes */}
          <Animated.View
            style={[styles.otpRow, { transform: [{ translateX: shakeAnim }] }]}
          >
            {Array.from({ length: OTP_LENGTH }).map((_, i) => (
              <TextInput
                key={i}
                ref={(ref) => { inputRefs.current[i] = ref; }}
                style={[
                  styles.otpBox,
                  otp[i] ? styles.otpBoxFilled : null,
                  error ? styles.otpBoxError : null,
                ]}
                value={otp[i]}
                onChangeText={(t) => handleChange(t, i)}
                onKeyPress={(e) => handleKeyPress(e, i)}
                keyboardType="number-pad"
                maxLength={1}
                selectTextOnFocus
                textAlign="center"
              />
            ))}
          </Animated.View>

          {error !== '' && (
            <Text style={styles.errorText}>⚠️  {error}</Text>
          )}

          {/* Verify Button */}
          <TouchableOpacity
            style={[styles.btn, (loading || otp.join('').length !== OTP_LENGTH) && styles.btnDisabled]}
            onPress={() => submitOtp(otp.join(''))}
            disabled={loading || otp.join('').length !== OTP_LENGTH}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.btnText}>Verify & Login ✓</Text>
            )}
          </TouchableOpacity>

          {/* Resend */}
          <View style={styles.resendRow}>
            <Text style={styles.resendLabel}>Didn't receive the code? </Text>
            <TouchableOpacity onPress={handleResend} disabled={!canResend}>
              <Text style={[styles.resendLink, !canResend && styles.resendLinkDisabled]}>
                {canResend ? 'Resend OTP' : `Resend in ${countdown}s`}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  gradient: { flex: 1 },

  backBtn: {
    paddingTop: Platform.OS === 'ios' ? 56 : 32,
    paddingLeft: 24,
    paddingBottom: 8,
  },
  backBtnText: { color: 'rgba(255,255,255,0.8)', fontSize: 16, fontWeight: '500' },

  container: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingTop: 20,
  },

  iconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  icon: { fontSize: 40 },

  title: {
    fontSize: 30,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.75)',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 36,
  },
  identifier: {
    fontWeight: '700',
    color: '#fff',
  },

  // ── OTP Row ──────────────────────────────────────────────────────────────────
  otpRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },

  otpBox: {
    width: 48,
    height: 58,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.25)',
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
  },

  otpBoxFilled: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderColor: '#fff',
  },

  otpBoxError: {
    borderColor: '#FCA5A5',
    backgroundColor: 'rgba(239,68,68,0.15)',
  },

  // ── Error ────────────────────────────────────────────────────────────────────
  errorText: {
    color: '#FCA5A5',
    fontSize: 13,
    marginBottom: 16,
    textAlign: 'center',
  },

  // ── Button ───────────────────────────────────────────────────────────────────
  btn: {
    width: '100%',
    backgroundColor: '#fff',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  btnDisabled: { opacity: 0.55 },
  btnText: {
    color: '#065F46',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },

  // ── Resend ───────────────────────────────────────────────────────────────────
  resendRow: { flexDirection: 'row', alignItems: 'center' },
  resendLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 14 },
  resendLink: { color: '#fff', fontSize: 14, fontWeight: '700' },
  resendLinkDisabled: { color: 'rgba(255,255,255,0.4)', fontWeight: '400' },
});
