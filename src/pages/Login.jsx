import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ArrowLeft, Phone, ChevronRight } from "lucide-react";
import { sendOtp, verifyOtp } from "../services/authService";

/* ════════════════════════════════════════════
   LOGIN — Premium 50/50 Split Screen Design
   ════════════════════════════════════════════ */

export default function Login() {
  const [screen, setScreen] = useState("landing");
  const [phone, setPhone] = useState("");
  const [isAbhaFlow, setIsAbhaFlow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const go = useNavigate();

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
      go("/"); window.location.reload();
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
    <div className="split-page">
      {/* ── Left Visual Panel ── */}
      <div className="split-visual">
        <div className="split-visual-bg">
          <div className="split-orb split-orb-1" />
          <div className="split-orb split-orb-2" />
          <div className="split-orb split-orb-3" />
          <div className="split-glass" />
        </div>
        
        <div className="split-visual-content">
          <img src="/logo.png" alt="Arvaya" className="split-visual-logo" />
          <h1 className="split-visual-title">Healthcare<br/>reimagined.</h1>
          <p className="split-visual-sub">
            Experience a new standard of care with Arvaya's seamless patient portal. Connect with specialists and manage your health journey in one place.
          </p>
        </div>
      </div>

      {/* ── Right Form Panel ── */}
      <div className="split-form-panel">
        <div className="split-form-inner">
          <div className="split-form-header">
            <img src="/logo.png" alt="Arvaya" className="split-mobile-logo" />
          </div>
          
          <div className="split-card-content">
            {card}
          </div>
          
          <p className="split-footer">&copy; {new Date().getFullYear()} Arvaya Healthcare. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}

/* ── LANDING ── */
function Landing({ onAbha, onMobile }) {
  return (
    <>
      <h2 className="split-heading">Sign in</h2>
      <p className="split-sub">Welcome back! Please enter your details.</p>

      <div className="split-options">
        <button className="split-opt split-opt--primary" onClick={onMobile}>
          <Phone size={18} />
          <span className="split-opt-text">Continue with Mobile Number</span>
        </button>

        <div className="split-or"><span>or</span></div>

        <button className="split-opt" onClick={onAbha}>
          <span className="split-opt-icon split-opt-icon--abha">
            <img src="/abha.svg" alt="ABHA" onError={e => { e.target.style.display = "none"; }} />
          </span>
          <span className="split-opt-text">Continue with ABHA</span>
          <ChevronRight size={18} className="split-opt-arrow" />
        </button>
      </div>
    </>
  );
}

/* ── MOBILE ── */
function Mobile({ onBack, onSend, busy, err }) {
  const [ph, setPh] = useState("");
  const ok = ph.replace(/\D/g, "").length === 10;

  return (
    <>
      <button className="split-back" onClick={onBack}><ArrowLeft size={16} /> Back</button>
      <h2 className="split-heading">Mobile verification</h2>
      <p className="split-sub">We'll send a one-time verification code</p>

      <form className="split-form" onSubmit={e => { e.preventDefault(); if (ok) onSend(ph.replace(/\D/g, "")); }}>
        <label className="split-label">Mobile number</label>
        <div className="split-phone">
          <span className="split-phone-pre">+91</span>
          <input type="tel" value={ph} onChange={e => setPh(e.target.value)} placeholder="98765 43210" maxLength={10} autoFocus />
        </div>
        {err && <div className="split-error">{err}</div>}
        <button type="submit" className="split-submit" disabled={!ok || busy}>{busy ? "Sending OTP..." : "Continue"}</button>
        <p className="split-fine">By continuing, you agree to our <a href="#">Terms</a> &amp; <a href="#">Privacy Policy</a></p>
      </form>
    </>
  );
}

/* ── ABHA ── */
function Abha({ onBack, onSend, busy, err }) {
  const [ph, setPh] = useState("");
  const ok = ph.replace(/\D/g, "").length === 10;

  return (
    <>
      <button className="split-back" onClick={onBack}><ArrowLeft size={16} /> Back</button>
      <h2 className="split-heading">Link your ABHA</h2>
      <p className="split-sub">Enter the mobile number linked to your Aadhaar</p>

      <Stepper step={0} />

      <form className="split-form" onSubmit={e => { e.preventDefault(); if (ok) onSend(ph.replace(/\D/g, "")); }}>
        <label className="split-label">ABHA-linked mobile number</label>
        <div className="split-phone">
          <span className="split-phone-pre">+91</span>
          <input type="tel" value={ph} onChange={e => setPh(e.target.value)} placeholder="98765 43210" maxLength={10} autoFocus />
        </div>
        <p className="split-abha-cta">
          Don't have ABHA?{" "}
          <a href="https://abha.abdm.gov.in/abha/v3/" target="_blank" rel="noreferrer">Create one &rarr;</a>
        </p>
        {err && <div className="split-error">{err}</div>}
        <button type="submit" className="split-submit" disabled={!ok || busy}>{busy ? "Sending..." : "Send OTP"}</button>
      </form>
    </>
  );
}

/* ── OTP ── */
function Otp({ phone, onBack, onVerify, busy, err, isAbha }) {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const set = (i, v) => { if (/^\d?$/.test(v)) { const u = [...otp]; u[i] = v; setOtp(u); if (v && i < 5) document.getElementById(`otp-${i+1}`)?.focus(); } };
  const key = (i, e) => { if (e.key === "Backspace" && !otp[i] && i > 0) document.getElementById(`otp-${i-1}`)?.focus(); };
  const full = otp.join(""); const ok = full.length === 6;

  return (
    <>
      <button className="split-back" onClick={onBack}><ArrowLeft size={16} /> Back</button>
      <h2 className="split-heading">Verify OTP</h2>
      <p className="split-sub">Sent to <b>+91 {phone.slice(0,3)}****{phone.slice(7)}</b></p>
      {isAbha && <Stepper step={1} />}

      <form className="split-form" onSubmit={e => { e.preventDefault(); if (ok) onVerify(full); }}>
        <div className="split-otp">
          {otp.map((d, i) => (
            <input key={i} id={`otp-${i}`} className={d ? "filled" : ""} type="text" inputMode="numeric" maxLength={1} value={d} onChange={e => set(i, e.target.value)} onKeyDown={e => key(i, e)} autoFocus={i === 0} />
          ))}
        </div>
        <p className="split-resend">Didn't receive it? <button type="button">Resend OTP</button></p>
        {err && <div className="split-error">{err}</div>}
        <button type="submit" className="split-submit" disabled={!ok || busy}>{busy ? "Verifying..." : "Verify & Sign in"}</button>
      </form>
    </>
  );
}

/* ── Stepper ── */
function Stepper({ step }) {
  return (
    <div className="split-stepper">
      {["Mobile Number", "Verify OTP", "Select Address"].map((l, i) => (
        <div key={i} className={`split-step ${i <= step ? "active" : ""} ${i < step ? "done" : ""}`}>
          <div className="split-step-num">{i < step ? "✓" : i + 1}</div>
          <span>{l}</span>
          {i < 2 && <div className="split-step-bar" />}
        </div>
      ))}
    </div>
  );
}
