import { useState } from "react";
import { Search, ShoppingCart, Plus, Minus, Tag, Heart, ShieldCheck, Truck, ChevronRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Modal from "../components/common/Modal";

const categories = ["All", "Prescription", "Supplements", "Personal Care", "Ayurvedic"];

const initialMedicines = [
  { id: 1, name: "Paracetamol 500mg", category: "Prescription", price: 45, oldPrice: 55, discount: "18% OFF", manufacturer: "GSK", image: "💊" },
  { id: 2, name: "Vitamin C Zinc", category: "Supplements", price: 120, oldPrice: 150, discount: "20% OFF", manufacturer: "HealthVeda", image: "💊" },
  { id: 3, name: "Cetirizine 10mg", category: "Prescription", price: 30, oldPrice: 40, discount: "25% OFF", manufacturer: "Cipla", image: "💊" },
  { id: 4, name: "Omega 3 Fish Oil", category: "Supplements", price: 599, oldPrice: 899, discount: "33% OFF", manufacturer: "MuscleBlaze", image: "💊" },
  { id: 5, name: "Ashwagandha Extract", category: "Ayurvedic", price: 299, oldPrice: 399, discount: "25% OFF", manufacturer: "Himalaya", image: "🌿" },
  { id: 6, name: "Moisturizing Lotion", category: "Personal Care", price: 250, oldPrice: 299, discount: "16% OFF", manufacturer: "Cetaphil", image: "🧴" }
];

export default function Pharmacy() {
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("All");
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const go = useNavigate();

  const filteredMedicines = initialMedicines.filter(m => 
    (category === "All" || m.category === category) &&
    m.name.toLowerCase().includes(q.toLowerCase())
  );

  const addToCart = (med) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === med.id);
      if (existing) return prev.map(item => item.id === med.id ? { ...item, qty: item.qty + 1 } : item);
      return [...prev, { ...med, qty: 1 }];
    });
  };

  const updateQty = (id, delta) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = item.qty + delta;
        return newQty > 0 ? { ...item, qty: newQty } : item;
      }
      return item;
    }).filter(item => item.qty > 0));
  };

  const cartTotal = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
  const cartOldTotal = cart.reduce((acc, item) => acc + (item.oldPrice * item.qty), 0);

  return (
    <main className="page animate-fade-in-up" style={{ padding: 0, background: 'var(--bg-app)' }}>
      {/* ── Internal Hero ── */}
      <div style={{ background: 'var(--bg-surface)', padding: '24px 0', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <div className="flex items-center gap-2 text-muted mb-2" style={{ fontSize: '12px', fontWeight: '500' }}>
            <Link to="/" style={{ transition: 'color 0.2s' }} onMouseOver={e => e.currentTarget.style.color='var(--primary)'} onMouseOut={e => e.currentTarget.style.color=''}>Home</Link> <ChevronRight size={12} /> <span>Pharmacy</span>
          </div>
          <div className="flex justify-between items-end flex-wrap gap-4">
            <div>
              <h1 className="text-h2" style={{ fontSize: '24px' }}>Online E-Pharmacy</h1>
              <p className="text-muted mt-2" style={{ fontSize: '14px' }}>Order medicines online with 100% genuine guarantee.</p>
            </div>
            <button onClick={() => setIsCartOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--primary)', color: 'white', padding: '0 16px', height: '36px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '600', transition: 'all 0.2s' }} onMouseOver={e => e.currentTarget.style.background='var(--primary-dark)'} onMouseOut={e => e.currentTarget.style.background='var(--primary)'}>
              <ShoppingCart size={16} />
              <span>Cart ({cart.reduce((acc, c) => acc + c.qty, 0)})</span>
            </button>
          </div>
        </div>
      </div>

      <div className="container" style={{ paddingTop: '32px', paddingBottom: '60px' }}>
        <div className="pharmacy-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(240px, 280px) 1fr', gap: '32px' }}>
          
          {/* Left Sidebar: Filters */}
          <aside className="pharmacy-sidebar">
            <div className="card-elevated styled-scrollbar" style={{ position: 'sticky', top: '24px', maxHeight: 'calc(100vh - 48px)', overflowY: 'auto' }}>
              <div className="flex justify-between items-center mb-4 pb-4" style={{ borderBottom: '1px solid var(--border)' }}>
                <b style={{ fontSize: '15px' }}>Filters</b>
                <span className="text-primary cursor-pointer" style={{ fontSize: '12px', fontWeight: '600' }} onClick={() => { setQ(""); setCategory("All"); }}>RESET</span>
              </div>
              
              <div className="flex flex-col gap-6">
                <div>
                  <div className="flex items-center gap-2" style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '8px 12px', transition: 'border-color 0.2s, box-shadow 0.2s', background: 'var(--bg-app)' }} onFocus={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(46, 102, 110, 0.1)'; }} onBlur={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none'; }}>
                    <Search size={16} className="text-muted" />
                    <input 
                      placeholder="Search medicines..." 
                      value={q}
                      onChange={(e) => setQ(e.target.value)}
                      style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '13px', color: 'var(--text-main)' }}
                    />
                  </div>
                </div>

                <div>
                  <b className="text-main mb-3" style={{ fontSize: '14px', display: 'block' }}>Categories</b>
                  <div className="flex flex-col gap-2 text-muted" style={{ fontSize: '13px' }}>
                    {categories.map(cat => (
                      <label key={cat} className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="pharmacy-category" checked={category === cat} onChange={() => setCategory(cat)} style={{ accentColor: 'var(--primary)' }} /> 
                        {cat}
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <b className="text-main mb-3" style={{ fontSize: '14px', display: 'block' }}>Price Range</b>
                  <div className="flex flex-col gap-2 text-muted" style={{ fontSize: '13px' }}>
                    <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" /> Under ₹100</label>
                    <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" /> ₹100 - ₹500</label>
                    <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" /> ₹500 - ₹1000</label>
                    <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" /> Above ₹1000</label>
                  </div>
                </div>

                <div>
                  <b className="text-main mb-3" style={{ fontSize: '14px', display: 'block' }}>Top Brands</b>
                  <div className="flex flex-col gap-2 text-muted" style={{ fontSize: '13px' }}>
                    <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" /> Cipla</label>
                    <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" /> Sun Pharma</label>
                    <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" /> GSK</label>
                    <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" /> Himalaya</label>
                  </div>
                </div>
              </div>
              
              {/* Feature Badges moved to sidebar */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '32px', borderTop: '1px solid var(--border)', paddingTop: '24px' }}>
                 <div style={{ background: '#dcfce7', color: '#16a34a', padding: '12px 16px', borderRadius: '12px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600' }}>
                   <ShieldCheck size={20} /> 100% Genuine Medicines
                 </div>
                 <div style={{ background: '#fef08a', color: '#854d0e', padding: '12px 16px', borderRadius: '12px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600' }}>
                   <Truck size={20} /> Free Delivery &gt; ₹500
                 </div>
              </div>
            </div>
          </aside>

          {/* Right Content: Medicine Grid */}
          <div style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-main)' }}>
                {category === "All" ? "All Products" : category} 
                <span style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: '500', marginLeft: '8px' }}>({filteredMedicines.length} items)</span>
              </h2>
            </div>

            {/* Medicine Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' }}>
          {filteredMedicines.map(med => {
            const inCart = cart.find(c => c.id === med.id);
            return (
              <div key={med.id} className="card-elevated hover-scale" style={{ padding: '16px', display: 'flex', flexDirection: 'column' }}>
                <div style={{ alignSelf: 'flex-start', background: 'rgba(251, 145, 63, 0.1)', color: 'var(--accent)', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '700', marginBottom: '12px' }}>
                  {med.discount}
                </div>
                
                <div style={{ fontSize: '48px', textAlign: 'center', margin: '16px 0', opacity: 0.8 }}>
                  {med.image}
                </div>
                
                <h3 style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-main)', marginBottom: '4px' }}>{med.name}</h3>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>By {med.manufacturer}</span>
                
                <div className="flex justify-between items-end mt-auto" style={{ borderTop: '1px dashed var(--border)', paddingTop: '12px', marginTop: '16px' }}>
                  <div>
                    <span className="text-muted" style={{ fontSize: '12px' }}><s>₹{med.oldPrice}</s></span>
                    <b style={{ fontSize: '18px', display: 'block', color: 'var(--text-main)' }}>₹{med.price}</b>
                  </div>
                  
                  {inCart ? (
                    <div className="flex items-center gap-3" style={{ background: 'var(--primary-light)', padding: '6px 12px', borderRadius: 'var(--radius-full)' }}>
                      <button onClick={() => updateQty(med.id, -1)} style={{ color: 'var(--primary)', cursor: 'pointer' }}><Minus size={14}/></button>
                      <b style={{ fontSize: '14px', color: 'var(--primary-dark)' }}>{inCart.qty}</b>
                      <button onClick={() => updateQty(med.id, 1)} style={{ color: 'var(--primary)', cursor: 'pointer' }}><Plus size={14}/></button>
                    </div>
                  ) : (
                    <button className="btn btn-secondary hover-glow" onClick={() => addToCart(med)} style={{ padding: '8px 16px', fontSize: '13px' }}>
                      Add
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
          </div>
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @media (max-width: 1024px) {
          .pharmacy-grid { grid-template-columns: 1fr !important; }
          .pharmacy-sidebar .card-elevated { position: relative !important; top: 0 !important; max-height: none !important; z-index: 1; margin-bottom: 24px; }
        }
      `}} />

      {/* Cart Modal */}
      <Modal isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} title="Your Cart" maxWidth="500px">
        {cart.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
            <ShoppingCart size={48} style={{ opacity: 0.2, margin: '0 auto 16px' }} />
            <p>Your cart is empty.</p>
            <button className="btn btn-secondary mt-4" onClick={() => setIsCartOpen(false)}>Continue Shopping</button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ maxHeight: '400px', overflowY: 'auto', paddingRight: '8px' }} className="styled-scrollbar">
              {cart.map(item => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', borderBottom: '1px solid var(--border)' }}>
                  <div>
                    <h4 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-main)', marginBottom: '4px' }}>{item.name}</h4>
                    <span style={{ fontSize: '14px', color: 'var(--text-main)' }}>₹{item.price}</span>
                  </div>
                  <div className="flex items-center gap-3" style={{ background: 'var(--bg-app)', padding: '6px 12px', borderRadius: 'var(--radius-full)', border: '1px solid var(--border)' }}>
                    <button onClick={() => updateQty(item.id, -1)} style={{ color: 'var(--text-main)', cursor: 'pointer', background: 'none', border: 'none' }}><Minus size={14}/></button>
                    <b style={{ fontSize: '14px', color: 'var(--text-main)' }}>{item.qty}</b>
                    <button onClick={() => updateQty(item.id, 1)} style={{ color: 'var(--text-main)', cursor: 'pointer', background: 'none', border: 'none' }}><Plus size={14}/></button>
                  </div>
                </div>
              ))}
            </div>
            
            <div style={{ background: 'var(--bg-app)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border)' }}>
              <div className="flex justify-between text-muted mb-2" style={{ fontSize: '14px' }}>
                <span>Item Total</span>
                <span><s>₹{cartOldTotal}</s> ₹{cartTotal}</span>
              </div>
              <div className="flex justify-between text-success mb-2" style={{ fontSize: '14px', fontWeight: '500' }}>
                <span>Total Discount</span>
                <span>- ₹{cartOldTotal - cartTotal}</span>
              </div>
              <div className="flex justify-between text-muted mb-4" style={{ fontSize: '14px' }}>
                <span>Delivery Fee</span>
                <span>{cartTotal > 500 ? <span className="text-success">FREE</span> : "₹50"}</span>
              </div>
              <div className="flex justify-between items-center" style={{ borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
                <b style={{ fontSize: '18px', color: 'var(--text-main)' }}>Total to Pay</b>
                <b style={{ fontSize: '20px', color: 'var(--primary-dark)' }}>₹{cartTotal > 500 ? cartTotal : cartTotal + 50}</b>
              </div>
            </div>

            <button className="btn btn-accent" onClick={() => { setIsCartOpen(false); go("/payments", { state: { amount: cartTotal > 500 ? cartTotal : cartTotal + 50, type: "Pharmacy Order" } }); }} style={{ width: '100%', padding: '14px', fontSize: '16px' }}>
              Proceed to Checkout
            </button>
          </div>
        )}
      </Modal>

    </main>
  );
}
