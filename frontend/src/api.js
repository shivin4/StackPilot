const API_BASE = import.meta.env.VITE_API_URL || "/api";

export function getToken() {
  return localStorage.getItem("stackpilot_token");
}

export function setToken(token) {
  localStorage.setItem("stackpilot_token", token);
}

export function clearToken() {
  localStorage.removeItem("stackpilot_token");
}

function formatError(detail) {
  if (Array.isArray(detail)) {
    return detail.map((d) => d.msg || JSON.stringify(d)).join(", ");
  }
  if (typeof detail === "object" && detail !== null) {
    return JSON.stringify(detail);
  }
  return detail || "Request failed";
}

async function request(path, options = {}) {
  const headers = { ...options.headers };
  if (!(options.body instanceof URLSearchParams)) {
    headers["Content-Type"] = headers["Content-Type"] || "application/json";
  }
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const url = `${API_BASE}${path}`;
  const res = await fetch(url, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(formatError(err.detail) || res.statusText);
  }
  if (res.status === 204) return null;
  return res.json();
}

export async function register(email, password) {
  return request("/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function login(email, password) {
  const body = new URLSearchParams();
  body.append("username", email);
  body.append("password", password);
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(formatError(err.detail) || "Login failed");
  }
  const data = await res.json();
  setToken(data.access_token);
  return data;
}

export const api = {
  projects: () => request("/projects"),
  createProject: (name, repo_url) =>
    request("/projects", {
      method: "POST",
      body: JSON.stringify({ name, repo_url }),
    }),
  deployments: () => request("/deployments"),
  createDeployment: (project_id) =>
    request("/deployments", {
      method: "POST",
      body: JSON.stringify({ project_id }),
    }),
  getDeployment: (id) => request(`/deployments/${id}`),
  stopDeployment: (id) =>
    request(`/deployments/${id}/stop`, { method: "POST" }),
  restartDeployment: (id) =>
    request(`/deployments/${id}/restart`, { method: "POST" }),
  deleteDeployment: (id) =>
    request(`/deployments/${id}`, { method: "DELETE" }),
};
