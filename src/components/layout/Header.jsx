import { Search, MapPin, ChevronDown, User, LogOut, Smartphone, HelpCircle, Menu, X, ArrowRight, Check, Stethoscope, FlaskConical, Building2, Settings, Bell } from "lucide-react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useState, useRef, useEffect, useMemo } from "react";
import { doctors, packages } from "../../mocks/data";
import { useBooking } from "../../context/BookingContext";
import { getLocations } from "../../services/dataService";

function getUserDisplayName(user) {
  if (!user) return "User";
  if (typeof user === "string") return user;

  const rawName = user.name || user.full_name || user.fullName || user.user_name || user.userName;
  if (rawName && typeof rawName === "string" && !rawName.startsWith("User (") && rawName !== "User") {
    return rawName;
  }

  const title = user.title ? user.title.trim() + " " : "";
  const firstName = user.first_name || user.firstName || "";
  const lastName = user.last_name || user.lastName || "";
  if (firstName || lastName) {
    return `${title}${firstName} ${lastName}`.trim();
  }

  if (user.email) return user.email.split("@")[0];

  return rawName || "User";
}

export default function Header() {
  const { user, openLoginModal, logout } = useAuth();
  const { setDoctor } = useBooking();
  const go = useNavigate();

  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState("Bangalore");
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [q, setQ] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const searchContainerRef = useRef(null);
  const locationPickerRef = useRef(null);
  const profileMenuRef = useRef(null);

  const [locations, setLocations] = useState([]);
  const [locPage, setLocPage] = useState(1);
  const [hasMoreLocs, setHasMoreLocs] = useState(true);
  const [loadingLocs, setLoadingLocs] = useState(false);

  useEffect(() => {
    if (isLocationOpen && locations.length === 0) {
      loadMoreLocations(1);
    }
  }, [isLocationOpen]);

  const displayName = getUserDisplayName(user);
  const displayInitial = (displayName || "U").charAt(0).toUpperCase();
  const userPhone = getUserPhone(user);

  const loadMoreLocations = async (page) => {
    if (loadingLocs || (!hasMoreLocs && page > 1)) return;
    setLoadingLocs(true);
    try {
      const res = await getLocations(page, 10);
      const newLocs = res.list || [];
      if (newLocs.length < 10) setHasMoreLocs(false);

      const uniqueNewLocs = newLocs.filter(nl => !locations.some(l => l.entitylocation === nl.entitylocation));

      setLocations(prev => page === 1 ? newLocs : [...prev, ...uniqueNewLocs]);
      setLocPage(page);
    } catch (err) {
      console.error(err);
    }
    setLoadingLocs(false);
  };

  const handleLocScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    if (scrollTop + clientHeight >= scrollHeight - 10) {
      loadMoreLocations(locPage + 1);
    }
  };

  // Click outside listener for search & location popovers
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setIsSearchFocused(false);
      }
      if (locationPickerRef.current && !locationPickerRef.current.contains(event.target)) {
        setIsLocationOpen(false);
      }
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setIsProfileMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Static Search Matching
  const filteredDoctors = useMemo(() => {
    if (!q.trim()) return [];
    return doctors.filter(d =>
      d.name.toLowerCase().includes(q.toLowerCase()) ||
      d.specialty.toLowerCase().includes(q.toLowerCase()) ||
      d.hospital.toLowerCase().includes(q.toLowerCase())
    );
  }, [q]);

  const filteredPackages = useMemo(() => {
    if (!q.trim()) return [];
    return packages.filter(p =>
      p.title.toLowerCase().includes(q.toLowerCase())
    );
  }, [q]);

  const handleSelectDoctor = (doc) => {
    setDoctor(doc);
    setIsSearchFocused(false);
    setQ("");
    go("/doctor");
  };

  const handleSelectLab = (pkg) => {
    setIsSearchFocused(false);
    setQ("");
    go(`/labs`);
  };

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    setIsSearchFocused(false);
    go(`/doctors?q=${encodeURIComponent(q)}&loc=${encodeURIComponent(selectedCity)}`);
  };

  const navLinks = [
    ["Home", "/"],
    ["Consult Doctors", "/doctors"],
    ["Pharmacy", "/pharmacy"],
    ["Lab Tests", "/labs"],
    ["ABHA Hub", "/abha"],
    ["Patient Portal", "/records"],
    ["Wallet", "/wallet"],
    ["Rewards", "/rewards"],
    ["Refer & Earn", "/referrals"],
    ["Analytics", "/analytics"],
    ["🚑 Ambulance", "/ambulance"],
    ["Support", "/support"],
    ["🤖 AI Assistant", "/ai-assistant"]
  ];

  return (
    <>
      {/* ── Main Header ── */}
      <header className="glass" style={{ position: 'sticky', top: '0px', zIndex: 100 }}>

        <div className="container flex justify-between items-center header-main-row" style={{ height: '76px', padding: '0 24px', gap: '16px' }}>

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2" style={{ flexShrink: 0 }}>
            <img src="/logo.png" alt="Arvaya Logo" style={{ height: '36px', width: 'auto' }} />
          </Link>

          {/* Universal Search Bar & Location Picker */}
          <div ref={searchContainerRef} className="header-search-bar flex-1 flex items-center" style={{ position: 'relative', maxWidth: '600px', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', background: 'rgba(255, 255, 255, 0.8)', boxShadow: isSearchFocused ? '0 0 0 4px rgba(46, 102, 110, 0.12)' : 'var(--shadow-sm)', height: '44px', transition: 'all 0.25s' }}>

            {/* Location Selector */}
            <div ref={locationPickerRef} style={{ position: 'relative', height: '100%' }}>
              <div
                className="header-location-picker flex items-center gap-1"
                onClick={() => setIsLocationOpen(!isLocationOpen)}
                style={{ padding: '0 16px', borderRight: '1px solid var(--border)', color: 'var(--text-main)', fontSize: '13px', fontWeight: '600', cursor: 'pointer', background: 'var(--bg-app)', height: '100%', transition: 'background 0.2s', flexShrink: 0, userSelect: 'none' }}
              >
                <MapPin size={16} className="text-primary" />
                <span>{selectedCity}</span>
                <ChevronDown size={16} className="text-muted" style={{ transform: isLocationOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
              </div>

              {/* Location Dropdown Menu */}
              {isLocationOpen && (
                <div onScroll={handleLocScroll} className="styled-scrollbar" style={{ position: 'absolute', top: '50px', left: 0, width: '220px', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '12px', boxShadow: '0 12px 32px rgba(18,51,58,0.18)', zIndex: 120, padding: '6px 0', animation: 'fadeIn 0.2s ease', maxHeight: '300px', overflowY: 'auto' }}>
                  <div style={{ padding: '6px 14px', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>Select Location</div>
                  {locations.map((loc, idx) => {
                    const locName = loc.city || loc.alt_name || "Unknown";
                    return (
                      <div
                        key={loc.entitylocation || idx}
                        onClick={() => { setSelectedCity(locName); setIsLocationOpen(false); }}
                        style={{ padding: '10px 14px', fontSize: '13px', color: selectedCity === locName ? 'var(--primary)' : 'var(--text-main)', fontWeight: selectedCity === locName ? '700' : '500', background: selectedCity === locName ? 'var(--primary-light)' : 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: 'background 0.2s' }}
                        onMouseOver={e => { if (selectedCity !== locName) e.currentTarget.style.background = 'var(--bg-app)'; }}
                        onMouseOut={e => { if (selectedCity !== locName) e.currentTarget.style.background = 'transparent'; }}
                      >
                        <span style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <span>{locName}</span>
                          {loc.alt_name && loc.city && <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '500' }}>{loc.alt_name}</span>}
                        </span>
                        {selectedCity === locName && <Check size={14} color="var(--primary)" />}
                      </div>
                    );
                  })}
                  {loadingLocs && <div style={{ padding: '12px', textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)' }}>Loading more...</div>}
                </div>
              )}
            </div>

            {/* Search Input */}
            <form onSubmit={handleSearchSubmit} className="flex-1 flex items-center gap-2" style={{ padding: '0 16px', background: 'transparent', minWidth: '0', height: '100%' }}>
              <Search size={18} className="text-muted" style={{ flexShrink: 0 }} />
              <input
                placeholder="Search doctors, specialties, lab tests..."
                value={q}
                onChange={e => setQ(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '14px', color: 'var(--text-main)' }}
              />
              {q && (
                <X size={16} className="text-muted cursor-pointer" onClick={() => setQ("")} />
              )}
            </form>

            {/* Search Autocomplete Results Popover */}
            {isSearchFocused && q.trim().length > 0 && (
              <div className="header-search-popover" style={{ position: 'absolute', top: '50px', left: 0, right: 0, background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '16px', boxShadow: '0 16px 40px rgba(18,51,58,0.2)', zIndex: 110, padding: '16px', animation: 'fadeIn 0.2s ease', maxHeight: '420px', overflowY: 'auto' }}>

                {/* Section: Doctors */}
                {filteredDoctors.length > 0 && (
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Stethoscope size={14} color="var(--primary)" /> Top Doctors
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {filteredDoctors.map(doc => (
                        <div
                          key={doc.id}
                          onClick={() => handleSelectDoctor(doc)}
                          style={{ padding: '10px 12px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', transition: 'background 0.2s', background: 'var(--bg-app)' }}
                          onMouseOver={e => e.currentTarget.style.background = 'var(--primary-light)'}
                          onMouseOut={e => e.currentTarget.style.background = 'var(--bg-app)'}
                        >
                          <div>
                            <b style={{ fontSize: '14px', color: 'var(--primary-dark)', display: 'block' }}>{doc.name}</b>
                            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{doc.specialty} • {doc.hospital}</span>
                          </div>
                          <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-main)' }}>₹{doc.fee}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Section: Lab Tests */}
                {filteredPackages.length > 0 && (
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <FlaskConical size={14} color="var(--accent)" /> Lab Packages & Diagnostics
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {filteredPackages.map((pkg, i) => (
                        <div
                          key={i}
                          onClick={() => handleSelectLab(pkg)}
                          style={{ padding: '10px 12px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', transition: 'background 0.2s', background: 'var(--bg-app)' }}
                          onMouseOver={e => e.currentTarget.style.background = 'var(--primary-light)'}
                          onMouseOut={e => e.currentTarget.style.background = 'var(--bg-app)'}
                        >
                          <div>
                            <b style={{ fontSize: '14px', color: 'var(--text-main)', display: 'block' }}>{pkg.title}</b>
                            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{pkg.tests}</span>
                          </div>
                          <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--primary)' }}>{pkg.price}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* View All Search Action */}
                <div
                  onClick={() => handleSearchSubmit()}
                  style={{ borderTop: '1px solid var(--border)', paddingTop: '12px', marginTop: '8px', textAlign: 'center', fontSize: '13px', fontWeight: '700', color: 'var(--primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                >
                  <span>Search all results for "{q}" in {selectedCity}</span>
                  <ArrowRight size={14} />
                </div>
              </div>
            )}
          </div>

          {/* Right Auth CTA (Desktop) */}
          <div className="header-desktop-auth flex items-center gap-4" style={{ flexShrink: 0 }}>
            {user ? (
              <div className="flex items-center gap-4" ref={profileMenuRef} style={{ position: 'relative' }}>
                <div
                  className="flex items-center gap-3 cursor-pointer"
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  style={{ padding: '6px 12px', border: '1px solid var(--border)', borderRadius: '30px', background: 'var(--bg-surface)', transition: 'background 0.2s' }}
                  onMouseOver={e => e.currentTarget.style.background = 'var(--bg-app)'}
                  onMouseOut={e => e.currentTarget.style.background = 'var(--bg-surface)'}
                >
                  <div className="flex flex-col items-end">
                    <span className="text-muted" style={{ fontSize: '11px', lineHeight: '1' }}>Welcome,</span>
                    <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-main)' }}>{displayName.split(" ")[0]}</span>
                  </div>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--primary-light)', color: 'var(--primary-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '16px' }}>
                    {displayInitial}
                  </div>
                  <ChevronDown size={16} className="text-muted" style={{ transform: isProfileMenuOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                </div>

                {/* Profile Dropdown */}
                {isProfileMenuOpen && (
                  <div style={{ position: 'absolute', top: '56px', right: 0, width: '220px', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '12px', boxShadow: '0 12px 32px rgba(18,51,58,0.18)', zIndex: 120, padding: '8px 0', animation: 'fadeIn 0.2s ease' }}>
                    <div style={{ padding: '8px 16px', borderBottom: '1px solid var(--border)', marginBottom: '8px' }}>
                      <b style={{ fontSize: '14px', color: 'var(--text-main)', display: 'block' }}>{displayName}</b>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{userPhone || '+91 XXXXX XXXXX'}</span>
                    </div>

                    <div
                      className="flex items-center gap-3 cursor-pointer"
                      onClick={() => { setIsProfileMenuOpen(false); go("/profile"); }}
                      style={{ padding: '10px 16px', fontSize: '14px', color: 'var(--text-main)', transition: 'background 0.2s' }}
                      onMouseOver={e => e.currentTarget.style.background = 'var(--bg-app)'}
                      onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <User size={16} className="text-muted" /> Patient Profile
                    </div>

                    <div
                      className="flex items-center gap-3 cursor-pointer"
                      onClick={() => { setIsProfileMenuOpen(false); go("/notifications"); }}
                      style={{ padding: '10px 16px', fontSize: '14px', color: 'var(--text-main)', transition: 'background 0.2s' }}
                      onMouseOver={e => e.currentTarget.style.background = 'var(--bg-app)'}
                      onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <Bell size={16} className="text-muted" /> Notifications
                    </div>

                    <div
                      className="flex items-center gap-3 cursor-pointer"
                      onClick={() => { setIsProfileMenuOpen(false); go("/my-appointments"); }}
                      style={{ padding: '10px 16px', fontSize: '14px', color: 'var(--text-main)', transition: 'background 0.2s' }}
                      onMouseOver={e => e.currentTarget.style.background = 'var(--bg-app)'}
                      onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <User size={16} className="text-muted" /> My Appointments
                    </div>

                    <div
                      className="flex items-center gap-3 cursor-pointer"
                      onClick={() => { setIsProfileMenuOpen(false); go("/prescriptions"); }}
                      style={{ padding: '10px 16px', fontSize: '14px', color: 'var(--text-main)', transition: 'background 0.2s' }}
                      onMouseOver={e => e.currentTarget.style.background = 'var(--bg-app)'}
                      onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <User size={16} className="text-muted" /> My Prescriptions
                    </div>

                    <div
                      className="flex items-center gap-3 cursor-pointer"
                      onClick={() => { setIsProfileMenuOpen(false); go("/orders"); }}
                      style={{ padding: '10px 16px', fontSize: '14px', color: 'var(--text-main)', transition: 'background 0.2s' }}
                      onMouseOver={e => e.currentTarget.style.background = 'var(--bg-app)'}
                      onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <User size={16} className="text-muted" /> My Orders
                    </div>

                    <div
                      className="flex items-center gap-3 cursor-pointer"
                      onClick={() => { setIsProfileMenuOpen(false); go("/payments"); }}
                      style={{ padding: '10px 16px', fontSize: '14px', color: 'var(--text-main)', transition: 'background 0.2s' }}
                      onMouseOver={e => e.currentTarget.style.background = 'var(--bg-app)'}
                      onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <User size={16} className="text-muted" /> Payments & Invoices
                    </div>

                    <div
                      className="flex items-center gap-3 cursor-pointer"
                      onClick={() => { setIsProfileMenuOpen(false); go("/settings"); }}
                      style={{ padding: '10px 16px', fontSize: '14px', color: 'var(--text-main)', transition: 'background 0.2s' }}
                      onMouseOver={e => e.currentTarget.style.background = 'var(--bg-app)'}
                      onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <Settings size={16} className="text-muted" /> App Settings
                    </div>

                    <div
                      className="flex items-center gap-3 cursor-pointer"
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        logout();
                        go("/");
                      }}
                      style={{ padding: '10px 16px', fontSize: '14px', color: 'var(--error, #e53e3e)', transition: 'background 0.2s' }}
                      onMouseOver={e => e.currentTarget.style.background = 'var(--bg-app)'}
                      onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <LogOut size={16} /> Logout
                    </div>
                  </div>
                )}
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
                <div className="flex flex-col gap-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '18px' }}>
                        {displayInitial}
                      </div>
                      <div>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Logged in as</span>
                        <b style={{ display: 'block', fontSize: '15px', color: 'var(--primary-dark)' }}>{displayName}</b>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      className="btn btn-primary flex-1 flex items-center justify-center gap-2"
                      style={{ padding: '8px', fontSize: '13px' }}
                      onClick={() => {
                        setMobileDrawerOpen(false);
                        go("/profile");
                      }}
                    >
                      <User size={14} /> Profile
                    </button>
                    <button
                      className="btn btn-primary flex-1 flex items-center justify-center gap-2"
                      style={{ padding: '8px', fontSize: '13px' }}
                      onClick={() => {
                        setMobileDrawerOpen(false);
                        go("/settings");
                      }}
                    >
                      <Settings size={14} /> Settings
                    </button>
                    <button
                      className="btn btn-secondary flex items-center justify-center gap-2"
                      style={{ padding: '8px 12px', fontSize: '13px' }}
                      onClick={() => {
                        logout();
                        setMobileDrawerOpen(false);
                        go("/");
                      }}
                    >
                      <LogOut size={14} /> Logout
                    </button>
                  </div>
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

