'use client';
import { useState } from 'react';
import { X, Eye, EyeOff, Loader2, User, Mail, Lock, ArrowRight } from 'lucide-react';
import { useAuthStore, useAuthModalStore } from '@/lib/store';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function AuthModal() {
  const { isOpen, tab, close, setTab } = useAuthModalStore();
  const { setUser } = useAuthStore();

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Signup fields
  const [signupData, setSignupData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  // Login fields
  const [loginData, setLoginData] = useState({ email: '', password: '' });

  if (!isOpen) return null;

  const handleSignup = async (e) => {
    e.preventDefault();
    if (signupData.password !== signupData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (signupData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/auth/register', {
        name: signupData.name,
        email: signupData.email,
        password: signupData.password,
      });
      setUser(res.data);
      toast.success(`Welcome to Octune Vintage, ${res.data.name}!`);
      close();
      setSignupData({ name: '', email: '', password: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/login', loginData);
      setUser(res.data);
      toast.success(`Welcome back, ${res.data.name}!`);
      close();
      setLoginData({ email: '', password: '' });
    } catch (err) {
      toast.error(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm auth-backdrop-enter"
        onClick={close}
      />

      {/* Modal */}
      <div className="relative w-[95vw] max-w-[440px] bg-white shadow-2xl auth-modal-enter overflow-hidden">
        {/* Close Button */}
        <button
          onClick={close}
          className="absolute top-4 right-4 z-10 p-2 text-gray-400 hover:text-black transition-colors"
        >
          <X size={20} strokeWidth={1.5} />
        </button>

        {/* Header */}
        <div className="px-8 pt-8 pb-0">
          <div className="text-center mb-6">
            <h2 className="font-display text-2xl font-bold uppercase tracking-[0.15em] text-black">
              {tab === 'signup' ? 'Create Account' : 'Welcome Back'}
            </h2>
            <p className="text-gray-500 text-sm mt-2 font-sans tracking-wide">
              {tab === 'signup'
                ? 'Join the archive. Get exclusive access.'
                : 'Sign in to your Octune Vintage account'}
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setTab('signup')}
              className={`flex-1 pb-3 text-xs font-bold uppercase tracking-[0.2em] transition-all duration-300 border-b-2 ${
                tab === 'signup'
                  ? 'text-black border-black'
                  : 'text-gray-400 border-transparent hover:text-gray-600'
              }`}
            >
              Sign Up
            </button>
            <button
              onClick={() => setTab('login')}
              className={`flex-1 pb-3 text-xs font-bold uppercase tracking-[0.2em] transition-all duration-300 border-b-2 ${
                tab === 'login'
                  ? 'text-black border-black'
                  : 'text-gray-400 border-transparent hover:text-gray-600'
              }`}
            >
              Login
            </button>
          </div>
        </div>

        {/* Form Body */}
        <div className="px-8 py-6">
          {tab === 'signup' ? (
            <form onSubmit={handleSignup} className="space-y-4">
              {/* Name */}
              <div className="relative">
                <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Full Name"
                  required
                  value={signupData.name}
                  onChange={(e) => setSignupData({ ...signupData, name: e.target.value })}
                  className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:border-black focus:bg-white transition-all"
                />
              </div>

              {/* Email */}
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  placeholder="Email Address"
                  required
                  value={signupData.email}
                  onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                  className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:border-black focus:bg-white transition-all"
                />
              </div>

              {/* Password */}
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password (min 6 chars)"
                  required
                  value={signupData.password}
                  onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                  className="w-full pl-11 pr-12 py-3.5 bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:border-black focus:bg-white transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {/* Confirm Password */}
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Confirm Password"
                  required
                  value={signupData.confirmPassword}
                  onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                  className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:border-black focus:bg-white transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-black text-white py-4 text-xs font-bold uppercase tracking-[0.2em] hover:bg-gray-900 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                {loading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <>
                    Create Account
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleLogin} className="space-y-4">
              {/* Email */}
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  placeholder="Email Address"
                  required
                  value={loginData.email}
                  onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                  className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:border-black focus:bg-white transition-all"
                />
              </div>

              {/* Password */}
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  required
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  className="w-full pl-11 pr-12 py-3.5 bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:border-black focus:bg-white transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-black text-white py-4 text-xs font-bold uppercase tracking-[0.2em] hover:bg-gray-900 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                {loading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <>
                    Sign In
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 pb-8">
          <div className="text-center text-xs text-gray-400 font-sans">
            {tab === 'signup' ? (
              <p>
                Already have an account?{' '}
                <button onClick={() => setTab('login')} className="text-black font-semibold underline underline-offset-2 hover:no-underline">
                  Sign In
                </button>
              </p>
            ) : (
              <p>
                Don&apos;t have an account?{' '}
                <button onClick={() => setTab('signup')} className="text-black font-semibold underline underline-offset-2 hover:no-underline">
                  Create One
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
