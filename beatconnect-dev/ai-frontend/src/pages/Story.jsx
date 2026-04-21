import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { dispatchStories } from '../data/dispatchStories';

const getArtistLocalImage = (name) => {
  if (!name) return '/rock.jpg';
  const lowered = name.toLowerCase();
  const specialPaths = {
    "the jimi hendrix experience": "hendrix.jpg",
    "jimi hendrix": "hendrix.jpg",
    "guns n' roses": "gunsroses.jpeg",
    "pink floyd": "pinkfloyd.jpeg",
    "the who": "who.jpg",
    "oasis": "oasis.jpg",
    "david bowie": "bowie.jpg"
  };
  if (specialPaths[lowered]) return `/backgrounds/${specialPaths[lowered]}`;
  return `/backgrounds/${lowered.replace(/[^a-z0-9]/g, '')}.jpg`;
};

const Story = () => {
  const [searchParams] = useSearchParams();
  const artistName = searchParams.get('artist');
  const navigate = useNavigate();
  const [storyData, setStoryData] = useState(null);
  const [parallaxY, setParallaxY] = useState(0);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (!artistName) {
      navigate('/dispatch');
      return;
    }
    
    // Find the story data matching the artist
    const found = dispatchStories.find(s => s.name.toLowerCase() === artistName.toLowerCase());
    if (found) {
      setStoryData(found);
    } else {
      // fallback if artist is not in the 23 statically defined ones
      navigate('/dispatch');
    }
  }, [artistName, navigate]);

  useEffect(() => {
    const handleScroll = () => setParallaxY(window.scrollY * 0.4);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!storyData) return <div className="min-h-screen bg-[#0a0a0f]" />;

  const image = getArtistLocalImage(storyData.name);

  return (
    <div className="relative bg-[#0a0a0f] text-[#f0f0f0] font-sans overflow-hidden selection:bg-primary selection:text-white min-h-screen">
      
      {/* MASSIVE HERO SECTION */}
      <div className="relative w-full h-[80vh] md:h-[90vh] overflow-hidden flex flex-col justify-end">
        {/* Parallax Background */}
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-75"
          style={{ 
            backgroundImage: `url(${image})`, 
            transform: `translateY(${parallaxY}px)`,
            filter: 'grayscale(60%) contrast(120%) brightness(0.6)'
          }}
        />
        {/* Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0f]/80 to-transparent" />

        {/* Hero Content */}
        <div className="relative z-10 px-6 md:px-20 pb-20 max-w-[1600px] w-full mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-1 bg-primary shadow-[0_0_15px_rgba(236,72,153,0.8)]" />
            <span className="font-mono uppercase tracking-[0.4em] text-sm font-bold text-primary">Volume I Feature</span>
          </div>
          <h1 className="font-display font-black text-6xl md:text-[140px] uppercase italic tracking-tighter leading-[0.85] m-0 drop-shadow-2xl">
            {storyData.name}
          </h1>
        </div>
      </div>

      {/* EDITORIAL CONTENT SECTION */}
      <div className="relative px-6 md:px-20 py-20 max-w-[1600px] w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 md:gap-24">
        
        {/* Left Column: The Main Story */}
        <div className="lg:col-span-8">
          {/* Brutalist Quote Block */}
          <div className="mb-16 relative border-l-[8px] border-primary pl-8 md:pl-12">
            <span className="absolute -top-10 -left-6 text-[120px] font-serif text-white/5 leading-none select-none pointer-events-none">"</span>
            <h2 className="font-serif text-4xl md:text-5xl italic font-light leading-tight text-white m-0 relative z-10">
              "{storyData.quote}"
            </h2>
          </div>

          {/* Story Text (Multi-column on wide screens) */}
          <div className="font-sans text-[20px] md:text-[22px] leading-[1.8] text-white/80 font-light md:columns-2 gap-12 text-justify editorial-flow">
             {Array.isArray(storyData.story) ? (
               storyData.story.map((block, idx) => {
                 if (block.type === 'text') {
                   const isFirst = idx === 0;
                   return (
                     <p key={idx} className="m-0 mb-8 break-inside-avoid relative">
                       {isFirst && (
                          <span className="float-left font-serif text-[120px] leading-[0.7] pt-[10px] pr-4 text-white font-black drop-shadow-[4px_4px_0_#EC4899]">
                            {block.content.charAt(0)}
                          </span>
                       )}
                       {isFirst ? block.content.slice(1) : block.content}
                     </p>
                   );
                 }
                 if (block.type === 'image') {
                   return (
                     <div key={idx} className="my-12 break-inside-avoid w-full">
                       <div className="relative border-4 border-white/20 shadow-[10px_10px_0_rgba(236,72,153,0.5)] group overflow-hidden">
                         <img src={block.src} alt={block.caption} className="w-full h-auto grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700" />
                         <div className="absolute inset-0 bg-primary/20 mix-blend-overlay opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                       </div>
                       {block.caption && <span className="block mt-4 font-mono text-xs uppercase tracking-widest text-[#a0a0a0] font-bold border-l-4 border-primary pl-3">{block.caption}</span>}
                     </div>
                   );
                 }
                 return null;
               })
             ) : (
               storyData.story.split('\\n\\n').map((para, idx) => {
                  const isFirst = idx === 0;
                  if (!para.trim()) return null;
                  return (
                    <p key={idx} className="m-0 mb-8 break-inside-avoid relative">
                      {isFirst && (
                         <span className="float-left font-serif text-[120px] leading-[0.7] pt-[10px] pr-4 text-white font-black drop-shadow-[4px_4px_0_#EC4899]">
                           {para.charAt(0)}
                         </span>
                      )}
                      {isFirst ? para.slice(1) : para}
                    </p>
                  );
               })
             )}
          </div>
        </div>

        {/* Right Column: Did You Know / Facts */}
        <div className="lg:col-span-4 flex flex-col gap-10">
           <div className="bg-white text-black p-8 md:p-12 border-t-[12px] border-primary shadow-[15px_15px_0_rgba(236,72,153,0.3)] hover:-translate-y-2 transition-transform duration-500">
             <div className="flex items-center gap-3 mb-8">
                <span className="font-mono text-xl font-bold uppercase tracking-widest text-[#0a0a0f]">Archive</span>
                <span className="w-full h-px bg-black opacity-20" />
             </div>
             
             <h3 className="font-display font-black text-5xl italic tracking-tighter m-0 mb-8 uppercase leading-none">
               Did You <span className="text-primary">Know?</span>
             </h3>
             
             <ul className="list-none p-0 m-0 flex flex-col gap-8 flex-1">
               {storyData.facts.map((fact, index) => (
                 <li key={index} className="flex gap-4 group">
                    <div className="font-mono font-bold text-lg text-primary opacity-50 group-hover:opacity-100 transition-opacity">0{index+1}</div>
                    <div className="font-sans text-lg font-medium leading-[1.5] text-[#1a1a1a] opacity-80 group-hover:opacity-100 transition-opacity">
                      {fact}
                    </div>
                 </li>
               ))}
             </ul>
           </div>
           
           {/* Bottom Ad / Filler Block */}
           <div className="border border-white/10 p-8 flex flex-col items-center justify-center text-center gap-4 bg-[url('/rock.jpg')] bg-cover bg-center relative overflow-hidden group">
              <div className="absolute inset-0 bg-[#0a0a0f]/90 group-hover:bg-[#0a0a0f]/70 transition-colors duration-500" />
              <div className="relative z-10">
                <span className="font-mono text-[10px] uppercase tracking-[0.3em] font-bold text-white/50">Explore Their Music</span>
                <h4 className="font-display text-4xl font-black italic uppercase mt-2 mb-6">Listen Now</h4>
                <button onClick={() => navigate(`/artist?artist=${encodeURIComponent(storyData.name)}`)} className="px-8 py-3 bg-white text-black font-mono font-bold uppercase tracking-widest text-xs hover:bg-primary hover:text-white transition-all shadow-[4px_4px_0_#EC4899]">
                  Open Profile
                </button>
              </div>
           </div>
        </div>

      </div>

    </div>
  );
};

export default Story;
