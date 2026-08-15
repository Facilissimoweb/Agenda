import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Appointment, 
  Contact, 
  CycleData, 
  DayMenu, 
  JournalNote, 
  TabId, 
  WeeklyMenu 
} from './types';
import { 
  INITIAL_APPOINTMENTS, 
  INITIAL_CONTACTS, 
  INITIAL_CYCLE_DATA, 
  INITIAL_JOURNAL_NOTES, 
  INITIAL_WEEKLY_MENU 
} from './data/initialData';
import { StarfieldCanvas } from './components/StarfieldCanvas';
import { Header } from './components/Header';
import { MobileNav } from './components/MobileNav';
import { Toast, ToastState } from './components/Toast';
import { HomeView } from './components/views/HomeView';
import { AgendaView } from './components/views/AgendaView';
import { CicloView } from './components/views/CicloView';
import { MenuView } from './components/views/MenuView';
import { RubricaView } from './components/views/RubricaView';
import { DiarioView } from './components/views/DiarioView';
import { StrumentiView } from './components/views/StrumentiView';
import { ChatView } from './components/views/ChatView';
import { SupabaseAuthModal } from './components/modals/SupabaseAuthModal';
import { PrivacyGate } from './components/PrivacyGate';
import { 
  getSupabaseConfig, 
  testSupabaseConnection, 
  downloadAllCloudData,
  uploadAppointmentsToCloud,
  uploadContactsToCloud,
  uploadCycleDataToCloud,
  uploadWeeklyMenuToCloud,
  uploadJournalNotesToCloud,
  subscribeToAuthStateChange
} from './services/supabaseClient';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  // Privacy Lock Gate State (Default password: ficoinfiore)
  const [isUnlocked, setIsUnlocked] = useState<boolean>(() => {
    return (
      localStorage.getItem('mt_sanctuary_unlocked') === 'true' ||
      sessionStorage.getItem('mt_sanctuary_unlocked') === 'true'
    );
  });

  // State Initialization with LocalStorage Persistence
  const [activeTab, setActiveTab] = useState<TabId>(() => {
    return (localStorage.getItem('mt_active_tab') as TabId) || 'home';
  });

  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    try {
      const saved = localStorage.getItem('mt_appointments');
      return saved ? JSON.parse(saved) : INITIAL_APPOINTMENTS;
    } catch {
      return INITIAL_APPOINTMENTS;
    }
  });

  const [contacts, setContacts] = useState<Contact[]>(() => {
    try {
      const saved = localStorage.getItem('mt_contacts');
      return saved ? JSON.parse(saved) : INITIAL_CONTACTS;
    } catch {
      return INITIAL_CONTACTS;
    }
  });

  const [cycleData, setCycleData] = useState<CycleData>(() => {
    try {
      const saved = localStorage.getItem('mt_cycle');
      return saved ? JSON.parse(saved) : INITIAL_CYCLE_DATA;
    } catch {
      return INITIAL_CYCLE_DATA;
    }
  });

  const [weeklyMenu, setWeeklyMenu] = useState<WeeklyMenu>(() => {
    try {
      const saved = localStorage.getItem('mt_menu');
      return saved ? JSON.parse(saved) : INITIAL_WEEKLY_MENU;
    } catch {
      return INITIAL_WEEKLY_MENU;
    }
  });

  const [journalNotes, setJournalNotes] = useState<JournalNote[]>(() => {
    try {
      const saved = localStorage.getItem('mt_notes');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
      return INITIAL_JOURNAL_NOTES;
    } catch {
      return INITIAL_JOURNAL_NOTES;
    }
  });

  const [pendingChatPrompt, setPendingChatPrompt] = useState<string | null>(null);

  const [toast, setToast] = useState<ToastState>({
    show: false,
    message: '',
  });

  // Cloud state
  const [isCloudConnected, setIsCloudConnected] = useState<boolean>(false);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const initialLoadDone = useRef<boolean>(false);

  // Check Supabase on Mount & Download Data
  useEffect(() => {
    const initCloud = async () => {
      const config = getSupabaseConfig();
      if (config.url && config.anonKey) {
        const testRes = await testSupabaseConnection();
        setIsCloudConnected(testRes.success);
        if (testRes.success) {
          // Download initial cloud data
          const cloudRes = await downloadAllCloudData();
          if (cloudRes.success && cloudRes.data) {
            if (cloudRes.data.appointments && cloudRes.data.appointments.length > 0) {
              setAppointments(cloudRes.data.appointments);
            }
            if (cloudRes.data.contacts && cloudRes.data.contacts.length > 0) {
              setContacts(cloudRes.data.contacts);
            }
            if (cloudRes.data.cycleData) {
              setCycleData(cloudRes.data.cycleData);
            }
            if (cloudRes.data.weeklyMenu && Object.keys(cloudRes.data.weeklyMenu).length > 0) {
              setWeeklyMenu(cloudRes.data.weeklyMenu);
            }
            if (cloudRes.data.journalNotes && cloudRes.data.journalNotes.length > 0) {
              setJournalNotes(cloudRes.data.journalNotes);
            }
          }
        }
      }
      initialLoadDone.current = true;
    };
    initCloud();

    // Listen to Auth State changes (e.g. Magic Link / OTP / Password login)
    const sub = subscribeToAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setIsCloudConnected(true);
        showToast(`✨ Bentornata ${session.user.email}! Dati sincronizzati.`);
        const cloudRes = await downloadAllCloudData();
        if (cloudRes.success && cloudRes.data) {
          if (cloudRes.data.appointments && cloudRes.data.appointments.length > 0) {
            setAppointments(cloudRes.data.appointments);
          }
          if (cloudRes.data.contacts && cloudRes.data.contacts.length > 0) {
            setContacts(cloudRes.data.contacts);
          }
          if (cloudRes.data.cycleData) {
            setCycleData(cloudRes.data.cycleData);
          }
          if (cloudRes.data.weeklyMenu && Object.keys(cloudRes.data.weeklyMenu).length > 0) {
            setWeeklyMenu(cloudRes.data.weeklyMenu);
          }
          if (cloudRes.data.journalNotes && cloudRes.data.journalNotes.length > 0) {
            setJournalNotes(cloudRes.data.journalNotes);
          }
        }
      }
    });

    return () => {
      sub?.unsubscribe?.();
    };
  }, []);

  // Sync to LocalStorage & Supabase
  useEffect(() => {
    localStorage.setItem('mt_active_tab', activeTab);
  }, [activeTab]);

  useEffect(() => {
    localStorage.setItem('mt_appointments', JSON.stringify(appointments));
    if (initialLoadDone.current && isCloudConnected) {
      uploadAppointmentsToCloud(appointments);
    }
  }, [appointments, isCloudConnected]);

  useEffect(() => {
    localStorage.setItem('mt_contacts', JSON.stringify(contacts));
    if (initialLoadDone.current && isCloudConnected) {
      uploadContactsToCloud(contacts);
    }
  }, [contacts, isCloudConnected]);

  useEffect(() => {
    localStorage.setItem('mt_cycle', JSON.stringify(cycleData));
    if (initialLoadDone.current && isCloudConnected) {
      uploadCycleDataToCloud(cycleData);
    }
  }, [cycleData, isCloudConnected]);

  useEffect(() => {
    localStorage.setItem('mt_menu', JSON.stringify(weeklyMenu));
    if (initialLoadDone.current && isCloudConnected) {
      uploadWeeklyMenuToCloud(weeklyMenu);
    }
  }, [weeklyMenu, isCloudConnected]);

  useEffect(() => {
    localStorage.setItem('mt_notes', JSON.stringify(journalNotes));
    if (initialLoadDone.current && isCloudConnected) {
      uploadJournalNotesToCloud(journalNotes);
    }
  }, [journalNotes, isCloudConnected]);

  // Toast Helper
  const showToast = (message: string) => {
    setToast({ show: true, message });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 3800);
  };

  // Manual Full Sync (Bi-directional)
  const handleFullSync = useCallback(async () => {
    setIsSyncing(true);
    try {
      const config = getSupabaseConfig();
      if (!config.url || !config.anonKey) {
        showToast('⚠️ Inserisci prima URL e Anon Key di Supabase.');
        setIsSyncing(false);
        return;
      }

      const testRes = await testSupabaseConnection();
      if (!testRes.success) {
        setIsCloudConnected(false);
        showToast(`⚠️ Connessione fallita: ${testRes.message}`);
        setIsSyncing(false);
        return;
      }

      setIsCloudConnected(true);

      // 1. Upload local data to Supabase
      await Promise.all([
        uploadAppointmentsToCloud(appointments),
        uploadContactsToCloud(contacts),
        uploadCycleDataToCloud(cycleData),
        uploadWeeklyMenuToCloud(weeklyMenu),
        uploadJournalNotesToCloud(journalNotes),
      ]);

      // 2. Fetch fresh snapshot from Supabase
      const cloudRes = await downloadAllCloudData();
      if (cloudRes.success && cloudRes.data) {
        if (cloudRes.data.appointments && cloudRes.data.appointments.length > 0) {
          setAppointments(cloudRes.data.appointments);
        }
        if (cloudRes.data.contacts && cloudRes.data.contacts.length > 0) {
          setContacts(cloudRes.data.contacts);
        }
        if (cloudRes.data.cycleData) {
          setCycleData(cloudRes.data.cycleData);
        }
        if (cloudRes.data.weeklyMenu && Object.keys(cloudRes.data.weeklyMenu).length > 0) {
          setWeeklyMenu(cloudRes.data.weeklyMenu);
        }
        if (cloudRes.data.journalNotes && cloudRes.data.journalNotes.length > 0) {
          setJournalNotes(cloudRes.data.journalNotes);
        }
      }

      showToast('☁️ Tutti i dati sono stati sincronizzati con Supabase!');
    } catch (err: any) {
      showToast(`Errore sincronizzazione: ${err.message}`);
    } finally {
      setIsSyncing(false);
    }
  }, [appointments, contacts, cycleData, weeklyMenu, journalNotes]);

  // Tab Switch Handler
  const handleSelectTab = (tab: TabId) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Appointment Actions
  const handleAddAppointment = (newAppt: Omit<Appointment, 'id'>) => {
    const appt: Appointment = {
      ...newAppt,
      id: `appt-${Date.now()}`,
    };
    setAppointments((prev) => [appt, ...prev]);
  };

  const handleUpdateAppointment = (id: string | number, updated: Partial<Appointment>) => {
    setAppointments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...updated } : a))
    );
  };

  const handleDeleteAppointment = (id: string | number) => {
    setAppointments((prev) => prev.filter((a) => a.id !== id));
  };

  // Contact Actions
  const handleAddContact = (newContact: Omit<Contact, 'id'>) => {
    const contact: Contact = {
      ...newContact,
      id: `c-${Date.now()}`,
    };
    setContacts((prev) => [contact, ...prev]);
  };

  const handleUpdateContact = (id: string | number, updated: Partial<Contact>) => {
    setContacts((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updated } : c))
    );
  };

  const handleDeleteContact = (id: string | number) => {
    setContacts((prev) => prev.filter((c) => c.id !== id));
  };

  // Menu Actions
  const handleUpdateMenuDay = (day: string, dayMenu: DayMenu) => {
    setWeeklyMenu((prev) => ({
      ...prev,
      [day]: dayMenu,
    }));
  };

  // Note Actions
  const handleAddNote = (newNote: Omit<JournalNote, 'id'>) => {
    const note: JournalNote = {
      ...newNote,
      id: `note-${Date.now()}`,
    };
    setJournalNotes((prev) => [note, ...prev]);
  };

  const handleUpdateNote = (id: string | number, updated: Partial<JournalNote>) => {
    setJournalNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, ...updated } : n))
    );
  };

  const handleDeleteNote = (id: string | number) => {
    setJournalNotes((prev) => prev.filter((n) => n.id !== id));
  };

  // Send Journal Note to Oracle Chat
  const handleSendJournalNoteToChat = (note: JournalNote) => {
    const prompt = `[Riflessione dal mio Diario - "${note.title}" (${note.category})]\n${note.content}\n\nCara Guida Oracolare, cosa mi suggerisci e quali chiavi simboliche o rituali mi consigli su questa mia riflessione? ✨`;
    setPendingChatPrompt(prompt);
    setActiveTab('chat');
    showToast('🔮 Nota del diario trasferita alla Chat dell\'Oracolo!');
  };

  // Sanctuary Lock & Unlock Handlers
  const handleUnlock = () => {
    setIsUnlocked(true);
    showToast('✨ Benvenuta nel tuo Santuario Privato!');
  };

  const handleLock = () => {
    localStorage.removeItem('mt_sanctuary_unlocked');
    sessionStorage.removeItem('mt_sanctuary_unlocked');
    setIsUnlocked(false);
    showToast('🔒 Santuario bloccato ed oscurato.');
  };

  return (
    <div className="relative min-h-screen bg-[#0a0915] text-slate-100 pb-28 lg:pb-12 selection:bg-purple-900 selection:text-amber-200">
      {/* Privacy Gate: Obscures everything until password 'ficoinfiore' is entered */}
      {!isUnlocked && (
        <PrivacyGate onUnlock={handleUnlock} />
      )}

      {/* Background Starfield Canvas */}
      <StarfieldCanvas />

      {/* Ambient Celestial Glow Orbs */}
      <div className="fixed top-10 left-1/2 -translate-x-1/2 w-96 h-96 bg-purple-900/20 rounded-full animate-subtle-glow pointer-events-none z-0" />
      <div 
        className="fixed bottom-20 right-10 w-80 h-80 bg-amber-600/10 rounded-full animate-subtle-glow pointer-events-none z-0" 
        style={{ animationDelay: '4s' }} 
      />

      {/* Main App Container */}
      <div className="relative z-10 flex flex-col min-h-screen max-w-6xl mx-auto px-3 sm:px-6">
        {/* Top Header */}
        <Header
          activeTab={activeTab}
          onSelectTab={handleSelectTab}
          onOpenNewAppointment={() => {
            setActiveTab('agenda');
          }}
          appointmentsCount={appointments.length}
          isCloudConnected={isCloudConnected}
          onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
          onLockSanctuary={handleLock}
        />

        {/* Dynamic Views with Fade & Slide Animation */}
        <main className="flex-grow py-5 sm:py-7">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
            >
              {activeTab === 'home' && (
                <HomeView
                  appointments={appointments}
                  cycleData={cycleData}
                  onNavigateTab={handleSelectTab}
                  onOpenNewAppointment={() => setActiveTab('agenda')}
                  onShowToast={showToast}
                />
              )}

              {activeTab === 'agenda' && (
                <AgendaView
                  appointments={appointments}
                  onAddAppointment={handleAddAppointment}
                  onUpdateAppointment={handleUpdateAppointment}
                  onDeleteAppointment={handleDeleteAppointment}
                  onShowToast={showToast}
                />
              )}

              {activeTab === 'ciclo' && (
                <CicloView
                  cycleData={cycleData}
                  onUpdateCycleData={setCycleData}
                  onShowToast={showToast}
                />
              )}

              {activeTab === 'menu' && (
                <MenuView
                  weeklyMenu={weeklyMenu}
                  onUpdateMenuDay={handleUpdateMenuDay}
                  onShowToast={showToast}
                />
              )}

              {activeTab === 'rubrica' && (
                <RubricaView
                  contacts={contacts}
                  onAddContact={handleAddContact}
                  onUpdateContact={handleUpdateContact}
                  onDeleteContact={handleDeleteContact}
                  onShowToast={showToast}
                />
              )}

              {activeTab === 'diario' && (
                <DiarioView
                  notes={journalNotes}
                  onAddNote={handleAddNote}
                  onUpdateNote={handleUpdateNote}
                  onDeleteNote={handleDeleteNote}
                  onSendToChat={handleSendJournalNoteToChat}
                  onShowToast={showToast}
                />
              )}

              {activeTab === 'strumenti' && (
                <StrumentiView
                  contacts={contacts}
                  onSendToChat={(prompt) => {
                    setPendingChatPrompt(prompt);
                    setActiveTab('chat');
                    showToast('🔮 Tema Natale & Dati Astrologici trasferiti alla Chat dell\'Oracolo!');
                  }}
                  onSaveToJournal={handleAddNote}
                  onShowToast={showToast}
                />
              )}

              {activeTab === 'chat' && (
                <ChatView
                  appointments={appointments}
                  cycleData={cycleData}
                  pendingPrompt={pendingChatPrompt}
                  onClearPendingPrompt={() => setPendingChatPrompt(null)}
                  onShowToast={showToast}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Footer */}
        <footer className={`mt-8 py-6 border-t border-[#2a244d]/60 text-center text-xs text-purple-300/70 space-y-1.5 ${activeTab === 'chat' ? 'hidden sm:block' : 'block'}`}>
          <p className="font-cinzel gold-gradient-text font-bold tracking-wider">
            MARIA TERESA • AGENDA & SANTUARIO PRIVATO
          </p>
          <p className="text-[11px] text-purple-400/60 font-light">
            Spazio protetto per consulti, ritmo lunare, alimentazione alchemica e diario segreto.
          </p>
        </footer>
      </div>

      {/* Mobile-First Bottom Navigation Dock */}
      <MobileNav
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        appointmentsCount={appointments.length}
      />

      {/* Supabase Cloud & Auth Modal */}
      <SupabaseAuthModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
        onShowToast={showToast}
        onSyncAll={handleFullSync}
        isSyncing={isSyncing}
      />

      {/* Toast Notification Alert */}
      <Toast toast={toast} onClose={() => setToast((prev) => ({ ...prev, show: false }))} />
    </div>
  );
}
