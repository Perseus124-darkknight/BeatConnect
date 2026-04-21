export const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
export const API_BASE = `${BACKEND_URL}/api`;
export const ASSET_URL = `${BACKEND_URL}/public/assets`;

export const fetchArtists = async () => {
  const res = await fetch(`${API_BASE}/artists?t=${Date.now()}`, { credentials: 'include' });
  return res.json();
};

export const fetchArtistDetails = async (name) => {
  const res = await fetch(`${API_BASE}/artist/${encodeURIComponent(name)}?t=${Date.now()}`, { credentials: 'include' });
  return res.json();
};

export const fetchDailyReport = async () => {
  const res = await fetch(`${API_BASE}/daily/report?t=${Date.now()}`, { credentials: 'include' });
  return res.json();
};

export const login = async (username, password) => {
  const res = await fetch(`${API_BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
    credentials: 'include'
  });
  return res.json();
};

export const register = async (username, password) => {
  const res = await fetch(`${API_BASE}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
    credentials: 'include'
  });
  return res.json();
};

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
};

export const getAdminArtists = async () => {
    const res = await fetch(`${API_BASE}/admin/artists`, {
        headers: getAuthHeaders(),
        credentials: 'include'
    });
    return res.json();
};

export const saveArtist = async (data) => {
    const res = await fetch(`${API_BASE}/admin/artist/save`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
        credentials: 'include'
    });
    return res.json();
};

export const deleteArtist = async (id) => {
    const res = await fetch(`${API_BASE}/admin/artist/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
        credentials: 'include'
    });
    return res.json();
};export const getSystemSettings = () => fetch(`${API_BASE}/system/settings`, { 
    headers: getAuthHeaders(),
    credentials: 'include' 
}).then(res => res.json());

export const updateSystemSetting = (key, value) => fetch(`${API_BASE}/system/settings`, {
  method: 'POST',
  headers: getAuthHeaders(),
  body: JSON.stringify({ key, value }),
  credentials: 'include'
}).then(res => res.json());

export const fetchKnowledgeBase = async () => {
    const res = await fetch(`${API_BASE}/admin/knowledge`, {
        headers: getAuthHeaders(),
        credentials: 'include'
    });
    return res.json();
};

export const updateKnowledgeBase = async (content) => {
    const res = await fetch(`${API_BASE}/admin/knowledge`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ content }),
        credentials: 'include'
    });
    return res.json();
};

export const fetchAdminMetrics = async () => {
    const res = await fetch(`${API_BASE}/admin/metrics`, {
        headers: getAuthHeaders(),
        credentials: 'include'
    });
    return res.json();
};

export const getSystemUsers = async () => {
    const res = await fetch(`${API_BASE}/admin/users`, {
        headers: getAuthHeaders(),
        credentials: 'include'
    });
    return res.json();
};

export const deleteSystemUser = async (id) => {
    const res = await fetch(`${API_BASE}/admin/user/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
        credentials: 'include'
    });
    return res.json();
};
