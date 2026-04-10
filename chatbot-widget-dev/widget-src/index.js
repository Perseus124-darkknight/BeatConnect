// widget-src/index.js
import { BeatConnectAI } from './core/BeatConnectAI.js';
import ChatbotWidget from './main.js';

export { BeatConnectAI, ChatbotWidget };

// Auto-initialize if loaded via CDN with data attributes
if (typeof window !== 'undefined') {
  window.BeatConnectAI = BeatConnectAI;
  window.ChatbotWidget = ChatbotWidget;
}
