import { useState, useEffect, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
import {
  Calendar as CalendarIcon,
  Clock,
  ChevronLeft,
  ChevronRight,
  Search,
  AlertCircle,
  RotateCcw,
  ArrowRight,
  Check,
  X,
  ShoppingCart,
  Trash2,
  Plus,
  Minus
} from "lucide-react";
import { useModalFooter } from "../common/Modal";
import { api } from "../../services/api";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const WEEKDAY_NAMES = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

/**
 * Format local date to DD-MM-YYYY (e.g. 13-11-2026)
 */
export function formatSlotApiDate(date) {
  if (!date) return "";
  const d = date instanceof Date ? date : new Date(date);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
}

/**
 * Convert 24h time string (HH:mm:ss or HH:mm) to 12h (h:mm AM/PM).
 */
export function formatTo12h(timeStr) {
  if (!timeStr) return "";
  const str = String(timeStr).trim();
  if (/am|pm/i.test(str)) {
    return str.replace(/\s+/g, " ").toUpperCase();
  }
  const parts = str.split(":");
  if (parts.length >= 2) {
    let h = parseInt(parts[0], 10);
    const m = String(parseInt(parts[1], 10) || 0).padStart(2, "0");
    if (isNaN(h)) return str;
    const period = h >= 12 ? "PM" : "AM";
    h = h % 12;
    if (h === 0) h = 12;
    return `${h}:${m} ${period}`;
  }
  return str;
}

/**
 * Parse a time string (12-hour or 24-hour) into { hour, minute } in 24h format.
 */
export function parseTimeParts(timeStr) {
  if (!timeStr) return null;
  const str = String(timeStr).trim();

  // Check 12-hour format e.g. "10:15 AM", "11:15:00 AM"
  const match12 = str.match(/^(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM)?$/i);
  if (match12 && match12[3]) {
    let h = parseInt(match12[1], 10);
    const m = parseInt(match12[2], 10);
    const period = match12[3].toUpperCase();
    if (period === "PM" && h < 12) h += 12;
    if (period === "AM" && h === 12) h = 0;
    return { hour: h, minute: m };
  }

  // Check 24-hour format e.g. "14:30:00", "14:30"
  const parts = str.split(":");
  if (parts.length >= 2) {
    const h = parseInt(parts[0], 10) || 0;
    const m = parseInt(parts[1], 10) || 0;
    return { hour: h, minute: m };
  }

  return null;
}

/**
 * Parse start time to { hour, minute } in 24h format for period grouping and sorting.
 */
export function parseStartTime(timeStr) {
  if (!timeStr) return { hour: 0, minute: 0 };
  const str = String(timeStr).trim();
  const startPart = str.split("-")[0].trim();
  return parseTimeParts(startPart) || { hour: 0, minute: 0 };
}

/**
 * Parse end time from a time string or range (e.g. "11:00 AM - 11:15 AM" -> { hour: 11, minute: 15 }).
 */
export function parseEndTime(timeStr) {
  if (!timeStr) return null;
  const str = String(timeStr).trim();
  if (str.includes("-")) {
    const endPart = str.split("-")[1].trim();
    return parseTimeParts(endPart);
  }
  return parseTimeParts(str);
}

/**
 * Defensive normalization of slot objects from backend API
 */
export function normalizeSlotItem(raw, index) {
  if (!raw) return null;

  if (typeof raw === "string") {
    const parsedStart = parseStartTime(raw);
    let parsedEnd = parseEndTime(raw);
    if (!parsedEnd) {
      const totalMinutes = parsedStart.hour * 60 + parsedStart.minute + 15;
      parsedEnd = {
        hour: Math.floor(totalMinutes / 60) % 24,
        minute: totalMinutes % 60
      };
    }
    const label = raw.includes("-")
      ? raw.split("-").map((p) => formatTo12h(p.trim())).join(" - ")
      : formatTo12h(raw);
    return {
      id: `slot-str-${index}-${raw}`,
      label,
      startHour: parsedStart.hour,
      startMinute: parsedStart.minute,
      endHour: parsedEnd.hour,
      endMinute: parsedEnd.minute,
      raw: { time: raw },
      isBooked: false,
      period: parsedStart.hour < 12 ? "morning" : "afternoon"
    };
  }

  const startRaw = raw.slot_start_time || raw.start_time || raw.startTime || raw.from_time || raw.from || raw.start || "";
  const endRaw = raw.slot_end_time || raw.end_time || raw.endTime || raw.to_time || raw.to || raw.end || "";
  const slotTimeRaw = raw.time_range || raw.slot_time || raw.slotTime || raw.time || raw.slot || "";

  let label = "";
  let startHour = 0;
  let startMinute = 0;
  let endHour = null;
  let endMinute = null;

  if (startRaw && endRaw) {
    label = `${formatTo12h(startRaw)} - ${formatTo12h(endRaw)}`;
    const parsedS = parseTimeParts(startRaw) || parseStartTime(startRaw);
    startHour = parsedS.hour;
    startMinute = parsedS.minute;
    const parsedE = parseTimeParts(endRaw) || parseEndTime(endRaw);
    if (parsedE) {
      endHour = parsedE.hour;
      endMinute = parsedE.minute;
    }
  } else if (slotTimeRaw) {
    if (String(slotTimeRaw).includes("-")) {
      label = String(slotTimeRaw)
        .split("-")
        .map((p) => formatTo12h(p.trim()))
        .join(" - ");
      const parsedS = parseStartTime(slotTimeRaw);
      startHour = parsedS.hour;
      startMinute = parsedS.minute;
      const parsedE = parseEndTime(slotTimeRaw);
      if (parsedE) {
        endHour = parsedE.hour;
        endMinute = parsedE.minute;
      }
    } else {
      label = formatTo12h(slotTimeRaw);
      const parsedS = parseStartTime(slotTimeRaw);
      startHour = parsedS.hour;
      startMinute = parsedS.minute;
      if (endRaw) {
        const parsedE = parseTimeParts(endRaw) || parseEndTime(endRaw);
        if (parsedE) {
          endHour = parsedE.hour;
          endMinute = parsedE.minute;
        }
      }
    }
  } else if (startRaw) {
    label = formatTo12h(startRaw);
    const parsedS = parseStartTime(startRaw);
    startHour = parsedS.hour;
    startMinute = parsedS.minute;
    if (endRaw) {
      const parsedE = parseTimeParts(endRaw) || parseEndTime(endRaw);
      if (parsedE) {
        endHour = parsedE.hour;
        endMinute = parsedE.minute;
      }
    }
  } else {
    label = `Slot ${index + 1}`;
  }

  // If end time is not provided, default to start + 15 minutes
  if (endHour === null || endMinute === null) {
    const totalMinutes = startHour * 60 + startMinute + 15;
    endHour = Math.floor(totalMinutes / 60) % 24;
    endMinute = totalMinutes % 60;
  }

  const isBooked = Boolean(
    raw.is_booked === true ||
    raw.is_booked === 1 ||
    raw.is_available === false ||
    raw.is_available === 0 ||
    raw.is_full === true ||
    raw.is_full === 1 ||
    (typeof raw.available_capacity === "number" && raw.available_capacity <= 0) ||
    raw.available === false ||
    raw.status === "booked" ||
    raw.status === "unavailable"
  );

  const period = startHour < 12 ? "morning" : "afternoon";

  return {
    id: raw.id || raw._id || raw.slot_id || `slot-${index}-${startHour}-${startMinute}`,
    label,
    startHour,
    startMinute,
    endHour,
    endMinute,
    raw,
    isBooked,
    period
  };
}

/**
 * Extract array defensively from various API response shapes
 */
function extractSlotsArray(res) {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  if (Array.isArray(res.data)) return res.data;
  if (res.data && Array.isArray(res.data.data)) return res.data.data;
  if (res.data && Array.isArray(res.data.slots)) return res.data.slots;
  if (Array.isArray(res.slots)) return res.slots;
  if (res.result && Array.isArray(res.result)) return res.result;
  if (res.result && Array.isArray(res.result.slots)) return res.result.slots;
  return [];
}

/**
 * Check whether a slot has already passed its end time on today.
 * If selectedDate is today and current time >= end time, returns true.
 * For future dates, returns false.
 */
export function isSlotPastEndTime(slot, selectedDate) {
  if (!slot || !selectedDate) return false;

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const selectedDay = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());

  // Past dates are entirely past
  if (selectedDay < startOfToday) {
    return true;
  }

  // Future dates are not past
  if (selectedDay > startOfToday) {
    return false;
  }

  const curHour = now.getHours();
  const curMinute = now.getMinutes();

  let endH = typeof slot.endHour === "number" ? slot.endHour : null;
  let endM = typeof slot.endMinute === "number" ? slot.endMinute : null;

  if (endH === null || endM === null) {
    const parsed =
      parseEndTime(slot.label) ||
      parseEndTime(slot.raw?.slot_end_time || slot.raw?.end_time || slot.raw?.time_range || slot.raw?.slot_time || slot.raw?.time);
    if (parsed) {
      endH = parsed.hour;
      endM = parsed.minute;
    } else {
      const startH = typeof slot.startHour === "number" ? slot.startHour : 0;
      const startM = typeof slot.startMinute === "number" ? slot.startMinute : 0;
      const total = startH * 60 + startM + 15;
      endH = Math.floor(total / 60) % 24;
      endM = total % 60;
    }
  }

  // Handle midnight roll-over (e.g. 23:45 - 00:00)
  const startH = typeof slot.startHour === "number" ? slot.startHour : 0;
  if (endH < startH && endH === 0) {
    endH = 24;
  }

  return curHour > endH || (curHour === endH && curMinute >= endM);
}

/**
 * Check whether a slot is disabled (booked or past end time on today).
 */
export function isSlotDisabled(slot, selectedDate) {
  if (!slot) return true;
  if (slot.isBooked) return true;
  if (!selectedDate) return false;
  return isSlotPastEndTime(slot, selectedDate);
}

export default function LabSlotPicker({
  onProceed,
  onClose,
  initialDate = null,
  initialSlot = null,
  testTitle = "",
  showAddToCart = false,
  onAddToCart,
  inCartQty = 0,
  onUpdateCartQty,
  onRemoveFromCart,
  onViewCart,
  onSlotChange
}) {
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const tomorrow = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 1);
    return d;
  }, []);

  const defaultDate = useMemo(() => {
    if (initialDate) {
      const init = new Date(initialDate);
      init.setHours(0, 0, 0, 0);
      if (init > today) return init;
    }
    return tomorrow;
  }, [initialDate, today, tomorrow]);

  const [selectedDate, setSelectedDate] = useState(() => defaultDate);
  const [currentMonth, setCurrentMonth] = useState(() => {
    return new Date(defaultDate.getFullYear(), defaultDate.getMonth(), 1);
  });

  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(() => {
    if (initialDate) {
      const init = new Date(initialDate);
      init.setHours(0, 0, 0, 0);
      if (init <= today) return null;
    }
    return initialSlot || null;
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [timeTick, setTimeTick] = useState(0);

  // Periodically refresh active/disabled slot statuses as time passes
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeTick((t) => t + 1);
    }, 15000);
    return () => clearInterval(timer);
  }, []);

  const modalFooterEl = useModalFooter();
  const abortControllerRef = useRef(null);
  const requestIdRef = useRef(0);
  const initialFetchDoneRef = useRef(false);

  // Month navigation guards
  const isCurrentMonthVisible =
    currentMonth.getFullYear() === today.getFullYear() &&
    currentMonth.getMonth() === today.getMonth();

  const prevMonth = () => {
    if (isCurrentMonthVisible) return;
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  // Calendar dates calculation
  const calendarDays = useMemo(() => {
    const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    const startDay = startOfMonth.getDay(); // 0..6
    const totalDays = endOfMonth.getDate();

    const items = [];
    for (let i = 0; i < startDay; i++) {
      items.push(null);
    }
    for (let d = 1; d <= totalDays; d++) {
      items.push(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), d));
    }
    return items;
  }, [currentMonth]);

  // Fetch slots whenever selectedDate changes
  const fetchSlotsForDate = async (date) => {
    if (!date) {
      setSlots([]);
      setSlotsLoading(false);
      setSlotsError(null);
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;
    const currentRequestId = ++requestIdRef.current;

    const formattedDate = formatSlotApiDate(date);
    setSlotsLoading(true);
    setSlotsError(null);

    try {
      const payload = { slot_date: formattedDate };
      const res = await api.post("/api/labSlots/getLabSlots", payload, {}, { signal: controller.signal });
      
      // Log response once for development inspection
      // console.log(`[LabSlots] Slots for ${formattedDate}:`, res);

      if (currentRequestId !== requestIdRef.current) return;

      const rawList = extractSlotsArray(res);
      const normalized = rawList
        .map((item, idx) => normalizeSlotItem(item, idx))
        .filter(Boolean);

      // Sort chronologically by startHour, startMinute
      normalized.sort((a, b) => {
        if (a.startHour !== b.startHour) return a.startHour - b.startHour;
        return a.startMinute - b.startMinute;
      });

      setSlots(normalized);
      setSlotsLoading(false);
    } catch (err) {
      if (err.name === "AbortError" || currentRequestId !== requestIdRef.current) {
        return;
      }
      console.error("[LabSlots] Error fetching slots:", err);
      setSlots([]);
      setSlotsError(err?.message || "Unable to fetch slots. Please try again.");
      setSlotsLoading(false);
    }
  };

  // On mount, fetch slots for selected date (defaults to tomorrow)
  useEffect(() => {
    const targetDate = defaultDate;
    if (!initialFetchDoneRef.current) {
      initialFetchDoneRef.current = true;
      fetchSlotsForDate(targetDate);
    }
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [defaultDate]);

  // Handle date selection
  const handleDateClick = (date) => {
    if (!date) return;
    const isPastOrToday = date <= today;
    if (isPastOrToday) return;

    // Check if clicked the same date
    const isSameDate =
      selectedDate &&
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear();

    if (isSameDate) return;

    setSelectedDate(date);
    setSelectedSlot(null); // Clear selected slot whenever date changes
    setSearchQuery("");
    fetchSlotsForDate(date);
  };

  // Filter out slots whose end time has already passed when selectedDate is today.
  // Matches current time with slot_end_time so past slots are omitted and remaining slots are shown and active.
  const visibleSlots = useMemo(() => {
    return slots.filter((slot) => !isSlotPastEndTime(slot, selectedDate));
  }, [slots, selectedDate, timeTick]);

  // Filter slots by search query
  const filteredSlots = useMemo(() => {
    if (!searchQuery.trim()) return visibleSlots;
    const query = searchQuery.trim().toLowerCase();
    return visibleSlots.filter((slot) => slot.label.toLowerCase().includes(query));
  }, [visibleSlots, searchQuery]);

  // Selected date badge text (e.g. "Nov 14")
  const selectedDateBadge = useMemo(() => {
    if (!selectedDate) return "";
    return selectedDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }, [selectedDate]);

  // Selected date formatted for summary
  const formattedSummary = useMemo(() => {
    if (!selectedDate && !selectedSlot) {
      return "Select a date and time slot";
    }
    if (selectedDate && !selectedSlot) {
      const dStr = selectedDate.toLocaleDateString("en-US", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric"
      });
      return `${dStr} · Select a slot`;
    }
    const dStr = selectedDate.toLocaleDateString("en-US", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric"
    });
    return `${dStr} · ${selectedSlot.label}`;
  }, [selectedDate, selectedSlot]);

  // Deselect slot if it expires while selected
  useEffect(() => {
    if (selectedSlot && selectedDate && isSlotDisabled(selectedSlot, selectedDate)) {
      setSelectedSlot(null);
    }
  }, [selectedDate, selectedSlot, timeTick]);

  const canProceed = Boolean(
    selectedDate &&
    selectedDate > today &&
    selectedSlot &&
    !isSlotDisabled(selectedSlot, selectedDate)
  );

  const handleProceedClick = () => {
    if (!canProceed || isSlotDisabled(selectedSlot, selectedDate)) return;
    const rawId = selectedSlot.raw?.id ?? selectedSlot.id;
    onProceed({
      date: selectedDate,
      dateString: formatSlotApiDate(selectedDate),
      slot: selectedSlot.raw,
      label: selectedSlot.label,
      time: selectedSlot.label,
      id: rawId,
      slot_id: rawId
    });
  };

  const handleAddToCartClick = () => {
    if (!canProceed || isSlotDisabled(selectedSlot, selectedDate)) return;
    const rawId = selectedSlot.raw?.id ?? selectedSlot.id;
    if (onAddToCart) {
      onAddToCart({
        date: selectedDate,
        dateString: formatSlotApiDate(selectedDate),
        slot: selectedSlot.raw,
        label: selectedSlot.label,
        time: selectedSlot.label,
        id: rawId,
        slot_id: rawId
      });
    }
  };

  const handleSlotSelect = (slot) => {
    setSelectedSlot(slot);
    if (onSlotChange) {
      const rawId = slot.raw?.id ?? slot.id;
      onSlotChange({
        date: selectedDate,
        dateString: formatSlotApiDate(selectedDate),
        slot: slot.raw,
        label: slot.label,
        time: slot.label,
        id: rawId,
        slot_id: rawId
      });
    }
  };

  // Sticky Proceed Footer Action
  const proceedFooter = (
    <div className="lab-slot-footer-bar">
      <div className="lab-slot-footer-summary">
        <CalendarIcon size={16} className="lab-slot-footer-icon" />
        <span className="lab-slot-footer-text">{formattedSummary}</span>
      </div>

      <div className="lab-slot-footer-actions" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: 'auto', flexWrap: 'wrap' }}>
        {showAddToCart ? (
          inCartQty > 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <div className="lab-cart-qty-stepper">
                <button
                  type="button"
                  className="lab-cart-qty-btn"
                  onClick={() => onUpdateCartQty && onUpdateCartQty(-1)}
                  aria-label="Decrease quantity"
                  title="Decrease quantity"
                >
                  <Minus size={13} strokeWidth={2.5} />
                </button>
                <span className="lab-cart-qty-number">{inCartQty}</span>
                <button
                  type="button"
                  className="lab-cart-qty-btn"
                  onClick={() => onUpdateCartQty && onUpdateCartQty(1)}
                  aria-label="Increase quantity"
                  title="Increase quantity"
                >
                  <Plus size={13} strokeWidth={2.5} />
                </button>
              </div>

              <button
                type="button"
                className="lab-cart-trash-btn"
                onClick={() => onRemoveFromCart && onRemoveFromCart()}
                title="Remove from cart"
                aria-label="Remove from cart"
              >
                <Trash2 size={16} />
              </button>

              <span className="lab-cart-divider" aria-hidden="true" />

              <button
                type="button"
                className="lab-modal-view-cart-btn"
                onClick={onViewCart}
              >
                <ShoppingCart size={13} />
                <span>View Cart</span>
                <ArrowRight size={13} />
              </button>

              <button
                type="button"
                className="btn btn-primary lab-slot-proceed-btn"
                disabled={!canProceed}
                onClick={handleProceedClick}
                aria-label="Proceed to booking summary"
              >
                <span>Proceed</span>
                <ArrowRight size={15} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="lab-modal-add-cart-btn"
                disabled={!canProceed}
                onClick={handleAddToCartClick}
                style={{
                  opacity: canProceed ? 1 : 0.5,
                  cursor: canProceed ? 'pointer' : 'not-allowed',
                  padding: '6.5px 15px',
                  fontSize: '12px'
                }}
              >
                <ShoppingCart size={14} />
                <span>Add to Cart</span>
                <ArrowRight size={13} />
              </button>

              <button
                type="button"
                className="btn btn-primary lab-slot-proceed-btn"
                disabled={!canProceed}
                onClick={handleProceedClick}
                aria-label="Proceed to booking summary"
              >
                <span>Proceed</span>
                <ArrowRight size={15} />
              </button>
            </div>
          )
        ) : (
          <button
            type="button"
            className="btn btn-primary lab-slot-proceed-btn"
            disabled={!canProceed}
            onClick={handleProceedClick}
            aria-label="Proceed to booking summary"
          >
            <span>Proceed</span>
            <ArrowRight size={16} />
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="lab-slot-picker-container">
      {/* Main Two-Column Layout */}
      <div className="lab-slot-picker-layout">
        {/* LEFT COLUMN: Calendar Card */}
        <div className="lab-calendar-card">
          <div className="lab-card-title-row">
            <div className="lab-card-title-left">
              <CalendarIcon size={17} className="text-teal" />
              <span className="lab-card-title-text">Select Date</span>
            </div>
            {selectedDateBadge && (
              <span className="lab-date-badge" aria-label={`Selected: ${selectedDateBadge}`}>
                {selectedDateBadge}
              </span>
            )}
          </div>

          <div className="lab-cal-nav">
            <button
              type="button"
              className="lab-cal-nav-btn"
              onClick={prevMonth}
              disabled={isCurrentMonthVisible}
              aria-label="Previous month"
              title={isCurrentMonthVisible ? "Cannot view past months" : "Previous month"}
            >
              <ChevronLeft size={16} />
            </button>
            <span className="lab-cal-month-label">
              {MONTH_NAMES[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </span>
            <button
              type="button"
              className="lab-cal-nav-btn"
              onClick={nextMonth}
              aria-label="Next month"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Weekday headers */}
          <div className="lab-cal-weekdays" aria-hidden="true">
            {WEEKDAY_NAMES.map((w) => (
              <div key={w} className="lab-cal-weekday">
                {w}
              </div>
            ))}
          </div>

          {/* Day Grid */}
          <div className="lab-cal-grid" role="grid" aria-label="Appointment Calendar">
            {calendarDays.map((d, index) => {
              if (!d) {
                return <div key={`empty-${index}`} className="lab-cal-empty-day" />;
              }

              const isPast = d < today;
              const isToday = d.toDateString() === today.toDateString();
              const isDateDisabled = d <= today; // Today and past dates are disabled for selection
              const isSelected =
                selectedDate && d.toDateString() === selectedDate.toDateString();

              return (
                <button
                  key={d.toISOString()}
                  type="button"
                  className={`lab-cal-day-btn ${isSelected ? "selected" : ""} ${isToday ? "today" : ""} ${isDateDisabled ? "past-disabled" : ""}`}
                  disabled={isDateDisabled}
                  onClick={() => handleDateClick(d)}
                  aria-label={`${d.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric", year: "numeric" })}${isSelected ? ", selected" : ""}${isToday ? ", today (not available)" : ""}`}
                  aria-selected={isSelected}
                  role="gridcell"
                >
                  <span className="lab-cal-day-number">{d.getDate()}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: Available Slots Card */}
        <div className="lab-slots-card">
          {/* Header Row */}
          <div className="lab-slots-card-header">
            <div className="lab-slots-title-row">
              <Clock size={17} className="text-teal" />
              <span className="lab-card-title-text">Available Slots</span>
              {selectedDate && !slotsLoading && !slotsError && (
                <span className="lab-slots-count-tag">{filteredSlots.length} slots</span>
              )}
            </div>
          </div>

          {/* Search Input - only visible after date is selected */}
          {selectedDate && (
            <div className="lab-slot-search-wrap">
              <Search size={15} className="lab-search-icon" />
              <input
                type="text"
                className="lab-slot-search-input"
                placeholder="Search time, e.g. 1:00 PM"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search available time slots"
              />
              {searchQuery && (
                <button
                  type="button"
                  className="lab-search-clear-btn"
                  onClick={() => setSearchQuery("")}
                  aria-label="Clear search"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          )}

          <div className="lab-slots-divider" />

          {/* Slots Content Area - internal scroller inside the slot container */}
          <div className="lab-slots-content-area">
            {/* 1. Empty state: Before date is selected */}
            {!selectedDate && (
              <div className="lab-slots-empty-state">
                <div className="lab-empty-icon-wrap">
                  <CalendarIcon size={32} />
                </div>
                <h4 className="lab-empty-heading">Select a date</h4>
                <p className="lab-empty-text">
                  Choose an appointment date from the calendar to view available phlebotomist time slots.
                </p>
              </div>
            )}

            {/* 2. Loading state: Skeletons */}
            {selectedDate && slotsLoading && (
              <div className="lab-slots-skeletons" aria-busy="true" aria-label="Loading available slots">
                <div className="lab-slots-grid">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={`skel-${i}`} className="lab-slot-skeleton-pill" />
                  ))}
                </div>
              </div>
            )}

            {/* 3. Error state with Retry */}
            {selectedDate && !slotsLoading && slotsError && (
              <div className="lab-slots-error-state">
                <AlertCircle size={28} className="lab-error-icon" />
                <h4 className="lab-error-heading">Failed to load slots</h4>
                <p className="lab-error-text">{slotsError}</p>
                <button
                  type="button"
                  className="btn btn-secondary lab-retry-btn"
                  onClick={() => fetchSlotsForDate(selectedDate)}
                >
                  <RotateCcw size={14} />
                  <span>Retry</span>
                </button>
              </div>
            )}

            {/* 4. No slots available for chosen date */}
            {selectedDate && !slotsLoading && !slotsError && visibleSlots.length === 0 && (
              <div className="lab-slots-empty-state">
                <div className="lab-empty-icon-wrap muted">
                  <Clock size={32} />
                </div>
                <h4 className="lab-empty-heading">No slots available</h4>
                <p className="lab-empty-text">
                  There are no available slots for this date. Please choose another date.
                </p>
              </div>
            )}

            {/* 5. Filter/Search returned zero results */}
            {selectedDate && !slotsLoading && !slotsError && visibleSlots.length > 0 && filteredSlots.length === 0 && (
              <div className="lab-slots-empty-state">
                <div className="lab-empty-icon-wrap muted">
                  <Search size={30} />
                </div>
                <h4 className="lab-empty-heading">No matching slots</h4>
                <p className="lab-empty-text">
                  No slots match your search query.
                </p>
                <button
                  type="button"
                  className="btn btn-secondary lab-clear-filters-btn"
                  onClick={() => setSearchQuery("")}
                >
                  Clear Search
                </button>
              </div>
            )}

            {/* 6. Normal slots render */}
            {selectedDate && !slotsLoading && !slotsError && filteredSlots.length > 0 && (
              <div className="lab-slots-grid">
                {filteredSlots.map((slot) => {
                  const disabled = isSlotDisabled(slot, selectedDate);
                  const isSelected = selectedSlot?.id === slot.id;
                  return (
                    <button
                      key={slot.id}
                      type="button"
                      className={`lab-slot-pill ${isSelected ? "selected" : ""} ${disabled ? "disabled" : ""}`}
                      disabled={disabled}
                      onClick={() => handleSlotSelect(slot)}
                      aria-label={`Time slot: ${slot.label}${disabled ? ", unavailable" : ""}${isSelected ? ", selected" : ""}`}
                      aria-selected={isSelected}
                      title={disabled ? (slot.isBooked ? "Slot already booked" : "Time has already passed") : slot.label}
                    >
                      <Clock size={13} className="lab-slot-pill-clock" />
                      <span className="lab-slot-pill-label">{slot.label}</span>
                      {isSelected && <Check size={14} className="lab-slot-check" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Render sticky footer portaled into modal-footer-slot or inline */}
      {modalFooterEl ? createPortal(proceedFooter, modalFooterEl) : proceedFooter}
    </div>
  );
}

