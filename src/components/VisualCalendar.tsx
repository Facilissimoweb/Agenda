import React, { useState, useMemo } from 'react';
import { Appointment } from '../types';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Clock, 
  Plus, 
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Flame,
  X
} from 'lucide-react';

interface VisualCalendarProps {
  appointments: Appointment[];
  selectedDate: string; // YYYY-MM-DD
  onSelectDate: (date: string) => void;
  onQuickAddForDate?: (date: string) => void;
}

const MONTH_NAMES = [
  'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
  'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'
];

const WEEKDAY_NAMES = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];

export const VisualCalendar: React.FC<VisualCalendarProps> = ({
  appointments,
  selectedDate,
  onSelectDate,
  onQuickAddForDate,
}) => {
  const today = useMemo(() => new Date(), []);
  const todayStr = useMemo(() => today.toISOString().split('T')[0], [today]);

  // Initial view month based on selectedDate or today
  const [currentYear, setCurrentYear] = useState<number>(() => {
    if (selectedDate) {
      const parts = selectedDate.split('-');
      if (parts.length === 3) return parseInt(parts[0], 10);
    }
    return today.getFullYear();
  });

  const [currentMonth, setCurrentMonth] = useState<number>(() => {
    if (selectedDate) {
      const parts = selectedDate.split('-');
      if (parts.length === 3) return parseInt(parts[1], 10) - 1;
    }
    return today.getMonth();
  });

  // Map appointments by date string YYYY-MM-DD
  const appointmentsByDate = useMemo(() => {
    const map = new Map<string, Appointment[]>();
    appointments.forEach((appt) => {
      if (!appt.date) return;
      const existing = map.get(appt.date) || [];
      existing.push(appt);
      map.set(appt.date, existing);
    });
    return map;
  }, [appointments]);

  // Navigation handlers
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleGoToToday = () => {
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
    onSelectDate(todayStr);
  };

  // Calendar Grid generation
  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);

    // In JS, getDay() gives 0 for Sunday, 1 for Monday...
    // We want Monday = 0, Sunday = 6
    let startDayOfWeek = firstDayOfMonth.getDay() - 1;
    if (startDayOfWeek === -1) startDayOfWeek = 6;

    const daysInMonth = lastDayOfMonth.getDate();
    const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

    const days: Array<{
      dateStr: string;
      dayNumber: number;
      isCurrentMonth: boolean;
      isToday: boolean;
      isSelected: boolean;
      appts: Appointment[];
    }> = [];

    // Days from previous month
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const dayNum = daysInPrevMonth - i;
      const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
      const dateStr = `${prevYear}-${String(prevMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
      days.push({
        dateStr,
        dayNumber: dayNum,
        isCurrentMonth: false,
        isToday: dateStr === todayStr,
        isSelected: dateStr === selectedDate,
        appts: appointmentsByDate.get(dateStr) || [],
      });
    }

    // Days of current month
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({
        dateStr,
        dayNumber: d,
        isCurrentMonth: true,
        isToday: dateStr === todayStr,
        isSelected: dateStr === selectedDate,
        appts: appointmentsByDate.get(dateStr) || [],
      });
    }

    // Fill remaining grid to complete full weeks (multiples of 7)
    const remainingDays = (7 - (days.length % 7)) % 7;
    for (let d = 1; d <= remainingDays; d++) {
      const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
      const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;
      const dateStr = `${nextYear}-${String(nextMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({
        dateStr,
        dayNumber: d,
        isCurrentMonth: false,
        isToday: dateStr === todayStr,
        isSelected: dateStr === selectedDate,
        appts: appointmentsByDate.get(dateStr) || [],
      });
    }

    return days;
  }, [currentYear, currentMonth, todayStr, selectedDate, appointmentsByDate]);

  // Selected date appointments summary
  const selectedDateAppts = useMemo(() => {
    if (!selectedDate) return [];
    return appointmentsByDate.get(selectedDate) || [];
  }, [selectedDate, appointmentsByDate]);

  // Statistics for current month
  const monthStats = useMemo(() => {
    let totalCount = 0;
    let busyDaysCount = 0;
    const currentMonthPrefix = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;

    appointmentsByDate.forEach((appts, dateStr) => {
      if (dateStr.startsWith(currentMonthPrefix) && appts.length > 0) {
        totalCount += appts.length;
        busyDaysCount += 1;
      }
    });

    return { totalCount, busyDaysCount };
  }, [appointmentsByDate, currentYear, currentMonth]);

  // Dot color helper
  const getDotColorClass = (status: string, type: string) => {
    if (status === 'Rituale' || type === 'Rituale Privato') {
      return 'bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.8)]';
    }
    if (status === 'Confermato') {
      return 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.7)]';
    }
    if (status === 'Completato') {
      return 'bg-sky-400';
    }
    return 'bg-purple-400';
  };

  return (
    <div className="bg-[#120f26]/95 border border-[#2a244d] rounded-3xl p-[clamp(10px,2.5vw,18px)] shadow-xl space-y-[clamp(10px,1.5vh,16px)]">
      {/* Calendar Header & Month Selector */}
      <div className="flex items-center justify-between gap-2 flex-wrap pb-2 border-b border-[#2a244d]/70">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400/20 to-purple-800/40 border border-amber-400/50 flex items-center justify-center text-amber-300 shadow-sm flex-shrink-0 text-sm">
            <CalendarIcon className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h3 className="font-cinzel font-bold text-sm sm:text-base text-white gold-gradient-text truncate">
              {MONTH_NAMES[currentMonth]} {currentYear}
            </h3>
            <p className="text-[10px] text-purple-300/80 truncate flex items-center gap-1.5">
              <span>{monthStats.totalCount} {monthStats.totalCount === 1 ? 'consulto' : 'consulti'}</span>
              <span>•</span>
              <span>{monthStats.busyDaysCount} {monthStats.busyDaysCount === 1 ? 'giorno occupato' : 'giorni occupati'}</span>
            </p>
          </div>
        </div>

        {/* Month Navigation Controls */}
        <div className="flex items-center gap-1 sm:gap-1.5 flex-shrink-0">
          <button
            type="button"
            onClick={handleGoToToday}
            className="px-2.5 py-1 rounded-xl bg-purple-950/70 hover:bg-purple-900 border border-amber-400/30 text-amber-300 text-[11px] font-semibold transition active:scale-95 cursor-pointer shadow-sm"
            title="Torna al mese e giorno corrente"
          >
            Oggi
          </button>

          <button
            type="button"
            onClick={handlePrevMonth}
            className="p-1.5 rounded-xl bg-[#1b153f] hover:bg-purple-900/60 border border-[#2a244d] text-purple-200 hover:text-white transition active:scale-95 cursor-pointer"
            title="Mese precedente"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleNextMonth}
            className="p-1.5 rounded-xl bg-[#1b153f] hover:bg-purple-900/60 border border-[#2a244d] text-purple-200 hover:text-white transition active:scale-95 cursor-pointer"
            title="Mese successivo"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Weekdays Row */}
      <div className="grid grid-cols-7 gap-1 text-center">
        {WEEKDAY_NAMES.map((w, index) => (
          <div
            key={w}
            className={`text-[10px] sm:text-xs font-cinzel font-semibold py-1 uppercase tracking-wider ${
              index >= 5 ? 'text-amber-400/90' : 'text-purple-300/80'
            }`}
          >
            {w}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
        {calendarDays.map((day) => {
          const hasAppts = day.appts.length > 0;
          const isSelected = day.isSelected;
          const isToday = day.isToday;

          return (
            <button
              key={day.dateStr}
              type="button"
              onClick={() => {
                // If already selected, clicking it again toggles/deselects it to show all
                if (selectedDate === day.dateStr) {
                  onSelectDate('');
                } else {
                  onSelectDate(day.dateStr);
                }
              }}
              className={`relative min-h-[44px] sm:min-h-[50px] p-1 rounded-2xl flex flex-col items-center justify-between transition-all duration-200 cursor-pointer active:scale-95 border group ${
                isSelected
                  ? 'bg-gradient-to-b from-amber-400/25 to-amber-500/10 border-amber-400 text-amber-300 shadow-md shadow-amber-400/20 ring-1 ring-amber-400/60'
                  : isToday
                  ? 'bg-[#1b143a] border-amber-400/60 text-white shadow-sm'
                  : day.isCurrentMonth
                  ? hasAppts
                    ? 'bg-[#171333] border-purple-500/30 hover:border-amber-400/50 text-slate-100 hover:bg-[#1f1a42]'
                    : 'bg-[#14102c]/60 border-transparent hover:border-[#2a244d] hover:bg-[#181335] text-slate-300'
                  : 'bg-[#0f0c20]/40 border-transparent text-purple-400/30 opacity-40 hover:opacity-75'
              }`}
              title={`${day.dateStr}${hasAppts ? `: ${day.appts.length} appuntamenti` : ''}`}
            >
              {/* Day Number Header */}
              <div className="w-full flex items-center justify-center relative">
                <span
                  className={`text-xs sm:text-[13px] font-semibold leading-none rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center ${
                    isSelected
                      ? 'bg-amber-400 text-slate-950 font-bold shadow'
                      : isToday
                      ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40 font-bold'
                      : 'text-inherit'
                  }`}
                >
                  {day.dayNumber}
                </span>

                {/* Badge for multiple appts on small screens */}
                {day.appts.length > 1 && (
                  <span className="hidden sm:inline-flex absolute right-0.5 top-0.5 text-[8px] font-bold text-amber-300/90 bg-purple-950/80 px-1 py-0.2 rounded-full border border-amber-400/20">
                    {day.appts.length}
                  </span>
                )}
              </div>

              {/* Dot Indicators for Appointments */}
              <div className="w-full flex items-center justify-center gap-1 min-h-[8px] sm:min-h-[10px] mt-0.5">
                {hasAppts ? (
                  <>
                    {day.appts.slice(0, 3).map((appt, i) => (
                      <span
                        key={appt.id || i}
                        className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-transform group-hover:scale-125 ${getDotColorClass(
                          appt.status,
                          appt.type
                        )}`}
                      />
                    ))}
                    {day.appts.length > 3 && (
                      <span className="text-[8px] font-mono text-amber-300 font-bold leading-none">
                        +{day.appts.length - 3}
                      </span>
                    )}
                  </>
                ) : (
                  <span className="w-1.5 h-1.5 opacity-0" />
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Legend & Active Selected Date Info Panel */}
      <div className="pt-2 border-t border-[#2a244d]/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-[11px]">
        {/* Color Indicators Legend */}
        <div className="flex items-center gap-3 flex-wrap text-purple-300/80">
          <span className="font-semibold text-purple-300 flex items-center gap-1">Legenda:</span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_5px_rgba(52,211,153,0.8)]" />
            <span className="text-[10px]">Confermati</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_5px_rgba(251,191,36,0.8)]" />
            <span className="text-[10px]">Rituali</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-purple-400" />
            <span className="text-[10px]">In Attesa</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-sky-400" />
            <span className="text-[10px]">Completati</span>
          </span>
        </div>

        {/* Clear filter / Show All Button if a date is selected */}
        {selectedDate && (
          <button
            type="button"
            onClick={() => onSelectDate('')}
            className="self-start sm:self-auto px-2.5 py-1 rounded-xl bg-[#1b153f] hover:bg-purple-900/60 border border-purple-500/30 text-amber-300 hover:text-white transition flex items-center gap-1 cursor-pointer text-[10px]"
          >
            <X className="w-3 h-3" />
            <span>Mostra tutti gli appuntamenti</span>
          </button>
        )}
      </div>

      {/* Selected Day Quick Card Banner (when a date is clicked) */}
      {selectedDate && (
        <div className="bg-gradient-to-r from-amber-500/15 via-[#1a1236] to-[#120f26] border border-amber-400/40 rounded-2xl p-[clamp(8px,2vw,14px)] space-y-2 animate-in fade-in">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-base sm:text-lg">✨</span>
              <div>
                <div className="font-cinzel font-bold text-xs sm:text-sm text-white flex items-center gap-1.5">
                  <span>Data Selezionata: {selectedDate}</span>
                  {selectedDate === todayStr && (
                    <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-950 font-bold uppercase">
                      Oggi
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-purple-300">
                  {selectedDateAppts.length === 0
                    ? 'Nessun consulto in questa data'
                    : `${selectedDateAppts.length} ${
                        selectedDateAppts.length === 1 ? 'consulto programmato' : 'consulti programmati'
                      }`}
                </p>
              </div>
            </div>

            {onQuickAddForDate && (
              <button
                type="button"
                onClick={() => onQuickAddForDate(selectedDate)}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-[11px] transition shadow-md flex items-center gap-1 cursor-pointer active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Fissa per il {selectedDate.split('-')[2]}/{selectedDate.split('-')[1]}</span>
              </button>
            )}
          </div>

          {/* Quick List of Appointments on Selected Day */}
          {selectedDateAppts.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
              {selectedDateAppts.map((appt) => (
                <div
                  key={appt.id}
                  className="bg-[#14102e]/80 border border-purple-500/30 rounded-xl px-2.5 py-1.5 flex items-center justify-between gap-2 text-xs"
                >
                  <div className="min-w-0">
                    <div className="font-semibold text-white truncate flex items-center gap-1.5">
                      <span className="truncate">{appt.name}</span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-900/60 text-amber-300 border border-amber-400/20 font-mono flex-shrink-0">
                        {appt.time}
                      </span>
                    </div>
                    <p className="text-[10px] text-purple-300/80 truncate">
                      {appt.type}
                    </p>
                  </div>
                  <span
                    className={`text-[9px] px-1.5 py-0.2 rounded font-medium flex-shrink-0 ${
                      appt.status === 'Confermato'
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : appt.status === 'Rituale'
                        ? 'bg-amber-500/20 text-amber-300'
                        : 'bg-purple-500/20 text-purple-300'
                    }`}
                  >
                    {appt.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
