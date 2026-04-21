import React, { useState, useEffect } from 'react';
import { X, Sparkles, CheckCircle2 } from 'lucide-react';
import { getSystemSettings, updateSystemSetting, ASSET_URL } from '@shared/services/api';

const CustomizationModal = ({ isOpen, onClose }) => {
  const [settings, setSettings] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  const avatarOptions = [
    { id: 'user_note', url: 'https://i.ibb.co/LnhFqVr/user-note.png', label: 'Cyan Pulse' },
    { id: 'user_alien', url: 'https://i.ibb.co/m0f6vXz/user-alien.png', label: 'Pink Neon' },
    { id: 'user_knob', url: 'https://i.ibb.co/LnhFqVr/user-knob.png', label: 'Violet Dial' },
    { id: 'user_bolt', url: 'https://i.ibb.co/m0f6vXz/user-bolt.png', label: 'Gold Strike' }
  ];

  const botOptions = [
    { id: 'bot_purple', url: `${ASSET_URL}/bot_icon_purple.png`, label: 'Playful Bot' },
    { id: 'bot_dark', url: `${ASSET_URL}/bot_icon_dark.png`, label: 'Dark HUD' },
    { id: 'bot_round', url: `${ASSET_URL}/bot_icon_round.png`, label: 'Robot Friend' },
    { id: 'bot_gradient', url: `${ASSET_URL}/bot_icon_gradient.png`, label: 'Neon Line' }
  ];

  useEffect(() => {
    if (isOpen) {
      const loadSettings = async () => {
        try {
          const data = await getSystemSettings();
          setSettings(data);
        } catch (err) {
          console.error('Failed to load settings:', err);
        }
      };
      loadSettings();
    }
  }, [isOpen]);

  const handleUpdateAvatar = async (url, type = 'user') => {
    setIsSaving(true);
    const key = type === 'bot' ? 'bot_avatar' : 'user_avatar';
    try {
      await updateSystemSetting(key, url);
      setSettings(prev => ({ ...prev, [key]: url }));
      if (window.showToast) window.showToast(`${type === 'bot' ? 'Bot' : 'HUD'} Identity Updated`, 'success');
    } catch (err) {
      if (window.showToast) window.showToast('Failed to update identity', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 animate-fadeIn">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-4xl bg-[#0a0a10]/95 border border-white/10 rounded-[40px] shadow-[0_30px_100px_rgba(0,0,0,0.8)] overflow-hidden animate-scaleIn">
        {/* Header */}
        <div className="p-8 border-b border-white/5 flex justify-between items-center">
          <div>
            <h2 className="text-white text-4xl font-display font-black italic tracking-tighter m-0">Experience <span className="text-primary">Customization</span></h2>
            <p className="text-white/40 font-mono text-[10px] uppercase tracking-[0.2em] mt-2">Adjust your neural interface parameters</p>
          </div>
          <button 
            onClick={onClose}
            className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:bg-white/10 hover:text-white transition-all"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-8 md:p-12 overflow-y-auto max-h-[70vh] custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            
            {/* User Identity Section */}
            <div className="space-y-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center text-primary border border-primary/20">
                  <Sparkles size={24} />
                </div>
                <div>
                  <h3 className="text-white font-bold text-xl tracking-tight">Identity HUD</h3>
                  <p className="text-white/30 text-xs font-mono uppercase tracking-widest">Global User Avatar</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {avatarOptions.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => handleUpdateAvatar(opt.url, 'user')}
                    className={`group relative aspect-square rounded-[24px] overflow-hidden border-2 transition-all p-1 ${settings.user_avatar === opt.url ? 'border-primary shadow-[0_0_20px_rgba(var(--primary-color-rgb),0.3)]' : 'border-white/5 hover:border-white/20'}`}
                  >
                    <div className={`absolute inset-0 bg-primary/10 transition-opacity ${settings.user_avatar === opt.url ? 'opacity-100' : 'opacity-0'}`} />
                    <img src={opt.url} alt={opt.label} className="w-full h-full object-cover rounded-[20px] transition-transform group-hover:scale-110" />
                    {settings.user_avatar === opt.url && (
                      <div className="absolute top-3 right-3 bg-primary text-white rounded-full p-1 shadow-lg z-10">
                        <CheckCircle2 size={12} strokeWidth={4} />
                      </div>
                    )}
                    <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                      <span className="text-[9px] font-mono uppercase text-white tracking-widest block text-center opacity-60">{opt.label}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Bot Identity Section */}
            <div className="space-y-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-secondary/20 rounded-2xl flex items-center justify-center text-secondary border border-secondary/20">
                  <Sparkles size={24} />
                </div>
                <div>
                  <h3 className="text-white font-bold text-xl tracking-tight">Bot Persona</h3>
                  <p className="text-white/30 text-xs font-mono uppercase tracking-widest">Global Beatbot Avatar</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {botOptions.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => handleUpdateAvatar(opt.url, 'bot')}
                    className={`group relative aspect-square rounded-[24px] overflow-hidden border-2 transition-all p-1 ${settings.bot_avatar === opt.url ? 'border-secondary shadow-[0_0_20px_rgba(var(--secondary-color-rgb),0.3)]' : 'border-white/5 hover:border-white/20'}`}
                  >
                    <div className={`absolute inset-0 bg-secondary/10 transition-opacity ${settings.bot_avatar === opt.url ? 'opacity-100' : 'opacity-0'}`} />
                    <img src={opt.url} alt={opt.label} className="w-full h-full object-cover rounded-[20px] transition-transform group-hover:scale-110" />
                    {settings.bot_avatar === opt.url && (
                      <div className="absolute top-3 right-3 bg-secondary text-white rounded-full p-1 shadow-lg z-10">
                        <CheckCircle2 size={12} strokeWidth={4} />
                      </div>
                    )}
                    <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                      <span className="text-[9px] font-mono uppercase text-white tracking-widest block text-center opacity-60">{opt.label}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Footer message */}
          <div className="mt-12 p-6 bg-white/[0.03] rounded-3xl border border-white/5 flex items-center gap-4">
            <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center text-xl shrink-0">ℹ️</div>
            <p className="text-white/40 text-sm leading-relaxed m-0">Changes to identities are synchronized globally in real-time across the entire architecture. Your chosen persona will be visible to you and other users where applicable.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomizationModal;
