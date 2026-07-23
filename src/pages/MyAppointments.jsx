import { useState } from "react";
import { Calendar as CalendarIcon, Clock, MapPin, Video, User, CheckCircle, XCircle, AlertCircle, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

// Mock Data
const mockAppointments = [
  { id: 1, doctor: "Dr. Sarah Smith", specialty: "Cardiologist", date: "2024-05-20", time: "10:00 AM", type: "In-Person", hospital: "Apollo Hospitals", status: "upcoming", image: "https://i.pravatar.cc/150?u=sarah" },
  { id: 2, doctor: "Dr. John Doe", specialty: "Dermatologist", date: "2024-05-22", time: "02:30 PM", type: "Video Consult", hospital: "Arvaya Telehealth", status: "upcoming", image: "https://i.pravatar.cc/150?u=john" },
  { id: 3, doctor: "Dr. Emily Chen", specialty: "Pediatrician", date: "2024-04-10", time: "11:15 AM", type: "In-Person", hospital: "Fortis Clinic", status: "completed", image: "https://i.pravatar.cc/150?u=emily" },
  { id: 4, doctor: "Dr. Michael Brown", specialty: "Orthopedic", date: "2024-03-05", time: "04:00 PM", type: "In-Person", hospital: "Manipal Hospital", status: "cancelled", image: "https://i.pravatar.cc/150?u=mike" }
];

export default function MyAppointments() {
  const [activeTab, setActiveTab] = useState("upcoming");
  const [appointments, setAppointments] = useState(mockAppointments);

  const filteredAppointments = appointments.filter(apt => apt.status === activeTab);

  const handleCancel = (id) => {
    if(window.confirm("Are you sure you want to cancel this appointment?")) {
      setAppointments(prev => prev.map(apt => apt.id === id ? { ...apt, status: "cancelled" } : apt));
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

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '16px', borderBottom: '1px solid var(--border)', marginBottom: '24px', overflowX: 'auto' }} className="no-scrollbar">
        {["upcoming", "completed", "cancelled"].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '12px 16px',
              fontSize: '15px',
              fontWeight: activeTab === tab ? '700' : '500',
              color: activeTab === tab ? 'var(--primary)' : 'var(--text-muted)',
              borderBottom: activeTab === tab ? '3px solid var(--primary)' : '3px solid transparent',
              background: 'transparent',
              textTransform: 'capitalize',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s',
              borderTop: 'none',
              borderLeft: 'none',
              borderRight: 'none',
              cursor: 'pointer'
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {filteredAppointments.length === 0 ? (
          <div style={{ padding: '64px 20px', textAlign: 'center', background: 'var(--bg-surface)', border: '1px dashed var(--border)', borderRadius: '16px' }}>
            <CalendarIcon size={48} color="var(--border)" style={{ margin: '0 auto 16px auto' }} />
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-main)', marginBottom: '8px' }}>No {activeTab} appointments</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>You don't have any {activeTab} appointments at the moment.</p>
          </div>
        ) : (
          filteredAppointments.map(apt => (
            <div key={apt.id} className="card-elevated" style={{ padding: '24px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Top Row: Doctor Info & Status */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <img src={apt.image} alt={apt.doctor} style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--bg-surface)', boxShadow: 'var(--shadow-sm)' }} />
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
              </div>

              {/* Bottom Row: Actions */}
              {apt.status === "upcoming" && (
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
                  <button onClick={() => handleCancel(apt.id)} className="btn hover-glow" style={{ background: 'transparent', border: '1px solid var(--danger, #dc2626)', color: 'var(--danger, #dc2626)', padding: '8px 16px', fontSize: '13px' }}>
                    Cancel
                  </button>
                  <button className="btn btn-secondary hover-glow" style={{ padding: '8px 16px', fontSize: '13px' }}>
                    Reschedule
                  </button>
                  {apt.type === "Video Consult" && (
                    <button className="btn btn-primary hover-glow" style={{ padding: '8px 16px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Video size={16} /> Join Call
                    </button>
                  )}
                </div>
              )}
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
    </main>
  );
}
