import { Info, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useBooking } from "../../context/BookingContext";
import BookingLayout from "../../components/layout/BookingLayout";

export default function VisitTypeSelection() {
  const navigate = useNavigate();
  const { doctor, bookingVisitType, setBookingVisitType } = useBooking();

  const handleSelect = (type) => {
    setBookingVisitType(type);
  };

  const handleProceed = () => {
    if (bookingVisitType) {
      navigate("/doctors/schedule");
    }
  };

  if (!doctor) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <p>No doctor selected. Redirecting...</p>
        <button onClick={() => navigate("/doctors/list")} className="btn btn-primary">Go back</button>
      </div>
    );
  }

  return (
    <BookingLayout 
      currentStep={3} 
      title="Visit Type" 
      subtitle={`What type of visit is this for Dr. ${doctor.name}?`}
    >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
            
            {/* Option 1: Initial */}
            <div 
              onClick={() => handleSelect("Initial consultation")}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '16px',
                padding: '20px',
                borderRadius: '12px',
                cursor: 'pointer',
                background: bookingVisitType === "Initial consultation" ? 'var(--primary-light)' : 'transparent',
                border: bookingVisitType === "Initial consultation" ? '1px solid var(--primary)' : '1px solid transparent',
                transition: 'all 0.2s',
              }}
              onMouseOver={e => { if(bookingVisitType !== "Initial consultation") e.currentTarget.style.background = 'var(--bg-surface)'; e.currentTarget.style.border = '1px solid var(--border)'; }}
              onMouseOut={e => { if(bookingVisitType !== "Initial consultation") { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.border = '1px solid transparent'; } }}
            >
              <div style={{ width: '24px', height: '24px', borderRadius: '50%', border: bookingVisitType === "Initial consultation" ? '7px solid var(--primary)' : '2px solid var(--border)', background: 'var(--bg-app)', flexShrink: 0, transition: 'all 0.2s', marginTop: '2px' }} />
              <div>
                <h4 style={{ margin: '0 0 6px 0', fontSize: '16px', fontWeight: '700', color: bookingVisitType === "Initial consultation" ? 'var(--primary-dark)' : 'var(--text-main)' }}>Initial consultation</h4>
                <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.5 }}>First visit for a new concern or symptom. Select this if you have not seen this doctor recently.</p>
              </div>
            </div>

            {/* Option 2: Follow-up */}
            <div 
              onClick={() => handleSelect("Follow-up")}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '16px',
                padding: '20px',
                borderRadius: '12px',
                cursor: 'pointer',
                background: bookingVisitType === "Follow-up" ? 'var(--primary-light)' : 'transparent',
                border: bookingVisitType === "Follow-up" ? '1px solid var(--primary)' : '1px solid transparent',
                transition: 'all 0.2s',
              }}
              onMouseOver={e => { if(bookingVisitType !== "Follow-up") e.currentTarget.style.background = 'var(--bg-surface)'; e.currentTarget.style.border = '1px solid var(--border)'; }}
              onMouseOut={e => { if(bookingVisitType !== "Follow-up") { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.border = '1px solid transparent'; } }}
            >
              <div style={{ width: '24px', height: '24px', borderRadius: '50%', border: bookingVisitType === "Follow-up" ? '7px solid var(--primary)' : '2px solid var(--border)', background: 'var(--bg-app)', flexShrink: 0, transition: 'all 0.2s', marginTop: '2px' }} />
              <div>
                <h4 style={{ margin: '0 0 6px 0', fontSize: '16px', fontWeight: '700', color: bookingVisitType === "Follow-up" ? 'var(--primary-dark)' : 'var(--text-main)' }}>Follow-up</h4>
                <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.5 }}>Continuing care from a previous visit. Valid only if you've seen this doctor recently.</p>
              </div>
            </div>

          </div>

          {/* Info Alert */}
          <div style={{ padding: '16px 20px', background: '#fff7ed', border: '1px solid #ffedd5', borderRadius: '12px', display: 'flex', gap: '12px', alignItems: 'flex-start', marginBottom: '32px' }}>
            <Info size={20} color="#ea580c" style={{ flexShrink: 0, marginTop: '2px' }} />
            <p style={{ fontSize: '14px', color: '#9a3412', margin: 0, lineHeight: 1.5 }}>
              Select <strong>Follow-up Consultation</strong> only if you have already consulted the same doctor within the last 7 days. Otherwise, please choose <strong>Initial Consultation</strong>.
            </p>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border)', paddingTop: '24px', alignItems: 'center' }}>
            <button 
              className="btn btn-primary"
              disabled={!bookingVisitType}
              onClick={handleProceed}
              style={{ padding: '12px 32px', fontSize: '16px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px', opacity: bookingVisitType ? 1 : 0.5 }}
            >
              Next Step <ArrowRight size={18} />
            </button>
          </div>
    </BookingLayout>
  );
}
