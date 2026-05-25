// ─────────────────────────────────────────────────────────────────────────────
// API configuration
//
// ⚠️  For Android Emulator use: "http://10.0.2.2:9001"
// ⚠️  For iOS Simulator use:    "http://localhost:9001"
// ⚠️  For a real device use:    "http://<YOUR_MACHINE_IP>:9001"
//     (e.g. "http://192.168.0.105:9001")
// ─────────────────────────────────────────────────────────────────────────────
export const BASE_URL = 'http://192.168.0.105:9001'; // Change to your machine IP for real device

export interface AuthResponse {
  message: string;
  token: string | null;
}

export interface MedicineDTO {
  id: number;
  name: string;
  brandName: string;
  saltComposition: string;
  price: number;
  mrp: number;
  stockQuantity: number;
  imageUrl?: string;
  categoryName?: string;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

/** Step 1 — request OTP to be sent to mobile number */
export async function requestMobileOtp(mobileNumber: string): Promise<AuthResponse> {
  const res = await fetch(`${BASE_URL}/api/auth/mobile/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mobileNumber }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message ?? `Server error: ${res.status}`);
  }
  return res.json();
}

/** Step 2 — verify OTP and receive JWT token */
export async function verifyMobileOtp(
  mobileNumber: string,
  otp: string
): Promise<AuthResponse> {
  const res = await fetch(`${BASE_URL}/api/auth/mobile/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mobileNumber, otp }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message ?? `Server error: ${res.status}`);
  }
  return res.json();
}

/** Step 1 — request OTP via email */
export async function requestEmailOtp(email: string): Promise<AuthResponse> {
  const res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message ?? `Server error: ${res.status}`);
  }
  return res.json();
}

/** Step 2 — verify email OTP */
export async function verifyEmailOtp(
  email: string,
  otp: string
): Promise<AuthResponse> {
  const res = await fetch(`${BASE_URL}/api/auth/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, otp }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message ?? `Server error: ${res.status}`);
  }
  return res.json();
}

/**
 * Search medicines — calls /restful/v1/medicine/search
 * This matches the MedicineController @RequestMapping("/restful/v1/medicine")
 */
export async function searchMedicines(
  token: string,
  q: string,
  page = 0,
  size = 20
): Promise<Page<MedicineDTO>> {
  const params = new URLSearchParams({ q, page: String(page), size: String(size) });
  const res = await fetch(`${BASE_URL}/restful/v1/medicine/search?${params}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message ?? `Server error: ${res.status}`);
  }
  return res.json();
}

// ─────────────────────────────────────────────────────────────────────────────
// Cart API
// ─────────────────────────────────────────────────────────────────────────────

export interface CartItemDTO {
  id: number;
  medicineId: number;
  medicineName: string;
  medicineImage: string | null;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface CartDTO {
  cartId: number;
  userId: number;
  items: CartItemDTO[];
  totalAmount: number;
}

export interface AddToCartRequest {
  medicineId: number;
  medicineName: string;
  medicineImage: string | null;
  unitPrice: number;
  quantity: number;
}

export async function getCart(token: string): Promise<CartDTO> {
  const res = await fetch(`${BASE_URL}/restful/v1/order`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message ?? `Server error: ${res.status}`);
  }
  return res.json();
}

export async function addToCart(token: string, req: AddToCartRequest): Promise<CartDTO> {
  const res = await fetch(`${BASE_URL}/restful/v1/order/addToCart`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(req),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message ?? `Server error: ${res.status}`);
  }
  return res.json();
}

export async function updateCartItem(
  token: string,
  medicineId: number,
  quantity: number
): Promise<CartDTO> {
  const res = await fetch(`${BASE_URL}/restful/v1/order/${medicineId}?quantity=${quantity}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message ?? `Server error: ${res.status}`);
  }
  return res.json();
}

export async function removeCartItem(token: string, medicineId: number): Promise<CartDTO> {
  const res = await fetch(`${BASE_URL}/restful/v1/order/${medicineId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message ?? `Server error: ${res.status}`);
  }
  return res.json();
}

export async function clearCart(token: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/restful/v1/order`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message ?? `Server error: ${res.status}`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Orders API
// ─────────────────────────────────────────────────────────────────────────────

export interface OrderItemResponse {
  medicineId: number;
  medicineName: string;
  medicineImage: string | null;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface OrderResponse {
  id: number;
  userId: number;
  items: OrderItemResponse[];
  totalAmount: number;
  status: string; // e.g. PLACED, SHIPPED, DELIVERED, CANCELLED
  prescriptionId: number | null;
  promoCode: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PlaceOrderRequest {
  addressId: number;
  prescriptionId?: number | null;
  promoCode?: string | null;
}

export async function placeOrder(token: string, req: PlaceOrderRequest): Promise<OrderResponse> {
  const res = await fetch(`${BASE_URL}/restful/v1/order`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(req),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message ?? `Server error: ${res.status}`);
  }
  return res.json();
}

export async function getOrderHistory(
  token: string,
  page = 0,
  size = 10
): Promise<Page<OrderResponse>> {
  const res = await fetch(`${BASE_URL}/restful/v1/order/history?page=${page}&size=${size}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message ?? `Server error: ${res.status}`);
  }
  return res.json();
}

export async function cancelOrder(token: string, orderId: number): Promise<OrderResponse> {
  const res = await fetch(`${BASE_URL}/restful/v1/order/${orderId}/cancel`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message ?? `Server error: ${res.status}`);
  }
  return res.json();
}

// ─────────────────────────────────────────────────────────────────────────────
// User Profile & Address API
// ─────────────────────────────────────────────────────────────────────────────

export interface UserProfileResponse {
  id: number;
  email: string;
  mobileNumber: string;
  fullName: string;
  shopName: string;
  role: string;
}

export interface AddressRequest {
  fullName: string;
  mobileNumber: string;
  streetLine1: string;
  streetLine2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  label: 'HOME' | 'OFFICE' | 'OTHER';
  default: boolean; // maps to isDefault in backend AddressRequest
}

export interface AddressResponse {
  userId: number; // Address ID (mapped to userId in backend AddressResponse)
  fullName: string;
  mobileNumber: string;
  streetLine1: string;
  streetLine2: string | null;
  city: string;
  state: string;
  pincode: string;
  country: string;
  label: string;
  default: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export async function getUserProfile(token: string): Promise<UserProfileResponse> {
  const res = await fetch(`${BASE_URL}/api/profile`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message ?? `Server error: ${res.status}`);
  }
  return res.json();
}

export async function getAddresses(token: string): Promise<{ data: AddressResponse[] }> {
  const res = await fetch(`${BASE_URL}/restful/v1/onboarding/getAddresses`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message ?? `Server error: ${res.status}`);
  }
  return res.json();
}

export async function saveAddress(token: string, req: AddressRequest): Promise<{ data: AddressResponse }> {
  const res = await fetch(`${BASE_URL}/restful/v1/onboarding/saveAddress`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(req),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message ?? `Server error: ${res.status}`);
  }
  return res.json();
}

// ─────────────────────────────────────────────────────────────────────────────
// Chatbot API
// ─────────────────────────────────────────────────────────────────────────────

export interface ChatbotResponse {
  reply: string;
}

/**
 * Derives chatbot URL dynamically from BASE_URL to automatically match host changes
 */
const getChatbotUrl = () => {
  try {
    const url = new URL(BASE_URL);
    return `${url.protocol}//${url.hostname}:5005`;
  } catch {
    return 'http://192.168.0.105:5005';
  }
};

/**
 * Sends a user message to the Python FastAPI chatbot backend
 */
export async function sendMessageToChatbot(message: string): Promise<ChatbotResponse> {
  const chatbotUrl = getChatbotUrl();
  const res = await fetch(`${chatbotUrl}/api/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail ?? body.message ?? `Chatbot error: ${res.status}`);
  }
  return res.json();
}


