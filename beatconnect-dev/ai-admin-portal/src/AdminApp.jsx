import React, { useState, useEffect } from 'react';
import { useAuth } from '@shared/context/AuthContext';
import ToastProvider from '@shared/components/ToastProvider';
import AuthModal from '@shared/components/Modals/AuthModal';
import SystemAdmin from './pages/SystemAdmin';

const Telemetry = ({ isAuthenticated, user, loading }) => (
  <div style={{ position: 'fixed', bottom: 10, left: 10, zIndex: 9999, pointerEvents: 'none', backgroundColor: 'rgba(5,5,10,0.95)', color: '#10b981', padding: '12px 16px', borderRadius: '12px', fontSize: '10px', fontFamily: 'monospace', border: '1px solid #10b981', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
    <div style={{ fontWeight: 'bold', marginBottom: '6px', borderBottom: '1px solid rgba(16,185,129,0.3)', paddingBottom: '4px', display: 'flex', justifyContent: 'space-between', color: '#10b981' }}>
      <span>📡 NEURAL_TERMINAL</span>
      <span style={{ color: '#fff', opacity: 0.5 }}>v2.4.1</span>
    </div>
    <div>AUTH: {isAuthenticated ? 'CONNECTED' : 'REQUIRED'}</div>
  </div>
);

const AdminGuard = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  if (loading) return (
    <div style={{ backgroundColor: '#050510', color: '#fff', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="animate-spin" style={{ width: '40px', height: '40px', border: '2px solid rgba(255,255,255,0.1)', borderTopColor: '#ec4899', borderRadius: '50%' }}></div>
      <Telemetry isAuthenticated={isAuthenticated} user={user} loading={loading} />
    </div>
  );

  if (!isAuthenticated) {
    return (
      <div style={{ backgroundColor: '#0a0a0f', minHeight: '100vh' }}>
        <AuthModal isOpen={true} onClose={() => {}} />
        <Telemetry isAuthenticated={isAuthenticated} user={user} loading={loading} />
      </div>
    );
  }

  // Final Guard: Check for admin role
  if (user?.role !== 'admin') {
    return (
      <div style={{ backgroundColor: '#0a0a0f', color: '#fff', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif' }}>
        <h1 style={{ fontSize: '48px', color: '#f43f5e', fontWeight: '900' }}>ACCESS_DENIED</h1>
        <p style={{ color: 'rgba(255,255,255,0.4)', marginTop: '8px' }}>IDENTITY_NODE: {user?.username} / LEVEL: USER</p>
        <button 
          onClick={() => window.location.href = import.meta.env.VITE_USER_APP_URL || 'http://localhost:5173'}
          style={{ marginTop: '32px', padding: '12px 32px', backgroundColor: 'transparent', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', fontSize: '12px', cursor: 'pointer' }}
        >
          RETURN TO FAN_PORTAL
        </button>
      </div>
    );
  }

  return (
    <>
      <SystemAdmin />
      <Telemetry isAuthenticated={isAuthenticated} user={user} loading={loading} />
    </>
  );
};

const AdminApp = () => {
  return (
    <>
      <AdminGuard />
      <ToastProvider />
    </>
  );
};

export default AdminApp;
