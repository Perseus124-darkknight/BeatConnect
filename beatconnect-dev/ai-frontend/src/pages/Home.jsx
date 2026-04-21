import React, { useState, useEffect, useRef, Fragment } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useScrollReveal from '@shared/hooks/useScrollReveal';
import { useAuth } from '@shared/context/AuthContext';
import AuthModal from '@shared/components/Modals/AuthModal';

const baseBarcode = "||| | ||||| || |||||| | |||| ||".split('');

const Home = () => {
  const [parallaxY, setParallaxY] = useState(0);
  const [isAdminAuthOpen, setIsAdminAuthOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [barcode, setBarcode] = useState(baseBarcode.join(''));
  const pageRef = useRef(null);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  useScrollReveal(pageRef, []);

  useEffect(() => {
    const handleScroll = () => setParallaxY(window.scrollY * 0.2);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setBarcode(baseBarcode.map(char => Math.random() > 0.85 ? (char === '|' ? ' ' : '|') : char).join(''));
    }, 100);
    return () => clearInterval(interval);
  }, []);
  return (
    <>
      <div ref={pageRef} className="relative bg-[#030305] font-sans pb-0 pt-0 overflow-hidden text-[#e0e0e0] selection:bg-white selection:text-black">

        {/* Text Glitch CSS */}
        <style dangerouslySetInnerHTML={{
          __html: `
          @keyframes glitch-anim-1 {
            0% { clip-path: inset(20% 0 80% 0); transform: translate(-2px, 1px); }
            20% { clip-path: inset(60% 0 10% 0); transform: translate(2px, -1px); }
            40% { clip-path: inset(40% 0 50% 0); transform: translate(-2px, 2px); }
            60% { clip-path: inset(80% 0 5% 0); transform: translate(2px, -2px); }
            80% { clip-path: inset(10% 0 70% 0); transform: translate(-1px, 2px); }
            100% { clip-path: inset(30% 0 50% 0); transform: translate(1px, -1px); }
          }
          @keyframes glitch-anim-2 {
            0% { clip-path: inset(10% 0 60% 0); transform: translate(2px, -1px); }
            20% { clip-path: inset(80% 0 5% 0); transform: translate(-2px, 1px); }
            40% { clip-path: inset(30% 0 50% 0); transform: translate(2px, -2px); }
            60% { clip-path: inset(20% 0 80% 0); transform: translate(-2px, 2px); }
            80% { clip-path: inset(60% 0 10% 0); transform: translate(1px, -2px); }
            100% { clip-path: inset(40% 0 50% 0); transform: translate(-1px, 1px); }
          }
          .glitch-text {
            position: relative;
            display: inline-block;
          }
          .glitch-text::before, .glitch-text::after {
            content: attr(data-text);
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            opacity: 0.8;
          }
          .glitch-text::before {
            left: 3px;
            text-shadow: -2px 0 #0ff;
            animation: glitch-anim-1 2s infinite linear alternate-reverse;
          }
          .glitch-text::after {
            left: -3px;
            text-shadow: -2px 0 #f0f;
            animation: glitch-anim-2 3s infinite linear alternate-reverse;
          }
          
          /* Magazine Reveal Animations */
          [data-reveal] { opacity: 0; transform: translateY(60px); transition: all 1s cubic-bezier(0.19, 1, 0.22, 1); }
          [data-reveal].is-visible { opacity: 1; transform: translateY(0); }
          
          [data-reveal].reveal-left { transform: translateX(-80px); }
          [data-reveal].is-visible.reveal-left { transform: translateX(0); }
          
          [data-reveal].reveal-right { transform: translateX(80px); }
          [data-reveal].is-visible.reveal-right { transform: translateX(0); }
          
          [data-reveal].reveal-scale { transform: scale(0.9); }
          [data-reveal].is-visible.reveal-scale { transform: scale(1); }

          [data-reveal].reveal-clip { opacity: 1; transform: none; clip-path: inset(100% 0 0 0); }
          [data-reveal].is-visible.reveal-clip { clip-path: inset(0 0 0 0); }
          
          .delay-100 { transition-delay: 100ms; }
          .delay-200 { transition-delay: 200ms; }
          .delay-300 { transition-delay: 300ms; }
          .glitch-text::after {
            left: -3px;
            text-shadow: -2px 0 #f0f;
            animation: glitch-anim-2 3s infinite linear alternate-reverse;
          }
        `}} />

        {/* Section 1: The Typographic Hero Breakout */}
        <section className="relative w-full h-[110vh] flex flex-col justify-center px-4 md:px-12 border-b-8 border-white overflow-hidden">
          {/* Magazine Spine */}
          <div className="absolute left-6 top-1/2 -translate-y-1/2 -rotate-90 origin-left hidden md:flex items-center gap-4 z-20">
            <div className="w-16 h-1 bg-primary"></div>
            <span className="font-mono text-sm uppercase tracking-[0.5em] text-white whitespace-nowrap">Vibe Together</span>
          </div>

          <div className="relative z-10 -ml-2 md:ml-16 mt-20 flex flex-col pointer-events-none reveal-left" data-reveal>
            <h1
              className="font-display text-[23vw] md:text-[20vw] leading-[0.75] font-black uppercase tracking-tighter text-transparent glitch-text w-max"
              style={{ WebkitTextStroke: '3px white' }}
              data-text="BEAT"
            >
              BEAT
            </h1>
            <h1
              className="font-display text-[13.5vw] md:text-[12vw] leading-[0.75] font-black uppercase tracking-tighter text-white drop-shadow-[5px_5px_0px_#EC4899] md:drop-shadow-[15px_15px_0px_#EC4899] mix-blend-normal mt-2 md:-mt-4 glitch-text w-max"
              data-text="CONNECT"
            >
              CONNECT
            </h1>
          </div>

          <div className="absolute bottom-12 right-12 text-right z-20 reveal-up delay-200" data-reveal>
            <span className="font-serif italic text-3xl md:text-5xl text-white block">Vol. 1</span>
            <span className="font-mono text-xs uppercase tracking-widest text-primary block mt-2 animate-pulse">Est. 2026 // Global Net</span>
          </div>
        </section>

        {/* Section 2: Dispatch Portal */}
        <section className="relative w-full min-h-[60vh] flex flex-col lg:flex-row border-b-[12px] border-white bg-white text-black overflow-hidden">
          <div className="w-full lg:w-[60%] flex flex-col justify-center py-24 px-6 md:px-16 border-b-8 lg:border-b-0 lg:border-r-[12px] border-black reveal-left" data-reveal>
            <h2 className="font-display text-[15vw] lg:text-[140px] font-black uppercase tracking-tighter leading-[0.8] mb-8 text-black">
              Daily<br />Dispatch
            </h2>
            <div className="w-24 h-2 bg-primary mb-8" />
            <p className="font-serif text-2xl md:text-3xl font-bold max-w-2xl mb-12 leading-relaxed text-black/80">
              AI-driven analysis and archival historical records of the artists powering the network. Updated continuously.
            </p>
            <Link to="/dispatch" className="w-max px-12 py-5 bg-black text-white font-black text-xl tracking-[0.2em] uppercase hover:bg-primary hover:text-white transition-colors duration-300 border-4 border-transparent hover:border-black shadow-[12px_12px_0px_#EC4899] no-underline">
              Read Latest
            </Link>
          </div>
          <div className="w-full lg:w-[40%] flex items-center justify-center relative overflow-hidden bg-[#030305] group py-32 lg:py-0 reveal-right delay-100" data-reveal>
            <div className="absolute inset-0 bg-[url('/backgrounds/therollingstones.jpg')] bg-cover bg-center opacity-40 grayscale transition-all duration-[2s] group-hover:scale-110 group-hover:grayscale-0 group-hover:opacity-70"></div>
            
            {!isAuthenticated && (
              <button 
                onClick={() => setIsAuthOpen(true)}
                className="relative z-10 px-8 py-4 bg-primary text-white font-black text-lg tracking-[0.2em] uppercase hover:bg-white hover:text-black transition-all duration-300 shadow-[8px_8px_0px_#000] border-4 border-transparent hover:border-black opacity-0 group-hover:opacity-100 translate-y-8 group-hover:translate-y-0"
              >
                Become a Member
              </button>
            )}
          </div>
        </section>

        {/* Section 2: Artist Cover Strip (Marquee) */}
        <section className="relative w-full min-h-[60vh] flex flex-col items-center justify-center overflow-hidden border-y-[12px] border-white group bg-primary">
          <div className="absolute inset-0 bg-cover bg-center mix-blend-multiply opacity-80 transition-transform duration-[3s] group-hover:scale-[1.03]" style={{ backgroundImage: "url('/backgrounds/nirvana.jpg')" }} />

          <div className="relative z-10 w-full overflow-hidden flex flex-col items-center gap-10 py-12 bg-[#05050a]/40 backdrop-blur-md border-y-[6px] border-white transform transition-transform group-hover:-rotate-1">
            {/* CSS Marquee */}
            <style dangerouslySetInnerHTML={{
              __html: `
                @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
                .animate-marquee { animation: marquee 15s linear infinite; white-space: nowrap; display: flex; }
              `}} />
            <div className="w-[120%] -ml-[10%] flex overflow-hidden transform">
              <div className="animate-marquee">
                {[...Array(6)].map((_, i) => (
                  <span key={i} className="font-display text-7xl md:text-[140px] font-black uppercase tracking-tighter text-transparent mr-8" style={{ WebkitTextStroke: '2px white' }}>
                    LEGENDARY DIRECTORY &nbsp;•&nbsp;
                  </span>
                ))}
              </div>
            </div>

            <Link to="/artist" className="px-14 py-5 bg-white text-black font-black text-xl tracking-[0.2em] uppercase hover:bg-black hover:text-white transition-colors duration-300 border-4 border-transparent hover:border-white shadow-[12px_12px_0px_#EC4899] no-underline">
              Enter Vault
            </Link>
          </div>
        </section>

        {/* Section 4: Raw Data Footer (Inverted Brutalism) */}
        <section id="about-us" className="relative w-full bg-white text-black py-24 px-6 md:px-12 xl:px-20 border-t-[12px] border-primary pb-32">
          <div className="flex flex-col lg:flex-row justify-between gap-16 w-full">

            <div className="flex flex-col gap-8 lg:w-3/5 xl:w-[65%] reveal-up" data-reveal>
              <h3 className="font-display text-[15vw] lg:text-[180px] font-black tracking-tighter uppercase m-0 leading-[0.8] text-black">
                Beat<br />Connect
              </h3>
              <div className="w-32 h-[8px] bg-black" />
              <p className="font-serif text-2xl md:text-3xl leading-snug font-bold max-w-3xl m-0 mt-4 text-justify text-black/90">
                The world's most advanced musical architecture. We use cutting-edge neural networks to track, analyze, and document the history of legendary artists from the 60s to today.
              </p>
            </div>

            <div className="flex flex-col gap-6 lg:w-2/5 xl:w-[35%] border-l-[6px] border-black pl-8 lg:pl-16 justify-center reveal-left delay-200" data-reveal>
              <h4 className="font-display text-5xl md:text-7xl font-black uppercase tracking-tighter m-0 leading-none mb-2">
                SOCIALS
              </h4>
              <div className="flex gap-4">
                <a href="https://facebook.com" target="_blank" rel="noreferrer" className="w-14 h-14 bg-black text-white flex items-center justify-center hover:bg-primary hover:-translate-y-1 transition-all rounded-none">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" /></svg>
                </a>
                <a href="https://instagram.com" target="_blank" rel="noreferrer" className="w-14 h-14 bg-black text-white flex items-center justify-center hover:bg-primary hover:-translate-y-1 transition-all rounded-none">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg>
                </a>
                <a href="https://twitter.com" target="_blank" rel="noreferrer" className="w-14 h-14 bg-black text-white flex items-center justify-center hover:bg-primary hover:-translate-y-1 transition-all rounded-none">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                </a>
              </div>
            </div>

          </div>

          <div className="w-full border-t-[6px] border-black mt-32 pt-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="font-mono text-sm uppercase tracking-[0.2em] font-black text-black scale-y-150 origin-left whitespace-pre">
              {barcode}
            </div>
            <div className="flex flex-col md:flex-row gap-4 md:gap-12">
              <span className="font-mono text-[11px] uppercase tracking-widest font-bold text-black/60">&copy; {new Date().getFullYear()} BeatConnect</span>
            </div>
          </div>
        </section>
      </div>

      <AuthModal
        isOpen={isAdminAuthOpen}
        onClose={() => setIsAdminAuthOpen(false)}
        onSuccess={() => { setIsAdminAuthOpen(false); navigate('/admin'); }}
      />
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={() => setIsAuthOpen(false)}
      />
    </>
  );
};

export default Home;
