import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@shared/services/utils';

export function NeonVisualizer({ isActive }) {
  const layer1Bars = Array.from({ length: 24 }); // Sub-Bass
  const layer2Bars = Array.from({ length: 48 }); // Resonance
  const layer3Bars = Array.from({ length: 84 }); // Analytical

  return (
    <div className="absolute inset-x-0 bottom-0 top-auto h-[35%] pointer-events-none z-0 overflow-hidden select-none">
      {/* 🟢 Layer 1: Sub-Bass (Deep Atmospheric Pulse) */}
      <div className={cn(
        "absolute inset-0 blur-[40px] transition-opacity duration-1000",
        isActive ? "opacity-30" : "opacity-0"
      )}>
        <div className="h-full flex items-end justify-center px-10 gap-4">
          {layer1Bars.map((_, i) => (
            <motion.div
              key={`bass-${i}`}
              className="flex-1 bg-secondary rounded-t-full"
              animate={isActive ? { height: ["10%", "50%", "20%", "70%", "15%"] } : { height: "0%" }}
              transition={{ duration: 3, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }}
            />
          ))}
        </div>
      </div>

      {/* 🔴 Layer 2: Resonance (Vibrant Middle Spectrum) */}
      <div className={cn(
        "absolute inset-0 blur-[15px] transition-opacity duration-700",
        isActive ? "opacity-40" : "opacity-5"
      )}>
        <div className="h-full flex items-end justify-center px-6 gap-2">
          {layer2Bars.map((_, i) => (
            <motion.div
              key={`res-${i}`}
              className="flex-1 bg-primary/80 rounded-t-full"
              animate={isActive ? { height: ["5%", "60%", "10%", "85%", "10%"] } : { height: "2px" }}
              transition={{ duration: 1.8, repeat: Infinity, delay: i * 0.05, ease: "easeInOut" }}
            />
          ))}
        </div>
      </div>

      {/* ⚪ Layer 3: Analytical (Sharp High-Frequency) */}
      <div className={cn(
        "absolute inset-0 flex items-end justify-center px-4 gap-[2px] transition-opacity duration-500",
        isActive ? "opacity-60" : "opacity-10"
      )}>
        {layer3Bars.map((_, i) => (
          <motion.div
            key={`ana-${i}`}
            className="flex-1 min-w-[2px] bg-white/40 rounded-t-full border-t border-white/20"
            animate={isActive ? {
              height: ["10%", "40%", "15%", "95%", "20%"],
              backgroundColor: ["rgba(255,255,255,0.2)", "rgba(6,182,212,0.6)", "rgba(255,255,255,0.2)"]
            } : {
              height: "2px",
              backgroundColor: "rgba(255,255,255,0.1)"
            }}
            transition={{ duration: 0.8 + Math.random(), repeat: Infinity, delay: i * 0.012, ease: "linear" }}
          />
        ))}
      </div>
      {/* Finishing Masks */}
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#0a0a12] via-[#0a0a12]/90 to-transparent z-10" />
      <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-[#0a0a12] via-transparent to-transparent opacity-95 z-10" />
    </div>
  );
}
