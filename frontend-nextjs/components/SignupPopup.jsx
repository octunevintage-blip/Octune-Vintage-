'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { X, Gift, ArrowRight } from 'lucide-react';
import { useAuthStore, useAuthModalStore } from '@/lib/store';
import { useHasMounted } from '@/hooks/useHasMounted';

export default function SignupPopup() {
  const [visible, setVisible] = useState(false);
  const { user } = useAuthStore();
  const { open } = useAuthModalStore();
  const mounted = useHasMounted();
  const timerRef = useRef(null);

  const startTimer = useCallback(() => {
    // Clear any existing timer
    if (timerRef.current) clearTimeout(timerRef.current);
    // Show popup after 15 seconds
    timerRef.current = setTimeout(() => {
      setVisible(true);
    }, 15000);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (user) {
      // User is logged in, never show popup
      setVisible(false);
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }

    // Start the first popup timer (show after 15s)
    startTimer();

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [mounted, user, startTimer]);

  const handleDismiss = () => {
    setVisible(false);
    // If user is still not logged in, restart the 15s timer
    if (!user) {
      startTimer();
    }
  };

  const handleSignup = () => {
    setVisible(false);
    if (timerRef.current) clearTimeout(timerRef.current);
    open('signup');
  };

  const handleLogin = () => {
    setVisible(false);
    if (timerRef.current) clearTimeout(timerRef.current);
    open('login');
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm auth-backdrop-enter"
        onClick={handleDismiss}
      />

      {/* Popup Card */}
      <div className="relative w-[95vw] max-w-[420px] bg-white shadow-2xl auth-modal-enter mb-4 sm:mb-0 overflow-hidden">
        {/* Close */}
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 z-10 p-1.5 text-gray-400 hover:text-black transition-colors"
        >
          <X size={18} strokeWidth={1.5} />
        </button>

        {/* Top accent bar */}
        <div className="h-1 bg-black w-full" />

        {/* Content */}
        <div className="px-8 py-8 text-center">
          {/* Icon */}
          <div className="mx-auto w-14 h-14 rounded-full bg-black/5 flex items-center justify-center mb-5">
            <Gift size={24} className="text-black" strokeWidth={1.5} />
          </div>

          <h3 className="font-display text-xl font-bold uppercase tracking-[0.15em] text-black mb-2">
            Join The Community
          </h3>
          <p className="text-gray-500 text-sm font-sans leading-relaxed mb-2">
            Create your Octune Vintage account and be the first to know about exclusive drops and 1-of-1 finds.
          </p>
          <p className="text-black font-bold text-sm font-sans tracking-wide mb-6">
            Get early access to every new drop.
          </p>

          {/* CTA */}
          <button
            onClick={handleSignup}
            className="w-full bg-black text-white py-4 text-xs font-bold uppercase tracking-[0.2em] hover:bg-gray-900 transition-all duration-300 flex items-center justify-center gap-2 group"
          >
            Create Free Account
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </button>

          <p className="text-gray-400 text-[11px] font-sans mt-4">
            Already have an account?{' '}
            <button
              onClick={handleLogin}
              className="text-black font-semibold underline underline-offset-2"
            >
              Sign In
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
