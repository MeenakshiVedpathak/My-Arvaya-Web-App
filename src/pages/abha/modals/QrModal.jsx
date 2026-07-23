import React from "react";
import { QrCode, Download } from "lucide-react";
import { Overlay, ModalShell } from "./SharedComponents";

export function QrModal({ abhaData, onClose }) {
  return (
    <Overlay onClose={onClose}>
      <ModalShell title="Your ABHA QR Code" subtitle="Scan to share your ABHA with providers" onClose={onClose} width={420}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "20px" }}>
          <div style={{ padding: "24px", background: "#fff", border: "1px solid #e5e7eb", borderRadius: "16px", boxShadow: "0 4px 16px rgba(0,0,0,0.06)" }}>
            <QrCode size={220} color="#111827" strokeWidth={1} />
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "16px", fontWeight: "700", color: "#111827", marginBottom: "4px" }}>{abhaData.name}</div>
            <div style={{ fontSize: "14px", color: "#6b7280", fontFamily: "monospace" }}>{abhaData.abhaAddress}</div>
          </div>
          <button style={{
            width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
            padding: "14px", background: "var(--primary)", color: "#fff", border: "none", borderRadius: "12px",
            fontSize: "15px", fontWeight: "700", cursor: "pointer", transition: "all 0.2s"
          }} onMouseEnter={e => e.currentTarget.style.filter = "brightness(1.1)"} onMouseLeave={e => e.currentTarget.style.filter = "none"}>
            <Download size={20} /> Download QR Code
          </button>
        </div>
      </ModalShell>
    </Overlay>
  );
}
