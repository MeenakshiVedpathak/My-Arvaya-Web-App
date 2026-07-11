import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { ArrowLeft, Phone, ChevronRight, X } from "lucide-react";
import { sendOtp, verifyOtp } from "../../services/authService";
import { useNavigate } from "react-router-dom";

export default function LoginModal() {
  const { isLoginModalOpen, closeLoginModal, pendingRedirect } = useAuth();
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
    try { await sendOtp(mobile); setScreen("otp"); }
    catch (e) { setErr(e.message || "Failed to send OTP"); }
    finally { setBusy(false); }
  };

  const doVerify = async (otp) => {
    setErr(""); setBusy(true);
    try {
      const res = await verifyOtp(otp, phone);
      if (res.token) {
        localStorage.setItem("arvaya_token", res.token);
        localStorage.setItem("arvaya_user", JSON.stringify(res.user || {}));
      }
      handleClose();
      if (pendingRedirect) go(pendingRedirect);
      else window.location.reload();
    } catch (e) { setErr(e.message || "Invalid OTP"); }
    finally { setBusy(false); }
  };

  const p = { busy, err };

  let card;
  switch (screen) {
    case "landing":  card = <Landing onAbha={() => { setErr(""); setScreen("abha"); }} onMobile={() => { setErr(""); setScreen("mobile"); }} />; break;
    case "mobile":   card = <Mobile onBack={() => setScreen("landing")} onSend={(m) => doSendOtp(m, false)} {...p} />; break;
    case "abha":     card = <Abha onBack={() => setScreen("landing")} onSend={(m) => doSendOtp(m, true)} {...p} />; break;
    case "otp":      card = <Otp phone={phone} onBack={() => setScreen(isAbhaFlow ? "abha" : "mobile")} onVerify={doVerify} isAbha={isAbhaFlow} {...p} />; break;
    default: card = null;
  }

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
      background: 'rgba(36, 101, 99, 0.9)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 9999, padding: '20px'
    }}>
      <div style={{
        background: '#fff', borderRadius: '40px', width: '100%', maxWidth: '440px',
        padding: '40px 24px', position: 'relative', boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
      }}>
        <button 
          onClick={handleClose}
          style={{
            position: 'absolute', top: '16px', right: '16px', background: 'transparent',
            border: 'none', cursor: 'pointer', color: '#64748b', padding: '8px'
          }}
        >
          <X size={20} />
        </button>

        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <img src="/logo.png" alt="Arvaya" style={{ height: '80px', mixBlendMode: 'multiply' }} />
        </div>
        
        {card}
      </div>
    </div>
  );
}

/* ── LANDING ── */
function Landing({ onAbha, onMobile }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      <button onClick={onAbha} style={{
        position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#fff', color: '#0f172a', border: '1px solid #e2e8f0', padding: '16px',
        borderRadius: '16px', fontSize: '15px', fontWeight: '600', cursor: 'pointer',
        transition: 'border 0.2s'
      }}>
        <div style={{ position: 'absolute', left: '16px', display: 'flex', alignItems: 'center' }}>
          <img src="/abha.svg" alt="ABHA" style={{ height: '24px' }} />
        </div>
        Continue with ABHA
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }}></div>
        <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '500' }}>Other ways to Login</span>
        <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }}></div>
      </div>

      <button onClick={onMobile} style={{
        position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#c6dbd9', color: '#114b49', border: 'none', padding: '16px',
        borderRadius: '16px', fontSize: '15px', fontWeight: '600', cursor: 'pointer',
        boxShadow: '0 4px 12px rgba(46,125,123,0.1)'
      }}>
        <div style={{ position: 'absolute', left: '16px', display: 'flex', alignItems: 'center' }}>
          <Phone size={20} color="#114b49" />
        </div>
        Continue with Mobile Number
      </button>

    </div>
  );
}

/* ── MOBILE ── */
function Mobile({ onBack, onSend, busy, err }) {
  const [m, setM] = useState("");
  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <button onClick={onBack} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}><ArrowLeft size={20}/></button>
        <h2 style={{ fontSize: '20px', color: '#0f172a', fontWeight: '700', margin: 0 }}>Mobile Login</h2>
      </div>
      <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '24px' }}>We will send a 6-digit verification code to your number.</p>

      {err && <div style={{ background: '#fef2f2', color: '#dc2626', padding: '12px', borderRadius: '8px', fontSize: '14px', marginBottom: '16px' }}>{err}</div>}

      <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #cbd5e1', borderRadius: '12px', padding: '0 16px', marginBottom: '24px' }}>
        <span style={{ color: '#64748b', fontWeight: '600', fontSize: '15px', borderRight: '1px solid #e2e8f0', paddingRight: '12px', marginRight: '12px' }}>+91</span>
        <input autoFocus type="tel" placeholder="Enter mobile number" value={m} onChange={e=>setM(e.target.value.replace(/\D/g,""))} maxLength={10} style={{ flex: 1, border: 'none', outline: 'none', fontSize: '16px', padding: '16px 0', color: '#0f172a' }} />
      </div>

      <button disabled={busy || m.length < 10} onClick={() => onSend(m)} style={{
        width: '100%', background: 'var(--primary)', color: '#fff', border: 'none', padding: '16px',
        borderRadius: '12px', fontSize: '15px', fontWeight: '600', cursor: busy || m.length < 10 ? 'not-allowed' : 'pointer',
        opacity: busy || m.length < 10 ? 0.6 : 1
      }}>
        {busy ? "Sending..." : "Send OTP"}
      </button>
    </>
  );
}

/* ── ABHA ── */
function Abha({ onBack, onSend, busy, err }) {
  const [a, setA] = useState("");
  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <button onClick={onBack} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}><ArrowLeft size={20}/></button>
        <h2 style={{ fontSize: '20px', color: '#0f172a', fontWeight: '700', margin: 0 }}>ABHA Login</h2>
      </div>
      <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '24px' }}>Enter your 14-digit ABHA Number or Address.</p>

      {err && <div style={{ background: '#fef2f2', color: '#dc2626', padding: '12px', borderRadius: '8px', fontSize: '14px', marginBottom: '16px' }}>{err}</div>}

      <div style={{ border: '1px solid #cbd5e1', borderRadius: '12px', padding: '0 16px', marginBottom: '24px' }}>
        <input autoFocus type="text" placeholder="ABHA Number / Address" value={a} onChange={e=>setA(e.target.value)} style={{ width: '100%', border: 'none', outline: 'none', fontSize: '16px', padding: '16px 0', color: '#0f172a' }} />
      </div>

      <button disabled={busy || !a} onClick={() => onSend(a)} style={{
        width: '100%', background: 'var(--primary)', color: '#fff', border: 'none', padding: '16px',
        borderRadius: '12px', fontSize: '15px', fontWeight: '600', cursor: busy || !a ? 'not-allowed' : 'pointer',
        opacity: busy || !a ? 0.6 : 1
      }}>
        {busy ? "Authenticating..." : "Continue"}
      </button>
    </>
  );
}

/* ── OTP ── */
function Otp({ phone, onBack, onVerify, isAbha, busy, err }) {
  const [o, setO] = useState("");
  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <button onClick={onBack} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}><ArrowLeft size={20}/></button>
        <h2 style={{ fontSize: '20px', color: '#0f172a', fontWeight: '700', margin: 0 }}>Verify {isAbha ? "ABHA" : "OTP"}</h2>
      </div>
      <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '24px' }}>Enter the 6-digit code sent to <b>{isAbha ? phone : `+91 ${phone}`}</b></p>

      {err && <div style={{ background: '#fef2f2', color: '#dc2626', padding: '12px', borderRadius: '8px', fontSize: '14px', marginBottom: '16px' }}>{err}</div>}

      <div style={{ display: 'flex', gap: '8px', marginBottom: '32px' }}>
        {[1,2,3,4,5,6].map((i) => (
          <input key={i} type="text" maxLength={1} style={{
            flex: 1, minWidth: 0, height: '48px', border: '1px solid #cbd5e1', borderRadius: '8px',
            textAlign: 'center', fontSize: '20px', fontWeight: '600', color: '#0f172a', outline: 'none'
          }} value={o[i-1]||""} onChange={(e) => {
            const val = e.target.value.replace(/\D/g,"");
            if (val) {
              setO(prev => (prev + val).slice(0,6));
              const next = e.target.nextElementSibling;
              if (next) next.focus();
            }
          }} />
        ))}
      </div>

      <button disabled={busy || o.length < 6} onClick={() => onVerify(o)} style={{
        width: '100%', background: 'var(--primary)', color: '#fff', border: 'none', padding: '16px',
        borderRadius: '12px', fontSize: '15px', fontWeight: '600', cursor: busy || o.length < 6 ? 'not-allowed' : 'pointer',
        opacity: busy || o.length < 6 ? 0.6 : 1
      }}>
        {busy ? "Verifying..." : "Verify & Login"}
      </button>
    </>
  );
}
