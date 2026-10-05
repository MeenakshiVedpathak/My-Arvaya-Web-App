const TOKEN_KEY = 'ACCESS_TOKEN';
const TOKEN_EXPIRY_KEY = 'TOKEN_EXPIRY';

const CLIENT_ID = import.meta.env.VITE_ANTWORK_CLIENT_ID;
const CLIENT_SECRET = import.meta.env.VITE_ANTWORK_CLIENT_SECRET;
const SCOPE = import.meta.env.VITE_ANTWORK_SCOPE;
const TENANT_ID = import.meta.env.VITE_ANTWORK_TENANT_ID;

const TOKEN_URL = `https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0/token`;

export const getStoredToken = async () => {
  return localStorage.getItem(TOKEN_KEY);
};

export const isTokenExpired = async () => {
  const expiry = localStorage.getItem(TOKEN_EXPIRY_KEY);

  if (!expiry) {
    return true;
  }

  return Date.now() >= Number(expiry);
};

export const fetchAccessToken = async () => {
  try {
    const formData = new URLSearchParams();

    formData.append('client_id', CLIENT_ID ?? '');
    formData.append('client_secret', CLIENT_SECRET ?? '');
    formData.append('scope', SCOPE ?? '');
    formData.append('grant_type', 'client_credentials');

    const response = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.error_description || 'Token fetch failed');
    }

    const accessToken = data.access_token;
    const expiresIn = data.expires_in;

    const expiryTime = Date.now() + (expiresIn - 60) * 1000;

    localStorage.setItem(TOKEN_KEY, accessToken);
    localStorage.setItem(TOKEN_EXPIRY_KEY, expiryTime.toString());

    return accessToken;
  } catch (error) {
    console.log('Token Error:', error);
    throw error;
  }
};

export const getValidToken = async () => {
  const token = await getStoredToken();
  const expired = await isTokenExpired();

  if (!token || expired) {
    return fetchAccessToken();
  }

  return token;
};

export const clearAuthData = async () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(TOKEN_EXPIRY_KEY);
};
