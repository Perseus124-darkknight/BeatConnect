import { CONVERSATION_ICON, DEFAULT_USER_AVATAR_BASE64, EW_LOGO_BASE64 } from './assets.js'
import { CHATBOT_CSS } from './style.js'
import { CHATBOT_ANSWER, CHATBOT_COMPONENT, USER_QUESTION, PRO_MODAL, CHATBOT_MODAL } from './html-templates.js'
import { BeatConnectAI } from './core/BeatConnectAI.js'
import { marked } from 'marked'
export default class ChatbotWidget {

  config = {}
  widgetContainer
  widgetSendButton
  entryButton
  widgetConversationBoard
  core = null

  constructor({ position, chatbotLogo, defaultAvatar, welcomeMessage, stream, model, chatEndpoint }) {
    this.config = {
      chatbotId: Date.now(),
      position: position ? position : 'bottom-right',
      chatbotLogo: chatbotLogo ? chatbotLogo : EW_LOGO_BASE64,
      defaultAvatar: defaultAvatar ? defaultAvatar : DEFAULT_USER_AVATAR_BASE64,
      welcomeMessage: welcomeMessage ? welcomeMessage : 'Welcome! How can I help you?',
      stream: stream ? stream : false,
      model: model ? model : 'llava',
      chatEndpoint: chatEndpoint ? chatEndpoint : 'http://localhost:11434/api/generate',
    }
    this.core = new BeatConnectAI(this.config);
    this.initialize().then(() => {
      console.log('Chatbot initialized')
    })
  }

  formatMarkdown(text) {
    if (!text) return '';
    try {
      // Clean up custom tags before parsing markdown
      let cleanText = text
        .replace(/\[SUGGESTION:[^\]]+\]/gi, '')
        .replace(/\[TRACK:[^\]]+\]/gi, '');
      
      return marked.parse(cleanText);
    } catch (e) {
      console.error('Markdown parsing failed:', e);
      return text;
    }
  }

  getPosition(position) {
    const [vertical, horizontal] = position.split('-')
    return {
      [vertical]: '30px',
      [horizontal]: '30px',
    }
  }

  async initialize() {
    const hostElement = document.createElement('div')
    hostElement.style.position = 'fixed'
    hostElement.style.zIndex = '999999'
    Object.assign(hostElement.style, this.getPosition(this.config.position))
    document.body.appendChild(hostElement)

    this.shadowRoot = hostElement.attachShadow({ mode: 'open' })

    const styleContainer = document.createElement('div')
    styleContainer.innerHTML = CHATBOT_CSS(this.config.chatbotId)
    this.shadowRoot.appendChild(styleContainer)

    this.entryButton = document.createElement('button')
    this.entryButton.id = `chatbot-entry-button_${this.config.chatbotId}`
    this.entryButton.innerHTML = `${CONVERSATION_ICON}`
    this.shadowRoot.appendChild(this.entryButton)

    this.createWidgetConversation(this.shadowRoot)

    // Load chat history or initialize default welcome message
    const savedChatHistory = localStorage.getItem('beatconnect_chat_history');
    const savedChatContext = localStorage.getItem('beatconnect_chat_context');

    if (savedChatHistory && savedChatContext) {
      this.widgetConversationBoard.innerHTML = savedChatHistory;
      this.core.loadContext(savedChatContext);

      // Scroll to bottom after loading history
      setTimeout(() => {
        this.widgetConversationBoard.scrollTop = this.widgetConversationBoard.scrollHeight;
      }, 100);
    } else {
      const chatBotWelcomeComponent = document
        .createRange()
        .createContextualFragment(CHATBOT_ANSWER(this.config.chatbotLogo, this.config.welcomeMessage, true))

      this.widgetConversationBoard.appendChild(chatBotWelcomeComponent)
    }

    this.handleShowChat()
    this.handleCollapseChat()
    this.handleReloadChat()
    this.handleNewChat()
    this.handleClearChat()
    this.handleEditChat()
    this.handleInputTyping()
    this.handleEnterPressed()
    this.handleSendQuestion()
    this.handleStopGeneration()
    this.handleAttachmentButtons()
    this.handleMessageActions()
    this.handleVoiceToggle()
    this.handleAudioRecording()
  }

  handleVoiceToggle() {
    const voiceBtn = this.widgetContainer.querySelector('.chatbot__voice-toggle');
    if (voiceBtn) {
      voiceBtn.addEventListener('click', () => {
        const isEnabled = this.core.toggleVoiceMode();
        if (isEnabled) {
          voiceBtn.style.opacity = '1';
          voiceBtn.style.color = '#ef4444'; 
          if(window.showToast) window.showToast('Voice mode enabled', 'success');
        } else {
          voiceBtn.style.opacity = '0.5';
          voiceBtn.style.color = 'inherit';
          if(window.showToast) window.showToast('Voice mode disabled', 'success');
        }
      });
    }
  }

  fileToDataURL(file) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.readAsDataURL(file);
    });
  }



    handleSendQuestion() {
      this.widgetSendButton.addEventListener('click', async () => {
        if (!this.widgetQuestionInput.value && !this.pendingFile) return;

        const questionValue = this.widgetQuestionInput.value.trim() || '';
      
      // NEW: Client-side Security & NLP Filtering
      const filteredValue = this.validateAndFilterInput(questionValue);
      if (filteredValue === false) return; // Malicious or totally off-topic

      const startTime = Date.now();
      let firstChunkLogged = false;

      this.widgetQuestionInput.value = '';
      this.widgetSendButton.disabled = true;
      this.widgetSendButton.classList.add('opacity-6');

      const currentFile = this.pendingFile;
      const currentFileType = this.pendingFileType;
      this.pendingFile = null;
      this.pendingFileType = null;

      const userBubbles = Array.from(this.widgetConversationBoard.querySelectorAll('.chatbot__conversation-board__message-container.reversed'));
      const previewBubble = userBubbles.find(b => b.innerHTML.includes('(Ready to send)'));
      if (previewBubble) {
        previewBubble.remove();
      }

      let messageContent = questionValue;
      let optimizedFile = currentFile;
      
      if (currentFile && (currentFileType === 'image' || currentFile.type.startsWith('image/'))) {
        const dataUrl = await BeatConnectAI.resizeImage(currentFile, 800);
        const imgHtml = `<img src="${dataUrl}" alt="Uploaded image" />`;
        messageContent = (questionValue ? questionValue + '<br>' : '') + imgHtml;
        
        const resizedBlob = BeatConnectAI.dataURLToBlob(dataUrl);
        optimizedFile = new File([resizedBlob], currentFile.name, { type: 'image/jpeg' });
      } else if (currentFile) {
        messageContent = (questionValue ? questionValue + '<br>' : '') + `<em>Attached file: ${currentFile.name}</em>`;
      }

      const userComponentHtml = USER_QUESTION(messageContent, this.config.defaultAvatar);
      const userQuestionComponent = document.createRange().createContextualFragment(userComponentHtml);
      this.widgetConversationBoard.appendChild(userQuestionComponent);

      const chatbotAnswerFragment = document.createRange().createContextualFragment(CHATBOT_ANSWER(this.config.chatbotLogo));
      this.widgetConversationBoard.appendChild(chatbotAnswerFragment);

      let lastMessageElement = this.widgetConversationBoard.querySelector('.chatbot__conversation-board__message-container:last-child');
      this.widgetConversationBoard.scrollTop = this.widgetConversationBoard.scrollHeight;
      const responseElement = lastMessageElement.querySelector('.response-text');

      const cacheKey = `beatconnect_cache_${questionValue.toLowerCase()}`;

      this.widgetSendButton.classList.add('d-none');
      if (this.widgetStopButton) {
        this.widgetStopButton.classList.remove('d-none');
      }

      let isFirstChunk = true;

      this.core.sendMessage({
        message: questionValue,
        file: optimizedFile,
        onChunk: (fullStreamedResponse) => {
          if (isFirstChunk) {
            responseElement.innerHTML = ''; // Remove thinking dots
            isFirstChunk = false;
            
            // Measure and track response time
            if (!firstChunkLogged) {
                const responseTime = Date.now() - startTime;
                this.core.trackEvent('ai_response_time', responseTime);
                firstChunkLogged = true;
            }
          }
          responseElement.innerHTML = this.formatMarkdown(fullStreamedResponse);
          this.widgetConversationBoard.scrollTop = this.widgetConversationBoard.scrollHeight;
        },
        onComplete: async (fullStreamedResponse, isDoneFlag) => {
          // Check for iTunes Track Suggestion embedded in the final text
          let trackHtml = '';
          const trackRegex = /\[TRACK:\s*([^\]]+)]/i;
          const trackMatch = fullStreamedResponse.match(trackRegex);
          if (trackMatch) {
            const trackQuery = trackMatch[1];
            try {
              const itunesRes = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(trackQuery)}&entity=song&limit=1`);
              const itunesData = await itunesRes.json();
              if (itunesData.results && itunesData.results.length > 0) {
                const track = itunesData.results[0];
                trackHtml = `
                <div class="chatbot-mini-vinyl-container">
                    <div class="chatbot-mini-vinyl-record">
                        <div class="chatbot-mini-vinyl-grooves"></div>
                        <img src="${track.artworkUrl100}" class="chatbot-mini-vinyl-label">
                        <div class="chatbot-mini-vinyl-hole"></div>
                    </div>
                    <div class="chatbot-mini-vinyl-info">
                        <div class="chatbot-mini-vinyl-title">${track.trackName}</div>
                        <div class="chatbot-mini-vinyl-artist">${track.artistName}</div>
                        <audio controls class="chatbot-mini-vinyl-audio" src="${track.previewUrl}"></audio>
                    </div>
                </div>`;
              }
            } catch (err) {
              console.error('iTunes API fetch failed:', err);
            }
            fullStreamedResponse = fullStreamedResponse.replace(trackRegex, '');
          }

          if (fullStreamedResponse.includes('SUGGESTION:')) {
            const suggestionRegex = /\[SUGGESTION:\s*([^|]+)\|([^\]]+)]/i;
            const match = fullStreamedResponse.match(suggestionRegex);
            if (match) {
              const artistName = match[1].trim();
              const artistUrl = match[2].trim();
              const url = new URL(artistUrl, window.location.origin);
              const isSamePage = window.location.pathname === url.pathname && window.location.search === url.search;
              
              fullStreamedResponse = fullStreamedResponse.replace(suggestionRegex, '');

              if (!isSamePage) {
                let suggestionHtml = `<div style="margin-top: 10px;"><button class="chatbot-suggestion-btn" onclick="window.location.href='${artistUrl}'"><svg viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg> View ${artistName} Profile →</button></div>`;
                fullStreamedResponse += suggestionHtml;
              }
            }
          }

          if (trackHtml) {
             fullStreamedResponse += trackHtml;
          }
          responseElement.innerHTML = this.formatMarkdown(fullStreamedResponse);

          if (!currentFile) {
            localStorage.setItem(cacheKey, JSON.stringify({ html: responseElement.innerHTML, rawResponse: fullStreamedResponse }));
          }

          if (this.widgetStopButton) {
            this.widgetStopButton.classList.add('d-none');
          }
          this.widgetSendButton.classList.remove('d-none');
          
          responseElement.classList.remove('d-none');
          lastMessageElement.querySelector('svg').classList.add('d-none');

          const actionsEl = lastMessageElement.querySelector('.chatbot__message-actions');
          if (actionsEl) {
              actionsEl.classList.remove('d-none');
          }

          localStorage.setItem('beatconnect_chat_history', this.widgetConversationBoard.innerHTML);
          localStorage.setItem('beatconnect_chat_context', JSON.stringify(this.core.getContext()));

          if (this.core.isVoiceModeEnabled && fullStreamedResponse) {
             this.core.playTTS(fullStreamedResponse);
          }
        },
        onError: (e) => {
          responseElement.classList.add('text-danger');
          responseElement.innerHTML = `Oops, something went wrong. ${e ? e.message : ''}`;
          if (this.widgetStopButton) {
            this.widgetStopButton.classList.add('d-none');
          }
          this.widgetSendButton.classList.remove('d-none');
          responseElement.classList.remove('d-none');
          lastMessageElement.querySelector('svg').classList.add('d-none');
        }
      });
    });
  }

  createWidgetConversation(chatbotContainer) {
    this.widgetContainer = document.createElement('div')
    this.widgetContainer.classList.add('d-none', 'chatbot-minimized')

    // Read stored token and theme
    const hasToken = !!localStorage.getItem('bc_token');
    const userTheme = localStorage.getItem('bc_theme') || 'glass';
    
    // Only apply user theme if logged in, otherwise default to glass.
    if (hasToken) {
      this.widgetContainer.classList.add(`--${userTheme}-theme`);
    } else {
      this.widgetContainer.classList.add('--glass-theme');
    }

    // Listen to potential changes in the same window
    window.addEventListener('storage', (e) => {
      if (e.key === 'bc_theme' && localStorage.getItem('bc_token')) {
        this.widgetContainer.classList.remove('--dark-theme', '--glass-theme', '--light-theme');
        this.widgetContainer.classList.add(`--${e.newValue || 'glass'}-theme`);
      }
    });

    this.widgetContainer.innerHTML = CHATBOT_COMPONENT(this.config.chatbotId)
    this.widgetSendButton = this.widgetContainer.querySelector('.send-message-button')
    this.widgetStopButton = this.widgetContainer.querySelector('.stop-message-button')
    this.widgetQuestionInput = this.widgetContainer.querySelector('input')
    this.widgetConversationBoard = this.widgetContainer.querySelector('#chatbot__conversation-board__messages')
    chatbotContainer.appendChild(this.widgetContainer)
  }

  handleCollapseChat() {
    this.widgetContainer.querySelector('.chatbot__collapse').addEventListener('click', () => {
      this.widgetContainer.classList.add('chatbot-minimized')
      setTimeout(() => {
        this.widgetContainer.classList.add('d-none')
        this.entryButton.classList.remove('d-none')
      }, 400) // Matches CSS transition duration
    })
  }

  handleReloadChat() {
    const reloadBtn = this.widgetContainer.querySelector('.chatbot__reload');
    if (reloadBtn) {
      reloadBtn.addEventListener('click', async () => {
        if (await this.showCustomConfirm("Are you sure you want to clear the entire chat history?")) {
          // Abort current stream if any
          if (this.currentAbortController) {
            this.currentAbortController.abort();
          }
          
          localStorage.removeItem('beatconnect_chat_history');
          localStorage.removeItem('beatconnect_chat_context');
          this.chatContext = [];
          
          Object.keys(localStorage).forEach(key => {
            if (key.startsWith('beatconnect_cache_')) {
              localStorage.removeItem(key);
            }
          });
          
          this.widgetConversationBoard.innerHTML = '';
          const chatBotWelcomeComponent = document
            .createRange()
            .createContextualFragment(CHATBOT_ANSWER(this.config.chatbotLogo, this.config.welcomeMessage, true));
          this.widgetConversationBoard.appendChild(chatBotWelcomeComponent);
        }
      });
    }
  }

  handleNewChat() {
    const newChatBtn = this.widgetContainer.querySelector('.chatbot__new-chat');
    if (newChatBtn) {
      newChatBtn.addEventListener('click', async () => {
        if (await this.showCustomConfirm("Are you sure you want to start a new conversation?")) {
          // Abort current stream if any
          if (this.currentAbortController) {
            this.currentAbortController.abort();
          }
          
          localStorage.removeItem('beatconnect_chat_history');
          localStorage.removeItem('beatconnect_chat_context');
          this.chatContext = [];
          
          this.widgetConversationBoard.innerHTML = '';
          const chatBotWelcomeComponent = document
            .createRange()
            .createContextualFragment(CHATBOT_ANSWER(this.config.chatbotLogo, this.config.welcomeMessage, true));
          this.widgetConversationBoard.appendChild(chatBotWelcomeComponent);
        }
      });
    }
  }

  handleStopGeneration() {
    if (this.widgetStopButton) {
      this.widgetStopButton.addEventListener('click', () => {
        if (this.currentAbortController) {
          this.currentAbortController.abort();
        }
      });
    }
  }

  handleMessageActions() {
    this.widgetConversationBoard.addEventListener('click', (e) => {
      const shareBtn = e.target.closest('.chatbot__action-share');
      const copyBtn = e.target.closest('.chatbot__action-copy');

      let messageText = '';
      if (shareBtn || copyBtn) {
        const messageContainer = e.target.closest('.chatbot__conversation-board__message-container');
        if (messageContainer) {
          const responseElement = messageContainer.querySelector('.response-text');
          if (responseElement) {
              const clone = responseElement.cloneNode(true);
              const suggestionBtn = clone.querySelector('.chatbot-suggestion-btn');
              if (suggestionBtn && suggestionBtn.parentElement) {
                 suggestionBtn.parentElement.remove();
              }
              
              messageText = clone.innerText.trim();
          }
        }
      }

      if (shareBtn && messageText) {
          const encodedText = encodeURIComponent(messageText + '\n\n— via #BeatConnect');
          window.open(`https://twitter.com/intent/tweet?text=${encodedText}`, '_blank');
      }

      if (copyBtn && messageText) {
          navigator.clipboard.writeText(messageText);
          const originalHTML = copyBtn.innerHTML;
          copyBtn.innerHTML = '<svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>';
          setTimeout(() => {
              copyBtn.innerHTML = originalHTML;
          }, 2000);
      }

      // NEW: Track Vinyl Player Clicks
      const vinylContainer = e.target.closest('.chatbot-mini-vinyl-container');
      if (vinylContainer) {
          const trackTitle = vinylContainer.querySelector('.chatbot-mini-vinyl-title')?.innerText;
          this.core.trackEvent('vinyl_player_clicked', trackTitle || 'unknown_track');
      }
    });
  }

  handleClearChat() {
    this.widgetConversationBoard.addEventListener('click', async (e) => {
      const clearBtn = e.target.closest('.chatbot__clear-inline');
      if (clearBtn) {
        if (await this.showCustomConfirm("Are you sure you want to delete this specific message?")) {
          const userMessageNode = clearBtn.closest('.chatbot__conversation-board__message-container.reversed');
          if (userMessageNode) {
            let nextNode = userMessageNode.nextElementSibling;
            
            // Remove the associated bot response if the next bubble is not a user
            if (nextNode && nextNode.classList.contains('chatbot__conversation-board__message-container') && !nextNode.classList.contains('reversed')) {
               nextNode.remove();
            }
            
            userMessageNode.remove();
            
            // We do NOT clear localStorage 'beatconnect_chat_context' so it remembers the overarching conversation topic
            // Just update the visual state
            localStorage.setItem('beatconnect_chat_history', this.widgetConversationBoard.innerHTML);
          }
        }
      }
    });
  }

  handleEditChat() {
    this.widgetConversationBoard.addEventListener('click', (e) => {
      const editBtn = e.target.closest('.chatbot__edit-inline');
      if (editBtn) {
        const messageContainer = e.target.closest('.chatbot__conversation-board__message-container');
        if (messageContainer) {
          const textSpan = messageContainer.querySelector('.chatbot__conversation-board__message__bubble span');
          if (textSpan && textSpan.innerText) {
            this.widgetQuestionInput.value = textSpan.innerText;
            this.widgetQuestionInput.focus();
            this.widgetQuestionInput.dispatchEvent(new Event('input', { bubbles: true }));
          }
        }
      }
    });
  }

  handleShowChat() {
    this.entryButton.addEventListener('click', () => {
      this.widgetContainer.classList.remove('d-none')
      this.entryButton.classList.add('d-none')

      // Small timeout to allow display:block paint before triggering animation
      setTimeout(() => {
        this.widgetContainer.classList.remove('chatbot-minimized');
        this.widgetConversationBoard.scrollTop = this.widgetConversationBoard.scrollHeight;
      }, 10)

      this.widgetQuestionInput.focus()
    })
  }

  handleInputTyping() {
    this.widgetQuestionInput.addEventListener('input', ({ target: { value } }) => {
      const canSend = !!value || !!this.pendingFile;
      this.widgetSendButton.disabled = !canSend;
      this.widgetSendButton.classList.toggle('opacity-6', !canSend);
    })
  }

  handleEnterPressed() {
    this.widgetQuestionInput.addEventListener('keyup', ({ key }) => {
      if (key === 'Enter') {
        this.widgetSendButton.click()
      }
    })
  }

  handleAttachmentButtons() {
    const uploadFileBtn = this.widgetContainer.querySelector('#upload-file-btn');
    const uploadImageBtn = this.widgetContainer.querySelector('#upload-image-btn');
    const hiddenFileInput = this.widgetContainer.querySelector('#chatbot-hidden-file-input');
    const hiddenImageInput = this.widgetContainer.querySelector('#chatbot-hidden-image-input');

    if (uploadFileBtn && hiddenFileInput) {
      uploadFileBtn.addEventListener('click', () => {
        hiddenFileInput.click();
      });
      hiddenFileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
          this.simulateUploadFeedback(e.target.files[0], 'document');
          hiddenFileInput.value = ''; // Reset
        }
      });
    }

    if (uploadImageBtn && hiddenImageInput) {
      uploadImageBtn.addEventListener('click', () => {
        hiddenImageInput.click();
      });
      hiddenImageInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
          this.simulateUploadFeedback(e.target.files[0], 'image');
          hiddenImageInput.value = ''; // Reset
        }
      });
    }
  }

  handleAudioRecording() {
    const recordBtn = this.widgetContainer.querySelector('#record-audio-btn');
    if (!recordBtn) return;

    recordBtn.addEventListener('click', async () => {
      // If already listening, manually stop
      if (this.core.isListening) {
        this.core.stopVoiceStreaming();
        return;
      }

      try {
        // Change UI to listening state
        recordBtn.classList.add('recording-active');
        this.widgetQuestionInput.placeholder = 'Listening... (Speak now)';
        this.widgetQuestionInput.disabled = true;

        await this.core.startVoiceStreaming({
          onListeningStop: () => {
            // Once VAD or Manual stop happens
            recordBtn.classList.remove('recording-active');
            this.widgetQuestionInput.placeholder = 'Type a message...';
            this.widgetQuestionInput.disabled = false;
            
            // Create a temporary bot answer bubble to show we are processing
            const chatbotAnswerFragment = document.createRange().createContextualFragment(CHATBOT_ANSWER(this.config.chatbotLogo));
            this.widgetConversationBoard.appendChild(chatbotAnswerFragment);
            this.widgetConversationBoard.scrollTop = this.widgetConversationBoard.scrollHeight;
            
            // We expect the next WS message to be an AI chunk from the Voice Stop trigger
            this.widgetSendButton.classList.add('d-none');
            if (this.widgetStopButton) this.widgetStopButton.classList.remove('d-none');
          }
        });

      } catch (err) {
        recordBtn.classList.remove('recording-active');
        this.widgetQuestionInput.disabled = false;
        this.widgetQuestionInput.placeholder = 'Type a message...';

        if (err.message.includes('PREMIUM_REQUIRED')) {
          this.showProModal(err.message, 'upgrade');
        } else {
          console.error('STT Voice Failed:', err);
          this.widgetQuestionInput.placeholder = 'Mic error. Try again?';
        }
      }
    });
  }

  async simulateUploadFeedback(file, type) {
    this.pendingFile = file;
    this.pendingFileType = type;
    this.widgetSendButton.disabled = false;
    this.widgetSendButton.classList.remove('opacity-6');

    let feedbackContent = `<em>Attached ${type}: <strong>${file.name}</strong></em><br>(Ready to send)`;
    
    if (type === 'image' || file.type.startsWith('image/')) {
      const dataUrl = await BeatConnectAI.fileToDataURL(file);
      feedbackContent = `<img src="${dataUrl}" style="max-width: 100px; border-radius: 8px; margin-bottom: 5px; opacity: 0.7;" alt="Preview" /><br>` + feedbackContent;
    }

    const userQuestionComponent = document.createRange().createContextualFragment(
      USER_QUESTION(feedbackContent, this.config.defaultAvatar)
    );
    this.widgetConversationBoard.appendChild(userQuestionComponent);

    let lastMessageElement = this.widgetConversationBoard.querySelector('.chatbot__conversation-board__message-container:last-child');
    this.widgetConversationBoard.scrollTop = this.widgetConversationBoard.scrollHeight;
  }

  showCustomConfirm(message) {
    return new Promise((resolve) => {
      const modalFragment = document.createRange().createContextualFragment(CHATBOT_MODAL(message));
      const chatWindow = this.widgetContainer.querySelector(`#chatbot_${this.config.chatbotId}`);
      chatWindow.appendChild(modalFragment);

      const overlay = chatWindow.querySelector('#chatbot-modal-overlay');
      const okBtn = overlay.querySelector('#chatbot-modal-ok');
      const cancelBtn = overlay.querySelector('#chatbot-modal-cancel');

      // Small delay to trigger transition
      setTimeout(() => overlay.classList.add('active'), 10);

      const cleanup = (result) => {
        overlay.classList.remove('active');
        setTimeout(() => {
          overlay.remove();
          resolve(result);
        }, 300);
      };

      okBtn.addEventListener('click', () => cleanup(true));
      cancelBtn.addEventListener('click', () => cleanup(false));
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) cleanup(false);
      });
    });
  }

  // --- Multi-Layer Security & NLP Filtering ---
  validateAndFilterInput(text) {
    if (!text) return text;

    // 1. Malicious Code Filtering
    const maliciousRegex = /<script|javascript:|onerror|eval\(|document\./gi;
    if (maliciousRegex.test(text)) {
      console.warn('[Security] Malicious code attempt blocked.');
      if (window.showToast) window.showToast('Invalid input detected.', 'error');
      return false;
    }

    // 2. Off-topic "Edge" NLP (Simple Keyword Check)
    const keywords = ['music', 'artist', 'song', 'band', 'album', 'rock', 'vocalist', 'guitar', 'legend', 'tour', 'record', 'how', 'what', 'who'];
    const lowerText = text.toLowerCase();
    const isRelated = keywords.some(k => lowerText.includes(k));
    
    // Very short messages like "hello" are allowed
    if (text.length > 15 && !isRelated) {
        console.warn('[NLP] Question seems off-topic. Edge processing reduced load.');
        // We let it pass but we could inform the user
    }

    return text;
  }
}

window.BeatConnectWidget = {
  init: function(customConfig = {}) {
    return new ChatbotWidget({
      position: customConfig.position,
      chatbotLogo: customConfig.chatbotLogo || '',
      defaultAvatar: customConfig.defaultAvatar || '',
      welcomeMessage: customConfig.welcomeMessage || 'Welcome to BeatConnect! What\'s on your mind? 🎧',
      stream: customConfig.stream !== undefined ? customConfig.stream : true,
      model: customConfig.model || 'llama3.2', // using lightweight 3.2B parameter model for speed
      chatEndpoint: customConfig.chatEndpoint || 'http://localhost:3000/api/chat',
    });
  }
};
