'use client';

import { useEffect } from 'react';

export default function SuccessSound() {
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;

    const playChime = () => {
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        const ctx = new AudioContext();
        
        // Play a beautiful, warm success chime
        const now = ctx.currentTime;
        
        // Tone 1 (Lower, warm)
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.type = 'sine';
        // Frequencies for a sweet vintage chime: E5 (659.25Hz) rising to B5 (987.77Hz)
        osc1.frequency.setValueAtTime(659.25, now);
        osc1.frequency.exponentialRampToValueAtTime(987.77, now + 0.12);
        
        gain1.gain.setValueAtTime(0.001, now);
        gain1.gain.exponentialRampToValueAtTime(0.2, now + 0.05);
        gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
        
        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        osc1.start(now);
        osc1.stop(now + 0.45);

        // Tone 2 (Higher, sweet chime after 100ms)
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(880.00, now + 0.1); // A5
        osc2.frequency.exponentialRampToValueAtTime(1318.51, now + 0.22); // E6
        
        gain2.gain.setValueAtTime(0.001, now + 0.1);
        gain2.gain.exponentialRampToValueAtTime(0.2, now + 0.15);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
        
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start(now + 0.1);
        osc2.stop(now + 0.55);
        
      } catch (e) {
        console.warn('AudioContext playback blocked or failed:', e);
      }
    };

    // Browsers block audio until a user gesture or page interaction sometimes.
    // Try to play immediately, but also setup a one-time click/touchstart fallback just in case.
    playChime();

    const handleInteraction = () => {
      playChime();
      cleanup();
    };

    const cleanup = () => {
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
    };

    window.addEventListener('click', handleInteraction);
    window.addEventListener('touchstart', handleInteraction);

    return cleanup;
  }, []);

  return null;
}
