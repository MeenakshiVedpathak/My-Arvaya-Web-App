import { Bell, LogOut } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import Brand from "../common/Brand";
import { useAuth } from "../../context/AuthContext";
export default function Header() {
  const { user, logout } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const go = useNavigate();

  function handleLogout() {
    logout();
    go("/login");
  }

  const initials = user?.name
    ? user.name.split(" ").map(w => w[0]).join("").toUpperCase()
    : "U";

  return (
    <header>
      <div className="container nav" style={{ justifyContent: "space-between" }}>
        <Brand />
        <nav style={{ justifyContent: "center", gap: "20px" }}>
          {[
            ["Lab Tests", "/labs"],
            ["ABHA", "/abha"],
            ["Health Records", "/records"],
            ["Wallet", "/wallet"],
            ["Rewards", "/rewards"],
          ].map((x) => (
            <NavLink 
              key={x[0]} 
              to={x[1]} 
              style={({ isActive }) => ({ 
                color: isActive ? "var(--primary)" : "var(--blue)", 
                fontWeight: "600", 
                fontSize: "14px",
                borderBottom: isActive ? "2px solid #fb913f" : "2px solid transparent",
                paddingBottom: "4px"
              })}
            >
              {x[0]}
            </NavLink>
          ))}
        </nav>
        <div className="navicons" style={{ gap: "20px", alignItems: "center" }}>
          {user && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', marginRight: '8px' }}>
              <span style={{ fontWeight: '700', color: '#1a202c', fontSize: '15px' }}>
                Hi, {user.name ? user.name.split(' ')[0] : 'User'}
              </span>
              <span style={{ fontSize: '12px', color: '#fb913f', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '500' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                Sangli Miraj Kupwad
              </span>
            </div>
          )}

          <div style={{ position: "relative", display: "flex", background: '#fff', borderRadius: '50%', padding: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', cursor: 'pointer' }}>
            <Bell size={20} color="#4e4e4d" />
            <span style={{ position: "absolute", top: "0px", right: "0px", background: "#ff5b5b", color: "#fff", fontSize: "10px", width: "16px", height: "16px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" }}>3</span>
          </div>
          
          <div style={{ display: "flex", background: '#fff', borderRadius: '50%', padding: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', cursor: 'pointer' }}>
             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><path d="m9 12 2 2 4-4"></path></svg>
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
                position: "absolute", top: "50px", right: 0, background: "#fff",
                borderRadius: "12px", boxShadow: "0 10px 30px rgba(0,0,0,0.12)",
                padding: "8px 0", minWidth: "200px", zIndex: 100,
              }}>
                <div style={{ padding: "12px 16px", borderBottom: "1px solid #edf1f6" }}>
                  <b style={{ fontSize: "14px", color: "#4e4e4d", display: "block" }}>{user?.name}</b>
                  <small style={{ fontSize: "12px", color: "#718096" }}>{user?.email}</small>
                </div>
                <button
                  onClick={handleLogout}
                  style={{
                    display: "flex", alignItems: "center", gap: "10px",
                    width: "100%", padding: "12px 16px", border: "none",
                    background: "none", cursor: "pointer", fontSize: "14px",
                    color: "#e53e3e", fontWeight: "500",
                  }}
                >
                  <LogOut size={16} /> Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
