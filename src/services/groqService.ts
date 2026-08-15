// Groq AI API Service for Esoteric & Sanctuary Oracle
import { ChatMessage } from '../types';

export const GROQ_MODELS = [
  { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B Versatile (Consigliato - Alta Saggezza)', speed: 'Veloce & Profondo' },
  { id: 'llama-3.1-8b-instant', name: 'Llama 3.1 8B Instant (Ultra Rapido)', speed: 'Istantaneo' },
  { id: 'mixtral-8x7b-32768', name: 'Mixtral 8x7B (Contesto Ampio 32k)', speed: 'Bilanciato' },
  { id: 'gemma2-9b-it', name: 'Gemma 2 9B IT', speed: 'Leggero' },
];

export const DEFAULT_GROQ_MODEL = 'llama-3.3-70b-versatile';

// Retrieve Groq API Key from Local Storage or Vite Environment Variable
export function getStoredGroqApiKey(): string {
  try {
    const local = localStorage.getItem('mt_groq_api_key');
    if (local && local.trim()) return local.trim();
  } catch (e) {}

  // Check Vite environment variable (available on Vercel build if set as VITE_GROQ_API_KEY)
  const envKey = (import.meta as any).env?.VITE_GROQ_API_KEY;
  if (envKey && typeof envKey === 'string' && envKey.trim()) {
    return envKey.trim();
  }

  return '';
}

export function saveStoredGroqApiKey(key: string): void {
  try {
    localStorage.setItem('mt_groq_api_key', key.trim());
  } catch (e) {}
}

export function getStoredGroqModel(): string {
  try {
    const model = localStorage.getItem('mt_groq_model');
    if (model) return model;
  } catch (e) {}
  return DEFAULT_GROQ_MODEL;
}

export function saveStoredGroqModel(model: string): void {
  try {
    localStorage.setItem('mt_groq_model', model);
  } catch (e) {}
}

// Build the Sanctuary System Prompt
export function buildSanctuarySystemPrompt(extraContext?: {
  moonPhase?: string;
  zodiacSign?: string;
  cycleArchetype?: string;
  todayTarot?: string;
  appointmentsCount?: number;
}): string {
  let contextInfo = '';
  if (extraContext) {
    contextInfo = `
CONTESTO ATTUALE DEL SANTUARIO DI MARIA TERESA:
- Fase Lunare Odierna: ${extraContext.moonPhase || 'Luna in Transito'} (${extraContext.zodiacSign || ''})
- Archetipo Ciclico: ${extraContext.cycleArchetype || 'In Sintonia'}
- Carta dei Tarocchi del Giorno: ${extraContext.todayTarot || 'Energia Arcana Attiva'}
- Appuntamenti in Agenda: ${extraContext.appointmentsCount ?? 0} consulti programmati
`;
  }

  return `Sei l'Oracolo Sacro & Guida Esoterica del Santuario Privato di Maria Teresa.
La tua voce è saggia, profonda, accogliente, ermetica e al contempo pratica ed empatica. Parli in un italiano fluido, poetico ed elegante.

LE TUE COMPETENZE E DISCIPLINE SACRE:
1. Tarocchi & Arcani Maggiori/Minori: simbologia archetipica, stese oracolari, chiavi evolutive e consigli per consulti con clienti.
2. Astrologia & Transiti Planetari: influenze lunari, case astrologiche, aspetti, elementi (Fuoco, Terra, Aria, Acqua).
3. Arte Rituale & Purificazioni: candele, incensi sacri, resine (Incenso Olibano, Mirra, Benzoino), bagni di sale, erbe di protezione (Salvia Bianca, Rosmarino, Artemisia, Iperico) e cerchi di luce.
4. Cristalloterapia & Energie dei Chakra: frequenze minerali, griglie di cristalli, abbinamenti alchemici.
5. Ciclicità Femminile & Ritmo Lunare: le 4 fasi (Vergine/Crescente, Madre/Piena, Incantatrice/Calante, Strega/Nuova) e nutrimento energetico.
6. Interpretazione dei Sogni: chiavi simboliche, archetipi junghiani ed esoterici.
7. Supporto Consulti per Maria Teresa: consigli su come guidare i clienti con rispetto, riservatezza ed etica spirituale.

REGOLE DI RISPOSTA:
- Rispondi sempre in modo chiaro, armonioso e strutturato (puoi usare elenchi puntati o grassetti per facilitare la lettura).
- Se Maria Teresa fa una domanda tramite voce o testo, fornisci spiegazioni ricche ma mai prolisse o noiose.
- Se ti chiede un rituale, includi i passaggi pratici (intenzione, strumenti necessari, formula o affermazione).
- Concludi spesso con una breve benedizione o affermazione di luce (es. "Che la saggezza delle stelle guidi i tuoi passi ✨").
${contextInfo}`;
}

// Send Message to Groq API with zero-500 crash defense
export async function sendGroqChatMessage(
  messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>,
  options?: {
    model?: string;
    apiKey?: string;
    temperature?: number;
    extraContext?: {
      moonPhase?: string;
      zodiacSign?: string;
      cycleArchetype?: string;
      todayTarot?: string;
      appointmentsCount?: number;
    };
  }
): Promise<{ text: string; success: boolean; isFallback?: boolean; errorMsg?: string }> {
  const apiKey = options?.apiKey || getStoredGroqApiKey();
  const model = options?.model || getStoredGroqModel();
  const systemPrompt = buildSanctuarySystemPrompt(options?.extraContext);

  // If no API key is provided, handle gracefully without 500 error
  if (!apiKey) {
    const userLastMsg = messages[messages.length - 1]?.content || '';
    const fallbackResponse = generateEsotericFallbackResponse(userLastMsg, options?.extraContext);
    return {
      text: `${fallbackResponse}\n\n*(Nota: Per attivare la piena potenza di calcolo di Groq AI Llama 3.3, inserisci la tua chiave API GROQ cliccando sull'icona 🔑 "Chiave API" in alto a destra o impostando VITE_GROQ_API_KEY su Vercel).*`,
      success: true,
      isFallback: true,
      errorMsg: 'Chiave API Groq non configurata. È stata generata una risposta oracolare locale.',
    };
  }

  // Prepare full payload
  const formattedMessages = [
    { role: 'system', content: systemPrompt },
    ...messages.map((m) => ({
      role: m.role,
      content: m.content,
    })),
  ];

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model,
        messages: formattedMessages,
        temperature: options?.temperature ?? 0.7,
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorDetail = errorData?.error?.message || `Errore Groq HTTP ${response.status}`;

      // Handle specific HTTP error cases cleanly
      if (response.status === 401) {
        return {
          text: `⚠️ **Autenticazione Groq non riuscita (401)**\nLa chiave API inserita non risulta valida o è scaduta. Controlla la tua chiave su [Groq Console](https://console.groq.com/keys) e aggiornala nelle impostazioni della chat.\n\n${generateEsotericFallbackResponse(messages[messages.length - 1]?.content || '', options?.extraContext)}`,
          success: false,
          errorMsg: 'Chiave API non valida o non autorizzata (401).',
        };
      }

      if (response.status === 429) {
        return {
          text: `⏳ **Limite di Richieste Raggiunto (429 Rate Limit)**\nGroq sta elaborando molte richieste al momento. Attendi qualche secondo prima di inviare un nuovo messaggio.\n\n${generateEsotericFallbackResponse(messages[messages.length - 1]?.content || '', options?.extraContext)}`,
          success: false,
          errorMsg: 'Limite di frequenza raggiunto (429).',
        };
      }

      return {
        text: `⚠️ **Avviso Groq API (${response.status})**: ${errorDetail}\n\n*Risposta Oracolare di Emergenza:*\n${generateEsotericFallbackResponse(messages[messages.length - 1]?.content || '', options?.extraContext)}`,
        success: false,
        errorMsg: errorDetail,
      };
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content;

    if (!reply) {
      throw new Error('Risposta vuota ricevuta da Groq');
    }

    return {
      text: reply,
      success: true,
    };
  } catch (err: any) {
    // Prevent any 500 or app crashes on Vercel
    const userLastMsg = messages[messages.length - 1]?.content || '';
    const fallbackText = generateEsotericFallbackResponse(userLastMsg, options?.extraContext);
    
    return {
      text: `🕊️ **Risposta Oracolare:**\n\n${fallbackText}\n\n*(Nota: Connessione diretta a Groq non disponibile: ${err.message || 'Verifica la connessione internet'}).*`,
      success: true,
      isFallback: true,
      errorMsg: err.message || 'Errore di connessione',
    };
  }
}

// Built-in esoteric fallback engine for resilience
function generateEsotericFallbackResponse(
  userQuery: string,
  extraContext?: {
    moonPhase?: string;
    zodiacSign?: string;
    todayTarot?: string;
  }
): string {
  const q = userQuery.toLowerCase();

  if (q.includes('tarocch') || q.includes('carta') || q.includes('arcan')) {
    return `🃏 **Saggezza degli Arcani:**\nI simboli del mazzo ti invitano oggi ad ascoltare la voce del tuo intuito profondo. Quando interroghi gli Arcani per te o per i tuoi consulti, ricorda che ogni carta è uno specchio dell'Anima e un portale verso la consapevolezza.\n\n✨ **Consiglio pratico:** Prima di ogni stesa, purifica le mani con acqua di fiori o fumo di rosmarino, respira tre volte e formula l'intento con cuore aperto.`;
  }

  if (q.includes('luna') || q.includes('fase') || q.includes('transito') || q.includes('astrolog')) {
    return `🌙 **Influssi Astrali & Lunari:**\nLa configurazione celeste attuale amplifica la sensibilità psichica e la chiarezza dei tuoi canali intuitivi. ${extraContext?.moonPhase ? `Siamo in fase di **${extraContext.moonPhase}**, un tempo propizio per allineare desideri e azioni.` : 'È il momento ideale per raccogliere le energie e proteggere il proprio campo aurico.'}\n\n🕯️ **Rituale consigliato:** Accendi una candela bianca o viola e consacra il tuo spazio di lavoro con fumo di salvia o lavanda.`;
  }

  if (q.includes('sogn') || q.includes('dormir') || q.includes('incubo') || q.includes('notte')) {
    return `🔮 **Interpretazione del Mondo Onirico:**\nI sogni sono messaggi del sé superiore e dell'inconscio archetipico. Prendi nota dei colori dominanti, delle emozioni provate al risveglio e degli elementi (acqua = emozioni, fuoco = trasformazione, terra = radicamento, aria = pensieri).\n\n🌿 **Sigillo di Protezione:** Posiziona un'Ametista o una Selenite sotto il cuscino per favorire sogni lucidi e pace spirituale.`;
  }

  if (q.includes('client') || q.includes('consult') || q.includes('appuntament')) {
    return `📿 **Guida per la Consulenza Sacra:**\nOgni persona che giunge da te è guidata da una sincronicità. Accoglila come un'anima in cammino. Mantieni il tuo radicamento con una Tormalina Nera o un Diaspro Rosso alla base del tavolo per non assorbire energie dense.\n\n✨ **Mantra di Chiusura:** Al termine del consulto, batti le mani tre volte o soffia via dolcemente l'energia residua per liberare lo spazio.`;
  }

  if (q.includes('erb') || q.includes('cristall') || q.includes('purific') || q.includes('incens')) {
    return `🌿 **Alchimia dei Cristalli & Piante Sacre:**\nLe vibrazioni della natura sono alleati potenti. Per purificare lo spazio usa **Salvia Bianca o Rosmarino** con fumo a spirale in senso orario. Per elevare la frequenza, diffondi essenza di **Rosa Damascena o Lavanda Vera**.\n\n💎 **Cristallo alleato:** Il Quarzo Ialino amplifica tutte le intenzioni positive.`;
  }

  return `✨ **Parola dell'Oracolo:**\n"L'Universo parla il linguaggio dei simboli, del silenzio e dell'armonia interiore."\n\nQualunque sia la domanda del tuo cuore in questo istante, fidati del tuo discernimento e della tua luce. Rimani centrata nel tuo tempio interiore e le risposte emergeranno con naturalezza e limpidezza.\n\n🌿 *Benedizioni di pace e grazia sul tuo cammino.*`;
}
