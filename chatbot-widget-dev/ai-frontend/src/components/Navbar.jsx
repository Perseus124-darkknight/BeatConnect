import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchArtists } from '../services/api';

const Navbar = () => {
  const [artists, setArtists] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

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

  const legendary = artists.slice(0, 5);
  const popular = artists.slice(5, 12);

  return (
    <nav className="sticky top-0 z-[100] py-4 px-8 flex justify-between items-center bg-glass backdrop-blur-md border-b border-glass font-sans shadow-lg">
      <Link to="/home" className="text-2xl font-bold no-underline text-white">Beat<span className="text-primary">Connect</span></Link>
      
      <div className="flex gap-6 items-center relative">
        <div 
          onMouseEnter={() => setIsDropdownOpen(true)} 
          onMouseLeave={() => setIsDropdownOpen(false)}
          className="relative"
        >
          <span className="cursor-pointer font-semibold text-white hover:text-primary transition-colors">Artists</span>
          {isDropdownOpen && (
            <div className="absolute top-full left-0 bg-bg-dark p-4 rounded-xl border border-glass flex gap-4 shadow-2xl min-w-[300px]">
              <div className="flex flex-col flex-1">
                <strong className="text-primary mb-2 text-xs uppercase tracking-widest">Legendary</strong>
                {legendary.map(a => <Link key={a} to={`/artist?artist=${encodeURIComponent(a)}`} className="no-underline text-gray-300 hover:text-white mb-1 hover:translate-x-1 transition-transform truncate">{a}</Link>)}
              </div>
              <div className="flex flex-col flex-1 border-l border-glass pl-4">
                <strong className="text-secondary mb-2 text-xs uppercase tracking-widest">Popular</strong>
                {popular.map(a => <Link key={a} to={`/artist?artist=${encodeURIComponent(a)}`} className="no-underline text-gray-300 hover:text-white mb-1 hover:translate-x-1 transition-transform truncate">{a}</Link>)}
              </div>
            </div>
          )}
        </div>
        
        <Link to="/genre" className="no-underline text-white font-semibold hover:text-secondary transition-colors">Genres</Link>
        <Link to="/admin" className="no-underline text-white font-semibold hover:text-green-400 transition-colors">Admin</Link>
        
        <div className="relative">
          <input 
            type="text" 
            placeholder="Search artists..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="py-2 px-4 pl-10 rounded-full border border-glass bg-white/5 text-white w-[200px] outline-none transition-all duration-300 focus:w-[240px] focus:border-primary focus:bg-white/10"
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">🔍</span>
          {searchQuery && (
            <div className="absolute top-full left-0 right-0 bg-bg-dark border border-glass rounded-xl mt-2 overflow-hidden shadow-2xl">
              {matches.length > 0 ? matches.map(m => (
                <Link key={m} to={`/artist?artist=${encodeURIComponent(m)}`} onClick={() => setSearchQuery('')} className="block p-3 px-4 text-white no-underline border-b border-white/5 last:border-0 hover:bg-white/10 hover:text-primary transition-colors flex items-center gap-2">
                  <span className="text-secondary">🎵</span> {m}
                </Link>
              )) : <div className="p-3 px-4 text-gray-400 italic flex justify-center">No results</div>}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
