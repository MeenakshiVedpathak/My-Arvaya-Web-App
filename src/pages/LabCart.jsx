import { useState, useEffect, useRef } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import {
  FlaskConical,
  Sparkles,
  ShieldCheck,
  Clock,
  Zap,
  CheckCircle2,
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ArrowLeft,
  Calendar,
  User,
  Check,
  AlertCircle,
  AlertTriangle,
  FileText,
  ChevronDown,
  ChevronUp,
  MapPin,
  CreditCard,
  Building2,
  Home
} from "lucide-react";
import { useLabCart, getLabItemKey } from "../utils/labCart";
import { useAuth } from "../context/AuthContext";
import { useBooking } from "../context/BookingContext";
import Modal from "../components/common/Modal";
import LabSlotPicker from "../components/labs/LabSlotPicker";
import LabItemIcon from "../components/labs/LabItemIcon";
import {
  getWalletAmount,
  createLabOrder,
  verifyLabPayment,
  loadRazorpayScript
} from "../services/dataService";

export default function LabCart() {
  const go = useNavigate();
  const location = useLocation();
  const { user, openLoginModal } = useAuth();
  const {
    setBookingType,
    setLabPackage,
    setLabVisitType,
    setDate,
    setSlot,
    setBookingId,
    globalLocation
  } = useBooking();

  const {
    cart,
    totalCount,
    totalPrice,
    updateQty,
    removeFromCart,
    assignSlot,
    clearCart
  } = useLabCart();

  // Slot modal target: null | "ALL" | item object
  const [slotPickerTarget, setSlotPickerTarget] = useState(null);

  // Expanded subitems for package cards
  const [expandedPackages, setExpandedPackages] = useState({});

  // Wallet
  const [walletBalance, setWalletBalance] = useState(0);
  const [applyWallet, setApplyWallet] = useState(false);
  const [walletAppliedAmount, setWalletAppliedAmount] = useState(0);
  const [loadingWallet, setLoadingWallet] = useState(false);

  // Submitting
  const [submitting, setSubmitting] = useState(false);
  const submitLockRef = useRef(false);

  // Clear cart warning popover
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const clearPopoverRef = useRef(null);

  useEffect(() => {
    if (!showClearConfirm) return;
    const handleClickOutside = (e) => {
      if (clearPopoverRef.current && !clearPopoverRef.current.contains(e.target)) {
        setShowClearConfirm(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setShowClearConfirm(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [showClearConfirm]);

  // Fetch Wallet Balance
  useEffect(() => {
    if (!user) return;
    setLoadingWallet(true);
    const patientId = user?.id || user?.user_id || user?.patient_id || "";
    getWalletAmount(patientId)
      .then((res) => {
        let wData = Array.isArray(res) ? res[0] : res;
        if (typeof wData === "number" || typeof wData === "string") {
          setWalletBalance(parseFloat(wData) || 0);
        } else if (wData && typeof wData === "object") {
          setWalletBalance(
            parseFloat(
              wData.total_amount ||
                wData.balance ||
                wData.amount ||
                wData.wallet_balance ||
                wData.wallet_amount ||
                wData.walletBalance ||
                wData.total ||
                0
            )
          );
        }
      })
      .catch((err) => {
        console.error("Failed to fetch wallet balance:", err);
        setWalletBalance(0);
      })
      .finally(() => {
        setLoadingWallet(false);
      });
  }, [user]);

  const maxWalletApplicable = Math.min(walletBalance, totalPrice);

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

  const togglePackageExpand = (id) => {
    setExpandedPackages((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Check if all items have slots
  const allItemsHaveSlots = cart.length > 0 && cart.every((c) => c.slotDate && c.slotTime);

  // Format Date for display
  const formatSlotDate = (d) => {
    if (!d) return "";
    const dateObj = d instanceof Date ? d : new Date(d);
    if (isNaN(dateObj.getTime())) return String(d);
    return dateObj.toLocaleDateString("en-GB", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  };

  // Checkout handling
  const handleCheckout = async () => {
    if (!user) {
      openLoginModal(location.pathname);
      return;
    }

    if (cart.length === 0) return;

    // If any item doesn't have slot, prompt for slot
    const firstMissingSlot = cart.find((c) => !c.slotDate || !c.slotTime);
    if (firstMissingSlot) {
      setSlotPickerTarget("ALL");
      return;
    }

    if (submitLockRef.current) return;
    submitLockRef.current = true;
    setSubmitting(true);

    try {
      const patient_id = user?.id || user?.user_id || user?.patient_id || "";
      const entitylocation =
        globalLocation?.location_key ||
        globalLocation?.entitylocation ||
        globalLocation?.key ||
        "location7";

      const registrationdate = (() => {
        const raw =
          user?.created_at ||
          user?.registration_date ||
          user?.registrationdate ||
          new Date().toISOString();
        const d = new Date(raw);
        if (isNaN(d.getTime()))
          return new Date().toISOString().slice(0, 10).replace(/-/g, "");
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const dd = String(d.getDate()).padStart(2, "0");
        return `${yyyy}${mm}${dd}`;
      })();

      const tests = [];
      cart.forEach((item) => {
        if (item.subitems && Array.isArray(item.subitems) && item.subitems.length > 0) {
          item.subitems.forEach((sub) => {
            tests.push({
              key: sub.service_key || sub.id || sub.key,
              Name: sub.service_name || sub.name || sub.title
            });
          });
        } else {
          tests.push({
            key: item.service_key || item.id || item.key,
            Name: item.service_name || item.name || item.title
          });
        }
      });

      const firstItemSlot = cart[0];
      const payload = {
        entitykey: "secure-hospitals",
        entitylocation: entitylocation,
        patient_id: patient_id,
        slot_id: firstItemSlot.slotId || null,
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
      setLabPackage(cart[0]?.rawItem || cart[0]);
      setLabVisitType("home");
      setDate(new Date(firstItemSlot.slotDate));
      setSlot(firstItemSlot.slotLabel || firstItemSlot.slotTime || "10:00 AM");

      const amountToPay = Math.max(0, totalPrice - (applyWallet ? walletAppliedAmount : 0));

      if (amountToPay <= 0) {
        const bookingId =
          result.order_id ||
          result.bookingId ||
          result.razorpay_order_id ||
          "LAB" + Math.floor(Math.random() * 100000000);
        setBookingId(bookingId);
        clearCart();
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
        description: `Lab Tests Booking (${cart.length} items)`,
        order_id: result.razorpay_order_id,
        handler: async function (response) {
          try {
            await verifyLabPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              ...payload
            });
            const bookingId =
              result.razorpay_order_id ||
              result.bookingId ||
              result.order_id ||
              "LAB" + Math.floor(Math.random() * 100000000);
            setBookingId(bookingId);
            clearCart();
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
          contact: user?.mobile || user?.phone || ""
        },
        theme: {
          color: "#2e666e"
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
      console.error("Cart booking failed:", err);
      if (err.status === 409) {
        alert(err.message || "Slot already booked");
      } else {
        alert("Booking failed. Please try again.");
      }
      submitLockRef.current = false;
      setSubmitting(false);
    }
  };

  const finalPayable = Math.max(0, totalPrice - (applyWallet ? walletAppliedAmount : 0));

  return (
    <main className="page lab-cart-page" style={{ padding: 0, minHeight: "100vh", background: "var(--bg-app)" }}>
      {/* ── BANNER HEADER MATCHING IMAGE ── */}
      <header className="wallet-top-shell">
        <div className="container">
          <div className="wallet-hero-banner">
            <div className="wallet-hero-content">
              <div className="wallet-hero-icon" aria-hidden="true">
                <FlaskConical size={26} />
              </div>

              <div>
                <div className="wallet-hero-pill-tag">
                  <Sparkles size={13} /> SeCURE Arvaya Diagnostics &middot; Lab Tests Cart
                </div>

                <h1 className="wallet-hero-title">
                  Review your lab tests, every step of the way.
                </h1>
                <p className="wallet-hero-subtitle">
                  Manage your selected diagnostic tests, schedule sample collection, and book seamlessly.
                </p>

                <div className="wallet-hero-badges">
                  <span className="wallet-hero-badge">
                    <Zap size={14} color="#fbbf24" /> Fast Reports (24h)
                  </span>
                  <span className="wallet-hero-badge">
                    <ShieldCheck size={14} color="#2dd4bf" /> Certified Partner Labs
                  </span>
                  <span className="wallet-hero-badge">
                    <Clock size={14} color="#60a5fa" /> Flexible Slot Scheduling
                  </span>
                </div>
              </div>
            </div>

            <div className="wallet-hero-img-col">
              <div className="wallet-hero-img-wrap" aria-hidden="true">
                <img src="/images/lab-tests.png" alt="Lab Cart" className="wallet-hero-photo" />
                <div className="wallet-hero-stat-badge">
                  <CheckCircle2 size={14} />
                  <span>
                    {totalCount} {totalCount === 1 ? "test" : "tests"} in cart
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ── MAIN CONTENT ── */}
      <div className="container" style={{ paddingTop: "24px", paddingBottom: "50px" }}>
        {cart.length === 0 ? (
          /* ── EMPTY CART STATE ── */
          <div
            style={{
              background: "#ffffff",
              borderRadius: "24px",
              border: "1px solid var(--border)",
              padding: "60px 24px",
              textAlign: "center",
              boxShadow: "0 10px 30px rgba(0,0,0,0.04)",
              maxWidth: "600px",
              margin: "0 auto"
            }}
          >
            <div
              style={{
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                background: "rgba(46, 102, 110, 0.08)",
                color: "var(--primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 20px"
              }}
            >
              <ShoppingCart size={40} />
            </div>
            <h2 style={{ fontSize: "22px", fontWeight: "800", color: "#0f172a", marginBottom: "8px" }}>
              Your Lab Cart is Empty
            </h2>
            <p style={{ fontSize: "14px", color: "#64748b", maxWidth: "420px", margin: "0 auto 24px", lineHeight: 1.5 }}>
              You haven't added any diagnostic blood tests or health packages yet.
            </p>
            <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
              <Link
                to="/labs/all-tests"
                className="btn btn-primary"
                style={{ borderRadius: "9999px", padding: "10px 24px", fontWeight: "700" }}
              >
                Browse All Tests
              </Link>
              <Link
                to="/labs"
                className="btn btn-secondary"
                style={{ borderRadius: "9999px", padding: "10px 22px", fontWeight: "600" }}
              >
                Explore Lab Packages
              </Link>
            </div>
          </div>
        ) : (
          /* ── POPULATED CART: 2-COLUMN RESPONSIVE GRID ── */
          <div className="lab-cart-layout-grid">
            {/* LEFT COLUMN: Test Items & Slot Assignment */}
            <div className="lab-cart-items-col">
              {/* Header Action Bar */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "14px",
                  padding: "4px 2px"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <h2 style={{ fontSize: "18px", fontWeight: "800", color: "#0f172a", margin: 0 }}>
                    Selected Tests ({totalCount})
                  </h2>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <Link
                    to="/labs/all-tests"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "5px",
                      fontSize: "12.5px",
                      fontWeight: "700",
                      color: "var(--primary)",
                      textDecoration: "none",
                      padding: "6px 12px",
                      borderRadius: "9999px",
                      background: "rgba(46, 102, 110, 0.08)",
                      transition: "all 0.15s ease"
                    }}
                  >
                    <Plus size={14} /> Add More Tests
                  </Link>
                  {/* Clear All with Custom Warning Popover */}
                  <div style={{ position: "relative" }} ref={clearPopoverRef}>
                    <button
                      type="button"
                      onClick={() => setShowClearConfirm((prev) => !prev)}
                      aria-expanded={showClearConfirm}
                      aria-haspopup="dialog"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "5px",
                        fontSize: "12.5px",
                        fontWeight: "600",
                        color: showClearConfirm ? "#b91c1c" : "#ef4444",
                        background: showClearConfirm ? "#fee2e2" : "transparent",
                        border: "1px solid",
                        borderColor: showClearConfirm ? "#fca5a5" : "transparent",
                        borderRadius: "8px",
                        cursor: "pointer",
                        padding: "6px 10px",
                        transition: "all 0.15s ease"
                      }}
                      title="Clear all tests from cart"
                    >
                      <Trash2 size={14} /> Clear All
                    </button>

                    {showClearConfirm && (
                      <div
                        className="lab-clear-cart-popover"
                        role="dialog"
                        aria-label="Confirm clear cart"
                      >
                        <div style={{ display: "flex", alignItems: "flex-start", gap: "10px", marginBottom: "12px" }}>
                          <div
                            style={{
                              width: "36px",
                              height: "36px",
                              borderRadius: "10px",
                              background: "#fef2f2",
                              color: "#ef4444",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0,
                              border: "1px solid #fee2e2"
                            }}
                          >
                            <AlertTriangle size={18} />
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <h4
                              style={{
                                fontSize: "13.5px",
                                fontWeight: "800",
                                color: "#0f172a",
                                margin: "0 0 3px 0",
                                lineHeight: 1.3
                              }}
                            >
                              Clear all tests?
                            </h4>
                            <p
                              style={{
                                fontSize: "11.5px",
                                color: "#64748b",
                                margin: 0,
                                lineHeight: 1.45
                              }}
                            >
                              Are you sure you want to remove all {totalCount} {totalCount === 1 ? "test" : "tests"} from your cart? This action cannot be undone.
                            </p>
                          </div>
                        </div>

                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "flex-end",
                            gap: "8px",
                            paddingTop: "10px",
                            borderTop: "1px solid #f1f5f9"
                          }}
                        >
                          <button
                            type="button"
                            onClick={() => setShowClearConfirm(false)}
                            style={{
                              padding: "6px 12px",
                              fontSize: "12px",
                              fontWeight: "600",
                              color: "#475569",
                              background: "#f8fafc",
                              border: "1px solid #e2e8f0",
                              borderRadius: "6px",
                              cursor: "pointer",
                              transition: "all 0.15s ease"
                            }}
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              clearCart();
                              setShowClearConfirm(false);
                            }}
                            style={{
                              padding: "6px 14px",
                              fontSize: "12px",
                              fontWeight: "700",
                              color: "#ffffff",
                              background: "#ef4444",
                              border: "none",
                              borderRadius: "6px",
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px",
                              boxShadow: "0 2px 6px rgba(239, 68, 68, 0.25)",
                              transition: "all 0.15s ease"
                            }}
                          >
                            <Trash2 size={12} /> Yes, Clear All
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Global Schedule All Option */}
              <div
                style={{
                  background: "linear-gradient(135deg, rgba(46, 102, 110, 0.08) 0%, rgba(46, 102, 110, 0.02) 100%)",
                  border: "1.5px dashed rgba(46, 102, 110, 0.3)",
                  borderRadius: "16px",
                  padding: "14px 18px",
                  marginBottom: "18px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "12px",
                  flexWrap: "wrap"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "10px",
                      background: "#fff",
                      color: "var(--primary)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "0 2px 6px rgba(0,0,0,0.06)"
                    }}
                  >
                    <Calendar size={18} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: "14px", fontWeight: "700", color: "#0f172a", margin: "0 0 2px 0" }}>
                      Book All Tests Together                    </h4>
                    <p style={{ fontSize: "12px", color: "#64748b", margin: 0 }}>
                      Schedule sample collection for all tests in a single visit
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSlotPickerTarget("ALL")}
                  style={{
                    background: "var(--primary)",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "9999px",
                    padding: "7.5px 16px",
                    fontSize: "12.5px",
                    fontWeight: "700",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    boxShadow: "0 2px 8px rgba(46, 102, 110, 0.2)"
                  }}
                >
                  <Calendar size={14} />
                  <span>{allItemsHaveSlots ? "Change All Slots" : "Schedule All Together"}</span>
                  <ArrowRight size={13} />
                </button>
              </div>

              {/* Items Cards List */}
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                {cart.map((item) => {
                  const itemKey = getLabItemKey(item);
                  const isExpanded = !!expandedPackages[itemKey];
                  const hasSlot = !!(item.slotDate && item.slotTime);

                  return (
                    <div
                      key={itemKey}
                      style={{
                        background: "#ffffff",
                        borderRadius: "18px",
                        border: "1px solid var(--border)",
                        boxShadow: "0 4px 16px rgba(0,0,0,0.03)",
                        padding: "16px 18px",
                        transition: "all 0.2s ease"
                      }}
                    >
                      {/* Top Header Row */}
                      <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", marginBottom: "12px" }}>
                        <div
                          style={{
                            width: "44px",
                            height: "44px",
                            borderRadius: "12px",
                            background: "#ffffff",
                            border: "1px solid var(--border)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                            boxShadow: "0 2px 6px rgba(0,0,0,0.04)"
                          }}
                        >
                          <LabItemIcon item={item.rawItem || item} size={22} />
                        </div>

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap", marginBottom: "4px" }}>
                            <span
                              style={{
                                fontSize: "10.5px",
                                fontWeight: "700",
                                textTransform: "uppercase",
                                letterSpacing: "0.03em",
                                color: "var(--primary)",
                                background: "rgba(46, 102, 110, 0.1)",
                                padding: "2px 7px",
                                borderRadius: "4px"
                              }}
                            >
                              {item.category || "Diagnostic Care"}
                            </span>
                            <span
                              style={{
                                fontSize: "10.5px",
                                fontWeight: "600",
                                color: "#16a34a",
                                background: "#dcfce7",
                                padding: "2px 7px",
                                borderRadius: "4px",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "3px"
                              }}
                            >
                              <ShieldCheck size={11} /> Certified Lab
                            </span>
                          </div>

                          <h3
                            style={{
                              fontSize: "16px",
                              fontWeight: "800",
                              color: "#0f172a",
                              margin: "0 0 4px 0",
                              lineHeight: 1.3
                            }}
                          >
                            {item.title}
                          </h3>

                          {/* Quick details */}
                          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", fontSize: "12px", color: "#64748b" }}>
                            <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                              <ShieldCheck size={13} color="var(--primary)" /> {item.fasting || "No Fasting Required"}
                            </span>
                            <span>•</span>
                            <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                              <Clock size={13} color="var(--primary)" /> {item.reportTime || "24 Hours"}
                            </span>
                          </div>
                        </div>

                        {/* Price Column */}
                        <div style={{ textAlign: "right", flexShrink: 0 }}>
                          <div style={{ fontSize: "17px", fontWeight: "800", color: "var(--primary)" }}>
                            ₹{((item.price || 0) * (item.qty || 1)).toLocaleString()}
                          </div>
                          {item.qty > 1 && (
                            <div style={{ fontSize: "11px", color: "#64748b" }}>
                              ₹{item.price?.toLocaleString()} each
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Package Subitems Accordion (if package) */}
                      {item.subitems && item.subitems.length > 0 && (
                        <div style={{ marginBottom: "12px", background: "#f8fafc", borderRadius: "10px", padding: "8px 12px", border: "1px solid #f1f5f9" }}>
                          <button
                            type="button"
                            onClick={() => togglePackageExpand(itemKey)}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              width: "100%",
                              background: "none",
                              border: "none",
                              padding: 0,
                              cursor: "pointer",
                              fontSize: "12px",
                              fontWeight: "700",
                              color: "var(--primary)"
                            }}
                          >
                            <span>Includes {item.subitems.length} diagnostic tests</span>
                            {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                          </button>

                          {isExpanded && (
                            <div style={{ marginTop: "8px", display: "flex", flexDirection: "column", gap: "4px" }}>
                              {item.subitems.map((sub, i) => (
                                <div key={i} style={{ fontSize: "11.5px", color: "#334155", display: "flex", alignItems: "center", gap: "6px" }}>
                                  <CheckCircle2 size={12} color="#16a34a" />
                                  <span>{sub.service_name || sub.name || sub.title}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Bottom Controls Row: Stepper, Delete, and Slot Selection Button */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          paddingTop: "12px",
                          borderTop: "1px solid #f1f5f9",
                          gap: "10px",
                          flexWrap: "wrap"
                        }}
                      >
                        {/* Left: Stepper & Delete Button */}
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <div className="lab-cart-qty-stepper">
                            <button
                              type="button"
                              className="lab-cart-qty-btn"
                              onClick={() => updateQty(itemKey, -1)}
                              aria-label="Decrease quantity"
                              title="Decrease quantity"
                            >
                              <Minus size={13} strokeWidth={2.5} />
                            </button>
                            <span className="lab-cart-qty-number">{item.qty || 1}</span>
                            <button
                              type="button"
                              className="lab-cart-qty-btn"
                              onClick={() => updateQty(itemKey, 1)}
                              aria-label="Increase quantity"
                              title="Increase quantity"
                            >
                              <Plus size={13} strokeWidth={2.5} />
                            </button>
                          </div>

                          <button
                            type="button"
                            className="lab-cart-trash-btn"
                            onClick={() => removeFromCart(itemKey)}
                            title="Remove from cart"
                            aria-label="Remove from cart"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>

                        {/* Right: Slot Selection Button with Proper Design */}
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          {hasSlot ? (
                            <div
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "8px",
                                background: "#ecfdf5",
                                border: "1px solid #a7f3d0",
                                padding: "5px 12px",
                                borderRadius: "9999px"
                              }}
                            >
                              <span style={{ fontSize: "12px", fontWeight: "700", color: "#065f46", display: "inline-flex", alignItems: "center", gap: "5px" }}>
                                <Calendar size={13} />
                                <span>{formatSlotDate(item.slotDate)} &middot; {item.slotLabel || item.slotTime}</span>
                              </span>
                              <button
                                type="button"
                                onClick={() => setSlotPickerTarget(item)}
                                style={{
                                  background: "none",
                                  border: "none",
                                  color: "var(--primary)",
                                  fontSize: "11.5px",
                                  fontWeight: "700",
                                  cursor: "pointer",
                                  textDecoration: "underline",
                                  padding: 0
                                }}
                              >
                                Change
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              className="lab-modal-select-slot-btn"
                              style={{ padding: "6px 15px", fontSize: "12.5px" }}
                              onClick={() => setSlotPickerTarget(item)}
                            >
                              <Calendar size={14} />
                              <span>Select Slot</span>
                              <ArrowRight size={13} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* RIGHT COLUMN: Order Summary & Checkout Card */}
            <div className="lab-cart-summary-col">
              <div
                style={{
                  background: "#ffffff",
                  borderRadius: "20px",
                  border: "1px solid var(--border)",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.05)",
                  padding: "20px 22px",
                  position: "sticky",
                  top: "20px"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
                  <CreditCard size={18} color="var(--primary)" />
                  <h3 style={{ fontSize: "16px", fontWeight: "800", color: "#0f172a", margin: 0 }}>
                    Price Summary
                  </h3>
                </div>

                {/* Price Breakdown */}
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", paddingBottom: "14px", borderBottom: "1px solid var(--border)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", color: "#64748b" }}>
                    <span>Total Test Fee ({totalCount} items)</span>
                    <span style={{ fontWeight: "700", color: "#0f172a" }}>₹{totalPrice.toLocaleString()}</span>
                  </div>
                  {/* <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", color: "#64748b" }}>
                    <span>Home Sample Collection</span>
                    <span style={{ fontWeight: "700", color: "#16a34a" }}>FREE</span>
                  </div> */}
                </div>

                {/* Wallet Balance Section */}
                {user && (
                  <div
                    style={{
                      background: "#f8fafc",
                      borderRadius: "14px",
                      border: "1px solid var(--border)",
                      padding: "12px 14px",
                      margin: "14px 0"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                      <div>
                        <div style={{ fontSize: "12.5px", fontWeight: "700", color: "#0f172a" }}>Wallet Balance</div>
                        <div style={{ fontSize: "11px", color: "#64748b" }}>Available to redeem</div>
                      </div>
                      <div style={{ fontSize: "14px", fontWeight: "800", color: "var(--primary)" }}>
                        ₹{walletBalance.toLocaleString()}
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: applyWallet ? "8px" : "0" }}>
                      <span style={{ fontSize: "12px", color: "#334155", fontWeight: "600" }}>Apply wallet balance</span>
                      <label style={{ position: "relative", display: "inline-block", width: "36px", height: "20px" }}>
                        <input
                          type="checkbox"
                          checked={applyWallet}
                          onChange={(e) => setApplyWallet(e.target.checked)}
                          disabled={walletBalance <= 0}
                          style={{ opacity: 0, width: 0, height: 0 }}
                        />
                        <span
                          style={{
                            position: "absolute",
                            cursor: walletBalance > 0 ? "pointer" : "not-allowed",
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundColor: applyWallet ? "var(--primary)" : "#cbd5e1",
                            borderRadius: "20px",
                            transition: "0.2s"
                          }}
                        >
                          <span
                            style={{
                              position: "absolute",
                              content: '""',
                              height: "14px",
                              width: "14px",
                              left: applyWallet ? "19px" : "3px",
                              bottom: "3px",
                              backgroundColor: "white",
                              borderRadius: "50%",
                              transition: "0.2s"
                            }}
                          />
                        </span>
                      </label>
                    </div>

                    {applyWallet && (
                      <div style={{ marginTop: "8px", paddingTop: "8px", borderTop: "1px dashed #cbd5e1" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
                          <div style={{ position: "relative", flex: 1 }}>
                            <span style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", fontSize: "12px", fontWeight: "700", color: "#64748b" }}>₹</span>
                            <input
                              type="number"
                              min="0"
                              max={maxWalletApplicable}
                              value={walletAppliedAmount}
                              onChange={handleWalletInputChange}
                              style={{
                                width: "100%",
                                padding: "6px 10px 6px 24px",
                                fontSize: "13px",
                                fontWeight: "700",
                                border: "1px solid var(--border)",
                                borderRadius: "8px",
                                outline: "none"
                              }}
                            />
                          </div>
                          <span style={{ fontSize: "11px", fontWeight: "600", color: "#16a34a", background: "#dcfce7", padding: "4px 8px", borderRadius: "6px" }}>
                            Max ₹{maxWalletApplicable}
                          </span>
                        </div>
                        <div style={{ fontSize: "11px", color: "var(--primary)", marginTop: "6px", display: "flex", alignItems: "center", gap: "4px" }}>
                          <Check size={12} /> ₹{walletAppliedAmount} will be deducted from total
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Total Payable Row */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", margin: "14px 0 16px 0" }}>
                  <span style={{ fontSize: "14px", fontWeight: "800", color: "#0f172a" }}>Total Payable</span>
                  <span style={{ fontSize: "20px", fontWeight: "800", color: "var(--primary)" }}>
                    ₹{finalPayable.toLocaleString()}
                  </span>
                </div>

                {/* Primary Action Button */}
                {!user ? (
                  <button
                    type="button"
                    onClick={() => openLoginModal(location.pathname)}
                    className="btn btn-primary"
                    style={{
                      width: "100%",
                      borderRadius: "12px",
                      padding: "12px",
                      fontSize: "14px",
                      fontWeight: "700",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px"
                    }}
                  >
                    <User size={16} /> Sign in to Book <ArrowRight size={16} />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleCheckout}
                    disabled={submitting}
                    className="btn btn-primary"
                    style={{
                      width: "100%",
                      borderRadius: "12px",
                      padding: "12px",
                      fontSize: "14px",
                      fontWeight: "700",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                      cursor: submitting ? "default" : "pointer"
                    }}
                  >
                    {submitting ? (
                      <>
                        <div
                          className="spinner"
                          style={{
                            width: "14px",
                            height: "14px",
                            border: "2px solid rgba(255,255,255,0.3)",
                            borderTopColor: "#fff",
                            borderRadius: "50%",
                            animation: "spin 1s linear infinite"
                          }}
                        />
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={16} />
                        <span>
                          {allItemsHaveSlots
                            ? `Pay ₹${finalPayable.toLocaleString()} & Confirm`
                            : "Select Slot & Book"}
                        </span>
                        <ArrowRight size={16} />
                      </>
                    )}
                  </button>
                )}

                {/* Trust and Safety Footer */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "5px", fontSize: "11px", color: "#64748b", marginTop: "12px" }}>
                  <ShieldCheck size={13} color="var(--primary)" />
                  <span>100% Secure Checkout powered by Razorpay. NABH Certified.</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── SLOT PICKER MODAL ── */}
      <Modal
        isOpen={!!slotPickerTarget}
        onClose={() => setSlotPickerTarget(null)}
        title={
          slotPickerTarget === "ALL"
            ? "Schedule Slot for All Tests"
            : `Schedule Slot — ${slotPickerTarget?.title || "Lab Test"}`
        }
        maxWidth="860px"
        className="lab-slot-modal-compact"
      >
        <div style={{ padding: "8px 0" }}>
          <LabSlotPicker
            onProceed={(slotInfo) => {
              assignSlot(
                slotPickerTarget === "ALL" ? "ALL" : getLabItemKey(slotPickerTarget),
                slotInfo
              );
              setSlotPickerTarget(null);
            }}
            onClose={() => setSlotPickerTarget(null)}
            initialDate={
              slotPickerTarget && slotPickerTarget !== "ALL"
                ? slotPickerTarget.slotDate
                : null
            }
            initialSlot={
              slotPickerTarget && slotPickerTarget !== "ALL"
                ? {
                    time: slotPickerTarget.slotTime,
                    label: slotPickerTarget.slotLabel,
                    slot_id: slotPickerTarget.slotId
                  }
                : null
            }
            testTitle={
              slotPickerTarget === "ALL"
                ? "All Tests in Cart"
                : slotPickerTarget?.title
            }
          />
        </div>
      </Modal>

      {/* Responsive Styles for Cart Grid */}
      <style>{`
        .lab-cart-layout-grid {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 360px;
          gap: 24px;
          align-items: start;
        }

        @media (max-width: 992px) {
          .lab-cart-layout-grid {
            grid-template-columns: 1fr !important;
          }
          .lab-cart-summary-col {
            order: 2;
          }
          .lab-cart-items-col {
            order: 1;
          }
        }
      `}</style>
    </main>
  );
}
