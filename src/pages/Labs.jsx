import { Search, ArrowLeft } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getLabPackages } from "../services/dataService";
import { useBooking } from "../context/BookingContext";
import Steps from "../components/common/Steps";
import SelectVisitType from "../components/doctors/SelectVisitType";
import SelectSlotUI from "../components/doctors/SelectSlotUI";

export default function Labs() {
  const go = useNavigate();
  const { setBookingType, setLabPackage, setDate, setSlot, setBookingId } = useBooking();
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Wizard State
  const [step, setStep] = useState(0); // 0: Package, 1: Visit Type, 2: Slot
  const [booking, setBooking] = useState({
    package: null,
    visitType: null,
    date: null,
    slot: null
  });

  useEffect(() => {
    getLabPackages().then(data => {
      setPackages(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
    else go(-1);
  };

  const updateBooking = (key, value) => {
    setBooking(prev => ({ ...prev, [key]: value }));
  };

  const confirmBooking = (slotData) => {
    setBookingType("lab");
    setLabPackage(booking.package);
    setDate(new Date(slotData.date));
    setSlot(slotData.time);
    setBookingId("LAB" + Math.floor(Math.random() * 100000000));
    go("/confirmed");
  };

  return (
    <main className="container page">
      <h1 className="header-title" onClick={handleBack} style={{ cursor: 'pointer' }}>
        <ArrowLeft /> {step === 0 ? "Lab Tests" : "Book Lab Test"}
      </h1>

      {step > 0 && <Steps current={step} total={3} />}

      {step === 0 && (
        <>
          <div className="search wide" style={{ marginBottom: '32px', background: 'var(--bg)', border: 'none', borderRadius: 'var(--radius)' }}>
            <input placeholder="Search for tests & packages..." style={{ background: 'transparent' }} />
          </div>

          {loading ? (
            <div style={{ textAlign: "center", padding: "60px 0", color: "var(--muted)" }}>
              <div className="loading-spinner" />
              <p>Loading packages...</p>
            </div>
          ) : (
            <div className="doctorlist-grid">
              {packages.map((pkg) => (
                <article className="pro-card" key={pkg.title} style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  {pkg.img && <img src={pkg.img} alt={pkg.title} style={{ width: '80px', height: '80px', borderRadius: '16px', objectFit: 'cover' }} />}
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <b style={{ fontSize: '16px', color: 'var(--blue)' }}>{pkg.title}</b>
                    </div>
                    {pkg.tests && <small style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '12px', display: 'block' }}>{pkg.tests}</small>}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        {pkg.price && <b style={{ fontSize: '16px', color: 'var(--blue)', marginRight: '8px' }}>{pkg.price}</b>}
                        {pkg.oldPrice && <s style={{ fontSize: '13px', color: 'var(--muted)' }}>{pkg.oldPrice}</s>}
                      </div>
                      <button 
                        className="primary" 
                        style={{ padding: '8px 16px', fontSize: '13px' }}
                        onClick={() => {
                          updateBooking('package', pkg);
                          setStep(1);
                        }}
                      >
                        Book Now
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </>
      )}

      {step === 1 && (
        <div style={{ maxWidth: '600px', margin: '0 auto', paddingTop: '24px' }}>
          <h2 style={{ fontSize: '20px', color: 'var(--blue)', marginBottom: '24px' }}>Select Visit Type</h2>
          <SelectVisitType
            selected={booking.visitType}
            onSelect={(val) => updateBooking("visitType", val)}
            options={[
              { id: "home", title: "Home Sample Collection", desc: "A phlebotomist will visit your home to collect samples." },
              { id: "lab", title: "Visit Lab Center", desc: "You will visit the nearest diagnostic center." }
            ]}
          />
          <div style={{ marginTop: '32px', textAlign: 'right' }}>
            <button 
              className="primary" 
              disabled={!booking.visitType}
              onClick={() => setStep(2)}
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div style={{ maxWidth: '600px', margin: '0 auto', paddingTop: '24px' }}>
          <SelectSlotUI
            onConfirm={confirmBooking}
          />
        </div>
      )}
    </main>
  );
}
