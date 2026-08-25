import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { ArrowLeft, Phone, X, CheckCircle2, ChevronRight, ShieldCheck, User, UserPlus, Calendar as CalendarIcon, ChevronLeft, FileText, KeyRound, Sparkles, MapPin, Copy, Check } from "lucide-react";
import { sendOtp, verifyOtp, getCloudId, getDeviceId } from "../services/authService";
import { abhaSendOtp, abhaVerifyOtp, abhaConfirmAddress, abhaVerifyUser, abhaSendCreationOtp, abhaCreateByAadhaar, abhaGetSuggestions } from "../services/abhaService";
import { useNavigate, useLocation } from "react-router-dom";

export default function Login({ forceOpen = false }) {
  const { isLoginModalOpen, closeLoginModal, pendingRedirect, saveSession, loginModalScreen } = useAuth();
  const location = useLocation();
  const [screen, setScreen] = useState(location.state?.screen || loginModalScreen || "landing");
  const [phone, setPhone] = useState("");
  const [isAbhaFlow, setIsAbhaFlow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (location.state?.screen) {
      setScreen(location.state.screen);
    } else if (loginModalScreen) {
      setScreen(loginModalScreen);
    }
  }, [location.state, loginModalScreen]);

  // ABHA-specific state
  const [abhaMobile, setAbhaMobile] = useState("");
  const [abhaAddresses, setAbhaAddresses] = useState([]);
  const [selectedAbhaAddress, setSelectedAbhaAddress] = useState("");
  const [abhaTransactionId, setAbhaTransactionId] = useState("");
  const [abhaVerifyData, setAbhaVerifyData] = useState(null);

  const go = useNavigate();

  const handleClose = () => {
    setScreen("landing");
    setPhone("");
    setErr("");
    setAbhaMobile("");
    setAbhaAddresses([]);
    setSelectedAbhaAddress("");
    setAbhaTransactionId("");
    setAbhaVerifyData(null);
    closeLoginModal();
    go(-1);
  };

  /* ── Regular Mobile OTP Flow ── */
  const doSendOtp = async (mobile) => {
    setPhone(mobile); setErr(""); setBusy(true);
    try {
      const res = await sendOtp(mobile);
      if (res && (res.is_registered === false || res.registered === false || res.userExists === false || res.isNewUser === true)) {
        handleClose(); go(`/signup?phone=${mobile}`, { state: { from: location.state?.from || location.state?.redirectPath || pendingRedirect } }); return;
      }
      setScreen("otp");
    } catch (e) {
      const msg = (e.message || "").toLowerCase();
      if (msg.includes("not found") || msg.includes("not registered") || msg.includes("no user") || msg.includes("invalid number") || msg.includes("doesn't exist")) {
        handleClose(); go(`/signup?phone=${mobile}`, { state: { from: location.state?.from || location.state?.redirectPath || pendingRedirect } });
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
        setScreen("landing");
        setPhone("");
        setErr("");
        closeLoginModal();
        go(`/signup?phone=${phone}`, { state: { from: location.state?.from || location.state?.redirectPath || pendingRedirect } });
        return;
      }

      // If is_new_user is 0 (existing user), login directly
      const token = res?.token || res?.accessToken || res?.data?.token || res?.result?.token || res?.UserData?.token || res?.UserData?.accessToken || "token_" + Date.now();
      let rawUser = res?.UserData || res?.userData || res?.user || res?.data?.user || res?.result?.user || res?.data || res?.result;
      if (!rawUser || typeof rawUser !== "object") {
        rawUser = {};
      }

      let derivedName = rawUser?.name || rawUser?.full_name || rawUser?.fullName || rawUser?.user_name || rawUser?.userName;
      if (!derivedName || derivedName === "User" || derivedName.startsWith("User (")) {
        const firstName = rawUser?.first_name || rawUser?.firstName || "";
        const lastName = rawUser?.last_name || rawUser?.lastName || "";
        if (firstName || lastName) {
          const title = rawUser?.title ? rawUser.title.trim() + " " : "";
          derivedName = `${title}${firstName} ${lastName}`.trim();
        }
      }
      if (!derivedName) {
        derivedName = phone ? `User (${phone})` : "User";
      }

      const user = {
        ...rawUser,
        name: derivedName,
        phone: rawUser?.mobile_number || rawUser?.phone || rawUser?.mobile || phone
      };

      saveSession({ token, user, loginMethod: "user_verify_otp" });
      setScreen("landing");
      setPhone("");
      setErr("");
      closeLoginModal();
      go(location.state?.from || location.state?.redirectPath || pendingRedirect || "/");
    } catch (e) { setErr(e.message || "Invalid OTP"); }
    finally { setBusy(false); }
  };

  /* ── ABHA 3-Step Flow ── */
  const doAbhaSendOtp = async (mobile) => {
    setAbhaMobile(mobile); setErr(""); setBusy(true);
    try {
      const res = await abhaSendOtp(mobile);
      const txnId = res?.transactionId || res?.txnId || res?.txn_id || res?.data?.transactionId || res?.data?.txnId || res?.data?.txn_id || res?.result?.txnId || res?.result?.transactionId || "mock_txn_" + Date.now();
      setAbhaTransactionId(txnId);
      setScreen("abha_otp");
    } catch (e) { setErr(e.message || "Failed to send OTP to ABHA mobile"); }
    finally { setBusy(false); }
  };

  const doAbhaVerifyOtp = async (otp) => {
    setErr(""); setBusy(true);
    try {
      const res = await abhaVerifyOtp(otp, abhaTransactionId);
      setAbhaVerifyData(res);
      const newTxnId = res?.txnId || res?.transactionId || res?.txn_id || res?.data?.txnId || abhaTransactionId;
      setAbhaTransactionId(newTxnId);

      const userObj = res?.users?.[0] || res?.data?.users?.[0] || res?.user || {};
      const verifyAddress = userObj?.abhaAddress || userObj?.address || userObj?.abha_address || res?.abhaAddress || res?.data?.abhaAddress || res?.abha_address || "";

      let addresses = res?.users || res?.abhaAddressList || res?.addresses || res?.data?.users || res?.data?.abhaAddressList || [];
      if (addresses.length === 0 && verifyAddress) {
        addresses = [{ address: verifyAddress, isPrimary: true }];
      } else if (addresses.length === 0) {
        const addrRes = await abhaGetSuggestions(newTxnId, { firstName: userObj.name || "" }).catch(() => null);
        addresses = addrRes?.abhaAddressList || addrRes?.addresses || (verifyAddress ? [{ address: verifyAddress }] : []);
      }

      const primaryAddress = verifyAddress || (addresses[0]?.abhaAddress || addresses[0]?.address || addresses[0]?.id || "");

      setAbhaAddresses(addresses);
      setSelectedAbhaAddress(primaryAddress);
      setScreen("abha_address");
    } catch (e) { setErr(e.message || "Invalid OTP. Please try again."); }
    finally { setBusy(false); }
  };

  const doAbhaConfirm = async (address, dob) => {
    setErr(""); setBusy(true);
    try {
      const userObj = abhaVerifyData?.users?.[0] || abhaVerifyData?.data?.users?.[0] || abhaVerifyData?.user || {};
      const tokenVal = abhaVerifyData?.tokens?.token || abhaVerifyData?.token || abhaVerifyData?.accessToken || abhaVerifyData?.data?.token || "";
      const payload = {
        txnId: abhaVerifyData?.txnId || abhaVerifyData?.transactionId || abhaVerifyData?.data?.txnId || abhaTransactionId,
        abhaAddress: address,
        token: tokenVal,
        supportKey: abhaVerifyData?.supportKey || abhaVerifyData?.data?.supportKey || abhaVerifyData?.support_key || "",
        name: userObj?.fullName || userObj?.name || userObj?.first_name || abhaVerifyData?.name || abhaVerifyData?.data?.name || "",
        mobile_number: abhaMobile,
        cloud_id: getCloudId(),
        device_id: getDeviceId(),
        abha_number: userObj?.abhaNumber || userObj?.abha_number || abhaVerifyData?.abha_number || abhaVerifyData?.abhaNumber || "",
        abha_type: "sbx",
        abha_status: "active",
        gender: userObj?.gender || abhaVerifyData?.gender || "",
        date_of_birth: dob
      };

      const res = await abhaVerifyUser(payload);
      const abhaResponseToken = res?.UserData?.response?.refreshToken;
      const newtoken = res?.token;
      const userId = res?.UserData?.user_id || res?.user_id || res?.user?.id || res?.user?.user_id;
      if (abhaResponseToken) {
        localStorage.setItem("abha_user_token", abhaResponseToken);
        localStorage.setItem("abha_token", abhaResponseToken);
      }
      if (userId) {
        localStorage.setItem("user_id", userId);
      }
      let user = res?.UserData || res?.userData || res?.user || res?.data?.user || res?.result?.user || res?.data || res?.result || { name: payload.name || "ABHA User", abhaAddress: address };

      saveSession({
        token: newtoken,
        user: {
          ...user,
          abha_token: abhaResponseToken,
          abhaAddress: address,
          abhaNumber: payload.abha_number || user?.abhaNumber || user?.abha_number || "91-6780-5608-2723",
          abha_number: payload.abha_number || user?.abha_number || user?.abhaNumber || "91-6780-5608-2723"
        },
        loginMethod: "abha"
      });
      handleClose();
      go(location.state?.from || location.state?.redirectPath || pendingRedirect || "/");
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
    case "abha_create_1":
    case "abha_create_2":
    case "abha_create_3":
    case "abha_create_done":
      card = <AbhaCreate step={screen} initialMobile={abhaMobile} abhaTransactionId={abhaTransactionId} setAbhaTransactionId={setAbhaTransactionId} saveSession={saveSession} onBack={() => setScreen(screen === "abha_create_1" ? "abha_mobile" : screen === "abha_create_2" ? "abha_create_1" : "abha_create_2")} onNext={(s) => setScreen(s)} onFinish={() => { handleClose(); go("/abha"); }} />;
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
      minHeight: '80vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '48px 16px', background: 'var(--bg-app)'
    }}>
      <div className="login-modal-container" style={{
        background: '#fff', borderRadius: '24px', width: '100%', maxWidth: '840px',
        maxHeight: 'min(620px, 92vh)', display: 'flex', position: 'relative',
        boxShadow: '0 20px 40px -15px rgba(15, 23, 42, 0.08), 0 0 0 1px rgba(15, 23, 42, 0.05)',
        overflow: 'hidden'
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
            padding: '36px 32px', display: 'flex', flexDirection: 'column',
            borderRight: '1px solid var(--border)',
            borderTopLeftRadius: '24px', borderBottomLeftRadius: '24px'
          }}>
            <img src="/logo.png" alt="Arvaya" style={{ height: '40px', mixBlendMode: 'multiply', marginBottom: '28px', width: 'fit-content' }} />
            <h2 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-main)', lineHeight: '1.2', marginBottom: '12px', letterSpacing: '-0.02em' }}>
              Your Health,<br /><span style={{ color: 'var(--primary)' }}>Simplified.</span>
            </h2>
            <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', marginBottom: '28px', lineHeight: '1.6' }}>
              Join India's most trusted healthcare platform. Experience hassle-free medical care.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {["Consult 10,000+ Top Doctors", "Book Lab Tests with Home Collection", "Manage Health Records Securely", "Connect with ABHA instantly"].map((text, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <CheckCircle2 size={16} style={{ color: 'var(--success)', flexShrink: 0 }} />
                  <span style={{ fontSize: '13.5px', fontWeight: '600', color: 'var(--text-main)' }}>{text}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Right Pane ── */}
        <div className="login-modal-right" style={{
          flex: '1.1', padding: '32px 36px', display: 'flex', flexDirection: 'column',
          justifyContent: 'center', background: '#fff', minWidth: '340px',
          borderTopRightRadius: '24px', borderBottomRightRadius: '24px',
          overflowY: 'auto'
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
      flex: '0.9', background: 'linear-gradient(145deg, #134e4a, #0f766e, #0d9488)',
      padding: '32px 28px', display: 'flex', flexDirection: 'column',
      borderRight: '1px solid var(--border)', position: 'relative', overflow: 'hidden',
      borderTopLeftRadius: '24px', borderBottomLeftRadius: '24px'
    }}>
      {/* Background decoration */}
      <div style={{ position: 'absolute', right: '-40px', top: '-40px', width: '180px', height: '180px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
      <div style={{ position: 'absolute', left: '-60px', bottom: '-60px', width: '220px', height: '220px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />

      {/* ABHA Logo area */}
      <div style={{ position: 'relative', zIndex: 2, marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ background: 'rgba(255,255,255,0.18)', borderRadius: '10px', padding: '8px 10px', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center' }}>
            <img src="/abha.svg" alt="ABHA" style={{ height: '26px', filter: 'brightness(0) invert(1)' }} onError={e => { e.currentTarget.style.display = 'none'; }} />
          </div>
          <div>
            <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '10.5px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{isCreate ? "Creating" : "Linking"}</div>
            <div style={{ color: '#fff', fontSize: '17px', fontWeight: '800', letterSpacing: '-0.01em' }}>{title}</div>
          </div>
        </div>
      </div>

      {/* Step Tracker — vertical */}
      <div style={{ position: 'relative', zIndex: 2, flex: 1 }}>
        <h3 style={{ color: 'rgba(255,255,255,0.75)', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '18px' }}>
          Progress
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
          {steps.map((label, idx) => {
            const stepNum = idx + 1;
            const isComplete = step > stepNum;
            const isActive = step === stepNum;
            return (
              <div key={label} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{
                    width: '30px', height: '30px', borderRadius: '50%', flexShrink: 0,
                    background: isComplete ? '#22c55e' : isActive ? '#fff' : 'rgba(255,255,255,0.15)',
                    border: isActive ? '2px solid rgba(255,255,255,0.5)' : 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.3s', boxShadow: isActive ? '0 0 0 4px rgba(255,255,255,0.15)' : 'none'
                  }}>
                    {isComplete
                      ? <CheckCircle2 size={16} color="white" />
                      : <span style={{ fontSize: '12.5px', fontWeight: '700', color: isActive ? '#0f766e' : 'rgba(255,255,255,0.6)' }}>{stepNum}</span>
                    }
                  </div>
                  {idx < steps.length - 1 && (
                    <div style={{
                      width: '2px', height: '26px',
                      background: isComplete ? 'rgba(34,197,94,0.6)' : 'rgba(255,255,255,0.15)',
                      margin: '2px 0', transition: 'all 0.3s'
                    }} />
                  )}
                </div>
                <div style={{ paddingTop: '5px', paddingBottom: idx < steps.length - 1 ? '16px' : '4px' }}>
                  <div style={{ color: isActive ? '#fff' : isComplete ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.45)', fontSize: '13px', fontWeight: isActive ? '700' : '500', transition: 'all 0.3s' }}>
                    {label}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom note */}
      <div style={{ position: 'relative', zIndex: 2, marginTop: 'auto', padding: '10px 12px', background: 'rgba(255,255,255,0.1)', borderRadius: '10px', backdropFilter: 'blur(8px)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldCheck size={16} color="rgba(255,255,255,0.9)" />
          <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '11px', lineHeight: '1.4' }}>
            Secured by <strong style={{ color: '#fff' }}>NHA</strong> — ABDM Guidelines
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

  const hasAddress = !!selected || (addresses && addresses.length > 0);

  return (
    <div style={{ animation: 'fadeIn 0.35s ease-in-out' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
        <button onClick={onBack} style={{ background: 'var(--bg-app)', border: 'none', cursor: 'pointer', color: 'var(--text-main)', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <ArrowLeft size={18} />
        </button>
        <h3 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-main)', margin: 0, letterSpacing: '-0.02em' }}>
          Link ABHA Profile
        </h3>
      </div>

      {err && <ErrorBox msg={err} />}

      {/* Message above input when ABHA address is found */}
      {hasAddress && (
        <div style={{
          fontSize: '13px', color: '#15803d', fontWeight: '600',
          marginBottom: '16px', padding: '10px 14px', borderRadius: '10px',
          background: '#f0fdf4', border: '1px solid #bbf7d0',
          display: 'flex', alignItems: 'center', gap: '8px'
        }}>
          <CheckCircle2 size={16} color="#16a34a" />
          <span>ABHA addresses found for this mobile number</span>
        </div>
      )}

      {/* ABHA Address Field / Selector */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-main)', marginBottom: '8px' }}>
          ABHA Address
        </label>

        {addresses.length > 1 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
            {addresses.map((addr, i) => {
              const addrVal = addr.abhaAddress || addr.address || addr.id || (typeof addr === 'string' ? addr : '');
              const isSelected = selected === addrVal;
              return (
                <button
                  key={i}
                  onClick={() => onSelect(addrVal)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '12px 14px', borderRadius: '12px', textAlign: 'left',
                    border: isSelected ? '2px solid var(--primary)' : '1.5px solid var(--border)',
                    background: isSelected ? 'var(--primary-light)' : 'var(--bg-app)',
                    cursor: 'pointer', transition: 'all 0.2s', width: '100%'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '16px', height: '16px', borderRadius: '50%', flexShrink: 0,
                      border: isSelected ? '5px solid var(--primary)' : '2px solid var(--border)',
                      transition: 'all 0.2s', background: 'white'
                    }} />
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--primary-dark)', fontFamily: 'monospace', letterSpacing: '0.02em' }}>
                        {addrVal}
                      </div>
                    </div>
                  </div>
                  {isSelected && <CheckCircle2 size={18} color="var(--primary)" />}
                </button>
              );
            })}
          </div>
        ) : (
          <input
            type="text"
            value={selected}
            onChange={e => onSelect(e.target.value)}
            placeholder="e.g. username@sbx"
            className="input-field"
            style={{
              padding: '14px 16px', borderRadius: '12px',
              background: 'var(--bg-app)', fontSize: '15px', width: '100%',
              fontWeight: '600', color: 'var(--primary-dark)', fontFamily: 'monospace'
            }}
          />
        )}
      </div>

      {/* Date of Birth */}
      <div style={{ marginBottom: '24px' }}>
        <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-main)', marginBottom: '8px' }}>
          Date of Birth
        </label>
        <DobPicker
          value={dob}
          onChange={val => { setDob(val); setDobErr(""); }}
          error={dobErr}
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
        {busy ? "Logging in..." : <>Continue and login <ChevronRight size={18} /></>}
      </button>
    </div>
  );
}

/* ═══════════════════════════════════════
   ABHA CREATE FLOW
   ═══════════════════════════════════════ */
function AbhaCreate({ step, initialMobile = "", abhaTransactionId = "", setAbhaTransactionId, saveSession, onBack, onNext, onFinish }) {
  const [aadhaar, setAadhaar] = useState("");
  const [mobile, setMobile] = useState(initialMobile || "");
  const [otp, setOtp] = useState("");
  const [txnId, setTxnId] = useState(abhaTransactionId || "");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [form, setForm] = useState({ name: "", dob: "", gender: "Male", mobile: "", address: "" });
  const [createdAbha, setCreatedAbha] = useState("");
  const [copied, setCopied] = useState(false);

  const fmtAadhaar = (v) => v.replace(/\D/g, "").slice(0, 12).replace(/(\d{4})(?=\d)/g, "$1 ");

  const rawAadhaar = aadhaar.replace(/\s/g, "");
  const isAadhaarValid = rawAadhaar.length === 12;

  const handleStep1 = async () => {
    if (!isAadhaarValid) { setErr("Please enter a valid 12-digit Aadhaar number."); return; }
    setErr(""); setBusy(true);
    try {
      const res = await abhaSendCreationOtp(rawAadhaar);
      const newTxnId = res?.txnId || res?.transactionId || res?.data?.txnId || res?.data?.transactionId || res?.txn_id || res?.result?.txnId || "";
      const fetchedMobile = res?.mobileNumber || res?.data?.mobileNumber || res?.mobile || res?.data?.mobile || "";

      if (newTxnId) {
        setTxnId(newTxnId);
        if (setAbhaTransactionId) setAbhaTransactionId(newTxnId);
      }
      if (fetchedMobile) {
        setMobile(fetchedMobile);
      }
      setBusy(false);
      onNext("abha_create_2");
    } catch (e) {
      setErr(e.message || "Failed to send OTP to Aadhaar-linked mobile");
      setBusy(false);
    }
  };

  const [creationAuthData, setCreationAuthData] = useState(null);

  const handleStep2 = async () => {
    const cleanMobile = mobile.replace(/\D/g, "");
    if (cleanMobile.length < 10 && !mobile.includes('*')) { setErr("Please enter a valid 10-digit mobile number."); return; }
    if (otp.length < 6) { setErr("Enter the 6-digit OTP sent to your Aadhaar-linked mobile."); return; }
    setErr(""); setBusy(true);
    try {
      const activeTxnId = txnId || abhaTransactionId;
      const res = await abhaCreateByAadhaar(mobile.includes('*') ? mobile : cleanMobile, otp, activeTxnId);

      const profile = res?.ABHAProfile || res?.data?.ABHAProfile || res?.profile || {};
      const tokens = res?.tokens || res?.data?.tokens || {};

      // Preferred ABHA Address or ABHA Number
      const abhaAddress = profile?.preferredAddress || profile?.ABHANumber || res?.abhaNumber || res?.preferredAddress || res?.abha_number || res?.data?.abhaNumber || "";

      // Name construction from firstName, middleName, lastName
      const constructedName = [profile?.firstName, profile?.middleName, profile?.lastName].filter(Boolean).join(" ");
      const name = constructedName || res?.name || res?.fullName || res?.data?.name || res?.UserData?.name || "ABHA User";

      // Format Date of Birth (DD-MM-YYYY -> YYYY-MM-DD)
      const rawDob = profile?.dob || res?.dob || res?.dateOfBirth || res?.data?.dob || "";
      let dob = "2000-01-01";
      if (rawDob && rawDob.includes("-")) {
        const parts = rawDob.split("-");
        if (parts.length === 3) {
          if (parts[0].length === 4) dob = rawDob;
          else dob = `${parts[2]}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}`;
        }
      }

      // Format Gender ("M" -> "Male", "F" -> "Female")
      const rawGender = profile?.gender || res?.gender || res?.data?.gender || "Male";
      const gender = (rawGender === "M" || rawGender === "MALE") ? "Male" : (rawGender === "F" || rawGender === "FEMALE") ? "Female" : rawGender;

      const address = profile?.address || res?.address || res?.data?.address || "";
      const userMobile = profile?.mobile || cleanMobile;

      setForm({ name, dob, gender, mobile: userMobile, address });
      setCreatedAbha(abhaAddress || `${name.split(" ")[0].toLowerCase()}.${Math.floor(Math.random() * 9000 + 1000)}@abdm`);

      // Save tokens & profile to state to saveSession upon final step
      setCreationAuthData({
        token: tokens?.token || res?.token || "",
        refreshToken: tokens?.refreshToken || "",
        tokens,
        profile,
        user: {
          name,
          mobile: userMobile,
          dob,
          gender,
          address,
          abhaAddress,
          abhaNumber: profile?.ABHANumber || abhaAddress,
          abha_number: profile?.ABHANumber || abhaAddress,
          abha_token: tokens?.token || "",
          photo: profile?.photo || null,
          isKycVerified: true,
          abhaStatus: profile?.abhaStatus || "ACTIVE"
        }
      });

      setBusy(false);
      onNext("abha_create_3");
    } catch (e) {
      setErr(e.message || "Failed to create ABHA by Aadhaar.");
      setBusy(false);
    }
  };

  const handleStep3 = async () => {
    if (!form.name.trim() || !form.dob || !form.mobile) { setErr("Please fill all required fields."); return; }
    setErr(""); setBusy(true);
    await new Promise(r => setTimeout(r, 600));
    setBusy(false);
    onNext("abha_create_done");
  };

  const copyToClipboard = () => {
    if (createdAbha) {
      navigator.clipboard.writeText(createdAbha);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (step === "abha_create_done") {
    return (
      <div style={{ animation: 'fadeIn 0.35s ease-in-out', textAlign: 'center', padding: '8px 0' }}>
        <div style={{
          width: '68px', height: '68px', borderRadius: '50%',
          background: 'linear-gradient(135deg, #dcfce7, #bbf7d0)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 16px', boxShadow: '0 8px 20px rgba(34,197,94,0.18)'
        }}>
          <CheckCircle2 size={36} color="#15803d" />
        </div>

        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          background: 'var(--primary-light)', padding: '4px 12px', borderRadius: '20px',
          fontSize: '11.5px', fontWeight: '700', color: 'var(--primary-dark)', marginBottom: '10px'
        }}>
          <Sparkles size={13} /> ABHA ID CREATED SUCCESSFULLY
        </div>

        <h3 style={{ fontSize: '22px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '6px', letterSpacing: '-0.02em' }}>
          Welcome to ABHA!
        </h3>
        <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', marginBottom: '20px', lineHeight: '1.5', maxWidth: '360px', margin: '0 auto 20px' }}>
          Your Official Healthcare ID is active and ready to manage digital medical records.
        </p>

        <div style={{
          background: 'var(--bg-app)', border: '1.5px solid var(--primary-soft)',
          borderRadius: '14px', padding: '16px 18px', marginBottom: '24px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px'
        }}>
          <div style={{ textAlign: 'left' }}>
            <span style={{ fontSize: '10.5px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>ABHA Address / ID</span>
            <div style={{ fontFamily: 'monospace', fontSize: '15px', fontWeight: '700', color: 'var(--primary-dark)', marginTop: '2px' }}>
              {createdAbha}
            </div>
          </div>
          <button onClick={copyToClipboard} style={{
            background: copied ? '#dcfce7' : 'white', border: '1px solid var(--border)',
            borderRadius: '8px', padding: '7px 12px', fontSize: '12px', fontWeight: '700',
            color: copied ? '#15803d' : 'var(--text-main)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px',
            transition: 'all 0.2s'
          }}>
            {copied ? <><Check size={14} /> Copied</> : <><Copy size={14} /> Copy</>}
          </button>
        </div>

        <button
          onClick={() => {
            if (saveSession && creationAuthData) {
              saveSession({
                token: creationAuthData.token,
                refreshToken: creationAuthData.refreshToken,
                user: creationAuthData.user,
                loginMethod: "abha"
              });
            }
            onFinish();
          }}
          style={{
            width: '100%', padding: '14px 20px', background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
            color: '#fff', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: '700',
            cursor: 'pointer', boxShadow: '0 4px 14px rgba(46,102,110,0.3)', transition: 'all 0.25s'
          }}
        >
          Go to ABHA Hub →
        </button>
      </div>
    );
  }

  return (
    <div style={{ animation: 'fadeIn 0.35s ease-in-out' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
        <button onClick={onBack} style={{
          background: 'var(--bg-app)', border: '1px solid var(--border)', cursor: 'pointer',
          color: 'var(--text-main)', width: '32px', height: '32px', borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', flexShrink: 0
        }}>
          <ArrowLeft size={16} />
        </button>
        <div>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '10.5px',
            fontWeight: '700', color: 'var(--primary)', letterSpacing: '0.05em', textTransform: 'uppercase'
          }}>
            {step === 'abha_create_1' && <><FileText size={12} /> STEP 1 OF 3 • AADHAAR</>}
            {step === 'abha_create_2' && <><KeyRound size={12} /> STEP 2 OF 3 • VERIFICATION</>}
            {step === 'abha_create_3' && <><User size={12} /> STEP 3 OF 3 • DETAILS</>}
          </span>
          <h3 style={{ fontSize: '19px', fontWeight: '800', color: 'var(--text-main)', margin: 0, letterSpacing: '-0.02em' }}>
            {step === 'abha_create_1' ? 'Enter Aadhaar Number' : step === 'abha_create_2' ? 'Verify OTP & Mobile' : 'Confirm Personal Details'}
          </h3>
        </div>
      </div>

      <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '18px', lineHeight: '1.5' }}>
        {step === 'abha_create_1' ? 'Enter your 12-digit Aadhaar number to initiate instant ABHA registration.'
          : step === 'abha_create_2' ? 'Enter your 10-digit mobile number and the 6-digit OTP sent to your phone.'
            : 'Review your details retrieved from Aadhaar to finalize your ABHA account.'}
      </p>

      {err && (
        <div style={{
          background: '#fef2f2', color: '#dc2626', padding: '10px 12px', borderRadius: '10px',
          fontSize: '12.5px', fontWeight: '500', marginBottom: '16px', border: '1px solid #fecaca',
          display: 'flex', alignItems: 'center', gap: '8px'
        }}>
          <X size={15} style={{ flexShrink: 0 }} />
          {err}
        </div>
      )}

      {/* STEP 1: Aadhaar Input */}
      {step === 'abha_create_1' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '20px' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label style={{ fontSize: '12.5px', fontWeight: '700', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FileText size={14} color="var(--primary)" /> 12-Digit Aadhaar Number
              </label>
              {isAadhaarValid && (
                <span style={{ fontSize: '11.5px', fontWeight: '700', color: '#16a34a', display: 'flex', alignItems: 'center', gap: '4px', background: '#dcfce7', padding: '1px 7px', borderRadius: '10px' }}>
                  <CheckCircle2 size={12} /> Valid
                </span>
              )}
            </div>

            <input
              className="input-field"
              autoFocus
              type="text"
              inputMode="numeric"
              placeholder="XXXX XXXX XXXX"
              value={aadhaar}
              onChange={e => setAadhaar(fmtAadhaar(e.target.value))}
              maxLength={14}
              style={{
                padding: '12px 14px', fontSize: '18px', letterSpacing: '0.12em',
                fontFamily: 'monospace', borderRadius: '10px', background: '#fff',
                border: isAadhaarValid ? '1.5px solid #16a34a' : '1.5px solid var(--border)',
                width: '100%', color: 'var(--text-main)', outline: 'none'
              }}
            />

            <p style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '6px', marginBottom: 0 }}>
              🔒 An authentication OTP will be dispatched to your Aadhaar-registered mobile.
            </p>
          </div>

          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px',
            background: 'var(--primary-light)', borderRadius: '10px', border: '1px solid var(--primary-soft)'
          }}>
            <ShieldCheck size={16} color="var(--primary)" style={{ flexShrink: 0 }} />
            <span style={{ fontSize: '11.5px', color: 'var(--primary-dark)', lineHeight: '1.4' }}>
              Protected by <strong>UIDAI & NHA 256-bit Encryption</strong>. Per ABDM consent guidelines.
            </span>
          </div>
        </div>
      )}

      {/* STEP 2: Mobile + OTP Input */}
      {step === 'abha_create_2' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '20px' }}>
          {/* Mobile Field */}
          <div>
            <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: 'var(--text-main)', marginBottom: '6px' }}>
              Mobile Number
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <div style={{
                position: 'absolute', left: '0', top: '0', bottom: '0',
                display: 'flex', alignItems: 'center', padding: '0 12px',
                borderRight: '1.5px solid var(--border)', color: 'var(--text-main)',
                fontWeight: '700', fontSize: '14px', gap: '4px', pointerEvents: 'none', zIndex: 2
              }}>
                🇮🇳 <span>+91</span>
              </div>
              <input
                className="input-field"
                type="tel"
                placeholder="10-digit mobile number"
                value={mobile}
                onChange={e => setMobile(e.target.value.replace(/[^\d*]/g, ""))}
                maxLength={10}
                style={{
                  paddingLeft: '84px', padding: '12px 14px 12px 84px',
                  fontSize: '15px', borderRadius: '10px', background: '#fff',
                  border: '1.5px solid var(--border)', width: '100%', letterSpacing: mobile ? '0.04em' : '0'
                }}
              />
            </div>
          </div>

          {/* OTP Field */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label style={{ fontSize: '12.5px', fontWeight: '700', color: 'var(--text-main)' }}>
                Enter 6-Digit OTP
              </label>
              <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>Sent via SMS</span>
            </div>

            <OtpInputGrid value={otp} onChange={setOtp} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
              <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>Didn't receive OTP?</span>
              <button
                onClick={() => setOtp('')}
                style={{ color: 'var(--primary)', fontWeight: '700', fontSize: '12px', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                Resend OTP
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: Personal Details Confirmation */}
      {step === 'abha_create_3' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
          <div style={{
            background: 'var(--primary-light)', border: '1px solid var(--primary-soft)',
            borderRadius: '10px', padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '8px'
          }}>
            <Sparkles size={14} color="var(--primary)" style={{ flexShrink: 0 }} />
            <span style={{ fontSize: '11.5px', color: 'var(--primary-dark)', fontWeight: '600' }}>
              Details automatically retrieved from Aadhaar database. Please confirm below.
            </span>
          </div>

          {/* Row 1: Full Name & Mobile */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '700', color: 'var(--text-main)', marginBottom: '3px' }}>Full Name</label>
              <input className="input-field" type="text" placeholder="Enter full name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                style={{ padding: '8px 12px', borderRadius: '10px', background: '#fff', fontSize: '13px', width: '100%', border: '1.5px solid var(--border)', height: '38px' }} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '700', color: 'var(--text-main)', marginBottom: '3px' }}>Mobile Number</label>
              <input className="input-field" type="tel" placeholder="10-digit mobile" value={form.mobile} onChange={e => setForm(f => ({ ...f, mobile: e.target.value }))}
                style={{ padding: '8px 12px', borderRadius: '10px', background: '#fff', fontSize: '13px', width: '100%', border: '1.5px solid var(--border)', height: '38px' }} />
            </div>
          </div>

          {/* Row 2: Date of Birth & Gender */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '700', color: 'var(--text-main)', marginBottom: '3px' }}>Date of Birth</label>
              <DobPicker
                value={form.dob}
                onChange={val => setForm(f => ({ ...f, dob: val }))}
                compact={true}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '700', color: 'var(--text-main)', marginBottom: '3px' }}>Gender</label>
              <select className="input-field" value={form.gender} onChange={e => setForm(f => ({ ...f, gender: e.target.value }))}
                style={{ padding: '8px 12px', borderRadius: '10px', background: '#fff', fontSize: '13px', width: '100%', border: '1.5px solid var(--border)', height: '38px' }}>
                <option>Male</option><option>Female</option><option>Other</option>
              </select>
            </div>
          </div>

          {/* Row 3: Address */}
          <div>
            <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '700', color: 'var(--text-main)', marginBottom: '3px' }}>Address</label>
            <input className="input-field" type="text" placeholder="Your residential address" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
              style={{ padding: '8px 12px', borderRadius: '10px', background: '#fff', fontSize: '13px', width: '100%', border: '1.5px solid var(--border)', height: '38px' }} />
          </div>
        </div>
      )}

      {/* Main CTA Button */}
      <button
        disabled={busy || (step === 'abha_create_1' && !isAadhaarValid)}
        onClick={step === 'abha_create_1' ? handleStep1 : step === 'abha_create_2' ? handleStep2 : handleStep3}
        style={{
          width: '100%', padding: '14px 18px',
          background: busy || (step === 'abha_create_1' && !isAadhaarValid) ? 'var(--border)' : 'linear-gradient(135deg, #f97316, #ea580c)',
          color: busy || (step === 'abha_create_1' && !isAadhaarValid) ? 'var(--text-muted)' : '#fff',
          border: 'none', borderRadius: '12px', fontSize: '14.5px', fontWeight: '700',
          cursor: busy || (step === 'abha_create_1' && !isAadhaarValid) ? 'not-allowed' : 'pointer',
          transition: 'all 0.25s', boxShadow: busy || (step === 'abha_create_1' && !isAadhaarValid) ? 'none' : '0 4px 16px rgba(234,88,12,0.32)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
        }}
      >
        {busy ? 'Please wait...' : step === 'abha_create_1' ? 'Send OTP →' : step === 'abha_create_2' ? 'Verify OTP & Proceed →' : <><UserPlus size={17} /> Complete & Create ABHA</>}
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

function DobPicker({ value, onChange, error, compact = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(value ? new Date(value) : new Date(new Date().setFullYear(new Date().getFullYear() - 18)));

  const [view, setView] = useState('days'); // 'days', 'months', 'years'

  const popoverRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const formatValue = (dateStr) => {
    if (!dateStr) return '';
    const [y, m, d] = dateStr.split('-');
    return `${d} / ${m} / ${y}`;
  };

  const handleSelectDate = (day) => {
    const y = currentMonth.getFullYear();
    const m = String(currentMonth.getMonth() + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    onChange(`${y}-${m}-${d}`);
    setIsOpen(false);
  };

  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const renderDaysView = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);

    const days = [];
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} style={{ width: '14.28%', padding: '8px 0' }}></div>);
    }

    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      const isSelected = value === dateStr;

      const future = new Date(year, month, i) > new Date();

      days.push(
        <div key={i} style={{ width: '14.28%', padding: '4px' }}>
          <button
            disabled={future}
            onClick={(e) => { e.preventDefault(); handleSelectDate(i); }}
            style={{
              width: '100%', height: '32px', border: 'none', borderRadius: '8px',
              background: isSelected ? 'var(--primary)' : 'transparent',
              color: isSelected ? '#fff' : future ? '#d1d5db' : 'var(--text-main)',
              fontWeight: isSelected ? '700' : '500', fontSize: '13px',
              cursor: future ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.2s'
            }}
            onMouseEnter={e => { if (!isSelected && !future) { e.currentTarget.style.background = 'var(--bg-app)'; } }}
            onMouseLeave={e => { if (!isSelected && !future) { e.currentTarget.style.background = 'transparent'; } }}
          >
            {i}
          </button>
        </div>
      );
    }

    const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

    return (
      <>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', padding: '0 8px' }}>
          <button onClick={(e) => { e.preventDefault(); setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)); }} style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', color: 'var(--text-main)' }}><ChevronLeft size={20} /></button>

          <button onClick={(e) => { e.preventDefault(); setView('months'); }} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '15px', fontWeight: '700', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            {currentMonth.toLocaleString('default', { month: 'long' })} {currentMonth.getFullYear()}
          </button>

          <button onClick={(e) => { e.preventDefault(); setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)); }} style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', color: 'var(--text-main)' }}><ChevronRight size={20} /></button>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', marginBottom: '8px', padding: '0 4px' }}>
          {weekDays.map(wd => (
            <div key={wd} style={{ width: '14.28%', textAlign: 'center', fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '8px' }}>{wd}</div>
          ))}
          {days}
        </div>
      </>
    );
  };

  const renderMonthsView = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return (
      <>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '16px' }}>
          <button onClick={(e) => { e.preventDefault(); setView('years'); }} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '16px', fontWeight: '700', color: 'var(--text-main)' }}>
            {currentMonth.getFullYear()}
          </button>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', padding: '0 8px' }}>
          {months.map((m, idx) => {
            const isSelected = currentMonth.getMonth() === idx;
            return (
              <button
                key={m}
                onClick={(e) => { e.preventDefault(); setCurrentMonth(new Date(currentMonth.getFullYear(), idx, 1)); setView('days'); }}
                style={{
                  width: 'calc(33.33% - 6px)', padding: '12px 0', border: 'none', borderRadius: '8px',
                  background: isSelected ? 'var(--primary)' : 'var(--bg-app)',
                  color: isSelected ? '#fff' : 'var(--text-main)',
                  fontWeight: isSelected ? '700' : '600', fontSize: '14px', cursor: 'pointer'
                }}
              >
                {m}
              </button>
            )
          })}
        </div>
      </>
    );
  };

  const renderYearsView = () => {
    const currentYear = currentMonth.getFullYear();
    const startYear = Math.floor(currentYear / 12) * 12;
    const years = Array.from({ length: 12 }, (_, i) => startYear + i);

    return (
      <>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', padding: '0 8px' }}>
          <button onClick={(e) => { e.preventDefault(); setCurrentMonth(new Date(startYear - 12, 0, 1)); }} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-main)' }}><ChevronLeft size={20} /></button>
          <span style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-main)' }}>{startYear} - {startYear + 11}</span>
          <button onClick={(e) => { e.preventDefault(); setCurrentMonth(new Date(startYear + 12, 0, 1)); }} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-main)' }}><ChevronRight size={20} /></button>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', padding: '0 8px' }}>
          {years.map(y => {
            const isSelected = currentYear === y;
            const isFuture = y > new Date().getFullYear();
            return (
              <button
                key={y}
                disabled={isFuture}
                onClick={(e) => { e.preventDefault(); setCurrentMonth(new Date(y, currentMonth.getMonth(), 1)); setView('months'); }}
                style={{
                  width: 'calc(33.33% - 6px)', padding: '12px 0', border: 'none', borderRadius: '8px',
                  background: isSelected ? 'var(--primary)' : 'var(--bg-app)',
                  color: isSelected ? '#fff' : isFuture ? '#d1d5db' : 'var(--text-main)',
                  fontWeight: isSelected ? '700' : '600', fontSize: '14px', cursor: isFuture ? 'not-allowed' : 'pointer'
                }}
              >
                {y}
              </button>
            )
          })}
        </div>
      </>
    );
  };

  return (
    <div style={{ position: 'relative' }} ref={popoverRef}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex', alignItems: 'center',
          padding: compact ? '8px 12px' : '14px 16px',
          height: compact ? '38px' : 'auto',
          borderRadius: compact ? '10px' : '12px',
          background: compact ? '#fff' : 'var(--bg-app)',
          fontSize: compact ? '13px' : '15px', width: '100%',
          border: error ? '1.5px solid var(--danger)' : isOpen ? '1.5px solid var(--primary)' : '1.5px solid var(--border)',
          color: value ? 'var(--text-main)' : 'var(--text-muted)',
          cursor: 'pointer', fontWeight: value ? '600' : '500',
          fontFamily: value ? 'monospace' : 'inherit', letterSpacing: value ? '0.04em' : 'normal',
          transition: 'all 0.2s', boxShadow: isOpen ? '0 0 0 4px rgba(46,102,110,0.1)' : 'none'
        }}
      >
        <CalendarIcon size={18} style={{ marginRight: '12px', color: isOpen ? 'var(--primary)' : 'var(--text-muted)' }} />
        {value ? formatValue(value) : "Select Date of Birth"}
      </div>

      {isOpen && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)',
          left: compact ? '-15px' : '0', width: '270px',
          background: '#fff', borderRadius: '14px', padding: '12px',
          boxShadow: '0 16px 36px -6px rgba(0,0,0,0.22), 0 0 0 1px rgba(0,0,0,0.06)',
          zIndex: 999, animation: 'fadeInUp 0.18s ease-out'
        }}>
          {view === 'days' && renderDaysView()}
          {view === 'months' && renderMonthsView()}
          {view === 'years' && renderYearsView()}
        </div>
      )}
    </div>
  );
}
