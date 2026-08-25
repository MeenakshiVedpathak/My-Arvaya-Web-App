import { useState, useEffect } from "react";
import { CheckCircle2, User, Calendar, Clock, Stethoscope, Briefcase, Wallet, XCircle, FileText, Smartphone } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useBooking } from "../../context/BookingContext";
import { useAuth } from "../../context/AuthContext";
import { bookAppointment, getWalletAmount, checkVisitType, verifyPayment } from "../../services/dataService";
import BookingLayout from "../../components/layout/BookingLayout";

export default function BookingReview() {
  const { doctor, date, slot, setBookingId } = useBooking();
  const navigate = useNavigate();
  const { user, openLoginModal } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  
  const [loadingData, setLoadingData] = useState(true);
  const [walletBalance, setWalletBalance] = useState(0);
  const [visitType, setVisitType] = useState("Initial");
  const [consultationFee, setConsultationFee] = useState(0);
  
  const [applyWallet, setApplyWallet] = useState(false);
  const [walletAppliedAmount, setWalletAppliedAmount] = useState(0);

  useEffect(() => {
    async function loadData() {
      if (!doctor || !date || !user) {
        setLoadingData(false);
        return;
      }
      try {
        const dStr = typeof date === 'string' ? date : (date instanceof Date ? date.toISOString().split('T')[0] : "");
        const patient_id = user?.id || user?.user_id || user?.patient_id || 20546;

        const [walletRes, visitRes] = await Promise.all([
          getWalletAmount(patient_id),
          checkVisitType({ patient_id, drkey: doctor.id || doctor.drkey, date: dStr })
        ]);

        let bal = 0;
        let wData = Array.isArray(walletRes) ? walletRes[0] : walletRes;
        if (typeof wData === 'number' || typeof wData === 'string') {
          bal = parseFloat(wData) || 0;
        } else if (wData && typeof wData === 'object') {
          bal = parseFloat(wData.total_amount || wData.balance || wData.amount || wData.wallet_balance || wData.wallet_amount || wData.walletBalance || wData.total || 0);
        }
        setWalletBalance(isNaN(bal) ? 0 : bal);

        let vData = Array.isArray(visitRes) ? visitRes[0] : visitRes;
        const vType = vData?.visit_type || vData?.type || vData?.Consultation_type || "Initial";
        const cFee = parseFloat(vData?.fee || vData?.amount || vData?.Consultation_Fee || doctor.fee || 0);
        
        setVisitType(vType);
        setConsultationFee(isNaN(cFee) ? 0 : cFee);
        
      } catch (err) {
        console.error("Error loading review data", err);
      } finally {
        setLoadingData(false);
      }
    }
    loadData();
  }, [doctor, date, user]);

  const maxWalletApplicable = Math.min(walletBalance, consultationFee);
  
  useEffect(() => {
    if (applyWallet) {
      setWalletAppliedAmount(maxWalletApplicable);
    } else {
      setWalletAppliedAmount(0);
    }
  }, [applyWallet, maxWalletApplicable]);

  const handleWalletInputChange = (e) => {
    let val = parseFloat(e.target.value);
    if (isNaN(val)) val = 0;
    if (val > maxWalletApplicable) val = maxWalletApplicable;
    if (val < 0) val = 0;
    setWalletAppliedAmount(val);
  };
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const confirm = async () => {
    if (!user) {
      openLoginModal("/doctors/review");
      return;
    }
    setSubmitting(true);
    try {
      const patient_id = user?.id || user?.user_id || user?.patient_id || "";
      const dStrRaw = typeof date === 'string' ? date : (date instanceof Date ? date.toISOString().split('T')[0] : "");
      const dStr = dStrRaw.replace(/-/g, '');
      
      let start = slot;
      let end = slot;
      let sessionVal = "";
      if (slot && slot.includes('-')) {
        const parts = slot.split('-');
        start = parts[0].trim();
        end = parts[1].trim();
        sessionVal = `${start}-${end}`;
      }

      const payload = {
        patient_id: patient_id,
        dr: doctor.id || doctor.drkey,
        entitylocation: doctor.locations?.[0]?.location_key || "",
        date: dStr,
        start: start,
        end: end,
        entitykey: "secure-hospitals",
        session: "",
        sessionval: sessionVal ? sessionVal : `${slot}-${slot}`,
        appnotes: "",
        referred_by: "",
        referredbykey: "",
        extphid: user?.external_id || "",
        fname: user?.name || "Guest",
        phone: user?.mobile || user?.phone || "N/A",
        wallet_amount_used: applyWallet ? walletAppliedAmount : 0
      };
      
      const result = await bookAppointment(payload);

      const amountToPay = consultationFee - (applyWallet ? walletAppliedAmount : 0);

      if (amountToPay <= 0) {
        setBookingId(result.order_id || result.bookingId || "APMNT" + Date.now().toString().slice(-8));
        navigate("/doctors/confirmed");
        return;
      }

      const res = await loadRazorpayScript();
      if (!res) {
        alert("Razorpay SDK failed to load. Are you offline?");
        setSubmitting(false);
        return;
      }

      const options = {
        key: "rzp_test_Awy3RfMG9T9BYe",
        amount: amountToPay * 100,
        currency: "INR",
        name: "Arvaya Healthcare",
        description: "Doctor Consultation",
        order_id: result.razorpay_order_id,
        handler: async function (response) {
          try {
            await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              ...payload
            });
            setBookingId(result.razorpay_order_id || result.bookingId || "APMNT" + Date.now().toString().slice(-8));
            navigate("/doctors/confirmed");
          } catch (err) {
            console.error("Payment verification failed", err);
            alert("Payment verification failed. Please contact support.");
            setSubmitting(false);
          }
        },
        prefill: {
          name: user?.name || "Guest",
          contact: user?.mobile || user?.phone || "",
        },
        theme: {
          color: "#2e666e",
        },
        modal: {
          ondismiss: function() {
            setSubmitting(false);
          }
        }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();

    } catch (err) {
      console.error(err);
      if (err.status === 409) {
        alert(err.message || "Slot already booked");
      } else {
        alert("Booking failed. Please try again.");
      }
      setSubmitting(false);
    }
  };
  const formattedDate = date && date instanceof Date
    ? date.toLocaleDateString('en-GB', { weekday: 'short', month: 'short', day: '2-digit', year: 'numeric' })
    : String(date);

  if (!doctor || !date || !slot) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <p>Incomplete booking details. Redirecting...</p>
        <button onClick={() => navigate("/doctors")} className="btn btn-primary">Start Over</button>
      </div>
    );
  }

  const finalAmountToPay = consultationFee - (applyWallet ? walletAppliedAmount : 0);

  return (
    <BookingLayout 
      currentStep={5} 
      title="Confirm Booking" 
      subtitle="Please review your appointment details before confirming."
    >
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
        <div className="styled-scrollbar" style={{ flex: 1, minHeight: 0, overflowY: 'auto', paddingRight: '4px', paddingBottom: '12px' }}>
          {loadingData ? (
            <div style={{ padding: '60px', textAlign: 'center', display: 'flex', justifyContent: 'center' }}>
              <div className="spinner" style={{ width: '40px', height: '40px', borderTopColor: 'var(--primary)', border: '3px solid rgba(0,0,0,0.1)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
            </div>
          ) : (
            <div className="booking-review-grid">
              
              {/* Left Column: Details */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                
                {/* Appointment Information Card */}
                <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid var(--border)', padding: '20px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                    <div style={{ background: '#f0f9ff', color: '#0284c7', padding: '8px', borderRadius: '10px' }}>
                      <Calendar size={20} />
                    </div>
                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: 'var(--text-main)' }}>Appointment Information</h3>
                  </div>
                  
                  <div className="booking-details-grid">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '13px' }}>
                        <Calendar size={14} /> <span>Date</span>
                      </div>
                      <b style={{ color: 'var(--text-main)', fontSize: '14px' }}>{formattedDate}</b>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '13px' }}>
                        <Clock size={14} /> <span>Time</span>
                      </div>
                      <b style={{ color: 'var(--text-main)', fontSize: '14px' }}>{slot}</b>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '13px' }}>
                        <User size={14} /> <span>Doctor name</span>
                      </div>
                      <b style={{ color: 'var(--text-main)', fontSize: '14px' }}>{doctor.name}</b>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '13px' }}>
                        <Stethoscope size={14} /> <span>Department</span>
                      </div>
                      <b style={{ color: 'var(--text-main)', fontSize: '14px' }}>{doctor.specialty || "General"}</b>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '13px' }}>
                        <Briefcase size={14} /> <span>Consultation type</span>
                      </div>
                      <b style={{ color: 'var(--text-main)', fontSize: '14px' }}>{visitType}</b>
                    </div>
                  </div>
                </div>

            {/* Patient Information Card */}
            <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid var(--border)', padding: '20px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                <div style={{ background: '#f0fdf4', color: '#16a34a', padding: '8px', borderRadius: '10px' }}>
                  <User size={20} />
                </div>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: 'var(--text-main)' }}>Patient Information</h3>
              </div>

              <div className="booking-details-grid">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '13px' }}>
                    <User size={14} /> <span>Patient Name</span>
                  </div>
                  <b style={{ color: 'var(--text-main)', fontSize: '14px' }}>{user?.name || "Guest"}</b>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '13px' }}>
                    <Smartphone size={14} /> <span>Mobile</span>
                  </div>
                  <b style={{ color: 'var(--text-main)', fontSize: '14px' }}>{user?.mobile || user?.phone || "N/A"}</b>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Wallet & Payment Summary */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', height: '100%' }}>
            
            {/* Wallet Balance Card */}
            <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid var(--border)', padding: '20px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ background: '#dcfce7', color: '#16a34a', padding: '12px', borderRadius: '50%' }}>
                    <Wallet size={20} />
                  </div>
                  <div>
                    <h3 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: '700', color: 'var(--text-main)' }}>Wallet Balance</h3>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Available to redeem</span>
                  </div>
                </div>
                <b style={{ color: '#16a34a', fontSize: '18px' }}>₹{walletBalance}</b>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
                <span style={{ color: 'var(--text-main)', fontSize: '14px', fontWeight: '500' }}>Apply wallet balance</span>
                <div 
                  onClick={() => { if(walletBalance > 0) setApplyWallet(!applyWallet) }}
                  style={{
                    width: '40px',
                    height: '22px',
                    borderRadius: '11px',
                    background: applyWallet ? '#114c54' : '#e5e7eb',
                    position: 'relative',
                    cursor: walletBalance > 0 ? 'pointer' : 'not-allowed',
                    opacity: walletBalance > 0 ? 1 : 0.5,
                    transition: 'background 0.3s'
                  }}
                >
                  <div style={{
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    background: '#fff',
                    position: 'absolute',
                    top: '2px',
                    left: applyWallet ? '20px' : '2px',
                    transition: 'left 0.3s',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                  }} />
                </div>
              </div>

              {applyWallet && (
                <div style={{ marginTop: '12px', background: '#f0fdf4', border: '1px solid #dcfce7', borderRadius: '8px', padding: '10px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)', fontWeight: '600' }}>
                    <span>₹</span>
                    <input 
                      type="number" 
                      value={walletAppliedAmount} 
                      onChange={handleWalletInputChange}
                      style={{ background: 'transparent', border: 'none', outline: 'none', width: '80px', fontSize: '15px', fontWeight: '600', color: 'var(--text-main)' }}
                    />
                  </div>
                  <span style={{ fontSize: '12px', color: '#16a34a', fontWeight: '600' }}>Max ₹{maxWalletApplicable}</span>
                </div>
              )}
            </div>

            {/* Payment Summary */}
            <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid var(--border)', padding: '20px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', flex: 1, display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '700', color: 'var(--text-main)' }}>Payment Summary</h3>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', color: 'var(--text-muted)', fontSize: '14px' }}>
                <span>Consultation Fee</span>
                <span style={{ color: 'var(--text-main)', fontWeight: '500' }}>₹{consultationFee}</span>
              </div>
              
              {applyWallet && walletAppliedAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', color: '#16a34a', fontSize: '14px' }}>
                  <span>Wallet Applied</span>
                  <span style={{ fontWeight: '500' }}>- ₹{walletAppliedAmount}</span>
                </div>
              )}

              <div style={{ marginTop: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '16px 0 20px', borderTop: '2px dashed var(--border)', paddingTop: '16px' }}>
                  <span style={{ fontSize: '15px', color: 'var(--text-main)', fontWeight: '700' }}>Total Amount</span>
                  <b style={{ fontSize: '24px', color: 'var(--text-main)' }}>₹{finalAmountToPay}</b>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <button 
                    onClick={() => navigate(-1)}
                    style={{ flex: 1, padding: '12px 0', borderRadius: '10px', border: '1px solid var(--border)', background: '#fff', color: 'var(--text-main)', fontSize: '14px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s' }}
                    onMouseEnter={(e) => e.target.style.background = '#f9fafb'}
                    onMouseLeave={(e) => e.target.style.background = '#fff'}
                  >
                    Back
                  </button>
                  <button 
                    onClick={confirm}
                    disabled={submitting}
                    style={{ flex: 2, padding: '12px 0', borderRadius: '10px', border: 'none', background: '#114c54', color: '#fff', fontSize: '14px', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: submitting ? 'not-allowed' : 'pointer', transition: 'all 0.2s' }}
                    onMouseEnter={(e) => { if(!submitting) e.target.style.background = '#0e3d43' }}
                    onMouseLeave={(e) => { if(!submitting) e.target.style.background = '#114c54' }}
                  >
                    {submitting ? (
                      <div className="spinner" style={{ width: '16px', height: '16px', borderTopColor: '#fff', border: '2px solid rgba(255,255,255,0.2)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                    ) : (
                      <>
                        Confirm & Pay
                      </>
                    )}
                  </button>
                </div>
                <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: '12px', fontSize: '11px', marginBottom: 0 }}>
                  By confirming, you agree to our terms and conditions.
                </p>
              </div>
            </div>

          </div>
        </div>
      )}
      </div>
    </div>
    </BookingLayout>
  );
}
