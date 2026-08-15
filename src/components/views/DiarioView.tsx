import React, { useState } from 'react';
import { JournalCategory, JournalNote } from '../../types';
import { 
  BookMarked, 
  Plus, 
  Search, 
  Pin, 
  Trash2, 
  Edit3, 
  X, 
  Sparkles, 
  Flame, 
  Moon, 
  Star 
} from 'lucide-react';

interface DiarioViewProps {
  notes: JournalNote[];
  onAddNote: (note: Omit<JournalNote, 'id'>) => void;
  onUpdateNote: (id: string | number, updated: Partial<JournalNote>) => void;
  onDeleteNote: (id: string | number) => void;
  onShowToast: (msg: string) => void;
}

export const DiarioView: React.FC<DiarioViewProps> = ({
  notes,
  onAddNote,
  onUpdateNote,
  onDeleteNote,
  onShowToast,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('tutti');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingNote, setEditingNote] = useState<JournalNote | null>(null);

  const [formData, setFormData] = useState<{
    title: string;
    category: JournalCategory;
    content: string;
    icon: string;
    pinned: boolean;
  }>({
    title: '',
    category: 'Personale',
    content: '',
    icon: '📝',
    pinned: false,
  });

  const openNewModal = () => {
    setEditingNote(null);
    setFormData({
      title: '',
      category: 'Personale',
      content: '',
      icon: '📝',
      pinned: false,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (note: JournalNote) => {
    setEditingNote(note);
    setFormData({
      title: note.title,
      category: note.category,
      content: note.content,
      icon: note.icon,
      pinned: !!note.pinned,
    });
    setIsModalOpen(true);
  };

  const handleCategorySelect = (cat: JournalCategory) => {
    let icon = '📝';
    if (cat === 'Tarocchi') icon = '🔮';
    else if (cat === 'Astrologia') icon = '✨';
    else if (cat === 'Rituali') icon = '🕯️';
    else if (cat === 'Sogni') icon = '🌙';
    else if (cat === 'Personale') icon = '📓';

    setFormData({ ...formData, category: cat, icon });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) {
      onShowToast('Titolo e Contenuto sono obbligatori.');
      return;
    }

    const todayStr = new Date().toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' });

    if (editingNote) {
      onUpdateNote(editingNote.id, {
        title: formData.title,
        category: formData.category,
        content: formData.content,
        icon: formData.icon,
        pinned: formData.pinned,
      });
      onShowToast(`Nota "${formData.title}" aggiornata.`);
    } else {
      onAddNote({
        title: formData.title,
        category: formData.category,
        content: formData.content,
        icon: formData.icon,
        date: todayStr,
        pinned: formData.pinned,
      });
      onShowToast(`Nota "${formData.title}" salvata nel diario segreto!`);
    }

    setIsModalOpen(false);
  };

  const togglePin = (note: JournalNote) => {
    onUpdateNote(note.id, { pinned: !note.pinned });
    onShowToast(note.pinned ? 'Nota sbloccata dall\'alto.' : 'Nota fissata in cima!');
  };

  const filteredNotes = notes.filter((n) => {
    if (selectedCategory !== 'tutti' && n.category.toLowerCase() !== selectedCategory.toLowerCase()) {
      return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = n.title.toLowerCase().includes(q);
      const matchContent = n.content.toLowerCase().includes(q);
      if (!matchTitle && !matchContent) return false;
    }

    return true;
  });

  // Sort pinned first
  const sortedNotes = [...filteredNotes].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return 0;
  });

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2a244d]/70 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-cinzel gold-gradient-text flex items-center gap-2">
            <BookMarked className="w-5 h-5 text-amber-400" />
            <span>Diario di Bordo Segreto</span>
          </h1>
          <p className="text-xs text-purple-300 font-light mt-0.5">
            Custodisci le tue canalizzazioni, rituali di luna, riflessioni private e sogni premonitori
          </p>
        </div>

        <button
          onClick={openNewModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-bold transition shadow-lg shadow-amber-500/20 active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Nuova Nota Privata</span>
        </button>
      </div>

      {/* Control Bar: Categories & Search */}
      <div className="bg-[#131127] p-4 rounded-2xl border border-[#2a244d] space-y-3 shadow-md">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          {/* Categories */}
          <div className="flex flex-wrap gap-1.5 w-full sm:w-auto text-xs">
            {['tutti', 'Tarocchi', 'Astrologia', 'Rituali', 'Sogni', 'Personale'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition active:scale-95 ${
                  selectedCategory.toLowerCase() === cat.toLowerCase()
                    ? 'bg-amber-400 text-slate-950 font-bold shadow-md shadow-amber-400/20'
                    : 'bg-[#1d1138]/60 text-purple-200 hover:text-amber-300'
                }`}
              >
                {cat === 'tutti' ? 'Tutte le Note' : cat}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cerca tra le note..."
              className="w-full bg-[#1d1138]/80 border border-[#2a244d] rounded-xl px-3.5 py-2 pl-9 text-xs text-purple-100 placeholder-purple-400/60 focus:outline-none focus:border-amber-400"
            />
            <Search className="w-3.5 h-3.5 text-purple-400 absolute left-3 top-2.5" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-purple-400 hover:text-white text-xs"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Notes List */}
      <div className="space-y-4">
        {sortedNotes.length === 0 ? (
          <div className="bg-[#131127] border border-[#2a244d] rounded-2xl p-10 text-center space-y-2">
            <BookMarked className="w-8 h-8 text-purple-400/50 mx-auto" />
            <p className="text-xs text-purple-200">
              Nessuna annotazione trovata per questa categoria o ricerca.
            </p>
          </div>
        ) : (
          sortedNotes.map((note) => (
            <article
              key={note.id}
              className={`bg-[#131127] border p-5 sm:p-6 rounded-2xl space-y-3 transition-all duration-200 shadow-md ${
                note.pinned
                  ? 'border-amber-400/70 shadow-amber-500/5 bg-gradient-to-r from-[#171330] to-[#131127]'
                  : 'border-[#2a244d] hover:border-amber-400/40'
              }`}
            >
              {/* Header: Icon, Category, Date, Pin & Actions */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="text-xl sm:text-2xl">{note.icon || '📝'}</span>
                  <span className="text-[10px] sm:text-xs px-2.5 py-0.5 rounded-full bg-purple-950 border border-purple-500/30 text-amber-300 font-medium">
                    {note.category}
                  </span>
                  {note.pinned && (
                    <span className="inline-flex items-center gap-1 text-[10px] text-amber-300 font-semibold px-2 py-0.5 rounded-full bg-amber-400/10 border border-amber-400/30">
                      <Pin className="w-2.5 h-2.5" /> Fissata
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-purple-300/80 font-light">
                    {note.date}
                  </span>

                  <button
                    onClick={() => togglePin(note)}
                    className={`p-1.5 rounded-lg transition text-xs ${
                      note.pinned
                        ? 'text-amber-400 bg-amber-400/10'
                        : 'text-purple-400 hover:text-amber-300 hover:bg-purple-900/30'
                    }`}
                    title={note.pinned ? 'Sblocca dall\'alto' : 'Fissa in alto'}
                  >
                    <Pin className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => openEditModal(note)}
                    className="p-1.5 rounded-lg text-purple-400 hover:text-white hover:bg-purple-900/30 transition text-xs"
                    title="Modifica nota"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => {
                      if (confirm(`Sei sicura di voler eliminare la nota "${note.title}"?`)) {
                        onDeleteNote(note.id);
                        onShowToast('Nota rimossa.');
                      }
                    }}
                    className="p-1.5 rounded-lg text-rose-400/80 hover:text-rose-300 hover:bg-rose-950/40 transition text-xs"
                    title="Elimina nota"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Title */}
              <h3 className="font-cinzel font-bold text-base sm:text-lg text-white">
                {note.title}
              </h3>

              {/* Content */}
              <div className="text-xs sm:text-sm text-purple-100/90 leading-relaxed whitespace-pre-line font-light">
                {note.content}
              </div>
            </article>
          ))
        )}
      </div>

      {/* Add / Edit Note Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-[#131127] border border-amber-400/60 rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl relative space-y-4 my-8">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-purple-400 hover:text-white p-1 rounded-lg hover:bg-purple-900/40 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-[#2a244d]/70 pb-3">
              <span className="text-2xl">📓</span>
              <div>
                <h3 className="font-cinzel text-base font-bold text-white">
                  {editingNote ? 'Modifica Nota Privata' : 'Nuova Nota nel Diario Segreto'}
                </h3>
                <p className="text-xs text-amber-300">
                  Custodisci le tue rivelazioni e memorie
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-purple-300 mb-1 font-medium">Titolo della Nota *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Es. Visioni sotto la Luna Piena in Leone..."
                  className="w-full bg-[#1d1138] border border-[#2a244d] rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-amber-400 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-purple-300 mb-1 font-medium">Categoria</label>
                  <select
                    value={formData.category}
                    onChange={(e) => handleCategorySelect(e.target.value as JournalCategory)}
                    className="w-full bg-[#1d1138] border border-[#2a244d] rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-amber-400 text-xs"
                  >
                    <option value="Personale">Personale</option>
                    <option value="Tarocchi">Tarocchi</option>
                    <option value="Astrologia">Astrologia</option>
                    <option value="Rituali">Rituali</option>
                    <option value="Sogni">Sogni</option>
                  </select>
                </div>

                <div>
                  <label className="block text-purple-300 mb-1 font-medium">Simbolo / Emoji</label>
                  <input
                    type="text"
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    placeholder="Es. 🔮, 🕯️, 🌙, 📝"
                    className="w-full bg-[#1d1138] border border-[#2a244d] rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-amber-400 text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="pin-checkbox"
                  checked={formData.pinned}
                  onChange={(e) => setFormData({ ...formData, pinned: e.target.checked })}
                  className="w-4 h-4 rounded text-amber-400 bg-[#1d1138] border-[#2a244d] focus:ring-amber-400"
                />
                <label htmlFor="pin-checkbox" className="text-purple-200 cursor-pointer">
                  Fissa questa nota in cima al diario
                </label>
              </div>

              <div>
                <label className="block text-purple-300 mb-1 font-medium">Contenuto *</label>
                <textarea
                  rows={6}
                  required
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Scrivi qui i dettagli del rito, le carte uscite nel consulto, i simboli visti in sogno o le tue riflessioni interiori..."
                  className="w-full bg-[#1d1138] border border-[#2a244d] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-400 text-xs"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold uppercase tracking-wider rounded-xl transition shadow-lg shadow-amber-500/20 text-xs active:scale-95 cursor-pointer"
              >
                {editingNote ? 'Salva Modifiche' : 'Salva nel Diario'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
