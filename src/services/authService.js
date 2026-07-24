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

/* ─── Register ─── */
export async function register(data) {
  if (USE_MOCK) {
    return {
      token: "mock_token_" + Date.now(),
      user: { ...MOCK_USER, name: data.name, email: data.email, phone: data.phone },
    };
  }
  const res = await api.post("/api/user/create", data);
  return { token: res.token || res.accessToken, user: res.user || res.data };
}

/* ─── Send OTP ─── */
export async function sendOtp(mobile) {
  if (USE_MOCK) {
    await new Promise(r => setTimeout(r, 600));
    return { success: true, message: `OTP sent to ${mobile}`, is_registered: true };
  }
  return api.post("/user/sendOtp", { mobile_number: mobile });
}

/* ─── Verify OTP ─── */
export async function verifyOtp(otp, mobile) {
  if (USE_MOCK) {
    await new Promise(r => setTimeout(r, 600));
    return { 
      token: "mock_token_" + Date.now(), 
      user: { ...MOCK_USER, phone: mobile ? `+91 ${mobile}` : MOCK_USER.phone } 
    };
  }
  const res = await api.post("/user/verifyOtp", { otp, mobile_number: mobile });
  return { 
    token: res?.token || res?.accessToken || "mock_token_" + Date.now(), 
    user: MOCK_USER 
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

