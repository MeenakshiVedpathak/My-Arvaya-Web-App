import { api } from "./api";
import { slots as mockSlots, packages as mockPackages } from "../mocks/data";

const USE_MOCK = true; // Forced static data for the dashboard after login

function getStoredUserId() {
  try {
    const user = JSON.parse(localStorage.getItem("arvaya_user"));
    return user?.id || user?.user_id || user?.app_user_id || null;
  } catch {
    return null;
  }
}
 
 
/* ─── Patients / App Users ─── */
export async function getPatients(filters = {}) {
  try {
    const storedUserId = getStoredUserId();
    let filterQuery = filters.filterQuery || filters.filter || "";
 
    if (storedUserId) {
      if (!filterQuery.includes("id=")) {
        filterQuery += ` AND id=${storedUserId}`;
      }
    }
 
    const payload = {
      filterQuery: filterQuery.trim(),
      filter: filterQuery.trim(),
      ...(storedUserId ? { id: storedUserId } : {}),
      ...filters
    };
 
    const res = await api.post("/api/appUser/get", payload);
    return res?.data || res?.patients || res?.list || res?.result || res?.UserData || res || [];
  } catch (err) {
    console.error("getPatients error:", err);
    return [];
  }
}
 
export async function updateAppUser(payload) {
  try {
    const res = await api.post("/api/appUser/upsert", payload);
    return res?.data || res?.result || res;
  } catch (err) {
    console.error("updateAppUser error:", err);
    throw err;
  }
}
 

/* ─── Family Details ─── */
export async function getFamilyDetails(filters = {}) {
  try {
    const res = await api.post("/api/familyDetails/get", filters);
    return res?.data || res?.list || res?.result || res?.familyDetails || res || [];
  } catch (err) {
    console.error("getFamilyDetails error:", err);
    return [];
  }
}

export async function upsertFamilyDetails(payload) {
  try {
    let genderCode = payload.gender || "M";
    const lower = String(genderCode).trim().toLowerCase();
    if (lower.startsWith("f")) genderCode = "F";
    else if (lower.startsWith("m")) genderCode = "M";
    else if (lower.startsWith("o")) genderCode = "O";
 
    const formattedPayload = {
      ...payload,
      gender: genderCode
    };
 
    const res = await api.post("/api/familyDetails/upsert", formattedPayload);
    return res?.data || res?.result || res;
  } catch (err) {
    console.error("upsertFamilyDetails error:", err);
    throw err;
  }
}

function getUserId() {
  try {
    const user = JSON.parse(localStorage.getItem("arvaya_user"));
    return user?.user_id || 1;
  } catch {
    return 1;
  }
}

function mapDoctor(d) {
  const loc = d.locations && d.locations[0];
  const hospital = loc ? (loc.locname || loc.name || "") : "";
  const city = loc ? loc.city || "" : "";
  const specialty = Array.isArray(d.speciality) ? d.speciality.join(", ") : (d.speciality || "");
  return {
    ...d,
    id: d.drkey || d.id,
    name: (d.name || "").trim(),
    qualification: d.ug_degree ? d.ug_degree.replace(/<[^>]+>/g, "").trim() : "",
    specialty,
    hospital,
    city,
    locations: d.locations || [],
    consultationFee: d.amount ? `₹${parseFloat(d.amount).toFixed(0)}` : "",
    gender: d.gender || "",
    mobile: d.mobile || "",
    blocked: d.blocked || false,
    image: d.profile_image || `https://ui-avatars.com/api/?name=${encodeURIComponent((d.name || "Dr").trim())}&background=2e666e&color=fff&size=150`,
    experienceText: d.experience ? `${parseInt(d.experience)} Years` : "10+ Years",
    experience: d.experience ? `${parseInt(d.experience)}` : "10+",
    fee: d.amount ? parseInt(d.amount) : 500,
    rating: d.rating ? parseFloat(d.rating) : null,
    reviews: d.reviews ? parseInt(d.reviews) : null,
  };
}

/* ─── Doctors ─── */
export async function getDoctors(filters = {}) {

  const payload = {
    pageIndex: filters.pageIndex || 1,
    pageSize: filters.pageSize || 10,
    sortKey: filters.sortKey || "",
    sortValue: filters.sortValue || "desc",
    filter: filters.filter || "",
    entitylocation: filters.location_key || "",
  };

  const isLoggedIn = typeof window !== 'undefined' && (!!localStorage.getItem("arvaya_token") || !!localStorage.getItem("arvaya_user"));
  const endpoint = isLoggedIn ? "/api/get/dr/admin-secure-hospitals" : "/get-doctors";

  const res = await api.post(endpoint, payload);
  const data = res?.dr || res?.data?.dr || res?.data || res || [];
  return {
    list: Array.isArray(data) ? data.map(mapDoctor) : [],
    count: res?.count || res?.data?.count || data.length || 0,
  };
}

export async function getLocations(pageIndex = 1, pageSize = 10, filter = "") {
  const payload = {
    pageIndex,
    pageSize,
    sortKey: "",
    sortValue: "desc",
    filter
  };
  const res = await api.post("/get-hospitals-locations", payload);
  return {
    list: res?.entitylocations || res?.data?.entitylocations || [],
    count: res?.count || res?.data?.count || 100
  };
}

export async function getHospitalsForLocation(locationKey) {
  const payload = {
    pageIndex: 1,
    pageSize: 100,
    sortKey: "",
    sortValue: "desc",
    filter: "",
    entitylocation: locationKey
  };
  
  const isLoggedIn = typeof window !== 'undefined' && (!!localStorage.getItem("arvaya_token") || !!localStorage.getItem("arvaya_user"));
  const endpoint = isLoggedIn ? "/api/get/dr/admin-secure-hospitals" : "/get-doctors";
  const res = await api.post(endpoint, payload);
  const data = res?.dr || res?.data?.dr || res?.data || res || [];
  
  const uniqueHospitals = [];
  const map = new Map();
  
  data.forEach(d => {
    const loc = d.locations && d.locations[0];
    if (loc) {
      const name = loc.locname || loc.name || loc.alt_name || "";
      if (name && !map.has(name)) {
        map.set(name, true);
        uniqueHospitals.push({
          ...loc,
          id: loc.id || loc.entitylocation || name,
          name: name,
          city: loc.city || "",
          entitylocation: loc.entitylocation || locationKey
        });
      }
    }
  });
  
  return uniqueHospitals;
}

export async function getDoctor(id) {
  const payload = {
    pageIndex: 1,
    pageSize: 100,
    sortKey: "id",
    sortValue: "desc",
    filter: "",
  };

  const isLoggedIn = typeof window !== 'undefined' && (!!localStorage.getItem("arvaya_token") || !!localStorage.getItem("arvaya_user"));
  const endpoint = isLoggedIn ? "/api/get/dr/admin-secure-hospitals" : "/get-doctors";

  const res = await api.post(endpoint, payload);
  const data = res?.dr || res?.data?.dr || res?.data || [];
  const doc = data.find(u => (u.drkey || u.id) === id) || data[0];
  return doc ? mapDoctor(doc) : {};
}

export async function getDoctorSlots(doctorId, dateObj) {
  let dStr = dateObj;
  if (typeof dateObj !== 'string' && dateObj instanceof Date) {
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    dStr = `${year}${month}${day}`;
  }

  const payload = {
    entitykey: "secure-hospitals",
    startdate: dStr,
    enddate: dStr,
    drkey: doctorId
  };

  try {
    const res = await api.post("/api/calendar/secure-hospitals", payload);
    return res?.data || res || [];
  } catch (err) {
    console.error("Failed to fetch slots", err);
    return [];
  }
}

/* ─── Plans ─── */
export async function getPlans(filters = {}) {
  if (USE_MOCK) {
    return mockPackages;
  }
  // POST api/plan/get
  const res = await api.post("/api/plan/get", filters);
  return res.data || res;
}

/* ─── Banners ─── */
export async function getBanners() {
  const payload = {
    pageIndex: 0,
    pageSize: 0,
    sortKey: "seq_no",
    sortValue: "asc",
    filterQuery: "and is_active=1",
  };
  try {
    const res = await api.post("/banner/get", payload);
    return res.data || res || [];
  } catch (error) {
    console.error("Failed to fetch banners", error);
    return [];
  }
}

export async function upsertPlan(data) {
  if (USE_MOCK) return { success: true };
  return api.post("/api/plan/upsert", data);
}

function mapTest(t) {
  return {
    ...t,
    id: t.id,
    title: t.name,
    tests: t.test_category_name,
    price: t.price ? `₹${t.price}` : null,
    oldPrice: t.oldPrice ? `₹${t.oldPrice}` : null,
  };
}

/* ─── Lab Tests / Packages ─── */
export async function getLabPackages(filters = {}) {
  if (USE_MOCK) return getPlans({ type: "lab" }); // fallback for mock

  const payload = {
    pageIndex: filters.pageIndex || 1,
    pageSize: filters.pageSize || 10,
    sortKey: filters.sortKey || "id",
    sortValue: filters.sortValue || "desc",
    filter: filters.filter || "",
  };

  const res = await api.post("/api/test/get", payload);
  const data = res.data || [];
  return Array.isArray(data) ? data.map(mapTest) : [];
}

/* ─── Forms ─── */
export async function getForms(filters = {}) {
  if (USE_MOCK) return [];
  // POST api/form/get
  const res = await api.post("/api/form/get", filters);
  return res.data || res;
}

export async function createForm(data) {
  if (USE_MOCK) return { success: true };
  return api.post("/api/form/create", data);
}

export async function updateForm(data) {
  if (USE_MOCK) return { success: true };
  return api.put("/api/form/update", data);
}

/* ─── Roles ─── */
export async function getRoles(filters = {}) {
  if (USE_MOCK) return [];
  const res = await api.post("/api/role/get", filters);
  return res.data || res;
}

export async function createRole(data) {
  if (USE_MOCK) return { success: true };
  return api.post("/api/role/create", data);
}

export async function updateRole(data) {
  if (USE_MOCK) return { success: true };
  return api.put("/api/role/update", data);
}

export async function getRoleDetails(filters = {}) {
  if (USE_MOCK) return [];
  const res = await api.post("/api/roleDetails/getData", filters);
  return res.data || res;
}

export async function addBulkRoleDetails(data) {
  if (USE_MOCK) return { success: true };
  return api.post("/api/roleDetails/addBulk", data);
}

/* ─── Appointments / Bookings (via form) ─── */
export async function bookAppointment(data) {
  if (USE_MOCK) {
    return { bookingId: "APMNT" + Date.now().toString().slice(-8), status: "confirmed" };
  }
  // Create a form entry for the appointment
  const res = await api.post("/api/form/create", { ...data, type: "appointment" });
  return res.data || res;
}

export async function getWalletAmount(patient_id) {
  try {
    const res = await api.post("/api/appointments/get-wallet-amount", { patient_id });
    return res?.data || res || { balance: 0 };
  } catch (err) {
    console.error("getWalletAmount error:", err);
    return { balance: 0 };
  }
}

export async function checkVisitType(payload) {
  try {
    const res = await api.post("/api/appointments/check-visit-type", payload);
    return res?.data || res || {};
  } catch (err) {
    console.error("checkVisitType error:", err);
    return {};
  }
}

/* ─── Reports ─── */
export async function getPatientPaymentsReport(filters = {}) {
  if (USE_MOCK) {
    return {
      balance: 1250,
      transactions: [
        { id: 1, title: "Cashback – Dr. Priya", amount: "+₹50", date: "10 Jul 2026", type: "credit" },
        { id: 2, title: "Consultation Fee", amount: "-₹600", date: "08 Jul 2026", type: "debit" },
        { id: 3, title: "Referral Bonus", amount: "+₹200", date: "05 Jul 2026", type: "credit" },
        { id: 4, title: "Lab Test Payment", amount: "-₹799", date: "02 Jul 2026", type: "debit" },
      ],
    };
  }
  // POST api/reports/getPatientPaymentsReport
  const res = await api.post("/api/reports/getPatientPaymentsReport", filters);
  return res.data || res;
}

export async function getReferralReport(filters = {}) {
  if (USE_MOCK) {
    return {
      points: 2450,
      history: [
        { id: 1, title: "Appointment Booking", points: "+100", date: "10 Jul 2026" },
        { id: 2, title: "Profile Completed", points: "+50", date: "08 Jul 2026" },
        { id: 3, title: "Referral – Amit", points: "+200", date: "05 Jul 2026" },
      ],
    };
  }
  // POST api/reports/getReferralReport
  const res = await api.post("/api/reports/getReferralReport", filters);
  return res.data || res;
}

export async function getRecentReferralActivity(filters = {}) {
  if (USE_MOCK) return [];
  const res = await api.post("/api/reports/getRecentReferralActivity", filters);
  return res.data || res;
}

export async function getRewardsReport(filters = {}) {
  if (USE_MOCK) {
    return {
      points: 2450,
      history: [
        { id: 1, title: "Appointment Booking", points: "+100", date: "10 Jul 2026" },
        { id: 2, title: "Profile Completed", points: "+50", date: "08 Jul 2026" },
        { id: 3, title: "Referral – Amit", points: "+200", date: "05 Jul 2026" },
        { id: 4, title: "Lab Test Booking", points: "+75", date: "01 Jul 2026" },
      ],
    };
  }
  // POST api/reports/getRewardsReport
  const res = await api.post("/api/reports/getRewardsReport", filters);
  return res.data || res;
}

export async function getRewardDistributionLogs(filters = {}) {
  if (USE_MOCK) return [];
  const res = await api.post("/api/reports/getRewardDistributionLogs", filters);
  return res.data || res;
}

/* ─── Wallet (uses payment report) ─── */
export async function getWallet() {
  return getPatientPaymentsReport();
}

/* ─── Rewards (uses rewards report) ─── */
export async function getRewards() {
  return getRewardsReport();
}


/* ─── Health Records ─── */
export async function getRecords(filters = {}) {
  try {
    const storedUserId = getStoredUserId();
    let filterQuery = typeof filters === "string" ? filters : (filters.filterQuery || filters.filter || "");
 
    if (storedUserId) {
      if (!filterQuery.toLowerCase().includes("app_user_id=") && !filterQuery.toLowerCase().includes("user_id=")) {
        if (filterQuery.trim()) {
          filterQuery = filterQuery.trim().toLowerCase().startsWith("and ")
            ? `and app_user_id=${storedUserId} ${filterQuery.trim()}`
            : `and app_user_id=${storedUserId} and ${filterQuery.trim()}`;
        } else {
          filterQuery = `and app_user_id=${storedUserId}`;
        }
      }
    }
 
    const payload = {
      pageIndex: filters.pageIndex || 1,
      pageSize: filters.pageSize || 12,
      sortKey: filters.sortKey || "id",
      sortValue: filters.sortValue || "desc",
      filterQuery: filterQuery ? filterQuery.trim() : "",
      filter: filterQuery ? filterQuery.trim() : "",
      ...(storedUserId ? { app_user_id: storedUserId, created_by: storedUserId, user_id: storedUserId } : {}),
      ...((typeof filters === "object" && filters) ? filters : {})
    };
 
    const res = await api.post("/api/patientHealthRecord/get", payload);
    const rawList = res?.data || res?.list || res?.records || res?.result || res?.UserData || (Array.isArray(res) ? res : []);
    const count = res?.count || res?.totalCount || res?.total || (Array.isArray(rawList) ? rawList.length : 0);
 
    const mappedList = Array.isArray(rawList) ? rawList.map(r => ({
      id: r.id || r.record_id || Math.random(),
      title: r.title || r.name || r.record_name || r.file_name || "Health Record",
      doctor: r.doctor_name || r.doctor || r.created_by_name || "Consultant",
      date: r.created_modified_date
        ? new Date(r.created_modified_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
        : r.created_date
        ? new Date(r.created_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
        : (r.date || "Recent"),
      type: r.type || r.record_type || r.category || "Diagnostic",
      fileUrl: r.file_path || r.file_url || r.url || r.file || null,
      raw: r
    })) : [];
 
    return { list: mappedList, count: count || mappedList.length };
  } catch (err) {
    console.error("getRecords API error:", err);
    return { list: [], count: 0 };
  }
}
 
/* ─── Notifications ─── */
export async function getNotifications(filters = {}) {
  try {
    const storedUserId = getStoredUserId();
    let filterQuery = typeof filters === "string" ? filters : (filters.filterQuery || filters.filter || "");
 
    if (storedUserId) {
      if (!filterQuery.toLowerCase().includes("user_id=")) {
        if (filterQuery.trim()) {
          if (filterQuery.trim().toLowerCase().startsWith("and ")) {
            filterQuery = `and user_id=${storedUserId} ${filterQuery.trim()}`;
          } else {
            filterQuery = `and user_id=${storedUserId} and ${filterQuery.trim()}`;
          }
        } else {
          filterQuery = `and user_id=${storedUserId}`;
        }
      }
    }
 
    const payload = {
      pageIndex: filters.pageIndex || 1,
      pageSize: filters.pageSize || 100,
      sortKey: filters.sortKey || "id",
      sortValue: filters.sortValue || "desc",
      filterQuery: filterQuery ? filterQuery.trim() : "",
      filter: filterQuery ? filterQuery.trim() : "",
      ...(storedUserId ? { user_id: storedUserId } : {}),
      ...((typeof filters === "object" && filters) ? filters : {})
    };
 
    const res = await api.post("/api/notification/get", payload);
    const data = res?.data || res?.list || res?.notifications || res?.result || (Array.isArray(res) ? res : []);
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error("getNotifications error with filterQuery, retrying fallback:", err);
    try {
      const storedUserId = getStoredUserId();
      const res = await api.post("/api/notification/get", storedUserId ? { user_id: storedUserId } : {});
      const data = res?.data || res?.list || res?.notifications || res?.result || (Array.isArray(res) ? res : []);
      return Array.isArray(data) ? data : [];
    } catch (fallbackErr) {
      console.error("getNotifications fallback error:", fallbackErr);
      return [];
    }
  }
}
 
 