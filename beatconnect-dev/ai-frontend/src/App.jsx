import React, { useEffect, useState } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@shared/context/AuthContext';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Home from './pages/Home';
import DailyDispatch from './pages/DailyDispatch';
import Artist from './pages/Artist';
import Genre from './pages/Genre';
import User from './pages/User';
import ToastProvider from '@shared/components/ToastProvider';
import AuthModal from '@shared/components/Modals/AuthModal';
import BeatBot from './components/Chat/BeatBot';
import Story from './pages/Story';



const ProtectedUserRoute = () => {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      setShowAuthModal(true);
    }
  }, [loading, isAuthenticated]);

  if (loading) return null;

  if (!isAuthenticated) {
    return (
      <>
        <div className="fixed inset-0 flex flex-col items-center justify-center gap-6 z-10">
          <div className="text-6xl">🔐</div>
          <h2 className="text-white font-display font-black text-3xl italic tracking-tight">User Dashboard</h2>
          <p className="text-white/40 font-mono text-sm uppercase tracking-widest">Please log in to access your profile</p>
          <button
            onClick={() => setShowAuthModal(true)}
            className="mt-4 px-10 py-4 rounded-full bg-primary text-white font-bold text-xs uppercase tracking-widest hover:bg-primary/90 transition-all shadow-lg shadow-primary/30"
          >
            Log In
          </button>
        </div>
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => { setShowAuthModal(false); navigate('/home'); }}
          onSuccess={() => setShowAuthModal(false)}
        />
      </>
    );
  }

  return <User />;
};

const App = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isLanding = location.pathname === '/';
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    document.body.classList.add('loaded');
    
    const params = new URLSearchParams(location.search);
  }, [location]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <AuthProvider>
      {!isLanding && <Navbar />}
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/home" element={<Home />} />
        <Route path="/dispatch" element={<DailyDispatch />} />
        <Route path="/story" element={<Story />} />
        <Route path="/artist" element={<Artist />} />
        <Route path="/genre" element={<Genre />} />
        <Route path="/user" element={<ProtectedUserRoute />} />
      </Routes>
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
        onSuccess={() => setShowAuthModal(false)}
      />
      {!isLanding && <ToastProvider />}
      {!isLanding && <BeatBot />}
    </AuthProvider>
  );
};

export default App;
