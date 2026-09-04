import { api } from "./api";

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
  { value: "cardiac", label: "Cardiac Emergency" },
  { value: "accident", label: "Accident / Trauma" },
  { value: "breathing", label: "Breathing Difficulty" },
  { value: "pregnancy", label: "Pregnancy / Maternity" },
  { value: "burns", label: "Burns" },
  { value: "stroke", label: "Stroke / Paralysis" },
  { value: "other", label: "Other" },
];

const STATUS_FLOW = ["Requested", "Assigned", "Dispatched", "Arriving", "Completed"];

function getStoredPatientId() {
  try {
    const stored = localStorage.getItem("arvaya_user");
    if (stored) {
      const user = JSON.parse(stored);
      return user?.patient_id || user?.id || user?.user_id || user?.app_user_id || null;
    }
  } catch (e) { }
  return null;
}

/**
 * Submit an ambulance request.
 */
async function requestAmbulance(data) {
  const payload = {
    patient_id: data.patient_id ?? data.patientId ?? "",
    patient_name: data.patient_name ?? data.patientName ?? "",
    requester_phone: data.requester_phone ?? data.contactNumber ?? "",
    emergency_type: data.emergency_type ?? data.emergencyType ?? "",
    pickup_lat: data.pickup_lat ?? data.lat ?? null,
    pickup_lng: data.pickup_lng ?? data.lng ?? null,
    pickup_address: data.pickup_address ?? data.pickupAddress ?? "",
    location_key: data.location_key ?? data.locationKey ?? ""
  };

  let apiRes = null;
  try {
    apiRes = await api.post("/api/ambulance/create-request", payload);
  } catch (e) {
    console.error("Error calling api/ambulance/create-request:", e);
    throw e;
  }

  const request = {
    id: apiRes?.id || apiRes?.data?.id || ("AMB-" + Date.now().toString(36).toUpperCase()),
    patientName: payload.patient_name,
    contactNumber: payload.requester_phone,
    pickupAddress: payload.pickup_address,
    emergencyType: payload.emergency_type,
    lat: payload.pickup_lat,
    lng: payload.pickup_lng,
    status: apiRes?.status || apiRes?.data?.status || "Requested",
    eta: apiRes?.eta || apiRes?.data?.eta || (Math.floor(Math.random() * 10) + 5),
    createdAt: new Date().toISOString(),
    ambulanceId: apiRes?.ambulanceId || apiRes?.data?.ambulanceId || ("KA-" + (Math.floor(Math.random() * 90) + 10) + "-" + (Math.floor(Math.random() * 9000) + 1000)),
    driverName: apiRes?.driverName || apiRes?.data?.driverName || ["Ramesh K.", "Suresh M.", "Priya D.", "Ajay S."][Math.floor(Math.random() * 4)],
    driverPhone: apiRes?.driverPhone || apiRes?.data?.driverPhone || ("98" + Math.floor(Math.random() * 90000000 + 10000000)),
    apiResponse: apiRes
  };

  const existing = loadRequests();
  existing.unshift(request);
  saveRequests(existing);
  return request;
}

/**
 * Fetch ambulance requests from api/ambulance/admin/ambulance/queue with filterQuery " AND patient_id=...".
 * @param {object|string|number} [currentUser]
 */
async function getAmbulanceRequests(currentUser) {
  let patientId = currentUser?.patient_id || currentUser?.id || currentUser?.user_id || currentUser?.app_user_id;

  if (!patientId) {
    patientId = getStoredPatientId();
  }

  if (!patientId) {
    patientId = 107609;
  }

  const filterQuery = ` AND patient_id=${patientId}`;

  const payload = {
    filter: filterQuery,
    patient_id: patientId,
    pageIndex: 1,
    pageSize: 100
  };

  function normalizeStatus(raw) {
    if (!raw || typeof raw !== "string") return "Requested";
    const s = raw.trim().toLowerCase().replace(/_/g, " ");
    if (s.includes("cancel")) return "Cancelled";
    if (s.includes("unavailable")) return "Unavailable";
    if (s.includes("delay")) return "Delayed";
    if (s.includes("complete") || s.includes("done")) return "Completed";
    if (s.includes("arrive") || s.includes("reach") || s.includes("arriving")) return "Arriving";
    if (s.includes("dispatch")) return "Dispatched";
    if (s.includes("assign")) return "Assigned";
    return "Requested";
  }

    return filteredList.map(item => {
      const rawEta = item.eta_minutes ?? item.eta ?? item.eta_mins ?? item.estimated_time ?? item.estimated_eta ?? null;
      let parsedEta = null;
      if (rawEta !== null && rawEta !== undefined && rawEta !== "" && rawEta !== "null") {
        const num = Number(rawEta);
        parsedEta = isNaN(num) ? null : num;
      }

    const rawStatus = item.status || item.request_status || item.state || "Requested";

    return {
      id: item.id || item.request_id || item.queue_id || item.ambulance_id || ("AMB-" + String(item.id || Date.now())),
      patientId: item.patient_id ?? item.patientId ?? item.app_user_id ?? item.user_id ?? "",
      patientName: item.patient_name || item.patientName || item.name || item.user_name || "Patient",
      contactNumber: item.requester_phone || item.contact_number || item.contactNumber || item.phone || item.mobile_number || "",
      pickupAddress: item.pickup_address || item.pickupAddress || item.address || item.location || "",
      emergencyType: item.emergency_type || item.emergencyType || item.emergency_category || "General Emergency",
      status: normalizeStatus(rawStatus),
      eta: parsedEta,
      createdAt: item.created_at || item.createdAt || item.created_date || item.created_modified_date || new Date().toISOString(),
      assignedAt: item.assigned_at || null,
      dispatchedAt: item.dispatched_at || null,
      completedAt: item.completed_at || null,
      updatedAt: item.updated_at || null,
      ambulanceId: item.ambulance_number || item.ambulance_no || item.ambulance_num || item.ambulance_id || item.ambulanceId || item.vehicle_number || item.vehicle_no || item.vehicle_num || item.vehicleId || "N/A",
      driverName: item.driver_name || item.driverName || item.driver || "Unassigned",
      driverPhone: item.driver_mobile_no || item.driver_phone || item.driverPhone || item.driver_mobile || "",
      raw: item
    };
  }

  function normalizeLocalRequest(r) {
    return {
      id: r.id,
      patientId: r.patientId || r.patient_id || "",
      patientName: r.patientName || r.patient_name || "Patient",
      contactNumber: r.contactNumber || r.requester_phone || "",
      pickupAddress: r.pickupAddress || r.pickup_address || "",
      emergencyType: r.emergencyType || r.emergency_type || "General Emergency",
      status: normalizeStatus(r.status || "Requested"),
      eta: Number(r.eta) || 0,
      createdAt: r.createdAt || new Date().toISOString(),
      assignedAt: r.assignedAt || null,
      dispatchedAt: r.dispatchedAt || null,
      completedAt: r.completedAt || null,
      updatedAt: r.updatedAt || null,
      ambulanceId: r.ambulanceId || r.ambulance_id || "N/A",
      driverName: r.driverName || r.driver_name || "Unassigned",
      driverPhone: r.driverPhone || r.driver_phone || "",
      lat: r.lat ?? r.pickup_lat ?? null,
      lng: r.lng ?? r.pickup_lng ?? null,
      raw: r
    };
  }

  let apiResult = [];
  try {
    let res = null;
    try {
      res = await api.post("/api/ambulance/admin/ambulance/queue", payload);
    } catch (e) {
      console.warn("POST /api/ambulance/admin/ambulance/queue failed, trying GET...", e);
      res = await api.get(`/api/ambulance/admin/ambulance/queue?filterQuery=${encodeURIComponent(filterQuery)}`);
    }

    const rawList = res?.data || res?.queue || res?.list || res?.requests || res?.result || (Array.isArray(res) ? res : []);

    if (Array.isArray(rawList)) {
      const filteredList = rawList.filter(item => {
        const pId = item?.patient_id ?? item?.patientId ?? item?.app_user_id ?? item?.user_id;
        return String(pId) === String(patientId);
      });
      apiResult = filteredList.map(normalizeApiItem);
    }
  } catch (err) {
    console.error("Error fetching ambulance queue from API:", err);
  }

  // Merge in any locally-created sessionStorage requests that aren't
  // already represented by the API response, so a freshly submitted
  // request shows up immediately without waiting for backend sync.
  try {
    const apiIds = new Set(apiResult.map(r => String(r.id)));
    const localExtra = loadRequests()
      .filter(r => String(r.patientId ?? r.patient_id ?? "") === String(patientId))
      .filter(r => !apiIds.has(String(r.id)))
      .map(normalizeLocalRequest);
    if (localExtra.length === 0) return apiResult;
    return [...localExtra, ...apiResult];
  } catch (e) {
    return apiResult;
  }
}

/**
 * Get a single request by ID.
 */
async function getRequestById(id, currentUser) {
  const all = await getAmbulanceRequests(currentUser);
  return all.find(r => String(r.id) === String(id)) || null;
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
