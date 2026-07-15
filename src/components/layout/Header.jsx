import { HeartPulse, Search, MapPin, ChevronDown, User, LogOut, Smartphone, HelpCircle } from "lucide-react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Header() {
  const { user, openLoginModal, logout } = useAuth();
  const go = useNavigate();

  return (
    <header style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-surface)' }}>
      {/* ── Top Bar ── */}
      <div style={{ background: 'var(--bg-app)', borderBottom: '1px solid var(--border)' }}>
        <div className="container flex justify-between items-center" style={{ height: '32px', fontSize: '12px', color: 'var(--text-muted)', fontWeight: '500' }}>
          <div className="flex gap-4">
            <span className="flex items-center gap-1 cursor-pointer hover:text-primary"><Smartphone size={14}/> Download App</span>
            <span className="flex items-center gap-1 cursor-pointer hover:text-primary"><HelpCircle size={14}/> Help Center</span>
          </div>
          <div className="flex gap-4">
            <span className="cursor-pointer hover:text-primary">For Providers</span>
            <span className="cursor-pointer hover:text-primary">Corporate Health</span>
          </div>
        </div>
      </div>

      {/* ── Main Header ── */}
      <div className="container flex justify-between items-center" style={{ height: '76px', padding: '0 24px' }}>
        
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2" style={{ marginRight: '32px' }}>
           <img src="/logo.png" alt="Arvaya Logo" style={{ height: '36px', width: 'auto' }} />
        </Link>
        
        {/* Universal Search Bar */}
        <div className="flex-1 flex items-center" style={{ maxWidth: '600px', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden', height: '44px' }}>
          
          {/* Location Selector */}
          <div className="flex items-center gap-1" style={{ padding: '0 16px', borderRight: '1px solid var(--border)', color: 'var(--text-main)', fontSize: '14px', fontWeight: '500', cursor: 'pointer', background: 'var(--bg-app)', height: '100%' }}>
            <MapPin size={16} className="text-muted" />
            <span>Bangalore</span>
            <ChevronDown size={16} className="text-muted" />
          </div>

          {/* Search Input */}
          <div className="flex-1 flex items-center gap-2" style={{ padding: '0 16px', background: 'var(--bg-surface)' }}>
            <Search size={18} className="text-muted" />
            <input 
              placeholder="Search doctors, clinics, hospitals, diseases..." 
              style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '14px' }}
            />
          </div>
        </div>
        
        {/* Right Auth / Cart CTA */}
        <div className="flex items-center gap-6" style={{ marginLeft: '32px' }}>
          
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
              <button className="btn btn-primary" onClick={() => openLoginModal()} style={{ fontSize: '14px' }}>
                Login / Sign Up
              </button>
            </div>
          )}
        </div>

      </div>

      {/* ── Secondary Navigation ── */}
      <div style={{ borderTop: '1px solid var(--border)', background: 'var(--bg-surface)' }}>
        <div className="container flex items-center gap-6" style={{ height: '48px', overflowX: 'auto' }}>
          {[
            ["Home", "/"],
            ["Consult Doctors", "/doctors"],
            ["Lab Tests", "/labs"],
            ["ABHA Hub", "/abha"],
            ["Patient Portal", "/records"],
            ["Wallet", "/wallet"],
            ["Rewards", "/rewards"],
            ["Analytics", "/analytics"],
            ["🚨 24/7 Ambulance", "/ambulance"],
          ].map((x) => (
            <NavLink 
              key={x[0]} 
              to={x[1]}
              style={({ isActive }) => ({
                color: isActive ? 'var(--primary)' : 'var(--text-main)',
                fontWeight: isActive ? '600' : '500',
                fontSize: '14px',
                borderBottom: isActive ? '3px solid var(--primary)' : '3px solid transparent',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                padding: '0 4px',
                transition: 'all 0.2s',
                whiteSpace: 'nowrap'
              })}
            >
              {x[0]}
            </NavLink>
          ))}
        </div>
      </div>
    </header>
  );
}
