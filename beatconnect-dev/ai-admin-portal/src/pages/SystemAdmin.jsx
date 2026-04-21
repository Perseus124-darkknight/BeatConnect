import React, { useState, useEffect } from 'react';
import { getAdminArtists, saveArtist, deleteArtist, getSystemSettings, updateSystemSetting, fetchKnowledgeBase, updateKnowledgeBase, ASSET_URL, getSystemUsers, deleteSystemUser } from '@shared/services/api';
import ArtistFormModal from '@shared/components/Modals/ArtistFormModal';
import DashboardStats from '../components/Admin/DashboardStats';
import SystemConsole from '../components/Admin/SystemConsole';
import { Palette, Users, Sparkles, CheckCircle2, Shield, Settings, Activity, Brain, RefreshCw, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@shared/context/AuthContext';

const SystemAdmin = () => {
  const { logout } = useAuth();
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingArtist, setEditingArtist] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'roster' | 'appearance' | 'knowledge' | 'users'
  const [settings, setSettings] = useState({});
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [knowledgeContent, setKnowledgeContent] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAdminArtists();
      const settingsData = await getSystemSettings();
      const knowledgeData = await fetchKnowledgeBase();
      const usersData = await getSystemUsers();
      
      setSettings(settingsData);
      setKnowledgeContent(knowledgeData.content || '');
      setUsers(Array.isArray(usersData) ? usersData : []);
      
      if (data?.error) {
        setError(data.error);
        setArtists([]);
      } else {
        setArtists(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      setError('Failed to connect to Neural Network.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateKnowledge = async () => {
    setIsSyncing(true);
    try {
      const res = await updateKnowledgeBase(knowledgeContent);
      if (res.message) {
        if (window.showToast) window.showToast('Neural Network Re-Synchronized', 'success');
      }
    } catch (err) {
      if (window.showToast) window.showToast('Sync Failed', 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  const loadDataEffect = useEffect(() => {
    loadData();
  }, []);

  const handleSave = async (formData) => {
    try {
      const res = await saveArtist(formData);
      if (res.id || res.message) {
        if (window.showToast) window.showToast('Artist Identity Initialized', 'success');
        setIsModalOpen(false);
        setEditingArtist(null);
        loadData();
      }
    } catch (err) {
      if (window.showToast) window.showToast('Initialization Failed', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Decommission this identity node?')) return;
    try {
      const res = await deleteArtist(id);
      if (res.message) {
        if (window.showToast) window.showToast('Node Decommissioned', 'success');
        loadData();
      }
    } catch (err) {
      if (window.showToast) window.showToast('Operation Failed', 'error');
    }
  };

  const handleUpdateAvatar = async (url, type = 'user') => {
    setIsSavingSettings(true);
    const key = type === 'bot' ? 'bot_avatar' : 'user_avatar';
    try {
      await updateSystemSetting(key, url);
      setSettings(prev => ({ ...prev, [key]: url }));
      if (window.showToast) window.showToast(`${type.toUpperCase()} Persona Synchronized`, 'success');
    } catch (err) {
      if (window.showToast) window.showToast('Sync Failed', 'error');
    } finally {
      setIsSavingSettings(false);
    }
  };

  const filtered = artists.filter(a => 
    a.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="relative min-h-screen pt-32 pb-20 px-6 md:px-10 font-sans overflow-hidden bg-black selection:bg-primary/30">
      
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
        <div className="absolute bottom-1/4 -left-1/4 w-1/2 h-1/2 bg-primary/5 rounded-full blur-[200px] animate-pulse" />
      </div>

      <div className="relative z-10 max-w-[1600px] mx-auto">
        
        {/* Header Section */}
        <header className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-8 mb-16">
          <div className="animate-fadeInLeft">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]" />
              <span className="text-[10px] uppercase font-mono tracking-[0.6em] text-white/30 font-bold">Node Status: Secure / Authorization Level 4</span>
            </div>
            <h1 className="font-display text-7xl md:text-[140px] font-black italic m-0 text-white tracking-tighter leading-[0.75] drop-shadow-2xl">
              SYSTEM <span className="text-shimmer bg-clip-text text-transparent bg-gradient-to-r from-primary via-white to-secondary">CONSOLE</span>
            </h1>
          </div>

          <nav className="flex bg-white/5 p-1.5 rounded-3xl border border-white/10 backdrop-blur-3xl animate-fadeInRight">
             {[
               { id: 'dashboard', label: 'CMD Center', icon: Activity },
               { id: 'roster', label: 'Identity Nodes', icon: Users },
               { id: 'users', label: 'User Entities', icon: Shield },
               { id: 'knowledge', label: 'Mind State', icon: Brain },
               { id: 'appearance', label: 'HUD Config', icon: Palette }
             ].map(tab => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center gap-3 px-8 py-4 rounded-2xl transition-all duration-500 ${activeTab === tab.id ? 'text-white' : 'text-white/30 hover:text-white/60'}`}
              >
                {activeTab === tab.id && (
                  <motion.div 
                    layoutId="activeTab"
                    className="absolute inset-0 bg-primary rounded-2xl shadow-[0_0_30px_rgba(var(--primary-color-rgb),0.3)]"
                  />
                )}
                <tab.icon size={18} className="relative z-10" />
                <span className="relative z-10 text-[11px] font-bold uppercase tracking-widest">{tab.label}</span>
              </button>
             ))}
          </nav>
        </header>

        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <DashboardStats artistCount={artists.length} />
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <SystemConsole />
                  <div className="glass-card-premium rounded-[48px] p-12 border border-white/5 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <h3 className="text-3xl font-display font-black italic text-white mb-8 tracking-tight">Authority Access Matrix</h3>
                    <p className="text-white/40 leading-relaxed mb-10 max-w-2xl font-mono text-sm">
                      Global identity synchronization is currently ACTIVE. Any changes made to artist profiles or personas will propagate through the neural network in real-time. Protocol 9 encryption is applied to all outgoing asset transfers.
                    </p>
                    <div className="flex gap-4">
                      <div className="px-6 py-2 rounded-full border border-primary/20 bg-primary/5 text-primary text-[10px] font-mono uppercase">Encryption: AES-256</div>
                      <div className="px-6 py-2 rounded-full border border-secondary/20 bg-secondary/5 text-secondary text-[10px] font-mono uppercase">Status: Isolated</div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-8">
                  <div className="glass-card-premium rounded-[40px] p-10 border border-white/5">
                     <h4 className="text-white/30 font-mono text-[10px] uppercase tracking-[0.4em] mb-6">Security Terminal</h4>
                     <div className="space-y-6">
                        <div className="flex justify-between items-center p-5 bg-white/5 rounded-2xl">
                           <span className="text-white text-xs font-bold">Admin Privileges</span>
                           <span className="text-emerald-400 font-mono text-[10px] uppercase">Active</span>
                        </div>
                        <div className="flex justify-between items-center p-5 bg-white/5 rounded-2xl">
                           <span className="text-white text-xs font-bold">Intrusion Prevention</span>
                           <span className="text-emerald-400 font-mono text-[10px] uppercase">Standby</span>
                        </div>
                        <button onClick={logout} className="w-full py-5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 font-mono text-[10px] uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all">
                          Emergency Lockout
                        </button>
                     </div>
                  </div>
                  
                  <div className="relative aspect-square rounded-[40px] overflow-hidden border border-white/10 group">
                    <img src={settings.bot_avatar || `${ASSET_URL}/bot_icon_purple.png`} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" alt="Bot" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                    <div className="absolute bottom-10 inset-x-10">
                      <div className="text-white font-display text-4xl font-black italic uppercase tracking-tighter mb-1">BEATBOT 2.0</div>
                      <div className="text-primary font-mono text-[10px] uppercase tracking-[0.3em]">Identity active</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'roster' && (
            <motion.div 
              key="roster"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-12">
                <div className="relative w-full md:w-[600px] group">
                  <input 
                    type="text"
                    placeholder="SCANNING IDENTITY DATABASE..."
                    className="w-full bg-white/[0.03] border border-white/10 rounded-[32px] py-7 px-16 text-white outline-none focus:border-primary/50 focus:bg-white/[0.07] transition-all font-mono text-sm tracking-widest placeholder:text-white/10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <Shield size={22} className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-primary transition-colors" />
                </div>
                
                <button 
                  onClick={() => { setEditingArtist(null); setIsModalOpen(true); }}
                  className="group relative h-20 px-14 rounded-3xl overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-[0_20px_50px_rgba(var(--primary-color-rgb),0.3)]"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-secondary" />
                  <span className="relative z-10 flex items-center gap-4 text-white font-black text-sm uppercase tracking-[0.2em]">
                    <Settings size={20} className="animate-spin-slow" />
                    INIT NEW NODE
                  </span>
                </button>
              </div>

              {loading ? (
                <div className="h-96 flex flex-col items-center justify-center gap-6">
                  <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                  <span className="font-mono text-[10px] uppercase tracking-[0.4em] text-white/20">Querying Database...</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-8">
                  {filtered.map((artist, idx) => (
                    <motion.div 
                      key={artist.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="group relative glass-card-premium rounded-[48px] border border-white/5 p-8 transition-all hover:-translate-y-2 hover:border-primary/30"
                    >
                      {/* Scanner Effect */}
                      <div className="absolute top-0 left-1/4 right-1/4 h-px bg-primary/40 scale-x-0 group-hover:scale-x-100 transition-transform duration-700 blur-[2px]" />
                      
                      <div className="flex flex-col items-center text-center">
                        <div className="relative w-40 h-40 mb-8">
                          <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                          <div className="relative w-full h-full rounded-[48px] overflow-hidden border-2 border-white/10 group-hover:border-primary transition-colors">
                            {artist.profile_image ? (
                              <img src={artist.profile_image} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" alt="" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-white/5 text-4xl">🎸</div>
                            )}
                          </div>
                        </div>

                        <h2 className="text-3xl font-display font-black italic text-white mb-2 tracking-tight uppercase">{artist.name}</h2>
                        <div className="text-[10px] font-mono text-primary uppercase tracking-[0.3em] mb-6">Node ID: Bc-9{idx+100}</div>
                        
                        <div className="w-full flex gap-3 mb-8">
                          <div className="flex-1 p-4 bg-white/5 rounded-2xl border border-white/10">
                            <div className="text-[8px] font-mono text-white/20 uppercase mb-1">Work</div>
                            <div className="text-[10px] font-bold text-white truncate">{artist.featured_album || 'Unlisted'}</div>
                          </div>
                          <div className="flex-1 p-4 bg-white/5 rounded-2xl border border-white/10">
                            <div className="text-[8px] font-mono text-white/20 uppercase mb-1">Status</div>
                            <div className={`text-[10px] font-bold uppercase ${artist.is_deleted ? 'text-red-500' : 'text-emerald-400'}`}>
                              {artist.is_deleted ? 'Archived' : 'Active'}
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-4 w-full">
                          <button 
                            onClick={() => { setEditingArtist(artist); setIsModalOpen(true); }}
                            className="flex-1 py-4 bg-white/5 hover:bg-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white transition-all border border-white/10"
                          >
                            Modify
                          </button>
                          <button 
                            onClick={() => handleDelete(artist.id)}
                            className="w-14 py-4 bg-red-500/10 hover:bg-red-500 rounded-2xl flex items-center justify-center text-red-500 hover:text-white transition-all border border-red-500/20"
                          >
                            <Shield size={16} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'appearance' && (
            <motion.div 
              key="appearance"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-12"
            >
              {[
                { title: 'User Identity HUD', type: 'user', opts: [
                  { id: 'user_note', url: 'https://i.ibb.co/LnhFqVr/user-note.png', label: 'Cyan Pulse' },
                  { id: 'user_alien', url: 'https://i.ibb.co/m0f6vXz/user-alien.png', label: 'Pink Neon' },
                  { id: 'user_knob', url: 'https://i.ibb.co/LnhFqVr/user-knob.png', label: 'Violet Dial' },
                  { id: 'user_bolt', url: 'https://i.ibb.co/m0f6vXz/user-bolt.png', label: 'Gold Strike' }
                ], icon: Sparkles, current: settings.user_avatar },
                { title: 'Beatbot Persona', type: 'bot', opts: [
                  { id: 'bot_purple', url: `${ASSET_URL}/bot_icon_purple.png`, label: 'Playful Bot' },
                  { id: 'bot_dark', url: `${ASSET_URL}/bot_icon_dark.png`, label: 'Dark HUD' },
                  { id: 'bot_round', url: `${ASSET_URL}/bot_icon_round.png`, label: 'Robot Friend' },
                  { id: 'bot_gradient', url: `${ASSET_URL}/bot_icon_gradient.png`, label: 'Neon Line' }
                ], icon: Shield, current: settings.bot_avatar }
              ].map(section => (
                <div key={section.title} className="glass-card-premium rounded-[60px] p-12 border border-white/5">
                  <div className="flex items-center gap-6 mb-12">
                    <div className="w-16 h-16 bg-primary/10 rounded-3xl flex items-center justify-center text-primary">
                      <section.icon size={32} />
                    </div>
                    <div>
                      <h3 className="text-4xl font-display font-black italic text-white tracking-tight uppercase">{section.title}</h3>
                      <p className="text-white/20 text-xs font-mono uppercase tracking-[0.4em]">Global Sync Node</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    {section.opts.map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => handleUpdateAvatar(opt.url, section.type)}
                        className={`group relative aspect-[4/3] rounded-[40px] overflow-hidden border-2 transition-all p-1.5 ${section.current === opt.url ? 'border-primary shadow-[0_0_40px_rgba(var(--primary-color-rgb),0.2)]' : 'border-white/5 hover:border-white/10'}`}
                      >
                        <img src={opt.url} alt="" className="w-full h-full object-cover rounded-[34px] grayscale group-hover:grayscale-0 transition-all duration-700" />
                        <div className={`absolute inset-0 bg-primary/20 transition-opacity ${section.current === opt.url ? 'opacity-100' : 'opacity-0'}`} />
                        {section.current === opt.url && (
                          <div className="absolute top-6 right-6 bg-primary text-white rounded-full p-2 shadow-2xl">
                            <CheckCircle2 size={16} strokeWidth={4} />
                          </div>
                        )}
                        <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/90 to-transparent">
                          <span className="text-[10px] font-mono uppercase text-white tracking-widest block text-center opacity-60 group-hover:opacity-100 transition-opacity">{opt.label}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {activeTab === 'users' && (
            <motion.div 
              key="users"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-12">
                <div className="relative w-full md:w-[600px] group">
                  <input 
                    type="text"
                    placeholder="SCANNING USER DATABASE..."
                    className="w-full bg-white/[0.03] border border-white/10 rounded-[32px] py-7 px-16 text-white outline-none focus:border-primary/50 focus:bg-white/[0.07] transition-all font-mono text-sm tracking-widest placeholder:text-white/10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <Users size={22} className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-primary transition-colors" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-8">
                {(Array.isArray(users) ? users : []).filter(u => (u?.username || '').toLowerCase().includes((searchQuery || '').toLowerCase())).map((user, idx) => (
                  <motion.div 
                    key={user?.id || idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="group relative glass-card-premium rounded-[48px] border border-white/5 p-8 transition-all hover:-translate-y-2 hover:border-primary/30"
                  >
                    <div className="absolute top-0 left-1/4 right-1/4 h-px bg-primary/40 scale-x-0 group-hover:scale-x-100 transition-transform duration-700 blur-[2px]" />
                    
                    <div className="flex flex-col items-center text-center">
                      <div className="relative w-32 h-32 mb-8">
                        <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="relative w-full h-full rounded-full overflow-hidden border-2 border-white/10 group-hover:border-primary transition-colors flex items-center justify-center bg-white/5 text-4xl">
                          {user.role === 'admin' ? '🛡️' : '👤'}
                        </div>
                      </div>

                      <h2 className="text-2xl font-display font-black italic text-white mb-2 tracking-tight uppercase">{user?.username || 'Unknown Node'}</h2>
                      <div className="text-[10px] font-mono text-primary uppercase tracking-[0.3em] mb-6">User ID: node-{user?.id || '?' }</div>
                      
                      <div className="w-full flex gap-3 mb-8">
                        <div className="flex-1 p-4 bg-white/5 rounded-2xl border border-white/10">
                          <div className="text-[8px] font-mono text-white/20 uppercase mb-1">Role</div>
                          <div className={`text-[10px] font-bold uppercase ${user?.role === 'admin' ? 'text-primary' : 'text-white'}`}>{user?.role || 'user'}</div>
                        </div>
                        <div className="flex-1 p-4 bg-white/5 rounded-2xl border border-white/10">
                          <div className="text-[8px] font-mono text-white/20 uppercase mb-1">Status</div>
                          <div className={`text-[10px] font-bold uppercase ${user?.is_pro ? 'text-emerald-400' : 'text-white/40'}`}>
                            {user?.is_pro ? 'PRO' : 'FREE'}
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-4 w-full">
                        <button 
                          onClick={async () => {
                            if (window.confirm(`Permanently de-authorize ${user?.username || 'this user'}?`)) {
                              await deleteSystemUser(user?.id);
                              loadData();
                              if (window.showToast) window.showToast('User Node Terminated', 'success');
                            }
                          }}
                          className="w-full py-4 bg-red-500/10 hover:bg-red-500 rounded-2xl flex items-center justify-center gap-3 text-red-500 hover:text-white transition-all border border-red-500/20 text-[10px] font-black uppercase tracking-widest"
                        >
                          <Shield size={16} />
                          Terminate Session
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'knowledge' && (
            <motion.div 
              key="knowledge"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            >
              <div className="lg:col-span-2 space-y-8">
                 <div className="glass-card-premium rounded-[48px] p-2 border border-white/5 overflow-hidden">
                    <div className="bg-white/[0.03] border-b border-white/10 p-8 flex justify-between items-center">
                       <div>
                          <h3 className="text-2xl font-display font-black italic text-white tracking-tight">Core Knowledge Matrix</h3>
                          <p className="text-white/20 text-[10px] font-mono uppercase tracking-widest mt-1">Editing: docs/chatbot_faq.md</p>
                       </div>
                       <div className="flex gap-4">
                          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                             <span className="text-emerald-500 font-mono text-[8px] uppercase">RAG Engine Online</span>
                          </div>
                       </div>
                    </div>
                    <textarea 
                      value={knowledgeContent}
                      onChange={(e) => setKnowledgeContent(e.target.value)}
                      className="w-full h-[600px] bg-transparent p-10 text-white/80 font-mono text-sm leading-relaxed outline-none resize-none selection:bg-primary/30"
                      placeholder="# FAQS AND SYSTEM GUIDES..."
                    />
                 </div>
              </div>

              <div className="space-y-8">
                <div className="glass-card-premium rounded-[40px] p-10 border border-white/5 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl -mr-16 -mt-16" />
                  <h4 className="text-white/30 font-mono text-[10px] uppercase tracking-[0.4em] mb-8">Neural Command</h4>
                  
                  <div className="space-y-6 mb-12">
                    <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
                       <span className="text-white/20 text-[8px] font-mono uppercase block mb-2">Sync Status</span>
                       <span className="text-white text-xs font-bold font-mono uppercase tracking-widest">
                         {isSyncing ? 'Synchronizing weights...' : 'Neural Network Ready'}
                       </span>
                    </div>
                  </div>

                  <button 
                    onClick={handleUpdateKnowledge}
                    disabled={isSyncing}
                    className={`w-full group relative h-24 rounded-3xl overflow-hidden transition-all active:scale-95 ${isSyncing ? 'opacity-50 grayscale' : 'hover:scale-105'}`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-secondary" />
                    <span className="relative z-10 flex items-center justify-center gap-4 text-white font-black text-sm uppercase tracking-[0.2em]">
                      {isSyncing ? (
                        <RefreshCw size={24} className="animate-spin" />
                      ) : (
                        <Save size={24} />
                      )}
                      Sync Neural Network
                    </span>
                  </button>
                  
                  <p className="mt-6 text-[9px] font-mono text-white/20 leading-loose uppercase text-center">
                    Executing this command will rewrite the primary knowledge document and rebuild the vector search index in real-time.
                  </p>
                </div>

                <div className="glass-card-premium rounded-[40px] p-10 border border-white/5">
                   <h4 className="text-white/30 font-mono text-[10px] uppercase tracking-[0.4em] mb-6">Knowledge Flux</h4>
                   <div className="space-y-4">
                      <div className="flex justify-between items-center py-3 border-b border-white/5">
                         <span className="text-white/40 text-[10px] font-mono uppercase">Node ID</span>
                         <span className="text-white text-[10px] font-mono">BC-KNOWLEDGE-01</span>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b border-white/5">
                         <span className="text-white/40 text-[10px] font-mono uppercase">Encryption</span>
                         <span className="text-emerald-400 text-[10px] font-mono uppercase">Active</span>
                      </div>
                      <div className="flex justify-between items-center py-3">
                         <span className="text-white/40 text-[10px] font-mono uppercase">Sync Protocol</span>
                         <span className="text-white text-[10px] font-mono uppercase font-bold">SHA-512</span>
                      </div>
                   </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>

      <ArtistFormModal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); setEditingArtist(null); }}
        artist={editingArtist}
        onSave={handleSave}
      />
    </div>
  );
};

export default SystemAdmin;


