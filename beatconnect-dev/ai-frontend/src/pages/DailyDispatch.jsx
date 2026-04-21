import React, { useState, useEffect, Fragment, useRef } from 'react';
import { fetchDailyReport } from '@shared/services/api';
import { dispatchStories } from '../data/dispatchStories';
import { Link } from 'react-router-dom';

const FadeInSection = ({ children, delay = 0 }) => {
  const [isVisible, setIsVisible] = useState(false);
  const domRef = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        observer.unobserve(entry.target);
      }
    }, { threshold: 0.1, rootMargin: '50px' });
    
    if (domRef.current) observer.observe(domRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={domRef}
      className={`transition-all duration-1000 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16'}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

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

const MagazineCard = ({ artist, index }) => {
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        observer.unobserve(entry.target);
      }
    }, { threshold: 0.05, rootMargin: '100px' });
    
    if (cardRef.current) observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, []);

  // Asymmetric spanning logic for brutalist editorial layout
  const isLarge = index === 0 || index === 7 || index === 14 || index === 21; 
  const isWide = index === 3 || index === 11 || index === 18;
  const bgColors = ['bg-[#EC4899]', 'bg-[#white]', 'bg-[#1a1a1a]', 'bg-[#06b6d4]'];
  const bg = bgColors[index % 4];
  const textColor = (index % 4 === 1) ? 'text-black' : 'text-white';
  const overlayStyle = (index % 4 === 1) ? 'bg-white/95' : 'bg-black/95';

  const image = getArtistLocalImage(artist);

  return (
    <Link 
      ref={cardRef}
      to={`/story?artist=${encodeURIComponent(artist)}`} 
      className={`group relative flex flex-col justify-end overflow-hidden border-[8px] border-[#0a0a0f] hover:border-primary transition-all duration-[600ms] ease-out no-underline ${isLarge ? 'md:col-span-2 md:row-span-2 min-h-[450px]' : isWide ? 'md:col-span-2 col-span-1 min-h-[300px]' : 'col-span-1 min-h-[300px]'} ${bg} ${textColor} ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-24 scale-95'}`}
      style={{ transitionDelay: `${(index % 4) * 100}ms` }}
    >
       {/* Background Image that colorizes on hover */}
       <div 
         className="absolute inset-0 bg-cover bg-center grayscale opacity-50 mix-blend-luminosity group-hover:scale-110 group-hover:grayscale-0 group-hover:opacity-100 group-hover:mix-blend-normal transition-all duration-700 ease-in-out" 
         style={{ backgroundImage: `url(${image})` }} 
       />
       
       {/* Slide-Up Hover Overlay */}
       <div className={`absolute inset-x-0 bottom-0 p-6 ${overlayStyle} translate-y-[101%] group-hover:translate-y-0 transition-transform duration-500 ease-in-out z-10 border-t-[6px] border-primary flex flex-col justify-between min-h-[50%]`}>
         <div>
           <div className="inline-block bg-primary text-white font-mono text-[10px] px-3 py-1.5 uppercase tracking-[0.2em] font-bold shadow-[4px_4px_0_#000] mb-4">
             Read Story
           </div>
           <h4 className="font-display font-black text-3xl md:text-4xl uppercase tracking-tighter leading-none m-0 italic drop-shadow-md">
             {artist}
           </h4>
         </div>
         <p className="font-mono text-xs uppercase tracking-widest mt-4 mb-0 opacity-60">Complete Profile &rarr;</p>
       </div>

       {/* Default Text when not hovered */}
       <div className={`absolute inset-0 p-6 flex flex-col justify-between pointer-events-none transition-opacity duration-300 group-hover:opacity-0 ${index % 4 === 1 ? 'bg-white/30' : 'bg-black/30'}`}>
          <span className="font-mono text-[12px] uppercase font-bold tracking-[0.4em] opacity-80 mix-blend-difference text-white">NO. {String(index + 1).padStart(2, '0')}</span>
          <h4 className="font-display font-black text-4xl lg:text-5xl uppercase tracking-tighter leading-[0.8] drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)] flex flex-wrap">
            {artist}
          </h4>
       </div>
    </Link>
  );
};

const DailyDispatch = () => {
  const [report, setReport] = useState(null);
  const [artists, setArtists] = useState([]);
  const [loadingReport, setLoadingReport] = useState(true);

  useEffect(() => {
    // Populate the 23 statically defined directory artists
    setArtists(dispatchStories.map(s => s.name));

    const load = async () => {
      try {
        const data = await fetchDailyReport().catch(() => null);

        if (data?.front_page_content && typeof data.front_page_content === 'string' && data.front_page_content.trim().startsWith('{')) {
          try {
            const sanitized = data.front_page_content.replace(/\r?\n/g, '\\n');
            let parsed;
            try {
              parsed = JSON.parse(sanitized);
            } catch (innerErr) {
              const titleMatch = sanitized.match(/"title"\s*:\s*"([\s\S]*?)"\s*,/);
              const contentMatch = sanitized.match(/"content"\s*:\s*"([\s\S]*?)"\s*}/) || sanitized.match(/"content"\s*:\s*"([\s\S]*)/);
              if (titleMatch || contentMatch) {
                let content = contentMatch ? contentMatch[1].trim() : sanitized;
                if (content.endsWith('}')) content = content.substring(0, content.length - 1).trim();
                if (content.endsWith('"')) content = content.substring(0, content.length - 1).trim();
                parsed = { title: titleMatch ? titleMatch[1] : "News Update", content: content };
              }
            }

            if (parsed?.content) {
              let content = typeof parsed.content === 'string' ? parsed.content.trim() : JSON.stringify(parsed.content);
              content = content.replace(/\\n/g, '\n').replace(/\\"/g, '"');
              if (content.startsWith('# ')) {
                const firstNewline = content.indexOf('\n');
                if (firstNewline !== -1) content = content.substring(firstNewline).trim();
              }
              data.front_page_content = content;
            }
          } catch (e) { console.error("Failed to parse JSON content:", e); }
        }
        setReport(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingReport(false);
      }
    };
    load();
  }, []);

  return (
    <div className="relative bg-[#0a0a0f] font-sans pt-32 pb-24 overflow-hidden text-[#e0e0e0] selection:bg-white selection:text-black min-h-screen">
       <section className="relative w-full px-4 md:px-12">
          
          {/* Header */}
          <div className="flex justify-between items-end border-b-8 border-white pb-6 mb-16 px-4">
             <h2 className="font-display text-6xl md:text-[140px] font-black tracking-tighter uppercase m-0 leading-[0.8] text-white">Daily<br/><span className="text-white/40">Dispatch</span></h2>
             <span className="font-mono text-lg md:text-2xl uppercase tracking-[0.3em] text-primary font-bold">Vol. 1</span>
          </div>

          {/* AI Reporting Section */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-24 relative z-10 w-full mb-32 px-4">
             {loadingReport ? (
               <div className="col-span-12 font-mono text-xl uppercase tracking-widest animate-pulse border-4 border-white p-12 text-center shadow-[10px_10px_0_#fff]">Retrieving Editorial...</div>
             ) : report ? (
               <>
                 {/* Main Article */}
                 <article className="col-span-1 md:col-span-8 flex flex-col gap-10 relative md:border-r-[8px] border-white/20 md:pr-20">
                   <FadeInSection delay={0}>
                     <span className="absolute -top-16 -left-8 text-[180px] font-display font-black text-white/[0.04] select-none pointer-events-none leading-none z-0">01</span>
                     <h3 className="font-serif text-5xl md:text-8xl italic font-medium leading-[1.05] text-white mb-2 relative z-10 drop-shadow-lg">{report.front_page_title}</h3>
                     <div className="w-32 h-[8px] bg-primary mb-6 relative z-10 shadow-[4px_4px_0_#fff]" />
                     
                     <div className="font-sans text-[22px] leading-[1.8] text-[#c0c0c0] font-light md:columns-2 gap-16 text-justify relative z-10">
                       {report.front_page_content.split(/\n\n|\\n\\n/).filter(p => p.trim()).map((para, i) => (
                         <p key={i} className="m-0 mb-8 break-inside-avoid">
                           {para.split(/\n|\\n/).map((line, j, arr) => (
                             <Fragment key={j}>{line}{j < arr.length - 1 && <br />}</Fragment>
                           ))}
                         </p>
                       ))}
                     </div>
                   </FadeInSection>
                 </article>
                 
                 {/* Secondary Article */}
                 <article className="col-span-1 md:col-span-4 flex flex-col gap-6 relative">
                   <FadeInSection delay={300}>
                     <span className="absolute -top-12 -left-4 text-[140px] font-display font-black text-white/[0.04] select-none pointer-events-none leading-none z-0">02</span>
                     <div>
                       <span className="font-mono text-xs uppercase tracking-[0.2em] text-black bg-white px-4 py-2 font-bold inline-block relative z-10 mb-6 shadow-[6px_6px_0_#EC4899]">Archive Focus</span>
                       <h3 className="font-serif text-4xl md:text-5xl italic leading-[1.2] text-white/90 m-0 relative z-10">{report.history_title}</h3>
                     </div>
                     <div className="w-20 h-2 bg-secondary relative z-10 mt-2 hover:w-full transition-all duration-[1s]" />
                     
                     <div className="font-mono text-[15px] leading-[2.2] text-[#808080] space-y-6 text-justify relative z-10 mt-6">
                       {report.history_content.split(/\n\n|\\n\\n/).filter(p => p.trim()).map((para, i) => (
                         <p key={i} className="m-0">
                           {para.split(/\n|\\n/).map((line, j, arr) => (
                             <Fragment key={j}>{line}{j < arr.length - 1 && <br />}</Fragment>
                           ))}
                         </p>
                       ))}
                     </div>
                   </FadeInSection>
                 </article>
               </>
             ) : (
               <div className="col-span-12 border-4 border-primary text-primary p-12 font-mono text-3xl uppercase tracking-widest font-bold text-center">Feed Offline</div>
             )}
          </div>

          {/* 23 Cards Magazine Feature Grid */}
          <div className="w-full relative z-10" id="artist-directory">
            <FadeInSection delay={0}>
              <div className="flex items-center gap-6 mb-12 px-4">
                <h3 className="font-display font-black text-5xl md:text-8xl uppercase tracking-tighter italic m-0 text-white">The <span className="text-white/30">Directory</span></h3>
                <div className="flex-1 h-2 bg-white/20 mt-4"></div>
              </div>
            </FadeInSection>
            
            {artists.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-0 w-full auto-rows-[300px]">
                {artists.map((artist, idx) => (
                  <MagazineCard key={artist} artist={artist} index={idx} />
                ))}
              </div>
            ) : (
              <div className="w-full border-4 border-white/20 p-20 text-center font-mono text-white/50 uppercase tracking-widest">
                Loading Directory Protocols...
              </div>
            )}
          </div>
          
       </section>
    </div>
  );
};

export default DailyDispatch;
