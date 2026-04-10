export const CHATBOT_CSS = (chatbotId) => `
<style>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');

.--dark-theme {
    --chat-background: rgba(17, 17, 17, 0.98);
    --chat-panel-background: #1e1e1e;
    --chat-bubble-bot: #1e1e1e;
    --chat-bubble-user: #02a9f7;
    --chat-bubble-border-bot: rgba(255,255,255,0.1);
    --chat-bubble-border-user: transparent;
    --chat-add-button-background: #212324;
    --chat-send-button-background: #02a9f7;
    --chat-text-color: #ffffff;
    --chat-options-svg: #a3a3a3;
    --chat-container-border: #333;
    --chat-header-grad: linear-gradient(135deg, rgba(6, 182, 212, 0.15), rgba(236, 72, 153, 0.15));
}

.--glass-theme {
    --chat-background: rgba(15, 15, 20, 0.55);
    --chat-panel-background: rgba(30, 30, 40, 0.4);
    --chat-bubble-bot: rgba(40, 40, 50, 0.4);
    --chat-bubble-user: linear-gradient(135deg, rgba(6, 182, 212, 0.8), rgba(59, 130, 246, 0.8));
    --chat-bubble-border-bot: rgba(255, 255, 255, 0.08);
    --chat-bubble-border-user: rgba(255, 255, 255, 0.15);
    --chat-add-button-background: rgba(255, 255, 255, 0.05);
    --chat-send-button-background: linear-gradient(135deg, #06b6d4, #b000ba);
    --chat-text-color: #ffffff;
    --chat-options-svg: #c4c4cc;
    --chat-container-border: rgba(255, 255, 255, 0.1);
    --chat-header-grad: linear-gradient(135deg, rgba(6, 182, 212, 0.2), rgba(236, 72, 153, 0.2));
}

.--light-theme {
    --chat-background: rgba(250, 250, 250, 0.98);
    --chat-panel-background: #ffffff;
    --chat-bubble-bot: #ffffff;
    --chat-bubble-user: #02a9f7;
    --chat-bubble-border-bot: #dddddd;
    --chat-bubble-border-user: transparent;
    --chat-add-button-background: #e2e2e2;
    --chat-send-button-background: #02a9f7;
    --chat-text-color: #333333;
    --chat-options-svg: #666666;
    --chat-container-border: #dddddd;
    --chat-header-grad: linear-gradient(135deg, rgba(6, 182, 212, 0.1), rgba(236, 72, 153, 0.1));
}

:root {
    --chat-glow: rgba(236, 72, 153, 0.6);
    --chat-shadow-inset: rgba(6, 182, 212, 0.2);
}

* {
    box-sizing: border-box;
}

.d-none {
    display: none !important;
}
.opacity-6 {
    opacity: 0.6 !important;
    cursor: not-allowed !important;
}
.text-danger {
    color: #ef4444 !important;
}

#chatbot-entry-button_${chatbotId} {
    background: linear-gradient(135deg, #06b6d4, #ec4899);
    border: 1px solid rgba(255, 255, 255, 0.2);
    box-shadow: 0 4px 15px rgba(236, 72, 153, 0.4), inset 0 0 10px rgba(255,255,255,0.2);
    width: 60px;
    height: 60px;
    border-radius: 50%;
    position: fixed;
    right: 20px;
    bottom: 20px;
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    color: #fff;
}

#chatbot-entry-button_${chatbotId}:hover { 
    transform: scale(1.1) rotate(5deg);
    box-shadow: 0 8px 25px rgba(6, 182, 212, 0.5), inset 0 0 15px rgba(255,255,255,0.4);
}

#chatbot_${chatbotId} {
    font-family: 'Outfit', system-ui, -apple-system, sans-serif;
    background: var(--chat-background);
    backdrop-filter: blur(28px) saturate(150%);
    -webkit-backdrop-filter: blur(28px) saturate(150%);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.15);
    width: 400px; max-width: calc(100% - 40px); height: 650px;
    max-height: calc(100vh - 100px); margin: 0; 
    padding: 1rem 0.5rem; border-radius: 28px;
    position: fixed; right: 20px; bottom: 90px;
    overflow: hidden; border: 1px solid var(--chat-container-border);
    z-index: 9999; transform-origin: bottom right;
    transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.4s ease, border 0.3s ease;
    color: var(--chat-text-color);
}

.chatbot-minimized #chatbot_${chatbotId} { 
    transform: scale(0.8) translate(10%, 10%); 
    opacity: 0; 
    pointer-events: none; 
}

#chatbot_${chatbotId} .chatbot__header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 0.8rem 1.2rem; 
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    background: var(--chat-header-grad);
    border-radius: 20px;
    margin: 0 0.5rem;
}

#chatbot_${chatbotId} .chatbot__header-title { 
    font-weight: 600; 
    font-size: 1.15rem; 
    letter-spacing: 0.5px; 
    color: #fff; 
    text-shadow: 0 2px 4px rgba(0,0,0,0.3);
}

#chatbot_${chatbotId} .chatbot__header-actions { display: flex; gap: 8px; }

#chatbot_${chatbotId} .chatbot__action-icon {
    width: 32px; height: 32px; border-radius: 50%;
    background: rgba(255, 255, 255, 0.05); display: flex;
    align-items: center; justify-content: center; cursor: pointer;
    color: var(--chat-options-svg); 
    transition: all 0.2s ease;
    border: 1px solid rgba(255, 255, 255, 0.02);
}

#chatbot_${chatbotId} .chatbot__action-icon:hover { 
    background: rgba(255, 255, 255, 0.15); 
    color: #fff; 
    transform: translateY(-2px);
    border-color: rgba(255,255,255,0.1);
}

/* Custom Scrollbar for the conversation board */
#chatbot_${chatbotId} .chatbot__conversation-board::-webkit-scrollbar {
    width: 5px;
}
#chatbot_${chatbotId} .chatbot__conversation-board::-webkit-scrollbar-track {
    background: transparent;
}
#chatbot_${chatbotId} .chatbot__conversation-board::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.15);
    border-radius: 10px;
}
#chatbot_${chatbotId} .chatbot__conversation-board::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.3);
}

#chatbot_${chatbotId} .chatbot__conversation-board {
    padding: 0; overflow-y: auto; overflow-x: hidden;
    height: calc(100% - 140px); 
    margin-top: 1rem;
    padding-right: 4px;
    scroll-behavior: smooth;
}

#chatbot_${chatbotId} .chatbot__conversation-panel {
    background: var(--chat-panel-background); 
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 30px; 
    padding: 0 0.5rem; 
    height: 55px;
    margin: 15px 0.5rem 0 0.5rem; 
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    transition: all 0.3s ease;
}

#chatbot_${chatbotId} .chatbot__conversation-panel:focus-within {
    border-color: rgba(6, 182, 212, 0.4);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3), inset 0 0 10px rgba(6, 182, 212, 0.1);
}

#chatbot_${chatbotId} .chatbot__conversation-panel__container {
    display: flex; flex-direction: row; align-items: center;
    justify-content: space-between; height: 100%; gap: 6px;
}

#chatbot_${chatbotId} .chatbot__conversation-panel__left-actions {
    display: flex; gap: 4px; padding-left: 6px;
}

#chatbot_${chatbotId} .custom-action-button {
    background: transparent; border: none; padding: 6px; cursor: pointer;
    color: var(--chat-options-svg); transition: all 0.2s ease;
    border-radius: 50%; display: flex; align-items: center; justify-content: center;
}
#chatbot_${chatbotId} .custom-action-button svg {
    width: 22px; 
    height: 22px;
}
#chatbot_${chatbotId} .custom-action-button:hover {
    background: rgba(255,255,255,0.1); color: #fff;
}

#chatbot_${chatbotId} .chatbot__conversation-panel__input {
    flex: 1; height: 100%; outline: none; position: relative;
    color: var(--chat-text-color); font-size: 0.95rem; background: transparent;
    border: 0; font-family: inherit; padding: 0 8px; resize: none;
    font-weight: 300;
}
#chatbot_${chatbotId} .chatbot__conversation-panel__input::placeholder {
    color: rgba(255,255,255,0.4);
}

#chatbot_${chatbotId} .chatbot__conversation-panel .send-message-button {
    background: var(--chat-send-button-background); 
    height: 38px; min-width: 38px; border-radius: 50%;
    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); 
    border: none; cursor: pointer;
    color: #fff; display: flex; align-items: center; justify-content: center;
    box-shadow: 0 4px 10px rgba(6, 182, 212, 0.3);
}

#chatbot_${chatbotId} .chatbot__conversation-panel .send-message-button:hover {
    transform: scale(1.08);
    box-shadow: 0 6px 15px rgba(6, 182, 212, 0.5);
}

.chatbot__conversation-board__message-container { 
    position: relative; display: flex; flex-direction: row; 
    padding-top: 12px; margin: 0 0.5rem;
}
.chatbot__conversation-board__message-container.reversed {
    flex-direction: row-reverse;
}

.chatbot__conversation-board__message__person__avatar { 
    height: 36px; width: 36px; border-radius: 50%; 
    border: 2px solid rgba(6,182,212,0.4); overflow: hidden; 
    background: #111; margin-right: 12px;
    box-shadow: 0 4px 10px rgba(0,0,0,0.3);
}
.chatbot__conversation-board__message__person__avatar img { height: 100%; width: 100%; object-fit: cover; }

.chatbot__conversation-board__message__context {
    display: flex; flex-direction: column; max-width: 85%;
}

/* Default Bot Bubble */
.chatbot__conversation-board__message__bubble span {
    max-width: 100%; box-sizing: border-box; display: inline-block;
    word-wrap: break-word; white-space: pre-wrap; 
    background: var(--chat-bubble-bot);
    backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
    border: 1px solid var(--chat-bubble-border-bot); 
    font-size: 0.95rem; font-weight: 300; color: var(--chat-text-color);
    padding: 0.8em 1.2em; line-height: 1.5; 
    border-radius: 4px 20px 20px 20px;
    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
    animation: popIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

/* User Bubble */
.chatbot__conversation-board__message-container.reversed .chatbot__conversation-board__message__bubble span {
    background: var(--chat-bubble-user);
    border: 1px solid var(--chat-bubble-border-user);
    color: #fff;
    border-radius: 20px 4px 20px 20px;
    box-shadow: 0 6px 15px rgba(6, 182, 212, 0.25);
    font-weight: 400;
}

@keyframes popIn { 
    from { opacity: 0; transform: translateY(15px) scale(0.9); } 
    to { opacity: 1; transform: translateY(0) scale(1); } 
}

@keyframes blink { 50% { fill: transparent } }
.dot { animation: 1s blink infinite; fill: rgba(255,255,255,0.5); }
.dot:nth-child(2) { animation-delay: 250ms }
.dot:nth-child(3) { animation-delay: 500ms }

.chatbot-mini-vinyl-container {
    padding: 10px 0;
    display: flex; flex-direction: column; align-items: center; gap: 12px; margin-top: 15px;
}
.chatbot-mini-vinyl-record {
    position: relative; width: 120px; height: 120px; background: #111; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 6px 15px rgba(0,0,0,0.8), inset 0 0 10px rgba(0,0,0,0.9);
    animation: spin-vinyl 8s linear infinite !important;
}
.chatbot-mini-vinyl-grooves {
    position: absolute; width: 100%; height: 100%; border-radius: 50%;
    background: repeating-radial-gradient(#111, #111 2px, #1a1a1a 3px, #1a1a1a 4px);
}
.chatbot-mini-vinyl-label { position: relative; width: 44px; height: 44px; border-radius: 50%; object-fit: cover; z-index: 2; }
.chatbot-mini-vinyl-info { text-align: center; width: 100%; }
.chatbot-mini-vinyl-title { font-weight: 600; font-size: 1.1rem; color: #fff; margin-bottom: 4px; }
.chatbot-mini-vinyl-artist { font-size: 0.95rem; font-weight: 300; color: #ec4899; }
.chatbot-mini-vinyl-audio { height: 32px; width: 100%; outline: none; margin-top: 10px; border-radius: 16px; opacity: 0.9; }
@keyframes spin-vinyl { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

.chatbot-suggestion-btn {
    display: inline-flex; align-items: center; gap: 8px;
    background: rgba(255, 255, 255, 0.05); backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px;
    padding: 8px 14px; color: #fff; font-size: 0.85rem; font-weight: 500;
    cursor: pointer; transition: all 0.2s ease;
    font-family: inherit;
}
.chatbot-suggestion-btn:hover {
    background: rgba(255, 255, 255, 0.1);
    transform: translateY(-1px);
    border-color: rgba(6, 182, 212, 0.4);
}

.chatbot__message-actions { display: flex; gap: 8px; margin-top: 6px; margin-left: 8px; opacity: 1; }
.chatbot__action-share, .chatbot__action-copy {
    width: 28px; height: 28px; border-radius: 50%;
    background: rgba(255, 255, 255, 0.05); display: flex;
    align-items: center; justify-content: center; cursor: pointer;
    color: var(--chat-options-svg); transition: all 0.2s ease;
}
.chatbot__action-share:hover, .chatbot__action-copy:hover {
    background: rgba(255, 255, 255, 0.15); color: #fff;
}

#chatbot-modal-overlay {
    position: absolute; top: 0; left: 0; width: 100%; height: 100%;
    background: rgba(0,0,0,0.5); backdrop-filter: blur(4px);
    display: flex; align-items: center; justify-content: center; z-index: 1000;
    border-radius: 28px;
}
.chatbot__modal {
    background: var(--chat-panel-background); border: 1px solid rgba(255,255,255,0.1);
    backdrop-filter: blur(20px); border-radius: 16px; padding: 20px; width: 80%;
    text-align: center; box-shadow: 0 10px 30px rgba(0,0,0,0.5);
    animation: popIn 0.3s cubic-bezier(0.16, 1, 0.3, 1); color: #fff;
}
.chatbot__modal-text {
    margin-bottom: 20px; font-weight: 400; font-size: 1rem;
}
.chatbot__modal-buttons {
    display: flex; gap: 10px; justify-content: center;
}
.chatbot__modal-btn {
    border: none; padding: 8px 16px; border-radius: 8px; font-weight: 500;
    cursor: pointer; font-family: inherit; transition: all 0.2s ease;
}
.chatbot__modal-btn--secondary {
    background: rgba(255,255,255,0.1); color: #fff;
}
.chatbot__modal-btn--secondary:hover {
    background: rgba(255,255,255,0.2);
}
.chatbot__modal-btn--primary {
    background: linear-gradient(135deg, #06b6d4, #b000ba); color: #fff;
}
.chatbot__modal-btn--primary:hover {
    filter: brightness(1.1); transform: translateY(-1px);
}
</style>
`
