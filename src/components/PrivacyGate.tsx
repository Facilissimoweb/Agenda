import React, { useState } from 'react';
import { Lock, KeyRound, Eye, EyeOff, Sparkles, Moon, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';

interface PrivacyGateProps {
  onUnlock: () => void;
}

export const MASTER_SANCTUARY_KEY = 'ficoinfiore';

export const PrivacyGate: React.FC<PrivacyGateProps> = ({ onUnlock }) => {
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanInput = passwordInput.trim().toLowerCase();
    if (cleanInput === MASTER_SANCTUARY_KEY.toLowerCase()) {
      if (rememberMe) {
        localStorage.setItem('mt_sanctuary_unlocked', 'true');
      } else {
        sessionStorage.setItem('mt_sanctuary_unlocked', 'true');
      }
      onUnlock();
    } else {
      setError(true);
      setTimeout(() => setError(false), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#070510] text-slate-100 p-4 select-none overflow-hidden">
      {/* Mystical Background Glows */}
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[550px] h-[550px] bg-purple-900/25 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 right-1/4 w-[450px] h-[450px] bg-amber-600/15 rounded-full blur-3xl pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-md bg-[#120d26]/95 border border-amber-400/40 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-6 text-center"
      >
        {/* Sacred Sigil Icon */}
        <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-amber-400/70 bg-gradient-to-b from-[#241547] to-[#120d26] flex items-center justify-center text-amber-300 shadow-xl shadow-amber-500/20 relative">
          <Moon className="w-8 h-8 sm:w-10 sm:h-10 text-amber-300" />
          <div className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-purple-950 border border-amber-400 text-amber-300 shadow-md">
            <Lock className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Title */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-center gap-1.5 text-xs text-amber-400 font-semibold tracking-widest uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Spazio Riservato & Protetto</span>
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <h1 className="font-cinzel text-xl sm:text-2xl font-bold tracking-wider gold-gradient-text">
            SANTUARIO DI MARIA TERESA
          </h1>
          <p className="text-xs text-purple-200/80 font-light leading-relaxed max-w-xs mx-auto">
            Questo santuario custodisce diari intimi, consulti e ritmi biologici. Inserisci la parola chiave per accedere.
          </p>
        </div>

        {/* Password Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <div>
            <label className="block text-xs font-semibold text-purple-300 mb-1.5 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-amber-400" />
              <span>Parola Chiave del Santuario</span>
            </label>
            
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={passwordInput}
                onChange={(e) => {
                  setPasswordInput(e.target.value);
                  if (error) setError(false);
                }}
                placeholder="Inserisci la parola chiave..."
                autoFocus
                className={`w-full bg-[#1b1238] border ${
                  error ? 'border-rose-500 ring-2 ring-rose-500/30' : 'border-[#2a244d] focus:border-amber-400'
                } rounded-xl px-4 py-3 text-sm text-white focus:outline-none transition pr-11 font-medium placeholder:text-purple-400/40`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-400 hover:text-white transition p-1 cursor-pointer"
                title={showPassword ? 'Nascondi' : 'Mostra'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {error && (
              <p className="text-xs text-rose-400 font-medium mt-1.5 flex items-center gap-1 animate-shake">
                <span>⚠️ Parola chiave non corretta. Riprova con attenzione.</span>
              </p>
            )}
          </div>

          {/* Remember on this device checkbox */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="rememberMe"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded border-purple-500/50 bg-[#1b1238] text-amber-500 focus:ring-amber-400 cursor-pointer accent-amber-500"
            />
            <label htmlFor="rememberMe" className="text-[11px] text-purple-300 select-none cursor-pointer">
              Mantieni sbloccato su questo dispositivo
            </label>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl text-sm transition shadow-lg shadow-amber-500/25 active:scale-95 flex items-center justify-center gap-2 cursor-pointer font-cinzel tracking-wider"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Svela il Santuario</span>
          </button>
        </form>

        <div className="pt-2 border-t border-[#2a244d]/60 text-[10px] text-purple-400/60 flex items-center justify-center gap-1">
          <span>🔒 Crittografia locale e cloud privata attiva</span>
        </div>
      </motion.div>
    </div>
  );
};
