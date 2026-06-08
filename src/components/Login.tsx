import React, { useState } from 'react';
import { useDatabase } from './DatabaseContext';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Lock, User, Eye, EyeOff, LockKeyhole, Stethoscope, ArrowRight, ShieldCheck, HelpCircle } from 'lucide-react';

export function Login() {
  const { login, registerUser } = useDatabase();
  const [isRegister, setIsRegister] = useState(false);
  
  // Fields state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Interaction/UI state
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    
    // Simple frontend validation
    if (!email || !email.includes('@')) {
      setError('Please provide a valid email address');
      return;
    }
    if (!password || password.length < 6) {
      setError('Password must contain at least 6 characters');
      return;
    }
    if (isRegister && !name.trim()) {
      setError('Please provide your full name');
      return;
    }

    setIsLoading(true);

    try {
      if (isRegister) {
        const res = await registerUser(name, email, password);
        if (res.success) {
          setSuccess('Account created successfully! Logging you in...');
        } else {
          setError(res.error || 'Failed to create account.');
        }
      } else {
        const res = await login(email, password);
        if (!res.success) {
          setError(res.error || 'Incorrect email or password. Please try again.');
        }
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred. Check your network connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickFill = () => {
    setEmail('admin@doctutorials.com');
    setPassword('doctutorials2026');
    setName('Administrator');
    setError(null);
  };

  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-gradient-to-tr from-sky-50 via-slate-50 to-blue-50/75 p-4 md:p-8 select-none">
      
      {/* Decorative premium elements */}
      <div className="absolute top-12 left-12 w-64 h-64 bg-blue-300/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-12 right-12 w-72 h-72 bg-sky-300/15 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="w-full max-w-md bg-white border border-blue-100 rounded-2xl shadow-xl overflow-hidden relative z-10"
      >
        
        {/* Head Branding Block */}
        <div className="p-6 md:p-8 text-center bg-gradient-to-b from-sky-50/50 to-white border-b border-sky-50/60 pb-5">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-600 to-sky-500 text-white shadow-md shadow-blue-505/20 mb-3">
            <Stethoscope className="w-6 h-6 animate-pulse" />
          </div>
          
          <h1 className="text-xl font-sans font-bold text-slate-800 tracking-tight flex items-center justify-center gap-1.5">
            DocTutorials <span className="font-mono text-xs px-2 py-0.5 bg-blue-50 text-blue-700/90 rounded border border-blue-100 uppercase tracking-widest leading-none font-bold">Console</span>
          </h1>
          <p className="text-xs text-slate-500 font-sans mt-1.5 max-w-xs mx-auto">
            Authorized portal for managing institutional medical curricula, contract lines, and learning progress.
          </p>
        </div>

        {/* Content Form Body */}
        <div className="p-6 md:p-8 pt-6">
          
          {/* Dual Toggle Tab */}
          <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100/80 rounded-xl mb-6">
            <button
              onClick={() => {
                setIsRegister(false);
                setError(null);
                setSuccess(null);
              }}
              className={`py-1.5 text-[11px] font-sans font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                !isRegister
                  ? 'bg-white text-blue-600 shadow-3xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setIsRegister(true);
                setError(null);
                setSuccess(null);
              }}
              className={`py-1.5 text-[11px] font-sans font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                isRegister
                  ? 'bg-white text-blue-600 shadow-3xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Create Account
            </button>
          </div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-xl text-xs font-sans mb-4 flex items-start gap-2"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-rose-550 mt-1.5 flex-shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}

            {success && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-3 rounded-xl text-xs font-sans mb-4 flex items-start gap-2"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-555 flex-shrink-0" />
                <span>{success}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-1.5"
              >
                <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="Dr. Rajesh Kumar"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-blue-300 rounded-xl pl-9.5 pr-4 py-2 text-xs text-slate-800 focus:outline-none transition-all placeholder:text-slate-400"
                  />
                </div>
              </motion.div>
            )}

            <div className="space-y-1.5">
              <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="admin@doctutorials.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-blue-300 rounded-xl pl-9.5 pr-4 py-2 text-xs text-slate-800 focus:outline-none transition-all placeholder:text-slate-400"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">Security Password</label>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Min. 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-blue-300 rounded-xl pl-9.5 pr-10 py-2 text-xs text-slate-800 focus:outline-none transition-all placeholder:text-slate-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Sticky Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-sans font-bold py-2 px-4 rounded-xl text-xs tracking-wider uppercase transition-all shadow-md shadow-blue-600/10 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {isRegister ? 'Register Account' : 'Authenticate Console'} <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

            {/* Standard Login Help Accent */}
            {!isRegister && (
              <div className="mt-6 pt-5 border-t border-slate-100 text-center">
                <p className="text-xs text-slate-500">
                  Contact institutional IT services if you require admin credentials.
                </p>
              </div>
            )}

        </div>

        {/* Footer Security Policy Badge */}
        <div className="py-4 px-6 md:px-8 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between text-[9px] text-slate-400 font-mono">
          <span className="flex items-center gap-1">
            <LockKeyhole className="w-3 h-3 text-blue-500" /> Secure SSL Connection Active
          </span>
          <span>v2.1.0</span>
        </div>

      </motion.div>
    </div>
  );
}
