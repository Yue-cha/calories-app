const API_BASE = '/api';

function getHeaders() {
  const token = localStorage.getItem('calo_token');
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export const api = {
  // Auth
  async login(username, password) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Đăng nhập thất bại');
    return data;
  },

  async register(registrationData) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(registrationData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Đăng ký thất bại');
    return data;
  },

  async getMe() {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Phiên làm việc hết hạn');
    return data;
  },

  // Profile
  async getProfile() {
    const res = await fetch(`${API_BASE}/profile`, {
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Không thể tải hồ sơ');
    return data;
  },

  async updateProfile(profileData) {
    const res = await fetch(`${API_BASE}/profile`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(profileData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Không thể cập nhật hồ sơ');
    return data;
  },

  async updateWeeklyWeight(weight) {
    const res = await fetch(`${API_BASE}/profile/weekly-weight`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ weight }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Không thể cập nhật cân nặng tuần mới');
    return data;
  },

  async getWeightHistory() {
    const res = await fetch(`${API_BASE}/profile/weight-history`, {
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Không thể tải lịch sử cân nặng');
    return data;
  },

  async addWeightEntry(weightData) {
    const res = await fetch(`${API_BASE}/profile/weight-history`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(weightData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Không thể lưu cân nặng');
    return data;
  },

  async deleteWeightEntry(id) {
    const res = await fetch(`${API_BASE}/profile/weight-history/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Không thể xóa bản ghi cân nặng');
    return data;
  },

  async simulateMetrics(simulationData) {
    const res = await fetch(`${API_BASE}/profile/simulate`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(simulationData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Lỗi tính toán mô phỏng');
    return data;
  },

  // Meals
  async getMeals(date) {
    const url = date ? `${API_BASE}/meals?date=${date}` : `${API_BASE}/meals`;
    const res = await fetch(url, {
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Không thể tải danh sách bữa ăn');
    return data;
  },

  async addMeal(mealData) {
    const res = await fetch(`${API_BASE}/meals`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(mealData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Không thể thêm món ăn');
    return data;
  },

  async deleteMeal(id) {
    const res = await fetch(`${API_BASE}/meals/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Không thể xóa món ăn');
    return data;
  },

  async getFoodPresets(query = '') {
    const url = query ? `${API_BASE}/meals/presets?q=${encodeURIComponent(query)}` : `${API_BASE}/meals/presets`;
    const res = await fetch(url, {
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Không thể tải gợi ý món ăn');
    return data;
  },

  // AI Meal Suggestions
  async getAiMealSuggestions(params) {
    const res = await fetch(`${API_BASE}/ai/suggest-meals`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(params),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Không thể lấy gợi ý món ăn từ AI');
    return data;
  },
};

