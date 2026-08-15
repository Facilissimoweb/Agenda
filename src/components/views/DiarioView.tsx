import React, { useState, useEffect, useRef } from 'react';
import { JournalCategory, JournalNote, JournalAttachment, JournalAudioRecording } from '../../types';
import { 
  speakItalianText, 
  stopSpeaking, 
  isSpeechRecognitionSupported, 
  isSpeechSynthesisSupported 
} from '../../utils/speech';
import { 
  BookMarked, 
  Plus, 
  Search, 
  Pin, 
  Trash2, 
  Edit3, 
  X, 
  Sparkles, 
  Mic, 
  MicOff, 
  Square, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  MessageSquare, 
  Paperclip, 
  FileText, 
  Image as ImageIcon, 
  Download, 
  Eye, 
  ExternalLink, 
  RotateCcw, 
  Check, 
  Music,
  FileCheck,
  AlertCircle
} from 'lucide-react';

interface DiarioViewProps {
  notes: JournalNote[];
  onAddNote: (note: Omit<JournalNote, 'id'>) => void;
  onUpdateNote: (id: string | number, updated: Partial<JournalNote>) => void;
  onDeleteNote: (id: string | number) => void;
  onShowToast: (msg: string) => void;
  onSendToChat?: (note: JournalNote) => void;
}

// Custom Embedded Audio Player for Voice Notes
const AudioPlayerWidget: React.FC<{
  audioUrl: string;
  duration?: number;
  label?: string;
  onDelete?: () => void;
}> = ({ audioUrl, duration, label, onDelete }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(duration || 0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration)) {
        setTotalDuration(Math.floor(audio.duration));
      }
    };
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.pause();
    };
  }, [audioUrl]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-[#181236]/90 border border-purple-500/40 rounded-xl p-3 flex flex-col sm:flex-row items-center gap-3 shadow-inner">
      <audio ref={audioRef} src={audioUrl} preload="metadata" />

      <button
        type="button"
        onClick={togglePlay}
        className={`w-9 h-9 rounded-full flex items-center justify-center transition shrink-0 ${
          isPlaying
            ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/30'
            : 'bg-purple-900/80 hover:bg-purple-800 text-amber-300 border border-amber-400/40'
        }`}
        title={isPlaying ? 'Metti in pausa' : 'Ascolta registrazione vocale'}
      >
        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
      </button>

      <div className="flex-grow w-full space-y-1">
        <div className="flex items-center justify-between text-[11px] text-purple-300">
          <span className="flex items-center gap-1 font-medium text-amber-300">
            <Music className="w-3 h-3" />
            {label || 'Nota Vocale Registrata'}
          </span>
          <span className="font-mono text-[10px] text-purple-400">
            {formatTime(currentTime)} / {formatTime(totalDuration || currentTime || 0)}
          </span>
        </div>

        <input
          type="range"
          min="0"
          max={totalDuration || 100}
          step="0.1"
          value={currentTime}
          onChange={handleSeek}
          className="w-full h-1.5 bg-[#2a244d] rounded-lg appearance-none cursor-pointer accent-amber-400"
        />
      </div>

      {onDelete && (
        <button
          type="button"
          onClick={onDelete}
          className="text-rose-400 hover:text-rose-300 p-1 rounded-lg hover:bg-rose-950/40 transition shrink-0"
          title="Rimuovi registrazione"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};

export const DiarioView: React.FC<DiarioViewProps> = ({
  notes,
  onAddNote,
  onUpdateNote,
  onDeleteNote,
  onShowToast,
  onSendToChat,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('tutti');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingNote, setEditingNote] = useState<JournalNote | null>(null);

  // Lightbox & PDF viewer modals state
  const [previewPdfUrl, setPreviewPdfUrl] = useState<{ url: string; name: string } | null>(null);
  const [previewImageUrl, setPreviewImageUrl] = useState<{ url: string; name: string } | null>(null);

  // Text to Speech playback state for notes list
  const [speakingNoteId, setSpeakingNoteId] = useState<string | number | null>(null);

  // Form State
  const [formData, setFormData] = useState<{
    title: string;
    category: JournalCategory;
    content: string;
    icon: string;
    pinned: boolean;
    attachments: JournalAttachment[];
    audioRecording?: JournalAudioRecording;
  }>({
    title: '',
    category: 'Personale',
    content: '',
    icon: '📝',
    pinned: false,
    attachments: [],
  });

  // Speech-to-Text Dictation State in Modal
  const speechRecognitionRef = useRef<any>(null);
  const [isDictating, setIsDictating] = useState(false);

  // Audio Voice Recorder State in Modal
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<any>(null);
  const [isAudioRecording, setIsAudioRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopSpeaking();
      if (speechRecognitionRef.current) {
        try {
          speechRecognitionRef.current.stop();
        } catch (e) {}
      }
      if (mediaRecorderRef.current && isAudioRecording) {
        try {
          mediaRecorderRef.current.stop();
        } catch (e) {}
      }
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    };
  }, []);

  const openNewModal = () => {
    setEditingNote(null);
    setFormData({
      title: '',
      category: 'Personale',
      content: '',
      icon: '📝',
      pinned: false,
      attachments: [],
      audioRecording: undefined,
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
      attachments: note.attachments ? [...note.attachments] : [],
      audioRecording: note.audioRecording ? { ...note.audioRecording } : undefined,
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

  // --- 1. SPEECH TO TEXT DICTATION ---
  const toggleDictation = () => {
    if (isDictating) {
      if (speechRecognitionRef.current) {
        speechRecognitionRef.current.stop();
      }
      setIsDictating(false);
      onShowToast('Dettatura vocale interrotta.');
      return;
    }

    if (!isSpeechRecognitionSupported()) {
      onShowToast('La dettatura vocale non è supportata da questo browser. Usa Chrome, Edge o Safari.');
      return;
    }

    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = 'it-IT';
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsDictating(true);
        onShowToast('🎙️ Dettatura attiva: parla in italiano per trascrivere le tue riflessioni...');
      };

      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          setFormData((prev) => ({
            ...prev,
            content: prev.content ? `${prev.content} ${finalTranscript}` : finalTranscript,
          }));
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error in diary:', event.error);
        if (event.error === 'not-allowed') {
          onShowToast('Accesso al microfono negato. Consenti il microfono nelle impostazioni del browser.');
          setIsDictating(false);
        }
      };

      recognition.onend = () => {
        setIsDictating(false);
      };

      speechRecognitionRef.current = recognition;
      recognition.start();
    } catch (e: any) {
      console.error('Dictation start error:', e);
      setIsDictating(false);
      onShowToast('Errore nell\'avvio della dettatura vocale.');
    }
  };

  // --- 2. AUDIO VOICE RECORDER ---
  const startAudioRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mediaRecorder.mimeType || 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64Audio = reader.result as string;
          setFormData((prev) => ({
            ...prev,
            audioRecording: {
              dataUrl: base64Audio,
              duration: recordingSeconds,
              dateAdded: new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }),
            },
          }));
          onShowToast('🎙️ Registrazione vocale audio completata con successo!');
        };
        reader.readAsDataURL(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start(200);
      setIsAudioRecording(true);
      setRecordingSeconds(0);
      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds((sec) => sec + 1);
      }, 1000);
      onShowToast('🔴 Registrazione vocale in corso... Parla liberamente.');
    } catch (err: any) {
      console.error('Error starting audio recording:', err);
      onShowToast('Impossibile accedere al microfono per la registrazione vocale.');
    }
  };

  const stopAudioRecording = () => {
    if (mediaRecorderRef.current && isAudioRecording) {
      mediaRecorderRef.current.stop();
      setIsAudioRecording(false);
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
    }
  };

  const cancelAudioRecording = () => {
    if (mediaRecorderRef.current && isAudioRecording) {
      mediaRecorderRef.current.onstop = null;
      mediaRecorderRef.current.stop();
      setIsAudioRecording(false);
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
      onShowToast('Registrazione vocale annullata.');
    }
  };

  // --- 3. ATTACHMENT UPLOADER (PDF & IMAGES) ---
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file: File) => {
      // Limit to 10MB per file
      if (file.size > 10 * 1024 * 1024) {
        onShowToast(`Il file "${file.name}" supera il limite di 10MB.`);
        return;
      }

      const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
      const isImage = file.type.startsWith('image/');

      if (!isPdf && !isImage) {
        onShowToast(`Formato non supportato per "${file.name}". Carica immagini (JPG, PNG) o documenti PDF.`);
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        const formattedSize =
          file.size < 1024 * 1024
            ? `${(file.size / 1024).toFixed(0)} KB`
            : `${(file.size / (1024 * 1024)).toFixed(1)} MB`;

        const newAttachment: JournalAttachment = {
          id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          name: file.name,
          type: isPdf ? 'pdf' : 'image',
          dataUrl,
          size: formattedSize,
        };

        setFormData((prev) => ({
          ...prev,
          attachments: [...prev.attachments, newAttachment],
        }));
        onShowToast(`File ${isPdf ? 'PDF' : 'immagine'} "${file.name}" aggiunto alla nota.`);
      };
      reader.readAsDataURL(file);
    });

    e.target.value = '';
  };

  const handleRemoveAttachment = (attId: string) => {
    setFormData((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((a) => a.id !== attId),
    }));
    onShowToast('Allegato rimosso.');
  };

  // --- 4. SUBMIT FORM ---
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) {
      onShowToast('Titolo e Contenuto sono obbligatori.');
      return;
    }

    // Stop active dictation or recording before saving
    if (isDictating && speechRecognitionRef.current) {
      speechRecognitionRef.current.stop();
      setIsDictating(false);
    }
    if (isAudioRecording && mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsAudioRecording(false);
    }

    const todayStr = new Date().toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' });

    if (editingNote) {
      onUpdateNote(editingNote.id, {
        title: formData.title,
        category: formData.category,
        content: formData.content,
        icon: formData.icon,
        pinned: formData.pinned,
        attachments: formData.attachments,
        audioRecording: formData.audioRecording,
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
        attachments: formData.attachments,
        audioRecording: formData.audioRecording,
      });
      onShowToast(`Nota "${formData.title}" salvata nel diario segreto!`);
    }

    setIsModalOpen(false);
  };

  const togglePin = (note: JournalNote) => {
    onUpdateNote(note.id, { pinned: !note.pinned });
    onShowToast(note.pinned ? 'Nota sbloccata dall\'alto.' : 'Nota fissata in cima!');
  };

  // TTS Read Note Aloud
  const handleToggleReadAloud = (note: JournalNote) => {
    if (speakingNoteId === note.id) {
      stopSpeaking();
      setSpeakingNoteId(null);
    } else {
      setSpeakingNoteId(note.id);
      speakItalianText(note.content, {
        onEnd: () => setSpeakingNoteId(null),
        onError: () => setSpeakingNoteId(null),
      });
    }
  };

  // Direct attachment to existing note card
  const handleDirectCardFileUpload = (noteId: string | number, e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file: File) => {
      if (file.size > 10 * 1024 * 1024) {
        onShowToast(`Il file "${file.name}" supera il limite di 10MB.`);
        return;
      }

      const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
      const isImage = file.type.startsWith('image/');

      if (!isPdf && !isImage) {
        onShowToast(`Formato non supportato per "${file.name}". Carica PDF o immagini.`);
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        const formattedSize =
          file.size < 1024 * 1024
            ? `${(file.size / 1024).toFixed(0)} KB`
            : `${(file.size / (1024 * 1024)).toFixed(1)} MB`;

        const newAttachment: JournalAttachment = {
          id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          name: file.name,
          type: isPdf ? 'pdf' : 'image',
          dataUrl,
          size: formattedSize,
        };

        const currentNote = notes.find((n) => n.id === noteId);
        const existingAttachments = currentNote?.attachments || [];
        onUpdateNote(noteId, { attachments: [...existingAttachments, newAttachment] });
        onShowToast(`File ${isPdf ? 'PDF' : 'immagine'} "${file.name}" allegato alla nota!`);
      };
      reader.readAsDataURL(file);
    });

    e.target.value = '';
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
      {/* Top Header & Feature Bar */}
      <div className="space-y-3 border-b border-[#2a244d]/70 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold font-cinzel gold-gradient-text flex items-center gap-2">
              <BookMarked className="w-6 h-6 text-amber-400" />
              <span>Diario di Bordo Segreto</span>
            </h1>
            <p className="text-xs text-purple-300 font-light mt-0.5">
              Custodisci le tue canalizzazioni, rituali di luna, file PDF, registrazioni vocali e riflessioni private
            </p>
          </div>

          <button
            onClick={openNewModal}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-bold transition shadow-xl shadow-amber-500/20 active:scale-95 cursor-pointer border border-amber-300/40"
          >
            <Plus className="w-4 h-4" />
            <span>Nuova Nota Privata (con Audio & PDF)</span>
          </button>
        </div>

        {/* Feature Capability Highlights Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
          <div className="p-2.5 rounded-xl bg-[#131127] border border-rose-500/30 flex items-center gap-2 text-xs">
            <div className="w-7 h-7 rounded-lg bg-rose-950/80 flex items-center justify-center text-rose-400 shrink-0">
              <FileText className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="font-semibold text-white text-[11px]">Documenti PDF</p>
              <p className="text-[10px] text-purple-300/70">Anteprima & Download</p>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-[#131127] border border-emerald-500/30 flex items-center gap-2 text-xs">
            <div className="w-7 h-7 rounded-lg bg-emerald-950/80 flex items-center justify-center text-emerald-400 shrink-0">
              <ImageIcon className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="font-semibold text-white text-[11px]">Foto & Altari</p>
              <p className="text-[10px] text-purple-300/70">Galleria Lightbox</p>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-[#131127] border border-amber-500/30 flex items-center gap-2 text-xs">
            <div className="w-7 h-7 rounded-lg bg-amber-950/80 flex items-center justify-center text-amber-400 shrink-0">
              <Mic className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="font-semibold text-white text-[11px]">Dettatura & Audio</p>
              <p className="text-[10px] text-purple-300/70">Microfono & Player</p>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-[#131127] border border-purple-500/30 flex items-center gap-2 text-xs">
            <div className="w-7 h-7 rounded-lg bg-purple-950/80 flex items-center justify-center text-amber-300 shrink-0">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="font-semibold text-white text-[11px]">Chiedi all'Oracolo</p>
              <p className="text-[10px] text-purple-300/70">Invia nota alla Chat</p>
            </div>
          </div>
        </div>
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
              className={`bg-[#131127] border p-5 sm:p-6 rounded-2xl space-y-4 transition-all duration-200 shadow-md ${
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

              {/* Audio Voice Recording Player (if present) */}
              {note.audioRecording && note.audioRecording.dataUrl && (
                <div className="pt-1">
                  <AudioPlayerWidget
                    audioUrl={note.audioRecording.dataUrl}
                    duration={note.audioRecording.duration}
                    label={`Nota Vocale registrata (${note.audioRecording.dateAdded || 'Audio'})`}
                  />
                </div>
              )}

              {/* Attachments Section: Images Gallery & PDF Badges */}
              {note.attachments && note.attachments.length > 0 && (
                <div className="pt-2 border-t border-[#2a244d]/60 space-y-3">
                  {/* Images Gallery */}
                  {note.attachments.filter((a) => a.type === 'image').length > 0 && (
                    <div className="space-y-1.5">
                      <p className="text-[11px] font-medium text-purple-300 flex items-center gap-1.5">
                        <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
                        <span>Immagini Allegate ({note.attachments.filter((a) => a.type === 'image').length})</span>
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                        {note.attachments
                          .filter((a) => a.type === 'image')
                          .map((img) => (
                            <div
                              key={img.id}
                              onClick={() => setPreviewImageUrl({ url: img.dataUrl, name: img.name })}
                              className="group relative aspect-video bg-[#1d1138] rounded-xl overflow-hidden border border-purple-500/30 cursor-pointer shadow hover:border-amber-400 transition"
                            >
                              <img
                                src={img.dataUrl}
                                alt={img.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                              />
                              <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-1 text-white text-[10px]">
                                <Eye className="w-3.5 h-3.5" />
                                <span>Ingrandisci</span>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* PDFs List */}
                  {note.attachments.filter((a) => a.type === 'pdf').length > 0 && (
                    <div className="space-y-1.5">
                      <p className="text-[11px] font-medium text-purple-300 flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-rose-400" />
                        <span>Documenti PDF ({note.attachments.filter((a) => a.type === 'pdf').length})</span>
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {note.attachments
                          .filter((a) => a.type === 'pdf')
                          .map((pdf) => (
                            <div
                              key={pdf.id}
                              className="bg-[#181236] border border-rose-500/30 rounded-xl p-2.5 flex items-center justify-between gap-2 shadow-sm"
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <div className="w-8 h-8 rounded-lg bg-rose-950/80 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0">
                                  <FileText className="w-4 h-4" />
                                </div>
                                <div className="truncate">
                                  <p className="text-xs font-medium text-purple-100 truncate" title={pdf.name}>
                                    {pdf.name}
                                  </p>
                                  <p className="text-[10px] text-purple-400">{pdf.size || 'PDF'}</p>
                                </div>
                              </div>

                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => setPreviewPdfUrl({ url: pdf.dataUrl, name: pdf.name })}
                                  className="p-1.5 rounded-lg bg-purple-900/60 hover:bg-purple-800 text-amber-300 hover:text-white transition text-xs flex items-center gap-1"
                                  title="Visualizza PDF in anteprima"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  <span className="text-[10px] hidden sm:inline">Vedi</span>
                                </button>

                                <a
                                  href={pdf.dataUrl}
                                  download={pdf.name}
                                  className="p-1.5 rounded-lg bg-[#2a244d] hover:bg-purple-700 text-purple-200 hover:text-white transition text-xs flex items-center gap-1"
                                  title="Scarica file PDF"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                </a>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Bottom Card Actions: Send to Chat, Listen Aloud & Quick Attachment */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-[#2a244d]/60">
                <div className="flex flex-wrap items-center gap-2">
                  {/* Voice Reading Text-to-Speech */}
                  <button
                    type="button"
                    onClick={() => handleToggleReadAloud(note)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer ${
                      speakingNoteId === note.id
                        ? 'bg-amber-400 text-slate-950 font-bold animate-pulse shadow-md shadow-amber-400/20'
                        : 'bg-[#1d1138] hover:bg-[#2a244d] text-purple-200 hover:text-amber-300 border border-[#2a244d]'
                    }`}
                    title="Ascolta la lettura vocale della riflessione tramite voce sintetica"
                  >
                    {speakingNoteId === note.id ? (
                      <>
                        <VolumeX className="w-3.5 h-3.5" />
                        <span>Ferma Lettura</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                        <span>Ascolta Testo</span>
                      </>
                    )}
                  </button>

                  {/* Direct Add Attachment Button to this Card */}
                  <label className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[#1d1138] hover:bg-purple-900/40 text-purple-300 hover:text-amber-300 border border-[#2a244d] text-xs font-medium cursor-pointer transition">
                    <Paperclip className="w-3 h-3 text-amber-400" />
                    <span>+ Allega PDF / Foto</span>
                    <input
                      type="file"
                      multiple
                      accept="application/pdf,image/png,image/jpeg,image/webp,image/gif"
                      onChange={(e) => handleDirectCardFileUpload(note.id, e)}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Send Content to Chat / Oracle Button */}
                {onSendToChat && (
                  <button
                    type="button"
                    onClick={() => onSendToChat(note)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-purple-900 via-indigo-900 to-purple-950 hover:from-purple-800 hover:to-indigo-800 border border-amber-400/40 text-amber-300 hover:text-amber-200 text-xs font-bold shadow-lg shadow-purple-950/50 transition active:scale-95 cursor-pointer"
                    title="Rivolgi il contenuto di questa nota all'Oracolo nella Chat"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin-slow" />
                    <span>Chiedi all'Oracolo</span>
                    <MessageSquare className="w-3.5 h-3.5 ml-0.5 text-purple-300" />
                  </button>
                )}
              </div>
            </article>
          ))
        )}
      </div>

      {/* --- ADD / EDIT NOTE MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-[#131127] border border-amber-400/60 rounded-3xl max-w-xl w-full p-5 sm:p-6 shadow-2xl relative space-y-4 my-8 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => {
                if (isDictating && speechRecognitionRef.current) speechRecognitionRef.current.stop();
                if (isAudioRecording && mediaRecorderRef.current) mediaRecorderRef.current.stop();
                setIsModalOpen(false);
              }}
              className="absolute top-4 right-4 text-purple-400 hover:text-white p-1 rounded-lg hover:bg-purple-900/40 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-[#2a244d]/70 pb-3">
              <span className="text-2xl">{formData.icon || '📓'}</span>
              <div>
                <h3 className="font-cinzel text-base font-bold text-white">
                  {editingNote ? 'Modifica Nota Privata' : 'Nuova Nota nel Diario Segreto'}
                </h3>
                <p className="text-xs text-amber-300">
                  Custodisci visioni, file PDF, registrazioni vocali e canalizzazioni
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* Title Input */}
              <div>
                <label className="block text-purple-300 mb-1 font-medium">Titolo della Nota *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Es. Visioni sotto la Luna Piena, Consulto speciale..."
                  className="w-full bg-[#1d1138] border border-[#2a244d] rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-amber-400 text-xs"
                />
              </div>

              {/* Category & Icon */}
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

              {/* Pin Checkbox */}
              <div className="flex items-center gap-2 pt-0.5">
                <input
                  type="checkbox"
                  id="pin-checkbox"
                  checked={formData.pinned}
                  onChange={(e) => setFormData({ ...formData, pinned: e.target.checked })}
                  className="w-4 h-4 rounded text-amber-400 bg-[#1d1138] border-[#2a244d] focus:ring-amber-400"
                />
                <label htmlFor="pin-checkbox" className="text-purple-200 cursor-pointer text-xs">
                  Fissa questa nota in cima al diario
                </label>
              </div>

              {/* Content Textarea with Live Dictation Button */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-purple-300 font-medium">Contenuto della Nota *</label>

                  {/* Dictation (Speech to Text) Button */}
                  <button
                    type="button"
                    onClick={toggleDictation}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition ${
                      isDictating
                        ? 'bg-rose-500 text-white animate-pulse shadow-md shadow-rose-500/30'
                        : 'bg-purple-900/60 hover:bg-purple-800 text-amber-300 border border-purple-500/30'
                    }`}
                    title={isDictating ? 'Ferma dettatura' : 'Attiva dettatura vocale in italiano'}
                  >
                    {isDictating ? (
                      <>
                        <MicOff className="w-3.5 h-3.5 text-white" />
                        <span>Ferma Dettatura</span>
                      </>
                    ) : (
                      <>
                        <Mic className="w-3.5 h-3.5 text-amber-400" />
                        <span>Dettatura Vocale (Microfono)</span>
                      </>
                    )}
                  </button>
                </div>

                {isDictating && (
                  <div className="bg-rose-950/40 border border-rose-500/40 rounded-xl p-2.5 text-[11px] text-rose-200 flex items-center gap-2 animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping" />
                    <span>Microfono attivo: parla liberamente, il testo verrà inserito automaticamente...</span>
                  </div>
                )}

                <textarea
                  rows={5}
                  required
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Scrivi o detta qui i dettagli del rito, le carte estratte, i simboli del sogno o le tue riflessioni interiori..."
                  className="w-full bg-[#1d1138] border border-[#2a244d] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-400 text-xs font-light leading-relaxed"
                />
              </div>

              {/* --- AUDIO VOICE RECORDER SECTION --- */}
              <div className="bg-[#181236]/80 border border-[#2a244d] rounded-2xl p-3.5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Music className="w-4 h-4 text-amber-400" />
                    <span className="font-semibold text-purple-100 text-xs">Registrazione Vocale Audio</span>
                  </div>

                  {!formData.audioRecording && !isAudioRecording && (
                    <button
                      type="button"
                      onClick={startAudioRecording}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-900/80 hover:bg-purple-800 text-amber-300 border border-amber-400/30 text-xs font-medium transition"
                    >
                      <Mic className="w-3.5 h-3.5 text-amber-400" />
                      <span>Registra Audio</span>
                    </button>
                  )}
                </div>

                {/* Active Recording State */}
                {isAudioRecording && (
                  <div className="bg-rose-950/60 border border-rose-500/60 rounded-xl p-3 flex items-center justify-between gap-3 animate-pulse">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping" />
                      <span className="font-mono font-bold text-rose-300 text-xs">
                        REGISTRAZIONE IN CORSO: {Math.floor(recordingSeconds / 60).toString().padStart(2, '0')}:{(recordingSeconds % 60).toString().padStart(2, '0')}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={stopAudioRecording}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow transition flex items-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Salva Audio</span>
                      </button>

                      <button
                        type="button"
                        onClick={cancelAudioRecording}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition"
                        title="Annulla registrazione"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Recorded Audio Player & Options */}
                {formData.audioRecording && (
                  <div className="space-y-2">
                    <AudioPlayerWidget
                      audioUrl={formData.audioRecording.dataUrl}
                      duration={formData.audioRecording.duration}
                      label="Nota Vocale Allegata"
                      onDelete={() => {
                        setFormData({ ...formData, audioRecording: undefined });
                        onShowToast('Registrazione vocale rimossa.');
                      }}
                    />
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={startAudioRecording}
                        className="text-[11px] text-amber-300/80 hover:text-amber-200 flex items-center gap-1"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Sovrascrivi / Registra di nuovo</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* --- FILE ATTACHMENTS (PDF & IMAGES) SECTION --- */}
              <div className="bg-[#181236]/80 border border-[#2a244d] rounded-2xl p-3.5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Paperclip className="w-4 h-4 text-amber-400" />
                    <span className="font-semibold text-purple-100 text-xs">
                      Allegati: Immagini & Documenti PDF
                    </span>
                  </div>

                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-900/80 hover:bg-purple-800 text-amber-300 border border-amber-400/30 text-xs font-medium cursor-pointer transition">
                    <Plus className="w-3.5 h-3.5 text-amber-400" />
                    <span>Carica PDF o Foto</span>
                    <input
                      type="file"
                      multiple
                      accept="application/pdf,image/png,image/jpeg,image/webp,image/gif"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Uploaded Files Preview List */}
                {formData.attachments.length > 0 ? (
                  <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                    {formData.attachments.map((att) => (
                      <div
                        key={att.id}
                        className="flex items-center justify-between gap-2 p-2 rounded-xl bg-[#131127] border border-purple-500/20 text-xs"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          {att.type === 'pdf' ? (
                            <FileText className="w-4 h-4 text-rose-400 shrink-0" />
                          ) : (
                            <ImageIcon className="w-4 h-4 text-emerald-400 shrink-0" />
                          )}
                          <span className="text-purple-100 truncate" title={att.name}>
                            {att.name}
                          </span>
                          <span className="text-[10px] text-purple-400 shrink-0">({att.size})</span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveAttachment(att.id)}
                          className="text-rose-400 hover:text-rose-300 p-1 rounded hover:bg-rose-950/40 transition shrink-0"
                          title="Rimuovi allegato"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-purple-300/60 font-light italic">
                    Puoi allegare referti, schede astrologiche in PDF, fotografie di rituali o carte dei tarocchi estratte.
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold uppercase tracking-wider rounded-xl transition shadow-lg shadow-amber-500/20 text-xs active:scale-95 cursor-pointer mt-2"
              >
                {editingNote ? 'Salva Modifiche' : 'Salva nel Diario'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- PDF PREVIEW MODAL --- */}
      {previewPdfUrl && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-6">
          <div className="bg-[#131127] border border-amber-400/60 rounded-3xl max-w-4xl w-full h-[85vh] flex flex-col shadow-2xl relative overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 border-b border-[#2a244d] flex items-center justify-between gap-3 bg-[#181236]">
              <div className="flex items-center gap-2 min-w-0">
                <FileText className="w-5 h-5 text-rose-400 shrink-0" />
                <h3 className="font-cinzel text-sm font-bold text-white truncate" title={previewPdfUrl.name}>
                  {previewPdfUrl.name}
                </h3>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={previewPdfUrl.url}
                  download={previewPdfUrl.name}
                  className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs transition flex items-center gap-1.5 shadow"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Scarica PDF</span>
                </a>

                <button
                  onClick={() => setPreviewPdfUrl(null)}
                  className="p-1.5 rounded-xl text-purple-300 hover:text-white hover:bg-purple-900/40 transition"
                  title="Chiudi visualizzatore"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Embedded PDF Viewer */}
            <div className="flex-grow w-full bg-[#0d0a1a] p-2">
              <iframe
                src={previewPdfUrl.url}
                title={previewPdfUrl.name}
                className="w-full h-full rounded-2xl border border-purple-500/20"
              />
            </div>
          </div>
        </div>
      )}

      {/* --- IMAGE LIGHTBOX MODAL --- */}
      {previewImageUrl && (
        <div 
          onClick={() => setPreviewImageUrl(null)}
          className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4 cursor-zoom-out"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="max-w-4xl max-h-[85vh] relative rounded-2xl overflow-hidden border border-amber-400/60 shadow-2xl bg-[#131127]"
          >
            <button
              onClick={() => setPreviewImageUrl(null)}
              className="absolute top-3 right-3 bg-slate-950/80 hover:bg-slate-900 text-white p-2 rounded-full border border-purple-500/30 transition shadow z-10"
              title="Chiudi immagine"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={previewImageUrl.url}
              alt={previewImageUrl.name}
              className="max-w-full max-h-[80vh] object-contain mx-auto"
            />
            <div className="p-3 bg-[#181236] border-t border-[#2a244d] text-center">
              <p className="text-xs text-purple-200 font-medium truncate">{previewImageUrl.name}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
