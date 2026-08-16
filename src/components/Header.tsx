import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { TabId } from '../types';
import { 
  Calendar, 
  Droplet, 
  Utensils, 
  BookUser, 
  BookMarked, 
  Wand2, 
  Plus, 
  Home, 
  Sparkles,
  ShieldCheck,
  MessageSquareText,
  Database,
  Lock,
  Menu as MenuIcon,
  X,
  ChevronRight,
  Sparkle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface HeaderProps {
  activeTab: TabId;
  onSelectTab: (tab: TabId) => void;
  onOpenNewAppointment: () => void;
  appointmentsCount: number;
  isCloudConnected?: boolean;
  onOpenSupabaseModal: () => void;
  isDriveConnected?: boolean;
  onOpenGoogleDriveModal: () => void;
  onLockSanctuary?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  onOpenNewAppointment,
  appointmentsCount,
  isCloudConnected,
  onOpenSupabaseModal,
  isDriveConnected,
  onOpenGoogleDriveModal,
  onLockSanctuary,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on click outside or escape key & prevent body scroll on mobile
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsMenuOpen(false);
    };

    if (isMenuOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  // Specific hierarchy requested by the user: STRUMENTI / DIARIO / RUBRICA / CICLO / MENU
  const hierarchyMenu = [
    { 
      id: 'strumenti' as TabId, 
      label: 'STRUMENTI', 
      icon: Wand2, 
      desc: 'Oracoli, Tarocchi, Rune e Rituali',
      accent: 'text-amber-300 bg-amber-400/10 border-amber-400/30'
    },
    { 
      id: 'diario' as TabId, 
      label: 'DIARIO', 
      icon: BookMarked, 
      desc: 'Riflessioni intime, sogni e consulti',
      accent: 'text-purple-300 bg-purple-400/10 border-purple-400/30'
    },
    { 
      id: 'rubrica' as TabId, 
      label: 'RUBRICA', 
      icon: BookUser, 
      desc: 'Schede clienti, note e contatti',
      accent: 'text-blue-300 bg-blue-400/10 border-blue-400/30'
    },
    { 
      id: 'ciclo' as TabId, 
      label: 'CICLO', 
      icon: Droplet, 
      desc: 'Ritmo mestruale, lunazioni e fasi',
      accent: 'text-rose-300 bg-rose-400/10 border-rose-400/30'
    },
    { 
      id: 'menu' as TabId, 
      label: 'MENU', 
      icon: Utensils, 
      desc: 'Pianificazione pasti e nutrizione alchemica',
      accent: 'text-emerald-300 bg-emerald-400/10 border-emerald-400/30'
    },
  ];

  const quickLinks = [
    { id: 'home' as TabId, label: 'Home', icon: Home },
    { id: 'chat' as TabId, label: 'Oracolo AI', icon: MessageSquareText },
    { id: 'agenda' as TabId, label: 'Agenda Appuntamenti', icon: Calendar, badge: appointmentsCount },
  ];

  const handleNavigate = (tab: TabId) => {
    onSelectTab(tab);
    setIsMenuOpen(false);
  };

  return (
    <header className="py-3 sm:py-4 border-b border-[#2a244d]/70 flex items-center justify-between sticky top-0 bg-[#0a0915]/90 backdrop-blur-md z-40 px-3 sm:px-0">
      
      {/* Left: Brand / Sanctuary Title */}
      <button 
        onClick={() => onSelectTab('home')}
        className="flex items-center gap-2.5 sm:gap-3 group text-left focus:outline-none cursor-pointer"
      >
        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-amber-400/60 flex items-center justify-center bg-[#1d1138] text-amber-300 shadow-md shadow-amber-500/10 group-hover:border-amber-400 transition-all duration-300">
          <span className="text-base sm:text-lg">🌙</span>
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="block font-cinzel font-bold text-sm sm:text-lg tracking-wider gold-gradient-text">
              MARIA TERESA
            </span>
            <span className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-semibold bg-purple-950/80 border border-purple-500/30 text-amber-300">
              <ShieldCheck className="w-2.5 h-2.5 text-amber-400" />
              Privato
            </span>
          </div>
          <span className="block text-[9px] sm:text-[11px] text-purple-300/80 font-light tracking-widest uppercase">
            Agenda & Santuario
          </span>
        </div>
      </button>

      {/* Right: Lock & Hamburger Menu */}
      <div className="flex items-center gap-2" ref={menuRef}>
        
        {/* Lock Privacy Button */}
        {onLockSanctuary && (
          <button
            onClick={onLockSanctuary}
            title="Blocca e oscura il Santuario (ficoinfiore)"
            className="p-2 sm:p-2.5 rounded-full bg-[#171030] hover:bg-rose-950/60 border border-purple-500/30 hover:border-rose-500/50 text-purple-300 hover:text-rose-300 transition cursor-pointer"
          >
            <Lock className="w-4 h-4" />
          </button>
        )}

        {/* Hamburger Menu Trigger Button */}
        <div className="relative">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Menu Principale"
            aria-expanded={isMenuOpen}
            className={`p-2 sm:p-2.5 rounded-full border transition-all cursor-pointer flex items-center justify-center ${
              isMenuOpen
                ? 'bg-amber-400 text-slate-950 border-amber-400 shadow-lg shadow-amber-400/20'
                : 'bg-[#181133] border-purple-500/40 text-purple-200 hover:text-amber-300 hover:border-amber-400/50'
            }`}
          >
            {isMenuOpen ? <X className="w-4 h-4" /> : <MenuIcon className="w-4 h-4" />}
          </button>

          {/* Centered Mobile-First Modal Menu using Portal to document.body */}
          {typeof document !== 'undefined' &&
            createPortal(
              <AnimatePresence>
                {isMenuOpen && (
                  <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3.5 sm:p-6 overflow-y-auto">
                    {/* Dark Backdrop Scrim */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      onClick={() => setIsMenuOpen(false)}
                      className="fixed inset-0 bg-slate-950/85 backdrop-blur-md"
                      aria-hidden="true"
                    />

                    {/* Centered Modal Card */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.92, y: 15 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.92, y: 15 }}
                      transition={{ type: 'spring', damping: 26, stiffness: 280 }}
                      className="relative w-full max-w-lg bg-[#120c2b] border-2 border-amber-400/60 rounded-3xl shadow-[0_0_50px_rgba(212,175,55,0.25)] overflow-hidden flex flex-col my-auto max-h-[90vh] z-10 text-left"
                    >
                      {/* Modal Header */}
                      <div className="p-4 border-b border-[#2a244d] bg-gradient-to-r from-[#1e1342] via-[#160f33] to-[#120c2b] flex items-center justify-between shrink-0">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-full bg-[#24174d] border border-amber-400/60 flex items-center justify-center text-amber-300 text-base shadow">
                            🌙
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-cinzel text-sm font-bold tracking-wider gold-gradient-text block">
                                MARIA TERESA
                              </span>
                            </div>
                            <span className="text-[10px] text-purple-300/80 font-light tracking-wider uppercase block">
                              Menù Principale & Santuario
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => setIsMenuOpen(false)}
                          className="p-2.5 rounded-full bg-purple-950/90 hover:bg-purple-900 border border-amber-400/50 text-amber-300 hover:text-white transition cursor-pointer shadow-md"
                          aria-label="Chiudi menu"
                        >
                          <X className="w-4 h-4 stroke-[2.5]" />
                        </button>
                      </div>

                      {/* Modal Scrollable Body */}
                      <div className="flex-1 overflow-y-auto p-3.5 sm:p-5 space-y-4">
                        
                        {/* Top Action Cards: Appuntamenti, Cloud & Google Drive */}
                        <div className="space-y-2.5">
                          <div className="grid grid-cols-2 gap-2.5">
                            {/* Nuovi Appuntamenti */}
                            <button
                              onClick={() => {
                                onOpenNewAppointment();
                                setIsMenuOpen(false);
                              }}
                              className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs flex flex-col items-center justify-center gap-1 shadow-lg active:scale-95 transition cursor-pointer"
                            >
                              <div className="flex items-center gap-1.5">
                                <Plus className="w-4 h-4 stroke-[2.5]" />
                                <span className="leading-tight text-xs font-cinzel">Appuntamenti</span>
                              </div>
                              {appointmentsCount > 0 ? (
                                <span className="text-[11px] font-medium opacity-90">
                                  {appointmentsCount} registrati
                                </span>
                              ) : (
                                <span className="text-[11px] font-medium opacity-90">
                                  Nuovo consulto
                                </span>
                              )}
                            </button>

                            {/* Cloud Supabase */}
                            <button
                              onClick={() => {
                                onOpenSupabaseModal();
                                setIsMenuOpen(false);
                              }}
                              className={`p-3.5 rounded-2xl border text-xs font-semibold flex flex-col items-center justify-center gap-1 transition active:scale-95 cursor-pointer shadow-md ${
                                isCloudConnected
                                  ? 'bg-emerald-950/70 border-emerald-500/50 text-emerald-300 hover:bg-emerald-900/80'
                                  : 'bg-[#1e133d] border-purple-500/40 text-purple-200 hover:border-amber-400/50 hover:text-amber-300'
                              }`}
                            >
                              <div className="flex items-center gap-1.5">
                                <Database className="w-4 h-4 text-emerald-400" />
                                <span className="font-cinzel">Supabase</span>
                                {isCloudConnected && (
                                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                )}
                              </div>
                              <span className="text-[11px] font-mono opacity-80">
                                {isCloudConnected ? 'Sincronizzato' : 'Configura Cloud'}
                              </span>
                            </button>
                          </div>

                          {/* Google Drive Action */}
                          <button
                            onClick={() => {
                              onOpenGoogleDriveModal();
                              setIsMenuOpen(false);
                            }}
                            className={`w-full p-3.5 rounded-2xl border text-xs font-semibold flex items-center justify-between transition active:scale-98 cursor-pointer shadow-md ${
                              isDriveConnected
                                ? 'bg-blue-950/60 border-blue-500/50 text-blue-200 hover:bg-blue-900/70'
                                : 'bg-[#181136] border-purple-500/40 text-purple-200 hover:border-blue-400/50 hover:text-blue-300'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <svg className="w-5 h-5 shrink-0" viewBox="0 0 87.3 78" xmlns="http://www.w3.org/2000/svg">
                                <path d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8h-27.5c0 1.55.4 3.1 1.2 4.5z" fill="#0066da"/>
                                <path d="m43.65 25-13.75-23.8c-1.35.8-2.5 1.9-3.3 3.3l-25.4 44a9.06 9.06 0 0 0 -1.2 4.5h27.5z" fill="#00ac47"/>
                                <path d="m73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5h-27.502l5.852 11.5z" fill="#ea4335"/>
                                <path d="m43.65 25 13.75-23.8c-1.35-.8-2.9-1.2-4.5-1.2h-18.5c-1.6 0-3.15.45-4.5 1.2z" fill="#00832d"/>
                                <path d="m59.8 53h-32.3l-13.75 23.8c1.35.8 2.9 1.2 4.5 1.2h50.8c1.6 0 3.15-.45 4.5-1.2z" fill="#2684fc"/>
                                <path d="m73.4 26.5-12.7-22c-.8-1.4-1.95-2.5-3.3-3.3l-13.75 23.8 16.15 28h27.45c0-1.55-.4-3.1-1.2-4.5z" fill="#ffba00"/>
                              </svg>
                              <div className="text-left">
                                <span className="block font-bold font-cinzel text-xs text-white">Google Drive</span>
                                <span className="block text-[11px] text-purple-300 font-normal">
                                  {isDriveConnected ? 'Connesso • Backup & File Grimoire' : 'Connetti per Backup & File'}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 text-[11px] font-mono px-3 py-1 rounded-full bg-purple-950 border border-purple-500/30">
                              <span className={`w-2 h-2 rounded-full ${isDriveConnected ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                              <span>{isDriveConnected ? 'Attivo' : 'Apri'}</span>
                            </div>
                          </button>
                        </div>

                        {/* Primary Hierarchy: STRUMENTI / DIARIO / RUBRICA / CICLO / MENU */}
                        <div className="space-y-2 pt-1">
                          <div className="flex items-center justify-between px-2">
                            <span className="text-[11px] uppercase tracking-widest text-amber-400/90 font-bold font-cinzel">
                              Sezioni Principali
                            </span>
                            <span className="text-[10px] text-purple-400/80 font-mono">
                              5 Sezioni
                            </span>
                          </div>
                          
                          <div className="space-y-1.5">
                            {hierarchyMenu.map((item) => {
                              const Icon = item.icon;
                              const isActive = activeTab === item.id;
                              return (
                                <button
                                  key={item.id}
                                  onClick={() => handleNavigate(item.id)}
                                  className={`w-full p-3 rounded-2xl transition-all flex items-center justify-between group text-left cursor-pointer ${
                                    isActive
                                      ? 'bg-amber-400 text-slate-950 font-bold shadow-lg shadow-amber-400/20 scale-[1.01]'
                                      : 'hover:bg-[#211642] bg-[#150f2f] border border-purple-500/20 text-purple-100'
                                  }`}
                                >
                                  <div className="flex items-center gap-3">
                                    <div className={`p-2.5 rounded-xl border shrink-0 ${
                                      isActive ? 'bg-slate-950/20 border-slate-950/30 text-slate-950' : item.accent
                                    }`}>
                                      <Icon className="w-4 h-4" />
                                    </div>
                                    <div>
                                      <span className={`block font-cinzel font-bold text-xs tracking-wider ${
                                        isActive ? 'text-slate-950' : 'text-amber-200 group-hover:text-amber-300'
                                      }`}>
                                        {item.label}
                                      </span>
                                      <span className={`block text-[11px] leading-snug ${
                                        isActive ? 'text-slate-900/90 font-normal' : 'text-purple-300/75'
                                      }`}>
                                        {item.desc}
                                      </span>
                                    </div>
                                  </div>

                                  <ChevronRight className={`w-4 h-4 shrink-0 transition-transform group-hover:translate-x-1 ${
                                    isActive ? 'text-slate-950' : 'text-purple-400'
                                  }`} />
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Quick Secondary Links */}
                        <div className="p-3.5 rounded-2xl border border-[#2a244d] bg-[#0c081c] space-y-2.5">
                          <span className="text-[10px] uppercase tracking-widest text-purple-400 font-semibold px-1 block font-cinzel">
                            Accesso Rapido
                          </span>
                          <div className="grid grid-cols-3 gap-2">
                            {quickLinks.map((q) => {
                              const Icon = q.icon;
                              const isQActive = activeTab === q.id;
                              return (
                                <button
                                  key={q.id}
                                  onClick={() => handleNavigate(q.id)}
                                  className={`p-2.5 rounded-xl text-center transition flex flex-col items-center gap-1 cursor-pointer ${
                                    isQActive
                                      ? 'bg-amber-400/20 border border-amber-400/50 text-amber-300 font-bold'
                                      : 'bg-[#150f2e] border border-purple-500/20 text-purple-300 hover:text-white hover:bg-[#1f1642]'
                                  }`}
                                >
                                  <Icon className="w-4 h-4 text-amber-400/90" />
                                  <span className="text-[10px] truncate max-w-[80px]">{q.label}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Privacy Lock Action Inside Modal */}
                        {onLockSanctuary && (
                          <div className="pt-1">
                            <button
                              onClick={() => {
                                setIsMenuOpen(false);
                                onLockSanctuary();
                              }}
                              className="w-full p-3 rounded-2xl border border-rose-500/30 bg-rose-950/30 hover:bg-rose-950/60 text-rose-300 text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer"
                            >
                              <Lock className="w-4 h-4" />
                              <span>Blocca Santuario (Privacy ficoinfiore)</span>
                            </button>
                          </div>
                        )}

                      </div>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>,
              document.body
            )}
        </div>

      </div>
    </header>
  );
};
