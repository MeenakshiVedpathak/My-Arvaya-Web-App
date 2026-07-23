/**
 * Ambulance Service — Mock API layer
 * Simulates ambulance request, tracking, and history endpoints.
 */

// In-memory store (persisted in sessionStorage for page reloads)
const STORAGE_KEY = "arvaya_ambulance_requests";

function loadRequests() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveRequests(requests) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(requests));
}

const EMERGENCY_TYPES = [
  { value: "cardiac",    label: "Cardiac Emergency" },
  { value: "accident",   label: "Accident / Trauma" },
  { value: "breathing",  label: "Breathing Difficulty" },
  { value: "pregnancy",  label: "Pregnancy / Maternity" },
  { value: "burns",      label: "Burns" },
  { value: "stroke",     label: "Stroke / Paralysis" },
  { value: "other",      label: "Other" },
];

const STATUS_FLOW = ["Requested", "Dispatched", "En Route", "Arrived"];

/**
 * Submit an ambulance request.
 * @param {{ patientName, contactNumber, pickupAddress, emergencyType, lat?, lng? }} data
 * @returns {Promise<object>} the created request
 */
async function requestAmbulance(data) {
  await new Promise(r => setTimeout(r, 1200)); // simulate network

  const request = {
    id: "AMB-" + Date.now().toString(36).toUpperCase(),
    patientName: data.patientName,
    contactNumber: data.contactNumber,
    pickupAddress: data.pickupAddress,
    emergencyType: data.emergencyType,
    lat: data.lat || null,
    lng: data.lng || null,
    status: "Requested",
    eta: Math.floor(Math.random() * 10) + 5, // 5-15 min
    createdAt: new Date().toISOString(),
    ambulanceId: "KA-" + (Math.floor(Math.random() * 90) + 10) + "-" + (Math.floor(Math.random() * 9000) + 1000),
    driverName: ["Ramesh K.", "Suresh M.", "Priya D.", "Ajay S."][Math.floor(Math.random() * 4)],
    driverPhone: "98" + Math.floor(Math.random() * 90000000 + 10000000),
  };

  const existing = loadRequests();
  existing.unshift(request);
  saveRequests(existing);
  return request;
}

/**
 * Get all ambulance requests for the current session.
 */
async function getAmbulanceRequests() {
  await new Promise(r => setTimeout(r, 300));
  return loadRequests();
}

/**
 * Get a single request by ID.
 */
async function getRequestById(id) {
  await new Promise(r => setTimeout(r, 200));
  return loadRequests().find(r => r.id === id) || null;
}

/**
 * Reverse-geocode lat/lng to a human address using Nominatim (OpenStreetMap).
 */
async function reverseGeocode(lat, lng) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
      { headers: { "Accept-Language": "en" } }
    );
    const data = await res.json();
    return data.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  } catch {
    return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  }
}

export {
  EMERGENCY_TYPES,
  STATUS_FLOW,
  requestAmbulance,
  getAmbulanceRequests,
  getRequestById,
  reverseGeocode,
};
