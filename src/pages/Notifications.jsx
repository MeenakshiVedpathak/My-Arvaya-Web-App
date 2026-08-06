import { useState, useEffect } from "react";
import { Bell, Calendar, Activity, CreditCard, Gift, AlertCircle, Info, Trash2, CheckCircle2, ChevronRight, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { getNotifications } from "../services/dataService";

function getNotificationMeta(type, title = "") {
  const t = String(type || "").toLowerCase();
  const titleLower = String(title || "").toLowerCase();
  if (t.includes("appoint") || titleLower.includes("appointment")) return { type: "appointment", icon: Calendar, color: "var(--primary)" };
  if (t.includes("lab") || titleLower.includes("lab")) return { type: "lab", icon: Activity, color: "var(--success)" };
  if (t.includes("wallet") || t.includes("pay") || titleLower.includes("wallet") || titleLower.includes("payment")) return { type: "wallet", icon: CreditCard, color: "var(--accent)" };
  if (t.includes("reward") || titleLower.includes("reward") || titleLower.includes("redeem") || (/\bpoints?\b/i.test(titleLower) && !titleLower.includes("appointment"))) return { type: "rewards", icon: Gift, color: "#eab308" };
  if (t.includes("emerg") || titleLower.includes("emerg") || titleLower.includes("ambulance") || titleLower.includes("booking")) return { type: "emergency", icon: AlertCircle, color: "var(--danger)" };
  return { type: t || "general", icon: Info, color: "var(--text-muted)" };
}

function mapNotificationItem(n) {
  const itemTitle = n.title || n.subject || n.name || "Notification";
  const meta = getNotificationMeta(n.type || n.notification_type || n.category, itemTitle);
  
  let timeStr = n.time || n.created_at || n.created_date || n.created_modified_date || "";
  if (timeStr && !isNaN(Date.parse(timeStr))) {
    timeStr = new Date(timeStr).toLocaleString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  }

  return {
    id: n.id || n.notification_id || Math.random(),
    type: meta.type,
    title: itemTitle,
    message: n.message || n.description || n.content || n.text || "",
    time: timeStr || "Recently",
    read: Boolean(n.read ?? n.is_read ?? (n.status === "read" || n.status === 1)),
    icon: meta.icon,
    color: meta.color,
    raw: n
  };
}

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchNotifications("all");
  }, []);

  const fetchNotifications = async (catId = filter) => {
    setLoading(true);
    try {
      let payload = {};
      if (catId === "appointment") {
        payload = { filterQuery: "and title like '%Appointment%'" };
      } else if (catId === "lab") {
        payload = { filterQuery: "and title like '%Lab%'" };
      } else if (catId === "wallet") {
        payload = { filterQuery: "and (title like '%Payment%' or title like '%Wallet%')" };
      } else if (catId === "rewards") {
        payload = { filterQuery: "and (title like '%Redeem%' or title like '%Reward%' or title like '%Points%') and title not like '%Appointment%'" };
      } else if (catId === "emergency") {
        payload = { filterQuery: "and (title like '%Ambulance%' or title like '%Booking%' or title like '%Emergency%')" };
      }

      const data = await getNotifications(payload);
      if (Array.isArray(data) && data.length > 0) {
        setNotifications(data.map(mapNotificationItem));
      } else {
        setNotifications([]);
      }
    } catch (err) {
      console.error("Failed to load notifications:", err);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = async (catId) => {
    setFilter(catId);
    await fetchNotifications(catId);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (id) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === "all") return true;
    if (filter === "appointment") {
      const titleText = String(n.title || n.raw?.title || "").toLowerCase();
      return titleText.includes("appointment");
    }
    if (filter === "lab") {
      const titleText = String(n.title || n.raw?.title || "").toLowerCase();
      return titleText.includes("lab");
    }
    if (filter === "wallet") {
      const titleText = String(n.title || n.raw?.title || "").toLowerCase();
      return titleText.includes("payment") || titleText.includes("wallet");
    }
    if (filter === "rewards") {
      const titleText = String(n.title || n.raw?.title || "").toLowerCase();
      if (titleText.includes("appointment")) return false;
      return titleText.includes("reward") || titleText.includes("redeem") || /\bpoints?\b/i.test(titleText);
    }
    if (filter === "emergency") {
      const titleText = String(n.title || n.raw?.title || "").toLowerCase();
      return titleText.includes("ambulance") || titleText.includes("booking") || titleText.includes("emergency");
    }
    return n.type === filter;
  });

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
              <h1 style={{ fontSize: '24px', fontWeight: '650', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
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
                    onClick={() => handleCategoryClick(cat.id)}
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
            {loading ? (
              <div style={{ padding: '48px', textAlign: 'center', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '16px' }}>
                <Loader2 size={32} color="var(--primary)" style={{ margin: '0 auto 16px auto', animation: 'spin 1s linear infinite' }} />
                <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Loading notifications...</p>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div style={{ padding: '48px', textAlign: 'center', background: 'var(--bg-surface)', border: '1px dashed var(--border)', borderRadius: '16px' }}>
                <Bell size={48} color="var(--border)" style={{ margin: '0 auto 16px auto' }} />
                <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-main)' }}>No Notifications</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>You are all caught up! There are no new alerts in this category.</p>
              </div>
            ) : (
              filteredNotifications.map(notification => (
                <div key={notification.id} className="card-elevated hover-glow notification-item-card" style={{ padding: '20px', borderRadius: '12px', display: 'flex', gap: '16px', background: notification.read ? 'var(--bg-surface)' : 'white', borderLeft: notification.read ? '1px solid var(--border)' : `4px solid ${notification.color}` }}>
                  <div className="notification-icon-box" style={{ width: '40px', height: '40px', borderRadius: '50%', background: `${notification.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <notification.icon size={20} color={notification.color} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {/* Header Row: Title on left, Timestamp + Delete Icon on right (>426px) */}
                    <div className="notification-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px', gap: '8px' }}>
                      <h3 className="notification-title" style={{ fontSize: '15px', fontWeight: notification.read ? '600' : '700', margin: 0, color: 'var(--text-main)' }}>{notification.title}</h3>
                      <div className="notification-meta-right" style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                        <span className="notification-time desktop-time" style={{ fontSize: '12px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{notification.time}</span>
                        <button 
                          onClick={() => deleteNotification(notification.id)}
                          className="notification-delete-btn"
                          style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Mobile Date Row: Date timestamp below title (<=426px) */}
                    <div className="notification-time-row mobile-time-row" style={{ marginBottom: '6px' }}>
                      <span className="notification-time mobile-time" style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{notification.time}</span>
                    </div>

                    {/* Body Message */}
                    <p className="notification-message" style={{ fontSize: '14px', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>{notification.message}</p>
                  </div>
                </div>
              ))
            )}
          </section>

        </div>
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .desktop-time {
          display: inline-block;
        }
        .mobile-time-row {
          display: none;
        }
        @media (max-width: 768px) {
          .notifications-grid { grid-template-columns: 1fr !important; }
          .notifications-sidebar { position: relative !important; top: 0 !important; }
        }
        @media (max-width: 426px) {
          .desktop-time {
            display: none !important;
          }
          .mobile-time-row {
            display: block !important;
          }
          .notification-item-card {
            gap: 12px !important;
          }
          .notification-icon-box {
            width: 32px !important;
            height: 32px !important;
          }
          .notification-icon-box svg {
            width: 16px !important;
            height: 16px !important;
          }
          .notification-title {
            font-size: 14px !important;
          }
          .notification-time {
            font-size: 11px !important;
          }
          .notification-delete-btn svg {
            width: 15px !important;
            height: 15px !important;
          }
          .notification-message {
            font-size: 12.5px !important;
            line-height: 1.4 !important;
          }
        }
        @media (max-width: 320px) {
          .notification-item-card {
            gap: 10px !important;
          }
          .notification-icon-box {
            width: 28px !important;
            height: 28px !important;
          }
          .notification-icon-box svg {
            width: 14px !important;
            height: 14px !important;
          }
          .notification-title {
            font-size: 13px !important;
          }
          .notification-time {
            font-size: 10px !important;
          }
          .notification-delete-btn svg {
            width: 14px !important;
            height: 14px !important;
          }
          .notification-message {
            font-size: 11.5px !important;
            line-height: 1.35 !important;
          }
        }
      `}} />
    </main>
  );
}
