import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Home from './pages/Home';
import Artist from './pages/Artist';
import Genre from './pages/Genre';
import Admin from './pages/Admin';
import ToastProvider from './components/ToastProvider';

const App = () => {

  const location = useLocation();
  const isLanding = location.pathname === '/';

  useEffect(() => {
    document.body.classList.add('loaded');
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname, location.search]);

  useEffect(() => {
    if (isLanding) {
      document.body.classList.add('is-landing-page');
    } else {
      document.body.classList.remove('is-landing-page');
    }
  }, [isLanding]);

  return (
    <>
      {!isLanding && <Navbar />}
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/home" element={<Home />} />
        <Route path="/artist" element={<Artist />} />
        <Route path="/genre" element={<Genre />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
      {!isLanding && <ToastProvider />}
    </>
  );
};


export default App;

