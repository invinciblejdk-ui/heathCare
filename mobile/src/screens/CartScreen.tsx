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
  ScrollView,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import {
  getCart,
  updateCartItem,
  removeCartItem,
  placeOrder,
  getAddresses,
  saveAddress,
  CartDTO,
  CartItemDTO,
  AddressResponse,
} from '../services/api';
import { getToken } from '../utils/storage';

type Props = { navigation: NativeStackNavigationProp<RootStackParamList, 'Cart'> };

export default function CartScreen({ navigation }: Props) {
  const [cart, setCart] = useState<CartDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  // Address State
  const [addresses, setAddresses] = useState<AddressResponse[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<AddressResponse | null>(null);
  const [addressModalVisible, setAddressModalVisible] = useState(false);
  const [addressLoading, setAddressLoading] = useState(false);

  // Address Form State
  const [formFullName, setFormFullName] = useState('');
  const [formMobile, setFormMobile] = useState('');
  const [formStreet1, setFormStreet1] = useState('');
  const [formStreet2, setFormStreet2] = useState('');
  const [formCity, setFormCity] = useState('');
  const [formState, setFormState] = useState('');
  const [formPincode, setFormPincode] = useState('');
  const [formLabel, setFormLabel] = useState<'HOME' | 'OFFICE' | 'OTHER'>('HOME');
  const [formDefault, setFormDefault] = useState(true);
  const [formError, setFormError] = useState('');

  const loadData = useCallback(async (userToken: string) => {
    setLoading(true);
    try {
      // Load cart
      const cartData = await getCart(userToken).catch(() => null);
      setCart(cartData);

      // Load addresses
      const addrRes = await getAddresses(userToken).catch(() => ({ data: [] }));
      const addrList = addrRes.data || [];
      setAddresses(addrList);

      if (addrList.length > 0) {
        // Select default address or first one
        const defaultAddr = addrList.find((a) => a.default) || addrList[0];
        setSelectedAddress(defaultAddr);
      }
    } catch (e) {
      console.error('Failed to load cart data:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    (async () => {
      const storedToken = await getToken();
      setToken(storedToken);
      if (storedToken) {
        loadData(storedToken);
      }
    })();
  }, [loadData]);

  const handleUpdateQuantity = async (item: CartItemDTO, change: number) => {
    if (!token) return;
    const newQty = item.quantity + change;
    setActionLoadingId(item.id);

    try {
      if (newQty <= 0) {
        const updated = await removeCartItem(token, item.medicineId);
        setCart(updated);
      } else {
        const updated = await updateCartItem(token, item.medicineId, newQty);
        setCart(updated);
      }
    } catch (e) {
      console.error('Failed to update cart quantity:', e);
      Alert.alert('Error', 'Failed to update item quantity');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRemoveItem = async (item: CartItemDTO) => {
    if (!token) return;
    setActionLoadingId(item.id);
    try {
      const updated = await removeCartItem(token, item.medicineId);
      setCart(updated);
    } catch (e) {
      console.error('Failed to remove cart item:', e);
      Alert.alert('Error', 'Failed to remove item');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleSaveAddress = async () => {
    if (!token) return;
    if (!formFullName || !formMobile || !formStreet1 || !formCity || !formState || !formPincode) {
      setFormError('Please fill in all required fields');
      return;
    }
    if (!/^[6-9]\d{9}$/.test(formMobile)) {
      setFormError('Enter a valid 10-digit mobile number');
      return;
    }
    if (!/^\d{6}$/.test(formPincode)) {
      setFormError('Pincode must be exactly 6 digits');
      return;
    }

    setAddressLoading(true);
    setFormError('');

    try {
      const saveRes = await saveAddress(token, {
        fullName: formFullName,
        mobileNumber: formMobile,
        streetLine1: formStreet1,
        streetLine2: formStreet2 || undefined,
        city: formCity,
        state: formState,
        pincode: formPincode,
        country: 'India',
        label: formLabel,
        default: formDefault,
      });

      // Reload addresses
      const addrRes = await getAddresses(token).catch(() => ({ data: [] }));
      const addrList = addrRes.data || [];
      setAddresses(addrList);

      // Select the newly created address
      const newAddress = addrList.find((a) => a.streetLine1 === formStreet1 && a.fullName === formFullName) || saveRes.data || addrList[0];
      setSelectedAddress(newAddress);

      // Reset Form & Close Modal
      setFormFullName('');
      setFormMobile('');
      setFormStreet1('');
      setFormStreet2('');
      setFormCity('');
      setFormState('');
      setFormPincode('');
      setFormLabel('HOME');
      setFormDefault(true);
      setAddressModalVisible(false);
      Alert.alert('Success', 'Address saved successfully');
    } catch (e: any) {
      console.error('Failed to save address:', e);
      setFormError(e.message || 'Failed to save address. Please try again.');
    } finally {
      setAddressLoading(false);
    }
  };

  const handleCheckout = async () => {
    if (!token) return;
    if (!selectedAddress) {
      Alert.alert('Shipping Address Required', 'Please add a shipping address before checking out.');
      return;
    }

    setPlacingOrder(true);
    try {
      // Reminder: selectedAddress.userId contains the unique primary key of the address entity in AddressResponse mapping!
      await placeOrder(token, {
        addressId: selectedAddress.userId,
      });
      setOrderSuccess(true);
    } catch (e: any) {
      console.error('Checkout failed:', e);
      Alert.alert('Checkout Failed', e.message || 'Failed to place the order. Please try again.');
    } finally {
      setPlacingOrder(false);
    }
  };

  if (orderSuccess) {
    return (
      <View style={styles.successContainer}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.successCard}>
          <Text style={styles.successEmoji}>🎉</Text>
          <Text style={styles.successTitle}>Order Placed!</Text>
          <Text style={styles.successSubtitle}>
            Your order has been placed successfully and is being prepared.
          </Text>

          <TouchableOpacity
            style={styles.successBtn}
            onPress={() => {
              setOrderSuccess(false);
              navigation.replace('Home');
            }}
          >
            <Text style={styles.successBtnText}>Back to Dashboard</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.successBtn, styles.successBtnSecondary]}
            onPress={() => {
              setOrderSuccess(false);
              navigation.replace('Orders');
            }}
          >
            <Text style={styles.successBtnTextSecondary}>View Orders History</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const renderCartItem = ({ item }: { item: CartItemDTO }) => {
    const isActionLoading = actionLoadingId === item.id;

    return (
      <View style={styles.itemCard}>
        <View style={styles.itemInfo}>
          <Text style={styles.itemName}>{item.medicineName}</Text>
          <Text style={styles.itemPrice}>₹{Number(item.unitPrice).toFixed(2)}</Text>
          <Text style={styles.itemSubtotal}>Subtotal: ₹{Number(item.subtotal).toFixed(2)}</Text>
        </View>

        <View style={styles.qtyContainer}>
          <TouchableOpacity
            style={styles.qtyBtn}
            onPress={() => !isActionLoading && handleUpdateQuantity(item, -1)}
            disabled={isActionLoading}
          >
            <Text style={styles.qtyBtnText}>-</Text>
          </TouchableOpacity>

          {isActionLoading ? (
            <ActivityIndicator size="small" color="#065F46" style={{ marginHorizontal: 8 }} />
          ) : (
            <Text style={styles.qtyText}>{item.quantity}</Text>
          )}

          <TouchableOpacity
            style={styles.qtyBtn}
            onPress={() => !isActionLoading && handleUpdateQuantity(item, 1)}
            disabled={isActionLoading}
          >
            <Text style={styles.qtyBtnText}>+</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.deleteBtn}
            onPress={() => !isActionLoading && handleRemoveItem(item)}
            disabled={isActionLoading}
          >
            <Text style={styles.deleteEmoji}>🗑️</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const hasItems = cart && cart.items && cart.items.length > 0;

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
          <Text style={styles.headerTitle}>Shopping Cart</Text>
          <View style={{ width: 60 }} />
        </View>
      </LinearGradient>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#065F46" />
          <Text style={styles.loadingText}>Loading your cart...</Text>
        </View>
      ) : (
        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {hasItems ? (
            <>
              {/* Cart Items */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Items in Cart</Text>
                <FlatList
                  data={cart!.items}
                  keyExtractor={(item) => String(item.id)}
                  renderItem={renderCartItem}
                  scrollEnabled={false}
                />
              </View>

              {/* Delivery Address */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Delivery Address</Text>
                  <TouchableOpacity onPress={() => setAddressModalVisible(true)}>
                    <Text style={styles.changeAddressText}>
                      {selectedAddress ? 'Change / Add' : '+ Add Address'}
                    </Text>
                  </TouchableOpacity>
                </View>

                {selectedAddress ? (
                  <View style={styles.addressCard}>
                    <View style={styles.addressHeader}>
                      <Text style={styles.addressLabel}>{selectedAddress.label}</Text>
                      {selectedAddress.default && <Text style={styles.defaultBadge}>DEFAULT</Text>}
                    </View>
                    <Text style={styles.addressName}>{selectedAddress.fullName}</Text>
                    <Text style={styles.addressPhone}>📞 {selectedAddress.mobileNumber}</Text>
                    <Text style={styles.addressDetails}>
                      {selectedAddress.streetLine1}
                      {selectedAddress.streetLine2 ? `, ${selectedAddress.streetLine2}` : ''}
                      {'\n'}
                      {selectedAddress.city}, {selectedAddress.state} - {selectedAddress.pincode}
                    </Text>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.noAddressCard}
                    onPress={() => setAddressModalVisible(true)}
                  >
                    <Text style={styles.noAddressIcon}>📍</Text>
                    <Text style={styles.noAddressTitle}>No Address Selected</Text>
                    <Text style={styles.noAddressSubtitle}>
                      Click here to add your shipping address to place the order
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Bill Details */}
              <View style={[styles.section, styles.billSection]}>
                <Text style={styles.sectionTitle}>Bill Breakdown</Text>
                <View style={styles.billRow}>
                  <Text style={styles.billLabel}>Total Price ({cart!.items.length} items)</Text>
                  <Text style={styles.billValue}>₹{Number(cart!.totalAmount).toFixed(2)}</Text>
                </View>
                <View style={styles.billRow}>
                  <Text style={styles.billLabel}>Delivery Fee</Text>
                  <Text style={[styles.billValue, { color: '#047857', fontWeight: '700' }]}>FREE</Text>
                </View>
                <View style={[styles.billRow, styles.totalRow]}>
                  <Text style={styles.totalLabel}>Amount to Pay</Text>
                  <Text style={styles.totalValue}>₹{Number(cart!.totalAmount).toFixed(2)}</Text>
                </View>
              </View>

              {/* Checkout Button */}
              <TouchableOpacity
                style={[styles.checkoutBtn, placingOrder && styles.checkoutBtnDisabled]}
                onPress={handleCheckout}
                disabled={placingOrder}
                activeOpacity={0.9}
              >
                {placingOrder ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.checkoutBtnText}>Place Order (₹{Number(cart!.totalAmount).toFixed(2)}) →</Text>
                )}
              </TouchableOpacity>
            </>
          ) : (
            <View style={styles.emptyCartContainer}>
              <Text style={styles.emptyCartIcon}>🛒</Text>
              <Text style={styles.emptyCartTitle}>Your Cart is Empty</Text>
              <Text style={styles.emptyCartSubtitle}>
                Add items to your cart from the medicine catalog to place an order.
              </Text>
              <TouchableOpacity
                style={styles.emptyCartBtn}
                onPress={() => navigation.replace('Medicines')}
              >
                <Text style={styles.emptyCartBtnText}>Shop Medicines</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      )}

      {/* Address Management Modal */}
      <Modal
        visible={addressModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setAddressModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Manage Addresses</Text>
              <TouchableOpacity onPress={() => setAddressModalVisible(false)} style={styles.closeModalBtn}>
                <Text style={styles.closeModalText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.modalScroll} keyboardShouldPersistTaps="handled">
              {/* List of existing addresses */}
              {addresses.length > 0 && (
                <View style={styles.addressListContainer}>
                  <Text style={styles.subSectionTitle}>Select Existing Address</Text>
                  {addresses.map((addr) => {
                    const isSelected = selectedAddress?.userId === addr.userId;
                    return (
                      <TouchableOpacity
                        key={String(addr.userId)}
                        style={[styles.addressItem, isSelected && styles.addressItemSelected]}
                        onPress={() => {
                          setSelectedAddress(addr);
                        }}
                      >
                        <View style={styles.addressItemHeader}>
                          <Text style={styles.addressItemLabel}>{addr.label}</Text>
                          {isSelected && <Text style={styles.selectedBadge}>SELECTED</Text>}
                        </View>
                        <Text style={styles.addressItemName}>{addr.fullName}</Text>
                        <Text style={styles.addressItemDetails}>
                          {addr.streetLine1}, {addr.streetLine2 ? `${addr.streetLine2}, ` : ''}{addr.city}, {addr.state} - {addr.pincode}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}

              {/* Form to add new address */}
              <View style={styles.addressFormContainer}>
                <Text style={styles.subSectionTitle}>+ Add New Address</Text>

                {formError ? <Text style={styles.formErrorText}>⚠️ {formError}</Text> : null}

                <Text style={styles.formLabelText}>Full Name *</Text>
                <TextInput
                  style={styles.formInput}
                  value={formFullName}
                  onChangeText={setFormFullName}
                  placeholder="e.g. John Doe"
                />

                <Text style={styles.formLabelText}>Mobile Number *</Text>
                <TextInput
                  style={styles.formInput}
                  value={formMobile}
                  onChangeText={setFormMobile}
                  placeholder="e.g. 9876543210"
                  keyboardType="phone-pad"
                  maxLength={10}
                />

                <Text style={styles.formLabelText}>Street Address Line 1 *</Text>
                <TextInput
                  style={styles.formInput}
                  value={formStreet1}
                  onChangeText={setFormStreet1}
                  placeholder="Flat No, Building Name, Street"
                />

                <Text style={styles.formLabelText}>Street Address Line 2</Text>
                <TextInput
                  style={styles.formInput}
                  value={formStreet2}
                  onChangeText={setFormStreet2}
                  placeholder="Landmark, Area (Optional)"
                />

                <View style={styles.formRow}>
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <Text style={styles.formLabelText}>City *</Text>
                    <TextInput
                      style={styles.formInput}
                      value={formCity}
                      onChangeText={setFormCity}
                      placeholder="City"
                    />
                  </View>
                  <View style={{ flex: 1, marginLeft: 8 }}>
                    <Text style={styles.formLabelText}>State *</Text>
                    <TextInput
                      style={styles.formInput}
                      value={formState}
                      onChangeText={setFormState}
                      placeholder="State"
                    />
                  </View>
                </View>

                <Text style={styles.formLabelText}>Pincode (6 digits) *</Text>
                <TextInput
                  style={styles.formInput}
                  value={formPincode}
                  onChangeText={setFormPincode}
                  placeholder="e.g. 560001"
                  keyboardType="number-pad"
                  maxLength={6}
                />

                <Text style={styles.formLabelText}>Address Label *</Text>
                <View style={styles.labelToggleContainer}>
                  {(['HOME', 'OFFICE', 'OTHER'] as const).map((lbl) => (
                    <TouchableOpacity
                      key={lbl}
                      style={[styles.labelToggleBtn, formLabel === lbl && styles.labelToggleBtnActive]}
                      onPress={() => setFormLabel(lbl)}
                    >
                      <Text style={[styles.labelToggleText, formLabel === lbl && styles.labelToggleTextActive]}>
                        {lbl}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <TouchableOpacity
                  style={styles.checkboxRow}
                  onPress={() => setFormDefault(!formDefault)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.checkbox, formDefault && styles.checkboxChecked]}>
                    {formDefault && <Text style={styles.checkboxCheckmark}>✓</Text>}
                  </View>
                  <Text style={styles.checkboxLabel}>Set as Default Address</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.saveAddressBtn, addressLoading && styles.saveAddressBtnDisabled]}
                  onPress={handleSaveAddress}
                  disabled={addressLoading}
                >
                  {addressLoading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.saveAddressBtnText}>Save and Apply Address</Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
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

  scroll: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 40 },

  section: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 12 },
  changeAddressText: { color: '#065F46', fontSize: 13, fontWeight: '700' },

  // Cart Item Card
  itemCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  itemInfo: { flex: 1, marginRight: 12 },
  itemName: { fontSize: 15, fontWeight: '600', color: '#111827' },
  itemPrice: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  itemSubtotal: { fontSize: 13, fontWeight: '700', color: '#065F46', marginTop: 4 },

  qtyContainer: { flexDirection: 'row', alignItems: 'center' },
  qtyBtn: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyBtnText: { fontSize: 16, fontWeight: '700', color: '#374151' },
  qtyText: { fontSize: 15, fontWeight: '700', color: '#111827', marginHorizontal: 12 },
  deleteBtn: { marginLeft: 12, padding: 4 },
  deleteEmoji: { fontSize: 18 },

  // Delivery Address Card
  addressCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  addressHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  addressLabel: {
    fontSize: 10,
    fontWeight: '800',
    backgroundColor: '#E5E7EB',
    color: '#374151',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 8,
  },
  defaultBadge: {
    fontSize: 9,
    fontWeight: '800',
    backgroundColor: '#D1FAE5',
    color: '#065F46',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  addressName: { fontSize: 14, fontWeight: '700', color: '#111827' },
  addressPhone: { fontSize: 12, color: '#4B5563', marginTop: 4 },
  addressDetails: { fontSize: 13, color: '#6B7280', marginTop: 6, lineHeight: 18 },

  noAddressCard: {
    alignItems: 'center',
    padding: 20,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
  },
  noAddressIcon: { fontSize: 32, marginBottom: 8 },
  noAddressTitle: { fontSize: 14, fontWeight: '700', color: '#374151', marginBottom: 4 },
  noAddressSubtitle: { fontSize: 12, color: '#6B7280', textAlign: 'center', paddingHorizontal: 12 },

  // Bill Details
  billSection: { paddingBottom: 6 },
  billRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  billLabel: { fontSize: 14, color: '#4B5563' },
  billValue: { fontSize: 14, fontWeight: '600', color: '#111827' },
  totalRow: { borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingTop: 12, marginTop: 4 },
  totalLabel: { fontSize: 16, fontWeight: '800', color: '#111827' },
  totalValue: { fontSize: 18, fontWeight: '800', color: '#065F46' },

  // Checkout Button
  checkoutBtn: {
    backgroundColor: '#065F46',
    borderRadius: 14,
    height: 54,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#065F46',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
    marginTop: 10,
  },
  checkoutBtnDisabled: { opacity: 0.7 },
  checkoutBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },

  // Empty State
  emptyCartContainer: { alignItems: 'center', paddingVertical: 80 },
  emptyCartIcon: { fontSize: 72, marginBottom: 20 },
  emptyCartTitle: { fontSize: 20, fontWeight: '800', color: '#111827', marginBottom: 8 },
  emptyCartSubtitle: { fontSize: 14, color: '#6B7280', textAlign: 'center', lineHeight: 22, paddingHorizontal: 40, marginBottom: 28 },
  emptyCartBtn: {
    backgroundColor: '#065F46',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 12,
  },
  emptyCartBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },

  // Success State
  successContainer: { flex: 1, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center', padding: 24 },
  successCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 30,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
  },
  successEmoji: { fontSize: 64, marginBottom: 16 },
  successTitle: { fontSize: 24, fontWeight: '800', color: '#111827', marginBottom: 8 },
  successSubtitle: { fontSize: 14, color: '#6B7280', textAlign: 'center', lineHeight: 20, marginBottom: 28, paddingHorizontal: 12 },
  successBtn: {
    backgroundColor: '#065F46',
    width: '100%',
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  successBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  successBtnSecondary: { backgroundColor: '#F3F4F6' },
  successBtnTextSecondary: { color: '#065F46', fontSize: 15, fontWeight: '700' },

  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  loadingText: { marginTop: 14, color: '#4B5563', fontSize: 14 },

  // Modal styling
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '90%' },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#111827' },
  closeModalBtn: { padding: 6 },
  closeModalText: { color: '#9CA3AF', fontSize: 16, fontWeight: '600' },
  modalScroll: { padding: 20, paddingBottom: 60 },

  addressListContainer: { marginBottom: 24 },
  subSectionTitle: { fontSize: 15, fontWeight: '700', color: '#374151', marginBottom: 12 },
  addressItem: {
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    backgroundColor: '#F9FAFB',
  },
  addressItemSelected: { borderColor: '#065F46', backgroundColor: '#ECFDF5' },
  addressItemHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  addressItemLabel: { fontSize: 10, fontWeight: '800', color: '#4B5563', backgroundColor: '#E5E7EB', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  selectedBadge: { fontSize: 9, fontWeight: '800', color: '#065F46' },
  addressItemName: { fontSize: 14, fontWeight: '700', color: '#111827', marginBottom: 2 },
  addressItemDetails: { fontSize: 12, color: '#6B7280', lineHeight: 16 },

  addressFormContainer: { borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingTop: 20 },
  formErrorText: { color: '#DC2626', fontSize: 13, marginBottom: 12 },
  formLabelText: { fontSize: 12, fontWeight: '700', color: '#4B5563', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  formInput: { borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: '#111827', backgroundColor: '#F9FAFB', marginBottom: 14 },
  formRow: { flexDirection: 'row' },

  labelToggleContainer: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  labelToggleBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, borderWidth: 1.5, borderColor: '#E5E7EB', alignItems: 'center', backgroundColor: '#F9FAFB' },
  labelToggleBtnActive: { borderColor: '#065F46', backgroundColor: '#ECFDF5' },
  labelToggleText: { fontSize: 12, fontWeight: '700', color: '#6B7280' },
  labelToggleTextActive: { color: '#065F46' },

  checkboxRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  checkbox: { width: 20, height: 20, borderRadius: 6, borderWidth: 2, borderColor: '#D1D5DB', marginRight: 10, justifyContent: 'center', alignItems: 'center' },
  checkboxChecked: { borderColor: '#065F46', backgroundColor: '#065F46' },
  checkboxCheckmark: { color: '#fff', fontSize: 12, fontWeight: '700' },
  checkboxLabel: { fontSize: 14, color: '#374151', fontWeight: '500' },

  saveAddressBtn: { backgroundColor: '#065F46', borderRadius: 12, height: 48, justifyContent: 'center', alignItems: 'center', shadowColor: '#065F46', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 6, elevation: 4 },
  saveAddressBtnDisabled: { opacity: 0.7 },
  saveAddressBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
});
