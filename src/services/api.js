const BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

function getToken() {
  return localStorage.getItem("arvaya_token");
}

async function request(method, path, body) {
  const headers = { 
    "Content-Type": "application/json",
    "apikey": "JP76Ol1r5lMvzljKmeaTdP9EthTYzKFH",
    "applicationkey": "Xkit6MeT1Et4ZA2N",
  };
  const token = getToken();
  if (token) headers["token"] = token;

  const cleanBase = BASE.endsWith('/') ? BASE.slice(0, -1) : BASE;
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;

  const res = await fetch(`${cleanBase}/${cleanPath}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401) {
    localStorage.removeItem("arvaya_token");
    localStorage.removeItem("arvaya_user");
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
