import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import useScrollReveal from '@shared/hooks/useScrollReveal';

/* ── Artist cards shown in the rotating marquee strip ── */
const ARTISTS = [
  'Queen', 'Nirvana', 'Pink Floyd', 'Led Zeppelin',
  'The Beatles', 'Metallica', 'Oasis', 'AC/DC',
  'Guns N\' Roses', 'The Who', 'Radiohead', 'U2',
];

/* ── Single stat pill ── */
const Stat = ({ value, label }) => (
  <div className="flex flex-col items-center gap-1">
    <span className="text-3xl md:text-4xl font-display font-black text-white tracking-tight">{value}</span>
    <span className="text-white/40 text-xs font-mono uppercase tracking-widest">{label}</span>
  </div>
);

const Landing = () => {
  const pageRef = useRef(null);
  const bgRef = useRef(null);
  const [parallaxY, setParallaxY] = useState(0);
  useScrollReveal(pageRef);

  // Parallax on hero bg
  useEffect(() => {
    const onScroll = () => setParallaxY(window.scrollY * 0.35);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div ref={pageRef} className="relative bg-[#05050a] font-sans overflow-x-hidden">

      {/* ════════════════════════════════
          SECTION 1 — FULL-SCREEN HERO
      ════════════════════════════════ */}
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">

        {/* Parallax background image */}
        <div
          ref={bgRef}
          className="absolute inset-0 bg-cover bg-center pointer-events-none"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1493225457224-ca8e6b1853d9?q=80&w=2000&auto=format&fit=crop')",
            transform: `translateY(${parallaxY}px) scale(1.12)`,
            filter: 'brightness(0.28) saturate(1.4)',
          }}
        />

        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#05050a]/50 via-transparent to-[#05050a]" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#05050a]/60 via-transparent to-[#05050a]/60" />

        {/* Floating ambient orbs */}
        <div className="absolute top-1/4 left-1/5 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[140px] pointer-events-none animate-[float_10s_ease-in-out_infinite_alternate]" />
        <div className="absolute bottom-1/4 right-1/5 w-[400px] h-[400px] bg-secondary/15 rounded-full blur-[120px] pointer-events-none animate-[float_14s_ease-in-out_infinite_alternate-reverse]" />


        {/* Hero copy */}
        <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-5xl mx-auto">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-mono uppercase tracking-widest mb-8 relative left-6" data-reveal="up">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            Explore the Legends of Music
          </span>

          <h1 className="font-display font-black italic uppercase tracking-tight leading-[0.9] text-white drop-shadow-2xl m-0" data-reveal="up" data-reveal-delay="100"
            style={{ 
              fontSize: 'clamp(4rem, 14vw, 11rem)',
              transform: 'translateX(0.01em)' 
            }}>
            Beat<br />
            <span className="inline-block bg-gradient-to-r from-primary via-purple-400 to-secondary bg-clip-text text-transparent pr-[0.3em] -mr-[0.3em]">Connect</span>
          </h1>

          <p className="mt-8 text-white/55 text-lg md:text-xl max-w-2xl leading-relaxed" data-reveal="up" data-reveal-delay="200">
            The world's most immersive music encyclopedia — powered by AI, driven by passion.
            Discover the stories behind the greatest artists ever to walk the earth.
          </p>

          <div className="mt-12 flex justify-center" data-reveal="up" data-reveal-delay="300">
            <Link to="/home"
              className="group relative px-12 py-4 rounded-full bg-primary text-white font-bold text-base uppercase tracking-widest no-underline overflow-hidden transition-all duration-300 hover:shadow-[0_0_50px_rgba(236,72,153,0.5)] hover:-translate-y-1 btn-pulse">
              <span className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              Step Inside
            </Link>
          </div>

          {/* Stats row */}
          <div className="mt-20 flex items-center gap-10 md:gap-16" data-reveal="up" data-reveal-delay="400">
            <Stat value="50+" label="Artists" />
            <div className="w-px h-10 bg-white/10" />
            <Stat value="AI" label="Powered" />
            <div className="w-px h-10 bg-white/10" />
            <Stat value="∞" label="Discovery" />
          </div>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-40">
          <span className="text-white text-[10px] font-mono uppercase tracking-[0.3em]">Scroll</span>
          <div className="w-px h-10 bg-gradient-to-b from-white/60 to-transparent animate-[float_2s_ease-in-out_infinite]" />
        </div>
      </section>

      {/* ════════════════════════════════
          SECTION 2 — ARTIST MARQUEE
      ════════════════════════════════ */}
      <section className="relative py-4 overflow-hidden border-y border-white/[0.06]">
        <div className="flex gap-12 items-center"
          style={{ animation: 'marquee-scroll 30s linear infinite', width: 'max-content' }}>
          {[...ARTISTS, ...ARTISTS].map((a, i) => (
            <div key={i} className="flex items-center gap-3 shrink-0 cursor-default">
              <span className="w-1.5 h-1.5 rounded-full bg-primary/30" />
              <span className="text-white/20 text-sm font-mono uppercase tracking-widest whitespace-nowrap">
                {a}
              </span>
            </div>
          ))}
        </div>
        <style>{`
          @keyframes marquee-scroll {
            from { transform: translateX(0); }
            to   { transform: translateX(-50%); }
          }
        `}</style>
      </section>

      {/* ════════════════════════════════
          SECTION 3 — FEATURE CARDS
      ════════════════════════════════ */}
      <section className="relative py-32 px-6 md:px-20">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-primary/5 rounded-full blur-[120px]" />
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          {/* Section label */}
          <div className="mb-16 flex flex-col items-center text-center gap-4" data-reveal="up">
            <span className="text-primary font-mono text-xs uppercase tracking-[0.3em]">What we offer</span>
            <h2 className="font-display font-black italic text-white text-5xl md:text-7xl tracking-tighter m-0">
              Your Gateway<br /><span className="text-white/25">to Music History</span>
            </h2>
          </div>

          {/* 3-column feature grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

            {/* Artist Profiles */}
            <div className="group relative rounded-[28px] border border-white/8 bg-white/[0.03] backdrop-blur-xl p-8 overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:border-primary/30 hover:shadow-[0_20px_60px_rgba(236,72,153,0.15)]"
              data-reveal="up" data-reveal-delay="100">
              <div className="absolute inset-0 bg-cover bg-center opacity-10 transition-all duration-700 group-hover:opacity-20 group-hover:scale-105"
                style={{ backgroundImage: "url('/backgrounds/queen.jpg')" }} />
              <div className="absolute inset-0 bg-gradient-to-t from-[#05050a] via-[#05050a]/80 to-transparent" />
              <div className="relative z-10 flex flex-col h-full min-h-[260px] justify-between">
                <div className="w-14 h-14 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform duration-300">🎸</div>
                <div>
                  <h3 className="text-white font-display font-bold text-2xl italic tracking-tight m-0 mb-2">Artist Profiles</h3>
                  <p className="text-white/45 text-sm leading-relaxed m-0">Deep-dive wiki pages for legendary bands — members, albums, tours & more.</p>
                </div>
              </div>
            </div>

            {/* AI Daily Dispatch — tall center card */}
            <div className="group relative rounded-[28px] border border-primary/20 bg-gradient-to-b from-primary/10 to-black/40 backdrop-blur-xl p-8 overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:border-primary/50 hover:shadow-[0_30px_80px_rgba(236,72,153,0.2)] md:row-span-1"
              data-reveal="up" data-reveal-delay="200">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
              <div className="relative z-10 flex flex-col min-h-[260px] justify-between">
                <div className="w-14 h-14 rounded-2xl bg-primary/30 border border-primary/40 flex items-center justify-center text-2xl mb-6 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">📻</div>
                <div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/20 border border-primary/30 text-primary text-[10px] font-mono uppercase tracking-widest mb-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />AI-Written
                  </span>
                  <h3 className="text-white font-display font-bold text-2xl italic tracking-tight m-0 mb-2">Daily Dispatch</h3>
                  <p className="text-white/45 text-sm leading-relaxed m-0">A fresh AI-generated music history brief delivered every day.</p>
                </div>
              </div>
            </div>

            {/* Genres */}
            <div className="group relative rounded-[28px] border border-white/8 bg-white/[0.03] backdrop-blur-xl p-8 overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:border-secondary/30 hover:shadow-[0_20px_60px_rgba(6,182,212,0.12)]"
              data-reveal="up" data-reveal-delay="300">
              <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-secondary/10 rounded-full blur-[60px] pointer-events-none group-hover:bg-secondary/20 transition-colors duration-500" />
              <div className="relative z-10 flex flex-col min-h-[260px] justify-between">
                <div className="w-14 h-14 rounded-2xl bg-secondary/20 border border-secondary/30 flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform duration-300">🎭</div>
                <div>
                  <h3 className="text-white font-display font-bold text-2xl italic tracking-tight m-0 mb-2">Music Genres</h3>
                  <p className="text-white/45 text-sm leading-relaxed m-0">From classic rock to punk — explore every sub-genre and its lineage.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════
          SECTION 4 — FULL-WIDTH CTA
      ════════════════════════════════ */}
      <section className="relative py-32 px-6 overflow-hidden" data-reveal="scale">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-purple-500/10 to-secondary/10" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[200px] bg-primary/15 rounded-full blur-[100px]" />
        </div>
        <div className="relative z-10 max-w-3xl mx-auto text-center flex flex-col items-center gap-8">
          <h2 className="font-display font-black italic uppercase text-white tracking-tight m-0"
            style={{ fontSize: 'clamp(2.5rem, 7vw, 5.5rem)' }}>
            Ready to<br /><span className="inline-block bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent pr-[0.2em] -mr-[0.2em]">dive in?</span>
          </h2>
          <p className="text-white/45 text-lg max-w-xl">Join thousands of music lovers exploring history, culture, and sound.</p>
          <Link to="/home"
            className="group relative px-12 py-5 rounded-full bg-gradient-to-r from-primary to-purple-500 text-white font-bold text-base uppercase tracking-widest no-underline overflow-hidden transition-all duration-300 hover:shadow-[0_0_70px_rgba(236,72,153,0.6)] hover:-translate-y-1 hover:scale-105">
            <span className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            Enter BeatConnect
          </Link>
        </div>
      </section>

      {/* ════════════════════════════════
          FOOTER
      ════════════════════════════════ */}
      <footer className="border-t border-white/[0.06] py-8 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold no-underline text-white">Beat<span className="text-primary">Connect</span></Link>
          <span className="text-white/20 text-xs font-mono">© {new Date().getFullYear()} BeatConnect</span>
        </div>
      </footer>

    </div>
  );
};

export default Landing;
