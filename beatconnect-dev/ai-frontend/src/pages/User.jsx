import React, { useState, useEffect } from 'react';
import { getSystemSettings, updateSystemSetting, ASSET_URL } from '@shared/services/api';
import { Palette, Sparkles, CheckCircle2, Heart, Music, Trash2 } from 'lucide-react';

const User = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('favorites'); // 'favorites' | 'songs'
  const [settings, setSettings] = useState({});
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  
  // Favorites State
  const [favoriteArtists, setFavoriteArtists] = useState([]);
  const [favoriteSongs, setFavoriteSongs] = useState([]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem('token');
    if (!token) {
      setError('not_authenticated');
      setLoading(false);
      return;
    }
    try {
      const settingsData = await getSystemSettings();
      setSettings(settingsData);

      // Load Favorites from LocalStorage with Mock Data
      const storedArtists = localStorage.getItem('bt_fav_artists');
      const storedSongs = localStorage.getItem('bt_fav_songs');

      if (storedArtists) {
        setFavoriteArtists(JSON.parse(storedArtists));
      } else {
        const mockArtists = [
          { id: 'm1', name: 'Nirvana', image: '/backgrounds/nirvana.jpg', genre: 'Grunge' },
          { id: 'm2', name: 'Pink Floyd', image: '/backgrounds/rock.jpg', genre: 'Psychedelic Rock' }
        ];
        setFavoriteArtists(mockArtists);
        localStorage.setItem('bt_fav_artists', JSON.stringify(mockArtists));
      }

      if (storedSongs) {
        setFavoriteSongs(JSON.parse(storedSongs));
      } else {
        const mockSongs = [
          { id: 's1', title: 'Smells Like Teen Spirit', artist: 'Nirvana', duration: '5:01' },
          { id: 's2', title: 'Comfortably Numb', artist: 'Pink Floyd', duration: '6:22' }
        ];
        setFavoriteSongs(mockSongs);
        localStorage.setItem('bt_fav_songs', JSON.stringify(mockSongs));
      }

    } catch (err) {
      setError('Failed to connect to server.');
      if (window.showToast) window.showToast('Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);



  const removeFromFavorites = (id, type) => {
    if (type === 'artist') {
      const updated = favoriteArtists.filter(a => a.id !== id);
      setFavoriteArtists(updated);
      localStorage.setItem('bt_fav_artists', JSON.stringify(updated));
      if (window.showToast) window.showToast('Artist removed from favorites', 'success');
    } else {
      const updated = favoriteSongs.filter(s => s.id !== id);
      setFavoriteSongs(updated);
      localStorage.setItem('bt_fav_songs', JSON.stringify(updated));
      if (window.showToast) window.showToast('Song removed from favorites', 'success');
    }
  };





  return (
    <div className="relative min-h-screen py-12 md:py-20 px-6 md:px-10 font-sans overflow-hidden">
      
      {/* Dynamic Background Layer */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-glow-primary rounded-full blur-[120px] opacity-40 animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-[10%] right-[-5%] w-[40%] h-[40%] bg-glow-secondary rounded-full blur-[100px] opacity-30 animate-pulse" style={{ animationDuration: '12s' }} />
      </div>

      <div className="relative z-10 max-w-[1400px] mx-auto animate-fadeInFast">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
          <div>
            <div className="flex items-center gap-4 mb-4">
              <span className="w-12 h-[1px] bg-gradient-to-r from-primary to-transparent"></span>
              <span className="text-[11px] uppercase font-mono tracking-[0.6em] text-white/30 font-bold">User Terminal Matrix</span>
            </div>
            <h1 className="font-display text-7xl md:text-[100px] font-black italic m-0 text-white tracking-tighter leading-[0.85] drop-shadow-2xl">
              User <span className="text-shimmer drop-shadow-[0_0_30px_rgba(var(--primary-color-rgb),0.3)]">Dashboard</span>
            </h1>
          </div>

          <div className="flex bg-white/5 p-1.5 rounded-2xl border border-white/10 backdrop-blur-xl flex-wrap gap-1">
             <button 
              onClick={() => setActiveTab('favorites')}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all ${activeTab === 'favorites' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
            >
              <Heart size={16} />
              <span className="text-[11px] font-bold uppercase tracking-widest">Artists</span>
            </button>
            <button 
              onClick={() => setActiveTab('songs')}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all ${activeTab === 'songs' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
            >
              <Music size={16} />
              <span className="text-[11px] font-bold uppercase tracking-widest">Songs</span>
            </button>


          </div>
        </div>

        {activeTab === 'favorites' && (
          <div className="animate-fadeIn grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {favoriteArtists.length > 0 ? favoriteArtists.map((artist, idx) => (
              <div key={artist.id} className="group relative glass-card-premium rounded-[32px] overflow-hidden border border-white/5 shadow-2xl transition-all hover:-translate-y-2 hover:border-primary/30" style={{ animationDelay: `${idx * 0.1}s` }}>
                <div className="absolute inset-0 bg-cover bg-center opacity-30 transition-transform duration-1000 group-hover:scale-110" style={{ backgroundImage: `url(${artist.image})` }} />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                <div className="relative p-8 h-[300px] flex flex-col justify-end">
                   <h3 className="text-3xl font-display font-black text-white italic tracking-tighter mb-2">{artist.name}</h3>
                   <span className="text-primary font-mono text-[10px] uppercase tracking-[0.3em] mb-4">{artist.genre}</span>
                   <button 
                    onClick={() => removeFromFavorites(artist.id, 'artist')}
                    className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/30 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all"
                   >
                     <Trash2 size={16} />
                   </button>
                </div>
              </div>
            )) : (
              <div className="col-span-full py-20 text-center glass-card-premium rounded-[48px] border border-white/5">
                <Heart size={48} className="mx-auto mb-6 text-white/10" />
                <p className="text-white/30 font-mono tracking-widest uppercase italic">You haven't followed any artists yet.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'songs' && (
          <div className="animate-fadeIn glass-card-premium rounded-[48px] overflow-hidden border border-white/5">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-white">
                <thead>
                  <tr className="bg-white/[0.02] border-b border-white/5">
                    <th className="p-8 text-[11px] font-mono uppercase tracking-[0.4em] text-white/30 font-bold">Track Title</th>
                    <th className="p-8 text-[11px] font-mono uppercase tracking-[0.4em] text-white/30 font-bold">Artist</th>
                    <th className="p-8 text-[11px] font-mono uppercase tracking-[0.4em] text-white/30 font-bold text-center">Duration</th>
                    <th className="p-8 text-[11px] font-mono uppercase tracking-[0.4em] text-white/30 font-bold text-right pr-14">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.03]">
                  {favoriteSongs.length > 0 ? favoriteSongs.map((song, idx) => (
                    <tr key={song.id} className="hover:bg-white/[0.01] transition-all duration-300 group">
                      <td className="p-8 text-xl font-bold italic">{song.title}</td>
                      <td className="p-8 text-white/60 font-mono uppercase tracking-widest text-sm">{song.artist}</td>
                      <td className="p-8 text-center text-white/40 font-mono text-xs">{song.duration}</td>
                      <td className="p-8 text-right pr-14">
                        <button 
                          onClick={() => removeFromFavorites(song.id, 'song')}
                          className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/30 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all ml-auto"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="4" className="p-20 text-center text-white/10 font-mono italic tracking-widest">Your favorite playlist is currently empty.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}




      </div>


    </div>
  );
};

export default User;


