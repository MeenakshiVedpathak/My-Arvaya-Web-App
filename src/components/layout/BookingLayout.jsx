import { Building2, Stethoscope, User, FileText, CalendarDays, CheckCircle2, ClipboardCheck, ChevronRight } from "lucide-react";
import { useBooking } from "../../context/BookingContext";
import { useNavigate } from "react-router-dom";

const STEPS = [
  { id: 0, title: "Hospital", icon: Building2, path: "/doctors" },
  { id: 1, title: "Specialty", icon: Stethoscope, path: "/doctors/specialty" },
  { id: 2, title: "Doctor", icon: User, path: "/doctors/list" },
  { id: 3, title: "Type", icon: FileText, path: "/doctors/visit-type" },
  { id: 4, title: "Time", icon: CalendarDays, path: "/doctors/schedule" },
  { id: 5, title: "Review", icon: ClipboardCheck, path: "/doctors/review" },
];

export default function BookingLayout({ currentStep, title, subtitle, children }) {
  const { bookingHospital, bookingSpecialty, doctor, date, slot } = useBooking();
  const navigate = useNavigate();

  const handleStepClick = (step) => {
    if (step.id < currentStep) {
      navigate(step.path);
    }
  };

  const breadcrumbParts = [];
  if (bookingHospital && currentStep >= 1) breadcrumbParts.push({ label: bookingHospital.name, bold: false });
  if (bookingSpecialty && currentStep >= 2) breadcrumbParts.push({ label: bookingSpecialty, bold: false });
  if (doctor && currentStep >= 3) breadcrumbParts.push({ label: doctor.name, bold: true, color: 'var(--primary-dark)' });
  if (date && slot && currentStep >= 5) breadcrumbParts.push({ label: `${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at ${slot}`, bold: true, color: 'var(--primary)' });

  return (
    <main className="page animate-fade-in-up" style={{ padding: '60px 20px', background: 'var(--bg-app)', minHeight: 'calc(100vh - 80px)' }}>
      <div className="container" style={{ maxWidth: '1000px', margin: '0 auto' }}>
        
        {/* Horizontal Progress */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', position: 'relative' }}>
          {/* Connecting Line */}
          <div style={{ position: 'absolute', top: '16px', left: '0', right: '0', height: '2px', background: 'var(--border)', zIndex: 0 }} />
          
          {STEPS.map((step) => {
            const isCompleted = currentStep > step.id;
            const isCurrent = currentStep === step.id;
            const Icon = step.icon;
            const canClick = step.id < currentStep;
            
            let iconBg = 'var(--bg-app)';
            let iconColor = 'var(--text-muted)';
            let iconBorder = '2px solid var(--border)';
            
            if (isCompleted) {
              iconBg = 'var(--primary)';
              iconColor = '#fff';
              iconBorder = '2px solid var(--primary)';
            } else if (isCurrent) {
              iconBg = 'var(--bg-surface)';
              iconColor = 'var(--primary)';
              iconBorder = '2px solid var(--primary)';
            }

            return (
              <div 
                key={step.id} 
                onClick={() => handleStepClick(step)}
                style={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  alignItems: 'center', 
                  gap: '8px', 
                  position: 'relative', 
                  zIndex: 1, 
                  cursor: canClick ? 'pointer' : 'default',
                  opacity: (isCompleted || isCurrent) ? 1 : 0.4
                }}
              >
                <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: iconBg, border: iconBorder, display: 'flex', alignItems: 'center', justifyContent: 'center', color: iconColor, transition: 'all 0.3s' }}>
                  {isCompleted ? <CheckCircle2 size={16} /> : <Icon size={16} />}
                </div>
                <div style={{ fontSize: '12px', fontWeight: isCurrent ? '700' : '600', color: isCurrent ? 'var(--primary-dark)' : 'var(--text-muted)' }}>
                  {step.title}
                </div>
              </div>
            );
          })}
        </div>

        {/* Compact Summary Pill */}
        {breadcrumbParts.length > 0 && currentStep < 5 && (
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '40px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-surface)', padding: '12px 24px', borderRadius: '32px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', border: '1px solid var(--border)', fontSize: '13px', color: 'var(--text-main)', flexWrap: 'wrap' }}>
              {breadcrumbParts.map((p, i) => (
                <span key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {i > 0 && <ChevronRight size={14} color="var(--text-muted)" />}
                  <span style={{ fontWeight: p.bold ? '700' : '600', color: p.color || 'inherit' }}>{p.label}</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div style={{ padding: '0' }}>
          <div style={{ marginBottom: '40px', textAlign: 'center' }}>
            <h1 style={{ fontSize: '32px', fontWeight: '800', color: 'var(--text-main)', margin: '0 0 12px 0', letterSpacing: '-0.02em' }}>
              {title}
            </h1>
            {subtitle && (
              <p style={{ color: 'var(--text-muted)', fontSize: '16px', margin: 0 }}>
                {subtitle}
              </p>
            )}
          </div>
          
          <div className="booking-content-wrapper">
            {children}
          </div>
        </div>

      </div>
    </main>
  );
}
