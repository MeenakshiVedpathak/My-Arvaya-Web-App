import { Link2, Share2, ShieldCheck, ChevronRight, ArrowLeft, QrCode } from "lucide-react";
import { useNavigate } from "react-router-dom";
export default function ABHA() {
  let go = useNavigate();
  return (
    <main className="container page">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        
        {/* Left Column */}
        <section>
          <h1 className="header-title" onClick={() => go(-1)}>
            <ArrowLeft /> ABHA Hub
          </h1>
          
          <div className="mockup-card" style={{ padding: '24px', position: 'relative' }}>
            <b style={{ fontSize: '13px', color: '#4e4e4d', display: 'block', marginBottom: '16px' }}>Your ABHA Card</b>
            
            <div className="abha-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <small style={{ fontSize: '11px', color: '#718096', display: 'block' }}>Name</small>
                    <b style={{ fontSize: '15px' }}>Rahul Verma</b>
                  </div>
                  <div>
                    <small style={{ fontSize: '11px', color: '#718096', display: 'block' }}>ABHA Number</small>
                    <b style={{ fontSize: '15px' }}>14-XXXX-XXXX-XXXX</b>
                  </div>
                  <div>
                    <small style={{ fontSize: '11px', color: '#718096', display: 'block' }}>ABHA Address</small>
                    <b style={{ fontSize: '15px' }}>rahulv@abdm</b>
                  </div>
                </div>
                <div className="qr-placeholder">
                  <QrCode size={40} color="#4e4e4d" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Right Column */}
        <aside style={{ paddingTop: '56px' }}>
          {[
            [Link2, "Link Health Records", "Access & link your records", "#38a169", "#f0fff4"],
            [Share2, "Share Records", "Securely share with providers", "#3182ce", "#ebf8ff"],
            [ShieldCheck, "Consent Manager", "Manage your consents", "#805ad5", "#faf5ff"],
          ].map(([I, title, subtitle, color, bg]) => (
            <div className="action-card" key={title}>
              <div className="icon-box" style={{ background: bg }}>
                <I color={color} size={20} />
              </div>
              <div style={{ flex: 1 }}>
                <b style={{ fontSize: '14px', color: '#4e4e4d', display: 'block' }}>{title}</b>
                <small style={{ fontSize: '12px', color: '#718096' }}>{subtitle}</small>
              </div>
              <ChevronRight color="#cbd5e0" size={20} />
            </div>
          ))}

          <div style={{ textAlign: 'center', marginTop: '24px' }}>
            <span style={{ color: '#3182ce', fontSize: '14px', cursor: 'pointer' }}>Learn more about ABHA</span>
          </div>
        </aside>

      </div>
    </main>
  );
}
