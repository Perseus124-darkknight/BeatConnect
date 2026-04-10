import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { fetchArtists, fetchArtistDetails } from '../services/api';

const ArtistProfile = ({ artistName }) => {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchArtistDetails(artistName);
        
        let artistObj = {};
        if (Array.isArray(data)) {
            artistObj = {
                name: artistName,
                bio: (data.find(d => d.category === 'band') || {}).content || '',
                profile_image: (data.find(d => d.category === 'band') || {}).hero_image || '',
                achievements: (data.find(d => d.category === 'achievements') || {}).content || ''
            };
        } else {
            artistObj = data;
        }
        setDetails(artistObj);
        document.documentElement.style.setProperty('--primary-color', '#ec4899');
        document.documentElement.style.setProperty('--secondary-color', '#06b6d4');
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
    <div className="relative min-h-screen font-sans">
      {/* Hero Background */}
      <div 
        className="absolute top-0 left-0 right-0 h-[60vh] bg-cover bg-center opacity-30 -z-10"
        style={{
          backgroundImage: `url(${details.profile_image || 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?auto=format&fit=crop&q=80'})`,
          WebkitMaskImage: 'linear-gradient(to bottom, black 0%, transparent 100%)',
          maskImage: 'linear-gradient(to bottom, black 0%, transparent 100%)'
        }}
      ></div>

      <div className="max-w-[1200px] mx-auto px-10 pt-20 pb-10">
        <h1 className="text-8xl m-0 font-display italic bg-gradient-to-br from-secondary to-primary bg-clip-text text-transparent">
          {details.name}
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-10 mt-10">
          <div className="bg-glass p-10 rounded-3xl border border-glass backdrop-blur-xl">
            <h2 className="text-primary mb-5 font-bold text-2xl">Biography</h2>
            <p className="leading-relaxed text-lg opacity-90 text-white">{details.bio}</p>
          </div>
          
          <div className="flex flex-col gap-6">
            {details.achievements && (
              <div className="bg-glass p-8 rounded-3xl border border-glass backdrop-blur-xl">
                <h3 className="mb-4 flex items-center gap-2 font-bold text-xl text-white">🏆 Achievements</h3>
                <p className="opacity-80 text-sm text-white">{details.achievements}</p>
              </div>
            )}
            <button className="p-5 rounded-2xl bg-white text-black font-bold border-none cursor-pointer text-lg hover:-translate-y-1 transition-transform shadow-lg">
              ▶ Play Radio
            </button>
          </div>
        </div>
      </div>
    </div>
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
      } catch(e) {} finally { setLoading(false); }
    };
    load();
  }, [category]);

  const displayTitle = category ? category.charAt(0).toUpperCase() + category.slice(1) : 'Explore';

  return (
    <div className="py-16 px-10 max-w-[1200px] mx-auto font-sans">
      <h1 className="text-6xl font-display mb-10 text-white">
        {displayTitle} <span className="text-primary">Artists</span>
      </h1>
      {loading ? <p className="text-white">Loading directory...</p> : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-6">
          {artists.map(name => (
            <Link 
              key={name} 
              to={`/artist?artist=${encodeURIComponent(name)}`} 
              className="bg-glass border border-glass rounded-2xl p-8 text-center no-underline text-white transition-all duration-300 hover:-translate-y-2 hover:border-primary backdrop-blur-lg block"
            >
              <h3 className="text-2xl font-display italic m-0">{name}</h3>
            </Link>
          ))}
        </div>
      )}
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
