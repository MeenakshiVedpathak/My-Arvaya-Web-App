import { useState } from "react";
import { Package, Truck, CheckCircle2, ChevronRight, FileText, MapPin, Receipt, CreditCard, ChevronLeft } from "lucide-react";
import { Link } from "react-router-dom";

export default function Orders() {
  const allOrders = [
    { id: "ORD-99231", date: "Today, 10:30 AM", status: "Out for Delivery", items: "Paracetamol, Vitamin C", amount: 165, type: "Pharmacy", tracking: 2, address: "Home: 123 Main Street, Sector 4, Bangalore" },
    { id: "ORD-88124", date: "15 Oct 2023", status: "Delivered", items: "Omega 3 Fish Oil, Moisturizing Lotion", amount: 849, type: "Pharmacy", tracking: 3, address: "Office: Arvaya Towers, Koramangala, Bangalore" },
    { id: "ORD-77192", date: "02 Sep 2023", status: "Delivered", items: "Digital Thermometer, Hand Sanitizer", amount: 1250, type: "Pharmacy", tracking: 3, address: "Home: 123 Main Street, Sector 4, Bangalore" }
  ];

  const [selectedOrder, setSelectedOrder] = useState(allOrders[0]);
  const [mobileView, setMobileView] = useState("list"); // 'list' or 'detail' for responsive behavior

  return (
    <main className="page animate-fade-in-up" style={{ padding: 0, background: 'var(--bg-app)' }}>
      {/* ── Internal Hero ── */}
      <div style={{ background: 'var(--bg-surface)', padding: '24px 0', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <div className="flex items-center gap-2 text-muted mb-2" style={{ fontSize: '12px', fontWeight: '500' }}>
            <Link to="/" style={{ transition: 'color 0.2s' }} onMouseOver={e => e.currentTarget.style.color='var(--primary)'} onMouseOut={e => e.currentTarget.style.color=''}>Home</Link> <ChevronRight size={12} /> <span>My Orders</span>
          </div>
          <h1 className="text-h2" style={{ fontSize: '24px', color: 'var(--text-main)' }}>My Orders</h1>
          <p className="text-muted mt-2" style={{ fontSize: '14px' }}>Track your pharmacy and health product orders.</p>
        </div>
      </div>

      <div className="container" style={{ paddingTop: '32px', paddingBottom: '60px' }}>
        <div className="orders-layout" style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: '32px', alignItems: 'start' }}>
          
          {/* ── LEFT: Order List ── */}
          <aside className={`order-list-pane ${mobileView === 'detail' ? 'hide-on-mobile' : ''}`} style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: 'calc(100vh - 200px)', overflowY: 'auto', paddingRight: '8px' }} id="order-list-sidebar">
            {allOrders.map(order => {
              const isSelected = selectedOrder.id === order.id;
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
                    <span style={{ color: 'var(--text-muted)' }}>{order.date}</span>
                    <span style={{ 
                      color: order.status === 'Delivered' ? '#16a34a' : '#d97706',
                      background: order.status === 'Delivered' ? '#dcfce7' : '#fef3c7',
                      padding: '4px 8px', borderRadius: '12px'
                    }}>
                      {order.status}
                    </span>
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
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border)', paddingBottom: '24px', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '4px' }}>Order {selectedOrder.id}</h2>
                <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Placed on {selectedOrder.date}</span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <b style={{ fontSize: '24px', color: 'var(--primary)', display: 'block' }}>₹{selectedOrder.amount}</b>
                <button className="btn btn-secondary mt-2" style={{ padding: '6px 12px', fontSize: '13px' }}>
                  <Receipt size={14} style={{ marginRight: '6px' }} /> Invoice
                </button>
              </div>
            </div>

            {/* Tracking Visuals */}
            <div style={{ background: 'var(--bg-app)', padding: '32px 24px', borderRadius: '16px', marginBottom: '32px', border: '1px solid var(--border)' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '32px', color: 'var(--text-main)' }}>Tracking Status</h3>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', padding: '0 20px' }}>
                <div style={{ position: 'absolute', top: '16px', left: '36px', right: '36px', height: '2px', background: 'var(--border)', zIndex: 0 }}></div>
                
                <div style={{ position: 'absolute', top: '16px', left: '36px', width: selectedOrder.tracking === 1 ? '0%' : selectedOrder.tracking === 2 ? 'calc(50% - 36px)' : 'calc(100% - 72px)', height: '2px', background: 'var(--primary)', zIndex: 0, transition: 'width 0.5s ease-in-out' }}></div>
                
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', zIndex: 1 }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 0 4px var(--bg-app)' }}><Package size={16} /></div>
                  <span style={{ fontSize: '12px', color: 'var(--text-main)', fontWeight: '600' }}>Processing</span>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', zIndex: 1 }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: selectedOrder.tracking >= 2 ? 'var(--primary)' : 'var(--bg-surface)', border: selectedOrder.tracking >= 2 ? 'none' : '2px solid var(--border)', color: selectedOrder.tracking >= 2 ? 'white' : 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 0 4px var(--bg-app)', transition: 'all 0.3s' }}><Truck size={16} /></div>
                  <span style={{ fontSize: '12px', color: selectedOrder.tracking >= 2 ? 'var(--text-main)' : 'var(--text-muted)', fontWeight: '600' }}>Out for Delivery</span>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', zIndex: 1 }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: selectedOrder.tracking >= 3 ? '#16a34a' : 'var(--bg-surface)', border: selectedOrder.tracking >= 3 ? 'none' : '2px solid var(--border)', color: selectedOrder.tracking >= 3 ? 'white' : 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 0 4px var(--bg-app)', transition: 'all 0.3s' }}><CheckCircle2 size={16} /></div>
                  <span style={{ fontSize: '12px', color: selectedOrder.tracking >= 3 ? 'var(--text-main)' : 'var(--text-muted)', fontWeight: '600' }}>Delivered</span>
                </div>
              </div>
            </div>

            {/* Grid for Details */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
              <div>
                <h3 style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Package size={14} /> Items
                </h3>
                <p style={{ fontSize: '14px', color: 'var(--text-main)', lineHeight: '1.6' }}>
                  {selectedOrder.items.split(', ').map((itm, i) => <span key={i} style={{ display: 'block' }}>• {itm}</span>)}
                </p>
              </div>

              <div>
                <h3 style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <MapPin size={14} /> Delivery Address
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
            
          </section>

        </div>
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
