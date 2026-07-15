import { Link2, Share2, ShieldCheck, ChevronRight, QrCode } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ABHA() {
  const { user } = useAuth();
  const userName = user?.name || "Rahul Verma";

  return (
    <main className="page" style={{ background: 'var(--bg)', minHeight: '100vh', padding: 0 }}>
      {/* ── Internal Hero ── */}
      <div style={{ background: 'linear-gradient(135deg, var(--primary-light), var(--bg))', padding: '60px 0 40px', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--muted)', marginBottom: '16px', fontWeight: '500' }}>
            <Link to="/" style={{ color: 'var(--primary)', textDecoration: 'none' }}>Home</Link> <ChevronRight size={14} /> <span>ABHA Hub</span>
          </div>
          <h1 style={{ fontSize: '36px', fontWeight: '800', color: 'var(--text-main)', margin: '0 0 12px 0', letterSpacing: '-0.02em' }}>Your ABHA Profile</h1>
          <p style={{ fontSize: '16px', color: 'var(--muted)', margin: 0, maxWidth: '500px' }}>Manage your Ayushman Bharat Health Account and consents securely.</p>
        </div>
      </div>

      <div className="container" style={{ paddingTop: '40px', paddingBottom: '80px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', alignItems: 'start' }}>

          {/* Left Column: ID Card */}
          <section>
            <div className="glass-panel" style={{ padding: '32px', background: 'var(--surface)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-main)', margin: 0 }}>Digital Health ID</h3>
                <span style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#16a34a', padding: '4px 12px', borderRadius: 'var(--radius-full)', fontSize: '12px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}><ShieldCheck size={14} /> Active</span>
              </div>

              {/* Premium Card UI */}
              <div style={{
                background: 'linear-gradient(135deg, var(--primary-dark), #1e293b)',
                borderRadius: '20px',
                padding: '32px',
                color: '#fff',
                boxShadow: '0 20px 40px -12px rgba(2, 132, 199, 0.4)',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 10 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div>
                      <small style={{ fontSize: '11px', color: 'var(--primary-light)', display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Patient Name</small>
                      <b style={{ fontSize: '20px', letterSpacing: '0.02em' }}>{userName}</b>
                    </div>
                    <div>
                      <small style={{ fontSize: '11px', color: 'var(--primary-light)', display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>ABHA Number</small>
                      <b style={{ fontSize: '20px', letterSpacing: '0.1em', fontFamily: 'monospace' }}>14-2834-8932-XXXX</b>
                    </div>
                    <div>
                      <small style={{ fontSize: '11px', color: 'var(--primary-light)', display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>ABHA Address</small>
                      <b style={{ fontSize: '16px' }}>{userName.split(" ")[0].toLowerCase()}@abdm</b>
                    </div>
                  </div>

                  <div style={{ background: '#fff', padding: '12px', borderRadius: '12px' }}>
                    <QrCode size={64} color="#000" />
                  </div>
                </div>

                {/* Watermark/Graphics */}
                <div style={{ position: 'absolute', right: '-20px', bottom: '-40px', opacity: 0.05, pointerEvents: 'none' }}>
                  <ShieldCheck size={200} />
                </div>
              </div>
            </div>
          </section>

          {/* Right Column: Actions */}
          <aside>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-main)', marginBottom: '24px' }}>Manage Consents</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[
                [Link2, "Link Health Records", "Access & link your hospital records seamlessly.", "var(--primary)", "var(--primary-light)"],
                [Share2, "Share Records", "Securely share with providers using OTP.", "#16a34a", "#dcfce7"],
                [ShieldCheck, "Consent Manager", "Review and revoke active data sharing consents.", "#9333ea", "#f3e8ff"],
              ].map(([Icon, title, subtitle, color, bg]) => (
                <div key={title} className="glass-panel hover-lift" style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '20px', background: 'var(--surface)', cursor: 'pointer' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: color, flexShrink: 0 }}>
                    <Icon size={24} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <b style={{ display: 'block', fontSize: '16px', color: 'var(--text-main)', marginBottom: '4px' }}>{title}</b>
                    <span style={{ fontSize: '13px', color: 'var(--muted)' }}>{subtitle}</span>
                  </div>
                  <ChevronRight size={20} color="var(--muted)" />
                </div>
              ))}
            </div>

            <div style={{ textAlign: 'center', marginTop: '32px', background: 'var(--surface-alt)', padding: '20px', borderRadius: '16px' }}>
              <span style={{ color: 'var(--muted)', fontSize: '14px' }}>Need help understanding ABHA?</span>
              <br />
              <span style={{ color: 'var(--primary)', fontSize: '14px', fontWeight: '700', cursor: 'pointer' }}>Read the FAQ</span>
            </div>
          </aside>

        </div>
      </div>
    </main>
  );
}
