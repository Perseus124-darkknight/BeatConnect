import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Search, MessageSquare, Trash2,
  Camera, Send, Mic, Sparkles, AlertCircle
} from 'lucide-react';
import { cn } from '@shared/services/utils';
import { MessageItem } from './MessageItem';
import { NeonVisualizer } from './NeonVisualizer';

export function ChatWindow({
  messages,
  sendMessage,
  isThinking,
  isBotSpeaking,
  onClose,
  onClear,
  lastIntelligenceUpdate,
  botLogo,
  userAvatar
}) {
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isThinking]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const text = inputRef.current.value.trim();
    if (text) {
      sendMessage(text);
      inputRef.current.value = '';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.1, y: 100, x: 50, rotate: -5 }}
      animate={{ opacity: 1, scale: 1, y: 0, x: 0, rotate: 0 }}
      exit={{ opacity: 0, scale: 0.1, y: 100, x: 50, rotate: 5 }}
      transition={{
        type: "spring",
        damping: 18,
        stiffness: 120,
        mass: 0.8
      }}
      className="fixed bottom-28 right-7 w-[420px] max-w-[calc(100vw-40px)] h-[700px] max-h-[calc(100vh-140px)] rounded-[32px] overflow-hidden flex flex-col z-[10000] shadow-2xl border border-white/10 bg-[#0a0a12]/95 saturate-150"
    >
      {/* Background Visualizer Layer */}
      <NeonVisualizer isActive={isBotSpeaking} />
      {/* Header */}
      <div className="relative z-10 p-5 bg-gradient-to-br from-secondary/20 to-primary/20 border-b border-white/10 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-10 h-10 rounded-2xl overflow-hidden border border-white/20 shadow-lg transition-all duration-1000",
            isThinking && "ring-4 ring-secondary/40 shadow-[0_0_20px_rgba(6,182,212,0.5)]"
          )}>
            <img src={botLogo} alt="BeatBot 2.0" className="w-full h-full object-cover" />
          </div>
          <div className="flex flex-col">
            <h3 className="text-white font-bold text-lg leading-tight uppercase tracking-tighter italic">BeatBot</h3>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,1)]" />
              <span className="text-[10px] text-white/40 font-mono uppercase tracking-widest">Your reliable music buddy</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onClear} className="w-9 h-9 rounded-xl flex items-center justify-center text-white/40 hover:text-red-400 hover:bg-white/5 transition-all">
            <Trash2 size={18} />
          </button>
          <button onClick={onClose} className="w-9 h-9 rounded-xl flex items-center justify-center text-white/40 hover:text-white hover:bg-white/5 transition-all">
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Intelligence Banner */}
      <AnimatePresence>
        {lastIntelligenceUpdate && (
          <motion.div
            initial={{ height: 0, opacity: 0, y: -20, scale: 0.8 }}
            animate={{ height: 'auto', opacity: 1, y: 0, scale: 1 }}
            exit={{ height: 0, opacity: 0, scale: 0.8 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="relative z-10 overflow-hidden bg-secondary/10 border-b border-secondary/20 shrink-0"
          >
            <div className="px-5 py-2.5 flex items-center gap-3 text-secondary text-xs font-medium">
              <Sparkles size={14} className="animate-pulse" />
              <span>{lastIntelligenceUpdate.message}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>


      {/* Message Feed */}
      <div
        ref={scrollRef}
        className="relative z-10 flex-1 overflow-y-auto p-5 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent hover:scrollbar-thumb-white/20 transition-all"
      >
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-40">
            <div className="w-16 h-16 bg-white/5 rounded-3xl flex items-center justify-center mb-4">
              <MessageSquare className="text-white" size={32} />
            </div>
            <h4 className="text-white text-lg font-bold mb-2">BeatBot</h4>
            <p className="text-white/60 text-sm">Ask about artists, daily reports, or music history.</p>
          </div>
        )}
        {messages.map((m) => (
          <MessageItem key={m.id} message={m} botLogo={botLogo} userAvatar={userAvatar} />
        ))}
        {isThinking && messages[messages.length - 1]?.role !== 'bot' && (
          <MessageItem message={{ role: 'bot', content: '' }} botLogo={botLogo} userAvatar={userAvatar} />
        )}
      </div>

      {/* Input Pad */}
      <div className="relative z-10 p-5 pt-0 shrink-0">
        <form
          onSubmit={handleSubmit}
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-2 focus-within:border-secondary/50 focus-within:ring-4 focus-within:ring-secondary/10 transition-all shadow-xl"
        >
          <div className="flex items-center gap-2">
            <button type="button" className="w-10 h-10 rounded-2xl flex items-center justify-center text-white/30 hover:text-white hover:bg-white/5 transition-all">
              <Camera size={20} />
            </button>
            <textarea
              ref={inputRef}
              placeholder="Ask anything..."
              className="flex-1 bg-transparent border-none outline-none text-white text-sm py-2.5 resize-none max-h-32 placeholder:text-white/20"
              rows={1}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
            <button
              type="submit"
              disabled={isThinking}
              className={cn(
                "w-10 h-10 rounded-2xl flex items-center justify-center transition-all",
                isThinking
                  ? "bg-white/5 text-white/20 cursor-not-allowed"
                  : "bg-secondary text-white shadow-lg shadow-secondary/20 hover:scale-105 active:scale-95"
              )}
            >
              <Send size={18} />
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
}
