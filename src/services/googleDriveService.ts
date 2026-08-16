import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  signOut,
  User 
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { DriveFile, GoogleDriveUser, SacredBook } from '../types';

// Initialize Firebase App singleton safely
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);

// Configure Google Auth Provider with all Google Drive Scopes
const driveProvider = new GoogleAuthProvider();
const DRIVE_SCOPES = [
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/drive.readonly',
  'https://www.googleapis.com/auth/drive.metadata.readonly',
  'https://www.googleapis.com/auth/drive.appdata'
];

DRIVE_SCOPES.forEach((scope) => driveProvider.addScope(scope));
driveProvider.setCustomParameters({
  prompt: 'select_account',
});

// In-Memory Token Management (MANDATORY: Never stored in localStorage)
let cachedAccessToken: string | null = null;
let isSigningIn = false;

/**
 * Initialize Google Auth state listener
 */
export const initDriveAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        // User logged in but token not yet in memory - prompt login or let user reconnect
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

/**
 * Trigger Google Sign In Popup with Drive Scopes
 */
export const signInWithGoogleDrive = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, driveProvider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Impossibile ottenere il token di accesso di Google Drive.');
    }

    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Google Sign In Error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

/**
 * Get current cached access token
 */
export const getDriveAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

/**
 * Check if currently authenticated with Google Drive token
 */
export const isDriveAuthenticated = (): boolean => {
  return !!cachedAccessToken && !!auth.currentUser;
};

/**
 * Get current Google user details
 */
export const getGoogleUser = (): GoogleDriveUser | null => {
  const user = auth.currentUser;
  if (!user) return null;
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
  };
};

/**
 * Sign out and clear in-memory token
 */
export const logoutGoogleDrive = async () => {
  await signOut(auth);
  cachedAccessToken = null;
};

// ============================================================
// GOOGLE DRIVE API V3 OPERATIONS
// ============================================================

/**
 * List files and folders from Google Drive
 */
export const listDriveFiles = async (options: {
  query?: string;
  folderId?: string;
  mimeTypeFilter?: 'all' | 'text' | 'docs' | 'spreadsheets' | 'folders' | 'backups';
  pageSize?: number;
}): Promise<{ files: DriveFile[]; error?: string }> => {
  const token = await getDriveAccessToken();
  if (!token) {
    return { files: [], error: 'Non connesso a Google Drive. Effettua prima l\'accesso con Google.' };
  }

  try {
    let qParts: string[] = ['trashed = false'];

    // Folder containment
    if (options.folderId) {
      qParts.push(`'${options.folderId}' in parents`);
    }

    // Filter by type
    if (options.mimeTypeFilter === 'folders') {
      qParts.push("mimeType = 'application/vnd.google-apps.folder'");
    } else if (options.mimeTypeFilter === 'text') {
      qParts.push("(mimeType = 'text/plain' or mimeType = 'text/markdown' or mimeType = 'application/json')");
    } else if (options.mimeTypeFilter === 'docs') {
      qParts.push("(mimeType = 'application/vnd.google-apps.document' or mimeType = 'text/plain' or mimeType = 'application/pdf')");
    } else if (options.mimeTypeFilter === 'spreadsheets') {
      qParts.push("mimeType = 'application/vnd.google-apps.spreadsheet'");
    } else if (options.mimeTypeFilter === 'backups') {
      qParts.push("(name contains 'Santuario' or name contains 'Backup' or mimeType = 'application/json')");
    }

    // Custom search text
    if (options.query && options.query.trim()) {
      const escaped = options.query.trim().replace(/'/g, "\\'");
      qParts.push(`name contains '${escaped}'`);
    }

    const q = qParts.join(' and ');
    const fields = 'files(id, name, mimeType, modifiedTime, size, iconLink, webViewLink, thumbnailLink, starred, parents)';
    const pageSize = options.pageSize || 50;

    const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&fields=${encodeURIComponent(fields)}&pageSize=${pageSize}&orderBy=folder,modifiedTime desc`;

    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error?.message || `Errore Drive API: ${res.statusText}`);
    }

    const data = await res.json();
    return { files: data.files || [] };
  } catch (err: any) {
    console.error('List Drive Files Error:', err);
    return { files: [], error: err.message || 'Impossibile recuperare i file da Google Drive.' };
  }
};

/**
 * Get or create the dedicated Sanctuary folder on Google Drive
 */
export const getOrCreateSanctuaryFolder = async (): Promise<string | null> => {
  const token = await getDriveAccessToken();
  if (!token) return null;

  try {
    // 1. Check if folder already exists
    const q = "name = 'Maria Teresa - Santuario & Agenda' and mimeType = 'application/vnd.google-apps.folder' and trashed = false";
    const searchUrl = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&fields=files(id, name)`;
    const res = await fetch(searchUrl, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.ok) {
      const data = await res.json();
      if (data.files && data.files.length > 0) {
        return data.files[0].id;
      }
    }

    // 2. Create the folder if not found
    const createUrl = 'https://www.googleapis.com/drive/v3/files';
    const createRes = await fetch(createUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Maria Teresa - Santuario & Agenda',
        mimeType: 'application/vnd.google-apps.folder',
        description: 'Cartella dedicata ai backup, manuali e note del Santuario di Maria Teresa',
      }),
    });

    if (createRes.ok) {
      const created = await createRes.json();
      return created.id;
    }
  } catch (err) {
    console.error('Get/Create Sanctuary Folder Error:', err);
  }
  return null;
};

/**
 * Upload a text, markdown, or JSON file to Google Drive
 */
export const uploadFileToGoogleDrive = async (params: {
  name: string;
  content: string;
  mimeType?: string;
  folderId?: string;
  description?: string;
}): Promise<{ success: boolean; file?: DriveFile; error?: string }> => {
  const token = await getDriveAccessToken();
  if (!token) {
    return { success: false, error: 'Non connesso a Google Drive.' };
  }

  try {
    const mimeType = params.mimeType || 'text/plain';
    const metadata: any = {
      name: params.name,
      mimeType: mimeType,
      description: params.description || 'Creato dal Santuario di Maria Teresa',
    };

    if (params.folderId) {
      metadata.parents = [params.folderId];
    }

    // Use Multipart upload for file + metadata
    const boundary = '-------314159265358979323846';
    const delimiter = `\r\n--${boundary}\r\n`;
    const closeDelimiter = `\r\n--${boundary}--`;

    const multipartRequestBody =
      delimiter +
      'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
      JSON.stringify(metadata) +
      delimiter +
      `Content-Type: ${mimeType}\r\n\r\n` +
      params.content +
      closeDelimiter;

    const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body: multipartRequestBody,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `Errore caricamento: ${res.statusText}`);
    }

    const uploaded = await res.json();
    return { success: true, file: uploaded };
  } catch (err: any) {
    console.error('Upload to Drive Error:', err);
    return { success: false, error: err.message || 'Errore durante il caricamento su Drive.' };
  }
};

/**
 * Download or read text content of a file from Google Drive
 * Supports: plain text, markdown, JSON, or Google Docs (auto-exported as text/plain)
 */
export const downloadDriveFileText = async (
  fileId: string,
  mimeType: string
): Promise<{ content?: string; error?: string }> => {
  const token = await getDriveAccessToken();
  if (!token) return { error: 'Non connesso a Google Drive.' };

  try {
    let fetchUrl: string;

    if (mimeType === 'application/vnd.google-apps.document') {
      // Export Google Doc as plain text
      fetchUrl = `https://www.googleapis.com/drive/v3/files/${fileId}/export?mimeType=text/plain`;
    } else {
      // Direct file media content
      fetchUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;
    }

    const res = await fetch(fetchUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      throw new Error(`Impossibile leggere il file: ${res.statusText}`);
    }

    const text = await res.text();
    return { content: text };
  } catch (err: any) {
    console.error('Download Drive file error:', err);
    return { error: err.message || 'Errore durante la lettura del file da Google Drive.' };
  }
};

/**
 * Delete a file from Google Drive
 * NOTE: Workspace integration guidelines strictly require explicit confirmation before calling this.
 */
export const deleteDriveFile = async (fileId: string): Promise<{ success: boolean; error?: string }> => {
  const token = await getDriveAccessToken();
  if (!token) return { success: false, error: 'Non connesso a Google Drive.' };

  try {
    const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok && res.status !== 204) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `Errore eliminazione: ${res.statusText}`);
    }

    return { success: true };
  } catch (err: any) {
    console.error('Delete file error:', err);
    return { success: false, error: err.message || 'Errore durante l\'eliminazione del file da Google Drive.' };
  }
};

/**
 * Create a Full Backup of the Sanctuary on Google Drive
 */
export const backupSanctuaryToDrive = async (appState: {
  appointments: any[];
  contacts: any[];
  cycleData: any;
  weeklyMenu: any;
  journalNotes: any[];
  sacredBooks: SacredBook[];
}): Promise<{ success: boolean; fileId?: string; fileName?: string; error?: string }> => {
  const token = await getDriveAccessToken();
  if (!token) return { success: false, error: 'Effettua prima l\'accesso a Google Drive.' };

  try {
    // 1. Get or create the dedicated Sanctuary folder
    const folderId = await getOrCreateSanctuaryFolder();

    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = `${String(now.getHours()).padStart(2, '0')}-${String(now.getMinutes()).padStart(2, '0')}`;
    const fileName = `Backup_Santuario_Maria_Teresa_${dateStr}_${timeStr}.json`;

    const payload = {
      app: 'Maria Teresa - Santuario & Agenda',
      backupDate: now.toISOString(),
      ownerEmail: 'mariateresarogani@gmail.com',
      version: '2.0.0',
      data: appState,
    };

    const content = JSON.stringify(payload, null, 2);

    const uploadRes = await uploadFileToGoogleDrive({
      name: fileName,
      content: content,
      mimeType: 'application/json',
      folderId: folderId || undefined,
      description: `Backup completo del Santuario di Maria Teresa del ${dateStr} alle ${timeStr.replace('-', ':')}`,
    });

    if (!uploadRes.success || !uploadRes.file) {
      throw new Error(uploadRes.error || 'Errore di salvataggio');
    }

    // Also upload a human-readable Markdown summary file
    const mdName = `Riepilogo_Santuario_${dateStr}.md`;
    const mdSummary = `# 🌙 Santuario & Agenda di Maria Teresa - Backup ${dateStr}
Generato il: ${now.toLocaleString('it-IT')}

## 📅 Appuntamenti Registrati (${appState.appointments.length})
${appState.appointments.map((a: any) => `- **${a.date} ${a.time}**: ${a.name} (${a.type}) - *${a.status}* ${a.notes ? `[Note: ${a.notes}]` : ''}`).join('\n') || 'Nessun appuntamento'}

## 📖 Note e Consulti nel Diario Privato (${appState.journalNotes.length})
${appState.journalNotes.map((n: any) => `### ${n.icon || '📝'} ${n.title} (${n.category} - ${n.date})\n${n.content}\n`).join('\n') || 'Nessuna nota'}

## 📚 Grimori & Libri Sacri (${appState.sacredBooks.length})
${appState.sacredBooks.map((b: SacredBook) => `- **${b.coverEmoji} ${b.title}** (${b.category}): ${b.description}`).join('\n')}

## 📇 Rubrica Contatti (${appState.contacts.length})
${appState.contacts.map((c: any) => `- **${c.name}**: Tel: ${c.phone || '-'} | Segno: ${c.zodiac || '-'} | Categoria: ${c.category || '-'}`).join('\n')}

---
*Creato con amore dal Santuario Privato di Maria Teresa.*
`;

    await uploadFileToGoogleDrive({
      name: mdName,
      content: mdSummary,
      mimeType: 'text/markdown',
      folderId: folderId || undefined,
      description: 'Riepilogo leggibile in Markdown delle note, appuntamenti e consulti.',
    });

    return {
      success: true,
      fileId: uploadRes.file.id,
      fileName: fileName,
    };
  } catch (err: any) {
    console.error('Backup to Drive Error:', err);
    return { success: false, error: err.message || 'Errore durante la creazione del backup su Google Drive.' };
  }
};
