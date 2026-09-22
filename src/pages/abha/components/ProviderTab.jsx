import React from "react";
import { Info, Building2 } from "lucide-react";

export function ProviderTab() {
  return (
    <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "8px", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
      <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border)", background: "var(--bg-app)" }}>
        <h2 style={{ fontSize: "18px", fontWeight: "600", color: "var(--text-main)", margin: "0 0 4px", display: "flex", alignItems: "center", gap: "8px" }}>
          <Building2 size={18} color="var(--text-muted)" /> Linked Providers
        </h2>
        <p style={{ fontSize: "13px", color: "var(--text-muted)", margin: 0 }}>Healthcare facilities and practitioners with access</p>
      </div>

      <div style={{ padding: "24px" }}>
        <div style={{ textAlign: "center", padding: "60px 40px", border: "1px dashed var(--border)", borderRadius: "8px", background: "var(--bg-app)" }}>
          <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "var(--primary-light)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <Info size={28} color="var(--primary)" />
          </div>
          <h3 style={{ fontSize: "16px", fontWeight: "600", color: "var(--text-main)", marginBottom: "8px" }}>No Provider Data Available</h3>
          <p style={{ fontSize: "13px", color: "var(--text-muted)", maxWidth: "320px", margin: "0 auto" }}>
            Healthcare providers you've interacted with will appear here once linked to your ABHA account.
          </p>
        </div>
      </div>
    </div>
  );
}
