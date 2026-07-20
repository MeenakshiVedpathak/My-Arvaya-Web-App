import { Gift, Clock, CheckCircle2, ChevronRight, Crown, Sparkles, Percent, Plus } from "lucide-react";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function Rewards() {
  const go = useNavigate();
  const [points] = useState(1250);

  const offers = [
    {
      id: 1,
      title: "Flat ₹100 off",
      subtitle: "On your first appointment booking",
      points: 120,
      badge: "Ending Soon",
      icon: Clock,
      color: "#2E666E"
    },
    {
      id: 2,
      title: "Free Consultation",
      subtitle: "Redeem for any specialist visit",
      points: 250,
      badge: "Most Popular",
      icon: Sparkles,
      color: "#FB913F"
    },
    {
      id: 3,
      title: "20% Pharmacy Discount",
      subtitle: "On all medicine orders",
      points: 180,
      badge: "Trending",
      icon: Percent,
      color: "#3D7A83"
    },
    {
      id: 4,
      title: "Premium Health Package",
      subtitle: "Full body checkup at partner labs",
      points: 320,
      badge: "Plus Exclusive",
      icon: Crown,
      color: "#1F4F57"
    }
  ];

  return (
    <main className="page" style={{ background: 'var(--bg-app)' }}>
      <div style={{ background: 'var(--bg-surface)', padding: '24px 0', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <div className="flex items-center gap-2 text-muted mb-2" style={{ fontSize: '12px', fontWeight: '500' }}>
            <Link to="/" className="hover:text-primary">Home</Link> <ChevronRight size={12} /> <span>Rewards</span>
          </div>
          <h1 className="text-h2" style={{ fontSize: '24px' }}>Arvaya Rewards</h1>
          <p className="text-muted mt-2" style={{ fontSize: '15px' }}>Redeem your points for exclusive healthcare benefits.</p>
        </div>
      </div>

      <div className="container" style={{ paddingBottom: '40px', paddingTop: '24px' }}>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px' }} className="rewards-grid">

          {/* Main Content */}
          <section>
            {/* Membership Header */}
            <div className="card-elevated hover-glow" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px', background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))', marginBottom: '32px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: '-50%', left: '-10%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)', borderRadius: '50%' }}></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ width: '56px', height: '56px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.3)' }}>
                    <Crown size={28} color="#FDBF8B" />
                  </div>
                  <div>
                    <h2 style={{ fontSize: '24px', fontWeight: '800', color: 'white', margin: '0 0 4px 0' }}>Arvaya Plus</h2>
                    <p style={{ color: '#FDBF8B', fontSize: '14px', margin: 0, fontWeight: '500' }}>Gold Tier Member</p>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', margin: '0 0 4px 0', fontWeight: '600', textTransform: 'uppercase' }}>Total Points</p>
                  <b style={{ fontSize: '32px', color: 'white', lineHeight: 1 }}>{points.toLocaleString()}</b>
                </div>
              </div>
            </div>

            <h2 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-main)', marginBottom: '16px' }}>Coupons & Scratch Cards</h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
              {offers.map(offer => (
                <div key={offer.id} className="hover-glow" style={{ cursor: 'pointer', display: 'flex', borderRadius: '12px', background: 'var(--bg-surface)', position: 'relative', overflow: 'hidden' }} onClick={() => alert("Redeeming offer: " + offer.title)}>
                  
                  {/* Left Perforated Section (Icon) */}
                  <div style={{ width: '80px', background: `${offer.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRight: '2px dashed var(--border)', position: 'relative' }}>
                    <div style={{ position: 'absolute', top: '-10px', right: '-10px', width: '20px', height: '20px', borderRadius: '50%', background: 'var(--bg-app)', border: '1px solid var(--border)', borderTop: 'none', borderRight: 'none' }}></div>
                    <div style={{ position: 'absolute', bottom: '-10px', right: '-10px', width: '20px', height: '20px', borderRadius: '50%', background: 'var(--bg-app)', border: '1px solid var(--border)', borderBottom: 'none', borderRight: 'none' }}></div>
                    <offer.icon size={32} color={offer.color} />
                  </div>

                  {/* Right Content Section */}
                  <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <span style={{ fontSize: '11px', fontWeight: '700', color: offer.color, background: `${offer.color}20`, padding: '2px 8px', borderRadius: '4px', textTransform: 'uppercase' }}>{offer.badge}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#FB913F', fontWeight: '700', fontSize: '14px' }}>
                        <Gift size={14} /> {offer.points}
                      </div>
                    </div>
                    
                    <div>
                      <h3 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text-main)', margin: '4px 0' }}>{offer.title}</h3>
                      <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: 0, lineHeight: 1.4 }}>{offer.subtitle}</p>
                    </div>

                    <div style={{ marginTop: 'auto', paddingTop: '12px', color: 'var(--primary)', fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      Redeem Now <ChevronRight size={14} />
                    </div>
                  </div>

                </div>
              ))}
            </div>
          </section>

          {/* Right Sidebar: Benefits */}
          <aside>
            <div className="card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-main)', marginBottom: '20px' }}>Your Plus Benefits</h3>
              
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {[
                  "Free delivery on pharmacy orders above ₹499",
                  "Extra 5% cashback on all lab tests",
                  "Priority customer support 24/7",
                  "Zero cancellation fees for doctor appointments"
                ].map((benefit, i) => (
                  <li key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <CheckCircle2 size={18} color="#16a34a" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span style={{ fontSize: '14px', color: 'var(--text-main)', lineHeight: 1.5 }}>{benefit}</span>
                  </li>
                ))}
              </ul>

              <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
                <Link to="/" style={{ color: 'var(--primary)', fontSize: '14px', fontWeight: '600' }}>View Membership Details</Link>
              </div>
            </div>
          </aside>

        </div>
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        @media (max-width: 900px) {
          .rewards-grid { grid-template-columns: 1fr !important; }
        }
      `}} />
    </main>
  );
}
