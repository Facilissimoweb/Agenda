import { SacredBook, SacredBookSection } from '../types';
import { DEFAULT_SACRED_BOOKS } from '../data/defaultGrimoires';
import { getSupabaseClient } from './supabaseClient';

const STORAGE_KEY = 'mt_sacred_books';

/**
 * Retrieve all sacred books (merged default + custom/stored)
 */
export function getStoredGrimoires(): SacredBook[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed: SacredBook[] = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Ensure default books are present if missing
        const existingIds = new Set(parsed.map((b) => b.id));
        const missingDefaults = DEFAULT_SACRED_BOOKS.filter((d) => !existingIds.has(d.id));
        return [...parsed, ...missingDefaults];
      }
    }
  } catch (e) {
    console.warn('Error reading saved grimoires from localStorage:', e);
  }
  return DEFAULT_SACRED_BOOKS;
}

/**
 * Save grimoires locally and attempt async cloud sync
 */
export function saveStoredGrimoires(books: SacredBook[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
    // Asynchronously try syncing to Supabase if configured
    syncGrimoiresToSupabase(books).catch(() => {});
  } catch (e) {
    console.warn('Error saving grimoires to localStorage:', e);
  }
}

/**
 * Toggle book enabled state for Chat Oracle context
 */
export function toggleGrimoireEnabled(bookId: string, enabled: boolean): SacredBook[] {
  const current = getStoredGrimoires();
  const updated = current.map((b) => (b.id === bookId ? { ...b, isEnabled: enabled } : b));
  saveStoredGrimoires(updated);
  return updated;
}

/**
 * Add or update a custom book / manual
 */
export function saveCustomGrimoire(book: Partial<SacredBook>): { books: SacredBook[]; savedBook: SacredBook } {
  const current = getStoredGrimoires();
  const now = new Date().toISOString().split('T')[0];

  let targetId = book.id || `custom-book-${Date.now()}`;
  const existingIdx = current.findIndex((b) => b.id === targetId);

  const fullSections: SacredBookSection[] = (book.sections && book.sections.length > 0)
    ? book.sections
    : [
        {
          id: `sec-${Date.now()}`,
          title: book.title || 'Estratto Principale',
          chapterNumber: 'Capitolo 1',
          content: book.fullText || book.description || '',
        },
      ];

  const newBook: SacredBook = {
    id: targetId,
    title: book.title?.trim() || 'Nuovo Manuale Sacro',
    author: book.author?.trim() || 'Maria Teresa',
    category: book.category || 'personale',
    coverEmoji: book.coverEmoji || '📖',
    description: book.description?.trim() || 'Manuale personalizzato caricato nel Santuario.',
    sections: fullSections,
    fullText: book.fullText || '',
    tags: book.tags || ['manuale', 'testo personalizzato'],
    isEnabled: book.isEnabled ?? true,
    isCustom: true,
    lastUpdated: now,
  };

  let updatedList: SacredBook[];
  if (existingIdx >= 0) {
    updatedList = [...current];
    updatedList[existingIdx] = newBook;
  } else {
    updatedList = [newBook, ...current];
  }

  saveStoredGrimoires(updatedList);
  return { books: updatedList, savedBook: newBook };
}

/**
 * Delete a custom book
 */
export function deleteCustomGrimoire(bookId: string): SacredBook[] {
  const current = getStoredGrimoires();
  const filtered = current.filter((b) => b.id !== bookId);
  saveStoredGrimoires(filtered);
  return filtered;
}

/**
 * Reset all books to default
 */
export function resetGrimoiresToDefault(): SacredBook[] {
  localStorage.removeItem(STORAGE_KEY);
  return DEFAULT_SACRED_BOOKS;
}

/**
 * RAG Context Builder: Selects most relevant text passages from active books
 * and formats them for Groq Llama 3.3 70B System Context.
 */
export function buildGrimoireContextForQuery(
  userQuery: string,
  books: SacredBook[] = getStoredGrimoires()
): { contextText: string; sourcesUsed: string[] } {
  const activeBooks = books.filter((b) => b.isEnabled);
  if (activeBooks.length === 0) {
    return { contextText: '', sourcesUsed: [] };
  }

  const queryLower = userQuery.toLowerCase();
  const sourcesUsed: string[] = [];
  const contextChunks: string[] = [];

  // Keywords detection
  const isTarotQuery = /taroc|arcani|carta|stesa|denar|copp|spad|baston|matto|mago|papessa|appeso|torre|stelle|sole|luna|mondo|ruota/i.test(queryLower);
  const isAstroQuery = /astrolog|tema natale|ascendente|casa |transit|pianet|saturno|giove|marte|venere|mercurio|nodo|lilith|chiron|zodiac/i.test(queryLower);
  const isHerbalQuery = /erba|pianta|incens|salvia|rosmarin|allor|artemisia|cristall|pietra|ametista|quarzo|selenite|ossidiana|chakra|resina|olio/i.test(queryLower);
  const isRitualQuery = /rituale|candela|cerchio|purificaz|bando|consacraz|fase lunare|luna nuova|luna piena|luna calante|incantesim|protezione/i.test(queryLower);
  const isSpecificTextQuery = /testo\s*\d+|manuale|libro|secondo il testo|grimorio|archivio/i.test(queryLower);

  for (const book of activeBooks) {
    let shouldIncludeBook = false;
    let relevantSections: SacredBookSection[] = [];

    // Check category matches
    if (book.category === 'tarocchi' && isTarotQuery) shouldIncludeBook = true;
    if (book.category === 'astrologia' && isAstroQuery) shouldIncludeBook = true;
    if (book.category === 'erboristeria' && isHerbalQuery) shouldIncludeBook = true;
    if (book.category === 'rituali' && isRitualQuery) shouldIncludeBook = true;

    // Check title or tag matches
    if (queryLower.includes(book.title.toLowerCase()) || book.tags.some((t) => queryLower.includes(t.toLowerCase()))) {
      shouldIncludeBook = true;
    }

    // Explicit request to look into all texts or specific text
    if (isSpecificTextQuery || activeBooks.length <= 2) {
      shouldIncludeBook = true;
    }

    // Match sections based on words in user query
    if (shouldIncludeBook || isSpecificTextQuery) {
      const queryWords = queryLower.split(/\s+/).filter((w) => w.length > 3);

      relevantSections = book.sections.filter((sec) => {
        const secText = (sec.title + ' ' + sec.content).toLowerCase();
        if (queryWords.some((w) => secText.includes(w))) return true;
        return false;
      });

      // If no specific section matched keyword, include up to 2 top sections
      if (relevantSections.length === 0) {
        relevantSections = book.sections.slice(0, 2);
      }

      if (relevantSections.length > 0) {
        sourcesUsed.push(`${book.coverEmoji} ${book.title}`);
        const sectionsFormatted = relevantSections
          .map((s) => `[${s.chapterNumber || 'Sezione'}: ${s.title}]\n${s.content}`)
          .join('\n\n');

        contextChunks.push(`--- FONTE SACRA: ${book.title} (Autore/Origine: ${book.author || 'Tradizione'}) ---\n${sectionsFormatted}`);
      }
    }
  }

  // If no specific topic matched but books are enabled, provide an overview of available sacred books
  if (contextChunks.length === 0 && activeBooks.length > 0) {
    const summary = activeBooks
      .map(
        (b) =>
          `• ${b.coverEmoji} "${b.title}": ${b.description} (Capitoli inclusi: ${b.sections.map((s) => s.title).join(', ')})`
      )
      .join('\n');

    contextChunks.push(`BIBLIOTECA DEI MANUALI ATTIVI (Disponibili per consultazione):\n${summary}`);
    sourcesUsed.push(...activeBooks.map((b) => `${b.coverEmoji} ${b.title}`));
  }

  const contextText = contextChunks.length > 0
    ? `\n========================================\nCONOSCENZA ESTRATTA DAI GRIMORI & MANUALI SACRI ATTIVI:\n(Usa queste fonti autorevoli per arricchire la risposta e cita esplicitamente il testo/manuale quando rilevante)\n\n${contextChunks.join('\n\n')}\n========================================\n`
    : '';

  return { contextText, sourcesUsed };
}

/**
 * Cloud Sync: Push grimoires to Supabase
 */
export async function syncGrimoiresToSupabase(books: SacredBook[]): Promise<{ success: boolean; error?: string }> {
  const client = getSupabaseClient();
  if (!client) return { success: false, error: 'Supabase non connesso' };

  try {
    // Check if table exists or store in app_metadata/sacred_books
    const { error } = await client.from('sacred_books').upsert(
      books.map((b) => ({
        id: b.id,
        title: b.title,
        author: b.author,
        category: b.category,
        description: b.description,
        cover_emoji: b.coverEmoji,
        sections: b.sections,
        full_text: b.fullText || '',
        tags: b.tags,
        is_enabled: b.isEnabled,
        is_custom: b.isCustom ?? false,
        updated_at: new Date().toISOString(),
      })),
      { onConflict: 'id' }
    );

    if (error && error.code !== '42P01') {
      console.warn('Supabase sync books note:', error.message);
    }
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

/**
 * Cloud Sync: Download grimoires from Supabase
 */
export async function downloadGrimoiresFromSupabase(): Promise<{ success: boolean; books: SacredBook[]; error?: string }> {
  const client = getSupabaseClient();
  if (!client) return { success: false, books: getStoredGrimoires(), error: 'Supabase non connesso' };

  try {
    const { data, error } = await client.from('sacred_books').select('*').order('title');
    if (error) {
      return { success: false, books: getStoredGrimoires(), error: error.message };
    }
    if (data && data.length > 0) {
      const parsed: SacredBook[] = data.map((row: any) => ({
        id: row.id,
        title: row.title,
        author: row.author,
        category: row.category,
        description: row.description,
        coverEmoji: row.cover_emoji || '📖',
        sections: row.sections || [],
        fullText: row.full_text || '',
        tags: row.tags || [],
        isEnabled: row.is_enabled ?? true,
        isCustom: row.is_custom ?? false,
        lastUpdated: row.updated_at ? row.updated_at.split('T')[0] : '',
      }));

      saveStoredGrimoires(parsed);
      return { success: true, books: parsed };
    }
    return { success: true, books: getStoredGrimoires() };
  } catch (e: any) {
    return { success: false, books: getStoredGrimoires(), error: e.message };
  }
}
