const fs = require('fs');
let code = fs.readFileSync('widget-src/main.js', 'utf8');

code = code.replace(/  fileToDataURL\(file\) \{[\s\S]*?    \};\n    reader.readAsDataURL\(file\);\n  \}\n/g, '');
code = code.replace(/  resizeImage\(file, maxDimension = 800\) \{[\s\S]*?\n  \}\n/g, '');
code = code.replace(/  dataURLToBlob\(dataURL\) \{[\s\S]*?\n  \}\n/g, '');
code = code.replace(/  playTTS\(text\) \{[\s\S]*?\n  \}\n/g, '');

code = code.replace(/this\.fileToDataURL\(file\)/g, 'BeatConnectAI.fileToDataURL(file)');

const handleSendReplacement = `  handleSendQuestion() {
    this.widgetSendButton.addEventListener('click', async () => {
      if (!this.widgetQuestionInput.value && !this.pendingFile) return;

      const questionValue = this.widgetQuestionInput.value.trim() || '';
      
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
        const imgHtml = \`<img src="\${dataUrl}" alt="Uploaded image" />\`;
        messageContent = (questionValue ? questionValue + '<br>' : '') + imgHtml;
        
        const resizedBlob = BeatConnectAI.dataURLToBlob(dataUrl);
        optimizedFile = new File([resizedBlob], currentFile.name, { type: 'image/jpeg' });
      } else if (currentFile) {
        messageContent = (questionValue ? questionValue + '<br>' : '') + \`<em>Attached file: \${currentFile.name}</em>\`;
      }

      const userComponentHtml = USER_QUESTION(messageContent, this.config.defaultAvatar);
      const userQuestionComponent = document.createRange().createContextualFragment(userComponentHtml);
      this.widgetConversationBoard.appendChild(userQuestionComponent);

      const chatbotAnswerFragment = document.createRange().createContextualFragment(CHATBOT_ANSWER(this.config.chatbotLogo));
      this.widgetConversationBoard.appendChild(chatbotAnswerFragment);

      let lastMessageElement = this.widgetConversationBoard.querySelector('.chatbot__conversation-board__message-container:last-child');
      this.widgetConversationBoard.scrollTop = this.widgetConversationBoard.scrollHeight;
      const responseElement = lastMessageElement.querySelector('.response-text');

      const cacheKey = \`beatconnect_cache_\${questionValue.toLowerCase()}\`;

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
          }
          responseElement.innerHTML = this.formatMarkdown(fullStreamedResponse);
          this.widgetConversationBoard.scrollTop = this.widgetConversationBoard.scrollHeight;
        },
        onComplete: async (fullStreamedResponse, isDoneFlag) => {
          // Check for iTunes Track Suggestion embedded in the final text
          let trackHtml = '';
          const trackRegex = /\\[TRACK:\\s*([^\\]]+)]/i;
          const trackMatch = fullStreamedResponse.match(trackRegex);
          if (trackMatch) {
            const trackQuery = trackMatch[1];
            try {
              const itunesRes = await fetch(\`https://itunes.apple.com/search?term=\${encodeURIComponent(trackQuery)}&entity=song&limit=1\`);
              const itunesData = await itunesRes.json();
              if (itunesData.results && itunesData.results.length > 0) {
                const track = itunesData.results[0];
                trackHtml = \`
                <div class="chatbot-mini-vinyl-container">
                    <div class="chatbot-mini-vinyl-record">
                        <div class="chatbot-mini-vinyl-grooves"></div>
                        <img src="\${track.artworkUrl100}" class="chatbot-mini-vinyl-label">
                        <div class="chatbot-mini-vinyl-hole"></div>
                    </div>
                    <div class="chatbot-mini-vinyl-info">
                        <div class="chatbot-mini-vinyl-title">\${track.trackName}</div>
                        <div class="chatbot-mini-vinyl-artist">\${track.artistName}</div>
                        <audio controls class="chatbot-mini-vinyl-audio" src="\${track.previewUrl}"></audio>
                    </div>
                </div>\`;
              }
            } catch (err) {
              console.error('iTunes API fetch failed:', err);
            }
            fullStreamedResponse = fullStreamedResponse.replace(trackRegex, '');
          }

          if (fullStreamedResponse.includes('SUGGESTION:')) {
            const suggestionRegex = /\\[SUGGESTION:\\s*([^|]+)\\|([^\\]]+)]/i;
            const match = fullStreamedResponse.match(suggestionRegex);
            if (match) {
              const artistName = match[1].trim();
              const artistUrl = match[2].trim();
              const url = new URL(artistUrl, window.location.origin);
              const isSamePage = window.location.pathname === url.pathname && window.location.search === url.search;
              
              fullStreamedResponse = fullStreamedResponse.replace(suggestionRegex, '');

              if (!isSamePage) {
                let suggestionHtml = \`<div style="margin-top: 10px;"><button class="chatbot-suggestion-btn" onclick="window.location.href='\${artistUrl}'"><svg viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg> View \${artistName} Profile →</button></div>\`;
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
          responseElement.innerHTML = \`Oops, something went wrong. \${e ? e.message : ''}\`;
          if (this.widgetStopButton) {
            this.widgetStopButton.classList.add('d-none');
          }
          this.widgetSendButton.classList.remove('d-none');
          responseElement.classList.remove('d-none');
          lastMessageElement.querySelector('svg').classList.add('d-none');
        }
      });
    });
  }`;

// Find handleSendQuestion definition and replace the entire function block
const startIdx = code.indexOf('handleSendQuestion() {');
if (startIdx !== -1) {
  // We look for the start of the next method which is `createWidgetConversation` to find the end of handleSendQuestion
  const endIdx = code.indexOf('createWidgetConversation(chatbotContainer) {', startIdx);
  if (endIdx !== -1) {
    code = code.substring(0, startIdx) + handleSendReplacement + '\n\n  ' + code.substring(endIdx);
  }
}

fs.writeFileSync('widget-src/main.js', code);
console.log('Refactor complete.');
