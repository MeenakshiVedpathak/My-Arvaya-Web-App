import { HeartPulse, MapPin, Phone, Mail } from "lucide-react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer style={{ background: 'var(--text-main)', color: '#94a3b8', paddingTop: '64px', paddingBottom: '32px' }}>
      <div className="container">
        
        {/* ── Top Area: Brand & Links ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr', gap: '32px', marginBottom: '48px' }}>
          
          {/* Column 1: Brand */}
          <div className="flex flex-col gap-4">
            <p style={{ fontSize: '13px', lineHeight: 1.6, maxWidth: '280px' }}>
              India's most trusted healthcare platform. Connecting you with top doctors, diagnostic centers, and pharmacies across the country.
            </p>
            
            <div className="flex flex-col gap-2 mt-4" style={{ fontSize: '13px' }}>
              <span className="flex items-center gap-2"><MapPin size={16} className="text-primary"/> 123 Healthcare Ave, Bangalore, 560001</span>
              <span className="flex items-center gap-2"><Phone size={16} className="text-primary"/> +91 1800-123-4567</span>
              <span className="flex items-center gap-2"><Mail size={16} className="text-primary"/> support@arvaya.health</span>
            </div>
          </div>

          {/* Column 2: Patients */}
          <div>
            <h3 style={{ color: 'white', fontSize: '16px', fontWeight: '600', marginBottom: '20px' }}>For Patients</h3>
            <div className="flex flex-col gap-3" style={{ fontSize: '14px' }}>
              <Link to="/doctors" className="hover:text-primary">Search for Doctors</Link>
              <Link to="/doctors" className="hover:text-primary">Search for Clinics</Link>
              <Link to="/doctors" className="hover:text-primary">Search for Hospitals</Link>
              <Link to="/labs" className="hover:text-primary">Book Diagnostic Tests</Link>
              <Link to="/labs" className="hover:text-primary">Book Full Body Checkups</Link>
              <Link to="/abha" className="hover:text-primary">Create ABHA ID</Link>
              <Link to="/records" className="hover:text-primary">Patient Portal / Records</Link>
            </div>
          </div>

          {/* Column 3: Providers & Partners */}
          <div>
            <h3 style={{ color: 'white', fontSize: '16px', fontWeight: '600', marginBottom: '20px' }}>For Providers</h3>
            <div className="flex flex-col gap-3" style={{ fontSize: '14px' }}>
              <Link to="/" className="hover:text-primary">Arvaya Profile</Link>
              <Link to="/" className="hover:text-primary">For Clinics</Link>
              <Link to="/" className="hover:text-primary">Ray by Arvaya</Link>
              <Link to="/" className="hover:text-primary">Arvaya Pro</Link>
              <Link to="/" className="hover:text-primary">Arvaya Reach</Link>
            </div>
          </div>

          {/* Column 4: Corporate & More */}
          <div>
            <h3 style={{ color: 'white', fontSize: '16px', fontWeight: '600', marginBottom: '20px' }}>Corporate</h3>
            <div className="flex flex-col gap-3" style={{ fontSize: '14px' }}>
              <Link to="/" className="hover:text-primary">About Us</Link>
              <Link to="/" className="hover:text-primary">Careers</Link>
              <Link to="/" className="hover:text-primary">Blog</Link>
              <Link to="/" className="hover:text-primary">Press</Link>
              <Link to="/" className="hover:text-primary">Contact Us</Link>
            </div>
          </div>

        </div>

        {/* ── Bottom Area: Copyright ── */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{ fontSize: '13px' }}>© {new Date().getFullYear()} Arvaya Healthcare. All rights reserved.</p>
          <div className="flex gap-6" style={{ fontSize: '13px' }}>
            <Link to="/" className="hover:text-primary">Terms & Conditions</Link>
            <Link to="/" className="hover:text-primary">Privacy Policy</Link>
            <Link to="/" className="hover:text-primary">Refund Policy</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
