import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@shared/services/utils';
import { marked } from 'marked';

export function MessageItem({ message, botLogo, userAvatar }) {
  const isBot = message.role === 'bot';
  
  const formattedContent = marked.parse(message.content || '');

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={cn(
        "flex gap-3 mb-4 w-full",
        !isBot && "flex-row-reverse"
      )}
    >
      {/* Avatar */}
      <div className={cn(
        "w-8 h-8 rounded-xl overflow-hidden flex-shrink-0 border border-white/10 shadow-lg",
        isBot ? "bg-secondary/20" : "bg-primary/20"
      )}>
        <img 
          src={isBot ? botLogo : (userAvatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=user")} 
          alt={isBot ? "Bot" : "User"}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Bubble */}
      <div className={cn(
        "max-w-[80%] flex flex-col",
        !isBot && "items-end"
      )}>
        <div className={cn(
          "px-4 py-3 rounded-2xl shadow-xl text-[0.95rem] leading-relaxed break-words border",
          isBot 
            ? "bg-white/5 border-white/10 text-slate-100 rounded-bl-sm" 
            : "bg-gradient-to-br from-primary to-purple-600 border-white/20 text-white rounded-br-sm shadow-primary/20"
        )}>
          {message.content ? (
            <div 
              className="prose prose-invert prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: formattedContent }}
            />
          ) : (
            /* Typing Indicator */
            <div className="flex gap-1 py-1">
              {[0, 1, 2].map(i => (
                <motion.div
                  key={i}
                  className="w-1.5 h-1.5 bg-white/40 rounded-full"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                />
              ))}
            </div>
          )}
        </div>
        
        {/* Meta */}
        <span className="text-[10px] text-white/30 mt-1 uppercase tracking-widest font-mono">
          {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </motion.div>
  );
}
