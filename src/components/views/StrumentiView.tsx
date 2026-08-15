import React, { useState } from 'react';
import { CrystalHerb, Contact, JournalCategory } from '../../types';
import { CRYSTALS_AND_HERBS, LIFE_PATH_DICTIONARY } from '../../data/initialData';
import { 
  calculateNatalChart, 
  formatNatalChartForChat, 
  NatalChartData 
} from '../../utils/astrology';
import { 
  Wand2, 
  Sparkles, 
  Search, 
  Flame, 
  Leaf, 
  Wind, 
  Droplet, 
  Calculator, 
  BookOpen,
  X,
  Compass,
  Send,
  Copy,
  Check,
  BookmarkPlus,
  User,
  MapPin,
  Clock,
  Calendar,
  Layers,
  ChevronRight,
  Shield,
  Star,
  Cpu
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface StrumentiViewProps {
  contacts?: Contact[];
  onSendToChat?: (promptText: string) => void;
  onSaveToJournal?: (note: { title: string; category: JournalCategory; content: string; icon: string }) => void;
  onShowToast: (msg: string) => void;
}

export const StrumentiView: React.FC<StrumentiViewProps> = ({ 
  contacts = [], 
  onSendToChat,
  onSaveToJournal,
  onShowToast 
}) => {
  // Navigation tabs within Strumenti
  const [activeToolTab, setActiveToolTab] = useState<'astrologia' | 'numerologia' | 'cristalli'>('astrologia');

  // --- 1. ASTROLOGY / NATAL CHART STATE ---
  const [chartName, setChartName] = useState<string>('Maria Teresa');
  const [chartDate, setChartDate] = useState<string>('1988-08-14');
  const [chartTime, setChartTime] = useState<string>('10:30');
  const [chartPlace, setChartPlace] = useState<string>('Roma, Italia');
  const [calculatedChart, setCalculatedChart] = useState<NatalChartData | null>(() => {
    return calculateNatalChart('Maria Teresa', '1988-08-14', '10:30', 'Roma, Italia');
  });
  const [chartActiveSubTab, setChartActiveSubTab] = useState<'pianeti' | 'sintesi' | 'elementi' | 'lavori'>('sintesi');
  const [copiedChart, setCopiedChart] = useState(false);

  // --- 2. NUMEROLOGY STATE ---
  const [numDay, setNumDay] = useState<number>(14);
  const [numMonth, setNumMonth] = useState<number>(8);
  const [numYear, setNumYear] = useState<number>(1988);
  const [calculatedPath, setCalculatedPath] = useState<number | null>(null);

  // --- 3. CRYSTALS & HERBS STATE ---
  const [crystalSearch, setCrystalSearch] = useState<string>('');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('tutti');
  const [selectedElementFilter, setSelectedElementFilter] = useState<string>('tutti');

  // Calculate Natal Chart
  const handleCalculateChart = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chartDate) {
      onShowToast('Inserisci una data di nascita valida.');
      return;
    }

    const chart = calculateNatalChart(
      chartName.trim() || 'Anima in Consulto',
      chartDate,
      chartTime || '12:00',
      chartPlace.trim() || 'Italia'
    );
    setCalculatedChart(chart);

    try {
      confetti({
        particleCount: 30,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#d4af37', '#9333ea', '#38bdf8'],
      });
    } catch (err) {}

    onShowToast(`✨ Tema Natale calcolato per ${chart.personName}!`);
  };

  // Populate from Contact
  const handleSelectContactForChart = (contactId: string | number) => {
    const found = contacts.find((c) => String(c.id) === String(contactId));
    if (found) {
      setChartName(found.name);
      if (found.birthDate) {
        setChartDate(found.birthDate);
      }
      onShowToast(`Dati di ${found.name} caricati nel calcolatore astrologico!`);
    }
  };

  // Send Chart to Groq Oracle Chat
  const handleSendChartToChat = (customInstruction?: string) => {
    if (!calculatedChart) return;
    let text = formatNatalChartForChat(calculatedChart);
    if (customInstruction) {
      text += `\n\n🎯 **Lavoro Astrologico Specifico Richiesto:**\n${customInstruction}`;
    }

    if (onSendToChat) {
      onSendToChat(text);
    } else {
      navigator.clipboard.writeText(text);
      onShowToast('📋 Tema Natale copiato negli appunti per la Chat!');
    }
  };

  // Save Natal Chart to Diary
  const handleSaveChartToDiary = () => {
    if (!calculatedChart) return;
    if (onSaveToJournal) {
      const summaryContent = formatNatalChartForChat(calculatedChart);
      onSaveToJournal({
        title: `Tema Natale di ${calculatedChart.personName} (${calculatedChart.sunSign} / Asc. ${calculatedChart.ascendant})`,
        category: 'Astrologia',
        content: summaryContent,
        icon: '🌌',
      });
      onShowToast('📖 Tema Natale salvato come nuova nota nel Diario Privato!');
    } else {
      onShowToast('Funzione salvataggio diario attiva.');
    }
  };

  // Copy Chart to Clipboard
  const handleCopyChart = () => {
    if (!calculatedChart) return;
    const text = formatNatalChartForChat(calculatedChart);
    navigator.clipboard.writeText(text);
    setCopiedChart(true);
    setTimeout(() => setCopiedChart(false), 2500);
    onShowToast('📋 Analisi del Tema Natale copiata negli appunti!');
  };

  // Calculate Numerology Life Path
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-[#2a244d]/70 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-cinzel gold-gradient-text flex items-center gap-2">
            <Wand2 className="w-5 h-5 text-amber-400" />
            <span>Strumenti Esoterici, Astrologici & Oracolari</span>
          </h1>
          <p className="text-xs text-purple-300 font-light mt-0.5">
            Calcolo del Tema Natale, numerologia sacra, prontuario dei cristalli e integrazione con la Chat dell'Oracolo
          </p>
        </div>

        {/* Tool Switcher Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-[#131127] border border-[#2a244d] rounded-xl self-stretch sm:self-auto text-xs">
          <button
            onClick={() => setActiveToolTab('astrologia')}
            className={`px-3 py-1.5 rounded-lg font-cinzel font-semibold transition flex items-center gap-1.5 cursor-pointer ${
              activeToolTab === 'astrologia'
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold shadow-md'
                : 'text-purple-300 hover:text-amber-300 hover:bg-[#1d1138]'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Tema Natale</span>
          </button>

          <button
            onClick={() => setActiveToolTab('numerologia')}
            className={`px-3 py-1.5 rounded-lg font-cinzel font-semibold transition flex items-center gap-1.5 cursor-pointer ${
              activeToolTab === 'numerologia'
                ? 'bg-gradient-to-r from-purple-700 to-indigo-800 text-amber-200 font-bold shadow-md'
                : 'text-purple-300 hover:text-purple-100 hover:bg-[#1d1138]'
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>Numerologia</span>
          </button>

          <button
            onClick={() => setActiveToolTab('cristalli')}
            className={`px-3 py-1.5 rounded-lg font-cinzel font-semibold transition flex items-center gap-1.5 cursor-pointer ${
              activeToolTab === 'cristalli'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white font-bold shadow-md'
                : 'text-purple-300 hover:text-emerald-200 hover:bg-[#1d1138]'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Cristalli & Erbe</span>
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* SECTION 1: NATAL CHART CALCULATOR & CHAT INTEGRATION     */}
      {/* ======================================================== */}
      {activeToolTab === 'astrologia' && (
        <div className="space-y-6">
          {/* Main Calculation Card */}
          <div className="bg-[#131127] border border-amber-400/40 p-5 sm:p-6 rounded-3xl space-y-5 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-60 h-60 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-60 h-60 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-[#2a244d]/70 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-amber-400/30 to-purple-600/30 border border-amber-400/50 flex items-center justify-center text-amber-300 text-xl font-bold shadow-md shadow-amber-500/20">
                  🌌
                </div>
                <div>
                  <h2 className="font-cinzel font-bold text-base sm:text-lg text-white flex items-center gap-2">
                    <span>Calcolatore del Tema Natale & Astrologia Alchemica</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300">
                      Connesso a Chat Oracolo
                    </span>
                  </h2>
                  <p className="text-xs text-purple-300">
                    Calcola la Triade dell'Anima (Sole, Luna, Ascendente), Case astrologiche, aspetti e porta tutto nella Chat per consulti oracolari
                  </p>
                </div>
              </div>

              {/* Quick Select from Contacts if available */}
              {contacts.length > 0 && (
                <div className="flex items-center gap-1.5 text-xs">
                  <User className="w-3.5 h-3.5 text-purple-400" />
                  <select
                    onChange={(e) => {
                      if (e.target.value) handleSelectContactForChart(e.target.value);
                    }}
                    defaultValue=""
                    className="bg-[#1d1138] border border-purple-500/40 rounded-xl px-2.5 py-1.5 text-xs text-purple-200 focus:outline-none focus:border-amber-400"
                  >
                    <option value="" disabled>Carica da Rubrica Clienti...</option>
                    {contacts.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} {c.zodiac ? `(${c.zodiac})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Input Form */}
            <form onSubmit={handleCalculateChart} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                {/* Name */}
                <div>
                  <label className="block text-purple-300 mb-1 font-medium flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-amber-400" />
                    <span>Nome dell'Anima / Cliente *</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={chartName}
                    onChange={(e) => setChartName(e.target.value)}
                    placeholder="Es. Maria Teresa, Laura..."
                    className="w-full bg-[#1d1138] border border-[#2a244d] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-400 text-xs font-medium"
                  />
                </div>

                {/* Birth Date */}
                <div>
                  <label className="block text-purple-300 mb-1 font-medium flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-amber-400" />
                    <span>Data di Nascita *</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={chartDate}
                    onChange={(e) => setChartDate(e.target.value)}
                    className="w-full bg-[#1d1138] border border-[#2a244d] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-400 text-xs"
                  />
                </div>

                {/* Birth Time */}
                <div>
                  <label className="block text-purple-300 mb-1 font-medium flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>Ora di Nascita (per Ascendente)</span>
                  </label>
                  <input
                    type="time"
                    value={chartTime}
                    onChange={(e) => setChartTime(e.target.value)}
                    className="w-full bg-[#1d1138] border border-[#2a244d] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-400 text-xs"
                  />
                </div>

                {/* Birth Place */}
                <div>
                  <label className="block text-purple-300 mb-1 font-medium flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-amber-400" />
                    <span>Luogo / Città di Nascita</span>
                  </label>
                  <input
                    type="text"
                    value={chartPlace}
                    onChange={(e) => setChartPlace(e.target.value)}
                    placeholder="Es. Roma, Milano, Napoli..."
                    className="w-full bg-[#1d1138] border border-[#2a244d] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-400 text-xs"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <div className="flex items-center gap-2 text-[11px] text-purple-300/80">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Calcola istantaneamente Sole, Luna, Ascendente, Medio Cielo, 12 Case e Aspetti Planetari</span>
                </div>

                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-bold uppercase tracking-wider rounded-xl transition shadow-lg shadow-amber-500/20 active:scale-95 cursor-pointer flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Calcola & Analizza Tema Natale</span>
                </button>
              </div>
            </form>
          </div>

          {/* CALCULATED NATAL CHART RESULT */}
          {calculatedChart && (
            <div className="bg-[#131127] border border-[#2a244d] rounded-3xl p-5 sm:p-7 space-y-6 shadow-2xl animate-in fade-in duration-300">
              {/* Result Header & Actions */}
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-[#2a244d]/80 pb-5">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] font-mono uppercase tracking-widest text-amber-400 bg-amber-950/60 px-2.5 py-0.5 rounded-full border border-amber-500/30">
                      Quadro Natale Calcolato
                    </span>
                    <span className="text-xs text-purple-300">
                      {calculatedChart.birthDate} • {calculatedChart.birthTime} • {calculatedChart.birthPlace}
                    </span>
                  </div>
                  <h2 className="font-cinzel text-xl sm:text-2xl font-bold text-white mt-1">
                    Tema Natale di {calculatedChart.personName}
                  </h2>
                </div>

                {/* Action Buttons: Send to Chat, Save, Copy */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => handleSendChartToChat()}
                    className="px-4 py-2 bg-gradient-to-r from-purple-700 via-indigo-700 to-purple-800 hover:from-purple-600 hover:to-indigo-600 border border-purple-400/40 text-amber-200 text-xs font-bold rounded-xl transition shadow-lg shadow-purple-900/30 flex items-center gap-2 active:scale-95 cursor-pointer"
                    title="Invia l'intero tema natale all'Oracolo AI per un consulto approfondito"
                  >
                    <Send className="w-3.5 h-3.5 text-amber-400" />
                    <span>Porta in Chat per Lavoro Astrologico</span>
                  </button>

                  <button
                    onClick={handleSaveChartToDiary}
                    className="px-3.5 py-2 bg-[#1d1138] hover:bg-[#281b4d] border border-purple-500/30 text-purple-200 hover:text-white text-xs font-semibold rounded-xl transition flex items-center gap-1.5 active:scale-95 cursor-pointer"
                    title="Salva questo tema natale nel tuo Diario Segreto"
                  >
                    <BookmarkPlus className="w-3.5 h-3.5 text-purple-300" />
                    <span>Salva nel Diario</span>
                  </button>

                  <button
                    onClick={handleCopyChart}
                    className="p-2 bg-[#1d1138] hover:bg-[#281b4d] border border-purple-500/30 text-purple-200 hover:text-amber-300 text-xs rounded-xl transition cursor-pointer"
                    title="Copia l'intero testo del Tema Natale"
                  >
                    {copiedChart ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* CORE TRIAD DISPLAY (Sole, Luna, Ascendente, MC) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                {/* Sole */}
                <div className="bg-gradient-to-b from-[#221708] to-[#161026] border border-amber-500/50 p-4 rounded-2xl space-y-1.5 shadow-lg relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-wider font-cinzel font-bold text-amber-400">
                      ☉ Sole (Essenza & Io)
                    </span>
                    <span className="text-xl">{calculatedChart.sunSymbol}</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg font-cinzel font-bold text-white">
                      {calculatedChart.sunSign}
                    </span>
                    <span className="text-xs font-mono text-amber-300">
                      {calculatedChart.sunDegree}°
                    </span>
                  </div>
                  <p className="text-[11px] text-amber-200/80 leading-snug">
                    L'identità cosciente, il fuoco vitale e la spinta creativa primaria dell'Anima.
                  </p>
                </div>

                {/* Luna */}
                <div className="bg-gradient-to-b from-[#131b2e] to-[#161026] border border-sky-500/40 p-4 rounded-2xl space-y-1.5 shadow-lg relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-wider font-cinzel font-bold text-sky-300">
                      ☽ Luna (Anima & Emozioni)
                    </span>
                    <span className="text-xl">{calculatedChart.moonSymbol}</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg font-cinzel font-bold text-white">
                      {calculatedChart.moonSign}
                    </span>
                    <span className="text-[10px] text-sky-200 font-medium truncate">
                      {calculatedChart.moonPhase}
                    </span>
                  </div>
                  <p className="text-[11px] text-sky-200/80 leading-snug">
                    Il mondo inconscio, i bisogni intimi, la memoria ancestrale e l'intuito medianico.
                  </p>
                </div>

                {/* Ascendente */}
                <div className="bg-gradient-to-b from-[#22102f] to-[#161026] border border-purple-500/50 p-4 rounded-2xl space-y-1.5 shadow-lg relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-wider font-cinzel font-bold text-purple-300">
                      🏹 Ascendente (Maschera & Incarnazione)
                    </span>
                    <span className="text-xl">{calculatedChart.ascendantSymbol}</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg font-cinzel font-bold text-white">
                      {calculatedChart.ascendant}
                    </span>
                    <span className="text-xs font-mono text-purple-300">
                      {calculatedChart.ascendantDegree}°
                    </span>
                  </div>
                  <p className="text-[11px] text-purple-200/80 leading-snug">
                    Come l'Anima si manifesta all'esterno, la prima impressione e la lente sul mondo.
                  </p>
                </div>

                {/* Medio Cielo */}
                <div className="bg-gradient-to-b from-[#1b1e10] to-[#161026] border border-emerald-500/40 p-4 rounded-2xl space-y-1.5 shadow-lg relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-wider font-cinzel font-bold text-emerald-300">
                      👑 Medio Cielo (MC - Destino & Scopo)
                    </span>
                    <span className="text-xl">{calculatedChart.midheavenSymbol}</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg font-cinzel font-bold text-white">
                      {calculatedChart.midheaven}
                    </span>
                    <span className="text-[10px] text-emerald-300 font-mono">10ª Casa</span>
                  </div>
                  <p className="text-[11px] text-emerald-200/80 leading-snug">
                    La vocazione spirituale, la maestria da manifestare nel mondo e il karma collettivo.
                  </p>
                </div>
              </div>

              {/* Sub-Navigation for Detailed Chart Exploration */}
              <div className="border-b border-[#2a244d] flex items-center gap-2 overflow-x-auto pb-2 text-xs">
                <button
                  onClick={() => setChartActiveSubTab('sintesi')}
                  className={`px-3.5 py-1.5 rounded-xl font-medium transition cursor-pointer flex items-center gap-1.5 ${
                    chartActiveSubTab === 'sintesi'
                      ? 'bg-amber-400 text-slate-950 font-bold shadow-md'
                      : 'text-purple-200 hover:text-white bg-[#1d1138]'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Sintesi Esoterica & Doni dell'Anima</span>
                </button>

                <button
                  onClick={() => setChartActiveSubTab('pianeti')}
                  className={`px-3.5 py-1.5 rounded-xl font-medium transition cursor-pointer flex items-center gap-1.5 ${
                    chartActiveSubTab === 'pianeti'
                      ? 'bg-amber-400 text-slate-950 font-bold shadow-md'
                      : 'text-purple-200 hover:text-white bg-[#1d1138]'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Tutti i Pianeti & 12 Case ({calculatedChart.planets.length})</span>
                </button>

                <button
                  onClick={() => setChartActiveSubTab('elementi')}
                  className={`px-3.5 py-1.5 rounded-xl font-medium transition cursor-pointer flex items-center gap-1.5 ${
                    chartActiveSubTab === 'elementi'
                      ? 'bg-amber-400 text-slate-950 font-bold shadow-md'
                      : 'text-purple-200 hover:text-white bg-[#1d1138]'
                  }`}
                >
                  <Flame className="w-3.5 h-3.5" />
                  <span>Elementi & Aspetti Planetari</span>
                </button>

                <button
                  onClick={() => setChartActiveSubTab('lavori')}
                  className={`px-3.5 py-1.5 rounded-xl font-medium transition cursor-pointer flex items-center gap-1.5 ${
                    chartActiveSubTab === 'lavori'
                      ? 'bg-amber-400 text-slate-950 font-bold shadow-md'
                      : 'text-purple-200 hover:text-white bg-[#1d1138]'
                  }`}
                >
                  <Cpu className="w-3.5 h-3.5" />
                  <span>Lavori Astrologici con l'Oracolo AI</span>
                </button>
              </div>

              {/* TAB 1: SINTESI ESOTERICA & DONI */}
              {chartActiveSubTab === 'sintesi' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Missione dell'Anima */}
                    <div className="bg-[#1d1138] border border-amber-400/30 p-4 rounded-2xl space-y-1.5">
                      <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                        <Star className="w-3.5 h-3.5 text-amber-400" />
                        Missione dell'Anima & Archetipo Dominante
                      </span>
                      <p className="text-xs text-purple-100 leading-relaxed">
                        {calculatedChart.esotericSynthesis.soulMission}
                      </p>
                    </div>

                    {/* Dono Intuitivo */}
                    <div className="bg-[#1d1138] border border-sky-400/30 p-4 rounded-2xl space-y-1.5">
                      <span className="text-xs font-bold text-sky-300 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                        Dono Intuitivo & Medianità Naturale
                      </span>
                      <p className="text-xs text-purple-100 leading-relaxed">
                        {calculatedChart.esotericSynthesis.intuitiveGift}
                      </p>
                    </div>

                    {/* Blocco Karmico Saturno */}
                    <div className="bg-[#1d1138] border border-rose-400/30 p-4 rounded-2xl space-y-1.5">
                      <span className="text-xs font-bold text-rose-300 flex items-center gap-1.5">
                        <Shield className="w-3.5 h-3.5 text-rose-400" />
                        Sfida Karmica & Insegnamento di Saturno
                      </span>
                      <p className="text-xs text-purple-100 leading-relaxed">
                        {calculatedChart.esotericSynthesis.karmicLesson}
                      </p>
                    </div>

                    {/* Ombra di Lilith & Ferita Chirone */}
                    <div className="bg-[#1d1138] border border-purple-400/30 p-4 rounded-2xl space-y-1.5">
                      <span className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                        <Flame className="w-3.5 h-3.5 text-purple-400" />
                        Ombra Sacra di Lilith & Guarigione di Chirone
                      </span>
                      <p className="text-xs text-purple-100 leading-relaxed">
                        {calculatedChart.esotericSynthesis.lilithWisdom} • {calculatedChart.esotericSynthesis.chironHealing}
                      </p>
                    </div>
                  </div>

                  {/* Rimedi Alchemici Consigliati per questo Tema */}
                  <div className="bg-gradient-to-r from-purple-950/60 via-[#181133] to-amber-950/60 border border-amber-500/40 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-1 text-xs">
                      <strong className="text-amber-300 block font-cinzel">
                        🌿 Alleati Alchemici di Risonanza per {calculatedChart.personName}:
                      </strong>
                      <p className="text-purple-200">
                        💎 <strong>Cristallo Guida:</strong> {calculatedChart.esotericSynthesis.recommendedCrystal} • 🍵 <strong>Erba Sacra:</strong> {calculatedChart.esotericSynthesis.recommendedHerb}
                      </p>
                      <p className="text-[11px] text-purple-300/80 italic">
                        {calculatedChart.esotericSynthesis.consultationGuidance}
                      </p>
                    </div>

                    <button
                      onClick={() => handleSendChartToChat('Suggeriscimi un protocollo di purificazione e un allineamento con i cristalli adatti per armonizzare i pianeti di questo tema natale.')}
                      className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl transition shadow-md shrink-0 flex items-center gap-1.5 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Chiedi Rituale su Misura in Chat</span>
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 2: PIANETI & 12 CASE */}
              {chartActiveSubTab === 'pianeti' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {calculatedChart.planets.map((p) => (
                      <div
                        key={p.name}
                        className="bg-[#1d1138] border border-[#2a244d] hover:border-amber-400/40 p-3.5 rounded-2xl space-y-1.5 transition flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-lg font-bold text-amber-400">{p.symbol}</span>
                              <span className="font-bold text-white text-xs">{p.name}</span>
                            </div>
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-950 border border-purple-700 text-purple-200">
                              {p.house}ª Casa
                            </span>
                          </div>

                          <div className="flex items-baseline gap-1.5 mt-1">
                            <span className="text-xs font-semibold text-amber-300">
                              in {p.sign} {p.signSymbol}
                            </span>
                            <span className="text-[10px] font-mono text-purple-300">
                              ({p.degree}°)
                            </span>
                            <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-[#131127] text-purple-300 ml-auto">
                              {p.element}
                            </span>
                          </div>

                          <p className="text-[11px] text-purple-200 font-light mt-1.5 leading-relaxed">
                            {p.meaning}
                          </p>
                        </div>

                        <div className="pt-2 border-t border-purple-500/20 text-[10px] text-amber-300/80 font-mono truncate">
                          Archetipo: {p.archetype}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: ELEMENTI & ASPETTI PLANETARI */}
              {chartActiveSubTab === 'elementi' && (
                <div className="space-y-5">
                  {/* Elemental Distribution Bars */}
                  <div className="bg-[#1d1138] border border-[#2a244d] p-4 sm:p-5 rounded-2xl space-y-3">
                    <h3 className="font-cinzel text-xs font-bold text-amber-300 uppercase tracking-wider">
                      Bilanciamento dei 4 Elementi Sacri
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      {/* Fire */}
                      <div className="bg-[#131127] p-3 rounded-xl border border-rose-500/30 space-y-1">
                        <div className="flex justify-between items-center text-rose-300 font-bold">
                          <span className="flex items-center gap-1"><Flame className="w-3.5 h-3.5" /> Fuoco</span>
                          <span>{calculatedChart.elementsBalance.fire}%</span>
                        </div>
                        <div className="w-full bg-[#1d1138] h-1.5 rounded-full overflow-hidden">
                          <div className="bg-rose-500 h-full rounded-full" style={{ width: `${calculatedChart.elementsBalance.fire}%` }} />
                        </div>
                      </div>

                      {/* Earth */}
                      <div className="bg-[#131127] p-3 rounded-xl border border-emerald-500/30 space-y-1">
                        <div className="flex justify-between items-center text-emerald-300 font-bold">
                          <span className="flex items-center gap-1"><Leaf className="w-3.5 h-3.5" /> Terra</span>
                          <span>{calculatedChart.elementsBalance.earth}%</span>
                        </div>
                        <div className="w-full bg-[#1d1138] h-1.5 rounded-full overflow-hidden">
                          <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${calculatedChart.elementsBalance.earth}%` }} />
                        </div>
                      </div>

                      {/* Air */}
                      <div className="bg-[#131127] p-3 rounded-xl border border-sky-500/30 space-y-1">
                        <div className="flex justify-between items-center text-sky-300 font-bold">
                          <span className="flex items-center gap-1"><Wind className="w-3.5 h-3.5" /> Aria</span>
                          <span>{calculatedChart.elementsBalance.air}%</span>
                        </div>
                        <div className="w-full bg-[#1d1138] h-1.5 rounded-full overflow-hidden">
                          <div className="bg-sky-400 h-full rounded-full" style={{ width: `${calculatedChart.elementsBalance.air}%` }} />
                        </div>
                      </div>

                      {/* Water */}
                      <div className="bg-[#131127] p-3 rounded-xl border border-blue-500/30 space-y-1">
                        <div className="flex justify-between items-center text-blue-300 font-bold">
                          <span className="flex items-center gap-1"><Droplet className="w-3.5 h-3.5" /> Acqua</span>
                          <span>{calculatedChart.elementsBalance.water}%</span>
                        </div>
                        <div className="w-full bg-[#1d1138] h-1.5 rounded-full overflow-hidden">
                          <div className="bg-blue-500 h-full rounded-full" style={{ width: `${calculatedChart.elementsBalance.water}%` }} />
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2 border-t border-[#2a244d]/60 text-xs text-purple-200">
                      <span><strong>Elemento Dominante:</strong> {calculatedChart.elementsBalance.dominantElement}</span>
                      <span><strong>Polarità:</strong> Yang (Azione): {calculatedChart.polarityBalance.yang}% | Yin (Mistica): {calculatedChart.polarityBalance.yin}%</span>
                    </div>
                  </div>

                  {/* Aspects List */}
                  <div className="space-y-2.5">
                    <h3 className="font-cinzel text-xs font-bold text-amber-300 uppercase tracking-wider">
                      Aspetti Planetari Salienti ({calculatedChart.aspects.length})
                    </h3>
                    <div className="space-y-2">
                      {calculatedChart.aspects.map((asp, idx) => (
                        <div
                          key={idx}
                          className="bg-[#1d1138] border border-purple-500/20 p-3 rounded-xl text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2"
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-purple-950 flex items-center justify-center font-bold text-amber-400 border border-purple-700">
                              {asp.symbol}
                            </span>
                            <span className="font-bold text-white">
                              {asp.planet1} {asp.aspectType} {asp.planet2}
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#131127] text-purple-200">
                              {asp.nature}
                            </span>
                          </div>

                          <p className="text-[11px] text-purple-200 sm:text-right max-w-xl font-light">
                            {asp.interpretation}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: LAVORI ASTROLOGICI & PROMPT READY PER L'ORACOLO */}
              {chartActiveSubTab === 'lavori' && (
                <div className="space-y-4">
                  <div className="bg-[#181133] border border-purple-500/30 p-4 rounded-2xl space-y-2">
                    <span className="text-xs font-bold text-amber-300 block font-cinzel">
                      🔮 Inizializza Lavori Astrologici nella Chat dell'Oracolo
                    </span>
                    <p className="text-xs text-purple-200 leading-relaxed">
                      Scegli uno dei seguenti percorsi di approfondimento per inviare il tema natale di <strong>{calculatedChart.personName}</strong> direttamente all'assistente AI di Groq:
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {[
                      {
                        title: '⚡ Analisi dei Transiti Planetari Attuali',
                        desc: 'Confronta questo tema natale con i pianeti di oggi e calcola le finestre di opportunità e le cautele nei prossimi mesi.',
                        prompt: 'Analizza i transiti planetari attuali rispetto a questo tema natale. Quali case astrologiche e pianeti sono maggiormente stimolati adesso e quali consigli pratici oracolari dare a questa persona?',
                      },
                      {
                        title: '🗝️ Scioglimento del Blocco Karmico di Saturno',
                        desc: 'Focus sulla posizione di Saturno e della 12ª Casa per individuare e trasmutare schemi ereditati o paure inconsce.',
                        prompt: 'Approfondisci la posizione di Saturno e del Nodo Nord in questo tema natale. Quali schemi limitanti e contratti d\'Anima sono pronti per essere sciolti e quale meditazione o rituale alchemico suggerisci?',
                      },
                      {
                        title: '🌿 Armonizzazione con Cristalloterapia & Fiori',
                        desc: 'Genera un piano di trattamento personalizzato con cristalli di riequilibrio sui 7 chakra per questo tema.',
                        prompt: 'Sulla base degli elementi (Fuoco, Terra, Aria, Acqua) e dei pianeti deboli o afflitti di questo tema, crea una griglia di cristalli e una miscela floreale aromatica personalizzata per armonizzare l\'aura.',
                      },
                      {
                        title: '💞 Compatibilità d\'Anima & Sinastria Relazionale',
                        desc: 'Analisi dei bisogni affettivi (Venere, Marte, Luna e 7ª Casa) per la vita di coppia o relazioni karmiche.',
                        prompt: 'Analizza il profilo relazionale di questo tema (Venere, Marte, Luna e Casa 7). Che tipo di risonanza cerca questa persona nei partner e quali sono i rischi di proiezione da evitare?',
                      },
                    ].map((work, idx) => (
                      <div
                        key={idx}
                        className="bg-[#1d1138] border border-[#2a244d] hover:border-amber-400/50 p-4 rounded-2xl space-y-2.5 transition flex flex-col justify-between"
                      >
                        <div className="space-y-1">
                          <h4 className="font-cinzel font-bold text-white text-xs">
                            {work.title}
                          </h4>
                          <p className="text-[11px] text-purple-200/80 leading-relaxed font-light">
                            {work.desc}
                          </p>
                        </div>

                        <button
                          onClick={() => handleSendChartToChat(work.prompt)}
                          className="w-full py-2 bg-gradient-to-r from-purple-800 to-indigo-900 hover:from-purple-700 hover:to-indigo-800 border border-purple-500/40 text-amber-200 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 shadow active:scale-95 cursor-pointer"
                        >
                          <Send className="w-3 h-3 text-amber-400" />
                          <span>Inizia Questo Lavoro in Chat</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* SECTION 2: NUMEROLOGY LIFE PATH CALCULATOR               */}
      {/* ======================================================== */}
      {activeToolTab === 'numerologia' && (
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

              <div className="bg-[#131127] p-3 rounded-xl border border-amber-400/30 text-xs italic text-amber-200/90 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <strong className="not-italic text-amber-300 font-semibold block mb-0.5">
                    ✨ Guida per il Consulto:
                  </strong>
                  "{pathDetails.spiritualGuidance}"
                </div>

                {onSendToChat && (
                  <button
                    onClick={() => {
                      onSendToChat(`[Numerologia Pitagorica - Cammino di Vita #${calculatedPath} (${pathDetails.title})]\nArchetipo: ${pathDetails.archetype}\n${pathDetails.description}\n\nCara Guida Oracolare, cosa consigliare nel consulto per questa vibrazione numerologica? ✨`);
                    }}
                    className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold rounded-lg transition shrink-0 flex items-center gap-1 cursor-pointer"
                  >
                    <Send className="w-3 h-3" />
                    <span>Invia a Chat</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* SECTION 3: CRYSTALS & SACRED HERBS ENCYCLOPEDIA          */}
      {/* ======================================================== */}
      {activeToolTab === 'cristalli' && (
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

                  <div className="space-y-2">
                    <div className="bg-[#1d1138]/70 p-2.5 rounded-xl border border-purple-500/20 text-[11px] text-purple-100">
                      <strong className="text-amber-300 block text-[10px] uppercase tracking-wider font-cinzel mb-0.5">
                        Impiego Rituale:
                      </strong>
                      <span className="italic">{item.ritualUse}</span>
                    </div>

                    {onSendToChat && (
                      <button
                        onClick={() => {
                          onSendToChat(`[Prontuario Esoterico - ${item.name} (${item.type} - ${item.element})]\nProprietà: ${item.desc}\nUso Rituale: ${item.ritualUse}\n\nCara Guida Oracolare, come posso integrare al meglio ${item.name} nelle mie purificazioni e nei consulti di oggi? ✨`);
                        }}
                        className="w-full py-1.5 bg-[#1d1138] hover:bg-[#281b4d] border border-purple-500/30 text-amber-300 hover:text-amber-200 text-[11px] font-semibold rounded-lg transition flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Send className="w-3 h-3" />
                        <span>Chiedi Consiglio in Chat</span>
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
