import React from 'react';
import { TabId } from '../types';
import { 
  Home, 
  Calendar, 
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
  const tabs: Array<{ id: TabId; label: string; icon: React.ComponentType<{ className?: string }>; badge?: number; highlight?: boolean }> = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'chat', label: 'Oracolo', icon: MessageSquareText, highlight: true },
    { id: 'agenda', label: 'Agenda', icon: Calendar, badge: appointmentsCount },
  ];

  return (
    <nav 
      aria-label="Navigazione Principale Sticky"
      className="fixed bottom-0 left-0 right-0 bg-[#0a0915]/95 backdrop-blur-xl border-t border-[#2a244d] px-[clamp(8px,3vw,16px)] py-[clamp(3px,0.8vh,6px)] z-50 flex justify-around items-center text-xs shadow-[0_-10px_25px_-5px_rgba(0,0,0,0.6)] max-w-md mx-auto sm:rounded-t-2xl sm:border-x sm:border-[#2a244d]"
      style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + clamp(4px, 0.8vh, 8px))' }}
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
            className={`flex flex-col items-center justify-center gap-0.5 py-0.5 px-[clamp(8px,2.5vw,16px)] rounded-xl transition-all duration-200 min-w-[64px] sm:min-w-[72px] relative cursor-pointer ${
              isActive
                ? 'text-amber-300 font-bold scale-105'
                : 'text-purple-300/70 hover:text-purple-200'
            }`}
          >
            <div className={`p-1.5 rounded-xl transition-all ${
              isActive ? 'bg-amber-400/20 border border-amber-400/40 text-amber-300 shadow-sm shadow-amber-400/20' : 'text-purple-300'
            }`}>
              <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <span className="text-[10px] sm:text-[11px] tracking-wide leading-none">{tab.label}</span>

            {/* Badge */}
            {tab.badge !== undefined && tab.badge > 0 && (
              <span className="absolute top-0.5 right-2 sm:right-4 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-amber-400 text-slate-950 font-bold text-[8px] sm:text-[9px] flex items-center justify-center shadow">
                {tab.badge}
              </span>
            )}

            {/* Active Indicator Dot */}
            {isActive && (
              <div className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_8px_#d4af37] mt-0.5" />
            )}
          </button>
        );
      })}
    </nav>
  );
};
