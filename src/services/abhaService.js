import { api } from "./api";

// Set to true to use mock data during development / when ABHA APIs are not yet integrated
const USE_MOCK = true;

const MOCK_DELAY = (ms = 800) => new Promise(r => setTimeout(r, ms));

/* ─────────────────────────────────────────────
   STEP 1 — Send OTP to ABHA-linked mobile
   POST /abha/sendOtp
   Body: { mobile_number }
   Response: { txnId, message }
───────────────────────────────────────────── */
export async function abhaSendOtp(mobile) {
  if (USE_MOCK) {
    await MOCK_DELAY(900);
    return {
      txnId: "ABHA_TXN_" + Date.now(),
      message: `OTP sent successfully to +91 ${mobile}`,
    };
  }
  return api.post("/abha/sendOtp", { mobile_number: mobile });
}

/* ─────────────────────────────────────────────
   STEP 2 — Verify OTP
   POST /abha/verifyOtp
   Body: { otp, txnId }
   Response: { txnId, verified: true }
───────────────────────────────────────────── */
export async function abhaVerifyOtp(otp, txnId) {
  if (USE_MOCK) {
    await MOCK_DELAY(900);
    if (otp === "000000") throw new Error("Invalid OTP. Please try again.");
    return {
      txnId: txnId,
      verified: true,
    };
  }
  return api.post("/abha/verifyOtp", { otp, txnId });
}

/* ─────────────────────────────────────────────
   STEP 2b — Get ABHA Addresses linked to mobile
   POST /abha/getAddresses
   Body: { txnId }
   Response: { abhaAddressList: [{ address, isPrimary }] }
───────────────────────────────────────────── */
export async function abhaGetAddresses(txnId) {
  if (USE_MOCK) {
    await MOCK_DELAY(600);
    // Simulate multiple addresses returned by ABDM
    return {
      abhaAddressList: [
        { address: "rahul.sharma@abdm",  isPrimary: true  },
        { address: "rahul@sbx",          isPrimary: false },
      ],
    };
  }
  return api.post("/abha/getAddresses", { txnId });
}

/* ─────────────────────────────────────────────
   STEP 3 — Confirm ABHA Address & Login
   POST /abha/confirmAddress
   Body: { abhaAddress, dateOfBirth, txnId }
   Response: { token, user }
───────────────────────────────────────────── */
export async function abhaConfirmAddress(abhaAddress, dateOfBirth, txnId) {
  if (USE_MOCK) {
    await MOCK_DELAY(1000);
    return {
      token: "abha_mock_token_" + Date.now(),
      user: {
        id: "abha_user_1",
        name: "Rahul Sharma",
        abhaAddress,
        abhaNumber: "91-1234-5678-9012",
        dateOfBirth,
        phone: "",
        email: "",
      },
    };
  }
  return api.post("/abha/confirmAddress", { abhaAddress, dateOfBirth, txnId });
}
