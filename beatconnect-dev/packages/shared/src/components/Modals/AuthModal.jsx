import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const AuthModal = ({ isOpen, onClose, onSuccess }) => {
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: ''
  });

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!isLogin && formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      if (isLogin) {
        const res = await login(formData.username, formData.password);
        if (res.success) {
          onClose();
          if (onSuccess) onSuccess();
        } else {
          setError(res.error);
        }
      } else {
        const res = await register(formData.username, formData.password);
        if (res.success) {
          // Auto-login after registration
          const loginRes = await login(formData.username, formData.password);
          if (loginRes.success) {
            onClose();
            if (onSuccess) onSuccess();
          }
        } else {
          setError(res.error);
        }
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/95 backdrop-blur-3xl transition-opacity animate-fade-in" 
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-md bg-[#0a0a0f]/95 backdrop-blur-3xl border border-white/10 rounded-[32px] overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.8)] animate-scale-up">
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

          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium animate-shake">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/40 ml-1">Username</label>
              <div className="relative group">
                <input 
                  type="text"
                  required
                  autoComplete="username"
                  className="w-full bg-white/10 border border-white/15 rounded-2xl px-5 py-4 text-white text-sm outline-none transition-all focus:border-primary/50 focus:bg-white/[0.15] placeholder:text-white/20"
                  placeholder="Enter your username"
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
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
                  autoComplete={isLogin ? "current-password" : "new-password"}
                  className="w-full bg-white/10 border border-white/15 rounded-2xl px-5 py-4 text-white text-sm outline-none transition-all focus:border-primary/50 focus:bg-white/[0.15] placeholder:text-white/20"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
              </div>
            </div>

            {!isLogin && (
              <div className="space-y-2">
                <label className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/40 ml-1">Confirm Password</label>
                <div className="relative group">
                  <input 
                    type="password"
                    required
                    autoComplete="new-password"
                    className="w-full bg-white/10 border border-white/15 rounded-2xl px-5 py-4 text-white text-sm outline-none transition-all focus:border-primary/50 focus:bg-white/[0.15] placeholder:text-white/20"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                  />
                </div>
              </div>
            )}

            <button 
              type="submit"
              disabled={loading}
              className={`w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-2xl shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98] mt-4 uppercase tracking-widest text-xs flex items-center justify-center gap-2 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  Transmitting...
                </>
              ) : (
                isLogin ? 'Login to Portal' : 'Create My Account'
              )}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-white/5">
            <p className="text-center text-white/40 text-xs tracking-wide">
              {isLogin ? "Don't have an account?" : "Already a member?"}{' '}
              <button 
                onClick={() => {
                   setIsLogin(!isLogin);
                   setError('');
                }}
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

