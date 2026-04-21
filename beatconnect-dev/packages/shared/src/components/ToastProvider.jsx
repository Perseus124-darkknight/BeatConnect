import React, { useState, useEffect } from 'react';

const ToastProvider = () => {
  const [toast, setToast] = useState({ message: '', type: '', visible: false });

  useEffect(() => {
    let timeoutId;
    
    // Bind to window for global access, matching the original vanilla JS implementation
    window.showToast = (message, type = 'success') => {
      setToast({ message, type, visible: true });
      
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setToast(prev => ({ ...prev, visible: false }));
      }, 3000);
    };

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      delete window.showToast;
    };
  }, []);

  if (!toast.visible) return null;

  const isError = toast.type === 'error';
  
  return (
    <div className={`fixed bottom-6 right-6 p-4 px-6 rounded-xl flex items-center gap-3 z-[9999] shadow-2xl font-mono text-sm font-bold text-white backdrop-blur-md animate-[toastSlideIn_0.3s_cubic-bezier(0.4,0,0.2,1)_forwards] ${isError ? 'bg-red-600/90' : 'bg-emerald-500/90'}`}>
      <span>{isError ? '⚠️' : '✨'}</span>
      <span>{toast.message}</span>
      <style>{`
        @keyframes toastSlideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default ToastProvider;
