import { useState } from "react";
import { Bell, Calendar, Activity, CreditCard, Gift, AlertCircle, Info, Trash2, CheckCircle2, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

const initialNotifications = [
  { id: 1, type: "appointment", title: "Appointment Confirmed", message: "Your consultation with Dr. Sarah Smith is confirmed for tomorrow at 10:00 AM.", time: "10 mins ago", read: false, icon: Calendar, color: "var(--primary)" },
  { id: 2, type: "lab", title: "Lab Results Ready", message: "Your Complete Blood Count (CBC) report is now available to view and download.", time: "2 hours ago", read: false, icon: Activity, color: "var(--success)" },
  { id: 3, type: "wallet", title: "Wallet Recharge Successful", message: "₹500 has been successfully added to your Arvaya Wallet.", time: "Yesterday", read: true, icon: CreditCard, color: "var(--accent)" },
  { id: 4, type: "rewards", title: "You earned 50 Points!", message: "Thanks for completing your medical profile. 50 loyalty points have been credited.", time: "Yesterday", read: true, icon: Gift, color: "#eab308" },
  { id: 5, type: "emergency", title: "Emergency Contact Added", message: "Jane Doe was successfully added as your primary emergency contact.", time: "2 days ago", read: true, icon: AlertCircle, color: "var(--danger)" },
  { id: 6, type: "general", title: "Welcome to Arvaya", message: "Thank you for joining the Arvaya Patient Portal. Start exploring your healthcare dashboard today.", time: "1 week ago", read: true, icon: Info, color: "var(--text-muted)" }
];

export default function Notifications() {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [filter, setFilter] = useState("all");

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (id) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const filteredNotifications = notifications.filter(n => filter === "all" || n.type === filter);

  return (
    <main className="page animate-fade-in-up" style={{ padding: 0, background: 'var(--bg-app)' }}>
      
      {/* ── Internal Hero ── */}
      <div style={{ background: 'var(--bg-surface)', padding: '24px 0', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <div className="flex items-center gap-2 text-muted mb-2" style={{ fontSize: '12px', fontWeight: '500' }}>
            <Link to="/" style={{ transition: 'color 0.2s' }} onMouseOver={e => e.currentTarget.style.color='var(--primary)'} onMouseOut={e => e.currentTarget.style.color=''}>Home</Link> <ChevronRight size={12} /> <span>Notifications</span>
          </div>
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div>
              <h1 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                Notifications {unreadCount > 0 && <span style={{ background: 'var(--danger)', color: 'white', fontSize: '12px', padding: '2px 8px', borderRadius: '99px', verticalAlign: 'middle' }}>{unreadCount} New</span>}
              </h1>
              <p className="text-muted mt-1" style={{ fontSize: '14px' }}>Stay updated with your appointments and health alerts.</p>
            </div>
            <button 
              className="btn btn-secondary hover-glow"
              onClick={markAllRead}
              style={{ padding: '8px 16px', fontSize: '13px', borderRadius: 'var(--radius-full)' }}
              disabled={unreadCount === 0}
            >
              <CheckCircle2 size={16} /> Mark all as read
            </button>
          </div>
        </div>
      </div>

      <div className="container" style={{ paddingTop: '32px', paddingBottom: '60px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(240px, 280px) 1fr', gap: '32px', alignItems: 'start' }} className="notifications-grid">
          
          {/* Sidebar Filters */}
          <aside className="notifications-sidebar" style={{ position: 'sticky', top: '24px' }}>
            <div className="card-elevated" style={{ padding: '16px', borderRadius: '16px' }}>
              <h3 style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-main)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.05em', paddingLeft: '8px' }}>Categories</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {[
                  { id: "all", label: "All Notifications" },
                  { id: "appointment", label: "Appointments" },
                  { id: "lab", label: "Lab Reports" },
                  { id: "wallet", label: "Wallet & Payments" },
                  { id: "rewards", label: "Rewards" },
                  { id: "emergency", label: "Emergency" }
                ].map(cat => (
                  <button 
                    key={cat.id}
                    onClick={() => setFilter(cat.id)}
                    style={{ 
                      textAlign: 'left', 
                      padding: '10px 16px', 
                      borderRadius: '12px',
                      fontSize: '14px',
                      fontWeight: filter === cat.id ? '600' : '500',
                      color: filter === cat.id ? 'var(--primary-dark)' : 'var(--text-muted)',
                      background: filter === cat.id ? 'var(--primary-light)' : 'transparent',
                      transition: 'all 0.2s',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                    onMouseOver={e => { if(filter !== cat.id) e.currentTarget.style.background = 'var(--bg-app)'; }}
                    onMouseOut={e => { if(filter !== cat.id) e.currentTarget.style.background = 'transparent'; }}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Notifications List */}
          <section style={{ display: 'flex', flexDirection: 'column', gap: '16px', minWidth: 0, maxHeight: 'calc(100vh - 220px)', overflowY: 'auto', paddingRight: '12px', paddingBottom: '24px' }} className="styled-scrollbar">
            {filteredNotifications.length === 0 ? (
              <div style={{ padding: '48px', textAlign: 'center', background: 'var(--bg-surface)', border: '1px dashed var(--border)', borderRadius: '16px' }}>
                <Bell size={48} color="var(--border)" style={{ margin: '0 auto 16px auto' }} />
                <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-main)' }}>No Notifications</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>You are all caught up! There are no new alerts in this category.</p>
              </div>
            ) : (
              filteredNotifications.map(notification => (
                <div key={notification.id} className="card-elevated hover-glow" style={{ padding: '20px', borderRadius: '12px', display: 'flex', gap: '16px', background: notification.read ? 'var(--bg-surface)' : 'white', borderLeft: notification.read ? '1px solid var(--border)' : `4px solid ${notification.color}` }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: `${notification.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <notification.icon size={20} color={notification.color} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                      <h3 style={{ fontSize: '15px', fontWeight: notification.read ? '600' : '700', margin: 0, color: 'var(--text-main)' }}>{notification.title}</h3>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{notification.time}</span>
                    </div>
                    <p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5, paddingRight: '24px' }}>{notification.message}</p>
                  </div>
                  <button 
                    onClick={() => deleteNotification(notification.id)}
                    style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px', alignSelf: 'flex-start' }}
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))
            )}
          </section>

        </div>
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        @media (max-width: 768px) {
          .notifications-grid { grid-template-columns: 1fr !important; }
          .notifications-sidebar { position: relative !important; top: 0 !important; }
        }
      `}} />
    </main>
  );
}
