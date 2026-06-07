import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  StatusBar,
  SafeAreaView,
  Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import { getOrderHistory, cancelOrder, OrderResponse } from '../services/api';
import { getToken } from '../utils/storage';

type Props = { navigation: NativeStackNavigationProp<RootStackParamList, 'Orders'> };

export default function OrdersScreen({ navigation }: Props) {
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<number | null>(null);

  const fetchOrders = useCallback(async (userToken: string) => {
    setLoading(true);
    try {
      const pageData = await getOrderHistory(userToken, 0, 50); // Fetch top 50 orders
      setOrders(pageData.content || []);
    } catch (e) {
      console.error('Failed to fetch orders:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    (async () => {
      const storedToken = await getToken();
      setToken(storedToken);
      if (storedToken) {
        fetchOrders(storedToken);
      }
    })();
  }, [fetchOrders]);

  const handleCancelOrder = async (orderId: number) => {
    if (!token) return;

    Alert.alert(
      'Cancel Order',
      'Are you sure you want to cancel this order?',
      [
        { text: 'No, Keep Order', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            setCancellingId(orderId);
            try {
              await cancelOrder(token, orderId);
              Alert.alert('Order Cancelled', 'Your order was successfully cancelled.');
              // Refresh history
              fetchOrders(token);
            } catch (e: any) {
              console.error('Failed to cancel order:', e);
              Alert.alert('Error', e.message || 'Failed to cancel the order. Please try again.');
            } finally {
              setCancellingId(null);
            }
          },
        },
      ]
    );
  };

  const getStatusStyle = (status: string) => {
    switch (status.toUpperCase()) {
      case 'PLACED':
        return { bg: '#E0F2FE', text: '#0369A1' };
      case 'SHIPPED':
      case 'DELIVERED':
        return { bg: '#D1FAE5', text: '#065F46' };
      case 'CANCELLED':
        return { bg: '#FEE2E2', text: '#B91C1C' };
      default:
        return { bg: '#F3F4F6', text: '#4B5563' };
    }
  };

  const renderOrderItem = ({ item }: { item: OrderResponse }) => {
    const statusStyle = getStatusStyle(item.status);
    const isCancelling = cancellingId === item.id;
    const canBeCancelled = item.status.toUpperCase() === 'PLACED';
    const dateStr = new Date(item.createdAt).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.orderIdText}>Order #{item.id}</Text>
            <Text style={styles.dateText}>{dateStr}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
            <Text style={[styles.statusText, { color: statusStyle.text }]}>
              {item.status}
            </Text>
          </View>
        </View>

        {/* Item List Summary */}
        <View style={styles.itemsContainer}>
          {item.items && item.items.map((orderItem) => (
            <View key={String(orderItem.medicineId)} style={styles.itemRow}>
              <Text style={styles.itemName} numberOfLines={1}>
                {orderItem.medicineName} <Text style={styles.itemQty}>x{orderItem.quantity}</Text>
              </Text>
              <Text style={styles.itemPrice}>₹{Number(orderItem.totalPrice).toFixed(2)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.cardFooter}>
          <View style={styles.totalContainer}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalVal}>₹{Number(item.totalAmount).toFixed(2)}</Text>
          </View>

          {canBeCancelled && (
            <TouchableOpacity
              style={[styles.cancelBtn, isCancelling && styles.cancelBtnDisabled]}
              onPress={() => !isCancelling && handleCancelOrder(item.id)}
              disabled={isCancelling}
              activeOpacity={0.8}
            >
              {isCancelling ? (
                <ActivityIndicator size="small" color="#DC2626" />
              ) : (
                <Text style={styles.cancelBtnText}>Cancel Order</Text>
              )}
            </TouchableOpacity>
          )}
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
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Order History</Text>
          <View style={{ width: 60 }} />
        </View>
      </LinearGradient>

      {loading && orders.length === 0 ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#065F46" />
          <Text style={styles.loadingText}>Fetching your orders...</Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderOrderItem}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.centeredEmpty}>
              <Text style={styles.emptyIcon}>📦</Text>
              <Text style={styles.emptyTitle}>No Orders Placed Yet</Text>
              <Text style={styles.emptySubtitle}>
                Your order placement history will show up here. Go ahead and order some medicines!
              </Text>
              <TouchableOpacity
                style={styles.emptyBtn}
                onPress={() => navigation.replace('Medicines')}
              >
                <Text style={styles.emptyBtnText}>Shop Medicines</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F9FAFB' },

  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 8,
  },
  backText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#fff' },

  listContainer: { padding: 20, paddingBottom: 40 },

  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
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
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingBottom: 12,
    marginBottom: 12,
  },
  orderIdText: { fontSize: 15, fontWeight: '800', color: '#111827' },
  dateText: { fontSize: 11, color: '#6B7280', marginTop: 2, fontWeight: '500' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  statusText: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase' },

  itemsContainer: { marginBottom: 12 },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemName: { fontSize: 14, color: '#374151', flex: 1, marginRight: 16 },
  itemQty: { color: '#9CA3AF', fontWeight: '700' },
  itemPrice: { fontSize: 13, fontWeight: '600', color: '#111827' },

  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalContainer: { flexDirection: 'row', alignItems: 'center' },
  totalLabel: { fontSize: 13, color: '#6B7280', marginRight: 8, fontWeight: '500' },
  totalVal: { fontSize: 16, fontWeight: '800', color: '#065F46' },

  cancelBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#FEE2E2',
    backgroundColor: '#FFF5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelBtnDisabled: { opacity: 0.5 },
  cancelBtnText: { color: '#DC2626', fontSize: 12, fontWeight: '700' },

  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  loadingText: { marginTop: 14, color: '#4B5563', fontSize: 14 },

  centeredEmpty: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 80, paddingHorizontal: 40 },
  emptyIcon: { fontSize: 72, marginBottom: 20 },
  emptyTitle: { fontSize: 20, fontWeight: '800', color: '#111827', marginBottom: 8 },
  emptySubtitle: { fontSize: 14, color: '#6B7280', textAlign: 'center', lineHeight: 22, paddingHorizontal: 20, marginBottom: 28 },
  emptyBtn: {
    backgroundColor: '#065F46',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  emptyBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
});
