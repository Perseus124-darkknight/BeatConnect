import {
  ARROW_DOWN, SEND_ICON, STOP_ICON, PLUS_ICON,
  RELOAD_ICON, COPY_ICON, MIC_ICON, SPEAKER_ICON,
  CAMERA_ICON, THUMBS_UP_ICON, THUMBS_DOWN_ICON, SPARKLE_ICON
} from './assets.js';

/* ──────────────────────────────────────────────
   Main widget shell
────────────────────────────────────────────── */
export const CHATBOT_COMPONENT = (chatbotId, botLogo) => `
<div class="--glass-theme" id="chatbot_${chatbotId}">
  <!-- Header -->
  <div class="chatbot__header">
    <div class="chatbot__header-left">
      <div class="chatbot__bot-avatar" id="cb-bot-avatar-${chatbotId}">
        <img src="${botLogo}" alt="BeatBot 2.0" />
      </div>
      <div class="chatbot__header-info">
        <div class="chatbot__header-title">BeatBot 2.0</div>
        <div class="chatbot__status-container">
          <div class="chatbot__status-dot"></div>
          <div class="chatbot__header-subtitle">Real-time Intelligence</div>
        </div>
      </div>
    </div>
    <div class="chatbot__header-actions">
      <div class="chatbot__voice-toggle chatbot__action-icon" title="Hum to Search" id="cb-voice-toggle-${chatbotId}">
        ${MIC_ICON}
      </div>
      <div class="chatbot__new-chat chatbot__action-icon" title="New conversation">
        ${PLUS_ICON}
      </div>
      <div class="chatbot__collapse chatbot__action-icon" title="Minimize">
        ${ARROW_DOWN}
      </div>
    </div>
  </div>

  <!-- Real-time Intelligence Banner (Hidden by default) -->
  <div id="cb-refresh-banner-${chatbotId}" class="chatbot__refresh-banner d-none">
    <span>💡</span>
    <span class="refresh-text">Grounding data updated...</span>
  </div>

  <!-- Audio Visualizer (Neon Pulse) -->
  <div class="chatbot__visualizer-container" id="cb-visualizer-${chatbotId}">
    <div class="chatbot__visualizer-bar"></div><div class="chatbot__visualizer-bar"></div><div class="chatbot__visualizer-bar"></div><div class="chatbot__visualizer-bar"></div><div class="chatbot__visualizer-bar"></div><div class="chatbot__visualizer-bar"></div><div class="chatbot__visualizer-bar"></div><div class="chatbot__visualizer-bar"></div><div class="chatbot__visualizer-bar"></div><div class="chatbot__visualizer-bar"></div><div class="chatbot__visualizer-bar"></div><div class="chatbot__visualizer-bar"></div>
  </div>

  <!-- Messages -->
  <div class="chatbot__conversation-board" id="cb-board-${chatbotId}">
    <div id="chatbot__conversation-board__messages"></div>
    <button class="chatbot__scroll-bottom d-none" id="scroll-to-bottom-btn">
      ${ARROW_DOWN} New Pulse
    </button>
  </div>

  <!-- Input panel -->
  <div class="chatbot__panel-wrap">
    <div class="chatbot__conversation-panel" id="cb-panel-${chatbotId}">
      <button type="button" class="chatbot__panel-btn" id="upload-image-btn" title="Analysis Mode">
        ${CAMERA_ICON}
      </button>

      <textarea
        class="chatbot__conversation-panel__input"
        placeholder="Ask anything about BeatConnect..."
        rows="1"
        id="cb-input-${chatbotId}"
      ></textarea>

      <div class="chatbot__send-area">
        <button type="button" class="send-message-button">
          ${SPARKLE_ICON}
        </button>
      </div>
    </div>
  </div>

  <!-- Hidden file inputs -->
  <input type="file" id="chatbot-hidden-image-input" accept="image/*" style="display:none;" />
</div>
`;

/* ──────────────────────────────────────────────
   Bot message bubble
────────────────────────────────────────────── */
export const CHATBOT_ANSWER = (chatbotLogo, message = '', error = false) => {
  const ts = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const hasMsg = !!message;
  
  return `
  <div class="chatbot__msg-row bot last-in-group">
    <div class="chatbot__avatar">
      <img src="${chatbotLogo}" alt="BeatBot" />
    </div>
    <div class="chatbot__bubble-wrap">
      <div class="chatbot__bubble">
        <div class="chatbot__typing ${hasMsg ? 'd-none' : ''}">
          <div class="chatbot__typing-dot"></div>
          <div class="chatbot__typing-dot"></div>
          <div class="chatbot__typing-dot"></div>
        </div>
        <span class="response-text ${!hasMsg ? 'd-none' : ''} ${error ? 'text-danger' : ''}">${message}</span>
      </div>
      <div class="chatbot__meta ${!hasMsg ? 'd-none' : ''}">
        <span class="chatbot__meta-time">${ts}</span>
        <div class="chatbot__meta-actions">
          <button class="chatbot__meta-btn chatbot__action-copy" title="Copy">
            ${COPY_ICON} Copy
          </button>
          <button class="chatbot__meta-btn chatbot__action-like" title="Good response">
            ${THUMBS_UP_ICON}
          </button>
          <button class="chatbot__meta-btn chatbot__action-dislike" title="Bad response">
            ${THUMBS_DOWN_ICON}
          </button>
        </div>
      </div>
    </div>
  </div>`;
};

/* ──────────────────────────────────────────────
   User message bubble
────────────────────────────────────────────── */
export const USER_QUESTION = (message) => {
  const ts = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const safe = message.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  return `
  <div class="chatbot__msg-row user last-in-group">
    <div class="chatbot__bubble-wrap">
      <div class="chatbot__bubble">${safe}</div>
      <div class="chatbot__meta">
        <span class="chatbot__meta-time">${ts}</span>
      </div>
    </div>
  </div>`;
};

/* ──────────────────────────────────────────────
   Artist suggestion chip row
────────────────────────────────────────────── */
export const SUGGESTION_CHIPS = (chips = []) => {
  if (!chips.length) return '';
  const items = chips.map(({ label, href }) =>
    `<a class="chatbot__chip" href="${href}" target="_blank" rel="noopener">
       <span class="chatbot__chip-icon">🎵</span>${label}
     </a>`
  ).join('');
  return `<div class="chatbot__suggestions">${items}</div>`;
};

/* ──────────────────────────────────────────────
   Image user bubble
────────────────────────────────────────────── */
export const USER_IMAGE_BUBBLE = (previewUrl, caption = '') => `
  <div class="chatbot__msg-row user last-in-group">
    <div class="chatbot__bubble-wrap">
      <div class="chatbot__bubble" style="padding:6px;">
        <img src="${previewUrl}" style="max-width:200px;max-height:150px;border-radius:10px;display:block;" />
        ${caption ? `<div style="margin-top:6px;font-size:0.88rem;">${caption.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</div>` : ''}
      </div>
      <div class="chatbot__meta">
        <span class="chatbot__meta-time">${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
      </div>
    </div>
  </div>`;

/* ──────────────────────────────────────────────
   Date divider
────────────────────────────────────────────── */
export const DATE_DIVIDER = (label = 'Today') =>
  `<div class="chatbot__date-divider">${label}</div>`;
