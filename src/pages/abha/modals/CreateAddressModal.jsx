import React, { useState } from "react";
import { CheckCircle2, X, ArrowRight, UserPlus } from "lucide-react";
import { Overlay } from "./SharedComponents";

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

export function CreateAddressModal({ abhaData, onClose }) {
  const [prefix, setPrefix]       = useState("");
  const [busy, setBusy]           = useState(false);
  const [err, setErr]             = useState("");
  const [created, setCreated]     = useState("");

  const suggestions = [
    `${abhaData.name.split(" ")[0].toLowerCase()}2@abdm`,
    `${abhaData.name.split(" ").join(".").toLowerCase()}2@abdm`,
    `health.${abhaData.name.split(" ")[0].toLowerCase()}@abdm`,
  ];

  const handleCreate = async () => {
    if (!prefix.trim()) { setErr("Please enter a valid ABHA address prefix."); return; }
    if (prefix.length < 4) { setErr("ABHA address must be at least 4 characters."); return; }
    if (!/^[a-zA-Z0-9._]+$/.test(prefix)) { setErr("Only letters, numbers, dots and underscores allowed."); return; }
    setErr(""); setBusy(true);
    await new Promise(r => setTimeout(r, 800));
    setCreated(`${prefix.toLowerCase()}@abdm`);
    setBusy(false);
  };

  if (created) {
    return (
      <Overlay onClose={onClose}>
        <div style={{
          background: '#fff', borderRadius: '24px', width: '100%', maxWidth: '440px',
          boxShadow: '0 25px 60px -12px rgba(0,0,0,0.35)', overflow: 'hidden',
          display: 'flex', flexDirection: 'column', maxHeight: '90vh', fontFamily: 'var(--font-sans)'
        }}>
          <div style={{ padding: '24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: 'var(--text-main)', letterSpacing: '-0.01em' }}>Create New Address</h2>
            <button onClick={onClose} style={{ background: 'var(--bg-app)', border: '1px solid var(--border)', width: '30px', height: '30px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
              <X size={14} color="var(--text-muted)" />
            </button>
          </div>
          <div style={{ padding: '32px 24px', textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', animation: 'fadeIn 0.3s ease-in-out' }}>
            <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'var(--success-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 0 0 12px rgba(22,163,74,0.06)' }}>
              <CheckCircle2 size={36} color="var(--success)" strokeWidth={2} />
            </div>
            <h3 style={{ fontSize: '22px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '8px', letterSpacing: '-0.01em' }}>Address Created!</h3>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '24px', lineHeight: 1.5 }}>Your new ABHA address has been created.</p>
            <div style={{ background: 'var(--primary-light)', border: '1.5px solid var(--primary-soft)', borderRadius: '12px', padding: '16px 20px', fontFamily: 'monospace', fontSize: '15px', fontWeight: '700', color: 'var(--primary-dark)', marginBottom: '28px', letterSpacing: '0.02em', width: '100%', textAlign: 'center' }}>
              {created}
            </div>
            <button onClick={onClose} style={{
              width: '100%', padding: '14px', background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 14px rgba(46,102,110,0.28)'
            }}
            onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.1)'} onMouseLeave={e => e.currentTarget.style.filter = 'none'}>
              Done
            </button>
          </div>
        </div>
      </Overlay>
    );
  }

  return (
    <Overlay onClose={onClose}>
      <div style={{
        background: '#fff', borderRadius: '24px', width: '100%', maxWidth: '440px',
        boxShadow: '0 25px 60px -12px rgba(0,0,0,0.35)', overflow: 'hidden',
        display: 'flex', flexDirection: 'column', maxHeight: '90vh', fontFamily: 'var(--font-sans)'
      }}>
        <div style={{ padding: '24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <UserPlus size={16} color="var(--primary)" />
            </div>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: 'var(--text-main)', letterSpacing: '-0.01em' }}>Create New Address</h2>
          </div>
          <button onClick={onClose} style={{ background: 'var(--bg-app)', border: '1px solid var(--border)', width: '30px', height: '30px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, transition: 'all 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--border)'} onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-app)'}>
            <X size={14} color="var(--text-muted)" />
          </button>
        </div>

        <div style={{ padding: '24px', overflowY: 'auto', flex: 1, animation: 'fadeIn 0.3s ease-in-out' }}>
          {err && <ErrorBox msg={err} />}

          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px', lineHeight: 1.5 }}>
            Create a new ABHA address to organize your health records.
          </p>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px' }}>
              Suggestions
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {suggestions.map(s => (
                <button key={s} onClick={() => setPrefix(s.replace("@abdm", ""))} style={{
                  padding: '8px 14px', border: '1px solid var(--border)', borderRadius: '10px',
                  background: 'var(--bg-app)', fontSize: '13px', fontFamily: 'monospace', color: 'var(--text-main)', cursor: 'pointer', transition: 'all 0.2s', fontWeight: '500'
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.color = 'var(--primary-dark)'; e.currentTarget.style.background = 'var(--primary-light)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-main)'; e.currentTarget.style.background = 'var(--bg-app)'; }}
                >{s}</button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px' }}>
              Custom Address
            </label>
            <div style={{ display: 'flex', border: '1.5px solid var(--border)', borderRadius: '12px', overflow: 'hidden', background: 'var(--bg-app)', transition: 'all 0.2s' }}
              onFocus={e => e.currentTarget.style.borderColor = 'var(--primary)'}
              onBlur={e => e.currentTarget.style.borderColor = 'var(--border)'}>
              <input type="text" value={prefix} onChange={e => setPrefix(e.target.value.replace(/[^a-zA-Z0-9._]/g, "").toLowerCase())} placeholder="yourname"
                style={{ flex: 1, padding: '14px 16px', border: 'none', outline: 'none', fontSize: '16px', fontFamily: 'monospace', color: 'var(--text-main)', fontWeight: '600', background: 'transparent' }} />
              <div style={{ padding: '14px 16px', background: 'var(--bg-app)', color: 'var(--text-muted)', fontSize: '16px', fontFamily: 'monospace', fontWeight: '700', borderLeft: '1px solid var(--border)', display: 'flex', alignItems: 'center', whiteSpace: 'nowrap' }}>
                @abdm
              </div>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>Minimum 4 characters. Letters, numbers, dots, and underscores only.</p>
          </div>

          <button
            disabled={busy || !prefix.trim()}
            onClick={handleCreate}
            style={{
              width: '100%', background: busy || !prefix.trim() ? 'var(--border)' : 'var(--accent)',
              color: busy || !prefix.trim() ? 'var(--text-muted)' : '#fff', border: 'none', padding: '14px',
              borderRadius: '12px', fontSize: '14px', fontWeight: '700',
              cursor: busy || !prefix.trim() ? 'not-allowed' : 'pointer', transition: 'all 0.25s',
              boxShadow: busy || !prefix.trim() ? 'none' : '0 4px 16px rgba(251,145,63,0.38)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
            }}
          >
            {busy ? "Creating..." : "Create Address"} <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </Overlay>
  );
}
