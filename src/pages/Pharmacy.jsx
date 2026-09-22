import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  BadgePercent,
  ChevronRight,
  Droplets,
  FileText,
  HeartPulse,
  Info,
  Leaf,
  Lock,
  Minus,
  Pill,
  Plus,
  RotateCcw,
  Search,
  ShieldCheck,
  ShoppingCart,
  SlidersHorizontal,
  Sparkles,
  Trash2,
  Truck,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Modal from "../components/common/Modal";

const categories = ["All", "Prescription", "Supplements", "Personal Care", "Ayurvedic"];

const initialMedicines = [
  { id: 1, name: "Paracetamol 500mg", category: "Prescription", price: 45, oldPrice: 55, discount: "18% OFF", manufacturer: "GSK", icon: Pill },
  { id: 2, name: "Vitamin C Zinc", category: "Supplements", price: 120, oldPrice: 150, discount: "20% OFF", manufacturer: "HealthVeda", icon: Sparkles },
  { id: 3, name: "Cetirizine 10mg", category: "Prescription", price: 30, oldPrice: 40, discount: "25% OFF", manufacturer: "Cipla", icon: Pill },
  { id: 4, name: "Omega 3 Fish Oil", category: "Supplements", price: 599, oldPrice: 899, discount: "33% OFF", manufacturer: "MuscleBlaze", icon: HeartPulse },
  { id: 5, name: "Ashwagandha Extract", category: "Ayurvedic", price: 299, oldPrice: 399, discount: "25% OFF", manufacturer: "Himalaya", icon: Leaf },
  { id: 6, name: "Moisturizing Lotion", category: "Personal Care", price: 250, oldPrice: 299, discount: "16% OFF", manufacturer: "Cetaphil", icon: Droplets }
];

const categoryTheme = {
  Prescription: { accent: "var(--primary)", soft: "var(--primary-light)", tint: "#f7fbfa" },
  Supplements: { accent: "var(--primary)", soft: "var(--primary-light)", tint: "#f7fbfa" },
  "Personal Care": { accent: "var(--primary)", soft: "var(--primary-light)", tint: "#f7fbfa" },
  Ayurvedic: { accent: "var(--primary)", soft: "var(--primary-light)", tint: "#f7fbfa" },
};

function MedicineIcon({ medicine, size = 34 }) {
  const Icon = medicine?.icon || Pill;
  return <Icon size={size} strokeWidth={1.8} aria-hidden="true" />;
}

export default function Pharmacy() {
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("All");
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);
  const go = useNavigate();
  const productsHeadingRef = useRef(null);
  const didMountRef = useRef(false);

  const filteredMedicines = initialMedicines.filter(m =>
    (category === "All" || m.category === category) &&
    m.name.toLowerCase().includes(q.toLowerCase())
  );

  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true;
      return;
    }
    productsHeadingRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [category]);

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

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const clearCart = () => setCart([]);

  const cartTotal = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
  const cartOldTotal = cart.reduce((acc, item) => acc + (item.oldPrice * item.qty), 0);

  const cartCount = cart.reduce((acc, item) => acc + item.qty, 0);

  return (
    <main className="page pharmacy-page-enter pharmacy-page">
      <section className="pharmacy-hero-shell">
        <div className="container">
          <div className="pharmacy-hero-card">
            <div className="pharmacy-hero-copy">
              <div className="pharmacy-hero-icon" aria-hidden="true">
                <Pill size={26} />
              </div>
              <div>
                <h1>Online E-Pharmacy</h1>
                <p>Order medicines online with 100% genuine guarantee.</p>
                <div className="pharmacy-hero-features">
                  <span><BadgeCheck size={17} color="#4ade80" aria-hidden="true" /> 100% Genuine Medicines</span>
                  <span><Truck size={17} color="#67e8f9" aria-hidden="true" /> Free Delivery &gt; ₹500</span>
                </div>
              </div>
            </div>

            <div className="pharmacy-hero-visual" aria-hidden="true">
              <img src="/images/e-pharmacy.png" alt="" />
            </div>

            <button className="pharmacy-cart-button" onClick={() => setIsCartOpen(true)}>
              <span className="pharmacy-cart-icon"><ShoppingCart size={19} /></span>
              <span>Cart ({cartCount})</span>
            </button>
          </div>
        </div>
      </section>

      <section className="container pharmacy-content">
        <button
          className="pharmacy-filter-toggle"
          onClick={() => setShowFiltersMobile(!showFiltersMobile)}
          aria-expanded={showFiltersMobile}
        >
          <span><SlidersHorizontal size={17} /> Filter &amp; Search Medicines</span>
          <ChevronRight
            size={18}
            style={{ transform: showFiltersMobile ? "rotate(90deg)" : "none" }}
          />
        </button>

        <div className="pharmacy-grid">
          <aside className={`pharmacy-sidebar${showFiltersMobile ? " open" : ""}`}>
            <div className="pharmacy-filter-card styled-scrollbar">
              <div className="pharmacy-filter-header">
                <span><SlidersHorizontal size={18} /> Filters</span>
                <button onClick={() => { setQ(""); setCategory("All"); }}>
                  <RotateCcw size={13} /> Reset
                </button>
              </div>

              <label className="pharmacy-search-box">
                <Search size={18} aria-hidden="true" />
                <input
                  placeholder="Search medicines..."
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                />
              </label>

              <div className="pharmacy-filter-group">
                <b>Categories</b>
                <div className="pharmacy-category-options">
                  {categories.map((cat) => (
                    <label key={cat} className={category === cat ? "active" : ""}>
                      <input
                        type="radio"
                        name="pharmacy-category"
                        checked={category === cat}
                        onChange={() => setCategory(cat)}
                      />
                      <span>{cat}</span>
                      <BadgeCheck size={16} aria-hidden="true" />
                    </label>
                  ))}
                </div>
              </div>

              <div className="pharmacy-filter-group">
                <b>Price Range</b>
                <div className="pharmacy-check-options">
                  <label><input type="checkbox" /> Under ₹100</label>
                  <label><input type="checkbox" /> ₹100 - ₹500</label>
                  <label><input type="checkbox" /> ₹500 - ₹1000</label>
                  <label><input type="checkbox" /> Above ₹1000</label>
                </div>
              </div>

              <div className="pharmacy-filter-group">
                <b>Top Brands</b>
                <div className="pharmacy-check-options">
                  <label><input type="checkbox" /> Cipla</label>
                  <label><input type="checkbox" /> Sun Pharma</label>
                  <label><input type="checkbox" /> GSK</label>
                  <label><input type="checkbox" /> Himalaya</label>
                </div>
              </div>
            </div>
          </aside>

          <div className="pharmacy-products-panel">
            <div className="pharmacy-products-heading" ref={productsHeadingRef}>
              <div>
                <h2>{category === "All" ? "All Products" : category}</h2>
              </div>
              <span className="pharmacy-result-count">{filteredMedicines.length} items</span>
            </div>

            <div className="pharmacy-products-grid">
              {filteredMedicines.map((med) => {
                const theme = categoryTheme[med.category] || categoryTheme.Prescription;
                return (
                  <article
                    key={med.id}
                    className="pharmacy-product-card"
                    style={{
                      "--medicine-accent": theme.accent,
                      "--medicine-soft": theme.soft,
                      "--medicine-tint": theme.tint,
                    }}
                  >
                    <div className="pharmacy-product-media">
                      <span className="pharmacy-discount-badge">
                        <BadgePercent size={14} /> {med.discount}
                      </span>
                      <div className="pharmacy-medicine-icon">
                        <MedicineIcon medicine={med} size={44} />
                      </div>
                    </div>
                    <div className="pharmacy-product-body">
                      <span className="pharmacy-category-chip">{med.category}</span>
                      <h3>{med.name}</h3>
                      <p>By {med.manufacturer}</p>
                      <button onClick={() => setSelectedMedicine(med)}>
                        More Details <ChevronRight size={15} />
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <Modal isOpen={Boolean(selectedMedicine)} onClose={() => setSelectedMedicine(null)} title={selectedMedicine?.name || "Medicine Details"} maxWidth="460px">
        {selectedMedicine && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div
              className="pharmacy-detail-visual"
              style={{
                "--medicine-accent": (categoryTheme[selectedMedicine.category] || categoryTheme.Prescription).accent,
                "--medicine-soft": (categoryTheme[selectedMedicine.category] || categoryTheme.Prescription).soft,
              }}
            >
              <MedicineIcon medicine={selectedMedicine} size={64} />
            </div>
            <div>
              <span className="badge badge-primary">{selectedMedicine.category}</span>
              <p className="text-muted mt-2" style={{ fontSize: '14px' }}>By {selectedMedicine.manufacturer}</p>
            </div>
            <div className="flex justify-between items-center" style={{ padding: '16px', borderRadius: '16px', background: 'var(--bg-app)', border: '1px solid var(--border)' }}>
              <div>
                <span className="text-muted" style={{ fontSize: '12px' }}><s>₹{selectedMedicine.oldPrice}</s></span>
                <b style={{ fontSize: '24px', display: 'block', color: 'var(--text-main)' }}>₹{selectedMedicine.price}</b>
              </div>
              <span className="badge badge-accent">{selectedMedicine.discount}</span>
            </div>
            <button className="btn btn-accent" onClick={() => { addToCart(selectedMedicine); setSelectedMedicine(null); }} style={{ width: '100%' }}>
              <ShoppingCart size={17} /> Add to Cart
            </button>
          </div>
        )}
      </Modal>

      {/* Cart Modal */}
      <Modal isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} maxWidth="560px" hideHeader>
       <div style={{ margin: '-24px' }}>
        <div className="pharmacy-cart-header">
          <div className="pharmacy-cart-header-icon"><ShoppingCart size={19} /></div>
          <div className="pharmacy-cart-header-copy">
            <h3>Your Cart</h3>
            <p>Review your medicines and proceed to checkout</p>
          </div>
          <img src="/images/pharmacy-cart.png" alt="" className="pharmacy-cart-header-art" />
          <button className="pharmacy-cart-header-close" onClick={() => setIsCartOpen(false)} aria-label="Close cart">
            <X size={18} />
          </button>
        </div>

        {cart.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
            <ShoppingCart size={48} style={{ opacity: 0.2, margin: '0 auto 16px' }} />
            <p>Your cart is empty.</p>
            <button className="btn btn-secondary mt-4" onClick={() => setIsCartOpen(false)}>Continue Shopping</button>
          </div>
        ) : (
          <div className="pharmacy-cart-content">
            <div className="pharmacy-cart-notice">
              <Info size={15} />
              <span>Checkout &amp; online payment for Pharmacy orders is still in development — full functionality is coming soon.</span>
            </div>

            <div className="pharmacy-cart-count-row">
              <b>{cartCount} {cartCount === 1 ? "Item" : "Items"} in Cart</b>
              <button className="pharmacy-cart-clear-btn" onClick={clearCart}>
                <Trash2 size={14} /> Clear Cart
              </button>
            </div>

            <div className="pharmacy-cart-items styled-scrollbar">
              {cart.map(item => {
                const theme = categoryTheme[item.category] || categoryTheme.Prescription;
                return (
                  <div key={item.id} className="pharmacy-cart-item-card">
                    <div className="pharmacy-cart-item-icon" style={{ color: theme.accent, background: theme.soft }}>
                      <MedicineIcon medicine={item} size={21} />
                    </div>
                    <div className="pharmacy-cart-item-info">
                      <h4>{item.name}</h4>
                      <span className="pharmacy-cart-item-sub">By {item.manufacturer}</span>
                      <span className="pharmacy-cart-item-tag">{item.category}</span>
                      <span className="pharmacy-cart-item-price">₹{item.price}</span>
                    </div>
                    <div className="pharmacy-cart-item-actions">
                      <div className="pharmacy-cart-qty-pill">
                        <button onClick={() => updateQty(item.id, -1)}><Minus size={14} /></button>
                        <b>{item.qty}</b>
                        <button onClick={() => updateQty(item.id, 1)}><Plus size={14} /></button>
                      </div>
                      <button className="pharmacy-cart-item-delete" onClick={() => removeFromCart(item.id)} aria-label={`Remove ${item.name}`}>
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pharmacy-cart-summary">
              <div className="pharmacy-cart-summary-head">
                <span className="pharmacy-cart-summary-icon"><FileText size={16} /></span>
                <b>Order Summary</b>
                <span className="pharmacy-cart-summary-badge"><Truck size={13} /> Delivery charges may vary</span>
              </div>
              <div className="pharmacy-cart-summary-row">
                <span>Item Total ({cartCount} items)</span>
                <span>₹{cartOldTotal}</span>
              </div>
              <div className="pharmacy-cart-summary-row is-discount">
                <span>Total Discount</span>
                <span>- ₹{cartOldTotal - cartTotal}</span>
              </div>
              <div className="pharmacy-cart-summary-row">
                <span>Delivery Fee</span>
                <span>{cartTotal > 500 ? <span className="text-success">FREE</span> : "₹50"}</span>
              </div>
              <div className="pharmacy-cart-summary-total">
                <b>Total to Pay</b>
                <b>₹{cartTotal > 500 ? cartTotal : cartTotal + 50}</b>
              </div>
              <div className="pharmacy-cart-safe-box">
                <ShieldCheck size={18} />
                <div>
                  <b>Safe &amp; Secure Checkout</b>
                  <span>Your information is always protected with us.</span>
                </div>
              </div>
            </div>

            <div className="pharmacy-cart-footer-actions">
              <button className="pharmacy-cart-checkout-btn" onClick={() => { setIsCartOpen(false); go("/payments", { state: { amount: cartTotal > 500 ? cartTotal : cartTotal + 50, type: "Pharmacy Order" } }); }}>
                <Lock size={16} /> Proceed to Checkout <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}
       </div>
      </Modal>

    </main>
  );
}
