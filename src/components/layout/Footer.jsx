import { Heart, Headphones, ShieldCheck, Award, MapPin, Phone, Mail, ChevronRight, Globe, Share2 } from "lucide-react";
import Brand from "../common/Brand";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer style={{ background: '#0f172a', color: '#cbd5e1', paddingTop: '60px', marginTop: '60px' }}>
      {/* Top Trust Banner */}
      <div style={{ borderBottom: '1px solid #1e293b', paddingBottom: '40px' }}>
        <div className="container" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "24px" }}>
          {[
            [Heart, "Emergency Care", "24x7 Assistance available", "#ef4444"],
            [Headphones, "Online Support", "We're always here to help", "#3b82f6"],
            [ShieldCheck, "100% Secure", "Your medical data is safe", "#22c55e"],
            [Award, "Highly Trusted", "By millions of patients", "#eab308"],
          ].map(([I, a, b, color]) => (
            <div key={a} style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <div style={{ background: 'rgba(255,255,255,0.05)', padding: '16px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <I size={28} color={color} />
              </div>
              <span>
                <b style={{ fontSize: "16px", color: "#f8fafc", display: "block", marginBottom: '4px' }}>{a}</b>
                <small style={{ fontSize: "13px", color: "#94a3b8" }}>{b}</small>
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="container" style={{ display: 'flex', flexWrap: 'wrap', gap: '40px', paddingTop: '60px', paddingBottom: '60px' }}>
        
        {/* Brand & About */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', flex: '2 1 300px' }}>
          <div>
            <Link to="/" style={{ display: "flex", alignItems: "center" }}>
              <img src="/logo.png" alt="Arvaya" style={{ height: "40px", filter: "invert(1) grayscale(1) brightness(100)", mixBlendMode: "screen" }} />
            </Link>
          </div>
          <p style={{ lineHeight: '1.6', fontSize: '14px', maxWidth: '400px' }}>
            Arvaya Healthcare is dedicated to providing world-class medical services with a patient-first approach. Book appointments, order lab tests, and access your health records all in one place.
          </p>
          <div style={{ display: 'flex', gap: '16px' }}>
            {[Globe, Share2].map((Icon, idx) => (
              <a key={idx} href="#" style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', transition: 'all 0.2s', textDecoration: 'none' }} onMouseEnter={(e) => e.currentTarget.style.background = 'var(--primary)'} onMouseLeave={(e) => e.currentTarget.style.background = '#1e293b'}>
                <Icon size={18} />
              </a>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div style={{ flex: '1 1 150px' }}>
          <h3 style={{ color: '#fff', fontSize: '16px', fontWeight: '700', marginBottom: '24px' }}>Quick Links</h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {['Find a Doctor', 'Book Lab Test', 'Hospitals', 'ABHA Profile', 'Wallet & Rewards'].map(link => (
              <li key={link}>
                <Link to="#" style={{ color: '#cbd5e1', textDecoration: 'none', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px', transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary-light)'} onMouseLeave={(e) => e.currentTarget.style.color = '#cbd5e1'}>
                  <ChevronRight size={14} /> {link}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Services */}
        <div style={{ flex: '1 1 150px' }}>
          <h3 style={{ color: '#fff', fontSize: '16px', fontWeight: '700', marginBottom: '24px' }}>Services</h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {['Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics', 'General Surgery'].map(link => (
              <li key={link}>
                <Link to="#" style={{ color: '#cbd5e1', textDecoration: 'none', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px', transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary-light)'} onMouseLeave={(e) => e.currentTarget.style.color = '#cbd5e1'}>
                  <ChevronRight size={14} /> {link}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: '1 1 200px' }}>
          <h3 style={{ color: '#fff', fontSize: '16px', fontWeight: '700', marginBottom: '8px' }}>Contact Us</h3>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <MapPin size={20} color="var(--primary-light)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <span style={{ fontSize: '14px', lineHeight: '1.5' }}>123 Health Avenue, Medical District,<br />Bangalore, 560034</span>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <Phone size={20} color="var(--primary-light)" style={{ flexShrink: 0 }} />
            <span style={{ fontSize: '14px' }}>1800-123-4567</span>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <Mail size={20} color="var(--primary-light)" style={{ flexShrink: 0 }} />
            <span style={{ fontSize: '14px' }}>support@arvayahealth.com</span>
          </div>
        </div>

      </div>

      {/* Bottom Bar */}
      <div style={{ borderTop: '1px solid #1e293b', paddingTop: '24px', paddingBottom: '24px', background: '#0b1120' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', fontSize: '13px' }}>
          <p style={{ margin: 0 }}>&copy; {new Date().getFullYear()} Arvaya Healthcare. All rights reserved.</p>
          <div style={{ display: 'flex', gap: '24px' }}>
            <Link to="#" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Privacy Policy</Link>
            <Link to="#" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Terms of Service</Link>
            <Link to="#" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Sitemap</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
