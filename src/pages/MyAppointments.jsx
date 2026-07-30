import { useState, useEffect } from "react";
import { Calendar as CalendarIcon, Clock, MapPin, Video, User, CheckCircle, XCircle, AlertCircle, ChevronRight, Sunrise, Sun, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { getAppointments, cancelAppointment, rescheduleAppointment, getStoredUserId, getDoctorSlots } from "../services/dataService";
import Modal from "../components/common/Modal";
import Toast from "../components/common/Toast";
import Calendar from "../components/common/Calendar";

export default function MyAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Toast
  const [toast, setToast] = useState({ isOpen: false, message: "", type: "success" });
  const showToast = (message, type = "success") => setToast({ isOpen: true, message, type });

  // Cancel
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [appointmentToCancel, setAppointmentToCancel] = useState(null);
  const [cancelReason, setCancelReason] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);

  // Reschedule
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
  const [appointmentToReschedule, setAppointmentToReschedule] = useState(null);
  const [rescheduleDate, setRescheduleDate] = useState(new Date());
  const [rescheduleSlot, setRescheduleSlot] = useState("");
  const [availableSlots, setAvailableSlots] = useState({ morning: [], afternoon: [], evening: [] });
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [isRescheduling, setIsRescheduling] = useState(false);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const data = await getAppointments({ date: selectedDate });
      setAppointments(data);
      setLoading(false);
    }
    fetchData();
  }, [selectedDate]);

  const filteredAppointments = appointments;

  const fetchAppointments = async () => {
    setLoading(true);
    const data = await getAppointments({ date: selectedDate });
    setAppointments(data);
    setLoading(false);
  };

  const openCancelModal = (apt) => {
    setAppointmentToCancel(apt);
    setCancelReason("");
    setCancelModalOpen(true);
  };

  const confirmCancel = async () => {
    if (!cancelReason.trim()) {
      showToast("Please provide a cancellation reason.", "error");
      return;
    }
    setIsCancelling(true);
    try {
      const patientId = getStoredUserId();
      await cancelAppointment({
        appointment_id: appointmentToCancel.raw?.appointment_id || appointmentToCancel.id,
        patient_id: patientId,
        cancellation_reason: cancelReason
      });
      showToast("Appointment cancelled successfully!");
      setCancelModalOpen(false);
      fetchAppointments();
    } catch (err) {
      showToast("Failed to cancel appointment.", "error");
    } finally {
      setIsCancelling(false);
    }
  };

  const openRescheduleModal = (apt) => {
    setAppointmentToReschedule(apt);
    const aptDate = new Date(apt.date);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    aptDate.setHours(0, 0, 0, 0);
    
    if (aptDate < tomorrow) {
      setRescheduleDate(tomorrow);
    } else {
      setRescheduleDate(new Date(apt.date));
    }
    
    setRescheduleSlot("");
    setRescheduleModalOpen(true);
  };

  useEffect(() => {
    if (rescheduleModalOpen && appointmentToReschedule) {
      const fetchSlots = async () => {
        setSlotsLoading(true);
        setRescheduleSlot("");
        try {
          const docId = appointmentToReschedule.raw?.drkey || appointmentToReschedule.raw?.doctor_id;
          if (!docId) {
            setSlotsLoading(false);
            return;
          }
          const res = await getDoctorSlots(docId, rescheduleDate);
          const morning = [];
          const afternoon = [];
          const evening = [];

          let rawSlots = [];
          if (res && res.slots && typeof res.slots === 'object') {
            Object.values(res.slots).forEach(locObj => {
              if (locObj && typeof locObj === 'object') {
                Object.values(locObj).forEach(dateArray => {
                  if (Array.isArray(dateArray)) rawSlots = rawSlots.concat(dateArray);
                });
              }
            });
          } else {
            rawSlots = Array.isArray(res) ? res : (res.data || res.list || []);
          }
          
          rawSlots.forEach(s => {
            const timeStr = typeof s === 'string' ? s : (s.start_time || s.time || s.slot_time || "");
            if (!timeStr) return;
            const hourMatch = timeStr.match(/^\d+/);
            let hour24 = hourMatch ? parseInt(hourMatch[0]) : 0;
            if (timeStr.toLowerCase().includes('pm') && hour24 !== 12) hour24 += 12;
            if (timeStr.toLowerCase().includes('am') && hour24 === 12) hour24 = 0;
            
            if (hour24 >= 17) evening.push(s);
            else if (hour24 >= 12) afternoon.push(s);
            else morning.push(s);
          });
          
          setAvailableSlots({ morning, afternoon, evening });
        } catch (err) {
          console.error(err);
        } finally {
          setSlotsLoading(false);
        }
      };
      fetchSlots();
    }
  }, [rescheduleDate, rescheduleModalOpen, appointmentToReschedule]);

  const getSlotDisplay = (s) => {
    let str = typeof s === 'string' ? s : (s.start_time || s.time || s.slot_time || "Slot");
    if (/^\d{1,2}:\d{2}$/.test(str)) {
      let [h, m] = str.split(':');
      let hour = parseInt(h);
      let ampm = hour >= 12 ? 'PM' : 'AM';
      if (hour > 12) hour -= 12;
      if (hour === 0) hour = 12;
      str = `${hour}:${m} ${ampm}`;
    }
    return str;
  };

  const confirmReschedule = async () => {
    if (!rescheduleSlot) {
      showToast("Please select a new time slot.", "error");
      return;
    }
    setIsRescheduling(true);
    try {
      const patientId = getStoredUserId();
      const newDateStr = rescheduleDate.toISOString().split('T')[0];
      const newStartStr = typeof rescheduleSlot === 'string' ? rescheduleSlot : (rescheduleSlot.start_time || rescheduleSlot.time);
      const locationKey = appointmentToReschedule.raw?.entitylocation || appointmentToReschedule.raw?.location_key;

      await rescheduleAppointment({
        appointment_id: appointmentToReschedule.raw?.appointment_id || appointmentToReschedule.id,
        patient_id: patientId,
        new_date: newDateStr,
        new_start: newStartStr,
        new_location_key: locationKey
      });
      showToast("Appointment rescheduled successfully!");
      setRescheduleModalOpen(false);
      fetchAppointments();
    } catch (err) {
      showToast("Failed to reschedule appointment.", "error");
    } finally {
      setIsRescheduling(false);
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'upcoming': return <span style={{ background: 'var(--primary-light)', color: 'var(--primary-dark)', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={12} /> Upcoming</span>;
      case 'completed': return <span style={{ background: 'var(--success-light, #d1fae5)', color: 'var(--success, #059669)', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}><CheckCircle size={12} /> Completed</span>;
      case 'cancelled': return <span style={{ background: 'var(--danger-light, #fee2e2)', color: 'var(--danger, #dc2626)', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}><XCircle size={12} /> Cancelled</span>;
      default: return null;
    }
  };

  const isPastDate = (dateString) => {
    if (!dateString) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const aptDate = new Date(dateString);
    aptDate.setHours(0, 0, 0, 0);
    return aptDate < today;
  };

  return (
    <main className="page animate-fade-in-up" style={{ padding: 0, background: 'var(--bg-app)' }}>
      {/* ── Internal Hero ── */}
      <div style={{ background: 'var(--bg-surface)', padding: '24px 0', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <div className="flex items-center gap-2 text-muted mb-2" style={{ fontSize: '12px', fontWeight: '500' }}>
            <Link to="/" style={{ transition: 'color 0.2s' }} onMouseOver={e => e.currentTarget.style.color='var(--primary)'} onMouseOut={e => e.currentTarget.style.color=''}>Home</Link> <ChevronRight size={12} /> <span>My Appointments</span>
          </div>
          <h1 className="text-h2" style={{ fontSize: '24px', color: 'var(--text-main)' }}>My Appointments</h1>
          <p className="text-muted mt-2" style={{ fontSize: '14px' }}>Manage your upcoming and past medical consultations.</p>
        </div>
      </div>

      <div className="container" style={{ paddingTop: '32px', paddingBottom: '60px' }}>

      {/* Filters */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', borderBottom: '1px solid var(--border)', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingBottom: '8px' }}>
          <label htmlFor="date-filter" style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-muted)' }}>Date:</label>
          <input 
            id="date-filter"
            type="date" 
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid var(--border)',
              background: 'var(--bg-surface)',
              color: 'var(--text-main)',
              fontSize: '14px',
              outline: 'none'
            }}
          />
        </div>
      </div>

      {/* List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {loading ? (
          <div style={{ padding: '64px 20px', textAlign: 'center', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '16px' }}>
            <Loader2 size={48} className="animate-spin" color="var(--primary)" style={{ margin: '0 auto 16px auto' }} />
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-main)', marginBottom: '8px' }}>Loading appointments...</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Please wait while we fetch your appointments.</p>
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div style={{ padding: '64px 20px', textAlign: 'center', background: 'var(--bg-surface)', border: '1px dashed var(--border)', borderRadius: '16px' }}>
            <CalendarIcon size={48} color="var(--border)" style={{ margin: '0 auto 16px auto' }} />
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-main)', marginBottom: '8px' }}>No appointments</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>You don't have any appointments at the moment.</p>
          </div>
        ) : (
          filteredAppointments.map(apt => (
            <div key={apt.id} className="card-elevated" style={{ padding: '24px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Top Row: Doctor Info & Status */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-main)', margin: '0 0 4px 0' }}>{apt.doctor}</h3>
                    <p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <User size={14} /> {apt.specialty}
                    </p>
                  </div>
                </div>
                <div>{getStatusBadge(apt.status)}</div>
              </div>

              {/* Middle Row: Details Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', background: 'var(--bg-app)', padding: '16px', borderRadius: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                    <CalendarIcon size={16} />
                  </div>
                  <div>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>Date & Time</span>
                    <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-main)' }}>{new Date(apt.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })} • {apt.time}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)' }}>
                    {apt.type === "Video Consult" ? <Video size={16} /> : <MapPin size={16} />}
                  </div>
                  <div>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>Location / Type</span>
                    <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-main)' }}>{apt.hospital} ({apt.type})</span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--success, #059669)' }}>
                    <span style={{ fontWeight: 'bold' }}>₹</span>
                  </div>
                  <div>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>Fee</span>
                    <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-main)' }}>₹ {apt.amount}</span>
                  </div>
                </div>

                {apt.patientName && (
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                      <User size={16} />
                    </div>
                    <div>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>Patient</span>
                      <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-main)' }}>{apt.patientName} {apt.patientMobile ? `(${apt.patientMobile})` : ''}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Row: Actions */}
              {apt.status === "upcoming" && (() => {
                const isPast = isPastDate(apt.date);
                return (
                  <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
                    <button 
                      onClick={() => !isPast && openCancelModal(apt)} 
                      disabled={isPast}
                      title={isPast ? "Cannot cancel past appointments" : ""}
                      className={`btn ${!isPast ? 'hover-glow' : ''}`} 
                      style={{ 
                        background: 'transparent', 
                        border: `1px solid ${isPast ? 'var(--border)' : 'var(--danger, #dc2626)'}`, 
                        color: isPast ? 'var(--text-muted)' : 'var(--danger, #dc2626)', 
                        padding: '8px 16px', 
                        fontSize: '13px',
                        cursor: isPast ? 'not-allowed' : 'pointer',
                        opacity: isPast ? 0.6 : 1
                      }}>
                      Cancel
                    </button>
                    <button 
                      onClick={() => !isPast && openRescheduleModal(apt)} 
                      disabled={isPast}
                      title={isPast ? "Cannot reschedule past appointments" : ""}
                      className={`btn ${!isPast ? 'hover-glow' : ''}`} 
                      style={{ 
                        background: 'transparent', 
                        border: `1px solid ${isPast ? 'var(--border)' : 'var(--primary)'}`, 
                        color: isPast ? 'var(--text-muted)' : 'var(--primary)', 
                        padding: '8px 16px', 
                        fontSize: '13px',
                        cursor: isPast ? 'not-allowed' : 'pointer',
                        opacity: isPast ? 0.6 : 1
                      }}>
                      Reschedule
                    </button>
                    {apt.type === "Video Consult" && (
                      <button className="btn btn-primary hover-glow" style={{ padding: '8px 16px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Video size={16} /> Join Call
                      </button>
                    )}
                  </div>
                );
              })()}
              {apt.status === "completed" && (
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
                  <button className="btn btn-secondary hover-glow" style={{ padding: '8px 16px', fontSize: '13px' }}>
                    View Summary
                  </button>
                  <button className="btn btn-primary hover-glow" style={{ padding: '8px 16px', fontSize: '13px' }}>
                    Book Again
                  </button>
                </div>
              )}

            </div>
          ))
        )}
      </div>

      </div>
      
      {/* Cancel Modal */}
      <Modal isOpen={cancelModalOpen} onClose={() => setCancelModalOpen(false)} title="Cancel Appointment">
        <div style={{ padding: '8px 0 24px 0' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '16px' }}>
            Are you sure you want to cancel your appointment with <strong>{appointmentToCancel?.doctor}</strong>?
          </p>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--text-main)', marginBottom: '8px' }}>Reason for cancellation</label>
          <textarea 
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            maxLength={250}
            rows={4}
            placeholder="Please tell us why you are cancelling..."
            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-app)', color: 'var(--text-main)', outline: 'none', resize: 'vertical' }}
          />
          <div style={{ textAlign: 'right', fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
            {cancelReason.length}/250
          </div>
          
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
            <button className="btn btn-secondary" onClick={() => setCancelModalOpen(false)} disabled={isCancelling}>
              Keep Appointment
            </button>
            <button className="btn" onClick={confirmCancel} disabled={isCancelling} style={{ background: 'var(--danger, #dc2626)', color: 'white', border: 'none' }}>
              {isCancelling ? "Cancelling..." : "Confirm Cancel"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Reschedule Modal */}
      <Modal isOpen={rescheduleModalOpen} onClose={() => setRescheduleModalOpen(false)} title="Reschedule Appointment" maxWidth="800px">
        <div style={{ padding: '8px 0 24px 0' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px' }}>
            Select a new date and time for your appointment with <strong>{appointmentToReschedule?.doctor}</strong>.
          </p>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(250px, 300px) 1fr', gap: '24px', alignItems: 'start' }}>
            <div>
              <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>Select Date</h4>
              <div style={{ background: 'var(--bg-app)', padding: '12px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                {(() => {
                  const minDate = new Date();
                  minDate.setDate(minDate.getDate() + 1);
                  return <Calendar selectedDate={rescheduleDate} onSelectDate={setRescheduleDate} minDate={minDate} />;
                })()}
              </div>
            </div>
            
            <div>
              <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>Available Slots</h4>
              {slotsLoading ? (
                <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-muted)' }}>Loading slots...</div>
              ) : (
                <div style={{ maxHeight: '400px', overflowY: 'auto', paddingRight: '8px' }} className="custom-scrollbar">
                  {/* Morning */}
                  {availableSlots.morning.length > 0 && (
                    <div style={{ marginBottom: '20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: 'var(--text-main)', fontSize: '14px', fontWeight: '600' }}>
                        <Sunrise size={16} color="#eab308" /> Morning
                      </div>
                      <div className="time-slots-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))' }}>
                        {availableSlots.morning.map((slotItem, idx) => {
                          const isCurrent = appointmentToReschedule?.time === getSlotDisplay(slotItem) && new Date(appointmentToReschedule?.date).toDateString() === rescheduleDate.toDateString();
                          return (
                            <button key={`m-${idx}`} disabled={isCurrent} onClick={() => setRescheduleSlot(slotItem)} className={`time-slot-btn ${rescheduleSlot === slotItem ? 'active' : ''}`} style={{ opacity: isCurrent ? 0.5 : 1, cursor: isCurrent ? 'not-allowed' : 'pointer', fontSize: '13px', padding: '8px 4px' }}>
                              {getSlotDisplay(slotItem)}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Afternoon */}
                  {availableSlots.afternoon.length > 0 && (
                    <div style={{ marginBottom: '20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: 'var(--text-main)', fontSize: '14px', fontWeight: '600' }}>
                        <Sun size={16} color="#f97316" /> Afternoon
                      </div>
                      <div className="time-slots-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))' }}>
                        {availableSlots.afternoon.map((slotItem, idx) => {
                          const isCurrent = appointmentToReschedule?.time === getSlotDisplay(slotItem) && new Date(appointmentToReschedule?.date).toDateString() === rescheduleDate.toDateString();
                          return (
                            <button key={`a-${idx}`} disabled={isCurrent} onClick={() => setRescheduleSlot(slotItem)} className={`time-slot-btn ${rescheduleSlot === slotItem ? 'active' : ''}`} style={{ opacity: isCurrent ? 0.5 : 1, cursor: isCurrent ? 'not-allowed' : 'pointer', fontSize: '13px', padding: '8px 4px' }}>
                              {getSlotDisplay(slotItem)}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Evening */}
                  {availableSlots.evening.length > 0 && (
                    <div style={{ marginBottom: '20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: 'var(--text-main)', fontSize: '14px', fontWeight: '600' }}>
                        <Sun size={16} color="#4f46e5" /> Evening
                      </div>
                      <div className="time-slots-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))' }}>
                        {availableSlots.evening.map((slotItem, idx) => {
                          const isCurrent = appointmentToReschedule?.time === getSlotDisplay(slotItem) && new Date(appointmentToReschedule?.date).toDateString() === rescheduleDate.toDateString();
                          return (
                            <button key={`e-${idx}`} disabled={isCurrent} onClick={() => setRescheduleSlot(slotItem)} className={`time-slot-btn ${rescheduleSlot === slotItem ? 'active' : ''}`} style={{ opacity: isCurrent ? 0.5 : 1, cursor: isCurrent ? 'not-allowed' : 'pointer', fontSize: '13px', padding: '8px 4px' }}>
                              {getSlotDisplay(slotItem)}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {availableSlots.morning.length === 0 && availableSlots.afternoon.length === 0 && availableSlots.evening.length === 0 && (
                    <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px' }}>
                      No slots available for this date.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px', borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
            <button className="btn btn-secondary" onClick={() => setRescheduleModalOpen(false)} disabled={isRescheduling}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={confirmReschedule} disabled={isRescheduling || !rescheduleSlot}>
              {isRescheduling ? "Rescheduling..." : "Confirm Reschedule"}
            </button>
          </div>
        </div>
      </Modal>

      <Toast isOpen={toast.isOpen} message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, isOpen: false })} />
    </main>
  );
}
