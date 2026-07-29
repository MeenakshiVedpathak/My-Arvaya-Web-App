import { api } from "./api";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://p8rhkmb7-8867.inc1.devtunnels.ms/";

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

export async function uploadImage(file, folderName, filename) {
  const formData = new FormData();
  formData.append('Image', file, filename);
  const response = await api.post(`/api/upload/${folderName}`, formData);
  return response?.data || response?.result || response;
}

export async function fetchImageBlob(imagePath, folderName = 'familyProfileImage') {
  if (!imagePath) return null;
  const pathStr = String(imagePath).trim();
  if (!pathStr || pathStr === "undefined" || pathStr === "null") return null;

  if (pathStr.startsWith("data:") || pathStr.startsWith("blob:")) {
    return pathStr;
  }

  const cleanBase = BASE_URL.endsWith('/') ? BASE_URL.slice(0, -1) : BASE_URL;
  let fileName = pathStr;
  if (fileName.includes('/')) {
    fileName = fileName.split('/').pop();
  }

  const token = getToken();
  const headers = {
    "apikey": "JP76Ol1r5lMvzljKmeaTdP9EthTYzKFH",
    "applicationkey": "Xkit6MeT1Et4ZA2N",
  };
  if (token) {
    headers["token"] = token;
    headers["Authorization"] = `Bearer ${token}`;
    headers["authorization"] = token;
  }

  const targetUrl = (pathStr.startsWith("http://") || pathStr.startsWith("https://"))
    ? pathStr
    : `${cleanBase}/static/${folderName}/${fileName}`;

  try {
    const res = await fetch(targetUrl, { 
      headers,
      redirect: 'manual'
    });
    if (res.ok && res.status === 200) {
      const contentType = res.headers.get("content-type") || "";
      if (contentType.includes("image") || contentType.includes("octet-stream") || res.type === "basic" || res.type === "cors") {
        const blob = await res.blob();
        if (blob && blob.size > 0) {
          return URL.createObjectURL(blob);
        }
      }
    }
  } catch (err) {
    // Silent catch to avoid console error pollution
  }

  return null;
}

export function getImageUrl(imagePath, folderName = 'familyProfileImage') {
  if (!imagePath) return "";
  const pathStr = String(imagePath).trim();
  if (!pathStr || pathStr === "undefined" || pathStr === "null") return "";

  if (pathStr.startsWith("data:") || pathStr.startsWith("blob:")) {
    return pathStr;
  }

  if (pathStr.startsWith("http://") || pathStr.startsWith("https://")) {
    return pathStr;
  }

  const cleanBase = BASE_URL.endsWith('/') ? BASE_URL.slice(0, -1) : BASE_URL;
  const cleanPath = pathStr.startsWith('/') ? pathStr.slice(1) : pathStr;

  if (cleanPath.startsWith(`static/${folderName}`)) {
    return `${cleanBase}/${cleanPath}`;
  }

  if (cleanPath.startsWith(folderName)) {
    return `${cleanBase}/static/${cleanPath}`;
  }

  return `${cleanBase}/static/${folderName}/${cleanPath}`;
}
