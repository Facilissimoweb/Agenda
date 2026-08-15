import React from 'react';
import { TabId } from '../types';
import { 
  Home, 
  Calendar, 
  Droplet, 
  Utensils, 
  BookUser, 
  BookMarked, 
  Wand2,
  MessageSquareText
} from 'lucide-react';

interface MobileNavProps {
  activeTab: TabId;
  onSelectTab: (tab: TabId) => void;
  appointmentsCount: number;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  activeTab,
  onSelectTab,
  appointmentsCount,
}) => {
  const tabs: Array<{ id: TabId; label: string; icon: React.ComponentType<{ className?: string }>; badge?: number }> = [
    { id: 'home', label: 'Oggi', icon: Home },
    { id: 'chat', label: 'Oracolo', icon: MessageSquareText },
    { id: 'agenda', label: 'Agenda', icon: Calendar, badge: appointmentsCount },
    { id: 'ciclo', label: 'Ciclo', icon: Droplet },
    { id: 'menu', label: 'Menù', icon: Utensils },
    { id: 'rubrica', label: 'Rubrica', icon: BookUser },
    { id: 'diario', label: 'Diario', icon: BookMarked },
    { id: 'strumenti', label: 'Strumenti', icon: Wand2 },
  ];

  return (
    <nav 
      aria-label="Navigazione Principale Mobile"
      className="lg:hidden fixed bottom-0 left-0 right-0 bg-[#0a0915]/95 backdrop-blur-xl border-t border-[#2a244d] px-1 py-1.5 z-50 flex justify-around items-center text-[10px] shadow-[0_-10px_25px_-5px_rgba(0,0,0,0.6)]"
      style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 6px)' }}
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => {
              if (navigator.vibrate) navigator.vibrate(10);
              onSelectTab(tab.id);
            }}
            className={`flex flex-col items-center justify-center gap-0.5 p-1 rounded-xl transition-all duration-200 min-w-[48px] relative ${
              isActive
                ? 'text-amber-300 font-semibold scale-105'
                : 'text-purple-300/70 hover:text-purple-200'
            }`}
          >
            <div className={`p-1 rounded-lg transition-all ${
              isActive ? 'bg-amber-400/15 border border-amber-400/30' : ''
            }`}>
              <Icon className={`w-4 h-4 ${
                isActive ? 'text-amber-300' : tab.id === 'ciclo' ? 'text-rose-400/80' : 'text-purple-300/80'
              }`} />
            </div>
            <span className="text-[9px] tracking-tight leading-none">{tab.label}</span>

            {/* Badge */}
            {tab.badge !== undefined && tab.badge > 0 && (
              <span className="absolute top-0 right-1 w-3.5 h-3.5 rounded-full bg-amber-400 text-slate-950 font-bold text-[8px] flex items-center justify-center shadow">
                {tab.badge}
              </span>
            )}

            {/* Active Indicator Dot */}
            {isActive && (
              <div className="w-1 h-1 rounded-full bg-amber-400 shadow-[0_0_8px_#d4af37] mt-0.5" />
            )}
          </button>
        );
      })}
    </nav>
  );
};
