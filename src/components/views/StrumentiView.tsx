import React, { useState } from 'react';
import { CrystalHerb } from '../../types';
import { CRYSTALS_AND_HERBS, LIFE_PATH_DICTIONARY } from '../../data/initialData';
import { 
  Wand2, 
  Sparkles, 
  Search, 
  Flame, 
  Leaf, 
  Wind, 
  Droplet, 
  Calculator, 
  ShieldCheck, 
  BookOpen,
  X
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface StrumentiViewProps {
  onShowToast: (msg: string) => void;
}

export const StrumentiView: React.FC<StrumentiViewProps> = ({ onShowToast }) => {
  // Numerology Calculator State
  const [numDay, setNumDay] = useState<number>(14);
  const [numMonth, setNumMonth] = useState<number>(8);
  const [numYear, setNumYear] = useState<number>(1988);
  const [calculatedPath, setCalculatedPath] = useState<number | null>(null);

  // Crystal & Herb Search & Filters
  const [crystalSearch, setCrystalSearch] = useState<string>('');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('tutti');
  const [selectedElementFilter, setSelectedElementFilter] = useState<string>('tutti');

  const calculateLifePath = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!numDay || !numMonth || !numYear) {
      onShowToast('Inserisci giorno, mese ed anno validi!');
      return;
    }

    // Pythagorean reduction
    const dateString = `${numDay}${numMonth}${numYear}`;
    let sum = dateString
      .split('')
      .reduce((acc, curr) => acc + (parseInt(curr, 10) || 0), 0);

    while (sum > 9 && sum !== 11 && sum !== 22 && sum !== 33) {
      sum = sum
        .toString()
        .split('')
        .reduce((acc, curr) => acc + (parseInt(curr, 10) || 0), 0);
    }

    setCalculatedPath(sum);

    try {
      confetti({
        particleCount: 25,
        spread: 50,
        origin: { y: 0.6 },
        colors: ['#d4af37', '#9333ea', '#3b82f6'],
      });
    } catch (err) {}

    onShowToast(`Calcolato Cammino di Vita #${sum}!`);
  };

  const filteredCrystals = CRYSTALS_AND_HERBS.filter((item) => {
    if (selectedTypeFilter !== 'tutti' && item.type !== selectedTypeFilter) return false;
    if (selectedElementFilter !== 'tutti' && item.element !== selectedElementFilter) return false;

    if (crystalSearch.trim()) {
      const q = crystalSearch.toLowerCase();
      const matchName = item.name.toLowerCase().includes(q);
      const matchDesc = item.desc.toLowerCase().includes(q);
      const matchRitual = item.ritualUse.toLowerCase().includes(q);
      const matchChakra = (item.chakra || '').toLowerCase().includes(q);
      if (!matchName && !matchDesc && !matchRitual && !matchChakra) return false;
    }

    return true;
  });

  const pathDetails = calculatedPath ? LIFE_PATH_DICTIONARY[calculatedPath] : null;

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Top Header */}
      <div className="border-b border-[#2a244d]/70 pb-4">
        <h1 className="text-xl sm:text-2xl font-bold font-cinzel gold-gradient-text flex items-center gap-2">
          <Wand2 className="w-5 h-5 text-amber-400" />
          <span>Strumenti Esoterici & Oracolari</span>
        </h1>
        <p className="text-xs text-purple-300 font-light mt-0.5">
          Calcolatori numerologici pitagorici, enciclopedia dei cristalli e prontuario per i consulti
        </p>
      </div>

      {/* TOOL 1: Numerology Life Path Calculator */}
      <div className="bg-[#131127] border border-amber-400/40 p-5 sm:p-6 rounded-3xl space-y-4 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center gap-3 border-b border-[#2a244d]/70 pb-3">
          <div className="w-10 h-10 rounded-full bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300 text-lg font-bold">
            🔢
          </div>
          <div>
            <h2 className="font-cinzel font-bold text-base sm:text-lg text-white">
              Calcola il Numero del Cammino di Vita per i Tuoi Clienti
            </h2>
            <p className="text-xs text-purple-300">
              Calcolo numerologico pitagorico con rilevazione dei Numeri Maestri (11, 22, 33)
            </p>
          </div>
        </div>

        <form onSubmit={calculateLifePath} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-purple-300 mb-1 font-medium">Giorno di Nascita</label>
              <input
                type="number"
                min={1}
                max={31}
                value={numDay || ''}
                onChange={(e) => setNumDay(parseInt(e.target.value, 10))}
                placeholder="Es. 14"
                className="w-full bg-[#1d1138] border border-[#2a244d] rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-amber-400 text-xs"
              />
            </div>

            <div>
              <label className="block text-purple-300 mb-1 font-medium">Mese di Nascita</label>
              <select
                value={numMonth}
                onChange={(e) => setNumMonth(parseInt(e.target.value, 10))}
                className="w-full bg-[#1d1138] border border-[#2a244d] rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-amber-400 text-xs"
              >
                {[
                  { m: 1, name: 'Gennaio (01)' },
                  { m: 2, name: 'Febbraio (02)' },
                  { m: 3, name: 'Marzo (03)' },
                  { m: 4, name: 'Aprile (04)' },
                  { m: 5, name: 'Maggio (05)' },
                  { m: 6, name: 'Giugno (06)' },
                  { m: 7, name: 'Luglio (07)' },
                  { m: 8, name: 'Agosto (08)' },
                  { m: 9, name: 'Settembre (09)' },
                  { m: 10, name: 'Ottobre (10)' },
                  { m: 11, name: 'Novembre (11)' },
                  { m: 12, name: 'Dicembre (12)' },
                ].map((mon) => (
                  <option key={mon.m} value={mon.m}>
                    {mon.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-purple-300 mb-1 font-medium">Anno di Nascita</label>
              <input
                type="number"
                min={1900}
                max={2030}
                value={numYear || ''}
                onChange={(e) => setNumYear(parseInt(e.target.value, 10))}
                placeholder="Es. 1988"
                className="w-full bg-[#1d1138] border border-[#2a244d] rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-amber-400 text-xs"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-gradient-to-r from-purple-800 to-indigo-900 hover:from-purple-700 hover:to-indigo-800 border border-purple-500/40 text-amber-200 text-xs font-bold uppercase tracking-wider rounded-xl transition shadow-lg active:scale-95 cursor-pointer flex items-center justify-center gap-2"
          >
            <Calculator className="w-4 h-4" />
            <span>Calcola Vibrazione Numerologica</span>
          </button>
        </form>

        {/* Calculated Result Card */}
        {calculatedPath && pathDetails && (
          <div className="bg-[#1d1138] border border-amber-400/60 p-4 sm:p-5 rounded-2xl space-y-3 animate-in fade-in duration-300 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#2a244d]/70 pb-2.5">
              <span className="text-xs uppercase tracking-widest text-amber-400 font-cinzel font-bold">
                {calculatedPath === 11 || calculatedPath === 22 || calculatedPath === 33
                  ? 'Numero Maestro Supremo'
                  : 'Cammino di Vita Principale'}
              </span>

              <span className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 font-cinzel font-black flex items-center justify-center text-base shadow-md shadow-amber-500/30">
                {calculatedPath}
              </span>
            </div>

            <div>
              <h3 className="font-cinzel text-base sm:text-lg font-bold text-white">
                {pathDetails.title}
              </h3>
              <p className="text-xs text-amber-300/90 font-medium mt-0.5">
                Archetipo: <strong>{pathDetails.archetype}</strong> • <em>{pathDetails.keywords}</em>
              </p>
            </div>

            <p className="text-xs text-purple-100 leading-relaxed">
              {pathDetails.description}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 text-xs">
              <div className="bg-[#131127] p-2.5 rounded-xl border border-[#2a244d]">
                <strong className="text-emerald-300 block mb-0.5">Punti di Forza:</strong>
                <p className="text-purple-200/90 text-[11px] leading-relaxed">{pathDetails.strengths}</p>
              </div>

              <div className="bg-[#131127] p-2.5 rounded-xl border border-[#2a244d]">
                <strong className="text-rose-300 block mb-0.5">Sfida Karmica:</strong>
                <p className="text-purple-200/90 text-[11px] leading-relaxed">{pathDetails.challenge}</p>
              </div>
            </div>

            <div className="bg-[#131127] p-3 rounded-xl border border-amber-400/30 text-xs italic text-amber-200/90">
              <strong className="not-italic text-amber-300 font-semibold block mb-0.5">
                ✨ Guida per il Consulto:
              </strong>
              "{pathDetails.spiritualGuidance}"
            </div>
          </div>
        )}
      </div>

      {/* TOOL 2: Crystal & Sacred Herb Encyclopedia */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h2 className="font-cinzel font-bold text-base sm:text-lg text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-amber-400" />
              <span>Prontuario dei Cristalli, Erbe & Resine Sacre</span>
            </h2>
            <p className="text-xs text-purple-300 font-light mt-0.5">
              Proprietà esoteriche, chakra e consigli pratici per purificazioni e trattamenti
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <input
              type="text"
              value={crystalSearch}
              onChange={(e) => setCrystalSearch(e.target.value)}
              placeholder="Cerca es. Quarzo, Salvia, Cuore..."
              className="w-full bg-[#131127] border border-[#2a244d] rounded-xl px-3.5 py-1.5 pl-9 text-xs text-purple-100 placeholder-purple-400/60 focus:outline-none focus:border-amber-400"
            />
            <Search className="w-3.5 h-3.5 text-purple-400 absolute left-3 top-2.5" />
            {crystalSearch && (
              <button
                onClick={() => setCrystalSearch('')}
                className="absolute right-3 top-2 text-purple-400 hover:text-white text-xs"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Filter Chips */}
        <div className="flex flex-wrap gap-1.5 text-xs">
          {['tutti', 'Cristallo', 'Erba Sacra', 'Resina / Incenso', 'Olio Essenziale'].map((t) => (
            <button
              key={t}
              onClick={() => setSelectedTypeFilter(t)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition active:scale-95 ${
                selectedTypeFilter === t
                  ? 'bg-amber-400 text-slate-950 font-bold shadow-md'
                  : 'bg-[#131127] border border-[#2a244d] text-purple-200 hover:text-amber-300'
              }`}
            >
              {t === 'tutti' ? 'Tutti i Rimedi' : t}
            </button>
          ))}
        </div>

        {/* Crystals Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCrystals.length === 0 ? (
            <div className="col-span-full bg-[#131127] border border-[#2a244d] rounded-2xl p-8 text-center text-xs text-purple-300">
              Nessun rimedio trovato per la ricerca "{crystalSearch}".
            </div>
          ) : (
            filteredCrystals.map((item) => (
              <div
                key={item.id}
                className="bg-[#131127] border border-[#2a244d] p-4 sm:p-5 rounded-2xl space-y-3 hover:border-amber-400/50 transition-all duration-200 shadow-md flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-3xl filter drop-shadow">{item.icon}</span>
                    <div className="flex items-center gap-1">
                      <span className="text-[9px] uppercase font-bold text-amber-300 px-2 py-0.5 rounded bg-purple-950 border border-purple-800">
                        {item.type}
                      </span>
                      <span className="text-[9px] uppercase font-semibold text-purple-200 px-2 py-0.5 rounded bg-[#1d1138] border border-[#2a244d]">
                        {item.element}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-cinzel text-sm sm:text-base font-bold text-white">
                      {item.name}
                    </h3>
                    {item.chakra && (
                      <p className="text-[10px] text-amber-300/90 font-medium">
                        Chakra: {item.chakra}
                      </p>
                    )}
                  </div>

                  <p className="text-xs text-purple-200/90 leading-relaxed font-light">
                    {item.desc}
                  </p>
                </div>

                <div className="bg-[#1d1138]/70 p-2.5 rounded-xl border border-purple-500/20 text-[11px] text-purple-100">
                  <strong className="text-amber-300 block text-[10px] uppercase tracking-wider font-cinzel mb-0.5">
                    Impiego Rituale:
                  </strong>
                  <span className="italic">{item.ritualUse}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
