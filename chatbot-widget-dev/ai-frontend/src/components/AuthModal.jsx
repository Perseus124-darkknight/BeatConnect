// ai-frontend/src/components/AuthModal.jsx
import React, { useState } from 'react';

const AuthModal = ({ isOpen, onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(isLogin ? "Logging in..." : "Signing up...", formData);
    // Placeholder for actual auth logic
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-xl transition-opacity animate-fadeInFast" 
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-md bg-[#0a0a0f]/80 backdrop-blur-3xl border border-white/10 rounded-[32px] overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.8)] animate-modalSlideIn">
        {/* Glow Effects */}
        <div className="absolute top-0 left-1/4 w-1/2 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-primary/20 blur-[100px] rounded-full" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-secondary/10 blur-[100px] rounded-full" />
        
        <div className="p-8 sm:p-10 relative z-10">
          <div className="flex flex-col items-center mb-10">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-primary to-secondary p-[1px] mb-6 shadow-lg shadow-primary/20">
              <div className="w-full h-full rounded-2xl bg-[#0a0a0f] flex items-center justify-center text-2xl">
                {isLogin ? '🎧' : '✨'}
              </div>
            </div>
            <h2 className="text-3xl font-bold text-white tracking-tight mb-2">
              {isLogin ? 'Welcome Back' : 'Join the Rhythm'}
            </h2>
            <p className="text-white/40 text-sm font-medium tracking-wide">
              {isLogin ? 'Enter your credentials to continue' : 'Create your account to start exploring'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div className="space-y-2">
                <label className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/40 ml-1">Full Name</label>
                <div className="relative group">
                  <input 
                    type="text"
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white text-sm outline-none transition-all focus:border-primary/50 focus:bg-white/10 placeholder:text-white/10"
                    placeholder="Enter your name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/40 ml-1">Email Address</label>
              <div className="relative group">
                <input 
                  type="email"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white text-sm outline-none transition-all focus:border-primary/50 focus:bg-white/10 placeholder:text-white/10"
                  placeholder="beat@connect.bot"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/40">Password</label>
                {isLogin && <button type="button" className="text-[10px] text-primary/60 hover:text-primary transition-colors font-mono uppercase tracking-widest">Forgot?</button>}
              </div>
              <div className="relative group">
                <input 
                  type="password"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white text-sm outline-none transition-all focus:border-primary/50 focus:bg-white/10 placeholder:text-white/10"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
              </div>
            </div>

            <button 
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-2xl shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98] mt-4 uppercase tracking-widest text-xs"
            >
              {isLogin ? 'Login to Portal' : 'Create My Account'}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-white/5">
            <p className="text-center text-white/40 text-xs tracking-wide">
              {isLogin ? "Don't have an account?" : "Already a member?"}{' '}
              <button 
                onClick={() => setIsLogin(!isLogin)}
                className="text-primary font-bold hover:underline transition-all"
              >
                {isLogin ? 'Sign Up' : 'Log In'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
