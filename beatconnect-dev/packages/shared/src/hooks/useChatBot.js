import { useState, useEffect, useCallback, useRef } from 'react';
import { ChatAI } from '../chatbot/core/ChatAI';
import { getSystemSettings, ASSET_URL } from '../services/api';

export function useChatBot(config = {}) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isThinking, setIsThinking] = useState(false);
  const [isBotSpeaking, setIsBotSpeaking] = useState(false);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [lastIntelligenceUpdate, setLastIntelligenceUpdate] = useState(null);
  const [userAvatar, setUserAvatar] = useState('https://api.dicebear.com/7.x/avataaars/svg?seed=user');
  const [botAvatar, setBotAvatar] = useState(`${ASSET_URL}/bot-avatar.png`);
  
  const chatInstance = useRef(null);

  useEffect(() => {
    // Fetch system settings
    getSystemSettings().then(data => {
      if (data.user_avatar) setUserAvatar(data.user_avatar);
      if (data.bot_avatar) setBotAvatar(data.bot_avatar);
    }).catch(err => console.error('Failed to fetch HUD settings:', err));

    // Initialize ChatAI core logic
    chatInstance.current = new ChatAI({
      ...config,
      onIntelligenceRefresh: (data) => {
        setLastIntelligenceUpdate(data);
        setTimeout(() => setLastIntelligenceUpdate(null), 5000);
      },
      onMediaCommand: (cmd) => {
        // Handle media commands (e.g., play/stop visualizer pulse)
        window.dispatchEvent(new CustomEvent('beatbot:media', { detail: cmd }));
      }
    });

    // Load history from localStorage
    const savedHistory = localStorage.getItem('beatconnect_chat_history_react');
    if (savedHistory) {
      try {
        setMessages(JSON.parse(savedHistory));
      } catch (e) {
        console.error('Failed to load chat history:', e);
      }
    }

    return () => {
      if (chatInstance.current?.socket) {
        chatInstance.current.socket.disconnect();
      }
    };
  }, []);

  const saveHistory = useCallback((msgs) => {
    localStorage.setItem('beatconnect_chat_history_react', JSON.stringify(msgs));
  }, []);

  const sendMessage = useCallback(async (text, file = null) => {
    if (!text && !file) return;

    const userMsg = { id: Date.now(), role: 'user', content: text, file: file ? URL.createObjectURL(file) : null };
    setMessages(prev => [...prev, userMsg]);
    setIsThinking(true);

    const botMsgId = Date.now() + 1;
    const botMsg = { id: botMsgId, role: 'bot', content: '', isStreaming: true };
    setMessages(prev => [...prev, botMsg]);

    chatInstance.current.sendMessage({
      message: text,
      file: file,
      onChunk: (full) => {
        setIsBotSpeaking(true);
        setMessages(prev => prev.map(m => 
          m.id === botMsgId ? { ...m, content: full } : m
        ));
      },
      onComplete: (full) => {
        setMessages(prev => {
          const updated = prev.map(m => 
            m.id === botMsgId ? { ...m, content: full, isStreaming: false } : m
          );
          saveHistory(updated);
          return updated;
        });
        setIsThinking(false);
        setIsBotSpeaking(false);
      },
      onError: (err) => {
        setMessages(prev => prev.map(m => 
          m.id === botMsgId ? { ...m, content: `⚠️ ${err.message}`, isError: true, isStreaming: false } : m
        ));
        setIsThinking(false);
        setIsBotSpeaking(false);
      }
    });
  }, [saveHistory]);

  const toggleOpen = () => setIsOpen(prev => !prev);
  const toggleVoice = () => {
    const newState = chatInstance.current.toggleVoiceMode();
    setIsVoiceMode(newState);
  };

  const clearChat = () => {
    setMessages([]);
    chatInstance.current.clearContext();
    localStorage.removeItem('beatconnect_chat_history_react');
  };

  return {
    isOpen,
    toggleOpen,
    messages,
    sendMessage,
    isThinking,
    isVoiceMode,
    toggleVoice,
    clearChat,
    lastIntelligenceUpdate,
    userAvatar,
    botAvatar,
    isBotSpeaking
  };
}
