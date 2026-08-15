import React, { useState } from 'react';
import { CycleData, CycleEntry } from '../../types';
import { calculateRealMoon } from '../../utils/lunarEngine';
import { 
  Droplet, 
  Moon, 
  Calendar, 
  Sparkles, 
  Heart, 
  Feather, 
  Plus, 
  Edit3, 
  X,
  History,
  Activity,
  Sun,
  Leaf,
  Coffee,
  CheckCircle2
} from 'lucide-react';

interface CicloViewProps {
  cycleData: CycleData;
  onUpdateCycleData: (data: CycleData) => void;
  onShowToast: (msg: string) => void;
}

export const CicloView: React.FC<CicloViewProps> = ({
  cycleData,
  onUpdateCycleData,
  onShowToast,
}) => {
  const realMoon = calculateRealMoon(new Date());
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [startDateInput, setStartDateInput] = useState(cycleData.startDate);
  const [avgLengthInput, setAvgLengthInput] = useState(cycleData.avgLength || 28);

  // Daily Logging Form State
  const [energyLevel, setEnergyLevel] = useState<CycleEntry['energy']>('Alta / Espansiva 🌟');
  const [symptoms, setSymptoms] = useState('');
  const [notes, setNotes] = useState('');

  // Calculations
  const startDate = new Date(cycleData.startDate);
  const today = new Date();
  const diffTime = Math.max(0, today.getTime() - startDate.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const avgLen = cycleData.avgLength || 28;
  const currentCycleDay = (diffDays % avgLen) + 1;

  // Determine Archetype & Phase
  let phaseName = 'Fase Pre-Ovulatoria (La Vergine)';
  let archetypeTitle = 'La Vergine / La Fanciulla';
  let energyTheme = 'Focalizzazione, Rinnovamento & Nuovi Inizi';
  let phaseAdvice = 'Periodo ideale per intraprendere nuovi studi, purificare gli strumenti e avviare rituali di crescita.';
  let phaseColor = 'text-emerald-400';

  if (currentCycleDay >= 1 && currentCycleDay <= 5) {
    phaseName = 'Fase Mestruale (La Strega)';
    archetypeTitle = 'L\'Anziana Saggia / La Strega';
    energyTheme = 'Riposo Sacro, Visione Interiore & Rilascio';
    phaseAdvice = 'Dedicati al silenzio, bevi tisane calde di melissa e alloro, evita sforzi eccessivi e ascolta i sogni.';
    phaseColor = 'text-rose-400';
  } else if (currentCycleDay >= 6 && currentCycleDay <= 12) {
    phaseName = 'Fase Pre-Ovulatoria (La Fanciulla)';
    archetypeTitle = 'La Vergine / La Pioniere';
    energyTheme = 'Vitalità Brillante, Chiarezza Mentale & Progettualità';
    phaseAdvice = 'Le energie fisiche risalgono. Ottimo momento per programmare appuntamenti e studiare nuove mappe astrali.';
    phaseColor = 'text-cyan-400';
  } else if (currentCycleDay >= 13 && currentCycleDay <= 16) {
    phaseName = 'Fase Ovulatoria (La Madre)';
    archetypeTitle = 'La Madre Sacra / La Creatrice';
    energyTheme = 'Massima Empatia, Irradiazione & Connessione col Divino';
    phaseAdvice = 'Picco del magnetismo e dell\'intuito oracolare. Perfetto per consulti importanti e rituali d\'amore e abbondanza.';
    phaseColor = 'text-amber-400';
  } else {
    phaseName = 'Fase Premestruale (L\'Incantatrice)';
    archetypeTitle = 'L\'Incantatrice Wild / La Sacerdotessa';
    energyTheme = 'Intuito Selvaggio, Trasformazione & Confini Protetti';
    phaseAdvice = 'Le intuizioni sono taglienti e veritiere. Proteggi i tuoi confini ed elimina ciò che non serve più.';
    phaseColor = 'text-purple-400';
  }

  // Next Predicted Period Calculation
  const nextPeriodDate = new Date(startDate);
  const completedCycles = Math.floor(diffDays / avgLen) + 1;
  nextPeriodDate.setDate(startDate.getDate() + completedCycles * avgLen);
  const daysUntilNext = Math.max(0, Math.ceil((nextPeriodDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));

  const handleSaveSymptom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!symptoms.trim() && !notes.trim()) {
      onShowToast('Inserisci una sensazione o nota per salvare.');
      return;
    }

    const todayLocale = new Date().toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' });
    const newEntry: CycleEntry = {
      id: Date.now(),
      date: todayLocale,
      day: currentCycleDay,
      energy: energyLevel,
      symptoms: symptoms.trim() || 'Nessun sintomo fastidioso segnalato.',
      notes: notes.trim(),
    };

    const updatedHistory = [newEntry, ...cycleData.history];
    onUpdateCycleData({
      ...cycleData,
      history: updatedHistory,
    });

    setSymptoms('');
    setNotes('');
    onShowToast('Registro del ciclo salvato con successo!');
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateCycleData({
      ...cycleData,
      startDate: startDateInput,
      avgLength: Number(avgLengthInput),
    });
    setIsSettingsModalOpen(false);
    onShowToast('Impostazioni del ciclo aggiornate.');
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2a244d]/70 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-cinzel text-rose-300 flex items-center gap-2">
            <Droplet className="w-5 h-5 text-rose-400" />
            <span>Agenda Ciclo Mestruale & Sintonia Lunare</span>
          </h1>
          <p className="text-xs text-purple-300 font-light mt-0.5">
            Monitora i tuoi ritmi biologici, l'energia sacra femminile e le 4 stagioni interiori
          </p>
        </div>

        <button
          onClick={() => {
            setStartDateInput(cycleData.startDate);
            setAvgLengthInput(cycleData.avgLength || 28);
            setIsSettingsModalOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-400 hover:to-pink-500 text-slate-950 text-xs font-bold transition shadow-lg shadow-rose-500/20 active:scale-95 cursor-pointer"
        >
          <Edit3 className="w-4 h-4" />
          <span>Aggiorna Dati Ciclo</span>
        </button>
      </div>

      {/* 3 Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: Current Cycle Day */}
        <div className="bg-[#131127] border border-[#2a244d] p-5 rounded-2xl text-center space-y-1 shadow-md relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/10 rounded-full blur-2xl pointer-events-none" />
          <span className="text-[10px] sm:text-[11px] uppercase tracking-widest text-purple-300 font-cinzel font-semibold">
            Giorno Attuale del Ciclo
          </span>
          <div className="text-3xl sm:text-4xl font-bold text-rose-400 font-cinzel my-1">
            Giorno {currentCycleDay}
          </div>
          <span className={`text-xs font-medium block ${phaseColor}`}>
            {phaseName}
          </span>
        </div>

        {/* Card 2: Next Predicted Period */}
        <div className="bg-[#131127] border border-[#2a244d] p-5 rounded-2xl text-center space-y-1 shadow-md relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
          <span className="text-[10px] sm:text-[11px] uppercase tracking-widest text-purple-300 font-cinzel font-semibold">
            Prossimo Flusso Previsto
          </span>
          <div className="text-xl sm:text-2xl font-bold text-amber-300 font-cinzel my-1">
            {nextPeriodDate.toLocaleDateString('it-IT', { day: 'numeric', month: 'long' })}
          </div>
          <span className="text-xs text-purple-300 block">
            {daysUntilNext === 0 ? 'Previsto oggi' : `tra circa ${daysUntilNext} giorni`}
          </span>
        </div>

        {/* Card 3: Archetype */}
        <div className="bg-[#131127] border border-[#2a244d] p-5 rounded-2xl text-center space-y-1 shadow-md relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />
          <span className="text-[10px] sm:text-[11px] uppercase tracking-widest text-purple-300 font-cinzel font-semibold">
            Archetipo Dominante
          </span>
          <div className="text-lg sm:text-xl font-bold text-purple-200 font-cinzel my-1 truncate">
            {archetypeTitle}
          </div>
          <span className="text-xs text-amber-300/90 block">
            {energyTheme}
          </span>
        </div>
      </div>

      {/* Archetype Guidance Banner */}
      <div className="bg-gradient-to-r from-[#1d1138] to-[#131127] border border-purple-500/30 p-4 sm:p-5 rounded-2xl space-y-2">
        <div className="flex items-center gap-2 text-amber-300 font-cinzel text-xs sm:text-sm font-bold">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Saggezza della Fase Attuale per i Tuoi Consulti</span>
        </div>
        <p className="text-xs text-purple-100/90 leading-relaxed italic">
          "{phaseAdvice}"
        </p>
      </div>

      {/* Biological & Real Astronomical Moon Synchronicity Card */}
      <div className="bg-gradient-to-br from-[#1b1435] to-[#100b24] border border-amber-400/30 p-4 sm:p-5 rounded-2xl space-y-3 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#2a244d]/70 pb-2.5">
          <div className="flex items-center gap-2">
            <Moon className="w-4 h-4 text-amber-300" />
            <h3 className="font-cinzel text-xs sm:text-sm font-bold text-amber-300">
              Sintonia Sacra col Cielo Reale: {realMoon.icon} {realMoon.phaseName} in {realMoon.zodiacSign}
            </h3>
          </div>
          <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-purple-950 border border-purple-700/50 text-purple-200">
            {realMoon.illumination}% Luce • {realMoon.element} {realMoon.elementIcon}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="space-y-1.5 bg-[#120d26]/80 p-3 rounded-xl border border-[#2a244d]">
            <span className="text-amber-300 font-semibold text-[11px] flex items-center gap-1.5">
              <Sun className="w-3.5 h-3.5 text-amber-400" /> Risoluzione Energetica Ciclo-Luna:
            </span>
            <p className="text-purple-200 text-[11px] leading-relaxed">
              Il tuo corpo si trova al <strong>Giorno {currentCycleDay} ({archetypeTitle})</strong> mentre la volta celeste irradia l'energia della <strong>{realMoon.phaseName}</strong>.
            </p>
            <p className="text-[10px] text-purple-300 italic pt-1 border-t border-[#2a244d]/50">
              💡 {realMoon.advice}
            </p>
          </div>

          <div className="space-y-1.5 bg-[#120d26]/80 p-3 rounded-xl border border-[#2a244d]">
            <span className="text-emerald-300 font-semibold text-[11px] flex items-center gap-1.5">
              <Leaf className="w-3.5 h-3.5 text-emerald-400" /> Nutrizione & Tisana Biologica Odierna:
            </span>
            <p className="text-purple-200 text-[11px]">
              Giorno del <strong>{realMoon.biodynamicPlantPart}</strong>: integra <em>{realMoon.nutritionImpact.sacredSpice}</em> e cibi nutrienti.
            </p>
            <div className="text-[10px] text-amber-200/90 pt-1 border-t border-[#2a244d]/50 flex items-center gap-1.5">
              <Coffee className="w-3 h-3 text-amber-400" />
              <span>Tisana consigliata: <strong>{realMoon.nutritionImpact.alchemicalTea.name}</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Symptom & Energy Logger Form */}
      <div className="bg-[#131127] border border-[#2a244d] p-5 sm:p-6 rounded-2xl space-y-4 shadow-lg">
        <div className="flex items-center justify-between border-b border-[#2a244d]/70 pb-3">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-rose-400" />
            <h3 className="font-cinzel text-sm sm:text-base font-bold text-white">
              Annotazione Sensazioni Fisiche & Vibrazione Energetica
            </h3>
          </div>
          <span className="text-[10px] text-purple-300">
            Giorno {currentCycleDay}
          </span>
        </div>

        <form onSubmit={handleSaveSymptom} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-purple-300 mb-1 font-medium">
                Livello di Energia e Vibrazione
              </label>
              <select
                value={energyLevel}
                onChange={(e) => setEnergyLevel(e.target.value as CycleEntry['energy'])}
                className="w-full bg-[#1d1138] border border-[#2a244d] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-rose-400 text-xs"
              >
                <option value="Alta / Espansiva 🌟">Alta / Espansiva 🌟</option>
                <option value="In bilico / Fluttuante ⚖️">In bilico / Fluttuante ⚖️</option>
                <option value="Bassa / Introspettiva 🌙">Bassa / Introspettiva 🌙</option>
                <option value="Rigenerativa / Riposo 🕯️">Rigenerativa / Riposo 🕯️</option>
              </select>
            </div>

            <div>
              <label className="block text-purple-300 mb-1 font-medium">
                Sintomi Fisici o Moti Emotivi
              </label>
              <input
                type="text"
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                placeholder="Es. Grande lucidità, sogni intensi, leggera tensione..."
                className="w-full bg-[#1d1138] border border-[#2a244d] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-rose-400 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-purple-300 mb-1 font-medium">
              Note Private sul Ritmo Sacro & Tisane
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Sensazioni intuitive durante le meditazioni, tisane assunte o messaggi ricevuti..."
              className="w-full bg-[#1d1138] border border-[#2a244d] rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-rose-400 text-xs"
            />
          </div>

          <button
            type="submit"
            className="px-5 py-2.5 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-400 hover:to-pink-500 text-slate-950 font-bold uppercase tracking-wider rounded-xl transition shadow-lg shadow-rose-500/20 text-xs active:scale-95 cursor-pointer"
          >
            Salva Registro Ciclo
          </button>
        </form>
      </div>

      {/* Cycle Log History */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-purple-400" />
          <h3 className="font-cinzel text-sm font-bold text-purple-200">
            Cronologia Moti del Ciclo & Diario Sensazioni
          </h3>
        </div>

        <div className="space-y-2.5">
          {cycleData.history.length === 0 ? (
            <div className="p-6 text-center text-xs text-purple-300/80 bg-[#131127] rounded-xl border border-[#2a244d]">
              Nessuna annotazione registrata ancora. Compila il modulo sopra per iniziare lo storico.
            </div>
          ) : (
            cycleData.history.map((entry) => (
              <div
                key={entry.id}
                className="bg-[#131127] border border-[#2a244d] p-4 rounded-xl text-xs space-y-1.5 hover:border-rose-400/40 transition shadow-sm"
              >
                <div className="flex flex-wrap justify-between items-center gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-rose-300 font-cinzel">
                      {entry.date}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-950 border border-purple-800 text-purple-300">
                      Giorno {entry.day}
                    </span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-300 text-[10px] font-medium">
                    {entry.energy}
                  </span>
                </div>

                {entry.symptoms && (
                  <p className="text-slate-100">
                    <strong className="text-amber-300">Sintomi:</strong> {entry.symptoms}
                  </p>
                )}

                {entry.notes && (
                  <p className="text-purple-200/85 italic bg-[#1d1138]/50 p-2 rounded-lg border border-[#2a244d]/50">
                    "{entry.notes}"
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Cycle Settings Modal */}
      {isSettingsModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#131127] border border-rose-400/60 rounded-3xl max-w-md w-full p-6 shadow-2xl relative space-y-4">
            <button
              onClick={() => setIsSettingsModalOpen(false)}
              className="absolute top-4 right-4 text-purple-400 hover:text-white p-1 rounded-lg hover:bg-purple-900/40 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-[#2a244d]/70 pb-3">
              <span className="text-2xl">🩸</span>
              <div>
                <h3 className="font-cinzel text-base font-bold text-white">
                  Aggiorna Parametri Ciclo
                </h3>
                <p className="text-xs text-rose-300">
                  Imposta la data dell'ultimo flusso per ricalcolare le fasi
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
              <div>
                <label className="block text-purple-300 mb-1 font-medium">
                  Data Inizio Ultima Mestruazione *
                </label>
                <input
                  type="date"
                  required
                  value={startDateInput}
                  onChange={(e) => setStartDateInput(e.target.value)}
                  className="w-full bg-[#1d1138] border border-[#2a244d] rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-rose-400 text-xs"
                />
              </div>

              <div>
                <label className="block text-purple-300 mb-1 font-medium">
                  Durata Media Ciclo (Giorni)
                </label>
                <input
                  type="number"
                  min={20}
                  max={45}
                  value={avgLengthInput}
                  onChange={(e) => setAvgLengthInput(parseInt(e.target.value) || 28)}
                  className="w-full bg-[#1d1138] border border-[#2a244d] rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-rose-400 text-xs"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-400 hover:to-pink-500 text-slate-950 font-bold uppercase tracking-wider rounded-xl transition shadow-lg shadow-rose-500/20 text-xs cursor-pointer"
              >
                Salva e Ricalcola Fasi
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
