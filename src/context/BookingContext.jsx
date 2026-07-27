import { createContext, useContext, useState, useEffect, useRef } from "react";
const C = createContext();

export function BookingProvider({ children }) {
  const [doctor, setDoctor] = useState(() => {
    try {
      const saved = sessionStorage.getItem("arvaya_booking_doctor");
      if (saved) return JSON.parse(saved);
    } catch(e) {}
    return null;
  });

  const [date, setDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  });
  const [slot, setSlot] = useState("10:30 AM");
  const [bookingId, setBookingId] = useState("");
  const [bookingType, setBookingType] = useState(() => {
    return sessionStorage.getItem("arvaya_booking_type") || "doctor";
  });
  
  const [bookingHospital, setBookingHospital] = useState(() => {
    const saved = sessionStorage.getItem("arvaya_booking_hospital");
    try {
      if (saved) return JSON.parse(saved);
    } catch(e) {}
    return null;
  });
  
  const [bookingSpecialty, setBookingSpecialty] = useState(() => {
    return sessionStorage.getItem("arvaya_booking_specialty") || "";
  });
  
  const [bookingVisitType, setBookingVisitType] = useState(() => {
    return sessionStorage.getItem("arvaya_booking_visit_type") || "Initial consultation";
  });

  const [labPackage, setLabPackage] = useState(() => {
    try {
      const saved = sessionStorage.getItem("arvaya_booking_lab");
      if (saved) return JSON.parse(saved);
    } catch(e) {}
    return null;
  });

  const [globalLocation, setGlobalLocation] = useState(() => {
    try {
      const saved = localStorage.getItem("arvaya_location");
      if (saved) return JSON.parse(saved);
    } catch(e) {}
    return null;
  });

  useEffect(() => {
    if (doctor) sessionStorage.setItem("arvaya_booking_doctor", JSON.stringify(doctor));
  }, [doctor]);

  useEffect(() => {
    if (labPackage) sessionStorage.setItem("arvaya_booking_lab", JSON.stringify(labPackage));
    else sessionStorage.removeItem("arvaya_booking_lab");
  }, [labPackage]);

  useEffect(() => {
    sessionStorage.setItem("arvaya_booking_type", bookingType);
  }, [bookingType]);
  
  useEffect(() => {
    if (bookingHospital) sessionStorage.setItem("arvaya_booking_hospital", JSON.stringify(bookingHospital));
    else sessionStorage.removeItem("arvaya_booking_hospital");
  }, [bookingHospital]);

  useEffect(() => {
    sessionStorage.setItem("arvaya_booking_specialty", bookingSpecialty);
  }, [bookingSpecialty]);

  useEffect(() => {
    sessionStorage.setItem("arvaya_booking_visit_type", bookingVisitType);
  }, [bookingVisitType]);
  const initialLocationMount = useRef(true);
  useEffect(() => {
    if (globalLocation) {
      localStorage.setItem("arvaya_location", JSON.stringify(globalLocation));
    } else {
      localStorage.removeItem("arvaya_location");
    }

    if (!initialLocationMount.current) {
      // If location changes after mount, clear any in-progress booking state
      setBookingHospital(null);
      setBookingSpecialty("");
      setDoctor(null);
    }
    initialLocationMount.current = false;
  }, [globalLocation]);

  return (
    <C.Provider
      value={{
        doctor,
        setDoctor,
        date,
        setDate,
        slot,
        setSlot,
        bookingId,
        setBookingId,
        bookingType, setBookingType,
        bookingHospital, setBookingHospital,
        bookingSpecialty, setBookingSpecialty,
        bookingVisitType,
        setBookingVisitType,
        labPackage,
        setLabPackage,
        globalLocation,
        setGlobalLocation
      }}
    >
      {children}
    </C.Provider>
  );
}
export const useBooking = () => useContext(C);
