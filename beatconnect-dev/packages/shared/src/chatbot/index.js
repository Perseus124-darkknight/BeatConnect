import Widget from './Widget.js';

// Auto-initialize if loaded via script tag with global access
if (typeof window !== 'undefined') {
  window.ChatbotWidget = {
    init: (options) => new Widget(options)
  };
}

export default Widget;
