/**
 * Unified API Client for PhishShield Backend.
 * Connects React UI to the Flask threat engine.
 */
const API_BASE_URL = 'http://127.0.0.1:5000/api';

/**
 * Helper to handle fetch responses and standardize errors.
 */
async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...(options.headers || {}),
      },
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const errorMsg = data.error || `Server responded with status ${res.status}`;
      throw new Error(errorMsg);
    }

    return data;
  } catch (err) {
    console.error(`API Error on [${options.method || 'GET'}] ${endpoint}:`, err);
    throw err;
  }
}

export const api = {
  // Backend Health
  async getHealth() {
    return request('/health');
  },

  // Dashboard Stats
  async getDashboardStats() {
    return request('/dashboard/stats');
  },

  // URL Analysis
  async analyzeUrl(url) {
    const res = await request('/analyze/url', {
      method: 'POST',
      body: JSON.stringify({ url }),
    });
    if (res && res.success && typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('phishshield:new-scan', { detail: res.data }));
    }
    return res;
  },

  // Email Analysis
  async analyzeEmail(emailContent) {
    const res = await request('/analyze/email', {
      method: 'POST',
      body: JSON.stringify({ email_content: emailContent }),
    });
    if (res && res.success && typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('phishshield:new-scan', { detail: res.data }));
    }
    return res;
  },

  // Scans List with filters
  async getScans({ type, risk, search, limit = 50, offset = 0 } = {}) {
    const params = new URLSearchParams();
    if (type && type !== 'all') params.append('type', type);
    if (risk && risk !== 'all') params.append('risk', risk);
    if (search && search.trim()) params.append('search', search.trim());
    params.append('limit', limit);
    params.append('offset', offset);

    return request(`/scans?${params.toString()}`);
  },

  // Scan Details
  async getScan(id) {
    return request(`/scans/${id}`);
  },

  // Delete Single Scan
  async deleteScan(id) {
    const res = await request(`/scans/${id}`, {
      method: 'DELETE',
    });
    if (res && res.success && typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('phishshield:new-scan', { detail: { action: 'delete', id } }));
    }
    return res;
  },

  // Clear All History
  async clearAllScans() {
    const res = await request('/scans', {
      method: 'DELETE',
    });
    if (res && res.success && typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('phishshield:new-scan', { detail: { action: 'clear' } }));
    }
    return res;
  },

  // Export URLs
  getExportUrl(id, format = 'json') {
    return `${API_BASE_URL}/reports/${id}/export?format=${format}`;
  },
};
