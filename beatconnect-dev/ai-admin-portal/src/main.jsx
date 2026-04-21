import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@shared/context/AuthContext';
import './index.css';
import AdminApp from './AdminApp.jsx';

const rootElement = document.getElementById('admin-root');
if (!window.__admin_root) {
  window.__admin_root = ReactDOM.createRoot(rootElement);
}

window.__admin_root.render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <AdminApp />
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>
);
