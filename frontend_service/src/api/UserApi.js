import axios from "axios";

const API_BASE = window.env.VITE_API_BASE_URL;

// Store token in memory (also persisted to sessionStorage for page refresh)
let authToken = sessionStorage.getItem("zalary_token") || null;
let authUserId = sessionStorage.getItem("zalary_userId") || null;
let authEmail = sessionStorage.getItem("zalary_email") || null;

export const getToken = () => authToken;
export const getUserId = () => authUserId;
export const isAuthenticated = () => !!authToken;

const setAuth = (token, userId, email) => {
  authToken = token;
  authUserId = String(userId);
  sessionStorage.setItem("zalary_token", token);
  sessionStorage.setItem("zalary_userId", String(userId));
  sessionStorage.setItem("zalary_email", String(email));
};

export const clearAuth = () => {
  authToken = null;
  authUserId = null;
  sessionStorage.removeItem("zalary_token");
  sessionStorage.removeItem("zalary_userId");
  sessionStorage.removeItem("zalary_email");
};

// Axios instance that auto-attaches Bearer token
export const authAxios = axios.create({ baseURL: API_BASE });
authAxios.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── signup ──────────────────────────────────────────────
// POST /signup  { email, password }
// Returns: { message, userId }
export const signup = async ({ email, password }) => {
  const res = await axios.post(`${API_BASE}/signup`, { email, password });
  return res.data; // { message, userId }
};

// ── login ───────────────────────────────────────────────
// POST /login  { email, password }
// Returns: { message, token, userId }
export const login = async ({ email, password }) => {
  const res = await axios.post(`${API_BASE}/login`, { email, password });
  const { token, userId } = res.data;
  setAuth(token, userId, email);
  return res.data; // { message, token, userId }
};

// ── logout ──────────────────────────────────────────────
export const logout = () => {
  clearAuth();
};