import { createContext, useContext, useState, useEffect } from "react";
import * as authService from "../services/authService";
import { getPatients } from "../services/dataService";

function setCookie(name, value, days = 365) {
  if (typeof document === "undefined" || !value) return;
  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  const expires = `; expires=${date.toUTCString()}`;
  document.cookie = `${name}=${encodeURIComponent(value)}${expires}; path=/; SameSite=Lax`;
}

function getCookie(name) {
  if (typeof document === "undefined") return "";
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return decodeURIComponent(parts.pop().split(';').shift());
  return "";
}

function deleteCookie(name) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; Max-Age=-99999999; path=/;`;
}

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("arvaya_user");
    try {
      return saved && saved !== "undefined" ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => getCookie("token") || localStorage.getItem("token") || localStorage.getItem("arvaya_token"));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isLoginModalOpen, setLoginModalOpen] = useState(false);
  const [pendingRedirect, setPendingRedirect] = useState(null);

  async function fetchUserProfile(currentUser) {
    if (!currentUser) return;
    try {
      const mobile = currentUser.phone || currentUser.mobile_number || currentUser.mobile;
      const filters = mobile ? { mobile_number: mobile } : {};
      const res = await getPatients(filters);

      let patientData = null;
      if (Array.isArray(res) && res.length > 0) {
        patientData = res.find(p => (p.mobile_number || p.phone || p.mobile) === mobile) || res[0];
      } else if (res && typeof res === "object" && !Array.isArray(res) && (res.name || res.full_name || res.first_name || res.mobile_number || res.phone)) {
        patientData = res;
      }

      if (patientData) {
        let fullName = patientData.name || patientData.full_name || patientData.fullName || patientData.user_name;
        if (!fullName && (patientData.first_name || patientData.last_name)) {
          const title = patientData.title ? patientData.title.trim() + " " : "";
          fullName = `${title}${patientData.first_name || ""} ${patientData.last_name || ""}`.trim();
        }

        const phone = patientData.mobile_number || patientData.phone || patientData.mobile || patientData.mobile_no || mobile;

        let rawGender = patientData.gender || currentUser.gender;
        let formattedGender = rawGender;
        if (rawGender) {
          const code = String(rawGender).trim().toUpperCase();
          if (code === "F" || code.startsWith("FEMALE")) formattedGender = "Female";
          else if (code === "M" || code.startsWith("MALE")) formattedGender = "Male";
          else if (code === "O" || code.startsWith("OTHER")) formattedGender = "Other";
        }

        const updatedUser = {
          ...currentUser,
          ...patientData,
          name: fullName || currentUser.name,
          phone: phone || currentUser.phone,
          gender: formattedGender
        };

        setUser(updatedUser);
        localStorage.setItem("arvaya_user", JSON.stringify(updatedUser));
      }
    } catch (err) {
      console.error("fetchUserProfile error:", err);
    }
  }

  function openLoginModal(redirectPath = null) {
    if (redirectPath) setPendingRedirect(redirectPath);
    setLoginModalOpen(true);
  }

  function closeLoginModal() {
    setLoginModalOpen(false);
    setTimeout(() => setPendingRedirect(null), 300); // clear after animation
  }

  function saveSession(data) {
    if (data.token) {
      localStorage.setItem("token", data.token);
      setCookie("token", data.token);
      deleteCookie("arvaya_token");
      localStorage.removeItem("arvaya_token");
    }
    if (data.user) {
      localStorage.setItem("arvaya_user", JSON.stringify(data.user));
    }
    setToken(data.token);
    setUser(data.user);
    if (data.user) {
      fetchUserProfile(data.user);
    }
  }

  useEffect(() => {
    if (user) {
      fetchUserProfile(user);
    }
  }, []);

  async function login(email, password) {
    setLoading(true);
    setError("");
    try {
      const data = await authService.login(email, password);
      saveSession(data);
      return true;
    } catch (e) {
      setError(e.message || "Login failed");
      return false;
    } finally {
      setLoading(false);
    }
  }

  async function register(formData) {
    setLoading(true);
    setError("");
    try {
      const data = await authService.register(formData);
      saveSession(data);
      return true;
    } catch (e) {
      setError(e.message || "Registration failed");
      return false;
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("arvaya_token");
    localStorage.removeItem("arvaya_user");
    deleteCookie("token");
    deleteCookie("arvaya_token");
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{
      user, token, loading, error,
      login, register, logout, setError,
      isLoginModalOpen, pendingRedirect, openLoginModal, closeLoginModal,
      saveSession
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
