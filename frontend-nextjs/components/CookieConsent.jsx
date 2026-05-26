'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, ShieldCheck, X } from 'lucide-react';

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState({
    necessary: true, // Always true
    analytics: true,
    marketing: true,
  });

  useEffect(() => {
    // Check if user has already made a decision
    const consent = localStorage.getItem('octune-cookie-consent');
    if (!consent) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    const consentObj = { necessary: true, analytics: true, marketing: true };
    localStorage.setItem('octune-cookie-consent', JSON.stringify(consentObj));
    setIsVisible(false);
  };

  const handleDeclineAll = () => {
    const consentObj = { necessary: true, analytics: false, marketing: false };
    localStorage.setItem('octune-cookie-consent', JSON.stringify(consentObj));
    setIsVisible(false);
  };

  const handleSavePreferences = () => {
    localStorage.setItem('octune-cookie-consent', JSON.stringify(preferences));
    setIsVisible(false);
  };

  const togglePreference = (key) => {
    if (key === 'necessary') return; // Cannot disable necessary
    setPreferences(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 20, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed bottom-0 left-0 right-0 md:bottom-6 md:right-6 md:left-auto z-[100] w-full md:max-w-md bg-white border-t md:border border-black/15 shadow-[0_10px_30px_rgba(0,0,0,0.08)] p-6 flex flex-col gap-4 font-sans text-vnv-black"
        >
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2 text-black">
              <ShieldCheck size={20} strokeWidth={2} className="text-vnv-black" />
              <h3 className="font-display font-bold uppercase tracking-wider text-sm">Cookie Preferences</h3>
            </div>
            <button onClick={handleDeclineAll} className="text-vnv-gray hover:text-black transition-colors" title="Decline All">
              <X size={18} />
            </button>
          </div>

          {/* Description */}
          <p className="text-xs text-vnv-gray leading-relaxed">
            We use cookies to enhance your browsing experience, serve personalized ads or content, and analyze our traffic. By clicking &quot;Accept All&quot;, you consent to our use of cookies.
          </p>

          {/* Preferences Accordion */}
          {showPreferences && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="border-t border-black/10 pt-4 mt-2 flex flex-col gap-3"
            >
              {/* Necessary */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-black">Necessary Cookies</h4>
                  <p className="text-[10px] text-vnv-gray mt-0.5 leading-normal">Required for site security, user login, and cart persistence.</p>
                </div>
                <input type="checkbox" checked={preferences.necessary} disabled className="accent-black h-4 w-4 mt-0.5" />
              </div>

              {/* Analytics */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-black">Analytics Cookies</h4>
                  <p className="text-[10px] text-vnv-gray mt-0.5 leading-normal">Allows us to monitor website performance and improve user paths.</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={preferences.analytics} 
                  onChange={() => togglePreference('analytics')}
                  className="accent-black h-4 w-4 mt-0.5 cursor-pointer" 
                />
              </div>

              {/* Marketing */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-black">Marketing Cookies</h4>
                  <p className="text-[10px] text-vnv-gray mt-0.5 leading-normal">Used to deliver relevant ads and run newsletter subscriptions.</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={preferences.marketing} 
                  onChange={() => togglePreference('marketing')}
                  className="accent-black h-4 w-4 mt-0.5 cursor-pointer" 
                />
              </div>
            </motion.div>
          )}

          {/* Controls */}
          <div className="flex flex-col gap-2 mt-2">
            <div className="flex gap-2">
              <button 
                onClick={() => setShowPreferences(!showPreferences)} 
                className="flex-1 btn btn-outline py-2.5 text-xs text-center flex items-center justify-center gap-1.5"
              >
                <Settings size={14} />
                {showPreferences ? 'Hide Settings' : 'Customize'}
              </button>
              {showPreferences ? (
                <button onClick={handleSavePreferences} className="flex-1 btn btn-primary py-2.5 text-xs">
                  Save Settings
                </button>
              ) : (
                <button onClick={handleAcceptAll} className="flex-1 btn btn-primary py-2.5 text-xs">
                  Accept All
                </button>
              )}
            </div>
            {!showPreferences && (
              <button onClick={handleDeclineAll} className="text-center text-[10px] text-vnv-gray hover:text-black uppercase tracking-wider font-bold py-1.5 transition-colors">
                Decline Optional Cookies
              </button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
