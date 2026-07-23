import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "../components/common/ProtectedRoute";
import Signup from "../pages/Signup";
import Home from "../pages/Home";
import Doctors from "../pages/Doctors";
import DoctorProfile from "../pages/DoctorProfile";
import SelectSlot from "../pages/SelectSlot";
import Review from "../pages/Review";
import Confirmed from "../pages/Confirmed";
import ABHA from "../pages/abha/index";
import Records from "../pages/Records";
import Labs from "../pages/Labs";
import Wallet from "../pages/Wallet";
import Rewards from "../pages/Rewards";
import Analytics from "../pages/Analytics";
import Ambulance from "../pages/Ambulance";
import Profile from "../pages/Profile";
import Settings from "../pages/Settings";
import Notifications from "../pages/Notifications";
import MyAppointments from "../pages/MyAppointments";
import Prescriptions from "../pages/Prescriptions";
import Pharmacy from "../pages/Pharmacy";
import Orders from "../pages/Orders";
import Payments from "../pages/Payments";
import Referrals from "../pages/Referrals";
import Support from "../pages/Support";
import AIAssistant from "../pages/AIAssistant";

function P({ children }) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/signup" element={<Signup />} />

      {/* Public Pages */}
      <Route path="/" element={<Home />} />
      <Route path="/doctors" element={<Doctors />} />
      <Route path="/doctor" element={<DoctorProfile />} />
      <Route path="/labs" element={<Labs />} />

      {/* Protected Routes (Require Login) */}
      <Route path="/slot" element={<P><SelectSlot /></P>} />
      <Route path="/review" element={<P><Review /></P>} />
      <Route path="/confirmed" element={<P><Confirmed /></P>} />
      <Route path="/abha" element={<P><ABHA /></P>} />
      <Route path="/records" element={<P><Records /></P>} />
      <Route path="/wallet" element={<P><Wallet /></P>} />
      <Route path="/rewards" element={<P><Rewards /></P>} />
      <Route path="/analytics" element={<P><Analytics /></P>} />
      <Route path="/ambulance" element={<P><Ambulance /></P>} />
      <Route path="/profile" element={<P><Profile /></P>} />
      <Route path="/settings" element={<P><Settings /></P>} />
      <Route path="/notifications" element={<P><Notifications /></P>} />
      <Route path="/my-appointments" element={<P><MyAppointments /></P>} />
      <Route path="/prescriptions" element={<P><Prescriptions /></P>} />
      <Route path="/pharmacy" element={<P><Pharmacy /></P>} />
      <Route path="/orders" element={<P><Orders /></P>} />
      <Route path="/payments" element={<P><Payments /></P>} />
      <Route path="/referrals" element={<P><Referrals /></P>} />
      <Route path="/support" element={<P><Support /></P>} />
      <Route path="/ai-assistant" element={<P><AIAssistant /></P>} />
    </Routes>
  );
}
