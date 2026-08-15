import React, { useState } from 'react';
import { Appointment, CycleData, TabId, TarotCard } from '../../types';
import { TAROT_DECK } from '../../data/initialData';
import { calculateRealMoon, getUpcomingMoonPhases, RealMoonDetails } from '../../utils/lunarEngine';
import { 
  Calendar, 
  Droplet, 
  Utensils, 
  Sparkles, 
  Clock, 
  ArrowRight, 
  RotateCw, 
  ShieldCheck, 
  Moon, 
  Leaf, 
  Flame, 
  MessageCircle,
  Wand2,
  Heart,
  ChevronDown,
  ChevronUp,
  Info,
  CheckCircle2,
  AlertCircle,
  Coffee
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface HomeViewProps {
  appointments: Appointment[];
  cycleData: CycleData;
  onNavigateTab: (tab: TabId) => void;
  onOpenNewAppointment: () => void;
  onShowToast: (msg: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  appointments,
  cycleData,
  onNavigateTab,
  onOpenNewAppointment,
  onShowToast,
}) => {
  const realMoon = calculateRealMoon(new Date());
  const upcomingPhases = getUpcomingMoonPhases(new Date(), 4);
  const [showNutritionDetails, setShowNutritionDetails] = useState<boolean>(false);
  
  // Calculate Cycle Day
  const startDate = new Date(cycleData.startDate);
  const today = new Date();
  const diffDays = Math.max(0, Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
  const currentCycleDay = (diffDays % (cycleData.avgLength || 28)) + 1;

  // Tarot Card state
  const [selectedTarot, setSelectedTarot] = useState<TarotCard>(TAROT_DECK[10] || TAROT_DECK[0]); // La Stella default
  const [isFlipped, setIsFlipped] = useState<boolean>(true);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);

  const drawNewCard = () => {
    setIsDrawing(true);
    setIsFlipped(false);

    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * TAROT_DECK.length);
      const newCard = TAROT_DECK[randomIndex];
      setSelectedTarot(newCard);
      setIsFlipped(true);
      setIsDrawing(false);

      try {
        confetti({
          particleCount: 35,
          spread: 60,
          origin: { y: 0.75 },
          colors: ['#d4af37', '#e9d5ff', '#9333ea'],
        });
      } catch (e) {
        // Safe fallback
      }

      onShowToast(`Estratto: ${newCard.name} • ${newCard.arcana}`);
    }, 450);
  };

  const upcomingAppts = appointments.slice(0, 3);

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Private Welcome Sanctuary Banner */}
      <div className="relative bg-gradient-to-br from-[#131127] via-[#1a1236] to-[#0d0920] border border-[#2a244d] p-5 sm:p-7 rounded-3xl overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-48 h-48 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center gap-5 md:gap-7">
          {/* Avatar & Badge */}
          <div className="relative flex-shrink-0">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-2 border-amber-400/80 p-1 shadow-xl shadow-purple-950/70 bg-[#131127] relative group">
              <img
                src="https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=400&q=80"
                alt="Maria Teresa"
                className="w-full h-full object-cover rounded-full filter contrast-105"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <div className="absolute inset-0 rounded-full border border-amber-400/30 animate-pulse pointer-events-none" />
            </div>
            <span className="absolute bottom-0 right-0 bg-amber-400 text-slate-950 text-[10px] sm:text-xs px-2 py-0.5 rounded-full font-bold shadow-md flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> Privato
            </span>
          </div>

          {/* Intro Text */}
          <div className="text-center md:text-left flex-1 space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/70 border border-purple-500/30 text-amber-300 text-xs font-medium">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Benedizioni del Giorno, Maria Teresa</span>
            </div>
            
            <h1 className="text-xl sm:text-3xl font-bold font-cinzel text-white leading-tight">
              Il Tuo Santuario & Assistente Personale
            </h1>
            <p className="text-xs sm:text-sm text-purple-200/80 font-light leading-relaxed max-w-2xl">
              Gestisci in totale riservatezza i tuoi consulti, monitora il tuo ritmo biologico e lunare, consulta la rubrica privata e canalizza le energie di oggi.
            </p>

            {/* Quick Pill Buttons */}
            <div className="pt-2 flex flex-wrap gap-2 justify-center md:justify-start text-xs">
              <button
                onClick={() => onNavigateTab('chat')}
                className="px-3.5 py-1.5 bg-gradient-to-r from-purple-800 to-indigo-900 hover:from-purple-700 hover:to-indigo-800 text-amber-200 rounded-xl border border-amber-400/40 shadow-lg transition flex items-center gap-1.5 active:scale-95 cursor-pointer font-medium"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Oracolo Groq AI (<strong>Voce & Microfono</strong>)</span>
              </button>

              <button
                onClick={() => onNavigateTab('agenda')}
                className="px-3 py-1.5 bg-amber-400/15 hover:bg-amber-400/25 text-amber-300 rounded-xl border border-amber-400/30 transition flex items-center gap-1.5 active:scale-95"
              >
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                <span>Consulti in Agenda (<strong>{appointments.length}</strong>)</span>
              </button>
              
              <button
                onClick={() => onNavigateTab('ciclo')}
                className="px-3 py-1.5 bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 rounded-xl border border-rose-500/30 transition flex items-center gap-1.5 active:scale-95"
              >
                <Droplet className="w-3.5 h-3.5 text-rose-400" />
                <span>Giorno Ciclo: <strong>{currentCycleDay}</strong></span>
              </button>

              <button
                onClick={() => onNavigateTab('menu')}
                className="px-3 py-1.5 bg-purple-900/35 hover:bg-purple-900/55 text-purple-200 rounded-xl border border-purple-500/30 transition flex items-center gap-1.5 active:scale-95"
              >
                <Utensils className="w-3.5 h-3.5 text-purple-300" />
                <span>Menù Alchemico</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Oracolo Groq AI Feature Banner */}
      <div className="bg-gradient-to-r from-[#1d1138] via-[#15102c] to-[#131127] border border-amber-400/50 p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl relative overflow-hidden">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-400/15 border border-amber-400/40 flex items-center justify-center text-amber-300 text-2xl flex-shrink-0 shadow-md">
            🔮
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-cinzel font-bold text-sm sm:text-base text-white">
                Oracolo Groq AI con Microfono & Voce
              </h2>
              <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
                Llama 3.3 70B
              </span>
            </div>
            <p className="text-xs text-purple-200/80 mt-0.5 font-light">
              Parla con il microfono, interroga gli astri, ricevi rituali personalizzati ed ascolta la lettura vocale in italiano.
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigateTab('chat')}
          className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl text-xs shadow-lg transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer flex-shrink-0"
        >
          <Sparkles className="w-4 h-4" />
          <span>Apri Chat Oracolare</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Main 2-Column Grid: Real Astronomical Moon Phase & Interactive Tarot Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Real Astronomical Moon Phase & Biodynamic Nutrition Card */}
        <div className="bg-[#131127] border border-[#2a244d] p-5 rounded-2xl flex flex-col justify-between shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-36 h-36 bg-amber-400/5 rounded-full blur-2xl pointer-events-none" />
          
          <div className="space-y-3">
            {/* Header with Real Illumination & Date */}
            <div className="flex items-center justify-between border-b border-[#2a244d]/70 pb-2.5">
              <span className="text-[11px] uppercase tracking-widest text-amber-400 font-semibold font-cinzel flex items-center gap-1.5">
                <Moon className="w-3.5 h-3.5 text-amber-300" /> Lunazione Astronomica Reale
              </span>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-purple-950 border border-purple-700/60 text-purple-200 font-medium">
                {realMoon.illumination}% Luce • Età {realMoon.ageDays}d
              </span>
            </div>

            {/* Moon Phase & Zodiac Sign */}
            <div className="flex items-start gap-3.5 my-1">
              <div className="text-4xl text-amber-200 filter drop-shadow-[0_0_8px_rgba(251,191,36,0.35)] select-none pt-0.5">
                {realMoon.icon}
              </div>
              <div className="flex-1">
                <h4 className="font-cinzel text-base font-bold text-white leading-snug">
                  {realMoon.phaseName}
                </h4>
                <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                  <span className="text-xs text-amber-300 font-medium">
                    in {realMoon.zodiacSign} ({realMoon.zodiacDegree}°)
                  </span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-900/60 text-purple-200 border border-purple-500/30">
                    {realMoon.element} {realMoon.elementIcon}
                  </span>
                </div>
              </div>
            </div>

            {/* Esoteric Oracle Advice */}
            <p className="text-xs text-purple-200/90 leading-relaxed italic border-l-2 border-amber-400/50 pl-2.5 py-0.5 bg-purple-950/20 rounded-r-lg">
              "{realMoon.advice}"
            </p>

            {/* Real Biodynamic & Organ Indicators */}
            <div className="pt-2 border-t border-[#2a244d]/60 space-y-2 text-xs">
              <div className="flex items-center justify-between text-purple-300">
                <span className="flex items-center gap-1.5">
                  <Leaf className="w-3.5 h-3.5 text-emerald-400" /> Giorno Biodinamico:
                </span>
                <strong className="text-emerald-300 font-semibold">{realMoon.biodynamicPlantPart}</strong>
              </div>

              <div className="flex items-center justify-between text-purple-300">
                <span className="flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5 text-rose-400" /> Organi Governati:
                </span>
                <span className="text-amber-200 text-[11px] font-medium text-right max-w-[170px] truncate" title={realMoon.governedOrgans}>
                  {realMoon.governedOrgans}
                </span>
              </div>
            </div>

            {/* Quick Toggle for Real Lunar Nutrition Impact */}
            <button
              onClick={() => setShowNutritionDetails(!showNutritionDetails)}
              className="w-full mt-2 py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500/20 to-purple-900/40 border border-amber-400/40 hover:border-amber-400 text-amber-200 hover:text-amber-100 text-xs font-semibold flex items-center justify-between transition active:scale-98 cursor-pointer shadow-xs"
            >
              <span className="flex items-center gap-1.5">
                <Utensils className="w-3.5 h-3.5 text-amber-400" />
                <span>Nutrizione Reale della Luna ({realMoon.phaseCategory})</span>
              </span>
              {showNutritionDetails ? (
                <ChevronUp className="w-4 h-4 text-amber-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-amber-400" />
              )}
            </button>

            {/* Expandable Lunar Nutrition Drawer */}
            {showNutritionDetails && (
              <div className="p-3 bg-[#0e0a1f] border border-amber-400/30 rounded-xl space-y-2.5 text-xs animate-fadeIn">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-amber-300 font-semibold text-[11px] uppercase tracking-wider">
                    <Info className="w-3.5 h-3.5 text-amber-400" /> Tema Fisiologico:
                  </div>
                  <p className="text-purple-200 text-[11px] leading-relaxed">
                    {realMoon.nutritionImpact.metabolicTheme}
                  </p>
                  <p className="text-purple-300 text-[10px] italic">
                    {realMoon.nutritionImpact.focusAction}
                  </p>
                </div>

                <div className="pt-2 border-t border-[#2a244d]/70 space-y-1.5">
                  <div className="text-emerald-400 text-[11px] font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Cibi Consigliati:
                  </div>
                  <ul className="space-y-0.5 text-[10px] text-purple-200 pl-4 list-disc marker:text-emerald-400">
                    {realMoon.nutritionImpact.recommendedFoods.slice(0, 3).map((food, idx) => (
                      <li key={idx}>{food}</li>
                    ))}
                  </ul>
                </div>

                <div className="pt-2 border-t border-[#2a244d]/70 space-y-1">
                  <div className="text-amber-300 text-[11px] font-semibold flex items-center gap-1">
                    <Coffee className="w-3 h-3 text-amber-400" /> Tisana di Oggi:
                  </div>
                  <p className="text-[10px] text-purple-200">
                    <strong>{realMoon.nutritionImpact.alchemicalTea.name}</strong> ({realMoon.nutritionImpact.alchemicalTea.herbs})
                  </p>
                  <p className="text-[9px] text-purple-300/80 italic">
                    Infusione: {realMoon.nutritionImpact.alchemicalTea.brewTime}
                  </p>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => onNavigateTab('menu')}
                    className="text-[10px] text-amber-400 hover:text-amber-300 flex items-center gap-1 font-semibold transition"
                  >
                    <span>Vedi Menù Settimanale Completo</span>
                    <ArrowRight className="w-2.5 h-2.5" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Upcoming Real Lunations Mini Schedule */}
          <div className="mt-3.5 pt-2.5 border-t border-[#2a244d]/60">
            <span className="text-[10px] font-cinzel text-purple-300 font-semibold uppercase tracking-wider block mb-2">
              Prossimi Eventi Lunari Reali
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              {upcomingPhases.slice(0, 2).map((ev, idx) => (
                <div key={idx} className="bg-[#1a1334]/80 p-2 rounded-lg border border-[#2a244d] flex items-center gap-2">
                  <span className="text-base">{ev.icon}</span>
                  <div className="truncate">
                    <p className="text-[10px] font-semibold text-white truncate">{ev.phaseName.split(' ')[0]}</p>
                    <p className="text-[9px] text-amber-300">{ev.dateFormatted} ({ev.daysRemaining}g)</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tarot Card Drawer with 3D Flip */}
        <div className="md:col-span-2 bg-[#131127] border border-[#2a244d] p-5 rounded-2xl flex flex-col justify-between shadow-lg relative">
          <div className="flex items-center justify-between border-b border-[#2a244d]/70 pb-2.5 mb-3">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-[11px] uppercase tracking-widest text-amber-400 font-semibold font-cinzel">
                La TUA Carta Guida del Giorno
              </span>
            </div>
            <span className="text-[10px] text-purple-300/80">
              Tocca la carta o estrai
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-5 my-2">
            {/* Card Container 3D */}
            <div 
              className="perspective-1000 w-32 h-48 sm:w-36 sm:h-52 flex-shrink-0 cursor-pointer group"
              onClick={drawNewCard}
              title="Clicca per estrarre una nuova carta"
            >
              <div 
                className={`relative w-full h-full transform-style-3d transition-transform duration-700 ease-out rounded-2xl ${
                  isFlipped ? 'rotate-y-180' : ''
                }`}
              >
                {/* Card Back */}
                <div className="absolute inset-0 backface-hidden w-full h-full bg-gradient-to-br from-[#1d1138] to-[#0d0920] rounded-2xl border-2 border-amber-400/50 p-2 shadow-2xl flex flex-col items-center justify-center text-center group-hover:border-amber-300 transition-colors">
                  <div className="w-full h-full border border-dashed border-amber-400/40 rounded-xl flex flex-col items-center justify-center p-2 bg-[#130f26]/80">
                    <Sparkles className="w-6 h-6 text-amber-400 mb-2 animate-bounce" />
                    <span className="text-[9px] font-cinzel text-amber-200 uppercase tracking-widest leading-tight font-bold">
                      Tocca l'Oracolo
                    </span>
                    <span className="text-[8px] text-purple-300/70 mt-1">
                      Arcani Maggiori
                    </span>
                  </div>
                </div>

                {/* Card Front */}
                <div className="absolute inset-0 backface-hidden rotate-y-180 w-full h-full bg-gradient-to-b from-[#1c1538] via-[#100c24] to-[#0a0718] rounded-2xl border-2 border-amber-400/80 p-2.5 flex flex-col items-center justify-between text-center shadow-2xl">
                  {/* Top Arcana Header */}
                  <div className="bg-slate-950/80 backdrop-blur-xs w-full py-1 rounded-lg border border-amber-400/30 text-[10px] font-cinzel text-amber-300 font-bold tracking-wider">
                    {selectedTarot.name}
                  </div>

                  {/* Center Emblem */}
                  <div className="my-auto flex flex-col items-center">
                    <span className="text-4xl sm:text-5xl filter drop-shadow-[0_0_12px_rgba(212,175,55,0.4)]">
                      {selectedTarot.icon}
                    </span>
                    <span className="text-[10px] font-cinzel text-purple-200 mt-1.5 tracking-wider">
                      {selectedTarot.keyword}
                    </span>
                  </div>

                  {/* Bottom Footer */}
                  <div className="bg-slate-950/80 backdrop-blur-xs w-full py-0.5 rounded text-[9px] text-amber-200/90 font-mono">
                    {selectedTarot.arcana} • {selectedTarot.element}
                  </div>
                </div>
              </div>
            </div>

            {/* Card Information & Guidance */}
            <div className="flex-1 space-y-2 text-center sm:text-left">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h3 className="font-cinzel font-bold text-base sm:text-lg text-amber-300">
                  {selectedTarot.icon} {selectedTarot.name}
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-purple-950 border border-purple-500/30 text-purple-300 text-[10px]">
                  {selectedTarot.arcana}
                </span>
              </div>

              <p className="text-xs text-purple-100 font-normal leading-relaxed">
                {selectedTarot.uprightMeaning}
              </p>

              <div className="bg-[#1d1138]/60 p-2.5 rounded-xl border border-purple-500/20 text-xs text-purple-200/90 italic">
                <span className="text-amber-300 font-semibold not-italic">Guida del giorno:</span> "{selectedTarot.guidance}"
              </div>

              <div className="text-[11px] text-amber-200/80 font-medium">
                ✨ <strong>Affermazione:</strong> <em>"{selectedTarot.affirmation}"</em>
              </div>

              <div className="pt-1.5">
                <button
                  onClick={drawNewCard}
                  disabled={isDrawing}
                  className="px-3.5 py-1.5 rounded-xl bg-purple-900/60 hover:bg-purple-800 border border-purple-500/40 text-amber-200 text-xs font-semibold transition flex items-center gap-1.5 mx-auto sm:mx-0 active:scale-95 cursor-pointer disabled:opacity-50"
                >
                  <RotateCw className={`w-3.5 h-3.5 ${isDrawing ? 'animate-spin' : ''}`} />
                  <span>Estrai Nuova Vibrazione</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Next Consultations Section */}
      <div className="bg-[#131127] border border-[#2a244d] p-5 rounded-2xl space-y-3.5 shadow-lg">
        <div className="flex items-center justify-between border-b border-[#2a244d]/70 pb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400" />
            <h3 className="font-cinzel font-bold text-sm sm:text-base text-white">
              Prossimi Consulti & Rituali in Programma
            </h3>
          </div>
          <button
            onClick={() => onNavigateTab('agenda')}
            className="text-xs text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1 transition"
          >
            <span>Vedi Tutti ({appointments.length})</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {upcomingAppts.length === 0 ? (
          <div className="p-6 text-center text-xs text-purple-300/80 bg-[#1d1138]/40 rounded-xl border border-dashed border-[#2a244d]">
            Nessun consulto in programma al momento. Clicca su "Nuovo Appuntamento" per registrarne uno.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {upcomingAppts.map((appt) => (
              <div
                key={appt.id}
                className="p-3.5 rounded-xl bg-[#1d1138]/60 border border-[#2a244d] hover:border-amber-400/40 transition flex flex-col justify-between gap-2.5"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="font-cinzel text-xs font-bold text-white truncate">
                      {appt.name}
                    </span>
                    <span className={`text-[9px] px-2 py-0.5 rounded-full font-medium ${
                      appt.status === 'Confermato'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : appt.status === 'Rituale'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                    }`}>
                      {appt.status}
                    </span>
                  </div>

                  <p className="text-[11px] text-amber-300/90 font-medium">
                    {appt.type}
                  </p>

                  <p className="text-[10px] text-purple-300/80 mt-1 flex items-center gap-1.5">
                    <Calendar className="w-3 h-3 text-amber-400" />
                    <span>{appt.date} ore <strong>{appt.time}</strong></span>
                  </p>
                </div>

                {appt.phone && (
                  <div className="pt-2 border-t border-[#2a244d]/50 flex items-center justify-between">
                    <span className="text-[10px] text-purple-300 font-mono">
                      {appt.phone}
                    </span>
                    <a
                      href={`https://wa.me/${appt.phone.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30 transition flex items-center gap-1"
                    >
                      <MessageCircle className="w-2.5 h-2.5" />
                      <span>WhatsApp</span>
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
