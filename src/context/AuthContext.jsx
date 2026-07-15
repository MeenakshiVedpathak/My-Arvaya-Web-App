import { createContext, useContext, useState, useEffect } from "react";
import * as authService from "../services/authService";

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
  const [token, setToken] = useState(() => localStorage.getItem("arvaya_token"));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isLoginModalOpen, setLoginModalOpen] = useState(false);
  const [pendingRedirect, setPendingRedirect] = useState(null);

  function openLoginModal(redirectPath = null) {
    if (redirectPath) setPendingRedirect(redirectPath);
    setLoginModalOpen(true);
  }

  function closeLoginModal() {
    setLoginModalOpen(false);
    setTimeout(() => setPendingRedirect(null), 300); // clear after animation
  }

  function saveSession(data) {
    localStorage.setItem("arvaya_token", data.token);
    localStorage.setItem("arvaya_user", JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
  }

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
    localStorage.removeItem("arvaya_token");
    localStorage.removeItem("arvaya_user");
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
