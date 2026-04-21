import { CONVERSATION_ICON, DEFAULT_USER_AVATAR_BASE64, EW_LOGO_BASE64 } from './assets.js';
import { CHATBOT_CSS } from './style.js';
import { CHATBOT_ANSWER, CHATBOT_COMPONENT, USER_QUESTION } from './html-templates.js';
import { ChatAI } from './core/ChatAI.js';
import { marked } from 'marked';

export default class Widget {
  config = {};
  widgetContainer;
  widgetSendButton;
  entryButton;
  widgetConversationBoard;
  core = null;
  isAutoScrollEnabled = true;

  constructor(options = {}) {
    this.config = {
      chatbotId: Date.now(),
      position: options.position || 'bottom-right',
      chatbotLogo: options.chatbotLogo || EW_LOGO_BASE64,
      defaultAvatar: options.defaultAvatar || DEFAULT_USER_AVATAR_BASE64,
      welcomeMessage: options.welcomeMessage || 'How can I help you today?',
      stream: options.stream !== undefined ? options.stream : true,
      model: options.model || 'llama2:latest',
      chatEndpoint: options.chatEndpoint || '/api/chat',
    };
    
    this.core = new ChatAI(this.config);
    this.initialize();
  }

  formatMarkdown(text) {
    if (!text) return '';
    try {
      return marked.parse(text);
    } catch (e) {
      console.error('Markdown error:', e);
      return text;
    }
  }

  getPosition(position) {
    const [vertical, horizontal] = position.split('-');
    return {
      [vertical]: '30px',
      [horizontal]: '30px',
    };
  }

  async initialize() {
    const hostElement = document.createElement('div');
    hostElement.id = 'chat-widget-host';
    hostElement.style.position = 'fixed';
    hostElement.style.zIndex = '999999';
    Object.assign(hostElement.style, this.getPosition(this.config.position));
    document.body.appendChild(hostElement);

    this.shadowRoot = hostElement.attachShadow({ mode: 'open' });

    const styleContainer = document.createElement('div');
    styleContainer.innerHTML = CHATBOT_CSS(this.config.chatbotId);
    this.shadowRoot.appendChild(styleContainer);

    this.entryButton = document.createElement('button');
    this.entryButton.id = `chatbot-entry-button_${this.config.chatbotId}`;
    this.entryButton.innerHTML = CONVERSATION_ICON;
    this.shadowRoot.appendChild(this.entryButton);

    this.createWidgetConversation(this.shadowRoot);

    // Initial message or history load
    const savedChatHistory = localStorage.getItem('beatconnect_chat_history');
    const savedChatContext = localStorage.getItem('beatconnect_chat_context');

    if (savedChatHistory && savedChatContext) {
      this.widgetMessagesList.innerHTML = savedChatHistory;
      this.core.loadContext(savedChatContext);
      setTimeout(() => this.scrollToBottom(), 100);
    } else {
      this.addBotMessage(this.config.welcomeMessage);
    }

    this.setupEventListeners();
  }

  setupEventListeners() {
    this.handleShowChat();
    this.handleCollapseChat();
    this.handleInputTyping();
    this.handleEnterPressed();
    this.handleSendQuestion();
    this.handleStopGeneration();
    this.handleNewChat();
    this.handleReloadChat();
    this.handleImageUpload();
    this.handleScrollLogic();
    this.handleGlobalActions();
  }

  createWidgetConversation(shadowRoot) {
    this.widgetContainer = document.createElement('div');
    this.widgetContainer.classList.add('d-none', 'chatbot-minimized', '--glass-theme');
    
    this.widgetContainer.innerHTML = CHATBOT_COMPONENT(this.config.chatbotId, this.config.chatbotLogo);
    this.widgetSendButton = this.widgetContainer.querySelector('.send-message-button');
    this.widgetQuestionInput = this.widgetContainer.querySelector('textarea');
    this.widgetConversationBoard = this.widgetContainer.querySelector('.chatbot__conversation-board');
    this.widgetMessagesList = this.widgetContainer.querySelector('#chatbot__conversation-board__messages');
    this.scrollToBottomBtn = this.widgetContainer.querySelector('#scroll-to-bottom-btn');
    this.refreshBanner = this.widgetContainer.querySelector(`#cb-refresh-banner-${this.config.chatbotId}`);
    this.botAvatar = this.widgetContainer.querySelector(`#cb-bot-avatar-${this.config.chatbotId}`);
    this.visualizerBars = Array.from(this.widgetContainer.querySelectorAll('.chatbot__visualizer-bar'));

    shadowRoot.appendChild(this.widgetContainer);
    
    // Core Event Bindings
    this.core.onIntelligenceRefresh = (data) => this.highlightRefresh(data);
    this.core.onMediaCommand = (cmd) => this.handleRemoteMedia(cmd);
  }

  highlightRefresh(data) {
    if (!this.refreshBanner) return;
    const textEl = this.refreshBanner.querySelector('.refresh-text');
    if (textEl) textEl.textContent = data.message || 'Grounding intelligence refreshed...';
    
    this.refreshBanner.classList.remove('d-none');
    setTimeout(() => {
      this.refreshBanner.classList.add('d-none');
    }, 5000);
  }

  handleRemoteMedia(cmd) {
    console.log('[BEATBOT] Remote Media Command:', cmd);
    // Visual feedback for media control
    this.startVisualizer(3000);
  }

  startVisualizer(duration = 0) {
    if (this._vizInterval) clearInterval(this._vizInterval);
    
    this._vizInterval = setInterval(() => {
      this.visualizerBars.forEach(bar => {
        const h = Math.random() * 100;
        bar.style.height = `${h}%`;
      });
    }, 100);

    if (duration > 0) {
      setTimeout(() => this.stopVisualizer(), duration);
    }
  }

  stopVisualizer() {
    clearInterval(this._vizInterval);
    this.visualizerBars.forEach(bar => bar.style.height = '1px');
  }

  scrollToBottom() {
    if (this.isAutoScrollEnabled) {
      this.widgetConversationBoard.scrollTo({
        top: this.widgetConversationBoard.scrollHeight,
        behavior: 'smooth'
      });
    }
  }

  handleScrollLogic() {
    this.widgetConversationBoard.addEventListener('scroll', () => {
      const { scrollTop, scrollHeight, clientHeight } = this.widgetConversationBoard;
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;
      
      this.isAutoScrollEnabled = isAtBottom;
      
      if (isAtBottom) {
        this.scrollToBottomBtn.classList.add('d-none');
      } else {
        this.scrollToBottomBtn.classList.remove('d-none');
      }
    });

    this.scrollToBottomBtn.addEventListener('click', () => {
      this.isAutoScrollEnabled = true;
      this.scrollToBottom();
    });
  }

  saveChat() {
    localStorage.setItem('beatconnect_chat_history', this.widgetMessagesList.innerHTML);
    localStorage.setItem('beatconnect_chat_context', JSON.stringify(this.core.getContext()));
  }

  addBotMessage(message = '') {
    const chatbotAnswerFragment = document.createRange().createContextualFragment(
      CHATBOT_ANSWER(this.config.chatbotLogo, message)
    );
    this.widgetMessagesList.appendChild(chatbotAnswerFragment);
    
    // Staggered entry animation check
    const lastRow = this.widgetMessagesList.lastElementChild;
    lastRow.style.animationDelay = '0.2s';
    
    this.scrollToBottom();
    this.saveChat();
    return this.widgetMessagesList.lastElementChild;
  }

  handleShowChat() {
    this.entryButton.addEventListener('click', () => {
      this.widgetContainer.classList.remove('d-none');
      this.entryButton.classList.add('d-none');
      setTimeout(() => {
        this.widgetContainer.classList.remove('chatbot-minimized');
        this.scrollToBottom();
      }, 10);
      this.widgetQuestionInput.focus();
    });
  }

  handleCollapseChat() {
    const collapseBtn = this.widgetContainer.querySelector('.chatbot__collapse');
    if (collapseBtn) {
      collapseBtn.addEventListener('click', () => {
        this.widgetContainer.classList.add('chatbot-minimized');
        setTimeout(() => {
          this.widgetContainer.classList.add('d-none');
          this.entryButton.classList.remove('d-none');
        }, 400);
      });
    }
  }

  handleInputTyping() {
    this.widgetQuestionInput.addEventListener('input', ({ target: { value } }) => {
      const canSend = !!value.trim();
      this.widgetSendButton.disabled = !canSend;
      this.widgetSendButton.classList.toggle('opacity-6', !canSend);
    });
  }

  handleEnterPressed() {
    this.widgetQuestionInput.addEventListener('keyup', ({ key }) => {
       if (key === 'Enter' && !this.widgetSendButton.disabled) {
         this.widgetSendButton.click();
       }
    });
  }

  handleSendQuestion() {
    this.widgetSendButton.addEventListener('click', async () => {
      const questionValue = this.widgetQuestionInput.value.trim();
      if (!questionValue) return;

      this.widgetQuestionInput.value = '';
      this.widgetSendButton.disabled = true;

      // Add user message
      const userComponentHtml = USER_QUESTION(questionValue);
      const userQuestionComponent = document.createRange().createContextualFragment(userComponentHtml);
      this.widgetMessagesList.appendChild(userQuestionComponent);
      this.scrollToBottom();

      // Add bot placeholder
      const botMessageElement = this.addBotMessage();
      const responseTextElement = botMessageElement.querySelector('.response-text');
      const typingIndicator = botMessageElement.querySelector('.chatbot__typing');
      const metaActions = botMessageElement.querySelector('.chatbot__meta');

      if (this.botAvatar) this.botAvatar.classList.add('thinking');
      this.startVisualizer();

      let isFirstChunk = true;
      this.core.sendMessage({
        message: questionValue,
        onChunk: (fullStreamedResponse) => {
          if (isFirstChunk) {
            if (typingIndicator) typingIndicator.classList.add('d-none');
            responseTextElement.classList.remove('d-none');
            if (metaActions) metaActions.classList.remove('d-none');
            isFirstChunk = false;
          }
          responseTextElement.innerHTML = this.formatMarkdown(fullStreamedResponse);
          this.scrollToBottom();
        },
        onComplete: (fullStreamedResponse) => {
          responseTextElement.innerHTML = this.formatMarkdown(fullStreamedResponse);
          this.widgetSendButton.disabled = false;
          if (this.botAvatar) this.botAvatar.classList.remove('thinking');
          this.stopVisualizer();
          this.scrollToBottom();
          this.saveChat();
        },
        onError: (err) => {
          responseTextElement.innerHTML = `<span class="text-danger">⚠️ ${err.message || 'Intelligence offline.'}</span>`;
          responseTextElement.classList.remove('d-none');
          if (typingIndicator) typingIndicator.classList.add('d-none');
          if (this.botAvatar) this.botAvatar.classList.remove('thinking');
          this.stopVisualizer();
          this.widgetSendButton.disabled = false;
        }
      });
    });
  }

  handleGlobalActions() {
    this.widgetMessagesList.addEventListener('click', (e) => {
      const copyBtn = e.target.closest('.chatbot__action-copy');
      if (copyBtn) {
        const row = copyBtn.closest('.chatbot__msg-row');
        const text = row.querySelector('.response-text').innerText;
        navigator.clipboard.writeText(text).then(() => {
          const originalHTML = copyBtn.innerHTML;
          copyBtn.innerHTML = '<span style="font-size: 10px; color: #22d3ee;">Copied!</span>';
          setTimeout(() => { copyBtn.innerHTML = originalHTML; }, 2000);
        });
      }
    });
  }

  handleStopGeneration() {
    // Legacy support or new stop logic
  }

  handleNewChat() {
    const newChatBtn = this.widgetContainer.querySelector('.chatbot__new-chat');
    if (newChatBtn) {
      newChatBtn.addEventListener('click', () => {
        this.widgetMessagesList.innerHTML = '';
        this.core.clearContext();
        localStorage.removeItem('beatconnect_chat_history');
        localStorage.removeItem('beatconnect_chat_context');
        this.addBotMessage(this.config.welcomeMessage);
      });
    }
  }

  handleReloadChat() {
    // Merged into handleNewChat for 2.0 simplicity
  }

  handleImageUpload() {
    const uploadBtn = this.widgetContainer.querySelector('#upload-image-btn');
    const imageInput = this.widgetContainer.querySelector('#chatbot-hidden-image-input');
    if (uploadBtn && imageInput) {
      uploadBtn.addEventListener('click', () => imageInput.click());
      imageInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        const previewUrl = URL.createObjectURL(file);
        this.widgetMessagesList.insertAdjacentHTML('beforeend', USER_IMAGE_BUBBLE(previewUrl));
        this.scrollToBottom();

        const botMessageElement = this.addBotMessage();
        const responseTextElement = botMessageElement.querySelector('.response-text');
        const typingIndicator = botMessageElement.querySelector('.chatbot__typing');

        if (this.botAvatar) this.botAvatar.classList.add('thinking');
        this.startVisualizer();

        let isFirst = true;
        this.core.sendMessage({
          message: this.widgetQuestionInput.value.trim() || 'Analyze this track art.',
          file,
          onChunk: (full) => {
            if (isFirst) { if (typingIndicator) typingIndicator.classList.add('d-none'); responseTextElement.classList.remove('d-none'); isFirst = false; }
            responseTextElement.innerHTML = this.formatMarkdown(full);
            this.scrollToBottom();
          },
          onComplete: (full) => {
            responseTextElement.innerHTML = this.formatMarkdown(full);
            if (this.botAvatar) this.botAvatar.classList.remove('thinking');
            this.stopVisualizer();
            this.scrollToBottom();
            this.saveChat();
          },
          onError: (err) => {
            responseTextElement.innerHTML = `<span class="text-danger">⚠️ ${err.message}</span>`;
            if (this.botAvatar) this.botAvatar.classList.remove('thinking');
            this.stopVisualizer();
          }
        });
        imageInput.value = '';
        this.widgetQuestionInput.value = '';
      });
    }
  }
}
