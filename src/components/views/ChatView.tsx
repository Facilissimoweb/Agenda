import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage, Appointment, CycleData, SacredBook } from '../../types';
import { 
  sendGroqChatMessage, 
  getStoredGroqApiKey, 
  saveStoredGroqApiKey, 
  getStoredGroqModel, 
  saveStoredGroqModel,
  getApiKeyDetails,
  sanitizeApiKey,
  GROQ_MODELS 
} from '../../services/groqService';
import { 
  speakItalianText, 
  stopSpeaking, 
  isCurrentlySpeaking, 
  isSpeechRecognitionSupported, 
  isSpeechSynthesisSupported 
} from '../../utils/speech';
import { 
  getStoredGrimoires, 
  saveStoredGrimoires, 
  saveCustomGrimoire,
  toggleGrimoireEnabled, 
  buildGrimoireContextForQuery 
} from '../../services/grimoireService';
import { GrimoireModal } from '../modals/GrimoireModal';
import { 
  Mic, 
  MicOff, 
  Send, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Key, 
  Settings, 
  Trash2, 
  Copy, 
  Check, 
  Loader2, 
  ShieldCheck, 
  X,
  ExternalLink,
  RefreshCw,
  Radio,
  Info,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  BookMarked,
  Book,
  ChevronDown,
  ChevronUp,
  Paperclip,
  FileText,
  UploadCloud,
  Eye,
  FileCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ChatViewProps {
  appointments: Appointment[];
  cycleData: CycleData;
  onShowToast: (msg: string) => void;
  pendingPrompt?: string | null;
  onClearPendingPrompt?: () => void;
  onOpenGoogleDrive?: () => void;
}

const INITIAL_GREETING: ChatMessage = {
  id: 'msg-welcome',
  sender: 'assistant',
  text: `Salute a te, Maria Teresa. ✨ Sono la tua **Guida Esoterica & Oracolo Alchemico**, alimentata dal motore AI di Groq (Llama 3.3) e connessa ai tuoi **Grimori & Manuali Sacri**.\n\nPuoi parlarmi digitando un messaggio, **premendo il microfono 🎙️**, oppure chiedendomi di consultare un testo specifico (es. *"Secondo il Manuale Tarocchi..."*, *"Guarda nell'Erbario..."*).\n\n*Come posso illuminare il tuo cammino, i tuoi rituali o i tuoi consulti oggi?*`,
  timestamp: new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }),
  category: 'generale',
  sourcesUsed: ['🃏 Manuale Tarocchi', '🌌 Trattato Astrologia', '🌿 Erbario Sacro'],
};

const SUGGESTED_QUESTIONS = [
  { text: '📖 Spiegami il Bagatto secondo il Manuale dei Tarocchi', category: 'tarocchi' },
  { text: '🌌 Analizza un Tema Natale e i transiti attuali', category: 'astrologia' },
  { text: '🌿 Quali erbe e cristalli usare per purificare lo spazio?', category: 'rituale' },
  { text: '📅 Cosa ho in programma oggi in agenda?', category: 'consulenza' },
  { text: '🕯️ Rituale consigliato per la fase lunare odierna', category: 'rituale' },
  { text: '🔮 Chi vedo domani per consulti in agenda?', category: 'consulenza' },
  { text: '🌙 Influssi metabolici della Luna di oggi', category: 'astrologia' },
];

export const ChatView: React.FC<ChatViewProps> = ({ 
  appointments, 
  cycleData, 
  onShowToast,
  pendingPrompt,
  onClearPendingPrompt,
  onOpenGoogleDrive,
}) => {
  // Chat messages state with persistence
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem('mt_chat_messages');
      return saved ? JSON.parse(saved) : [INITIAL_GREETING];
    } catch {
      return [INITIAL_GREETING];
    }
  });

  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [speechTranscript, setSpeechTranscript] = useState('');
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);

  // Books / Grimoires State
  const [books, setBooks] = useState<SacredBook[]>(() => getStoredGrimoires());
  const [isGrimoireModalOpen, setIsGrimoireModalOpen] = useState(false);
  const [showCompactStatus, setShowCompactStatus] = useState(false);

  // Settings & Modal State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState(() => getStoredGroqApiKey());
  const [selectedModel, setSelectedModel] = useState(() => getStoredGroqModel());
  const [includeSanctuaryContext, setIncludeSanctuaryContext] = useState(true);
  const [autoReadResponse, setAutoReadResponse] = useState(false);
  const [keyTestStatus, setKeyTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [keyTestFeedback, setKeyTestFeedback] = useState<string>('');

  // Key details info
  const [keyDetails, setKeyDetails] = useState(() => getApiKeyDetails());

  // Quick inline key input banner state
  const [quickKeyInput, setQuickKeyInput] = useState('');

  // Attached Text File State (.txt, .md, .json, .csv, etc.)
  const [attachedFile, setAttachedFile] = useState<{
    name: string;
    content: string;
    sizeFormatted: string;
    wordCount: number;
  } | null>(null);
  const [showFilePreview, setShowFilePreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Speech Recognition instance ref
  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Handle incoming pending prompt
  useEffect(() => {
    if (pendingPrompt && pendingPrompt.trim()) {
      setInputMessage(pendingPrompt);
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          textareaRef.current.scrollIntoView({ behavior: 'smooth' });
        }
      }, 150);
      if (onClearPendingPrompt) {
        onClearPendingPrompt();
      }
    }
  }, [pendingPrompt, onClearPendingPrompt]);

  // Refresh key details on mount or changes
  const refreshKeyDetails = () => {
    setKeyDetails(getApiKeyDetails());
  };

  useEffect(() => {
    refreshKeyDetails();
  }, [isSettingsOpen]);

  // Save messages to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('mt_chat_messages', JSON.stringify(messages));
    } catch (e) {}
  }, [messages]);

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, isRecording]);

  // Cleanup speech on unmount
  useEffect(() => {
    return () => {
      stopSpeaking();
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
    };
  }, []);

  // Initialize Speech Recognition
  const toggleSpeechRecognition = () => {
    if (isRecording) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
      setIsRecording(false);
      return;
    }

    if (!isSpeechRecognitionSupported()) {
      onShowToast('Riconoscimento vocale non supportato in questo browser.');
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'it-IT';
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onstart = () => {
      setIsRecording(true);
      setSpeechTranscript('');
      onShowToast('🎙️ Microfono attivo... parla pure!');
    };

    recognition.onresult = (event: any) => {
      let currentTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        currentTranscript += event.results[i][0].transcript;
      }
      setSpeechTranscript(currentTranscript);
    };

    recognition.onerror = (event: any) => {
      setIsRecording(false);
      if (event.error !== 'no-speech') {
        onShowToast(`Errore microfono: ${event.error}`);
      }
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
    } catch (err) {
      setIsRecording(false);
    }
  };

  // Apply voice transcript to input
  const handleApplyVoiceTranscript = (autoSend: boolean = false) => {
    if (!speechTranscript.trim()) return;
    const textToSend = speechTranscript.trim();
    setInputMessage(textToSend);
    setSpeechTranscript('');
    setIsRecording(false);

    if (autoSend) {
      setTimeout(() => {
        handleSendMessage(textToSend);
      }, 100);
    } else {
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
    }
  };

  // Handle Local File Upload (.txt, .md, .json, etc.)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processLocalTextFile(file);
    e.target.value = '';
  };

  const processLocalTextFile = (file: File) => {
    const isText = 
      file.type.startsWith('text/') || 
      file.name.endsWith('.txt') || 
      file.name.endsWith('.md') || 
      file.name.endsWith('.json') || 
      file.name.endsWith('.csv') ||
      file.name.endsWith('.log');

    if (!isText && !file.type.includes('text')) {
      onShowToast(`Formato non supportato. Seleziona un file di testo (.txt, .md, .json).`);
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (typeof text === 'string') {
        const words = text.trim() ? text.trim().split(/\s+/).length : 0;
        const sizeFormatted = file.size > 1024 * 1024 
          ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
          : `${Math.round(file.size / 1024)} KB`;

        setAttachedFile({
          name: file.name,
          content: text,
          sizeFormatted,
          wordCount: words,
        });

        onShowToast(`📄 File "${file.name}" allegato (${words.toLocaleString('it-IT')} parole)!`);
        try {
          confetti({ particleCount: 15, spread: 40, origin: { y: 0.8 }, colors: ['#d4af37', '#a855f7'] });
        } catch (e) {}
      }
    };
    reader.onerror = () => {
      onShowToast('Errore durante la lettura del file dal dispositivo.');
    };
    reader.readAsText(file);
  };

  const handleAddAttachedToGrimoires = () => {
    if (!attachedFile) return;
    const cleanTitle = attachedFile.name.replace(/\.[^/.]+$/, '');
    const { books: updated, savedBook } = saveCustomGrimoire({
      title: cleanTitle,
      author: 'Maria Teresa',
      category: 'personale',
      coverEmoji: '📜',
      description: `Testo caricato dal dispositivo: ${attachedFile.name} (${attachedFile.wordCount} parole).`,
      tags: ['manuale', 'documento', cleanTitle.toLowerCase()],
      isEnabled: true,
      sections: [
        {
          id: `sec-${Date.now()}`,
          title: 'Contenuto Integrale',
          chapterNumber: 'Capitolo 1',
          content: attachedFile.content,
        },
      ],
      fullText: attachedFile.content,
    });

    setBooks(updated);
    onShowToast(`✨ "${savedBook.title}" salvato nella Biblioteca Sacra & attivo per l'Oracolo!`);
    try {
      confetti({ particleCount: 25, spread: 50, origin: { y: 0.7 }, colors: ['#d4af37', '#10b981'] });
    } catch (e) {}
  };

  const handleQuickAnalyzeFile = (mode: 'completa' | 'simboli' | 'rituali') => {
    if (!attachedFile) return;
    let query = '';
    if (mode === 'completa') {
      query = `Analizza in dettaglio il documento allegato "${attachedFile.name}": sintetizza i punti chiave, la saggezza esoterica e i messaggi evolutivi per me. ✨`;
    } else if (mode === 'simboli') {
      query = `Esamina il documento allegato "${attachedFile.name}" e decodifica tutti i simboli, gli archetipi dei Tarocchi, le corrispondenze astrologiche e gli elementi alchemici presenti. 🌌`;
    } else {
      query = `Ispirandoti al testo allegato "${attachedFile.name}", suggeriscimi un rituale sacro, una formula d'intenzione o pratiche di purificazione ed erbe adatte. 🕯️`;
    }
    handleSendMessage(query);
  };

  // Send Message Handler
  const handleSendMessage = async (customText?: string) => {
    const text = (customText || inputMessage).trim();
    if (!text || isLoading) return;

    // Stop ongoing audio
    stopSpeaking();
    setSpeakingMessageId(null);

    const userMsg: ChatMessage = {
      id: `msg-user-${Date.now()}`,
      sender: 'user',
      text: text,
      timestamp: new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setSpeechTranscript('');
    setIsLoading(true);

    // Prepare message history for API
    const history = [...messages, userMsg].map((m) => ({
      role: (m.sender === 'user' ? 'user' : m.sender === 'assistant' ? 'assistant' : 'system') as 'user' | 'assistant' | 'system',
      content: m.text,
    }));

    // Extra sanctuary context with full real calendar & agenda details
    const now = new Date();
    const todayIso = now.toISOString().split('T')[0];
    const fullDateFormatted = now.toLocaleDateString('it-IT', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    const timeFormatted = now.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });

    let cycleArchetype = "L'Incantatrice (Fase Luteale Creativa)";
    let cycleDayNumber = 14;
    if (cycleData?.startDate) {
      const start = new Date(cycleData.startDate);
      const diffDays = Math.max(1, Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);
      const cycleLength = cycleData.avgLength || 28;
      const currentDay = ((diffDays - 1) % cycleLength) + 1;
      cycleDayNumber = currentDay;
      if (currentDay <= 5) cycleArchetype = "La Strega / Saggia (Mestruazione - Reset & Intuizione)";
      else if (currentDay <= 12) cycleArchetype = "La Vergine (Fase Follicolare - Rinascita & Vitalità)";
      else if (currentDay <= 17) cycleArchetype = "La Madre (Ovulazione - Massima Espansione & Magnetismo)";
      else cycleArchetype = "L'Incantatrice (Fase Luteale - Creatività & Discernimento)";
    }

    // Build RAG / Knowledge Base Context from Active Grimoires
    const { contextText: grimoiresText, sourcesUsed } = buildGrimoireContextForQuery(text, books);

    // If a text file is attached directly to the chat, inject it into the prompt context
    let attachedFileContext = '';
    if (attachedFile) {
      attachedFileContext = `\n\n========================================\nDOCUMENTO ALLEGATO DA MARIA TERESA (File: "${attachedFile.name}"):\n${attachedFile.content.slice(0, 35000)}\n========================================\n`;
    }

    const effectiveSources = attachedFile 
      ? [`📄 ${attachedFile.name}`, ...sourcesUsed]
      : sourcesUsed;

    const extraContext = includeSanctuaryContext
      ? {
          currentDateIso: todayIso,
          currentDateFormatted: fullDateFormatted,
          currentTime: timeFormatted,
          cycleArchetype,
          cycleDay: cycleDayNumber,
          todayTarot: "L'Imperatrice (III) • Creatività & Fertilità",
          appointments: appointments,
          appointmentsCount: appointments.length,
          activeGrimoiresText: (grimoiresText || '') + attachedFileContext,
          sourcesUsed: effectiveSources,
          userQuery: text,
        }
      : undefined;

    try {
      const response = await sendGroqChatMessage(history, {
        model: selectedModel,
        extraContext,
      });

      const assistantMsg: ChatMessage = {
        id: `msg-bot-${Date.now()}`,
        sender: 'assistant',
        text: response.text,
        timestamp: new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }),
        sourcesUsed: sourcesUsed.length > 0 ? sourcesUsed : undefined,
      };

      setMessages((prev) => [...prev, assistantMsg]);

      // Auto read response if enabled
      if (autoReadResponse && isSpeechSynthesisSupported()) {
        handleSpeakMessage(assistantMsg.id, response.text);
      }

      if (response.isFallback) {
        onShowToast('Risposta oracolare generata.');
      }
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `msg-err-${Date.now()}`,
        sender: 'assistant',
        text: `🕊️ Si è verificato un inconveniente: ${err.message || 'Errore imprevisto'}. Riprova tra un istante.`,
        timestamp: new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // Text to Speech Handler
  const handleSpeakMessage = (msgId: string, text: string) => {
    if (speakingMessageId === msgId && isCurrentlySpeaking()) {
      stopSpeaking();
      setSpeakingMessageId(null);
      return;
    }

    setSpeakingMessageId(msgId);
    speakItalianText(text, {
      rate: 0.95,
      pitch: 1.0,
      onEnd: () => {
        setSpeakingMessageId(null);
      },
      onError: () => {
        setSpeakingMessageId(null);
        onShowToast('Impossibile riprodurre la voce.');
      },
    });
  };

  // Copy Message to Clipboard
  const handleCopyMessage = (msgId: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMsgId(msgId);
    onShowToast('Messaggio copiato negli appunti!');
    setTimeout(() => {
      setCopiedMsgId(null);
    }, 2000);
  };

  // Clear Chat History
  const handleClearHistory = () => {
    stopSpeaking();
    setSpeakingMessageId(null);
    setMessages([INITIAL_GREETING]);
    localStorage.removeItem('mt_chat_messages');
    onShowToast('Cronologia della chat cancellata.');
  };

  // Save Settings Modal
  const handleSaveSettings = () => {
    const cleaned = sanitizeApiKey(apiKeyInput);
    saveStoredGroqApiKey(cleaned);
    saveStoredGroqModel(selectedModel);
    refreshKeyDetails();
    setIsSettingsOpen(false);
    onShowToast('Impostazioni e Chiave Groq AI salvate con successo!');
  };

  // Quick save from inline banner
  const handleQuickSaveKey = () => {
    const cleaned = sanitizeApiKey(quickKeyInput);
    if (!cleaned) {
      onShowToast('Incolla una chiave API valida (es. gsk_...).');
      return;
    }
    saveStoredGroqApiKey(cleaned);
    setApiKeyInput(cleaned);
    setQuickKeyInput('');
    refreshKeyDetails();
    onShowToast('✅ Chiave Groq salvata nel browser!');
    try {
      confetti({
        particleCount: 20,
        spread: 40,
        origin: { y: 0.7 },
        colors: ['#d4af37', '#10b981', '#a855f7'],
      });
    } catch (e) {}
  };

  // Test Groq API Key
  const handleTestApiKey = async () => {
    const keyToTest = sanitizeApiKey(apiKeyInput) || keyDetails.key;
    if (!keyToTest) {
      onShowToast('Inserisci una chiave API Groq da testare.');
      return;
    }

    setKeyTestStatus('testing');
    setKeyTestFeedback('Connessione ai server Groq in corso...');

    try {
      const res = await sendGroqChatMessage(
        [{ role: 'user', content: 'Rispondi solo con: Oracolo Groq Attivo ✨' }],
        {
          apiKey: keyToTest,
          model: selectedModel,
        }
      );

      if (res.success && !res.isFallback) {
        setKeyTestStatus('success');
        setKeyTestFeedback(`✅ Connessione riuscita a ${res.engine || 'Groq'}!`);
        onShowToast('✅ Connessione a Groq riuscita con successo!');
        try {
          confetti({
            particleCount: 25,
            spread: 50,
            origin: { y: 0.7 },
            colors: ['#d4af37', '#10b981', '#a855f7'],
          });
        } catch (e) {}
      } else {
        setKeyTestStatus('error');
        setKeyTestFeedback(`❌ ${res.errorMsg || 'Chiave non autorizzata (401)'}`);
        onShowToast(`❌ Test non riuscito: ${res.errorMsg || 'Chiave non valida'}`);
      }
    } catch (e: any) {
      setKeyTestStatus('error');
      setKeyTestFeedback(`❌ Errore di rete: ${e.message}`);
      onShowToast(`❌ Errore test: ${e.message}`);
    }
  };

  const hasConfiguredKey = !!(keyDetails.key || apiKeyInput.trim());
  const activeBooksCount = books.filter((b) => b.isEnabled).length;

  return (
    <div className="flex flex-col h-[calc(100dvh-clamp(120px,15vh,155px))] max-w-4xl mx-auto space-y-[clamp(6px,1.2vh,12px)]">
      {/* Sleek, Compact Mobile-First Header Bar */}
      <div className="bg-[#120f26]/95 backdrop-blur-md border border-[#2a244d] px-[clamp(8px,2.5vw,16px)] py-[clamp(6px,1.2vh,12px)] rounded-2xl flex items-center justify-between gap-2 shadow-lg flex-shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <div className="relative flex-shrink-0">
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-amber-400/20 to-purple-800/40 border border-amber-400/50 flex items-center justify-center text-amber-300 shadow-sm text-sm sm:text-lg">
              🔮
            </div>
            <span className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 sm:w-2.5 sm:h-2.5 border-2 border-[#120f26] rounded-full ${hasConfiguredKey ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h1 className="font-cinzel font-bold text-xs sm:text-sm text-white gold-gradient-text truncate">
                Oracolo AI
              </h1>
              <span className="text-[9px] sm:text-[10px] px-1.5 py-0.2 rounded-md bg-purple-950/90 border border-amber-400/30 text-amber-300 font-mono font-semibold">
                Llama 3.3
              </span>
            </div>

            <button
              onClick={() => setShowCompactStatus(!showCompactStatus)}
              className="text-[10px] text-purple-300/80 hover:text-amber-300 flex items-center gap-1 cursor-pointer truncate"
            >
              {keyDetails.source.startsWith('vercel') ? (
                <span className="text-emerald-400 font-medium">● Vercel</span>
              ) : keyDetails.source === 'local' ? (
                <span className="text-emerald-400 font-medium">● Locale</span>
              ) : (
                <span className="text-amber-300 font-medium">● Oracolo</span>
              )}
              <span className="text-purple-400/60">•</span>
              <span className="text-amber-300/90 font-medium">{activeBooksCount} Testi</span>
              {showCompactStatus ? <ChevronUp className="w-2.5 h-2.5" /> : <ChevronDown className="w-2.5 h-2.5" />}
            </button>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1 sm:gap-1.5 text-xs flex-shrink-0">
          {/* Books / Grimoires Button */}
          <button
            onClick={() => setIsGrimoireModalOpen(true)}
            className="px-2 sm:px-2.5 py-1.5 rounded-xl bg-purple-950/70 hover:bg-purple-900/80 border border-amber-400/40 text-amber-300 font-semibold flex items-center gap-1 transition active:scale-95 cursor-pointer text-[10px] sm:text-xs shadow-sm"
            title="Gestisci Manuali & Grimori Sacri"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Manuali</span>
            <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-950 font-bold text-[9px]">
              {activeBooksCount}
            </span>
          </button>

          {/* Settings / API Key Button */}
          <button
            onClick={() => setIsSettingsOpen(true)}
            title="Impostazioni Groq & Modello"
            className={`p-1.5 sm:p-2 rounded-xl border flex items-center justify-center transition active:scale-95 cursor-pointer ${
              hasConfiguredKey
                ? 'bg-[#1b153f] border-[#2a244d] text-purple-200 hover:text-amber-300 hover:border-amber-400/40'
                : 'bg-amber-400/20 border-amber-400 text-amber-300 animate-pulse'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
          </button>

          {/* Clear History Button */}
          <button
            onClick={handleClearHistory}
            title="Pulisci cronologia messaggi"
            className="p-1.5 sm:p-2 rounded-xl bg-[#1b153f] border border-[#2a244d] text-purple-300 hover:text-rose-400 hover:border-rose-500/40 transition active:scale-95 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Expandable Status Bar if user clicks status */}
      {showCompactStatus && (
        <div className="bg-[#15112e] border border-purple-500/20 p-2.5 sm:p-3 rounded-2xl text-[11px] text-purple-200/90 space-y-1.5 animate-in slide-in-from-top-2 duration-150 flex-shrink-0">
          <div className="flex items-center justify-between flex-wrap gap-1">
            <span className="text-amber-300 font-semibold">Fonte Chiave Groq:</span>
            <span>{keyDetails.source} ({keyDetails.maskedKey || 'Nessuna'})</span>
          </div>
          <div className="flex items-center justify-between flex-wrap gap-1">
            <span className="text-purple-300 font-medium">Contesto Santuario (Luna & Agenda):</span>
            <span className="text-emerald-400">{includeSanctuaryContext ? 'Attivo' : 'Disattivato'}</span>
          </div>
          <div className="flex items-center justify-between flex-wrap gap-1">
            <span className="text-purple-300 font-medium">Libri consultati nelle risposte:</span>
            <span className="text-amber-300">{books.filter(b => b.isEnabled).map(b => b.title).join(', ') || 'Nessuno'}</span>
          </div>
        </div>
      )}

      {/* Quick Setup Banner if No API Key is active */}
      {!hasConfiguredKey && (
        <div className="bg-gradient-to-r from-amber-500/15 via-purple-900/40 to-[#131127] border border-amber-400/40 p-2.5 sm:p-3 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-2 shadow-lg flex-shrink-0 animate-in fade-in text-xs">
          <div className="flex items-center gap-2 text-amber-200 w-full sm:w-auto">
            <Info className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <p className="text-[11px]">
              Inserisci la tua chiave <strong>Groq</strong> (<code>gsk_...</code>) per sbloccare la saggezza di Llama 3.3.
            </p>
          </div>

          <div className="flex items-center gap-1.5 w-full sm:w-auto">
            <input
              type="password"
              value={quickKeyInput}
              onChange={(e) => setQuickKeyInput(e.target.value)}
              placeholder="Incolla gsk_..."
              className="bg-[#1d1138] border border-amber-400/40 rounded-xl px-2.5 py-1 text-xs text-white placeholder-purple-400/60 focus:outline-none focus:border-amber-400 flex-1 sm:w-44 font-mono"
            />
            <button
              onClick={handleQuickSaveKey}
              className="px-3 py-1 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-xl text-xs shadow transition active:scale-95 cursor-pointer whitespace-nowrap"
            >
              Attiva
            </button>
          </div>
        </div>
      )}

      {/* Main Messages Scrollable Area */}
      <div className="flex-1 overflow-y-auto space-y-3 sm:space-y-4 pr-1 sm:pr-2 scrollbar-thin scrollbar-thumb-purple-900/40">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          const isPlayingThis = speakingMessageId === msg.id && isCurrentlySpeaking();

          return (
            <div
              key={msg.id}
              className={`flex gap-2 sm:gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {/* Bot Avatar */}
              {!isUser && (
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-purple-800 to-indigo-900 border border-amber-400/50 flex-shrink-0 flex items-center justify-center text-xs sm:text-sm shadow-md text-amber-300 mt-1">
                  🔮
                </div>
              )}

              <div
                className={`max-w-[90%] sm:max-w-[80%] rounded-2xl p-3 sm:p-4 space-y-2 shadow-lg relative text-xs leading-relaxed ${
                  isUser
                    ? 'bg-gradient-to-r from-purple-900/90 to-indigo-950/90 border border-purple-500/40 text-purple-50 rounded-tr-sm ml-2'
                    : 'bg-[#14102c] border border-[#2a244d] text-purple-100 rounded-tl-sm'
                }`}
              >
                {/* Header info */}
                <div className="flex items-center justify-between gap-2 border-b border-purple-500/15 pb-1 text-[10px] text-purple-300/80">
                  <span className="font-semibold font-cinzel text-amber-300/90 flex items-center gap-1">
                    {isUser ? 'Maria Teresa' : 'Oracolo & Guida Esoterica AI'}
                  </span>
                  <span>{msg.timestamp}</span>
                </div>

                {/* Message Body */}
                <div className="whitespace-pre-wrap font-light text-slate-100 text-[12px] sm:text-[13px] leading-relaxed space-y-1.5">
                  {msg.text.split('\n\n').map((paragraph, idx) => (
                    <p key={idx}>
                      {paragraph.split('**').map((chunk, cIdx) =>
                        cIdx % 2 === 1 ? (
                          <strong key={cIdx} className="font-semibold text-amber-200">
                            {chunk}
                          </strong>
                        ) : (
                          chunk
                        )
                      )}
                    </p>
                  ))}
                </div>

                {/* Sources Used Badge if available */}
                {!isUser && msg.sourcesUsed && msg.sourcesUsed.length > 0 && (
                  <div className="pt-1.5 mt-1 border-t border-purple-500/15 flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] text-purple-400 font-medium flex items-center gap-1">
                      <BookMarked className="w-3 h-3 text-amber-400" /> Fonti Consultate:
                    </span>
                    {msg.sourcesUsed.map((src, sIdx) => (
                      <span
                        key={sIdx}
                        className="text-[9px] px-2 py-0.5 rounded-md bg-purple-950/80 border border-amber-400/30 text-amber-200 font-medium"
                      >
                        {src}
                      </span>
                    ))}
                  </div>
                )}

                {/* Bottom Action Row for Assistant Messages */}
                {!isUser && (
                  <div className="flex items-center justify-between pt-1 text-[11px]">
                    <button
                      onClick={() => handleSpeakMessage(msg.id, msg.text)}
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] sm:text-[11px] font-medium transition active:scale-95 cursor-pointer ${
                        isPlayingThis
                          ? 'bg-amber-400 text-slate-950 font-bold animate-pulse'
                          : 'bg-[#1d1645] border border-purple-500/30 text-purple-200 hover:text-amber-300'
                      }`}
                    >
                      {isPlayingThis ? (
                        <>
                          <VolumeX className="w-3 h-3 text-slate-950" />
                          <span>Interrompi</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3 h-3 text-amber-400" />
                          <span>Leggi Vocale</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => handleCopyMessage(msg.id, msg.text)}
                      className="p-1 rounded-lg text-purple-300 hover:text-white hover:bg-purple-900/40 transition active:scale-95 cursor-pointer"
                      title="Copia testo"
                    >
                      {copiedMsgId === msg.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* User Avatar */}
              {isUser && (
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 border border-amber-300 flex-shrink-0 flex items-center justify-center text-[10px] sm:text-xs font-bold text-slate-950 shadow-md mt-1 font-cinzel">
                  MT
                </div>
              )}
            </div>
          );
        })}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex gap-2 justify-start animate-in fade-in">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-800 to-indigo-900 border border-amber-400/50 flex items-center justify-center text-xs text-amber-300">
              🔮
            </div>
            <div className="bg-[#14102c] border border-[#2a244d] rounded-2xl rounded-tl-sm p-3 text-xs text-purple-200 flex items-center gap-2.5">
              <Loader2 className="w-4 h-4 text-amber-400 animate-spin" />
              <span>Consultazione dell'Oracolo & ricerca nei Grimori...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Suggested Questions Pill Bar */}
      {messages.length <= 4 && !isLoading && (
        <div className="flex-shrink-0 space-y-1">
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[10px] sm:text-[11px]">
            {SUGGESTED_QUESTIONS.map((q, i) => (
              <button
                key={i}
                onClick={() => handleSendMessage(q.text)}
                className="whitespace-nowrap px-2.5 py-1 rounded-xl bg-[#14102c] hover:bg-purple-900/40 border border-[#2a244d] hover:border-amber-400/40 text-purple-200 hover:text-amber-300 transition-all flex-shrink-0 active:scale-95 cursor-pointer"
              >
                {q.text}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Voice Transcript Floating Banner when Recording */}
      {(isRecording || speechTranscript) && (
        <div className="bg-[#1b153f] border-2 border-amber-400/80 p-3 rounded-2xl shadow-2xl space-y-2 animate-in slide-in-from-bottom duration-200 flex-shrink-0">
          <div className="flex items-center justify-between border-b border-purple-500/20 pb-1.5">
            <div className="flex items-center gap-2 text-amber-300 text-xs font-semibold">
              <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-ping" />
              <Mic className="w-3.5 h-3.5 text-amber-400" />
              <span>{isRecording ? 'Microfono attivo... Parla liberamente' : 'Trascrizione Vocale Pronta'}</span>
            </div>

            <button
              onClick={() => {
                if (isRecording && recognitionRef.current) {
                  try {
                    recognitionRef.current.stop();
                  } catch (e) {}
                }
                setIsRecording(false);
                setSpeechTranscript('');
              }}
              className="text-[11px] text-purple-300 hover:text-rose-300 transition cursor-pointer"
            >
              Annulla
            </button>
          </div>

          <p className="text-xs text-white bg-[#100d24] p-2 rounded-xl border border-purple-500/30 italic">
            "{speechTranscript || 'In ascolto delle tue parole...'}"
          </p>

          <div className="flex items-center justify-end gap-2 text-xs">
            <button
              onClick={() => handleApplyVoiceTranscript(false)}
              disabled={!speechTranscript.trim()}
              className="px-2.5 py-1 bg-[#100d24] border border-[#2a244d] text-purple-200 hover:text-white rounded-xl disabled:opacity-50 text-[11px] transition cursor-pointer"
            >
              Modifica
            </button>
            <button
              onClick={() => handleApplyVoiceTranscript(true)}
              disabled={!speechTranscript.trim()}
              className="px-3.5 py-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl disabled:opacity-50 text-xs transition shadow flex items-center gap-1.5 cursor-pointer"
            >
              <Send className="w-3 h-3" />
              <span>Invia all'Oracolo</span>
            </button>
          </div>
        </div>
      )}

      {/* Hidden File Input for Direct Local .TXT / Document Upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".txt,.md,.json,.csv,.log,text/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Message Input & Action Bar */}
      <div className="bg-[#120f26]/95 backdrop-blur-md border border-[#2a244d] p-[clamp(6px,1.6vw,10px)] rounded-2xl shadow-xl flex-shrink-0 space-y-[clamp(4px,1vh,8px)]">
        {/* Attached File Banner if loaded */}
        {attachedFile && (
          <div className="bg-gradient-to-r from-amber-500/15 via-purple-900/40 to-[#1b143a] border border-amber-400/50 rounded-xl p-[clamp(6px,1.5vw,10px)] space-y-1.5 animate-in fade-in">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs text-amber-200 min-w-0">
                <div className="p-1 rounded-lg bg-amber-400/20 text-amber-300 flex-shrink-0">
                  <FileText className="w-3.5 h-3.5" />
                </div>
                <div className="truncate">
                  <div className="font-semibold text-white truncate flex items-center gap-1">
                    <span className="text-[11px] sm:text-xs truncate">{attachedFile.name}</span>
                    <span className="text-[9px] px-1 py-0.2 rounded bg-amber-400/20 text-amber-300 font-mono flex-shrink-0">
                      {attachedFile.sizeFormatted}
                    </span>
                  </div>
                  <p className="text-[9px] text-purple-300/80">
                    {attachedFile.wordCount.toLocaleString('it-IT')} parole
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setShowFilePreview(true)}
                  className="p-1 bg-[#140f2b] hover:bg-purple-900/60 border border-purple-500/30 rounded-lg text-purple-300 hover:text-amber-300 text-xs transition cursor-pointer"
                  title="Leggi anteprima testo"
                >
                  <Eye className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  onClick={() => setAttachedFile(null)}
                  className="p-1 bg-[#140f2b] hover:bg-rose-950/60 border border-rose-500/30 rounded-lg text-rose-300 hover:text-rose-200 text-xs transition cursor-pointer"
                  title="Rimuovi allegato"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Quick Actions with File */}
            <div className="flex items-center gap-1 overflow-x-auto text-[9px] sm:text-[10px] pb-0.5 scrollbar-none">
              <button
                type="button"
                onClick={() => handleQuickAnalyzeFile('completa')}
                className="px-2 py-0.5 rounded-lg bg-amber-400/20 hover:bg-amber-400/30 border border-amber-400/40 text-amber-300 font-medium whitespace-nowrap transition cursor-pointer flex items-center gap-1"
              >
                <Sparkles className="w-2.5 h-2.5" />
                <span>Analizza</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickAnalyzeFile('simboli')}
                className="px-2 py-0.5 rounded-lg bg-purple-900/60 hover:bg-purple-800/80 border border-purple-500/40 text-purple-200 font-medium whitespace-nowrap transition cursor-pointer"
              >
                <span>🔮 Simboli</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickAnalyzeFile('rituali')}
                className="px-2 py-0.5 rounded-lg bg-purple-900/60 hover:bg-purple-800/80 border border-purple-500/40 text-purple-200 font-medium whitespace-nowrap transition cursor-pointer"
              >
                <span>🕯️ Rituali</span>
              </button>
              <button
                type="button"
                onClick={handleAddAttachedToGrimoires}
                className="px-2 py-0.5 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-500/40 text-emerald-300 font-medium whitespace-nowrap transition cursor-pointer flex items-center gap-1 ml-auto"
                title="Salva per sempre questo testo nei tuoi Manuali Sacri"
              >
                <BookMarked className="w-2.5 h-2.5" />
                <span>+ Salva</span>
              </button>
            </div>
          </div>
        )}

        {/* Active Grimoires Quick Pills Bar */}
        <div className="flex items-center justify-between gap-1.5 overflow-x-auto text-[9px] sm:text-[10px] pb-0.5 scrollbar-none">
          <div className="flex items-center gap-1 flex-nowrap">
            <span className="text-purple-400/80 font-semibold flex items-center gap-0.5 flex-shrink-0">
              <BookOpen className="w-2.5 h-2.5 text-amber-400" /> Fonti:
            </span>
            {books.slice(0, 3).map((b) => (
              <button
                key={b.id}
                onClick={() => {
                  const updated = toggleGrimoireEnabled(b.id, !b.isEnabled);
                  setBooks(updated);
                  onShowToast(!b.isEnabled ? `📖 "${b.title}" attivato` : `"${b.title}" disattivato`);
                }}
                className={`px-1.5 py-0.5 rounded-md border flex items-center gap-0.5 whitespace-nowrap transition cursor-pointer text-[9px] sm:text-[10px] ${
                  b.isEnabled
                    ? 'bg-amber-400/15 border-amber-400/40 text-amber-300 font-medium'
                    : 'bg-purple-950/40 border-purple-500/20 text-purple-400 line-through opacity-60'
                }`}
                title={b.isEnabled ? 'Clicca per disattivare questo testo' : 'Clicca per includere nelle risposte'}
              >
                <span>{b.coverEmoji}</span>
                <span className="truncate max-w-[85px] sm:max-w-[110px]">{b.title.split('&')[0]}</span>
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setIsGrimoireModalOpen(true)}
            className="text-amber-400 hover:underline flex-shrink-0 font-medium flex items-center gap-0.5 cursor-pointer ml-auto text-[9px] sm:text-[10px] whitespace-nowrap"
          >
            <span>+ Manuali</span>
          </button>
        </div>

        {/* Input form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-end gap-1 sm:gap-2"
        >
          {/* Direct File Attachment Button (.txt, .md, etc.) */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className={`p-2 sm:p-2.5 rounded-xl transition-all duration-200 flex-shrink-0 active:scale-95 cursor-pointer ${
              attachedFile
                ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/30 font-bold'
                : 'bg-[#1b153f] border border-purple-500/30 text-purple-300 hover:text-amber-300 hover:border-amber-400/40'
            }`}
            title="Carica file di testo (.txt, .md, .json) dal dispositivo"
          >
            <Paperclip className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>

          {/* Voice Mic Button */}
          <button
            type="button"
            onClick={toggleSpeechRecognition}
            className={`p-2 sm:p-2.5 rounded-xl transition-all duration-200 flex-shrink-0 active:scale-95 cursor-pointer ${
              isRecording
                ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/30'
                : 'bg-[#1b153f] border border-purple-500/30 text-amber-400 hover:text-amber-300 hover:border-amber-400/40'
            }`}
            title={isRecording ? 'Interrompi registrazione' : 'Parla al microfono'}
          >
            {isRecording ? <MicOff className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Mic className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
          </button>

          {/* Text Input Area */}
          <div className="flex-1 relative min-w-0">
            <textarea
              ref={textareaRef}
              rows={1}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder={attachedFile ? `Domanda su "${attachedFile.name}"...` : "Chiedi all'Oracolo..."}
              className="w-full bg-[#1b153f] border border-[#2a244d] focus:border-amber-400/80 rounded-xl px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-[13px] text-white placeholder-purple-400/50 focus:outline-none resize-none min-h-[34px] sm:min-h-[38px] max-h-24 scrollbar-thin leading-relaxed"
            />
          </div>

          {/* Send Button */}
          <button
            type="submit"
            disabled={!inputMessage.trim() || isLoading}
            className="p-2 sm:p-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl disabled:opacity-40 disabled:hover:from-amber-500 transition-all duration-200 shadow-md shadow-amber-500/20 active:scale-95 flex-shrink-0 cursor-pointer"
            title="Invia all'Oracolo"
          >
            {isLoading ? (
              <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin text-slate-950" />
            ) : (
              <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            )}
          </button>
        </form>
      </div>

      {/* Grimoire Modal */}
      <GrimoireModal
        isOpen={isGrimoireModalOpen}
        onClose={() => setIsGrimoireModalOpen(false)}
        books={books}
        onUpdateBooks={(updated) => setBooks(updated)}
        onShowToast={onShowToast}
        onOpenGoogleDrive={onOpenGoogleDrive}
      />

      {/* Attached File Preview Modal */}
      {showFilePreview && attachedFile && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="bg-[#120f26] border border-[#2a244d] w-full max-w-2xl rounded-3xl p-5 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-[#2a244d] pb-3 flex-shrink-0">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="font-cinzel font-bold text-sm text-white gold-gradient-text">
                    {attachedFile.name}
                  </h3>
                  <p className="text-[11px] text-purple-300">
                    {attachedFile.wordCount.toLocaleString('it-IT')} parole • {attachedFile.sizeFormatted}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowFilePreview(false)}
                className="text-purple-300 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto bg-[#181335] p-3.5 rounded-2xl border border-purple-500/20 text-xs text-purple-100 font-mono whitespace-pre-wrap leading-relaxed select-text">
              {attachedFile.content}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[#2a244d] flex-shrink-0 text-xs">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(attachedFile.content);
                  onShowToast('Testo copiato negli appunti!');
                }}
                className="px-3 py-1.5 bg-[#1b153f] border border-purple-500/30 text-purple-200 hover:text-white rounded-xl flex items-center gap-1.5 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copia Testo</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleAddAttachedToGrimoires}
                  className="px-3 py-1.5 bg-purple-900 hover:bg-purple-800 border border-amber-400/40 text-amber-300 font-medium rounded-xl flex items-center gap-1 cursor-pointer"
                >
                  <BookMarked className="w-3.5 h-3.5 text-amber-400" />
                  <span>Salva nei Manuali</span>
                </button>
                <button
                  onClick={() => setShowFilePreview(false)}
                  className="px-4 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-xl cursor-pointer"
                >
                  Chiudi
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Groq Settings Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="bg-[#120f26] border border-[#2a244d] w-full max-w-lg rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#2a244d] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-purple-900/50 border border-purple-500/40 text-amber-400">
                  <Key className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-cinzel font-bold text-sm text-white gold-gradient-text">
                    Configurazione Oracolo & Motore Groq AI
                  </h3>
                  <p className="text-[11px] text-purple-300/80">Llama 3.3 70B & Integrazione Santuario</p>
                </div>
              </div>
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="text-purple-300 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Current Key Status */}
            <div className="bg-[#1b153f] p-3 rounded-2xl border border-purple-500/30 space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-purple-300 font-medium">Stato Rilevamento Chiave:</span>
                {keyDetails.source.startsWith('vercel') && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30 text-[10px]">
                    Vercel ({keyDetails.source})
                  </span>
                )}
                {keyDetails.source === 'local' && (
                  <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-semibold border border-blue-500/30 text-[10px]">
                    Browser Locale
                  </span>
                )}
                {keyDetails.source === 'none' && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30 text-[10px]">
                    Non configurata
                  </span>
                )}
              </div>

              {keyDetails.maskedKey && (
                <div className="text-[11px] text-purple-200/80 font-mono">
                  Chiave attiva: <span className="text-amber-300 font-bold">{keyDetails.maskedKey}</span>
                </div>
              )}
            </div>

            {/* Groq API Key Input */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <label className="text-purple-200 font-semibold flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-amber-400" />
                  Chiave API Groq
                </label>
                <a
                  href="https://console.groq.com/keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-amber-400 hover:underline text-[11px] flex items-center gap-1"
                >
                  <span>Ottieni su Groq</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <input
                type="password"
                value={apiKeyInput}
                onChange={(e) => {
                  setApiKeyInput(e.target.value);
                  setKeyTestStatus('idle');
                  setKeyTestFeedback('');
                }}
                placeholder="gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                className="w-full bg-[#1b153f] border border-[#2a244d] rounded-xl px-3 py-2 text-xs text-white placeholder-purple-400/50 focus:outline-none focus:border-amber-400 font-mono"
              />
            </div>

            {/* Test Connection Button */}
            <div className="space-y-1.5">
              <button
                type="button"
                onClick={handleTestApiKey}
                disabled={keyTestStatus === 'testing'}
                className="px-3.5 py-1.5 rounded-xl bg-[#1b153f] hover:bg-purple-900/40 border border-purple-500/40 text-amber-300 text-xs font-semibold transition disabled:opacity-40 flex items-center gap-1.5 active:scale-95 cursor-pointer"
              >
                {keyTestStatus === 'testing' ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Verifica in corso...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Testa Connessione Groq</span>
                  </>
                )}
              </button>

              {keyTestFeedback && (
                <p className={`text-xs font-medium ${keyTestStatus === 'success' ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {keyTestFeedback}
                </p>
              )}
            </div>

            {/* Model Selection */}
            <div className="space-y-1.5">
              <label className="text-purple-200 font-semibold text-xs block">
                Modello Linguistico Groq
              </label>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full bg-[#1b153f] border border-[#2a244d] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
              >
                {GROQ_MODELS.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.speed})
                  </option>
                ))}
              </select>
            </div>

            {/* Audio Auto-read Toggle */}
            <div className="pt-2 border-t border-[#2a244d] space-y-2">
              <label className="flex items-center gap-2 text-xs text-purple-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoReadResponse}
                  onChange={(e) => setAutoReadResponse(e.target.checked)}
                  className="rounded border-[#2a244d] text-amber-400 focus:ring-amber-400 bg-[#1b153f] w-4 h-4"
                />
                <span>Leggi automaticamente le risposte ad alta voce (Sintesi Vocale)</span>
              </label>

              <label className="flex items-center gap-2 text-xs text-purple-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeSanctuaryContext}
                  onChange={(e) => setIncludeSanctuaryContext(e.target.checked)}
                  className="rounded border-[#2a244d] text-amber-400 focus:ring-amber-400 bg-[#1b153f] w-4 h-4"
                />
                <span>Includi dati del Santuario (Luna, Tarocco, Agenda) nel prompt</span>
              </label>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setIsSettingsOpen(false)}
                className="px-3.5 py-1.5 bg-[#1b153f] border border-[#2a244d] text-purple-300 hover:text-white rounded-xl text-xs cursor-pointer"
              >
                Annulla
              </button>
              <button
                type="button"
                onClick={handleSaveSettings}
                className="px-4 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl text-xs shadow-lg active:scale-95 transition cursor-pointer"
              >
                Salva Impostazioni
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
