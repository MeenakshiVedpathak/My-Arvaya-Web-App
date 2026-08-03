import { useState, useEffect } from "react";
import { CreditCard, Shield, Building2, ArrowLeft, Link2, ShieldCheck, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { MOCK_ABHA } from "./constants";
import { AbhaTab } from "./components/AbhaTab";
import { ConsentTab } from "./components/ConsentTab";
import { ProviderTab } from "./components/ProviderTab";
import { SwitchProfileModal } from "./modals/SwitchProfileModal";
import { CreateAddressModal } from "./modals/CreateAddressModal";
import { QrModal } from "./modals/QrModal";
import { getGetToken, getProfileInfo, getPhrCard } from "../../services/abhaService";

export default function ABHA() {
  const { user, logout, loginMethod, openLoginModal } = useAuth();
  const [activeTab, setActiveTab]           = useState("abha");
  const [showQrModal, setShowQrModal]       = useState(false);
  const [showSwitch, setShowSwitch]         = useState(false);
  const [showCreate, setShowCreate]         = useState(false);
  const [profileInfo, setProfileInfo]       = useState(null);
  const [phrCardUrl, setPhrCardUrl]         = useState(null);

  // Check if login triggered user/verifyOtp and user is not yet ABHA-linked
  const isUserOtpLogin = loginMethod === "user_verify_otp" && !user?.abhaAddress && !user?.abha_number;

  // Trigger /api/profile/getGetToken API, then /api/profile/getInfo, then /api/profile/getPhrCard on ABHA Hub page click/load
  useEffect(() => {
    const inputToken = localStorage.getItem("abha_user_token") || user?.abha_token || user?.abhaToken || localStorage.getItem("abha_token") || localStorage.getItem("token");
    if (inputToken) {
      getGetToken(inputToken)
        .then((getTokenRes) => {
          console.log("/api/profile/getGetToken response:", getTokenRes);
          const profileToken = getTokenRes?.tokens?.token || getTokenRes?.token || getTokenRes?.data?.tokens?.token || inputToken;
          if (profileToken) {
            localStorage.setItem("abha_profile_token", profileToken);
            return getProfileInfo(profileToken).then((infoRes) => {
              console.log("/api/profile/getInfo response:", infoRes);
              if (infoRes) {
                setProfileInfo(infoRes);
              }
              const userId = user?.user_id || user?.id || user?.app_user_id || localStorage.getItem("user_id") || 107611;
              return getPhrCard(profileToken, userId).then((phrRes) => {
                console.log("/api/profile/getPhrCard response:", phrRes);
                const cardUrl = phrRes?.url || phrRes?.data?.url || phrRes?.result?.url;
                if (cardUrl) {
                  setPhrCardUrl(cardUrl);
                }
              });
            });
          }
        })
        .catch((err) => {
          console.error("ABHA Hub profile API sequence error:", err);
        });
    }
  }, [user]);

  let genderDisplay = profileInfo?.gender || user?.gender || MOCK_ABHA.gender;
  if (genderDisplay === "F" || genderDisplay === "FEMALE") genderDisplay = "Female";
  else if (genderDisplay === "M" || genderDisplay === "MALE") genderDisplay = "Male";

  const abhaData = {
    ...MOCK_ABHA,
    name: profileInfo?.fullName || (profileInfo?.firstName ? `${profileInfo.firstName} ${profileInfo.middleName || ''} ${profileInfo.lastName || ''}`.trim() : null) || user?.name || user?.full_name || MOCK_ABHA.name,
    abhaNumber: profileInfo?.abhaNumber || user?.abhaNumber || user?.abha_number || MOCK_ABHA.abhaNumber,
    abhaAddress: profileInfo?.preferredAbhaAddress || profileInfo?.abhaAddress || user?.abhaAddress || user?.abha_address || MOCK_ABHA.abhaAddress,
    gender: genderDisplay,
    dateOfBirth: profileInfo?.dateOfBirth || (profileInfo?.dayOfBirth && profileInfo?.monthOfBirth && profileInfo?.yearOfBirth ? `${profileInfo.dayOfBirth}/${profileInfo.monthOfBirth}/${profileInfo.yearOfBirth}` : null),
    dob: {
      day: profileInfo?.dayOfBirth || MOCK_ABHA.dob.day,
      month: profileInfo?.monthOfBirth || MOCK_ABHA.dob.month,
      year: profileInfo?.yearOfBirth || MOCK_ABHA.dob.year,
    },
    address: profileInfo?.address || (profileInfo?.districtName ? `${profileInfo.districtName}, ${profileInfo.stateName || ''} ${profileInfo.pinCode || ''}`.trim() : null) || MOCK_ABHA.address,
    photoInitials: (profileInfo?.fullName || user?.name || "SP").split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2),
    profilePhoto: profileInfo?.profilePhoto,
    phrCardUrl: phrCardUrl,
  };

  const handleOpenAbhaOtpModal = () => {
    openLoginModal(null, "abha_mobile");
  };

  const tabs = [
    { id: "abha",     label: isUserOtpLogin ? "Link Abha Id / Login Abha Id" : "ABHA Data", icon: CreditCard },
    { id: "consent",  label: "Consents", icon: Shield     },
    { id: "provider", label: "Providers",icon: Building2  },
  ];

  return (
    <main className="page animate-fade-in-up" style={{ background: "var(--bg-app)", minHeight: "100vh", padding: 0 }}>
      
      {/* ── Enterprise Top Header ── */}
      <div style={{ background: "var(--bg-surface)", borderBottom: "1px solid var(--border)", padding: "24px 0" }}>
        <div className="container" style={{ maxWidth: "1280px", margin: "0 auto" }}>
          
          <div style={{ padding: "0 0 16px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
              <Link to="/" style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "var(--text-muted)", fontSize: "14px", fontWeight: "600", textDecoration: "none" }} className="hover:text-primary">
                <ArrowLeft size={16} /> Home
              </Link>
              <div style={{ width: "1px", height: "24px", background: "var(--border)" }} />
              <h1 className="text-h2" style={{ fontSize: "24px", margin: 0 }}>ABHA Management</h1>
            </div>

            {/* User Profile Summary */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px", background: "var(--bg-app)", padding: "6px 12px", borderRadius: "99px" }}>
              <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: abhaData.photoColor || "#2E666E", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: "700" }}>
                {abhaData.photoInitials}
              </div>
              <div style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-main)" }}>{abhaData.name}</div>
            </div>
          </div>

          {/* ── Horizontal Navigation ── */}
          <nav style={{ display: "flex", gap: "32px", marginTop: "8px" }}>
            {tabs.map(({ id, label, icon: Icon }) => {
              const isActive = activeTab === id;
              return (
                <button key={id} onClick={() => {
                  setActiveTab(id);
                  if (id === "abha" && isUserOtpLogin) {
                    handleOpenAbhaOtpModal();
                  }
                }} style={{
                  display: "flex", alignItems: "center", gap: "8px", padding: "0 0 12px 0",
                  background: "none", border: "none", cursor: "pointer", fontSize: "14px", fontWeight: "600",
                  color: isActive ? "var(--primary-dark)" : "var(--text-muted)",
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
        <div id="static-abha-tab-data" style={{ display: activeTab === "abha" ? "block" : "none" }}>
          {isUserOtpLogin ? (
            <div style={{
              background: "#fff", border: "1px solid #e5e7eb", borderRadius: "16px",
              padding: "48px 32px", textAlign: "center", maxWidth: "720px", margin: "40px auto",
              boxShadow: "0 10px 30px rgba(0,0,0,0.05)"
            }}>
              <div style={{
                width: "64px", height: "64px", borderRadius: "50%", background: "#e0f2fe",
                color: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 20px auto"
              }}>
                <CreditCard size={32} />
              </div>
              <h2 style={{ fontSize: "22px", fontWeight: "700", color: "#111827", marginBottom: "12px" }}>
                Link ABHA ID or Login ABHA ID
              </h2>
              <p style={{ fontSize: "14px", color: "#6b7280", lineHeight: "1.6", marginBottom: "32px", maxWidth: "540px", margin: "0 auto 32px auto" }}>
                You logged in via Mobile OTP. To access your Digital Health Card and Profile Verification details, please link your ABHA ID or login using your ABHA number.
              </p>

              <div style={{ display: "flex", justifyContent: "center", gap: "16px", flexWrap: "wrap" }}>
                <button
                  onClick={handleOpenAbhaOtpModal}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: "10px",
                    background: "var(--primary)", color: "#fff", border: "none",
                    padding: "14px 28px", borderRadius: "12px", fontSize: "15px",
                    fontWeight: "600", cursor: "pointer", boxShadow: "0 4px 14px rgba(46,102,110,0.3)",
                    transition: "all 0.2s"
                  }}
                  onMouseEnter={e => e.currentTarget.style.transform = "translateY(-1px)"}
                  onMouseLeave={e => e.currentTarget.style.transform = "none"}
                >
                  <Link2 size={18} /> Link Abha Id / Login Abha Id <ArrowRight size={18} />
                </button>
              </div>

              <div style={{ marginTop: "36px", display: "inline-flex", alignItems: "center", gap: "8px", background: "#f0fdf4", color: "#166534", padding: "8px 16px", borderRadius: "99px", fontSize: "13px", border: "1px solid #bbf7d0" }}>
                <ShieldCheck size={16} /> Secured by NHA — Ayushman Bharat Digital Mission
              </div>
            </div>
          ) : (
            <AbhaTab abhaData={abhaData} onShowQr={() => setShowQrModal(true)} onLogout={logout} onSwitch={() => setShowSwitch(true)} onCreate={() => setShowCreate(true)} />
          )}
        </div>
        <div id="static-abha-tab-consent" style={{ display: activeTab === "consent" ? "block" : "none" }}>
          <ConsentTab />
        </div>
        <div id="static-abha-tab-provider" style={{ display: activeTab === "provider" ? "block" : "none" }}>
          <ProviderTab />
        </div>
      </div>

      {/* ── Modals ── */}
      {showQrModal  && <QrModal           abhaData={abhaData}          onClose={() => setShowQrModal(false)} />}
      {showSwitch   && <SwitchProfileModal onClose={() => setShowSwitch(false)} />}
      {showCreate   && <CreateAddressModal abhaData={abhaData}          onClose={() => setShowCreate(false)} />}
    </main>
  );
}
