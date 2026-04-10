// widget-src/core/BeatConnectAI.js
export class BeatConnectAI {
  constructor(config = {}) {
    this.config = {
      model: config.model || 'llava',
      stream: config.stream !== undefined ? config.stream : false,
      chatEndpoint: config.chatEndpoint || 'http://localhost:3000/api/chat',
      ...config
    };

    this.chatContext = [];
    this.ws = null;
    // Derive WS Endpoint from HTTP Endpoint
    this.wsEndpoint = this.config.chatEndpoint.replace(/^http/, 'ws').replace(/\/api\/chat$/, '');
    
    // Callbacks map for current active generation
    this.currentCallbacks = {
      onChunk: null,
      onComplete: null,
      onError: null
    };
    this.fullResponseBuffer = '';
    
    // Voice/STT & VAD State
    this.isVoiceModeEnabled = config.isVoiceModeEnabled !== undefined ? config.isVoiceModeEnabled : true;
    this.isPro = config.isPro || false; // NEW: Freemium check
    this.isListening = false;
    this.audioContext = null;
    this.mediaStream = null;
    this.mediaRecorder = null;
    this.analyser = null;
    this.vadTimeout = null;
    this.vadThreshold = 0.015; // Adjustable silence threshold
    this.vadSilenceTime = 1500; // MS of silence before auto-stop

    this.initWebSocket();
    this.initTTS();
  }

  // --- WebSocket Setup ---
  initWebSocket() {
    console.log('[SDK] Connecting to WebSocket:', this.wsEndpoint);
    this.ws = new WebSocket(this.wsEndpoint);
    
    this.ws.onopen = () => {
      console.log('[SDK] WebSocket connected successfully');
    };
    
    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'chunk') {
          if (data.isDone) {
            this.chatContext = data.context;
            if (this.currentCallbacks.onComplete) {
              this.currentCallbacks.onComplete(this.fullResponseBuffer, true);
            }
          } else {
            this.fullResponseBuffer += data.chunk;
            if (this.currentCallbacks.onChunk) {
              this.currentCallbacks.onChunk(this.fullResponseBuffer);
            }
          }
        } else if (data.type === 'complete') {
          this.chatContext = data.context;
          if (this.currentCallbacks.onComplete) {
            this.currentCallbacks.onComplete(data.response, false);
          }
        } else if (data.type === 'error') {
          if (this.currentCallbacks.onError) {
            this.currentCallbacks.onError(new Error(data.message));
          }
        }
      } catch (e) {
        console.error('[SDK] Error parsing WS message:', e);
      }
    };
    
    this.ws.onclose = () => {
      console.log('[SDK] WebSocket closed, retrying in 3s...');
      setTimeout(() => this.initWebSocket(), 3000);
    };
    
    this.ws.onerror = (err) => {
      console.error('[SDK] WebSocket error:', err);
    };
  }

  // --- Voice / TTS Methods ---
  initTTS() {
    if (!this.synth) return;
    const loadVoices = () => {
      const voices = this.synth.getVoices();
      // Look for a British-sounding voice as fallback logic from main
      this.ttsVoice = voices.find(v => v.name.includes('Daniel') || v.name.includes('UK English Male') || v.lang === 'en-GB') || voices[0];
    };
    loadVoices();
    if (this.synth.onvoiceschanged !== undefined) {
      this.synth.onvoiceschanged = loadVoices;
    }
  }

  toggleVoiceMode() {
    this.isVoiceModeEnabled = !this.isVoiceModeEnabled;
    if (!this.isVoiceModeEnabled && this.synth) {
      this.synth.cancel();
    }
    return this.isVoiceModeEnabled;
  }

  playTTS(text) {
    if (!this.synth || !this.isVoiceModeEnabled) return;
    this.synth.cancel(); // Clear ongoing speech
    
    // Clean up markdown/tags
    const cleanText = text
      .replace(/\[SUGGESTION:[^\]]+\]/gi, '')
      .replace(/\[TRACK:[^\]]+\]/gi, '')
      .replace(/[#*\`_]/g, '');
      
    const utterThis = new SpeechSynthesisUtterance(cleanText);
    utterThis.voice = this.ttsVoice;
    utterThis.pitch = 0.9;
    utterThis.rate = 1.1;
    this.synth.speak(utterThis);
  }

  // --- Voice / STT Methods (Real-time Streaming + VAD) ---
  async startVoiceStreaming(callbacks = {}) {
    if (this.isListening) return;
    
    // NEW: Premium Gating
    if (!this.isPro) {
      const error = new Error("PREMIUM_REQUIRED");
      error.message = "Voice Mode is a BeatConnect PRO feature. Upgrade to unlock.";
      throw error;
    }

    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error("WebSocket disconnected.");
    }

    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({ 
        audio: { channelCount: 1, sampleRate: 16000 } 
      });
      
      this.isListening = true;
      this.currentCallbacks = { ...this.currentCallbacks, ...callbacks };
      this.fullResponseBuffer = '';

      // Initialize Audio Context for VAD
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const source = this.audioContext.createMediaStreamSource(this.mediaStream);
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 512;
      source.connect(this.analyser);

      // MediaRecorder for streaming
      this.mediaRecorder = new MediaRecorder(this.mediaStream, { mimeType: 'audio/webm' });
      
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0 && this.ws.readyState === WebSocket.OPEN) {
          // Send raw binary blob to backend
          this.ws.send(event.data);
        }
      };

      // Start recording in small 250ms chunks
      this.mediaRecorder.start(250);
      
      // Notify backend we are starting a voice stream
      this.ws.send(JSON.stringify({ 
        type: 'voice_start',
        pageContext: {
          url: window.location.pathname,
          title: document.title
        }
      }));

      this.monitorVAD();
      console.log('[SDK] Voice streaming started...');
      
    } catch (err) {
      console.error('[SDK] Mic access failed:', err);
      this.isListening = false;
      throw err;
    }
  }

  monitorVAD() {
    if (!this.isListening || !this.analyser) return;

    const bufferLength = this.analyser.frequencyBinCount;
    const dataArray = new Float32Array(bufferLength);
    this.analyser.getFloatTimeDomainData(dataArray);

    // Calculate RMS (Volume)
    let sum = 0;
    for (let i = 0; i < bufferLength; i++) {
      sum += dataArray[i] * dataArray[i];
    }
    const rms = Math.sqrt(sum / bufferLength);

    // If volume is above threshold, reset the silence timer
    if (rms > this.vadThreshold) {
      if (this.vadTimeout) {
        clearTimeout(this.vadTimeout);
        this.vadTimeout = null;
      }
    } else if (!this.vadTimeout) {
      // Start silence timer
      this.vadTimeout = setTimeout(() => {
        console.log('[SDK] VAD: Silence detected, stopping stream.');
        this.stopVoiceStreaming();
      }, this.vadSilenceTime);
    }

    requestAnimationFrame(() => this.monitorVAD());
  }

  async stopVoiceStreaming() {
    if (!this.isListening) return;
    this.isListening = false;

    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
    }

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
    }

    if (this.audioContext) {
      this.audioContext.close();
    }

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'voice_stop' }));
    }

    console.log('[SDK] Voice streaming stopped.');
    if (this.currentCallbacks.onListeningStop) {
      this.currentCallbacks.onListeningStop();
    }
  }

  // --- State Management ---
  loadContext(storedContext) {
    try {
      this.chatContext = typeof storedContext === 'string' ? JSON.parse(storedContext) : storedContext;
    } catch (e) {
      this.chatContext = [];
    }
  }

  getContext() {
    return this.chatContext;
  }

  clearContext() {
    this.chatContext = [];
    this.stopGeneration();
  }

  stopGeneration() {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'stop' }));
    }
  }

  // --- Analytics ---
  async trackEvent(eventType, value = null) {
    try {
      await fetch(`${this.config.chatEndpoint.replace('/chat', '/analytics/track')}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event_type: eventType, value: String(value) })
      });
    } catch (e) {
      console.warn('[Analytics] Failed to track event:', e);
    }
  }

  // --- WebSocket Emit Method ---
  async sendMessage({ 
    message, 
    file = null, 
    onChunk = () => {}, 
    onComplete = () => {}, 
    onError = () => {} 
  }) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      onError(new Error("WebSocket is disconnected. Connecting..."));
      return;
    }

    // Set active callbacks
    this.currentCallbacks = { onChunk, onComplete, onError };
    this.fullResponseBuffer = '';

    try {
      let fileData = null;
      if (file) {
        if (file instanceof File || file instanceof Blob) {
           fileData = {
               type: file.type || 'application/octet-stream',
               data: await BeatConnectAI.fileToBase64(file)
           };
        } else {
           fileData = file;
        }
      }

      let extractedPageContext = null;
      try {
        extractedPageContext = {
          url: window.location.pathname,
          title: document.title,
          search: window.location.search
        };
      } catch (e) {
        console.warn('Could not extract page context:', e);
      }

      this.ws.send(JSON.stringify({
        type: 'chat',
        prompt: message,
        model: this.config.model,
        stream: this.config.stream,
        context: this.chatContext,
        file: fileData,
        pageContext: extractedPageContext
      }));
      
    } catch (e) {
      onError(e);
    }
  }

  // --- Utility ---
  static async resizeImage(file, maxDimension = 800) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxDimension) {
              height *= maxDimension / width;
              width = maxDimension;
            }
          } else {
            if (height > maxDimension) {
              width *= maxDimension / height;
              height = maxDimension;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.8));
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  }

  static fileToBase64(file) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
         const result = e.target.result;
         const b64 = result.includes(',') ? result.split(',')[1] : result;
         resolve(b64);
      };
      reader.readAsDataURL(file);
    });
  }

  static dataURLToBlob(dataURL) {
    const parts = dataURL.split(';base64,');
    const contentType = parts[0].split(':')[1];
    const raw = window.atob(parts[1]);
    const uInt8Array = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; ++i) uInt8Array[i] = raw.charCodeAt(i);
    return new Blob([uInt8Array], { type: contentType });
  }

  static fileToDataURL(file) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.readAsDataURL(file);
    });
  }
}
