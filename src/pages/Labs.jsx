import { 
  Search, ChevronRight, ChevronLeft, Activity, FlaskConical, Clock, Heart, ShieldCheck, 
  Sparkles, Droplets, Bone, Brain, Baby, Eye, Ribbon, Flame, Wind, Pill, Syringe, 
  Scissors, Apple, Zap, Users, Dumbbell, Beaker, Microscope, TestTube, Stethoscope, 
  CalendarDays, MapPin, ArrowRight, CheckCircle2, Filter, X
} from "lucide-react";
import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getLabPackages, getDiagnosticTests, getDiagnosticPackages, getAppointments } from "../services/dataService";
import { useBooking } from "../context/BookingContext";
import { useAuth } from "../context/AuthContext";
import { packages as defaultPackages } from "../mocks/data";
import SelectSlotUI from "../components/doctors/SelectSlotUI";
import Modal from "../components/common/Modal";

/* ─── Mock Individual Lab Tests Data ─── */
const mockLabTests = [
  {
    id: "lt-1",
    title: "BILIRUBIN DIRECT",
    category: "Fluid Bilirubin",
    department: "Liver Care",
    price: 150,
    oldPrice: 250,
    discount: "40% OFF",
    fasting: "No Fasting Required",
    reportTime: "24 Hours",
    img: "/lab_test_sample.png",
    popular: true
  },
  {
    id: "lt-2",
    title: "BILIRUBIN INDIRECT",
    category: "Fluid Bilirubin",
    department: "Liver Care",
    price: 150,
    oldPrice: 250,
    discount: "40% OFF",
    fasting: "No Fasting Required",
    reportTime: "24 Hours",
    img: "/lab_test_sample.png",
    popular: false
  },
  {
    id: "lt-3",
    title: "BLOOD SUGAR FASTING",
    category: "Renal & Metabolic Function",
    department: "Diabetes",
    price: 100,
    oldPrice: 180,
    discount: "44% OFF",
    fasting: "8-10 Hrs Fasting",
    reportTime: "12 Hours",
    img: "/lab_test_sample.png",
    popular: true
  },
  {
    id: "lt-4",
    title: "COMPLETE BLOOD COUNT (CBC)",
    category: "Hematology Profile",
    department: "Blood",
    price: 299,
    oldPrice: 500,
    discount: "40% OFF",
    fasting: "No Fasting Required",
    reportTime: "24 Hours",
    img: "/lab_test_sample.png",
    popular: true
  },
  {
    id: "lt-5",
    title: "THYROID STIMULATING HORMONE (TSH)",
    category: "Endocrine Profile",
    department: "Thyroid",
    price: 220,
    oldPrice: 400,
    discount: "45% OFF",
    fasting: "No Fasting Required",
    reportTime: "24 Hours",
    img: "/lab_test_sample.png",
    popular: true
  },
  {
    id: "lt-6",
    title: "LIPID PROFILE TOTAL",
    category: "Cardiac Risk Panel",
    department: "Heart",
    price: 499,
    oldPrice: 900,
    discount: "44% OFF",
    fasting: "10-12 Hrs Fasting",
    reportTime: "24 Hours",
    img: "/lab_test_sample.png",
    popular: false
  },
  {
    id: "lt-7",
    title: "HbA1c GLYCATED HEMOGLOBIN",
    category: "3-Month Diabetes Monitor",
    department: "Diabetes",
    price: 350,
    oldPrice: 600,
    discount: "41% OFF",
    fasting: "No Fasting Required",
    reportTime: "24 Hours",
    img: "/lab_test_sample.png",
    popular: true
  },
  {
    id: "lt-8",
    title: "VITAMIN D3 (25-OH)",
    category: "Bone & Immune Health",
    department: "Vitamins",
    price: 599,
    oldPrice: 1200,
    discount: "50% OFF",
    fasting: "No Fasting Required",
    reportTime: "24 Hours",
    img: "/lab_test_sample.png",
    popular: false
  }
];

/* ─── Mock Health Packages ─── */
const mockHealthPackages = [
  {
    id: "pkg-1",
    title: "Ortho Robotics Package",
    category: "Bone & Joint Advanced",
    tests: "45+ Tests Included",
    price: 197380,
    oldPrice: 225000,
    discount: "12% OFF",
    fasting: "Fasting Required",
    reportTime: "24 Hours",
    img: "/checkup_fullbody.png",
    badge: "Specialized"
  },
  {
    id: "pkg-2",
    title: "Paediatric Surgery 3A.S14.17143",
    category: "Child Health & Pre-Surgery",
    tests: "30+ Tests Included",
    price: 40000,
    oldPrice: 50000,
    discount: "20% OFF",
    fasting: "Fasting Required",
    reportTime: "24 Hours",
    img: "/checkup_thyroid.png",
    badge: "Clinical"
  },
  {
    id: "pkg-3",
    title: "Comprehensive Full Body Checkup",
    category: "Complete Preventive Care",
    tests: "80+ Tests Included",
    price: 1499,
    oldPrice: 2300,
    discount: "35% OFF",
    fasting: "10-12 Hrs Fasting",
    reportTime: "24 Hours",
    img: "/checkup_fullbody.png",
    badge: "Most Booked"
  },
  {
    id: "pkg-4",
    title: "Senior Citizen Diabetes & Cardiac Care",
    category: "Geriatric Special",
    tests: "55+ Tests Included",
    price: 799,
    oldPrice: 1200,
    discount: "33% OFF",
    fasting: "10-12 Hrs Fasting",
    reportTime: "24 Hours",
    img: "/checkup_diabetes.png",
    badge: "Popular for Seniors"
  },
  {
    id: "pkg-5",
    title: "Advanced Cardiac Health Profile",
    category: "Heart & Vascular Risk",
    tests: "40+ Tests Included",
    price: 1199,
    oldPrice: 1800,
    discount: "33% OFF",
    fasting: "Fasting Required",
    reportTime: "24 Hours",
    img: "/checkup_heart.png",
    badge: "Doctor Verified"
  }
];

const categoriesFilterList = [
  { name: "All", icon: <FlaskConical size={16} /> },
  { name: "Diabetes", icon: <Droplets size={16} /> },
  { name: "Liver Care", icon: <Beaker size={16} /> },
  { name: "Heart", icon: <Heart size={16} /> },
  { name: "Thyroid", icon: <Activity size={16} /> },
  { name: "Blood", icon: <Droplets size={16} /> },
  { name: "Vitamins", icon: <Apple size={16} /> },
  { name: "Full Body", icon: <Stethoscope size={16} /> }
];

const mockLabAppointments = [
  { id: 1, date: "June 27, 2026", status: "Upcoming", name: "Complete Blood Count", lab: "LifeCare Diagnostics", time: "10:30 AM" },
  { id: 2, date: "July 5, 2026", status: "Upcoming", name: "Thyroid Profile", lab: "MediTest Labs", time: "2:15 PM" },
  { id: 3, date: "July 12, 2026", status: "Scheduled", name: "Lipid Profile", lab: "PathCare Labs", time: "9:00 AM" },
  { id: 4, date: "July 20, 2026", status: "Upcoming", name: "Vitamin D & B12 Panel", lab: "HealthFirst Labs", time: "11:00 AM" },
];

export default function Labs({ forceModalOpen = false }) {
  const go = useNavigate();
  const { setBookingType, setLabPackage, setDate, setSlot, setBookingId } = useBooking();
  const { user, openLoginModal } = useAuth();

  const [q, setQ] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [selectedItem, setSelectedItem] = useState(null);
  const [visitType, setVisitType] = useState("home");
  const [showAllTests, setShowAllTests] = useState(false);
  const [showAllPackages, setShowAllPackages] = useState(false);

  // Dynamic state populated by APIs
  const [labTests, setLabTests] = useState(mockLabTests.slice(0, 8));
  const [healthPackages, setHealthPackages] = useState(mockHealthPackages.slice(0, 5));
  const [appointments, setAppointments] = useState([]);

  // Scroll refs for carousels
  const testsScrollRef = useRef(null);
  const packagesScrollRef = useRef(null);
  const apptsScrollRef = useRef(null);

function toTitleCase(str) {
  if (!str) return "";
  return String(str)
    .toLowerCase()
    .split(" ")
    .map(word => {
      if (word === "-" || word === "&" || word === "/") return word;
      if (word.startsWith("(") && word.endsWith(")")) {
        return "(" + word.slice(1, -1).toUpperCase() + ")";
      }
      if (["rft", "lft", "cbc", "tsh", "hba1c"].includes(word)) {
        return word.toUpperCase();
      }
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
}

  // Fetch API data on mount / clicking Lab Tests
  useEffect(() => {
    let isMounted = true;

    // Trigger API 1: /api/diagnostic/getTests
    getDiagnosticTests({ pageSize: 12 })
      .then((apiTests) => {
        if (!isMounted) return;
        if (Array.isArray(apiTests) && apiTests.length > 0) {
          const normalized = apiTests.map((t, idx) => {
            const rawTitle = t.service_name || t.name || t.title || t.test_name || `Lab Test ${idx+1}`;
            const rawCategory = t.profile_name || t.category || t.test_category_name || t.department || "Fluid & Clinical Test";
            const priceVal = parseFloat(t.price || t.cost || t.amount || 150);
            const oldPriceVal = Math.round(priceVal * 1.4);

            return {
              id: t.id || t.service_key || `api-test-${idx}`,
              title: toTitleCase(rawTitle),
              category: rawCategory,
              department: rawCategory,
              price: priceVal,
              oldPrice: oldPriceVal,
              discount: `${Math.round(((oldPriceVal - priceVal) / oldPriceVal) * 100)}% OFF`,
              fasting: t.fasting || (t.fasting_required ? "Fasting Required" : "No Fasting Required"),
              reportTime: t.reportTime || t.report_time || "24 Hours",
              img: t.img || t.image || "/lab_test_sample.png",
              popular: idx % 2 === 0
            };
          });
          // Display exact 1st 8 Lab Tests from /api/diagnostic/getTests
          setLabTests(normalized.slice(0, 8));
        }
      })
      .catch((err) => {
        console.error("Failed to fetch /api/diagnostic/getTests:", err);
      });

    // Trigger API 2: /api/diagnostic/getPackages
    getDiagnosticPackages({ pageSize: 10 })
      .then((apiPkgs) => {
        if (!isMounted) return;
        if (Array.isArray(apiPkgs) && apiPkgs.length > 0) {
          const normalized = apiPkgs.map((p, idx) => {
            const rawTitle = p.package_name || p.name || p.title || `Health Package ${idx+1}`;
            const priceVal = parseFloat(p.package_price || p.price || p.cost || p.amount || 999);
            const oldPriceVal = Math.round(priceVal * 1.25);
            const itemCount = Array.isArray(p.subitems) && p.subitems.length > 0 
              ? `${p.subitems.length}+ Tests Included` 
              : "30+ Tests Included";

            return {
              id: p.rateplan_package_id || p.id || p.package_key || `api-pkg-${idx}`,
              title: rawTitle,
              category: p.category || p.package_category || "Comprehensive Health Care",
              tests: itemCount,
              subitems: Array.isArray(p.subitems) ? p.subitems : [],
              price: priceVal,
              oldPrice: oldPriceVal,
              discount: `${Math.round(((oldPriceVal - priceVal) / oldPriceVal) * 100)}% OFF`,
              fasting: p.fasting || (p.fasting_required ? "Fasting Required" : "10-12 Hrs Fasting"),
              reportTime: p.reportTime || p.report_time || "24 Hours",
              img: p.img || p.image || (idx % 2 === 0 ? "/checkup_fullbody.png" : "/checkup_heart.png"),
              badge: p.badge || (idx === 0 ? "Most Booked" : idx === 1 ? "Popular" : "Doctor Verified")
            };
          });
          // Display 5 Packages
          setHealthPackages(normalized.slice(0, 5));
        }
      })
      .catch((err) => {
        console.error("Failed to fetch /api/diagnostic/getPackages:", err);
      });

    // Trigger API 3: /api/appointments/getPatientAppointments
    getAppointments()
      .then((apiAppts) => {
        if (!isMounted) return;
        if (Array.isArray(apiAppts) && apiAppts.length > 0) {
          const normalized = apiAppts.map((apt, idx) => {
            let dateStr = apt.date;
            if (dateStr && typeof dateStr === 'string' && dateStr.includes('-')) {
              try {
                dateStr = new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
              } catch (e) {}
            }
            const rawStatus = (apt.status || "Upcoming");
            const formattedStatus = rawStatus.charAt(0).toUpperCase() + rawStatus.slice(1).toLowerCase();

            return {
              id: apt.id || `apt-${idx}`,
              date: dateStr || "July 15, 2026",
              status: formattedStatus,
              name: apt.doctor || apt.specialty || apt.name || apt.raw?.test_name || `Lab Appointment ${idx + 1}`,
              lab: apt.hospital || apt.clinic || apt.lab || "Arvaya Health Lab",
              time: apt.time || "10:00 AM"
            };
          });

          setAppointments(normalized.slice(0, 4));
        } else {
          setAppointments([]);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch /api/appointments/getPatientAppointments:", err);
        setAppointments([]);
      });

    return () => { isMounted = false; };
  }, []);

  const scrollContainer = (ref, direction) => {
    if (ref.current) {
      const scrollAmount = direction === "left" ? -320 : 320;
      ref.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  // Filtered Lab Tests
  const filteredTests = useMemo(() => {
    return (labTests || []).filter(item => {
      const matchQ = (item.title || "").toLowerCase().includes(q.toLowerCase()) || 
                     (item.category || "").toLowerCase().includes(q.toLowerCase()) ||
                     (item.department || "").toLowerCase().includes(q.toLowerCase());
      if (!matchQ) return false;
      if (selectedFilter !== "All") {
        return (item.department || "").toLowerCase().includes(selectedFilter.toLowerCase()) ||
               (item.category || "").toLowerCase().includes(selectedFilter.toLowerCase());
      }
      return true;
    });
  }, [labTests, q, selectedFilter]);

  // Filtered Packages
  const filteredPackages = useMemo(() => {
    return (healthPackages || []).filter(item => {
      const matchQ = (item.title || "").toLowerCase().includes(q.toLowerCase()) || 
                     (item.category || "").toLowerCase().includes(q.toLowerCase());
      if (!matchQ) return false;
      if (selectedFilter !== "All") {
        return (item.title || "").toLowerCase().includes(selectedFilter.toLowerCase()) ||
               (item.category || "").toLowerCase().includes(selectedFilter.toLowerCase());
      }
      return true;
    });
  }, [healthPackages, q, selectedFilter]);

  const confirmBooking = (slotData) => {
    setBookingType("lab");
    setLabPackage(selectedItem);
    setDate(new Date(slotData.date));
    setSlot(slotData.time);
    if (!user) return openLoginModal("/confirmed");
    setBookingId("LAB" + Math.floor(Math.random() * 100000000));
    go("/confirmed");
  };

  return (
    <main className="page page-enter" style={{ padding: 0, background: 'var(--bg-app)', color: 'var(--text-main)' }}>
      
      {/* Embedded Modern Styling for Lab UI */}
      <style>{`
        .lab-hero-banner {
          background: linear-gradient(135deg, #e8f5e9 0%, #e0f2f1 60%, #e4eeef 100%);
          border-radius: 24px;
          margin-top: 13px;
          padding: 24px 28px;
          position: relative;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(46, 102, 110, 0.06);
          border: 1px solid rgba(46, 102, 110, 0.12);
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;
        }

        .lab-hero-title {
          font-family: 'Plus Jakarta Sans', var(--font-sans);
          font-weight: 800;
          font-size: 22px;
          line-height: 1.3;
          color: #12333A;
          margin-bottom: 12px;
          max-width: 480px;
        }

        .lab-hero-badges {
          display: flex;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
        }

        .lab-hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          font-weight: 600;
          color: #1b4d3e;
          background: rgba(255, 255, 255, 0.75);
          backdrop-filter: blur(4px);
          padding: 6px 12px;
          border-radius: 20px;
          border: 1px solid rgba(27, 77, 62, 0.15);
        }

        .lab-section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .lab-section-title {
          font-family: 'Plus Jakarta Sans', var(--font-sans);
          font-size: 20px;
          font-weight: 800;
          color: var(--text-main);
          margin: 0;
        }

        .lab-view-all-btn {
          font-size: 14px;
          font-weight: 700;
          color: var(--primary);
          background: none;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 4px;
          transition: color 0.2s, transform 0.2s;
        }

        .lab-view-all-btn:hover {
          color: var(--primary-dark);
          transform: translateX(2px);
        }

        /* Scroll Rows with Navigation Arrows */
        .lab-scroll-wrapper {
          position: relative;
        }

        .lab-scroll-row {
          display: flex;
          gap: 16px;
          overflow-x: auto;
          scroll-behavior: smooth;
          padding: 8px 4px 16px 4px;
          scrollbar-width: none;
          -webkit-overflow-scrolling: touch;
          scroll-snap-type: x mandatory;
        }

        .lab-scroll-row::-webkit-scrollbar {
          display: none;
        }

        .lab-scroll-row > * {
          scroll-snap-align: start;
          flex-shrink: 0;
        }

        .lab-scroll-arrow {
          position: absolute;
          top: 45%;
          transform: translateY(-50%);
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: #ffffff;
          border: 1px solid var(--border);
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.12);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-main);
          cursor: pointer;
          z-index: 10;
          transition: all 0.2s;
        }

        .lab-scroll-arrow:hover {
          background: var(--primary);
          color: #ffffff;
          border-color: var(--primary);
          transform: translateY(-50%) scale(1.08);
        }

        .lab-scroll-arrow.left { left: -16px; }
        .lab-scroll-arrow.right { right: -16px; }

        /* Card Styles: Lab Test (Vertical Compact Card matching screenshot) */
        /* Card Styles: Lab Test (Spacious & Professional Card) */
        .lab-card {
          width: 250px;
          background: #ffffff;
          border-radius: 20px;
          border: 1px solid var(--border);
          overflow: hidden;
          display: flex;
          flex-direction: column;
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 4px 16px rgba(18, 51, 58, 0.05);
          position: relative;
        }

        .lab-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 14px 32px rgba(18, 51, 58, 0.12);
          border-color: var(--primary-soft);
        }

        .lab-card-img-container {
          height: 120px;
          width: 100%;
          background: #f0f7f7;
          overflow: hidden;
          position: relative;
        }

        .lab-card-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.35s;
        }

        .lab-card:hover .lab-card-img {
          transform: scale(1.06);
        }

        .lab-card-tag {
          position: absolute;
          top: 10px;
          left: 10px;
          background: rgba(255, 255, 255, 0.92);
          backdrop-filter: blur(4px);
          color: var(--primary-dark);
          font-size: 10.5px;
          font-weight: 700;
          padding: 3px 9px;
          border-radius: 12px;
          border: 1px solid rgba(46, 102, 110, 0.2);
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }

        .lab-card-body {
          padding: 16px;
          display: flex;
          flex-direction: column;
          flex: 1;
        }

        .lab-card-title {
          font-family: 'Plus Jakarta Sans', var(--font-sans);
          font-weight: 700;
          font-size: 14.5px;
          line-height: 1.35;
          color: #12333A;
          margin-bottom: 6px;
          min-height: 25px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .lab-card-sub {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 11px;
          font-weight: 600;
          color: var(--primary);
          background: #f0f7f7;
          padding: 4px 10px;
          border-radius: 10px;
          width: fit-content;
          margin-bottom: 16px;
          white-space: nowrap;
          max-width: 100%;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .lab-card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: auto;
          padding-top: 12px;
          border-top: 1px dashed var(--border);
        }

        .lab-card-price-col {
          display: flex;
          flex-direction: column;
        }

        .lab-card-price-label {
          font-size: 10px;
          font-weight: 600;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .lab-card-price {
          font-weight: 800;
          font-size: 18px;
          color: #12333A;
          line-height: 1.1;
        }

        .lab-card-btn {
          background: #1b4d54;
          color: #ffffff;
          border: none;
          padding: 8px 14px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 5px;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 2px 6px rgba(27, 77, 84, 0.2);
        }

        .lab-card-btn:hover {
          background: var(--primary);
          box-shadow: 0 4px 12px rgba(46, 102, 110, 0.35);
          transform: translateY(-1px);
        }

        .lab-card-btn:active {
          transform: scale(0.97);
        }

        /* Card Styles: Package Card (Wider) */
        .pkg-card {
          width: 280px;
          background: #ffffff;
          border-radius: 18px;
          border: 1px solid var(--border);
          overflow: hidden;
          display: flex;
          flex-direction: column;
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 2px 8px rgba(18, 51, 58, 0.04);
          position: relative;
        }

        .pkg-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 28px rgba(18, 51, 58, 0.1);
          border-color: var(--primary-soft);
        }

        .pkg-card-img-container {
          height: 135px;
          width: 100%;
          background: #f0f7f7;
          overflow: hidden;
          position: relative;
        }

        .pkg-card-badge {
          position: absolute;
          top: 10px;
          left: 10px;
          background: var(--primary);
          color: #ffffff;
          font-size: 10px;
          font-weight: 700;
          padding: 4px 10px;
          border-radius: 12px;
          box-shadow: 0 2px 6px rgba(0,0,0,0.15);
        }

        .pkg-card-body {
          padding: 16px;
          display: flex;
          flex-direction: column;
          flex: 1;
        }

        .pkg-card-title {
          font-weight: 800;
          font-size: 15px;
          line-height: 1.3;
          color: var(--text-main);
          margin-bottom: 6px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          min-height: 40px;
        }

        .pkg-card-tests-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 11px;
          font-weight: 600;
          color: #16a34a;
          background: #dcfce7;
          padding: 3px 8px;
          border-radius: 6px;
          width: fit-content;
          margin-bottom: 12px;
        }

        .pkg-card-btn {
          width: 100%;
          background: #1b4d54;
          color: #ffffff;
          border: none;
          padding: 10px 14px;
          border-radius: 20px;
          font-size: 12.5px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          cursor: pointer;
          transition: background 0.2s, transform 0.15s;
        }

        .pkg-card-btn:hover {
          background: var(--primary);
        }

        /* Filter Chips */
        .lab-chip {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          border-radius: 24px;
          background: #ffffff;
          border: 1px solid var(--border);
          font-size: 13px;
          font-weight: 600;
          color: var(--text-main);
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.2s;
        }

        .lab-chip:hover {
          border-color: var(--primary);
          color: var(--primary);
        }

        .lab-chip.active {
          background: var(--primary);
          color: #ffffff;
          border-color: var(--primary);
          box-shadow: 0 4px 12px rgba(46, 102, 110, 0.25);
        }

        /* Responsive Grid Adjustments */
        .lab-grid-view {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 16px;
        }

        .pkg-grid-view {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
          gap: 20px;
        }

        @media (max-width: 640px) {
          .lab-hero-banner {
            flex-direction: column;
            text-align: left;
            padding: 20px;
          }
          .lab-hero-img-col {
            display: none;
          }
          .lab-scroll-arrow {
            display: none;
          }
          .lab-card {
            width: 175px;
          }
          .pkg-card {
            width: 240px;
          }
        }
      `}</style>

      {/* ── Top Header Bar / Breadcrumb ── */}
      <div style={{ background: '#ffffff', borderBottom: '1px solid var(--border)', padding: '16px 0' }}>
        <div className="container">
          <div className="flex items-center gap-2 text-muted mb-3" style={{ fontSize: '12px', fontWeight: '500' }}>
            <Link to="/" style={{ transition: 'color 0.2s' }} onMouseOver={e => e.currentTarget.style.color='var(--primary)'} onMouseOut={e => e.currentTarget.style.color=''}>Home</Link> 
            <ChevronRight size={12} /> 
            <span style={{ color: 'var(--text-main)', fontWeight: '600' }}>Lab Tests & Packages</span>
          </div>
          
          {/* Top Hero Banner matching attached UI */}
          <div className="lab-hero-banner">
            <div>
              <h1 className="lab-hero-title">
                Book trusted lab tests and health packages with ease.
              </h1>
              <div className="lab-hero-badges">
                <span className="lab-hero-badge">
                  <CheckCircle2 size={15} color="#16a34a" /> Certified Labs
                </span>
                <span className="lab-hero-badge">
                  <CheckCircle2 size={15} color="#16a34a" /> On-time Reports
                </span>
                <span className="lab-hero-badge">
                  <CheckCircle2 size={15} color="#16a34a" /> Free Home Sample Collection
                </span>
              </div>
            </div>
            <div className="lab-hero-img-col" style={{ flexShrink: 0, paddingLeft: '16px' }}>
              <img 
                src="/reward_lab.png" 
                alt="Lab Diagnostics Illustration" 
                style={{ width: '150px', height: 'auto', objectFit: 'contain', filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.08))' }} 
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="container" style={{ padding: '32px 16px 64px 16px' }}>

        {/* ── SECTION 1: LAB TESTS ── */}
        <section style={{ marginBottom: '48px' }}>
          <div className="lab-section-header">
            <h2 className="lab-section-title">Lab Tests</h2>
            <button 
              className="lab-view-all-btn"
              onClick={() => go("/labs/all-tests")}
            >
              View All <ArrowRight size={16} />
            </button>
          </div>

          {filteredTests.length === 0 ? (
            <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
              <FlaskConical size={36} style={{ opacity: 0.3, marginBottom: '8px' }} />
              <p>No lab tests found matching "{q}".</p>
            </div>
          ) : showAllTests ? (
            <div className="lab-grid-view">
              {filteredTests.map((test) => (
                <div className="lab-card" key={test.id} style={{ width: '100%' }}>
                  <div className="lab-card-img-container">
                    <img src={test.img} alt={test.title} className="lab-card-img" />
                    <span className="lab-card-tag"><TestTube size={10} /> Certified</span>
                  </div>
                  <div className="lab-card-body">
                    <div className="lab-card-title">{toTitleCase(test.title)}</div>
                    <div className="lab-card-sub">{toTitleCase(test.category)}</div>
                    <div className="lab-card-footer">
                      <div className="lab-card-price-col">
                        <span className="lab-card-price-label">Price</span>
                        <span className="lab-card-price">₹{test.price}</span>
                      </div>
                      <button className="lab-card-btn" onClick={() => setSelectedItem(test)}>
                        Book Now <ArrowRight size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="lab-scroll-wrapper">
              <button className="lab-scroll-arrow left" onClick={() => scrollContainer(testsScrollRef, "left")}>
                <ChevronLeft size={20} />
              </button>
              
              <div className="lab-scroll-row" ref={testsScrollRef}>
                {filteredTests.map((test) => (
                  <div className="lab-card" key={test.id}>
                    <div className="lab-card-img-container">
                      <img src={test.img} alt={test.title} className="lab-card-img" />
                      <span className="lab-card-tag"><TestTube size={10} /> Certified</span>
                    </div>
                    <div className="lab-card-body">
                      <div className="lab-card-title">{toTitleCase(test.title)}</div>
                      <div className="lab-card-sub">{toTitleCase(test.category)}</div>
                      <div className="lab-card-footer">
                        <div className="lab-card-price-col">
                          <span className="lab-card-price-label">Price</span>
                          <span className="lab-card-price">₹{test.price}</span>
                        </div>
                        <button className="lab-card-btn" onClick={() => setSelectedItem(test)}>
                          Book Now <ArrowRight size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button className="lab-scroll-arrow right" onClick={() => scrollContainer(testsScrollRef, "right")}>
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </section>

        {/* ── SECTION 2: HEALTH PACKAGES ── */}
        <section style={{ marginBottom: '48px' }}>
          <div className="lab-section-header">
            <h2 className="lab-section-title">Health Packages</h2>
            <button 
              className="lab-view-all-btn"
              onClick={() => go("/labs/all-packages")}
            >
              View All <ArrowRight size={16} />
            </button>
          </div>

          {filteredPackages.length === 0 ? (
            <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
              <Stethoscope size={36} style={{ opacity: 0.3, marginBottom: '8px' }} />
              <p>No health packages found matching "{q}".</p>
            </div>
          ) : showAllPackages ? (
            <div className="pkg-grid-view">
              {filteredPackages.map((pkg) => (
                <div className="pkg-card" key={pkg.id} style={{ width: '100%' }}>
                  <div className="pkg-card-img-container">
                    <img src={pkg.img} alt={pkg.title} className="lab-card-img" />
                    {pkg.badge && <div className="pkg-card-badge">{pkg.badge}</div>}
                  </div>
                  <div className="pkg-card-body">
                    <div className="pkg-card-title">{pkg.title}</div>
                    <div className="pkg-card-tests-badge">
                      <ShieldCheck size={12} /> {pkg.tests}
                    </div>
                    <div className="lab-card-price-row">
                      <span className="lab-card-price">₹{pkg.price.toLocaleString()}</span>
                    </div>
                    <button className="pkg-card-btn" onClick={() => go(`/labs/package-details/${encodeURIComponent(pkg.id)}`, { state: { package: pkg } })}>
                      View Details <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="lab-scroll-wrapper">
              <button className="lab-scroll-arrow left" onClick={() => scrollContainer(packagesScrollRef, "left")}>
                <ChevronLeft size={20} />
              </button>

              <div className="lab-scroll-row" ref={packagesScrollRef}>
                {filteredPackages.map((pkg) => (
                  <div className="pkg-card" key={pkg.id}>
                    <div className="pkg-card-img-container">
                      <img src={pkg.img} alt={pkg.title} className="lab-card-img" />
                      {pkg.badge && <div className="pkg-card-badge">{pkg.badge}</div>}
                    </div>
                    <div className="pkg-card-body">
                      <div className="pkg-card-title">{pkg.title}</div>
                      <div className="pkg-card-tests-badge">
                        <ShieldCheck size={12} /> {pkg.tests}
                      </div>
                      <div className="lab-card-price-row">
                        <span className="lab-card-price">₹{pkg.price.toLocaleString()}</span>
                      </div>
                      <button className="pkg-card-btn" onClick={() => go(`/labs/package-details/${encodeURIComponent(pkg.id)}`, { state: { package: pkg } })}>
                        View Details <ArrowRight size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <button className="lab-scroll-arrow right" onClick={() => scrollContainer(packagesScrollRef, "right")}>
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </section>

        {/* ── SECTION 3: YOUR APPOINTMENTS ── */}
        <section style={{ marginBottom: '48px' }}>
          <div className="lab-section-header">
            <h2 className="lab-section-title">Your Appointments</h2>
            <button className="lab-view-all-btn" onClick={() => go('/my-appointments')}>
              View All <ArrowRight size={16} />
            </button>
          </div>

          {appointments.length > 0 ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '16px'
            }}>
              {appointments.slice(0, 4).map((appt) => (
                <div 
                  key={appt.id} 
                  style={{
                    background: '#ffffff',
                    borderRadius: '16px',
                    border: '1px solid var(--border)',
                    padding: '18px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)' }}>{appt.date}</span>
                    <span style={{
                      padding: '3px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '700',
                      background: (appt.status || '').toLowerCase() === 'upcoming' ? '#dcfce7' : 'var(--primary-light)',
                      color: (appt.status || '').toLowerCase() === 'upcoming' ? '#16a34a' : 'var(--primary-dark)',
                      textTransform: 'capitalize'
                    }}>
                      {appt.status}
                    </span>
                  </div>
                  <h4 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '8px' }}>{appt.name}</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '12.5px', color: 'var(--text-muted)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <MapPin size={14} color="var(--primary)" /> {appt.lab}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Clock size={14} color="var(--primary)" /> {appt.time}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{
              background: '#ffffff',
              borderRadius: '16px',
              border: '1px solid var(--border)',
              padding: '24px',
              textAlign: 'center',
              color: 'var(--text-muted)',
              fontSize: '14px'
            }}>
              No appointments found.
            </div>
          )}
        </section>

        {/* ── SECTION 4: TRUST & QUALITY FEATURES ── */}
        <section style={{ 
          background: '#ffffff', 
          borderRadius: '24px', 
          border: '1px solid var(--border)', 
          padding: '32px 24px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.02)'
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
            {[
              { icon: <ShieldCheck size={26} />, title: "Certified Labs", sub: "100% NABL & ISO accredited partners", color: "#16a34a", bg: "#dcfce7" },
              { icon: <Clock size={26} />, title: "On-time Reports", sub: "Digital reports within 12 to 24 hours", color: "#2E666E", bg: "#E4EEEF" },
              { icon: <Microscope size={26} />, title: "Home Sample Collection", sub: "Safe & hygienic doorstep phlebotomist", color: "#FB913F", bg: "#FEF0E2" },
              { icon: <Stethoscope size={26} />, title: "Doctor Verified", sub: "Reviewed by expert clinical pathologists", color: "#8e44ad", bg: "#f3e8fd" },
            ].map((feature, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ 
                  width: '52px', 
                  height: '52px', 
                  borderRadius: '16px', 
                  background: feature.bg, 
                  color: feature.color, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  flexShrink: 0 
                }}>
                  {feature.icon}
                </div>
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-main)', margin: '0 0 2px 0' }}>{feature.title}</h4>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0, lineHeight: 1.3 }}>{feature.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>

      {/* ── BOOKING / DETAILS MODAL ── */}
      <Modal
        isOpen={!!selectedItem || forceModalOpen}
        onClose={() => setSelectedItem(null)}
        title={selectedItem?.tests ? "Schedule Health Package" : "Schedule Lab Test"}
        maxWidth="680px"
      >
        {selectedItem && (
          <div style={{ marginBottom: "24px", padding: '18px', background: 'var(--bg-app)', borderRadius: '16px', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-main)', margin: 0 }}>{selectedItem.title}</h3>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{selectedItem.category}</span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '20px', fontWeight: '800', color: 'var(--primary)' }}>₹{selectedItem.price.toLocaleString()}</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '16px', marginTop: '16px', paddingTop: '12px', borderTop: '1px dashed var(--border)', flexWrap: 'wrap' }}>
              <div style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-main)' }}>
                <Clock size={14} color="var(--primary)" /> <b>Report Delivery:</b> {selectedItem.reportTime || "24 Hours"}
              </div>
              <div style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-main)' }}>
                <ShieldCheck size={14} color="#16a34a" /> <b>Fasting:</b> {selectedItem.fasting || "No Fasting Required"}
              </div>
            </div>
          </div>
        )}

        <div style={{ marginBottom: "24px" }}>
          <label style={{ display: "block", fontSize: "14px", fontWeight: "700", color: "var(--text-main)", marginBottom: "12px" }}>
            Select Collection Preference
          </label>
          <div className="flex gap-4" style={{ flexWrap: 'wrap' }}>
            <label style={{ 
              background: visitType === 'home' ? 'var(--primary-light)' : '#ffffff', 
              padding: '16px', 
              borderRadius: '16px', 
              border: visitType === 'home' ? '2px solid var(--primary)' : '1px solid var(--border)', 
              flex: 1, 
              minWidth: '200px', 
              cursor: 'pointer', 
              transition: 'all 0.2s' 
            }}>
              <input type="radio" name="labVisitType" value="home" checked={visitType === 'home'} onChange={() => setVisitType('home')} style={{ display: 'none' }} />
              <div>
                <b style={{ display: 'block', color: visitType === 'home' ? 'var(--primary-dark)' : 'var(--text-main)', marginBottom: '4px', fontSize: '14px' }}>
                  🏡 Home Sample Collection
                </b>
                <small className="text-muted" style={{ fontSize: '12px', lineHeight: 1.4, display: 'block' }}>A certified phlebotomist visits your doorstep.</small>
              </div>
            </label>
            <label style={{ 
              background: visitType === 'lab' ? 'var(--primary-light)' : '#ffffff', 
              padding: '16px', 
              borderRadius: '16px', 
              border: visitType === 'lab' ? '2px solid var(--primary)' : '1px solid var(--border)', 
              flex: 1, 
              minWidth: '200px', 
              cursor: 'pointer', 
              transition: 'all 0.2s' 
            }}>
              <input type="radio" name="labVisitType" value="lab" checked={visitType === 'lab'} onChange={() => setVisitType('lab')} style={{ display: 'none' }} />
              <div>
                <b style={{ display: 'block', color: visitType === 'lab' ? 'var(--primary-dark)' : 'var(--text-main)', marginBottom: '4px', fontSize: '14px' }}>
                  🏥 Diagnostic Center Visit
                </b>
                <small className="text-muted" style={{ fontSize: '12px', lineHeight: 1.4, display: 'block' }}>Walk-in to your nearest accredited partner lab.</small>
              </div>
            </label>
          </div>
        </div>

        <SelectSlotUI onConfirm={confirmBooking} type="lab" />
      </Modal>

    </main>
  );
}
