import React from 'react';
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
  MessageSquareText
} from 'lucide-react';

interface HeaderProps {
  activeTab: TabId;
  onSelectTab: (tab: TabId) => void;
  onOpenNewAppointment: () => void;
  appointmentsCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  onOpenNewAppointment,
  appointmentsCount,
}) => {
  const navItems: Array<{ id: TabId; label: string; icon: React.ComponentType<{ className?: string }>; badge?: number; highlight?: boolean }> = [
    { id: 'home', label: 'Oggi', icon: Home },
    { id: 'chat', label: 'Oracolo AI', icon: MessageSquareText, highlight: true },
    { id: 'agenda', label: 'Appuntamenti', icon: Calendar, badge: appointmentsCount },
    { id: 'ciclo', label: 'Ciclo & Luna', icon: Droplet },
    { id: 'menu', label: 'Menù', icon: Utensils },
    { id: 'rubrica', label: 'Rubrica', icon: BookUser },
    { id: 'diario', label: 'Diario', icon: BookMarked },
    { id: 'strumenti', label: 'Strumenti', icon: Wand2 },
  ];

  return (
    <header className="py-3 sm:py-4 border-b border-[#2a244d]/70 flex items-center justify-between sticky top-0 bg-[#0a0915]/90 backdrop-blur-md z-40 px-3 sm:px-0">
      <button 
        onClick={() => onSelectTab('home')}
        className="flex items-center gap-2.5 sm:gap-3 group text-left focus:outline-none"
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
            Agenda & Diario Esoterico
          </span>
        </div>
      </button>

      {/* Desktop / Tablet Navigation Menu */}
      <nav className="hidden lg:flex items-center gap-1 bg-[#131127]/90 border border-[#2a244d] p-1.5 rounded-full text-xs shadow-lg shadow-purple-950/40">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`px-3 py-1.5 rounded-full transition-all duration-200 flex items-center gap-1.5 relative ${
                isActive
                  ? 'bg-amber-400 text-slate-950 font-bold shadow-md shadow-amber-400/20'
                  : 'text-purple-200 hover:text-amber-300 hover:bg-purple-900/30'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-slate-950' : item.id === 'ciclo' ? 'text-rose-400' : 'text-purple-300'}`} />
              <span>{item.label}</span>
              {item.badge !== undefined && item.badge > 0 && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                  isActive ? 'bg-slate-950 text-amber-300' : 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Quick Action Button */}
      <div className="flex items-center gap-2">
        <button
          onClick={onOpenNewAppointment}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-[11px] sm:text-xs font-semibold uppercase tracking-wider bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 hover:from-amber-400 hover:to-amber-500 transition-all shadow-md shadow-amber-500/20 active:scale-95 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span className="hidden sm:inline">Nuovo</span> Appuntamento
        </button>
      </div>
    </header>
  );
};
