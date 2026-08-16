import React, { useState } from 'react';
import { Appointment, AppointmentStatus, AppointmentType } from '../../types';
import { VisualCalendar } from '../VisualCalendar';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Plus, 
  Search, 
  Trash2, 
  CheckCircle2, 
  RotateCcw, 
  MessageCircle, 
  X, 
  Sparkles, 
  Filter,
  Phone,
  FileText,
  CalendarDays
} from 'lucide-react';

interface AgendaViewProps {
  appointments: Appointment[];
  onAddAppointment: (appt: Omit<Appointment, 'id'>) => void;
  onUpdateAppointment: (id: string | number, updated: Partial<Appointment>) => void;
  onDeleteAppointment: (id: string | number) => void;
  onShowToast: (msg: string) => void;
}

export const AgendaView: React.FC<AgendaViewProps> = ({
  appointments,
  onAddAppointment,
  onUpdateAppointment,
  onDeleteAppointment,
  onShowToast,
}) => {
  const [showCalendar, setShowCalendar] = useState<boolean>(true);
  const [filterType, setFilterType] = useState<string>('tutti');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingAppt, setEditingAppt] = useState<Appointment | null>(null);

  // Modal Form State
  const [formData, setFormData] = useState<{
    name: string;
    date: string;
    time: string;
    type: AppointmentType;
    phone: string;
    notes: string;
    status: AppointmentStatus;
  }>({
    name: '',
    date: new Date().toISOString().split('T')[0],
    time: '15:00',
    type: 'Lettura Tarocchi',
    phone: '',
    notes: '',
    status: 'Confermato',
  });

  const openNewModal = (initialDate?: string) => {
    setEditingAppt(null);
    setFormData({
      name: '',
      date: initialDate || selectedDate || new Date().toISOString().split('T')[0],
      time: '15:00',
      type: 'Lettura Tarocchi',
      phone: '',
      notes: '',
      status: 'Confermato',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (appt: Appointment) => {
    setEditingAppt(appt);
    setFormData({
      name: appt.name,
      date: appt.date,
      time: appt.time,
      type: appt.type,
      phone: appt.phone || '',
      notes: appt.notes || '',
      status: appt.status,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (editingAppt) {
      onUpdateAppointment(editingAppt.id, formData);
      onShowToast(`Appuntamento di "${formData.name}" modificato con successo!`);
    } else {
      onAddAppointment(formData);
      onShowToast(`Nuovo appuntamento con "${formData.name}" registrato!`);
    }

    setIsModalOpen(false);
  };

  const toggleStatus = (appt: Appointment) => {
    let nextStatus: AppointmentStatus = 'Confermato';
    if (appt.status === 'Confermato') nextStatus = 'Completato';
    else if (appt.status === 'Completato') nextStatus = 'In attesa';
    else if (appt.status === 'In attesa') nextStatus = 'Confermato';

    onUpdateAppointment(appt.id, { status: nextStatus });
    onShowToast(`Stato aggiornato a: ${nextStatus}`);
  };

  const todayStr = new Date().toISOString().split('T')[0];

  // Filtering Logic
  const filteredAppointments = appointments.filter((a) => {
    // Category/Status filter
    if (filterType === 'oggi' && a.date !== todayStr) return false;
    if (filterType === 'confermati' && a.status !== 'Confermato') return false;
    if (filterType === 'in_attesa' && a.status !== 'In attesa') return false;
    if (filterType === 'rituale' && a.type !== 'Rituale Privato' && a.status !== 'Rituale') return false;

    // Date picker
    if (selectedDate && a.date !== selectedDate) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = a.name.toLowerCase().includes(q);
      const matchNotes = (a.notes || '').toLowerCase().includes(q);
      const matchType = a.type.toLowerCase().includes(q);
      if (!matchName && !matchNotes && !matchType) return false;
    }

    return true;
  });

  return (
    <div className="space-y-[clamp(12px,2vh,20px)]">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#2a244d]/70 pb-3 sm:pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-cinzel gold-gradient-text flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-amber-400" />
            <span>Agenda Consulti & Rituali</span>
          </h1>
          <p className="text-xs text-purple-300 font-light mt-0.5">
            Gestisci in ordine cronologico le tue sessioni con i clienti, letture e cerimonie
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {/* Calendar Toggle Button */}
          <button
            type="button"
            onClick={() => setShowCalendar(!showCalendar)}
            className={`px-3 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition active:scale-95 cursor-pointer ${
              showCalendar
                ? 'bg-purple-950/80 border-amber-400/50 text-amber-300 shadow-sm'
                : 'bg-[#1b153f] border-[#2a244d] text-purple-200 hover:text-white'
            }`}
            title="Mostra / Nascondi Calendario Visivo"
          >
            <CalendarDays className="w-4 h-4 text-amber-400" />
            <span>{showCalendar ? 'Nascondi Mese' : 'Mostra Mese'}</span>
          </button>

          {/* New Appointment Button */}
          <button
            type="button"
            onClick={() => openNewModal()}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-bold transition shadow-lg shadow-amber-500/20 active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nuovo Appuntamento</span>
          </button>
        </div>
      </div>

      {/* Visual Calendar Component */}
      {showCalendar && (
        <VisualCalendar
          appointments={appointments}
          selectedDate={selectedDate}
          onSelectDate={(d) => setSelectedDate(d)}
          onQuickAddForDate={(d) => openNewModal(d)}
        />
      )}

      {/* Control Bar: Filters, Date Picker, Search */}
      <div className="bg-[#131127] p-[clamp(10px,2vw,16px)] rounded-2xl border border-[#2a244d] space-y-3 shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Quick Filter Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            {[
              { id: 'tutti', label: 'Tutti' },
              { id: 'oggi', label: 'Oggi' },
              { id: 'confermati', label: 'Confermati' },
              { id: 'in_attesa', label: 'In Attesa' },
              { id: 'rituale', label: 'Rituali' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterType(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition active:scale-95 cursor-pointer ${
                  filterType === tab.id
                    ? 'bg-amber-400 text-slate-950 font-bold shadow-md shadow-amber-400/20'
                    : 'bg-[#1d1138]/60 text-purple-200 hover:text-amber-300 hover:bg-[#1d1138]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Date Picker Filter */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-[#1d1138] border border-[#2a244d] rounded-xl px-3 py-1.5 text-xs text-purple-100 focus:outline-none focus:border-amber-400 w-full sm:w-auto"
            />
            {selectedDate && (
              <button
                onClick={() => setSelectedDate('')}
                className="text-[11px] text-amber-300 hover:text-white px-2.5 py-1.5 bg-purple-950 rounded-lg border border-purple-800 cursor-pointer whitespace-nowrap"
              >
                Resetta Data
              </button>
            )}
          </div>
        </div>

        {/* Search Field */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cerca cliente, tipo di consulto o quesito..."
            className="w-full bg-[#1d1138]/70 border border-[#2a244d] rounded-xl px-3.5 py-2 pl-9 text-xs text-purple-100 placeholder-purple-400/60 focus:outline-none focus:border-amber-400"
          />
          <Search className="w-3.5 h-3.5 text-purple-400 absolute left-3 top-2.5" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 text-purple-400 hover:text-white text-xs cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Appointments List */}
      <div className="space-y-3">
        {filteredAppointments.length === 0 ? (
          <div className="bg-[#131127] border border-[#2a244d] rounded-2xl p-10 text-center space-y-3">
            <CalendarIcon className="w-10 h-10 text-purple-400/60 mx-auto" />
            <p className="text-xs text-purple-200 font-light">
              Nessun appuntamento corrisponde ai filtri selezionati.
            </p>
            <button
              onClick={() => {
                setFilterType('tutti');
                setSelectedDate('');
                setSearchQuery('');
              }}
              className="text-xs text-amber-300 hover:underline inline-block"
            >
              Rimuovi filtri
            </button>
          </div>
        ) : (
          filteredAppointments.map((appt) => {
            const isToday = appt.date === todayStr;

            return (
              <div
                key={appt.id}
                className={`bg-[#131127] border p-4 sm:p-5 rounded-2xl transition-all duration-200 shadow-md ${
                  isToday
                    ? 'border-amber-400/60 shadow-amber-500/5 bg-gradient-to-r from-[#171330] to-[#131127]'
                    : 'border-[#2a244d] hover:border-amber-400/40'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-2 flex-1">
                    {/* Top Row: Name, Badges */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-cinzel text-sm sm:text-base font-bold text-white">
                        {appt.name}
                      </span>

                      {isToday && (
                        <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 font-bold uppercase tracking-wider">
                          Oggi
                        </span>
                      )}

                      <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-purple-900/50 border border-purple-500/30 text-amber-300 font-medium">
                        {appt.type}
                      </span>

                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        appt.status === 'Confermato'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : appt.status === 'Completato'
                          ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                          : appt.status === 'Rituale'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                      }`}>
                        {appt.status}
                      </span>
                    </div>

                    {/* Date & Time & Phone */}
                    <div className="flex flex-wrap items-center gap-3 text-xs text-purple-300">
                      <span className="flex items-center gap-1">
                        <CalendarIcon className="w-3.5 h-3.5 text-amber-400" />
                        <strong className="text-purple-100">{appt.date}</strong>
                      </span>

                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-amber-400" />
                        <strong className="text-purple-100">ore {appt.time}</strong>
                      </span>

                      {appt.phone && (
                        <div className="flex items-center gap-2">
                          <span className="flex items-center gap-1 font-mono text-[11px] text-purple-200">
                            <Phone className="w-3 h-3 text-purple-400" />
                            {appt.phone}
                          </span>
                          <a
                            href={`https://wa.me/${appt.phone.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2 py-0.5 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-[10px] font-semibold border border-emerald-500/30 flex items-center gap-1 transition"
                          >
                            <MessageCircle className="w-3 h-3" />
                            <span>WhatsApp</span>
                          </a>
                        </div>
                      )}
                    </div>

                    {/* Notes / Consultation Focus */}
                    {appt.notes && (
                      <div className="bg-[#1d1138]/60 p-2.5 rounded-xl border border-[#2a244d]/60 text-xs text-purple-200/90 flex items-start gap-2">
                        <FileText className="w-3.5 h-3.5 text-amber-400/80 flex-shrink-0 mt-0.5" />
                        <p className="italic">"{appt.notes}"</p>
                      </div>
                    )}
                  </div>

                  {/* Actions Buttons */}
                  <div className="flex items-center gap-2 self-end sm:self-center border-t sm:border-t-0 pt-2 sm:pt-0 border-[#2a244d]/60">
                    <button
                      onClick={() => toggleStatus(appt)}
                      title="Cambia Stato Appuntamento"
                      className="px-2.5 py-1.5 rounded-xl bg-[#1d1138] hover:bg-[#251845] border border-[#2a244d] text-purple-200 hover:text-amber-300 text-xs flex items-center gap-1 transition"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                      <span>Stato</span>
                    </button>

                    <button
                      onClick={() => openEditModal(appt)}
                      className="px-2.5 py-1.5 rounded-xl bg-[#1d1138] hover:bg-[#251845] border border-[#2a244d] text-purple-200 hover:text-white text-xs transition"
                    >
                      Modifica
                    </button>

                    <button
                      onClick={() => {
                        if (confirm(`Sei sicura di voler eliminare l'appuntamento con ${appt.name}?`)) {
                          onDeleteAppointment(appt.id);
                          onShowToast('Appuntamento rimosso.');
                        }
                      }}
                      className="p-1.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/40 text-rose-300 text-xs transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add / Edit Appointment Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-[#131127] border border-amber-400/60 rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl relative space-y-4 my-8">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-purple-400 hover:text-white p-1 rounded-lg hover:bg-purple-900/40 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-[#2a244d]/70 pb-3">
              <span className="text-2xl">📅</span>
              <div>
                <h3 className="font-cinzel text-base font-bold text-white">
                  {editingAppt ? 'Modifica Appuntamento' : 'Aggiungi Consulto in Agenda'}
                </h3>
                <p className="text-xs text-amber-300">
                  Registra i dettagli della sessione o del rituale
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-purple-300 mb-1 font-medium">
                  Nome Cliente o Titolo Rituale *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Es. Elena Rossi o Rituale di Luna Piena"
                  className="w-full bg-[#1d1138] border border-[#2a244d] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-purple-300 mb-1 font-medium">Data *</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full bg-[#1d1138] border border-[#2a244d] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-purple-300 mb-1 font-medium">Ora *</label>
                  <input
                    type="time"
                    required
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="w-full bg-[#1d1138] border border-[#2a244d] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-purple-300 mb-1 font-medium">Tipo *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as AppointmentType })}
                    className="w-full bg-[#1d1138] border border-[#2a244d] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400 text-xs"
                  >
                    <option value="Lettura Tarocchi">Lettura Tarocchi</option>
                    <option value="Tema Natale & Transiti">Tema Natale & Transiti</option>
                    <option value="Pulizia Energetica & Aura">Pulizia Energetica & Aura</option>
                    <option value="Rituale Privato">Rituale Privato</option>
                    <option value="Consulenza Cristalloterapia">Consulenza Cristalloterapia</option>
                    <option value="Personale / Altro">Personale / Altro</option>
                  </select>
                </div>

                <div>
                  <label className="block text-purple-300 mb-1 font-medium">Stato *</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as AppointmentStatus })}
                    className="w-full bg-[#1d1138] border border-[#2a244d] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400 text-xs"
                  >
                    <option value="Confermato">Confermato</option>
                    <option value="In attesa">In attesa</option>
                    <option value="Rituale">Rituale</option>
                    <option value="Completato">Completato</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-purple-300 mb-1 font-medium">Telefono / WhatsApp</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Es. +39 340 1234567"
                  className="w-full bg-[#1d1138] border border-[#2a244d] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400 text-xs"
                />
              </div>

              <div>
                <label className="block text-purple-300 mb-1 font-medium">Note e Quesito del Consulto</label>
                <textarea
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Dettagli sul tema da analizzare, candele o materiale necessario..."
                  className="w-full bg-[#1d1138] border border-[#2a244d] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400 text-xs"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold uppercase tracking-wider rounded-xl transition shadow-lg shadow-amber-500/20 text-xs cursor-pointer"
              >
                {editingAppt ? 'Salva Modifiche' : 'Salva in Agenda'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
