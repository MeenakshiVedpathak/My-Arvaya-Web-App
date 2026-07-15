import { Phone, Clock, AlertTriangle, ArrowRight, Truck, MapPin, Map, Navigation2 } from "lucide-react";
import { Link } from "react-router-dom";

export default function Ambulance() {
  return (
    <main className="page" style={{ padding: 0, background: 'var(--bg-app)' }}>
      {/* ── Hero Banner ── */}
      <section style={{ background: '#dc2626', color: 'white', padding: '60px 0', position: 'relative', overflow: 'hidden' }}>
        <div className="container" style={{ position: 'relative', zIndex: 10 }}>
          <div className="flex flex-col gap-6" style={{ maxWidth: '600px' }}>
            <div className="badge" style={{ background: 'rgba(255,255,255,0.2)', width: 'fit-content' }}>
              <AlertTriangle size={16} /> 24/7 EMERGENCY RESPONSE
            </div>
            <h1 className="text-h1" style={{ fontSize: '48px', color: 'white' }}>Fastest Ambulance<br/>at your doorstep.</h1>
            <p style={{ fontSize: '18px', opacity: 0.9, lineHeight: 1.6 }}>
              In case of medical emergencies, get an ALS or BLS ambulance dispatched instantly with live tracking.
            </p>
            
            <div className="card mt-4" style={{ background: 'white', padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderRadius: 'var(--radius-lg)' }}>
              <div>
                <b style={{ color: 'var(--text-main)', fontSize: '18px', display: 'block' }}>Call for immediate dispatch</b>
                <span className="text-muted" style={{ fontSize: '14px' }}>Avg. response time: 8 mins</span>
              </div>
              <button className="btn" style={{ background: '#dc2626', color: 'white', fontSize: '24px', padding: '16px 32px', borderRadius: 'var(--radius-full)' }}>
                <Phone size={24} style={{ marginRight: '12px' }}/> 1066
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Book Ambulance Form & Map ── */}
      <section className="container" style={{ padding: '60px 24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
        
        {/* Form */}
        <div className="card-elevated">
          <h2 className="text-h3 mb-6">Book an Ambulance</h2>
          <div className="flex flex-col gap-4">
            <div>
              <label className="text-main" style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', display: 'block' }}>Pickup Location</label>
              <div className="flex items-center gap-2 input-field">
                <MapPin size={16} className="text-muted" />
                <input placeholder="Enter current location" style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '14px' }} defaultValue="Koramangala, Bangalore" />
              </div>
            </div>
            
            <div>
              <label className="text-main" style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', display: 'block' }}>Drop Location</label>
              <div className="flex items-center gap-2 input-field">
                <HeartPulse size={16} className="text-muted" />
                <input placeholder="Enter hospital name" style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '14px' }} defaultValue="Apollo Hospital, Jayanagar" />
              </div>
            </div>

            <div>
              <label className="text-main" style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', display: 'block' }}>Ambulance Type</label>
              <select className="input-field">
                <option>Basic Life Support (BLS)</option>
                <option>Advanced Life Support (ALS / ICU)</option>
                <option>Patient Transport Vehicle</option>
              </select>
            </div>

            <button className="btn mt-4" style={{ background: '#dc2626', color: 'white', padding: '16px', fontSize: '16px' }}>
              Confirm Booking
            </button>
          </div>
        </div>

        {/* Live Tracking Map Mock */}
        <div style={{ background: '#e2e8f0', borderRadius: 'var(--radius-lg)', position: 'relative', overflow: 'hidden', minHeight: '400px' }}>
          {/* Mock Map Background */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.5, backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
          
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ background: '#dc2626', color: 'white', padding: '12px', borderRadius: '50%', boxShadow: 'var(--shadow-md)' }}>
              <Navigation2 size={32} />
            </div>
            <div className="card mt-4" style={{ textAlign: 'center', padding: '16px' }}>
              <b className="text-main" style={{ display: 'block' }}>Searching for nearest ambulance...</b>
              <span className="text-muted" style={{ fontSize: '13px' }}>Connecting to dispatch</span>
            </div>
          </div>
        </div>

      </section>

      {/* ── Features ── */}
      <section style={{ background: 'var(--bg-surface)', padding: '60px 0', borderTop: '1px solid var(--border)' }}>
        <div className="container">
          <h2 className="text-h2 text-center mb-12">Why Choose Arvaya Emergency Network?</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '32px' }}>
            {[
              { title: "Under 15 Mins Response", desc: "Our dense network of GPS-tracked ambulances ensures the fastest reach time.", icon: <Clock size={32} className="text-primary"/> },
              { title: "ICU on Wheels", desc: "ALS ambulances equipped with ventilators, defibrillators, and emergency medicines.", icon: <Truck size={32} className="text-primary"/> },
              { title: "Trained Paramedics", desc: "Certified emergency responders and paramedics on board to stabilize the patient.", icon: <AlertTriangle size={32} className="text-primary"/> }
            ].map(f => (
              <div key={f.title} className="card text-center flex flex-col items-center" style={{ padding: '32px' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                  {f.icon}
                </div>
                <h3 className="text-h3 mb-2">{f.title}</h3>
                <p className="text-muted" style={{ fontSize: '14px' }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
// Required import placeholder for HeartPulse to avoid error since I missed it in imports
import { HeartPulse } from "lucide-react";
