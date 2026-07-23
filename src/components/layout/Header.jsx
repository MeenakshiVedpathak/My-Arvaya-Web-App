import { Search, MapPin, ChevronDown, User, LogOut, Smartphone, HelpCircle, Menu, X, ArrowRight } from "lucide-react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useState } from "react";

export default function Header() {
  const { user, openLoginModal, logout } = useAuth();
  const go = useNavigate();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const navLinks = [
    ["Home", "/"],
    ["Consult Doctors", "/doctors"],
    ["Lab Tests", "/labs"],
    ["ABHA Hub", "/abha"],
    ["Patient Portal", "/records"],
    ["Wallet", "/wallet"],
    ["Rewards", "/rewards"],
    ["Analytics", "/analytics"],
    ["🚑 Ambulance", "/ambulance"]
  ];

  return (
    <>
      {/* ── Main Header ── */}
      <header className="glass" style={{ position: 'sticky', top: '0px', zIndex: 100 }}>
        
        {/* Top Bar inside Header */}
        <div style={{ borderBottom: '1px solid var(--border)', background: 'rgba(241, 245, 249, 0.4)' }}>
          <div className="container flex justify-between items-center" style={{ height: '32px', fontSize: '12px', color: 'var(--text-muted)', fontWeight: '500' }}>
            <div className="flex gap-4" style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}>
              <span className="flex items-center gap-1 cursor-pointer" style={{ transition: 'color 0.2s' }} onMouseOver={e => e.currentTarget.style.color='var(--primary)'} onMouseOut={e => e.currentTarget.style.color=''}><Smartphone size={14}/> Download App</span>
              <span className="flex items-center gap-1 cursor-pointer" style={{ transition: 'color 0.2s' }} onMouseOver={e => e.currentTarget.style.color='var(--primary)'} onMouseOut={e => e.currentTarget.style.color=''}><HelpCircle size={14}/> Help Center</span>
            </div>
            <div className="flex gap-4" style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}>
              <span className="cursor-pointer" style={{ transition: 'color 0.2s' }} onMouseOver={e => e.currentTarget.style.color='var(--primary)'} onMouseOut={e => e.currentTarget.style.color=''}>For Providers</span>
              <span className="cursor-pointer" style={{ transition: 'color 0.2s' }} onMouseOver={e => e.currentTarget.style.color='var(--primary)'} onMouseOut={e => e.currentTarget.style.color=''}>Corporate Health</span>
            </div>
          </div>
        </div>

        <div className="container flex justify-between items-center header-main-row" style={{ height: '76px', padding: '0 24px', gap: '16px' }}>
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2" style={{ flexShrink: 0 }}>
             <img src="/logo.png" alt="Arvaya Logo" style={{ height: '36px', width: 'auto' }} />
          </Link>
          
          {/* Universal Search Bar (Desktop / Tablet) */}
          <div className="header-search-bar flex-1 flex items-center" style={{ maxWidth: '600px', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', background: 'rgba(255, 255, 255, 0.6)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden', height: '44px', transition: 'box-shadow 0.3s, border-color 0.3s' }} onFocus={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.boxShadow = '0 0 0 4px rgba(46, 102, 110, 0.1)'; }} onBlur={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}>
            
            {/* Location Selector */}
            <div className="header-location-picker flex items-center gap-1" style={{ padding: '0 16px', borderRight: '1px solid var(--border)', color: 'var(--text-main)', fontSize: '14px', fontWeight: '500', cursor: 'pointer', background: 'var(--bg-app)', height: '100%', transition: 'background 0.2s', flexShrink: 0 }} onMouseOver={e => e.currentTarget.style.background = 'var(--primary-light)'} onMouseOut={e => e.currentTarget.style.background = 'var(--bg-app)'}>
              <MapPin size={16} className="text-primary" />
              <span>Bangalore</span>
              <ChevronDown size={16} className="text-muted" />
            </div>

            {/* Search Input */}
            <div className="flex-1 flex items-center gap-2" style={{ padding: '0 16px', background: 'transparent', minWidth: '0' }}>
              <Search size={18} className="text-muted" style={{ flexShrink: 0 }} />
              <input 
                placeholder="Search doctors, clinics, tests…" 
                style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '14px', color: 'var(--text-main)' }}
              />
            </div>
          </div>
          
          {/* Right Auth CTA (Desktop) */}
          <div className="header-desktop-auth flex items-center gap-4" style={{ flexShrink: 0 }}>
            {user ? (
              <div className="flex items-center gap-4">
                <div className="flex flex-col items-end">
                  <span className="text-muted" style={{ fontSize: '12px' }}>Welcome,</span>
                  <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-main)' }}>{user.name.split(" ")[0]}</span>
                </div>
                <button 
                  className="btn btn-secondary flex items-center gap-2"
                  style={{ padding: '8px 12px' }}
                  onClick={() => {
                    logout();
                    go("/");
                  }}
                >
                  <LogOut size={16} /> Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button className="btn btn-primary flex items-center gap-2" onClick={() => openLoginModal()} style={{ fontSize: '14px' }}>
                  <User size={16} />
                  Login / Sign Up
                </button>
              </div>
            )}
          </div>

          {/* Hamburger Menu Toggle (Mobile) */}
          <button 
            className="mobile-hamburger-btn" 
            onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
            aria-label="Toggle Navigation Menu"
            style={{ display: 'none', padding: '8px', background: 'var(--bg-app)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', color: 'var(--text-main)', cursor: 'pointer' }}
          >
            {mobileDrawerOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

        </div>

        {/* ── Secondary Navigation ── */}
        <div style={{ borderTop: '1px solid var(--border)', background: 'rgba(255, 255, 255, 0.3)' }}>
          <div className="container flex items-center gap-6 no-scrollbar" style={{ height: '48px', overflowX: 'auto' }}>
            {navLinks.map(([label, path]) => (
              <NavLink 
                key={label} 
                to={path}
                style={({ isActive }) => ({
                  color: isActive ? 'var(--primary)' : 'var(--text-main)',
                  fontWeight: isActive ? '600' : '500',
                  fontSize: '14px',
                  borderBottom: isActive ? '3px solid var(--primary)' : '3px solid transparent',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0 4px',
                  transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                  whiteSpace: 'nowrap'
                })}
              >
                {label}
              </NavLink>
            ))}
          </div>
        </div>

      </header>

      {/* ── Mobile Navigation Drawer ── */}
      {mobileDrawerOpen && (
        <>
          <div className="mobile-nav-backdrop" onClick={() => setMobileDrawerOpen(false)} />
          <aside className="mobile-nav-drawer">
            {/* Drawer Header */}
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-app)' }}>
              <img src="/logo.png" alt="Arvaya" style={{ height: '32px' }} />
              <button 
                onClick={() => setMobileDrawerOpen(false)}
                style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* User Profile / Auth CTA */}
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', background: 'var(--primary-light)' }}>
              {user ? (
                <div className="flex justify-between items-center">
                  <div>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Logged in as</span>
                    <b style={{ display: 'block', fontSize: '15px', color: 'var(--primary-dark)' }}>{user.name}</b>
                  </div>
                  <button 
                    className="btn btn-secondary flex items-center gap-1"
                    style={{ padding: '6px 12px', fontSize: '13px' }}
                    onClick={() => {
                      logout();
                      setMobileDrawerOpen(false);
                      go("/");
                    }}
                  >
                    <LogOut size={14} /> Logout
                  </button>
                </div>
              ) : (
                <div>
                  <b style={{ display: 'block', fontSize: '15px', color: 'var(--primary-dark)', marginBottom: '8px' }}>Welcome to Arvaya</b>
                  <button 
                    className="btn btn-primary w-full flex items-center justify-center gap-2" 
                    onClick={() => {
                      setMobileDrawerOpen(false);
                      openLoginModal();
                    }}
                    style={{ fontSize: '14px', padding: '10px 16px' }}
                  >
                    <User size={16} /> Login / Sign Up
                  </button>
                </div>
              )}
            </div>

            {/* Navigation Links */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em', marginBottom: '8px' }}>Navigation</span>
              {navLinks.map(([label, path]) => (
                <NavLink
                  key={label}
                  to={path}
                  onClick={() => setMobileDrawerOpen(false)}
                  style={({ isActive }) => ({
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '15px',
                    fontWeight: isActive ? '700' : '500',
                    color: isActive ? 'var(--primary)' : 'var(--text-main)',
                    background: isActive ? 'var(--primary-light)' : 'transparent',
                    display: 'flex',
                    justify: 'space-between',
                    alignItems: 'center'
                  })}
                >
                  <span>{label}</span>
                  <ArrowRight size={16} style={{ opacity: 0.4 }} />
                </NavLink>
              ))}

              <div style={{ margin: '16px 0', borderTop: '1px solid var(--border)' }} />

              <span style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em', marginBottom: '8px' }}>More Services</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px', color: 'var(--text-muted)', paddingLeft: '8px' }}>
                <span className="flex items-center gap-2 cursor-pointer"><Smartphone size={16} /> Download Mobile App</span>
                <span className="flex items-center gap-2 cursor-pointer"><HelpCircle size={16} /> Help & Support</span>
                <span>For Healthcare Providers</span>
                <span>Corporate Wellness</span>
              </div>
            </div>

          </aside>
        </>
      )}

      {/* Embedded Responsive CSS Rules for Header */}
      <style>{`
        @media (max-width: 768px) {
          .header-desktop-auth {
            display: none !important;
          }
          .mobile-hamburger-btn {
            display: flex !important;
          }
          .header-location-picker {
            padding: 0 10px !important;
            font-size: 12px !important;
          }
          .header-search-bar {
            max-width: 100% !important;
          }
        }
        @media (max-width: 520px) {
          .header-location-picker {
            display: none !important;
          }
        }
      `}</style>
    </>
  );
}

