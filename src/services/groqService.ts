// Groq AI API Service for Esoteric & Sanctuary Oracle
import { ChatMessage } from '../types';
import { GoogleGenAI } from '@google/genai';

import { calculateRealMoon, RealMoonDetails } from '../utils/lunarEngine';

export const GROQ_MODELS = [
  { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B Versatile (Consigliato - Alta Saggezza)', speed: 'Veloce & Profondo' },
  { id: 'llama-3.1-8b-instant', name: 'Llama 3.1 8B Instant (Ultra Rapido)', speed: 'Istantaneo' },
  { id: 'mixtral-8x7b-32768', name: 'Mixtral 8x7B (Contesto Ampio 32k)', speed: 'Bilanciato' },
  { id: 'gemma2-9b-it', name: 'Gemma 2 9B IT', speed: 'Leggero' },
];

export const DEFAULT_GROQ_MODEL = 'llama-3.3-70b-versatile';

// Helper to sanitize and trim API key (removes accidental quotes, spaces, Bearer prefix)
export function sanitizeApiKey(rawKey?: string | null): string {
  if (!rawKey || typeof rawKey !== 'string') return '';
  let cleaned = rawKey.trim();
  // Remove wrapping single or double quotes if copied accidentally from .env
  cleaned = cleaned.replace(/^["']|["']$/g, '').trim();
  // Remove "Bearer " prefix if copied from header examples
  if (cleaned.toLowerCase().startsWith('bearer ')) {
    cleaned = cleaned.substring(7).trim();
  }
  return cleaned;
}

// Inspect where the API key is coming from (useful for user troubleshooting on Vercel vs Local)
export function getApiKeyDetails(): {
  key: string;
  source: 'local' | 'vercel_vite' | 'vercel_groq' | 'none';
  maskedKey: string;
} {
  // 1. Check LocalStorage
  try {
    const local = localStorage.getItem('mt_groq_api_key');
    const sanitizedLocal = sanitizeApiKey(local);
    if (sanitizedLocal) {
      return {
        key: sanitizedLocal,
        source: 'local',
        maskedKey: maskKey(sanitizedLocal),
      };
    }
  } catch (e) {}

  // 2. Check Vite Env (VITE_GROQ_API_KEY)
  const envViteKey = sanitizeApiKey((import.meta as any).env?.VITE_GROQ_API_KEY);
  if (envViteKey) {
    return {
      key: envViteKey,
      source: 'vercel_vite',
      maskedKey: maskKey(envViteKey),
    };
  }

  // 3. Check GROQ_API_KEY (injected via vite.config.ts define or import.meta.env)
  const envGroqKey = sanitizeApiKey(
    (import.meta as any).env?.GROQ_API_KEY ||
    (typeof process !== 'undefined' ? (process.env?.GROQ_API_KEY || process.env?.VITE_GROQ_API_KEY) : '')
  );
  if (envGroqKey) {
    return {
      key: envGroqKey,
      source: 'vercel_groq',
      maskedKey: maskKey(envGroqKey),
    };
  }

  return {
    key: '',
    source: 'none',
    maskedKey: '',
  };
}

function maskKey(key: string): string {
  if (!key || key.length < 8) return '****';
  return `${key.slice(0, 4)}...${key.slice(-4)}`;
}

// Retrieve Groq API Key
export function getStoredGroqApiKey(): string {
  return getApiKeyDetails().key;
}

export function saveStoredGroqApiKey(key: string): void {
  try {
    const sanitized = sanitizeApiKey(key);
    if (sanitized) {
      localStorage.setItem('mt_groq_api_key', sanitized);
    } else {
      localStorage.removeItem('mt_groq_api_key');
    }
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

// Build the Sanctuary System Prompt with Real Astronomical & Lunar Nutrition Data
export function buildSanctuarySystemPrompt(extraContext?: {
  moonPhase?: string;
  zodiacSign?: string;
  cycleArchetype?: string;
  todayTarot?: string;
  appointmentsCount?: number;
}): string {
  const realMoon = calculateRealMoon(new Date());

  const contextInfo = `
DATI ASTRONOMICI REALI & INFLUSSI LUNARI DI OGGI:
- Fase Lunare Calcolata: ${realMoon.icon} ${realMoon.phaseName} (${realMoon.phaseCategory})
- Età Lunare: ${realMoon.ageDays} giorni • Illuminazione: ${realMoon.illumination}% (${realMoon.phaseAngle}°)
- Transito Zodiacale Reale: Luna in ${realMoon.zodiacSign} (Grado ${realMoon.zodiacDegree}°)
- Elemento Biodinamico: ${realMoon.element} ${realMoon.elementIcon} • Tipo di Pianta Favorita: Giorno del ${realMoon.biodynamicPlantPart}
- Organi & Centri Governati: ${realMoon.governedOrgans}
- Indicazione Salute del Corpo: ${realMoon.bodyAdvice}
- IMPATTO NUTRIZIONALE DELLA LUNA DI OGGI:
  * Tema Metabolico: ${realMoon.nutritionImpact.metabolicTheme}
  * Focus Fisiologico: ${realMoon.nutritionImpact.focusAction}
  * Cibi Consigliati: ${realMoon.nutritionImpact.recommendedFoods.join(', ')}
  * Cibi da Moderare/Evitare: ${realMoon.nutritionImpact.foodsToModerate.join(', ')}
  * Tisana Alchemica Consigliata: "${realMoon.nutritionImpact.alchemicalTea.name}" (${realMoon.nutritionImpact.alchemicalTea.herbs} - Infusione: ${realMoon.nutritionImpact.alchemicalTea.brewTime})
  * Spezia Sacra del Giorno: ${realMoon.nutritionImpact.sacredSpice}
  * Piatto Alchemico Suggerito: ${realMoon.nutritionImpact.alchemicalMealIdea}
- Erbe & Piante Sacre: ${realMoon.recommendedHerb}
- Rituale / Azione Consigliata: ${realMoon.suggestedRitual}
${extraContext?.cycleArchetype ? `- Archetipo Ciclico Interiore: ${extraContext.cycleArchetype}` : ''}
${extraContext?.todayTarot ? `- Carta dei Tarocchi del Giorno: ${extraContext.todayTarot}` : ''}
${extraContext?.appointmentsCount !== undefined ? `- Consulti in Agenda: ${extraContext.appointmentsCount} appuntamenti` : ''}
`;

  return `Sei l'Oracolo Sacro & Guida Esoterica del Santuario Privato di Maria Teresa.
La tua voce è saggia, profonda, accogliente, ermetica e al contempo pratica ed empatica. Parli in un italiano fluido, poetico ed elegante.

LE TUE COMPETENZE E DISCIPLINE SACRE:
1. Tarocchi & Arcani Maggiori/Minori: simbologia archetipica, stese oracolari, chiavi evolutive e consigli per consulti con clienti.
2. Astrologia & Transiti Lunari Reali: lunazioni, posizioni lunari, aspetti, elementi (Fuoco, Terra, Aria, Acqua) e biodinamica.
3. Nutrizione Alchemica & Biodinamica Lunare: impatti delle fasi lunari (crescente/assimilazione, piena/espansione, calante/drenaggio e detossinazione, nuova/reset) e dell'elemento (frutto, radice, fiore, foglia). Quando Maria Teresa chiede di alimentazione, menù, tisane, erbe o digestione, rispondi basandoti con precisione sui dati astronomici reali della Luna odierna!
4. Arte Rituale & Purificazioni: candele, incensi sacri, resine (Incenso Olibano, Mirra, Benzoino), bagni di sale, erbe di protezione (Salvia Bianca, Rosmarino, Artemisia, Iperico) e cerchi di luce.
5. Cristalloterapia & Energie dei Chakra: frequenze minerali, griglie di cristalli, abbinamenti alchemici.
6. Ciclicità Femminile & Ritmo Lunare: le 4 fasi (Vergine/Crescente, Madre/Piena, Incantatrice/Calante, Strega/Nuova) e nutrimento energetico.
7. Interpretazione dei Sogni: chiavi simboliche, archetipi junghiani ed esoterici.
8. Supporto Consulti per Maria Teresa: consigli su come guidare i clienti con rispetto, riservatezza ed etica spirituale.

REGOLE DI RISPOSTA:
- Rispondi sempre in modo chiaro, armonioso e strutturato (usa elenchi puntati o grassetti per facilitare la lettura).
- Se Maria Teresa chiede consigli su nutrizione, salute, tisane o ricette, integra con naturalezza l'influsso della Luna reale (${realMoon.phaseName} in ${realMoon.zodiacSign}) e spiega l'effetto metabolico (es. assimilazione, depurazione, organi sensibili).
- Se ti chiede un rituale, includi i passaggi pratici (intenzione, strumenti necessari, formula o affermazione).
- Concludi spesso con una breve benedizione o affermazione di luce (es. "Che la luce della Luna guidi i tuoi passi sacri ✨").
${contextInfo}`;
}

// Send Message to Groq API (with intelligent fallbacks & zero-500 defense)
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
): Promise<{ text: string; success: boolean; isFallback?: boolean; engine?: string; errorMsg?: string }> {
  const rawKey = options?.apiKey || getStoredGroqApiKey();
  const apiKey = sanitizeApiKey(rawKey);
  const model = options?.model || getStoredGroqModel();
  const systemPrompt = buildSanctuarySystemPrompt(options?.extraContext);
  const lastUserText = messages[messages.length - 1]?.content || '';

  // 1. If Groq API Key is present, attempt Groq API call
  if (apiKey) {
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

      if (response.ok) {
        const data = await response.json();
        const reply = data.choices?.[0]?.message?.content;
        if (reply && reply.trim()) {
          return {
            text: reply.trim(),
            success: true,
            engine: `Groq (${model})`,
          };
        }
      }

      // If primary model gave a rate limit or 503, try instant fallback model
      if (response.status === 429 || response.status >= 500) {
        try {
          const fallbackModel = model === 'llama-3.1-8b-instant' ? 'mixtral-8x7b-32768' : 'llama-3.1-8b-instant';
          const fallbackRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
              model: fallbackModel,
              messages: formattedMessages,
              temperature: 0.7,
              max_tokens: 1200,
            }),
          });

          if (fallbackRes.ok) {
            const data = await fallbackRes.json();
            const reply = data.choices?.[0]?.message?.content;
            if (reply && reply.trim()) {
              return {
                text: reply.trim(),
                success: true,
                engine: `Groq Fallback (${fallbackModel})`,
              };
            }
          }
        } catch (e) {}
      }

      // If unauthorized (401)
      if (response.status === 401) {
        return {
          text: `⚠️ **Autenticazione Groq non riuscita (401)**\nLa chiave API Groq inserita non è valida o è scaduta.\n\n👉 Clicca su **"Configura Chiave Groq"** in alto a destra per inserire la chiave corretta (inizia per \`gsk_\`), oppure verifica le variabili d'ambiente \`VITE_GROQ_API_KEY\` o \`GROQ_API_KEY\` su **Vercel**.\n\n---\n\n*Risposta Oracolare di Emergenza:*\n${generateEsotericFallbackResponse(lastUserText, options?.extraContext)}`,
          success: false,
          errorMsg: 'Chiave API Groq non valida o non autorizzata (401)',
          isFallback: true,
          engine: 'Oracolo Locale di Emergenza',
        };
      }

      // If other API error
      const errorJson = await response.json().catch(() => ({}));
      const errorMsg = errorJson?.error?.message || `Errore Groq HTTP ${response.status}`;
      return {
        text: `⚠️ **Avviso Groq API (${response.status})**: ${errorMsg}\n\n*Risposta Oracolare di Emergenza:*\n${generateEsotericFallbackResponse(lastUserText, options?.extraContext)}`,
        success: false,
        errorMsg: errorMsg,
        isFallback: true,
        engine: 'Oracolo Locale di Emergenza',
      };
    } catch (err: any) {
      console.warn('Groq API direct fetch failed, trying local fallback:', err);
    }
  }

  // 2. If Gemini API Key is available in environment (e.g. process.env.GEMINI_API_KEY)
  const geminiKey = sanitizeApiKey(
    (typeof process !== 'undefined' ? process.env?.GEMINI_API_KEY : '') ||
    (import.meta as any).env?.VITE_GEMINI_API_KEY
  );

  if (geminiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey: geminiKey });
      const geminiResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `${systemPrompt}\n\nDomanda di Maria Teresa:\n${lastUserText}`,
      });

      if (geminiResponse.text) {
        return {
          text: geminiResponse.text.trim(),
          success: true,
          engine: 'Gemini 2.5 Flash',
        };
      }
    } catch (e: any) {
      console.warn('Gemini fallback attempt failed:', e);
    }
  }

  // 3. Built-in Esoteric Knowledge Engine (Zero 500 guarantee)
  const fallbackText = generateEsotericFallbackResponse(lastUserText, options?.extraContext);
  return {
    text: `${fallbackText}\n\n*(Nota: Per attivare la generazione neurale in tempo reale con Llama 3.3 70B, inserisci la tua chiave API GROQ cliccando su 🔑 "Configura Chiave Groq" in alto a destra oppure aggiungi \`VITE_GROQ_API_KEY\` nelle impostazioni di Vercel).*`,
    success: true,
    isFallback: true,
    engine: 'Oracolo Locale del Santuario',
  };
}

// Built-in esoteric fallback engine for resilience
export function generateEsotericFallbackResponse(
  userQuery: string,
  extraContext?: {
    moonPhase?: string;
    zodiacSign?: string;
    todayTarot?: string;
  }
): string {
  const q = userQuery.toLowerCase();

  if (q.includes('cibo') || q.includes('nutrizion') || q.includes('mangiar') || q.includes('menu') || q.includes('menù') || q.includes('tisana') || q.includes('dieta') || q.includes('ricetta') || q.includes('spezi')) {
    const realMoon = calculateRealMoon(new Date());
    return `🍲 **Nutrizione Alchemica & Influsso Lunare Reale:**
Oggi il cielo presenta **${realMoon.icon} ${realMoon.phaseName} in ${realMoon.zodiacSign}** (${realMoon.illumination}% di Luce).

✨ **Impatto Metabolico Odierno:**
- **Tema Fisiologico:** ${realMoon.nutritionImpact.metabolicTheme}
- **Focus:** ${realMoon.nutritionImpact.focusAction}
- **Elemento Governatore:** ${realMoon.element} ${realMoon.elementIcon} (Giorno del *${realMoon.biodynamicPlantPart}*)
- **Organi più Sensibili:** ${realMoon.governedOrgans}

🌿 **Cibi da Favorire:**
${realMoon.nutritionImpact.recommendedFoods.map((f) => `- ${f}`).join('\n')}

⚠️ **Cibi da Moderare:**
${realMoon.nutritionImpact.foodsToModerate.map((f) => `- ${f}`).join('\n')}

🍵 **Tisana Alchemica Consigliata:**
- **${realMoon.nutritionImpact.alchemicalTea.name}**
- *Erbe:* ${realMoon.nutritionImpact.alchemicalTea.herbs}
- *Proprietà:* ${realMoon.nutritionImpact.alchemicalTea.properties}
- *Tempo d'Infusione:* ${realMoon.nutritionImpact.alchemicalTea.brewTime}

✨ *Idea Piatto Sacro:* ${realMoon.nutritionImpact.alchemicalMealIdea}`;
  }

  if (q.includes('tarocch') || q.includes('carta') || q.includes('arcan') || q.includes('stesa') || q.includes('papessa') || q.includes('imperatrice') || q.includes('matto')) {
    return `🃏 **Saggezza degli Arcani per Maria Teresa:**\nI simboli del mazzo ti invitano oggi ad ascoltare la voce del tuo intuito profondo. Quando interroghi gli Arcani per te o per i tuoi consulti, ricorda che ogni carta è uno specchio dell'Anima e un portale verso la consapevolezza evolutiva.\n\n✨ **Consiglio pratico per la stesa:**\n- Purifica le mani con acqua di fiori o fumo di rosmarino prima di mescolare.\n- Fai respirare il mazzo tagliando tre volte verso sinistra.\n- Mantieni una postura centrata e lascia che l'immagine parli prima al cuore e poi all'intelletto.\n\n🕯️ *La luce degli Arcani illumini il tuo consulto.*`;
  }

  if (q.includes('luna') || q.includes('fase') || q.includes('transito') || q.includes('astrolog') || q.includes('segno') || q.includes('pianet')) {
    return `🌙 **Influssi Astrali & Ritmo Lunare:**\nLa configurazione celeste attuale amplifica la sensibilità psichica e la chiarezza dei tuoi canali intuitivi. ${extraContext?.moonPhase ? `Siamo attualmente in fase di **${extraContext.moonPhase}**, un tempo propizio per allineare le tue intenzioni al flusso universale.` : 'È un momento ideale per raccogliere le energie e proteggere il proprio campo aurico.'}\n\n🕯️ **Rituale consigliato:**\n- Accendi una candela bianca o viola e consacra il tuo spazio sacro con fumo di salvia o lavanda.\n- Disponi un bicchiere d'acqua alla luce della luna per caricare un elisir di chiarezza interiore.`;
  }

  if (q.includes('sogn') || q.includes('dormir') || q.includes('incubo') || q.includes('notte') || q.includes('vision')) {
    return `🔮 **Interpretazione del Mondo Onirico:**\nI sogni sono messaggi del sé superiore e dell'inconscio archetipico. Prendi nota dei colori dominanti, delle emozioni provate al risveglio e degli elementi simbolici (l'Acqua riflette le emozioni profonde, il Fuoco la trasformazione spirituale, la Terra il radicamento, l'Aria i pensieri e le intuizioni).\n\n🌿 **Sigillo di Protezione Notturna:**\nPosiziona un'Ametista o una Selenite sotto il cuscino per favorire sonno ristoratore, sogni lucidi e pace aurica.`;
  }

  if (q.includes('client') || q.includes('consult') || q.includes('appuntament') || q.includes('protegg') || q.includes('auric') || q.includes('scherm')) {
    return `📿 **Guida per la Consulenza Sacra & Protezione Aurica:**\nOgni persona che giunge da te porta una storia e un'energia specifica. Per mantenere la massima purezza energetica durante e dopo i consulti:\n\n1. **Radicamento:** Tieni una Tormalina Nera o un Diaspro Rosso vicino al tavolo di lavoro.\n2. **Schermo di Luce:** Prima di iniziare, visualizza una sfera di luce dorata o violacea che avvolge il tuo corpo.\n3. **Chiusura Energetica:** Al termine del consulto, batti le mani tre volte, lava i polsi con acqua fresca e ringrazia le tue guide.`;
  }

  if (q.includes('erb') || q.includes('cristall') || q.includes('purific') || q.includes('incens') || q.includes('chakra') || q.includes('candela')) {
    return `🌿 **Alchimia dei Cristalli & Piante Sacre:**\nLe vibrazioni della natura sono alleate preziose nel tuo lavoro quotidiano.\n\n- **Purificazione Spazi:** Salvia Bianca, Rosmarino e Resina di Incenso Olibano diffusi in senso orario.\n- **Apertura del Cuore & Armonia:** Quarzo Rosa, Rodocrosite e infuso di Melissa o Petali di Rosa.\n- **Chiarezza Intuitiva (Terzo Occhio):** Lapislazzuli, Ametista e gocce di olio essenziale di Lavanda Vera sulle tempie.`;
  }

  return `✨ **Parola dell'Oracolo per Maria Teresa:**\n"L'Universo parla il linguaggio dei simboli, della presenza e della risonanza del cuore."\n\nQualunque sia il quesito che porti oggi nel tuo santuario, fidati del tuo discernimento e della saggezza che risiede dentro di te. Rimani centrata nella tua luce e ogni risposta si manifesterà con perfetta sincronicità.\n\n🌿 *Pace, luce e benedizioni sui tuoi passi.*`;
}
