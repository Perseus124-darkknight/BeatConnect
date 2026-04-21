import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { fetchArtists } from '@shared/services/api';

const Genre = () => {
  const [searchParams] = useSearchParams();
  const genreId = searchParams.get('id') || 'rock';
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchArtists();
        // Mock filtering logic
        const rockBands = ['The Beatles', 'Led Zeppelin', 'AC/DC', "Guns N' Roses", 'Aerosmith', 'The Rolling Stones', 'Pink Floyd', 'Queen', 'The Who', 'Metallica'];
        let filtered = data.filter(a => rockBands.includes(a));
        if (filtered.length === 0) filtered = data.slice(0, 8);
        setArtists(filtered);
      } catch(e) {} finally { setLoading(false); }
    };
    load();
  }, [genreId]);

  return (
    <div className="py-16 px-10 max-w-[1200px] mx-auto font-sans">
      <div className="text-center mb-16">
        <h1 className="text-6xl font-display uppercase m-0 text-white">
          {genreId} <span className="text-primary">Legends</span>
        </h1>
        <p className="text-muted mt-2">Explore top artists in {genreId}.</p>
      </div>

      {loading ? <p className="text-center text-white">Loading {genreId} artists...</p> : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-8">
          {artists.map((name, i) => (
            <Link 
              key={name} 
              to={`/artist?artist=${encodeURIComponent(name)}`} 
              className="bg-glass border border-glass rounded-3xl overflow-hidden no-underline text-white flex flex-col transition-transform duration-300 hover:-translate-y-2 backdrop-blur-xl"
            >
              <div 
                className={`h-[200px] flex items-center justify-center opacity-80`}
                style={{ background: `linear-gradient(135deg, var(--tw-colors-${i%2===0?'primary':'secondary'}) 0%, transparent 100%)` }}
              >
                 <p className="font-display text-5xl italic m-0 opacity-90">{name}</p>
              </div>
              <div className="p-6">
                <span className="text-xs text-secondary uppercase font-bold tracking-wider">Featured Band</span>
                <p className="mt-2 text-sm text-muted">Discover the extensive discography and legendary history of this iconic band.</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Genre;
