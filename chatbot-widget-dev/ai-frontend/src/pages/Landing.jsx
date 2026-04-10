import React from 'react';
import { Link } from 'react-router-dom';

const Landing = () => {
  return (
    <div className="hero font-sans pt-0">
      {/* Background Blobs and Real Hero BG */}
      <div className="hero-bg" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1493225457224-ca8e6b1853d9?q=80&w=2000&auto=format&fit=crop')" }}></div>
      <div className="glow-blob blob-1"></div>
      <div className="glow-blob blob-2"></div>
      
      {/* Content */}
      <div className="hero-content">
        <span className="badge">Explore the Legends of Music</span>
        <h1>
          BeatConnect <br />
          <span className="text-gradient">Wiki & AI Guide</span>
        </h1>
        
        <p className="subtitle text-white">The ultimate interactive gateway to music history.</p>
        
        <div className="frosted-box max-w-[600px] mx-auto mb-10 flex flex-col gap-6">
          <div className="cta-group">
            <Link to="/home" className="btn btn-primary no-underline text-center flex-1">
              Step Inside
            </Link>
            <Link to="/artist" className="btn btn-secondary no-underline text-center flex-1">
              Browse Artists
            </Link>
          </div>
        </div>
        
        <div className="flex justify-center gap-6 mt-8">
            <a href="#" className="text-white/40 no-underline text-sm transition-colors hover:text-white">About Us</a>
            <a href="#" className="text-white/40 no-underline text-sm transition-colors hover:text-white">Join Community</a>
            <a href="#" className="text-white/40 no-underline text-sm transition-colors hover:text-white">Newsletter</a>
        </div>
      </div>
    </div>
  );
};

export default Landing;
