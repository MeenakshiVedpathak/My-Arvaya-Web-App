import { useState } from "react";
import { Search, ChevronRight, ThumbsUp, MapPin, Calendar, CheckCircle2, Clock } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useBooking } from "../context/BookingContext";
import { doctors } from "../mocks/data";
import Avatar from "../components/common/Avatar";

export default function Doctors() {
  const [q, setQ] = useState("");
  const { setDoctor } = useBooking();
  const go = useNavigate();

  const handleSelect = (doc) => {
    setDoctor(doc);
    go("/doctor");
  };

  return (
    <main className="page" style={{ padding: 0, background: 'var(--bg-app)' }}>
      {/* ── Breadcrumb & Title ── */}
      <div style={{ background: 'var(--bg-surface)', padding: '24px 0', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <div className="flex items-center gap-2 text-muted mb-2" style={{ fontSize: '12px', fontWeight: '500' }}>
            <Link to="/" className="hover:text-primary">Home</Link> <ChevronRight size={12} /> <span>Doctors in Bangalore</span>
          </div>
          <h1 className="text-h2" style={{ fontSize: '24px' }}>Top Doctors to Consult in Bangalore</h1>
        </div>
      </div>

      <div className="container" style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '24px', paddingTop: '24px', paddingBottom: '80px' }}>
        
        {/* ── Sidebar Filters ── */}
        <aside>
          <div className="card">
            <div className="flex justify-between items-center mb-4 pb-4" style={{ borderBottom: '1px solid var(--border)' }}>
              <b style={{ fontSize: '15px' }}>Filters</b>
              <span className="text-primary cursor-pointer" style={{ fontSize: '12px', fontWeight: '600' }}>RESET</span>
            </div>
            
            <div className="flex flex-col gap-6">
              <div>
                <b className="text-main mb-3" style={{ fontSize: '14px', display: 'block' }}>Gender</b>
                <div className="flex gap-2">
                  <button className="badge" style={{ background: 'var(--bg-app)', border: '1px solid var(--border)', padding: '6px 12px', fontWeight: 'normal', color: 'var(--text-main)' }}>Male Doctor</button>
                  <button className="badge" style={{ background: 'var(--bg-app)', border: '1px solid var(--border)', padding: '6px 12px', fontWeight: 'normal', color: 'var(--text-main)' }}>Female Doctor</button>
                </div>
              </div>

              <div>
                <b className="text-main mb-3" style={{ fontSize: '14px', display: 'block' }}>Consultation Fee</b>
                <div className="flex flex-col gap-2 text-muted" style={{ fontSize: '13px' }}>
                  <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" /> Free</label>
                  <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" /> ₹1 - ₹500</label>
                  <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" /> ₹500+</label>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* ── Doctor List ── */}
        <section>
          <div className="flex justify-between items-center mb-6">
            <p className="text-main" style={{ fontSize: '14px', fontWeight: '600' }}>{doctors.length} Doctors available in Bangalore</p>
            <div className="flex items-center gap-2">
              <span className="text-muted" style={{ fontSize: '13px' }}>Sort By:</span>
              <select className="input-field" style={{ width: 'auto', padding: '6px 12px', height: 'auto' }}>
                <option>Relevance</option>
                <option>Experience - High to Low</option>
                <option>Fee - Low to High</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {doctors.map(d => (
              <div key={d.id} className="card card-hover flex gap-6" style={{ padding: '20px' }}>
                <Avatar doctor={d} size="80px" />
                
                <div className="flex flex-col flex-1 border-r" style={{ borderRight: '1px solid var(--border)', paddingRight: '24px' }}>
                  <b className="text-primary cursor-pointer hover:underline" style={{ fontSize: '18px', marginBottom: '4px' }} onClick={() => handleSelect(d)}>{d.name}</b>
                  <p className="text-muted mb-1" style={{ fontSize: '14px' }}>{d.specialty}</p>
                  <p className="text-main mb-3" style={{ fontSize: '13px', fontWeight: '500' }}>{d.experience} Experience overall</p>
                  
                  <div className="flex items-center gap-2 text-main mb-1" style={{ fontSize: '13px', fontWeight: '500' }}>
                    <b style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>{d.hospital}</b>
                  </div>
                  <div className="flex items-center gap-1 text-muted mb-4" style={{ fontSize: '12px' }}>
                    <MapPin size={12} /> Bangalore
                  </div>

                  <div className="flex items-center gap-4 text-muted" style={{ fontSize: '13px', marginTop: 'auto' }}>
                    <span className="badge badge-success flex items-center gap-1"><ThumbsUp size={12} /> {d.rating * 20}%</span>
                    <span className="flex items-center gap-1 hover:underline cursor-pointer"><b>{d.reviews}</b> Patient Stories</span>
                  </div>
                </div>

                <div className="flex flex-col justify-end" style={{ minWidth: '220px', paddingLeft: '8px' }}>
                  <div className="flex items-center gap-2 mb-4 text-main" style={{ fontSize: '14px' }}>
                    <CheckCircle2 size={16} className="text-success" />
                    <b>₹{d.fee}</b> Consultation fee at clinic
                  </div>
                  
                  <div className="flex items-center gap-2 mb-4" style={{ fontSize: '13px', color: 'var(--success)' }}>
                     <Clock size={16} /> Available Today
                  </div>

                  <button className="btn btn-accent full" onClick={() => handleSelect(d)}>Book Appointment</button>
                  <p className="text-muted text-center mt-2" style={{ fontSize: '11px' }}>No booking fee</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
