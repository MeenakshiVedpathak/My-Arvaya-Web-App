import { useState, useEffect } from "react";
import { CreditCard, Shield, Building2, Link2, ShieldCheck, ArrowRight, Loader2, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

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
        
        {/* ── Themed Hero Header ── */}
      <div style={{ padding: "16px 0 0" }}>
        <div className="container" style={{ maxWidth: "1280px", margin: "0 auto" }}>

          <div
            style={{
              position: "relative",
              overflow: "hidden",
              borderRadius: "26px",
              padding: "10px 32px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "24px",
              flexWrap: "wrap",
              color: "#fff",
              background:
                "linear-gradient(120deg, rgba(255,255,255,0.08), transparent 45%), linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 62%, #133a41 100%)",
              border: "1px solid rgba(255,255,255,0.15)",
              boxShadow: "0 20px 44px rgba(31, 79, 87, 0.28)",
            }}
          >
            <div style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", gap: "16px" }}>
              <div style={{
                width: "52px", height: "52px", borderRadius: "16px", flexShrink: 0,
                background: "#fff", color: "var(--primary-dark)",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 12px 24px rgba(0,60,55,0.2)", transform: "rotate(-6deg)"
              }}>
                <CreditCard size={26} />
              </div>
              <div>
                <h1 style={{ fontSize: "24px", fontWeight: "800", margin: "0 0 4px", color: "#fff", letterSpacing: "-0.02em" }}>ABHA Management</h1>
                <p style={{ margin: "0 0 10px", fontSize: "13px", color: "rgba(255,255,255,0.82)" }}>Manage your Ayushman Bharat Digital Health Account</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {[
                    { icon: ShieldCheck, label: "NHA Certified", color: "#4ade80" },
                    { icon: Zap, label: "Instant Verification", color: "#fbbf24" },
                  ].map(({ icon: Icon, label, color }) => (
                    <span key={label} style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "6px 9px", color: "#fff", background: "rgba(18,51,58,0.5)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "10px", boxShadow: "0 4px 12px rgba(0,0,0,0.08)", fontSize: "10.5px", fontWeight: "700", backdropFilter: "blur(10px)" }}>
                      <Icon size={13} color={color} /> {label}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="abha-hero-visual" style={{ position: "relative", zIndex: 1 }}>
              <img src="/images/abha-id.png" alt="" className="abha-hero-img" />

              {abhaData.name && abhaData.name !== "—" && (
                <div style={{ position: "absolute", left: "50%", bottom: "-10px", transform: "translateX(-50%)", zIndex: 1, display: "flex", alignItems: "center", gap: "8px", whiteSpace: "nowrap", background: "rgba(18,51,58,0.85)", border: "1px solid rgba(255,255,255,0.2)", padding: "5px 12px 5px 5px", borderRadius: "99px", backdropFilter: "blur(10px)" }}>
                  <div style={{ width: "26px", height: "26px", borderRadius: "50%", background: "#fff", color: "var(--primary-dark)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", fontWeight: "700" }}>
                    {abhaData.photoInitials}
                  </div>
                  <div style={{ fontSize: "12px", fontWeight: "600", color: "#fff" }}>{abhaData.name}</div>
                </div>
              )}
            </div>
          </div>

          {/* ── Tab Navigation ── */}
          <nav className="styled-scrollbar" style={{ display: "flex", gap: "4px", marginTop: "18px", padding: "4px", background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "14px", boxShadow: "0 2px 8px rgba(0,0,0,0.03)", overflowX: "auto", maxWidth: "100%" }}>
            {tabs.map(({ id, label, icon: Icon }) => {
              const isActive = activeTab === id;
              return (
                <button key={id} onClick={() => setActiveTab(id)} style={{
                  display: "flex", alignItems: "center", gap: "8px", padding: "9px 16px",
                  border: "none", cursor: "pointer", fontSize: "13.5px", fontWeight: "700",
                  borderRadius: "10px", whiteSpace: "nowrap", flexShrink: 0,
                  color: isActive ? "#fff" : "var(--text-muted)",
                  background: isActive ? "linear-gradient(135deg, var(--primary), var(--primary-dark))" : "transparent",
                  boxShadow: isActive ? "0 4px 12px rgba(46,102,110,0.3)" : "none",
                  transition: "all 0.2s"
                }}>
                  <Icon size={15} />{label}
                </button>
              );
            })}
          </nav>

        </div>
      </div>

      {/* ── Main Content Area ── */}
      <div className="container" style={{ maxWidth: "1280px", margin: "28px auto", padding: "0 24px" }}>
        <div id="static-abha-tab-data" style={{ display: activeTab === "abha" ? "block" : "none" }}>
          {isUserOtpLogin ? (
            <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "16px", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
              <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border)", background: "var(--bg-app)" }}>
                <h2 style={{ fontSize: "18px", fontWeight: "600", color: "var(--text-main)", margin: "0 0 4px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <CreditCard size={18} color="var(--text-muted)" /> ABHA Data
                </h2>
                <p style={{ fontSize: "13px", color: "var(--text-muted)", margin: 0 }}>Link your Ayushman Bharat Health Account to unlock this section</p>
              </div>

              <div style={{ padding: "24px" }}>
                <div style={{ textAlign: "center", padding: "48px 32px", border: "1px dashed var(--border)", borderRadius: "8px", background: "var(--bg-app)" }}>
                  <div style={{
                    width: "64px", height: "64px", borderRadius: "50%", background: "var(--primary-light)",
                    color: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center",
                    margin: "0 auto 16px auto"
                  }}>
                    <CreditCard size={28} />
                  </div>
                  <h3 style={{ fontSize: "16px", fontWeight: "600", color: "var(--text-main)", marginBottom: "8px" }}>
                    Link ABHA ID or Login ABHA ID
                  </h3>
                  <p style={{ fontSize: "13px", color: "var(--text-muted)", lineHeight: "1.6", maxWidth: "420px", margin: "0 auto 24px auto" }}>
                    You logged in via Mobile OTP. To access your Digital Health Card and Profile Verification details, please link your ABHA ID or login using your ABHA number.
                  </p>

                  <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "var(--primary-light)", color: "var(--primary-dark)", padding: "7px 14px", borderRadius: "99px", fontSize: "12px", fontWeight: "600", marginBottom: "16px" }}>
                    <ShieldCheck size={14} /> Secured by NHA — Ayushman Bharat Digital Mission
                  </div>

                  <div>
                    <button
                      onClick={handleOpenAbhaOtpModal}
                      style={{
                        display: "inline-flex", alignItems: "center", gap: "10px",
                        background: "linear-gradient(135deg, var(--primary), var(--primary-dark))", color: "#fff", border: "none",
                        padding: "12px 24px", borderRadius: "12px", fontSize: "14px",
                        fontWeight: "700", cursor: "pointer", boxShadow: "0 4px 14px rgba(46,102,110,0.3)",
                        transition: "all 0.2s"
                      }}
                      onMouseEnter={e => e.currentTarget.style.transform = "translateY(-1px)"}
                      onMouseLeave={e => e.currentTarget.style.transform = "none"}
                    >
                      <Link2 size={16} /> Link Abha Id / Login Abha Id <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
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
