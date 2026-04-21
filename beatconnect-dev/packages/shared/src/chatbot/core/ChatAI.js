import { io } from 'socket.io-client';

export class ChatAI {
  constructor(config = {}) {
    this.config = {
      model: config.model || 'llama2:latest',
      stream: config.stream !== undefined ? config.stream : true,
      chatEndpoint: config.chatEndpoint || 'http://localhost:3000/api/chat',
      ...config
    };

    this.chatContext = [];
    this.socket = null;
    // Derive Socket.io Endpoint from HTTP Endpoint
    this.socketEndpoint = this.config.chatEndpoint.replace(/\/api\/chat$/, '');
    
    this.currentCallbacks = {
      onChunk: null,
      onComplete: null,
      onError: null,
      onIntelligenceRefresh: config.onIntelligenceRefresh || null,
      onMediaCommand: config.onMediaCommand || null
    };
    this.fullResponseBuffer = '';
    this.responseTimeout = null;
    
    // Voice/STT & VAD State
    this.isVoiceModeEnabled = config.isVoiceModeEnabled !== undefined ? config.isVoiceModeEnabled : false;
    this.isPro = config.isPro || false; 
    this.isListening = false;
    this.audioContext = null;
    this.mediaStream = null;
    this.mediaRecorder = null;
    this.analyser = null;
    this.vadTimeout = null;
    this.vadThreshold = 0.015;
    this.vadSilenceTime = 1500;

    this.synth = window.speechSynthesis;
    this.initSocketIO();
    this.initTTS();
  }

  initSocketIO() {
    console.log('[ChatAI] Connecting to Socket.io:', this.socketEndpoint);
    try {
      this.socket = io(this.socketEndpoint);
      
      this.socket.on('connect', () => {
        console.log('[ChatAI] Socket.io connected:', this.socket.id);
      });
      
      this.socket.on('chunk', (data) => {
        this._clearResponseTimeout();
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
      });

      this.socket.on('complete', (data) => {
        this._clearResponseTimeout();
        this.chatContext = data.context;
        if (this.currentCallbacks.onComplete) {
          this.currentCallbacks.onComplete(data.response, false);
        }
      });

      this.socket.on('error', (data) => {
        this._clearResponseTimeout();
        if (this.currentCallbacks.onError) {
          this.currentCallbacks.onError(new Error(data.message));
        }
      });

      // 2.0 Real-time Intelligence Refresh
      this.socket.on('intelligence_refresh', (data) => {
         console.log('[ChatAI] Grounding updated:', data.message);
         if (this.currentCallbacks.onIntelligenceRefresh) {
            this.currentCallbacks.onIntelligenceRefresh(data);
         }
      });

      // 2.0 Media Control Channel
      this.socket.on('execute_media', (command) => {
         console.log('[ChatAI] Media action requested:', command.action);
         if (this.currentCallbacks.onMediaCommand) {
            this.currentCallbacks.onMediaCommand(command);
         }
      });
      
      this.socket.on('disconnect', () => {
        console.log('[ChatAI] Socket closed, handling cleanup...');
        this._clearResponseTimeout();
      });

    } catch (e) {
      console.error('[ChatAI] Failed to init Socket.io:', e);
    }
  }

  initTTS() {
    if (!this.synth) return;
    const loadVoices = () => {
      const voices = this.synth.getVoices();
      this.ttsVoice = voices.find(v => v.lang.startsWith('en')) || voices[0];
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
    this.synth.cancel();
    
    const cleanText = text.replace(/[#*\`_]/g, '');
    const utterThis = new SpeechSynthesisUtterance(cleanText);
    utterThis.voice = this.ttsVoice;
    this.synth.speak(utterThis);
  }

  async startVoiceStreaming(callbacks = {}) {
    if (this.isListening) return;
    
    if (!this.socket || !this.socket.connected) {
      throw new Error("Socket.io disconnected.");
    }

    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({ 
        audio: { channelCount: 1, sampleRate: 16000 } 
      });
      
      this.isListening = true;
      this.currentCallbacks = { ...this.currentCallbacks, ...callbacks };
      this.fullResponseBuffer = '';

      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const source = this.audioContext.createMediaStreamSource(this.mediaStream);
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 512;
      source.connect(this.analyser);

      this.mediaRecorder = new MediaRecorder(this.mediaStream, { mimeType: 'audio/webm' });
      
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0 && this.socket.connected) {
          this.socket.emit('voice_chunk', event.data);
        }
      };

      this.mediaRecorder.start(250);
      
      this.socket.emit('voice_start', { 
        pageContext: {
          url: window.location.pathname,
          title: document.title
        }
      });

      this.monitorVAD();
      console.log('[ChatAI] Voice streaming started');
      
    } catch (err) {
      this.isListening = false;
      throw err;
    }
  }

  monitorVAD() {
    if (!this.isListening || !this.analyser) return;

    const bufferLength = this.analyser.frequencyBinCount;
    const dataArray = new Float32Array(bufferLength);
    this.analyser.getFloatTimeDomainData(dataArray);

    let sum = 0;
    for (let i = 0; i < bufferLength; i++) {
      sum += dataArray[i] * dataArray[i];
    }
    const rms = Math.sqrt(sum / bufferLength);

    if (rms > this.vadThreshold) {
      if (this.vadTimeout) {
        clearTimeout(this.vadTimeout);
        this.vadTimeout = null;
      }
    } else if (!this.vadTimeout) {
      this.vadTimeout = setTimeout(() => {
        this.stopVoiceStreaming();
      }, this.vadSilenceTime);
    }

    if (this.isListening) {
      requestAnimationFrame(() => this.monitorVAD());
    }
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

    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close();
    }

    if (this.socket && this.socket.connected) {
      this.socket.emit('voice_stop');
    }

    if (this.currentCallbacks.onListeningStop) {
      this.currentCallbacks.onListeningStop();
    }
  }

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

  _clearResponseTimeout() {
    if (this.responseTimeout) {
      clearTimeout(this.responseTimeout);
      this.responseTimeout = null;
    }
  }

  _startResponseTimeout() {
    this._clearResponseTimeout();
    this.responseTimeout = setTimeout(() => {
      console.warn('[ChatAI] Response timeout — no reply in 30s');
      if (this.currentCallbacks.onError) {
        this.currentCallbacks.onError(new Error('BeatBot took too long to respond. Please try again.'));
        this.currentCallbacks = { onChunk: null, onComplete: null, onError: null };
      }
    }, 30000);
  }

  stopGeneration() {
    if (this.socket && this.socket.connected) {
      this.socket.emit('stop');
    }
  }

  async trackEvent(eventType, value = null) {
    try {
      await fetch(`${this.config.chatEndpoint.replace('/chat', '/analytics/track')}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event_type: eventType, value: String(value) })
      });
    } catch (e) {}
  }

  async sendMessage({ 
    message, 
    file = null, 
    onChunk = () => {}, 
    onComplete = () => {}, 
    onError = () => {} 
  }) {
    if (!this.socket || !this.socket.connected) {
      onError(new Error('BeatBot is reconnecting. Please try again in a moment.'));
      return;
    }

    this.currentCallbacks = { ...this.currentCallbacks, onChunk, onComplete, onError };
    this.fullResponseBuffer = '';
    this._startResponseTimeout();

    try {
      let fileData = null;
      if (file) {
        fileData = {
          type: file.type || 'application/octet-stream',
          data: await ChatAI.fileToBase64(file)
        };
      }

      this.socket.emit('chat', {
        prompt: message,
        model: this.config.model,
        stream: this.config.stream,
        context: this.chatContext,
        file: fileData,
        pageContext: {
          url: window.location.pathname,
          title: document.title,
          search: window.location.search
        }
      });
      
    } catch (e) {
      onError(e);
    }
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

  static fileToDataURL(file) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.readAsDataURL(file);
    });
  }
}
