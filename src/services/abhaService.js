import { api } from "./api";
import { getCloudId, getDeviceId } from "./authService";

/* ─────────────────────────────────────────────
   STEP 1 — Send OTP to ABHA-linked mobile
   POST /login/requestOtp
   Body: { mobile_no }
   Response: { txnId, message }
───────────────────────────────────────────── */
export async function abhaSendOtp(mobile) {
  return api.post("/login/requestOtp", { mobile_no: mobile });
}

/* ─────────────────────────────────────────────
   STEP 2 — Verify OTP
   POST /login/verifyOtp
   Body: { otp, txnId }
   Response: { txnId, verified: true }
───────────────────────────────────────────── */
export async function abhaVerifyOtp(otp, txnId) {
  return api.post("/login/verifyOtp", {
    otp: String(otp),
    txnId: String(txnId)
  });
}


/* ─────────────────────────────────────────────
   STEP 3 — Confirm ABHA Address & Login
   POST /abha/confirmAddress
   Body: { abhaAddress, dateOfBirth, txnId }
   Response: { token, user }
───────────────────────────────────────────── */
export async function abhaConfirmAddress(abhaAddress, dateOfBirth, txnId) {
  return api.post("/abha/confirmAddress", { abhaAddress, dateOfBirth, txnId });
}

/* ─────────────────────────────────────────────
   STEP 3 — Verify User & Complete Login
   POST /login/verifyUser
───────────────────────────────────────────── */
export async function abhaVerifyUser(data) {
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
  return api.post("/api/profile/getGetToken", { token });
}

/* ─────────────────────────────────────────────
   Get Profile Info API
   POST /api/profile/getInfo
   Body: { token }
───────────────────────────────────────────── */
export async function getProfileInfo(token) {
  return api.post("/api/profile/getInfo", { token });
}

/* ─────────────────────────────────────────────
   Get PHR Card API
   POST /api/profile/getPhrCard
   Body: { token, user_id }
───────────────────────────────────────────── */
export async function getPhrCard(token, userId) {
  return api.post("/api/profile/getPhrCard", { token, user_id: userId });
}

/* ─────────────────────────────────────────────
   Create ABHA Address — STEP 1: Send OTP
   POST /abhaAddress/requestOtp
   Body: { mobile_no }
   Response: { txnId, message }
───────────────────────────────────────────── */
export async function abhaCreateRequestOtp(mobile) {
  return api.post("/abhaAddress/requestOtp", { mobile_no: mobile });
}

/* ─────────────────────────────────────────────
   Create ABHA Address — STEP 2: Verify OTP
   POST /abhaAddress/verifyOtp
   Body: { txnId, otp, isAddress: 1 }
   Response: { txnId }
───────────────────────────────────────────── */
export async function abhaCreateVerifyOtp(otp, txnId) {
  return api.post("/abhaAddress/verifyOtp", {
    txnId: String(txnId),
    otp: String(otp),
    isAddress: 1,
  });
}

/* ─────────────────────────────────────────────
   Create ABHA Address — STEP 3: Get Suggestions
   POST /abhaAddress/getSuggestions
   Body: { txnId, firstName, lastName, dayOfBirth, monthOfBirth, yearOfBirth, email }
   Response: { txnId, abhaAddressList: [...] }
───────────────────────────────────────────── */
export async function abhaGetSuggestions(txnId, profileData) {
  return api.post("/abhaAddress/getSuggestions", {
    txnId,
    firstName: profileData.firstName || "",
    lastName: profileData.lastName || "",
    dayOfBirth: profileData.dayOfBirth ? String(profileData.dayOfBirth).padStart(2, "0") : undefined,
    monthOfBirth: profileData.monthOfBirth ? String(profileData.monthOfBirth).padStart(2, "0") : undefined,
    yearOfBirth: profileData.yearOfBirth || undefined,
    email: profileData.email || "",
  });
}

/* ─────────────────────────────────────────────
   Create ABHA by Aadhaar — STEP 1: Send Creation OTP
   POST /abhaNumber/sendCreationOtp
   Body: { adhar }
───────────────────────────────────────────── */
export async function abhaSendCreationOtp(adhar) {
  return api.post("/abhaNumber/sendCreationOtp", { adhar: String(adhar) });
}

/* ─────────────────────────────────────────────
   Create ABHA by Aadhaar — STEP 2: Create by Aadhaar
   POST /abhaNumber/createByAadhaar
   Body: { mobile, otp, txnId }
───────────────────────────────────────────── */
export async function abhaCreateByAadhaar(mobile, otp, txnId) {
  return api.post("/abhaNumber/createByAadhaar", {
    mobile: String(mobile),
    otp: String(otp),
    txnId: String(txnId)
  });
}

/* ─────────────────────────────────────────────
   Consent Manager — Get Consent Requests
   GET /api/hiecm/consent/v3/request
───────────────────────────────────────────── */
const ABDM_CLIENT_ID = import.meta.env.VITE_ABDM_CLIENT_ID || "";
const ABDM_CLIENT_SECRET = import.meta.env.VITE_ABDM_CLIENT_SECRET || "";
const PHR_BASE_URL = import.meta.env.VITE_PHR_BASE_URL || "https://dev.abdm.gov.in/";
const ABHA_BASE_URL = import.meta.env.VITE_ABHA_BASE_URL || "https://dev.abdm.gov.in/";

export const getSession = async () => {
  try {
    const headers = {
      'Content-Type': 'application/json',
      timestamp: new Date().toISOString(),
      'REQUEST-ID': crypto.randomUUID(),
      'X-CM-ID': 'sbx',
    };

    const body = {
      clientId: ABDM_CLIENT_ID,
      clientSecret: ABDM_CLIENT_SECRET,
      grantType: 'client_credentials',
    };

    // Clean URL ensuring no double slashes
    const baseUrl = PHR_BASE_URL.endsWith('/') ? PHR_BASE_URL : `${PHR_BASE_URL}/`;
    const response = await api.post(`${baseUrl}api/hiecm/gateway/v3/sessions`, body, headers);

    // Return the full response containing accessToken, refreshToken, etc.
    return response?.data || response || {};
  } catch (error) {
    console.error('getSession Error:', error);
    throw error;
  }
};

export const getGetXToken = async (sessionData = null) => {
  try {
    if (!sessionData) {
      sessionData = await getSession();
    }
    const accessToken = sessionData.accessToken;
    const refreshToken = localStorage.getItem("abha_user_token") || "";

    const headers = {
      timestamp: new Date().toISOString(),
      'REQUEST-ID': crypto.randomUUID(),
      Authorization: `Bearer ${accessToken}`,
      'R-token': `Bearer ${refreshToken}`,
    };

    const baseUrl = ABHA_BASE_URL.endsWith('/') ? ABHA_BASE_URL : `${ABHA_BASE_URL}/`;
    const response = await api.get(`${baseUrl}phr/web/login/profile/request/token`, headers);

    return response?.tokens?.token || response?.data?.tokens?.token;
  } catch (error) {
    console.error('getGetXToken Error:', error);
    throw error;
  }
};

export async function getAbhaConsentRequests(limit = 10, offset = 0) {
  const sessionData = await getSession();
  const xToken = await getGetXToken(sessionData);
  const accessToken = sessionData.accessToken;

  const headers = {
    'Content-Type': 'application/json',
    "timestamp": new Date().toISOString(),
    "REQUEST-ID": crypto.randomUUID(),
    "X-CM-ID": "sbx",
    "Authorization": `Bearer ${accessToken}`,
    "X-AUTH-TOKEN": `Bearer ${xToken}`
  };

  const baseUrl = PHR_BASE_URL.endsWith('/') ? PHR_BASE_URL : `${PHR_BASE_URL}/`;
  return api.get(`${baseUrl}api/hiecm/consent/v3/request?limit=${limit}&offset=${offset}`, headers);
}
