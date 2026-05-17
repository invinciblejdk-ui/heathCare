# MediCart — React Native Mobile App

## 📱 Screens
- **Login** — Mobile number (OTP) or Email (OTP) login with animated toggle
- **OTP Verify** — 6-box digit input with auto-advance, paste support, countdown resend
- **Home** — Post-login dashboard with feature grid

## 🚀 Setup

### Prerequisites
Install Node.js from https://nodejs.org (v20 LTS recommended)

### Steps

```bash
# 1. Navigate into the mobile folder
cd /Users/raviupadhyay/Downloads/heathCare/mobile

# 2. Install dependencies
npm install

# 3. Start Expo development server
npx expo start
```

Then press:
- `a` — open on Android Emulator
- `i` — open on iOS Simulator
- Scan QR code with **Expo Go** app on a real device

---

## ⚠️ Backend URL Configuration

Open `src/services/api.ts` and set `BASE_URL` for your environment:

| Environment | BASE_URL |
|---|---|
| Android Emulator | `http://10.0.2.2:9001` |
| iOS Simulator | `http://localhost:9001` |
| Real Device | `http://192.168.0.105:9001` ← your machine's LAN IP |

> Find your LAN IP: `ifconfig | grep "inet "` (Mac) or check WiFi settings

---

## 🔐 Auth Flow

```
1. User enters mobile number (10 digits) or email
2. App calls POST /api/auth/mobile/login  (or /api/auth/login)
3. Backend logs OTP to console (check IntelliJ logs)
4. User enters 6-digit OTP
5. App calls POST /api/auth/mobile/verify (or /api/auth/verify)
6. JWT token saved to AsyncStorage → User navigated to Home
```

---

## 📁 Project Structure

```
mobile/
├── App.tsx                     ← Root navigator + auto-login
├── src/
│   ├── screens/
│   │   ├── LoginScreen.tsx     ← Mobile/Email OTP request
│   │   ├── OtpScreen.tsx       ← OTP verification
│   │   └── HomeScreen.tsx      ← Post-login home
│   ├── services/
│   │   └── api.ts              ← Fetch calls to backend
│   └── utils/
│       └── storage.ts          ← AsyncStorage JWT helper
```

---

## 🎨 Design Highlights

- **Deep green gradient** (`#064E3B → #0D9F6F`) brand theme
- **Shake animation** on validation errors
- **Auto-submit OTP** when all 6 digits filled
- **Paste support** for SMS OTP autofill
- **30-second resend countdown**
- **Masked identifier** display (privacy)
- **Auto-login** — persisted JWT restores session on app restart
