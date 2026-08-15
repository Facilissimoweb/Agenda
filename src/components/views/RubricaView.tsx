import React, { useState } from 'react';
import { Contact } from '../../types';
import { 
  BookUser, 
  UserPlus, 
  Search, 
  Phone, 
  Mail, 
  MessageCircle, 
  Trash2, 
  Edit3, 
  X, 
  Sparkles,
  Filter
} from 'lucide-react';

interface RubricaViewProps {
  contacts: Contact[];
  onAddContact: (contact: Omit<Contact, 'id'>) => void;
  onUpdateContact: (id: string | number, updated: Partial<Contact>) => void;
  onDeleteContact: (id: string | number) => void;
  onShowToast: (msg: string) => void;
}

export const RubricaView: React.FC<RubricaViewProps> = ({
  contacts,
  onAddContact,
  onUpdateContact,
  onDeleteContact,
  onShowToast,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('tutti');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);

  const [formData, setFormData] = useState<{
    name: string;
    phone: string;
    email: string;
    zodiac: string;
    birthDate: string;
    category: Contact['category'];
    notes: string;
  }>({
    name: '',
    phone: '',
    email: '',
    zodiac: 'Scorpione ♏',
    birthDate: '',
    category: 'Cliente Abituale',
    notes: '',
  });

  const openNewModal = () => {
    setEditingContact(null);
    setFormData({
      name: '',
      phone: '',
      email: '',
      zodiac: 'Scorpione ♏',
      birthDate: '',
      category: 'Cliente Abituale',
      notes: '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (contact: Contact) => {
    setEditingContact(contact);
    setFormData({
      name: contact.name,
      phone: contact.phone,
      email: contact.email || '',
      zodiac: contact.zodiac || 'Scorpione ♏',
      birthDate: contact.birthDate || '',
      category: contact.category || 'Cliente Abituale',
      notes: contact.notes || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) {
      onShowToast('Nome e Telefono sono campi obbligatori.');
      return;
    }

    if (editingContact) {
      onUpdateContact(editingContact.id, formData);
      onShowToast(`Contatto "${formData.name}" modificato!`);
    } else {
      onAddContact(formData);
      onShowToast(`Nuovo contatto "${formData.name}" aggiunto in rubrica!`);
    }

    setIsModalOpen(false);
  };

  const filteredContacts = contacts.filter((c) => {
    if (categoryFilter !== 'tutti' && c.category !== categoryFilter) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = c.name.toLowerCase().includes(q);
      const matchPhone = c.phone.includes(q);
      const matchZodiac = (c.zodiac || '').toLowerCase().includes(q);
      const matchNotes = (c.notes || '').toLowerCase().includes(q);
      if (!matchName && !matchPhone && !matchZodiac && !matchNotes) return false;
    }

    return true;
  });

  const zodiacOptions = [
    'Ariete ♈', 'Toro ♉', 'Gemelli ♊', 'Cancro ♋', 
    'Leone ♌', 'Vergine ♍', 'Bilancia ♎', 'Scorpione ♏', 
    'Sagittario ♐', 'Capricorno ♑', 'Acquario ♒', 'Pesci ♓'
  ];

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2a244d]/70 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-cinzel text-indigo-300 flex items-center gap-2">
            <BookUser className="w-5 h-5 text-indigo-400" />
            <span>Rubrica Telefonica & Schede Clienti</span>
          </h1>
          <p className="text-xs text-purple-300 font-light mt-0.5">
            Archivio riservato dei contatti, segni zodiacali, date di nascita e preferenze dei consultanti
          </p>
        </div>

        <button
          onClick={openNewModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white text-xs font-bold transition shadow-lg shadow-indigo-500/20 active:scale-95 cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>Aggiungi Contatto</span>
        </button>
      </div>

      {/* Control Bar: Search & Category Filter */}
      <div className="bg-[#131127] p-4 rounded-2xl border border-[#2a244d] space-y-3 shadow-md">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          {/* Category Tabs */}
          <div className="flex flex-wrap gap-1.5 w-full sm:w-auto text-xs">
            {['tutti', 'Cliente Abituale', 'Nuovo Contatto', 'Collaboratore'].map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition active:scale-95 ${
                  categoryFilter === cat
                    ? 'bg-indigo-500 text-white font-bold shadow-md'
                    : 'bg-[#1d1138]/60 text-purple-200 hover:text-indigo-300'
                }`}
              >
                {cat === 'tutti' ? 'Tutti i Contatti' : cat}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cerca nome, telefono, segno..."
              className="w-full bg-[#1d1138]/80 border border-[#2a244d] rounded-xl px-3.5 py-2 pl-9 text-xs text-purple-100 placeholder-purple-400/60 focus:outline-none focus:border-indigo-400"
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

      {/* Contacts Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredContacts.length === 0 ? (
          <div className="col-span-full bg-[#131127] border border-[#2a244d] rounded-2xl p-10 text-center space-y-2">
            <BookUser className="w-8 h-8 text-purple-400/50 mx-auto" />
            <p className="text-xs text-purple-200">
              Nessun contatto trovato con questi criteri di ricerca.
            </p>
          </div>
        ) : (
          filteredContacts.map((contact) => (
            <div
              key={contact.id}
              className="bg-[#131127] border border-[#2a244d] p-4 sm:p-5 rounded-2xl space-y-3.5 hover:border-indigo-400/50 transition-all duration-200 shadow-md flex flex-col justify-between"
            >
              <div className="space-y-2.5">
                {/* Header: Avatar, Name, Zodiac */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-900 to-purple-950 border border-indigo-500/40 flex items-center justify-center text-indigo-200 text-sm font-bold font-cinzel shadow">
                      {contact.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-cinzel text-sm font-bold text-white leading-tight">
                        {contact.name}
                      </h4>
                      <span className="text-[10px] text-amber-300 font-medium">
                        {contact.zodiac || 'Segno N.D.'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(contact)}
                      className="p-1.5 rounded-lg bg-[#1d1138] hover:bg-[#251845] text-purple-300 hover:text-white transition text-xs"
                      title="Modifica contatto"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Rimuovere ${contact.name} dalla rubrica?`)) {
                          onDeleteContact(contact.id);
                          onShowToast('Contatto rimosso.');
                        }
                      }}
                      className="p-1.5 rounded-lg bg-rose-950/30 hover:bg-rose-900/50 text-rose-300 transition text-xs"
                      title="Elimina contatto"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Badge Category & BirthDate */}
                <div className="flex flex-wrap items-center gap-2 text-[10px]">
                  {contact.category && (
                    <span className="px-2 py-0.5 rounded-full bg-indigo-950/70 border border-indigo-500/30 text-indigo-300 font-medium">
                      {contact.category}
                    </span>
                  )}
                  {contact.birthDate && (
                    <span className="text-purple-300">
                      Nascita: <strong className="text-purple-100">{contact.birthDate}</strong>
                    </span>
                  )}
                </div>

                {/* Notes */}
                {contact.notes && (
                  <p className="text-xs text-purple-200/90 bg-[#1d1138]/60 p-2.5 rounded-xl border border-[#2a244d]/60 leading-relaxed italic">
                    "{contact.notes}"
                  </p>
                )}
              </div>

              {/* Contact Direct Actions (WhatsApp & Call) */}
              <div className="pt-2 border-t border-[#2a244d]/60 flex items-center justify-between gap-2">
                <a
                  href={`tel:${contact.phone}`}
                  className="text-xs text-purple-300 hover:text-white font-mono flex items-center gap-1.5 truncate"
                >
                  <Phone className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                  <span>{contact.phone}</span>
                </a>

                <a
                  href={`https://wa.me/${contact.phone.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition active:scale-95"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Chat</span>
                </a>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add / Edit Contact Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-[#131127] border border-indigo-400/60 rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl relative space-y-4 my-8">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-purple-400 hover:text-white p-1 rounded-lg hover:bg-purple-900/40 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-[#2a244d]/70 pb-3">
              <span className="text-2xl">👤</span>
              <div>
                <h3 className="font-cinzel text-base font-bold text-white">
                  {editingContact ? 'Modifica Contatto' : 'Nuovo Contatto Rubrica'}
                </h3>
                <p className="text-xs text-indigo-300">
                  Inserisci la scheda del cliente o collaboratore
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-purple-300 mb-1 font-medium">Nome e Cognome *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Es. Marta Bianchi"
                  className="w-full bg-[#1d1138] border border-[#2a244d] rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-indigo-400 text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-purple-300 mb-1 font-medium">Telefono / WhatsApp *</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+39 333 1234567"
                    className="w-full bg-[#1d1138] border border-[#2a244d] rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-indigo-400 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-purple-300 mb-1 font-medium">Segno Zodiacale</label>
                  <select
                    value={formData.zodiac}
                    onChange={(e) => setFormData({ ...formData, zodiac: e.target.value })}
                    className="w-full bg-[#1d1138] border border-[#2a244d] rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-indigo-400 text-xs"
                  >
                    {zodiacOptions.map((z) => (
                      <option key={z} value={z}>{z}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-purple-300 mb-1 font-medium">Data di Nascita (opzionale)</label>
                  <input
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                    className="w-full bg-[#1d1138] border border-[#2a244d] rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-indigo-400 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-purple-300 mb-1 font-medium">Categoria</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as Contact['category'] })}
                    className="w-full bg-[#1d1138] border border-[#2a244d] rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-indigo-400 text-xs"
                  >
                    <option value="Cliente Abituale">Cliente Abituale</option>
                    <option value="Nuovo Contatto">Nuovo Contatto</option>
                    <option value="Collaboratore">Collaboratore</option>
                    <option value="Altro">Altro</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-purple-300 mb-1 font-medium">Email (opzionale)</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Es. marta@email.it"
                  className="w-full bg-[#1d1138] border border-[#2a244d] rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-indigo-400 text-xs"
                />
              </div>

              <div>
                <label className="block text-purple-300 mb-1 font-medium">Note Private & Storico</label>
                <textarea
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Sensibilità della persona, mazzi preferiti, quesiti affrontati nei consulti passati..."
                  className="w-full bg-[#1d1138] border border-[#2a244d] rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-indigo-400 text-xs"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-bold uppercase tracking-wider rounded-xl transition shadow-lg shadow-indigo-500/20 text-xs active:scale-95 cursor-pointer"
              >
                {editingContact ? 'Salva Modifiche' : 'Salva in Rubrica'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
