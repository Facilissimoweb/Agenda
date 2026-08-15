import React, { useState, useRef, useEffect } from 'react';
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
  onLockSanctuary?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  onOpenNewAppointment,
  appointmentsCount,
  isCloudConnected,
  onOpenSupabaseModal,
  onLockSanctuary,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on click outside or escape key
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsMenuOpen(false);
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
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

          {/* Hamburger Dropdown / Modal Menu */}
          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="absolute right-0 top-12 w-80 bg-[#120d26] border border-amber-400/40 rounded-2xl shadow-2xl overflow-hidden z-50 backdrop-blur-xl"
              >
                {/* Menu Header */}
                <div className="p-3.5 border-b border-[#2a244d] bg-gradient-to-r from-[#1a1236] to-[#120d26] flex items-center justify-between">
                  <div className="flex items-center gap-2 text-amber-300 font-cinzel text-xs font-bold tracking-wider">
                    <Sparkle className="w-3.5 h-3.5 text-amber-400" />
                    <span>SANTUARIO DI MARIA TERESA</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-950 border border-purple-500/30 text-purple-300 font-mono">
                    Menù
                  </span>
                </div>

                {/* Direct Action Buttons Inside Hamburger: Appuntamenti & Cloud */}
                <div className="p-3 border-b border-[#2a244d]/70 bg-[#160f33] grid grid-cols-2 gap-2">
                  {/* Nuovi Appuntamenti */}
                  <button
                    onClick={() => {
                      onOpenNewAppointment();
                      setIsMenuOpen(false);
                    }}
                    className="p-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs flex flex-col items-center justify-center gap-1 shadow-md active:scale-95 transition cursor-pointer"
                  >
                    <div className="flex items-center gap-1">
                      <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span className="leading-tight">Appuntamenti</span>
                    </div>
                    {appointmentsCount > 0 && (
                      <span className="text-[10px] font-normal opacity-90">
                        {appointmentsCount} registrati
                      </span>
                    )}
                  </button>

                  {/* Cloud Supabase */}
                  <button
                    onClick={() => {
                      onOpenSupabaseModal();
                      setIsMenuOpen(false);
                    }}
                    className={`p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center gap-1 transition active:scale-95 cursor-pointer ${
                      isCloudConnected
                        ? 'bg-emerald-950/70 border-emerald-500/50 text-emerald-300 hover:bg-emerald-900/80'
                        : 'bg-[#221645] border-purple-500/40 text-purple-200 hover:border-amber-400/50 hover:text-amber-300'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <Database className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Cloud</span>
                      {isCloudConnected && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      )}
                    </div>
                    <span className="text-[10px] font-mono opacity-80">
                      {isCloudConnected ? 'Sincronizzato' : 'Configura'}
                    </span>
                  </button>
                </div>

                {/* Primary Requested Hierarchy: STRUMENTI / DIARIO / RUBRICA / CICLO / MENU */}
                <div className="p-2 space-y-1">
                  <span className="text-[9px] uppercase tracking-widest text-purple-400/70 font-semibold px-2 pt-1 block">
                    Sezioni Principali
                  </span>
                  {hierarchyMenu.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleNavigate(item.id)}
                        className={`w-full p-2.5 rounded-xl transition-all flex items-center justify-between group text-left cursor-pointer ${
                          isActive
                            ? 'bg-amber-400 text-slate-950 font-bold shadow-md shadow-amber-400/20'
                            : 'hover:bg-[#201642] text-purple-100'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg border ${
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
                            <span className={`block text-[10px] ${
                              isActive ? 'text-slate-900/80 font-normal' : 'text-purple-300/70'
                            }`}>
                              {item.desc}
                            </span>
                          </div>
                        </div>

                        <ChevronRight className={`w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 ${
                          isActive ? 'text-slate-950' : 'text-purple-400'
                        }`} />
                      </button>
                    );
                  })}
                </div>

                {/* Quick Secondary Links */}
                <div className="p-2.5 border-t border-[#2a244d] bg-[#0c081c] space-y-1">
                  <span className="text-[9px] uppercase tracking-widest text-purple-400/70 font-semibold px-2 block">
                    Accesso Rapido
                  </span>
                  <div className="grid grid-cols-3 gap-1 pt-0.5">
                    {quickLinks.map((q) => {
                      const Icon = q.icon;
                      const isQActive = activeTab === q.id;
                      return (
                        <button
                          key={q.id}
                          onClick={() => handleNavigate(q.id)}
                          className={`p-2 rounded-lg text-center transition flex flex-col items-center gap-1 cursor-pointer ${
                            isQActive
                              ? 'bg-amber-400/20 border border-amber-400/40 text-amber-300 font-semibold'
                              : 'bg-[#150f2e] border border-purple-500/20 text-purple-300 hover:text-white hover:bg-[#1f1642]'
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                          <span className="text-[9px] truncate max-w-[70px]">{q.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </header>
  );
};
