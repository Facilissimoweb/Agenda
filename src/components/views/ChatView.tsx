import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage, Appointment, CycleData } from '../../types';
import { 
  sendGroqChatMessage, 
  getStoredGroqApiKey, 
  saveStoredGroqApiKey, 
  getStoredGroqModel, 
  saveStoredGroqModel,
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
  Wand2, 
  Moon, 
  ShieldCheck, 
  HelpCircle,
  X,
  ExternalLink,
  RefreshCw,
  Flame,
  Radio
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ChatViewProps {
  appointments: Appointment[];
  cycleData: CycleData;
  onShowToast: (msg: string) => void;
}

const INITIAL_GREETING: ChatMessage = {
  id: 'msg-welcome',
  sender: 'assistant',
  text: `Salute a te, Maria Teresa. ✨ Sono la tua **Guida Esoterica & Oracolo Alchemico**, alimentata dal motore AI di Groq.\n\nPuoi parlarmi digitando un messaggio oppure **premendo il microfono** per parlare a voce libera. Se desideri ascoltare le mie risposte, premi l'icona dell'altoparlante 🔊 accanto al messaggio.\n\n*Come posso illuminare il tuo cammino o i tuoi consulti oggi?*`,
  timestamp: new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }),
  category: 'generale',
};

const SUGGESTED_QUESTIONS = [
  { text: '🃏 Tarocchi per la giornata di oggi', category: 'tarocchi' },
  { text: '🌙 Rituale di purificazione con la Luna attuale', category: 'astrologia' },
  { text: '📿 Come proteggere il campo aurico durante un consulto?', category: 'consulenza' },
  { text: '🌿 Quali erbe o cristalli abbinare al Chakra del Cuore?', category: 'rituale' },
  { text: '🔮 Come interpretare la carta della Papessa nei sentimenti?', category: 'tarocchi' },
  { text: '💭 Interpretazione di un sogno con simboli d\'acqua e fuoco', category: 'sogno' },
];

export const ChatView: React.FC<ChatViewProps> = ({ appointments, cycleData, onShowToast }) => {
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

  // Settings & Modal State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState(() => getStoredGroqApiKey());
  const [selectedModel, setSelectedModel] = useState(() => getStoredGroqModel());
  const [includeSanctuaryContext, setIncludeSanctuaryContext] = useState(true);
  const [autoReadResponse, setAutoReadResponse] = useState(false);
  const [keyTestStatus, setKeyTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');

  // Speech Recognition instance ref
  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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
    if (!isSpeechRecognitionSupported()) {
      onShowToast('Il tuo browser non supporta il riconoscimento vocale. Usa Google Chrome o Edge.');
      return;
    }

    if (isRecording) {
      // Stop recording
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsRecording(false);
      return;
    }

    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();

      recognition.lang = 'it-IT';
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsRecording(true);
        setSpeechTranscript('');
      };

      recognition.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          currentTranscript += event.results[i][0].transcript;
        }
        setSpeechTranscript(currentTranscript);
      };

      recognition.onerror = (event: any) => {
        setIsRecording(false);
        if (event.error === 'not-allowed') {
          onShowToast('Permesso microfono negato. Consenti l\'accesso al microfono nel browser.');
        } else if (event.error !== 'no-speech') {
          onShowToast(`Errore microfono: ${event.error}`);
        }
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      setIsRecording(false);
      onShowToast(`Impossibile avviare il microfono: ${err.message}`);
    }
  };

  // Confirm transcript and put it into input or send
  const handleApplyVoiceTranscript = (sendImmediately: boolean = false) => {
    const textToSend = speechTranscript.trim();
    if (!textToSend) return;

    if (sendImmediately) {
      handleSendMessage(textToSend);
      setSpeechTranscript('');
    } else {
      setInputMessage((prev) => (prev ? `${prev} ${textToSend}` : textToSend));
      setSpeechTranscript('');
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }
  };

  // Send Message Handler
  const handleSendMessage = async (customText?: string) => {
    const text = (customText || inputMessage).trim();
    if (!text || isLoading) return;

    // Stop speech synthesis if playing
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

    // Extra sanctuary context
    const extraContext = includeSanctuaryContext
      ? {
          moonPhase: 'Luna Piena in Vergine 🌕',
          zodiacSign: 'Vergine ♍',
          cycleArchetype: 'L\'Incantatrice (Fase Luteale Creativa)',
          todayTarot: 'L\'Imperatrice (III) • Creatività & Fertilità',
          appointmentsCount: appointments.length,
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
      };

      setMessages((prev) => [...prev, assistantMsg]);

      // Auto read response if enabled
      if (autoReadResponse && isSpeechSynthesisSupported()) {
        handleSpeakMessage(assistantMsg.id, response.text);
      }

      if (response.isFallback) {
        onShowToast('Risposta oracolare generata con successo.');
      }
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `msg-err-${Date.now()}`,
        sender: 'assistant',
        text: `🕊️ Si è verificato un inconveniente nella ricezione della risposta: ${err.message || 'Errore imprevisto'}. Riprova tra un istante.`,
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
      onError: (err) => {
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
    saveStoredGroqApiKey(apiKeyInput);
    saveStoredGroqModel(selectedModel);
    setIsSettingsOpen(false);
    onShowToast('Impostazioni Groq AI aggiornate con successo!');
  };

  // Test Groq API Key
  const handleTestApiKey = async () => {
    if (!apiKeyInput.trim()) {
      onShowToast('Inserisci una chiave API Groq da testare.');
      return;
    }

    setKeyTestStatus('testing');
    try {
      const res = await sendGroqChatMessage(
        [{ role: 'user', content: 'Rispondi solo con: Chiave Groq Valida ✨' }],
        {
          apiKey: apiKeyInput.trim(),
          model: selectedModel,
        }
      );

      if (res.success && !res.isFallback) {
        setKeyTestStatus('success');
        onShowToast('✅ Connessione a Groq riuscita con successo!');
        try {
          confetti({
            particleCount: 20,
            spread: 40,
            origin: { y: 0.7 },
            colors: ['#d4af37', '#10b981', '#a855f7'],
          });
        } catch (e) {}
      } else {
        setKeyTestStatus('error');
        onShowToast(`❌ Test non riuscito: ${res.errorMsg || 'Chiave non valida'}`);
      }
    } catch (e: any) {
      setKeyTestStatus('error');
      onShowToast(`❌ Errore test: ${e.message}`);
    }
  };

  const hasConfiguredKey = !!(getStoredGroqApiKey() || apiKeyInput.trim());

  return (
    <div className="space-y-4 sm:space-y-6 flex flex-col h-[calc(100vh-140px)] sm:h-[calc(100vh-160px)] min-h-[580px]">
      {/* Top Header Bar */}
      <div className="bg-[#131127] border border-[#2a244d] p-3 sm:p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-lg flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400/20 to-purple-800/40 border border-amber-400/50 flex items-center justify-center text-amber-300 shadow-md shadow-amber-500/10 text-xl">
              🔮
            </div>
            <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-[#131127] rounded-full" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-cinzel font-bold text-sm sm:text-base text-white gold-gradient-text">
                Oracolo & Guida Esoterica AI
              </h1>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-950/80 border border-purple-500/40 text-amber-300 font-mono">
                GROQ AI
              </span>
            </div>
            <p className="text-[11px] text-purple-300/80 font-light flex items-center gap-1.5">
              <span>{hasConfiguredKey ? 'Connesso a Llama 3.3 70B' : 'Modalità Oracolare & Risposte Locali'}</span>
              <span>•</span>
              <span className="text-emerald-400 flex items-center gap-0.5">
                <Radio className="w-2.5 h-2.5 animate-pulse" />
                Audio & Voce Attivi
              </span>
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 text-xs">
          {/* Sanctuary Context Toggle */}
          <button
            onClick={() => {
              setIncludeSanctuaryContext(!includeSanctuaryContext);
              onShowToast(
                !includeSanctuaryContext
                  ? 'Sincronizzazione dati Santuario (Luna, Tarocco, Agenda) ATTIVATA'
                  : 'Sincronizzazione dati Santuario DISATTIVATA'
              );
            }}
            title="Includi contesto lunare e del santuario nelle risposte"
            className={`hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border transition text-[11px] ${
              includeSanctuaryContext
                ? 'bg-purple-900/50 border-amber-400/40 text-amber-300'
                : 'bg-[#1d1138] border-[#2a244d] text-purple-300 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Contesto Santuario</span>
          </button>

          {/* Settings / API Key Button */}
          <button
            onClick={() => setIsSettingsOpen(true)}
            className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 font-medium transition active:scale-95 cursor-pointer ${
              hasConfiguredKey
                ? 'bg-[#1d1138] border-[#2a244d] text-purple-200 hover:text-amber-300 hover:border-amber-400/40'
                : 'bg-amber-400/20 border-amber-400 text-amber-300 animate-pulse'
            }`}
          >
            <Key className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Configura</span> Chiave Groq
          </button>

          {/* Clear History Button */}
          <button
            onClick={handleClearHistory}
            title="Pulisci cronologia"
            className="p-2 rounded-xl bg-[#1d1138] border border-[#2a244d] text-purple-300 hover:text-rose-400 hover:border-rose-500/40 transition active:scale-95 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Messages Scrollable Area */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 sm:pr-2 scrollbar-thin scrollbar-thumb-purple-900/40">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          const isPlayingThis = speakingMessageId === msg.id && isCurrentlySpeaking();

          return (
            <div
              key={msg.id}
              className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {/* Bot Avatar */}
              {!isUser && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-800 to-indigo-900 border border-amber-400/50 flex-shrink-0 flex items-center justify-center text-sm shadow-md text-amber-300 mt-1">
                  🔮
                </div>
              )}

              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 sm:p-4.5 space-y-2.5 shadow-lg relative text-xs leading-relaxed ${
                  isUser
                    ? 'bg-gradient-to-r from-purple-900/80 to-indigo-950/80 border border-purple-500/40 text-purple-50 rounded-tr-sm ml-4'
                    : 'bg-[#131127] border border-[#2a244d] text-purple-100 rounded-tl-sm'
                }`}
              >
                {/* Header info */}
                <div className="flex items-center justify-between gap-2 border-b border-purple-500/15 pb-1.5 text-[10px] text-purple-300/80">
                  <span className="font-semibold font-cinzel text-amber-300/90 flex items-center gap-1">
                    {isUser ? 'Maria Teresa' : 'Sacerdotessa & Oracolo AI'}
                  </span>
                  <span>{msg.timestamp}</span>
                </div>

                {/* Message Body (Markdown-like formatting support) */}
                <div className="whitespace-pre-wrap font-light text-slate-100 text-xs sm:text-[13px] leading-relaxed space-y-2">
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

                {/* Bottom Action Row for Assistant Messages */}
                {!isUser && (
                  <div className="flex items-center justify-between pt-1.5 border-t border-purple-500/15 text-[11px]">
                    <div className="flex items-center gap-1.5">
                      {/* Text-to-Speech Button ("per leggere i contenuti") */}
                      <button
                        onClick={() => handleSpeakMessage(msg.id, msg.text)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium transition active:scale-95 cursor-pointer ${
                          isPlayingThis
                            ? 'bg-amber-400 text-slate-950 font-bold animate-pulse shadow-md shadow-amber-400/20'
                            : 'bg-[#1d1138] border border-[#2a244d] text-purple-200 hover:text-amber-300 hover:border-amber-400/40'
                        }`}
                        title="Ascolta la lettura vocale in italiano"
                      >
                        {isPlayingThis ? (
                          <>
                            <VolumeX className="w-3.5 h-3.5 text-slate-950" />
                            <span>Interrompi Lettura</span>
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                            <span>Leggi Vocale</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Copy Button */}
                    <button
                      onClick={() => handleCopyMessage(msg.id, msg.text)}
                      className="p-1.5 rounded-lg text-purple-300 hover:text-white hover:bg-purple-900/40 transition active:scale-95 cursor-pointer"
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
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 border border-amber-300 flex-shrink-0 flex items-center justify-center text-xs font-bold text-slate-950 shadow-md mt-1 font-cinzel">
                  MT
                </div>
              )}
            </div>
          );
        })}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex gap-3 justify-start animate-in fade-in">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-800 to-indigo-900 border border-amber-400/50 flex items-center justify-center text-sm shadow-md text-amber-300">
              🔮
            </div>
            <div className="bg-[#131127] border border-[#2a244d] rounded-2xl rounded-tl-sm p-4 text-xs text-purple-200 flex items-center gap-3">
              <Loader2 className="w-4 h-4 text-amber-400 animate-spin" />
              <span>Consultazione dell'Oracolo & calcolo degli astri...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Suggested Questions Pill Bar (when not loading) */}
      {messages.length <= 4 && !isLoading && (
        <div className="flex-shrink-0 space-y-1.5">
          <span className="text-[10px] uppercase font-cinzel tracking-wider text-purple-300/80 px-1">
            Domande Rapide per l'Oracolo:
          </span>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none text-[11px]">
            {SUGGESTED_QUESTIONS.map((q, i) => (
              <button
                key={i}
                onClick={() => handleSendMessage(q.text)}
                className="whitespace-nowrap px-3 py-1.5 rounded-xl bg-[#131127] hover:bg-purple-900/40 border border-[#2a244d] hover:border-amber-400/40 text-purple-200 hover:text-amber-300 transition-all flex-shrink-0 text-xs active:scale-95 cursor-pointer"
              >
                {q.text}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Voice Transcript Floating Banner when Recording or Recorded */}
      {(isRecording || speechTranscript) && (
        <div className="bg-[#1d1138] border-2 border-amber-400/80 p-3 sm:p-4 rounded-2xl shadow-2xl space-y-2.5 animate-in slide-in-from-bottom duration-200 flex-shrink-0">
          <div className="flex items-center justify-between border-b border-[#2a244d] pb-2">
            <div className="flex items-center gap-2 text-amber-300 text-xs font-semibold">
              <span className="w-3 h-3 bg-red-500 rounded-full animate-ping" />
              <Mic className="w-4 h-4 text-amber-400" />
              <span>{isRecording ? 'Ascolto in corso... Parla liberamente' : 'Trascrizione Vocale Pronta'}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (isRecording && recognitionRef.current) {
                    recognitionRef.current.stop();
                  }
                  setIsRecording(false);
                  setSpeechTranscript('');
                }}
                className="text-[11px] text-purple-300 hover:text-rose-300 transition"
              >
                Annulla
              </button>
            </div>
          </div>

          <p className="text-xs text-white bg-[#131127] p-2.5 rounded-xl border border-purple-500/30 italic">
            "{speechTranscript || 'In attesa delle tue parole...'}"
          </p>

          <div className="flex items-center justify-end gap-2 text-xs">
            <button
              onClick={() => handleApplyVoiceTranscript(false)}
              disabled={!speechTranscript.trim()}
              className="px-3 py-1.5 bg-[#131127] border border-[#2a244d] text-purple-200 hover:text-white rounded-xl disabled:opacity-50 text-xs transition"
            >
              Modifica nel campo
            </button>
            <button
              onClick={() => handleApplyVoiceTranscript(true)}
              disabled={!speechTranscript.trim()}
              className="px-4 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl disabled:opacity-50 text-xs transition shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Invia all'Oracolo</span>
            </button>
          </div>
        </div>
      )}

      {/* Message Input & Action Bar */}
      <div className="bg-[#131127] border border-[#2a244d] p-2 sm:p-3 rounded-2xl shadow-xl flex-shrink-0 space-y-2">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-end gap-2"
        >
          {/* Voice Mic Button */}
          <button
            type="button"
            onClick={toggleSpeechRecognition}
            className={`p-3 rounded-xl transition-all duration-200 flex-shrink-0 active:scale-95 cursor-pointer ${
              isRecording
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/40 animate-pulse'
                : 'bg-[#1d1138] border border-purple-500/40 text-amber-300 hover:bg-purple-900/50 hover:border-amber-400'
            }`}
            title="Premi per parlare al microfono"
          >
            {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* Textarea Input */}
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
            placeholder="Chiedi all'Oracolo o parla al microfono..."
            className="w-full bg-[#1d1138] border border-[#2a244d] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-purple-400/60 focus:outline-none focus:border-amber-400 resize-none max-h-28"
          />

          {/* Send Button */}
          <button
            type="submit"
            disabled={!inputMessage.trim() || isLoading}
            className="p-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md shadow-amber-500/20 active:scale-95 flex-shrink-0 cursor-pointer"
            title="Invia messaggio"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>

      {/* Groq Settings & API Key Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
          <div className="bg-[#131127] border border-amber-400/60 w-full max-w-lg rounded-3xl p-5 sm:p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#2a244d] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
                  <Settings className="w-4 h-4" />
                </div>
                <h2 className="font-cinzel font-bold text-base text-white">
                  Impostazioni Oracolo Groq AI
                </h2>
              </div>
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="text-purple-300 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Groq API Key Input */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <label className="text-purple-200 font-semibold flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-amber-400" />
                  Chiave API Groq (GROQ_API_KEY)
                </label>
                <a
                  href="https://console.groq.com/keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-amber-400 hover:underline text-[11px] flex items-center gap-1"
                >
                  <span>Ottieni gratis su Groq</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <input
                type="password"
                value={apiKeyInput}
                onChange={(e) => {
                  setApiKeyInput(e.target.value);
                  setKeyTestStatus('idle');
                }}
                placeholder="gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                className="w-full bg-[#1d1138] border border-[#2a244d] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-purple-400/50 focus:outline-none focus:border-amber-400 font-mono"
              />

              <p className="text-[11px] text-purple-300/80 leading-relaxed">
                La tua chiave viene salvata in modo sicuro nel browser di Maria Teresa. Per la pubblicazione su <strong>Vercel</strong>, puoi anche impostarla come variabile d'ambiente <code className="text-amber-300 bg-purple-950 px-1 py-0.5 rounded">VITE_GROQ_API_KEY</code> nel pannello di controllo del progetto.
              </p>
            </div>

            {/* Test Connection Button */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleTestApiKey}
                disabled={keyTestStatus === 'testing' || !apiKeyInput.trim()}
                className="px-3.5 py-2 rounded-xl bg-[#1d1138] hover:bg-purple-900/40 border border-purple-500/40 text-amber-300 text-xs font-semibold transition disabled:opacity-40 flex items-center gap-1.5 active:scale-95 cursor-pointer"
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

              {keyTestStatus === 'success' && (
                <span className="text-emerald-400 text-xs font-semibold flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Chiave Valida!
                </span>
              )}
            </div>

            {/* Model Selection */}
            <div className="space-y-2">
              <label className="text-purple-200 font-semibold text-xs block">
                Modello Linguistico Groq
              </label>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full bg-[#1d1138] border border-[#2a244d] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
              >
                {GROQ_MODELS.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.speed})
                  </option>
                ))}
              </select>
            </div>

            {/* Audio Auto-read Toggle */}
            <div className="pt-2 border-t border-[#2a244d] space-y-3">
              <label className="flex items-center gap-2.5 text-xs text-purple-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoReadResponse}
                  onChange={(e) => setAutoReadResponse(e.target.checked)}
                  className="rounded border-[#2a244d] text-amber-400 focus:ring-amber-400 bg-[#1d1138] w-4 h-4"
                />
                <span>Leggi automaticamente le risposte ad alta voce (Sintesi Vocale)</span>
              </label>

              <label className="flex items-center gap-2.5 text-xs text-purple-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeSanctuaryContext}
                  onChange={(e) => setIncludeSanctuaryContext(e.target.checked)}
                  className="rounded border-[#2a244d] text-amber-400 focus:ring-amber-400 bg-[#1d1138] w-4 h-4"
                />
                <span>Includi dati del Santuario (Fase Lunare, Tarocco, Consulti) nel prompt</span>
              </label>
            </div>

            {/* Vercel Deployment Safety Note */}
            <div className="bg-[#1d1138] p-3 rounded-2xl border border-purple-500/20 text-[11px] text-purple-300 space-y-1">
              <strong className="text-amber-300 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                Zero Errori 500 su Vercel:
              </strong>
              <p>
                Il sistema integra gestione degli errori e fallback oracolare locale. Se la rete o la chiave Groq non dovessero rispondere, l'applicazione fornirà comunque consigli esoterici senza interruzioni.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsSettingsOpen(false)}
                className="px-4 py-2 bg-[#1d1138] border border-[#2a244d] text-purple-300 hover:text-white rounded-xl text-xs"
              >
                Annulla
              </button>
              <button
                type="button"
                onClick={handleSaveSettings}
                className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl text-xs shadow-lg active:scale-95 transition cursor-pointer"
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
