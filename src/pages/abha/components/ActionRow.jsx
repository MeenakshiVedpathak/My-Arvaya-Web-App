import React, { useState, useEffect, useRef } from "react";
import { ChevronRight, QrCode, CreditCard, User, Users, Plus, LogOut, Download, X, Shield, Clock, CheckCircle2, XCircle, AlertCircle, Info, ArrowLeft, MapPin, ShieldCheck, Copy, FileText, Building2, Phone, Calendar, UserCircle } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import { abhaSendOtp, abhaVerifyOtp, abhaConfirmAddress } from "../../../services/abhaService";


export function ActionRow({ icon: Icon, iconBg, iconColor, title, titleColor, subtitle, onClick }) {
  return (
    <button onClick={onClick} className="hover-glow" style={{
      display: "flex", alignItems: "center", gap: "16px", padding: "18px 20px",
      background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "16px",
      cursor: "pointer", width: "100%", textAlign: "left", transition: "all 0.25s",
    }}>
      <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: iconBg, display: "flex", alignItems: "center", justifyContent: "center", color: iconColor, flexShrink: 0 }}>
        <Icon size={22} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: "15px", fontWeight: "700", color: titleColor || "var(--text-main)" }}>{title}</div>
        <div style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "2px" }}>{subtitle}</div>
      </div>
      <ChevronRight size={18} color="var(--text-muted)" />
    </button>
  );
}
