import React, { useState } from "react";
import { Clock, CheckCircle2, XCircle, AlertCircle, Shield, FileText } from "lucide-react";
import { MOCK_CONSENTS } from "../constants";

export function ConsentTab() {
  const [activeFilter, setActiveFilter] = useState("Pending");
  const filters = ["Pending", "Granted", "Denied", "Expired"];
  const filterMeta = {
    Pending: { icon: Clock,         color: "#f59e0b", bg: "#fef3c7" },
    Granted: { icon: CheckCircle2,  color: "#16a34a", bg: "#dcfce7" },
    Denied:  { icon: XCircle,       color: "#dc2626", bg: "#fee2e2" },
    Expired: { icon: AlertCircle,   color: "#6b7280", bg: "#f3f4f6" },
  };
  const items = MOCK_CONSENTS[activeFilter] || [];

  return (
    <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
      <div style={{ padding: "20px 24px", borderBottom: "1px solid #e5e7eb", background: "#f9fafb", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h2 style={{ fontSize: "18px", fontWeight: "600", color: "#111827", margin: "0 0 4px", display: "flex", alignItems: "center", gap: "8px" }}><Shield size={18} color="#6b7280"/> Consent Manager</h2>
          <p style={{ fontSize: "13px", color: "#6b7280", margin: 0 }}>Review and manage your data sharing consents</p>
        </div>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {filters.map(f => {
            const { icon: Icon, color, bg } = filterMeta[f];
            const isActive = activeFilter === f;
            const count = (MOCK_CONSENTS[f] || []).length;
            return (
              <button key={f} onClick={() => setActiveFilter(f)} style={{
                display: "flex", alignItems: "center", gap: "6px", padding: "8px 16px", borderRadius: "6px",
                border: isActive ? `1px solid ${color}` : "1px solid #d1d5db",
                background: isActive ? bg : "#fff",
                color: isActive ? color : "#4b5563",
                fontSize: "13px", fontWeight: "500", cursor: "pointer", transition: "all 0.15s",
              }}>
                <Icon size={14} />{f}
                {count > 0 && <span style={{ background: color, color: "#fff", borderRadius: "99px", fontSize: "11px", fontWeight: "700", padding: "2px 6px", minWidth: "20px", textAlign: "center" }}>{count}</span>}
              </button>
            );
          })}
        </div>
      </div>
      
      <div style={{ padding: "24px" }}>
        {items.length === 0 ? <ConsentEmptyState filter={activeFilter} filterMeta={filterMeta} /> : (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {items.map(item => <ConsentCard key={item.id} item={item} filter={activeFilter} filterMeta={filterMeta} />)}
          </div>
        )}
      </div>
    </div>
  );
}

function ConsentEmptyState({ filter, filterMeta }) {
  const { icon: Icon, color, bg } = filterMeta[filter];
  const emptyText = {
    Pending: ["No Pending Requests",  "All your consent requests are up to date."],
    Granted: ["No Granted Consents",  "You haven't granted access to any provider yet."],
    Denied:  ["No Denied Requests",   "You haven't denied any consent requests."],
    Expired: ["No Expired Consents",  "Consents that have passed their validity will appear here."],
  };
  const [title, desc] = emptyText[filter];
  return (
    <div style={{ textAlign: "center", padding: "60px 40px", border: "1px dashed #d1d5db", borderRadius: "8px", background: "#f9fafb" }}>
      <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: bg, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
        <Icon size={28} color={color} />
      </div>
      <h3 style={{ fontSize: "16px", fontWeight: "600", color: "#111827", marginBottom: "8px" }}>{title}</h3>
      <p style={{ fontSize: "13px", color: "#6b7280", maxWidth: "320px", margin: "0 auto" }}>{desc}</p>
    </div>
  );
}

function ConsentCard({ item, filter, filterMeta }) {
  const { color, bg } = filterMeta[filter];
  const Icon = item.icon || FileText;
  
  return (
    <div style={{ padding: "20px", background: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px", display: "flex", alignItems: "flex-start", gap: "16px", transition: "box-shadow 0.15s" }}>
      <div style={{ width: "40px", height: "40px", borderRadius: "8px", background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", color: "#4b5563", flexShrink: 0 }}>
        <Icon size={20} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", marginBottom: "12px" }}>
          <div style={{ fontSize: "15px", fontWeight: "600", color: "#111827" }}>{item.requester}</div>
          <span style={{ background: bg, color, padding: "2px 8px", borderRadius: "99px", fontSize: "12px", fontWeight: "600" }}>{filter}</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 24px", background: "#f9fafb", padding: "12px", borderRadius: "6px", border: "1px solid #f3f4f6" }}>
          {[["Purpose", item.purpose], ["Period", item.period], ["Records", item.records], ["Date", item.granted]].map(([label, val]) => (
            <div key={label}>
              <div style={{ fontSize: "11px", color: "#6b7280", fontWeight: "500", textTransform: "uppercase" }}>{label}</div>
              <div style={{ fontSize: "13px", fontWeight: "500", color: "#111827", marginTop: "2px" }}>{val}</div>
            </div>
          ))}
        </div>
        
        {filter === "Granted" && (
          <div style={{ marginTop: "16px", paddingTop: "16px", borderTop: "1px solid #e5e7eb", display: "flex", justifyContent: "flex-end" }}>
            <button style={{ padding: "6px 16px", background: "#fff", color: "#dc2626", border: "1px solid #fecaca", borderRadius: "6px", fontSize: "13px", fontWeight: "500", cursor: "pointer", transition: "all 0.15s" }} onMouseEnter={e => e.currentTarget.style.background = "#fee2e2"} onMouseLeave={e => e.currentTarget.style.background = "#fff"}>
              Revoke Access
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
