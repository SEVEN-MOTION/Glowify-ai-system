// src/components/AuthScreen.tsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, Store, Eye, EyeOff, Zap, ArrowRight } from 'lucide-react';
import { firebaseAuth } from '../lib/firebase';
import { TechBackground } from './CommonUI';

type Mode = 'login' | 'signup' | 'reset';

interface AuthScreenProps {
  onSuccess?: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onSuccess = () => {} }) => {
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [storeName, setStoreName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resetSent, setResetSent] = useState(false);

  const clearError = () => setError('');

  const handleSubmit = async () => {
    clearError();
    setLoading(true);

    if (mode === 'login') {
      const { user, error: err } = await firebaseAuth.signInWithEmail(email, password);
      if (err) { setError(err); setLoading(false); return; }
      if (user) onSuccess();

    } else if (mode === 'signup') {
      if (!displayName.trim()) { setError('Please enter your name.'); setLoading(false); return; }
      if (!storeName.trim()) { setError('Please enter your store name.'); setLoading(false); return; }
      if (password.length < 6) { setError('Password must be at least 6 characters.'); setLoading(false); return; }
      const { user, error: err } = await firebaseAuth.signUpWithEmail(email, password, displayName, storeName);
      if (err) { setError(err); setLoading(false); return; }
      if (user) onSuccess();

    } else if (mode === 'reset') {
      const { error: err } = await firebaseAuth.resetPassword(email);
      if (err) { setError(err); setLoading(false); return; }
      setResetSent(true);
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    clearError();
    setLoading(true);
    const { user, error: err } = await firebaseAuth.signInWithGoogle();
    if (err) { setError(err); setLoading(false); return; }
    if (user) onSuccess();
  };

  const inputClass = `
    w-full bg-[#0C0A0C] border border-[#231820] rounded-xl px-4 py-3.5
    text-sm text-[#F5EEF0] placeholder:text-[#3D2B32]
    focus:outline-none focus:border-[#C9747A] focus:ring-1 focus:ring-[#C9747A]/30
    transition-all
  `;

  return (
    <div className="min-h-screen bg-[#080608] flex items-center justify-center p-4 relative">
      <TechBackground />

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-[440px]"
      >
        {/* Logo */}
        <div className="flex items-center gap-3 justify-center mb-8">
          <div style={{
            width: '44px', height: '44px', borderRadius: '14px',
            background: 'linear-gradient(135deg, #C9747A, #8B4A6B)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 24px rgba(201,116,122,0.35)',
          }}>
            <Zap size={22} className="text-white fill-white" />
          </div>
          <div>
            <span style={{ fontSize: '20px', fontWeight: 900, color: '#F5EEF0', letterSpacing: '-0.04em' }}>
              GLOWIFY<span style={{ color: '#C9747A' }}>AI</span>
            </span>
            <p style={{ fontSize: '9px', color: '#6B5560', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase' }}>
              BEAUTY OPERATING SYSTEM
            </p>
          </div>
        </div>

        {/* Card */}
        <div className="bg-[#100D10] border border-[#231820] rounded-3xl p-8 shadow-2xl">

          {/* Tab switcher */}
          {mode !== 'reset' && (
            <div className="flex bg-[#080608] border border-[#231820] rounded-xl p-1 mb-8">
              {(['login', 'signup'] as const).map(m => (
                <button
                  key={m}
                  onClick={() => { setMode(m); clearError(); }}
                  className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all ${
                    mode === m
                      ? 'bg-[#231820] text-[#F5EEF0] shadow'
                      : 'text-[#6B5560] hover:text-[#B09AA0]'
                  }`}
                >
                  {m === 'login' ? 'Sign In' : 'Create Account'}
                </button>
              ))}
            </div>
          )}

          {/* Reset mode header */}
          {mode === 'reset' && (
            <div className="mb-6">
              <h2 className="text-lg font-bold text-[#F5EEF0] mb-1">Reset Password</h2>
              <p className="text-sm text-[#6B5560]">Enter your email and we'll send a reset link.</p>
            </div>
          )}

          <AnimatePresence mode="wait">
            {resetSent ? (
              <motion.div
                key="reset-sent"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="text-center py-6"
              >
                <div className="w-12 h-12 bg-[#10B981]/10 border border-[#10B981]/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Mail size={22} className="text-[#10B981]" />
                </div>
                <p className="text-[#F5EEF0] font-bold mb-2">Reset link sent</p>
                <p className="text-sm text-[#6B5560] mb-6">Check your inbox for the password reset email.</p>
                <button
                  onClick={() => { setMode('login'); setResetSent(false); }}
                  className="text-[#C9747A] text-sm font-bold hover:underline"
                >
                  Back to Sign In
                </button>
              </motion.div>
            ) : (
              <motion.div key={mode} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">

                {/* Sign Up extra fields */}
                {mode === 'signup' && (
                  <>
                    <div className="relative">
                      <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#3D2B32]" />
                      <input
                        type="text" placeholder="Your full name"
                        value={displayName} onChange={e => setDisplayName(e.target.value)}
                        className={inputClass} style={{ paddingLeft: '40px' }}
                      />
                    </div>
                    <div className="relative">
                      <Store size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#3D2B32]" />
                      <input
                        type="text" placeholder="Your Shopify store name (e.g. Glow Beauty Co.)"
                        value={storeName} onChange={e => setStoreName(e.target.value)}
                        className={inputClass} style={{ paddingLeft: '40px' }}
                      />
                    </div>
                  </>
                )}

                {/* Email */}
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#3D2B32]" />
                  <input
                    type="email" placeholder="Email address"
                    value={email} onChange={e => setEmail(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                    className={inputClass} style={{ paddingLeft: '40px' }}
                  />
                </div>

                {/* Password */}
                {mode !== 'reset' && (
                  <div className="relative">
                    <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#3D2B32]" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder={mode === 'signup' ? 'Create a password (min 6 chars)' : 'Password'}
                      value={password} onChange={e => setPassword(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                      className={inputClass} style={{ paddingLeft: '40px', paddingRight: '44px' }}
                    />
                    <button
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#3D2B32] hover:text-[#6B5560]"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                )}

                {/* Forgot password link */}
                {mode === 'login' && (
                  <div className="text-right">
                    <button
                      onClick={() => { setMode('reset'); clearError(); }}
                      className="text-[11px] text-[#6B5560] hover:text-[#C9747A] transition-colors"
                    >
                      Forgot password?
                    </button>
                  </div>
                )}

                {/* Error message */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                    className="bg-[#EF4444]/10 border border-[#EF4444]/20 rounded-xl px-4 py-3 text-sm text-[#F87171]"
                  >
                    {error}
                  </motion.div>
                )}

                {/* Primary button */}
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 transition-all"
                  style={{
                    background: loading ? '#2A1A20' : 'linear-gradient(135deg, #C9747A, #8B4A6B)',
                    boxShadow: loading ? 'none' : '0 4px 20px rgba(201,116,122,0.4)',
                    cursor: loading ? 'not-allowed' : 'pointer',
                  }}
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      {mode === 'login' ? 'Sign In' : mode === 'signup' ? 'Create Account' : 'Send Reset Link'}
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>

                {/* Divider + Google */}
                {mode !== 'reset' && (
                  <>
                    <div className="flex items-center gap-3 my-1">
                      <div className="flex-1 h-[1px] bg-[#231820]" />
                      <span className="text-[11px] text-[#3D2B32] font-medium">or continue with</span>
                      <div className="flex-1 h-[1px] bg-[#231820]" />
                    </div>
                    <button
                      onClick={handleGoogle}
                      disabled={loading}
                      className="w-full py-3.5 rounded-xl font-bold text-sm text-[#F5EEF0] border border-[#231820] bg-[#080608] hover:bg-[#100D10] hover:border-[#3A2530] flex items-center justify-center gap-2.5 transition-all"
                    >
                      <svg width="18" height="18" viewBox="0 0 48 48">
                        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.36-8.16 2.36-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                      </svg>
                      Continue with Google
                    </button>
                  </>
                )}

                {/* Back to login from reset */}
                {mode === 'reset' && (
                  <button
                    onClick={() => { setMode('login'); clearError(); }}
                    className="w-full text-center text-sm text-[#6B5560] hover:text-[#B09AA0] transition-colors"
                  >
                    ← Back to Sign In
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <p className="text-center text-[11px] text-[#3D2B32] mt-6">
          By signing up you agree to the Glowify AI Terms of Service &amp; Privacy Policy
        </p>
      </motion.div>
    </div>
  );
};
