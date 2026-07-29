const BASE = import.meta.env.VITE_API_BASE_URL || "https://p8rhkmb7-8867.inc1.devtunnels.ms/";

function getCookie(name) {
  if (typeof document === "undefined") return "";
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return decodeURIComponent(parts.pop().split(';').shift());
  return "";
}

function getToken() {
  return (
    getCookie("token") ||
    (typeof localStorage !== "undefined" && localStorage.getItem("token")) ||
    ""
  );
}

async function request(method, path, body) {
  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;

  const headers = { 
    "apikey": "JP76Ol1r5lMvzljKmeaTdP9EthTYzKFH",
    "applicationkey": "Xkit6MeT1Et4ZA2N",
  };

  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }

  const token = getToken();
  if (token) {
    headers["token"] = token;
    headers["Authorization"] = `Bearer ${token}`;
    headers["authorization"] = token;
  }

  const cleanBase = BASE.endsWith('/') ? BASE.slice(0, -1) : BASE;
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;

  const res = await fetch(`${cleanBase}/${cleanPath}`, {
    method,
    headers,
    body: isFormData ? body : (body ? (typeof body === "string" ? body : JSON.stringify(body)) : undefined),
  });

  if (res.status === 401) {
    if (typeof localStorage !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("arvaya_token");
      localStorage.removeItem("arvaya_user");
    }
    if (typeof document !== "undefined") {
      document.cookie = "token=; Max-Age=-99999999; path=/;";
      document.cookie = "arvaya_token=; Max-Age=-99999999; path=/;";
    }
    window.location.href = "/login";
    throw new Error("Session expired");
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || "Request failed");
  }

  return res.json();
}

export const api = {
  get: (path) => request("GET", path),
  post: (path, body) => request("POST", path, body),
  put: (path, body) => request("PUT", path, body),
  del: (path) => request("DELETE", path),
};
