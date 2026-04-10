import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchArtists } from '../services/api';
import AuthModal from './AuthModal';

const Navbar = () => {
  const [artists, setArtists] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  useEffect(() => {
    const loadArtists = async () => {
      try {
        const data = await fetchArtists();
        setArtists(data);
      } catch (err) {
        console.error('Failed to load artists for navbar:', err);
      }
    };
    loadArtists();
  }, []);

  const matches = artists.filter(a => a.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 5);

  const legendary = artists.slice(0, 8);
  const popular = artists.slice(8, 16);
  const iconic = artists.slice(16);

  return (
    <>
      <nav className="sticky top-0 z-[100] py-6 px-10 flex justify-between items-center bg-glass backdrop-blur-md border-b border-glass font-sans shadow-lg">
        <Link to="/home" className="text-3xl font-bold no-underline text-white">Beat<span className="text-primary">Connect</span></Link>
        
        <div className="flex gap-6 items-center relative">
          <div 
            onMouseEnter={() => setIsDropdownOpen(true)} 
            onMouseLeave={() => setIsDropdownOpen(false)}
            className="relative group/nav"
          >
            <span className="cursor-pointer text-lg font-bold text-white group-hover/nav:text-primary transition-colors flex items-center gap-1.5">
              Artists <span className="text-xs opacity-50 transition-transform group-hover/nav:rotate-180">▼</span>
            </span>
            {isDropdownOpen && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-black/90 p-6 rounded-2xl border border-white/10 flex flex-col gap-6 shadow-[0_30px_60px_rgba(0,0,0,0.8)] min-w-[580px] backdrop-blur-3xl overflow-hidden animate-fadeIn">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 pointer-events-none" />
                
                <div className="grid grid-cols-3 gap-8 relative z-10">
                  <div className="flex flex-col flex-1">
                    <strong className="text-primary mb-3 text-[10px] font-mono uppercase tracking-[0.2em] opacity-80">Legendary</strong>
                    <div className="flex flex-col gap-1.5 max-h-[220px] overflow-y-auto pr-2 custom-scrollbar">
                      {legendary.map(a => <Link key={a} to={`/artist?artist=${encodeURIComponent(a)}`} className="no-underline text-gray-400 hover:text-white text-sm hover:translate-x-1 transition-all truncate py-0.5">{a}</Link>)}
                    </div>
                  </div>
                  <div className="flex flex-col flex-1 border-l border-white/5 pl-6">
                    <strong className="text-secondary mb-3 text-[10px] font-mono uppercase tracking-[0.2em] opacity-80">Popular</strong>
                    <div className="flex flex-col gap-1.5 max-h-[220px] overflow-y-auto pr-2 custom-scrollbar">
                      {popular.map(a => <Link key={a} to={`/artist?artist=${encodeURIComponent(a)}`} className="no-underline text-gray-400 hover:text-white text-sm hover:translate-x-1 transition-all truncate py-0.5">{a}</Link>)}
                    </div>
                  </div>
                  <div className="flex flex-col flex-1 border-l border-white/5 pl-6">
                    <strong className="text-green-400 mb-3 text-[10px] font-mono uppercase tracking-[0.2em] opacity-80">Iconic</strong>
                    <div className="flex flex-col gap-1.5 max-h-[220px] overflow-y-auto pr-2 custom-scrollbar">
                      {iconic.length > 0 ? iconic.map(a => <Link key={a} to={`/artist?artist=${encodeURIComponent(a)}`} className="no-underline text-gray-400 hover:text-white text-sm hover:translate-x-1 transition-all truncate py-0.5">{a}</Link>) : <span className="text-white/10 italic text-xs">More soon...</span>}
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/5 flex justify-center relative z-10">
                  <Link to="/artist" className="text-white/40 hover:text-primary text-[11px] uppercase font-bold tracking-[0.15em] no-underline transition-colors flex items-center gap-2 group/all">
                    View All Artists <span className="text-lg transition-transform group-hover/all:translate-x-1">→</span>
                  </Link>
                </div>
              </div>
            )}
          </div>
          
          <Link to="/genre" className="no-underline text-white text-lg font-bold hover:text-secondary transition-colors">Genres</Link>
          <Link to="/admin" className="no-underline text-white text-lg font-bold hover:text-green-400 transition-colors">Admin</Link>
          
          <div className="flex items-center gap-4">
            <div className="relative group">
              <input 
                type="text" 
                placeholder="Search artists..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="py-3 px-6 pl-12 rounded-full border border-white/10 bg-white/5 text-white w-[240px] text-sm outline-none transition-all duration-300 focus:w-[300px] focus:border-primary focus:bg-white/10 placeholder:text-white/20"
              />
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none transition-colors group-focus-within:text-primary">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              {searchQuery && (
                <div className="absolute top-full left-0 right-0 bg-[#0a0a0f] border border-glass rounded-xl mt-2 overflow-hidden shadow-2xl z-[110] animate-fadeIn">
                  {matches.length > 0 ? matches.map(m => (
                    <Link key={m} to={`/artist?artist=${encodeURIComponent(m)}`} onClick={() => setSearchQuery('')} className="block p-3 px-4 text-white no-underline border-b border-white/5 last:border-0 hover:bg-white/10 hover:text-primary transition-colors flex items-center gap-2">
                      <span className="text-secondary">🎵</span> {m}
                    </Link>
                  )) : <div className="p-3 px-4 text-gray-400 italic flex justify-center">No results</div>}
                </div>
              )}
            </div>

            <button 
              onClick={() => setIsAuthOpen(true)}
              className="bg-primary hover:bg-primary/90 text-white font-bold py-3 px-8 rounded-full shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95 text-sm uppercase tracking-widest border border-white/10"
            >
              Log In
            </button>
          </div>
        </div>
      </nav>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </>
  );
};

export default Navbar;

