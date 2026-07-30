import React, { useState, useEffect } from "react";
import { 
  ChevronRight, 
  ChevronDown, 
  Sparkles, 
  CreditCard, 
  Calendar, 
  FileText, 
  UserPlus, 
  Upload, 
  TrendingUp, 
  Inbox, 
  CheckCircle2, 
  Award,
  IndianRupee,
  Loader2
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getLoyaltyConfig, getPatientLoyalty, getLoyaltyHistory, redeemLoyaltyPoints } from "../services/dataService";

function formatModuleName(moduleStr = "") {
  if (!moduleStr) return "General Reward";
  const lower = moduleStr.toLowerCase().trim();
  if (lower === "lab" || lower === "lab_test") return "Lab";
  if (lower === "offline_payment" || lower === "offline_appointment") return "Offline Appointment";
  if (lower === "appointment" || lower === "online_appointment") return "Appointment";
  return moduleStr
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function getTaskIcon(title = "", type = "") {
  const lower = (title + " " + type).toLowerCase();
  if (lower.includes("appointment") || lower.includes("booking") || lower.includes("visit") || lower.includes("consult")) {
    return Calendar;
  }
  if (lower.includes("offline") || lower.includes("payment") || lower.includes("bill") || lower.includes("pay")) {
    return CreditCard;
  }
  if (lower.includes("lab") || lower.includes("upload") || lower.includes("record") || lower.includes("test")) {
    return Upload;
  }
  if (lower.includes("refer") || lower.includes("friend") || lower.includes("invite")) {
    return UserPlus;
  }
  if (lower.includes("abha") || lower.includes("verify") || lower.includes("id")) {
    return CheckCircle2;
  }
  if (lower.includes("profile") || lower.includes("checkup") || lower.includes("health")) {
    return Award;
  }
  return Sparkles;
}

const defaultEarnTasks = [
  { id: 3, source_module: "lab", moduleName: "Lab", points_per_amount: "50", expiry_days: 180, rateText: "+1 Pt / ₹50", icon: Upload },
  { id: 2, source_module: "offline_payment", moduleName: "Offline Appointment", points_per_amount: "20", expiry_days: 365, rateText: "+1 Pt / ₹20", icon: CreditCard },
  { id: 1, source_module: "appointment", moduleName: "Appointment", points_per_amount: "10", expiry_days: 365, rateText: "+1 Pt / ₹10", icon: Calendar }
];

export default function Rewards() {
  const { user } = useAuth();
  const [points, setPoints] = useState(0);
  const [maxRedeemPoints, setMaxRedeemPoints] = useState(null);
  const [loadingPoints, setLoadingPoints] = useState(true);
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [showMoreEarn, setShowMoreEarn] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [earnTasks, setEarnTasks] = useState(defaultEarnTasks);
  const [loadingTasks, setLoadingTasks] = useState(true);

  const [history, setHistory] = useState([
    { id: 1, title: "Appointment Booking Bonus", date: "Today, 5:30 PM", points: "+50", type: "earned" },
    { id: 2, title: "Uploaded Lab Report", date: "10 Jul 2026", points: "+15", type: "earned" },
    { id: 3, title: "Referred Friend – Rahul", date: "05 Jul 2026", points: "+100", type: "earned" },
    { id: 4, title: "Redeemed Flat ₹100 Off", date: "01 Jul 2026", points: "-120", type: "redeemed" },
    { id: 5, title: "Health Survey Completed", date: "28 Jun 2026", points: "+20", type: "earned" },
    { id: 6, title: "Hospital Bill Payment Bonus", date: "22 Jun 2026", points: "+30", type: "earned" },
    { id: 7, title: "ABHA ID Verification Bonus", date: "15 Jun 2026", points: "+50", type: "earned" },
    { id: 8, title: "Annual Wellness Checkup", date: "01 Jun 2026", points: "+150", type: "earned" }
  ]);

  useEffect(() => {
    let isMounted = true;
    async function fetchRewardsData() {
      setLoadingTasks(true);
      setLoadingPoints(true);
      try {
        const storedUser = localStorage.getItem("arvaya_user");
        let parsedUser = user;
        if (!parsedUser && storedUser) {
          try {
            parsedUser = JSON.parse(storedUser);
          } catch (e) {
            console.error("Error parsing stored user", e);
          }
        }

        const patient_id = parsedUser?.id || parsedUser?.user_id || parsedUser?.patient_id || parsedUser?.app_user_id || 20546;

        const [loyaltyRes, configRes, historyRes] = await Promise.all([
          getPatientLoyalty(patient_id).catch(err => {
            console.error("Failed to fetch patient loyalty:", err);
            return null;
          }),
          getLoyaltyConfig({ filterQuery: "is_active:1" }).catch(err => {
            console.error("Failed to fetch loyalty config:", err);
            return null;
          }),
          getLoyaltyHistory(patient_id).catch(err => {
            console.error("Failed to fetch loyalty history:", err);
            return null;
          })
        ]);

        console.log("Fetched patient loyalty response:", loyaltyRes);
        console.log("Fetched loyalty config response:", configRes);
        console.log("Fetched loyalty history response:", historyRes);

        if (!isMounted) return;

        // Process Patient Loyalty total_amount & max_redeem_points
        if (loyaltyRes) {
          let lData = Array.isArray(loyaltyRes) ? loyaltyRes[0] : loyaltyRes;
          let totalAmt = 0;
          let maxRedeem = null;

          if (typeof lData === 'number' || typeof lData === 'string') {
            totalAmt = parseFloat(lData) || 0;
          } else if (lData && typeof lData === 'object') {
            const val = lData.total_amount ??
                        lData.totalAmount ??
                        lData.total_points ??
                        lData.total ??
                        lData.points ??
                        lData.reward_points ??
                        lData.balance ??
                        lData.wallet_amount ??
                        lData.amount ??
                        (typeof lData.data === 'number' ? lData.data : (lData.data?.total_amount ?? 0));
            totalAmt = parseFloat(val) || 0;

            const maxVal = lData.max_redeem_points ??
                           lData.maxRedeemPoints ??
                           lData.max_points ??
                           lData.max_redeem ??
                           (lData.data?.max_redeem_points ?? null);
            if (maxVal !== null && maxVal !== undefined) {
              maxRedeem = parseFloat(maxVal);
            }
          }

          setPoints(isNaN(totalAmt) ? 0 : totalAmt);
          if (maxRedeem !== null && !isNaN(maxRedeem)) {
            setMaxRedeemPoints(maxRedeem);
          }
        }

        // Process Loyalty History from /api/loyalty/history
        let rawHistoryList = [];
        if (Array.isArray(historyRes)) {
          rawHistoryList = historyRes;
        } else if (typeof historyRes === 'object' && historyRes !== null) {
          rawHistoryList = historyRes.data || historyRes.history || historyRes.list || historyRes.transactions || historyRes.logs || [];
        }

        // Fallback to loyaltyRes embedded history if historyRes is empty
        if (rawHistoryList.length === 0 && loyaltyRes) {
          let lData = Array.isArray(loyaltyRes) ? loyaltyRes[0] : loyaltyRes;
          rawHistoryList = loyaltyRes.history ||
                           loyaltyRes.activities ||
                           loyaltyRes.transactions ||
                           loyaltyRes.logs ||
                           loyaltyRes.list ||
                           (lData && typeof lData === 'object' ? (lData.history || lData.activities || lData.transactions || lData.logs || lData.list) : null) ||
                           (loyaltyRes.data && typeof loyaltyRes.data === 'object' ? (loyaltyRes.data.history || loyaltyRes.data.activities || loyaltyRes.data.transactions || loyaltyRes.data.logs) : null) ||
                           [];
        }

        if (Array.isArray(rawHistoryList) && rawHistoryList.length > 0) {
          const formattedHistory = rawHistoryList.map((h, idx) => {
            let rawTitle = h.title || h.description || h.name || h.action_name || h.event_name || h.remarks || h.source_module || h.module;
            let title = rawTitle ? formatModuleName(rawTitle) : (h.type === 'redeemed' || h.type === 'debit' ? 'Redeemed Points' : 'Earned Points');

            let rawDate = h.created_at || h.date || h.created_date || h.date_time || h.timestamp;
            let date = "Recent";
            if (rawDate) {
              try {
                const d = new Date(rawDate);
                if (!isNaN(d.getTime())) {
                  date = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
                } else {
                  date = String(rawDate);
                }
              } catch {
                date = String(rawDate);
              }
            }

            let rawType = String(h.type || h.transaction_type || h.status || "").toLowerCase();
            let isRedeemed = rawType.includes('redeem') || rawType.includes('debit') || String(h.points || h.amount || h.pts || "").startsWith('-');
            let type = isRedeemed ? 'redeemed' : 'earned';

            let ptsVal = h.points ?? h.amount ?? h.pts ?? h.reward_points ?? h.points_earned ?? h.points_redeemed;
            let ptsStr = "";
            if (ptsVal !== undefined && ptsVal !== null) {
              const s = String(ptsVal);
              ptsStr = s.startsWith('+') || s.startsWith('-') ? s : `${type === 'redeemed' ? '-' : '+'}${s}`;
            } else {
              ptsStr = type === 'redeemed' ? '-50' : '+50';
            }

            return {
              id: h.id || h.transaction_id || idx + 1,
              title,
              date,
              points: ptsStr,
              type
            };
          });

          setHistory(formattedHistory);
        }

        // Process Loyalty Config from /api/loyalty/get
        if (configRes) {
          let rawList = [];
          if (Array.isArray(configRes)) {
            rawList = configRes;
          } else if (typeof configRes === 'object' && configRes !== null) {
            rawList = configRes.data || configRes.list || configRes.config || configRes.result || [];
          }

          // Filter only active items (is_active = 1)
          const activeItems = rawList.filter(item => {
            if (item.is_active !== undefined && item.is_active !== null) {
              return String(item.is_active) === '1' || item.is_active === true;
            }
            return true;
          });

          if (activeItems.length > 0) {
            const mappedTasks = activeItems.map((item, idx) => {
              const rawModule = item.source_module || item.module || item.title || item.name || `Module #${idx + 1}`;
              const moduleName = formatModuleName(rawModule);

              const ppa = item.points_per_amount ?? item.amount_per_point ?? item.pts ?? item.points ?? 10;
              const numAmt = parseFloat(ppa);
              const amtStr = !isNaN(numAmt) ? (numAmt % 1 === 0 ? numAmt.toString() : numAmt.toFixed(2)) : String(ppa);
              const rateText = `+1 Pt / ₹${amtStr}`;

              const expiryDays = item.expiry_days ?? item.expiry ?? null;

              return {
                id: item.id || idx + 1,
                source_module: item.source_module || rawModule,
                moduleName,
                points_per_amount: amtStr,
                expiry_days: expiryDays,
                rateText,
                icon: getTaskIcon(moduleName, item.source_module || "")
              };
            });

            setEarnTasks(mappedTasks);
          }
        }
      } catch (err) {
        console.error("Failed to fetch rewards data:", err);
      } finally {
        if (isMounted) {
          setLoadingTasks(false);
          setLoadingPoints(false);
        }
      }
    }

    fetchRewardsData();

    return () => {
      isMounted = false;
    };
  }, [user]);

  const displayedEarnTasks = showMoreEarn 
    ? earnTasks 
    : earnTasks.slice(0, 5);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  };

  const handleRedeemTabClick = async () => {
    if (isRedeeming) return;

    const storedUser = localStorage.getItem("arvaya_user");
    let parsedUser = user;
    if (!parsedUser && storedUser) {
      try {
        parsedUser = JSON.parse(storedUser);
      } catch (e) {
        console.error("Error parsing stored user", e);
      }
    }
    const patient_id = parsedUser?.id || parsedUser?.user_id || parsedUser?.patient_id || parsedUser?.app_user_id || 20546;
    const points_to_redeem = maxRedeemPoints || 30;

    setIsRedeeming(true);
    try {
      const res = await redeemLoyaltyPoints(patient_id, points_to_redeem);
      console.log("Redemption API response:", res);

      setPoints(prev => Math.max(0, prev - points_to_redeem));
      const newTx = {
        id: Date.now(),
        title: `Redeemed ${points_to_redeem} Loyalty Points`,
        date: "Just now",
        points: `-${points_to_redeem}`,
        type: "redeemed"
      };
      setHistory(prev => [newTx, ...prev]);
      showToast(`Successfully redeemed ${points_to_redeem} points!`);

      // Refresh loyalty info after redemption
      try {
        const freshLoyalty = await getPatientLoyalty(patient_id);
        if (freshLoyalty) {
          let lData = Array.isArray(freshLoyalty) ? freshLoyalty[0] : freshLoyalty;
          if (lData && typeof lData === 'object') {
            const val = lData.total_amount ?? lData.totalAmount ?? lData.total_points ?? lData.points ?? lData.balance;
            if (val !== undefined && val !== null) {
              const parsedVal = parseFloat(val);
              if (!isNaN(parsedVal)) setPoints(parsedVal);
            }
          }
        }
      } catch (e) {
        console.error("Error refreshing loyalty data:", e);
      }

    } catch (err) {
      console.error("Redemption failed:", err);
      showToast(err.message || "Failed to redeem points. Please try again.");
    } finally {
      setIsRedeeming(false);
    }
  };

  const handleEarnTaskClick = (task) => {
    const name = task.moduleName || task.title || "Module";
    const amt = task.points_per_amount;
    showToast(`Earn 1 Pt for every ${amt ? `₹${amt}` : 'eligible spend'} on ${name}`);
  };

  return (
    <main className="page" style={{ background: 'var(--bg-app)', minHeight: '100vh', paddingBottom: '60px' }}>
      
      {/* Toast Notification Alert */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 9999,
          background: 'var(--text-main)',
          color: 'white',
          padding: '12px 20px',
          borderRadius: '12px',
          fontSize: '14px',
          fontWeight: '600',
          boxShadow: 'var(--shadow-lg)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <Sparkles size={16} color="var(--accent)" />
          {toastMessage}
        </div>
      )}

      {/* Header Banner */}
      <div style={{ background: 'var(--bg-surface)', padding: '20px 0', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <div className="flex items-center gap-2 text-muted mb-2" style={{ fontSize: '12px', fontWeight: '500' }}>
            <Link to="/" className="hover:text-primary">Home</Link> <ChevronRight size={12} /> <span>Loyalty Points</span>
          </div>
          <h1 className="text-h2" style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-main)', margin: 0 }}>
            Loyalty Points
          </h1>
          <p className="text-muted mt-1" style={{ fontSize: '14px', margin: '4px 0 0 0' }}>
            Earn points on health actions and track your reward activity.
          </p>
        </div>
      </div>

      <div className="container" style={{ paddingTop: '28px' }}>
        
        {/* TWO-COLUMN GRID: Equal column bottom alignment */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '28px', alignItems: 'stretch' }} className="loyalty-grid">

          {/* LEFT COLUMN: Available Points Card + Earn Points Section */}
          <section style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Available Points Card */}
            <div style={{
              background: 'linear-gradient(135deg, #0F4D58 0%, #0A343C 100%)',
              borderRadius: '20px',
              padding: '28px 28px',
              color: 'white',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 8px 24px rgba(15, 77, 88, 0.2)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '16px'
            }}>
              {/* Subtle background glow */}
              <div style={{
                position: 'absolute',
                top: '-30px',
                right: '-30px',
                width: '180px',
                height: '180px',
                background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)',
                borderRadius: '50%',
                pointerEvents: 'none'
              }} />

              {/* Left Side: Rupee Badge & Points Display */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', position: 'relative', zIndex: 1 }}>
                <div style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '50%',
                  background: '#5C3818',
                  border: '2px solid #8C5627',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: '0 4px 10px rgba(0,0,0,0.15)'
                }}>
                  <IndianRupee size={22} color="#FDBF8B" strokeWidth={2.5} />
                </div>

                <div>
                  <span style={{
                    fontSize: '11px',
                    fontWeight: '700',
                    color: 'rgba(255, 255, 255, 0.75)',
                    display: 'block',
                    marginBottom: '4px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.8px'
                  }}>
                    Available Points
                  </span>
                  
                  {loadingPoints ? (
                    <div style={{ display: 'flex', alignItems: 'center', minHeight: '28px', marginTop: '4px' }}>
                      <Loader2 size={24} className="animate-spin" style={{ color: 'white' }} />
                    </div>
                  ) : (
                    <span style={{
                      fontSize: '28px',
                      fontWeight: '800',
                      color: 'white',
                      lineHeight: 1,
                      letterSpacing: '-0.3px'
                    }}>
                      {points.toLocaleString()}
                    </span>
                  )}
                </div>
              </div>

              {/* Right Side: Progress Pill Badge (clickable, triggers /api/loyalty/redeem with { patient_id, points_to_redeem }) */}
              {(maxRedeemPoints !== null ? points >= maxRedeemPoints : true) && (
                <div 
                  onClick={handleRedeemTabClick}
                  className="hover-glow"
                  style={{
                    background: 'rgba(255, 255, 255, 0.12)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(255, 255, 255, 0.25)',
                    padding: '8px 16px',
                    borderRadius: '99px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '12px',
                    fontWeight: '700',
                    color: '#A7F3D0',
                    position: 'relative',
                    zIndex: 1,
                    cursor: isRedeeming ? 'not-allowed' : 'pointer',
                    userSelect: 'none',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                    opacity: isRedeeming ? 0.7 : 1
                  }}
                  title="Click to redeem loyalty points"
                >
                  {isRedeeming ? (
                    <Loader2 size={14} className="animate-spin" color="#A7F3D0" />
                  ) : (
                    <TrendingUp size={14} color="#A7F3D0" />
                  )}
                  <span>{isRedeeming ? "Redeeming..." : (maxRedeemPoints ? `${maxRedeemPoints} to next reward` : '30 to next reward')}</span>
                </div>
              )}
            </div>

            {/* Earn Points Section */}
            <div style={{
              background: 'var(--bg-surface)',
              borderRadius: '20px',
              padding: '24px',
              border: '1px solid var(--border)',
              boxShadow: 'var(--shadow-sm)',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
                <div>
                  <h2 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-main)', margin: 0 }}>
                    Earn Points
                  </h2>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                    Earn 1 Pt for every eligible spend based on active module rules.
                  </p>
                </div>
              </div>

              {loadingTasks ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '32px 0' }}>
                  <Loader2 size={24} className="animate-spin" style={{ color: 'var(--primary)' }} />
                </div>
              ) : earnTasks.length === 0 ? (
                <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px' }}>
                  No earn rules available.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {displayedEarnTasks.map((task, idx) => {
                    const IconComp = task.icon || Sparkles;
                    const numAmt = parseFloat(task.points_per_amount || 0);
                    return (
                      <div 
                        key={task.id}
                        onClick={() => handleEarnTaskClick(task)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '14px 16px',
                          borderRadius: '12px',
                          background: 'var(--bg-app)',
                          border: '1px solid var(--border)',
                          transition: 'all 0.15s ease',
                          cursor: 'pointer'
                        }}
                        className="hover:border-primary"
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                          {/* Circular Icon Container */}
                          <div style={{
                            width: '42px',
                            height: '42px',
                            borderRadius: '50%',
                            background: 'rgba(15, 77, 88, 0.1)',
                            color: '#0F4D58',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}>
                            <IconComp size={20} color="#0F4D58" />
                          </div>
                          <div>
                            <b style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-main)', display: 'block', marginBottom: '2px' }}>
                              {task.moduleName || task.title}
                            </b>
                            {task.expiry_days && (
                              <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '500' }}>
                                Valid for {task.expiry_days} days
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Earn Rate Badge */}
                        <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: '12px' }}>
                          <span style={{
                            color: '#16A34A',
                            fontWeight: '800',
                            fontSize: '13px',
                            background: 'rgba(22, 163, 74, 0.1)',
                            padding: '6px 12px',
                            borderRadius: '20px',
                            display: 'inline-block'
                          }}>
                            {task.rateText || `+1 Pt / ₹${numAmt || task.points_per_amount}`}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Show more / Show less toggle */}
              {earnTasks.length > 5 && (
                <div style={{ textAlign: 'center', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
                  <button
                    onClick={() => setShowMoreEarn(!showMoreEarn)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--primary)',
                      fontSize: '13px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    {showMoreEarn ? (
                      <>Show less <ChevronRight size={14} style={{ transform: 'rotate(-90deg)' }} /></>
                    ) : (
                      <>Show {earnTasks.length - 5} more <ChevronDown size={14} /></>
                    )}
                  </button>
                </div>
              )}
            </div>

          </section>

          {/* RIGHT COLUMN: Recent History Section (Aligned to Left Column Bottom) */}
          <aside style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{
              background: 'var(--bg-surface)',
              borderRadius: '20px',
              padding: '24px 24px 16px 24px',
              border: '1px solid var(--border)',
              boxShadow: 'var(--shadow-sm)',
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
              boxSizing: 'border-box'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexShrink: 0 }}>
                <h2 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-main)', margin: 0 }}>
                  Recent History
                </h2>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600' }}>
                  {history.length} activities
                </span>
              </div>

              {history.length === 0 ? (
                /* Empty state */
                <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    background: 'var(--bg-app)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 12px auto'
                  }}>
                    <Inbox size={24} color="var(--text-muted)" />
                  </div>
                  <p style={{ fontSize: '13px', fontWeight: '500', margin: 0 }}>No transactions yet</p>
                </div>
              ) : (
                /* Scrollable list filling the full card height without bottom gap */
                <div 
                  style={{ 
                    display: 'flex', 
                    flexDirection: 'column',
                    flex: 1,
                    minHeight: 0,
                    maxHeight: '440px',
                    overflowY: 'auto',
                    paddingRight: '8px'
                  }}
                  className="history-scroller"
                >
                  {history.map((item, idx) => (
                    <div 
                      key={item.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '14px 0',
                        borderBottom: idx !== history.length - 1 ? '1px solid var(--border)' : 'none'
                      }}
                    >
                      <div>
                        <b style={{ fontSize: '14px', color: 'var(--text-main)', display: 'block', marginBottom: '2px', fontWeight: '600' }}>
                          {item.title}
                        </b>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                          {item.date}
                        </span>
                      </div>
                      <span style={{
                        fontSize: '14px',
                        fontWeight: '800',
                        color: item.type === 'earned' ? '#16A34A' : '#DC2626'
                      }}>
                        {item.points} pts
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </aside>

        </div>
      </div>

      {/* Embedded Responsive & Custom Scrollbar Styles (Identical to Wallet.jsx) */}
      <style dangerouslySetInnerHTML={{__html: `
        .history-scroller {
          flex: 1 !important;
          min-height: 0 !important;
          max-height: 440px !important;
          overflow-y: auto !important;
        }
        .history-scroller::-webkit-scrollbar {
          width: 6px !important;
          display: block !important;
        }
        .history-scroller::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.03) !important;
          border-radius: 4px !important;
        }
        .history-scroller::-webkit-scrollbar-thumb {
          background: var(--primary-soft, #C9DDE0) !important;
          border-radius: 4px !important;
        }
        .history-scroller::-webkit-scrollbar-thumb:hover {
          background: var(--primary, #2E666E) !important;
        }
        @media (max-width: 868px) {
          .loyalty-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}} />
    </main>
  );
}
