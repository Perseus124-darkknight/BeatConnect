import React, { useState, useEffect } from 'react';
import { fetchArtists } from '../services/api';

const Admin = () => {
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchArtists();
        setArtists(data);
      } catch (err) {
        if (window.showToast) window.showToast('Failed to load artists', 'error');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  return (
    <div className="py-10 px-10 max-w-[1200px] mx-auto font-sans">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="font-display text-6xl m-0 text-secondary">Admin Dashboard</h1>
          <p className="font-mono text-muted mt-2">Manage your music catalog</p>
        </div>
        <button 
          className="bg-primary text-white border-none py-3 px-6 rounded-xl font-bold cursor-pointer shadow-[0_4px_14px_0_rgba(236,72,153,0.39)] transition-transform hover:-translate-y-1 hover:shadow-[0_6px_20px_rgba(236,72,153,0.23)]"
          onClick={() => { if(window.showToast) window.showToast('Coming soon: Add Artist feature') }}
        >
          + Add New Artist
        </button>
      </div>

      <div className="bg-glass rounded-2xl border border-glass overflow-hidden backdrop-blur-xl">
        <table className="w-full border-collapse text-left text-white">
          <thead>
            <tr className="bg-white/5 border-b border-glass">
              <th className="p-4 px-6 text-muted font-normal">Name</th>
              <th className="p-4 px-6 text-muted font-normal">Status</th>
              <th className="p-4 px-6 text-muted font-normal">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="3" className="p-6 text-center text-muted">Loading artists...</td></tr>
            ) : artists.map((artist, idx) => (
              <tr key={artist} className={`hover:bg-white/5 transition-colors ${idx < artists.length - 1 ? 'border-b border-glass' : ''}`}>
                <td className="p-4 px-6 font-bold">{artist}</td>
                <td className="p-4 px-6">
                  <span className="bg-emerald-500/20 text-emerald-400 py-1 px-2 rounded font-mono text-xs">Active</span>
                </td>
                <td className="p-4 px-6">
                  <button className="bg-transparent border border-glass text-secondary py-1.5 px-3 rounded cursor-pointer transition-colors hover:bg-glass">
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Admin;
