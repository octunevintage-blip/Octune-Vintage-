import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const AnimatedDigit = ({ value, label }) => {
  return (
    <div className="flex flex-col items-center mx-0.5">
      <motion.div 
        whileHover={{ scale: 1.1, rotateZ: 2 }}
        className="relative w-5 h-5 sm:w-6 sm:h-7 md:w-8 md:h-10 bg-[#111] rounded shadow-[0_0_10px_rgba(0,0,0,0.3)] perspective-1000 flex items-center justify-center overflow-hidden border border-[#333]"
      >
        <AnimatePresence mode="popLayout">
          <motion.span
            key={value}
            initial={{ rotateX: -180, opacity: 0, scale: 0.3, y: -20 }}
            animate={{ rotateX: 0, opacity: 1, scale: 1, y: 0 }}
            exit={{ rotateX: 180, opacity: 0, scale: 0.3, y: 20 }}
            transition={{ 
              type: "spring", 
              stiffness: 300, 
              damping: 15,
              mass: 1.2
            }}
            style={{ transformOrigin: "center" }}
            className="absolute font-mono text-[9px] sm:text-[11px] md:text-base lg:text-xl font-black tracking-widest text-white drop-shadow-[0_2px_4px_rgba(255,255,255,0.3)] z-10"
          >
            {value}
          </motion.span>
        </AnimatePresence>
        
        {/* Horizontal line for split flip clock look */}
        <div className="absolute inset-x-0 top-1/2 h-[1px] bg-black z-0 opacity-80 shadow-[0_1px_1px_rgba(255,255,255,0.1)]" />
        
        {/* Animated glossy sweep effect */}
        <motion.div 
          animate={{ 
            y: ['-100%', '200%'],
            opacity: [0, 0.5, 0]
          }}
          transition={{ 
            repeat: Infinity, 
            duration: 3, 
            ease: "easeInOut",
            delay: Math.random() * 2 
          }}
          className="absolute inset-0 bg-gradient-to-b from-transparent via-white/20 to-transparent pointer-events-none transform -skew-y-12" 
        />
      </motion.div>
      <motion.span 
        initial={{ opacity: 0.5 }}
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="hidden sm:block text-[6px] sm:text-[8px] md:text-[9px] font-black uppercase tracking-[0.3em] mt-1 text-[#888]"
      >
        {label}
      </motion.span>
    </div>
  );
};

export default function CountdownTimer({ targetDate, title = "NEXT DROP IN" }) {
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    if (!targetDate) return;
    
    const calculateTimeLeft = () => {
      const difference = new Date(targetDate) - new Date();
      if (difference <= 0) return { expired: true };

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60)
      };
    };

    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  if (!timeLeft || timeLeft.expired) return null;

  const format = (num) => String(num).padStart(2, '0');

  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-row items-center gap-1 sm:gap-2 md:gap-4 bg-transparent py-1"
    >
      <div className="flex items-center gap-1.5 md:gap-2">
        <motion.div 
          animate={{ scale: [1, 1.4, 1], opacity: [0.6, 1, 0.6] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
          className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]" 
        />
        <motion.span 
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="text-[8px] sm:text-[10px] md:text-xs font-black uppercase tracking-[0.25em] text-[#111] whitespace-nowrap"
        >
          <span className="md:hidden">DROP:</span>
          <span className="hidden md:inline">{title || "NEXT DROP IN:"}</span>
        </motion.span>
      </div>
      
      <div className="flex items-start">
        <AnimatedDigit value={format(timeLeft.days)} label="Days" />
        
        <motion.span 
          animate={{ opacity: [0, 1, 0], scale: [0.8, 1.2, 0.8] }}
          transition={{ repeat: Infinity, duration: 1 }}
          className="text-[#111] text-[10px] sm:text-xs md:text-base lg:text-lg font-black mt-0.5 sm:mt-1 md:mt-1.5 mx-0 sm:mx-0.5"
        >
          :
        </motion.span>
        
        <AnimatedDigit value={format(timeLeft.hours)} label="Hrs" />
        
        <motion.span 
          animate={{ opacity: [0, 1, 0], scale: [0.8, 1.2, 0.8] }}
          transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
          className="text-[#111] text-[10px] sm:text-xs md:text-base lg:text-lg font-black mt-0.5 sm:mt-1 md:mt-1.5 mx-0 sm:mx-0.5"
        >
          :
        </motion.span>
        
        <AnimatedDigit value={format(timeLeft.minutes)} label="Min" />
        
        <motion.span 
          animate={{ opacity: [0, 1, 0], scale: [0.8, 1.2, 0.8] }}
          transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
          className="text-[#111] text-[10px] sm:text-xs md:text-base lg:text-lg font-black mt-0.5 sm:mt-1 md:mt-1.5 mx-0 sm:mx-0.5"
        >
          :
        </motion.span>
        
        <AnimatedDigit value={format(timeLeft.seconds)} label="Sec" />
      </div>
    </motion.div>
  );
}
