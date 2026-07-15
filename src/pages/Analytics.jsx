import { Activity, Heart, TrendingUp, Droplet, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Analytics() {
  const { user } = useAuth();
  
  if (!user) {
    return (
      <main className="page" style={{ padding: '60px 0', textAlign: 'center' }}>
        <h2 className="text-h2">Login Required</h2>
        <p className="text-muted mt-2">Please login to view your personal health analytics.</p>
      </main>
    );
  }

  return (
    <main className="page" style={{ padding: 0, background: 'var(--bg-app)' }}>
      {/* ── Internal Hero ── */}
      <div style={{ background: 'var(--bg-surface)', padding: '24px 0', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <h1 className="text-h2" style={{ fontSize: '24px' }}>Health Analytics</h1>
          <p className="text-muted mt-2" style={{ fontSize: '14px' }}>Track your vital signs and health progression</p>
        </div>
      </div>

      <div className="container" style={{ paddingBottom: '80px', paddingTop: '24px' }}>
        {/* KPI Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '32px' }}>
          
          <div className="card" style={{ padding: '20px' }}>
            <div className="flex justify-between items-start mb-4">
              <div style={{ background: '#fef2f2', padding: '12px', borderRadius: '50%' }}>
                <Heart size={24} color="#ef4444" />
              </div>
              <span className="badge badge-success flex items-center gap-1" style={{ fontSize: '12px' }}>
                <ArrowDownRight size={12}/> 2%
              </span>
            </div>
            <h3 style={{ fontSize: '24px', color: 'var(--text-main)', margin: '0 0 4px 0' }}>72 <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>bpm</span></h3>
            <p className="text-muted" style={{ fontSize: '13px' }}>Avg. Heart Rate</p>
          </div>

          <div className="card" style={{ padding: '20px' }}>
            <div className="flex justify-between items-start mb-4">
              <div style={{ background: '#eff6ff', padding: '12px', borderRadius: '50%' }}>
                <Activity size={24} color="#3b82f6" />
              </div>
              <span className="badge flex items-center gap-1" style={{ background: '#fee2e2', color: '#ef4444', fontSize: '12px' }}>
                <ArrowUpRight size={12}/> 5%
              </span>
            </div>
            <h3 style={{ fontSize: '24px', color: 'var(--text-main)', margin: '0 0 4px 0' }}>120/80 <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>mmHg</span></h3>
            <p className="text-muted" style={{ fontSize: '13px' }}>Blood Pressure</p>
          </div>

          <div className="card" style={{ padding: '20px' }}>
            <div className="flex justify-between items-start mb-4">
              <div style={{ background: '#f0fdf4', padding: '12px', borderRadius: '50%' }}>
                <TrendingUp size={24} color="#22c55e" />
              </div>
              <span className="badge badge-success flex items-center gap-1" style={{ fontSize: '12px' }}>
                <ArrowUpRight size={12}/> 12%
              </span>
            </div>
            <h3 style={{ fontSize: '24px', color: 'var(--text-main)', margin: '0 0 4px 0' }}>8,432 <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>steps</span></h3>
            <p className="text-muted" style={{ fontSize: '13px' }}>Daily Activity</p>
          </div>

          <div className="card" style={{ padding: '20px' }}>
            <div className="flex justify-between items-start mb-4">
              <div style={{ background: '#fdf4ff', padding: '12px', borderRadius: '50%' }}>
                <Droplet size={24} color="#d946ef" />
              </div>
              <span className="badge flex items-center gap-1" style={{ background: '#fee2e2', color: '#ef4444', fontSize: '12px' }}>
                <ArrowDownRight size={12}/> 1%
              </span>
            </div>
            <h3 style={{ fontSize: '24px', color: 'var(--text-main)', margin: '0 0 4px 0' }}>98 <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>mg/dL</span></h3>
            <p className="text-muted" style={{ fontSize: '13px' }}>Fasting Sugar</p>
          </div>

        </div>

        {/* Charts Mock */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '16px', marginBottom: '24px' }}>Activity Trend (Last 7 Days)</h3>
            <div style={{ height: '300px', display: 'flex', alignItems: 'flex-end', gap: '12px', paddingBottom: '24px', borderBottom: '1px solid var(--border)' }}>
              {/* Mock Bar Chart */}
              {[40, 60, 45, 80, 50, 90, 70].map((h, i) => (
                <div key={i} style={{ flex: 1, height: `${h}%`, background: h > 70 ? 'var(--primary)' : 'var(--primary-light)', borderRadius: '4px 4px 0 0', position: 'relative' }}>
                   <span style={{ position: 'absolute', bottom: '-24px', left: '50%', transform: 'translateX(-50%)', fontSize: '11px', color: 'var(--text-muted)' }}>Day {i+1}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '16px', marginBottom: '24px' }}>Recent Health Logs</h3>
            <div className="flex flex-col gap-4">
              <div style={{ paddingBottom: '16px', borderBottom: '1px solid var(--border)' }}>
                <span style={{ display: 'block', fontSize: '14px', fontWeight: '600' }}>Lab Report Uploaded</span>
                <span className="text-muted" style={{ fontSize: '12px' }}>Today, 10:30 AM</span>
              </div>
              <div style={{ paddingBottom: '16px', borderBottom: '1px solid var(--border)' }}>
                <span style={{ display: 'block', fontSize: '14px', fontWeight: '600' }}>Blood Pressure Logged</span>
                <span className="text-muted" style={{ fontSize: '12px' }}>Yesterday, 08:15 AM</span>
              </div>
              <div>
                <span style={{ display: 'block', fontSize: '14px', fontWeight: '600' }}>Completed 10k Steps!</span>
                <span className="text-muted" style={{ fontSize: '12px' }}>Jul 12, 09:00 PM</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}
