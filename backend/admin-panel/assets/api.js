/* Shared helpers used by every admin-panel page. Plain vanilla JS, no build step. */

const API_BASE = "/api";
const TOKEN_KEY = "orinnovative_admin_token";

function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

/**
 * Thin fetch wrapper: attaches the Bearer token, assumes/returns JSON,
 * and redirects to the login page on a 401 response.
 */
async function apiFetch(path, options = {}) {
  const headers = Object.assign({}, options.headers || {});
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const isFormData = options.body instanceof FormData;
  if (!isFormData && options.body && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(API_BASE + path, {
    ...options,
    headers,
    credentials: "include",
  });

  if (res.status === 401) {
    clearToken();
    if (!location.pathname.endsWith("/admin/") && !location.pathname.endsWith("/admin/login.html")) {
      location.href = "/admin/login.html";
    }
    throw new Error("Not authenticated.");
  }

  let data = null;
  try {
    data = await res.json();
  } catch (e) {
    data = null;
  }

  if (!res.ok) {
    const message = (data && data.message) || `Request failed (${res.status})`;
    const err = new Error(message);
    err.details = data;
    throw err;
  }

  return data;
}

// Redirects to login if there's no token at all. Pages still handle 401s
// from apiFetch for the case where the token exists but is expired/invalid.
function requireAuth() {
  if (!getToken()) {
    location.href = "/admin/login.html";
  }
}

function logoutAdmin() {
  apiFetch("/auth/logout", { method: "POST" }).catch(() => {});
  clearToken();
  location.href = "/admin/login.html";
}

function showAlert(containerEl, message, type = "error") {
  containerEl.innerHTML = `<div class="alert ${type}">${escapeHtml(message)}</div>`;
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[c]));
}

function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleString();
}

// Highlights the current page in the sidebar nav.
function markActiveNav() {
  const file = location.pathname.split("/").pop() || "dashboard.html";
  document.querySelectorAll(".sidebar nav a").forEach((a) => {
    if (a.getAttribute("href") === file) a.classList.add("active");
  });
}

document.addEventListener("DOMContentLoaded", markActiveNav);
