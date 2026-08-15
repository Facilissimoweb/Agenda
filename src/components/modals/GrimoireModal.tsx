import React, { useState } from 'react';
import { 
  BookOpen, 
  Sparkles, 
  Plus, 
  Trash2, 
  Check, 
  X, 
  UploadCloud, 
  FileText, 
  Search, 
  Eye, 
  Database, 
  HelpCircle,
  ExternalLink,
  Tag,
  BookMarked
} from 'lucide-react';
import { SacredBook, SacredBookCategory } from '../../types';
import { 
  saveCustomGrimoire, 
  deleteCustomGrimoire, 
  toggleGrimoireEnabled, 
  resetGrimoiresToDefault,
  syncGrimoiresToSupabase
} from '../../services/grimoireService';

interface GrimoireModalProps {
  isOpen: boolean;
  onClose: () => void;
  books: SacredBook[];
  onUpdateBooks: (books: SacredBook[]) => void;
  onShowToast: (msg: string) => void;
}

export const GrimoireModal: React.FC<GrimoireModalProps> = ({
  isOpen,
  onClose,
  books,
  onUpdateBooks,
  onShowToast,
}) => {
  const [selectedBook, setSelectedBook] = useState<SacredBook | null>(null);
  const [activeTab, setActiveTab] = useState<'library' | 'add' | 'guide'>('library');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // New Book Form State
  const [newTitle, setNewTitle] = useState('');
  const [newAuthor, setNewAuthor] = useState('Maria Teresa');
  const [newCategory, setNewCategory] = useState<SacredBookCategory>('personale');
  const [newEmoji, setNewEmoji] = useState('📖');
  const [newDesc, setNewDesc] = useState('');
  const [newChapterTitle, setNewChapterTitle] = useState('Capitolo 1: Fondamenti');
  const [newContent, setNewContent] = useState('');
  const [newTags, setNewTags] = useState('manuale, testo sacro');
  const [isSyncing, setIsSyncing] = useState(false);

  if (!isOpen) return null;

  const filteredBooks = books.filter((b) => {
    const matchesCat = selectedCategory === 'all' || b.category === selectedCategory;
    const matchesSearch = 
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  const activeBooksCount = books.filter((b) => b.isEnabled).length;

  const handleToggle = (bookId: string, currentStatus: boolean) => {
    const updated = toggleGrimoireEnabled(bookId, !currentStatus);
    onUpdateBooks(updated);
    onShowToast(!currentStatus ? '📖 Libro attivato per l\'Oracolo' : 'Libro disattivato');
  };

  const handleDelete = (bookId: string, title: string) => {
    if (confirm(`Sei sicura di voler eliminare il manuale "${title}"?`)) {
      const updated = deleteCustomGrimoire(bookId);
      onUpdateBooks(updated);
      if (selectedBook?.id === bookId) setSelectedBook(null);
      onShowToast('Manuale eliminato.');
    }
  };

  const handleCreateNewBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      onShowToast('Inserisci un titolo per il manuale.');
      return;
    }
    if (!newContent.trim()) {
      onShowToast('Inserisci il testo o i capitoli del manuale.');
      return;
    }

    const tagsArray = newTags.split(',').map((t) => t.trim()).filter(Boolean);

    const { books: updated, savedBook } = saveCustomGrimoire({
      title: newTitle.trim(),
      author: newAuthor.trim() || 'Maria Teresa',
      category: newCategory,
      coverEmoji: newEmoji || '📖',
      description: newDesc.trim() || 'Manuale personalizzato per le consultazioni dell\'Oracolo.',
      tags: tagsArray,
      isEnabled: true,
      sections: [
        {
          id: `sec-${Date.now()}`,
          title: newChapterTitle.trim() || 'Estratto Principale',
          chapterNumber: 'Capitolo 1',
          content: newContent.trim(),
        },
      ],
      fullText: newContent.trim(),
    });

    onUpdateBooks(updated);
    setSelectedBook(savedBook);
    setActiveTab('library');
    onShowToast(`✨ "${savedBook.title}" caricato con successo e attivato per l'Oracolo!`);

    // Reset form
    setNewTitle('');
    setNewDesc('');
    setNewContent('');
  };

  // Handle File Upload (.txt or .md)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        setNewContent(text);
        if (!newTitle) {
          const rawName = file.name.replace(/\.[^/.]+$/, '');
          setNewTitle(rawName);
        }
        onShowToast(`📄 File "${file.name}" importato nel modulo!`);
      }
    };
    reader.readAsText(file);
  };

  const handleSyncToSupabase = async () => {
    setIsSyncing(true);
    const res = await syncGrimoiresToSupabase(books);
    setIsSyncing(false);
    if (res.success) {
      onShowToast('☁️ Tutti i Grimori sono stati sincronizzati su Supabase!');
    } else {
      onShowToast(`Nota: ${res.error || 'Configura Supabase nelle impostazioni per la sincronizzazione cloud'}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="bg-[#110e24] border border-[#2a244d] w-full max-w-4xl max-h-[92vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#2a244d] bg-[#161233] flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400/20 to-purple-800/40 border border-amber-400/50 flex items-center justify-center text-xl text-amber-300 shadow-md">
              📚
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-cinzel font-bold text-white gold-gradient-text">
                  Biblioteca Sacra & Grimori AI
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-950 border border-amber-400/40 text-amber-300">
                  {activeBooksCount} attivi su {books.length}
                </span>
              </div>
              <p className="text-xs text-purple-300/80">
                Manuali, testi tradizionali ed estratti usati dall'Oracolo per formulare risposte sacre e citazioni.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-purple-400 hover:text-white hover:bg-purple-900/30 rounded-xl transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="px-4 pt-3 border-b border-[#2a244d] bg-[#130f2b] flex items-center justify-between gap-2 overflow-x-auto flex-shrink-0">
          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={() => { setActiveTab('library'); setSelectedBook(null); }}
              className={`px-4 py-2 rounded-t-xl font-medium border-b-2 transition flex items-center gap-2 cursor-pointer ${
                activeTab === 'library'
                  ? 'border-amber-400 text-amber-300 bg-purple-950/60'
                  : 'border-transparent text-purple-300 hover:text-white'
              }`}
            >
              <BookMarked className="w-4 h-4" />
              <span>I Miei Manuali ({books.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('add')}
              className={`px-4 py-2 rounded-t-xl font-medium border-b-2 transition flex items-center gap-2 cursor-pointer ${
                activeTab === 'add'
                  ? 'border-amber-400 text-amber-300 bg-purple-950/60'
                  : 'border-transparent text-purple-300 hover:text-white'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>Aggiungi Manuale / Testo</span>
            </button>

            <button
              onClick={() => setActiveTab('guide')}
              className={`px-4 py-2 rounded-t-xl font-medium border-b-2 transition flex items-center gap-2 cursor-pointer ${
                activeTab === 'guide'
                  ? 'border-amber-400 text-amber-300 bg-purple-950/60'
                  : 'border-transparent text-purple-300 hover:text-white'
              }`}
            >
              <HelpCircle className="w-4 h-4" />
              <span>Come Funziona & Guida Supabase</span>
            </button>
          </div>

          <button
            onClick={handleSyncToSupabase}
            disabled={isSyncing}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1d1645] border border-purple-500/30 text-purple-200 hover:text-amber-300 text-xs transition cursor-pointer disabled:opacity-50"
          >
            <Database className="w-3.5 h-3.5 text-amber-400" />
            <span>{isSyncing ? 'Sincronizzazione...' : 'Sincronizza Supabase'}</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {/* TAB 1: LIBRARY LIST OR BOOK DETAIL */}
          {activeTab === 'library' && (
            <div>
              {selectedBook ? (
                /* Book Reader / Detail View */
                <div className="space-y-4 animate-in fade-in">
                  <div className="flex items-center justify-between gap-3 bg-[#18133b] p-4 rounded-2xl border border-purple-500/30">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{selectedBook.coverEmoji}</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-cinzel font-bold text-base text-white gold-gradient-text">
                            {selectedBook.title}
                          </h3>
                          <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-purple-900 border border-purple-400/30 text-purple-200">
                            {selectedBook.category}
                          </span>
                        </div>
                        <p className="text-xs text-purple-300">
                          Autore: {selectedBook.author || 'Tradizione'} • {selectedBook.sections.length} sezioni/capitoli
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggle(selectedBook.id, selectedBook.isEnabled)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                          selectedBook.isEnabled
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50'
                            : 'bg-purple-900/40 text-purple-300 border border-purple-500/30'
                        }`}
                      >
                        <Check className={`w-3.5 h-3.5 ${selectedBook.isEnabled ? 'opacity-100' : 'opacity-30'}`} />
                        <span>{selectedBook.isEnabled ? 'Attivo in Chat' : 'Inattivo'}</span>
                      </button>

                      <button
                        onClick={() => setSelectedBook(null)}
                        className="px-3 py-1.5 bg-[#120f2b] border border-[#2a244d] text-purple-200 hover:text-white rounded-xl text-xs transition cursor-pointer"
                      >
                        Torna alla Lista
                      </button>
                    </div>
                  </div>

                  {/* Sections List */}
                  <div className="space-y-4">
                    {selectedBook.sections.map((sec, idx) => (
                      <div
                        key={sec.id || idx}
                        className="bg-[#14102e] border border-[#2a244d] rounded-2xl p-4 sm:p-5 space-y-2.5 shadow-md"
                      >
                        <div className="flex items-center justify-between border-b border-purple-500/20 pb-2">
                          <h4 className="font-cinzel font-semibold text-sm text-amber-300 flex items-center gap-2">
                            <span className="text-xs font-mono text-purple-400">
                              {sec.chapterNumber || `Cap. ${idx + 1}`}
                            </span>
                            <span>{sec.title}</span>
                          </h4>
                        </div>
                        <div className="text-xs sm:text-sm text-slate-200 whitespace-pre-wrap leading-relaxed font-light">
                          {sec.content}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                /* Books Grid */
                <div className="space-y-4">
                  {/* Search and Filters */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="relative w-full sm:w-72">
                      <Search className="w-4 h-4 absolute left-3 top-2.5 text-purple-400" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Cerca nei manuali o tag..."
                        className="w-full bg-[#161233] border border-[#2a244d] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-purple-400/60 focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 text-xs">
                      {['all', 'tarocchi', 'astrologia', 'erboristeria', 'rituali', 'personale'].map((cat) => (
                        <button
                          key={cat}
                          onClick={() => setSelectedCategory(cat)}
                          className={`px-3 py-1.5 rounded-xl capitalize transition text-xs whitespace-nowrap cursor-pointer ${
                            selectedCategory === cat
                              ? 'bg-amber-400 text-slate-950 font-bold'
                              : 'bg-[#18133b] border border-purple-500/20 text-purple-200 hover:text-white'
                          }`}
                        >
                          {cat === 'all' ? 'Tutti i Grimori' : cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Books Cards Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredBooks.map((book) => (
                      <div
                        key={book.id}
                        className={`bg-[#14102e] border rounded-2xl p-4 sm:p-5 flex flex-col justify-between transition shadow-lg ${
                          book.isEnabled
                            ? 'border-amber-400/50 shadow-amber-500/5 bg-gradient-to-br from-[#161238] to-[#120e29]'
                            : 'border-[#2a244d] opacity-75'
                        }`}
                      >
                        <div className="space-y-2.5">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-3">
                              <span className="text-3xl p-2 rounded-2xl bg-purple-950/60 border border-purple-500/30">
                                {book.coverEmoji}
                              </span>
                              <div>
                                <h3 className="font-cinzel font-bold text-sm text-white hover:text-amber-300 transition">
                                  {book.title}
                                </h3>
                                <p className="text-[11px] text-purple-300/80">
                                  {book.author} • <span className="capitalize">{book.category}</span>
                                </p>
                              </div>
                            </div>

                            {/* Toggle switch */}
                            <button
                              onClick={() => handleToggle(book.id, book.isEnabled)}
                              title={book.isEnabled ? 'Attivo nelle risposte' : 'Disattivato'}
                              className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition flex items-center gap-1 cursor-pointer ${
                                book.isEnabled
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50'
                                  : 'bg-purple-900/30 text-purple-400 border border-purple-500/20'
                              }`}
                            >
                              <Check className={`w-3 h-3 ${book.isEnabled ? 'opacity-100' : 'opacity-0'}`} />
                              <span>{book.isEnabled ? 'Attivo' : 'Inattivo'}</span>
                            </button>
                          </div>

                          <p className="text-xs text-purple-200/80 line-clamp-2 leading-relaxed">
                            {book.description}
                          </p>

                          {/* Tags */}
                          <div className="flex flex-wrap gap-1 pt-1">
                            {book.tags.slice(0, 3).map((tag, i) => (
                              <span
                                key={i}
                                className="text-[10px] px-2 py-0.5 rounded-lg bg-[#1d1742] text-purple-300 border border-purple-500/20"
                              >
                                #{tag}
                              </span>
                            ))}
                            {book.tags.length > 3 && (
                              <span className="text-[10px] text-purple-400">+{book.tags.length - 3}</span>
                            )}
                          </div>
                        </div>

                        {/* Bottom Actions */}
                        <div className="flex items-center justify-between pt-4 mt-3 border-t border-purple-500/15 text-xs">
                          <span className="text-[11px] text-purple-400/80">
                            {book.sections.length} {book.sections.length === 1 ? 'capitolo' : 'capitoli'}
                          </span>

                          <div className="flex items-center gap-2">
                            {book.isCustom && (
                              <button
                                onClick={() => handleDelete(book.id, book.title)}
                                className="p-1.5 text-purple-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                                title="Elimina questo manuale"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}

                            <button
                              onClick={() => setSelectedBook(book)}
                              className="px-3 py-1.5 rounded-xl bg-purple-900/40 hover:bg-purple-900/70 border border-purple-400/30 text-amber-300 text-xs font-semibold flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Leggi & Consulta</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: ADD NEW MANUAL / UPLOAD */}
          {activeTab === 'add' && (
            <form onSubmit={handleCreateNewBook} className="space-y-4 max-w-2xl mx-auto bg-[#14102e] p-5 rounded-3xl border border-[#2a244d]">
              <div className="flex items-center gap-2 border-b border-purple-500/20 pb-3">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <h3 className="font-cinzel font-bold text-sm text-white gold-gradient-text">
                  Carica Nuovo Grimorio o Manuale
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs text-purple-300 font-medium">Titolo del Manuale *</label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Es. Testo 1: Il mio Grimorio di Luna"
                    className="w-full bg-[#1b153f] border border-purple-500/30 rounded-xl px-3 py-2 text-xs text-white placeholder-purple-400/60 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-purple-300 font-medium">Emoji Icona</label>
                  <input
                    type="text"
                    value={newEmoji}
                    onChange={(e) => setNewEmoji(e.target.value)}
                    placeholder="📖"
                    className="w-full bg-[#1b153f] border border-purple-500/30 rounded-xl px-3 py-2 text-xs text-center text-white focus:outline-none focus:border-amber-400 text-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-purple-300 font-medium">Autore / Fonte</label>
                  <input
                    type="text"
                    value={newAuthor}
                    onChange={(e) => setNewAuthor(e.target.value)}
                    placeholder="Es. Maria Teresa / Manoscritto Antico"
                    className="w-full bg-[#1b153f] border border-purple-500/30 rounded-xl px-3 py-2 text-xs text-white placeholder-purple-400/60 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-purple-300 font-medium">Categoria</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as SacredBookCategory)}
                    className="w-full bg-[#1b153f] border border-purple-500/30 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="personale">Testo Personale / Appunti</option>
                    <option value="tarocchi">Tarocchi & Divinazione</option>
                    <option value="astrologia">Astrologia & Transiti</option>
                    <option value="erboristeria">Erboristeria & Cristalli</option>
                    <option value="rituali">Rituali & Magia</option>
                    <option value="filosofia">Filosofia Ermetica</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-purple-300 font-medium">Descrizione Breve</label>
                <input
                  type="text"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Es. Compendio pratico per la lettura del futuro e corrispondenze alchemiche."
                  className="w-full bg-[#1b153f] border border-purple-500/30 rounded-xl px-3 py-2 text-xs text-white placeholder-purple-400/60 focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Upload file button shortcut */}
              <div className="bg-[#1b153f] border border-dashed border-amber-400/40 p-3 rounded-2xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs text-amber-300">
                  <UploadCloud className="w-5 h-5 text-amber-400" />
                  <div>
                    <span className="font-semibold text-white">Carica da File (.txt / .md)</span>
                    <p className="text-[11px] text-purple-300">Incolla o carica un file di testo per compilare automaticamente</p>
                  </div>
                </div>

                <label className="px-3 py-1.5 bg-purple-900/60 hover:bg-purple-800 border border-purple-400/40 text-amber-300 text-xs font-semibold rounded-xl cursor-pointer transition">
                  Scegli File
                  <input type="file" accept=".txt,.md,.json" onChange={handleFileUpload} className="hidden" />
                </label>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs text-purple-300 font-medium">Contenuto Testuale del Manuale *</label>
                  <span className="text-[11px] text-purple-400 font-mono">{newContent.length} caratteri</span>
                </div>
                <textarea
                  required
                  rows={8}
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Scrivi o incolla qui i testi, i capitoli, le definizioni o gli estratti del tuo libro..."
                  className="w-full bg-[#1b153f] border border-purple-500/30 rounded-2xl p-3 text-xs text-slate-100 placeholder-purple-400/60 focus:outline-none focus:border-amber-400 font-light leading-relaxed scrollbar-thin"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-purple-300 font-medium">Parole Chiave / Tag (separate da virgola)</label>
                <input
                  type="text"
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                  placeholder="tarocchi, sogni, erbe, protezione"
                  className="w-full bg-[#1b153f] border border-purple-500/30 rounded-xl px-3 py-2 text-xs text-white placeholder-purple-400/60 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('library')}
                  className="px-4 py-2 bg-[#120f2b] border border-[#2a244d] text-purple-300 hover:text-white rounded-xl text-xs transition cursor-pointer"
                >
                  Annulla
                </button>

                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl text-xs shadow-md transition active:scale-95 cursor-pointer flex items-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Salva & Attiva nel Santuario</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: RAG & SUPABASE GUIDE */}
          {activeTab === 'guide' && (
            <div className="space-y-4 max-w-2xl mx-auto text-xs text-slate-200 leading-relaxed bg-[#14102e] p-5 rounded-3xl border border-[#2a244d]">
              <div className="flex items-center gap-2 border-b border-purple-500/20 pb-3">
                <BookOpen className="w-5 h-5 text-amber-400" />
                <h3 className="font-cinzel font-bold text-sm text-white gold-gradient-text">
                  Come l'Oracolo consulta i tuoi Libri & Integrazione Supabase
                </h3>
              </div>

              <div className="space-y-3">
                <div className="p-3.5 rounded-2xl bg-[#1b153f] border border-purple-500/30 space-y-1.5">
                  <h4 className="font-semibold text-amber-300 text-xs">1. Come indicare all'Oracolo di consultare un testo specifico</h4>
                  <p className="text-purple-200/90 text-[12px]">
                    Puoi scrivere nella chat domande come:
                  </p>
                  <ul className="list-disc pl-5 space-y-1 text-purple-300 text-[11px]">
                    <li><strong className="text-amber-200">"Secondo il Testo 1, spiegami il significato del Bagatto"</strong></li>
                    <li><strong className="text-amber-200">"Cosa dice il Manuale dei Tarocchi sulla stesa della Croce Celtica?"</strong></li>
                    <li><strong className="text-amber-200">"Guarda nell'Erbario Sacro: quali erbe purificano dalle energie pesanti?"</strong></li>
                  </ul>
                  <p className="text-purple-200/90 text-[12px]">
                    L'Oracolo analizzerà i libri attivi, estrarrà le sezioni rilevanti e risponderà citando esplicitamente la fonte (es. <em>📖 Fonte consultata: Manuale dei 78 Tarocchi</em>).
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#1b153f] border border-purple-500/30 space-y-1.5">
                  <h4 className="font-semibold text-amber-300 text-xs">2. Come salvare e sincronizzare i Libri su Supabase</h4>
                  <p className="text-purple-200/90 text-[12px]">
                    Tutti i manuali che carichi vengono salvati in modo sicuro sia localmente nel tuo browser, sia nella tabella <code className="text-amber-300">sacred_books</code> di Supabase.
                  </p>
                  <p className="text-purple-200/90 text-[12px]">
                    Struttura della tabella Supabase (SQL creata automaticamente o eseguibile nell'editor SQL di Supabase):
                  </p>
                  <pre className="bg-[#0b091a] p-2.5 rounded-xl border border-purple-500/20 text-[10px] font-mono text-emerald-400 overflow-x-auto">
{`create table if not exists sacred_books (
  id text primary key,
  title text not null,
  author text,
  category text,
  description text,
  cover_emoji text,
  sections jsonb,
  full_text text,
  tags text[],
  is_enabled boolean default true,
  is_custom boolean default true,
  updated_at timestamp with time zone default now()
);`}
                  </pre>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#1b153f] border border-purple-500/30 space-y-1.5">
                  <h4 className="font-semibold text-amber-300 text-xs">3. Attivazione / Disattivazione Rapida</h4>
                  <p className="text-purple-200/90 text-[12px]">
                    Puoi attivare o disattivare singoli manuali in qualsiasi momento: l'Oracolo consulterà unicamente i libri con la spunta verde <strong>"Attivo in Chat"</strong>.
                  </p>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setActiveTab('library')}
                  className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold rounded-xl text-xs cursor-pointer shadow"
                >
                  Torna ai Manuali
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
