export type TabId = 'home' | 'agenda' | 'ciclo' | 'menu' | 'rubrica' | 'diario' | 'strumenti' | 'chat';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: string;
  category?: 'tarocchi' | 'astrologia' | 'rituale' | 'sogno' | 'consulenza' | 'generale';
}

export interface GroqSettings {
  apiKey: string;
  model: string;
  temperature: number;
  autoSpeakResponse: boolean;
}

export type AppointmentStatus = 'Confermato' | 'In attesa' | 'Rituale' | 'Completato';

export type AppointmentType = 
  | 'Lettura Tarocchi'
  | 'Tema Natale & Transiti'
  | 'Pulizia Energetica & Aura'
  | 'Rituale Privato'
  | 'Consulenza Cristalloterapia'
  | 'Personale / Altro';

export interface Appointment {
  id: string | number;
  name: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  type: AppointmentType;
  phone?: string;
  notes?: string;
  status: AppointmentStatus;
}

export interface Contact {
  id: string | number;
  name: string;
  phone: string;
  email?: string;
  zodiac?: string;
  notes?: string;
  birthDate?: string;
  category?: 'Cliente Abituale' | 'Nuovo Contatto' | 'Collaboratore' | 'Altro';
}

export interface CycleEntry {
  id: string | number;
  date: string;
  day: number;
  energy: 'Alta / Espansiva 🌟' | 'In bilico / Fluttuante ⚖️' | 'Bassa / Introspettiva 🌙' | 'Rigenerativa / Riposo 🕯️';
  symptoms: string;
  notes: string;
}

export interface CycleData {
  startDate: string; // YYYY-MM-DD
  avgLength: number; // usually 28
  history: CycleEntry[];
}

export interface DayMenu {
  breakfast: string;
  lunch: string;
  dinner: string;
  tea: string;
}

export type WeeklyMenu = Record<string, DayMenu>;

export type JournalCategory = 'Tarocchi' | 'Astrologia' | 'Rituali' | 'Sogni' | 'Personale';

export interface JournalNote {
  id: string | number;
  title: string;
  category: JournalCategory;
  date: string;
  icon: string;
  content: string;
  pinned?: boolean;
}

export interface TarotCard {
  id: number;
  name: string;
  arcana: string;
  icon: string;
  keyword: string;
  uprightMeaning: string;
  element: string;
  guidance: string;
  affirmation: string;
}

export interface CrystalHerb {
  id: number;
  name: string;
  type: 'Cristallo' | 'Erba Sacra' | 'Resina / Incenso' | 'Olio Essenziale';
  icon: string;
  element: 'Terra' | 'Aria' | 'Fuoco' | 'Acqua' | 'Spirito';
  chakra?: string;
  desc: string;
  ritualUse: string;
}

export interface MoonPhaseInfo {
  phaseName: string;
  icon: string;
  sign: string;
  illumination: number;
  advice: string;
  element: string;
  recommendedHerb: string;
  suggestedAction: string;
}
