import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { fetchArtistDetails, fetchArtists, ASSET_URL } from '@shared/services/api';
import useScrollReveal from '@shared/hooks/useScrollReveal';

const ArtistJukebox = ({ artistName }) => {
  const [tracks, setTracks] = useState([]);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [favoriteSongs, setFavoriteSongs] = useState({});
  const audioRef = useRef(null);

  useEffect(() => {
    const favs = JSON.parse(localStorage.getItem('bt_fav_songs') || '[]');
    const favMap = {};
    favs.forEach(s => favMap[s.id] = true);
    setFavoriteSongs(favMap);
  }, []);

  useEffect(() => {
    const loadTracks = async () => {
      try {
        let apiUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(artistName)}&entity=song&limit=10`;

        // Custom override for ambiguous bands like Oasis
        if (artistName.toLowerCase() === 'oasis') {
          apiUrl = `https://itunes.apple.com/lookup?id=512633&entity=song&limit=10`;
        }

        const res = await fetch(apiUrl);
        const data = await res.json();

        // Filter out the artist object returned by loopkup endpoint
        const songs = data.results.filter(r => r.wrapperType === 'track');

        if (songs && songs.length > 0) {
          setTracks(songs);
          setCurrentTrack(songs[0]);
        }
      } catch (err) {
        console.error('Failed fetching iTunes tracks for', artistName, err);
      }
    };
    loadTracks();
  }, [artistName]);

  const togglePlay = (track) => {
    if (currentTrack && currentTrack.trackId === track.trackId) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    } else {
      setCurrentTrack(track);
      setIsPlaying(true);
      setTimeout(() => {
        if (audioRef.current) audioRef.current.play();
      }, 50);
    }
  };

  const toggleFavoriteSong = (e, track) => {
    e.stopPropagation(); // prevent Play toggle
    let favs = JSON.parse(localStorage.getItem('bt_fav_songs') || '[]');
    const isFav = favoriteSongs[track.trackId];
    
    if (isFav) {
      favs = favs.filter(s => s.id !== track.trackId);
    } else {
      const minutes = Math.floor(track.trackTimeMillis / 60000);
      const seconds = ((track.trackTimeMillis % 60000) / 1000).toFixed(0);
      const duration = minutes + ":" + (seconds < 10 ? '0' : '') + seconds;

      favs.unshift({
        id: track.trackId,
        title: track.trackName,
        artist: track.artistName,
        duration: duration
      });
    }
    localStorage.setItem('bt_fav_songs', JSON.stringify(favs));
    setFavoriteSongs(prev => ({ ...prev, [track.trackId]: !isFav }));
  };

  if (tracks.length === 0) return null;

  return (
    <div className="w-full">
      <style>{`
        @keyframes custom-marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        @keyframes bar1 { 0%,100%{height:3px} 50%{height:13px} }
        @keyframes bar2 { 0%,100%{height:9px} 50%{height:3px} }
        @keyframes bar3 { 0%,100%{height:5px} 50%{height:15px} }
        .track-row:hover .marquee-text,
        .track-row.is-active .marquee-text {
          animation: custom-marquee 12s linear infinite;
          opacity: 1 !important;
        }
        .track-row:hover .static-text,
        .track-row.is-active .static-text {
          opacity: 0 !important;
        }
      `}</style>

      <div className="relative rounded-[28px] border border-white/10 overflow-hidden backdrop-blur-2xl shadow-[0_30px_80px_rgba(0,0,0,0.6)]">
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] via-transparent to-black/40 pointer-events-none" />

        <audio ref={audioRef} src={currentTrack ? currentTrack.previewUrl : ''} onEnded={() => setIsPlaying(false)} />

        {/* NOW PLAYING BANNER */}
        {currentTrack && (
          <div className="relative overflow-hidden">
            <div className="absolute inset-0 bg-cover bg-center scale-110"
              style={{ backgroundImage: `url(${currentTrack.artworkUrl100.replace('100x100bb', '600x600bb')})`, filter: 'blur(24px) brightness(0.25) saturate(1.8)' }} />
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-[#080810]" />
            <div className="relative px-5 pt-5 pb-7 flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl overflow-hidden border border-white/20 shadow-2xl shrink-0">
                <img src={currentTrack.artworkUrl100.replace('100x100bb', '300x300bb')} className="w-full h-full object-cover" alt="" />
              </div>
              <div className="flex-1 overflow-hidden min-w-0">
                <p className="text-white/40 text-[11px] font-mono uppercase tracking-[0.2em] mb-0.5">{isPlaying ? '▶ Now Playing' : '⏸ Paused'}</p>
                <div className="font-bold text-white text-lg leading-tight truncate">{currentTrack.trackName}</div>
                <div className="text-white/40 text-sm font-mono truncate mt-0.5">{currentTrack.collectionName}</div>
              </div>
              {isPlaying && (
                <div className="flex gap-[3px] items-end h-4 shrink-0">
                  <div className="w-[3px] bg-primary rounded-full" style={{ animation: 'bar1 0.9s ease-in-out infinite' }} />
                  <div className="w-[3px] bg-primary rounded-full" style={{ animation: 'bar2 0.7s ease-in-out infinite' }} />
                  <div className="w-[3px] bg-primary rounded-full" style={{ animation: 'bar3 1.1s ease-in-out infinite' }} />
                  <div className="w-[3px] bg-primary/50 rounded-full" style={{ animation: 'bar1 0.8s ease-in-out infinite 0.15s' }} />
                </div>
              )}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-[3fr_2fr]">

          {/* TRACKLIST */}
          <div className="p-4 border-r border-white/[0.06]">
            <div className="flex items-center gap-2 mb-3 px-2">
              <div className="w-1 h-5 rounded-full bg-primary/60" />
              <span className="text-white/60 font-bold text-sm uppercase tracking-[0.18em]">Tracklist</span>
              <span className="ml-auto text-white/25 text-[11px] font-mono">{tracks.length} songs</span>
            </div>
            <div className="space-y-px max-h-[340px] overflow-y-auto pr-1"
              style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(236,72,153,0.25) transparent' }}>
              {tracks.map((track, i) => {
                const isActive = currentTrack && currentTrack.trackId === track.trackId;
                return (
                  <div
                    key={track.trackId}
                    onClick={() => togglePlay(track)}
                    className={`track-row group/item flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-200 ${isActive ? 'is-active bg-primary/[0.12] border border-primary/20' : 'border border-transparent hover:bg-white/[0.04] hover:border-white/[0.07]'
                      }`}
                  >
                    {/* Index / waveform */}
                    <div className="w-5 shrink-0 flex justify-center">
                      {isActive && isPlaying ? (
                        <div className="flex gap-[2px] items-end h-3">
                          <div className="w-[2px] bg-primary rounded-full" style={{ animation: 'bar1 0.9s ease-in-out infinite' }} />
                          <div className="w-[2px] bg-primary rounded-full" style={{ animation: 'bar2 0.7s ease-in-out infinite' }} />
                          <div className="w-[2px] bg-primary rounded-full" style={{ animation: 'bar3 1.1s ease-in-out infinite' }} />
                        </div>
                      ) : (
                        <span className={`text-[11px] font-mono ${isActive ? 'text-primary' : 'text-white/30 group-hover/item:text-white/60'} transition-colors`}>
                          {String(i + 1).padStart(2, '0')}
                        </span>
                      )}
                    </div>
                    {/* Art */}
                    <div className={`w-8 h-8 rounded-lg overflow-hidden shrink-0 border transition-all ${isActive ? 'border-primary/40 shadow-[0_0_8px_rgba(236,72,153,0.25)]' : 'border-white/10'}`}>
                      <img src={track.artworkUrl100} alt="" className="w-full h-full object-cover" />
                    </div>
                    {/* Text */}
                    <div className="flex-1 overflow-hidden min-w-0">
                      <div className={`text-base font-semibold truncate ${isActive ? 'text-white' : 'text-white/65 group-hover/item:text-white/90'} transition-colors`}>{track.trackName}</div>
                      <div className="relative overflow-hidden w-full h-[14px]"
                        style={track.collectionName.length > 28 ? { WebkitMaskImage: 'linear-gradient(to right, black 70%, transparent 100%)' } : {}}>
                        <div className={`${track.collectionName.length > 28 ? 'static-text' : ''} absolute left-0 top-0 w-full text-[11px] truncate font-mono ${isActive ? 'text-primary/50' : 'text-white/30'}`}>
                          {track.collectionName}
                        </div>
                        {track.collectionName.length > 28 && (
                          <div className={`marquee-text absolute left-0 top-0 w-max whitespace-nowrap text-[11px] font-mono opacity-0 ${isActive ? 'text-primary/70' : 'text-white/50'}`}>
                            <span className="mr-12">{track.collectionName}</span>
                            <span className="mr-12">{track.collectionName}</span>
                            <span>{track.collectionName}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    {/* Play hint */}
                    <div className={`shrink-0 transition-opacity ${isActive && isPlaying ? 'opacity-0' : 'opacity-0 group-hover/item:opacity-100'} mr-1`}>
                      <svg className="w-3.5 h-3.5 text-white/40" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                    </div>
                    {/* Add Heart button */}
                    <button 
                      onClick={(e) => toggleFavoriteSong(e, track)}
                      className={`shrink-0 p-1 transition-all hover:scale-110 ${favoriteSongs[track.trackId] ? 'opacity-100' : 'opacity-0 group-hover/item:opacity-100'}`}
                    >
                      <svg className={`w-4 h-4 ${favoriteSongs[track.trackId] ? 'text-primary drop-shadow-[0_0_5px_rgba(236,72,153,0.8)]' : 'text-white/40 hover:text-white'}`} fill={favoriteSongs[track.trackId] ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* VINYL */}
          <div className="flex items-center justify-center relative bg-gradient-to-br from-[#05050d] to-[#0e0e1a] p-5 min-h-[280px]">
            {isPlaying && <div className="absolute inset-0 pointer-events-none opacity-25"
              style={{ background: 'radial-gradient(circle at center, rgba(236,72,153,0.5) 0%, transparent 70%)' }} />}
            <div className="absolute inset-2 rounded-xl border border-white/[0.03] pointer-events-none" />

            {/* Disc */}
            <div
              key={currentTrack ? currentTrack.trackId : 'no-track'}
              className={`w-[360px] h-[360px] rounded-full bg-[#080808] relative flex justify-center items-center overflow-hidden z-10 animate-[spin_4s_linear_infinite]`}
              style={{
                animationPlayState: isPlaying ? 'running' : 'paused',
                boxShadow: isPlaying ? '0 0 50px rgba(0,0,0,0.9), 0 0 25px rgba(236,72,153,0.12)' : '0 0 35px rgba(0,0,0,0.9)'
              }}
            >
              {[12, 22, 32, 42, 52].map(n => (
                <div key={n} className="absolute rounded-full border border-white/[0.035] pointer-events-none" style={{ inset: `${n}px` }} />
              ))}
              <div className="absolute inset-0 rounded-full pointer-events-none"
                style={{ background: 'conic-gradient(from 20deg, transparent 0%, rgba(255,255,255,0.035) 8%, transparent 16%)' }} />
              <div className="w-[130px] h-[130px] rounded-full border-[6px] border-[#0f0f0f] overflow-hidden relative z-20 shadow-xl">
                {currentTrack && <img src={currentTrack.artworkUrl100.replace('100x100bb', '400x400bb')} className="w-full h-full object-cover" alt="label" />}
              </div>
              <div className="absolute w-2 h-2 bg-[#030303] rounded-full z-30 border border-white/10" />
            </div>

            {/* Tonearm */}
            <div className={`absolute top-4 right-4 w-7 h-32 origin-[14px_14px] transition-transform duration-[1.5s] ease-in-out z-20 ${isPlaying ? 'rotate-[40deg]' : 'rotate-[-12deg]'}`}>
              <div className="w-7 h-7 bg-gradient-to-b from-[#bbb] to-[#666] rounded-full border border-white/20 shadow-[0_3px_10px_rgba(0,0,0,0.8)] flex items-center justify-center">
                <div className="w-2 h-2 bg-[#0a0a0a] rounded-full" />
              </div>
              <div className="w-[2px] h-[78px] bg-gradient-to-b from-[#ccc] to-[#888] mx-auto rounded-full shadow-lg -mt-0.5" />
              <div className="w-4 h-7 bg-gradient-to-b from-[#111] to-[#0a0a0a] border border-white/10 mx-auto rounded-sm -mt-1 shadow-xl flex items-end justify-center pb-1">
                <div className="w-1 h-[2px] bg-red-500/90 rounded-full shadow-[0_0_5px_rgba(239,68,68,1)]" />
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

const CommunityOpinions = ({ artistName, gradient }) => {
  const [opinions, setOpinions] = useState([
    { id: 1, user: "Alex Volkov", text: `Absolutely legendary performance. ${artistName} changed the way I listen to music forever.`, avatar: "👨‍🎤" },
    { id: 2, user: "Sarah J.", text: `The depth in the lyrics is just unmatched. A true masterpiece.`, avatar: "👩‍🎤" },
    { id: 3, user: "MusicGeek99", text: `I've seen many artists, but none capture the raw energy like this.`, avatar: "🔥" },
    { id: 4, user: "Elena Thorne", text: `Timeless. Every time I listen, I find something new to love.`, avatar: "✨" },
    { id: 5, user: "Marcus K.", text: `That one guitar solo in the second track... absolute chills every time.`, avatar: "🎸" },
    { id: 6, user: "Luna Soul", text: `This artist is the reason I started playing instruments. Pure inspiration.`, avatar: "🌟" }
  ]);
  const [newOpinion, setNewOpinion] = useState('');

  const handlePost = (e) => {
    e.preventDefault();
    if (!newOpinion.trim()) return;
    const post = {
      id: Date.now(),
      user: "You",
      text: newOpinion,
      avatar: "👤"
    };
    setOpinions([post, ...opinions]);
    setNewOpinion('');
  };

  return (
    <div className="mt-20 pt-20 border-t border-white/10 overflow-hidden">
      <div className="flex items-center justify-between mb-10">
        <div className="flex flex-col">
          <div className="h-1 w-20 mb-4 rounded-full" style={{ background: gradient }} />
          <h2 className="text-4xl md:text-5xl font-display font-bold italic text-white m-0 tracking-tight leading-none uppercase">Community <span className="text-primary italic">Opinions</span></h2>
        </div>
      </div>

      {/* POST INPUT */}
      <div className="mb-14 max-w-2xl">
        <form onSubmit={handlePost} className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-[28px] blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
          <div className="relative bg-white/5 border border-white/10 rounded-[24px] p-2 flex flex-col backdrop-blur-xl shadow-2xl focus-within:border-primary/40 focus-within:bg-white/10 transition-all">
            <textarea 
              value={newOpinion}
              onChange={(e) => setNewOpinion(e.target.value)}
              placeholder={`What do you think of ${artistName}?`}
              className="bg-transparent border-none text-white text-lg p-5 outline-none resize-none h-28 placeholder:text-white/20 custom-scrollbar"
            />
            <div className="flex items-center justify-between px-4 pb-3">
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/20">Sharing with the BeatConnect community</span>
              <button 
                type="submit"
                className="bg-primary hover:bg-primary/90 text-white font-bold py-2.5 px-8 rounded-full shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95 text-xs uppercase tracking-widest border border-white/10"
              >
                Post Opinion
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* CAROUSEL */}
      <div className="relative -mx-10 md:-mx-20 py-10 overflow-hidden">
        {/* Gradients to fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-40 bg-gradient-to-r from-[#080810] to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-40 bg-gradient-to-l from-[#080810] to-transparent z-10 pointer-events-none" />

        <div className="animate-marquee-reverse flex gap-8">
          {[...opinions, ...opinions].map((op, i) => (
            <div 
              key={`${op.id}-${i}`}
              className="w-[380px] shrink-0 bg-white/5 border border-white/10 rounded-[32px] p-8 backdrop-blur-md flex flex-col gap-5 hover:bg-white/10 hover:border-primary/30 transition-all duration-300 group/card"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-xl shadow-inner group-hover/card:border-primary/40 transition-colors">
                  {op.avatar}
                </div>
                <div>
                  <h4 className="text-white font-bold text-base m-0">{op.user}</h4>
                  <div className="flex gap-1 mt-1 text-primary">
                    {"★★★★★".split('').map((s, idx) => <span key={idx} className="text-[10px]">★</span>)}
                  </div>
                </div>
              </div>
              <p className="text-white/60 text-base leading-relaxed italic">"{op.text}"</p>
              <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between">
                <span className="text-[9px] font-mono text-white/20 uppercase tracking-widest">Verified Listener</span>
                <span className="text-primary/60 text-xs">♥ 24</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const ArtistProfile = ({ artistName }) => {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [titleGradient, setTitleGradient] = useState('linear-gradient(to bottom right, #06b6d4, #ec4899)');
  const [parallaxY, setParallaxY] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);
  const pageRef = useRef(null);
  useScrollReveal(pageRef, [details]);

  useEffect(() => {
     const favs = JSON.parse(localStorage.getItem('bt_fav_artists') || '[]');
     setIsFavorited(favs.some(a => a.id === artistName));
  }, [artistName]);

  useEffect(() => {
    const handleScroll = () => setParallaxY(window.scrollY * 0.28);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const getArtistLocalImage = (name) => {
    if (!name) return '/rock.jpg';
    const lowered = name.toLowerCase();
    const specialPaths = {
      "the jimi hendrix experience": "hendrix.jpg",
      "guns n' roses": "gunsroses.jpeg",
      "pink floyd": "pinkfloyd.jpeg",
      "the who": "who.jpg",
      "oasis": "oasis.jpg",
      "david bowie": "bowie.jpg"
    };
    if (specialPaths[lowered]) return `/backgrounds/${specialPaths[lowered]}`;
    return `/backgrounds/${lowered.replace(/[^a-z0-9]/g, '')}.jpg`;
  };

  const toggleFavoriteArtist = () => {
    let favs = JSON.parse(localStorage.getItem('bt_fav_artists') || '[]');
    if (isFavorited) {
      favs = favs.filter(a => a.id !== artistName);
    } else {
      favs.unshift({
        id: artistName,
        name: details.name,
        image: getArtistLocalImage(details.name),
        genre: 'Artist'
      });
    }
    localStorage.setItem('bt_fav_artists', JSON.stringify(favs));
    setIsFavorited(!isFavorited);
  };

  const extractColors = (imgSrc) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = 100;
        canvas.height = 100;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, 100, 100);
        const data = ctx.getImageData(0, 0, 100, 100).data;
        // Sample pixels at two different zones for contrast
        const zone1 = { r: 0, g: 0, b: 0, count: 0 }; // top-left
        const zone2 = { r: 0, g: 0, b: 0, count: 0 }; // bottom-right
        for (let i = 0; i < data.length; i += 4) {
          const pixel = Math.floor(i / 4);
          const px = pixel % 100;
          const py = Math.floor(pixel / 100);
          if (px < 50 && py < 50) {
            zone1.r += data[i]; zone1.g += data[i + 1]; zone1.b += data[i + 2]; zone1.count++;
          } else if (px >= 50 && py >= 50) {
            zone2.r += data[i]; zone2.g += data[i + 1]; zone2.b += data[i + 2]; zone2.count++;
          }
        }
        const avg = (z) => ({ r: Math.round(z.r / z.count), g: Math.round(z.g / z.count), b: Math.round(z.b / z.count) });
        // Boost saturation so colors feel vivid on the title
        const boost = ({ r, g, b }) => {
          const max = Math.max(r, g, b);
          const factor = 1.8;
          return `rgb(${Math.min(255, Math.round(r + (r === max ? 40 : -30) * factor))}, ${Math.min(255, Math.round(g + (g === max ? 40 : -30) * factor))}, ${Math.min(255, Math.round(b + (b === max ? 40 : -30) * factor))})`;
        };
        const c1 = boost(avg(zone1));
        const c2 = boost(avg(zone2));
        setTitleGradient(`linear-gradient(to bottom right, ${c1}, ${c2})`);
      } catch (e) {
        // CORS or tainted canvas — keep default gradient
      }
    };
    img.src = imgSrc;
  };

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchArtistDetails(artistName);

        let artistObj = {};
        if (Array.isArray(data)) {
          const band = data.find(d => d.category === 'band') || {};
          artistObj = {
            name: artistName,
            bio: band.content || '',
            profile_image: band.hero_image || '',
            achievements: (data.find(d => d.category === 'achievements') || {}).content || '',
            members: (data.find(d => d.category === 'members') || {}).content || '',
            albums: (data.find(d => d.category === 'albums') || {}).content || '',
            tours: (data.find(d => d.category === 'tours') || {}).content || '',
          };
        } else {
          artistObj = data;
        }
        setDetails(artistObj);
        document.documentElement.style.setProperty('--primary-color', '#ec4899');
        document.documentElement.style.setProperty('--secondary-color', '#06b6d4');

        // Extract colors from the local bg image
        const lowered = artistName.toLowerCase();
        const specialPaths = {
          "the jimi hendrix experience": "hendrix.jpg",
          "guns n' roses": "gunsroses.jpeg",
          "pink floyd": "pinkfloyd.jpeg",
          "the who": "who.jpg",
          "oasis": "oasis.jpg",
          "david bowie": "bowie.jpg"
        };
        const imgPath = specialPaths[lowered] ? `/backgrounds/${specialPaths[lowered]}` : `/backgrounds/${lowered.replace(/[^a-z0-9]/g, '')}.jpg`;
        extractColors(imgPath);
      } catch (err) {
        console.error('Failed to load details', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [artistName]);

  if (loading) return <div className="p-10 text-center font-sans">Loading profile for {artistName}...</div>;
  if (!details) return <div className="p-10 text-center font-sans">Artist {artistName} not found.</div>;

  return (
    <div ref={pageRef} className="relative min-h-screen font-sans overflow-hidden">
      {/* Cinematic Background with depth layers */}
      <div
        className="fixed inset-0 bg-cover bg-center -z-20 pointer-events-none transition-all duration-1000"
        style={{ backgroundImage: `url(${getArtistLocalImage(details.name)}), url('/rock.jpg')`, filter: 'brightness(0.35) saturate(1.3)', transform: `translateY(${parallaxY}px)` }}
      />
      {/* Bottom fade vignette */}
      <div className="fixed inset-0 -z-10 pointer-events-none bg-gradient-to-t from-[#080810] via-[#080810]/60 to-transparent" />
      {/* Side vignettes */}
      <div className="fixed inset-0 -z-10 pointer-events-none bg-gradient-to-r from-[#080810]/80 via-transparent to-[#080810]/80" />
      {/* Floating ambient orbs */}
      <div className="fixed top-1/4 left-1/4 w-[600px] h-[600px] rounded-full -z-10 pointer-events-none opacity-10 blur-[120px] ambient-float"
        style={{ background: titleGradient, animationDelay: '0s' }} />
      <div className="fixed bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full -z-10 pointer-events-none opacity-10 blur-[100px] ambient-float"
        style={{ background: titleGradient, animationDelay: '-5s' }} />

      <div className="w-full mx-auto px-10 md:px-20 pt-28 pb-24 relative z-10">

        {/* Hero Header */}
        <div className="mb-14 relative">
          {/* Decorative accent line */}
          <div className="h-px w-24 mb-6 rounded-full opacity-70" style={{ background: titleGradient }} />
          <div className="flex items-center gap-6 md:gap-10">
            <h1
              className="text-[clamp(3.5rem,10vw,9rem)] m-0 font-display italic bg-clip-text text-transparent drop-shadow-2xl tracking-tighter leading-none"
              style={{ backgroundImage: titleGradient }}
            >
              {details.name}
            </h1>
            <button 
              onClick={toggleFavoriteArtist}
              className={`w-16 h-16 md:w-20 md:h-20 shrink-0 rounded-full flex items-center justify-center transition-all shadow-[0_0_40px_rgba(236,72,153,0.3)] backdrop-blur-xl border ${isFavorited ? 'bg-primary/20 border-primary shadow-[0_0_40px_rgba(236,72,153,0.6)]' : 'bg-white/5 border-white/20 hover:border-primary hover:bg-primary/10'}`}
            >
              <svg className={`w-8 h-8 md:w-10 md:h-10 transition-transform ${isFavorited ? 'text-primary scale-110 drop-shadow-[0_0_10px_rgba(236,72,153,1)]' : 'text-white/50 hover:text-white'}`} fill={isFavorited ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
            </button>
          </div>
          {/* Genre tags */}
          <div className="mt-4 flex flex-wrap gap-2">
            {['Rock', 'Legendary'].map(g => (
              <span key={g} className="px-4 py-1 rounded-full border text-xs font-mono uppercase tracking-widest text-white/50 border-white/10 bg-white/5">{g}</span>
            ))}
          </div>
          {/* Bottom accent line */}
          <div className="mt-6 h-px w-full rounded-full opacity-20" style={{ background: titleGradient }} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 w-full items-start">
          {/* ── LEFT COLUMN ── */}
          <div className="flex flex-col gap-8">

            {/* Biography Card */}
            <div className="relative rounded-[32px] border border-white/10 overflow-hidden backdrop-blur-2xl shadow-2xl group glow-hover shimmer-trigger" data-reveal="left" data-reveal-delay="100">
              {/* Card glow border on hover */}
              <div className="absolute inset-0 rounded-[32px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{ boxShadow: `inset 0 0 40px rgba(255,255,255,0.03)` }} />
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.07] to-transparent pointer-events-none" />
              <div className="relative p-10 md:p-12">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-6 w-1 rounded-full" style={{ background: titleGradient }} />
                  <h2 className="text-white font-display font-bold text-4xl italic tracking-tight m-0">Biography</h2>
                </div>
                <p className="leading-relaxed text-lg text-white/75 font-sans mb-8">{details.bio}</p>

                {/* Members */}
                {details.members && (
                  <div className="mb-7 pb-7 border-b border-white/[0.06]">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-lg">🎸</span>
                      <h4 className="font-bold text-sm uppercase tracking-[0.2em] text-white/40 m-0">Members</h4>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {details.members.split(',').map((m, i) => (
                        <div key={i} className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2"
                          data-reveal="scale" data-reveal-delay={300 + (i * 100)}>
                          <div className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0"
                            style={{ background: titleGradient }}>
                            {m.trim().split(' ').map(w => w[0]).join('').slice(0, 2)}
                          </div>
                          <span className="text-white/80 text-base">{m.trim()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Albums */}
                {details.albums && (
                  <div className="mb-7 pb-7 border-b border-white/[0.06]">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-lg">💿</span>
                      <h4 className="font-bold text-sm uppercase tracking-[0.2em] text-white/40 m-0">Iconic Albums</h4>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {details.albums.split(',').map((album, i) => (
                        <span key={i} className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white/80 text-base font-medium hover:bg-white/10 hover:border-white/20 transition-all cursor-default"
                          data-reveal="up" data-reveal-delay={400 + (i * 100)}>
                          {album.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tours Timeline */}
                {details.tours && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-lg">🗺️</span>
                      <h4 className="font-bold text-sm uppercase tracking-[0.2em] text-white/40 m-0">Major Tours</h4>
                    </div>
                    <div className="space-y-3 pl-2">
                      {details.tours.split(';').map((tour, i) => {
                        const parts = tour.trim().split('|');
                        return parts.length >= 2 ? (
                          <div key={i} className="flex items-baseline gap-4 group/tour"
                            data-reveal="left" data-reveal-delay={500 + (i * 100)}>
                            <span className="text-sm font-mono font-bold shrink-0 w-12 text-right opacity-50 group-hover/tour:opacity-100 transition-opacity"
                              style={{ color: 'inherit' }}>{parts[0]}</span>
                            <div className="w-px h-5 bg-white/10 self-center shrink-0" />
                            <span className="text-white/70 text-base group-hover/tour:text-white/90 transition-colors">{parts[1]}</span>
                            {parts[2] && <span className="text-white/40 text-sm italic ml-auto shrink-0">{parts[2]}</span>}
                          </div>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Achievements Card */}
            {details.achievements && (
              <div className="relative rounded-[28px] overflow-hidden border border-white/10 backdrop-blur-xl shadow-xl glow-hover shimmer-trigger" data-reveal="left" data-reveal-delay="300">
                <div className="absolute inset-0 pointer-events-none" style={{ background: `linear-gradient(135deg, rgba(255,255,255,0.04), transparent)` }} />
                <div className="relative p-8 md:p-10">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="h-6 w-1 rounded-full bg-yellow-400/80" />
                    <h3 className="font-display font-bold text-3xl italic text-white/90 m-0 tracking-tight">Career Highlights</h3>
                    <span className="ml-auto text-3xl">🏆</span>
                  </div>
                  <p className="text-white/75 text-lg leading-relaxed">{details.achievements}</p>
                </div>
              </div>
            )}
          </div>

          {/* ── RIGHT COLUMN: Jukebox ── */}
          <div className="lg:col-span-1 sticky top-28 shimmer-trigger" data-reveal="right" data-reveal-delay="500">
            {/* Realistic Lighting Fixture (based on reference) */}
            <div className="relative w-full flex flex-col items-center mb-10 px-12 group/light">
              {/* 1. WALL WASH GLOW (Atmospheric spill) */}
              <div className="absolute top-4 w-4/5 h-24 blur-[60px] opacity-40 animate-pulse-light pointer-events-none transition-all duration-1000"
                style={{ background: titleGradient }} />

              {/* 2. FIXTURE HOUSING (The black mount) */}
              <div className="relative w-3/4 h-3 bg-gradient-to-b from-[#1a1a1a] to-black rounded-t-2xl border-t border-white/10 shadow-[0_-2px_10px_rgba(0,0,0,0.8)] z-20">
                {/* Mount highlights */}
                <div className="absolute top-[2px] left-[10%] right-[10%] h-[1px] bg-white/5" />
              </div>

              {/* 3. GLOWING DIFFUSER (The thick tube) */}
              <div className="relative w-[72%] h-7 -mt-0.5 rounded-b-3xl overflow-hidden z-10 shadow-[0_15px_40px_rgba(0,0,0,0.6)]"
                style={{ background: `linear-gradient(to bottom, white, #fff 20%, transparent 95%)` }}>

                {/* Outer Glow of the tube itself */}
                <div className="absolute inset-0 opacity-90 transition-all duration-1000"
                  style={{ background: titleGradient, filter: 'saturate(1.5) brightness(1.2)' }} />

                {/* Inner white-hot core */}
                <div className="absolute top-0 left-[2%] right-[2%] h-[60%] rounded-full bg-white opacity-95 blur-[1px] shadow-[0_0_15px_rgba(255,255,255,1)]" />

                {/* Dynamic light pulse */}
                <div className="absolute inset-0 bg-white/10 animate-pulse" />

                {/* Side edge refractions */}
                <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-white/30 blur-[1px]" />
                <div className="absolute right-0 top-0 bottom-0 w-[4px] bg-white/30 blur-[1px]" />
              </div>

              {/* 4. UNDER-GLOW FLARE (Point light contribution) */}
              <div className="absolute top-8 w-1/2 h-1 blur-[12px] opacity-60 rounded-full z-30"
                style={{ background: titleGradient }} />
            </div>

            <ArtistJukebox artistName={details.name} />
          </div>

        </div>

        {/* Community Opinions Section */}
        <CommunityOpinions artistName={details.name} gradient={titleGradient} />

      </div>
    </div>
  );
};

const ArtistCard = ({ name, delay }) => {
  const [imageUrl, setImageUrl] = useState(null);

  useEffect(() => {
    const loadImg = async () => {
      try {
        let apiUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(name)}&entity=album&limit=1`;

        // Custom override for ambiguous bands like Oasis
        if (name.toLowerCase() === 'oasis') {
          apiUrl = `https://itunes.apple.com/lookup?id=512633&entity=album&limit=1`;
        }

        const res = await fetch(apiUrl);
        const data = await res.json();
        const albums = data.results.filter(r => r.wrapperType === 'collection');

        if (albums && albums.length > 0) {
          const highResUrl = albums[0].artworkUrl100.replace('100x100bb', '600x600bb');
          setImageUrl(highResUrl);
        }
      } catch (err) {
        console.error('Failed fetching image for', name, err);
      }
    };
    loadImg();
  }, [name]);

  return (
    <Link
      to={`/artist?artist=${encodeURIComponent(name)}`}
      className="group relative h-[320px] overflow-hidden rounded-[32px] border border-white/10 bg-glass text-left no-underline text-white transition-all duration-500 hover:-translate-y-2 hover:border-primary/50 hover:shadow-[0_20px_50px_rgba(236,72,153,0.25)] block glow-hover shimmer-trigger"
      data-reveal="scale"
      data-reveal-delay={delay}
    >
      {imageUrl ? (
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-110"
          style={{ backgroundImage: `url(${imageUrl})` }}
        ></div>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-[#111] via-[#050505] to-[#111]"></div>
      )}

      {/* Dark gradient for text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent opacity-90 group-hover:opacity-80 transition-opacity duration-500"></div>

      <div className="absolute bottom-0 left-0 p-8 w-full flex flex-col justify-end">
        <h3 className="text-3xl font-display font-bold italic m-0 tracking-tight drop-shadow-lg text-white">
          {name}
        </h3>
        <div className="mt-4 flex items-center gap-2 text-primary font-bold text-xs tracking-widest uppercase opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
          Explore Artist
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
        </div>
      </div>
    </Link>
  );
};

const ArtistDirectory = ({ category }) => {
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchArtists();
        let filtered = data;
        if (category === 'legendary') filtered = data.slice(0, 5);
        if (category === 'popular') filtered = data.slice(5, 12);
        if (category === 'common') filtered = data.slice(12, 17);
        setArtists(filtered);
      } catch (e) { } finally { setLoading(false); }
    };
    load();
  }, [category]);

  const displayTitle = category ? category.charAt(0).toUpperCase() + category.slice(1) : 'Explore';
  const pageRef = useRef(null);
  useScrollReveal(pageRef, [artists]);

  return (
    <div ref={pageRef} className="relative py-20 px-10 font-sans min-h-screen overflow-hidden">
      {/* Ambient Transparent Rock Background */}
      <div className="fixed inset-0 bg-cover bg-center opacity-40 -z-20 pointer-events-none" style={{ backgroundImage: "url('/rock.jpg')" }}></div>
      <div className="fixed inset-0 bg-gradient-to-b from-[#05050a]/30 via-[#05050a]/60 to-[#05050a]/90 -z-10 pointer-events-none"></div>

      {/* Floating ambient orbs (Directory Palette) */}
      <div className="fixed top-1/2 left-1/4 w-[800px] h-[800px] rounded-full -z-10 pointer-events-none opacity-[0.07] blur-[150px] ambient-float"
        style={{ background: 'var(--secondary-color)', animationDuration: '20s' }} />
      <div className="fixed bottom-0 right-1/4 w-[600px] h-[600px] rounded-full -z-10 pointer-events-none opacity-[0.05] blur-[120px] ambient-float"
        style={{ background: 'var(--primary-color)', animationDuration: '25s', animationDelay: '-10s' }} />

      <div className="max-w-[1400px] mx-auto relative z-10">
        <h1 className="text-7xl font-display font-black italic tracking-tighter mb-12 text-white" data-reveal="up">
          {displayTitle} <span className="text-primary">Artists</span>
        </h1>
        {loading ? <p className="text-white text-xl">Loading directory...</p> : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-8">
            {artists.map((name, i) => <ArtistCard key={name} name={name} delay={(i % 12) * 80} />)}
          </div>
        )}
      </div>
    </div>
  );
};

const Artist = () => {
  const [searchParams] = useSearchParams();
  const artistName = searchParams.get('artist');
  const category = searchParams.get('category');

  return artistName ? <ArtistProfile artistName={artistName} /> : <ArtistDirectory category={category} />;
};

export default Artist;
