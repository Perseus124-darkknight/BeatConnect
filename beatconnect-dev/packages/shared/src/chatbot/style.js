export const CHATBOT_CSS = (chatbotId) => `
<style>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');

/* ─── Themes (Beatbot 2.0 Premium) ─────────────────────────────────── */
.--glass-theme {
    --cb-bg: rgba(10, 10, 18, 0.75);
    --cb-header-bg: linear-gradient(135deg, rgba(6, 182, 212, 0.25) 0%, rgba(168, 85, 247, 0.25) 100%);
    --cb-panel-bg: rgba(20, 20, 32, 0.5);
    --cb-bubble-bot: rgba(30, 30, 48, 0.65);
    --cb-bubble-user: linear-gradient(135deg, #06b6d4 0%, #8b5cf6 100%);
    --cb-border: rgba(255, 255, 255, 0.12);
    --cb-border-focus: rgba(34, 211, 238, 0.7);
    --cb-text: #f1f5f9;
    --cb-text-muted: rgba(255, 255, 255, 0.45);
    --cb-send-btn: linear-gradient(135deg, #06b6d4, #8b5cf6);
    --cb-scrollbar: rgba(255, 255, 255, 0.08);
    --cb-glow-cyan: rgba(6, 182, 212, 0.6);
    --cb-glow-purple: rgba(168, 85, 247, 0.6);
    --cb-chip-bg: rgba(6, 182, 212, 0.15);
    --cb-chip-border: rgba(6, 182, 212, 0.4);
    --cb-chip-text: #22d3ee;
}

/* ─── Animations ───────────────────────────────────────────────────── */
@keyframes cb-fade-in-fast {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
}

@keyframes cb-row-entrance {
    0% { opacity: 0; transform: translateX(-15px) scale(0.95); }
    100% { opacity: 1; transform: translateX(0) scale(1); }
}

@keyframes cb-glow-pulse {
    0% { box-shadow: 0 0 5px var(--cb-glow-cyan); }
    50% { box-shadow: 0 0 20px var(--cb-glow-cyan), 0 0 40px var(--cb-glow-purple); }
    100% { box-shadow: 0 0 5px var(--cb-glow-cyan); }
}

@keyframes cb-btn-float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-5px); }
}

@keyframes cb-btn-gradient {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
}

/* ─── Entry Button ─────────────────────────────────────────────────── */
#chatbot-entry-button_${chatbotId} {
    background: linear-gradient(135deg, #22d3ee 0%, #a855f7 50%, #ec4899 100%);
    background-size: 200% 200%;
    animation: cb-btn-gradient 4s ease infinite, cb-btn-float 3s ease-in-out infinite;
    border: 1px solid rgba(255, 255, 255, 0.3);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.3);
    width: 64px; height: 64px; border-radius: 50%;
    position: fixed; right: 28px; bottom: 28px; z-index: 10000;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    color: #fff;
}
#chatbot-entry-button_${chatbotId}:hover {
    transform: scale(1.1) rotate(5deg);
    box-shadow: 0 15px 40px rgba(34, 211, 238, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.5);
}

/* ─── Widget Container ─────────────────────────────────────────────── */
#chatbot_${chatbotId} {
    font-family: 'Outfit', sans-serif;
    background: var(--cb-bg);
    backdrop-filter: blur(40px) saturate(180%);
    -webkit-backdrop-filter: blur(40px) saturate(180%);
    box-shadow: 0 25px 60px rgba(0, 0, 0, 0.6), 0 0 0 1px var(--cb-border);
    width: 420px; max-width: calc(100vw - 40px);
    height: 700px; max-height: calc(100vh - 120px);
    border-radius: 32px;
    position: fixed; right: 28px; bottom: 108px;
    z-index: 10000; overflow: hidden;
    display: flex; flex-direction: column;
    transition: transform 0.6s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.4s ease;
    color: var(--cb-text);
}
.chatbot-minimized #chatbot_${chatbotId} {
    transform: translate(30px, 100px) scale(0.8);
    opacity: 0; pointer-events: none;
}

/* ─── Header ───────────────────────────────────────────────────────── */
.chatbot__header {
    padding: 18px 20px;
    background: var(--cb-header-bg);
    border-bottom: 1px solid var(--cb-border);
    display: flex; align-items: center; justify-content: space-between;
}
.chatbot__header-left { display: flex; align-items: center; gap: 12px; }
.chatbot__bot-avatar {
    width: 40px; height: 40px; border-radius: 14px; overflow: hidden;
    border: 1px solid rgba(255,255,255,0.2);
}
.chatbot__bot-avatar img { width: 100%; height: 100%; object-fit: cover; }
.chatbot__bot-avatar.thinking {
    animation: cb-glow-pulse 2s infinite;
}
.chatbot__header-title { font-weight: 700; font-size: 1.1rem; color: #fff; }
.chatbot__header-subtitle { font-size: 11px; color: var(--cb-text-muted); }
.chatbot__status-dot {
    width: 8px; height: 8px; background: #10b981; border-radius: 50%;
    box-shadow: 0 0 8px #10b981;
}

/* ─── Messages ─────────────────────────────────────────────────────── */
.chatbot__conversation-board {
    flex: 1; overflow-y: auto; padding: 20px;
    scrollbar-width: thin; scrollbar-color: var(--cb-scrollbar) transparent;
}
.chatbot__conversation-board::-webkit-scrollbar { width: 4px; }
.chatbot__conversation-board::-webkit-scrollbar-thumb { background: var(--cb-scrollbar); border-radius: 10px; }

.chatbot__msg-row {
    margin-bottom: 16px;
    animation: cb-row-entrance 0.5s cubic-bezier(0.22, 1, 0.36, 1) both;
    display: flex; gap: 12px;
}
.chatbot__msg-row.user { flex-direction: row-reverse; animation-name: cb-fade-in-fast; }
.chatbot__msg-row.bot { animation-delay: 0.1s; }

.chatbot__avatar { width: 34px; height: 34px; border-radius: 10px; overflow: hidden; align-self: flex-end; }
.chatbot__avatar img { width: 100%; height: 100%; object-fit: cover; }

.chatbot__bubble {
    padding: 12px 16px;
    border-radius: 20px 20px 20px 6px;
    background: var(--cb-bubble-bot);
    border: 1px solid var(--cb-border);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
    font-size: 0.95rem; line-height: 1.6;
    color: var(--cb-text);
}
.chatbot__msg-row.user .chatbot__bubble {
    background: var(--cb-bubble-user);
    border-radius: 20px 20px 6px 20px;
    box-shadow: 0 8px 32px rgba(6, 182, 212, 0.2);
    color: #fff;
}

/* ─── Visualizer ───────────────────────────────────────────────────── */
.chatbot__visualizer-container {
    height: 3px;
    background: transparent;
    overflow: hidden;
    display: flex; align-items: flex-end; gap: 2px;
    padding: 0 20px;
    margin-bottom: -1px;
}
.chatbot__visualizer-bar {
    flex: 1; height: 1px;
    background: linear-gradient(to top, #06b6d4, #8b5cf6);
    opacity: 0.7;
    transition: height 0.1s ease;
}

/* ─── Input Panel ──────────────────────────────────────────────────── */
.chatbot__panel-wrap {
    padding: 12px 20px 20px;
}
.chatbot__conversation-panel {
    background: var(--cb-panel-bg);
    border: 1px solid var(--cb-border);
    border-radius: 24px;
    backdrop-filter: blur(20px);
    padding: 8px 12px;
    display: flex; align-items: center; gap: 8px;
}
.chatbot__conversation-panel:focus-within {
    border-color: var(--cb-border-focus);
    box-shadow: 0 0 15px rgba(34, 211, 238, 0.2);
}

.chatbot__conversation-panel__input {
    flex: 1; border: none; background: transparent; color: #fff;
    outline: none; font-size: 0.95rem; padding: 4px 0;
    resize: none; max-height: 150px;
}

.send-message-button {
    background: var(--cb-send-btn);
    width: 42px; height: 42px; border-radius: 14px;
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 5px 15px rgba(6, 182, 212, 0.4);
    border: none; cursor: pointer; color: #fff;
}

/* ─── Suggestions ─────────────────────────────────────────────────── */
.chatbot__suggestions {
    display: flex; flex-wrap: wrap; gap: 8px;
    padding: 0 20px 10px 66px;
}
.chatbot__chip {
    background: var(--cb-chip-bg);
    border: 1px solid var(--cb-chip-border);
    color: var(--cb-chip-text);
    padding: 6px 14px;
    border-radius: 12px;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    cursor: pointer; text-decoration: none;
}
.chatbot__chip:hover {
    background: rgba(34, 211, 238, 0.25);
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(34, 211, 238, 0.3);
}

/* ─── Intelligence Refresh Banner ─────────────────────────────────── */
.chatbot__refresh-banner {
    background: rgba(34, 211, 238, 0.15);
    border: 1px solid rgba(34, 211, 238, 0.3);
    color: #22d3ee;
    padding: 10px 16px;
    font-size: 11px;
    border-radius: 14px;
    margin: 8px 20px;
    display: flex; align-items: center; gap: 10px;
    animation: cb-fade-in-fast 0.3s ease both;
}

.d-none { display: none !important; }
.opacity-6 { opacity: 0.45 !important; }
.text-danger { color: #f87171 !important; }

.response-text a { color: #22d3ee; font-weight: 600; text-decoration: none; border-bottom: 1px dashed rgba(34, 211, 238, 0.4); }
.response-text strong { color: #fff; }

.chatbot__header-actions { display: flex; gap: 8px; }
.chatbot__action-icon {
    width: 34px; height: 34px; border-radius: 10px;
    background: rgba(255,255,255,0.08); display: flex;
    align-items: center; justify-content: center; cursor: pointer;
    color: var(--cb-text-muted); transition: all 0.2s;
}
.chatbot__action-icon:hover { background: rgba(255,255,255,0.15); color: #fff; }
</style>
`;
