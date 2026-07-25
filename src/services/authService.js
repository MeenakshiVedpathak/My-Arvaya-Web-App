import { api } from "./api";

const USE_MOCK = false; // Set to false for real API calls

const MOCK_USER = {
  id: "user_1",
  name: "Priya Sharma",
  email: "priya@example.com",
  phone: "+91 98765 43210",
};

/* ─── Login ─── */
export async function login(email, password) {
  if (USE_MOCK) {
    return { token: "mock_token_" + Date.now(), user: MOCK_USER };
  }
  const res = await api.post("/user/login", { username: email, password, created_by: 1 });
  return { token: res.token || res.accessToken, user: res.user || res.data };
}

/* ─── Cookie Helpers ─── */
function getCookie(name) {
  if (typeof document === "undefined") return "";
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return decodeURIComponent(parts.pop().split(';').shift());
  return "";
}

function getCloudId() {
  return getCookie("cloudID") || getCookie("CLOUD_ID") || getCookie("cloud_id") || "";
}

function getDeviceId() {
  return getCookie("deviceId") || getCookie("DEVICE_ID") || getCookie("device_id") || "";
}

function getClientId() {
  return getCookie("clientID") || getCookie("CLIENT_ID") || getCookie("client_id") || getCookie("clientKey") || (typeof localStorage !== "undefined" && localStorage.getItem("client_id")) || "1";
}

function getReferredByCode() {
  return getCookie("referred_by_code") || getCookie("referralCode") || getCookie("refCode") || getCookie("referral_code") || (typeof localStorage !== "undefined" && (localStorage.getItem("referred_by_code") || localStorage.getItem("referral_code"))) || "";
}

/* ─── Register ─── */
export async function register(data) {
  if (USE_MOCK) {
    return {
      token: "mock_token_" + Date.now(),
      user: { ...MOCK_USER, name: data.name || `${data.title || ''}${data.first_name || ''} ${data.last_name || ''}`.trim(), phone: data.mobile_number },
    };
  }

  let genderCode = data.gender || "M";
  if (genderCode.toLowerCase().startsWith("m")) genderCode = "M";
  else if (genderCode.toLowerCase().startsWith("f")) genderCode = "F";
  else if (genderCode.toLowerCase().startsWith("o")) genderCode = "O";

  const fullName = data.name || `${data.title || ''}${data.first_name || ''} ${data.last_name || ''}`.trim();

  const payload = {
    name: fullName,
    gender: genderCode,
    date_of_birth: data.date_of_birth || data.dob,
    mobile_number: data.mobile_number || data.phone || data.mobile,
    blood_group: data.blood_group || "B+",
    cloud_id: data.cloud_id || getCloudId(),
    device_id: data.device_id || getDeviceId(),
    client_id: data.client_id || getClientId()
  };

  const res = await api.post("/appUser/register", payload);
  const token = res?.token || res?.accessToken || res?.data?.token || res?.result?.token || res?.UserData?.token || "token_" + Date.now();
  let user = res?.user || res?.UserData || res?.data?.user || res?.result?.user || res?.data || res?.result || { name: fullName, phone: payload.mobile_number };
  return { token, user, ...res };
}

/* ─── Send OTP ─── */
export async function sendOtp(mobile, clientId) {
  if (USE_MOCK) {
    await new Promise(r => setTimeout(r, 600));
    return { success: true, message: `OTP sent to ${mobile}`, is_registered: true };
  }
  return api.post("/user/sendOtp", { 
    mobile_number: mobile,
    client_id: clientId || getClientId()
  });
}

/* ─── Verify OTP ─── */
export async function verifyOtp(otp, mobile, options = {}) {
  if (USE_MOCK) {
    await new Promise(r => setTimeout(r, 600));
    return { 
      token: "mock_token_" + Date.now(), 
      user: { ...MOCK_USER, phone: mobile ? `+91 ${mobile}` : MOCK_USER.phone } 
    };
  }
  const clientId = typeof options === "string" ? options : options?.clientId;
  const cloudId = options?.cloudId || options?.cloud_id || getCloudId();
  const referredByCode = options?.referredByCode || options?.referred_by_code || getReferredByCode();

  const payload = {
    otp,
    mobile_number: mobile,
    client_id: clientId || getClientId(),
    cloud_id: cloudId,
    referred_by_code: referredByCode,
  };

  const res = await api.post("/user/verifyOtp", payload);
  const token = res?.token || res?.accessToken || res?.data?.token || res?.result?.token || res?.jwt || res?.UserData?.token || res?.UserData?.accessToken || "token_" + Date.now();
  
  let userDataObj = res?.UserData || res?.user || res?.userData || res?.data?.user || res?.result?.user || res?.data || res?.result || {};
  let fullName = userDataObj?.name || userDataObj?.full_name || userDataObj?.fullName || userDataObj?.user_name;
  if (!fullName && (userDataObj?.first_name || userDataObj?.lastName || userDataObj?.last_name)) {
    const title = userDataObj?.title ? userDataObj.title.trim() + " " : "";
    fullName = `${title}${userDataObj?.first_name || ""} ${userDataObj?.last_name || userDataObj?.lastName || ""}`.trim();
  }
  if (!fullName || fullName === "User") {
    fullName = mobile ? `User (${mobile})` : "User";
  }

  let user = {
    ...userDataObj,
    name: fullName,
    phone: userDataObj?.phone || userDataObj?.mobile_number || userDataObj?.mobile || mobile
  };

  return { 
    token, 
    user,
    ...res
  };
}

/* ─── Forgot Password ─── */
export async function forgotPassword(email) {
  if (USE_MOCK) return { success: true };
  return api.post("/api/user/forgetPasswordAdmin", { email });
}

/* ─── Change Password ─── */
export async function changePassword(data) {
  if (USE_MOCK) return { success: true };
  return api.post("/api/user/changePassword", data);
}

/* ─── Get Profile ─── */
export async function getProfile() {
  if (USE_MOCK) return MOCK_USER;
  const res = await api.post("/api/user/get", {});
  return res.user || res.data || res;
}

/* ─── Update Profile ─── */
export async function updateProfile(data) {
  if (USE_MOCK) return { ...MOCK_USER, ...data };
  return api.put("/api/user/update", data);
}

