import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './css/style.css'; 

// Import legacy chatbot widget side-effects
import '../../widget-src/main.js';

// Initialize the legacy chatbot widget
if (window.BeatConnectWidget) {
  window.BeatConnectWidget.init({
    welcomeMessage: "Welcome to BeatConnect! What's on your mind? 🎧",
    chatbotLogo: "/bc-icon.png"
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(

  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
