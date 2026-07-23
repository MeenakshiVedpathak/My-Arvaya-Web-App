import { Building2, FileText } from "lucide-react";

export const MOCK_ABHA = {
  name: "Shubham Shrikant Harpanhalli",
  abhaAddress: "91678056082723@sbx",
  abhaNumber: "91-6780-5608-2723",
  gender: "Male",
  dob: { day: "10", month: "4", year: "2000" },
  address: "Behind 41/Manik Nagar, Samta Nagar, Miraj, Miraj, Sangli, Maharashtra, SANGLI, MAHARASHTRA",
  photoInitials: "SSH",
  photoColor: "#1F4F57",
};

export const MOCK_CONSENTS = {
  Pending: [],
  Granted: [
    { id: 1, requester: "Apollo Hospitals",  purpose: "Care Management",   period: "Jan 2025 – Jan 2026", granted: "15 Jan 2025", records: "Lab Results, Prescriptions", icon: Building2 },
  ],
  Denied: [],
  Expired: [
    { id: 2, requester: "Manipal Health",    purpose: "Diagnosis Support", period: "Jan 2024 – Jan 2025", granted: "10 Jan 2024", records: "Discharge Summary",          icon: FileText  },
  ],
};
