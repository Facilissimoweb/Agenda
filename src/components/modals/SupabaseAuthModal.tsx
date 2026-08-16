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
  DownloadCloud,
  HelpCircle,
  KeyRound,
  CheckCircle2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { 
  AUTHORIZED_EMAIL, 
  getSupabaseConfig, 
  saveStoredSupabaseConfig, 
  testSupabaseConnection, 
  signInWithOtp, 
  verifyEmailOtp,
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
  const [activeTab, setActiveTab] = useState<'config' | 'auth' | 'sql' | 'guida'>('auth');
  
  // Auth state
  const [user, setUser] = useState<User | null>(null);
  const [emailInput, setEmailInput] = useState<string>(AUTHORIZED_EMAIL);
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [otpToken, setOtpToken] = useState<string>('');
  const [magicLinkSent, setMagicLinkSent] = useState<boolean>(false);
  const [authLoading, setAuthLoading] = useState<boolean>(false);
  const [copiedSql, setCopiedSql] = useState<boolean>(false);
  const [showRedirectHelp, setShowRedirectHelp] = useState<boolean>(true);

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
        setMagicLinkSent(true);
        onShowToast(`✨ Email inviata a ${emailInput}! Controlla la posta (puoi inserire il codice a 6 cifre qui sotto).`);
      }
    } catch (err: any) {
      onShowToast(`Errore: ${err.message}`);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpToken.trim()) {
      onShowToast('Inserisci il codice a 6 cifre ricevuto via email.');
      return;
    }
    setAuthLoading(true);
    try {
      const { data, error } = await verifyEmailOtp(emailInput, otpToken);
      if (error) {
        onShowToast(`Codice non valido: ${error.message}`);
      } else {
        onShowToast('✨ Accesso effettuato con successo!');
        await checkUserAndConnection();
        await onSyncAll();
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
        // Try sign up if user does not exist yet
        if (error.message.includes('Invalid login credentials') || error.message.includes('User not found')) {
          const { data: upData, error: upErr } = await signUpWithPassword(emailInput, passwordInput);
          if (upErr) {
            onShowToast(`Errore: ${upErr.message}`);
          } else {
            onShowToast('✨ Account registrato e collegato a Supabase!');
            await checkUserAndConnection();
            await onSyncAll();
          }
        } else {
          onShowToast(`Errore: ${error.message}`);
        }
      } else {
        onShowToast(`✨ Accesso effettuato per ${emailInput}!`);
        await checkUserAndConnection();
        await onSyncAll();
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

  const currentAppOrigin = typeof window !== 'undefined' ? window.location.origin : '';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#120d26] border border-amber-400/40 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] pb-6 sm:pb-0">
        
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
        <div className="flex border-b border-[#2a244d] bg-[#0d091e] px-4 overflow-x-auto">
          <button
            onClick={() => setActiveTab('auth')}
            className={`py-3 px-3.5 text-xs font-semibold border-b-2 transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'auth'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-purple-300 hover:text-white'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>1. Login Email ({AUTHORIZED_EMAIL})</span>
          </button>

          <button
            onClick={() => setActiveTab('config')}
            className={`py-3 px-3.5 text-xs font-semibold border-b-2 transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'config'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-purple-300 hover:text-white'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>2. Configura Chiavi Supabase</span>
          </button>

          <button
            onClick={() => setActiveTab('guida')}
            className={`py-3 px-3.5 text-xs font-semibold border-b-2 transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'guida'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-purple-300 hover:text-white'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
            <span>Risolvi Link Email 💡</span>
          </button>

          <button
            onClick={() => setActiveTab('sql')}
            className={`py-3 px-3.5 text-xs font-semibold border-b-2 transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'sql'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-purple-300 hover:text-white'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>3. Script SQL</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs text-purple-200 flex-grow">
          
          {/* TAB 1: AUTHENTICATION (mariateresarogani@gmail.com) */}
          {activeTab === 'auth' && (
            <div className="space-y-4">
              
              {/* Info Banner */}
              <div className="bg-[#181133] border border-amber-400/30 p-3.5 rounded-xl space-y-1.5">
                <div className="flex items-center gap-2 text-amber-300 font-semibold">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <span>Accesso Riservato Esclusivo</span>
                </div>
                <p className="text-[11px] text-purple-200 leading-relaxed">
                  L'accesso al Santuario Cloud è configurato per: <strong className="text-white">{AUTHORIZED_EMAIL}</strong>.
                  Puoi accedere con il <strong>Codice OTP a 6 cifre</strong> (senza dover cliccare link esterni) oppure con <strong>Password Personale</strong>.
                </p>
              </div>

              {user ? (
                <div className="p-4 bg-emerald-950/40 border border-emerald-500/40 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-emerald-300 font-bold flex items-center gap-1.5">
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>Sei connessa e autenticata come:</span>
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-900 text-emerald-200 font-mono">
                      Autenticato
                    </span>
                  </div>
                  <p className="text-white font-mono text-sm font-semibold">{user.email}</p>
                  
                  <div className="pt-2 flex items-center gap-3">
                    <button
                      onClick={onSyncAll}
                      disabled={isSyncing}
                      className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
                    >
                      {isSyncing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <UploadCloud className="w-3.5 h-3.5" />}
                      <span>Sincronizza Dati Adesso</span>
                    </button>
                    
                    <button
                      onClick={handleSignOut}
                      disabled={authLoading}
                      className="px-4 py-2 bg-rose-900/60 hover:bg-rose-800/80 text-rose-200 border border-rose-500/40 rounded-xl text-xs font-semibold transition cursor-pointer"
                    >
                      Disconnetti
                    </button>
                  </div>
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
                      className="w-full bg-[#1b1238] border border-[#2a244d] rounded-xl px-3.5 py-2.5 text-white font-mono text-xs focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  {/* METHOD 1: MAGIC LINK & 6-DIGIT OTP (No broken links!) */}
                  <div className="p-4 bg-[#140e2d] border border-purple-500/30 rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-amber-300 text-xs flex items-center gap-1.5">
                        <Mail className="w-4 h-4 text-amber-400" />
                        <span>Metodo 1: Email Magic Link / Codice OTP</span>
                      </span>
                      <span className="text-[10px] text-emerald-400 font-medium">Consigliato</span>
                    </div>
                    
                    <p className="text-[11px] text-purple-200/90 leading-relaxed">
                      Ricevi una mail con un codice a 6 cifre (es. <code>123456</code>). Inserisci il codice qui sotto per entrare all'istante, senza dover cliccare il link se il tuo browser lo blocca.
                    </p>

                    <div className="flex gap-2">
                      <button
                        onClick={handleSendMagicLink}
                        disabled={authLoading}
                        className="flex-1 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl text-xs transition active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        <span>{magicLinkSent ? 'Rinvia Codice / Email' : `Invia Codice a ${emailInput}`}</span>
                      </button>
                    </div>

                    {/* OTP verification box */}
                    <div className="pt-2 border-t border-purple-500/20 space-y-2">
                      <label className="block text-[11px] text-purple-300 font-semibold">
                        Hai ricevuto il codice via email? Inseriscilo qui:
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={otpToken}
                          onChange={(e) => setOtpToken(e.target.value)}
                          placeholder="Codice a 6 cifre (es. 839201)"
                          maxLength={12}
                          className="flex-1 bg-[#1b1238] border border-[#2a244d] rounded-xl px-3.5 py-2 text-white font-mono text-center tracking-widest text-sm focus:outline-none focus:border-amber-400"
                        />
                        <button
                          onClick={handleVerifyOtp}
                          disabled={authLoading || !otpToken}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition disabled:opacity-50 cursor-pointer shadow-md flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Conferma Codice</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* METHOD 2: PASSWORD (Direct login, zero redirects) */}
                  <div className="p-4 bg-[#140e2d] border border-purple-500/30 rounded-xl space-y-3">
                    <span className="font-bold text-purple-200 text-xs flex items-center gap-1.5">
                      <KeyRound className="w-4 h-4 text-purple-400" />
                      <span>Metodo 2: Password Personale (Accesso Diretto)</span>
                    </span>
                    <p className="text-[11px] text-purple-300 leading-relaxed">
                      Scegli una password a tua scelta. Se l'utente non è ancora registrato, verrà creato automaticamente al primo invio.
                    </p>
                    <div className="flex gap-2">
                      <input
                        type="password"
                        value={passwordInput}
                        onChange={(e) => setPasswordInput(e.target.value)}
                        placeholder="Inserisci la tua password..."
                        className="flex-1 bg-[#1b1238] border border-[#2a244d] rounded-xl px-3.5 py-2 text-white text-xs focus:outline-none focus:border-amber-400 placeholder:text-purple-400/50"
                      />
                      <button
                        onClick={handlePasswordLogin}
                        disabled={authLoading || !passwordInput}
                        className="px-5 py-2 bg-[#2a1d52] hover:bg-[#38266e] border border-purple-400/40 text-amber-300 font-bold rounded-xl text-xs transition active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        <Lock className="w-3.5 h-3.5" />
                        <span>Accedi</span>
                      </button>
                    </div>
                  </div>

                </div>
              )}
            </div>
          )}

          {/* TAB: GUIDA RISOLUZIONE ERRORE LINK EMAIL */}
          {activeTab === 'guida' && (
            <div className="space-y-4">
              <div className="p-4 bg-amber-950/40 border border-amber-500/40 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
                  <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0" />
                  <span>Perché ricevevi "Impossibile connettersi al sito"?</span>
                </div>
                <p className="text-[11px] text-purple-200 leading-relaxed">
                  Quando crei un nuovo progetto su Supabase, il <strong>Site URL di Reindirizzamento</strong> è preimpostato su <code>http://localhost:3000</code>. Quando clicchi il link nell'email dal telefono o da un altro browser, tenta di aprirsi su <em>localhost</em> che non esiste fuori dal computer di sviluppo.
                </p>
              </div>

              <div className="p-4 bg-[#181133] border border-purple-500/30 rounded-xl space-y-3">
                <span className="font-bold text-white text-xs block">
                  🛠️ Come risolvere in 2 semplici passi su Supabase:
                </span>

                <ol className="list-decimal pl-4 space-y-2 text-[11px] text-purple-200/90 leading-relaxed">
                  <li>
                    Apri la tua dashboard su{' '}
                    <a
                      href="https://supabase.com/dashboard"
                      target="_blank"
                      rel="noreferrer"
                      className="text-amber-300 underline font-bold inline-flex items-center gap-0.5"
                    >
                      Supabase.com <ExternalLink className="w-3 h-3" />
                    </a>
                  </li>
                  <li>
                    Nel menu a sinistra vai su <strong>Authentication → URL Configuration</strong>.
                  </li>
                  <li>
                    Nel campo <strong>Site URL</strong>, incolla il link reale della tua app:
                    <div className="mt-1 p-2 bg-[#0a0715] border border-[#2a244d] rounded-lg font-mono text-[10px] text-emerald-300 flex items-center justify-between">
                      <span>{currentAppOrigin}</span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(currentAppOrigin);
                          onShowToast('📋 URL della tua applicazione copiato!');
                        }}
                        className="text-amber-400 hover:underline text-[10px] ml-2 flex items-center gap-1"
                      >
                        <Copy className="w-3 h-3" />
                        <span>Copia</span>
                      </button>
                    </div>
                  </li>
                  <li>
                    Sotto, in <strong>Redirect URLs</strong>, clicca <em>Add URL</em> e aggiungi <code>{currentAppOrigin}/**</code> e <code>https://**</code>, poi premi <strong>Save</strong> in basso.
                  </li>
                </ol>
              </div>

              <div className="p-3.5 bg-emerald-950/30 border border-emerald-500/30 rounded-xl space-y-1">
                <span className="font-bold text-emerald-300 text-xs block">
                  💡 Soluzione Alternativa Immediata (Senza cambiare nulla):
                </span>
                <p className="text-[11px] text-purple-200">
                  Puoi semplicemente aprire la scheda <strong>"1. Login Email"</strong> qui accanto e inserire il <strong>codice numerico a 6 cifre</strong> contenuto nell'email, oppure inserire una <strong>Password</strong>. Funziona istantaneamente al 100%!
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: CONFIGURATION */}
          {activeTab === 'config' && (
            <div className="space-y-4">
              <div className="bg-[#181133] border border-purple-500/30 p-3.5 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-amber-300 font-semibold">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>Chiavi del tuo Progetto Supabase:</span>
                  </span>
                  <a
                    href="https://supabase.com/dashboard"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-amber-400 hover:underline flex items-center gap-1"
                  >
                    <span>Apri Supabase Dashboard</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <p className="text-[11px] text-purple-200/90 leading-relaxed">
                  Trovi questi valori in <strong>Project Settings → API</strong> nel tuo progetto Supabase.
                </p>
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

          {/* TAB 3: SQL SCHEMA SCRIPT */}
          {activeTab === 'sql' && (
            <div className="space-y-3">
              <div className="bg-[#181133] border border-purple-500/30 p-3.5 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-300 block text-xs">
                    ⚡ Schema SQL Completo & Migrazione (PDF, Foto e Registrazioni Audio)
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-500/40 text-emerald-300 font-semibold">
                    Versione Aggiornata
                  </span>
                </div>
                <p className="text-[11px] text-purple-200 leading-relaxed">
                  Per sincronizzare i nuovi allegati PDF, le immagini e le registrazioni audio del diario, esegui questo script in <strong>Supabase → SQL Editor → New Query → Run</strong>. Se hai già creato le tabelle in passato, il comando <code>ALTER TABLE</code> aggiungerà automaticamente i nuovi campi senza cancellare i dati esistenti!
                </p>
              </div>

              {/* Quick 1-click update query for existing users */}
              <div className="p-3 bg-amber-950/30 border border-amber-500/30 rounded-xl space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-amber-300">
                    🔧 Se hai già il database attivo (Aggiornamento Rapido in 2 secondi):
                  </span>
                  <button
                    onClick={() => {
                      const quickSql = `ALTER TABLE journal_notes ADD COLUMN IF NOT EXISTS attachments JSONB;
ALTER TABLE journal_notes ADD COLUMN IF NOT EXISTS audio_recording JSONB;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS birth_date TEXT;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'Cliente Abituale';`;
                      navigator.clipboard.writeText(quickSql);
                      onShowToast('📋 Script rapido di aggiornamento copiato!');
                    }}
                    className="px-2.5 py-1 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-[10px] rounded-lg transition flex items-center gap-1 shadow cursor-pointer"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Copia Solo Aggiornamento Tabelle</span>
                  </button>
                </div>
                <p className="text-[10px] text-purple-200 font-mono">
                  ALTER TABLE journal_notes ADD COLUMN IF NOT EXISTS attachments JSONB; audio_recording JSONB;
                </p>
              </div>

              <div className="relative">
                <pre className="p-3 bg-[#0a0715] border border-[#2a244d] rounded-xl font-mono text-[10px] text-emerald-300/90 overflow-x-auto max-h-52 select-all">
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
