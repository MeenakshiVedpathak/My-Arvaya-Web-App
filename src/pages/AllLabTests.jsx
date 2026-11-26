import {
  Search, ChevronLeft, ChevronRight, ArrowLeft, FlaskConical, Clock, Heart, ShieldCheck,
  Droplets, Beaker, Stethoscope, TestTube, MapPin, ArrowRight, X, Filter, Wallet, Home, User,
  CalendarDays, CheckCircle2, Calendar, Building2, Smartphone, Mail, Check, CreditCard,
  ShoppingCart, Trash2, Plus, Minus
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { getDiagnosticTests, getWalletAmount, createLabOrder, verifyLabPayment, loadRazorpayScript } from "../services/dataService";
import { useBooking } from "../context/BookingContext";
import { useAuth } from "../context/AuthContext";
import Modal from "../components/common/Modal";
import LabItemIcon from "../components/labs/LabItemIcon";
import LabSlotPicker from "../components/labs/LabSlotPicker";
import { fallbackLabTests } from "../utils/labTests";
import { useLabCart, getLabItemKey } from "../utils/labCart";

const ITEMS_PER_PAGE = 12;

// Fallback tests (same as Labs page) shown when the API returns nothing, e.g. user not logged in
const normalizeFallbackTest = (t) => ({
  ...t,
  service_name: t.title,
  title: toTitleCase(t.title),
  rawTitle: t.title
});

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

export default function AllLabTests() {
  const go = useNavigate();
  const location = useLocation();
  const { setBookingType, setLabPackage, setLabVisitType, setDate, setSlot, setBookingId, globalLocation } = useBooking();
  const { user, openLoginModal } = useAuth();

  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [appliedQuery, setAppliedQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [labBookingStep, setLabBookingStep] = useState(1);
  const [labSelectedDate, setLabSelectedDate] = useState(null);
  const [labSelectedSlot, setLabSelectedSlot] = useState(null);
  const [visitType, setVisitType] = useState("home");
  const [walletBalance, setWalletBalance] = useState(0);
  const [applyWallet, setApplyWallet] = useState(false);
  const [walletAppliedAmount, setWalletAppliedAmount] = useState(0);
  const [loadingWallet, setLoadingWallet] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  // Synchronous lock so a fast double-click can't create two lab orders.
  const submitLockRef = useRef(false);

  // Lab Cart integration
  const {
    cart: labCart,
    addToCart: addLabCartItem,
    updateQty: updateLabCartQty,
    removeFromCart: removeLabCartItem,
    assignSlot: assignLabSlot,
    totalCount: labCartCount,
  } = useLabCart();

  const selectedItemCartEntry = selectedItem
    ? labCart.find((c) => getLabItemKey(c) === getLabItemKey(selectedItem))
    : null;
  const inCartQty = selectedItemCartEntry ? selectedItemCartEntry.qty : 0;
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(null);
  const isInitialMount = useRef(true);
  const latestRequest = useRef(0);

  // Show one page of the static fallback tests (guest users)
  const showFallbackPage = (page, searchKeyword = "") => {
    const keyword = searchKeyword.toLowerCase();
    const matches = keyword
      ? fallbackLabTests.filter(t => (t.title || "").toLowerCase().includes(keyword))
      : fallbackLabTests;
    const start = (page - 1) * ITEMS_PER_PAGE;
    setTests(matches.slice(start, start + ITEMS_PER_PAGE).map(normalizeFallbackTest));
    setTotalCount(matches.length);
  };

  // Fetch one page of tests from API and apply filter upon response
  const fetchTestsFromApi = (searchKeyword = "", page = 1) => {
    const requestId = ++latestRequest.current;
    setLoading(true);
    setAppliedQuery(searchKeyword);
    setCurrentPage(page);

    const payload = {
      page,
      limit: ITEMS_PER_PAGE,
      searchQuery: searchKeyword
    };

    getDiagnosticTests(payload)
      .then((apiTests) => {
        // Ignore responses from older requests (e.g. fast page clicks)
        if (requestId !== latestRequest.current) return;

        // Not logged in → API returns 401 (empty list), show the same tests as Labs
        if (!user && (!Array.isArray(apiTests) || apiTests.length === 0)) {
          showFallbackPage(page, searchKeyword);
        } else if (Array.isArray(apiTests)) {
          const offset = (page - 1) * ITEMS_PER_PAGE;
          const normalized = apiTests.map((t, i) => {
            const idx = offset + i;
            const rawTitle = t.service_name || t.name || t.title || t.test_name || `Lab Test ${idx + 1}`;
            const rawCategory = t.profile_name || t.category || t.test_category_name || t.department || "Fluid & Clinical Test";
            const priceVal = parseFloat(t.price || t.cost || t.amount || 150);

            return {
              id: t.id || t.service_key || `api-test-${idx}`,
              service_key: t.service_key,
              service_name: t.service_name || rawTitle,
              title: toTitleCase(rawTitle),
              rawTitle: String(rawTitle),
              category: rawCategory,
              price: priceVal,
              fasting: t.fasting || (t.fasting_required ? "Fasting Required" : "No Fasting Required"),
              reportTime: t.reportTime || t.report_time || "24 Hours",
              img: t.img || t.image || "/lab_test_sample.png"
            };
          });
          setTests(normalized);
          const total = Number(apiTests.total);
          setTotalCount(Number.isFinite(total) ? total : null);
        }
        setLoading(false);
      })
      .catch((err) => {
        if (requestId !== latestRequest.current) return;
        console.error("AllLabTests fetch error:", err);
        if (!user) showFallbackPage(page, searchKeyword);
        setLoading(false);
      });
  };

  // Initial fetch on page load
  useEffect(() => {
    setQ("");
    fetchTestsFromApi("");
  }, [user]); // re-fetch after login/logout so guest fallback data is replaced with real API data

  // Trigger API and clear filter in UI when search bar input length becomes 0 (after backspace / clearing)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    if (q.trim().length === 0 && appliedQuery !== "") {
      fetchTestsFromApi("");
    }
  }, [q, appliedQuery]);

  // Server-side Pagination - 10 cards per page.
  // If the API doesn't send a total count, allow "Next" while a full page comes back.
  const hasMore = tests.length === ITEMS_PER_PAGE;
  const totalPages = totalCount != null
    ? Math.max(1, Math.ceil(totalCount / ITEMS_PER_PAGE))
    : currentPage + (hasMore ? 1 : 0);
  const pageStart = (currentPage - 1) * ITEMS_PER_PAGE;

  const goToPage = (pageNum) => {
    const target = Math.min(totalPages, Math.max(1, pageNum));
    if (target === currentPage) return;
    fetchTestsFromApi(appliedQuery, target);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleOpenBookingModal = (item) => {
    setLabBookingStep(1);
    setLabSelectedDate(null);
    setLabSelectedSlot(null);
    setApplyWallet(false);
    setWalletAppliedAmount(0);
    setSelectedItem(item);
  };

  const handleCloseBookingModal = () => {
    if (submitting) return;
    setSelectedItem(null);
    setLabBookingStep(1);
    setLabSelectedDate(null);
    setLabSelectedSlot(null);
    setApplyWallet(false);
    setWalletAppliedAmount(0);
  };

  // Close the booking modal and open login; after login the user stays on this same page
  const handleLoginToBook = () => {
    handleCloseBookingModal();
    openLoginModal(location.pathname);
  };

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

  const confirmBooking = async (slotData) => {
    if (!user) {
      openLoginModal("/confirmed");
      return;
    }
    if (submitLockRef.current) return;
    submitLockRef.current = true;
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

      const activeSlot = slotData || labSelectedSlot;
      const slot_id = activeSlot?.slot_id ?? activeSlot?.id ?? activeSlot?.slot?.id ?? null;

      const payload = {
        entitykey: "secure-hospitals",
        entitylocation: entitylocation,
        patient_id: patient_id,
        slot_id: slot_id,
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
      setLabVisitType(visitType);
      const chosenDate = labSelectedDate || (slotData?.date ? new Date(slotData.date) : new Date());
      const chosenTime = labSelectedSlot?.label || labSelectedSlot?.time || slotData?.time || "10:00 AM";
      setDate(chosenDate);
      setSlot(chosenTime);
      setApplyWallet(false);
      setWalletAppliedAmount(0);

      const labPrice = selectedItem?.price || 0;
      const amountToPay = labPrice - (applyWallet ? walletAppliedAmount : 0);

      if (amountToPay <= 0) {
        const bookingId = result.order_id || result.bookingId || result.razorpay_order_id || "LAB" + Math.floor(Math.random() * 100000000);
        setBookingId(bookingId);
        setLabBookingStep(1);
        setLabSelectedDate(null);
        setLabSelectedSlot(null);
        go("/confirmed");
        return;
      }

      const res = await loadRazorpayScript();
      if (!res) {
        alert("Razorpay SDK failed to load. Are you offline?");
        submitLockRef.current = false;
        setSubmitting(false);
        return;
      }

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
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
            setLabBookingStep(1);
            setLabSelectedDate(null);
            setLabSelectedSlot(null);
            go("/confirmed");
          } catch (err) {
            console.error("Payment verification failed", err);
            alert("Payment verification failed. Please contact support.");
            submitLockRef.current = false;
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
          ondismiss: function () {
            submitLockRef.current = false;
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
      submitLockRef.current = false;
      setSubmitting(false);
    }
  };

  return (
    <main className="page page-enter" style={{ padding: 0, background: 'var(--bg-app)', color: 'var(--text-main)', minHeight: '100vh' }}>

      {/* Styles */}
      <style>{`
        .all-tests-hero {
          position: relative;
          overflow: hidden;
          background: linear-gradient(90deg, #effaf7 0%, #e3f7f2 50%, #ccf4eb 100%);
          border-bottom: 1px solid rgba(20, 184, 166, 0.16);
          padding: 16px 0 18px 0;
        }
        .all-tests-hero-wave {
          position: absolute;
          right: 0;
          top: 0;
          width: 55%;
          height: 100%;
          pointer-events: none;
        }
        .all-tests-hero-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
        }
        .all-tests-hero-content {
          max-width: 680px;
          min-width: 0;
        }
        .all-tests-hero-breadcrumb {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 8px;
          font-size: 12.5px;
          font-weight: 500;
          color: #55738d;
          margin-bottom: 4px;
        }
        .all-tests-breadcrumb-link {
          color: #55738d;
          text-decoration: none;
          transition: color 0.2s ease;
        }
        .all-tests-breadcrumb-link:hover {
          color: #0b2545;
        }
        .all-tests-breadcrumb-sep {
          color: #7a94a9;
          flex-shrink: 0;
        }
        .all-tests-hero-title-row {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 10px;
        }
        .all-tests-hero-title {
          font-size: 22px;
          font-weight: 800;
          color: #0b2545;
          margin: 0;
          letter-spacing: -0.02em;
          line-height: 1.2;
        }
        .all-tests-hero-chip {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 3px 10px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.75);
          border: 1px solid rgba(13, 148, 136, 0.2);
          color: #0d9488;
          font-size: 12.5px;
          font-weight: 700;
        }
        .all-tests-hero-desc {
          font-size: 13.5px;
          color: #55738d;
          margin: 2px 0 0 0;
          line-height: 1.5;
        }
        .all-tests-hero-side {
          display: flex;
          align-items: center;
          gap: 16px;
          flex-shrink: 0;
        }
        .all-tests-back-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.8);
          border: 1px solid rgba(13, 148, 136, 0.25);
          color: #0d9488;
          font-size: 12.5px;
          font-weight: 700;
          cursor: pointer;
          transition: background 0.2s ease, border-color 0.2s ease;
        }
        .all-tests-back-btn:hover {
          background: #ffffff;
          border-color: rgba(13, 148, 136, 0.45);
        }
        .all-tests-hero-graphic {
          display: flex;
        }
        .all-tests-hero-svg {
          width: 64px;
          height: 64px;
          filter: drop-shadow(0 6px 14px rgba(13, 148, 136, 0.12));
        }
        @media (max-width: 640px) {
          .all-tests-hero-title {
            font-size: 19px;
          }
          .all-tests-hero-desc {
            font-size: 12.5px;
          }
          .all-tests-hero-svg {
            width: 52px;
            height: 52px;
          }
          .all-tests-hero-graphic {
            display: none;
          }
        }
        @media (max-width: 520px) {
          .all-tests-hero-inner {
            flex-direction: column;
            align-items: flex-start;
            gap: 10px;
          }
        }

        .all-tests-card {
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

        .all-tests-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 14px 32px rgba(18, 51, 58, 0.12);
          border-color: var(--primary-soft);
        }

        .all-tests-card-img-container {
          height: 146px;
          width: 100%;
          display: grid;
          place-items: end center;
          padding: 47px 14px 14px;
          box-sizing: border-box;
          background: #f0f7f7;
          overflow: hidden;
          position: relative;
        }

        .all-tests-card-visual {
          position: relative;
          z-index: 1;
          display: grid;
          width: 76px;
          height: 76px;
          place-items: center;
          color: #087b73;
          background: linear-gradient(160deg, #ffffff 0%, #f2fbf8 100%);
          border: 1px solid #ffffff;
          border-radius: 24px;
          box-shadow:
            0 12px 24px rgba(5, 73, 78, 0.13),
            0 0 0 6px rgba(255, 255, 255, 0.45);
          transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .all-tests-card:hover .all-tests-card-visual {
          transform: translateY(-3px) scale(1.06) rotate(-3deg);
        }

        .all-tests-card-tag {
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

        .all-tests-card-body {
          padding: 16px;
          display: flex;
          flex-direction: column;
          flex: 1;
        }

        .all-tests-card-title {
          font-family: 'Plus Jakarta Sans', var(--font-sans);
          font-weight: 700;
          font-size: 15px;
          line-height: 1.35;
          color: #12333A;
          margin-bottom: 6px;
          min-height: 40px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .all-tests-card-sub {
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

        .all-tests-card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: auto;
          padding-top: 12px;
          border-top: 1px dashed var(--border);
        }

        .all-tests-card-price-col {
          display: flex;
          flex-direction: column;
        }

        .all-tests-card-price-label {
          font-size: 10px;
          font-weight: 600;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .all-tests-card-price {
          font-weight: 800;
          font-size: 18px;
          color: #12333A;
          line-height: 1.1;
        }

        .all-tests-card-btn {
          background: #1b4d54;
          color: #ffffff;
          border: none;
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 12.5px;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 5px;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 2px 6px rgba(27, 77, 84, 0.2);
        }

        .all-tests-card-btn:hover {
          background: var(--primary);
          box-shadow: 0 4px 12px rgba(46, 102, 110, 0.35);
          transform: translateY(-1px);
        }

        .all-tests-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
        }

        @media (max-width: 1024px) {
          .all-tests-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        /* ── Match Labs page card styling ── */
        .all-tests-card {
          background: linear-gradient(180deg, #ffffff 60%, #fbfefd 100%);
          border: 1px solid rgba(8, 120, 125, 0.14);
          border-radius: 22px;
          box-shadow: 0 11px 28px rgba(5, 73, 78, 0.08);
          transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s ease, border-color 0.3s ease;
        }

        .all-tests-card::before {
          content: "";
          position: absolute;
          inset: 0 0 auto;
          z-index: 3;
          height: 4px;
          background: linear-gradient(90deg, #087b73, #2bc4a6, #087b73);
          background-size: 200% 100%;
          transition: background-position 0.6s ease;
        }

        .all-tests-card:hover {
          transform: translateY(-6px);
          border-color: rgba(8, 120, 125, 0.32);
          box-shadow: 0 22px 40px -10px rgba(5, 73, 78, 0.22), 0 6px 14px rgba(5, 73, 78, 0.06);
        }

        .all-tests-card:hover::before {
          background-position: 100% 0;
        }

        /* Decorative rings behind the icon */
        .all-tests-card-img-container::before,
        .all-tests-card-img-container::after {
          content: "";
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
          z-index: 0;
        }

        .all-tests-card-img-container::before {
          width: 150px;
          height: 150px;
          right: -55px;
          top: -60px;
          border: 1px solid rgba(8, 123, 115, 0.12);
          background: radial-gradient(circle, rgba(52, 211, 180, 0.12), transparent 70%);
        }

        .all-tests-card-img-container::after {
          width: 90px;
          height: 90px;
          left: -35px;
          bottom: -45px;
          border: 1px solid rgba(8, 123, 115, 0.1);
        }

        .all-tests-card-visual {
          box-shadow:
            0 12px 24px rgba(5, 73, 78, 0.13),
            0 0 0 6px rgba(255, 255, 255, 0.45),
            inset 0 -3px 0 rgba(8, 123, 115, 0.06);
        }

        .all-tests-card-tag {
          top: 15px;
          left: 13px;
          z-index: 4;
          gap: 5px;
          padding: 5px 8px;
          color: #087b73;
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          border: 1px solid rgba(8, 123, 115, 0.22);
          border-radius: 9px;
          box-shadow: 0 6px 14px rgba(5, 73, 78, 0.08), inset 0 1px 0 #fff;
          font-size: 9.5px;
          font-weight: 800;
        }

        .all-tests-card-title {
          font-family: var(--font-display);
          font-size: 13.5px;
          font-weight: 800;
          min-height: 37px;
          transition: color 0.2s ease;
        }

        .all-tests-card:hover .all-tests-card-title {
          color: #087b73;
        }

        .all-tests-card-sub {
          color: #087b73;
          background: linear-gradient(90deg, #e8f6f3, #f2faf8);
          border: 1px solid rgba(8, 123, 115, 0.14);
          border-radius: 999px;
          font-size: 9.5px;
          font-weight: 750;
        }

        .all-tests-card-footer {
          padding-top: 11px;
          border-top: 1px dashed color-mix(in srgb, #087b73 22%, #dce8e7);
        }

        .all-tests-card-btn {
          position: relative;
          overflow: hidden;
          width: 100%;
          min-height: 35px;
          justify-content: center;
          border-radius: 11px;
          background: linear-gradient(135deg, #0b8f84 0%, #087b73 50%, #0a5a5c 100%);
          box-shadow: 0 8px 18px rgba(8, 123, 115, 0.28), inset 0 1px 0 rgba(255, 255, 255, 0.18);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .all-tests-card-btn::after {
          content: "";
          position: absolute;
          top: 0;
          bottom: 0;
          left: -60%;
          width: 40%;
          background: linear-gradient(100deg, transparent, rgba(255, 255, 255, 0.28), transparent);
          transform: skewX(-20deg);
          transition: left 0.6s ease;
          pointer-events: none;
        }

        .all-tests-card-btn svg {
          transition: transform 0.2s ease;
        }

        .all-tests-card-btn:hover {
          background: linear-gradient(135deg, #0b8f84 0%, #087b73 50%, #0a5a5c 100%);
          box-shadow: 0 12px 22px rgba(8, 123, 115, 0.34), inset 0 1px 0 rgba(255, 255, 255, 0.2);
        }

        .all-tests-card-btn:hover::after {
          left: 130%;
        }

        .all-tests-card-btn:hover svg {
          transform: translateX(3px);
        }

        /* ── Same card design as the Labs page: each card tinted in its own colour ── */
        .all-tests-card {
          --lab-accent: #08a57b;
          background: #fff;
          border: 1px solid color-mix(in srgb, var(--lab-accent) 24%, transparent);
          box-shadow:
            0 2px 6px rgba(5, 73, 78, 0.05),
            0 16px 32px -14px color-mix(in srgb, var(--lab-accent) 36%, transparent);
        }

        /* same rotation as the Labs page and Home's Health Packages */
        .all-tests-card:nth-child(4n + 2) { --lab-accent: #2583d8; }
        .all-tests-card:nth-child(4n + 3) { --lab-accent: #f28a28; }
        .all-tests-card:nth-child(4n + 4) { --lab-accent: #8b5cf6; }

        .all-tests-card::before {
          display: none;
        }

        .all-tests-card:hover {
          transform: translateY(-5px);
          border-color: color-mix(in srgb, var(--lab-accent) 45%, transparent);
          box-shadow:
            0 2px 6px rgba(5, 73, 78, 0.05),
            0 26px 46px -16px color-mix(in srgb, var(--lab-accent) 48%, transparent);
        }

        .all-tests-card-img-container {
          background:
            linear-gradient(150deg,
              color-mix(in srgb, var(--lab-accent) 8%, #fff) 0%,
              color-mix(in srgb, var(--lab-accent) 16%, #fff) 60%,
              color-mix(in srgb, var(--lab-accent) 22%, #fff) 100%);
        }

        .all-tests-card-img-container::before {
          border-color: color-mix(in srgb, var(--lab-accent) 16%, transparent);
          background: none;
        }

        .all-tests-card-img-container::after {
          border-color: color-mix(in srgb, var(--lab-accent) 14%, transparent);
        }

        .all-tests-card-visual {
          color: var(--lab-accent);
          background: linear-gradient(160deg, #ffffff 0%, color-mix(in srgb, var(--lab-accent) 6%, #fff) 100%);
          box-shadow:
            0 12px 24px color-mix(in srgb, var(--lab-accent) 22%, transparent),
            0 0 0 6px rgba(255, 255, 255, 0.6),
            inset 0 -3px 0 color-mix(in srgb, var(--lab-accent) 8%, transparent);
        }

        .all-tests-card-tag {
          color: var(--lab-accent);
          border-color: color-mix(in srgb, var(--lab-accent) 22%, transparent);
        }

        /* tinted body with an accent bar where the icon area meets it */
        .all-tests-card-body {
          position: relative;
          background:
            linear-gradient(180deg,
              color-mix(in srgb, var(--lab-accent) 12%, #fff) 0%,
              color-mix(in srgb, var(--lab-accent) 7%, #fff) 100%);
        }

        .all-tests-card-body::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 3px;
          background: linear-gradient(90deg, var(--lab-accent), color-mix(in srgb, var(--lab-accent) 35%, #fff));
        }

        .all-tests-card:hover .all-tests-card-title {
          color: color-mix(in srgb, var(--lab-accent) 80%, #1f2d2e);
        }

        /* no reserved second line, so the pill sits right under the title */
        .all-tests-card .all-tests-card-title {
          min-height: 0;
          margin-bottom: 10px;
        }

        .all-tests-card-sub {
          color: color-mix(in srgb, var(--lab-accent) 80%, #1f2d2e);
          background: #fff;
          border: 1px solid color-mix(in srgb, var(--lab-accent) 28%, transparent);
          box-shadow: 0 4px 12px color-mix(in srgb, var(--lab-accent) 14%, transparent);
        }

        .all-tests-card-footer {
          border-top: 1px dashed color-mix(in srgb, var(--lab-accent) 28%, transparent);
        }

        @media (prefers-reduced-motion: reduce) {
          .all-tests-card,
          .all-tests-card-visual,
          .all-tests-card-btn::after {
            transition: none;
          }
        }

        @media (max-width: 768px) {
          .all-tests-hero {
            padding: 12px 0 14px 0;
          }
          .all-tests-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
          }
          .all-tests-card-body {
            padding: 12px;
          }
          .all-tests-card-title {
            font-size: 13.5px;
            min-height: 34px;
          }
          .all-tests-card-sub {
            font-size: 10.5px;
            padding: 3px 8px;
            margin-bottom: 10px;
          }
          .all-tests-card-price {
            font-size: 16px;
          }
          .all-tests-card-btn {
            padding: 6px 11px;
            font-size: 11.5px;
            border-radius: 16px;
            white-space: nowrap;
          }
        }

        @media (max-width: 440px) {
          .all-tests-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 8px;
          }
          .all-tests-card-img-container {
            height: 118px;
            padding: 38px 10px 10px;
          }
          .all-tests-card-visual {
            width: 62px;
            height: 62px;
            border-radius: 20px;
          }
          .all-tests-card-visual svg {
            width: 34px;
            height: 34px;
          }
          .all-tests-card-body {
            padding: 10px 8px;
          }
          .all-tests-card-title {
            font-size: 12.5px;
            line-height: 1.25;
            min-height: 32px;
          }
        }

        .all-tests-pagination-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
          margin-top: 28px;
          padding-top: 16px;
          border-top: 1px solid var(--border);
        }

        @media (max-width: 640px) {
          .all-tests-pagination-bar {
            flex-direction: column;
            align-items: center;
          }
        }
      `}</style>

      {/* Hero / Header Section */}
      <div className="all-tests-hero">
        <svg className="all-tests-hero-wave" viewBox="0 0 500 150" preserveAspectRatio="none" aria-hidden="true">
          <path d="M0,40 C150,90 320,10 500,45 L500,0 L0,0 Z" fill="rgba(255, 255, 255, 0.42)" />
        </svg>

        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div className="all-tests-hero-inner">
            <div className="all-tests-hero-content">
              <nav aria-label="Breadcrumb" className="all-tests-hero-breadcrumb">
                <Link to="/" className="all-tests-breadcrumb-link">Home</Link>
                <ChevronRight size={13} className="all-tests-breadcrumb-sep" />
                <Link to="/labs" className="all-tests-breadcrumb-link">Lab Tests</Link>
                <ChevronRight size={13} className="all-tests-breadcrumb-sep" />
                <span>All Lab Tests</span>
              </nav>

              <div className="all-tests-hero-title-row">
                <h1 className="all-tests-hero-title">All Diagnostic Lab Tests</h1>
                {!loading && totalCount > 0 && (
                  <span className="all-tests-hero-chip">
                    <FlaskConical size={13} /> {totalCount} {totalCount === 1 ? "test" : "tests"}
                  </span>
                )}
              </div>
              <p className="all-tests-hero-desc">
                NABL & ISO certified diagnostic lab tests with doorstep phlebotomist collection.
              </p>
            </div>

            <div className="all-tests-hero-side">
              <button
                onClick={() => go('/labs')}
                className="all-tests-back-btn"
              >
                <ArrowLeft size={14} /> Back to Lab Tests
              </button>
              <div className="all-tests-hero-graphic" aria-hidden="true">
                <svg className="all-tests-hero-svg" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Sparkles */}
                  <path d="M107 19C107 23.2 109.8 26 114 26C109.8 26 107 28.8 107 33C107 28.8 104.2 26 100 26C104.2 26 107 23.2 107 19Z" fill="#14b8a6" />
                  <path d="M13 46C13 49.5 15.5 52 19 52C15.5 52 13 54.5 13 58C13 54.5 10.5 52 7 52C10.5 52 13 49.5 13 46Z" fill="#14b8a6" />
                  <circle cx="16" cy="74" r="2" fill="#2dd4bf" />
                  <circle cx="112" cy="45" r="1.5" fill="#2dd4bf" />

                  {/* Test tubes */}
                  <g transform="rotate(-12 44 64)">
                    <rect x="34" y="26" width="20" height="70" rx="10" fill="#ffffff" stroke="#0d9488" strokeWidth="3.2" />
                    <path d="M37 62H51V86C51 90 48 93 44 93C40 93 37 90 37 86V62Z" fill="#99f6e4" />
                    <path d="M29 26H59" stroke="#0d9488" strokeWidth="3.2" strokeLinecap="round" />
                  </g>
                  <g transform="rotate(14 78 68)">
                    <rect x="68" y="30" width="20" height="70" rx="10" fill="#ffffff" stroke="#0d9488" strokeWidth="3.2" />
                    <path d="M71 58H85V90C85 94 82 97 78 97C74 97 71 94 71 90V58Z" fill="#2dd4bf" />
                    <path d="M63 30H93" stroke="#0d9488" strokeWidth="3.2" strokeLinecap="round" />
                  </g>
                </svg>
              </div>
            </div>
          </div>

          {/* Search Bar & Profile Filters */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '14px' }}>
            <div style={{
              background: '#ffffff',
              border: '1.5px solid var(--border)',
              borderRadius: '16px',
              padding: '6px 16px',
              display: 'flex',
              alignItems: 'center',
              boxShadow: '0 2px 10px rgba(0,0,0,0.03)'
            }}>
              <Search size={20} color="var(--text-muted)" style={{ marginRight: '12px', flexShrink: 0 }} />
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  fetchTestsFromApi(q.trim());
                }}
                style={{ flex: 1, display: 'flex', alignItems: 'center' }}
              >
                <input
                  placeholder="Search by test name, profile (e.g. Creatinine, Bilirubin, Uric Acid)..."
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      fetchTestsFromApi(q.trim());
                    }
                  }}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    outline: 'none',
                    width: '100%',
                    fontSize: '14.5px',
                    color: 'var(--text-main)',
                    padding: '10px 0',
                    fontWeight: '500'
                  }}
                />
              </form>
              {q && (
                <button
                  onClick={() => {
                    setQ("");
                    fetchTestsFromApi("");
                  }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                >
                  <X size={18} />
                </button>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Main Grid Content */}
      <div className="container" style={{ padding: '32px 16px 64px 16px' }}>

        {/* Results Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-muted)' }}>
            Showing {totalCount ?? tests.length} {(totalCount ?? tests.length) === 1 ? 'Lab Test' : 'Lab Tests'}
          </span>
        </div>

        {loading ? (
          <div className="all-tests-grid">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className="all-tests-card" style={{ height: '280px' }}>
                <div className="skeleton" style={{ height: '120px' }} />
                <div style={{ padding: '16px' }}>
                  <div className="skeleton skeleton-title" style={{ width: '80%' }} />
                  <div className="skeleton skeleton-text" style={{ width: '50%', marginTop: '8px' }} />
                </div>
              </div>
            ))}
          </div>
        ) : tests.length === 0 ? (
          <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
            <FlaskConical size={48} style={{ opacity: 0.25, marginBottom: '12px' }} />
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-main)', marginBottom: '4px' }}>No lab tests found</h3>
            <p>Try searching for a different test name or clearing your filter.</p>
          </div>
        ) : (
          <div className="all-tests-grid">
            {tests.map((test) => (
              <div className="all-tests-card" key={test.id}>
                <div className="all-tests-card-img-container">
                  <div className="all-tests-card-visual"><LabItemIcon item={test} size={43} /></div>
                  <span className="all-tests-card-tag"><TestTube size={10} /> Certified</span>
                </div>
                <div className="all-tests-card-body">
                  <div className="all-tests-card-title">{test.title}</div>
                  <div className="all-tests-card-sub">{toTitleCase(test.category)}</div>
                  <div className="all-tests-card-footer">
                    <button className="all-tests-card-btn" onClick={() => handleOpenBookingModal(test)}>
                      More Details <ArrowRight size={13} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Server-side Pagination Controls for 10 cards per page */}
        {!loading && tests.length > 0 && (
          <div className="all-tests-pagination-bar">
            <span className="pagination-info-text">
              Showing{" "}
              <strong>{pageStart + 1}</strong>–
              <strong>{pageStart + tests.length}</strong>
              {totalCount != null && <> of <strong>{totalCount}</strong></>} tests
            </span>

            {totalPages > 1 && (
              <div className="pagination-controls">
                <button
                  type="button"
                  className="pagination-btn"
                  disabled={currentPage === 1}
                  onClick={() => goToPage(currentPage - 1)}
                  aria-label="Previous page"
                >
                  <ChevronLeft size={14} /> Prev
                </button>

                <div className="pagination-pages-list">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                    <button
                      key={pageNum}
                      type="button"
                      className={`pagination-num-btn ${currentPage === pageNum ? "active" : ""}`}
                      onClick={() => goToPage(pageNum)}
                      aria-label={`Page ${pageNum}`}
                    >
                      {pageNum}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  className="pagination-btn"
                  disabled={currentPage === totalPages}
                  onClick={() => goToPage(currentPage + 1)}
                  aria-label="Next page"
                >
                  Next <ChevronRight size={14} />
                </button>
              </div>
            )}
          </div>
        )}

      </div>

      {/* ── BOOKING / DETAILS MODAL ── */}
      <Modal
        isOpen={!!selectedItem}
        onClose={handleCloseBookingModal}
        title={
          labBookingStep === 1
            ? (selectedItem?.tests ? "Health Package Details" : "Lab Test Details")
            : labBookingStep === 2
              ? (selectedItem?.tests ? "Schedule Health Package" : "Schedule Lab Test")
              : (selectedItem?.tests ? "Confirm & Pay — Package" : "Confirm & Pay — Lab Test")
        }
        maxWidth={
          labBookingStep === 2
            ? "860px"
            : labBookingStep === 1
              ? "480px"
              : "800px"
        }
        className={
          labBookingStep === 2
            ? "lab-slot-modal-compact"
            : labBookingStep === 1
              ? "lab-details-modal-compact"
              : "lab-payment-modal-compact"
        }
        bodyClassName={
          labBookingStep === 2
            ? "lab-slot-modal-body-compact"
            : labBookingStep === 1
              ? "lab-details-modal-body-compact"
              : "lab-payment-modal-body-compact"
        }
      >
        {/* STEP 1: SHOW DETAILS OF LAB TEST */}
        {labBookingStep === 1 && selectedItem && (
          <div className="lab-test-details-step">
            {/* Header Hero Card */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 14px',
              background: 'linear-gradient(135deg, rgba(46, 102, 110, 0.08) 0%, rgba(46, 102, 110, 0.02) 100%)',
              borderRadius: '12px',
              border: '1px solid var(--border)',
              marginBottom: '10px'
            }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                background: '#ffffff',
                border: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                boxShadow: '0 2px 6px -1px rgba(0,0,0,0.06)'
              }}>
                <LabItemIcon item={selectedItem} size={22} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginBottom: '3px' }}>
                  <span style={{
                    fontSize: '10.5px',
                    fontWeight: '700',
                    textTransform: 'uppercase',
                    letterSpacing: '0.03em',
                    color: 'var(--primary)',
                    background: 'rgba(46, 102, 110, 0.1)',
                    padding: '1px 6px',
                    borderRadius: '4px'
                  }}>
                    {selectedItem.category || "Diagnostic Care"}
                  </span>
                  <span style={{
                    fontSize: '10.5px',
                    fontWeight: '600',
                    color: '#16a34a',
                    background: '#dcfce7',
                    padding: '1px 6px',
                    borderRadius: '4px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '3px'
                  }}>
                    <ShieldCheck size={11} /> Certified Lab
                  </span>
                </div>
                <h3 style={{ fontSize: '15.5px', fontWeight: '800', color: 'var(--text-main)', margin: '0 0 3px 0', lineHeight: 1.25 }}>
                  {selectedItem.title}
                </h3>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                  <span style={{ fontSize: '18px', fontWeight: '800', color: 'var(--primary)' }}>
                    ₹{selectedItem.price?.toLocaleString()}
                  </span>
                  {selectedItem.oldPrice && selectedItem.oldPrice > selectedItem.price && (
                    <span style={{ fontSize: '12px', textDecoration: 'line-through', color: 'var(--text-muted)' }}>
                      ₹{selectedItem.oldPrice?.toLocaleString()}
                    </span>
                  )}
                  {selectedItem.discount && (
                    <span style={{ fontSize: '11px', fontWeight: '700', color: '#16a34a' }}>
                      {selectedItem.discount}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Metrics Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '8px',
              marginBottom: '12px'
            }}>
              <div style={{ padding: '8px 10px', background: '#f8fafc', borderRadius: '10px', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--primary)', fontSize: '10.5px', fontWeight: '600', marginBottom: '1px' }}>
                  <ShieldCheck size={13} /> Fasting
                </div>
                <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-main)' }}>
                  {selectedItem.fasting || "No Fasting Required"}
                </div>
              </div>

              <div style={{ padding: '8px 10px', background: '#f8fafc', borderRadius: '10px', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--primary)', fontSize: '10.5px', fontWeight: '600', marginBottom: '1px' }}>
                  <Clock size={13} /> Report Time
                </div>
                <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-main)' }}>
                  {selectedItem.reportTime || "Within 24 Hours"}
                </div>
              </div>
            </div>

            {/* Subitems / Tests Included (if package) */}
            {selectedItem.subitems && selectedItem.subitems.length > 0 && (
              <div style={{ marginBottom: '12px' }}>
                <h4 style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.03em', color: 'var(--text-muted)', margin: '0 0 6px 0' }}>
                  Tests Included ({selectedItem.subitems.length})
                </h4>
                <div style={{ maxHeight: '120px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '5px', paddingRight: '4px' }}>
                  {selectedItem.subitems.map((sub, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', color: 'var(--text-main)', padding: '5px 8px', background: '#f8fafc', borderRadius: '6px', border: '1px solid var(--border)' }}>
                      <CheckCircle2 size={12} color="#16a34a" style={{ flexShrink: 0 }} />
                      <span>{sub.service_name || sub.name || sub.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Proceed to Select Slots CTA */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid var(--border)' }}>
              <div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em' }}>TOTAL AMOUNT</div>
                <div style={{ fontSize: '17px', fontWeight: '800', color: 'var(--primary)' }}>₹{selectedItem.price?.toLocaleString()}</div>
              </div>

              {/* Direct Confirm Schedule button with Razorpay payment */}
              <button
                type="button"
                className="btn btn-primary"
                disabled={submitting}
                style={{
                  padding: '10px 22px',
                  fontSize: '14px',
                  fontWeight: '700',
                  borderRadius: '10px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: submitting ? 'default' : 'pointer'
                }}
                onClick={() => {
                  if (!user) {
                    handleLoginToBook();
                    return;
                  }
                  confirmBooking();
                }}
              >
                {submitting ? (
                  <>
                    <div className="spinner" style={{ width: '15px', height: '15px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <Calendar size={18} />
                    <span>Confirm Schedule</span>
                  </>
                )}
              </button>

              {/* COMMENTED: Slot Selection CTA (kept for future use) */}
              {/*
              <button
                type="button"
                className="btn btn-primary"
                style={{ padding: '8px 18px', fontSize: '13px', fontWeight: '700', borderRadius: '8px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                onClick={() => setLabBookingStep(2)}
              >
                <span>Select Slot</span>
                <ArrowRight size={15} />
              </button>
              */}
            </div>
          </div>
        )}

        {/* STEP 2: SHOW SLOTS */}
        {/* COMMENTED: Lab slot selection & Add to Cart (kept for future use)
        {labBookingStep === 2 && (
          <div>
            <div className="lab-step2-header-row" style={{ marginBottom: '6px' }}>
              <button
                type="button"
                className="lab-step2-back-btn"
                onClick={() => setLabBookingStep(1)}
              >
                <ChevronLeft size={15} /> Back to Test Details
              </button>
              <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-main)' }}>
                {selectedItem?.title} · ₹{selectedItem?.price?.toLocaleString()}
              </span>
            </div>

            <LabSlotPicker
              onProceed={(slotInfo) => {
                setLabSelectedDate(slotInfo.date);
                setLabSelectedSlot(slotInfo);
                setLabBookingStep(3);
              }}
              onClose={handleCloseBookingModal}
              initialDate={labSelectedDate}
              initialSlot={labSelectedSlot}
              testTitle={selectedItem?.title}
              showAddToCart={true}
              inCartQty={inCartQty}
              onAddToCart={(slotInfo) => {
                setLabSelectedDate(slotInfo.date);
                setLabSelectedSlot(slotInfo);
                const itemWithSlot = {
                  ...selectedItem,
                  slotDate: slotInfo.date,
                  slotTime: slotInfo.time || slotInfo.label,
                  slotLabel: slotInfo.label || slotInfo.time,
                  slotId: slotInfo.id || slotInfo.slot_id || null,
                };
                addLabCartItem(itemWithSlot, 1);
              }}
              onUpdateCartQty={(delta) => updateLabCartQty(getLabItemKey(selectedItem), delta)}
              onRemoveFromCart={() => removeLabCartItem(getLabItemKey(selectedItem))}
              onViewCart={() => {
                handleCloseBookingModal();
                go("/labs/cart");
              }}
              onSlotChange={(slotInfo) => {
                setLabSelectedDate(slotInfo.date);
                setLabSelectedSlot(slotInfo);
                if (inCartQty > 0) {
                  assignLabSlot(getLabItemKey(selectedItem), slotInfo);
                }
              }}
            />
          </div>
        )}
        */}

        {/* STEP 3: CONFIRM & PAY - 2-COLUMN REVIEW DESIGN */}
        {labBookingStep === 3 && (
          <div className="lab-review-grid">
            {/* Left Column: Lab Test & Patient Details */}
            <div className="review-col-main">
              {/* Lab Test Information Card */}
              <section className="review-card">
                <div className="review-card-header">
                  <div className="review-header-left">
                    <div className="review-header-avatar" aria-hidden="true" style={{ background: 'rgba(46, 102, 110, 0.1)', color: 'var(--primary)' }}>
                      <FlaskConical size={18} />
                    </div>
                    <div>
                      <h3 className="review-card-title">
                        {selectedItem?.tests ? "Health Package Information" : "Lab Test Information"}
                      </h3>
                      <p className="review-card-subtitle">Review scheduled test & sample details</p>
                    </div>
                  </div>
                  <span className="hospital-status-pill">
                    <span className="hospital-pulse-dot" /> Verified Test
                  </span>
                </div>

                {/* Test Details Row */}
                <div className="review-doctor-box">
                  <div className="review-doc-details">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                      <span className="review-doc-name">{selectedItem?.title}</span>
                      <span style={{ fontSize: '15px', fontWeight: '800', color: 'var(--primary)' }}>
                        ₹{selectedItem?.price?.toLocaleString()}
                      </span>
                    </div>
                    <div className="review-doc-badge-row" style={{ marginTop: '3px' }}>
                      <span className="review-spec-pill">
                        <FlaskConical size={11} /> {selectedItem?.category || (selectedItem?.tests ? "Health Package" : "Diagnostic Care")}
                      </span>
                      <span className="review-spec-pill" style={{ background: '#f0fdf4', color: '#16a34a', borderColor: '#bbf7d0' }}>
                        <Clock size={11} /> Reports in {selectedItem?.reportTime || "24 Hours"}
                      </span>
                      {selectedItem?.fasting && (
                        <span className="review-spec-pill" style={{ background: '#eff6ff', color: '#2563eb', borderColor: '#bfdbfe' }}>
                          <ShieldCheck size={11} /> {selectedItem.fasting}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Appointment Timing & Consultation Grid */}
                <div className="review-info-grid">
                  <div className="review-info-item">
                    <span className="review-info-label">
                      <Calendar size={11} /> Date
                    </span>
                    <span
                      className="review-info-value"
                      title={labSelectedDate instanceof Date
                        ? labSelectedDate.toLocaleDateString("en-GB", { weekday: "short", day: "2-digit", month: "short", year: "numeric" })
                        : String(labSelectedDate || "—")}
                    >
                      {labSelectedDate instanceof Date
                        ? labSelectedDate.toLocaleDateString("en-GB", { weekday: "short", day: "2-digit", month: "short", year: "numeric" })
                        : String(labSelectedDate || "—")}
                    </span>
                  </div>

                  <div className="review-info-item">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span className="review-info-label">
                        <Clock size={11} /> Time Slot
                      </span>
                      <button
                        type="button"
                        onClick={() => setLabBookingStep(2)}
                        style={{
                          background: 'none',
                          border: 'none',
                          padding: 0,
                          fontSize: '11px',
                          fontWeight: '700',
                          color: 'var(--primary)',
                          cursor: 'pointer',
                          textDecoration: 'underline'
                        }}
                        title="Change selected slot"
                      >
                        Change
                      </button>
                    </div>
                    <span
                      className="review-info-value review-slot-pill"
                      title={labSelectedSlot?.label || labSelectedSlot?.time || labSelectedSlot?.time_range || "Selected Slot"}
                    >
                      {labSelectedSlot?.label || labSelectedSlot?.time || labSelectedSlot?.time_range || "Selected Slot"}
                    </span>
                  </div>
                </div>
              </section>

              {/* Patient Information Card */}
              <section className="review-card">
                <div className="review-card-header">
                  <div className="review-header-left">
                    <div className="review-header-avatar avatar-slate" aria-hidden="true">
                      <User size={18} />
                    </div>
                    <div>
                      <h3 className="review-card-title">Patient Information</h3>
                    </div>
                  </div>
                </div>

                <div className="review-patient-grid">
                  <div className="review-patient-item">
                    <span className="review-patient-label">
                      <User size={12} /> Patient Name
                    </span>
                    <span className="review-patient-value">
                      {user?.name || (user ? "Valued Patient" : "Guest Patient")}
                    </span>
                  </div>

                  <div className="review-patient-item">
                    <span className="review-patient-label">
                      <Smartphone size={12} /> Contact Number
                    </span>
                    <span className="review-patient-value">
                      {user?.mobile_number || user?.mobile || user?.phone || (user ? "Not Provided" : "Please sign in")}
                    </span>
                  </div>

                  {user?.email && (
                    <div className="review-patient-item" style={{ gridColumn: 'span 2' }}>
                      <span className="review-patient-label">
                        <Mail size={12} /> Email Address
                      </span>
                      <span className="review-patient-value" style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {user.email}
                      </span>
                    </div>
                  )}
                </div>
              </section>
            </div>

            {/* Right Column: Wallet & Payment Breakdown */}
            <div className="review-col-side">
              {/* Wallet Balance Card */}
              <section className="review-card">
                <div className="review-wallet-balance-row">
                  <div className="review-header-left">
                    <div className="review-header-avatar avatar-green" aria-hidden="true">
                      <Wallet size={17} />
                    </div>
                    <div>
                      <h3 className="review-card-title" style={{ fontSize: '13.6px' }}>Wallet Balance</h3>
                      <p className="review-card-subtitle">Available to redeem</p>
                    </div>
                  </div>
                  <span className="wallet-balance-display">
                    {loadingWallet ? "..." : `₹${walletBalance}`}
                  </span>
                </div>

                <div className="wallet-toggle-row">
                  <span className="wallet-toggle-label">Apply wallet balance</span>
                  <div
                    role="switch"
                    aria-checked={applyWallet}
                    aria-disabled={submitting || walletBalance <= 0}
                    tabIndex={walletBalance > 0 && !submitting ? 0 : -1}
                    onClick={() => { if (walletBalance > 0 && !submitting) setApplyWallet(!applyWallet); }}
                    onKeyDown={(e) => {
                      if ((e.key === "Enter" || e.key === " ") && walletBalance > 0 && !submitting) {
                        e.preventDefault();
                        setApplyWallet(!applyWallet);
                      }
                    }}
                    className={`wallet-switch-track ${applyWallet ? "active" : ""} ${walletBalance <= 0 ? "disabled" : ""}`}
                    style={submitting ? { opacity: 0.6, cursor: 'default' } : undefined}
                    title={walletBalance <= 0 ? "Zero balance in wallet" : "Toggle wallet balance"}
                  >
                    <div className="wallet-switch-thumb" />
                  </div>
                </div>

                {applyWallet && (
                  <div className="wallet-deduction-box">
                    <div className="wallet-input-row">
                      <div className="wallet-input-wrapper">
                        <span>₹</span>
                        <input
                          type="number"
                          className="wallet-amount-input"
                          value={walletAppliedAmount}
                          onChange={handleWalletInputChange}
                          disabled={submitting}
                          min="0"
                          max={maxWalletApplicable}
                          aria-label="Wallet amount to apply"
                        />
                      </div>
                      <span className="wallet-max-chip">Max ₹{maxWalletApplicable}</span>
                    </div>
                    <span className="wallet-deduction-hint">
                      <Check size={12} /> ₹{walletAppliedAmount} will be deducted from total payable
                    </span>
                  </div>
                )}
              </section>

              {/* Payment Summary & Checkout Card */}
              <section className="review-card review-payment-summary-card">
                <div>
                  <div className="review-card-header">
                    <div className="review-header-left">
                      <div className="review-header-avatar avatar-teal" aria-hidden="true">
                        <CreditCard size={17} />
                      </div>
                      <div>
                        <h3 className="review-card-title" style={{ fontSize: '13.6px' }}>Payment Summary</h3>
                        <p className="review-card-subtitle">Transparent fee breakdown</p>
                      </div>
                    </div>
                  </div>

                  <div className="review-payment-breakdown">
                    <div className="payment-line-item">
                      <span>{selectedItem?.tests ? "Package Fee" : "Test Fee"}</span>
                      <span className="payment-line-value">₹{selectedItem?.price?.toLocaleString()}</span>
                    </div>

                    {applyWallet && walletAppliedAmount > 0 && (
                      <div className="payment-line-item discount">
                        <span>Wallet Discount</span>
                        <span className="payment-line-value">- ₹{walletAppliedAmount.toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ marginTop: 'auto' }}>
                  <div className="payment-total-box">
                    <span className="payment-total-label">Total Payable</span>
                    <span className="payment-total-amount">
                      ₹{Math.max(0, (selectedItem?.price || 0) - (applyWallet ? walletAppliedAmount : 0)).toLocaleString()}
                    </span>
                  </div>

                  <div className="review-actions-row">
                    <button
                      type="button"
                      onClick={() => setLabBookingStep(2)}
                      disabled={submitting}
                      className="btn-review-back"
                      style={submitting ? { opacity: 0.6, cursor: 'default' } : undefined}
                    >
                      <ChevronLeft size={16} /> Back
                    </button>

                    {!user ? (
                      <button
                        type="button"
                        onClick={handleLoginToBook}
                        className="btn-review-confirm"
                      >
                        <User size={16} /> Sign in to Continue <ArrowRight size={16} />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => confirmBooking(labSelectedSlot)}
                        disabled={submitting}
                        className="btn-review-confirm"
                        aria-busy={submitting}
                        style={submitting ? { cursor: 'default', boxShadow: 'none' } : undefined}
                      >
                        {submitting ? (
                          <>
                            <div className="spinner" style={{ width: '14px', height: '14px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                            <span>Processing...</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 size={16} />
                            <span>
                              {((selectedItem?.price || 0) - (applyWallet ? walletAppliedAmount : 0)) > 0
                                ? `Pay ₹${Math.max(0, (selectedItem?.price || 0) - (applyWallet ? walletAppliedAmount : 0)).toLocaleString()} & Confirm`
                                : "Confirm Booking"}
                            </span>
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', fontSize: '10.5px', color: 'var(--text-muted)', marginTop: '8px' }}>
                    <ShieldCheck size={12} color="var(--primary)" />
                    <span>100% Secure Checkout powered by Razorpay. NABH Certified.</span>
                  </div>
                </div>
              </section>
            </div>
          </div>
        )}
      </Modal>

      {/* Floating Lab Cart Button */}
      {/* COMMENTED: Floating cart button (kept for future use)
      {labCartCount > 0 && (
        <button
          type="button"
          onClick={() => go("/labs/cart")}
          className="lab-floating-cart-btn"
          title="View Lab Cart"
          aria-label={`View Lab Cart (${labCartCount} items)`}
        >
          <ShoppingCart size={16} />
          <span>Cart ({labCartCount})</span>
        </button>
      )}
      */}

    </main>
  );
}
