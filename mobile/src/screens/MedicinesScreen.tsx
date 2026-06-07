import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  StatusBar,
  SafeAreaView,
  Keyboard,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import { searchMedicines, addToCart, MedicineDTO } from '../services/api';
import { getToken } from '../utils/storage';

type Props = { navigation: NativeStackNavigationProp<RootStackParamList, 'Medicines'> };

export default function MedicinesScreen({ navigation }: Props) {
  const [q, setQ] = useState('');
  const [medicines, setMedicines] = useState<MedicineDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [cartAddingId, setCartAddingId] = useState<number | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load token on mount
  useEffect(() => {
    (async () => {
      const storedToken = await getToken();
      setToken(storedToken);
    })();
  }, []);

  // Fetch medicines when q changes
  const fetchMedicines = useCallback(async (searchQuery: string, userToken: string) => {
    setLoading(true);
    try {
      const pageData = await searchMedicines(userToken, searchQuery, 0, 20);
      setMedicines(pageData.content || []);
    } catch (error) {
      console.warn('Failed to search medicines:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (token) {
      const delayDebounceFn = setTimeout(() => {
        fetchMedicines(q, token);
      }, 300); // Debounce search calls by 300ms
      return () => clearTimeout(delayDebounceFn);
    }
  }, [q, token, fetchMedicines]);

  const handleAddToCart = async (item: MedicineDTO) => {
    if (!token) return;
    setCartAddingId(item.id);
    try {
      await addToCart(token, {
        medicineId: item.id,
        medicineName: item.name,
        medicineImage: item.imageUrl || null,
        unitPrice: item.price,
        quantity: 1,
      });
      showToast(`Added ${item.name} to cart! 🛒`);
    } catch (error: any) {
      console.warn('Failed to add to cart:', error);
      showToast(error.message || 'Could not add item to cart');
    } finally {
      setCartAddingId(null);
    }
  };

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const renderMedicineItem = ({ item }: { item: MedicineDTO }) => {
    const isAdding = cartAddingId === item.id;
    const isOutOfStock = item.stockQuantity <= 0;

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.nameContainer}>
            <Text style={styles.medName}>{item.name}</Text>
            {item.brandName ? <Text style={styles.brandName}>{item.brandName}</Text> : null}
          </View>
          <Text style={styles.price}>₹{Number(item.price).toFixed(2)}</Text>
        </View>

        {item.saltComposition ? (
          <Text style={styles.saltText}>🧪 {item.saltComposition}</Text>
        ) : null}

        {item.categoryName ? (
          <View style={styles.tagContainer}>
            <View style={styles.categoryTag}>
              <Text style={styles.categoryText}>{item.categoryName}</Text>
            </View>
          </View>
        ) : null}

        <View style={styles.cardFooter}>
          <View style={styles.statusContainer}>
            {isOutOfStock ? (
              <View style={[styles.badge, styles.badgeOutOfStock]}>
                <Text style={styles.badgeTextOutOfStock}>Out of stock</Text>
              </View>
            ) : (
              <View style={[styles.badge, styles.badgeInStock]}>
                <Text style={styles.badgeTextInStock}>In Stock ({item.stockQuantity})</Text>
              </View>
            )}

            {/* In the database, "requiresPrescription" maps to requiresPrescription field */}
            {(item as any).requiresPrescription ? (
              <View style={[styles.badge, styles.badgeRx]}>
                <Text style={styles.badgeTextRx}>Rx Required ⚠️</Text>
              </View>
            ) : null}
          </View>

          <TouchableOpacity
            style={[
              styles.addBtn,
              isOutOfStock && styles.addBtnDisabled,
              isAdding && styles.addBtnAdding,
            ]}
            onPress={() => !isOutOfStock && !isAdding && handleAddToCart(item)}
            disabled={isOutOfStock || isAdding}
            activeOpacity={0.8}
          >
            {isAdding ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.addBtnText}>{isOutOfStock ? 'Sold Out' : '+ Add'}</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" />

      {/* Header Banner */}
      <LinearGradient
        colors={['#065F46', '#0D9F6F']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerTop}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>← Dashboard</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Browse Medicines</Text>
          <View style={{ width: 80 }} />
        </View>

        {/* Search Box */}
        <View style={styles.searchWrapper}>
          <Text style={styles.searchEmoji}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            value={q}
            onChangeText={setQ}
            placeholder="Search by name, salt, or category..."
            placeholderTextColor="#9CA3AF"
            returnKeyType="search"
            onSubmitEditing={Keyboard.dismiss}
          />
          {q.length > 0 ? (
            <TouchableOpacity onPress={() => setQ('')} style={styles.clearBtn}>
              <Text style={styles.clearText}>✕</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </LinearGradient>

      {/* Toast Notification */}
      {toastMessage ? (
        <View style={styles.toast}>
          <Text style={styles.toastText}>{toastMessage}</Text>
        </View>
      ) : null}

      {/* List content */}
      <View style={styles.content}>
        {loading && medicines.length === 0 ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color="#065F46" />
            <Text style={styles.loadingText}>Fetching matching medicines...</Text>
          </View>
        ) : (
          <FlatList
            data={medicines}
            keyExtractor={(item) => String(item.id)}
            renderItem={renderMedicineItem}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            ListEmptyComponent={
              <View style={styles.centeredEmpty}>
                <Text style={styles.emptyIcon}>💊</Text>
                <Text style={styles.emptyTitle}>No Medicines Found</Text>
                <Text style={styles.emptySubtitle}>
                  {q ? `We couldn't find matches for "${q}"` : 'Type in the search bar above to look up medicines'}
                </Text>
              </View>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F9FAFB' },

  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  backBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 8,
  },
  backText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#fff' },

  searchWrapper: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    height: 52,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  searchEmoji: { fontSize: 18, marginRight: 10 },
  searchInput: { flex: 1, fontSize: 15, color: '#111827', height: '100%' },
  clearBtn: { padding: 4 },
  clearText: { color: '#9CA3AF', fontSize: 14, fontWeight: '600' },

  content: { flex: 1 },
  listContainer: { padding: 20, paddingBottom: 40 },

  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  nameContainer: { flex: 1, marginRight: 12 },
  medName: { fontSize: 16, fontWeight: '700', color: '#111827' },
  brandName: { fontSize: 12, color: '#6B7280', marginTop: 2, fontWeight: '500' },
  price: { fontSize: 17, fontWeight: '800', color: '#065F46' },

  saltText: { fontSize: 13, color: '#4B5563', marginBottom: 12, lineHeight: 18 },

  tagContainer: { flexDirection: 'row', marginBottom: 14 },
  categoryTag: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryText: { color: '#047857', fontSize: 11, fontWeight: '600' },

  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 12,
  },
  statusContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  badgeInStock: { backgroundColor: '#E0F2FE' },
  badgeTextInStock: { color: '#0369A1', fontSize: 11, fontWeight: '600' },
  badgeOutOfStock: { backgroundColor: '#FEE2E2' },
  badgeTextOutOfStock: { color: '#B91C1C', fontSize: 11, fontWeight: '600' },
  badgeRx: { backgroundColor: '#FFF7ED' },
  badgeTextRx: { color: '#C2410C', fontSize: 11, fontWeight: '600' },

  addBtn: {
    backgroundColor: '#065F46',
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 70,
  },
  addBtnDisabled: { backgroundColor: '#E5E7EB' },
  addBtnAdding: { backgroundColor: '#0D9F6F' },
  addBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },

  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  loadingText: { marginTop: 14, color: '#4B5563', fontSize: 14 },

  centeredEmpty: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 60, paddingHorizontal: 40 },
  emptyIcon: { fontSize: 60, marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 6 },
  emptySubtitle: { fontSize: 14, color: '#6B7280', textAlign: 'center', lineHeight: 20 },

  toast: {
    position: 'absolute',
    top: 100,
    left: 20,
    right: 20,
    backgroundColor: '#374151',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    zIndex: 999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  toastText: { color: '#fff', fontSize: 14, fontWeight: '600', textAlign: 'center' },
});
