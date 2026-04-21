import React, { useState, useEffect, useRef } from 'react';

const ArtistFormModal = ({ isOpen, onClose, artist, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    profile_image: '',
    bio: '',
    members: '',
    featured_album: '',
    achievements: '',
    tours: '',
    songs: '',
    genres: []
  });
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (artist) {
      setFormData({
        ...artist,
        genres: Array.isArray(artist.specialized_genres) 
          ? artist.specialized_genres 
          : (typeof artist.specialized_genres === 'string' ? JSON.parse(artist.specialized_genres) : [])
      });
    } else {
      setFormData({ 
        name: '', 
        profile_image: '', 
        bio: '', 
        members: '', 
        featured_album: '', 
        achievements: '', 
        tours: '', 
        songs: '', 
        genres: [] 
      });
    }
  }, [artist, isOpen]);

  if (!isOpen) return null;

  const handleImageUpload = async (file) => {
    if (!file) return;
    
    // Check file size (100MB limit as requested)
    if (file.size > 100 * 1024 * 1024) {
      alert('File is too large. Max size is 100MB.');
      return;
    }

    setIsUploading(true);
    const data = new FormData();
    data.append('image', file);

    try {
      // Use local backend URL
      const response = await fetch('http://localhost:3000/api/admin/upload-image', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: data
      });

      if (response.ok) {
        const result = await response.json();
        setFormData(prev => ({ ...prev, profile_image: `http://localhost:3000${result.url}` }));
      } else {
        const error = await response.json();
        alert(error.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Error uploading image');
    } finally {
      setIsUploading(false);
    }
  };

  const onDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      handleImageUpload(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/95 backdrop-blur-3xl animate-fadeIn" onClick={onClose} />
      
      <div className="relative w-full max-w-5xl premium-modal rounded-[40px] overflow-hidden shadow-2xl max-h-[95vh] flex flex-col bg-[#05050a] border border-white/10 animate-modalSlideIn">
        {/* Animated Background decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20 z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-secondary/20 rounded-full blur-[120px]" />
        </div>

        <form onSubmit={handleSubmit} className="relative z-10 flex flex-col h-full overflow-hidden">
          {/* Sticky Header */}
          <div className="p-8 md:px-14 md:py-10 flex justify-between items-center bg-white/[0.02] backdrop-blur-xl border-b border-white/5 animate-stagger-1 shrink-0">
            <div>
              <h2 className="text-4xl md:text-5xl font-heading text-white italic tracking-tighter uppercase leading-none">
                {artist ? 'Sync Artist Entity' : 'New Artist Nucleus'}
              </h2>
              <p className="text-primary text-[10px] uppercase tracking-[0.4em] font-mono mt-3 opacity-70">
                Administrative System Interface // Ver. 2.4.0
              </p>
            </div>
            <button 
              type="button" 
              onClick={onClose} 
              className="w-12 h-12 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/20 border border-white/10 text-white/40 hover:text-white transition-all hover:rotate-90 group/close"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          </div>
          
          {/* Scrollable Content Container */}
          <div className="flex-1 overflow-y-auto premium-modal-scroll p-10 md:p-14 space-y-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Left Column: Core Data */}
            <div className="lg:col-span-7 space-y-10">
              
              {/* Name Input */}
              <div className="group animate-stagger-2">
                <label className="text-[11px] font-mono uppercase tracking-[0.3em] text-primary/80 font-bold mb-3 block group-focus-within:text-primary transition-colors">
                  Entity Name
                </label>
                <div className="relative">
                  <input 
                    className="w-full bg-white/[0.06] border border-white/15 rounded-2xl p-5 text-white text-lg outline-none focus:border-primary/50 focus:bg-white/[0.1] transition-all placeholder:text-white/20"
                    placeholder="e.g. David Bowie"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    required
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-primary/30 animate-pulse" />
                </div>
              </div>

              {/* Image Upload Area */}
              <div className="group animate-stagger-3">
                <label className="text-[11px] font-mono uppercase tracking-[0.3em] text-primary/80 font-bold mb-3 block group-focus-within:text-primary transition-colors">
                  Visual Identity (Image)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div 
                    onClick={() => fileInputRef.current.click()}
                    onDragOver={onDragOver}
                    onDragLeave={onDragLeave}
                    onDrop={onDrop}
                    className={`sm:col-span-3 relative h-52 rounded-[32px] border-2 border-dashed transition-all flex flex-col items-center justify-center cursor-pointer overflow-hidden ${
                      isDragging ? 'border-primary bg-primary/10' : 'border-white/10 bg-white/[0.03] hover:border-primary/40 hover:bg-white/[0.06]'
                    }`}
                  >
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={(e) => handleImageUpload(e.target.files[0])} 
                      className="hidden" 
                      accept="image/*"
                    />
                    
                    {isUploading ? (
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                        <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-primary">Uploading Stream...</span>
                      </div>
                    ) : formData.profile_image ? (
                      <>
                        <img src={formData.profile_image} alt="Preview" className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity" />
                        <div className="relative z-10 flex flex-col items-center gap-3">
                          <div className="p-4 rounded-full bg-black/60 backdrop-blur-xl border border-white/20 group-hover:scale-110 transition-transform">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>
                          </div>
                          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white">Replace Archive</span>
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center gap-4 text-white/30 group-hover:text-primary/60 transition-colors">
                        <div className="p-5 rounded-3xl bg-white/5 border border-white/10 group-hover:border-primary/20 transition-all">
                          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7m4 0h6m-3-3v6M9 11l3 3L22 4"/></svg>
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-bold uppercase tracking-widest text-white/50">Drag & Drop Intel</p>
                          <p className="text-[10px] mt-1 font-mono">100MB MAX DATA LIMIT</p>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Thumbnail Preview */}
                  <div className="sm:col-span-1 h-52 rounded-[32px] bg-white/[0.03] border border-white/10 overflow-hidden relative group/thumb">
                    {formData.profile_image ? (
                      <>
                        <img src={formData.profile_image} alt="Preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-end justify-center pb-4">
                           <button 
                             type="button"
                             onClick={(e) => { e.stopPropagation(); setFormData({...formData, profile_image: ''}); }}
                             className="text-xs font-mono text-red-500 hover:text-red-400 font-bold"
                           >
                             DELETE
                           </button>
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center gap-3 opacity-10">
                        <div className="w-12 h-12 flex items-center justify-center rounded-2xl border border-dashed border-white">
                           <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                        </div>
                        <span className="text-[8px] uppercase font-mono tracking-widest text-center px-4">Waiting for visual input</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Fallback URL input */}
                <div className="mt-6 flex items-center gap-4">
                  <div className="h-[1px] flex-1 bg-white/5" />
                  <span className="text-[9px] font-mono text-white/20 uppercase tracking-[0.5em]">Manual URL Link</span>
                  <div className="h-[1px] flex-1 bg-white/5" />
                </div>
                
                <input 
                  className="w-full mt-4 bg-white/[0.03] border border-white/10 rounded-xl p-4 text-white text-xs font-mono outline-none focus:border-primary/50 transition-all placeholder:text-white/5"
                  placeholder="https://cloud.matrix.storage/image_asset_0x.jpg"
                  value={formData.profile_image}
                  onChange={e => setFormData({...formData, profile_image: e.target.value})}
                />
              </div>

              {/* Members & Album */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 animate-stagger-2">
                <div className="group">
                  <label className="text-[11px] font-mono uppercase tracking-[0.3em] text-primary/80 font-bold mb-3 block group-focus-within:text-primary transition-colors">
                    Core Lineup
                  </label>
                  <input 
                    className="w-full bg-white/[0.06] border border-white/15 rounded-2xl p-5 text-white outline-none focus:border-primary/50 focus:bg-white/[0.1] transition-all placeholder:text-white/20"
                    placeholder="Names (comma separated)"
                    value={formData.members || ''}
                    onChange={e => setFormData({...formData, members: e.target.value})}
                  />
                </div>
                <div className="group">
                  <label className="text-[11px] font-mono uppercase tracking-[0.3em] text-primary/80 font-bold mb-3 block group-focus-within:text-primary transition-colors">
                    Legendary Release
                  </label>
                  <input 
                    className="w-full bg-white/[0.06] border border-white/15 rounded-2xl p-5 text-white outline-none focus:border-primary/50 focus:bg-white/[0.1] transition-all placeholder:text-white/20"
                    placeholder="Featured Album Title"
                    value={formData.featured_album || ''}
                    onChange={e => setFormData({...formData, featured_album: e.target.value})}
                  />
                </div>
              </div>

              {/* Bio */}
              <div className="group animate-stagger-3">
                <label className="text-[11px] font-mono uppercase tracking-[0.3em] text-primary/80 font-bold mb-3 block group-focus-within:text-primary transition-colors">
                  Historical Chronicle
                </label>
                <textarea 
                  className="w-full bg-white/[0.06] border border-white/15 rounded-3xl p-6 text-white outline-none focus:border-primary/50 focus:bg-white/[0.1] transition-all min-h-[160px] placeholder:text-white/20 resize-none leading-relaxed"
                  placeholder="Enter the biography of the entity..."
                  value={formData.bio || ''}
                  onChange={e => setFormData({...formData, bio: e.target.value})}
                />
              </div>
            </div>

            {/* Right Column: AI Augmented Data */}
            <div className="lg:col-span-5 space-y-10">
              <div className="p-10 rounded-[40px] bg-secondary/[0.04] border border-secondary/20 relative overflow-hidden group animate-stagger-4 h-full border-dashed">
                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-15 transition-opacity">
                  <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>
                </div>

                <div className="flex items-center gap-4 mb-10">
                  <div className="w-3 h-3 bg-secondary rounded-full animate-ping" />
                  <h3 className="text-secondary font-mono text-[11px] uppercase tracking-[0.5em] font-black">
                    Neural Intelligence Sync
                  </h3>
                </div>

                <div className="space-y-12">
                  <div className="space-y-4 group/ai">
                    <div className="flex justify-between items-center pr-2">
                       <label className="text-[11px] font-bold text-white/40 uppercase tracking-[0.2em] group-focus-within/ai:text-secondary transition-colors">Carrier Milestones</label>
                       <div className="w-1.5 h-1.5 rounded-full bg-secondary/30" />
                    </div>
                    <textarea 
                      className="w-full bg-black/60 border border-white/10 rounded-2xl p-5 text-white text-sm outline-none focus:border-secondary/50 focus:bg-black/80 transition-all min-h-[110px] placeholder:text-white/10 resize-none font-mono"
                      placeholder="Awards, certifications, hall of fame records..."
                      value={formData.achievements || ''}
                      onChange={e => setFormData({...formData, achievements: e.target.value})}
                    />
                  </div>

                  <div className="space-y-4 group/ai">
                    <div className="flex justify-between items-center pr-2">
                       <label className="text-[11px] font-bold text-white/40 uppercase tracking-[0.2em] group-focus-within/ai:text-secondary transition-colors">Manifested Tours</label>
                       <div className="w-1.5 h-1.5 rounded-full bg-secondary/30" />
                    </div>
                    <textarea 
                      className="w-full bg-black/60 border border-white/10 rounded-2xl p-5 text-white text-sm outline-none focus:border-secondary/50 focus:bg-black/80 transition-all min-h-[110px] placeholder:text-white/10 resize-none font-mono"
                      placeholder="Global tours and pivotal live events..."
                      value={formData.tours || ''}
                      onChange={e => setFormData({...formData, tours: e.target.value})}
                    />
                  </div>

                  <div className="space-y-4 group/ai">
                    <div className="flex justify-between items-center pr-2">
                       <label className="text-[11px] font-bold text-white/40 uppercase tracking-[0.2em] group-focus-within/ai:text-secondary transition-colors">Frequency Catalog</label>
                       <div className="w-1.5 h-1.5 rounded-full bg-secondary/30" />
                    </div>
                    <textarea 
                      className="w-full bg-black/60 border border-white/10 rounded-2xl p-5 text-white text-sm outline-none focus:border-secondary/50 focus:bg-black/80 transition-all min-h-[110px] placeholder:text-white/10 resize-none font-mono"
                      placeholder="Top performing tracks and anthems..."
                      value={formData.songs || ''}
                      onChange={e => setFormData({...formData, songs: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="mt-12 p-4 rounded-2xl bg-secondary/10 border border-secondary/20 border-dashed">
                    <p className="text-[10px] text-secondary/70 font-mono leading-relaxed">
                      AI WILL AUTOMATICALLY INDEX THESE FIELDS FOR CONTEXTUAL QUERYING. ENSURE ACCURACY FOR OPTIMAL NEURAL RESPONSE.
                    </p>
                </div>
              </div>
            </div>
          </div>
        </div>

          {/* Sticky Footer */}
          <div className="p-8 md:px-14 md:py-10 bg-white/[0.02] backdrop-blur-2xl border-t border-white/10 flex flex-col sm:flex-row justify-end items-center gap-8 animate-stagger-4 shrink-0">
            <button 
              type="button"
              onClick={onClose}
              className="text-white/40 hover:text-white transition-all text-xs uppercase tracking-[0.4em] font-bold py-2 border-b-2 border-transparent hover:border-white/20"
            >
              Protocol: Abort
            </button>
            <button 
              type="submit"
              className="relative px-20 py-6 rounded-[24px] bg-gradient-to-br from-[#ec4899] via-[#fb7185] to-[#f43f5e] text-white font-black text-xs uppercase tracking-[0.3em] overflow-hidden group shadow-[0_20px_40px_rgba(236,72,153,0.3)] hover:shadow-[0_25px_60px_rgba(236,72,153,0.5)] transition-all hover:-translate-y-1 active:scale-[0.98] active:translate-y-0"
            >
              <span className="relative z-10 flex items-center gap-3">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="group-hover:rotate-12 transition-transform"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                Finalize Roster Sync
              </span>
              <div className="animate-shine-effect" />
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity blur-xl bg-white/20" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ArtistFormModal;
