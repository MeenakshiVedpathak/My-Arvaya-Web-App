import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { ArrowLeft, Phone, X, CheckCircle2 } from "lucide-react";
import { sendOtp, verifyOtp } from "../../services/authService";
import { useNavigate } from "react-router-dom";

export default function LoginModal() {
  const { isLoginModalOpen, closeLoginModal, pendingRedirect, saveSession } = useAuth();
  const [screen, setScreen] = useState("landing");
  const [phone, setPhone] = useState("");
  const [isAbhaFlow, setIsAbhaFlow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const go = useNavigate();

  if (!isLoginModalOpen) return null;

  const handleClose = () => {
    setScreen("landing");
    setPhone("");
    setErr("");
    closeLoginModal();
  };

  const doSendOtp = async (mobile, abha = false) => {
    setPhone(mobile); setIsAbhaFlow(abha); setErr(""); setBusy(true);
    try { 
      const res = await sendOtp(mobile); 
      if (res && (res.is_registered === false || res.registered === false || res.userExists === false || res.isNewUser === true)) {
        handleClose();
        go(`/signup?phone=${mobile}`);
        return;
      }
      setScreen("otp"); 
    }
    catch (e) { 
      const msg = (e.message || "").toLowerCase();
      if (msg.includes("not found") || msg.includes("not registered") || msg.includes("no user") || msg.includes("invalid number") || msg.includes("doesn't exist")) {
        handleClose();
        go(`/signup?phone=${mobile}`);
      } else {
        setErr(e.message || "Failed to send OTP"); 
      }
    }
    finally { setBusy(false); }
  };

  const doVerify = async (otp) => {
    setErr(""); setBusy(true);
    try {
      const res = await verifyOtp(otp, phone);
      if (res.token) {
        saveSession({ token: res.token, user: res.user || {} });
      }
      handleClose();
      if (pendingRedirect) go(pendingRedirect);
    } catch (e) { setErr(e.message || "Invalid OTP"); }
    finally { setBusy(false); }
  };

  const p = { busy, err };

  let card;
  switch (screen) {
    case "landing": card = <Landing onAbha={() => { setErr(""); setScreen("abha"); }} onMobile={() => { setErr(""); setScreen("mobile"); }} />; break;
    case "mobile": card = <Mobile onBack={() => setScreen("landing")} onSend={(m) => doSendOtp(m, false)} {...p} />; break;
    case "abha": card = <Abha onBack={() => setScreen("landing")} onSend={(m) => doSendOtp(m, true)} {...p} />; break;
    case "otp": card = <Otp phone={phone} onBack={() => setScreen(isAbhaFlow ? "abha" : "mobile")} onVerify={doVerify} isAbha={isAbhaFlow} {...p} />; break;
    default: card = null;
  }

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
      background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 9999, padding: '16px'
    }}>
      <div className="login-modal-container" style={{
        background: '#fff', borderRadius: '24px', width: '100%', maxWidth: '850px',
        display: 'flex', overflow: 'hidden', position: 'relative', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.3)',
        minHeight: '480px'
      }}>
        <button
          onClick={handleClose}
          className="btn btn-primary hover-glow"
          style={{
            position: 'absolute', top: '16px', right: '16px', background: 'var(--bg-app)',
            border: 'none', cursor: 'pointer', color: 'var(--text-main)', padding: '8px', borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10,
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <X size={20} />
        </button>

        {/* ── Left Pane: Value Proposition ── */}
        <div className="login-modal-left" style={{
          flex: '1', background: 'linear-gradient(135deg, var(--primary-light) 0%, #ffffff 100%)',
          padding: '48px 40px', display: 'flex', flexDirection: 'column', borderRight: '1px solid var(--border)'
        }}>
          <img src="/logo.png" alt="Arvaya" style={{ height: '48px', mixBlendMode: 'multiply', marginBottom: '40px', width: 'fit-content' }} />
          
          <h2 style={{ fontSize: '28px', fontWeight: '800', color: 'var(--text-main)', lineHeight: '1.2', marginBottom: '16px', letterSpacing: '-0.02em' }}>
            Your Health, <br/><span style={{ color: 'var(--primary)' }}>Simplified.</span>
          </h2>
          <p style={{ fontSize: '15px', color: 'var(--text-muted)', marginBottom: '40px', lineHeight: '1.6' }}>
            Join India's most trusted healthcare platform. Experience hassle-free medical care inspired by top networks.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {[
              "Consult 10,000+ Top Doctors",
              "Book Lab Tests with Home Collection",
              "Manage Health Records Securely",
              "Connect with ABHA instantly"
            ].map((text, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <CheckCircle2 size={20} style={{ color: 'var(--success)', flexShrink: 0 }} />
                <span style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-main)' }}>{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right Pane: Auth Forms ── */}
        <div className="login-modal-right" style={{
          flex: '1', padding: '48px 40px', display: 'flex', flexDirection: 'column', justifyContent: 'center',
          background: '#fff', minWidth: '360px'
        }}>
          {card}
        </div>
      </div>
    </div>
  );
}

/* ── LANDING ── */
function Landing({ onAbha, onMobile }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', animation: 'fadeIn 0.3s ease-in-out' }}>
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '8px', letterSpacing: '-0.02em' }}>Welcome Back</h3>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Login or sign up to access your account</p>
      </div>

      <button onClick={onMobile} className="hover-glow" style={{
        position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--primary)', color: '#fff', border: 'none', padding: '16px',
        borderRadius: '12px', fontSize: '15px', fontWeight: '600', cursor: 'pointer',
        boxShadow: '0 4px 12px rgba(0, 135, 124, 0.2)'
      }}>
        <div style={{ position: 'absolute', left: '20px', display: 'flex', alignItems: 'center' }}>
          <Phone size={20} color="#fff" />
        </div>
        Continue with Mobile Number
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '16px 0' }}>
        <div style={{ flex: 1, height: '1px', background: 'var(--border)' }}></div>
        <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>OR</span>
        <div style={{ flex: 1, height: '1px', background: 'var(--border)' }}></div>
      </div>

      <button onClick={onAbha} className="hover-glow" style={{
        position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#fff', color: 'var(--text-main)', border: '1px solid var(--border)', padding: '16px',
        borderRadius: '12px', fontSize: '15px', fontWeight: '600', cursor: 'pointer'
      }}>
        <div style={{ position: 'absolute', left: '20px', display: 'flex', alignItems: 'center' }}>
          <img src="/abha.svg" alt="ABHA" style={{ height: '24px' }} />
        </div>
        Continue with ABHA
      </button>

      <p style={{ textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)', marginTop: '24px', lineHeight: '1.6' }}>
        By continuing, you agree to our <br />
        <a href="#" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: '600' }}>Terms of Service</a> and <a href="#" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: '600' }}>Privacy Policy</a>.
      </p>
    </div>
  );
}

/* ── MOBILE ── */
function Mobile({ onBack, onSend, busy, err }) {
  const [m, setM] = useState("");
  return (
    <div style={{ animation: 'fadeIn 0.3s ease-in-out' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
        <button onClick={onBack} style={{ background: 'var(--bg-app)', border: 'none', cursor: 'pointer', color: 'var(--text-main)', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ArrowLeft size={18} /></button>
        <h3 style={{ fontSize: '22px', fontWeight: '800', color: 'var(--text-main)', margin: 0, letterSpacing: '-0.02em' }}>Enter Mobile Number</h3>
      </div>
      <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '32px', paddingLeft: '44px' }}>We will send a 6-digit OTP to verify.</p>

      {err && <div style={{ background: '#fef2f2', color: '#dc2626', padding: '12px', borderRadius: '8px', fontSize: '13px', marginBottom: '24px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px' }}><X size={16}/>{err}</div>}

      <div style={{ display: 'flex', alignItems: 'center', position: 'relative', marginBottom: '32px' }}>
        <span style={{ position: 'absolute', left: '16px', color: 'var(--text-muted)', fontWeight: '600', fontSize: '16px' }}>+91</span>
        <input className="input-field" autoFocus type="tel" placeholder="Enter your 10-digit number" value={m} onChange={e => setM(e.target.value.replace(/\D/g, ""))} maxLength={10} style={{ paddingLeft: '60px', padding: '16px 16px 16px 60px', fontSize: '16px', borderRadius: '12px', background: 'var(--bg-app)' }} />
      </div>

      <button disabled={busy || m.length < 10} onClick={() => onSend(m)} style={{
        width: '100%', background: 'var(--primary)', color: '#fff', border: 'none', padding: '16px',
        borderRadius: '12px', fontSize: '15px', fontWeight: '600', cursor: busy || m.length < 10 ? 'not-allowed' : 'pointer',
        opacity: busy || m.length < 10 ? 0.6 : 1, transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(0, 135, 124, 0.2)'
      }}>
        {busy ? "Sending OTP..." : "Get OTP"}
      </button>
    </div>
  );
}

/* ── ABHA ── */
function Abha({ onBack, onSend, busy, err }) {
  const [a, setA] = useState("");
  return (
    <div style={{ animation: 'fadeIn 0.3s ease-in-out' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
        <button onClick={onBack} style={{ background: 'var(--bg-app)', border: 'none', cursor: 'pointer', color: 'var(--text-main)', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ArrowLeft size={18} /></button>
        <h3 style={{ fontSize: '22px', fontWeight: '800', color: 'var(--text-main)', margin: 0, letterSpacing: '-0.02em' }}>Login with ABHA</h3>
      </div>
      <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '32px', paddingLeft: '44px' }}>Enter your 14-digit ABHA Number or Address.</p>

      {err && <div style={{ background: '#fef2f2', color: '#dc2626', padding: '12px', borderRadius: '8px', fontSize: '13px', marginBottom: '24px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px' }}><X size={16}/>{err}</div>}

      <div style={{ marginBottom: '32px' }}>
        <input className="input-field" autoFocus type="text" placeholder="e.g. 91-1234-5678-9012" value={a} onChange={e => setA(e.target.value)} style={{ padding: '16px', fontSize: '16px', borderRadius: '12px', background: 'var(--bg-app)' }} />
      </div>

      <button disabled={busy || !a} onClick={() => onSend(a)} style={{
        width: '100%', background: 'var(--primary)', color: '#fff', border: 'none', padding: '16px',
        borderRadius: '12px', fontSize: '15px', fontWeight: '600', cursor: busy || !a ? 'not-allowed' : 'pointer',
        opacity: busy || !a ? 0.6 : 1, transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(0, 135, 124, 0.2)'
      }}>
        {busy ? "Authenticating..." : "Continue"}
      </button>
    </div>
  );
}

/* ── OTP ── */
function Otp({ phone, onBack, onVerify, isAbha, busy, err }) {
  const [o, setO] = useState("");
  return (
    <div style={{ animation: 'fadeIn 0.3s ease-in-out' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
        <button onClick={onBack} style={{ background: 'var(--bg-app)', border: 'none', cursor: 'pointer', color: 'var(--text-main)', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ArrowLeft size={18} /></button>
        <h3 style={{ fontSize: '22px', fontWeight: '800', color: 'var(--text-main)', margin: 0, letterSpacing: '-0.02em' }}>Verify OTP</h3>
      </div>
      <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '32px', paddingLeft: '44px' }}>
        Code sent to <b style={{ color: 'var(--text-main)' }}>{isAbha ? phone : `+91 ${phone}`}</b>
      </p>

      {err && <div style={{ background: '#fef2f2', color: '#dc2626', padding: '12px', borderRadius: '8px', fontSize: '13px', marginBottom: '24px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px' }}><X size={16}/>{err}</div>}

      <div style={{ display: 'flex', gap: '12px', marginBottom: '32px', justifyContent: 'center' }}>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <input key={i} type="text" maxLength={1} style={{
            width: '48px', height: '56px', border: '1px solid var(--border)', borderRadius: '12px',
            textAlign: 'center', fontSize: '24px', fontWeight: '700', color: 'var(--text-main)', outline: 'none',
            background: 'var(--bg-app)', transition: 'all 0.2s', boxShadow: 'none'
          }}
            onFocus={(e) => { e.target.style.borderColor = 'var(--primary)'; e.target.style.boxShadow = '0 0 0 4px var(--primary-light)'; e.target.style.background = 'var(--bg-surface)'; }}
            onBlur={(e) => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; e.target.style.background = 'var(--bg-app)'; }}
            value={o[i - 1] || ""} onChange={(e) => {
              const val = e.target.value.replace(/\D/g, "");
              if (val) {
                setO(prev => (prev + val).slice(0, 6));
                const next = e.target.nextElementSibling;
                if (next) next.focus();
              }
            }} 
            onKeyDown={(e) => {
              if (e.key === 'Backspace' && !o[i - 1]) {
                const prev = e.target.previousElementSibling;
                if (prev) {
                  prev.focus();
                  setO(prevStr => prevStr.slice(0, -1));
                }
              }
            }}
          />
        ))}
      </div>

      <button disabled={busy || o.length < 6} onClick={() => onVerify(o)} style={{
        width: '100%', background: 'var(--primary)', color: '#fff', border: 'none', padding: '16px',
        borderRadius: '12px', fontSize: '15px', fontWeight: '600', cursor: busy || o.length < 6 ? 'not-allowed' : 'pointer',
        opacity: busy || o.length < 6 ? 0.6 : 1, transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(0, 135, 124, 0.2)'
      }}>
        {busy ? "Verifying..." : "Verify & Secure Login"}
      </button>

      <p style={{ textAlign: 'center', fontSize: '14px', color: 'var(--text-muted)', marginTop: '24px' }}>
        Didn't receive the code? <button style={{ color: 'var(--primary)', fontWeight: '600', background: 'transparent', border: 'none', cursor: 'pointer' }}>Resend OTP</button>
      </p>
    </div>
  );
}
