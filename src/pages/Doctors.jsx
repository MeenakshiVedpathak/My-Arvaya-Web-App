import { ArrowLeft, Search } from "lucide-react";
import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getDoctors } from "../services/dataService";
import { useBooking } from "../context/BookingContext";
import Steps from "../components/common/Steps";
import DoctorCard from "../components/doctors/DoctorCard";
import SelectBranch from "../components/doctors/SelectBranch";
import SelectSpecialty from "../components/doctors/SelectSpecialty";
import SelectVisitType from "../components/doctors/SelectVisitType";
import SelectSlotUI from "../components/doctors/SelectSlotUI";

const PAGE_SIZE = 50; // Load a large batch to filter locally for the demo

export default function Doctors() {
  const go = useNavigate();
  const { setDoctor, setDate, setSlot, setBookingId } = useBooking();
  const [step, setStep] = useState(0); // 0: Branch, 1: Specialty, 2: Visit Type, 3: Doctor, 4: Slot
  
  // Booking State
  const [booking, setBooking] = useState({
    branch: null,
    specialty: null,
    visitType: null,
    doctor: null,
    slot: null
  });

  // Doctor Data State
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  const fetchPage = useCallback((page) => {
    setLoading(true);
    getDoctors({ pageIndex: page, pageSize: PAGE_SIZE })
      .then(res => {
        setDoctors(res.list || []);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    fetchPage(1);
  }, [fetchPage]);

  // Derived Data for Steps
  const branches = useMemo(() => {
    // Generate unique branches from doctors + some mock ones matching screenshot
    const map = new Map();
    doctors.forEach(d => {
      if (d.hospital) {
        map.set(d.hospital, {
          name: d.hospital,
          address: d.city ? `${d.city} Main Road` : "Shivaji Park, Kohlapur",
          phone: "0231-252530"
        });
      }
    });
    // Add mocks if not enough
    if (map.size < 2) {
      map.set("APEX", { name: "APEX Hospital", address: "CS No: 517, A/13 Plot No: 27, Shivaji Park, Kohlapur", phone: "0231-252530" });
      map.set("Hospital1", { name: "Hospital", address: "Isarappanavar I-kon Building, Plot No 50...", phone: "7026200055" });
      map.set("SeCURE", { name: "SeCURE HOSPITALS", address: "499/1/2. Plot No : 3/125/126, Avanti Nagar...", phone: "0217-2745050" });
    }
    return Array.from(map.values());
  }, [doctors]);

  const specialties = useMemo(() => {
    const set = new Set();
    doctors.forEach(d => {
      if (d.specialty) d.specialty.split(", ").forEach(s => s.trim() && set.add(s.trim()));
    });
    // Add mocks if not enough
    if (set.size < 4) {
      ["Anaesthetist", "Anesthesiologist", "Cardiologist", "Dental Surgeon", "Dermatologist", "ENT", "Gastroenterologist", "General Medicine"].forEach(s => set.add(s));
    }
    return Array.from(set).sort();
  }, [doctors]);

  const filteredDoctors = useMemo(() => {
    return doctors.filter(d => {
      const matchSpecialty = !booking.specialty || (d.specialty || "").toLowerCase().includes(booking.specialty.toLowerCase());
      // we can also filter by branch if we strictly map them, but since we mock branches, let's keep it relaxed or check include
      const matchQ = (d.name + (d.specialty || "")).toLowerCase().includes(q.toLowerCase());
      return matchSpecialty && matchQ;
    });
  }, [doctors, booking.specialty, q]);

  // Handlers
  const handleBack = () => {
    if (step > 0) setStep(step - 1);
    else go(-1);
  };

  const updateBooking = (key, value) => {
    setBooking(prev => ({ ...prev, [key]: value }));
  };

  const getHeaderTitle = () => {
    if (step === 0) return "Book Appointment";
    if (step === 1) return booking.branch?.name || "Select Specialty";
    if (step === 2) return booking.specialty || "Select Visit Type";
    if (step === 3) return booking.visitType || "Select Doctor";
    if (step === 4) return "Book Appointment";
    return "Book Appointment";
  };

  return (
    <main className="container page booking-wizard">
      {/* Header Area */}
      <div className="wizard-header">
        <h1 className="header-title" onClick={handleBack}>
          <ArrowLeft /> {getHeaderTitle()}
        </h1>
        <Steps current={step} total={5} />
      </div>

      {/* Step 0: Branch Selection */}
      {step === 0 && (
        <SelectBranch 
          branches={branches} 
          onSelect={(b) => { updateBooking("branch", b); setStep(1); }} 
        />
      )}

      {/* Step 1: Specialty Selection */}
      {step === 1 && (
        <>
          <div className="wizard-breadcrumbs">
            <span>{booking.branch?.name}</span>
          </div>
          <SelectSpecialty 
            specialties={specialties} 
            onSelect={(s) => { updateBooking("specialty", s); setStep(2); }} 
          />
        </>
      )}

      {/* Step 2: Visit Type Selection */}
      {step === 2 && (
        <>
          <div className="wizard-breadcrumbs">
            <span>{booking.branch?.name}</span> • <span>{booking.specialty}</span>
          </div>
          <SelectVisitType 
            selected={booking.visitType} 
            onSelect={(id, title) => updateBooking("visitType", title)} 
            onContinue={() => setStep(3)}
          />
        </>
      )}

      {/* Step 3: Doctor Selection */}
      {step === 3 && (
        <div className="select-doctor-container">
          <div className="wizard-breadcrumbs">
            <span>{booking.branch?.name}</span> • <span>{booking.specialty}</span> • <span>{booking.visitType}</span>
          </div>
          
          <div className="search wide" style={{ marginBottom: "16px", marginTop: "16px" }}>
            <Search />
            <input
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder="Search doctors..."
            />
          </div>

          <p className="step-prompt" style={{ fontSize: "14px", color: "#64748b" }}>
            {filteredDoctors.length} doctor{filteredDoctors.length !== 1 ? 's' : ''} in {booking.specialty}
          </p>

          <div className="doctorlist-grid">
            {filteredDoctors.map(d => (
              <DoctorCard 
                key={d.id} 
                d={d} 
                onClickBook={() => { updateBooking("doctor", d); setStep(4); }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Step 4: Slot Selection */}
      {step === 4 && (
        <SelectSlotUI 
          doctor={booking.doctor} 
          onConfirm={(slotData) => {
            setDoctor(booking.doctor);
            setDate(new Date(slotData.date));
            setSlot(slotData.time);
            setBookingId("APMNT" + Math.floor(Math.random() * 100000000));
            go("/confirmed"); // Go to confirmation page
          }} 
        />
      )}
    </main>
  );
}
