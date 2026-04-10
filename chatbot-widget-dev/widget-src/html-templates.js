import {ARROW_DOWN, SEND_ICON, TYPING_ICON, ATTACHMENT_ICON, CAMERA_ICON, TRASH_ICON, EDIT_ICON, RELOAD_ICON, STOP_ICON, PLUS_ICON, SHARE_TWITTER_ICON, COPY_ICON, MIC_ICON, SPEAKER_ICON} from './assets.js'

export const CHATBOT_COMPONENT = (chatbotId) => {
  return `
  <div class="--dark-theme" id="chatbot_${chatbotId}">
  
  <div class="chatbot__header">
    <div class="chatbot__header-title">Beat Bot</div>
    <div class="chatbot__header-actions">
      <div class="chatbot__voice-toggle chatbot__action-icon" title="Toggle Voice Mode" style="opacity: 0.5;">
        ${SPEAKER_ICON}
      </div>
      <div class="chatbot__new-chat chatbot__action-icon" title="New conversation">
        ${PLUS_ICON}
      </div>
      <div class="chatbot__reload chatbot__action-icon" title="Clear all history">
        ${RELOAD_ICON}
      </div>
      <div class="chatbot__collapse chatbot__action-icon" title="Minimize chat">
        ${ARROW_DOWN}
      </div>
    </div>
  </div>

  <div class="chatbot__conversation-board">
    <div id="chatbot__conversation-board__messages"></div>
  </div>

  <div class="chatbot__conversation-panel">
    <div class="chatbot__conversation-panel__container">
      <div class="chatbot__conversation-panel__left-actions">
        <button type="button" class="chatbot__conversation-panel__button custom-action-button" id="record-audio-btn" title="Hum to Search / Push to Talk">
          ${MIC_ICON}
        </button>
        <button type="button" class="chatbot__conversation-panel__button custom-action-button" id="upload-file-btn" title="Attach file">
          ${ATTACHMENT_ICON}
        </button>
        <button type="button" class="chatbot__conversation-panel__button custom-action-button" id="upload-image-btn" title="Send picture">
          ${CAMERA_ICON}
        </button>
      </div>
      
      <input class="chatbot__conversation-panel__input" placeholder="Type a message..."/>
      
      <button type="button" class="chatbot__conversation-panel__button btn-icon stop-message-button d-none">
        ${STOP_ICON}
      </button>
      <button type="button" class="chatbot__conversation-panel__button btn-icon send-message-button opacity-6">
        ${SEND_ICON}
      </button>
    </div>
  </div>
  <!-- Hidden file inputs to trigger browser dialogs -->
  <input type="file" id="chatbot-hidden-file-input" style="display: none;" />
  <input type="file" id="chatbot-hidden-image-input" accept="image/*" style="display: none;" />
</div>
  `
}

export const CHATBOT_ANSWER = (chatbotLogo, message = '', welcome = false, error = false) => {
  let spanClass = `response-text ${!message ? `d-none` : ''}  ${error ? `text-danger` : ''}`
  return `
    <div class="chatbot__conversation-board__message-container">
      <div class="chatbot__conversation-board__message__person">
        <div class="chatbot__conversation-board__message__person__avatar">
          <img src=${chatbotLogo} alt="Event tomorrow logo"/>
        </div>
        <span class="chatbot__conversation-board__message__person__nickname"></span>
      </div>
      <div class="chatbot__conversation-board__message__context">
        <div class="chatbot__conversation-board__message__bubble">
          ${TYPING_ICON(welcome)}
          <span class='${spanClass}'>${message}</span>
        </div>
        <div class="chatbot__message-actions ${!message ? 'd-none' : ''}">
           <div class="chatbot__action-share" title="Share quote to Twitter">
             ${SHARE_TWITTER_ICON}
           </div>
           <div class="chatbot__action-copy" title="Copy quote">
             ${COPY_ICON}
           </div>
        </div>
      </div>
    </div>
`
}

export const USER_QUESTION = (message, avatar) => {
  return `
  <div class="chatbot__conversation-board__message-container reversed">
    <div class="chatbot__conversation-board__message__context">
      <div class="chatbot__conversation-board__message__bubble">
        <span>${message}</span>
      </div>
      <div style="display: flex; justify-content: flex-end; gap: 8px; margin-top: 4px; padding-right: 5px;">
        <div class="chatbot__edit-inline" title="Edit message" style="cursor: pointer; color: #a3a3a3; width: 16px; height: 16px;">
          ${EDIT_ICON}
        </div>
        <div class="chatbot__clear-inline" title="Delete conversation" style="cursor: pointer; color: #a3a3a3; width: 16px; height: 16px;">
          ${TRASH_ICON}
        </div>
      </div>
    </div>
  </div>
 `
}

export const PRO_MODAL = (message, type = 'upgrade') => {
  const icon = type === 'upgrade' ? '✨' : '🎵';
  const btnText = type === 'upgrade' ? 'Upgrade to PRO' : 'Link Spotify';
  const id = type === 'upgrade' ? 'chatbot-modal-pro-ok' : 'chatbot-modal-spotify-ok';

  return `
    <div class="chatbot__modal-overlay" id="chatbot-modal-overlay">
      <div class="chatbot__modal">
        <div style="font-size: 2em; margin-bottom: 10px;">${icon}</div>
        <div class="chatbot__modal-text" style="font-weight: bold; margin-bottom: 15px;">${message}</div>
        <div class="chatbot__modal-buttons">
          <button class="chatbot__modal-btn chatbot__modal-btn--secondary" id="chatbot-modal-cancel">Maybe Later</button>
          <button class="chatbot__modal-btn chatbot__modal-btn--primary" id="${id}">${btnText}</button>
        </div>
      </div>
    </div>
  `
}

export const CHATBOT_MODAL = (message) => {
  return `
    <div class="chatbot__modal-overlay" id="chatbot-modal-overlay">
      <div class="chatbot__modal">
        <div class="chatbot__modal-text" style="margin-bottom: 15px;">${message}</div>
        <div class="chatbot__modal-buttons">
          <button class="chatbot__modal-btn chatbot__modal-btn--secondary" id="chatbot-modal-cancel">Cancel</button>
          <button class="chatbot__modal-btn chatbot__modal-btn--primary" id="chatbot-modal-ok">OK</button>
        </div>
      </div>
    </div>
  `
}
