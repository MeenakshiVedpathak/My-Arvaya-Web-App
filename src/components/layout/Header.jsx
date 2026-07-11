import { Bell, LogOut, Wallet, Award } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import Brand from "../common/Brand";
import { useAuth } from "../../context/AuthContext";

export default function Header() {
  const { user, logout, openLoginModal } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const go = useNavigate();

  function handleLogout() {
    logout();
    go("/");
  }

  const initials = user?.name
    ? user.name.split(" ").map(w => w[0]).join("").toUpperCase()
    : "U";

  return (
    <header className="platform-header">
      <div className="container nav" style={{ justifyContent: "space-between", height: '100%' }}>
        <Brand />
        
        {/* Main Platform Navigation */}
        <nav style={{ display: 'flex', gap: "32px", alignItems: 'center' }}>
          {[
            ["Consult Doctors", "/doctors"],
            ["Lab Tests", "/labs"],
            ["Find Hospitals", "/hospitals"],
            ["Records & ABHA", "/records"],
          ].map((x) => (
            <NavLink 
              key={x[0]} 
              to={x[1]} 
              style={({ isActive }) => ({ 
                color: isActive ? "var(--primary)" : "#334155", 
                fontWeight: isActive ? "600" : "500", 
                fontSize: "15px",
                textDecoration: 'none',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                height: '80px', // Full header height
                borderBottom: isActive ? "3px solid var(--primary)" : "3px solid transparent",
                transition: 'all 0.2s'
              })}
            >
              {x[0]}
            </NavLink>
          ))}
        </nav>

        {/* User Actions */}
        <div className="navicons" style={{ gap: "20px", alignItems: "center", display: 'flex' }}>
          {user ? (
            <>
              <div style={{ display: 'flex', gap: '16px', marginRight: '8px' }}>
                <NavLink to="/wallet" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textDecoration: 'none', color: '#64748b' }}>
                  <Wallet size={20} />
                  <span style={{ fontSize: '11px', fontWeight: '600', marginTop: '2px' }}>Wallet</span>
                </NavLink>
                <NavLink to="/rewards" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textDecoration: 'none', color: '#64748b' }}>
                  <Award size={20} />
                  <span style={{ fontSize: '11px', fontWeight: '600', marginTop: '2px' }}>Rewards</span>
                </NavLink>
              </div>

              <div style={{ width: '1px', height: '32px', background: '#e2e8f0' }} />

              <div style={{ position: "relative", display: "flex", background: '#f8fafc', borderRadius: '50%', padding: '10px', cursor: 'pointer', transition: 'background 0.2s' }}>
                <Bell size={20} color="#475569" />
                <span style={{ position: "absolute", top: "-2px", right: "-2px", background: "#ef4444", color: "#fff", fontSize: "10px", width: "18px", height: "18px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", border: '2px solid #fff' }}>3</span>
              </div>
              
              <div style={{ position: "relative" }}>
                <div
                  onClick={() => setShowMenu(!showMenu)}
                  style={{
                    width: 44, height: 44, borderRadius: "50%",
                    background: "linear-gradient(135deg, var(--primary), var(--primary-dark))",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#fff", fontWeight: "700", fontSize: "16px",
                    cursor: "pointer", userSelect: "none", boxShadow: '0 4px 12px rgba(46,102,110,0.2)'
                  }}
                >
                  {initials}
                </div>
                {showMenu && (
                  <div style={{
                    position: "absolute", top: "54px", right: 0, background: "#fff",
                    borderRadius: "16px", boxShadow: "0 10px 40px rgba(0,0,0,0.12)",
                    padding: "8px 0", minWidth: "220px", zIndex: 100, border: '1px solid #e2e8f0'
                  }}>
                    <div style={{ padding: "16px", borderBottom: "1px solid #f1f5f9" }}>
                      <b style={{ fontSize: "15px", color: "#0f172a", display: "block" }}>{user?.name}</b>
                      <small style={{ fontSize: "13px", color: "#64748b" }}>{user?.email}</small>
                    </div>
                    <div style={{ padding: '8px' }}>
                      <button
                        onClick={handleLogout}
                        style={{
                          display: "flex", alignItems: "center", gap: "10px",
                          width: "100%", padding: "12px", border: "none",
                          background: "#fef2f2", borderRadius: '8px', cursor: "pointer", fontSize: "14px",
                          color: "#dc2626", fontWeight: "600", transition: 'background 0.2s'
                        }}
                      >
                        <LogOut size={16} /> Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <button 
              onClick={() => openLoginModal()}
              style={{ background: 'var(--primary)', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '999px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}
            >
              Login / Signup
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
