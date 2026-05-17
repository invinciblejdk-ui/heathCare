import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import { clearAll } from '../utils/storage';

type Props = { navigation: NativeStackNavigationProp<RootStackParamList, 'Home'> };

export default function HomeScreen({ navigation }: Props) {
  const handleLogout = async () => {
    await clearAll();
    navigation.replace('Login');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Good morning 👋</Text>
          <Text style={styles.name}>Welcome to MediCart</Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <LinearGradient
        colors={['#065F46', '#0D9F6F']}
        style={styles.banner}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
      >
        <Text style={styles.bannerTitle}>You're logged in! 🎉</Text>
        <Text style={styles.bannerSubtitle}>
          Start browsing medicines, track orders, and more.
        </Text>
      </LinearGradient>

      <View style={styles.grid}>
        {[
          { icon: '💊', label: 'Medicines' },
          { icon: '🛒', label: 'My Cart' },
          { icon: '📦', label: 'Orders' },
          { icon: '👤', label: 'Profile' },
        ].map((item) => (
          <View key={item.label} style={styles.gridCard}>
            <Text style={styles.gridIcon}>{item.icon}</Text>
            <Text style={styles.gridLabel}>{item.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB', padding: 24, paddingTop: 56 },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  greeting: { fontSize: 13, color: '#6B7280' },
  name: { fontSize: 20, fontWeight: '700', color: '#111827', marginTop: 2 },

  logoutBtn: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  logoutText: { color: '#DC2626', fontWeight: '600', fontSize: 13 },

  banner: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 28,
  },
  bannerTitle: { fontSize: 20, fontWeight: '800', color: '#fff', marginBottom: 6 },
  bannerSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.8)', lineHeight: 20 },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
  gridCard: {
    width: '46%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  gridIcon: { fontSize: 36, marginBottom: 10 },
  gridLabel: { fontSize: 14, fontWeight: '600', color: '#374151' },
});
