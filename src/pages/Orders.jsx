import { useState, useEffect } from "react";
import { Package, Truck, CheckCircle2, ChevronRight, FileText, MapPin, Receipt, CreditCard, ChevronLeft, FlaskConical } from "lucide-react";
import { Link } from "react-router-dom";
import { getLabOrderHistory } from "../services/dataService";

function getStoredUserId() {
  try {
    const user = JSON.parse(localStorage.getItem("arvaya_user"));
    return user?.id || user?.user_id || user?.app_user_id || null;
  } catch {
    return null;
  }
}

export default function Orders() {
  const [allOrders, setAllOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [mobileView, setMobileView] = useState("list");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      const patientId = getStoredUserId();
      if (!patientId) {
        setLoading(false);
        return;
      }
      try {
        const labOrders = await getLabOrderHistory(patientId);
        const mappedLabOrders = (Array.isArray(labOrders) ? labOrders : []).map((order, index) => {
          const rawId = order.order_id || order.lab_order_id || order.id || `LAB-${Date.now()}-${index}`;
          const rawDate = order.order_date || order.created_at || order.created_on || order.date || order.orderDate || "Recent";
          const rawStatus = order.order_status || order.status || "Processing";
          const rawItems = order.test_names || order.tests || order.items || order.test_category_name || "Lab Test";
          const rawAmount = order.amount || order.total_amount || order.total || order.amount_paid || 0;
          const rawLab = order.lab_name || order.center_name || order.lab || order.hospital_name || "Arvaya Lab";
          const rawPatient = order.patient_name || order.patient || "";

          let statusTracking = 1;
          const s = String(rawStatus).toLowerCase();
          if (s.includes("deliver") || s.includes("complete") || s.includes("ready") || s.includes("report")) statusTracking = 3;
          else if (s.includes("process") || s.includes("collect") || s.includes("confirm")) statusTracking = 2;

          const parsedDate = (() => {
            if (rawDate && rawDate !== "Recent") {
              const d = new Date(rawDate);
              if (!isNaN(d.getTime())) return d;
            }
            return null;
          })();

          const formattedDate = parsedDate
            ? parsedDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
            : (typeof rawDate === "string" ? rawDate : "Recent");
          const formattedTime = parsedDate
            ? parsedDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
            : "";

          return {
            id: String(rawId),
            date: formattedDate,
            time: formattedTime,
            status: String(rawStatus),
            items: typeof rawItems === "string" ? rawItems : Array.isArray(rawItems) ? rawItems.join(", ") : String(rawItems),
            amount: typeof rawAmount === "number" ? rawAmount : parseFloat(rawAmount) || 0,
            type: "Lab",
            tracking: statusTracking,
            address: rawLab,
            patientName: rawPatient,
            raw: order
          };
        });

        setAllOrders(mappedLabOrders);
        if (mappedLabOrders.length > 0) {
          setSelectedOrder(mappedLabOrders[0]);
        }
      } catch (err) {
        console.error("Failed to fetch lab orders:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, []);

  const isLab = selectedOrder?.type === "Lab";

  return (
    <main className="page animate-fade-in-up" style={{ padding: 0, background: 'var(--bg-app)' }}>
      {/* ── Internal Hero ── */}
      <div style={{ background: 'var(--bg-surface)', padding: '24px 0', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <div className="flex items-center gap-2 text-muted mb-2" style={{ fontSize: '12px', fontWeight: '500' }}>
            <Link to="/" style={{ transition: 'color 0.2s' }} onMouseOver={e => e.currentTarget.style.color='var(--primary)'} onMouseOut={e => e.currentTarget.style.color=''}>Home</Link> <ChevronRight size={12} /> <span>My Orders</span>
          </div>
          <h1 className="text-h2" style={{ fontSize: '24px', color: 'var(--text-main)' }}>My Orders</h1>
          <p className="text-muted mt-2" style={{ fontSize: '14px' }}>Track your lab test orders.</p>
        </div>
      </div>

      <div className="container" style={{ paddingTop: '32px', paddingBottom: '60px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>Loading orders...</div>
        ) : allOrders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>No orders found.</div>
        ) : (
          <div className="orders-layout" style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: '32px', alignItems: 'start' }}>
            
            {/* ── LEFT: Order List ── */}
            <aside className={`order-list-pane ${mobileView === 'detail' ? 'hide-on-mobile' : ''}`} style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: 'calc(100vh - 200px)', overflowY: 'auto', paddingRight: '8px' }} id="order-list-sidebar">
              {allOrders.map(order => {
                const isSelected = selectedOrder?.id === order.id;
                return (
                  <div 
                    key={order.id} 
                    onClick={() => { setSelectedOrder(order); setMobileView('detail'); }}
                    className="card hover-glow cursor-pointer" 
                    style={{ 
                      padding: '16px', 
                      border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border)',
                      background: isSelected ? 'var(--primary-light)' : 'var(--bg-surface)',
                      transition: 'all 0.2s',
                      position: 'relative',
                      borderRadius: '16px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <b style={{ fontSize: '15px', color: isSelected ? 'var(--primary-dark)' : 'var(--text-main)' }}>{order.id}</b>
                      <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-main)' }}>₹{order.amount}</span>
                    </div>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '12px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {order.items}
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', fontWeight: '500' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <span style={{ color: 'var(--text-muted)' }}>{order.date}</span>
                        {order.time && <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>{order.time}</span>}
                      </div>
                      <span style={{ 
                        color: order.status === 'Delivered' || order.status === 'Completed' || order.status === 'Ready' ? '#16a34a' : '#d97706',
                        background: order.status === 'Delivered' || order.status === 'Completed' || order.status === 'Ready' ? '#dcfce7' : '#fef3c7',
                        padding: '4px 8px', borderRadius: '12px'
                      }}>
                        {order.status}
                      </span>
                    </div>
                    <div style={{ marginTop: '8px', fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <FlaskConical size={12} />
                      <span>{order.type}</span>
                    </div>
                  </div>
                )
              })}
            </aside>

            {/* ── RIGHT: Order Detail ── */}
            <section className={`order-detail-pane card-elevated ${mobileView === 'list' ? 'hide-on-mobile' : ''}`} style={{ padding: '32px', borderRadius: '24px' }}>
              <button 
                className="btn btn-secondary mobile-only mb-4" 
                onClick={() => setMobileView('list')}
                style={{ padding: '8px 12px', fontSize: '13px' }}
              >
                <ChevronLeft size={16} /> Back to Orders
              </button>
              
              {selectedOrder && (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border)', paddingBottom: '24px', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
                    <div>
                      <h2 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '4px' }}>
                        Lab Order {selectedOrder.id}
                      </h2>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                        <span>Booked on {selectedOrder.date}</span>
                        {selectedOrder.time && (
                          <>
                            <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--text-muted)' }}></span>
                            <span>at {selectedOrder.time}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <b style={{ fontSize: '24px', color: 'var(--primary)', display: 'block' }}>₹{selectedOrder.amount}</b>
                      <button className="btn btn-secondary mt-2" style={{ padding: '6px 12px', fontSize: '13px' }}>
                        <Receipt size={14} style={{ marginRight: '6px' }} /> Invoice
                      </button>
                    </div>
                  </div>

                  <div style={{ background: 'var(--bg-app)', padding: '32px 24px', borderRadius: '16px', marginBottom: '32px', border: '1px solid var(--border)' }}>
                    <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '32px', color: 'var(--text-main)' }}>Order Status</h3>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', padding: '0 20px' }}>
                      <div style={{ position: 'absolute', top: '16px', left: '36px', right: '36px', height: '2px', background: 'var(--border)', zIndex: 0 }}></div>
                      <div style={{ position: 'absolute', top: '16px', left: '36px', width: selectedOrder.tracking === 1 ? '0%' : selectedOrder.tracking === 2 ? 'calc(50% - 36px)' : 'calc(100% - 72px)', height: '2px', background: 'var(--primary)', zIndex: 0, transition: 'width 0.5s ease-in-out' }}></div>
                      
                      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', flex: 1 }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: selectedOrder.tracking >= 1 ? 'var(--primary)' : 'var(--bg-surface)', border: selectedOrder.tracking >= 1 ? 'none' : '2px solid var(--border)', color: selectedOrder.tracking >= 1 ? 'white' : 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 0 4px var(--bg-app)', transition: 'all 0.3s' }}><FileText size={16} /></div>
                        <span style={{ fontSize: '12px', color: selectedOrder.tracking >= 1 ? 'var(--text-main)' : 'var(--text-muted)', fontWeight: '600', textAlign: 'center' }}>Confirmed</span>
                      </div>
                      
                      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', flex: 1 }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: selectedOrder.tracking >= 2 ? 'var(--primary)' : 'var(--bg-surface)', border: selectedOrder.tracking >= 2 ? 'none' : '2px solid var(--border)', color: selectedOrder.tracking >= 2 ? 'white' : 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 0 4px var(--bg-app)', transition: 'all 0.3s' }}><FlaskConical size={16} /></div>
                        <span style={{ fontSize: '12px', color: selectedOrder.tracking >= 2 ? 'var(--text-main)' : 'var(--text-muted)', fontWeight: '600', textAlign: 'center' }}>Processing</span>
                      </div>
                      
                      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', flex: 1 }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: selectedOrder.tracking >= 3 ? '#16a34a' : 'var(--bg-surface)', border: selectedOrder.tracking >= 3 ? 'none' : '2px solid var(--border)', color: selectedOrder.tracking >= 3 ? 'white' : 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 0 4px var(--bg-app)', transition: 'all 0.3s' }}><CheckCircle2 size={16} /></div>
                        <span style={{ fontSize: '12px', color: selectedOrder.tracking >= 3 ? 'var(--text-main)' : 'var(--text-muted)', fontWeight: '600', textAlign: 'center' }}>Report Ready</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
                    <div>
                      <h3 style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <FlaskConical size={14} /> Tests
                      </h3>
                      <p style={{ fontSize: '14px', color: 'var(--text-main)', lineHeight: '1.6' }}>
                        {selectedOrder.items.split(', ').map((itm, i) => <span key={i} style={{ display: 'block' }}>• {itm}</span>)}
                      </p>
                    </div>

                    <div>
                      <h3 style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <MapPin size={14} /> Lab / Center
                      </h3>
                      <p style={{ fontSize: '14px', color: 'var(--text-main)', lineHeight: '1.6' }}>
                        {selectedOrder.address}
                      </p>
                    </div>

                    <div>
                      <h3 style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <CreditCard size={14} /> Payment
                      </h3>
                      <p style={{ fontSize: '14px', color: 'var(--text-main)', lineHeight: '1.6' }}>
                        Paid via Arvaya Wallet<br/>
                        <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Txn: TXN-098231</span>
                      </p>
                    </div>
                  </div>
                </>
              )}
            </section>

          </div>
        )}
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @media (max-width: 900px) {
          .orders-layout { grid-template-columns: 1fr !important; }
          .hide-on-mobile { display: none !important; }
          .mobile-only { display: inline-flex !important; }
        }
        @media (min-width: 901px) {
          .mobile-only { display: none !important; }
        }
        #order-list-sidebar::-webkit-scrollbar { width: 4px; }
        #order-list-sidebar::-webkit-scrollbar-thumb { background: var(--border); border-radius: 4px; }
      `}} />
    </main>
  );
}
