import { Search, MapPin, ChevronDown, User, LogOut, Smartphone, HelpCircle, Menu, X, ArrowRight, Check, Stethoscope, FlaskConical, Building2, Settings, Bell, Gift, Send, Mail, Copy, Share2 } from "lucide-react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useState, useRef, useEffect, useMemo } from "react";
import { getLocations, getDoctors, getLabPackages } from "../../services/dataService";
import { useBooking } from "../../context/BookingContext";
import { fetchImageBlob, getImageUrl } from "../../services/uploadService";
import { getPatients } from "../../services/dataService";

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

  try {
    const storedUser = localStorage.getItem("arvaya_user");
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      const storedName = parsed?.name || parsed?.full_name || parsed?.fullName;
      if (storedName && !storedName.startsWith("User (") && storedName !== "User") {
        return storedName;
      }
      const pFirst = parsed?.first_name || parsed?.firstName || "";
      const pLast = parsed?.last_name || parsed?.lastName || "";
      if (pFirst || pLast) {
        return `${pFirst} ${pLast}`.trim();
      }
    }
  } catch (e) { }

  return (rawName && rawName !== "User") ? rawName : "User";
}

function getUserPhone(user) {
  if (!user) return "";
  const rawPhone = user.phone || user.mobile_number || user.mobile || user.mobile_no || user.phone_number || user.phoneNumber;
  if (!rawPhone) return "";
  const cleanPhone = String(rawPhone).trim();
  if (cleanPhone.startsWith("+91")) return cleanPhone;
  if (cleanPhone.startsWith("91") && cleanPhone.length === 12) return `+${cleanPhone}`;
  return `+91 ${cleanPhone}`;
}
export default function Header() {
  const { user, openLoginModal, logout } = useAuth();
  const { globalLocation, setGlobalLocation, setDoctor } = useBooking();
  const go = useNavigate();

  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const selectedCity = globalLocation ? (globalLocation.city || globalLocation.alt_name || globalLocation.name || "Unknown") : "Loading...";
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [locSearch, setLocSearch] = useState("");
  const [q, setQ] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [headerAvatar, setHeaderAvatar] = useState("");
  const [isReferralModalOpen, setIsReferralModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isCustomShareOpen, setIsCustomShareOpen] = useState(false);

  const appDownloadUrl = "https://drive.google.com/file/d/136Lb50jdaadDi9_Uigmq-Qsu2zm9jx51/view?usp=sharing";

  const referralCode = useMemo(() => {
    return user?.referral_code || user?.referralCode || user?.id || user?.user_id || "0";
  }, [user]);

  const defaultShareMessage = useMemo(() => {
    return `🏥 Hi!\n\nI'm using Arvaya, a healthcare app that helps you manage your healthcare needs conveniently.\n\n🎁 Use my referral code: ${referralCode}\n\n💰 Sign up with this code and we both earn cashback rewards.\n\n📲 Download the app:\n${appDownloadUrl}\n\nSee you on Arvaya! 😊`;
  }, [referralCode, appDownloadUrl]);

  const customShareOptions = useMemo(() => [
    {
      id: 'whatsapp',
      name: 'WhatsApp',
      color: '#25D366',
      icon: (
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.458 5.704 1.46h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      )
    },
    {
      id: 'telegram',
      name: 'Telegram',
      color: '#0088cc',
      icon: (
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15.74-.79 3.8-1.12 5.59-.14.76-.42 1.01-.69 1.04-.59.05-1.04-.39-1.61-.76-.89-.58-1.39-.94-2.26-1.51-1.01-.66-.35-1.02.22-1.61 1.5-1.53 2.75-2.77 2.78-2.82.04-.06.07-.2-.01-.27-.08-.07-.23-.05-.33-.03-.14.03-2.45 1.56-4.94 3.23-.36.25-.69.37-.99.36-.33 0-.96-.18-1.44-.34-.58-.19-1.05-.29-1.01-.62.02-.17.25-.35.69-.53 2.69-1.17 4.5-1.95 5.41-2.33 2.58-1.07 3.11-1.25 3.47-1.26.08 0 .25.02.36.11.09.08.12.18.13.27 0 .05-.01.15-.02.2z" />
        </svg>
      )
    },
    {
      id: 'teams',
      name: 'Teams',
      color: '#464EB8',
      icon: (
        <svg viewBox="0 0 16 16" width="20" height="20" fill="currentColor">
          <path d="M9.186 4.797a2.42 2.42 0 1 0-2.86-2.448h1.178c.929 0 1.682.753 1.682 1.682zm-4.295 7.738h2.613c.929 0 1.682-.753 1.682-1.682V5.58h2.783a.7.7 0 0 1 .682.716v4.294a4.197 4.197 0 0 1-4.093 4.293c-1.618-.04-3-.99-3.667-2.35Zm10.737-9.372a1.674 1.674 0 1 1-3.349 0 1.674 1.674 0 0 1 3.349 0m-2.238 9.488-.12-.002a5.2 5.2 0 0 0 .381-2.07V6.306a1.7 1.7 0 0 0-.15-.725h1.792c.39 0 .707.317.707.707v3.765a2.6 2.6 0 0 1-2.598 2.598z" />
          <path d="M.682 3.349h6.822c.377 0 .682.305.682.682v6.822a.68.68 0 0 1-.682.682H.682A.68.68 0 0 1 0 10.853V4.03c0-.377.305-.682.682-.682Zm5.206 2.596v-.72h-3.59v.72h1.357V9.66h.87V5.945z" />
        </svg>
      )
    },
    {
      id: 'twitter',
      name: 'Twitter (X)',
      color: '#000000',
      icon: (
        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      )
    },
    {
      id: 'facebook',
      name: 'Facebook',
      color: '#1877F2',
      icon: (
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      )
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      color: '#0A66C2',
      icon: (
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
      )
    },
    {
      id: 'email',
      name: 'Gmail',
      color: '#EA4335',
      icon: (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
          <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
        </svg>
      )
    },
    {
      id: 'sms',
      name: 'SMS',
      color: '#10B981',
      icon: (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
          <line x1="12" y1="18" x2="12.01" y2="18" />
        </svg>
      )
    },
    {
      id: 'copy',
      name: 'Copy Link',
      color: '#FB913F',
      icon: (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
      )
    }
  ], [referralCode, appDownloadUrl]);

  const handleShare = async (platform) => {
    // Copy formatted message to clipboard first so user can Ctrl+V in any desktop chat app (e.g. Teams, Slack)
    try {
      await navigator.clipboard.writeText(defaultShareMessage);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (e) { }

    if (platform === 'sms') {
      window.open(`sms:?body=${encodeURIComponent(defaultShareMessage)}`, '_self');
      return;
    }
    if (platform === 'email') {
      window.open(`mailto:?subject=${encodeURIComponent("Join me on Arvaya")}&body=${encodeURIComponent(defaultShareMessage)}`, '_blank');
      return;
    }
    if (platform === 'whatsapp') {
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(defaultShareMessage)}`, '_blank');
      return;
    }
    if (platform === 'telegram') {
      window.open(`https://t.me/share/url?url=${encodeURIComponent(appDownloadUrl)}&text=${encodeURIComponent(defaultShareMessage)}`, '_blank');
      return;
    }
    if (platform === 'teams') {
      window.open(`https://teams.microsoft.com/share?href=${encodeURIComponent(appDownloadUrl)}&msgText=${encodeURIComponent(defaultShareMessage)}`, '_blank');
      return;
    }
    if (platform === 'twitter') {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(defaultShareMessage)}`, '_blank');
      return;
    }
    if (platform === 'facebook') {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(appDownloadUrl)}`, '_blank');
      return;
    }
    if (platform === 'linkedin') {
      window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(appDownloadUrl)}`, '_blank');
      return;
    }

    if (platform === 'message' || platform === 'system' || !platform || typeof platform !== 'string') {
      if (navigator.share) {
        try {
          await navigator.share({
            title: 'Arvaya Health App',
            text: defaultShareMessage,
          });
          return;
        } catch (e) {
          if (e.name !== 'AbortError') {
            console.log("Share API error", e);
          }
        }
      }
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(defaultShareMessage)}`, '_blank');
    }
  };

  const handleCopyLink = () => {
    try {
      navigator.clipboard.writeText(defaultShareMessage);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      console.error("Copy failed", e);
    }
  };

  const searchContainerRef = useRef(null);
  const locationPickerRef = useRef(null);
  const profileMenuRef = useRef(null);

  const [locations, setLocations] = useState([]);
  const [loadingLocs, setLoadingLocs] = useState(false);


  useEffect(() => {
    let isMounted = true;

    async function updateHeaderAvatar() {
      if (!user) {
        if (isMounted) setHeaderAvatar("");
        return;
      }
      try {
        const storedUser = localStorage.getItem("arvaya_user");
        let storedUserId = user?.id || user?.user_id || user?.app_user_id;
        if (!storedUserId && storedUser) {
          try {
            const parsed = JSON.parse(storedUser);
            storedUserId = parsed?.id || parsed?.user_id || parsed?.app_user_id;
          } catch (e) { }
        }

        const mobile = user?.phone || user?.mobile_number || user?.mobile;
        const filters = {
          ...(storedUserId ? { id: storedUserId, filterQuery: ` AND id=${storedUserId}` } : {}),
          ...(mobile ? { mobile_number: mobile } : {})
        };

        const res = await getPatients(filters);
        let patientData = null;
        if (Array.isArray(res) && res.length > 0) {
          patientData = res.find(p => String(p.id || p.user_id || p.app_user_id) === String(storedUserId))
            || res.find(p => (p.mobile_number || p.phone || p.mobile) === mobile)
            || res[0];
        } else if (res && typeof res === "object" && !Array.isArray(res)) {
          patientData = res;
        }

        let imgPath = patientData?.profile_image || patientData?.profileImage || patientData?.photo || user?.profile_image || user?.profileImage || "";
        if (!imgPath && storedUser) {
          try {
            const parsed = JSON.parse(storedUser);
            imgPath = parsed?.profile_image || parsed?.profileImage || parsed?.photo || "";
          } catch (e) { }
        }

        if (imgPath) {
          const resolved = await fetchImageBlob(imgPath, "patientProfileImage") || getImageUrl(imgPath, "patientProfileImage");
          if (isMounted && resolved) {
            setHeaderAvatar(resolved);
            return;
          }
        }
        if (isMounted) setHeaderAvatar("");
      } catch (err) {
        console.error("updateHeaderAvatar error:", err);
        if (isMounted) setHeaderAvatar("");
      }
    }

    updateHeaderAvatar();

    const handleProfileUpdate = () => {
      updateHeaderAvatar();
    };
    window.addEventListener("arvaya_profile_updated", handleProfileUpdate);
    return () => {
      isMounted = false;
      window.removeEventListener("arvaya_profile_updated", handleProfileUpdate);
    };
  }, [user]);


  useEffect(() => {
    async function initLocations() {
      setLoadingLocs(true);
      try {
        const res = await getLocations(1, 100);
        const allLocs = res.list || [];
        setLocations(allLocs);

        if (!globalLocation && allLocs.length > 0) {
          setGlobalLocation(allLocs[0]);
        }
      } catch (err) {
        console.error(err);
      }
      setLoadingLocs(false);
    }
    initLocations();
  }, []);

  const displayName = getUserDisplayName(user);
  const displayInitial = (displayName || "U").charAt(0).toUpperCase();
  const userPhone = getUserPhone(user);



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

  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [filteredPackages, setFilteredPackages] = useState([]);

  useEffect(() => {
    if (!q.trim()) {
      setFilteredDoctors([]);
      setFilteredPackages([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const query = q.toLowerCase();

        const docRes = await getDoctors({
          pageSize: 100,
          filter: q,
          location_key: globalLocation?.entitylocation || ""
        });

        const allDocs = docRes.list || [];
        const localFilteredDocs = allDocs.filter(d =>
          d.name?.toLowerCase().includes(query) || d.specialty?.toLowerCase().includes(query)
        );
        setFilteredDoctors(localFilteredDocs.slice(0, 5));

        const pkgRes = await getLabPackages({ pageSize: 100, filter: q });
        const allPkgs = pkgRes || [];
        const localFilteredPkgs = allPkgs.filter(p =>
          p.title?.toLowerCase().includes(query) || p.tests?.toLowerCase().includes(query)
        );
        setFilteredPackages(localFilteredPkgs.slice(0, 5));
      } catch (err) {
        console.error("Search error", err);
      }
    }, 300); // debounce search

    return () => clearTimeout(timer);
  }, [q]);

  const handleSelectDoctor = (doc) => {
    setDoctor(doc);
    setIsSearchFocused(false);
    setQ("");
    go("/doctors/visit-type");
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
    // ["Refer & Earn", "/referrals"],
    ["Analytics", "/analytics"],
    ["Ambulance", "/ambulance"],
    ["Support", "/support"]
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

          {/* Location Picker */}
          <div className="flex-1 flex items-center">
            <div ref={locationPickerRef} style={{ position: 'relative', height: '44px' }}>
              <div
                className="header-location-picker flex items-center gap-1"
                onClick={() => setIsLocationOpen(!isLocationOpen)}
                style={{ padding: '0 16px', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', color: 'var(--text-main)', fontSize: '13px', fontWeight: '600', cursor: 'pointer', background: 'var(--bg-app)', height: '100%', transition: 'background 0.2s', userSelect: 'none', boxShadow: 'var(--shadow-sm)' }}
              >
                <MapPin size={16} className="text-primary" />
                <span>{selectedCity}</span>
                <ChevronDown size={16} className="text-muted" style={{ transform: isLocationOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
              </div>

              {/* Location Dropdown Menu */}
              {isLocationOpen && (
                <div className="styled-scrollbar" style={{ position: 'absolute', top: '50px', left: 0, width: '240px', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '12px', boxShadow: '0 12px 32px rgba(18,51,58,0.18)', zIndex: 120, padding: '10px', animation: 'fadeIn 0.2s ease', maxHeight: '350px', overflowY: 'auto' }}>

                  {/* Location Search Box */}
                  <div style={{ marginBottom: '8px', padding: '0 4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-app)', border: '1px solid var(--border)', borderRadius: '8px', padding: '6px 10px' }}>
                      <Search size={14} color="var(--text-muted)" />
                      <input
                        type="text"
                        placeholder="Search locations..."
                        value={locSearch}
                        onChange={e => setLocSearch(e.target.value)}
                        style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '13px', marginLeft: '6px', color: 'var(--text-main)' }}
                        autoFocus
                      />
                    </div>
                  </div>

                  <div style={{ padding: '6px 4px', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>Available Locations</div>

                  {loadingLocs ? (
                    <div style={{ padding: '12px', textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)' }}>Loading...</div>
                  ) : (
                    locations.filter(loc => {
                      const name = (loc.city || loc.alt_name || "").toLowerCase();
                      return name.includes(locSearch.toLowerCase());
                    }).map((loc, idx) => {
                      const locName = loc.city || loc.alt_name || "Unknown";
                      return (
                        <div
                          key={loc.entitylocation || idx}
                          onClick={() => {
                            setGlobalLocation(loc);
                            setIsLocationOpen(false);
                            setLocSearch(""); // clear search on select
                          }}
                          style={{ padding: '10px 10px', borderRadius: '8px', fontSize: '13px', color: selectedCity === locName ? 'var(--primary)' : 'var(--text-main)', fontWeight: selectedCity === locName ? '700' : '500', background: selectedCity === locName ? 'var(--primary-light)' : 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: 'background 0.2s' }}
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
                    })
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Auth CTA (Desktop & Mobile Icon) */}
          <div className="header-desktop-auth flex items-center gap-3" style={{ flexShrink: 0 }}>
            {/* Refer & Earn Icon Button (Icon only, left of profile tab) */}
            <button
              onClick={() => setIsReferralModalOpen(true)}
              title="Refer & Earn Cashback"
              aria-label="Refer & Earn"
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                background: 'var(--primary-light, #E4EEEF)',
                border: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'var(--primary, #2E666E)',
                transition: 'all 0.2s ease',
                flexShrink: 0,
                outline: 'none'
              }}
              className="hover:scale-105"
            >
              <Gift size={18} color="var(--primary)" />
            </button>
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
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--primary-light)', color: 'var(--primary-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '16px', overflow: 'hidden', position: 'relative' }}>
                    {headerAvatar ? (
                      <img
                        src={headerAvatar}
                        alt={displayName}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', top: 0, left: 0, zIndex: 1 }}
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : null}
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
          <div className="container flex items-center justify-between no-scrollbar" style={{ height: '48px', overflowX: 'auto', gap: '8px' }}>
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

      {/* ── Professional Website Referral Modal ── */}
      {isReferralModalOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(18, 51, 58, 0.45)',
            backdropFilter: 'blur(6px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            animation: 'fadeIn 0.2s ease'
          }}
          onClick={() => setIsReferralModalOpen(false)}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '440px',
              background: '#FFFFFF',
              borderRadius: '20px',
              padding: '24px 24px 20px 24px',
              color: 'var(--text-main, #263538)',
              position: 'relative',
              boxShadow: '0 20px 50px rgba(18, 51, 58, 0.2), 0 0 0 1px rgba(0,0,0,0.05)',
              display: 'flex',
              flexDirection: 'column',
              gap: '18px'
            }}
          >
            {/* Header Title Bar */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', borderBottom: '1px solid var(--border, #DCE6E7)', paddingBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '12px',
                  background: 'var(--primary-light, #E4EEEF)',
                  color: 'var(--primary, #0F4D58)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Gift size={20} color="var(--primary)" />
                </div>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-main, #263538)', margin: 0 }}>
                    Refer & Earn Cashback
                  </h3>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted, #5E7377)', margin: '2px 0 0 0' }}>
                    Share your referral link with friends and family.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsReferralModalOpen(false)}
                aria-label="Close modal"
                style={{
                  background: 'var(--bg-app, #F4F8F8)',
                  border: '1px solid var(--border, #DCE6E7)',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-muted, #5E7377)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  flexShrink: 0
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Quick Share Action Buttons */}
            <div>
              <span style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted, #5E7377)', letterSpacing: '0.8px', display: 'block', marginBottom: '10px' }}>
                Quick Share Options
              </span>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                <button
                  onClick={() => handleShare('sms')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    background: 'var(--bg-app, #F4F8F8)',
                    border: '1px solid var(--border, #DCE6E7)',
                    fontSize: '13px',
                    fontWeight: '600',
                    color: 'var(--text-main, #263538)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  className="hover:border-primary"
                >
                  <Smartphone size={16} color="var(--primary)" />
                  <span>SMS</span>
                </button>

                <button
                  onClick={() => setIsCustomShareOpen(true)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    background: 'var(--bg-app, #F4F8F8)',
                    border: '1px solid var(--border, #DCE6E7)',
                    fontSize: '13px',
                    fontWeight: '600',
                    color: 'var(--text-main, #263538)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  className="hover:border-primary"
                >
                  <Send size={15} color="var(--accent)" />
                  <span>Message</span>
                </button>

                <button
                  onClick={() => handleShare('email')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    background: 'var(--bg-app, #F4F8F8)',
                    border: '1px solid var(--border, #DCE6E7)',
                    fontSize: '13px',
                    fontWeight: '600',
                    color: 'var(--text-main, #263538)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  className="hover:border-primary"
                >
                  <Mail size={16} color="var(--primary)" />
                  <span>Email</span>
                </button>
              </div>
            </div>

            {/* Referral Link Container */}
            <div style={{
              background: 'var(--bg-app, #F4F8F8)',
              borderRadius: '14px',
              padding: '14px 16px',
              border: '1px solid var(--border, #DCE6E7)'
            }}>
              <span style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted, #5E7377)', letterSpacing: '0.8px', display: 'block', marginBottom: '8px' }}>
                App Download & Referral Link
              </span>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="text"
                  readOnly
                  value={appDownloadUrl}
                  style={{
                    flex: 1,
                    background: '#FFFFFF',
                    border: '1px solid var(--border, #DCE6E7)',
                    borderRadius: '8px',
                    padding: '9px 12px',
                    color: 'var(--text-main, #263538)',
                    fontSize: '12px',
                    outline: 'none',
                    fontFamily: 'monospace'
                  }}
                />

                <button
                  onClick={handleCopyLink}
                  style={{
                    background: copied ? '#16A34A' : 'var(--accent, #FB913F)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '9px 14px',
                    fontSize: '12px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    transition: 'all 0.2s ease',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  <span>{copied ? 'Copied!' : 'Copy Link'}</span>
                </button>
              </div>
            </div>

            {/* Main Share Button */}
            <button
              onClick={() => setIsCustomShareOpen(true)}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #0F4D58 0%, #0A343C 100%)',
                color: 'white',
                border: 'none',
                padding: '12px',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 12px rgba(15, 77, 88, 0.2)'
              }}
            >
              <Share2 size={16} />
              <span>Share via Social Apps</span>
            </button>

          </div>
        </div>
      )}

      {/* ── Custom Window Share Sheet Modal ── */}
      {isCustomShareOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.45)',
            backdropFilter: 'blur(5px)',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            animation: 'fadeIn 0.2s ease'
          }}
          onClick={() => setIsCustomShareOpen(false)}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '380px',
              background: '#202020',
              color: '#FFFFFF',
              borderRadius: '8px',
              padding: '16px 20px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              border: '1px solid #333333',
              fontFamily: 'Segoe UI, -apple-system, sans-serif'
            }}
          >
            {/* Title Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Share2 size={14} color="#CCCCCC" />
                <span style={{ fontSize: '13px', fontWeight: '500', color: '#CCCCCC' }}>Share</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: '#333333',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}>
                  <User size={13} color="#CCCCCC" />
                </div>
                <button
                  onClick={() => setIsCustomShareOpen(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#CCCCCC',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '4px'
                  }}
                >
                  <X size={15} />
                </button>
              </div>
            </div>

            {/* App Preview Card */}
            <div style={{
              background: '#2D2D2D',
              border: '1px solid #3A3A3A',
              borderRadius: '6px',
              padding: '10px 12px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '6px',
                background: 'linear-gradient(135deg, #0F4D58 0%, #0A343C 100%)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Gift size={16} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', flex: 1 }}>
                <span style={{ fontSize: '12px', fontWeight: '600', color: '#FFFFFF' }}>Arvaya Health App</span>
                <span style={{ fontSize: '10px', color: '#AAAAAA', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {appDownloadUrl}
                </span>
              </div>
            </div>

            {/* Share Using Title */}
            <div>
              <span style={{ fontSize: '12px', fontWeight: '600', color: '#CCCCCC', display: 'block', marginBottom: '12px' }}>
                Share using
              </span>

              {/* Apps List Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '16px 6px',
                maxHeight: '260px',
                overflowY: 'auto',
                paddingRight: '4px'
              }}>
                {customShareOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => {
                      if (option.id === 'copy') {
                        handleCopyLink();
                      } else {
                        handleShare(option.id);
                      }
                      setIsCustomShareOpen(false);
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '8px',
                      cursor: 'pointer',
                      outline: 'none',
                      padding: '6px 2px',
                      borderRadius: '6px',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#2A2A2A';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'none';
                    }}
                  >
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: option.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
                    }}>
                      {option.icon}
                    </div>
                    <span style={{
                      fontSize: '10px',
                      color: '#E0E0E0',
                      textAlign: 'center',
                      maxWidth: '64px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {option.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}



      {/* Embedded Responsive CSS Rules for Header */}
      <style>{`
        @media (max-width: 768px) {
        
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

