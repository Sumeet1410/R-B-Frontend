const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const getAuthToken = () => localStorage.getItem('rnb_auth_token');

export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('rnb_auth_token', token);
  } else {
    localStorage.removeItem('rnb_auth_token');
  }
};

export const getUserData = () => {
  const user = localStorage.getItem('rnb_user_data');
  return user ? JSON.parse(user) : null;
};

export const setUserData = (user) => {
  if (user) {
    localStorage.setItem('rnb_user_data', JSON.stringify(user));
  } else {
    localStorage.removeItem('rnb_user_data');
  }
};

export const apiRequest = async (endpoint, options = {}) => {
  const token = getAuthToken();
  const headers = {
    ...options.headers
  };

  // If not FormData, set Content-Type to JSON
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = `${BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.message || `Request failed with status ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error(`[API Error] ${endpoint}:`, error.message);
    throw error;
  }
};
