import { useState } from "react";
import { Activity, Heart, TrendingUp, Droplet, ArrowUpRight, ArrowDownRight, ChevronRight, LayoutDashboard } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Analytics() {
  const { user } = useAuth();
  const [activeCategory, setActiveCategory] = useState("overview");

  if (!user) {
    return (
      <main className="page" style={{ padding: '60px 0', textAlign: 'center' }}>
        <h2 className="text-h2">Login Required</h2>
        <p className="text-muted mt-2">Please login to view your personal health analytics.</p>
      </main>
    );
  }

  const categories = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'heart_rate', label: 'Heart Rate', icon: Heart },
    { id: 'blood_pressure', label: 'Blood Pressure', icon: Activity },
    { id: 'activity', label: 'Daily Activity', icon: TrendingUp },
    { id: 'blood_sugar', label: 'Blood Sugar', icon: Droplet }
  ];

  return (
    <main className="page" style={{ padding: 0, background: 'var(--bg-app)' }}>
      {/* ── Internal Hero ── */}
      <div style={{ background: 'var(--bg-surface)', padding: '24px 0', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <div className="flex items-center gap-2 text-muted mb-2" style={{ fontSize: '12px', fontWeight: '500' }}>
            <Link to="/" style={{ transition: 'color 0.2s' }} onMouseOver={e => e.currentTarget.style.color='var(--primary)'} onMouseOut={e => e.currentTarget.style.color=''}>Home</Link> <ChevronRight size={12} /> <span>Health Analytics</span>
          </div>
          <h1 className="text-h2" style={{ fontSize: '24px', color: 'var(--text-main)' }}>Health Analytics</h1>
          <p className="text-muted mt-2" style={{ fontSize: '14px' }}>Track your vital signs and health progression</p>
        </div>
      </div>

      <div className="container" style={{ paddingBottom: '60px', paddingTop: '32px' }}>
        <div className="analytics-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(240px, 280px) 1fr', gap: '32px', alignItems: 'start' }}>
          
          {/* Left Sidebar Navigation */}
          <aside className="analytics-sidebar card-elevated" style={{ padding: '16px', borderRadius: '16px', position: 'sticky', top: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {categories.map(cat => {
              const Icon = cat.icon;
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '12px 16px', borderRadius: '12px',
                    fontSize: '14px', fontWeight: isActive ? '700' : '500',
                    color: isActive ? 'var(--primary-dark)' : 'var(--text-main)',
                    background: isActive ? 'var(--primary-light)' : 'transparent',
                    border: 'none', cursor: 'pointer',
                    textAlign: 'left', transition: 'all 0.2s'
                  }}
                  onMouseOver={e => { if(!isActive) e.currentTarget.style.background = 'var(--bg-app)'; }}
                  onMouseOut={e => { if(!isActive) e.currentTarget.style.background = 'transparent'; }}
                >
                  <Icon size={18} className={isActive ? 'text-primary' : 'text-muted'} />
                  {cat.label}
                </button>
              );
            })}
          </aside>

          {/* Right Content Area */}
          <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {activeCategory === "overview" && (
              <>
                {/* KPI Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
                  <div className="card-elevated hover-glow animate-fade-in-up" style={{ padding: '24px', borderRadius: '16px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <div className="flex justify-between items-start mb-4">
                      <div style={{ background: '#fef2f2', padding: '12px', borderRadius: '50%' }}>
                        <Heart size={24} color="#ef4444" />
                      </div>
                      <span className="badge badge-success flex items-center gap-1" style={{ fontSize: '12px' }}>
                        <ArrowDownRight size={12}/> 2%
                      </span>
                    </div>
                    <h3 style={{ fontSize: '24px', color: 'var(--text-main)', margin: '0 0 4px 0', fontWeight: '700' }}>72 <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>bpm</span></h3>
                    <p className="text-muted" style={{ fontSize: '13px' }}>Avg. Heart Rate</p>
                  </div>

                  <div className="card-elevated hover-glow animate-fade-in-up delay-100" style={{ padding: '24px', borderRadius: '16px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <div className="flex justify-between items-start mb-4">
                      <div style={{ background: '#E4EEEF', padding: '12px', borderRadius: '50%' }}>
                        <Activity size={24} color="#2E666E" />
                      </div>
                      <span className="badge flex items-center gap-1" style={{ background: '#fee2e2', color: '#ef4444', fontSize: '12px' }}>
                        <ArrowUpRight size={12}/> 5%
                      </span>
                    </div>
                    <h3 style={{ fontSize: '24px', color: 'var(--text-main)', margin: '0 0 4px 0', fontWeight: '700' }}>120/80 <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>mmHg</span></h3>
                    <p className="text-muted" style={{ fontSize: '13px' }}>Blood Pressure</p>
                  </div>

                  <div className="card-elevated hover-glow animate-fade-in-up delay-200" style={{ padding: '24px', borderRadius: '16px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <div className="flex justify-between items-start mb-4">
                      <div style={{ background: '#f0fdf4', padding: '12px', borderRadius: '50%' }}>
                        <TrendingUp size={24} color="#22c55e" />
                      </div>
                      <span className="badge badge-success flex items-center gap-1" style={{ fontSize: '12px' }}>
                        <ArrowUpRight size={12}/> 12%
                      </span>
                    </div>
                    <h3 style={{ fontSize: '24px', color: 'var(--text-main)', margin: '0 0 4px 0', fontWeight: '700' }}>8,432 <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>steps</span></h3>
                    <p className="text-muted" style={{ fontSize: '13px' }}>Daily Activity</p>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                  <div className="card-elevated animate-fade-in-up delay-200" style={{ padding: '32px', borderRadius: '16px', height: '100%' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '24px', color: 'var(--text-main)' }}>Activity Trend (Last 7 Days)</h3>
                    <div style={{ height: '200px', display: 'flex', alignItems: 'flex-end', gap: '12px', paddingBottom: '24px', borderBottom: '1px solid var(--border)' }}>
                      {[40, 60, 45, 80, 50, 90, 70].map((h, i) => (
                        <div key={i} style={{ flex: 1, height: `${h}%`, background: h > 70 ? 'var(--primary)' : 'var(--primary-light)', borderRadius: '4px 4px 0 0', position: 'relative' }}>
                           <span style={{ position: 'absolute', bottom: '-24px', left: '50%', transform: 'translateX(-50%)', fontSize: '11px', color: 'var(--text-muted)' }}>D{i+1}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="card-elevated animate-fade-in-up delay-300" style={{ padding: '32px', borderRadius: '16px', height: '100%' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '24px', color: 'var(--text-main)' }}>Recent Health Logs</h3>
                    <div className="flex flex-col gap-4">
                      <div style={{ paddingBottom: '16px', borderBottom: '1px dashed var(--border)' }}>
                        <span style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: 'var(--text-main)' }}>Lab Report Uploaded</span>
                        <span className="text-muted" style={{ fontSize: '12px' }}>Today, 10:30 AM</span>
                      </div>
                      <div style={{ paddingBottom: '16px', borderBottom: '1px dashed var(--border)' }}>
                        <span style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: 'var(--text-main)' }}>Blood Pressure Logged</span>
                        <span className="text-muted" style={{ fontSize: '12px' }}>Yesterday, 08:15 AM</span>
                      </div>
                      <div>
                        <span style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: 'var(--text-main)' }}>Completed 10k Steps!</span>
                        <span className="text-muted" style={{ fontSize: '12px' }}>Jul 12, 09:00 PM</span>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {activeCategory !== "overview" && (
              <div className="card-elevated animate-fade-in-up" style={{ padding: '40px', borderRadius: '16px', textAlign: 'center' }}>
                 <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--primary-light)', margin: '0 auto 24px auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Activity size={32} className="text-primary" />
                 </div>
                 <h2 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-main)', marginBottom: '8px' }}>
                   Detailed {categories.find(c => c.id === activeCategory)?.label} Data
                 </h2>
                 <p className="text-muted" style={{ fontSize: '14px', maxWidth: '400px', margin: '0 auto' }}>
                   Sync your wearable device or manually log your vitals to see detailed weekly, monthly, and yearly charts for this metric.
                 </p>
                 <button className="btn btn-primary mt-6" style={{ borderRadius: 'var(--radius-full)' }}>Connect Device</button>
              </div>
            )}

          </div>
        </div>
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        @media (max-width: 768px) {
          .analytics-grid { grid-template-columns: 1fr !important; }
          .analytics-sidebar { position: relative !important; top: 0 !important; }
        }
      `}} />
    </main>
  );
}
