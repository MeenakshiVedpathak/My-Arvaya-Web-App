import React, { useState, useEffect } from "react";
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
  Award,
  Loader2
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getWalletAmount, getAppointmentHistory, getPlans } from "../services/dataService";

const defaultOffers = [
  {
    id: "off-1",
    title: "Flat ₹100 off",
    subtitle: "On your first appointment booking",
    points: 120,
    badge: "2d left",
    badgeType: "timer",
    category: "Consultation",
    image: "/reward_doctor.png",
    code: "ARVAYA100"
  },
  {
    id: "off-2",
    title: "Free Consultation",
    subtitle: "Redeem for any specialist visit",
    points: 250,
    badge: "12d left",
    badgeType: "timer",
    category: "Consultation",
    image: "/reward_lab.png",
    code: "FREECONSULT"
  },
  {
    id: "off-3",
    title: "20% Off Medicines",
    subtitle: "Valid on pharmacy orders above ₹499",
    points: 180,
    badge: "47k used",
    badgeType: "users",
    category: "Medicines",
    image: "/reward_pharmacy.png",
    code: "MEDS20OFF"
  },
  {
    id: "off-4",
    title: "Full Body Checkup",
    subtitle: "Includes lipid profile & HbA1c test",
    points: 320,
    badge: "14k used",
    badgeType: "users",
    category: "Lab Tests",
    image: "/reward_wellness.png",
    code: "CHECKUP320"
  },
  {
    id: "off-5",
    title: "Flat ₹200 Off Dental",
    subtitle: "On dental cleanings & consultations",
    points: 150,
    badge: "5d left",
    badgeType: "timer",
    category: "Consultation",
    image: "/banner_appointments.png",
    code: "DENTAL200"
  },
  {
    id: "off-6",
    title: "Free Eye Screening",
    subtitle: "Complete optical & vision assessment",
    points: 90,
    badge: "8d left",
    badgeType: "timer",
    category: "Wellness",
    image: "/banner_healthcare_1.png",
    code: "EYECARE90"
  }
];

export default function Wallet() {
  const { user } = useAuth();
  const [rewardPoints, setRewardPoints] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [activeModal, setActiveModal] = useState(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [redeemedOffers, setRedeemedOffers] = useState([]);
  const [toastMessage, setToastMessage] = useState("");
  const [offers, setOffers] = useState(defaultOffers);

  const [transactions, setTransactions] = useState([
    { id: 1, title: "Registration Bonus", date: "Today, 4:30 PM", amount: "+100 pts", type: "credit" },
    { id: 2, title: "Doctor Appointment Cashback", date: "10 Jul 2026", amount: "+120 pts", type: "credit" },
    { id: 3, title: "Consultation Fee Discount", date: "08 Jul 2026", amount: "-100 pts", type: "debit" },
    { id: 4, title: "Referral Bonus – Amit", date: "05 Jul 2026", amount: "+200 pts", type: "credit" },
    { id: 5, title: "Lab Test Cashback", date: "02 Jul 2026", amount: "+80 pts", type: "credit" },
    { id: 6, title: "Profile Completion Bonus", date: "28 Jun 2026", amount: "+50 pts", type: "credit" },
    { id: 7, title: "Pharmacy Coupon Redeemed", date: "20 Jun 2026", amount: "-180 pts", type: "debit" }
  ]);

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

        const patient_id = parsedUser?.id || parsedUser?.user_id || parsedUser?.patient_id || parsedUser?.app_user_id || 20546;

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

        console.log("Fetched wallet amount response:", walletRes);
        console.log("Fetched appointment history response:", historyRes);
        console.log("Fetched plans response:", plansRes);

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
            rawPlanList = plansRes.plans || plansRes.data || plansRes.result || plansRes.list || [];
          }

          if (Array.isArray(rawPlanList) && rawPlanList.length > 0) {
            const defaultImages = [
              "/reward_doctor.png",
              "/reward_lab.png",
              "/reward_pharmacy.png",
              "/reward_wellness.png",
              "/banner_appointments.png",
              "/banner_healthcare_1.png"
            ];

            const formattedOffers = rawPlanList.map((p, idx) => {
              const title = p.title || p.name || p.plan_name || p.package_name || p.reward_name || `Reward Offer #${idx + 1}`;
              const subtitle = p.subtitle || p.description || p.details || p.short_desc || p.summary || "Exclusive healthcare reward offer";
              
              let pts = 100;
              if (p.points !== undefined && p.points !== null) {
                pts = parseInt(p.points) || 100;
              } else if (p.reward_points) {
                pts = parseInt(p.reward_points) || 100;
              } else if (p.amount || p.price) {
                pts = Math.round(parseFloat(p.amount || p.price) || 100);
              }

              const category = p.category || p.type || p.plan_type || (idx % 2 === 0 ? "Consultation" : "Lab Tests");
              const badge = p.badge || p.validity || (p.duration ? `${p.duration}d left` : `${((idx % 5) + 2) * 3}d left`);
              const badgeType = p.badgeType || (idx % 2 === 0 ? "timer" : "users");
              const image = p.image || p.img || p.banner || defaultImages[idx % defaultImages.length];
              const code = p.code || p.coupon_code || p.voucher_code || p.plan_code || `ARVAYA${pts}`;

              return {
                id: p.id || p.plan_id || `plan-${idx + 1}`,
                title,
                subtitle,
                points: pts,
                badge,
                badgeType,
                category,
                image,
                code
              };
            });

            setOffers(formattedOffers);
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
    <main className="page" style={{ background: 'var(--bg-app)', minHeight: '100vh', paddingBottom: '60px' }}>
      
      {/* Toast Notification */}
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
      <div style={{ background: 'var(--bg-surface)', padding: '24px 0', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <div className="flex items-center gap-2 text-muted mb-2" style={{ fontSize: '12px', fontWeight: '500' }}>
            <Link to="/" className="hover:text-primary">Home</Link> <ChevronRight size={12} /> <span>My Rewards</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h1 className="text-h2" style={{ fontSize: '26px', fontWeight: '800', color: 'var(--text-main)', margin: 0 }}>My Rewards</h1>
              <p className="text-muted mt-1" style={{ fontSize: '14px', margin: '4px 0 0 0' }}>
                Earn reward points on bookings & redeem exclusive healthcare benefits.
              </p>
            </div>
            <button 
              onClick={() => addDemoPoints(100)}
              className="btn hover-glow"
              style={{
                background: 'linear-gradient(135deg, var(--accent), var(--accent-hover))',
                color: 'white',
                border: 'none',
                padding: '10px 18px',
                borderRadius: '12px',
                fontSize: '13px',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer'
              }}
            >
              <Plus size={16} /> Earn Free 100 Pts
            </button>
          </div>
        </div>
      </div>

      <div className="container" style={{ paddingTop: '28px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '32px' }} className="wallet-layout">

          {/* LEFT COLUMN: Reward Points Top Card & Restored Transaction History UI */}
          <section style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            
            {/* Dark Teal Reward Points Card (Exact match to reference image) */}
            <div style={{
              background: 'linear-gradient(135deg, #0F4D58 0%, #0A343C 100%)',
              borderRadius: '20px',
              padding: '28px 32px',
              color: 'white',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 12px 30px rgba(15, 77, 88, 0.25)',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              {/* Background glow circle */}
              <div style={{
                position: 'absolute',
                top: '-40px',
                right: '-40px',
                width: '240px',
                height: '240px',
                background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)',
                borderRadius: '50%',
                pointerEvents: 'none'
              }} />

              {/* Top Row: Label & Gift Icon */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>
                <div>
                  <span style={{
                    fontSize: '12px',
                    fontWeight: '700',
                    letterSpacing: '1px',
                    color: 'rgba(255, 255, 255, 0.75)',
                    textTransform: 'uppercase',
                    display: 'block',
                    marginBottom: '10px'
                  }}>
                    YOUR REWARD POINTS
                  </span>
                  
                  {/* Big Bold Points Display */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minHeight: '48px' }}>
                    {loading ? (
                      <Loader2 size={32} className="animate-spin" style={{ color: 'white' }} />
                    ) : (
                      <span style={{ fontSize: '48px', fontWeight: '900', color: 'white', lineHeight: 1, letterSpacing: '-0.5px' }}>
                        {rewardPoints.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>

                {/* Gift Icon Box */}
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '16px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  backdropFilter: 'blur(8px)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                }}>
                  <Gift size={28} color="#FFFFFF" strokeWidth={1.75} />
                </div>
              </div>

              {/* Footer Note inside card */}
              <div style={{
                marginTop: '28px',
                paddingTop: '16px',
                borderTop: '1px solid rgba(255, 255, 255, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px',
                position: 'relative',
                zIndex: 1
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(255, 255, 255, 0.85)', fontSize: '14px', fontWeight: '500' }}>
                  <Ticket size={16} color="var(--accent)" />
                  <span>Redeem on your next booking</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', background: 'rgba(255,255,255,0.12)', padding: '4px 12px', borderRadius: '99px', color: '#E4EEEF', fontWeight: '600' }}>
                  <Award size={14} color="var(--accent)" /> 1 Pt = ₹1 Value
                </div>
              </div>
            </div>

            {/* RESTORED ORIGINAL UI: Transaction History Section with Scrollbar */}
            <div>
              <div style={{ padding: '16px 0', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <History size={20} /> Transaction History
                </h3>
                <span className="text-primary cursor-pointer hover:underline" style={{ fontSize: '13px', fontWeight: '600' }}>Download PDF</span>
              </div>
              
              {/* Scrollable Container for Transaction History */}
              <div style={{
                maxHeight: '360px',
                overflowY: 'auto',
                paddingRight: '6px',
                display: 'flex',
                flexDirection: 'column'
              }} className="custom-scroller">
                {transactions.map((tx, idx) => (
                  <div key={tx.id} style={{ display: 'flex', alignItems: 'center', padding: '16px 0', borderBottom: idx !== transactions.length - 1 ? '1px solid var(--border)' : 'none' }}>
                    
                    <div style={{ 
                      background: tx.type === 'credit' ? '#dcfce7' : '#f1f5f9', 
                      color: tx.type === 'credit' ? '#16a34a' : 'var(--text-main)', 
                      width: '44px', height: '44px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '16px', flexShrink: 0 
                    }}>
                      {tx.type === 'credit' ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                    </div>
                    
                    <div style={{ flex: 1 }}>
                      <b style={{ fontSize: '15px', color: 'var(--text-main)', display: 'block', marginBottom: '4px' }}>{tx.title}</b>
                      <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{tx.date}</span>
                    </div>
                    
                    <div style={{ textAlign: 'right' }}>
                      <strong style={{ fontSize: '16px', color: tx.type === 'credit' ? '#16a34a' : 'var(--text-main)', display: 'block' }}>
                        {tx.amount}
                      </strong>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                        {tx.type === 'credit' ? 'Earned' : 'Redeemed'}
                      </span>
                    </div>

                  </div>
                ))}
              </div>
            </div>



          </section>

          {/* RIGHT COLUMN: Your Rewards Section with White Background Cards */}
          <aside style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* Header: Title & Count Badge */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-main)', margin: 0 }}>
                Your Rewards
              </h2>
              <span style={{
                background: '#1D3B40',
                color: '#6EE7B7',
                fontSize: '12px',
                fontWeight: '700',
                padding: '4px 12px',
                borderRadius: '99px'
              }}>
                {offers.length} offers
              </span>
            </div>

           

            {/* Scrollable Container for Reward Cards */}
            <div style={{
              maxHeight: '560px',
              overflowY: 'auto',
              paddingRight: '6px',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(165px, 1fr))',
              gap: '16px'
            }} className="custom-scroller offers-grid">
              {filteredOffers.map(offer => {
                const isRedeemed = redeemedOffers.includes(offer.id);
                return (
                  <div
                    key={offer.id}
                    onClick={() => handleRedeem(offer)}
                    className="hover-glow"
                    style={{
                      borderRadius: '16px',
                      overflow: 'hidden',
                      background: '#FFFFFF', // Clean White Card Background
                      boxShadow: '0 4px 16px rgba(18, 51, 58, 0.08), 0 1px 3px rgba(0, 0, 0, 0.04)',
                      border: '1px solid var(--border)',
                      display: 'flex',
                      flexDirection: 'column',
                      position: 'relative',
                      cursor: isRedeemed ? 'default' : 'pointer',
                      transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                    }}
                  >
                    {/* Top Image Container */}
                    <div style={{
                      position: 'relative',
                      height: '115px',
                      width: '100%',
                      background: '#F1F5F9',
                      overflow: 'hidden'
                    }}>
                      <img 
                        src={offer.image} 
                        alt={offer.title}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                      />

                      {/* Top Right Duration / Usage Badge */}
                      <div style={{
                        position: 'absolute',
                        top: '8px',
                        right: '8px',
                        background: 'rgba(15, 23, 42, 0.75)',
                        backdropFilter: 'blur(6px)',
                        color: '#FFFFFF',
                        fontSize: '11px',
                        fontWeight: '600',
                        padding: '4px 10px',
                        borderRadius: '99px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
                      }}>
                        {offer.badgeType === 'timer' ? <Clock size={12} /> : <Users size={12} />}
                        <span>{offer.badge}</span>
                      </div>

                      {/* Bottom Left Points Overlay Tag */}
                      <div style={{
                        position: 'absolute',
                        bottom: '8px',
                        left: '8px',
                        background: 'rgba(15, 23, 42, 0.85)',
                        backdropFilter: 'blur(6px)',
                        color: '#2DD4BF',
                        fontSize: '11px',
                        fontWeight: '700',
                        padding: '4px 10px',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
                      }}>
                        <Sparkles size={11} color="#2DD4BF" />
                        <span>+ {offer.points} pts</span>
                      </div>

                      {/* Redeemed Watermark Overlay if already redeemed */}
                      {isRedeemed && (
                        <div style={{
                          position: 'absolute',
                          inset: 0,
                          background: 'rgba(22, 101, 52, 0.88)',
                          backdropFilter: 'blur(2px)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontSize: '12px',
                          fontWeight: '800',
                          gap: '6px'
                        }}>
                          <Check size={16} /> Redeemed
                        </div>
                      )}
                    </div>

                    {/* White Content Area Background */}
                    <div style={{ 
                      background: '#FFFFFF', // Pure White Content Background
                      padding: '16px 14px', 
                      display: 'flex', 
                      flexDirection: 'column', 
                      flex: 1 
                    }}>
                      <b style={{
                        fontSize: '15px',
                        fontWeight: '800',
                        color: 'var(--text-main)', // Dark charcoal text
                        display: 'block',
                        marginBottom: '6px',
                        lineHeight: 1.25,
                        letterSpacing: '-0.2px'
                      }}>
                        {offer.title}
                      </b>

                      <p style={{
                        fontSize: '12px',
                        color: 'var(--text-muted)', // Muted text
                        margin: 0,
                        lineHeight: 1.4,
                        fontWeight: '400'
                      }}>
                        {offer.subtitle}
                      </p>
                    </div>

                  </div>
                );
              })}
            </div>

          </aside>

        </div>
      </div>

      {/* Redemption Confirmation Modal */}
      {activeModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          zIndex: 9990,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            background: 'var(--bg-surface)',
            borderRadius: '24px',
            maxWidth: '440px',
            width: '100%',
            padding: '28px',
            boxShadow: 'var(--shadow-xl)',
            position: 'relative',
            animation: 'fadeIn 0.2s ease-out'
          }}>
            <button 
              onClick={() => setActiveModal(null)}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'var(--bg-app)',
                border: 'none',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'var(--text-muted)'
              }}
            >
              <X size={18} />
            </button>

            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: 'var(--accent-light)',
                color: 'var(--accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px auto',
                boxShadow: '0 8px 16px rgba(251, 145, 63, 0.2)'
              }}>
                <Gift size={32} />
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-main)', margin: '0 0 4px 0' }}>
                Offer Unlocked!
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
                {activeModal.title} – {activeModal.subtitle}
              </p>
            </div>

            {/* Voucher Box */}
            <div style={{
              background: 'var(--bg-app)',
              borderRadius: '16px',
              padding: '16px',
              border: '2px dashed var(--primary-soft)',
              textAlign: 'center',
              marginBottom: '20px'
            }}>
              <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: '700', letterSpacing: '0.5px' }}>
                YOUR VOUCHER CODE
              </span>
              <div style={{
                fontSize: '24px',
                fontWeight: '900',
                color: 'var(--primary)',
                letterSpacing: '2px',
                margin: '8px 0',
                fontFamily: 'monospace'
              }}>
                {activeModal.code}
              </div>
              <button
                onClick={() => copyToClipboard(activeModal.code)}
                style={{
                  background: copiedCode ? '#DCFCE7' : 'var(--primary)',
                  color: copiedCode ? '#166534' : 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                {copiedCode ? <Check size={14} /> : <Copy size={14} />}
                {copiedCode ? "Code Copied!" : "Copy Voucher Code"}
              </button>
            </div>

            <div style={{
              fontSize: '12px',
              color: 'var(--text-muted)',
              lineHeight: 1.5,
              background: 'var(--bg-app)',
              padding: '12px',
              borderRadius: '10px',
              marginBottom: '20px'
            }}>
              💡 Apply this voucher code during appointment review or checkout to instantly redeem your reward.
            </div>

            <button
              onClick={() => setActiveModal(null)}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '12px',
                background: 'var(--text-main)',
                color: 'white',
                border: 'none',
                fontSize: '14px',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Embedded Custom Scroller & Responsive Styles */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scroller::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scroller::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.03);
          border-radius: 4px;
        }
        .custom-scroller::-webkit-scrollbar-thumb {
          background: var(--primary-soft);
          border-radius: 4px;
        }
        .custom-scroller::-webkit-scrollbar-thumb:hover {
          background: var(--primary);
        }
        @media (max-width: 1024px) {
          .wallet-layout {
            grid-template-columns: 1fr !important;
          }
        }
        @media (max-width: 480px) {
          .offers-grid {
            grid-template-columns: 1fr 1fr !important;
          }
        }
      `}} />
    </main>
  );
}
