import React, { useState, useEffect, useRef } from 'react';
import { DriveFile, GoogleDriveUser, JournalNote, JournalCategory } from '../../types';
import { 
  listDriveFiles, 
  downloadDriveFileText, 
  isDriveAuthenticated,
  getGoogleUser,
  signInWithGoogleDrive,
  signInWithGoogleIdentity
} from '../../services/googleDriveService';
import { 
  speakItalianText, 
  stopSpeaking, 
  isSpeechSynthesisSupported 
} from '../../utils/speech';
import { 
  FileText, 
  Sparkles, 
  UploadCloud, 
  FolderOpen, 
  Cloud, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Copy, 
  Check, 
  BookOpen, 
  Plus, 
  Search, 
  X, 
  FileCode, 
  RotateCcw, 
  Send, 
  ArrowRight, 
  Brain, 
  ChevronDown,
  ChevronUp,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  FileCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SmartReadingAnalyzerProps {
  onSendToChat: (prompt: string) => void;
  onSaveAsJournalNote?: (note: Omit<JournalNote, 'id'>) => void;
  onShowToast: (msg: string) => void;
  onOpenGoogleDriveModal?: () => void;
  journalNotes?: JournalNote[];
}

export const SmartReadingAnalyzer: React.FC<SmartReadingAnalyzerProps> = ({
  onSendToChat,
  onSaveAsJournalNote,
  onShowToast,
  onOpenGoogleDriveModal,
  journalNotes = [],
}) => {
  // Mode selection & view state
  const [activeSourceTab, setActiveSourceTab] = useState<'upload' | 'drive' | 'notes'>('upload');
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  // Drag & Drop State
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Loaded File State
  const [loadedFileName, setLoadedFileName] = useState<string | null>(null);
  const [loadedFileContent, setLoadedFileContent] = useState<string>('');
  const [loadedFileSize, setLoadedFileSize] = useState<string>('');
  const [loadedSource, setLoadedSource] = useState<'drive' | 'upload' | 'diary' | null>(null);
  const [driveFileId, setDriveFileId] = useState<string | null>(null);

  // Drive state
  const [driveFiles, setDriveFiles] = useState<DriveFile[]>([]);
  const [isLoadingDriveFiles, setIsLoadingDriveFiles] = useState<boolean>(false);
  const [driveSearch, setDriveSearch] = useState<string>('');
  const [driveError, setDriveError] = useState<string | null>(null);
  const [isAuthenticatingDrive, setIsAuthenticatingDrive] = useState<boolean>(false);
  const [readingFileId, setReadingFileId] = useState<string | null>(null);

  // Text viewer state
  const [textSearchQuery, setTextSearchQuery] = useState<string>('');
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [analysisPromptType, setAnalysisPromptType] = useState<'complete' | 'symbols' | 'rituals' | 'actionable'>('complete');

  // Stats calculation
  const characterCount = loadedFileContent.length;
  const wordCount = loadedFileContent.trim() ? loadedFileContent.trim().split(/\s+/).length : 0;
  const readingTimeMinutes = Math.max(1, Math.ceil(wordCount / 180));

  // Check Drive files when tab is switched to 'drive'
  const loadDriveFiles = async () => {
    if (!isDriveAuthenticated()) {
      setDriveFiles([]);
      return;
    }

    setIsLoadingDriveFiles(true);
    setDriveError(null);
    try {
      const res = await listDriveFiles({
        mimeTypeFilter: 'text',
        pageSize: 40,
        query: driveSearch.trim() || undefined,
      });

      if (res.error) {
        setDriveError(res.error);
      } else {
        setDriveFiles(res.files);
      }
    } catch (err: any) {
      setDriveError(err.message || 'Errore durante il recupero dei file da Drive.');
    } finally {
      setIsLoadingDriveFiles(false);
    }
  };

  useEffect(() => {
    if (activeSourceTab === 'drive') {
      loadDriveFiles();
    }
  }, [activeSourceTab]);

  // Handle Local File Upload / Drop
  const handleProcessFile = (file: File) => {
    const isText = 
      file.type.startsWith('text/') || 
      file.name.endsWith('.txt') || 
      file.name.endsWith('.md') || 
      file.name.endsWith('.json') || 
      file.name.endsWith('.csv') ||
      file.name.endsWith('.log');

    if (!isText) {
      onShowToast(`Il file "${file.name}" non è un file di testo. Carica file .txt, .md o .json.`);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      onShowToast(`Il file supera il limite consigliato di 5MB.`);
      return;
    }

    const formattedSize = file.size < 1024 * 1024 
      ? `${(file.size / 1024).toFixed(1)} KB` 
      : `${(file.size / (1024 * 1024)).toFixed(2)} MB`;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setLoadedFileName(file.name);
      setLoadedFileContent(content);
      setLoadedFileSize(formattedSize);
      setLoadedSource('upload');
      setDriveFileId(null);
      stopSpeaking();
      setIsSpeaking(false);
      onShowToast(`✨ File "${file.name}" caricato per la Lettura Intelligente!`);
    };
    reader.onerror = () => {
      onShowToast('Errore durante la lettura del file locale.');
    };
    reader.readAsText(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleProcessFile(e.dataTransfer.files[0]);
    }
  };

  // Handle Drive File Selection
  const handleSelectDriveFile = async (file: DriveFile) => {
    setReadingFileId(file.id);
    try {
      const res = await downloadDriveFileText(file.id, file.mimeType);
      if (res.error || res.content === undefined) {
        throw new Error(res.error || 'Impossibile leggere il file da Drive.');
      }

      setLoadedFileName(file.name);
      setLoadedFileContent(res.content);
      setLoadedFileSize(file.size ? `${(parseInt(file.size, 10) / 1024).toFixed(1)} KB` : 'Drive Doc');
      setLoadedSource('drive');
      setDriveFileId(file.id);
      stopSpeaking();
      setIsSpeaking(false);
      onShowToast(`📖 "${file.name}" caricato con successo da Google Drive!`);
    } catch (err: any) {
      onShowToast(`Errore lettura file Drive: ${err.message}`);
    } finally {
      setReadingFileId(null);
    }
  };

  // Handle Diary Note Selection
  const handleSelectDiaryNote = (note: JournalNote) => {
    setLoadedFileName(`${note.icon || '📝'} ${note.title}`);
    setLoadedFileContent(note.content);
    setLoadedFileSize(`${note.date} • ${note.category}`);
    setLoadedSource('diary');
    setDriveFileId(null);
    stopSpeaking();
    setIsSpeaking(false);
    onShowToast(`📔 Nota "${note.title}" caricata nella Lettura Intelligente!`);
  };

  // Google Sign-In helper inside widget
  const handleDriveLogin = async () => {
    setIsAuthenticatingDrive(true);
    try {
      const res = await signInWithGoogleDrive();
      if (res) {
        onShowToast(`🌙 Connesso a Google Drive (${res.user.email || 'Maria Teresa'})!`);
        loadDriveFiles();
      }
    } catch (err: any) {
      onShowToast(`Accesso non completato: ${err.message}`);
    } finally {
      setIsAuthenticatingDrive(false);
    }
  };

  // Copy text to clipboard
  const handleCopyText = async () => {
    if (!loadedFileContent) return;
    try {
      await navigator.clipboard.writeText(loadedFileContent);
      setIsCopied(true);
      onShowToast('📋 Testo copiato negli appunti!');
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      onShowToast('Impossibile copiare il testo.');
    }
  };

  // TTS Read Aloud
  const handleToggleSpeech = () => {
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
      onShowToast('Lettura vocale interrotta.');
    } else {
      if (!loadedFileContent.trim()) return;
      setIsSpeaking(true);
      // Read first 1200 characters if very long, or full text
      const speechSample = loadedFileContent.slice(0, 2000);
      speakItalianText(speechSample, {
        onEnd: () => setIsSpeaking(false),
        onError: () => setIsSpeaking(false),
      });
      onShowToast('🗣️ Lettura vocale avviata...');
    }
  };

  // Clear loaded file
  const handleClearFile = () => {
    setLoadedFileName(null);
    setLoadedFileContent('');
    setLoadedFileSize('');
    setLoadedSource(null);
    setDriveFileId(null);
    stopSpeaking();
    setIsSpeaking(false);
    onShowToast('File rimosso dal lettore.');
  };

  // --- SEND TO ORACLE CHAT ACTIONS ---
  const handleSendToOracle = (type: 'complete' | 'symbols' | 'rituals' | 'actionable') => {
    if (!loadedFileContent.trim() || !loadedFileName) {
      onShowToast('Nessun file o contenuto di testo caricato.');
      return;
    }

    const cleanTitle = loadedFileName.replace(/\.[^/.]+$/, '');
    let promptText = '';

    // Truncate cleanly if enormous for chat prompt context
    const maxPreviewChars = 6000;
    const contentToSend = loadedFileContent.length > maxPreviewChars 
      ? loadedFileContent.substring(0, maxPreviewChars) + '\n\n[...Testo completo disponibile nel Diario...]'
      : loadedFileContent;

    if (type === 'complete') {
      promptText = `[Lettura Intelligente dal Diario - Documento: "${cleanTitle}"]\n\nCONTENUTO DEL TESTO:\n"""\n${contentToSend}\n"""\n\nCara Guida Oracolare, analizza in profondità questo testo. Ti chiedo di offrirmi:\n1. 🌟 Sintesi Essenziale & Temi Chiave emersi;\n2. 🔮 Decodifica Simbolica, Archetipica ed Esoterica;\n3. 🌿 Consigli Pratici, Rituali o Indicazioni di Cura consigliate per Maria Teresa. ✨`;
    } else if (type === 'symbols') {
      promptText = `[Decodifica Simbolica & Esoterica - Documento: "${cleanTitle}"]\n\nTESTO ANALIZZATO:\n"""\n${contentToSend}\n"""\n\nCara Guida Oracolare, quali carte dei Tarocchi, pianeti/segni astrologici, elementi alchemici o cristalli risuonano maggiormente con questo testo? Spiegami le sincronicità e le corrispondenze spirituali. 🌌`;
    } else if (type === 'rituals') {
      promptText = `[Canalizzazione Rituale & Pratiche - Documento: "${cleanTitle}"]\n\nTESTO DI PARTENZA:\n"""\n${contentToSend}\n"""\n\nCara Guida Oracolare, ispirandoti a questo testo, suggeriscimi un rituale sacro, una meditazione o una formula di intenzione adatta per Maria Teresa. Indica erbe, incensi o fasi lunari ideali. 🕯️`;
    } else {
      promptText = `[Consulenza & Punti di Azione - Documento: "${cleanTitle}"]\n\nTESTO ANALIZZATO:\n"""\n${contentToSend}\n"""\n\nCara Guida Oracolare, estrai da questo documento i punti d'azione prioritari, le intuizioni da custodire in agenda e le risposte alle domande implicite del testo. 📝✨`;
    }

    onSendToChat(promptText);
  };

  // --- SAVE DIRECTLY AS JOURNAL NOTE ---
  const handleSaveAsNote = () => {
    if (!loadedFileContent.trim() || !loadedFileName) {
      onShowToast('Nessun testo da salvare.');
      return;
    }

    if (onSaveAsJournalNote) {
      const cleanTitle = loadedFileName.replace(/\.[^/.]+$/, '');
      const todayStr = new Date().toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' });
      
      onSaveAsJournalNote({
        title: `Lettura: ${cleanTitle}`,
        category: 'Tarocchi',
        date: todayStr,
        icon: '📜',
        content: `[Fonte: ${loadedSource === 'drive' ? 'Google Drive' : 'File Locale'} - "${loadedFileName}"]\n\n${loadedFileContent}`,
        pinned: false,
      });

      onShowToast(`✨ Documento salvato con successo come nuova nota nel Diario!`);
    }
  };

  return (
    <div className="bg-[#120f2b] border border-amber-400/40 rounded-3xl overflow-hidden shadow-2xl transition-all">
      {/* HEADER BANNER */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-[#1b1442] via-[#241a54] to-[#17113a] border-b border-amber-400/30 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-400/20 border border-amber-400/50 flex items-center justify-center text-amber-300 shadow-md flex-shrink-0">
            <Brain className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-cinzel font-bold text-sm sm:text-base text-white gold-gradient-text">
                Lettura Intelligente & Analisi Testi
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-950/80 border border-amber-400/40 text-amber-300 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                Google Drive + Oracolo AI
              </span>
            </div>
            <p className="text-xs text-purple-200/80 mt-0.5">
              Trascina o seleziona file <span className="text-amber-300 font-mono">.txt</span> da Google Drive o dal tuo dispositivo per analizzarli nella Chat dell'Oracolo.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {loadedFileName && (
            <button
              onClick={handleClearFile}
              className="px-2.5 py-1.5 bg-purple-950/80 hover:bg-purple-900 border border-purple-500/30 rounded-xl text-xs text-purple-300 hover:text-white transition flex items-center gap-1 cursor-pointer"
              title="Carica un altro file"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Nuovo File</span>
            </button>
          )}

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 text-purple-300 hover:text-white hover:bg-purple-900/40 rounded-xl transition cursor-pointer"
            title={isExpanded ? 'Comprimi pannello' : 'Espandi pannello'}
          >
            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* EXPANDED CONTENT */}
      {isExpanded && (
        <div className="p-4 sm:p-6 space-y-5">
          {/* STAGE 1: NO FILE LOADED -> SOURCE SELECTOR & DROPZONE */}
          {!loadedFileName ? (
            <div className="space-y-4">
              {/* SOURCE SELECTOR TABS */}
              <div className="flex items-center gap-2 p-1.5 bg-[#171238] rounded-2xl border border-purple-500/30 w-full sm:w-auto self-start">
                <button
                  type="button"
                  onClick={() => setActiveSourceTab('upload')}
                  className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer ${
                    activeSourceTab === 'upload'
                      ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                      : 'text-purple-300 hover:text-white'
                  }`}
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>Trascina / Carica .TXT</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveSourceTab('drive')}
                  className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer ${
                    activeSourceTab === 'drive'
                      ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                      : 'text-purple-300 hover:text-white'
                  }`}
                >
                  <Cloud className="w-4 h-4" />
                  <span>Google Drive {isDriveAuthenticated() ? '✓' : ''}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveSourceTab('notes')}
                  className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer ${
                    activeSourceTab === 'notes'
                      ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                      : 'text-purple-300 hover:text-white'
                  }`}
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Note del Diario ({journalNotes.length})</span>
                </button>
              </div>

              {/* TAB 1: LOCAL DRAG & DROP ZONE */}
              {activeSourceTab === 'upload' && (
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`relative border-2 border-dashed rounded-3xl p-8 sm:p-10 text-center transition-all cursor-pointer ${
                    isDragging
                      ? 'border-amber-400 bg-amber-400/10 scale-[1.01] shadow-2xl shadow-amber-400/20'
                      : 'border-purple-500/40 hover:border-amber-400/60 bg-[#161136]/70 hover:bg-[#19143d]'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".txt,.md,.json,.csv,.log,text/plain"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        handleProcessFile(e.target.files[0]);
                      }
                      e.target.value = '';
                    }}
                  />

                  <div className="max-w-md mx-auto space-y-3">
                    <div className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center transition ${
                      isDragging ? 'bg-amber-400 text-slate-950 scale-110' : 'bg-purple-950/80 border border-amber-400/40 text-amber-300'
                    }`}>
                      <FileText className="w-8 h-8" />
                    </div>

                    <div className="space-y-1">
                      <h3 className="font-cinzel font-bold text-sm sm:text-base text-white">
                        {isDragging ? 'Rilascia il file .txt qui...' : 'Trascina qui il tuo file .txt o clicca per sfogliare'}
                      </h3>
                      <p className="text-xs text-purple-300">
                        Supporta file di testo <span className="text-amber-300 font-mono">.txt</span>, appunti <span className="text-amber-300 font-mono">.md</span> e trascrizioni di consulti.
                      </p>
                    </div>

                    <div className="pt-2 flex items-center justify-center gap-2 text-[11px] text-purple-400">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Elaborazione locale sicura e confidenziale</span>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: GOOGLE DRIVE BROWSER */}
              {activeSourceTab === 'drive' && (
                <div className="bg-[#151033] border border-purple-500/30 rounded-3xl p-4 sm:p-5 space-y-4">
                  {!isDriveAuthenticated() ? (
                    <div className="text-center py-8 px-4 space-y-3 max-w-md mx-auto">
                      <div className="w-14 h-14 rounded-2xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center mx-auto text-amber-300">
                        <Cloud className="w-7 h-7" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-cinzel font-bold text-sm text-white gold-gradient-text">
                          Connetti il tuo Google Drive
                        </h4>
                        <p className="text-xs text-purple-300">
                          Accedi per selezionare i file .txt, documenti e manuali salvati nel tuo account Google.
                        </p>
                      </div>

                      <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={handleDriveLogin}
                          disabled={isAuthenticatingDrive}
                          className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition active:scale-95 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          <Cloud className="w-4 h-4" />
                          <span>{isAuthenticatingDrive ? 'Connessione...' : 'Accedi a Google Drive'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={onOpenGoogleDriveModal}
                          className="w-full sm:w-auto px-4 py-2.5 bg-purple-900/60 hover:bg-purple-900 border border-purple-400/40 text-amber-300 text-xs rounded-xl transition cursor-pointer"
                        >
                          Apri Modulo Drive Completo
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {/* Search & Refresh */}
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="relative flex-1 min-w-[200px]">
                          <input
                            type="text"
                            value={driveSearch}
                            onChange={(e) => setDriveSearch(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && loadDriveFiles()}
                            placeholder="Cerca file .txt su Drive..."
                            className="w-full bg-[#1e1747] border border-purple-500/40 rounded-xl px-3.5 py-2 pl-9 text-xs text-white placeholder-purple-400/60 focus:outline-none focus:border-amber-400"
                          />
                          <Search className="w-3.5 h-3.5 text-purple-400 absolute left-3 top-2.5" />
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={loadDriveFiles}
                            disabled={isLoadingDriveFiles}
                            className="p-2 bg-purple-950/80 hover:bg-purple-900 border border-purple-500/40 text-amber-300 rounded-xl text-xs transition cursor-pointer disabled:opacity-50"
                            title="Aggiorna elenco file Drive"
                          >
                            <RefreshCw className={`w-4 h-4 ${isLoadingDriveFiles ? 'animate-spin' : ''}`} />
                          </button>

                          <button
                            type="button"
                            onClick={onOpenGoogleDriveModal}
                            className="px-3 py-2 bg-purple-900/60 hover:bg-purple-800 border border-purple-400/40 text-amber-300 text-xs rounded-xl font-semibold transition cursor-pointer flex items-center gap-1"
                          >
                            <span>Gestione Drive</span>
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      {/* Drive Files List */}
                      {isLoadingDriveFiles ? (
                        <div className="text-center py-8 text-purple-300 space-y-2">
                          <RefreshCw className="w-5 h-5 animate-spin mx-auto text-amber-400" />
                          <p className="text-xs">Ricerca file su Google Drive in corso...</p>
                        </div>
                      ) : driveError ? (
                        <div className="p-3 bg-rose-950/50 border border-rose-500/40 rounded-xl text-xs text-rose-200 flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                          <span>{driveError}</span>
                        </div>
                      ) : driveFiles.length === 0 ? (
                        <div className="text-center py-8 text-purple-300/80 bg-[#120e29] border border-purple-500/20 rounded-2xl space-y-1">
                          <FileText className="w-6 h-6 mx-auto text-purple-400/50" />
                          <p className="text-xs">Nessun file .txt trovato su Google Drive.</p>
                          <p className="text-[11px] text-purple-400/60">Usa il tab "Carica .TXT" o carica file dal modulo Drive.</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-72 overflow-y-auto pr-1">
                          {driveFiles.map((file) => (
                            <button
                              key={file.id}
                              type="button"
                              onClick={() => handleSelectDriveFile(file)}
                              disabled={readingFileId === file.id}
                              className="p-3 bg-[#1c1642] hover:bg-[#231b54] border border-purple-500/30 hover:border-amber-400/60 rounded-2xl text-left transition flex items-center justify-between gap-2.5 cursor-pointer group disabled:opacity-50"
                            >
                              <div className="flex items-center gap-2.5 overflow-hidden">
                                <div className="p-2 rounded-xl bg-purple-950/80 border border-purple-500/40 text-amber-300 shrink-0 group-hover:bg-amber-400 group-hover:text-slate-950 transition">
                                  <FileText className="w-4 h-4" />
                                </div>
                                <div className="overflow-hidden">
                                  <h5 className="font-semibold text-xs text-white truncate group-hover:text-amber-300 transition" title={file.name}>
                                    {file.name}
                                  </h5>
                                  <p className="text-[10px] text-purple-300/70">
                                    {file.modifiedTime ? new Date(file.modifiedTime).toLocaleDateString('it-IT') : ''}
                                    {file.size ? ` • ${(parseInt(file.size, 10) / 1024).toFixed(0)} KB` : ''}
                                  </p>
                                </div>
                              </div>

                              <div className="shrink-0 text-amber-400 text-xs font-semibold flex items-center gap-1 group-hover:translate-x-0.5 transition">
                                {readingFileId === file.id ? (
                                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <>
                                    <span>Leggi</span>
                                    <ArrowRight className="w-3.5 h-3.5" />
                                  </>
                                )}
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: EXISTING DIARY NOTES SELECTOR */}
              {activeSourceTab === 'notes' && (
                <div className="bg-[#151033] border border-purple-500/30 rounded-3xl p-4 sm:p-5 space-y-3">
                  <h4 className="font-cinzel font-bold text-xs text-amber-300">
                    Scegli una nota già custodita nel tuo Diario per l'analisi intelligente:
                  </h4>

                  {journalNotes.length === 0 ? (
                    <p className="text-xs text-purple-300/70 py-4 text-center">Nessuna nota presente nel diario.</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-64 overflow-y-auto pr-1">
                      {journalNotes.map((note) => (
                        <button
                          key={note.id}
                          type="button"
                          onClick={() => handleSelectDiaryNote(note)}
                          className="p-3 bg-[#1c1642] hover:bg-[#231b54] border border-purple-500/30 hover:border-amber-400/60 rounded-2xl text-left transition flex items-center justify-between gap-2.5 cursor-pointer group"
                        >
                          <div className="flex items-center gap-2.5 overflow-hidden">
                            <span className="text-lg shrink-0">{note.icon || '📝'}</span>
                            <div className="overflow-hidden">
                              <h5 className="font-semibold text-xs text-white truncate group-hover:text-amber-300 transition">
                                {note.title}
                              </h5>
                              <p className="text-[10px] text-purple-300/70 truncate">
                                {note.date} • {note.category}
                              </p>
                            </div>
                          </div>

                          <div className="shrink-0 text-amber-400 text-xs font-semibold flex items-center gap-1 group-hover:translate-x-0.5 transition">
                            <span>Carica</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            /* STAGE 2: FILE LOADED -> RICH VIEWER & ORACLE ANALYSIS WORKSPACE */
            <div className="space-y-4 animate-in fade-in duration-300">
              {/* FILE METADATA BAR */}
              <div className="p-4 bg-[#17123a] border border-amber-400/40 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300 shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-cinzel font-bold text-sm sm:text-base text-white">
                        {loadedFileName}
                      </h3>
                      <span className="px-2 py-0.5 rounded-md bg-purple-950 border border-purple-500/40 text-[10px] text-amber-300 font-mono">
                        {loadedSource === 'drive' ? '☁️ Google Drive' : loadedSource === 'diary' ? '📔 Diario' : '📥 Locale'}
                      </span>
                    </div>
                    <p className="text-[11px] text-purple-300/80 mt-0.5 flex items-center gap-2 flex-wrap font-mono">
                      <span>{wordCount} parole</span>
                      <span>•</span>
                      <span>{characterCount} caratteri</span>
                      <span>•</span>
                      <span>~{readingTimeMinutes} min di lettura</span>
                      {loadedFileSize && (
                        <>
                          <span>•</span>
                          <span>{loadedFileSize}</span>
                        </>
                      )}
                    </p>
                  </div>
                </div>

                {/* Top Action Bar */}
                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={handleToggleSpeech}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                      isSpeaking
                        ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/30'
                        : 'bg-purple-950/80 hover:bg-purple-900 border border-purple-500/40 text-amber-300'
                    }`}
                    title={isSpeaking ? 'Ferma lettura vocale' : 'Ascolta il testo letto ad alta voce'}
                  >
                    {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                    <span>{isSpeaking ? 'Ferma Voce' : 'Ascolta Voce'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCopyText}
                    className="p-2 bg-purple-950/80 hover:bg-purple-900 border border-purple-500/40 text-purple-300 hover:text-white rounded-xl text-xs transition cursor-pointer"
                    title="Copia testo negli appunti"
                  >
                    {isCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>

                  <button
                    type="button"
                    onClick={handleClearFile}
                    className="p-2 bg-purple-950/80 hover:bg-purple-900 border border-purple-500/40 text-rose-300 hover:text-rose-200 rounded-xl text-xs transition cursor-pointer"
                    title="Chiudi file e torna alla selezione"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* TEXT CONTENT PREVIEW BOX */}
              <div className="bg-[#0f0c24] border border-purple-500/30 rounded-2xl p-4 sm:p-5 space-y-3">
                <div className="flex items-center justify-between text-xs text-purple-300/80 border-b border-purple-500/20 pb-2">
                  <span className="font-semibold text-amber-300 flex items-center gap-1.5">
                    <FileCheck className="w-4 h-4" />
                    Anteprima Contenuto del File
                  </span>
                  <span className="text-[11px] text-purple-400">
                    Pronto per l'elaborazione dell'Oracolo
                  </span>
                </div>

                <div className="max-h-60 sm:max-h-72 overflow-y-auto pr-2 text-xs sm:text-sm text-purple-100/90 font-sans leading-relaxed whitespace-pre-wrap selection:bg-purple-900 selection:text-amber-200">
                  {loadedFileContent}
                </div>
              </div>

              {/* ORACLE SMART ANALYSIS ACTION CARDS */}
              <div className="space-y-2.5 pt-1">
                <h4 className="font-cinzel font-bold text-xs sm:text-sm text-white gold-gradient-text flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Scegli la modalità di Analisi con la Guida Oracolare:</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                  {/* Option 1: Complete Analysis */}
                  <button
                    type="button"
                    onClick={() => handleSendToOracle('complete')}
                    className="p-3.5 bg-gradient-to-br from-amber-500/20 via-purple-950/80 to-[#1b1442] hover:from-amber-500/30 hover:to-purple-900 border border-amber-400/50 hover:border-amber-400 rounded-2xl text-left transition shadow-lg flex flex-col justify-between gap-3 cursor-pointer group active:scale-[0.98]"
                  >
                    <div className="space-y-1">
                      <div className="w-8 h-8 rounded-xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300 group-hover:scale-110 transition">
                        🔮
                      </div>
                      <h5 className="font-cinzel font-bold text-xs text-white group-hover:text-amber-300 transition">
                        Analisi Completa Oracolo
                      </h5>
                      <p className="text-[11px] text-purple-200/80 leading-snug">
                        Sintesi essenziale, decodifica simbolica e messaggi chiave per il tuo cammino.
                      </p>
                    </div>

                    <div className="flex items-center gap-1 text-[11px] font-bold text-amber-400 group-hover:translate-x-1 transition">
                      <span>Invia alla Chat</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </button>

                  {/* Option 2: Symbols & Tarot */}
                  <button
                    type="button"
                    onClick={() => handleSendToOracle('symbols')}
                    className="p-3.5 bg-gradient-to-br from-purple-900/30 to-[#181238] hover:bg-purple-900/40 border border-purple-500/40 hover:border-purple-400 rounded-2xl text-left transition shadow-md flex flex-col justify-between gap-3 cursor-pointer group active:scale-[0.98]"
                  >
                    <div className="space-y-1">
                      <div className="w-8 h-8 rounded-xl bg-purple-950/80 border border-purple-500/40 flex items-center justify-center text-purple-300 group-hover:scale-110 transition">
                        🌌
                      </div>
                      <h5 className="font-cinzel font-bold text-xs text-white group-hover:text-amber-300 transition">
                        Tarocchi & Astrologia
                      </h5>
                      <p className="text-[11px] text-purple-200/80 leading-snug">
                        Estrai archetipi dei Tarocchi, transiti planetari e corrispondenze sacre.
                      </p>
                    </div>

                    <div className="flex items-center gap-1 text-[11px] font-bold text-purple-300 group-hover:translate-x-1 transition">
                      <span>Decodifica Simboli</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </button>

                  {/* Option 3: Rituals & Practices */}
                  <button
                    type="button"
                    onClick={() => handleSendToOracle('rituals')}
                    className="p-3.5 bg-gradient-to-br from-purple-900/30 to-[#181238] hover:bg-purple-900/40 border border-purple-500/40 hover:border-purple-400 rounded-2xl text-left transition shadow-md flex flex-col justify-between gap-3 cursor-pointer group active:scale-[0.98]"
                  >
                    <div className="space-y-1">
                      <div className="w-8 h-8 rounded-xl bg-purple-950/80 border border-purple-500/40 flex items-center justify-center text-amber-400 group-hover:scale-110 transition">
                        🕯️
                      </div>
                      <h5 className="font-cinzel font-bold text-xs text-white group-hover:text-amber-300 transition">
                        Consigli Rituali & Erbe
                      </h5>
                      <p className="text-[11px] text-purple-200/80 leading-snug">
                        Canalizza meditazioni, incensi, formule di intenzione e allineamento lunare.
                      </p>
                    </div>

                    <div className="flex items-center gap-1 text-[11px] font-bold text-amber-300 group-hover:translate-x-1 transition">
                      <span>Genera Rituale</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </button>

                  {/* Option 4: Save to Diary as New Note */}
                  <button
                    type="button"
                    onClick={handleSaveAsNote}
                    className="p-3.5 bg-gradient-to-br from-emerald-950/40 to-[#141d2e] hover:bg-emerald-950/60 border border-emerald-500/40 hover:border-emerald-400 rounded-2xl text-left transition shadow-md flex flex-col justify-between gap-3 cursor-pointer group active:scale-[0.98]"
                  >
                    <div className="space-y-1">
                      <div className="w-8 h-8 rounded-xl bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center text-emerald-300 group-hover:scale-110 transition">
                        📝
                      </div>
                      <h5 className="font-cinzel font-bold text-xs text-white group-hover:text-emerald-300 transition">
                        Salva nel Diario
                      </h5>
                      <p className="text-[11px] text-purple-200/80 leading-snug">
                        Custodisci questo testo come nuova nota privata tra le tue memorie.
                      </p>
                    </div>

                    <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 group-hover:translate-x-1 transition">
                      <span>Crea Nota</span>
                      <Plus className="w-3.5 h-3.5" />
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
