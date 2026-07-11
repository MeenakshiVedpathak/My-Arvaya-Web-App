import { ArrowLeft, Search, ChevronRight, Filter } from "lucide-react";
import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getDoctors } from "../services/dataService";
import { useBooking } from "../context/BookingContext";
import { useAuth } from "../context/AuthContext";
import DoctorCard from "../components/doctors/DoctorCard";
import SelectSlotUI from "../components/doctors/SelectSlotUI";
import Modal from "../components/common/Modal";

const PAGE_SIZE = 50;

export default function Doctors() {
  const go = useNavigate();
  const { setDoctor, setDate, setSlot, setBookingId } = useBooking();
  const { user, openLoginModal } = useAuth();
  
  // Filter State
  const [branch, setBranch] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [visitType, setVisitType] = useState("Initial consultation");
  const [q, setQ] = useState("");
  
  // Modal State
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  // Doctor Data State
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPage = useCallback((page) => {
    setLoading(true);
    getDoctors({ pageIndex: page, pageSize: PAGE_SIZE })
      .then(res => setDoctors(res.list || []))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchPage(1);
  }, [fetchPage]);

  // Derived Data for Filters
  const branches = useMemo(() => {
    const map = new Map();
    doctors.forEach(d => {
      if (d.hospital) map.set(d.hospital, d.hospital);
    });
    if (map.size < 2) {
      map.set("APEX", "APEX Hospital");
      map.set("Hospital1", "Hospital");
      map.set("SeCURE", "SeCURE HOSPITALS");
    }
    return Array.from(map.values());
  }, [doctors]);

  const specialties = useMemo(() => {
    const set = new Set();
    doctors.forEach(d => {
      if (d.specialty) d.specialty.split(", ").forEach(s => s.trim() && set.add(s.trim()));
    });
    if (set.size < 4) {
      ["Anaesthetist", "Anesthesiologist", "Cardiologist", "Dental Surgeon", "Dermatologist", "ENT", "Gastroenterologist", "General Medicine"].forEach(s => set.add(s));
    }
    return Array.from(set).sort();
  }, [doctors]);

  const filteredDoctors = useMemo(() => {
    return doctors.filter(d => {
      const matchSpecialty = !specialty || (d.specialty || "").toLowerCase().includes(specialty.toLowerCase());
      const matchBranch = !branch || (d.hospital || "").toLowerCase().includes(branch.toLowerCase());
      const matchQ = (d.name + (d.specialty || "")).toLowerCase().includes(q.toLowerCase());
      return matchSpecialty && matchBranch && matchQ;
    });
  }, [doctors, specialty, branch, q]);

  const handleBookSlot = (slotData) => {
    setDoctor(selectedDoctor);
    setDate(new Date(slotData.date));
    setSlot(slotData.time);
    if (!user) return openLoginModal("/confirmed");
    setBookingId("APMNT" + Math.floor(Math.random() * 100000000));
    go("/confirmed");
  };

  return (
    <main className="page">
      <div className="internal-page-hero">
        <div className="container">
          <div className="internal-breadcrumbs">
            <Link to="/">Home</Link> <ChevronRight size={14} /> <span>Consult Doctors</span>
          </div>
          <h1 className="internal-hero-title">Consult Top Doctors</h1>
          <p className="internal-hero-subtitle">Find experienced doctors and book your appointment instantly.</p>
        </div>
      </div>

      <div className="container web-dashboard-layout">
        {/* Sidebar Filters */}
        <aside className="web-sidebar">
          <h3>Filters</h3>
          
          <div className="filter-group">
            <label>Branch</label>
            <select className="filter-select" value={branch} onChange={e => setBranch(e.target.value)}>
              <option value="">All Branches</option>
              {branches.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>

          <div className="filter-group">
            <label>Specialty</label>
            <select className="filter-select" value={specialty} onChange={e => setSpecialty(e.target.value)}>
              <option value="">All Specialties</option>
              {specialties.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="filter-group">
            <label>Visit Type</label>
            <div className="filter-radio-list">
              {["Initial consultation", "Follow-up", "Other"].map(vt => (
                <label key={vt} className="filter-radio-label">
                  <input 
                    type="radio" 
                    name="visitType" 
                    value={vt} 
                    checked={visitType === vt} 
                    onChange={e => setVisitType(e.target.value)}
                  />
                  {vt}
                </label>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <section>
          <div className="search wide" style={{ marginBottom: "24px" }}>
            <Search />
            <input
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder="Search doctors by name or specialty..."
            />
          </div>

          <div className="doctorlist-grid">
            {filteredDoctors.map(d => (
              <DoctorCard 
                key={d.id} 
                d={d} 
                onClickBook={() => setSelectedDoctor(d)}
              />
            ))}
            {filteredDoctors.length === 0 && !loading && (
              <p style={{ color: "var(--muted)" }}>No doctors found matching your criteria.</p>
            )}
          </div>
        </section>
      </div>

      {/* Booking Modal */}
      <Modal 
        isOpen={!!selectedDoctor} 
        onClose={() => setSelectedDoctor(null)}
        title="Select Appointment Slot"
        maxWidth="700px"
      >
        <SelectSlotUI 
          doctor={selectedDoctor} 
          onConfirm={handleBookSlot} 
        />
      </Modal>
    </main>
  );
}
