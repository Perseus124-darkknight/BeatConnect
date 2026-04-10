import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="relative overflow-hidden font-sans pb-24">
      {/* Background and Globs */}
      <div className="hero-bg" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1459749411175-04bf5292ceea?q=80&w=2070&auto=format&fit=crop')" }}></div>
      <div className="glow-blob blob-1"></div>
      <div className="glow-blob blob-2"></div>
      
      <section className="features relative z-10">
        <div className="container">
          <div className="section-header">
            <span className="section-label">Explore the Database</span>
            <h2>Welcome to Beat<span className="text-primary">Connect</span></h2>
            <p>Discover the rich history of rock and roll through our interactive database.</p>
          </div>
          
          <div className="feature-grid">
            <Link to="/artist" className="feature-card no-underline">
              <div className="feature-icon text-white">🎸</div>
              <h3 className="text-white">Artists</h3>
              <p>Explore legendary bands and individual artists from the 60s to today.</p>
              <span className="text-primary font-bold mt-4 inline-block text-sm">View Artists Directory ➔</span>
            </Link>
            
            <Link to="/genre" className="feature-card no-underline">
              <div className="feature-icon text-white">🎵</div>
              <h3 className="text-white">Genres</h3>
              <p>Dive into the subgenres that shaped modern music.</p>
              <span className="text-primary font-bold mt-4 inline-block text-sm">Explore Genres ➔</span>
            </Link>
            
            <Link to="/admin" className="feature-card no-underline">
              <div className="feature-icon text-white">⚙️</div>
              <h3 className="text-white">Admin</h3>
              <p>Manage the application's artist database and content.</p>
              <span className="text-primary font-bold mt-4 inline-block text-sm">Go to Admin Panel ➔</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
