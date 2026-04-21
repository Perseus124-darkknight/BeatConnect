import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { fetchArtists } from '@shared/services/api';
import { useAuth } from '@shared/context/AuthContext';
import AuthModal from '@shared/components/Modals/AuthModal';
import CustomizationModal from './Modals/CustomizationModal';

const Navbar = () => {
  const [artists, setArtists] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isCustomizationOpen, setIsCustomizationOpen] = useState(false);
  const [scrolledPastHero, setScrolledPastHero] = useState(false);
  const [isHoveringNav, setIsHoveringNav] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      // 100vh minus a bit of buffer
      setScrolledPastHero(window.scrollY > window.innerHeight - 100);
    };

    if (location.pathname === '/home' || location.pathname === '/') {
      window.addEventListener('scroll', handleScroll, { passive: true });
      handleScroll(); // initial check
    } else {
      setScrolledPastHero(true);
    }
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [location.pathname]);

  const isHidden = (location.pathname === '/home' || location.pathname === '/') && !scrolledPastHero;
  const isActuallyHidden = isHidden && !isHoveringNav;

  useEffect(() => {
    const loadArtists = async () => {
      try {
        const data = await fetchArtists();
        setArtists(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to load artists for navbar:', err);
        setArtists([]);
      }
    };
    loadArtists();
  }, []);

  const { user, logout, isAuthenticated } = useAuth();

  const matches = artists.filter(a => a.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 5);

  const legendary = artists.slice(0, 8);
  const popular = artists.slice(8, 16);
  const iconic = artists.slice(16);

  return (
    <>
      {/* Invisible Trigger Layer for Hover Reveal */}
      {isHidden && (
        <div 
          className="fixed top-0 left-0 right-0 h-16 z-[90]" 
          onMouseEnter={() => setIsHoveringNav(true)}
        />
      )}
      <nav 
        onMouseEnter={() => setIsHoveringNav(true)}
        onMouseLeave={() => setIsHoveringNav(false)}
        className={`fixed top-0 left-0 right-0 w-full z-[100] py-6 px-10 flex justify-between items-center bg-black/40 backdrop-blur-md font-sans shadow-lg transition-all duration-700 ease-in-out border-b border-white/5 ${isActuallyHidden ? '-translate-y-full opacity-0 pointer-events-none' : 'translate-y-0 opacity-100 pointer-events-auto'}`}
      >
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
          
          <div className="flex items-center gap-6">
            <Link to="/dispatch" className="no-underline text-white text-lg font-bold hover:text-secondary transition-colors">Dispatch</Link>
            <Link to="/genre" className="no-underline text-white text-lg font-bold hover:text-secondary transition-colors">Genres</Link>
            <a href="/home#about-us" className="no-underline text-white text-lg font-bold hover:text-secondary transition-colors">About Us</a>
          </div>
          
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

            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <div 
                  onClick={() => setIsCustomizationOpen(true)}
                  className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-full border border-white/10 hover:bg-white/10 transition-all cursor-pointer group"
                >
                  <div className="relative">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-white shadow-lg group-hover:scale-110 transition-transform">
                      {user?.username?.[0]?.toUpperCase() || 'U'}
                    </div>
                    {user?.role === 'admin' && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-secondary rounded-full border-2 border-[#0a0a0f] z-10" title="Admin Authority" />
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-white text-sm font-bold tracking-tight leading-none mb-0.5">{user?.username}</span>
                    <span className="text-[8px] font-mono text-white/30 uppercase tracking-widest leading-none">
                      {user?.role === 'admin' ? 'System Admin' : 'Active User'}
                    </span>
                  </div>
                </div>
                
                <Link 
                  to="/user" 
                  className="text-white/40 hover:text-white text-xs font-mono uppercase tracking-widest transition-colors no-underline"
                >
                  Dashboard
                </Link>

                {user?.role === 'admin' && (
                  <Link 
                    to="/admin" 
                    className="text-secondary/60 hover:text-secondary text-xs font-mono uppercase tracking-widest transition-colors no-underline flex items-center gap-1.5"
                  >
                    <span className="w-1 h-1 bg-secondary rounded-full animate-pulse"></span>
                    Admin Panel
                  </Link>
                )}

                <button 
                  onClick={logout}
                  className="text-white/40 hover:text-white text-xs font-mono uppercase tracking-widest transition-colors ml-2"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setIsAuthOpen(true)}
                className="bg-primary hover:bg-primary/90 text-white font-bold py-3 px-8 rounded-full shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95 text-sm uppercase tracking-widest border border-white/10"
              >
                Log In
              </button>
            )}
          </div>
        </div>
      </nav>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      <CustomizationModal isOpen={isCustomizationOpen} onClose={() => setIsCustomizationOpen(false)} />
    </>
  );
};

export default Navbar;

