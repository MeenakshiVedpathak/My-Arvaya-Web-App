import React, { useState, useEffect, useRef } from "react";
import { ChevronRight, QrCode, CreditCard, User, Users, Plus, LogOut, Download, X, Shield, Clock, CheckCircle2, XCircle, AlertCircle, Info, ArrowLeft, MapPin, ShieldCheck, Copy, FileText, Building2, Phone, Calendar, UserCircle } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import { abhaSendOtp, abhaVerifyOtp, abhaConfirmAddress } from "../../../services/abhaService";


export function QuickServiceBtn({ icon: Icon, label, onClick }) {
  return (
    <button onClick={onClick} style={{ background: "none", border: "none", padding: 0, width: "100%" }}>
      <div style={{
        display: "flex", flexDirection: "column", alignItems: "center", gap: "12px",
        padding: "20px 12px", background: "rgba(255,255,255,0.7)", borderRadius: "20px",
        border: "1px solid rgba(255,255,255,0.5)", cursor: "pointer", transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        width: "100%", textAlign: "center", boxShadow: "0 4px 12px -4px rgba(0,0,0,0.03)"
      }}
        onMouseEnter={e => {
          e.currentTarget.style.borderColor = "rgba(251,145,63,0.3)";
          e.currentTarget.style.background = "linear-gradient(145deg, rgba(255,255,255,0.9) 0%, rgba(251,145,63,0.05) 100%)";
          e.currentTarget.style.transform = "translateY(-2px)";
          e.currentTarget.style.boxShadow = "0 10px 20px -10px rgba(251,145,63,0.2)";
        }}
        onMouseLeave={e => {
          e.currentTarget.style.borderColor = "rgba(255,255,255,0.5)";
          e.currentTarget.style.background = "rgba(255,255,255,0.7)";
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "0 4px 12px -4px rgba(0,0,0,0.03)";
        }}
      >
        <div style={{ width: "48px", height: "48px", borderRadius: "14px", background: "linear-gradient(135deg, var(--accent) 0%, #e67e22 100%)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 10px rgba(251,145,63,0.3)" }}>
          <Icon size={22} color="white" />
        </div>
        <span style={{ fontSize: "13px", fontWeight: "700", color: "var(--text-main)", lineHeight: "1.4", letterSpacing: "-0.01em" }}>{label}</span>
      </div>
    </button>
  );
}
