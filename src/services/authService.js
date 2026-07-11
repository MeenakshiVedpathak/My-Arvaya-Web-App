import { api } from "./api";

const USE_MOCK = true; // Force mock data for all dashboard/auth processes

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
  // const res = await api.post("/user/login", { username: email, password, created_by: 1 });
  // return { token: res.token || res.accessToken, user: res.user || res.data };
}

/* ─── Register ─── */
export async function register(data) {
  if (USE_MOCK) {
    return {
      token: "mock_token_" + Date.now(),
      user: { ...MOCK_USER, name: data.name, email: data.email, phone: data.phone },
    };
  }
  // const res = await api.post("/api/user/create", data);
  // return { token: res.token || res.accessToken, user: res.user || res.data };
}

/* ─── Send OTP ─── */
export async function sendOtp(mobile) {
  // Always hit the real API
  return api.post("/user/sendOtp", { mobile_number: mobile });
}

/* ─── Verify OTP ─── */
export async function verifyOtp(otp, mobile) {
  // Always hit the real API
  const res = await api.post("/user/verifyOtp", { otp, mobile_number: mobile });
  
  // Directly log in using static session data for the dashboard
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
  // POST api/user/get
  const res = await api.post("/api/user/get", {});
  return res.user || res.data || res;
}

/* ─── Update Profile ─── */
export async function updateProfile(data) {
  if (USE_MOCK) return { ...MOCK_USER, ...data };
  return api.put("/api/user/update", data);
}
