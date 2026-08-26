const API_BASE_URL = "http://127.0.0.1:8000";

/**
 * Get stored authentication token.
 */
export function getAuthToken() {
  try {
    const userStr = localStorage.getItem("svcare_user");
    if (userStr) {
      const user = JSON.parse(userStr);
      return user.token || user.adminToken || null;
    }
  } catch {
    return null;
  }
  return null;
}

/**
 * Universal fetch wrapper with authorization header.
 */
export async function apiRequest(endpoint, options = {}) {
  const token = getAuthToken();
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const url = `${API_BASE_URL}${endpoint}`;
  try {
    const response = await fetch(url, { ...options, headers });
    if (!response.ok) {
      let errorDetail = `Request failed (${response.status})`;
      try {
        const errorJson = await response.json();
        errorDetail = errorJson.detail || errorDetail;
      } catch {
        // use default
      }
      throw new Error(errorDetail);
    }
    return await response.json();
  } catch (err) {
    console.warn(`[API] ${endpoint} error:`, err.message);
    throw err;
  }
}

// ----------------------------------------------------
// AUTH APIs
// ----------------------------------------------------
export const authApi = {
  sendEmailOtp: (email, name) =>
    apiRequest("/auth/send-email-otp", {
      method: "POST",
      body: JSON.stringify({ email, name }),
    }),

  verifyEmailOtp: (email, otp, name) =>
    apiRequest("/auth/verify-email-otp", {
      method: "POST",
      body: JSON.stringify({ email, otp, name }),
    }),

  sendOtp: (phone, country_code = "+91") =>
    apiRequest("/auth/send-otp", {
      method: "POST",
      body: JSON.stringify({ phone, country_code }),
    }),

  verifyOtp: (phone, otp) =>
    apiRequest("/auth/verify-otp", {
      method: "POST",
      body: JSON.stringify({ phone, otp }),
    }),

  register: (data) =>
    apiRequest("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  adminLogin: (email, password) =>
    apiRequest("/auth/admin-login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  getProfile: () => apiRequest("/auth/me"),
};

// ----------------------------------------------------
// PRODUCTS APIs
// ----------------------------------------------------
export const productsApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/products/${query ? `?${query}` : ""}`);
  },

  getById: (id) => apiRequest(`/products/${id}`),

  create: (data) =>
    apiRequest("/products/", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id, data) =>
    apiRequest(`/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: (id) =>
    apiRequest(`/products/${id}`, {
      method: "DELETE",
    }),
};

// ----------------------------------------------------
// ORDERS APIs
// ----------------------------------------------------
export const ordersApi = {
  create: (orderData) =>
    apiRequest("/orders/", {
      method: "POST",
      body: JSON.stringify(orderData),
    }),

  getAll: (statusFilter) =>
    apiRequest(`/orders/${statusFilter ? `?status_filter=${statusFilter}` : ""}`),

  getById: (id) => apiRequest(`/orders/${id}`),

  updateStatus: (orderId, newStatus, reason = "", rejection_reason = "") =>
    apiRequest(`/orders/${orderId}/status`, {
      method: "PUT",
      body: JSON.stringify({ new_status: newStatus, reason, rejection_reason }),
    }),

  getHistory: (orderId) => apiRequest(`/orders/${orderId}/history`),
};

// ----------------------------------------------------
// INVENTORY APIs
// ----------------------------------------------------
export const inventoryApi = {
  getAll: (lowStockOnly = false, search = "") => {
    const params = new URLSearchParams();
    if (lowStockOnly) params.append("low_stock_only", "true");
    if (search) params.append("search", search);
    return apiRequest(`/inventory/?${params.toString()}`);
  },

  adjust: (productId, adjustmentType, quantity, reason) =>
    apiRequest("/inventory/adjust", {
      method: "POST",
      body: JSON.stringify({
        product_id: productId,
        adjustment_type: adjustmentType,
        quantity: parseInt(quantity, 10),
        reason,
      }),
    }),

  getMovements: (productId = null) =>
    apiRequest(`/inventory/movements${productId ? `?product_id=${productId}` : ""}`),
};

// ----------------------------------------------------
// PRESCRIPTIONS APIs
// ----------------------------------------------------
export const prescriptionsApi = {
  upload: (filePath, orderId = null) => {
    const formData = new FormData();
    if (filePath) formData.append("file_path", filePath);
    if (orderId) formData.append("order_id", orderId);
    return apiRequest("/prescriptions/upload", {
      method: "POST",
      headers: {}, // let browser set boundary
      body: formData,
    });
  },

  getAll: (statusFilter = null) =>
    apiRequest(`/prescriptions/${statusFilter ? `?status_filter=${statusFilter}` : ""}`),

  review: (rxId, status, notes = "") =>
    apiRequest(`/prescriptions/${rxId}/review`, {
      method: "PUT",
      body: JSON.stringify({ status, notes }),
    }),
};

// ----------------------------------------------------
// NOTIFICATIONS APIs
// ----------------------------------------------------
export const notificationsApi = {
  getAll: () => apiRequest("/notifications/"),
  markRead: (id) => apiRequest(`/notifications/${id}/read`, { method: "PUT" }),
  markAllRead: () => apiRequest("/notifications/read-all", { method: "PUT" }),
};

// ----------------------------------------------------
// ADMIN APIs
// ----------------------------------------------------
export const adminApi = {
  getUsers: (role = null, search = "") => {
    const params = new URLSearchParams();
    if (role) params.append("role", role);
    if (search) params.append("search", search);
    return apiRequest(`/admin/users?${params.toString()}`);
  },

  updateUserRole: (userId, role) =>
    apiRequest(`/admin/users/${userId}/role`, {
      method: "PUT",
      body: JSON.stringify({ role }),
    }),

  toggleUserStatus: (userId) =>
    apiRequest(`/admin/users/${userId}/toggle-status`, {
      method: "PUT",
    }),

  getAuditLogs: (entity = null) =>
    apiRequest(`/admin/audit-logs${entity ? `?entity=${entity}` : ""}`),

  getAnalytics: () => apiRequest("/admin/analytics"),
};
