import React, { useState } from "react";
import { QrCode, CreditCard, User, Users, Plus, LogOut, Download, CheckCircle2, Copy, MapPin, Calendar, ShieldCheck, UserCircle, RefreshCcw } from "lucide-react";

export function AbhaTab({ abhaData, onShowQr, onLogout, onSwitch, onCreate }) {
  const [copied, setCopied] = useState(false);

  const copyAbhaNumber = () => {
    navigator.clipboard.writeText(abhaData.abhaNumber).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      
      {/* ── Top Grid: ABHA Card & Details ── */}
      <div style={{ display: "grid", gridTemplateColumns: "380px 1fr", gap: "24px", alignItems: "start" }}>
        
        {/* Left Col: ABHA Card Panel */}
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
          <div style={{ padding: "16px 24px", borderBottom: "1px solid #e5e7eb", background: "#f9fafb", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 style={{ margin: 0, fontSize: "16px", fontWeight: "600", color: "#111827", display: "flex", alignItems: "center", gap: "8px" }}>
              <CreditCard size={18} color="#6b7280" /> Digital Health Card
            </h2>
            <div style={{ background: "#dcfce7", color: "#166534", fontSize: "12px", fontWeight: "600", padding: "2px 8px", borderRadius: "99px", display: "flex", alignItems: "center", gap: "4px" }}>
              <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#16a34a" }} /> Active
            </div>
          </div>
          
          <div style={{ padding: "24px" }}>
            <div style={{ background: "#1f2937", borderRadius: "12px", padding: "24px", color: "#fff", position: "relative", overflow: "hidden", marginBottom: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "24px", position: "relative", zIndex: 2 }}>
                <img src="/abha.svg" alt="ABHA" style={{ height: "24px", filter: "brightness(0) invert(1)" }} onError={e => e.currentTarget.style.display="none"} />
                <QrCode size={24} color="#9ca3af" style={{ cursor: "pointer" }} onClick={onShowQr} />
              </div>
              <div style={{ position: "relative", zIndex: 2 }}>
                <div style={{ fontSize: "11px", color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>Account Holder</div>
                <div style={{ fontSize: "18px", fontWeight: "600", marginBottom: "16px" }}>{abhaData.name}</div>
                
                <div style={{ fontSize: "11px", color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>ABHA Number</div>
                <div style={{ fontSize: "18px", fontWeight: "500", fontFamily: "monospace", letterSpacing: "0.05em" }}>{abhaData.abhaNumber}</div>
              </div>
              {/* Subtle background decoration */}
              <div style={{ position: "absolute", right: "-30px", bottom: "-30px", width: "120px", height: "120px", borderRadius: "50%", border: "2px solid rgba(255,255,255,0.05)" }} />
              <div style={{ position: "absolute", right: "20px", bottom: "-50px", width: "120px", height: "120px", borderRadius: "50%", border: "2px solid rgba(255,255,255,0.05)" }} />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px", background: "#f9fafb", borderRadius: "8px", border: "1px solid #e5e7eb" }}>
                <div>
                  <div style={{ fontSize: "12px", color: "#6b7280", fontWeight: "500" }}>ABHA Address</div>
                  <div style={{ fontSize: "14px", fontWeight: "600", color: "#111827", fontFamily: "monospace" }}>{abhaData.abhaAddress}</div>
                </div>
              </div>
              <button onClick={copyAbhaNumber} style={{
                width: "100%", padding: "10px", background: "#fff", border: "1px solid #d1d5db", borderRadius: "6px",
                fontSize: "14px", fontWeight: "500", color: copied ? "#16a34a" : "#374151", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", transition: "all 0.15s"
              }}
              onMouseEnter={e => e.currentTarget.style.background = "#f9fafb"}
              onMouseLeave={e => e.currentTarget.style.background = "#fff"}>
                {copied ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                {copied ? "Copied" : "Copy ABHA Number"}
              </button>
            </div>
          </div>
        </div>

        {/* Right Col: Details Panel */}
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", height: "100%" }}>
          <div style={{ padding: "16px 24px", borderBottom: "1px solid #e5e7eb", background: "#f9fafb" }}>
            <h2 style={{ margin: 0, fontSize: "16px", fontWeight: "600", color: "#111827", display: "flex", alignItems: "center", gap: "8px" }}>
              <UserCircle size={18} color="#6b7280" /> Profile Verification Details
            </h2>
          </div>
          
          <div style={{ padding: "24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "32px", background: "#eff6ff", color: "#1d4ed8", padding: "12px 16px", borderRadius: "6px", border: "1px solid #bfdbfe", fontSize: "13px" }}>
              <ShieldCheck size={18} /> KYC verified via Aadhaar. Data is protected by NHA encryption.
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "32px" }}>
              <div>
                <div style={{ fontSize: "12px", color: "#6b7280", fontWeight: "500", marginBottom: "4px", display: "flex", alignItems: "center", gap: "6px" }}><User size={14}/> Full Name</div>
                <div style={{ fontSize: "15px", fontWeight: "600", color: "#111827" }}>{abhaData.name}</div>
              </div>
              
              <div>
                <div style={{ fontSize: "12px", color: "#6b7280", fontWeight: "500", marginBottom: "4px", display: "flex", alignItems: "center", gap: "6px" }}><Users size={14}/> Gender</div>
                <div style={{ fontSize: "15px", fontWeight: "600", color: "#111827" }}>{abhaData.gender}</div>
              </div>

              <div style={{ gridColumn: "1 / -1" }}>
                <div style={{ fontSize: "12px", color: "#6b7280", fontWeight: "500", marginBottom: "4px", display: "flex", alignItems: "center", gap: "6px" }}><Calendar size={14}/> Date of Birth</div>
                <div style={{ fontSize: "15px", fontWeight: "600", color: "#111827" }}>{abhaData.dob.day} / {abhaData.dob.month} / {abhaData.dob.year}</div>
              </div>

              <div style={{ gridColumn: "1 / -1" }}>
                <div style={{ fontSize: "12px", color: "#6b7280", fontWeight: "500", marginBottom: "4px", display: "flex", alignItems: "center", gap: "6px" }}><MapPin size={14}/> Registered Address</div>
                <div style={{ fontSize: "14px", fontWeight: "500", color: "#374151", lineHeight: "1.6", background: "#f9fafb", padding: "16px", borderRadius: "6px", border: "1px solid #e5e7eb" }}>
                  {abhaData.address}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom Action Row ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "24px" }}>
        
        <button onClick={onSwitch} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "16px", background: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px", cursor: "pointer", transition: "border-color 0.15s, box-shadow 0.15s", textAlign: "left" }} onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--primary)"; e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.05)" }} onMouseLeave={e => { e.currentTarget.style.borderColor = "#e5e7eb"; e.currentTarget.style.boxShadow = "none" }}>
          <div style={{ width: "36px", height: "36px", borderRadius: "6px", background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", color: "#4b5563" }}><RefreshCcw size={18} /></div>
          <div>
            <div style={{ fontSize: "14px", fontWeight: "600", color: "#111827" }}>Switch Profile</div>
            <div style={{ fontSize: "12px", color: "#6b7280" }}>Login with another ABHA</div>
          </div>
        </button>

        <button onClick={onCreate} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "16px", background: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px", cursor: "pointer", transition: "border-color 0.15s, box-shadow 0.15s", textAlign: "left" }} onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--primary)"; e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.05)" }} onMouseLeave={e => { e.currentTarget.style.borderColor = "#e5e7eb"; e.currentTarget.style.boxShadow = "none" }}>
          <div style={{ width: "36px", height: "36px", borderRadius: "6px", background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", color: "#4b5563" }}><Plus size={18} /></div>
          <div>
            <div style={{ fontSize: "14px", fontWeight: "600", color: "#111827" }}>Create Address</div>
            <div style={{ fontSize: "12px", color: "#6b7280" }}>Register a new ABHA</div>
          </div>
        </button>

        <button onClick={onLogout} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "16px", background: "#fff", border: "1px solid #fecaca", borderRadius: "8px", cursor: "pointer", transition: "border-color 0.15s, box-shadow 0.15s", textAlign: "left" }} onMouseEnter={e => { e.currentTarget.style.borderColor = "#ef4444"; e.currentTarget.style.boxShadow = "0 2px 4px rgba(239,68,68,0.1)" }} onMouseLeave={e => { e.currentTarget.style.borderColor = "#fecaca"; e.currentTarget.style.boxShadow = "none" }}>
          <div style={{ width: "36px", height: "36px", borderRadius: "6px", background: "#fef2f2", display: "flex", alignItems: "center", justifyContent: "center", color: "#ef4444" }}><LogOut size={18} /></div>
          <div>
            <div style={{ fontSize: "14px", fontWeight: "600", color: "#991b1b" }}>Logout Profile</div>
            <div style={{ fontSize: "12px", color: "#ef4444" }}>Unlink current session</div>
          </div>
        </button>
      </div>
    </div>
  );
}
