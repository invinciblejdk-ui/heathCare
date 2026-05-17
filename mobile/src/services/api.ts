// ─────────────────────────────────────────────────────────────────────────────
// API configuration
//
// ⚠️  For Android Emulator use: "http://10.0.2.2:9001"
// ⚠️  For iOS Simulator use:    "http://localhost:9001"
// ⚠️  For a real device use:    "http://<YOUR_MACHINE_IP>:9001"
//     (e.g. "http://192.168.0.105:9001")
// ─────────────────────────────────────────────────────────────────────────────
export const BASE_URL = 'http://10.0.2.2:9001'; // Change to your machine IP for real device

export interface AuthResponse {
  message: string;
  token: string | null;
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
