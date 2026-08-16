import React, { useState, useEffect, useCallback } from 'react';
import { 
  X, 
  Search, 
  Upload, 
  Download, 
  Trash2, 
  ExternalLink, 
  Folder, 
  FolderPlus, 
  FileText, 
  FileSpreadsheet, 
  FileCode, 
  ShieldCheck, 
  Sparkles, 
  Database, 
  RefreshCw, 
  Check, 
  AlertTriangle, 
  BookOpen, 
  Calendar, 
  BookMarked, 
  ArrowLeft,
  HardDrive,
  Cloud,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  signInWithGoogleDrive, 
  signInWithGoogleIdentity,
  logoutGoogleDrive, 
  listDriveFiles, 
  uploadFileToGoogleDrive, 
  downloadDriveFileText, 
  deleteDriveFile, 
  backupSanctuaryToDrive,
  getGoogleUser,
  getDriveAccessToken
} from '../../services/googleDriveService';
import { saveCustomGrimoire } from '../../services/grimoireService';
import { DriveFile, GoogleDriveUser, SacredBook, Appointment, Contact, JournalNote, CycleData, WeeklyMenu } from '../../types';

interface GoogleDriveModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointments: Appointment[];
  contacts: Contact[];
  cycleData: CycleData;
  weeklyMenu: WeeklyMenu;
  journalNotes: JournalNote[];
  sacredBooks: SacredBook[];
  onUpdateSacredBooks: (books: SacredBook[]) => void;
  onShowToast: (msg: string) => void;
}

export const GoogleDriveModal: React.FC<GoogleDriveModalProps> = ({
  isOpen,
  onClose,
  appointments,
  contacts,
  cycleData,
  weeklyMenu,
  journalNotes,
  sacredBooks,
  onUpdateSacredBooks,
  onShowToast,
}) => {
  // Authentication State
  const [googleUser, setGoogleUser] = useState<GoogleDriveUser | null>(getGoogleUser());
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [hasToken, setHasToken] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Navigation & Tabs
  const [activeTab, setActiveTab] = useState<'files' | 'backup' | 'upload'>('files');
  const [searchQuery, setSearchQuery] = useState('');
  const [mimeFilter, setMimeFilter] = useState<'all' | 'text' | 'docs' | 'spreadsheets' | 'folders' | 'backups'>('all');
  
  // Folder Navigation
  const [currentFolderId, setCurrentFolderId] = useState<string | undefined>(undefined);
  const [folderBreadcrumbs, setFolderBreadcrumbs] = useState<Array<{ id?: string; name: string }>>([
    { id: undefined, name: 'Mio Drive' },
  ]);

  // Files State
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [filesError, setFilesError] = useState<string | null>(null);

  // Action States
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [importingFileId, setImportingFileId] = useState<string | null>(null);
  const [lastBackupFile, setLastBackupFile] = useState<string | null>(null);

  // Destructive Delete Confirmation Modal State (MANDATORY for Workspace Integration)
  const [deleteConfirmFile, setDeleteConfirmFile] = useState<DriveFile | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Upload Form State
  const [uploadFileName, setUploadFileName] = useState('');
  const [uploadFileContent, setUploadFileContent] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // Check token on open
  const [copiedOrigin, setCopiedOrigin] = useState(false);
  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : '';

  useEffect(() => {
    if (isOpen) {
      getDriveAccessToken().then((token) => {
        setHasToken(!!token);
        setGoogleUser(getGoogleUser());
        if (token) {
          fetchFiles();
        }
      });
    }
  }, [isOpen, currentFolderId, mimeFilter]);

  const fetchFiles = useCallback(async () => {
    setIsLoadingFiles(true);
    setFilesError(null);
    const res = await listDriveFiles({
      query: searchQuery,
      folderId: currentFolderId,
      mimeTypeFilter: mimeFilter,
    });
    setIsLoadingFiles(false);
    if (res.error) {
      setFilesError(res.error);
    } else {
      setFiles(res.files);
    }
  }, [searchQuery, currentFolderId, mimeFilter]);

  // Handle Google Sign-In (Combined Firebase + GIS)
  const handleGoogleLogin = async () => {
    setIsLoggingIn(true);
    setLoginError(null);
    try {
      const res = await signInWithGoogleDrive();
      if (res) {
        setGoogleUser({
          uid: res.user.uid,
          email: res.user.email,
          displayName: res.user.displayName,
          photoURL: res.user.photoURL,
        });
        setHasToken(true);
        setLoginError(null);
        onShowToast(`🌙 Connesso con successo a Google Drive (${res.user.email || 'Maria Teresa'})!`);
        fetchFiles();
      }
    } catch (err: any) {
      console.error('Google Login Error:', err);
      const msg = err.message || 'Accesso non completato. Verifica i permessi popup del tuo browser.';
      setLoginError(msg);
      onShowToast(`Errore di accesso: ${msg}`);
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Handle Direct Google Identity (GIS) Sign-In
  const handleGoogleIdentityLogin = async () => {
    setIsLoggingIn(true);
    setLoginError(null);
    try {
      const res = await signInWithGoogleIdentity();
      if (res) {
        setGoogleUser(res.user);
        setHasToken(true);
        setLoginError(null);
        onShowToast(`🌙 Connesso con successo a Google Drive (${res.user.email || 'Maria Teresa'})!`);
        fetchFiles();
      }
    } catch (err: any) {
      console.error('Google Identity Login Error:', err);
      const msg = err.message || 'Accesso diretto non riuscito.';
      setLoginError(msg);
      onShowToast(`Errore: ${msg}`);
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Handle Google Sign-Out
  const handleGoogleLogout = async () => {
    await logoutGoogleDrive();
    setGoogleUser(null);
    setHasToken(false);
    setFiles([]);
    onShowToast('Disconnesso da Google Drive.');
  };

  // Folder navigation
  const handleOpenFolder = (folder: DriveFile) => {
    setCurrentFolderId(folder.id);
    setFolderBreadcrumbs((prev) => [...prev, { id: folder.id, name: folder.name }]);
  };

  const handleNavigateBreadcrumb = (index: number) => {
    const target = folderBreadcrumbs[index];
    setCurrentFolderId(target.id);
    setFolderBreadcrumbs((prev) => prev.slice(0, index + 1));
  };

  // Import Drive File as Sacred Book / Grimoire
  const handleImportToGrimoire = async (file: DriveFile) => {
    setImportingFileId(file.id);
    try {
      const res = await downloadDriveFileText(file.id, file.mimeType);
      if (res.error || !res.content) {
        throw new Error(res.error || 'Contenuto del file non leggibile.');
      }

      const cleanTitle = file.name.replace(/\.[^/.]+$/, '');
      const { books: updated, savedBook } = saveCustomGrimoire({
        title: cleanTitle,
        author: 'Google Drive / Maria Teresa',
        category: 'personale',
        coverEmoji: '📜',
        description: `Importato direttamente da Google Drive (${file.name}).`,
        tags: ['google drive', 'importato', 'testo sacro'],
        isEnabled: true,
        sections: [
          {
            id: `sec-${Date.now()}`,
            title: cleanTitle,
            chapterNumber: 'Testo Completo',
            content: res.content,
          },
        ],
        fullText: res.content,
      });

      onUpdateSacredBooks(updated);
      onShowToast(`✨ "${savedBook.title}" importato con successo nella Biblioteca dei Grimori dell'Oracolo!`);
    } catch (err: any) {
      onShowToast(`Errore durante l'importazione: ${err.message}`);
    } finally {
      setImportingFileId(null);
    }
  };

  // Perform Destructive Delete (AFTER user confirmed in the modal)
  const handleConfirmDelete = async () => {
    if (!deleteConfirmFile) return;
    setIsDeleting(true);
    const res = await deleteDriveFile(deleteConfirmFile.id);
    setIsDeleting(false);

    if (res.success) {
      onShowToast(`🗑️ File "${deleteConfirmFile.name}" eliminato da Google Drive.`);
      setDeleteConfirmFile(null);
      fetchFiles();
    } else {
      onShowToast(`Errore eliminazione: ${res.error}`);
    }
  };

  // Backup Full App Data to Drive
  const handleFullBackup = async () => {
    setIsBackingUp(true);
    const res = await backupSanctuaryToDrive({
      appointments,
      contacts,
      cycleData,
      weeklyMenu,
      journalNotes,
      sacredBooks,
    });
    setIsBackingUp(false);

    if (res.success) {
      setLastBackupFile(res.fileName || 'Backup completato');
      onShowToast(`☁️ Backup completo del Santuario salvato su Google Drive in "Maria Teresa - Santuario & Agenda"!`);
      fetchFiles();
    } else {
      onShowToast(`Errore nel backup: ${res.error}`);
    }
  };

  // Handle manual upload
  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFileName.trim() || !uploadFileContent.trim()) {
      onShowToast('Inserisci nome del file e contenuto.');
      return;
    }

    setIsUploading(true);
    const res = await uploadFileToGoogleDrive({
      name: uploadFileName.endsWith('.txt') || uploadFileName.endsWith('.md') ? uploadFileName : `${uploadFileName}.txt`,
      content: uploadFileContent,
      mimeType: 'text/plain',
      folderId: currentFolderId,
    });
    setIsUploading(false);

    if (res.success) {
      onShowToast(`📄 File "${uploadFileName}" caricato su Google Drive!`);
      setUploadFileName('');
      setUploadFileContent('');
      setActiveTab('files');
      fetchFiles();
    } else {
      onShowToast(`Errore caricamento: ${res.error}`);
    }
  };

  const getFileIcon = (file: DriveFile) => {
    if (file.mimeType === 'application/vnd.google-apps.folder') {
      return <Folder className="w-5 h-5 text-amber-400 fill-amber-400/20" />;
    }
    if (file.mimeType.includes('spreadsheet')) {
      return <FileSpreadsheet className="w-5 h-5 text-emerald-400" />;
    }
    if (file.mimeType.includes('json')) {
      return <FileCode className="w-5 h-5 text-purple-400" />;
    }
    if (file.name.includes('Backup') || file.name.includes('Santuario')) {
      return <Cloud className="w-5 h-5 text-amber-300" />;
    }
    return <FileText className="w-5 h-5 text-sky-400" />;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="bg-[#100d24] border border-[#2a244d] w-full max-w-4xl h-[92vh] sm:h-auto sm:max-h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-100 relative">
        
        {/* MODAL HEADER */}
        <div className="px-3.5 py-3 sm:p-4 border-b border-[#2a244d] bg-[#151033] flex items-center justify-between gap-2 flex-shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-gradient-to-br from-amber-400/20 to-blue-600/30 border border-amber-400/40 flex items-center justify-center text-xl shadow-md flex-shrink-0">
              <svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 87.3 78" xmlns="http://www.w3.org/2000/svg">
                <path d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8h-27.5c0 1.55.4 3.1 1.2 4.5z" fill="#0066da"/>
                <path d="m43.65 25-13.75-23.8c-1.35.8-2.5 1.9-3.3 3.3l-25.4 44a9.06 9.06 0 0 0 -1.2 4.5h27.5z" fill="#00ac47"/>
                <path d="m73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5h-27.502l5.852 11.5z" fill="#ea4335"/>
                <path d="m43.65 25 13.75-23.8c-1.35-.8-2.9-1.2-4.5-1.2h-18.5c-1.6 0-3.15.45-4.5 1.2z" fill="#00832d"/>
                <path d="m59.8 53h-32.3l-13.75 23.8c1.35.8 2.9 1.2 4.5 1.2h50.8c1.6 0 3.15-.45 4.5-1.2z" fill="#2684fc"/>
                <path d="m73.4 26.5-12.7-22c-.8-1.4-1.95-2.5-3.3-3.3l-13.75 23.8 16.15 28h27.45c0-1.55-.4-3.1-1.2-4.5z" fill="#ffba00"/>
              </svg>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h2 className="text-xs sm:text-base font-cinzel font-bold text-white gold-gradient-text truncate">
                  Google Drive
                </h2>
                <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-bold border flex items-center gap-1 ${
                  hasToken 
                    ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300' 
                    : 'bg-amber-950/80 border-amber-500/40 text-amber-300'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${hasToken ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                  {hasToken ? 'Connesso' : 'Disconnesso'}
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-purple-300/80 truncate">
                Backup, file e sincronizzazione testi
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-purple-400 hover:text-white hover:bg-purple-900/40 rounded-xl transition cursor-pointer flex-shrink-0"
            title="Chiudi"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* AUTH BANNER / SIGN IN WITH GOOGLE */}
        <div className="px-4 py-3 bg-[#161138] border-b border-[#2a244d] flex flex-col sm:flex-row items-center justify-between gap-3">
          {hasToken && googleUser ? (
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-3">
                {googleUser.photoURL ? (
                  <img 
                    src={googleUser.photoURL} 
                    alt={googleUser.displayName || 'Google User'} 
                    className="w-8 h-8 rounded-full border border-amber-400/50 shadow"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-purple-900 border border-purple-400/40 flex items-center justify-center text-xs font-bold text-amber-300">
                    MT
                  </div>
                )}
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>{googleUser.displayName || 'Maria Teresa Rogani'}</span>
                    <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-1.5 py-0.2 rounded border border-emerald-500/30">
                      Autorizzato
                    </span>
                  </div>
                  <span className="text-[11px] text-purple-300/80 font-mono">
                    {googleUser.email || 'mariateresarogani@gmail.com'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={fetchFiles}
                  disabled={isLoadingFiles}
                  className="p-1.5 text-purple-300 hover:text-amber-300 hover:bg-[#1d1645] rounded-xl transition cursor-pointer"
                  title="Ricarica file"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoadingFiles ? 'animate-spin text-amber-400' : ''}`} />
                </button>
                <button
                  onClick={handleGoogleLogout}
                  className="px-3 py-1.5 rounded-xl bg-purple-950/60 hover:bg-rose-950/70 border border-purple-500/30 hover:border-rose-500/40 text-purple-300 hover:text-rose-200 text-xs transition cursor-pointer"
                >
                  Disconnetti
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center justify-between w-full gap-3">
              <div className="flex items-center gap-2 text-xs text-purple-200">
                <ShieldCheck className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span>Accedi con il tuo account Google per gestire i file e i backup in tempo reale.</span>
              </div>

              {/* Official styled Sign In With Google Button & GIS Alternative */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={handleGoogleLogin}
                  disabled={isLoggingIn}
                  className="flex-1 sm:flex-none px-4 py-2 bg-white hover:bg-slate-100 text-slate-900 font-semibold text-xs rounded-xl shadow-md hover:shadow-lg transition flex items-center justify-center gap-2.5 cursor-pointer whitespace-nowrap active:scale-95 disabled:opacity-50"
                >
                  <svg className="w-4 h-4" viewBox="0 0 48 48">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                  </svg>
                  <span>{isLoggingIn ? 'Accesso...' : 'Accedi con Google'}</span>
                </button>

                <button
                  onClick={handleGoogleIdentityLogin}
                  disabled={isLoggingIn}
                  className="px-3 py-2 bg-purple-950/80 hover:bg-purple-900 border border-purple-500/40 text-amber-300 text-xs rounded-xl transition cursor-pointer flex items-center justify-center gap-1 disabled:opacity-50"
                  title="Accesso diretto Google Identity alternativo per mobile"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden md:inline">Accesso Diretto</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* TABS NAVIGATION */}
        <div className="px-4 pt-3 border-b border-[#2a244d] bg-[#120d29] flex items-center justify-between gap-2 overflow-x-auto flex-shrink-0">
          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={() => setActiveTab('files')}
              className={`px-4 py-2 rounded-t-xl font-medium border-b-2 transition flex items-center gap-2 cursor-pointer ${
                activeTab === 'files'
                  ? 'border-amber-400 text-amber-300 bg-purple-950/60'
                  : 'border-transparent text-purple-300 hover:text-white'
              }`}
            >
              <HardDrive className="w-4 h-4" />
              <span>Esplora File Drive</span>
            </button>

            <button
              onClick={() => setActiveTab('backup')}
              className={`px-4 py-2 rounded-t-xl font-medium border-b-2 transition flex items-center gap-2 cursor-pointer ${
                activeTab === 'backup'
                  ? 'border-amber-400 text-amber-300 bg-purple-950/60'
                  : 'border-transparent text-purple-300 hover:text-white'
              }`}
            >
              <Cloud className="w-4 h-4" />
              <span>Backup del Santuario</span>
            </button>

            <button
              onClick={() => setActiveTab('upload')}
              className={`px-4 py-2 rounded-t-xl font-medium border-b-2 transition flex items-center gap-2 cursor-pointer ${
                activeTab === 'upload'
                  ? 'border-amber-400 text-amber-300 bg-purple-950/60'
                  : 'border-transparent text-purple-300 hover:text-white'
              }`}
            >
              <Upload className="w-4 h-4" />
              <span>Carica su Drive</span>
            </button>
          </div>

          <button
            onClick={handleFullBackup}
            disabled={!hasToken || isBackingUp}
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow transition cursor-pointer disabled:opacity-50 active:scale-95"
          >
            <Cloud className="w-3.5 h-3.5" />
            <span>{isBackingUp ? 'Salvataggio...' : 'Backup 1-Click'}</span>
          </button>
        </div>

        {/* MODAL BODY */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          
          {/* TAB 1: FILE EXPLORER */}
          {activeTab === 'files' && (
            <div className="space-y-4">
              {/* Search, Filter & Breadcrumbs Bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-purple-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') fetchFiles(); }}
                    placeholder="Cerca file nel tuo Drive..."
                    className="w-full bg-[#181238] border border-[#2a244d] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-purple-400/60 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 text-xs">
                  {[
                    { id: 'all', label: 'Tutti i File' },
                    { id: 'text', label: 'Testi & Manuali' },
                    { id: 'docs', label: 'Documenti / PDF' },
                    { id: 'spreadsheets', label: 'Fogli' },
                    { id: 'backups', label: 'Backup Santuario' },
                    { id: 'folders', label: 'Solo Cartelle' },
                  ].map((filter) => (
                    <button
                      key={filter.id}
                      onClick={() => setMimeFilter(filter.id as any)}
                      className={`px-3 py-1.5 rounded-xl transition text-xs whitespace-nowrap cursor-pointer ${
                        mimeFilter === filter.id
                          ? 'bg-amber-400 text-slate-950 font-bold shadow'
                          : 'bg-[#181238] border border-purple-500/20 text-purple-200 hover:text-white'
                      }`}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Breadcrumb Navigation */}
              <div className="flex items-center gap-1 text-xs text-purple-300 bg-[#140f2e] px-3 py-2 rounded-xl border border-purple-500/20 overflow-x-auto">
                <HardDrive className="w-3.5 h-3.5 text-amber-400 mr-1 flex-shrink-0" />
                {folderBreadcrumbs.map((crumb, idx) => (
                  <React.Fragment key={crumb.id || idx}>
                    {idx > 0 && <ChevronRight className="w-3 h-3 text-purple-500 flex-shrink-0" />}
                    <button
                      onClick={() => handleNavigateBreadcrumb(idx)}
                      className={`hover:text-amber-300 transition whitespace-nowrap cursor-pointer ${
                        idx === folderBreadcrumbs.length - 1 ? 'text-amber-300 font-bold' : ''
                      }`}
                    >
                      {crumb.name}
                    </button>
                  </React.Fragment>
                ))}
              </div>

              {/* Files List / Empty States */}
              {!hasToken ? (
                <div className="text-center py-10 px-4 bg-[#140f2e] border border-[#2a244d] rounded-2xl space-y-4 max-w-xl mx-auto">
                  <div className="w-16 h-16 rounded-full bg-purple-950/80 border border-amber-400/40 flex items-center justify-center mx-auto text-amber-300 shadow-lg">
                    <Cloud className="w-8 h-8" />
                  </div>
                  <div className="space-y-1.5 max-w-md mx-auto">
                    <h3 className="font-cinzel font-bold text-base text-white gold-gradient-text">
                      Connetti il tuo Google Drive
                    </h3>
                    <p className="text-xs text-purple-200/90 leading-relaxed">
                      Per visualizzare i tuoi file <span className="text-amber-300 font-mono">.txt</span>, importare manuali nell'Oracolo ed eseguire il backup sicuro del Santuario, autorizza l'accesso con il tuo account Google.
                    </p>
                  </div>

                  {loginError && (
                    <div className="p-3.5 bg-rose-950/50 border border-rose-500/40 rounded-xl text-left text-xs text-rose-200 space-y-1.5 animate-in fade-in">
                      <div className="flex items-center gap-2 font-bold text-rose-300">
                        <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                        <span>Dettaglio Errore di Connessione</span>
                      </div>
                      <p className="text-[11px] text-rose-200/90 pl-6 break-words">
                        {loginError}
                      </p>
                    </div>
                  )}

                  {/* Troubleshooting Guide for origin_mismatch */}
                  <div className="p-3.5 bg-[#1a1238] border border-amber-400/30 rounded-xl text-left text-xs text-purple-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-amber-300 flex items-center gap-1.5 font-cinzel">
                        <ShieldCheck className="w-4 h-4 text-amber-400" />
                        Origine autorizzata Google (Origin Mismatch)
                      </span>
                    </div>

                    <p className="text-[11px] text-purple-300 leading-relaxed">
                      Se Google mostra <strong className="text-amber-300">"Errore 400: origin_mismatch"</strong>, è necessario registrare l'indirizzo da cui stai aprendo l'app nelle <em>Origini JavaScript autorizzate</em> della Google Cloud Console:
                    </p>

                    <div className="flex items-center gap-2 bg-[#0d0822] p-2 rounded-lg border border-purple-500/30">
                      <input 
                        type="text" 
                        readOnly 
                        value={currentOrigin} 
                        className="bg-transparent text-amber-300 font-mono text-[11px] flex-1 outline-none select-all truncate"
                      />
                      <button
                        onClick={() => {
                          if (currentOrigin && navigator.clipboard) {
                            navigator.clipboard.writeText(currentOrigin);
                            setCopiedOrigin(true);
                            setTimeout(() => setCopiedOrigin(false), 2500);
                          }
                        }}
                        className="px-2.5 py-1 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-[10px] rounded transition cursor-pointer flex items-center gap-1 shrink-0"
                      >
                        {copiedOrigin ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-950 stroke-[3]" />
                            <span>Copiato!</span>
                          </>
                        ) : (
                          <span>Copia URL</span>
                        )}
                      </button>
                    </div>

                    <div className="text-[10px] text-purple-300/90 space-y-1 pt-1">
                      <p>1. Apri la <strong>Google Cloud Console → Credenziali</strong>.</p>
                      <p>2. Clicca sul tuo <strong>ID Client OAuth 2.0 (Applicazione Web)</strong>.</p>
                      <p>3. Incolla questo indirizzo in <strong>Origini JavaScript autorizzate</strong> e clicca su <strong>Salva</strong>.</p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-2">
                    <button
                      onClick={handleGoogleLogin}
                      disabled={isLoggingIn}
                      className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition active:scale-95 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 48 48">
                        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                      </svg>
                      <span>{isLoggingIn ? 'Accesso in corso...' : 'Accedi con Google'}</span>
                    </button>

                    <button
                      onClick={handleGoogleIdentityLogin}
                      disabled={isLoggingIn}
                      className="w-full sm:w-auto px-4 py-2.5 bg-purple-950/70 hover:bg-purple-900 border border-purple-500/40 text-amber-300 font-semibold text-xs rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
                      title="Usa il protocollo Google Identity Services alternativo"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>Accesso Diretto (Mobile / Alternativo)</span>
                    </button>
                  </div>
                </div>
              ) : isLoadingFiles ? (
                <div className="text-center py-12 text-purple-300 space-y-2">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto text-amber-400" />
                  <p className="text-xs">Lettura file da Google Drive in corso...</p>
                </div>
              ) : filesError ? (
                <div className="p-4 bg-rose-950/40 border border-rose-500/40 rounded-2xl text-xs text-rose-200 space-y-2">
                  <p className="font-bold flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                    {filesError}
                  </p>
                  <button
                    onClick={handleGoogleLogin}
                    className="px-3 py-1 bg-rose-900/60 hover:bg-rose-800 text-white rounded-lg text-xs cursor-pointer"
                  >
                    Riconnetti Account Google
                  </button>
                </div>
              ) : files.length === 0 ? (
                <div className="text-center py-12 bg-[#140f2e] border border-[#2a244d] rounded-2xl space-y-2 text-purple-300">
                  <FileText className="w-8 h-8 mx-auto text-purple-400/60" />
                  <p className="text-xs">Nessun file trovato in questa cartella o con questi filtri.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {files.map((file) => {
                    const isFolder = file.mimeType === 'application/vnd.google-apps.folder';
                    const isImportableText = 
                      file.mimeType.includes('text') || 
                      file.mimeType.includes('json') || 
                      file.mimeType === 'application/vnd.google-apps.document';

                    return (
                      <div
                        key={file.id}
                        className="bg-[#140f2e] border border-[#2a244d] hover:border-amber-400/40 rounded-2xl p-3.5 space-y-3 transition flex flex-col justify-between shadow-md"
                      >
                        <div className="space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2.5 overflow-hidden">
                              <div className="p-2 rounded-xl bg-purple-950/80 border border-purple-500/30 flex-shrink-0">
                                {getFileIcon(file)}
                              </div>
                              <div className="overflow-hidden">
                                {isFolder ? (
                                  <button
                                    onClick={() => handleOpenFolder(file)}
                                    className="font-cinzel font-bold text-xs text-amber-300 hover:underline text-left truncate block cursor-pointer"
                                  >
                                    {file.name}
                                  </button>
                                ) : (
                                  <h4 className="font-semibold text-xs text-white truncate" title={file.name}>
                                    {file.name}
                                  </h4>
                                )}
                                <p className="text-[10px] text-purple-300/80 truncate">
                                  {file.modifiedTime ? new Date(file.modifiedTime).toLocaleDateString('it-IT') : ''}
                                  {file.size ? ` • ${(parseInt(file.size, 10) / 1024).toFixed(1)} KB` : ''}
                                </p>
                              </div>
                            </div>

                            {file.webViewLink && (
                              <a
                                href={file.webViewLink}
                                target="_blank"
                                rel="noreferrer"
                                className="p-1.5 text-purple-400 hover:text-amber-300 hover:bg-purple-900/40 rounded-lg transition"
                                title="Apri in Google Drive"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            )}
                          </div>
                        </div>

                        {/* File Action Buttons */}
                        <div className="flex items-center justify-between pt-2 border-t border-purple-500/15 text-xs">
                          {isFolder ? (
                            <button
                              onClick={() => handleOpenFolder(file)}
                              className="px-3 py-1 bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 border border-amber-400/40 rounded-xl text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition"
                            >
                              <Folder className="w-3 h-3" />
                              <span>Apri Cartella</span>
                            </button>
                          ) : isImportableText ? (
                            <button
                              onClick={() => handleImportToGrimoire(file)}
                              disabled={importingFileId === file.id}
                              className="px-3 py-1 bg-purple-900/60 hover:bg-purple-800 border border-purple-400/40 text-amber-300 rounded-xl text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition disabled:opacity-50"
                              title="Importa questo testo nei Grimori per l'Oracolo"
                            >
                              <BookOpen className="w-3 h-3" />
                              <span>{importingFileId === file.id ? 'Importazione...' : 'Usa come Manuale'}</span>
                            </button>
                          ) : (
                            <span className="text-[10px] text-purple-400/70 font-mono">
                              File Drive
                            </span>
                          )}

                          {/* Delete File Trigger (Opens mandatory confirmation modal) */}
                          <button
                            onClick={() => setDeleteConfirmFile(file)}
                            className="p-1.5 text-purple-400 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition cursor-pointer"
                            title="Elimina file da Google Drive"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: BACKUP & CLOUD SAVING */}
          {activeTab === 'backup' && (
            <div className="space-y-5 max-w-2xl mx-auto">
              <div className="bg-[#140f2e] border border-amber-400/40 p-5 rounded-3xl space-y-4 shadow-xl">
                <div className="flex items-center gap-3 border-b border-purple-500/20 pb-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-400/20 border border-amber-400/50 flex items-center justify-center text-xl text-amber-300">
                    ☁️
                  </div>
                  <div>
                    <h3 className="font-cinzel font-bold text-sm text-white gold-gradient-text">
                      Backup Completo del Santuario su Google Drive
                    </h3>
                    <p className="text-xs text-purple-300">
                      Salva tutte le tue note, appuntamenti dell'agenda, menù, consulti oracolari e grimori personali in un file sicuro nel tuo Google Drive.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs text-purple-200">
                  <div className="p-2.5 bg-[#1b153f] rounded-xl border border-purple-500/20 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-amber-400" />
                    <span>{appointments.length} Appuntamenti</span>
                  </div>
                  <div className="p-2.5 bg-[#1b153f] rounded-xl border border-purple-500/20 flex items-center gap-2">
                    <BookMarked className="w-4 h-4 text-purple-400" />
                    <span>{journalNotes.length} Note Diario</span>
                  </div>
                  <div className="p-2.5 bg-[#1b153f] rounded-xl border border-purple-500/20 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-sky-400" />
                    <span>{sacredBooks.length} Manuali / Grimori</span>
                  </div>
                </div>

                <div className="p-3 bg-[#1a133d] rounded-2xl border border-purple-500/30 text-xs text-purple-200 space-y-1">
                  <strong className="text-amber-300 block">📁 Posizione nel tuo Drive:</strong>
                  <p className="text-[11px] text-purple-300">
                    Verrà creata o aggiornata automaticamente la cartella <strong>"Maria Teresa - Santuario & Agenda"</strong> con una copia in formato JSON e un elegante riassunto leggibile in Markdown (.md).
                  </p>
                </div>

                {lastBackupFile && (
                  <div className="p-3 bg-emerald-950/60 border border-emerald-500/40 rounded-2xl text-xs text-emerald-200 flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Ultimo backup generato: <strong>{lastBackupFile}</strong></span>
                  </div>
                )}

                <button
                  onClick={handleFullBackup}
                  disabled={!hasToken || isBackingUp}
                  className="w-full py-3 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-2xl text-xs shadow-lg transition active:scale-95 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Cloud className="w-4 h-4" />
                  <span>{isBackingUp ? 'Creazione Backup in corso...' : 'Esegui Backup Completo su Google Drive Ora'}</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: UPLOAD TO DRIVE */}
          {activeTab === 'upload' && (
            <form onSubmit={handleUploadSubmit} className="space-y-4 max-w-2xl mx-auto bg-[#140f2e] p-5 rounded-3xl border border-[#2a244d]">
              <div className="flex items-center gap-2 border-b border-purple-500/20 pb-3">
                <Upload className="w-5 h-5 text-amber-400" />
                <h3 className="font-cinzel font-bold text-sm text-white gold-gradient-text">
                  Carica Nuovo File su Google Drive
                </h3>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-purple-300 font-medium">Nome del File *</label>
                <input
                  type="text"
                  required
                  value={uploadFileName}
                  onChange={(e) => setUploadFileName(e.target.value)}
                  placeholder="Es. Consulto_Tarocchi_MariaTeresa.txt"
                  className="w-full bg-[#1b153f] border border-purple-500/30 rounded-xl px-3 py-2 text-xs text-white placeholder-purple-400/60 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-purple-300 font-medium">Contenuto Testuale / Note *</label>
                <textarea
                  required
                  rows={8}
                  value={uploadFileContent}
                  onChange={(e) => setUploadFileContent(e.target.value)}
                  placeholder="Scrivi qui il testo da salvare su Google Drive..."
                  className="w-full bg-[#1b153f] border border-purple-500/30 rounded-2xl p-3 text-xs text-slate-100 placeholder-purple-400/60 focus:outline-none focus:border-amber-400 font-light leading-relaxed"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('files')}
                  className="px-4 py-2 bg-[#120f2b] border border-[#2a244d] text-purple-300 hover:text-white rounded-xl text-xs transition cursor-pointer"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  disabled={!hasToken || isUploading}
                  className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl text-xs shadow transition active:scale-95 cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Upload className="w-4 h-4" />
                  <span>{isUploading ? 'Caricamento...' : 'Carica su Drive'}</span>
                </button>
              </div>
            </form>
          )}

        </div>

        {/* ============================================================ */}
        {/* MANDATORY USER CONFIRMATION MODAL FOR DESTRUCTIVE OPERATIONS */}
        {/* ============================================================ */}
        <AnimatePresence>
          {deleteConfirmFile && (
            <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-[#171033] border border-rose-500/50 p-6 rounded-3xl max-w-md w-full shadow-2xl space-y-4 text-slate-100"
              >
                <div className="flex items-center gap-3 text-rose-400">
                  <div className="p-2 rounded-xl bg-rose-950 border border-rose-500/40">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-cinzel font-bold text-base text-white">
                      Conferma Eliminazione File
                    </h3>
                    <span className="text-xs text-rose-300">Azione distruttiva su Google Drive</span>
                  </div>
                </div>

                <p className="text-xs text-slate-200 leading-relaxed">
                  Sei sicura di voler eliminare definitivamente il file <strong>"{deleteConfirmFile.name}"</strong> dal tuo Google Drive?
                </p>

                <div className="p-3 bg-[#110c26] rounded-xl border border-purple-500/20 text-[11px] text-purple-300 space-y-1">
                  <div><strong>Nome:</strong> {deleteConfirmFile.name}</div>
                  <div><strong>Tipo:</strong> {deleteConfirmFile.mimeType}</div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    onClick={() => setDeleteConfirmFile(null)}
                    className="px-4 py-2 bg-[#1b153f] border border-purple-500/30 text-purple-300 hover:text-white rounded-xl text-xs transition cursor-pointer"
                  >
                    Annulla
                  </button>
                  <button
                    onClick={handleConfirmDelete}
                    disabled={isDeleting}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs transition active:scale-95 cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{isDeleting ? 'Eliminazione...' : 'Conferma ed Elimina'}</span>
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};
