import React, { useState, useEffect } from 'react';
import { 
  X, 
  Database, 
  Cloud, 
  CloudCheck, 
  Key, 
  Mail, 
  Lock, 
  Sparkles, 
  Check, 
  Copy, 
  RefreshCw, 
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  UploadCloud,
  DownloadCloud
} from 'lucide-react';
import { 
  AUTHORIZED_EMAIL, 
  getSupabaseConfig, 
  saveStoredSupabaseConfig, 
  testSupabaseConnection, 
  signInWithOtp, 
  signInWithPassword, 
  signUpWithPassword, 
  signOut, 
  getCurrentUser,
  SUPABASE_SQL_SCHEMA
} from '../../services/supabaseClient';
import { User } from '@supabase/supabase-js';

interface SupabaseAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (msg: string) => void;
  onSyncAll: () => Promise<void>;
  isSyncing: boolean;
}

export const SupabaseAuthModal: React.FC<SupabaseAuthModalProps> = ({
  isOpen,
  onClose,
  onShowToast,
  onSyncAll,
  isSyncing,
}) => {
  const [url, setUrl] = useState('');
  const [anonKey, setAnonKey] = useState('');
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [testMessage, setTestMessage] = useState<string>('');
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'config' | 'auth' | 'sql'>('config');
  
  // Auth state
  const [user, setUser] = useState<User | null>(null);
  const [emailInput, setEmailInput] = useState<string>(AUTHORIZED_EMAIL);
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [authLoading, setAuthLoading] = useState<boolean>(false);
  const [copiedSql, setCopiedSql] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      const currentConfig = getSupabaseConfig();
      setUrl(currentConfig.url);
      setAnonKey(currentConfig.anonKey);
      checkUserAndConnection();
    }
  }, [isOpen]);

  const checkUserAndConnection = async () => {
    const usr = await getCurrentUser();
    setUser(usr);
    if (usr) {
      setEmailInput(usr.email || AUTHORIZED_EMAIL);
    }
    const currentConfig = getSupabaseConfig();
    if (currentConfig.url && currentConfig.anonKey) {
      const res = await testSupabaseConnection();
      setIsConnected(res.success);
      setTestMessage(res.message);
    } else {
      setIsConnected(false);
      setTestMessage('Credenziali Supabase non ancora configurate.');
    }
  };

  if (!isOpen) return null;

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsTesting(true);
    saveStoredSupabaseConfig(url, anonKey);
    const res = await testSupabaseConnection();
    setIsConnected(res.success);
    setTestMessage(res.message);
    setIsTesting(false);

    if (res.success) {
      onShowToast('✨ Connessione a Supabase riuscita!');
      await onSyncAll();
    } else {
      onShowToast(`⚠️ Errore: ${res.message}`);
    }
  };

  const handleSendMagicLink = async () => {
    setAuthLoading(true);
    try {
      const { error } = await signInWithOtp(emailInput);
      if (error) {
        onShowToast(`Errore Magic Link: ${error.message}`);
      } else {
        onShowToast(`✨ Link magico inviato all'email ${emailInput}! Controlla la tua posta.`);
      }
    } catch (err: any) {
      onShowToast(`Errore: ${err.message}`);
    } finally {
      setAuthLoading(false);
    }
  };

  const handlePasswordLogin = async () => {
    if (!passwordInput.trim()) {
      onShowToast('Inserisci la password.');
      return;
    }
    setAuthLoading(true);
    try {
      const { data, error } = await signInWithPassword(emailInput, passwordInput);
      if (error) {
        // Try sign up if user does not exist
        if (error.message.includes('Invalid login credentials')) {
          const { data: upData, error: upErr } = await signUpWithPassword(emailInput, passwordInput);
          if (upErr) {
            onShowToast(`Errore: ${upErr.message}`);
          } else {
            onShowToast('✨ Account registrato e collegato a Supabase!');
            await checkUserAndConnection();
          }
        } else {
          onShowToast(`Errore: ${error.message}`);
        }
      } else {
        onShowToast(`✨ Accesso effettuato per ${emailInput}!`);
        await checkUserAndConnection();
      }
    } catch (err: any) {
      onShowToast(`Errore: ${err.message}`);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    setAuthLoading(true);
    await signOut();
    setUser(null);
    onShowToast('Disconnessione effettuata.');
    setAuthLoading(false);
  };

  const copySqlToClipboard = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopiedSql(true);
    onShowToast('📋 Script SQL copiato negli appunti!');
    setTimeout(() => setCopiedSql(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#120d26] border border-amber-400/40 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-[#2a244d] flex items-center justify-between bg-gradient-to-r from-[#1a1236] to-[#120d26]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/40 text-emerald-300">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-cinzel text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>Supabase Cloud Database & Login</span>
                {isConnected && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-500/50 text-emerald-300 font-mono">
                    ONLINE 🟢
                  </span>
                )}
              </h2>
              <p className="text-xs text-purple-300">
                Salvataggio reale in cloud per: <strong className="text-amber-300">{AUTHORIZED_EMAIL}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-purple-300 hover:text-white hover:bg-purple-900/40 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-[#2a244d] bg-[#0d091e] px-4">
          <button
            onClick={() => setActiveTab('config')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'config'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-purple-300 hover:text-white'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>1. Configura Chiavi Supabase</span>
          </button>

          <button
            onClick={() => setActiveTab('auth')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'auth'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-purple-300 hover:text-white'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>2. Login Email ({AUTHORIZED_EMAIL})</span>
          </button>

          <button
            onClick={() => setActiveTab('sql')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'sql'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-purple-300 hover:text-white'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>3. Script SQL Tabelle</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs text-purple-200">
          
          {/* TAB 1: CONFIGURATION */}
          {activeTab === 'config' && (
            <div className="space-y-4">
              <div className="bg-[#181133] border border-purple-500/30 p-3.5 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-amber-300 font-semibold">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>Cosa ti serve per collegare Supabase Gratuito:</span>
                  </span>
                  <a
                    href="https://supabase.com/dashboard"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-amber-400 hover:underline flex items-center gap-1"
                  >
                    <span>Apri Supabase.com</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <ol className="list-decimal pl-4 space-y-1 text-[11px] text-purple-200/90 leading-relaxed">
                  <li>Crea un account gratuito su <strong>Supabase.com</strong> (puoi accedere con GitHub).</li>
                  <li>Crea un nuovo progetto (es. <em>Santuario-MariaTeresa</em>).</li>
                  <li>Vai su <strong>Project Settings → API</strong> e copia i 2 valori qui sotto:</li>
                </ol>
              </div>

              <form onSubmit={handleSaveConfig} className="space-y-3.5">
                <div>
                  <label className="block text-amber-300 font-semibold mb-1">
                    Supabase Project URL
                  </label>
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://xyzabcdefg.supabase.co"
                    className="w-full bg-[#1b1238] border border-[#2a244d] rounded-xl px-3.5 py-2.5 text-white font-mono text-xs focus:outline-none focus:border-amber-400 placeholder:text-purple-400/50"
                  />
                </div>

                <div>
                  <label className="block text-amber-300 font-semibold mb-1">
                    Supabase Anon Public API Key
                  </label>
                  <input
                    type="password"
                    value={anonKey}
                    onChange={(e) => setAnonKey(e.target.value)}
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    className="w-full bg-[#1b1238] border border-[#2a244d] rounded-xl px-3.5 py-2.5 text-white font-mono text-xs focus:outline-none focus:border-amber-400 placeholder:text-purple-400/50"
                  />
                  <p className="text-[10px] text-purple-300/80 mt-1">
                    * Questa chiave pubblica è sicura da usare nel client ed è protetta dalle regole del tuo santuario.
                  </p>
                </div>

                {testMessage && (
                  <div className={`p-3 rounded-xl border flex items-start gap-2 ${
                    isConnected 
                      ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200' 
                      : 'bg-rose-950/40 border-rose-500/40 text-rose-200'
                  }`}>
                    {isConnected ? <ShieldCheck className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 text-rose-400 mt-0.5 flex-shrink-0" />}
                    <span className="text-xs">{testMessage}</span>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={isTesting}
                    className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold rounded-xl transition shadow-lg text-xs active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isTesting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Database className="w-3.5 h-3.5" />}
                    <span>Salva & Testa Connessione</span>
                  </button>

                  <button
                    type="button"
                    onClick={onSyncAll}
                    disabled={isSyncing}
                    className="w-full sm:w-auto px-4 py-2 bg-[#211545] hover:bg-[#2b1c5a] text-purple-200 border border-purple-500/40 rounded-xl transition text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    {isSyncing ? <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" /> : <UploadCloud className="w-3.5 h-3.5 text-amber-400" />}
                    <span>Sincronizza Tutti i Dati Ora</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 2: AUTHENTICATION (mariateresarogani@gmail.com) */}
          {activeTab === 'auth' && (
            <div className="space-y-4">
              <div className="bg-[#181133] border border-amber-400/30 p-3.5 rounded-xl space-y-1.5">
                <div className="flex items-center gap-2 text-amber-300 font-semibold">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <span>Accesso Riservato Esclusivo</span>
                </div>
                <p className="text-[11px] text-purple-200 leading-relaxed">
                  L'accesso al Santuario Cloud è configurato per la tua email: <strong className="text-white">{AUTHORIZED_EMAIL}</strong>. Puoi effettuare il login tramite <em>Magic Link</em> via email oppure con password.
                </p>
              </div>

              {user ? (
                <div className="p-4 bg-emerald-950/40 border border-emerald-500/40 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-emerald-300 font-bold flex items-center gap-1.5">
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>Sei connessa come:</span>
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-900 text-emerald-200 font-mono">
                      Autenticato
                    </span>
                  </div>
                  <p className="text-white font-mono text-xs">{user.email}</p>
                  <button
                    onClick={handleSignOut}
                    disabled={authLoading}
                    className="px-4 py-2 bg-rose-900/60 hover:bg-rose-800/80 text-rose-200 border border-rose-500/40 rounded-xl text-xs font-semibold transition"
                  >
                    Disconnetti Account
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-purple-300 font-semibold mb-1">
                      Email Autorizzata
                    </label>
                    <input
                      type="email"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      className="w-full bg-[#1b1238] border border-[#2a244d] rounded-xl px-3.5 py-2 text-white font-mono text-xs focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  {/* Option A: Magic Link */}
                  <div className="p-3.5 bg-[#140e2d] border border-purple-500/30 rounded-xl space-y-2">
                    <span className="font-bold text-amber-300 block text-xs">
                      Opzione 1: Magic Link (Senza Password)
                    </span>
                    <p className="text-[11px] text-purple-200/90">
                      Ricevi un link sicuro sulla tua email <strong>{emailInput}</strong> per accedere istantaneamente con un clic.
                    </p>
                    <button
                      onClick={handleSendMagicLink}
                      disabled={authLoading}
                      className="w-full py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl text-xs transition active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>Invia Magic Link a {emailInput}</span>
                    </button>
                  </div>

                  {/* Option B: Password */}
                  <div className="p-3.5 bg-[#140e2d] border border-purple-500/30 rounded-xl space-y-2">
                    <span className="font-bold text-purple-200 block text-xs">
                      Opzione 2: Accesso con Password Personale
                    </span>
                    <input
                      type="password"
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      placeholder="Inserisci la tua password..."
                      className="w-full bg-[#1b1238] border border-[#2a244d] rounded-xl px-3.5 py-2 text-white text-xs focus:outline-none focus:border-amber-400 placeholder:text-purple-400/50"
                    />
                    <button
                      onClick={handlePasswordLogin}
                      disabled={authLoading}
                      className="w-full py-2 bg-[#2a1d52] hover:bg-[#342466] border border-purple-400/40 text-amber-300 font-bold rounded-xl text-xs transition active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>Accedi / Registra Password</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: SQL SCHEMA SCRIPT */}
          {activeTab === 'sql' && (
            <div className="space-y-3">
              <div className="bg-[#181133] border border-purple-500/30 p-3.5 rounded-xl space-y-1.5">
                <span className="font-bold text-amber-300 block text-xs">
                  Creazione Automatica Tabelle su Supabase
                </span>
                <p className="text-[11px] text-purple-200 leading-relaxed">
                  Per far sì che Supabase possa salvare appuntamenti, clienti, diario, ciclo e menù, esegui questo script una sola volta in <strong>Supabase → SQL Editor → New Query → Run</strong>.
                </p>
              </div>

              <div className="relative">
                <pre className="p-3 bg-[#0a0715] border border-[#2a244d] rounded-xl font-mono text-[10px] text-emerald-300/90 overflow-x-auto max-h-56 select-all">
                  {SUPABASE_SQL_SCHEMA}
                </pre>

                <button
                  onClick={copySqlToClipboard}
                  className="absolute top-2 right-2 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[10px] rounded-lg transition flex items-center gap-1 shadow-md cursor-pointer"
                >
                  {copiedSql ? <Check className="w-3 h-3 text-emerald-950" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedSql ? 'Copiato!' : 'Copia Tutto lo Script SQL'}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#2a244d] bg-[#0e0920] flex items-center justify-between">
          <span className="text-[11px] text-purple-300/80">
            {isConnected ? '☁️ Supabase Cloud Sincronizzato' : '💾 Salvataggio Locale Attivo (Offline Safe)'}
          </span>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl text-xs transition active:scale-95 cursor-pointer"
          >
            Chiudi
          </button>
        </div>

      </div>
    </div>
  );
};
