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
    <main className="page animate-fade-in-up" style={{ padding: '16px 20px 20px 20px', background: 'var(--bg-app)', minHeight: 'calc(100vh - 80px)', maxHeight: 'calc(100vh - 70px)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div className="container" style={{ maxWidth: '1100px', margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        
        {/* Top Fixed Section: Stepper, Summary & Title */}
        <div style={{ flexShrink: 0, paddingBottom: '12px' }}>
          
          {/* Horizontal Progress Stepper */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', position: 'relative', padding: '0 12px' }}>
            {/* Connecting Line */}
            <div style={{ position: 'absolute', top: '15px', left: '24px', right: '24px', height: '2px', background: 'var(--border)', zIndex: 0 }} />
            
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
                    gap: '4px', 
                    position: 'relative', 
                    zIndex: 1, 
                    cursor: canClick ? 'pointer' : 'default',
                    opacity: (isCompleted || isCurrent) ? 1 : 0.45
                  }}
                >
                  <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: iconBg, border: iconBorder, display: 'flex', alignItems: 'center', justifyContent: 'center', color: iconColor, transition: 'all 0.3s' }}>
                    {isCompleted ? <CheckCircle2 size={15} /> : <Icon size={14} />}
                  </div>
                  <div style={{ fontSize: '11px', fontWeight: isCurrent ? '700' : '600', color: isCurrent ? 'var(--primary-dark)' : 'var(--text-muted)' }}>
                    {step.title}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Compact Summary Pill */}
          {breadcrumbParts.length > 0 && currentStep < 5 && (
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-surface)', padding: '6px 18px', borderRadius: '32px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', border: '1px solid var(--border)', fontSize: '12px', color: 'var(--text-main)', flexWrap: 'wrap' }}>
                {breadcrumbParts.map((p, i) => (
                  <span key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {i > 0 && <ChevronRight size={12} color="var(--text-muted)" />}
                    <span style={{ fontWeight: p.bold ? '700' : '600', color: p.color || 'inherit' }}>{p.label}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Header Title & Subtitle */}
          <div style={{ textAlign: 'center' }}>
            <h1 style={{ fontSize: '22px', fontWeight: '800', color: 'var(--text-main)', margin: '0 0 4px 0', letterSpacing: '-0.02em' }}>
              {title}
            </h1>
            {subtitle && (
              <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: 0 }}>
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Scrollable & Pinned Step Content Area */}
        <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {children}
        </div>

      </div>
    </main>
  );
}
