// Web Speech API Utilities: Speech-to-Text (STT) and Text-to-Speech (TTS) for Italian

export interface SpeechRecognitionResultState {
  transcript: string;
  isListening: boolean;
  isSupported: boolean;
  error: string | null;
}

// Check Speech Recognition Support
export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
}

// Check Speech Synthesis Support
export function isSpeechSynthesisSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return 'speechSynthesis' in window;
}

// Speak Italian Text using Web Speech Synthesis
let currentUtterance: SpeechSynthesisUtterance | null = null;

export function speakItalianText(
  text: string,
  options?: {
    rate?: number;
    pitch?: number;
    onStart?: () => void;
    onEnd?: () => void;
    onError?: (err: any) => void;
  }
): void {
  if (!isSpeechSynthesisSupported()) {
    if (options?.onError) options.onError('La sintesi vocale non è supportata da questo browser.');
    return;
  }

  // Stop any active speech
  stopSpeaking();

  // Strip markdown or extra symbols for cleaner speech
  const cleanText = text
    .replace(/[#*_`~>\[\]]/g, '')
    .replace(/https?:\/\/\S+/g, '')
    .replace(/✨|🌙|🔮|🕯️|🌿|💫|🌟|♈|♉|♊|♋|♌|♍|♎|♏|♐|♑|♒|♓/g, ' ')
    .trim();

  if (!cleanText) {
    if (options?.onEnd) options.onEnd();
    return;
  }

  const utterance = new SpeechSynthesisUtterance(cleanText);
  utterance.lang = 'it-IT';
  utterance.rate = options?.rate || 0.95; // slightly slower for mystical/calm cadence
  utterance.pitch = options?.pitch || 1.0;

  // Try to find an Italian voice
  const voices = window.speechSynthesis.getVoices();
  const italianVoice = voices.find(
    (v) => v.lang.startsWith('it') || v.lang.includes('it-IT') || v.name.toLowerCase().includes('italian')
  );
  if (italianVoice) {
    utterance.voice = italianVoice;
  }

  utterance.onstart = () => {
    if (options?.onStart) options.onStart();
  };

  utterance.onend = () => {
    currentUtterance = null;
    if (options?.onEnd) options.onEnd();
  };

  utterance.onerror = (e) => {
    currentUtterance = null;
    if (options?.onError) options.onError(e);
  };

  currentUtterance = utterance;
  window.speechSynthesis.speak(utterance);
}

// Stop currently playing speech
export function stopSpeaking(): void {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    currentUtterance = null;
  }
}

// Check if currently speaking
export function isCurrentlySpeaking(): boolean {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    return window.speechSynthesis.speaking;
  }
  return false;
}
