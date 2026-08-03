import { api } from "./api";
import { getCloudId, getDeviceId } from "./authService";

// Set to true to use mock data during development / when ABHA APIs are not yet integrated
const USE_MOCK = false;

const MOCK_DELAY = (ms = 800) => new Promise(r => setTimeout(r, ms));

/* ─────────────────────────────────────────────
   STEP 1 — Send OTP to ABHA-linked mobile
   POST /abhaAddress/requestOtp
   Body: { mobile_no }
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
  return api.post("/login/requestOtp", { mobile_no: mobile });
}

/* ─────────────────────────────────────────────
   STEP 2 — Verify OTP
   POST /abhaAddress/verifyOtp
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
  return api.post("/login/verifyOtp", {
    otp: String(otp),
    txnId: String(txnId)
  });
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

/* ─────────────────────────────────────────────
   STEP 3 — Verify User & Complete Login
   POST /login/verifyUser
───────────────────────────────────────────── */
export async function abhaVerifyUser(data) {
  if (USE_MOCK) {
    await MOCK_DELAY(1000);
    return {
      token: "abha_mock_token_" + Date.now(),
      user: {
        id: "abha_user_1",
        name: data.name || "ABHA User",
        abhaAddress: data.abhaAddress,
        abhaNumber: data.abha_number,
        dateOfBirth: data.date_of_birth,
        phone: data.mobile_number,
      },
    };
  }
  const payload = {
    txnId: data.txnId || "",
    abhaAddress: data.abhaAddress || "",
    token: data.token || "",
    supportKey: data.supportKey || "",
    name: data.name || "",
    mobile_number: data.mobile_number || "",
    cloud_id: data.cloud_id || getCloudId(),
    device_id: data.device_id || getDeviceId(),
    abha_number: data.abha_number || "",
    abha_type: "sbx",
    abha_status: "active",
    gender: data.gender || "",
    date_of_birth: data.date_of_birth || ""
  };
  return api.post("/login/verifyUser", payload);
}

/* ─────────────────────────────────────────────
   Get Token API for ABHA Hub Page
   POST /api/profile/getGetToken
   Body: { token }
───────────────────────────────────────────── */
export async function getGetToken(token) {
  if (USE_MOCK) {
    await MOCK_DELAY(500);
    return { success: true, token };
  }
  return api.post("/api/profile/getGetToken", { token });
}

/* ─────────────────────────────────────────────
   Get Profile Info API
   POST /api/profile/getInfo
   Body: { token }
───────────────────────────────────────────── */
export async function getProfileInfo(token) {
  if (USE_MOCK) {
    await MOCK_DELAY(500);
    return { success: true, token };
  }
  return api.post("/api/profile/getInfo", { token });
}

/* ─────────────────────────────────────────────
   Get PHR Card API
   POST /api/profile/getPhrCard
   Body: { token, user_id }
───────────────────────────────────────────── */
export async function getPhrCard(token, userId) {
  if (USE_MOCK) {
    await MOCK_DELAY(500);
    return { success: true, token, user_id: userId };
  }
  return api.post("/api/profile/getPhrCard", { token, user_id: userId });
}

