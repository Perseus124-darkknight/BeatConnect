import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { fetchDailyReport } from '../services/api';
import useScrollReveal from '../hooks/useScrollReveal';

const Home = () => {
  const [report, setReport] = useState(null);
  const [loadingReport, setLoadingReport] = useState(true);
  const [parallaxY, setParallaxY] = useState(0);
  const pageRef = useRef(null);
  useScrollReveal(pageRef, [report]);

  useEffect(() => {
    const handleScroll = () => setParallaxY(window.scrollY * 0.2);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchDailyReport();
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
    <div ref={pageRef} className="relative min-h-screen font-sans pb-32 pt-20 overflow-hidden">
      {/* Background and Globs */}
      <div className="fixed inset-0 bg-cover bg-center opacity-40 -z-20 pointer-events-none"
        style={{ backgroundImage: "url('/rock.jpg')", transform: `translateY(${parallaxY}px) scale(1.1)` }} />
      <div className="fixed inset-0 bg-gradient-to-b from-[#05050a]/30 via-[#05050a]/60 to-[#05050a]/90 -z-10 pointer-events-none" />
      
      <div className="absolute top-[10%] left-[20%] w-[400px] h-[400px] bg-primary/30 rounded-full blur-[120px] animate-[float_10s_infinite_alternate] -z-10 pointer-events-none"></div>
      <div className="absolute bottom-[20%] right-[10%] w-[500px] h-[500px] bg-secondary/20 rounded-full blur-[140px] animate-[float_12s_infinite_alternate-reverse] -z-10 pointer-events-none"></div>
      
      <div className="max-w-[1200px] mx-auto px-6 relative z-10">
        
        {/* Premium Header */}
        <div className="text-center mb-20 animate-[fadeUp_1s_ease-out]">
          <span className="font-mono text-sm uppercase tracking-[4px] text-secondary mb-4 block font-bold">Immersive Experience</span>
          <h2 className="font-display text-6xl md:text-8xl font-bold italic uppercase tracking-tighter m-0 mb-4 text-white drop-shadow-2xl">
            Welcome to <span className="bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent drop-shadow-none">BeatConnect</span>
          </h2>
          <p className="text-white/60 max-w-2xl mx-auto font-sans text-xl">Navigate through the most comprehensive, intelligent music architecture in the world.</p>
        </div>
        
        {/* Daily Dispatch (Hero Card) */}
        <div className="mb-12 group relative w-full min-h-[300px] overflow-hidden rounded-[40px] border border-primary/30 bg-gradient-to-br from-[#1a0b1c]/80 to-black/60 backdrop-blur-2xl transition-all duration-700 hover:border-primary/60 hover:shadow-[0_0_80px_rgba(236,72,153,0.3)] p-8 md:p-14 flex flex-col justify-center mt-10" data-reveal="up" data-reveal-delay="100">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 pointer-events-none group-hover:bg-primary/30 transition-colors duration-1000"></div>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 relative z-10 gap-6">
            <div className="flex items-center gap-6">
              <div className="bg-primary/20 w-20 h-20 rounded-3xl flex items-center justify-center text-4xl border border-primary/40 shadow-[0_0_30px_rgba(236,72,153,0.2)] [transition:transform_0.8s] group-hover:scale-110 group-hover:rotate-6">
                📻
              </div>
              <div>
                <h3 className="text-white text-5xl md:text-6xl font-display font-black m-0 italic tracking-tighter drop-shadow-lg">Daily Dispatch</h3>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-black/40 backdrop-blur-md px-6 py-3 rounded-full border border-primary/20 shadow-inner">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
              </span>
              <span className="text-primary font-bold text-sm uppercase tracking-widest">Written by BeatBot</span>
            </div>
          </div>
          
          <div className="relative z-10">
            {loadingReport ? (
              <div className="text-white/50 animate-pulse flex items-center text-xl mt-4">Transmitting today's musical history module via Neural Web...</div>
            ) : report ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                <div className="col-span-1 md:col-span-2">
                  <h4 className="text-white text-4xl font-mono font-bold mb-6 leading-tight tracking-tight uppercase border-b border-primary/20 pb-4">{report.front_page_title}</h4>
                  <p className="text-white/80 font-mono text-lg leading-loose text-balance">{report.front_page_content}</p>
                </div>
                <div className="col-span-1 border-t md:border-t-0 md:border-l border-white/10 pt-6 md:pt-0 md:pl-10 flex flex-col justify-center">
                  <h4 className="text-secondary text-2xl font-mono font-bold mb-4 uppercase tracking-widest">{report.history_title}</h4>
                  <p className="text-white/70 font-mono text-base leading-relaxed">{report.history_content}</p>
                </div>
              </div>
            ) : (
              <div className="text-white/50 flex items-center text-xl mt-4">The BeatBot servers are currently resting. Check back tomorrow.</div>
            )}
          </div>
        </div>

        {/* Bento Box Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-[fadeUp_1.4s_ease-out_both]">
          
          {/* Artists Card (Hero Focus) */}
          <Link to="/artist" className="group relative col-span-1 md:col-span-2 min-h-[380px] overflow-hidden rounded-[32px] border border-white/10 bg-white/5 backdrop-blur-3xl transition-all duration-500 hover:-translate-y-2 hover:border-primary/40 hover:shadow-[0_25px_60px_rgba(236,72,153,0.25)] block no-underline focus:outline-none flex flex-col justify-end p-8 md:p-12 glow-hover" data-reveal="up" data-reveal-delay="100">
            <div className="absolute inset-0 bg-cover bg-center opacity-30 transition-transform duration-1000 ease-out group-hover:scale-105 group-hover:opacity-50" style={{ backgroundImage: "url('/backgrounds/nirvana.jpg')" }}></div>
            <div className="absolute inset-0 bg-gradient-to-t from-[#05050a] via-[#05050a]/60 to-transparent opacity-90 group-hover:opacity-80 transition-opacity duration-500"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end w-full gap-8">
              <div>
                <div className="bg-white/10 backdrop-blur-2xl w-20 h-20 rounded-3xl flex items-center justify-center text-5xl mb-6 border border-white/20 shadow-[0_8px_30px_rgba(0,0,0,0.12)] group-hover:scale-110 transition-transform duration-500">🎸</div>
                <h3 className="text-white text-6xl md:text-7xl font-display font-black m-0 mb-3 italic tracking-tighter shadow-black drop-shadow-xl">Artists Directory</h3>
                <p className="text-white/70 max-w-3xl font-sans text-2xl m-0 drop-shadow-lg leading-relaxed">Explore legendary bands, dive into musical subgenres, and discover the history shaped by individual artists from the 60s to today.</p>
              </div>
              
              <div className="mt-4 md:mt-0 flex-shrink-0 px-10 py-5 rounded-full bg-white/10 backdrop-blur-xl text-white font-bold text-base tracking-widest uppercase border border-white/20 group-hover:bg-primary group-hover:border-primary group-hover:shadow-[0_0_40px_rgba(236,72,153,0.5)] transition-all duration-500 flex items-center gap-3 self-start md:self-end">
                Explore
                <svg className="transform transition-transform duration-300 group-hover:translate-x-2" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
              </div>
            </div>
          </Link>
          
          {/* Admin Card */}
          <Link to="/admin" className="group relative col-span-1 overflow-hidden rounded-[32px] border border-white/5 bg-white/5 backdrop-blur-xl transition-all duration-500 hover:-translate-y-2 hover:border-primary/30 hover:bg-white/10 hover:shadow-[0_15px_40px_rgba(236,72,153,0.1)] flex flex-col items-start justify-between p-10 no-underline glow-hover" data-reveal="up" data-reveal-delay="200">
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent -translate-x-[100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out"></div>
            
            <div className="relative z-10 mb-8">
              <div className="bg-black/40 backdrop-blur-md w-20 h-20 rounded-full flex items-center justify-center text-4xl border border-white/10 shadow-inner [transition:transform_1s_ease-in-out] group-hover:rotate-180 mb-6">⚙️</div>
              <h3 className="text-white text-3xl font-display font-bold m-0 mb-3 italic tracking-tight">System Admin</h3>
              <p className="text-white/50 font-sans text-lg m-0">Manage the application's artist database and neural network content.</p>
            </div>
            
            <div className="relative z-10 w-full mt-auto">
              <div className="px-8 py-4 rounded-full bg-black/40 text-white/90 font-mono text-base uppercase tracking-widest border border-white/10 group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all duration-300 flex items-center justify-center gap-3 font-bold shadow-lg w-full">
                Access Panel
                <svg className="transform transition-transform duration-300 group-hover:rotate-45" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
              </div>
            </div>
          </Link>

          {/* About Us Card */}
          <div className="group relative col-span-1 overflow-hidden rounded-[32px] border border-white/5 bg-white/5 backdrop-blur-xl transition-all duration-500 hover:-translate-y-2 hover:border-secondary/40 hover:shadow-[0_20px_50px_rgba(6,182,212,0.15)] p-10 flex flex-col justify-between glow-hover" data-reveal="up" data-reveal-delay="300">
            <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-secondary/10 rounded-full blur-[60px] group-hover:bg-secondary/20 transition-colors duration-700 pointer-events-none"></div>
            <div className="relative z-10">
              <div className="bg-secondary/20 w-20 h-20 rounded-2xl flex items-center justify-center text-4xl mb-6 border border-secondary/30 shadow-lg [transition:transform_0.5s] group-hover:scale-110">
                👋
              </div>
              <h3 className="text-white text-3xl font-display font-bold m-0 mb-4 italic tracking-tight">About Us</h3>
              <p className="text-white/70 font-sans text-lg m-0 leading-relaxed">
                BeatConnect is the world's most advanced musical architecture. We use cutting-edge neural networks to track, analyze, and document the history of legendary artists.
              </p>
            </div>
          </div>
          
        </div>
        
        {/* Footer */}
        <div className="mt-20 pt-8 border-t border-white/10 flex flex-col items-center justify-center text-white/40 font-mono text-sm gap-2 animate-[fadeUp_1.6s_ease-out_both]">
          <span>&copy; {new Date().getFullYear()} BeatConnect. All rights reserved.</span>
          <span className="text-primary/60">Powered by Neural Networks</span>
        </div>
      </div>
    </div>
  );
};

export default Home;
