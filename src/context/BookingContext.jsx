import { createContext, useContext, useState } from "react";
import { doctors } from "../mocks/data";
const C = createContext();
export function BookingProvider({ children }) {
  const [doctor, setDoctor] = useState(doctors[0]);
  const [date, setDate] = useState(new Date());
  const [slot, setSlot] = useState("10:30 AM");
  const [bookingId, setBookingId] = useState("");
  const [bookingType, setBookingType] = useState("doctor"); // "doctor" | "lab"
  const [labPackage, setLabPackage] = useState(null);
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
        bookingType,
        setBookingType,
        labPackage,
        setLabPackage
      }}
    >
      {children}
    </C.Provider>
  );
}
export const useBooking = () => useContext(C);
