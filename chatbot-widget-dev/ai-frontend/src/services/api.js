export const API_BASE = 'http://localhost:3000/api';

export const fetchArtists = async () => {
  const res = await fetch(`${API_BASE}/artists?t=${Date.now()}`);
  return res.json();
};

export const fetchArtistDetails = async (name) => {
  const res = await fetch(`${API_BASE}/artist/${encodeURIComponent(name)}?t=${Date.now()}`);
  return res.json();
};

export const fetchDailyReport = async () => {
  const res = await fetch(`${API_BASE}/daily/report?t=${Date.now()}`);
  return res.json();
};
