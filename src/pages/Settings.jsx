import { useState } from "react";
import { Shield, Bell, Globe, Lock, ChevronRight, FileText, UserX, MonitorSmartphone, Key, Download } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Settings() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('security');
  
  // Web-friendly settings state
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [theme, setTheme] = useState("system");
  const [language, setLanguage] = useState("English");
  
  // Notification states
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [marketingAlerts, setMarketingAlerts] = useState(false);
  
  const tabs = [
    { id: 'security', label: 'Security & Auth', icon: Shield },
    { id: 'preferences', label: 'Preferences', icon: Globe },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'about', label: 'Data & Privacy', icon: FileText }
  ];

  // Custom Toggle Switch Component
  const ToggleSwitch = ({ checked, onChange }) => (
    <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', position: 'relative' }}>
      <input type="checkbox" checked={checked} onChange={onChange} style={{ opacity: 0, width: 0, height: 0, position: 'absolute' }} />
      <span style={{ 
        display: 'inline-block', 
        width: '44px', 
        height: '24px', 
        background: checked ? 'var(--primary)' : 'var(--border)', 
        borderRadius: '24px', 
        position: 'relative', 
        transition: 'background 0.3s' 
      }}>
        <span style={{
          position: 'absolute',
          top: '2px',
          left: checked ? '22px' : '2px',
          width: '20px',
          height: '20px',
          background: 'white',
          borderRadius: '50%',
          transition: 'left 0.3s',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
        }} />
      </span>
    </label>
  );

  return (
    <main className="page animate-fade-in-up" style={{ padding: 0, background: 'var(--bg-app)' }}>
      {/* ── Internal Hero ── */}
      <div style={{ background: 'var(--bg-surface)', padding: '24px 0', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <div className="flex items-center gap-2 text-muted mb-2" style={{ fontSize: '12px', fontWeight: '500' }}>
            <Link to="/" style={{ transition: 'color 0.2s' }} onMouseOver={e => e.currentTarget.style.color='var(--primary)'} onMouseOut={e => e.currentTarget.style.color=''}>Home</Link> <ChevronRight size={12} /> <span>Account Settings</span>
          </div>
          <h1 className="text-h2" style={{ fontSize: '24px', color: 'var(--text-main)' }}>Account Settings</h1>
          <p className="text-muted mt-2" style={{ fontSize: '14px' }}>Manage your web security, preferences, and notifications.</p>
        </div>
      </div>

      <div className="container" style={{ paddingTop: '32px', paddingBottom: '60px' }}>
        <div className="settings-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(240px, 280px) 1fr', gap: '32px', alignItems: 'stretch' }}>
          
          {/* Left Vertical Tabs (Matched Height) */}
          <aside className="card-elevated" style={{ padding: '16px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '8px', height: '100%' }}>
            {tabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
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
                  {tab.label}
                </button>
              );
            })}
          </aside>

          {/* Right Content Area */}
          <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', height: '100%' }}>
            {activeTab === 'security' && (
              <section className="card-elevated animate-fade-in-up" style={{ padding: '32px', borderRadius: '16px', height: '100%' }}>
                <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)' }}>
                  <Shield size={20} className="text-primary" /> Security & Authentication
                </h2>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  {/* Two-Factor Auth */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '20px', border: '1px solid var(--border)', borderRadius: '12px', background: 'var(--bg-app)' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                      <div style={{ background: 'white', padding: '10px', borderRadius: '10px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                        <Key size={24} className="text-primary" />
                      </div>
                      <div>
                        <h3 style={{ fontSize: '16px', fontWeight: '600', margin: '0 0 4px 0', color: 'var(--text-main)' }}>Two-Factor Authentication (2FA)</h3>
                        <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5, maxWidth: '400px' }}>
                          Add an extra layer of security to your account by requiring a code from your mobile authenticator app.
                        </p>
                      </div>
                    </div>
                    <div style={{ paddingTop: '8px' }}>
                      <ToggleSwitch checked={twoFactorEnabled} onChange={(e) => setTwoFactorEnabled(e.target.checked)} />
                    </div>
                  </div>

                  {/* Active Sessions */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '20px', border: '1px solid var(--border)', borderRadius: '12px', background: 'var(--bg-app)' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                      <div style={{ background: 'white', padding: '10px', borderRadius: '10px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                        <MonitorSmartphone size={24} className="text-muted" />
                      </div>
                      <div>
                        <h3 style={{ fontSize: '16px', fontWeight: '600', margin: '0 0 4px 0', color: 'var(--text-main)' }}>Active Sessions</h3>
                        <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5, maxWidth: '400px' }}>
                          You are currently logged in on 2 devices. Sign out of all other devices to secure your account.
                        </p>
                        <button className="btn btn-secondary mt-3" style={{ padding: '6px 12px', fontSize: '13px' }}>
                          Sign Out All Devices
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Change Password */}
                  <div style={{ marginTop: '8px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: 'var(--text-main)' }}>Password Management</h3>
                    <button className="btn btn-primary hover-glow" style={{ padding: '10px 20px', fontSize: '14px', borderRadius: '8px', display: 'flex', gap: '8px' }}>
                      <Lock size={16} /> Update Password
                    </button>
                  </div>
                </div>
              </section>
            )}

            {activeTab === 'preferences' && (
              <section className="card-elevated animate-fade-in-up" style={{ padding: '32px', borderRadius: '16px', height: '100%' }}>
                <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)' }}>
                  <Globe size={20} className="text-primary" /> Web Preferences
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  
                  {/* Theme */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '20px' }}>
                    <div>
                      <h3 style={{ fontSize: '16px', fontWeight: '600', margin: '0 0 4px 0', color: 'var(--text-main)' }}>Theme Appearance</h3>
                      <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>Select your preferred interface theme.</p>
                    </div>
                    <select className="input-field" value={theme} onChange={e => setTheme(e.target.value)} style={{ width: '200px', padding: '10px 14px', background: 'var(--bg-app)' }}>
                      <option value="light">Light Mode</option>
                      <option value="dark">Dark Mode</option>
                      <option value="system">System Default</option>
                    </select>
                  </div>
                  
                  {/* Language */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '12px' }}>
                    <div>
                      <h3 style={{ fontSize: '16px', fontWeight: '600', margin: '0 0 4px 0', color: 'var(--text-main)' }}>Language</h3>
                      <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>Choose your preferred language for the web portal.</p>
                    </div>
                    <select className="input-field" value={language} onChange={e => setLanguage(e.target.value)} style={{ width: '200px', padding: '10px 14px', background: 'var(--bg-app)' }}>
                      <option value="English">English</option>
                      <option value="Hindi">Hindi</option>
                      <option value="Spanish">Spanish</option>
                    </select>
                  </div>

                </div>
              </section>
            )}

            {activeTab === 'notifications' && (
              <section className="card-elevated animate-fade-in-up" style={{ padding: '32px', borderRadius: '16px', height: '100%' }}>
                <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)' }}>
                  <Bell size={20} className="text-primary" /> Notification Settings
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 0', borderBottom: '1px solid var(--border)' }}>
                    <div>
                      <h3 style={{ fontSize: '16px', fontWeight: '600', margin: '0 0 4px 0', color: 'var(--text-main)' }}>Email Updates</h3>
                      <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>Receive appointment confirmations and lab reports via email.</p>
                    </div>
                    <ToggleSwitch checked={emailAlerts} onChange={(e) => setEmailAlerts(e.target.checked)} />
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 0', borderBottom: '1px solid var(--border)' }}>
                    <div>
                      <h3 style={{ fontSize: '16px', fontWeight: '600', margin: '0 0 4px 0', color: 'var(--text-main)' }}>SMS Alerts</h3>
                      <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>Get urgent updates, OTPs, and reminders on your phone number.</p>
                    </div>
                    <ToggleSwitch checked={smsAlerts} onChange={(e) => setSmsAlerts(e.target.checked)} />
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 0' }}>
                    <div>
                      <h3 style={{ fontSize: '16px', fontWeight: '600', margin: '0 0 4px 0', color: 'var(--text-main)' }}>Promotional Offers</h3>
                      <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>Receive news about health packages and rewards.</p>
                    </div>
                    <ToggleSwitch checked={marketingAlerts} onChange={(e) => setMarketingAlerts(e.target.checked)} />
                  </div>

                </div>
              </section>
            )}

            {activeTab === 'about' && (
              <section className="card-elevated animate-fade-in-up" style={{ padding: '32px', borderRadius: '16px', height: '100%' }}>
                <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '24px', color: 'var(--text-main)' }}>Data & Privacy</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  
                  {/* Download Data */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', border: '1px solid var(--border)', borderRadius: '12px', cursor: 'pointer' }} className="hover-bg">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ background: 'var(--bg-app)', padding: '10px', borderRadius: '10px' }}>
                         <Download size={20} className="text-primary" />
                      </div>
                      <div>
                        <span style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-main)', display: 'block' }}>Export Personal Data</span>
                        <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Download a copy of your health records and profile.</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', borderBottom: '1px solid var(--border)', cursor: 'pointer' }}>
                    <span style={{ fontSize: '15px', fontWeight: '500', color: 'var(--text-main)' }}>Terms of Service</span>
                    <ChevronRight size={20} className="text-muted" />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', borderBottom: '1px solid var(--border)', cursor: 'pointer' }}>
                    <span style={{ fontSize: '15px', fontWeight: '500', color: 'var(--text-main)' }}>Privacy Policy</span>
                    <ChevronRight size={20} className="text-muted" />
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', background: 'var(--danger-light, #fee2e2)', borderRadius: '12px', marginTop: '16px' }}>
                    <div>
                      <span style={{ fontSize: '16px', fontWeight: '700', color: 'var(--danger, #dc2626)', display: 'block', marginBottom: '4px' }}>Delete Account</span>
                      <span style={{ fontSize: '13px', color: 'var(--danger, #dc2626)', opacity: 0.9 }}>Permanently delete your account and all associated health data. This action cannot be undone.</span>
                    </div>
                    <button className="btn" style={{ background: 'var(--danger)', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px' }}>
                       Delete Account
                    </button>
                  </div>
                  
                </div>
              </section>
            )}
        </div>
      </div>
    </div>
    <style dangerouslySetInnerHTML={{__html: `
      @media (max-width: 768px) {
        .settings-grid { grid-template-columns: 1fr !important; }
      }
    `}} />
  </main>
);
}

