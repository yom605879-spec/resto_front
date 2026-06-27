const API_URL = process.env.NEXT_PUBLIC_API_URL;

async function request(endpoint, options = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: { ...headers, ...options.headers },
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Something went wrong');
  return data.data !== undefined ? data.data : data;
}

export const api = {
  // Auth
  verifyCode: (code) =>
    request('/api/auth/verify-code', { method: 'POST', body: JSON.stringify({ code }) }),
  register: (data) =>
    request('/api/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  login: (data) =>
    request('/api/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  getMe: () => request('/api/auth/me'),
  getAllUsers: () => request('/api/auth/all-users'),
  getStaff: () => request('/api/auth/all-users'),
  createStaff: (data) => request('/api/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  deleteStaff: (id) => request(`/api/auth/reject/${id}`, { method: 'DELETE' }),
  getPendingUsers: () => request('/api/auth/pending'),
  approveUser: (id) =>
    request(`/api/auth/approve/${id}`, { method: 'PUT', body: JSON.stringify({}) }),
  rejectUser: (id) =>
    request(`/api/auth/reject/${id}`, { method: 'DELETE' }),
  // Google auth
  googleAuth: (data) =>
    request('/api/auth/google', { method: 'POST', body: JSON.stringify(data) }),
  googleRegister: (data) =>
    request('/api/auth/google-register', { method: 'POST', body: JSON.stringify(data) }),

  // Stats
  getOverview: () => request('/api/stats/overview'),

  // Branches & Settings (Boss)
  getBranches: () => request('/api/auth/branches'),
  addBranch: (data) => request('/api/auth/branches', { method: 'POST', body: JSON.stringify(data) }),
  updateSettings: (data) => request('/api/auth/settings', { method: 'PUT', body: JSON.stringify(data) }),

  // Menu - Categories
  getCategories: () => request('/api/menu/categories'),
  createCategory: (data) =>
    request('/api/menu/categories', { method: 'POST', body: JSON.stringify(data) }),
  updateCategory: (id, data) =>
    request(`/api/menu/categories/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteCategory: (id) =>
    request(`/api/menu/categories/${id}`, { method: 'DELETE' }),

  // Menu - Items
  getItems: () => request('/api/menu/items'),
  createItem: (data) =>
    request('/api/menu/items', { method: 'POST', body: JSON.stringify(data) }),
  updateItem: (id, data) =>
    request(`/api/menu/items/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteItem: (id) =>
    request(`/api/menu/items/${id}`, { method: 'DELETE' }),

  // Orders
  getOrders: () => request('/api/orders'),
  createOrder: (data) =>
    request('/api/orders', { method: 'POST', body: JSON.stringify(data) }),
  updateOrder: (id, data) =>
    request(`/api/orders/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  updateOrderStatus: (id, status) =>
    request(`/api/orders/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),
  assignOrder: (id, data) =>
    request(`/api/orders/${id}/assign`, { method: 'PUT', body: JSON.stringify(data) }),



  // Expenses
  getExpenses: (params = '') => request(`/api/expenses${params ? '?' + params : ''}`),
  createExpense: (data) =>
    request('/api/expenses', { method: 'POST', body: JSON.stringify(data) }),
  updateExpense: (id, data) =>
    request(`/api/expenses/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteExpense: (id) =>
    request(`/api/expenses/${id}`, { method: 'DELETE' }),

  // Public Customer Portal & Complaints
  getPublicMenu: (restaurantId) => request(`/api/menu/public/${restaurantId}`),
  createPublicOrder: (restaurantId, data) =>
    request(`/api/orders/public/${restaurantId}`, { method: 'POST', body: JSON.stringify(data) }),
  trackPublicOrder: (orderId) => request(`/api/orders/public/track/${orderId}`),
  createPublicReview: (orderId, data) =>
    request(`/api/orders/public/track/${orderId}/review`, { method: 'POST', body: JSON.stringify(data) }),
  submitPublicComplaint: (restaurantId, data) =>
    request(`/api/complaints/public/${restaurantId}`, { method: 'POST', body: JSON.stringify(data) }),
  getComplaints: () => request('/api/complaints'),
  updateComplaintStatus: (id, status) =>
    request(`/api/complaints/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),
  // Admin - Tables
  getTables: () => request('/api/tables'),
  createTable: (data) => request('/api/tables', { method: 'POST', body: JSON.stringify(data) }),
  updateTable: (id, status) => request(`/api/tables/${id}`, { method: 'PUT', body: JSON.stringify({ status }) }),
  deleteTable: (id) => request(`/api/tables/${id}`, { method: 'DELETE' }),

  // Admin - Couriers
  getCouriers: () => request('/api/couriers'),

  // Admin - Messages
  getMessages: () => request('/api/messages'),
  createMessage: (data) => request('/api/messages', { method: 'POST', body: JSON.stringify(data) }),

  // Admin - Customers
  getCustomers: () => request('/api/customers'),
  updateCustomerStatus: (id, is_active) => request(`/api/customers/${id}`, { method: 'PUT', body: JSON.stringify({ is_active }) }),

  // Kassir
  getRefunds: () => request('/api/refunds'),
  createRefund: (data) => request('/api/refunds', { method: 'POST', body: JSON.stringify(data) }),
  getDiscounts: () => request('/api/discounts'),
  createDiscount: (data) => request('/api/discounts', { method: 'POST', body: JSON.stringify(data) }),

  // Inventory & Recipes
  getInventory: () => request('/api/inventory'),
  createInventory: (data) => request('/api/inventory', { method: 'POST', body: JSON.stringify(data) }),
  getRecipes: (menuItemId) => request(`/api/inventory/recipes/${menuItemId}`),
  saveRecipe: (menuItemId, ingredients) => 
    request(`/api/inventory/recipes/${menuItemId}`, { method: 'POST', body: JSON.stringify({ ingredients }) }),
  getTasks: () => request('/api/tasks'),
  createTask: (data) => request('/api/tasks', { method: 'POST', body: JSON.stringify(data) }),
  updateTaskStatus: (id, status) => request(`/api/tasks/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),
  getSchedule: () => request('/api/schedule'),
  createSchedule: (data) => request('/api/schedule', { method: 'POST', body: JSON.stringify(data) }),
  
  // Payroll
  getPayroll: (month) => request(`/api/payroll?month=${month}`),
  paySalary: (data) => request('/api/payroll/pay', { method: 'POST', body: JSON.stringify(data) }),
};
