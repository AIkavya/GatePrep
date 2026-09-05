import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Lock, User, Eye, EyeOff, ShieldCheck, Database, Layers, CheckCircle2, ArrowRight } from 'lucide-react';

export const AuthScreen: React.FC = () => {
  const { login, register, error } = useAuth();
  const [isSignUp, setIsSignUp] = useState<boolean>(false);
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (!username.trim()) {
      setLocalError('Please enter a username.');
      return;
    }

    if (username.trim().length < 3) {
      setLocalError('Username must be at least 3 characters.');
      return;
    }

    if (!password) {
      setLocalError('Please enter a password.');
      return;
    }

    if (password.length < 4) {
      setLocalError('Password must be at least 4 characters.');
      return;
    }

    setSubmitting(true);
    try {
      if (isSignUp) {
        await register(username.trim(), password);
      } else {
        await login(username.trim(), password);
      }
    } catch (err: any) {
      setLocalError(err.message || (isSignUp ? 'Registration failed.' : 'Login failed.'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickDemo = async () => {
    const demoUser = 'gate_aspirant';
    const demoPass = 'gate2026';
    setUsername(demoUser);
    setPassword(demoPass);
    setSubmitting(true);
    setLocalError(null);
    try {
      // Try login first, if user doesn't exist, register
      try {
        await login(demoUser, demoPass);
      } catch {
        await register(demoUser, demoPass);
      }
    } catch (err: any) {
      setLocalError(err.message || 'Demo sign in failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const displayError = localError || error;

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 bg-[#f5f5f7] dark:bg-[#000000] text-[#1d1d1f] dark:text-[#f5f5f7] transition-colors duration-300">
      <div className="w-full max-w-md">
        {/* Brand header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#0071e3] dark:bg-[#2997ff] text-white dark:text-black shadow-lg shadow-blue-500/20 mb-4">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7]">
            GATE Prep
          </h1>
          <p className="text-xs sm:text-sm text-[#86868b] dark:text-[#a1a1a6] mt-1.5 max-w-xs mx-auto">
            Lightweight SQLite database &amp; JWT authentication for your personalized syllabus and exam tracking.
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-white dark:bg-[#161617] rounded-3xl p-6 sm:p-8 border border-[#e5e5ea] dark:border-[#333336] shadow-xl shadow-black/5 dark:shadow-none transition-all">
          {/* Segmented Mode Switcher */}
          <div className="flex p-1 bg-[#f5f5f7] dark:bg-[#2c2c2e] rounded-full border border-[#e5e5ea] dark:border-[#3a3a3c] mb-6">
            <button
              id="tab-auth-login"
              type="button"
              onClick={() => {
                setIsSignUp(false);
                setLocalError(null);
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-full transition-all ${
                !isSignUp
                  ? 'bg-white dark:bg-[#1d1d1f] text-[#1d1d1f] dark:text-white shadow-2xs'
                  : 'text-[#86868b] dark:text-[#a1a1a6] hover:text-[#1d1d1f] dark:hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              id="tab-auth-signup"
              type="button"
              onClick={() => {
                setIsSignUp(true);
                setLocalError(null);
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-full transition-all ${
                isSignUp
                  ? 'bg-white dark:bg-[#1d1d1f] text-[#1d1d1f] dark:text-white shadow-2xs'
                  : 'text-[#86868b] dark:text-[#a1a1a6] hover:text-[#1d1d1f] dark:hover:text-white'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Notice about fresh clean workspace for new users */}
          {isSignUp && (
            <div className="mb-5 p-3.5 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-900/40 text-xs text-[#0071e3] dark:text-[#2997ff] flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Fresh clean start:</span> New accounts start completely clean with 0 items, ready for you to add your 10+ subjects and 10,000+ PYQs.
              </div>
            </div>
          )}

          {/* Error Alert */}
          {displayError && (
            <div className="mb-5 p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200/80 dark:border-red-900/40 text-xs text-[#ff3b30] dark:text-[#ff453a]">
              {displayError}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#86868b] dark:text-[#a1a1a6] mb-1.5 uppercase tracking-wider">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#86868b]">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="input-auth-username"
                  type="text"
                  autoComplete="username"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#f5f5f7] dark:bg-[#2c2c2e] border border-[#e5e5ea] dark:border-[#3a3a3c] rounded-2xl text-sm text-[#1d1d1f] dark:text-[#f5f5f7] placeholder-[#86868b] focus:outline-none focus:ring-2 focus:ring-[#0071e3] dark:focus:ring-[#2997ff] transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#86868b] dark:text-[#a1a1a6] mb-1.5 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#86868b]">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="input-auth-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete={isSignUp ? 'new-password' : 'current-password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-10 py-2.5 bg-[#f5f5f7] dark:bg-[#2c2c2e] border border-[#e5e5ea] dark:border-[#3a3a3c] rounded-2xl text-sm text-[#1d1d1f] dark:text-[#f5f5f7] placeholder-[#86868b] focus:outline-none focus:ring-2 focus:ring-[#0071e3] dark:focus:ring-[#2997ff] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              id="btn-auth-submit"
              type="submit"
              disabled={submitting}
              className="w-full mt-2 py-3 px-4 bg-[#0071e3] hover:bg-[#0077ed] dark:bg-[#2997ff] dark:hover:bg-[#40a9ff] text-white dark:text-black text-sm font-semibold rounded-full shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {submitting ? (
                <div className="w-5 h-5 border-2 border-white dark:border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>{isSignUp ? 'Create Fresh Account' : 'Sign In & Access Dashboard'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Login Option */}
          <div className="mt-5 pt-5 border-t border-[#e5e5ea] dark:border-[#333336] text-center">
            <button
              id="btn-quick-demo"
              type="button"
              onClick={handleQuickDemo}
              disabled={submitting}
              className="text-xs font-semibold text-[#86868b] dark:text-[#a1a1a6] hover:text-[#0071e3] dark:hover:text-[#2997ff] transition-colors underline underline-offset-4"
            >
              Or click here for quick 1-click login as Demo User
            </button>
          </div>
        </div>

        {/* Database specs footer */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs text-[#86868b] dark:text-[#a1a1a6]">
          <div className="flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-[#0071e3] dark:text-[#2997ff]" />
            <span>SQLite Embedded DB</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-emerald-500" />
            <span>10,000+ PYQ Scale</span>
          </div>
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-purple-500" />
            <span>JWT Secure Auth</span>
          </div>
        </div>
      </div>
    </div>
  );
};
