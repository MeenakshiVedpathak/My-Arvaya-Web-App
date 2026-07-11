import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Mail, Lock, Eye, EyeOff, User, Phone, ArrowRight } from "lucide-react";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const { register, loading, error, setError } = useAuth();
  const go = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name || !email || !phone || !password) {
      setError("Please fill in all fields");
      return;
    }
    const ok = await register({ name, email, phone, password });
    if (ok) go("/");
  }

  const inputWrap = {
    display: "flex", alignItems: "center", gap: "10px",
    border: "1.5px solid #edf1f6", borderRadius: "10px", padding: "0 12px",
    background: "#fbfcfc",
  };
  const inputStyle = {
    flex: 1, border: "none", outline: "none", padding: "10px 0",
    fontSize: "13px", background: "transparent", color: "#4e4e4d",
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(135deg, #f4f8f8 0%, #e9f2f3 50%, #f0f6f7 100%)",
      padding: "16px",
    }}>
      <div style={{
        width: "100%",
        maxWidth: "380px",
        background: "#fff",
        borderRadius: "20px",
        boxShadow: "0 16px 48px rgba(46, 102, 110,0.1), 0 2px 12px rgba(0,0,0,0.05)",
        padding: "32px 28px",
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: "3px",
          background: "linear-gradient(90deg, #fb913f, #2e666e)",
        }} />

        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <img src="/logo.png" alt="Arvaya" style={{ height: "36px", marginBottom: "14px" }} />
          <h1 style={{ fontSize: "20px", color: "#4e4e4d", margin: "0 0 4px", fontWeight: "700" }}>
            Create Account
          </h1>
          <p style={{ color: "#718096", fontSize: "13px", margin: 0 }}>
            Join Arvaya for a healthier tomorrow
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div>
            <label style={{ fontSize: "12px", fontWeight: "600", color: "#4e4e4d", display: "block", marginBottom: "6px" }}>
              Full Name
            </label>
            <div style={inputWrap}>
              <User size={16} color="#a0aec0" />
              <input value={name} onChange={e => setName(e.target.value)}
                placeholder="Enter your full name" style={inputStyle} />
            </div>
          </div>

          <div>
            <label style={{ fontSize: "12px", fontWeight: "600", color: "#4e4e4d", display: "block", marginBottom: "6px" }}>
              Email Address
            </label>
            <div style={inputWrap}>
              <Mail size={16} color="#a0aec0" />
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com" style={inputStyle} />
            </div>
          </div>

          <div>
            <label style={{ fontSize: "12px", fontWeight: "600", color: "#4e4e4d", display: "block", marginBottom: "6px" }}>
              Phone Number
            </label>
            <div style={inputWrap}>
              <Phone size={16} color="#a0aec0" />
              <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                placeholder="+91 98765 43210" style={inputStyle} />
            </div>
          </div>

          <div>
            <label style={{ fontSize: "12px", fontWeight: "600", color: "#4e4e4d", display: "block", marginBottom: "6px" }}>
              Password
            </label>
            <div style={inputWrap}>
              <Lock size={16} color="#a0aec0" />
              <input type={showPw ? "text" : "password"} value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Create a password" style={inputStyle} />
              <button type="button" onClick={() => setShowPw(!showPw)}
                style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex" }}>
                {showPw ? <EyeOff size={16} color="#a0aec0" /> : <Eye size={16} color="#a0aec0" />}
              </button>
            </div>
          </div>

          {error && (
            <div style={{
              background: "#fff5f5", border: "1px solid #feb2b2", color: "#c53030",
              padding: "8px 12px", borderRadius: "8px", fontSize: "12px",
            }}>
              {error}
            </div>
          )}

          <button type="submit" disabled={loading} style={{
            background: "linear-gradient(135deg, #fb913f, #e07a2a)",
            color: "#fff", border: "none", padding: "11px", borderRadius: "10px",
            fontSize: "14px", fontWeight: "600", cursor: loading ? "wait" : "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
            opacity: loading ? 0.7 : 1, transition: "0.2s", marginTop: "2px",
          }}>
            {loading ? "Creating account..." : <>Create Account <ArrowRight size={16} /></>}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: "18px", marginBottom: 0, fontSize: "13px", color: "#718096" }}>
          Already have an account?{" "}
          <Link to="/login" style={{ color: "#2e666e", fontWeight: "600", textDecoration: "none" }}>
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
