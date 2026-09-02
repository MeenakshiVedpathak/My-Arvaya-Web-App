import React, { useState, useEffect, useRef } from "react";
import { ArrowLeft, CheckCircle2, X, ArrowRight, RefreshCcw, Phone, ShieldCheck } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import { abhaSendOtp, abhaVerifyOtp, abhaConfirmAddress, abhaGetSuggestions } from "../../../services/abhaService";
import { Overlay, SplitModalShell } from "./SharedComponents";

function ErrorBox({ msg }) {
  return !msg ? null : (
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
    <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-start', marginBottom: '8px' }} onPaste={handlePaste}>
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
            transition: 'all 0.2s', cursor: 'text', fontFamily: 'var(--font-sans)'
          }}
        />
      ))}
    </div>
  );
}

function AbhaLeftPane({ step }) {
  const steps = ["Mobile Number", "Verify OTP", "Select Address"];
  return (
    <div style={{
      flex: '1', background: 'linear-gradient(150deg, var(--primary) 0%, var(--primary-dark) 100%)',
      padding: '48px 40px', display: 'flex', flexDirection: 'column',
      borderRight: '1px solid var(--border)', position: 'relative', overflow: 'hidden'
    }}>
      <div style={{ position: 'absolute', right: '-40px', top: '-40px', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
      <div style={{ position: 'absolute', left: '-60px', bottom: '-60px', width: '260px', height: '260px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />

      <div style={{ position: 'relative', zIndex: 2, marginBottom: '52px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: '12px', padding: '10px', backdropFilter: 'blur(8px)' }}>
            <RefreshCcw size={32} color="white" />
          </div>
          <div>
            <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Switch</div>
            <div style={{ color: '#fff', fontSize: '18px', fontWeight: '800', letterSpacing: '-0.01em' }}>ABHA Profile</div>
          </div>
        </div>
      </div>

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
                      {stepNum === 1 ? 'Enter linked mobile number' : stepNum === 2 ? 'Verify 6-digit OTP' : 'Choose ABHA address'}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

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

export function SwitchProfileModal({ onClose }) {
  const { saveSession, showToast } = useAuth();
  const [step, setStep]           = useState(1);
  const [mobile, setMobile]       = useState("");
  const [otp, setOtp]             = useState("");
  const [txnId, setTxnId]         = useState("");
  const [addresses, setAddresses] = useState([]);
  const [selected, setSelected]   = useState("");
  const [busy, setBusy]           = useState(false);
  const [err, setErr]             = useState("");
  const [countdown, setCountdown] = useState(120);
  const [canResend, setCanResend] = useState(false);

  const TOTAL_STEPS = 3;

  useEffect(() => {
    if (countdown <= 0) { setCanResend(true); return; }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const mins = String(Math.floor(countdown / 60)).padStart(2, '0');
  const secs = String(countdown % 60).padStart(2, '0');

  const handleSendOtp = async () => {
    if (mobile.length < 10) {
      const msg = "Enter a valid 10-digit mobile number.";
      setErr(msg);
      if (showToast) showToast(msg, "error");
      return;
    }
    setErr(""); setBusy(true);
    try {
      const res = await abhaSendOtp(mobile);
      setTxnId(res?.transactionId || res?.txnId || "mock_txn_" + Date.now());
      setOtp(""); setCountdown(120); setCanResend(false);
      if (showToast) showToast("OTP sent successfully", "success");
      setStep(2);
    } catch (e) {
      const msg = e.message || "Failed to send OTP.";
      setErr(msg);
      if (showToast) showToast(msg, "error");
    }
    finally { setBusy(false); }
  };

  const handleVerifyOtp = async () => {
    if (otp.length < 6) {
      const msg = "Enter the 6-digit OTP.";
      setErr(msg);
      if (showToast) showToast(msg, "error");
      return;
    }
    setErr(""); setBusy(true);
    try {
      const res = await abhaVerifyOtp(otp, txnId);
      const newTxn = res?.transactionId || res?.txnId || txnId;
      setTxnId(newTxn);
      const addrRes = await abhaGetSuggestions(newTxn, {}).catch(() => null);
      const list = addrRes?.abhaAddressList || addrRes?.addresses || [
        { address: `91${mobile}@sbx`, isPrimary: true },
      ];
      setAddresses(list);
      setSelected(list[0]?.address || "");
      if (showToast) showToast("OTP verified successfully", "success");
      setStep(3);
    } catch (e) {
      const msg = e.message || "Invalid OTP.";
      setErr(msg);
      if (showToast) showToast(msg, "error");
    }
    finally { setBusy(false); }
  };

  const handleConfirm = async () => {
    if (!selected) { setErr("Please select an ABHA address."); return; }
    setErr(""); setBusy(true);
    try {
      const res = await abhaConfirmAddress(selected, "", txnId);
      saveSession({ token: res?.token || "mock_abha_token_" + Date.now(), user: res?.user || { name: "ABHA User" } });
      setStep(4);
    } catch (e) { setErr(e.message || "Could not switch profile."); }
    finally { setBusy(false); }
  };

  const handleResend = () => {
    setOtp("");
    setCountdown(120);
    setCanResend(false);
    handleSendOtp();
  };

  const leftPanel = <AbhaLeftPane step={step} />;

  const rightPanel = (() => {
    if (step === 1) return (
      <div style={{ animation: 'fadeIn 0.3s ease-in-out', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
          <button onClick={() => { setStep(1); setErr(""); }} style={{ background: 'var(--bg-app)', border: 'none', cursor: 'pointer', color: 'var(--text-main)', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', flexShrink: 0 }}>
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
              <span>+91</span>
            </div>
            <input
              autoFocus
              type="tel"
              placeholder="10-digit mobile number"
              value={mobile}
              onChange={e => setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))}
              maxLength={10}
              onKeyDown={e => e.key === "Enter" && handleSendOtp()}
              style={{ paddingLeft: '88px', padding: '15px 16px 15px 88px', fontSize: '16px', borderRadius: '12px', background: 'var(--bg-app)', letterSpacing: mobile ? '0.06em' : '0', border: '1.5px solid var(--border)', outline: 'none', width: '100%', color: 'var(--text-main)', fontWeight: '500', fontFamily: 'var(--font-sans)' }}
            />
          </div>
        </div>

        <button
          disabled={busy || mobile.length < 10}
          onClick={handleSendOtp}
          style={{
            width: '100%', background: busy || mobile.length < 10 ? 'var(--border)' : 'var(--accent)',
            color: busy || mobile.length < 10 ? 'var(--text-muted)' : '#fff', border: 'none', padding: '16px',
            borderRadius: '12px', fontSize: '15px', fontWeight: '700',
            cursor: busy || mobile.length < 10 ? 'not-allowed' : 'pointer', transition: 'all 0.25s',
            boxShadow: busy || mobile.length < 10 ? 'none' : '0 4px 16px rgba(251,145,63,0.38)',
            letterSpacing: '0.01em'
          }}
        >
          {busy ? "Sending OTP..." : "Send OTP"}
        </button>
      </div>
    );

    if (step === 2) return (
      <div style={{ animation: 'fadeIn 0.3s ease-in-out', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
          <button onClick={() => { setStep(1); setErr(""); }} style={{ background: 'var(--bg-app)', border: 'none', cursor: 'pointer', color: 'var(--text-main)', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
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
          <OtpInputGrid value={otp} onChange={setOtp} />
        </div>

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

        <div style={{ marginTop: 'auto' }}>
          <button
            disabled={busy || otp.length < 6}
            onClick={handleVerifyOtp}
            style={{
              width: '100%', background: busy || otp.length < 6 ? 'var(--border)' : 'var(--accent)',
              color: busy || otp.length < 6 ? 'var(--text-muted)' : '#fff', border: 'none', padding: '16px',
              borderRadius: '12px', fontSize: '15px', fontWeight: '700',
              cursor: busy || otp.length < 6 ? 'not-allowed' : 'pointer', transition: 'all 0.25s',
              boxShadow: busy || otp.length < 6 ? 'none' : '0 4px 16px rgba(251,145,63,0.38)'
            }}
          >
            {busy ? "Verifying..." : "Verify OTP"}
          </button>
        </div>
      </div>
    );

    if (step === 3) return (
      <div style={{ animation: 'fadeIn 0.3s ease-in-out', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
          <button onClick={() => { setStep(2); setErr(""); }} style={{ background: 'var(--bg-app)', border: 'none', cursor: 'pointer', color: 'var(--text-main)', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
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

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-main)', marginBottom: '10px' }}>
            ABHA Address
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {addresses.length > 0 ? addresses.map((addr, i) => {
              const addrVal = addr.abhaAddress || addr.address || addr.id || (typeof addr === 'string' ? addr : '');
              const isSelected = selected === addrVal;
              return (
                <button
                  key={i}
                  onClick={() => setSelected(addrVal)}
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

        <div style={{ marginTop: 'auto' }}>
          <button
            disabled={busy || !selected}
            onClick={handleConfirm}
            style={{
              width: '100%', background: busy || !selected ? 'var(--border)' : 'var(--primary)',
              color: busy || !selected ? 'var(--text-muted)' : '#fff', border: 'none', padding: '16px',
              borderRadius: '12px', fontSize: '15px', fontWeight: '700',
              cursor: busy || !selected ? 'not-allowed' : 'pointer', transition: 'all 0.25s',
              boxShadow: busy || !selected ? 'none' : '0 4px 16px rgba(46,102,110,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
            }}
          >
            {busy ? "Switching…" : "Confirm & Switch"} <ArrowRight size={18} />
          </button>
        </div>
      </div>
    );

    if (step === 4) return (
      <div style={{ textAlign: 'center', padding: '20px 0', animation: 'fadeIn 0.35s var(--ease-out)', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ width: '88px', height: '88px', borderRadius: '50%', background: 'var(--success-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 28px', boxShadow: '0 0 0 14px rgba(22,163,74,0.06)' }}>
          <CheckCircle2 size={44} color="var(--success)" strokeWidth={2} />
        </div>
        <h3 style={{ fontSize: '26px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '12px', fontFamily: 'var(--font-display)' }}>All done!</h3>
        <p style={{ fontSize: '15px', color: 'var(--text-muted)', marginBottom: '40px', lineHeight: 1.6, maxWidth: '280px', margin: '0 auto 40px' }}>
          Your profile has been switched successfully. You're now logged in with your new ABHA address.
        </p>
        <button onClick={onClose} style={{
          width: '100%', padding: '16px', background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 14px rgba(46,102,110,0.28)'
        }}
        onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.1)'} onMouseLeave={e => e.currentTarget.style.filter = 'none'}>
          Back to Dashboard
        </button>
      </div>
    );
    return null;
  })();

  return (
    <Overlay onClose={onClose}>
      <div style={{
        background: '#fff', borderRadius: '24px', width: '100%', maxWidth: '860px',
        display: 'flex', overflow: 'hidden', position: 'relative',
        boxShadow: '0 25px 60px -12px rgba(0,0,0,0.35)', minHeight: '400px', maxHeight: '90vh'
      }}>
        <button
          onClick={onClose}
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
        {leftPanel}
        <div style={{
          flex: 1, padding: '48px 40px', display: 'flex', flexDirection: 'column',
          justifyContent: 'center', background: '#fff', minWidth: '360px', overflowY: 'auto'
        }}>
          {rightPanel}
        </div>
      </div>
    </Overlay>
  );
}
