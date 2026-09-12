import { useState, useEffect } from "react";
import { CreditCard, Shield, Building2, ArrowLeft, Link2, ShieldCheck, ArrowRight, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import PageHeader from "../../components/common/PageHeader";

import { AbhaTab } from "./components/AbhaTab";
import { ConsentTab } from "./components/ConsentTab";
import { ProviderTab } from "./components/ProviderTab";
import { SwitchProfileModal } from "./modals/SwitchProfileModal";
import { CreateAddressModal } from "./modals/CreateAddressModal";
import { QrModal } from "./modals/QrModal";
import { getGetToken, getProfileInfo, getPhrCard } from "../../services/abhaService";

export default function ABHA() {
  const { user, logout, loginMethod, setLoginMethod, openLoginModal, showToast } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab]           = useState("abha");
  const [showQrModal, setShowQrModal]       = useState(false);
  const [showSwitch, setShowSwitch]         = useState(false);
  const [showCreate, setShowCreate]         = useState(false);
  const [profileInfo, setProfileInfo]       = useState(null);
  const [phrCardUrl, setPhrCardUrl]         = useState(null);
  const [pageLoading, setPageLoading]       = useState(true);

  // Check if active session is logged in via ABHA
  const abhaToken = localStorage.getItem("abha_user_token") || localStorage.getItem("abha_token") || user?.abha_token || user?.abhaToken;
  const currentLoginMethod = localStorage.getItem("arvaya_login_method") || loginMethod;
  const isAbhaLoggedIn = currentLoginMethod === "abha" && Boolean(abhaToken);
  const isUserOtpLogin = !isAbhaLoggedIn;

  // Trigger /api/profile/getGetToken API, then /api/profile/getInfo, then /api/profile/getPhrCard on ABHA Hub page click/load if logged in via ABHA
  useEffect(() => {
    const inputToken = localStorage.getItem("abha_user_token") || localStorage.getItem("abha_token") || user?.abha_token || user?.abhaToken;
    if (isAbhaLoggedIn && inputToken) {
      setPageLoading(true);
      getGetToken(inputToken)
        .then((getTokenRes) => {
          const profileToken = getTokenRes?.tokens?.token || getTokenRes?.token || getTokenRes?.data?.tokens?.token || inputToken;
          if (profileToken) {
            localStorage.setItem("abha_profile_token", profileToken);
            return getProfileInfo(profileToken).then((infoRes) => {
              if (infoRes) {
                setProfileInfo(infoRes);
              }
              const userId = user?.user_id || user?.id || user?.app_user_id || localStorage.getItem("user_id") || 107611;
              return getPhrCard(profileToken, userId).then((phrRes) => {
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
        })
        .finally(() => {
          setPageLoading(false);
        });
    } else {
      setPageLoading(false);
    }
  }, [user, loginMethod, isAbhaLoggedIn]);

  const handleAbhaLogout = async () => {
    setProfileInfo(null);
    setPhrCardUrl(null);
    await logout();
  };

  let genderDisplay = profileInfo?.gender || user?.gender || "";
  if (genderDisplay === "F" || genderDisplay === "FEMALE") genderDisplay = "Female";
  else if (genderDisplay === "M" || genderDisplay === "MALE") genderDisplay = "Male";

  const abhaData = {
    name: profileInfo?.fullName || (profileInfo?.firstName ? `${profileInfo.firstName} ${profileInfo.middleName || ''} ${profileInfo.lastName || ''}`.trim() : null) || user?.name || user?.full_name || "—",
    abhaNumber: profileInfo?.abhaNumber || user?.abhaNumber || user?.abha_number || "—",
    abhaAddress: profileInfo?.preferredAbhaAddress || profileInfo?.abhaAddress || user?.abhaAddress || user?.abha_address || "—",
    gender: genderDisplay || "—",
    dateOfBirth: profileInfo?.dateOfBirth || (profileInfo?.dayOfBirth && profileInfo?.monthOfBirth && profileInfo?.yearOfBirth ? `${profileInfo.dayOfBirth}/${profileInfo.monthOfBirth}/${profileInfo.yearOfBirth}` : null),
    dob: {
      day: profileInfo?.dayOfBirth || "",
      month: profileInfo?.monthOfBirth || "",
      year: profileInfo?.yearOfBirth || "",
    },
    address: profileInfo?.address || (profileInfo?.districtName ? `${profileInfo.districtName}, ${profileInfo.stateName || ''} ${profileInfo.pinCode || ''}`.trim() : null) || "—",
    photoInitials: (profileInfo?.fullName || user?.name || "").split(" ").filter(Boolean).map(n => n[0]).join("").toUpperCase().slice(0, 2) || "—",
    photoColor: "#1F4F57",
    profilePhoto: profileInfo?.profilePhoto,
    phrCardUrl: phrCardUrl,
  };

  const handleOpenAbhaOtpModal = () => {
    openLoginModal("/abha", "abha_mobile", { fromAbhaHub: true });
  };

  const tabs = [
    { id: "abha",     label: isUserOtpLogin ? "Link Abha Id / Login Abha Id" : "ABHA Data", icon: CreditCard },
    { id: "consent",  label: "Consents", icon: Shield     },
    { id: "provider", label: "Providers",icon: Building2  },
  ];

  if (pageLoading) {
    return (
      <main className="page" style={{ background: "var(--bg-app)", minHeight: "100vh", padding: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "20px" }}>
          <div style={{
            width: "64px", height: "64px", borderRadius: "50%",
            background: "linear-gradient(135deg, var(--primary) 0%, #1a4a50 100%)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 8px 32px rgba(46,102,110,0.25)"
          }}>
            <Loader2 size={28} color="#fff" style={{ animation: "abha-spin 1s linear infinite" }} />
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "16px", fontWeight: "700", color: "var(--text-main)", marginBottom: "6px" }}>
              Loading ABHA Profile
            </div>
            <div style={{ fontSize: "13px", color: "var(--text-muted)" }}>
              Fetching your digital health data…
            </div>
          </div>
          <div style={{
            width: "200px", height: "4px", borderRadius: "99px",
            background: "#e5e7eb", overflow: "hidden", marginTop: "4px"
          }}>
            <div style={{
              width: "40%", height: "100%", borderRadius: "99px",
              background: "linear-gradient(90deg, var(--primary), #3b9da8)",
              animation: "abha-progress 1.5s ease-in-out infinite"
            }} />
          </div>
        </div>
        <style>{`
          @keyframes abha-spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          @keyframes abha-progress {
            0% { transform: translateX(-100%); }
            50% { transform: translateX(150%); }
            100% { transform: translateX(400%); }
          }
        `}</style>
      </main>
    );
  }

  return (
    <>
      <main className="page animate-fade-in-up" style={{ background: "var(--bg-app)", minHeight: "100vh", padding: 0 }}>
        
        {/* ── Enterprise Top Header ── */}
        <PageHeader
          breadcrumbs={[
            { label: 'Home', link: '/' },
            { label: 'ABHA Hub' }
          ]}
          title="ABHA Management"
          subtitle="Manage your Ayushman Bharat Health Account, consents & providers."
          actions={
            <div style={{ display: "flex", alignItems: "center", gap: "12px", background: "rgba(15, 118, 110, 0.06)", padding: "6px 14px", borderRadius: "99px", border: "1px solid rgba(15, 118, 110, 0.15)" }}>
              <div style={{ width: "30px", height: "30px", borderRadius: "50%", background: abhaData.photoColor || "#2E666E", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: "700" }}>
                {abhaData.photoInitials}
              </div>
              <div style={{ fontSize: "13.5px", fontWeight: "700", color: "var(--text-main)" }}>{abhaData.name}</div>
            </div>
          }
        >
          {/* ── Horizontal Navigation ── */}
          <nav style={{ display: "flex", gap: "32px", marginTop: "16px" }}>
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

        </PageHeader>

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
            <AbhaTab abhaData={abhaData} onShowQr={() => setShowQrModal(true)} onLogout={handleAbhaLogout} onSwitch={() => setShowSwitch(true)} onCreate={() => setShowCreate(true)} />
          )}
        </div>
        <div id="static-abha-tab-consent" style={{ display: activeTab === "consent" ? "block" : "none" }}>
          <ConsentTab />
        </div>
        <div id="static-abha-tab-provider" style={{ display: activeTab === "provider" ? "block" : "none" }}>
          <ProviderTab />
        </div>
        </div>
      </main>

      {/* ── Modals ── */}
      {showQrModal  && <QrModal           abhaData={abhaData}          onClose={() => setShowQrModal(false)} />}
      {showSwitch   && <SwitchProfileModal onClose={() => setShowSwitch(false)} />}
      {showCreate   && <CreateAddressModal abhaData={abhaData} profileInfo={profileInfo} user={user} onClose={() => setShowCreate(false)} />}
    </>
  );
}
