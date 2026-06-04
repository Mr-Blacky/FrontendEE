const GUEST_KEY = "ee_guest_profile";
const AUTH_KEY = "ee_auth_token";
const ADMIN_KEY = "ee_admin_mode";

export function getGuestId() {
  let id = localStorage.getItem("ee_guest_id");
  if (!id) {
    id = `guest_${Math.random().toString(36).slice(2, 11)}`;
    localStorage.setItem("ee_guest_id", id);
  }
  return id;
}

export function loadGuestProfile() {
  try {
    return JSON.parse(localStorage.getItem(GUEST_KEY) || "null");
  } catch {
    return null;
  }
}

export function saveGuestProfile(profile) {
  localStorage.setItem(GUEST_KEY, JSON.stringify(profile));
}

export function ensureGuestProfile() {
  let g = loadGuestProfile();
  if (!g) {
    g = {
      name: "Guest",
      email: "guest@emerald.local",
      isGuest: true,
      theme: "dark",
      lang: "RU",
    };
    saveGuestProfile(g);
  }
  return g;
}

export function getAuthToken() {
  return localStorage.getItem(AUTH_KEY);
}

export function setAuthToken(token) {
  if (token) localStorage.setItem(AUTH_KEY, token);
  else localStorage.removeItem(AUTH_KEY);
}

export function isAdminMode() {
  return localStorage.getItem(ADMIN_KEY) === "1";
}

export function setAdminMode(on) {
  if (on) localStorage.setItem(ADMIN_KEY, "1");
  else localStorage.removeItem(ADMIN_KEY);
}

export const API_BASE = import.meta?.env?.VITE_API_URL || "http://localhost:5000/api";
