import React, { useState } from 'react';
import { DayMenu, WeeklyMenu } from '../../types';
import { calculateRealMoon, RealMoonDetails } from '../../utils/lunarEngine';
import { 
  Utensils, 
  Coffee, 
  Soup, 
  Flame, 
  Edit3, 
  Sparkles, 
  X, 
  Check, 
  Leaf,
  Sun,
  Moon,
  Info,
  CheckCircle2,
  AlertCircle,
  Wand2,
  ChevronDown,
  ChevronUp,
  Droplet,
  Heart
} from 'lucide-react';

interface MenuViewProps {
  weeklyMenu: WeeklyMenu;
  onUpdateMenuDay: (day: string, menu: DayMenu) => void;
  onShowToast: (msg: string) => void;
}

export const MenuView: React.FC<MenuViewProps> = ({
  weeklyMenu,
  onUpdateMenuDay,
  onShowToast,
}) => {
  const daysOfWeek = ['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato', 'Domenica'];
  
  // Real astronomical moon for nutrition
  const realMoon = calculateRealMoon(new Date());
  
  // Determine current day in Italian
  const dayNamesIt = ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato'];
  const currentDayName = dayNamesIt[new Date().getDay()];

  const [selectedDayFilter, setSelectedDayFilter] = useState<string>('tutti');
  const [editingDay, setEditingDay] = useState<string | null>(null);
  const [showPhasesGuide, setShowPhasesGuide] = useState<boolean>(false);
  const [formData, setFormData] = useState<DayMenu>({
    breakfast: '',
    lunch: '',
    dinner: '',
    tea: '',
  });

  const openEditModal = (day: string) => {
    setEditingDay(day);
    const existing = weeklyMenu[day] || {
      breakfast: '',
      lunch: '',
      dinner: '',
      tea: '',
    };
    setFormData({ ...existing });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDay) return;

    onUpdateMenuDay(editingDay, formData);
    setEditingDay(null);
    onShowToast(`Menù del ${editingDay} aggiornato con successo!`);
  };

  // Apply real lunar recipe suggestions to today's menu
  const handleApplyLunarSuggestion = () => {
    const todayMenu = weeklyMenu[currentDayName] || {
      breakfast: '',
      lunch: '',
      dinner: '',
      tea: '',
    };

    const updatedTodayMenu: DayMenu = {
      breakfast: `Colazione Lunare (${realMoon.element}): Infuso di ${realMoon.nutritionImpact.sacredSpice}, Avena e ${realMoon.nutritionImpact.recommendedFoods[1] || 'Semi attivati'}`,
      lunch: `Pranzo Alchemico: ${realMoon.nutritionImpact.alchemicalMealIdea}`,
      dinner: `Cena Leggera (${realMoon.phaseCategory}): Vellutata di stagione con ${realMoon.nutritionImpact.recommendedFoods[3] || 'Verdure al vapore'} ed erbe aromatiche`,
      tea: `${realMoon.nutritionImpact.alchemicalTea.name} (${realMoon.nutritionImpact.alchemicalTea.herbs})`,
    };

    onUpdateMenuDay(currentDayName, updatedTodayMenu);
    onShowToast(`🌙 Menù di oggi allineato alla Luna in ${realMoon.zodiacSign}!`);
  };

  const displayedDays = selectedDayFilter === 'tutti' 
    ? daysOfWeek 
    : selectedDayFilter === 'oggi'
    ? [currentDayName]
    : [selectedDayFilter];

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2a244d]/70 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-cinzel text-amber-300 flex items-center gap-2">
            <Utensils className="w-5 h-5 text-amber-400" />
            <span>Agenda Menù Alchemico Settimanale</span>
          </h1>
          <p className="text-xs text-purple-300 font-light mt-0.5">
            Pianifica i tuoi pasti energetici, ingredienti solari, erbe sacre e tisane di guarigione
          </p>
        </div>

        <button
          onClick={() => openEditModal(currentDayName)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-bold transition shadow-lg shadow-amber-500/20 active:scale-95 cursor-pointer"
        >
          <Edit3 className="w-4 h-4" />
          <span>Modifica Menù di Oggi ({currentDayName})</span>
        </button>
      </div>

      {/* Real Astronomical Moon & Biodynamic Food Impact Banner */}
      <div className="bg-gradient-to-br from-[#181335] via-[#120d29] to-[#0a0718] border border-amber-400/40 p-4 sm:p-6 rounded-2xl shadow-xl space-y-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-400/5 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header of Lunar Food Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#2a244d]/80 pb-3">
          <div className="flex items-center gap-3">
            <span className="text-3xl sm:text-4xl text-amber-200 animate-pulse select-none">
              {realMoon.icon}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider font-cinzel text-amber-400">
                  Transito & Nutrizione Lunare Reale
                </span>
                <span className="text-[9px] px-2 py-0.2 rounded-full bg-purple-950 border border-purple-700/60 text-purple-200">
                  {realMoon.illumination}% Luce • Età {realMoon.ageDays}g
                </span>
              </div>
              <h3 className="font-cinzel text-base sm:text-lg font-bold text-white">
                {realMoon.phaseName} in {realMoon.zodiacSign} ({realMoon.zodiacDegree}°)
              </h3>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleApplyLunarSuggestion}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-bold transition shadow-md shadow-amber-500/20 active:scale-95 flex items-center gap-1.5 cursor-pointer"
              title="Inserisci automaticamente nel menù di oggi gli ingredienti, la tisana e la ricetta governata dalla Luna odierna"
            >
              <Wand2 className="w-3.5 h-3.5" />
              <span>Allinea Menù di Oggi alla Luna</span>
            </button>

            <button
              onClick={() => setShowPhasesGuide(!showPhasesGuide)}
              className="px-3 py-2 rounded-xl bg-[#1d1138] hover:bg-[#28184c] border border-purple-500/30 text-amber-200 text-xs font-medium transition flex items-center gap-1 cursor-pointer"
            >
              <Info className="w-3.5 h-3.5 text-amber-400" />
              <span>Compendio 4 Fasi</span>
              {showPhasesGuide ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          </div>
        </div>

        {/* Real Nutrition Impact Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-1 text-xs">
          {/* Card 1: Metabolic Theme & Element */}
          <div className="bg-[#120d26]/80 p-3.5 rounded-xl border border-[#2a244d] space-y-2">
            <div className="flex items-center justify-between text-purple-300">
              <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sun className="w-3.5 h-3.5 text-amber-400" /> Metabolismo & Elemento
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-900/60 text-purple-200 border border-purple-500/30">
                {realMoon.element} {realMoon.elementIcon}
              </span>
            </div>
            <p className="text-purple-100 font-medium text-[11px] leading-relaxed">
              {realMoon.nutritionImpact.metabolicTheme}
            </p>
            <div className="text-[10px] text-purple-300 border-t border-[#2a244d]/60 pt-2 space-y-1">
              <p>🌱 <strong>Parte vegetale favorita:</strong> Giorno del <em>{realMoon.biodynamicPlantPart}</em></p>
              <p>🩺 <strong>Organi governati:</strong> <span className="text-amber-200/90">{realMoon.governedOrgans}</span></p>
            </div>
          </div>

          {/* Card 2: Recommended vs Moderate Foods */}
          <div className="bg-[#120d26]/80 p-3.5 rounded-xl border border-[#2a244d] space-y-2">
            <span className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Cibi & Spezie Consigliate
            </span>
            <ul className="space-y-1 text-[11px] text-purple-200">
              {realMoon.nutritionImpact.recommendedFoods.slice(0, 3).map((food, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="text-emerald-400">✓</span>
                  <span>{food}</span>
                </li>
              ))}
            </ul>
            <div className="pt-1.5 border-t border-[#2a244d]/60 text-[10px] text-amber-300">
              ✨ <strong>Spezia sacra:</strong> {realMoon.nutritionImpact.sacredSpice}
            </div>
          </div>

          {/* Card 3: Sacred Tea of Today */}
          <div className="bg-[#120d26]/80 p-3.5 rounded-xl border border-[#2a244d] space-y-2">
            <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
              <Coffee className="w-3.5 h-3.5 text-amber-400" /> Tisana Alchemica Lunare
            </span>
            <p className="text-purple-100 font-semibold text-[11px]">
              {realMoon.nutritionImpact.alchemicalTea.name}
            </p>
            <p className="text-[10px] text-purple-300 leading-relaxed italic">
              🌿 {realMoon.nutritionImpact.alchemicalTea.herbs}
            </p>
            <div className="pt-1.5 border-t border-[#2a244d]/60 text-[10px] text-purple-300 flex items-center justify-between">
              <span>⏱️ Infusione: <strong>{realMoon.nutritionImpact.alchemicalTea.brewTime}</strong></span>
              <span className="text-emerald-300">100% Naturale</span>
            </div>
          </div>
        </div>

        {/* Collapsible 4-Phases Lunar Food Compendium */}
        {showPhasesGuide && (
          <div className="mt-4 pt-4 border-t border-amber-400/20 space-y-3 text-xs bg-[#0b0819]/90 p-4 rounded-xl">
            <div className="flex items-center justify-between">
              <h4 className="font-cinzel text-sm font-bold text-amber-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Compendio Nutrizionale delle 4 Fasi Lunari</span>
              </h4>
              <button
                onClick={() => setShowPhasesGuide(false)}
                className="text-[10px] text-purple-300 hover:text-white"
              >
                Chiudi ✕
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
              {/* Fase 1: Crescente */}
              <div className="p-3 rounded-xl bg-[#140e2d] border border-emerald-500/30 space-y-1.5">
                <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-[11px]">
                  <span>🌔 Luna Crescente</span>
                </div>
                <p className="text-[10px] font-semibold text-purple-200">Fase di Assimilazione & Ricostruzione</p>
                <p className="text-[10px] text-purple-300 leading-relaxed">
                  Il corpo assorbe al meglio minerali, vitamine e proteine. Ottimo per reintegrare le forze con cereali integrali, semi e infusi remineralizzanti (ortica, equiseto). Attenzione agli zuccheri che si accumulano più in fretta.
                </p>
              </div>

              {/* Fase 2: Piena */}
              <div className="p-3 rounded-xl bg-[#140e2d] border border-amber-500/30 space-y-1.5">
                <div className="flex items-center gap-1.5 text-amber-400 font-bold text-[11px]">
                  <span>🌕 Luna Piena (Plenilunio)</span>
                </div>
                <p className="text-[10px] font-semibold text-purple-200">Fase di Espansione & Idro-ritenzione</p>
                <p className="text-[10px] text-purple-300 leading-relaxed">
                  Picco energetico ed emotivo. Digestione più sensibile e facilità di ritenzione idrica. Privilegiare pasti leggeri, vellutate, frutta acquosa, verdure al vapore e tisane distensive (melissa, passiflora, camomilla).
                </p>
              </div>

              {/* Fase 3: Calante */}
              <div className="p-3 rounded-xl bg-[#140e2d] border border-purple-500/30 space-y-1.5">
                <div className="flex items-center gap-1.5 text-purple-400 font-bold text-[11px]">
                  <span>🌖 Luna Calante</span>
                </div>
                <p className="text-[10px] font-semibold text-purple-200">Fase di Detossinazione & Drenaggio</p>
                <p className="text-[10px] text-purple-300 leading-relaxed">
                  Il corpo brucia più calorie ed elimina spontaneamente liquidi e scorie metaboliche. Ideale per cibi amari epatici (carciofo, tarassaco, cicoria selvatica) e tisane drenanti (betulla, zenzero e limone).
                </p>
              </div>

              {/* Fase 4: Nuova */}
              <div className="p-3 rounded-xl bg-[#140e2d] border border-rose-500/30 space-y-1.5">
                <div className="flex items-center gap-1.5 text-rose-400 font-bold text-[11px]">
                  <span>🌑 Luna Nuova (Novilunio)</span>
                </div>
                <p className="text-[10px] font-semibold text-purple-200">Fase di Reset & Svuotamento Sacro</p>
                <p className="text-[10px] text-purple-300 leading-relaxed">
                  Massimo riposo degli organi interni. Perfetta per semi-digiuno dolce, brodi di radici sacre, estratti verdi freschi e tisane di salvia ed alloro per liberare i canali energetici.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Filter Tabs for Day Focus */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
        <button
          onClick={() => setSelectedDayFilter('tutti')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition whitespace-nowrap active:scale-95 ${
            selectedDayFilter === 'tutti'
              ? 'bg-amber-400 text-slate-950 font-bold shadow-md'
              : 'bg-[#131127] border border-[#2a244d] text-purple-200 hover:text-amber-300'
          }`}
        >
          Tutta la Settimana
        </button>

        <button
          onClick={() => setSelectedDayFilter('oggi')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition whitespace-nowrap active:scale-95 ${
            selectedDayFilter === 'oggi'
              ? 'bg-amber-400 text-slate-950 font-bold shadow-md'
              : 'bg-[#131127] border border-[#2a244d] text-purple-200 hover:text-amber-300'
          }`}
        >
          Oggi ({currentDayName}) 🌟
        </button>

        {daysOfWeek.map((day) => (
          <button
            key={day}
            onClick={() => setSelectedDayFilter(day)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition whitespace-nowrap active:scale-95 ${
              selectedDayFilter === day
                ? 'bg-amber-400 text-slate-950 font-bold shadow-md'
                : 'bg-[#131127] border border-[#2a244d] text-purple-200 hover:text-amber-300'
            }`}
          >
            {day}
          </button>
        ))}
      </div>

      {/* Weekly Menu Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayedDays.map((day) => {
          const item = weeklyMenu[day] || {
            breakfast: 'Non ancora pianificata',
            lunch: 'Non ancora pianificato',
            dinner: 'Non ancora pianificata',
            tea: 'Infuso rilassante',
          };
          const isToday = day === currentDayName;

          return (
            <div
              key={day}
              className={`bg-[#131127] border p-5 rounded-2xl flex flex-col justify-between space-y-4 transition-all duration-200 shadow-md ${
                isToday
                  ? 'border-amber-400/80 shadow-amber-500/10 bg-gradient-to-b from-[#181432] to-[#131127]'
                  : 'border-[#2a244d] hover:border-amber-400/40'
              }`}
            >
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-[#2a244d]/70 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="font-cinzel text-base font-bold text-amber-300">
                      {day}
                    </span>
                    {isToday && (
                      <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 font-bold uppercase tracking-wider">
                        Oggi
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => openEditModal(day)}
                    className="p-1.5 rounded-lg bg-[#1d1138] hover:bg-[#251845] text-purple-300 hover:text-amber-300 transition"
                    title={`Modifica menù di ${day}`}
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Meals */}
                <div className="space-y-2.5 text-xs">
                  {/* Breakfast */}
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5 text-amber-400 font-semibold">
                      <Coffee className="w-3.5 h-3.5 text-amber-400" />
                      <span>Colazione Alchemica</span>
                    </div>
                    <p className="text-purple-100 pl-5 leading-relaxed font-light">
                      {item.breakfast || '-'}
                    </p>
                  </div>

                  {/* Lunch */}
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5 text-amber-400 font-semibold">
                      <Utensils className="w-3.5 h-3.5 text-amber-400" />
                      <span>Pranzo Energetico</span>
                    </div>
                    <p className="text-purple-100 pl-5 leading-relaxed font-light">
                      {item.lunch || '-'}
                    </p>
                  </div>

                  {/* Dinner */}
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5 text-amber-400 font-semibold">
                      <Soup className="w-3.5 h-3.5 text-amber-400" />
                      <span>Cena Leggera</span>
                    </div>
                    <p className="text-purple-100 pl-5 leading-relaxed font-light">
                      {item.dinner || '-'}
                    </p>
                  </div>

                  {/* Sacred Tea */}
                  <div className="space-y-0.5 bg-[#1d1138]/60 p-2.5 rounded-xl border border-purple-500/20">
                    <div className="flex items-center gap-1.5 text-rose-300 font-semibold">
                      <Leaf className="w-3.5 h-3.5 text-rose-400" />
                      <span>Tisana della Sera & Spezia</span>
                    </div>
                    <p className="text-purple-200/90 pl-5 leading-relaxed italic text-[11px]">
                      "{item.tea || 'Tisana di erbe sacre'}"
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Day Meal Modal */}
      {editingDay && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-[#131127] border border-amber-400/60 rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl relative space-y-4 my-8">
            <button
              onClick={() => setEditingDay(null)}
              className="absolute top-4 right-4 text-purple-400 hover:text-white p-1 rounded-lg hover:bg-purple-900/40 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-[#2a244d]/70 pb-3">
              <span className="text-2xl">🍲</span>
              <div>
                <h3 className="font-cinzel text-base font-bold text-white">
                  Pianifica Menù per {editingDay}
                </h3>
                <p className="text-xs text-amber-300">
                  Imposta i pasti energetici e la tisana rituale
                </p>
              </div>
            </div>

            <form onSubmit={handleSave} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-purple-300 mb-1 font-medium">
                  Colazione Alchemica
                </label>
                <input
                  type="text"
                  value={formData.breakfast}
                  onChange={(e) => setFormData({ ...formData, breakfast: e.target.value })}
                  placeholder="Es. Tisana Cannella, Miele, Avena e Frutti di Bosco..."
                  className="w-full bg-[#1d1138] border border-[#2a244d] rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-amber-400 text-xs"
                />
              </div>

              <div>
                <label className="block text-purple-300 mb-1 font-medium">
                  Pranzo Energetico
                </label>
                <input
                  type="text"
                  value={formData.lunch}
                  onChange={(e) => setFormData({ ...formData, lunch: e.target.value })}
                  placeholder="Es. Risotto allo Zafferano ed Erbe dell'Orto..."
                  className="w-full bg-[#1d1138] border border-[#2a244d] rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-amber-400 text-xs"
                />
              </div>

              <div>
                <label className="block text-purple-300 mb-1 font-medium">
                  Cena Leggera
                </label>
                <input
                  type="text"
                  value={formData.dinner}
                  onChange={(e) => setFormData({ ...formData, dinner: e.target.value })}
                  placeholder="Es. Vellutata di Zucca, Salvia fresca e Zenzero..."
                  className="w-full bg-[#1d1138] border border-[#2a244d] rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-amber-400 text-xs"
                />
              </div>

              <div>
                <label className="block text-purple-300 mb-1 font-medium">
                  Tisana Serale & Spezia Sacra
                </label>
                <input
                  type="text"
                  value={formData.tea}
                  onChange={(e) => setFormData({ ...formData, tea: e.target.value })}
                  placeholder="Es. Infuso di Passiflora, Melissa e Fiori d'Arancio..."
                  className="w-full bg-[#1d1138] border border-[#2a244d] rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-amber-400 text-xs"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold uppercase tracking-wider rounded-xl transition shadow-lg shadow-amber-500/20 text-xs active:scale-95 cursor-pointer"
              >
                Salva Menù del Giorno
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
