import { 
  Search, ChevronRight, ChevronLeft, Activity, FlaskConical, Clock, Heart, ShieldCheck, 
  Sparkles, Droplets, Bone, Brain, Baby, Eye, Ribbon, Flame, Wind, Pill, Syringe, 
  Scissors, Apple, Zap, Users, Dumbbell, Beaker, Microscope, TestTube, Stethoscope, 
  CalendarDays, MapPin, ArrowRight, CheckCircle2, Filter, X, Wallet
} from "lucide-react";
import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getLabPackages, getDiagnosticTests, getDiagnosticPackages, getAppointments, getLabOrderHistory, createLabOrder, verifyLabPayment, loadRazorpayScript, getWalletAmount } from "../services/dataService";
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
  const { setBookingType, setLabPackage, setDate, setSlot, setBookingId, globalLocation } = useBooking();
  const { user, openLoginModal } = useAuth();

  const [q, setQ] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [selectedItem, setSelectedItem] = useState(null);
  const [visitType, setVisitType] = useState("home");
  const [showAllTests, setShowAllTests] = useState(false);
  const [showAllPackages, setShowAllPackages] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const [applyWallet, setApplyWallet] = useState(false);
  const [walletAppliedAmount, setWalletAppliedAmount] = useState(0);
  const [loadingWallet, setLoadingWallet] = useState(false);

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
              service_key: t.service_key,
              service_name: t.service_name || rawTitle,
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

    // Trigger API 3: /api/lims/laborder/history
    const patientId = user?.id || user?.user_id || user?.patient_id || "";
    getLabOrderHistory(patientId)
      .then((apiOrders) => {
        if (!isMounted) return;
        if (Array.isArray(apiOrders) && apiOrders.length > 0) {
          const normalized = apiOrders.map((order, idx) => {
            const rawDate = order.order_date || order.created_at || order.created_on || order.date || order.orderDate;
            let dateStr = "Recent";
            let timeStr = "";
            if (rawDate) {
              const d = new Date(rawDate);
              if (!isNaN(d.getTime())) {
                dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                timeStr = d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
              } else if (typeof rawDate === 'string') {
                dateStr = rawDate;
              }
            }
            const rawStatus = (order.order_status || order.status || "Processing");
            const formattedStatus = rawStatus.charAt(0).toUpperCase() + rawStatus.slice(1).toLowerCase();

            return {
              id: order.order_id || order.lab_order_id || order.id || `order-${idx}`,
              date: dateStr,
              time: timeStr,
              status: formattedStatus,
              name: order.test_names || order.tests || order.items || order.test_category_name || `Lab Test ${idx + 1}`,
              lab: order.lab_name || order.center_name || order.lab || order.hospital_name || "Arvaya Health Lab"
            };
          });

          setAppointments(normalized.slice(0, 4));
        } else {
          setAppointments([]);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch /api/lims/laborder/history:", err);
        setAppointments([]);
      });

    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    if (!selectedItem || !user) return;
    setLoadingWallet(true);
    setApplyWallet(false);
    setWalletAppliedAmount(0);
    const patientId = user?.id || user?.user_id || user?.patient_id || "";
    getWalletAmount(patientId)
      .then((res) => {
        let wData = Array.isArray(res) ? res[0] : res;
        if (typeof wData === 'number' || typeof wData === 'string') {
          setWalletBalance(parseFloat(wData) || 0);
        } else if (wData && typeof wData === 'object') {
          setWalletBalance(parseFloat(wData.total_amount || wData.balance || wData.amount || wData.wallet_balance || wData.wallet_amount || wData.walletBalance || wData.total || 0));
        }
      })
      .catch((err) => {
        console.error("Failed to fetch wallet balance:", err);
        setWalletBalance(0);
      })
      .finally(() => {
        setLoadingWallet(false);
      });
  }, [selectedItem, user]);

  const maxWalletApplicable = Math.min(walletBalance, selectedItem?.price || 0);

  useEffect(() => {
    if (applyWallet) {
      setWalletAppliedAmount(maxWalletApplicable);
    } else {
      setWalletAppliedAmount(0);
    }
  }, [applyWallet, maxWalletApplicable]);

  const handleWalletInputChange = (e) => {
    let val = parseFloat(e.target.value);
    if (isNaN(val)) val = 0;
    if (val > maxWalletApplicable) val = maxWalletApplicable;
    if (val < 0) val = 0;
    setWalletAppliedAmount(val);
  };

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

  const confirmBooking = async (slotData) => {
    if (!user) {
      openLoginModal("/confirmed");
      return;
    }
    setSubmitting(true);
    try {
      const patient_id = user?.id || user?.user_id || user?.patient_id || "";
      const entitylocation = globalLocation?.location_key || globalLocation?.entitylocation || globalLocation?.key || "location7";
      const registrationdate = (() => {
        const raw = user?.created_at || user?.registration_date || user?.registrationdate || new Date().toISOString();
        const d = new Date(raw);
        if (isNaN(d.getTime())) return new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        return `${yyyy}${mm}${dd}`;
      })();

      const tests = [];
      if (selectedItem?.subitems && Array.isArray(selectedItem.subitems) && selectedItem.subitems.length > 0) {
        selectedItem.subitems.forEach(sub => {
          tests.push({
            key: sub.service_key || sub.id || sub.key,
            Name: sub.service_name || sub.name || sub.title
          });
        });
      } else {
        tests.push({
          key: selectedItem?.service_key || selectedItem?.id || selectedItem?.key,
          Name: selectedItem?.service_name || selectedItem?.name || selectedItem?.title
        });
      }

      const payload = {
        entitykey: "secure-hospitals",
        entitylocation: entitylocation,
        patient_id: patient_id,
        wallet_amount_used: applyWallet ? walletAppliedAmount : 0,
        patientInfo: {
          patientName: user?.name || "Guest",
          mobileNumber: user?.mobile_number || user?.mobile || user?.phone || "",
          registrationdate: registrationdate
        },
        drInfo: {
          drKey: "sh-dummy",
          drName: "Dummy",
          drSpeciality: ["Paediatrician"]
        },
        tests: tests
      };

      const result = await createLabOrder(payload);

      setBookingType("lab");
      setLabPackage(selectedItem);
      setDate(new Date(slotData.date));
      setSlot(slotData.time);

      const labPrice = selectedItem?.price || 0;
      const amountToPay = labPrice - (applyWallet ? walletAppliedAmount : 0);

      if (amountToPay <= 0) {
        const bookingId = result.order_id || result.bookingId || result.razorpay_order_id || "LAB" + Math.floor(Math.random() * 100000000);
        setBookingId(bookingId);
        go("/confirmed");
        return;
      }

      const res = await loadRazorpayScript();
      if (!res) {
        alert("Razorpay SDK failed to load. Are you offline?");
        setSubmitting(false);
        return;
      }

      const options = {
        key: "rzp_test_Awy3RfMG9T9BYe",
        amount: amountToPay * 100,
        currency: "INR",
        name: "Arvaya Healthcare",
        description: "Lab Test Booking",
        order_id: result.razorpay_order_id,
        handler: async function (response) {
          try {
            await verifyLabPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              ...payload
            });
            const bookingId = result.razorpay_order_id || result.bookingId || result.order_id || "LAB" + Math.floor(Math.random() * 100000000);
            setBookingId(bookingId);
            go("/confirmed");
          } catch (err) {
            console.error("Payment verification failed", err);
            alert("Payment verification failed. Please contact support.");
            setSubmitting(false);
          }
        },
        prefill: {
          name: user?.name || "Guest",
          contact: user?.mobile || user?.phone || "",
        },
        theme: {
          color: "#2e666e",
        },
        modal: {
          ondismiss: function() {
            setSubmitting(false);
          }
        }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();

    } catch (err) {
      console.error("Lab booking failed:", err);
      if (err.status === 409) {
        alert(err.message || "Slot already booked");
      } else {
        alert("Booking failed. Please try again.");
      }
      setSubmitting(false);
    }
  };

  return (
    <main className="page page-enter" style={{ padding: 0, background: 'var(--bg-app)', color: 'var(--text-main)' }}>
      
      {/* Embedded Responsive Styling for Lab UI */}
      <style>{`
        .lab-container-custom {
          padding: 32px 16px 64px 16px;
        }

        .lab-hero-banner {
          background: linear-gradient(135deg, #eef8f6 0%, #e0f2f0 55%, #d8eae7 100%);
          border-radius: 24px;
          margin-top: 12px;
          padding: 28px 32px;
          position: relative;
          overflow: hidden;
          box-shadow: 0 8px 24px rgba(46, 102, 110, 0.08);
          border: 1px solid rgba(46, 102, 110, 0.15);
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;
          gap: 24px;
        }

        .lab-hero-content {
          flex: 1;
          max-width: 600px;
        }

        .lab-hero-pill-tag {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 11.5px;
          font-weight: 700;
          color: #0d5c63;
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(4px);
          padding: 4px 12px;
          border-radius: 20px;
          border: 1px solid rgba(13, 92, 99, 0.18);
          margin-bottom: 12px;
        }

        .lab-hero-title {
          font-family: 'Plus Jakarta Sans', var(--font-sans);
          font-weight: 800;
          font-size: 24px;
          line-height: 1.25;
          color: #12333A;
          margin: 0 0 6px 0;
          letter-spacing: -0.02em;
        }

        .lab-hero-subtitle {
          font-size: 13.5px;
          color: #3b6066;
          margin: 0 0 16px 0;
          font-weight: 500;
          line-height: 1.4;
        }

        .lab-hero-search-wrapper {
          background: #ffffff;
          border: 1.5px solid rgba(46, 102, 110, 0.22);
          border-radius: 16px;
          padding: 8px 14px;
          display: flex;
          align-items: center;
          gap: 10px;
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.04);
          margin-bottom: 16px;
          transition: border-color 0.2s, box-shadow 0.2s;
        }

        .lab-hero-search-wrapper:focus-within {
          border-color: var(--primary);
          box-shadow: 0 4px 16px rgba(46, 102, 110, 0.15);
        }

        .lab-hero-search-input {
          border: none;
          outline: none;
          background: transparent;
          width: 100%;
          font-size: 13.5px;
          color: var(--text-main);
          font-weight: 500;
        }

        .lab-hero-search-clear {
          background: none;
          border: none;
          cursor: pointer;
          color: var(--text-muted);
          padding: 2px;
          display: flex;
          align-items: center;
        }

        .lab-hero-badges {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .lab-hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 12px;
          font-weight: 600;
          color: #12333a;
          background: #ffffff;
          padding: 5px 12px;
          border-radius: 20px;
          border: 1px solid rgba(46, 102, 110, 0.14);
          box-shadow: 0 2px 6px rgba(0,0,0,0.03);
          white-space: nowrap;
        }

        .lab-hero-img-col {
          flex-shrink: 0;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .lab-hero-img-card {
          position: relative;
          background: #ffffff;
          padding: 12px;
          border-radius: 20px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
          border: 1px solid rgba(0, 0, 0, 0.05);
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .lab-hero-img {
          width: 135px;
          height: auto;
          object-fit: contain;
        }

        .lab-hero-stat-badge {
          position: absolute;
          bottom: -10px;
          background: #ffffff;
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 4px 10px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
          white-space: nowrap;
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

        .lab-scroll-arrow.left { left: -14px; }
        .lab-scroll-arrow.right { right: -14px; }

        /* Card Styles: Lab Test */
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
          margin-bottom: 14px;
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
          gap: 6px;
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
          white-space: nowrap;
          flex-shrink: 0;
          transition: all 0.2s;
          box-shadow: 0 2px 6px rgba(27, 77, 84, 0.2);
        }

        .lab-card-btn:hover {
          background: var(--primary);
          box-shadow: 0 4px 12px rgba(46, 102, 110, 0.35);
          transform: translateY(-1px);
        }

        /* Package Card */
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

        .lab-grid-view {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 16px;
        }

        .pkg-grid-view {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
          gap: 20px;
        }

        .lab-appointments-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 16px;
        }

        .lab-features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 24px;
        }

        /* ── MEDIA QUERIES FOR FULL RESPONSIVENESS ── */

        /* Tablets & Laptops (641px to 1024px) */
        @media (max-width: 1024px) {
          .lab-container-custom {
            padding: 24px 16px 48px 16px;
          }
          .lab-hero-banner {
            padding: 20px 22px;
          }
          .lab-hero-title {
            font-size: 19px;
          }
          .lab-card {
            width: 225px;
          }
          .pkg-card {
            width: 250px;
          }
          .lab-scroll-arrow.left { left: -4px; }
          .lab-scroll-arrow.right { right: -4px; }
          .lab-features-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 18px;
          }
        }

        /* Mobile Devices (320px to 640px) */
        @media (max-width: 640px) {
          .lab-container-custom {
            padding: 16px 12px 36px 12px;
          }
          .lab-hero-banner {
            flex-direction: column;
            padding: 20px 16px;
            border-radius: 20px;
            margin-top: 6px;
            margin-bottom: 20px;
            gap: 14px;
            text-align: left;
            align-items: flex-start;
          }
          .lab-hero-content {
            width: 100%;
            max-width: 100%;
          }
          .lab-hero-pill-tag {
            font-size: 11px;
            padding: 3px 10px;
            margin-bottom: 8px;
          }
          .lab-hero-title {
            font-size: 19px;
            line-height: 1.3;
            margin-bottom: 6px;
            text-align: left;
          }
          .lab-hero-subtitle {
            font-size: 12.5px;
            margin-bottom: 14px;
          }
          .lab-hero-search-wrapper {
            padding: 8px 12px;
            margin-bottom: 14px;
            border-radius: 14px;
          }
          .lab-hero-search-input {
            font-size: 13px;
          }
          .lab-hero-badges {
            gap: 6px;
            justify-content: flex-start;
          }
          .lab-hero-badge {
            font-size: 11px;
            padding: 4px 10px;
            border-radius: 16px;
          }
          .lab-hero-img-col {
            display: none;
          }
          .lab-section-header {
            margin-bottom: 12px;
          }
          .lab-section-title {
            font-size: 17px;
          }
          .lab-view-all-btn {
            font-size: 12.5px;
          }
          .lab-scroll-arrow {
            display: none;
          }
          .lab-scroll-row {
            gap: 12px;
            padding: 4px 2px 12px 2px;
          }
          .lab-card {
            width: 205px;
            border-radius: 16px;
          }
          .lab-card-img-container {
            height: 110px;
          }
          .lab-card-body {
            padding: 12px;
          }
          .lab-card-title {
            font-size: 13.5px;
            min-height: 34px;
            margin-bottom: 4px;
          }
          .lab-card-sub {
            font-size: 10.5px;
            padding: 3px 8px;
            margin-bottom: 10px;
          }
          .lab-card-footer {
            padding-top: 8px;
          }
          .lab-card-price {
            font-size: 16px;
          }
          .lab-card-btn {
            padding: 6px 11px;
            font-size: 11.5px;
            border-radius: 16px;
          }
          .pkg-card {
            width: 235px;
            border-radius: 16px;
          }
          .pkg-card-img-container {
            height: 120px;
          }
          .pkg-card-body {
            padding: 12px 14px;
          }
          .pkg-card-title {
            font-size: 14px;
            min-height: 36px;
          }
          .pkg-card-btn {
            padding: 8px 12px;
            font-size: 12px;
            border-radius: 16px;
          }
          .lab-grid-view {
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
          }
          .lab-grid-view .lab-card {
            width: 100%;
          }
          .pkg-grid-view {
            grid-template-columns: 1fr;
            gap: 12px;
          }
          .pkg-grid-view .pkg-card {
            width: 100%;
          }
          .lab-appointments-grid {
            grid-template-columns: 1fr;
            gap: 10px;
          }
          .lab-features-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
          }
        }

        /* Very Small Screens (< 420px) */
        @media (max-width: 420px) {
          .lab-features-grid {
            grid-template-columns: 1fr;
            gap: 12px;
          }
          .lab-card {
            width: 195px;
          }
          .pkg-card {
            width: 220px;
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
          
          {/* Top Hero Banner */}
          <div className="lab-hero-banner">
            <div className="lab-hero-content">
              
              {/* Pre-title Pill Tag */}
              <div className="lab-hero-pill-tag">
                <Sparkles size={13} color="#0d5c63" /> NABL & ISO Certified Partner Labs
              </div>

              {/* Title & Subtitle */}
              <h1 className="lab-hero-title">
                Book trusted lab tests & health packages with ease.
              </h1>
              <p className="lab-hero-subtitle">
                Free doorstep sample collection by certified phlebotomists.
              </p>

              {/* Trust Micro Badges */}
              <div className="lab-hero-badges">
                <span className="lab-hero-badge">
                  <CheckCircle2 size={14} color="#16a34a" /> Certified Labs
                </span>
                <span className="lab-hero-badge">
                  <Clock size={14} color="#0d5c63" /> 12-24h Reports
                </span>
                <span className="lab-hero-badge">
                  <ShieldCheck size={14} color="#f97316" /> Free Home Sample
                </span>
              </div>

            </div>

            {/* Right Graphic/Illustration (Desktop & Tablet) */}
            <div className="lab-hero-img-col">
              <div className="lab-hero-img-card">
                <img 
                  src="/reward_lab.png" 
                  alt="Lab Diagnostics Illustration" 
                  className="lab-hero-img"
                />
                <div className="lab-hero-stat-badge">
                  <span style={{ fontSize: '11px', fontWeight: '800', color: '#12333a' }}>⭐ 4.9 Pathologist Rating</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="container lab-container-custom">

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

        {/* ── SECTION 3: MY ORDERS ── */}
        <section style={{ marginBottom: '48px' }}>
          <div className="lab-section-header">
            <h2 className="lab-section-title">My Orders</h2>
            <button className="lab-view-all-btn" onClick={() => go('/orders')}>
              View All <ArrowRight size={16} />
            </button>
          </div>

          {appointments.length > 0 ? (
            <div className="lab-appointments-grid">
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
                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px', gap: '8px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)' }}>{appt.date}</span>
                      {appt.time && <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{appt.time}</span>}
                    </div>
                    <span style={{
                      padding: '3px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '700',
                      background: (appt.status || '').toLowerCase() === 'delivered' || (appt.status || '').toLowerCase() === 'completed' || (appt.status || '').toLowerCase() === 'ready' ? '#dcfce7' : 'var(--primary-light)',
                      color: (appt.status || '').toLowerCase() === 'delivered' || (appt.status || '').toLowerCase() === 'completed' || (appt.status || '').toLowerCase() === 'ready' ? '#16a34a' : 'var(--primary-dark)',
                      textTransform: 'capitalize',
                      flexShrink: 0
                    }}>
                      {appt.status}
                    </span>
                  </div>
                  <h4 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '8px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: '1.4' }}>
                    {typeof appt.name === 'string' && appt.name.length > 60 ? appt.name.substring(0, 60) + '...' : appt.name}
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '12.5px', color: 'var(--text-muted)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <MapPin size={14} color="var(--primary)" /> {appt.lab}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'monospace', fontSize: '11px' }}>
                      ID: {appt.id}
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
              No orders found.
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
          <div className="lab-features-grid">
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

        {!loadingWallet && walletBalance > 0 && (
          <div style={{ marginBottom: "24px", background: '#ffffff', borderRadius: '16px', border: '1px solid var(--border)', padding: '20px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ background: '#dcfce7', color: '#16a34a', padding: '12px', borderRadius: '50%' }}>
                  <Wallet size={20} />
                </div>
                <div>
                  <h3 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: '700', color: 'var(--text-main)' }}>Wallet Balance</h3>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Available to redeem</span>
                </div>
              </div>
              <b style={{ color: '#16a34a', fontSize: '18px' }}>₹{walletBalance}</b>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
              <span style={{ color: 'var(--text-main)', fontSize: '14px', fontWeight: '500' }}>Apply wallet balance</span>
              <div 
                onClick={() => { if(walletBalance > 0) setApplyWallet(!applyWallet) }}
                style={{
                  width: '40px',
                  height: '22px',
                  borderRadius: '11px',
                  background: applyWallet ? '#114c54' : '#e5e7eb',
                  position: 'relative',
                  cursor: walletBalance > 0 ? 'pointer' : 'not-allowed',
                  opacity: walletBalance > 0 ? 1 : 0.5,
                  transition: 'background 0.3s'
                }}
              >
                <div style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  background: '#fff',
                  position: 'absolute',
                  top: '2px',
                  left: applyWallet ? '20px' : '2px',
                  transition: 'left 0.3s',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }} />
              </div>
            </div>

            {applyWallet && (
              <div style={{ marginTop: '12px', background: '#f0fdf4', border: '1px solid #dcfce7', borderRadius: '8px', padding: '10px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)', fontWeight: '600' }}>
                  <span>₹</span>
                  <input 
                    type="number" 
                    value={walletAppliedAmount} 
                    onChange={handleWalletInputChange}
                    style={{ background: 'transparent', border: 'none', outline: 'none', width: '80px', fontSize: '15px', fontWeight: '600', color: 'var(--text-main)' }}
                  />
                </div>
                <span style={{ fontSize: '12px', color: '#16a34a', fontWeight: '600' }}>Max ₹{maxWalletApplicable}</span>
              </div>
            )}
          </div>
        )}

        {loadingWallet && (
          <div style={{ marginBottom: "24px", textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>
            <div className="spinner" style={{ width: '20px', height: '20px', borderTopColor: 'var(--primary)', border: '2px solid rgba(0,0,0,0.1)', borderRadius: '50%', animation: 'spin 1s linear infinite', display: 'inline-block', verticalAlign: 'middle', marginRight: '8px' }}></div>
            Loading wallet balance...
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

        <SelectSlotUI onConfirm={confirmBooking} type="lab" submitting={submitting} />
      </Modal>

    </main>
  );
}
