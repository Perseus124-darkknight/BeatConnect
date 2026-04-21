// ai-frontend/src/services/BeatConnectAI.js
export class BeatConnectAI {
  constructor(config = {}) {
    this.config = {
      model: config.model || 'llava',
      stream: config.stream !== undefined ? config.stream : true,
      chatEndpoint: config.chatEndpoint || 'http://localhost:3000/api/chat',
      ...config
    };

    this.chatContext = [];
    this.ws = null;
    this.wsEndpoint = this.config.chatEndpoint.replace(/^http/, 'ws').replace(/\/api\/chat$/, '');
    
    this.currentCallbacks = {
      onChunk: null,
      onComplete: null,
      onError: null,
      onListeningStop: null
    };
    this.fullResponseBuffer = '';
    
    this.isVoiceModeEnabled = config.isVoiceModeEnabled !== undefined ? config.isVoiceModeEnabled : true;
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
    this.initWebSocket();
    this.initTTS();
  }

  initWebSocket() {
    console.log('[BeatConnectAI] Connecting to:', this.wsEndpoint);
    this.ws = new WebSocket(this.wsEndpoint);
    
    this.ws.onopen = () => console.log('[BeatConnectAI] WebSocket connected');
    
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
        console.error('[BeatConnectAI] Message error:', e);
      }
    };
    
    this.ws.onclose = () => {
      setTimeout(() => this.initWebSocket(), 3000);
    };
  }

  initTTS() {
    if (!this.synth) return;
    const loadVoices = () => {
      const voices = this.synth.getVoices();
      this.ttsVoice = voices.find(v => v.name.includes('Daniel') || v.name.includes('UK English Male') || v.lang === 'en-GB') || voices[0];
    };
    loadVoices();
    if (this.synth.onvoiceschanged !== undefined) {
      this.synth.onvoiceschanged = loadVoices;
    }
  }

  toggleVoiceMode() {
    this.isVoiceModeEnabled = !this.isVoiceModeEnabled;
    if (!this.isVoiceModeEnabled && this.synth) this.synth.cancel();
    return this.isVoiceModeEnabled;
  }

  playTTS(text) {
    if (!this.synth || !this.isVoiceModeEnabled) return;
    this.synth.cancel();
    const cleanText = text
      .replace(/\[SUGGESTION:[^\]]+\]/gi, '')
      .replace(/\[TRACK:[^\]]+\]/gi, '')
      .replace(/[#*\`_]/g, '');
      
    const utterThis = new SpeechSynthesisUtterance(cleanText);
    utterThis.voice = this.ttsVoice;
    utterThis.pitch = 0.95;
    utterThis.rate = 1.05;
    this.synth.speak(utterThis);
  }

  async startVoiceStreaming(callbacks = {}) {
    if (this.isListening) return;
    if (!this.isPro) {
      const error = new Error("PREMIUM_REQUIRED");
      error.message = "Voice Mode is a BeatConnect PRO feature. Upgrade to unlock.";
      throw error;
    }
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) throw new Error("Connection lost.");

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
        if (event.data.size > 0 && this.ws.readyState === WebSocket.OPEN) {
          this.ws.send(event.data);
        }
      };

      this.mediaRecorder.start(250);
      this.ws.send(JSON.stringify({ 
        type: 'voice_start',
        pageContext: { url: window.location.pathname, title: document.title }
      }));

      this.monitorVAD();
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
    for (let i = 0; i < bufferLength; i++) sum += dataArray[i] * dataArray[i];
    const rms = Math.sqrt(sum / bufferLength);

    if (rms > this.vadThreshold) {
      if (this.vadTimeout) { clearTimeout(this.vadTimeout); this.vadTimeout = null; }
    } else if (!this.vadTimeout) {
      this.vadTimeout = setTimeout(() => this.stopVoiceStreaming(), this.vadSilenceTime);
    }
    requestAnimationFrame(() => this.monitorVAD());
  }

  async stopVoiceStreaming() {
    if (!this.isListening) return;
    this.isListening = false;
    if (this.mediaRecorder?.state !== 'inactive') this.mediaRecorder.stop();
    if (this.mediaStream) this.mediaStream.getTracks().forEach(track => track.stop());
    if (this.audioContext) this.audioContext.close();
    if (this.ws?.readyState === WebSocket.OPEN) this.ws.send(JSON.stringify({ type: 'voice_stop' }));
    if (this.currentCallbacks.onListeningStop) this.currentCallbacks.onListeningStop();
  }

  sendMessage({ message, file = null, onChunk, onComplete, onError }) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      onError?.(new Error("Disconnected"));
      return;
    }
    this.currentCallbacks = { ...this.currentCallbacks, onChunk, onComplete, onError };
    this.fullResponseBuffer = '';

    const send = async () => {
      let fileData = null;
      if (file) {
        fileData = {
          type: file.type || 'application/octet-stream',
          data: await this.constructor.fileToBase64(file)
        };
      }
      this.ws.send(JSON.stringify({
        type: 'chat',
        prompt: message,
        model: this.config.model,
        stream: this.config.stream,
        context: this.chatContext,
        file: fileData,
        pageContext: { url: window.location.pathname, title: document.title, search: window.location.search }
      }));
    };
    send();
  }

  static fileToBase64(file) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result.split(',')[1]);
      reader.readAsDataURL(file);
    });
  }

  stopGeneration() {
    if (this.ws?.readyState === WebSocket.OPEN) this.ws.send(JSON.stringify({ type: 'stop' }));
  }

  loadContext(ctx) { this.chatContext = typeof ctx === 'string' ? JSON.parse(ctx) : ctx || []; }
  clearContext() { this.chatContext = []; this.stopGeneration(); }
}
