import {
  Order,
  Packer,
  FruitProduct,
  PriceHistoryItem,
  UserAccount,
  ActivityLogItem,
  AppBranding,
  OrderStatus,
  AppNotification,
} from '../types.ts';

const TOKEN_KEY = 'jajanbuah_auth_token';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string, remember: boolean = true) {
  if (remember) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    sessionStorage.setItem(TOKEN_KEY, token);
  }
}

export function clearStoredToken() {
  localStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers || {});
  const token = getStoredToken();
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  if (!headers.has('Content-Type') && options.body && typeof options.body === 'string') {
    headers.set('Content-Type', 'application/json');
  }

  const res = await fetch(endpoint, {
    ...options,
    headers,
  });

  if (!res.ok) {
    let errMessage = 'Terjadi kesalahan sistem.';
    let errData: any = null;
    try {
      errData = await res.json();
      if (errData && errData.error) {
        errMessage = errData.error;
      }
    } catch {
      // ignore
    }
    const err: any = new Error(errMessage);
    if (errData) {
      err.data = errData;
      err.status = errData.status;
      err.user = errData.user;
    }
    throw err;
  }

  return res.json() as Promise<T>;
}

export const api = {
  // Auth
  async login(username: string, password: string): Promise<{ token: string; user: UserAccount }> {
    const res = await request<{ token: string; user: UserAccount }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    setStoredToken(res.token, true);
    return res;
  },

  async getCurrentUser(): Promise<UserAccount | null> {
    const token = getStoredToken();
    if (!token) return null;
    try {
      const res = await request<{ user: UserAccount }>('/api/auth/me');
      return res.user;
    } catch {
      clearStoredToken();
      return null;
    }
  },

  async logout(): Promise<void> {
    try {
      await request('/api/auth/logout', { method: 'POST' });
    } catch {
      // ignore
    } finally {
      clearStoredToken();
    }
  },

  async changeCredentials(data: { newUsername?: string; newPassword?: string; newName?: string }): Promise<UserAccount> {
    const res = await request<{ success: boolean; user: UserAccount }>('/api/auth/change-credentials', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return res.user;
  },

  async registerWithGoogle(data: {
    name: string;
    email: string;
    phone?: string;
    requestedRole: string;
    shift?: string;
    password?: string;
    avatar?: string;
  }): Promise<{ success: boolean; message: string; registration: any }> {
    return request('/api/auth/register-google', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async checkRegistrationStatus(email: string): Promise<{ exists: boolean; user?: any }> {
    return request(`/api/auth/registration-status?email=${encodeURIComponent(email)}`);
  },

  async getUsers(): Promise<UserAccount[]> {
    const res = await request<{ users: UserAccount[] }>('/api/users');
    return res.users;
  },

  async approveUser(id: string, data: { role?: string; shift?: string }): Promise<{ success: boolean; message: string }> {
    return request(`/api/users/${encodeURIComponent(id)}/approve`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  async rejectUser(id: string): Promise<{ success: boolean; message: string }> {
    return request(`/api/users/${encodeURIComponent(id)}/reject`, {
      method: 'PATCH',
    });
  },

  async updateUserStatus(id: string, status: 'aktif' | 'nonaktif'): Promise<{ success: boolean; status: string }> {
    return request(`/api/users/${encodeURIComponent(id)}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  async updateUserRole(id: string, role: string, shift?: string): Promise<{ success: boolean }> {
    return request(`/api/users/${encodeURIComponent(id)}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role, shift }),
    });
  },

  async deleteUser(id: string): Promise<{ success: boolean }> {
    return request(`/api/users/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  },

  // Products
  async getProducts(): Promise<FruitProduct[]> {
    const res = await request<{ products: FruitProduct[] }>('/api/products');
    return res.products;
  },

  async createProduct(product: Partial<FruitProduct>): Promise<FruitProduct> {
    const res = await request<{ success: boolean; product: FruitProduct }>('/api/products', {
      method: 'POST',
      body: JSON.stringify(product),
    });
    return res.product;
  },

  async updateProduct(id: string, product: Partial<FruitProduct>): Promise<FruitProduct> {
    const res = await request<{ success: boolean; product: FruitProduct }>(`/api/products/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(product),
    });
    return res.product;
  },

  async toggleProductStatus(id: string): Promise<boolean> {
    const res = await request<{ success: boolean; isActive: boolean }>(`/api/products/${encodeURIComponent(id)}/toggle`, {
      method: 'PATCH',
    });
    return res.isActive;
  },

  async deleteProduct(id: string): Promise<void> {
    await request(`/api/products/${encodeURIComponent(id)}`, { method: 'DELETE' });
  },

  // Orders
  async getOrders(): Promise<Order[]> {
    const res = await request<{ orders: Order[] }>('/api/orders');
    return res.orders;
  },

  async createOrder(order: Partial<Order>): Promise<Order> {
    const res = await request<{ success: boolean; order: Order }>('/api/orders', {
      method: 'POST',
      body: JSON.stringify(order),
    });
    return res.order;
  },

  async updateOrder(id: string, order: Partial<Order>): Promise<Order> {
    const res = await request<{ success: boolean; order: Order }>(`/api/orders/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(order),
    });
    return res.order;
  },

  async updateOrderStatus(id: string, status: OrderStatus, note?: string): Promise<Order> {
    const res = await request<{ success: boolean; order: Order }>(`/api/orders/${encodeURIComponent(id)}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, note }),
    });
    return res.order;
  },

  async uploadPaymentProof(id: string, photoUrl: string): Promise<Order> {
    const res = await request<{ success: boolean; order: Order }>(`/api/orders/${encodeURIComponent(id)}/payment-proof`, {
      method: 'PATCH',
      body: JSON.stringify({ photoUrl }),
    });
    return res.order;
  },

  async updateItemWeight(orderId: string, itemId: string, actualWeightKg: number): Promise<Order> {
    const res = await request<{ success: boolean; order: Order }>(`/api/orders/${encodeURIComponent(orderId)}/item-weight`, {
      method: 'PATCH',
      body: JSON.stringify({ itemId, actualWeightKg }),
    });
    return res.order;
  },

  async deleteOrder(id: string): Promise<void> {
    await request(`/api/orders/${encodeURIComponent(id)}`, { method: 'DELETE' });
  },

  // Packers
  async getPackers(): Promise<Packer[]> {
    const res = await request<{ packers: Packer[] }>('/api/packers');
    return res.packers;
  },

  // Price History
  async getPriceHistory(): Promise<PriceHistoryItem[]> {
    const res = await request<{ history: PriceHistoryItem[] }>('/api/price-history');
    return res.history;
  },

  async updateProductPrice(productId: string, newPrice: number, unit: 'kg' | 'gram' | 'pack', reason: string): Promise<PriceHistoryItem> {
    const res = await request<{ success: boolean; item: PriceHistoryItem }>('/api/price-history', {
      method: 'POST',
      body: JSON.stringify({ productId, newPrice, unit, reason }),
    });
    return res.item;
  },

  // Activity Logs
  async getActivityLogs(): Promise<ActivityLogItem[]> {
    const res = await request<{ logs: ActivityLogItem[] }>('/api/activity-logs');
    return res.logs;
  },

  // Branding
  async getBranding(): Promise<AppBranding> {
    const res = await request<{ branding: AppBranding }>('/api/branding');
    return res.branding;
  },

  async updateBranding(branding: AppBranding): Promise<AppBranding> {
    const res = await request<{ success: boolean; branding: AppBranding }>('/api/branding', {
      method: 'PUT',
      body: JSON.stringify(branding),
    });
    return res.branding;
  },

  // Notifications
  async getNotifications(): Promise<AppNotification[]> {
    const res = await request<{ notifications: AppNotification[] }>('/api/notifications');
    return res.notifications;
  },

  async markNotificationRead(id: string): Promise<void> {
    await request(`/api/notifications/${encodeURIComponent(id)}/read`, { method: 'PATCH' });
  },

  async markAllNotificationsRead(): Promise<void> {
    await request('/api/notifications/mark-all-read', { method: 'POST' });
  },
};
