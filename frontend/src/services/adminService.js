const API_BASE = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";

function getToken() {
  return window.localStorage.getItem("authToken") || "";
}

async function request(path, options = {}) {
  const token = getToken();
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
}

export const adminApi = {
  login: async ({ username, password }) => {
    return request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
      headers: {},
    });
  },

  getOverview: async () => request("/api/admin/overview"),
  getUsers: async (search = "") => request(`/api/admin/users?search=${encodeURIComponent(search)}`),
  updateUserPermissions: async (userId, permissions) =>
    request(`/api/admin/users/${userId}/permissions`, {
      method: "PATCH",
      body: JSON.stringify({ permissions }),
    }),
  deleteUser: async (userId) =>
    request(`/api/admin/users/${userId}`, {
      method: "DELETE",
    }),
  getSettings: async () => request("/api/admin/settings"),
  updateSettings: async (payload) =>
    request("/api/admin/settings", {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
  getHealth: async () => request("/api/admin/health"),
  getReports: async () => request("/api/admin/reports"),
  getAnalytics: async () => request("/api/admin/analytics"),
};
