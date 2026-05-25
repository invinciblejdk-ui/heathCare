import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
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
import { LinearGradient } from 'expo-linear-gradient';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import {
  getUserProfile,
  getAddresses,
  saveAddress,
  UserProfileResponse,
  AddressResponse,
} from '../services/api';
import { getToken, clearAll } from '../utils/storage';

type Props = { navigation: NativeStackNavigationProp<RootStackParamList, 'Profile'> };

export default function ProfileScreen({ navigation }: Props) {
  const [profile, setProfile] = useState<UserProfileResponse | null>(null);
  const [addresses, setAddresses] = useState<AddressResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  // Address Modal Form state
  const [addressModalVisible, setAddressModalVisible] = useState(false);
  const [addressLoading, setAddressLoading] = useState(false);
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

  const fetchProfileAndAddresses = useCallback(async (userToken: string) => {
    setLoading(true);
    try {
      const userProfile = await getUserProfile(userToken).catch(() => null);
      setProfile(userProfile);

      const addrRes = await getAddresses(userToken).catch(() => ({ data: [] }));
      setAddresses(addrRes.data || []);
    } catch (e) {
      console.error('Failed to load profile data:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    (async () => {
      const storedToken = await getToken();
      setToken(storedToken);
      if (storedToken) {
        fetchProfileAndAddresses(storedToken);
      }
    })();
  }, [fetchProfileAndAddresses]);

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
      await saveAddress(token, {
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
      setAddresses(addrRes.data || []);

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
      Alert.alert('Success', 'Address added successfully');
    } catch (e: any) {
      console.error('Failed to save address:', e);
      setFormError(e.message || 'Failed to save address. Please try again.');
    } finally {
      setAddressLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to log out of your session?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await clearAll();
          navigation.replace('Login');
        },
      },
    ]);
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
          <Text style={styles.headerTitle}>My Profile</Text>
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#065F46" />
          <Text style={styles.loadingText}>Loading profile details...</Text>
        </View>
      ) : (
        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Profile Card */}
          {profile && (
            <View style={styles.section}>
              <View style={styles.profileHero}>
                <View style={styles.avatarCircle}>
                  <Text style={styles.avatarText}>{profile.fullName ? profile.fullName[0].toUpperCase() : '👤'}</Text>
                </View>
                <Text style={styles.profileName}>{profile.fullName || 'MediCart User'}</Text>
                <Text style={styles.profileRole}>Role: {profile.role || 'USER'}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Email Address</Text>
                <Text style={styles.infoValue}>{profile.email || 'Not Provided'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Mobile Number</Text>
                <Text style={styles.infoValue}>+91 {profile.mobileNumber}</Text>
              </View>
              {profile.shopName ? (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Shop Name</Text>
                  <Text style={styles.infoValue}>{profile.shopName}</Text>
                </View>
              ) : null}
            </View>
          )}

          {/* Addresses Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Saved Addresses</Text>
              <TouchableOpacity onPress={() => setAddressModalVisible(true)}>
                <Text style={styles.addAddressLink}>+ Add New</Text>
              </TouchableOpacity>
            </View>

            {addresses.length > 0 ? (
              addresses.map((addr) => (
                <View key={String(addr.userId)} style={styles.addressCard}>
                  <View style={styles.addressHeader}>
                    <Text style={styles.addressLabel}>{addr.label}</Text>
                    {addr.default && <Text style={styles.defaultBadge}>DEFAULT</Text>}
                  </View>
                  <Text style={styles.addressName}>{addr.fullName}</Text>
                  <Text style={styles.addressPhone}>📞 {addr.mobileNumber}</Text>
                  <Text style={styles.addressDetails}>
                    {addr.streetLine1}
                    {addr.streetLine2 ? `, ${addr.streetLine2}` : ''}
                    {'\n'}
                    {addr.city}, {addr.state} - {addr.pincode}
                  </Text>
                </View>
              ))
            ) : (
              <View style={styles.noAddressContainer}>
                <Text style={styles.noAddressText}>No addresses saved yet.</Text>
                <TouchableOpacity
                  style={styles.noAddressBtn}
                  onPress={() => setAddressModalVisible(true)}
                >
                  <Text style={styles.noAddressBtnText}>Add First Address</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </ScrollView>
      )}

      {/* Address Form Modal */}
      <Modal
        visible={addressModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setAddressModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Address</Text>
              <TouchableOpacity onPress={() => setAddressModalVisible(false)} style={styles.closeModalBtn}>
                <Text style={styles.closeModalText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.modalScroll} keyboardShouldPersistTaps="handled">
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
                  <Text style={styles.saveAddressBtnText}>Save Address</Text>
                )}
              </TouchableOpacity>
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
  logoutBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
  },
  logoutText: { color: '#DC2626', fontSize: 12, fontWeight: '700' },

  scroll: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 40 },

  section: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 18,
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
    marginBottom: 16,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111827' },
  addAddressLink: { color: '#065F46', fontSize: 13, fontWeight: '700' },

  profileHero: { alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F3F4F6', marginBottom: 16 },
  avatarCircle: { width: 70, height: 70, borderRadius: 35, backgroundColor: '#ECFDF5', borderWidth: 2, borderColor: '#065F46', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  avatarText: { fontSize: 28, fontWeight: '800', color: '#065F46' },
  profileName: { fontSize: 18, fontWeight: '800', color: '#111827', marginBottom: 4 },
  profileRole: { fontSize: 12, fontWeight: '600', color: '#6B7280' },

  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F9FAFB' },
  infoLabel: { fontSize: 13, color: '#6B7280', fontWeight: '500' },
  infoValue: { fontSize: 14, fontWeight: '600', color: '#111827' },

  // Address card
  addressCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 12,
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

  noAddressContainer: { alignItems: 'center', paddingVertical: 20 },
  noAddressText: { fontSize: 14, color: '#6B7280', marginBottom: 12 },
  noAddressBtn: { backgroundColor: '#ECFDF5', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: '#A7F3D0' },
  noAddressBtnText: { color: '#065F46', fontSize: 13, fontWeight: '700' },

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
