import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { ArrowLeft, Phone, X, CheckCircle2, ChevronRight, ShieldCheck, User, UserPlus } from "lucide-react";
import { sendOtp, verifyOtp } from "../../services/authService";
import { abhaSendOtp, abhaVerifyOtp, abhaGetAddresses, abhaConfirmAddress } from "../../services/abhaService";
import { useNavigate } from "react-router-dom";

export default function LoginModal({ forceOpen = false }) {
  const { isLoginModalOpen, closeLoginModal, pendingRedirect, saveSession } = useAuth();
  const [screen, setScreen] = useState("landing");
  const [phone, setPhone] = useState("");
  const [isAbhaFlow, setIsAbhaFlow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  // ABHA-specific state
  const [abhaMobile, setAbhaMobile] = useState("");
  const [abhaAddresses, setAbhaAddresses] = useState([]);
  const [selectedAbhaAddress, setSelectedAbhaAddress] = useState("");
  const [abhaTransactionId, setAbhaTransactionId] = useState("");

  const go = useNavigate();

  if (!isLoginModalOpen && !forceOpen) return null;

  const handleClose = () => {
    setScreen("landing");
    setPhone("");
    setErr("");
    setAbhaMobile("");
    setAbhaAddresses([]);
    setSelectedAbhaAddress("");
    setAbhaTransactionId("");
    closeLoginModal();
  };

  /* ── Regular Mobile OTP Flow ── */
  const doSendOtp = async (mobile) => {
    setPhone(mobile); setErr(""); setBusy(true);
    try {
      const res = await sendOtp(mobile);
      if (res && (res.is_registered === false || res.registered === false || res.userExists === false || res.isNewUser === true)) {
        handleClose(); go(`/signup?phone=${mobile}`); return;
      }
      setScreen("otp");
    } catch (e) {
      const msg = (e.message || "").toLowerCase();
      if (msg.includes("not found") || msg.includes("not registered") || msg.includes("no user") || msg.includes("invalid number") || msg.includes("doesn't exist")) {
        handleClose(); go(`/signup?phone=${mobile}`);
      } else { setErr(e.message || "Failed to send OTP"); }
    } finally { setBusy(false); }
  };

  const doVerify = async (otp) => {
    setErr(""); setBusy(true);
    try {
      const res = await verifyOtp(otp, phone);
      const userData = res?.UserData || res?.userData || res?.data || res?.result || {};
      const rawNewUser = userData?.is_new_user !== undefined
        ? userData.is_new_user
        : userData?.Is_new_user !== undefined
          ? userData.Is_new_user
          : res?.is_new_user !== undefined
            ? res.is_new_user
            : res?.Is_new_user;

      const isNewUserOne = rawNewUser === 1 || rawNewUser === "1" || rawNewUser === true;

      // If is_new_user is 1, open registration form
      if (isNewUserOne) {
        handleClose();
        go(`/signup?phone=${phone}`);
        return;
      }

      // If is_new_user is 0 (existing user), login directly
      const token = res?.token || res?.accessToken || res?.data?.token || res?.result?.token || res?.UserData?.token || res?.UserData?.accessToken || "token_" + Date.now();
      let user = res?.user || res?.UserData || res?.data?.user || res?.result?.user || { name: phone ? `User (${phone})` : "User", phone: phone };
      if (typeof user === "object" && user !== null && !user.name) {
        user = { ...user, name: phone ? `User (${phone})` : "User" };
      }
      saveSession({ token, user });
      handleClose();
      if (pendingRedirect) go(pendingRedirect);
    } catch (e) { setErr(e.message || "Invalid OTP"); }
    finally { setBusy(false); }
  };

  /* ── ABHA 3-Step Flow ── */
  const doAbhaSendOtp = async (mobile) => {
    setAbhaMobile(mobile); setErr(""); setBusy(true);
    try {
      const res = await abhaSendOtp(mobile);
      setAbhaTransactionId(res?.transactionId || res?.txnId || "mock_txn_" + Date.now());
      setScreen("abha_otp");
    } catch (e) { setErr(e.message || "Failed to send OTP to ABHA mobile"); }
    finally { setBusy(false); }
  };

  const doAbhaVerifyOtp = async (otp) => {
    setErr(""); setBusy(true);
    try {
      const res = await abhaVerifyOtp(otp, abhaTransactionId);
      const newTxnId = res?.transactionId || res?.txnId || abhaTransactionId;
      setAbhaTransactionId(newTxnId);
      // Fetch ABHA addresses linked to this mobile
      const addrRes = await abhaGetAddresses(newTxnId);
      const addresses = addrRes?.abhaAddressList || addrRes?.addresses || [
        { id: 1, address: `91${abhaMobile}@sbx`, isPrimary: true },
      ];
      setAbhaAddresses(addresses);
      setSelectedAbhaAddress(addresses[0]?.address || addresses[0]?.id || "");
      setScreen("abha_address");
    } catch (e) { setErr(e.message || "Invalid OTP. Please try again."); }
    finally { setBusy(false); }
  };

  const doAbhaConfirm = async (address, dob) => {
    setErr(""); setBusy(true);
    try {
      const res = await abhaConfirmAddress(address, dob, abhaTransactionId);
      saveSession({ token: res?.token || "mock_abha_token_" + Date.now(), user: res?.user || { name: "ABHA User" } });
      handleClose();
      if (pendingRedirect) go(pendingRedirect);
    } catch (e) { setErr(e.message || "Could not link ABHA. Please try again."); }
    finally { setBusy(false); }
  };

  const p = { busy, err };

  let card;
  const isAbhaCreate = screen.startsWith("abha_create");
  switch (screen) {
    case "landing":
      card = <Landing onAbha={() => { setErr(""); setScreen("abha_mobile"); }} onMobile={() => { setErr(""); setScreen("mobile"); }} />;
      break;
    case "mobile":
      card = <Mobile onBack={() => setScreen("landing")} onSend={doSendOtp} {...p} />;
      break;
    case "otp":
      card = <Otp phone={phone} onBack={() => setScreen("mobile")} onVerify={doVerify} onResend={() => doSendOtp(phone)} {...p} />;
      break;
    // ── ABHA Login 3-step ──
    case "abha_mobile":
      card = <AbhaMobile onBack={() => setScreen("landing")} onSend={doAbhaSendOtp} onCreateNow={() => { setErr(""); setScreen("abha_create_1"); }} {...p} />;
      break;
    case "abha_otp":
      card = <AbhaOtp mobile={abhaMobile} onBack={() => setScreen("abha_mobile")} onVerify={doAbhaVerifyOtp} onResend={() => doAbhaSendOtp(abhaMobile)} {...p} />;
      break;
    case "abha_address":
      card = <AbhaSelectAddress addresses={abhaAddresses} selected={selectedAbhaAddress} onSelect={setSelectedAbhaAddress} onBack={() => setScreen("abha_otp")} onConfirm={doAbhaConfirm} {...p} />;
      break;
    // ── ABHA Create flow ──
    case "abha_create_1":
    case "abha_create_2":
    case "abha_create_3":
    case "abha_create_done":
      card = <AbhaCreate step={screen} onBack={() => setScreen(screen === "abha_create_1" ? "abha_mobile" : screen === "abha_create_2" ? "abha_create_1" : "abha_create_2")} onNext={(s) => setScreen(s)} onFinish={() => { handleClose(); go("/abha"); }} />;
      break;
    default:
      card = null;
  }

  // Determine which "pane" content to show
  const isAbhaLogin = ["abha_mobile", "abha_otp", "abha_address"].includes(screen);
  const isAbhaScreen = isAbhaLogin || isAbhaCreate;
  const abhaStep = screen === "abha_mobile" ? 1 : screen === "abha_otp" ? 2 : screen === "abha_address" ? 3 : 0;
  const abhaCreateStep = screen === "abha_create_1" ? 1 : screen === "abha_create_2" ? 2 : screen === "abha_create_3" ? 3 : screen === "abha_create_done" ? 4 : 0;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
      background: 'rgba(15, 23, 42, 0.72)', backdropFilter: 'blur(10px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 9999, padding: '16px'
    }}>
      <div className="login-modal-container" style={{
        background: '#fff', borderRadius: '24px', width: '100%', maxWidth: '860px',
        display: 'flex', overflow: 'hidden', position: 'relative',
        boxShadow: '0 25px 60px -12px rgba(0,0,0,0.35)', minHeight: '500px'
      }}>
        {/* ── Close Button ── */}
        <button
          onClick={handleClose}
          style={{
            position: 'absolute', top: '16px', right: '16px',
            background: 'rgba(255,255,255,0.9)', border: '1px solid var(--border)',
            cursor: 'pointer', color: 'var(--text-muted)', width: '34px', height: '34px',
            borderRadius: '50%', display: 'flex', alignItems: 'center',
            justifyContent: 'center', zIndex: 20, transition: 'all 0.2s',
            boxShadow: 'var(--shadow-sm)'
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--primary-light)'; e.currentTarget.style.color = 'var(--primary)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.9)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
        >
          <X size={18} />
        </button>

        {/* ── Left Pane ── */}
        {isAbhaCreate ? (
          <AbhaLeftPane step={abhaCreateStep} isCreate={true} />
        ) : isAbhaLogin ? (
          <AbhaLeftPane step={abhaStep} isCreate={false} />
        ) : (
          <div className="login-modal-left" style={{
            flex: '1', background: 'linear-gradient(150deg, var(--primary-light) 0%, #ffffff 60%)',
            padding: '48px 40px', display: 'flex', flexDirection: 'column',
            borderRight: '1px solid var(--border)'
          }}>
            <img src="/logo.png" alt="Arvaya" style={{ height: '44px', mixBlendMode: 'multiply', marginBottom: '40px', width: 'fit-content' }} />
            <h2 style={{ fontSize: '26px', fontWeight: '800', color: 'var(--text-main)', lineHeight: '1.2', marginBottom: '16px', letterSpacing: '-0.02em' }}>
              Your Health,<br /><span style={{ color: 'var(--primary)' }}>Simplified.</span>
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '40px', lineHeight: '1.7' }}>
              Join India's most trusted healthcare platform. Experience hassle-free medical care.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {["Consult 10,000+ Top Doctors", "Book Lab Tests with Home Collection", "Manage Health Records Securely", "Connect with ABHA instantly"].map((text, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <CheckCircle2 size={18} style={{ color: 'var(--success)', flexShrink: 0 }} />
                  <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-main)' }}>{text}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Right Pane ── */}
        <div className="login-modal-right" style={{
          flex: '1', padding: '48px 40px', display: 'flex', flexDirection: 'column',
          justifyContent: 'center', background: '#fff', minWidth: '360px'
        }}>
          {card}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════
   ABHA LEFT PANE — Shows ABHA branding + step progress
   ═══════════════════════════════════════ */
function AbhaLeftPane({ step, isCreate = false }) {
  const loginSteps = ["Mobile Number", "Verify OTP", "Select Address"];
  const createSteps = ["Aadhaar Number", "Verify OTP", "Personal Details", "ABHA Created!"];
  const steps = isCreate ? createSteps : loginSteps;
  const title = isCreate ? "Create ABHA" : "Link ABHA Profile";
  return (
    <div className="login-modal-left" style={{
      flex: '1', background: 'linear-gradient(150deg, var(--primary) 0%, var(--primary-dark) 100%)',
      padding: '48px 40px', display: 'flex', flexDirection: 'column',
      borderRight: '1px solid var(--border)', position: 'relative', overflow: 'hidden'
    }}>
      {/* Background decoration */}
      <div style={{ position: 'absolute', right: '-40px', top: '-40px', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
      <div style={{ position: 'absolute', left: '-60px', bottom: '-60px', width: '260px', height: '260px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />

      {/* ABHA Logo area */}
      <div style={{ position: 'relative', zIndex: 2, marginBottom: '52px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: '12px', padding: '10px', backdropFilter: 'blur(8px)' }}>
            <img src="/abha.svg" alt="ABHA" style={{ height: '32px', filter: 'brightness(0) invert(1)' }} onError={e => { e.currentTarget.style.display = 'none'; }} />
            <ShieldCheck size={32} color="white" style={{ display: 'none' }} />
          </div>
          <div>
            <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{isCreate ? "Creating" : "Linking"}</div>
            <div style={{ color: '#fff', fontSize: '18px', fontWeight: '800', letterSpacing: '-0.01em' }}>{title}</div>
          </div>
        </div>
      </div>

      {/* Step Tracker — vertical */}
      <div style={{ position: 'relative', zIndex: 2, flex: 1, paddingBottom: '8px' }}>
        <h3 style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '24px' }}>
          Progress
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
          {steps.map((label, idx) => {
            const stepNum = idx + 1;
            const isComplete = step > stepNum;
            const isActive = step === stepNum;
            return (
              <div key={label} style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
                    background: isComplete ? '#22c55e' : isActive ? '#fff' : 'rgba(255,255,255,0.15)',
                    border: isActive ? '3px solid rgba(255,255,255,0.4)' : 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.4s', boxShadow: isActive ? '0 0 0 6px rgba(255,255,255,0.1)' : 'none'
                  }}>
                    {isComplete
                      ? <CheckCircle2 size={18} color="white" />
                      : <span style={{ fontSize: '14px', fontWeight: '700', color: isActive ? 'var(--primary)' : 'rgba(255,255,255,0.5)' }}>{stepNum}</span>
                    }
                  </div>
                  {idx < steps.length - 1 && (
                    <div style={{
                      width: '2px', height: '36px',
                      background: isComplete ? 'rgba(34,197,94,0.6)' : 'rgba(255,255,255,0.15)',
                      margin: '4px 0', transition: 'all 0.4s'
                    }} />
                  )}
                </div>
                <div style={{ paddingTop: '8px', paddingBottom: idx < steps.length - 1 ? '32px' : '8px' }}>
                  <div style={{ color: isActive ? '#fff' : isComplete ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.4)', fontSize: '14px', fontWeight: isActive ? '700' : '500', transition: 'all 0.3s' }}>
                    {label}
                  </div>
                  {isActive && (
                    <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: '12px', marginTop: '2px' }}>
                      {isCreate
                        ? (stepNum === 1 ? 'Enter 12-digit Aadhaar' : stepNum === 2 ? 'Verify 6-digit OTP' : stepNum === 3 ? 'Fill personal details' : 'Your ABHA is ready')
                        : (stepNum === 1 ? 'Enter Aadhaar-linked mobile' : stepNum === 2 ? 'Verify 6-digit OTP' : 'Choose your ABHA address')}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom note */}
      <div style={{ position: 'relative', zIndex: 2, marginTop: 'auto', padding: '14px', background: 'rgba(255,255,255,0.08)', borderRadius: '12px', backdropFilter: 'blur(8px)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <ShieldCheck size={18} color="rgba(255,255,255,0.8)" />
          <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px', lineHeight: '1.5' }}>
            Secured by <strong style={{ color: '#fff' }}>NHA</strong> — Ayushman Bharat Digital Mission
          </span>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════
   LANDING
   ═══════════════════════════════════════ */
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
        boxShadow: '0 4px 12px rgba(46,102,110,0.28)', transition: 'all 0.25s'
      }}>
        <div style={{ position: 'absolute', left: '20px', display: 'flex', alignItems: 'center' }}>
          <Phone size={20} color="#fff" />
        </div>
        Continue with Mobile Number
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '8px 0' }}>
        <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
        <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>OR</span>
        <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
      </div>

      {/* ABHA Button */}
      <button onClick={onAbha} className="hover-glow" style={{
        position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#fff', color: 'var(--text-main)', border: '1.5px solid var(--border)', padding: '16px',
        borderRadius: '12px', fontSize: '15px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.25s'
      }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.background = 'var(--primary-light)'; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = '#fff'; }}
      >
        <div style={{ position: 'absolute', left: '20px', display: 'flex', alignItems: 'center' }}>
          <img src="/abha.svg" alt="ABHA" style={{ height: '24px' }}
            onError={e => { e.currentTarget.replaceWith(Object.assign(document.createElement('span'), { textContent: '🏥', style: 'font-size:20px' })); }} />
        </div>
        Continue with ABHA
        <div style={{ position: 'absolute', right: '20px' }}>
          <span style={{ background: 'var(--primary-light)', color: 'var(--primary)', fontSize: '10px', fontWeight: '700', padding: '2px 8px', borderRadius: '99px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>NEW</span>
        </div>
      </button>

      <p style={{ textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)', marginTop: '16px', lineHeight: '1.6' }}>
        By continuing, you agree to our{' '}
        <a href="#" style={{ color: 'var(--primary)', fontWeight: '600' }}>Terms of Service</a> and{' '}
        <a href="#" style={{ color: 'var(--primary)', fontWeight: '600' }}>Privacy Policy</a>.
      </p>
    </div>
  );
}

/* ═══════════════════════════════════════
   MOBILE (Regular OTP Login)
   ═══════════════════════════════════════ */
function Mobile({ onBack, onSend, busy, err }) {
  const [m, setM] = useState("");
  return (
    <div style={{ animation: 'fadeIn 0.3s ease-in-out' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
        <button onClick={onBack} style={{ background: 'var(--bg-app)', border: 'none', cursor: 'pointer', color: 'var(--text-main)', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ArrowLeft size={18} />
        </button>
        <h3 style={{ fontSize: '22px', fontWeight: '800', color: 'var(--text-main)', margin: 0, letterSpacing: '-0.02em' }}>Enter Mobile Number</h3>
      </div>
      <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '32px', paddingLeft: '44px' }}>We'll send a 6-digit OTP to verify.</p>

      {err && <ErrorBox msg={err} />}

      <div style={{ display: 'flex', alignItems: 'center', position: 'relative', marginBottom: '32px' }}>
        <span style={{ position: 'absolute', left: '16px', color: 'var(--text-muted)', fontWeight: '600', fontSize: '16px' }}>+91</span>
        <div style={{ position: 'absolute', left: '56px', top: '50%', transform: 'translateY(-50%)', width: '1px', height: '22px', background: 'var(--border)' }} />
        <input className="input-field" autoFocus type="tel" placeholder="Enter your 10-digit number" value={m} onChange={e => setM(e.target.value.replace(/\D/g, ""))} maxLength={10} style={{ paddingLeft: '72px', padding: '16px 16px 16px 72px', fontSize: '16px', borderRadius: '12px', background: 'var(--bg-app)' }} />
      </div>

      <button disabled={busy || m.length < 10} onClick={() => onSend(m)} style={{
        width: '100%', background: busy || m.length < 10 ? 'var(--border)' : 'var(--primary)',
        color: busy || m.length < 10 ? 'var(--text-muted)' : '#fff', border: 'none', padding: '16px',
        borderRadius: '12px', fontSize: '15px', fontWeight: '600',
        cursor: busy || m.length < 10 ? 'not-allowed' : 'pointer', transition: 'all 0.2s',
        boxShadow: busy || m.length < 10 ? 'none' : '0 4px 12px rgba(46,102,110,0.28)'
      }}>
        {busy ? "Sending OTP..." : "Get OTP"}
      </button>
    </div>
  );
}

/* ═══════════════════════════════════════
   OTP (Regular)
   ═══════════════════════════════════════ */
function Otp({ phone, onBack, onVerify, onResend, busy, err }) {
  const [o, setO] = useState("");
  return (
    <div style={{ animation: 'fadeIn 0.3s ease-in-out' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
        <button onClick={onBack} style={{ background: 'var(--bg-app)', border: 'none', cursor: 'pointer', color: 'var(--text-main)', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ArrowLeft size={18} />
        </button>
        <h3 style={{ fontSize: '22px', fontWeight: '800', color: 'var(--text-main)', margin: 0, letterSpacing: '-0.02em' }}>Verify OTP</h3>
      </div>
      <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '32px', paddingLeft: '44px' }}>
        Code sent to <b style={{ color: 'var(--text-main)' }}>+91 {phone}</b>
      </p>

      {err && <ErrorBox msg={err} />}
      <OtpInputGrid value={o} onChange={setO} />

      <button disabled={busy || o.length < 6} onClick={() => onVerify(o)} style={{
        width: '100%', background: busy || o.length < 6 ? 'var(--border)' : 'var(--primary)',
        color: busy || o.length < 6 ? 'var(--text-muted)' : '#fff', border: 'none', padding: '16px',
        borderRadius: '12px', fontSize: '15px', fontWeight: '600',
        cursor: busy || o.length < 6 ? 'not-allowed' : 'pointer', transition: 'all 0.2s',
        boxShadow: busy || o.length < 6 ? 'none' : '0 4px 12px rgba(46,102,110,0.28)'
      }}>
        {busy ? "Verifying..." : "Verify & Login"}
      </button>

      <p style={{ textAlign: 'center', fontSize: '13px', color: 'var(--text-muted)', marginTop: '24px' }}>
        Didn't receive the code?{' '}
        <button onClick={onResend} style={{ color: 'var(--primary)', fontWeight: '600', background: 'transparent', border: 'none', cursor: 'pointer' }}>
          Resend OTP
        </button>
      </p>
    </div>
  );
}

/* ═══════════════════════════════════════
   ABHA STEP 1 — Mobile Number
   ═══════════════════════════════════════ */
function AbhaMobile({ onBack, onSend, onCreateNow, busy, err }) {
  const [m, setM] = useState("");

  return (
    <div style={{ animation: 'fadeIn 0.35s ease-in-out' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
        <button onClick={onBack} style={{ background: 'var(--bg-app)', border: 'none', cursor: 'pointer', color: 'var(--text-main)', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', flexShrink: 0 }}>
          <ArrowLeft size={18} />
        </button>
        <div>
          <h3 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-main)', margin: 0, letterSpacing: '-0.02em' }}>
            Enter ABHA Mobile Number
          </h3>
        </div>
      </div>
      <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '28px', paddingLeft: '44px', lineHeight: '1.6' }}>
        Enter the 10-digit mobile number linked with your Aadhaar / ABHA account.
      </p>

      {err && <ErrorBox msg={err} />}

      {/* Mobile Input */}
      <div style={{ marginBottom: '12px' }}>
        <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-main)', marginBottom: '8px' }}>
          Mobile Number
        </label>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <div style={{
            position: 'absolute', left: '0', top: '0', bottom: '0',
            display: 'flex', alignItems: 'center', padding: '0 14px 0 16px',
            borderRight: '1.5px solid var(--border)', color: 'var(--text-main)',
            fontWeight: '700', fontSize: '15px', gap: '4px'
          }}>
            🇮🇳 <span>+91</span>
          </div>
          <input
            className="input-field"
            autoFocus
            type="tel"
            placeholder="10-digit mobile number"
            value={m}
            onChange={e => setM(e.target.value.replace(/\D/g, ""))}
            maxLength={10}
            style={{ paddingLeft: '88px', padding: '15px 16px 15px 88px', fontSize: '16px', borderRadius: '12px', background: 'var(--bg-app)', letterSpacing: m ? '0.06em' : '0' }}
          />
        </div>
      </div>

      {/* Don't have ABHA — create in-modal */}
      <div style={{ textAlign: 'right', marginBottom: '28px' }}>
        <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Don't have ABHA? </span>
        <button onClick={onCreateNow} style={{ color: 'var(--primary)', fontWeight: '700', fontSize: '13px', background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}>
          Create Now →
        </button>
      </div>

      <button
        disabled={busy || m.length < 10}
        onClick={() => onSend(m)}
        style={{
          width: '100%', background: busy || m.length < 10 ? 'var(--border)' : 'var(--accent)',
          color: busy || m.length < 10 ? 'var(--text-muted)' : '#fff', border: 'none', padding: '16px',
          borderRadius: '12px', fontSize: '15px', fontWeight: '700',
          cursor: busy || m.length < 10 ? 'not-allowed' : 'pointer', transition: 'all 0.25s',
          boxShadow: busy || m.length < 10 ? 'none' : '0 4px 16px rgba(251,145,63,0.38)',
          letterSpacing: '0.01em'
        }}
      >
        {busy ? "Sending OTP..." : "Send OTP"}
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '20px', padding: '12px 14px', background: 'var(--primary-light)', borderRadius: '10px', border: '1px solid var(--primary-soft)' }}>
        <ShieldCheck size={15} color="var(--primary)" style={{ flexShrink: 0 }} />
        <span style={{ fontSize: '12px', color: 'var(--primary-dark)', lineHeight: '1.5' }}>
          Your data is secured by <strong>NHA</strong> and processed as per ABDM guidelines.
        </span>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════
   ABHA STEP 2 — OTP Verification
   ═══════════════════════════════════════ */
function AbhaOtp({ mobile, onBack, onVerify, onResend, busy, err }) {
  const [o, setO] = useState("");
  const [countdown, setCountdown] = useState(120);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (countdown <= 0) { setCanResend(true); return; }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const handleResend = () => {
    setO(""); setCountdown(120); setCanResend(false);
    onResend();
  };

  const mins = String(Math.floor(countdown / 60)).padStart(2, '0');
  const secs = String(countdown % 60).padStart(2, '0');

  return (
    <div style={{ animation: 'fadeIn 0.35s ease-in-out' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
        <button onClick={onBack} style={{ background: 'var(--bg-app)', border: 'none', cursor: 'pointer', color: 'var(--text-main)', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <ArrowLeft size={18} />
        </button>
        <div>
          <h3 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-main)', margin: 0, letterSpacing: '-0.02em' }}>
            Confirm It's You
          </h3>
        </div>
      </div>

      <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '28px', paddingLeft: '44px', lineHeight: '1.6' }}>
        Enter the 6-digit verification code sent to mobile number linked with your ABHA account
        {' '}<strong style={{ color: 'var(--text-main)' }}>+91 {mobile}</strong>
      </p>

      {err && <ErrorBox msg={err} />}

      <div style={{ marginBottom: '28px' }}>
        <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: 'var(--text-main)', marginBottom: '14px' }}>
          Enter OTP
        </label>
        <OtpInputGrid value={o} onChange={setO} />
      </div>

      {/* Resend timer */}
      <div style={{ textAlign: 'right', marginBottom: '24px' }}>
        {canResend ? (
          <button onClick={handleResend} style={{ color: 'var(--primary)', fontWeight: '700', fontSize: '13px', background: 'transparent', border: 'none', cursor: 'pointer' }}>
            Resend OTP
          </button>
        ) : (
          <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Resend OTP in <strong style={{ color: 'var(--text-main)', fontVariantNumeric: 'tabular-nums' }}>{mins}:{secs}</strong>
          </span>
        )}
      </div>

      <button
        disabled={busy || o.length < 6}
        onClick={() => onVerify(o)}
        style={{
          width: '100%', background: busy || o.length < 6 ? 'var(--border)' : 'var(--accent)',
          color: busy || o.length < 6 ? 'var(--text-muted)' : '#fff', border: 'none', padding: '16px',
          borderRadius: '12px', fontSize: '15px', fontWeight: '700',
          cursor: busy || o.length < 6 ? 'not-allowed' : 'pointer', transition: 'all 0.25s',
          boxShadow: busy || o.length < 6 ? 'none' : '0 4px 16px rgba(251,145,63,0.38)'
        }}
      >
        {busy ? "Verifying..." : "Verify OTP"}
      </button>
    </div>
  );
}

/* ═══════════════════════════════════════
   ABHA STEP 3 — Select ABHA Address
   ═══════════════════════════════════════ */
function AbhaSelectAddress({ addresses, selected, onSelect, onBack, onConfirm, busy, err }) {
  const [dob, setDob] = useState("");
  const [dobErr, setDobErr] = useState("");

  const handleConfirm = () => {
    if (!dob) { setDobErr("Please enter your Date of Birth"); return; }
    setDobErr("");
    onConfirm(selected, dob);
  };

  return (
    <div style={{ animation: 'fadeIn 0.35s ease-in-out' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
        <button onClick={onBack} style={{ background: 'var(--bg-app)', border: 'none', cursor: 'pointer', color: 'var(--text-main)', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <ArrowLeft size={18} />
        </button>
        <h3 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-main)', margin: 0, letterSpacing: '-0.02em' }}>
          Select ABHA Address
        </h3>
      </div>
      <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '24px', paddingLeft: '44px', lineHeight: '1.6' }}>
        ABHA addresses found for this mobile number.
      </p>

      {err && <ErrorBox msg={err} />}

      {/* ABHA Address List */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-main)', marginBottom: '10px' }}>
          ABHA Address
        </label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {addresses.length > 0 ? addresses.map((addr, i) => {
            const addrVal = addr.address || addr.id || addr;
            const isSelected = selected === addrVal;
            return (
              <button
                key={i}
                onClick={() => onSelect(addrVal)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '14px 16px', borderRadius: '12px', textAlign: 'left',
                  border: isSelected ? '2px solid var(--primary)' : '1.5px solid var(--border)',
                  background: isSelected ? 'var(--primary-light)' : 'var(--bg-app)',
                  cursor: 'pointer', transition: 'all 0.2s', width: '100%'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '18px', height: '18px', borderRadius: '50%', flexShrink: 0,
                    border: isSelected ? '5px solid var(--primary)' : '2px solid var(--border)',
                    transition: 'all 0.2s', background: 'white'
                  }} />
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--primary-dark)', fontFamily: 'monospace', letterSpacing: '0.02em' }}>
                      {addrVal}
                    </div>
                    {addr.isPrimary && (
                      <span style={{ fontSize: '11px', color: 'var(--success)', fontWeight: '600' }}>● Primary</span>
                    )}
                  </div>
                </div>
                {isSelected && <CheckCircle2 size={18} color="var(--primary)" />}
              </button>
            );
          }) : (
            <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px', background: 'var(--bg-app)', borderRadius: '12px', border: '1.5px dashed var(--border)' }}>
              No ABHA addresses found
            </div>
          )}
        </div>
      </div>

      {/* Date of Birth — native date input; NO custom icon overlay to avoid double calendar */}
      <div style={{ marginBottom: '24px' }}>
        <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-main)', marginBottom: '8px' }}>
          Date of Birth
        </label>
        <input
          type="date"
          value={dob}
          onChange={e => { setDob(e.target.value); setDobErr(""); }}
          max={new Date().toISOString().split('T')[0]}
          className="input-field"
          style={{
            padding: '14px 16px', borderRadius: '12px',
            background: 'var(--bg-app)', fontSize: '15px', width: '100%',
            borderColor: dobErr ? 'var(--danger)' : undefined
          }}
        />
        {dobErr && <p style={{ color: 'var(--danger)', fontSize: '12px', marginTop: '6px', fontWeight: '500' }}>{dobErr}</p>}
      </div>

      <button
        disabled={busy || !selected}
        onClick={handleConfirm}
        style={{
          width: '100%', background: busy || !selected ? 'var(--border)' : 'var(--accent)',
          color: busy || !selected ? 'var(--text-muted)' : '#fff', border: 'none', padding: '16px',
          borderRadius: '12px', fontSize: '15px', fontWeight: '700',
          cursor: busy || !selected ? 'not-allowed' : 'pointer', transition: 'all 0.25s',
          boxShadow: busy || !selected ? 'none' : '0 4px 16px rgba(251,145,63,0.38)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
        }}
      >
        {busy ? "Linking Account..." : <>Continue and Login <ChevronRight size={18} /></>}
      </button>
    </div>
  );
}

/* ═══════════════════════════════════════
   ABHA CREATE FLOW
   ═══════════════════════════════════════ */
function AbhaCreate({ step, onBack, onNext, onFinish }) {
  const [aadhaar, setAadhaar] = useState("");
  const [otp, setOtp] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [form, setForm] = useState({ name: "", dob: "", gender: "Male", mobile: "", address: "" });
  const [createdAbha, setCreatedAbha] = useState("");

  const fmtAadhaar = (v) => v.replace(/\D/g, "").slice(0, 12).replace(/(\d{4})(?=\d)/g, "$1 ");

  const handleStep1 = async () => {
    const raw = aadhaar.replace(/\s/g, "");
    if (raw.length !== 12) { setErr("Please enter a valid 12-digit Aadhaar number."); return; }
    setErr(""); setBusy(true);
    await new Promise(r => setTimeout(r, 1200));
    setBusy(false);
    onNext("abha_create_2");
  };

  const handleStep2 = async () => {
    if (otp.length < 6) { setErr("Enter the 6-digit OTP sent to your Aadhaar-linked mobile."); return; }
    setErr(""); setBusy(true);
    await new Promise(r => setTimeout(r, 1000));
    // Mock: pre-fill from Aadhaar
    setForm(f => ({ ...f, name: "Shubham Harpanhalli", dob: "2000-04-10", mobile: "9876543210", address: "Miraj, Sangli, Maharashtra" }));
    setBusy(false);
    onNext("abha_create_3");
  };

  const handleStep3 = async () => {
    if (!form.name.trim() || !form.dob || !form.mobile) { setErr("Please fill all required fields."); return; }
    setErr(""); setBusy(true);
    await new Promise(r => setTimeout(r, 1400));
    const generated = `${form.name.split(" ")[0].toLowerCase()}.${Math.floor(Math.random() * 9000 + 1000)}@abdm`;
    setCreatedAbha(generated);
    setBusy(false);
    onNext("abha_create_done");
  };

  if (step === "abha_create_done") {
    return (
      <div style={{ animation: 'fadeIn 0.35s ease-in-out', textAlign: 'center' }}>
        <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
          <CheckCircle2 size={36} color="#16a34a" />
        </div>
        <h3 style={{ fontSize: '22px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '8px', letterSpacing: '-0.02em' }}>ABHA Created!</h3>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '20px', lineHeight: '1.6' }}>Your ABHA ID has been successfully created and linked.</p>
        <div style={{ background: 'var(--primary-light)', border: '1.5px solid var(--primary-soft)', borderRadius: '12px', padding: '16px 20px', fontFamily: 'monospace', fontSize: '15px', fontWeight: '700', color: 'var(--primary)', marginBottom: '28px' }}>
          {createdAbha}
        </div>
        <button onClick={onFinish} style={{ width: '100%', padding: '16px', background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 14px rgba(46,102,110,0.28)' }}>
          Go to ABHA Hub
        </button>
      </div>
    );
  }

  return (
    <div style={{ animation: 'fadeIn 0.35s ease-in-out' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
        <button onClick={onBack} style={{ background: 'var(--bg-app)', border: 'none', cursor: 'pointer', color: 'var(--text-main)', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <ArrowLeft size={18} />
        </button>
        <h3 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-main)', margin: 0, letterSpacing: '-0.02em' }}>
          {step === 'abha_create_1' ? 'Aadhaar Verification' : step === 'abha_create_2' ? 'Verify OTP' : 'Personal Details'}
        </h3>
      </div>
      <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '24px', paddingLeft: '44px', lineHeight: '1.6' }}>
        {step === 'abha_create_1' ? 'Enter your 12-digit Aadhaar number to create your ABHA ID.'
          : step === 'abha_create_2' ? 'Enter the OTP sent to your Aadhaar-linked mobile number.'
            : 'Review and confirm your personal details fetched from Aadhaar.'}
      </p>

      {err && <div style={{ background: '#fef2f2', color: '#dc2626', padding: '10px 14px', borderRadius: '10px', fontSize: '13px', fontWeight: '500', marginBottom: '16px', border: '1px solid #fecaca', display: 'flex', alignItems: 'center', gap: '8px' }}><X size={15} />{err}</div>}

      {step === 'abha_create_1' && (
        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-main)', marginBottom: '8px' }}>Aadhaar Number</label>
          <input className="input-field" autoFocus type="text" inputMode="numeric" placeholder="XXXX XXXX XXXX" value={aadhaar} onChange={e => setAadhaar(fmtAadhaar(e.target.value))} maxLength={14}
            style={{ padding: '15px 16px', fontSize: '18px', letterSpacing: '0.12em', fontFamily: 'monospace', borderRadius: '12px', background: 'var(--bg-app)', width: '100%' }} />
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px' }}>An OTP will be sent to your Aadhaar-linked mobile number.</p>
        </div>
      )}

      {step === 'abha_create_2' && (
        <div style={{ marginBottom: '24px' }}>
          <OtpInputGrid value={otp} onChange={setOtp} />
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '8px' }}>
            Didn't receive? <button onClick={() => setOtp('')} style={{ color: 'var(--primary)', fontWeight: '700', background: 'none', border: 'none', cursor: 'pointer' }}>Resend</button>
          </p>
        </div>
      )}

      {step === 'abha_create_3' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
          {[['Full Name', 'name', 'text', 'Enter full name'], ['Mobile Number', 'mobile', 'tel', '10-digit mobile'], ['Address', 'address', 'text', 'Your address']].map(([lbl, key, type, ph]) => (
            <div key={key}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-main)', marginBottom: '6px' }}>{lbl}</label>
              <input className="input-field" type={type} placeholder={ph} value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                style={{ padding: '13px 16px', borderRadius: '12px', background: 'var(--bg-app)', fontSize: '14px', width: '100%' }} />
            </div>
          ))}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-main)', marginBottom: '6px' }}>Date of Birth</label>
              <input className="input-field" type="date" value={form.dob} onChange={e => setForm(f => ({ ...f, dob: e.target.value }))} max={new Date().toISOString().split('T')[0]}
                style={{ padding: '13px 16px', borderRadius: '12px', background: 'var(--bg-app)', fontSize: '14px', width: '100%' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-main)', marginBottom: '6px' }}>Gender</label>
              <select className="input-field" value={form.gender} onChange={e => setForm(f => ({ ...f, gender: e.target.value }))}
                style={{ padding: '13px 16px', borderRadius: '12px', background: 'var(--bg-app)', fontSize: '14px', width: '100%' }}>
                <option>Male</option><option>Female</option><option>Other</option>
              </select>
            </div>
          </div>
        </div>
      )}

      <button disabled={busy} onClick={step === 'abha_create_1' ? handleStep1 : step === 'abha_create_2' ? handleStep2 : handleStep3}
        style={{ width: '100%', padding: '16px', background: busy ? 'var(--border)' : 'var(--accent)', color: busy ? 'var(--text-muted)' : '#fff', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: '700', cursor: busy ? 'wait' : 'pointer', transition: 'all 0.25s', boxShadow: busy ? 'none' : '0 4px 16px rgba(251,145,63,0.38)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
        {busy ? 'Please wait...' : step === 'abha_create_1' ? 'Send OTP' : step === 'abha_create_2' ? 'Verify OTP' : <><UserPlus size={18} />Create My ABHA</>}
      </button>
    </div>
  );
}

/* ═══════════════════════════════════════
   SHARED HELPERS
   ═══════════════════════════════════════ */
function ErrorBox({ msg }) {
  return (
    <div style={{
      background: '#fef2f2', color: '#dc2626', padding: '12px 14px',
      borderRadius: '10px', fontSize: '13px', marginBottom: '20px',
      fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px',
      border: '1px solid #fecaca'
    }}>
      <X size={15} style={{ flexShrink: 0 }} />
      {msg}
    </div>
  );
}

function OtpInputGrid({ value, onChange }) {
  const refs = useRef([]);

  const handleChange = (e, idx) => {
    const val = e.target.value.replace(/\D/g, "");
    if (!val) return;
    const newVal = (value.slice(0, idx) + val + value.slice(idx + 1)).slice(0, 6);
    onChange(newVal);
    if (idx < 5 && refs.current[idx + 1]) refs.current[idx + 1].focus();
  };

  const handleKeyDown = (e, idx) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      if (value[idx]) {
        onChange(value.slice(0, idx) + value.slice(idx + 1));
      } else if (idx > 0 && refs.current[idx - 1]) {
        refs.current[idx - 1].focus();
        onChange(value.slice(0, idx - 1) + value.slice(idx));
      }
    } else if (e.key === 'ArrowLeft' && idx > 0) {
      refs.current[idx - 1]?.focus();
    } else if (e.key === 'ArrowRight' && idx < 5) {
      refs.current[idx + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted) { onChange(pasted); refs.current[Math.min(pasted.length, 5)]?.focus(); }
  };

  return (
    <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-start', marginBottom: '8px' }}>
      {Array.from({ length: 6 }).map((_, i) => (
        <input
          key={i}
          ref={el => refs.current[i] = el}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[i] || ""}
          onChange={e => handleChange(e, i)}
          onKeyDown={e => handleKeyDown(e, i)}
          onPaste={handlePaste}
          onFocus={e => {
            e.target.style.borderColor = 'var(--primary)';
            e.target.style.boxShadow = '0 0 0 4px rgba(46,102,110,0.14)';
            e.target.style.background = '#fff';
          }}
          onBlur={e => {
            e.target.style.borderColor = value[i] ? 'var(--primary-soft)' : 'var(--border)';
            e.target.style.boxShadow = 'none';
            e.target.style.background = 'var(--bg-app)';
          }}
          style={{
            width: '48px', height: '56px',
            border: value[i] ? '2px solid var(--primary-soft)' : '1.5px solid var(--border)',
            borderRadius: '12px', textAlign: 'center', fontSize: '22px', fontWeight: '700',
            color: 'var(--text-main)', outline: 'none',
            background: value[i] ? 'var(--primary-light)' : 'var(--bg-app)',
            transition: 'all 0.2s', cursor: 'text'
          }}
        />
      ))}
    </div>
  );
}
