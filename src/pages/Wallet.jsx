import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { 
  Gift, 
  Clock, 
  ChevronRight, 
  History, 
  Sparkles, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Tag, 
  ShieldCheck, 
  CheckCircle2, 
  Copy, 
  Check, 
  Users, 
  Stethoscope, 
  Activity, 
  X,
  Ticket,
  Plus,
  Loader2,
  Lock,
  Star,
  Zap,
  Heart,
  CreditCard,
  UserPlus,
  FileText
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getWalletAmount, getAppointmentHistory, getPlans } from "../services/dataService";

function formatPlanTitle(plan) {
  if (!plan) return "Reward Offer";
  const name = plan.plan_name || plan.name || plan.title || "";
  const code = plan.plan_code || plan.code || "";
  
  if (name && name !== code) {
    if (name === "WELCOME_BONUS") return "Welcome Registration Bonus";
    if (name === "REFERRAL_REFERRED") return "Referral Bonus (New User)";
    if (name === "REFERRAL_REFERRER") return "Referral Bonus (Referrer)";
    return name;
  }
  
  if (code === "OFFLINE_CASHBACK") return "Offline Payment Cashback";
  if (code === "REFERRAL_REFERRED") return "Referral Bonus (New User)";
  if (code === "REFERRAL_REFERRER") return "Referral Bonus (Referrer)";
  if (code === "REGISTRATION_BONUS" || code === "WELCOME_BONUS") return "Welcome Registration Bonus";
  
  const raw = name || code || "Reward Offer";
  return raw
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, c => c.toUpperCase());
}

function formatPlanSubtitle(plan) {
  if (!plan) return "Exclusive healthcare reward offer";
  if (plan.subtitle || plan.description || plan.details) {
    return plan.subtitle || plan.description || plan.details;
  }
  const val = parseFloat(plan.reward_value || plan.points || plan.reward_points || 0);
  const valStr = isNaN(val) ? "0" : (val % 1 === 0 ? val.toFixed(0) : val.toString());
  
  if (plan.reward_type === "percentage" || plan.reward_type === "percent") {
    const cap = plan.max_reward_cap ? ` (Up to ₹${plan.max_reward_cap})` : "";
    return `${valStr}% Cashback${cap} on eligible bookings`;
  }
  
  return `Flat ₹${valStr} reward cashback`;
}

const defaultOffers = [
  {
    id: "off-4",
    title: "Offline Payment Cashback",
    subtitle: "Flat ₹50 reward cashback",
    points: 50,
    validityDays: 30,
    badge: "30d left",
    badgeType: "timer",
    category: "Consultation",
    image: "/reward_doctor.png",
    code: "OFFLINE_CASHBACK"
  },
  {
    id: "off-3",
    title: "Referral Bonus (New User)",
    subtitle: "Flat ₹20 referral reward",
    points: 20,
    validityDays: 60,
    badge: "60d left",
    badgeType: "timer",
    category: "Wellness",
    image: "/reward_wellness.png",
    code: "REFERRAL_REFERRED"
  },
  {
    id: "off-2",
    title: "Referral Bonus (Referrer)",
    subtitle: "Flat ₹20 referral reward",
    points: 20,
    validityDays: 45,
    badge: "45d left",
    badgeType: "timer",
    category: "Wellness",
    image: "/reward_lab.png",
    code: "REFERRAL_REFERRER"
  },
  {
    id: "off-1",
    title: "Welcome Registration Bonus",
    subtitle: "Flat ₹100 welcome bonus",
    points: 100,
    validityDays: 30,
    badge: "30d left",
    badgeType: "timer",
    category: "Wellness",
    image: "/reward_pharmacy.png",
    code: "REGISTRATION_BONUS"
  }
];

const offerThemes = [
  { className: "is-green", icon: CreditCard },
  { className: "is-blue", icon: UserPlus },
  { className: "is-purple", icon: Users },
  { className: "is-orange", icon: Gift },
];

export default function Wallet() {
  const { user, openLoginModal } = useAuth();
  const storedUser = typeof window !== 'undefined' ? localStorage.getItem("arvaya_user") : null;
  const isLoggedIn = !!user || !!storedUser;

  const [rewardPoints, setRewardPoints] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [activeModal, setActiveModal] = useState(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [redeemedOffers, setRedeemedOffers] = useState([]);
  const [toastMessage, setToastMessage] = useState("");
  const [offers, setOffers] = useState(defaultOffers);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    let isMounted = true;
    async function fetchWalletData() {
      setLoading(true);
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

        if (!parsedUser) {
          setRewardPoints(0);
          setTransactions([]);
          setOffers([]);
          setLoading(false);
          return;
        }

        const patient_id = parsedUser?.id || parsedUser?.user_id || parsedUser?.patient_id || parsedUser?.app_user_id;
        if (!patient_id) {
          setRewardPoints(0);
          setTransactions([]);
          setOffers([]);
          setLoading(false);
          return;
        }

        // Fetch wallet amount, appointment history & rewards plans in parallel
        const [walletRes, historyRes, plansRes] = await Promise.all([
          getWalletAmount(patient_id).catch(err => {
            console.error("Failed to load wallet amount:", err);
            return null;
          }),
          getAppointmentHistory(patient_id).catch(err => {
            console.error("Failed to load appointment history:", err);
            return null;
          }),
          getPlans().catch(err => {
            console.error("Failed to load plans:", err);
            return null;
          })
        ]);

        if (!isMounted) return;

        // Process Wallet Amount
        if (walletRes) {
          let wData = Array.isArray(walletRes) ? walletRes[0] : walletRes;
          let pts = 0;

          if (typeof wData === 'number' || typeof wData === 'string') {
            pts = parseFloat(wData) || 0;
          } else if (wData && typeof wData === 'object') {
            const val = wData.wallet_amount ??
                        wData.wallet_balance ??
                        wData.walletBalance ??
                        wData.total_amount ??
                        wData.balance ??
                        wData.amount ??
                        wData.points ??
                        wData.reward_points ??
                        wData.total ??
                        (typeof wData.data === 'number' ? wData.data : 0);
            pts = parseFloat(val) || 0;
          }
          setRewardPoints(isNaN(pts) ? 0 : pts);
        }

        // Process Appointment History for Transaction History
        let rawTxList = [];
        if (historyRes) {
          if (Array.isArray(historyRes)) {
            rawTxList = historyRes;
          } else if (typeof historyRes === 'object' && historyRes !== null) {
            rawTxList = historyRes.history || historyRes.appointments || historyRes.data || historyRes.result || historyRes.list || historyRes.transactions || [];
            if (!Array.isArray(rawTxList) && typeof historyRes.data === 'object' && historyRes.data !== null) {
              rawTxList = historyRes.data.history || historyRes.data.appointments || historyRes.data.result || historyRes.data.list || historyRes.data.transactions || [];
            }
          }
        }

        // Fallback to walletRes embedded transactions if historyRes didn't yield items
        if (!Array.isArray(rawTxList) || rawTxList.length === 0) {
          const wData = Array.isArray(walletRes) ? walletRes[0] : walletRes;
          rawTxList = walletRes?.transactions || walletRes?.history || walletRes?.data?.transactions || wData?.transactions || wData?.history || [];
        }

        if (Array.isArray(rawTxList) && rawTxList.length > 0) {
          const formattedTx = rawTxList.map((t, idx) => {
            let title = t.title || t.description || t.remarks || t.doctor_name || t.drname || t.doctorName || t.dr_name || t.service_name || t.package_name;
            if (!title) {
              if (t.appointment_type) {
                title = `Appointment (${t.appointment_type})`;
              } else if (t.dr_id || t.drkey || t.doctor_id) {
                title = `Doctor Consultation #${t.id || t.appointment_id || idx + 1}`;
              } else {
                title = t.type === 'debit' ? 'Consultation Fee Discount' : 'Doctor Appointment Cashback';
              }
            }

            let rawDate = t.date || t.created_at || t.created_date || t.appointment_date || t.slot_date || t.booking_date;
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

            let type = t.type || t.transaction_type;
            if (!type) {
              if (t.status === 'cancelled' || t.status === 'refunded') {
                type = 'credit';
              } else if (t.amount < 0 || (typeof t.amount === 'string' && t.amount.startsWith('-'))) {
                type = 'debit';
              } else if (t.points && t.points < 0) {
                type = 'debit';
              } else {
                type = 'credit';
              }
            }

            let amountStr = "";
            if (t.amount !== undefined && t.amount !== null) {
              const s = String(t.amount);
              if (s.startsWith('+') || s.startsWith('-')) {
                amountStr = s.includes('pt') || s.includes('₹') ? s : `${s} pts`;
              } else {
                amountStr = `${type === 'debit' ? '-' : '+'}${s} pts`;
              }
            } else if (t.points !== undefined && t.points !== null) {
              const s = String(t.points);
              if (s.startsWith('+') || s.startsWith('-')) {
                amountStr = s;
              } else {
                amountStr = `${type === 'debit' ? '-' : '+'}${s} pts`;
              }
            } else if (t.fee || t.consultation_fee || t.price || t.total_amount) {
              const feeVal = t.fee || t.consultation_fee || t.price || t.total_amount;
              amountStr = `${type === 'debit' ? '-' : '+'}${feeVal} pts`;
            } else {
              amountStr = type === 'debit' ? '-100 pts' : '+100 pts';
            }

            return {
              id: t.id || t.appointment_id || t.transaction_id || idx + 1,
              title,
              date,
              amount: amountStr,
              type
            };
          });

          setTransactions(formattedTx);
        }

        // Process Plans for Your Rewards
        if (plansRes) {
          let rawPlanList = [];
          if (Array.isArray(plansRes)) {
            rawPlanList = plansRes;
          } else if (typeof plansRes === 'object' && plansRes !== null) {
            rawPlanList = plansRes.data || plansRes.plans || plansRes.result || plansRes.list || [];
          }

          if (Array.isArray(rawPlanList) && rawPlanList.length > 0) {
            const defaultImages = [
              "/reward_doctor.png",
              "/reward_wellness.png",
              "/reward_lab.png",
              "/reward_pharmacy.png",
              "/banner_appointments.png",
              "/banner_healthcare_1.png"
            ];

            const activePlans = rawPlanList.filter(p => p.is_active === undefined || p.is_active === null || p.is_active === 1 || p.is_active === "1");
            const plansToMap = activePlans.length > 0 ? activePlans : rawPlanList;

            const formattedOffers = plansToMap.map((p, idx) => {
              const title = formatPlanTitle(p);
              const subtitle = formatPlanSubtitle(p);
              
              const val = parseFloat(p.reward_value || p.points || p.reward_points || p.amount || 100);
              const pts = isNaN(val) ? 100 : Math.round(val);
              
              const validityDays = p.validity_days !== undefined && p.validity_days !== null ? p.validity_days : 30;
              const badge = `${validityDays}d left`;
              const badgeType = "timer";
              
              let category = "Consultation";
              const pCode = (p.plan_code || p.plan_name || "").toUpperCase();
              if (pCode.includes("REFERRAL")) category = "Wellness";
              else if (pCode.includes("REGISTRATION") || pCode.includes("WELCOME")) category = "Wellness";
              else if (pCode.includes("OFFLINE")) category = "Consultation";

              const image = p.image || p.img || p.banner || defaultImages[idx % defaultImages.length];
              const code = p.plan_code || p.code || p.coupon_code || `ARVAYA${pts}`;

              return {
                id: p.id || p.plan_id || `plan-${idx + 1}`,
                title,
                subtitle,
                points: pts,
                validityDays,
                rewardValue: p.reward_value || pts,
                rewardType: p.reward_type || "flat",
                maxRewardCap: p.max_reward_cap,
                badge,
                badgeType,
                category,
                image,
                code,
                raw: p
              };
            });

            if (formattedOffers.length > 0) {
              setOffers(formattedOffers);
            }
          }
        }
      } catch (err) {
        console.error("Failed to load wallet data:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchWalletData();

    return () => {
      isMounted = false;
    };
  }, [user]);

  const categories = ["All", "Consultation", "Medicines", "Lab Tests", "Wellness"];

  const filteredOffers = offers.filter(o => 
    selectedCategory === "All" || o.category === selectedCategory
  );

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  };

  const handleRedeem = (offer) => {
    if (rewardPoints < offer.points) {
      showToast(`You need ${offer.points - rewardPoints} more points to redeem this offer.`);
      return;
    }

    setRewardPoints(prev => prev - offer.points);
    setRedeemedOffers(prev => [...prev, offer.id]);
    
    const newTx = {
      id: Date.now(),
      title: `Redeemed: ${offer.title}`,
      date: "Just now",
      amount: `-${offer.points} pts`,
      type: "debit"
    };
    
    setTransactions(prev => [newTx, ...prev]);
    setActiveModal(offer);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    showToast("Voucher code copied to clipboard!");
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const addDemoPoints = (pts) => {
    setRewardPoints(prev => prev + pts);
    const newTx = {
      id: Date.now(),
      title: "Bonus Reward Points",
      date: "Just now",
      amount: `+${pts} pts`,
      type: "credit"
    };
    setTransactions(prev => [newTx, ...prev]);
    showToast(`Added +${pts} Reward Points!`);
  };

  return (
    <main className="page wallet-page">
      {toastMessage && typeof document !== "undefined" && createPortal(
        <div className="wallet-toast" role="status">
          <Sparkles size={16} />
          {toastMessage}
        </div>,
        document.body
      )}

      <header style={{ padding: '16px 0 0' }}>
        <div className="container">
          <div
            style={{
              position: 'relative',
              overflow: 'hidden',
              borderRadius: '26px',
              padding: '24px 32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px',
              flexWrap: 'wrap',
              color: '#fff',
              background:
                'linear-gradient(120deg, rgba(255,255,255,0.08), transparent 45%), linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 62%, #133a41 100%)',
              border: '1px solid rgba(255,255,255,0.15)',
              boxShadow: '0 20px 44px rgba(31, 79, 87, 0.28)',
            }}
          >
            <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: '52px', height: '52px', borderRadius: '16px', flexShrink: 0,
                background: '#fff', color: 'var(--primary-dark)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 12px 24px rgba(0,60,55,0.2)', transform: 'rotate(-6deg)'
              }}>
                <Gift size={26} />
              </div>
              <div>
                <h1 style={{ fontSize: '24px', fontWeight: '800', margin: '0 0 4px', color: '#fff', letterSpacing: '-0.02em' }}>Arvaya Wallet</h1>
                <p style={{ margin: '0 0 10px', fontSize: '13px', color: 'rgba(255,255,255,0.82)' }}>Track reward points and redeem healthcare benefits.</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {[
                    { icon: Star, label: 'Reward Points', color: '#fbbf24' },
                    { icon: Zap, label: 'Instant Redeem', color: '#2dd4bf' },
                    { icon: Heart, label: 'Healthcare Benefits', color: '#5eead4' },
                  ].map(({ icon: Icon, label, color }) => (
                    <span key={label} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 10px', color: '#fff', background: 'rgba(18,51,58,0.5)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', fontSize: '11.5px', fontWeight: '650', backdropFilter: 'blur(10px)' }}>
                      <Icon size={13} color={color} /> {label}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <img src="/images/arvaya-wallet.png" alt="" className="wallet-hero-img" aria-hidden="true" />
          </div>
        </div>
      </header>

      <div className="container wallet-shell">
        <div className="wallet-layout">
          <section className="wallet-primary-column">
            <article className="wallet-balance-card">
              <div className="wallet-balance-head">
                <div>
                  <span className="wallet-eyebrow"><span className="wallet-eyebrow-badge"><Star size={13} /></span> Available reward balance</span>
                  <div className="wallet-balance-value" aria-label={`${rewardPoints} reward points`}>
                    {loading ? <Loader2 size={34} className="animate-spin" /> : rewardPoints.toLocaleString()}
                    {!loading && <small>points</small>}
                  </div>
                </div>
                <div className="wallet-balance-art">
                  <span className="wallet-balance-tagline">Small Points,<br />Big Care</span>
                  <span className="wallet-coin wallet-coin-1">₹</span>
                  <span className="wallet-coin wallet-coin-2">₹</span>
                  <span className="wallet-coin wallet-coin-3">₹</span>
                  <img src="/images/wallet-gift.png" alt="" className="wallet-balance-icon" />
                </div>
              </div>
              <div className="wallet-balance-foot">
                <span><Ticket size={17} /> Redeem on your next booking</span>
                <span className="wallet-value-chip"><ShieldCheck size={15} /> 1 point = ₹1</span>
              </div>
            </article>

          </section>

          <section className="wallet-panel wallet-rewards-panel">
            <div className="wallet-panel-heading">
              <div className="wallet-section-title">
                <span className="wallet-section-icon accent"><Gift size={20} /></span>
                <div>
                  <h2>Your Rewards</h2>
                  <p>Available offers and vouchers</p>
                </div>
              </div>
              {isLoggedIn && filteredOffers.length > 0 && (
                <div className="wallet-panel-heading-actions">
                  <span className="wallet-count-badge">{filteredOffers.length} offers</span>
                  <a href="#your-rewards" className="wallet-view-all-link">View All <ArrowUpRight size={14} /></a>
                </div>
              )}
            </div>

            {!isLoggedIn ? (
              <div className="wallet-empty-state rewards-empty">
                <span className="wallet-empty-icon"><Gift size={22} /></span>
                <h3>Log in to view rewards</h3>
                <p>Access your exclusive healthcare rewards.</p>
                <button type="button" className="wallet-primary-button" onClick={() => openLoginModal && openLoginModal()}>
                  Log In / Sign Up
                </button>
              </div>
            ) : filteredOffers.length === 0 ? (
              <div className="wallet-empty-state compact rewards-empty">
                <span className="wallet-empty-icon"><Gift size={22} /></span>
                <h3>No rewards available</h3>
                <p>New offers will appear here.</p>
              </div>
            ) : (
              <div className="wallet-offers-list">
                {filteredOffers.map((offer, index) => {
                  const isRedeemed = redeemedOffers.includes(offer.id);
                  const theme = offerThemes[index % offerThemes.length];
                  const ThemeIcon = theme.icon;
                  return (
                    <button
                      type="button"
                      key={offer.id}
                      className={`wallet-offer-card ${theme.className} ${isRedeemed ? "is-redeemed" : ""}`}
                      onClick={() => !isRedeemed && handleRedeem(offer)}
                      disabled={isRedeemed}
                    >
                      <span className="wallet-offer-media">
                        <ThemeIcon size={20} />
                      </span>
                      <span className="wallet-offer-meta">
                        <span className="wallet-points-chip"><Sparkles size={12} /> {offer.points} pts</span>
                        <span className="wallet-validity"><Clock size={12} /> {offer.badge}</span>
                      </span>
                      <span className="wallet-offer-content">
                        <strong>{offer.title}</strong>
                        <small>{offer.subtitle}</small>
                        <span className="wallet-offer-action">
                          {isRedeemed ? <><Check size={14} /> Redeemed</> : <>Redeem <ChevronRight size={15} /></>}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </section>

          <section className="wallet-panel wallet-history-panel">
            <div className="wallet-panel-heading">
              <div className="wallet-section-title">
                <span className="wallet-section-icon"><History size={20} /></span>
                <div>
                  <h2>Transaction History</h2>
                  <p>Your recent wallet activity</p>
                </div>
              </div>
              {isLoggedIn && transactions.length > 0 && (
                <span className="wallet-count-badge">All Transactions</span>
              )}
            </div>

            {!isLoggedIn ? (
              <div className="wallet-empty-state">
                <span className="wallet-empty-icon"><Lock size={22} /></span>
                <h3>Log in to view transaction history</h3>
                <p>Track every point you earn and redeem.</p>
                <button type="button" className="wallet-primary-button" onClick={() => openLoginModal && openLoginModal()}>
                  Log In / Sign Up
                </button>
              </div>
            ) : transactions.length === 0 ? (
              <div className="wallet-empty-state compact">
                <span className="wallet-empty-icon"><History size={22} /></span>
                <h3>No transactions yet</h3>
                <p>Your wallet activity will appear here.</p>
              </div>
            ) : (
              <>
                <div className="wallet-transaction-table">
                  <div className="wallet-transaction-row wallet-transaction-head">
                    <span>Date</span>
                    <span>Description</span>
                    <span>Points</span>
                    <span>Type</span>
                    <span>Status</span>
                  </div>
                  {transactions.map(tx => (
                    <div className="wallet-transaction-row" key={tx.id}>
                      <span className="wallet-transaction-date">
                        <span className={`wallet-transaction-icon ${tx.type}`}>
                          {tx.type === "credit" ? <ArrowDownLeft size={15} /> : <ArrowUpRight size={15} />}
                        </span>
                        {tx.date}
                      </span>
                      <span className="wallet-transaction-desc">{tx.title}</span>
                      <span className={`wallet-transaction-points ${tx.type}`}>{tx.amount}</span>
                      <span><span className={`wallet-transaction-badge ${tx.type}`}>{tx.type === "credit" ? "Earned" : "Redeemed"}</span></span>
                      <span><span className="wallet-transaction-badge is-status">Completed</span></span>
                    </div>
                  ))}
                </div>
                <div className="wallet-transaction-end">
                  <FileText size={20} />
                  <b>That's all for now!</b>
                  <span>Your future transactions will appear here.</span>
                </div>
              </>
            )}
          </section>
        </div>
      </div>

      {activeModal && typeof document !== "undefined" && createPortal(
        <div className="wallet-modal-backdrop" role="presentation">
          <section className="wallet-modal" role="dialog" aria-modal="true" aria-labelledby="wallet-modal-title">
            <button type="button" className="wallet-modal-close" onClick={() => setActiveModal(null)} aria-label="Close reward details">
              <X size={18} />
            </button>
            <div className="wallet-modal-icon"><Gift size={29} /></div>
            <h2 id="wallet-modal-title">{activeModal.title}</h2>
            <p>{activeModal.subtitle}</p>
            <div className="wallet-modal-summary">
              <span><Clock size={14} /> {activeModal.validityDays || 30} days validity</span>
              <span><Sparkles size={14} /> {activeModal.points} points</span>
            </div>
            <div className="wallet-voucher-box">
              <span>Plan code / voucher</span>
              <strong>{activeModal.code}</strong>
              <button type="button" onClick={() => copyToClipboard(activeModal.code)}>
                {copiedCode ? <Check size={15} /> : <Copy size={15} />}
                {copiedCode ? "Code Copied" : "Copy Voucher Code"}
              </button>
            </div>
            <div className="wallet-modal-note">
              <ShieldCheck size={17} />
              <span>Use <strong>{activeModal.code}</strong> during checkout within {activeModal.validityDays || 30} days.</span>
            </div>
            <button type="button" className="wallet-modal-done" onClick={() => setActiveModal(null)}>Done</button>
          </section>
        </div>,
        document.body
      )}
    </main>
  );
}
