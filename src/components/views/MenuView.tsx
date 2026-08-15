import React, { useState } from 'react';
import { DayMenu, WeeklyMenu } from '../../types';
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
  Sun
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
  
  // Determine current day in Italian
  const dayNamesIt = ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato'];
  const currentDayName = dayNamesIt[new Date().getDay()];

  const [selectedDayFilter, setSelectedDayFilter] = useState<string>('tutti');
  const [editingDay, setEditingDay] = useState<string | null>(null);
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

      {/* Alchemical Food Philosophy Card */}
      <div className="bg-gradient-to-r from-[#171330] to-[#110d24] border border-amber-400/30 p-4 sm:p-5 rounded-2xl space-y-2">
        <div className="flex items-center gap-2 text-amber-300 font-cinzel text-xs sm:text-sm font-bold">
          <Sun className="w-4 h-4 text-amber-400" />
          <span>Nutrizione Sacra per la Veggente</span>
        </div>
        <p className="text-xs text-purple-200/90 leading-relaxed">
          Il cibo è la prima medicina vibrazionale: cibi caldi, spezie dorate (curcuma, zafferano, cannella) ed erbe di campo mantengono i centri energetici purificati e l'intuito cristallino.
        </p>
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
