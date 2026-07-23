import { useState } from "react";
import { CreditCard, Shield, Building2, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { MOCK_ABHA } from "./constants";
import { AbhaTab } from "./components/AbhaTab";
import { ConsentTab } from "./components/ConsentTab";
import { ProviderTab } from "./components/ProviderTab";
import { SwitchProfileModal } from "./modals/SwitchProfileModal";
import { CreateAddressModal } from "./modals/CreateAddressModal";
import { QrModal } from "./modals/QrModal";

export default function ABHA() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab]           = useState("abha");
  const [showQrModal, setShowQrModal]       = useState(false);
  const [showSwitch, setShowSwitch]         = useState(false);
  const [showCreate, setShowCreate]         = useState(false);

  const abhaData = { ...MOCK_ABHA, name: user?.name || MOCK_ABHA.name };

  const tabs = [
    { id: "abha",     label: "ABHA Data", icon: CreditCard },
    { id: "consent",  label: "Consents", icon: Shield     },
    { id: "provider", label: "Providers",icon: Building2  },
  ];

  return (
    <main style={{ background: "#f8f9fa", minHeight: "100vh" }}>
      
      {/* ── Enterprise Top Header ── */}
      <div style={{ background: "#fff", borderBottom: "1px solid #e5e7eb", padding: "0 24px" }}>
        <div className="container" style={{ maxWidth: "1280px", margin: "0 auto" }}>
          
          <div style={{ padding: "16px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
              <Link to="/" style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "var(--text-muted)", fontSize: "14px", fontWeight: "600", textDecoration: "none" }}>
                <ArrowLeft size={16} /> Back
              </Link>
              <div style={{ width: "1px", height: "24px", background: "#e5e7eb" }} />
              <h1 style={{ fontSize: "20px", fontWeight: "700", color: "#111827", margin: 0 }}>ABHA Management</h1>
            </div>

            {/* User Profile Summary */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px", background: "#f3f4f6", padding: "6px 12px", borderRadius: "99px" }}>
              <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: abhaData.photoColor, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: "700" }}>
                {abhaData.photoInitials}
              </div>
              <div style={{ fontSize: "13px", fontWeight: "600", color: "#374151" }}>{abhaData.name}</div>
            </div>
          </div>

          {/* ── Horizontal Navigation ── */}
          <nav style={{ display: "flex", gap: "32px", marginTop: "8px" }}>
            {tabs.map(({ id, label, icon: Icon }) => {
              const isActive = activeTab === id;
              return (
                <button key={id} onClick={() => setActiveTab(id)} style={{
                  display: "flex", alignItems: "center", gap: "8px", padding: "0 0 12px 0",
                  background: "none", border: "none", cursor: "pointer", fontSize: "14px", fontWeight: "600",
                  color: isActive ? "var(--primary-dark)" : "#6b7280",
                  borderBottom: isActive ? "3px solid var(--primary)" : "3px solid transparent",
                  transition: "all 0.2s"
                }}>
                  <Icon size={16} />{label}
                </button>
              );
            })}
          </nav>

        </div>
      </div>

      {/* ── Main Content Area ── */}
      <div className="container" style={{ maxWidth: "1280px", margin: "32px auto", padding: "0 24px" }}>
        {activeTab === "abha"     && <AbhaTab abhaData={abhaData} onShowQr={() => setShowQrModal(true)} onLogout={logout} onSwitch={() => setShowSwitch(true)} onCreate={() => setShowCreate(true)} />}
        {activeTab === "consent"  && <ConsentTab />}
        {activeTab === "provider" && <ProviderTab />}
      </div>

      {/* ── Modals ── */}
      {showQrModal  && <QrModal           abhaData={abhaData}          onClose={() => setShowQrModal(false)} />}
      {showSwitch   && <SwitchProfileModal onClose={() => setShowSwitch(false)} />}
      {showCreate   && <CreateAddressModal abhaData={abhaData}          onClose={() => setShowCreate(false)} />}
    </main>
  );
}
