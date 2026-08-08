const TENANT_ID = import.meta.env.VITE_SECURE_ANT_TENANT_ID;
const CLIENT_ID = import.meta.env.VITE_SECURE_ANT_CLIENT_ID;
const CLIENT_SECRET = import.meta.env.VITE_SECURE_ANT_CLIENT_SECRET;
const SCOPE = import.meta.env.VITE_SECURE_ANT_SCOPE;
const BASE_URL = import.meta.env.VITE_SECURE_ANT_BASE_URL || "https://secure-ant.works:8055";

/**
 * Generates an Access Token via Azure OAuth 2.0 (Client Credentials Grant)
 */
export async function getAccessToken() {
  const url = `https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0/token`;
  
  const params = new URLSearchParams();
  params.append("client_id", CLIENT_ID);
  params.append("client_secret", CLIENT_SECRET);
  params.append("grant_type", "client_credentials");
  params.append("scope", SCOPE);

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error_description || "Failed to generate access token");
  }

  const data = await response.json();
  return data.access_token;
}

/**
 * Helper to perform authorized fetch requests to the Secure ANT API
 */
async function secureAntFetch(path, token, options = {}) {
  const cleanBase = BASE_URL.endsWith("/") ? BASE_URL.slice(0, -1) : BASE_URL;
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  const url = `${cleanBase}${cleanPath}`;

  const headers = {
    "Authorization": `Bearer ${token}`,
    "Content-Type": "application/json",
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    throw new Error("Unauthorized or token expired");
  }

  if (!response.ok) {
    const err = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(err.message || "Secure ANT request failed");
  }

  return response.json();
}

/**
 * Returns complete dashboard information for a patient
 */
export async function getPatientDashboard(uhid, token) {
  return secureAntFetch(`/api/PatientDashboard/${uhid}`, token);
}

/**
 * Returns recently accessed patients for a user
 */
export async function getRecentPatients(userId, token) {
  return secureAntFetch(`/api/PatientDashboard/recent-patients/${userId}`, token);
}

/**
 * Returns searchable patient list for the specified user
 */
export async function searchPatientList(userId, token) {
  return secureAntFetch(`/api/PatientDashboard/search-list/${userId}`, token);
}
