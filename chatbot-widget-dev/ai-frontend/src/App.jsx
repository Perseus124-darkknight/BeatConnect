import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Home from './pages/Home';
import Artist from './pages/Artist';
import Genre from './pages/Genre';
import Admin from './pages/Admin';
import ToastProvider from './components/ToastProvider';

const App = () => {
  useEffect(() => {
    // Reveal the main body (legacy global CSS fade-in)
    document.body.classList.add('loaded');
  }, []);
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/home" element={<Home />} />
        <Route path="/artist" element={<Artist />} />
        <Route path="/genre" element={<Genre />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
      <ToastProvider />
    </>
  );
};

export default App;
