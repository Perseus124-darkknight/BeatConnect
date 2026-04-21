import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useChatBot } from '@shared/hooks/useChatBot';
import { ChatWindow } from './ChatWindow';
import { Sparkles, MessageSquare } from 'lucide-react';
import { cn } from '@shared/services/utils';
import { getSystemSettings, ASSET_URL } from '@shared/services/api';

export default function BeatBot({ 
  welcomeMessage = "Welcome to BeatConnect! What's on your mind? 🎧",
  chatbotLogo = `${ASSET_URL}/bot-avatar.png` 
}) {
  const {
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
  } = useChatBot({
    chatbotLogo,
    welcomeMessage
  });

  return (
    <div className="fixed bottom-7 right-7 z-[9999]">
      {/* Premium FAB */}
      <motion.button
        whileHover={{ scale: 1.1, rotate: [-5, 5, -5, 5, 0], backgroundColor: isOpen ? '#ffffff' : '#11111a' }}
        whileTap={{ scale: 0.85, rotate: -15, borderRadius: '40%' }}
        transition={{ 
          type: "spring", 
          stiffness: 400, 
          damping: 10,
          mass: 0.5
        }}
        onClick={toggleOpen}
        className={cn(
          "w-16 h-16 rounded-[22px] flex items-center justify-center shadow-2xl transition-colors duration-500 overflow-hidden relative group",
          isOpen 
            ? "bg-white text-[#0a0a12]" 
            : "bg-[#0a0a12] text-white border border-white/10"
        )}
      >
        {/* Ambient Glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-secondary to-primary opacity-0 group-hover:opacity-20 transition-opacity" />
        
        {/* Icon Toggle */}
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
            >
              <Sparkles size={28} />
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              className="relative w-full h-full p-2"
            >
              <img src={botAvatar} alt="BeatBot" className="w-full h-full object-cover rounded-2xl" />
              {/* Notification Pulse */}
              <span className="absolute top-2 right-2 w-3 h-3 bg-primary rounded-full border-2 border-[#0a0a12] shadow-[0_0_8px_rgba(236,72,153,1)]" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Main Chat Interface */}
      <AnimatePresence>
        {isOpen && (
          <ChatWindow
            messages={messages}
            sendMessage={sendMessage}
            isThinking={isThinking}
            isBotSpeaking={isBotSpeaking}
            onClose={toggleOpen}
            onClear={clearChat}
            lastIntelligenceUpdate={lastIntelligenceUpdate}
            botLogo={botAvatar}
            userAvatar={userAvatar}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
