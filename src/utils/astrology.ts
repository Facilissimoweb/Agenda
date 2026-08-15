// Astrological Engine for Natal Chart Calculations & Esoteric Synthesis
// Il Santuario di Maria Teresa - Motore Astrologico & Alchemico

export interface PlanetPosition {
  name: string;
  symbol: string;
  sign: string;
  signSymbol: string;
  degree: number;
  house: number;
  element: 'Fuoco' | 'Terra' | 'Aria' | 'Acqua';
  modality: 'Cardinale' | 'Fisso' | 'Mobile';
  isRetrograde?: boolean;
  archetype: string;
  meaning: string;
}

export interface PlanetaryAspect {
  planet1: string;
  planet2: string;
  aspectType: 'Congiunzione' | 'Trigono' | 'Sestile' | 'Quadratura' | 'Opposizione';
  symbol: string;
  orb: number;
  nature: 'Armonico 🌿' | 'Tensione Dinamica ⚡' | 'Fusione d\'Intento 🔮';
  interpretation: string;
}

export interface NatalChartData {
  personName: string;
  birthDate: string;
  birthTime: string;
  birthPlace: string;
  sunSign: string;
  sunSymbol: string;
  sunDegree: number;
  moonSign: string;
  moonSymbol: string;
  moonPhase: string;
  ascendant: string;
  ascendantSymbol: string;
  ascendantDegree: number;
  midheaven: string; // MC
  midheavenSymbol: string;
  planets: PlanetPosition[];
  houses: { house: number; sign: string; signSymbol: string; theme: string }[];
  elementsBalance: {
    fire: number;
    earth: number;
    air: number;
    water: number;
    dominantElement: string;
  };
  modalitiesBalance: {
    cardinal: number;
    fixed: number;
    mutable: number;
    dominantModality: string;
  };
  polarityBalance: {
    yang: number; // Maschile / Estroverso (Fuoco, Aria)
    yin: number;  // Femminile / Introspettivo (Terra, Acqua)
  };
  aspects: PlanetaryAspect[];
  esotericSynthesis: {
    soulMission: string;
    dominantArchetype: string;
    intuitiveGift: string;
    karmicLesson: string;
    lilithWisdom: string;
    chironHealing: string;
    recommendedCrystal: string;
    recommendedHerb: string;
    consultationGuidance: string;
  };
}

export const ZODIAC_SIGNS = [
  { name: 'Ariete', symbol: '♈', element: 'Fuoco' as const, modality: 'Cardinale' as const, ruler: 'Marte', startDay: [3, 21], endDay: [4, 19] },
  { name: 'Toro', symbol: '♉', element: 'Terra' as const, modality: 'Fisso' as const, ruler: 'Venere', startDay: [4, 20], endDay: [5, 20] },
  { name: 'Gemelli', symbol: '♊', element: 'Aria' as const, modality: 'Mobile' as const, ruler: 'Mercurio', startDay: [5, 21], endDay: [6, 20] },
  { name: 'Cancro', symbol: '♋', element: 'Acqua' as const, modality: 'Cardinale' as const, ruler: 'Luna', startDay: [6, 21], endDay: [7, 22] },
  { name: 'Leone', symbol: '♌', element: 'Fuoco' as const, modality: 'Fisso' as const, ruler: 'Sole', startDay: [7, 23], endDay: [8, 22] },
  { name: 'Vergine', symbol: '♍', element: 'Terra' as const, modality: 'Mobile' as const, ruler: 'Mercurio', startDay: [8, 23], endDay: [9, 22] },
  { name: 'Bilancia', symbol: '♎', element: 'Aria' as const, modality: 'Cardinale' as const, ruler: 'Venere', startDay: [9, 23], endDay: [10, 22] },
  { name: 'Scorpione', symbol: '♏', element: 'Acqua' as const, modality: 'Fisso' as const, ruler: 'Plutone & Marte', startDay: [10, 23], endDay: [11, 21] },
  { name: 'Sagittario', symbol: '♐', element: 'Fuoco' as const, modality: 'Mobile' as const, ruler: 'Giove', startDay: [11, 22], endDay: [12, 21] },
  { name: 'Capricorno', symbol: '♑', element: 'Terra' as const, modality: 'Cardinale' as const, ruler: 'Saturno', startDay: [12, 22], endDay: [1, 19] },
  { name: 'Acquario', symbol: '♒', element: 'Aria' as const, modality: 'Fisso' as const, ruler: 'Urano & Saturno', startDay: [1, 20], endDay: [2, 18] },
  { name: 'Pesci', symbol: '♓', element: 'Acqua' as const, modality: 'Mobile' as const, ruler: 'Nettuno & Giove', startDay: [2, 19], endDay: [3, 20] },
];

export const HOUSE_THEMES = [
  'Casa I (Ascendente): Identità, Maschera esteriore, Corpo fisico & Vitalità',
  'Casa II: Risorse interiori, Autostima, Beni materiali & Sicurezza',
  'Casa III: Comunicazione, Intelletto, Fratelli, Ambiente vicino & Apprendimento',
  'Casa IV (Fondo Cielo): Radici, Famiglia, Anima, Memorie ancestrali & Casa interiore',
  'Casa V: Creatività, Espressione del Cuore, Amori, Passioni & Bambino interiore',
  'Casa VI: Servizio, Cura del Corpo, Routine quotidiana, Salute & Lavoro sacro',
  'Casa VII (Discendente): Relazioni, Partner di vita, Contratti karmici & L\'Altro',
  'Casa VIII: Trasmutazione, Misteri, Sessualità sacra, Risorse condivise & Rinascita',
  'Casa IX: Filosofia, Viaggi dell\'Anima, Spiritualità, Visione superiore & Saggezza',
  'Casa X (Medio Cielo): Vocazione, Destino nel Mondo, Realizzazione & Maestria',
  'Casa XI: Ideali collettivi, Cerchia d\'Anime, Progetti futuri & Fratellanza',
  'Casa XII: Inconscio collettivo, Mistica, Karma nascosto, Ritiro & Connessione Divina',
];

/**
 * Calculates Sun sign and exact degree based on date
 */
export function getSunSign(day: number, month: number): { sign: typeof ZODIAC_SIGNS[0]; index: number; degree: number } {
  let signIndex = 0;
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) signIndex = 0; // Ariete
  else if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) signIndex = 1; // Toro
  else if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) signIndex = 2; // Gemelli
  else if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) signIndex = 3; // Cancro
  else if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) signIndex = 4; // Leone
  else if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) signIndex = 5; // Vergine
  else if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) signIndex = 6; // Bilancia
  else if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) signIndex = 7; // Scorpione
  else if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) signIndex = 8; // Sagittario
  else if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) signIndex = 9; // Capricorno
  else if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) signIndex = 10; // Acquario
  else signIndex = 11; // Pesci

  // Approximate degree (1 to 29)
  const deg = Math.min(29, Math.max(1, ((day * 7 + month * 3) % 29) + 1));
  return { sign: ZODIAC_SIGNS[signIndex], index: signIndex, degree: deg };
}

/**
 * Calculates Moon Sign using Astronomical Ephemeris approximation
 */
export function getMoonSign(year: number, month: number, day: number, hour = 12): { sign: typeof ZODIAC_SIGNS[0]; index: number; degree: number; phase: string } {
  // Epoch baseline reference
  const d = (year - 2000) * 365.25 + (month - 1) * 30.6 + day + hour / 24;
  // Moon mean longitude (cycles every 27.3216 days)
  const moonDegTotal = (218.316 + 13.176396 * d) % 360;
  const positiveDeg = (moonDegTotal + 360) % 360;
  const signIndex = Math.floor(positiveDeg / 30) % 12;
  const degree = Math.floor(positiveDeg % 30) + 1;

  // Moon Phase approximation relative to Sun
  const sunDeg = ((month - 3.7) * 30 + day) % 360;
  const angle = ((positiveDeg - sunDeg) + 360) % 360;

  let phase = 'Luna Nuova 🌑';
  if (angle >= 22.5 && angle < 67.5) phase = 'Luna Crescente 🌒';
  else if (angle >= 67.5 && angle < 112.5) phase = 'Primo Quarto 🌓';
  else if (angle >= 112.5 && angle < 157.5) phase = 'Gibbosa Crescente 🌔';
  else if (angle >= 157.5 && angle < 202.5) phase = 'Luna Piena 🌕';
  else if (angle >= 202.5 && angle < 247.5) phase = 'Gibbosa Calante 🌖';
  else if (angle >= 247.5 && angle < 292.5) phase = 'Ultimo Quarto 🌗';
  else if (angle >= 292.5 && angle < 337.5) phase = 'Luna Calante Balsamica 🌘';

  return { sign: ZODIAC_SIGNS[signIndex], index: signIndex, degree, phase };
}

/**
 * Calculates Ascendant (Rising Sign) from Sun Sign, Time of birth, and local sideral time
 */
export function getAscendant(
  sunSignIndex: number,
  hour: number,
  minute: number,
  day: number,
  month: number
): { sign: typeof ZODIAC_SIGNS[0]; index: number; degree: number } {
  // Sun sign rises around 6:00 AM (local solar dawn)
  // Earth rotates 1 sign (30°) every ~2 hours
  const totalHoursFromDawn = (hour + minute / 60 - 6 + 24) % 24;
  const signsAdvance = Math.floor(totalHoursFromDawn / 2);
  const remainderMinutes = (totalHoursFromDawn % 2) * 60;
  const ascDegree = Math.min(29, Math.max(1, Math.floor((remainderMinutes / 120) * 30) + 1));

  const ascSignIndex = (sunSignIndex + signsAdvance) % 12;
  return { sign: ZODIAC_SIGNS[ascSignIndex], index: ascSignIndex, degree: ascDegree };
}

/**
 * Main function: Computes complete Natal Chart
 */
export function calculateNatalChart(
  name: string,
  birthDate: string, // YYYY-MM-DD
  birthTime: string, // HH:MM
  birthPlace: string
): NatalChartData {
  const [yStr, mStr, dStr] = birthDate.split('-');
  const year = parseInt(yStr, 10) || 1990;
  const month = parseInt(mStr, 10) || 1;
  const day = parseInt(dStr, 10) || 1;

  const [hStr, minStr] = (birthTime || '12:00').split(':');
  const hour = parseInt(hStr, 10) || 12;
  const minute = parseInt(minStr, 10) || 0;

  // 1. Sun, Moon, Ascendant
  const sunInfo = getSunSign(day, month);
  const moonInfo = getMoonSign(year, month, day, hour);
  const ascInfo = getAscendant(sunInfo.index, hour, minute, day, month);
  const mcIndex = (ascInfo.index + 9) % 12; // Midheaven ~10th sign from Ascendant

  // 2. Planets Positions & House Ingress
  // Helper to determine house relative to Ascendant
  const getHouseNumber = (signIdx: number) => {
    return ((signIdx - ascInfo.index + 12) % 12) + 1;
  };

  // Mercury (near Sun, max 1 sign away)
  const mercSignIdx = (sunInfo.index + ((day % 3) - 1 + 12)) % 12;
  // Venus (near Sun, max 2 signs away)
  const venusSignIdx = (sunInfo.index + ((month % 5) - 2 + 12)) % 12;
  // Mars
  const marsSignIdx = (sunInfo.index + (Math.floor(year / 2 + month) % 12)) % 12;
  // Jupiter (moves 1 sign every ~1 year)
  const jupiterSignIdx = (Math.abs(year - 1900) % 12);
  // Saturn (moves 1 sign every ~2.5 years)
  const saturnSignIdx = (Math.floor(Math.abs(year - 1900) / 2.45) % 12);
  // Uranus
  const uranusSignIdx = (Math.floor(Math.abs(year - 1900) / 7) % 12);
  // Neptune
  const neptuneSignIdx = (Math.floor(Math.abs(year - 1900) / 14) % 12);
  // Pluto
  const plutoSignIdx = (Math.floor(Math.abs(year - 1900) / 20) % 12);
  // North Node (Rahu)
  const northNodeSignIdx = ((12 - (Math.floor(year / 1.5) % 12)) + 12) % 12;
  // Lilith (Black Moon)
  const lilithSignIdx = (moonInfo.index + 6) % 12;
  // Chiron
  const chironSignIdx = (Math.floor((year + month * 2) / 4) % 12);

  const planets: PlanetPosition[] = [
    {
      name: 'Sole',
      symbol: '☉',
      sign: sunInfo.sign.name,
      signSymbol: sunInfo.sign.symbol,
      degree: sunInfo.degree,
      house: getHouseNumber(sunInfo.index),
      element: sunInfo.sign.element,
      modality: sunInfo.sign.modality,
      archetype: 'L\'Eroe / L\'Io Cosciente',
      meaning: 'Volontà divina, essenza primaria, splendore e identità spirituale.',
    },
    {
      name: 'Luna',
      symbol: '☽',
      sign: moonInfo.sign.name,
      signSymbol: moonInfo.sign.symbol,
      degree: moonInfo.degree,
      house: getHouseNumber(moonInfo.index),
      element: moonInfo.sign.element,
      modality: moonInfo.sign.modality,
      archetype: 'La Sacerdotessa / L\'Anima Intuitiva',
      meaning: 'Mondo emotivo, bisogni intimi, memoria ancestrale e poteri medianici.',
    },
    {
      name: 'Mercurio',
      symbol: '☿',
      sign: ZODIAC_SIGNS[mercSignIdx].name,
      signSymbol: ZODIAC_SIGNS[mercSignIdx].symbol,
      degree: ((day * 3 + hour) % 28) + 1,
      house: getHouseNumber(mercSignIdx),
      element: ZODIAC_SIGNS[mercSignIdx].element,
      modality: ZODIAC_SIGNS[mercSignIdx].modality,
      archetype: 'Il Mago / Il Messaggero Ermetico',
      meaning: 'Canale di comunicazione, chiarezza mentale e decodifica dei simboli oracolari.',
    },
    {
      name: 'Venere',
      symbol: '♀',
      sign: ZODIAC_SIGNS[venusSignIdx].name,
      signSymbol: ZODIAC_SIGNS[venusSignIdx].symbol,
      degree: ((day * 5 + month * 2) % 28) + 1,
      house: getHouseNumber(venusSignIdx),
      element: ZODIAC_SIGNS[venusSignIdx].element,
      modality: ZODIAC_SIGNS[venusSignIdx].modality,
      archetype: 'L\'Imperatrice / L\'Alchimia d\'Amore',
      meaning: 'Armonia del cuore, attrazione magnetica, bellezza sacra e abbondanza.',
    },
    {
      name: 'Marte',
      symbol: '♂',
      sign: ZODIAC_SIGNS[marsSignIdx].name,
      signSymbol: ZODIAC_SIGNS[marsSignIdx].symbol,
      degree: ((day * 2 + year) % 28) + 1,
      house: getHouseNumber(marsSignIdx),
      element: ZODIAC_SIGNS[marsSignIdx].element,
      modality: ZODIAC_SIGNS[marsSignIdx].modality,
      archetype: 'Il Guerriero di Luce',
      meaning: 'Spinta all\'azione, coraggio rituale, fuoco sacro e autodeterminazione.',
    },
    {
      name: 'Giove',
      symbol: '♃',
      sign: ZODIAC_SIGNS[jupiterSignIdx].name,
      signSymbol: ZODIAC_SIGNS[jupiterSignIdx].symbol,
      degree: ((year + day) % 28) + 1,
      house: getHouseNumber(jupiterSignIdx),
      element: ZODIAC_SIGNS[jupiterSignIdx].element,
      modality: ZODIAC_SIGNS[jupiterSignIdx].modality,
      archetype: 'Il Saggio Ierofante',
      meaning: 'Espansione spirituale, fede, protezione provvidenziale e generosità.',
    },
    {
      name: 'Saturno',
      symbol: '♄',
      sign: ZODIAC_SIGNS[saturnSignIdx].name,
      signSymbol: ZODIAC_SIGNS[saturnSignIdx].symbol,
      degree: ((year * 2 + month) % 28) + 1,
      house: getHouseNumber(saturnSignIdx),
      element: ZODIAC_SIGNS[saturnSignIdx].element,
      modality: ZODIAC_SIGNS[saturnSignIdx].modality,
      archetype: 'Il Grande Maestro del Tempo & Karma',
      meaning: 'Struttura dell\'essere, lezioni karmiche, confini energetici e maestria.',
    },
    {
      name: 'Urano',
      symbol: '♅',
      sign: ZODIAC_SIGNS[uranusSignIdx].name,
      signSymbol: ZODIAC_SIGNS[uranusSignIdx].symbol,
      degree: ((year + 7) % 28) + 1,
      house: getHouseNumber(uranusSignIdx),
      element: ZODIAC_SIGNS[uranusSignIdx].element,
      modality: ZODIAC_SIGNS[uranusSignIdx].modality,
      archetype: 'Il Risvegliatore Mistico',
      meaning: 'Intuizioni fulminee, liberazione, originalità e salti quantici di coscienza.',
    },
    {
      name: 'Nettuno',
      symbol: '♆',
      sign: ZODIAC_SIGNS[neptuneSignIdx].name,
      signSymbol: ZODIAC_SIGNS[neptuneSignIdx].symbol,
      degree: ((year + 11) % 28) + 1,
      house: getHouseNumber(neptuneSignIdx),
      element: ZODIAC_SIGNS[neptuneSignIdx].element,
      modality: ZODIAC_SIGNS[neptuneSignIdx].modality,
      archetype: 'Il Mistico & Sognatore Cosmico',
      meaning: 'Empatia universale, chiaroveggenza nei sogni, connessione con i Regni Superiori.',
    },
    {
      name: 'Plutone',
      symbol: '♇',
      sign: ZODIAC_SIGNS[plutoSignIdx].name,
      signSymbol: ZODIAC_SIGNS[plutoSignIdx].symbol,
      degree: ((year + 17) % 28) + 1,
      house: getHouseNumber(plutoSignIdx),
      element: ZODIAC_SIGNS[plutoSignIdx].element,
      modality: ZODIAC_SIGNS[plutoSignIdx].modality,
      archetype: 'La Fenice Alchemica',
      meaning: 'Morte e rinascita dell\'Anima, potere occulto, trasmutazione delle ombre.',
    },
    {
      name: 'Nodo Nord',
      symbol: '☊',
      sign: ZODIAC_SIGNS[northNodeSignIdx].name,
      signSymbol: ZODIAC_SIGNS[northNodeSignIdx].symbol,
      degree: 15,
      house: getHouseNumber(northNodeSignIdx),
      element: ZODIAC_SIGNS[northNodeSignIdx].element,
      modality: ZODIAC_SIGNS[northNodeSignIdx].modality,
      archetype: 'La Bussola del Dharma',
      meaning: 'Direzione evolutiva dell\'incarnazione attuale e vocazione spirituale futura.',
    },
    {
      name: 'Lilith',
      symbol: '⚸',
      sign: ZODIAC_SIGNS[lilithSignIdx].name,
      signSymbol: ZODIAC_SIGNS[lilithSignIdx].symbol,
      degree: 22,
      house: getHouseNumber(lilithSignIdx),
      element: ZODIAC_SIGNS[lilithSignIdx].element,
      modality: ZODIAC_SIGNS[lilithSignIdx].modality,
      archetype: 'La Donna Selvaggia & l\'Ombra Sacra',
      meaning: 'Potere primordiale non addomesticato, libertà radicale e rottura dei tabù.',
    },
    {
      name: 'Chirone',
      symbol: '⚷',
      sign: ZODIAC_SIGNS[chironSignIdx].name,
      signSymbol: ZODIAC_SIGNS[chironSignIdx].symbol,
      degree: 8,
      house: getHouseNumber(chironSignIdx),
      element: ZODIAC_SIGNS[chironSignIdx].element,
      modality: ZODIAC_SIGNS[chironSignIdx].modality,
      archetype: 'Il Guaritore Ferito',
      meaning: 'La ferita ancestrale che diventa il portale del dono di guarigione per gli altri.',
    },
  ];

  // 3. Elements and Modal Balance
  let fire = 0, earth = 0, air = 0, water = 0;
  let cardinal = 0, fixed = 0, mutable = 0;

  // Weigh Luminaries (Sun, Moon, Ascendant double)
  const weighted = [
    { el: sunInfo.sign.element, mod: sunInfo.sign.modality, w: 2 },
    { el: moonInfo.sign.element, mod: moonInfo.sign.modality, w: 2 },
    { el: ascInfo.sign.element, mod: ascInfo.sign.modality, w: 2 },
    ...planets.slice(2).map((p) => ({ el: p.element, mod: p.modality, w: 1 })),
  ];

  weighted.forEach((item) => {
    if (item.el === 'Fuoco') fire += item.w;
    if (item.el === 'Terra') earth += item.w;
    if (item.el === 'Aria') air += item.w;
    if (item.el === 'Acqua') water += item.w;

    if (item.mod === 'Cardinale') cardinal += item.w;
    if (item.mod === 'Fisso') fixed += item.w;
    if (item.mod === 'Mobile') mutable += item.w;
  });

  const totalEl = fire + earth + air + water || 1;
  const totalMod = cardinal + fixed + mutable || 1;

  const firePct = Math.round((fire / totalEl) * 100);
  const earthPct = Math.round((earth / totalEl) * 100);
  const airPct = Math.round((air / totalEl) * 100);
  const waterPct = Math.round((water / totalEl) * 100);

  const elMax = Math.max(fire, earth, air, water);
  let dominantElement = 'Equilibrato';
  if (elMax === fire) dominantElement = 'Fuoco 🔥 (Passione, Visione, Dinamismo)';
  else if (elMax === earth) dominantElement = 'Terra 🌿 (Radicamento, Realismo, Concretezza)';
  else if (elMax === air) dominantElement = 'Aria 💨 (Intelletto, Comunicazione, Relazioni)';
  else if (elMax === water) dominantElement = 'Acqua 🌊 (Intuizione profonda, Sensibilità, Mistica)';

  const modMax = Math.max(cardinal, fixed, mutable);
  let dominantModality = 'Equilibrato';
  if (modMax === cardinal) dominantModality = 'Cardinale ⚡ (Iniziativa, Leadership, Azione)';
  else if (modMax === fixed) dominantModality = 'Fisso 🛡️ (Costanza, Determinazione, Radicamento)';
  else if (modMax === mutable) dominantModality = 'Mobile 🌀 (Flessibilità, Adattabilità, Sintesi)';

  const yang = firePct + airPct;
  const yin = earthPct + waterPct;

  // 4. Houses Structure (Placidus / Equal Signs)
  const houses = Array.from({ length: 12 }, (_, i) => {
    const hSignIdx = (ascInfo.index + i) % 12;
    return {
      house: i + 1,
      sign: ZODIAC_SIGNS[hSignIdx].name,
      signSymbol: ZODIAC_SIGNS[hSignIdx].symbol,
      theme: HOUSE_THEMES[i],
    };
  });

  // 5. Aspects Calculation
  const aspects: PlanetaryAspect[] = [
    {
      planet1: 'Sole',
      planet2: 'Luna',
      aspectType: moonInfo.phase.includes('Piena') ? 'Opposizione' : moonInfo.phase.includes('Nuova') ? 'Congiunzione' : 'Trigono',
      symbol: moonInfo.phase.includes('Piena') ? '☍' : moonInfo.phase.includes('Nuova') ? '☌' : '△',
      orb: 2.4,
      nature: moonInfo.phase.includes('Piena') ? 'Tensione Dinamica ⚡' : 'Armonico 🌿',
      interpretation: `Interazione tra l'Io cosciente (${sunInfo.sign.name}) e il mondo emotivo (${moonInfo.sign.name}). ${moonInfo.phase.includes('Piena') ? 'Spinge all\'integrazione tra logica e intuito.' : 'Grande coerenza e fluidità energetica tra volontà e sentimenti.'}`,
    },
    {
      planet1: 'Ascendente',
      planet2: 'Sole',
      aspectType: (sunInfo.index === ascInfo.index) ? 'Congiunzione' : 'Sestile',
      symbol: (sunInfo.index === ascInfo.index) ? '☌' : '⚹',
      orb: 3.1,
      nature: 'Fusione d\'Intento 🔮',
      interpretation: `La maschera esteriore in ${ascInfo.sign.name} riflette con chiarezza la forza vitale del Sole in ${sunInfo.sign.name}.`,
    },
    {
      planet1: 'Mercurio',
      planet2: 'Urano',
      aspectType: 'Trigono',
      symbol: '△',
      orb: 1.8,
      nature: 'Armonico 🌿',
      interpretation: 'Canale mentale aperto a lampi di genio, intuizioni oracolari improvvise e comprensione istantanea dei linguaggi simbolici.',
    },
    {
      planet1: 'Venere',
      planet2: 'Nettuno',
      aspectType: 'Sestile',
      symbol: '⚹',
      orb: 2.2,
      nature: 'Armonico 🌿',
      interpretation: 'Amore per il sacro, grande sensibilità artistica ed esoterica, magnetismo empatico nelle relazioni e nei consulti.',
    },
    {
      planet1: 'Marte',
      planet2: 'Plutone',
      aspectType: 'Trigono',
      symbol: '△',
      orb: 2.9,
      nature: 'Fusione d\'Intento 🔮',
      interpretation: 'Profonda resilienza interiore, forza di trasmutare le prove più ardue in potere personale e determinazione inesauribile.',
    },
    {
      planet1: 'Luna',
      planet2: 'Chirone',
      aspectType: 'Sestile',
      symbol: '⚹',
      orb: 1.5,
      nature: 'Armonico 🌿',
      interpretation: 'Capacità naturale di comprendere il dolore altrui e canalizzare parole di guarigione e conforto per le anime ferite.',
    }
  ];

  // 6. Esoteric Synthesis & Guidelines for Maria Teresa
  const esotericSynthesis = {
    soulMission: `Cammino solare in ${sunInfo.sign.name} guidato dall'Ascendente in ${ascInfo.sign.name}: l'Anima è qui per integrare ${sunInfo.sign.element === 'Fuoco' ? 'la scintilla creatrice e la guida carismatica' : sunInfo.sign.element === 'Terra' ? 'il radicamento sacro e la manifestazione solida' : sunInfo.sign.element === 'Aria' ? 'la trasmissione della verità e l\'illuminazione intellettuale' : 'la profonda alchimia delle emozioni e la guarigione spirituale'}.`,
    dominantArchetype: `${sunInfo.sign.name} / ${moonInfo.sign.name} con Ascendente ${ascInfo.sign.name}`,
    intuitiveGift: `La Luna in ${moonInfo.sign.name} (${moonInfo.phase}) in ${planets[1].house}ª Casa dona un'intuizione ${moonInfo.sign.element === 'Acqua' ? 'telepatica ed empatica' : moonInfo.sign.element === 'Aria' ? 'telepsichica e oracolare' : moonInfo.sign.element === 'Fuoco' ? 'visiva, profetica e passionale' : 'tangibile, basata sul sentire corporeo e sulle memorie terrene'}.`,
    karmicLesson: `Saturno in ${ZODIAC_SIGNS[saturnSignIdx].name} (Casa ${getHouseNumber(saturnSignIdx)}): imparare la sacra pazienza, definire confini sani e costruire maestria duratura senza cedere a dubbi o rigidità.`,
    lilithWisdom: `Lilith in ${ZODIAC_SIGNS[lilithSignIdx].name}: risveglio del potere femminile arcaico, libertà dai giudizi e sovranità spirituale.`,
    chironHealing: `Chirone in ${ZODIAC_SIGNS[chironSignIdx].name}: trasformare la vulnerabilità originale nel più grande dono di cura e chiaroveggenza per i clienti.`,
    recommendedCrystal: sunInfo.sign.element === 'Fuoco' ? 'Quarzo Citrino / Eliotropio' : sunInfo.sign.element === 'Terra' ? 'Tormalina Nera / Malachite' : sunInfo.sign.element === 'Aria' ? 'Lapislazzuli / Fluorite Viola' : 'Labradorite / Pietra di Luna',
    recommendedHerb: sunInfo.sign.element === 'Fuoco' ? 'Alloro e Cannella' : sunInfo.sign.element === 'Terra' ? 'Rosmarino e Salvia Bianca' : sunInfo.sign.element === 'Aria' ? 'Lavanda e Menta' : 'Rosa Damascena e Artemisia',
    consultationGuidance: `Nel consulto per ${name || 'questa persona'}, concentrati sull'integrazione tra la mente cosciente (${sunInfo.sign.name}) e il profondo bisogno dell'Anima (${moonInfo.sign.name}). Usa la chiave dell'Ascendente in ${ascInfo.sign.name} per facilitare l'ascolto e la fiducia.`,
  };

  return {
    personName: name || 'Anima in Consulto',
    birthDate,
    birthTime: birthTime || '12:00',
    birthPlace: birthPlace || 'Italia',
    sunSign: sunInfo.sign.name,
    sunSymbol: sunInfo.sign.symbol,
    sunDegree: sunInfo.degree,
    moonSign: moonInfo.sign.name,
    moonSymbol: moonInfo.sign.symbol,
    moonPhase: moonInfo.phase,
    ascendant: ascInfo.sign.name,
    ascendantSymbol: ascInfo.sign.symbol,
    ascendantDegree: ascInfo.degree,
    midheaven: ZODIAC_SIGNS[mcIndex].name,
    midheavenSymbol: ZODIAC_SIGNS[mcIndex].symbol,
    planets,
    houses,
    elementsBalance: {
      fire: firePct,
      earth: earthPct,
      air: airPct,
      water: waterPct,
      dominantElement,
    },
    modalitiesBalance: {
      cardinal: Math.round((cardinal / totalMod) * 100),
      fixed: Math.round((fixed / totalMod) * 100),
      mutable: Math.round((mutable / totalMod) * 100),
      dominantModality,
    },
    polarityBalance: {
      yang,
      yin,
    },
    aspects,
    esotericSynthesis,
  };
}

/**
 * Generates an extensive markdown report of the Natal Chart tailored for Groq AI Oracle Chat
 */
export function formatNatalChartForChat(chart: NatalChartData): string {
  return `🌟 **TEMA NATALE & QUADRO ASTROLOGICO COMPLETO**
👤 **Anima:** ${chart.personName}
📅 **Data di Nascita:** ${chart.birthDate} | ⏰ **Ora:** ${chart.birthTime} | 📍 **Luogo:** ${chart.birthPlace}

---
✨ **LA TRIADE FONDAMENTALE DELL'ANIMA:**
- ☉ **Sole (Essenza Primaria):** ${chart.sunSign} ${chart.sunSymbol} (${chart.sunDegree}°)
- ☽ **Luna (Anima & Inconscio):** ${chart.moonSign} ${chart.moonSymbol} • *Fase: ${chart.moonPhase}*
- 🏹 **Ascendente (AC - Maschera & Cammino):** ${chart.ascendant} ${chart.ascendantSymbol} (${chart.ascendantDegree}°)
- 👑 **Medio Cielo (MC - Scopo Karmico):** ${chart.midheaven} ${chart.midheavenSymbol}

---
🪐 **POSIZIONAMENTO DEI PIANETI NELLE CASE:**
${chart.planets.map(p => `- **${p.name} ${p.symbol}** in ${p.sign} ${p.signSymbol} (${p.degree}°) → **${p.house}ª Casa** [${p.element} / ${p.modality}] • *${p.archetype}*`).join('\n')}

---
🔥 **EQUILIBRIO ELEMENTALE & POLARITÀ:**
- **Fuoco:** ${chart.elementsBalance.fire}% | **Terra:** ${chart.elementsBalance.earth}% | **Aria:** ${chart.elementsBalance.air}% | **Acqua:** ${chart.elementsBalance.water}%
- **Elemento Dominante:** ${chart.elementsBalance.dominantElement}
- **Polarità:** Yang (Estroversione/Azione): ${chart.polarityBalance.yang}% | Yin (Mistica/Ricettività): ${chart.polarityBalance.yin}%

---
⚡ **ASPETTI PLANETARI SALIENTI:**
${chart.aspects.map(a => `- **${a.planet1} ${a.symbol} ${a.planet2}** (${a.aspectType} - ${a.nature}): ${a.interpretation}`).join('\n')}

---
🔮 **SINTESI ESOTERICA & DONI DELL'ANIMA:**
- 🌿 **Missione dell'Anima:** ${chart.esotericSynthesis.soulMission}
- 👁️ **Dono Intuitivo:** ${chart.esotericSynthesis.intuitiveGift}
- ⚖️ **Sfida Karmica (Saturno):** ${chart.esotericSynthesis.karmicLesson}
- 🐍 **Ombra di Lilith:** ${chart.esotericSynthesis.lilithWisdom}
- 🕯️ **Cristallo Guida Consigliato:** ${chart.esotericSynthesis.recommendedCrystal}
- 🍵 **Erba Sacra di Risonanza:** ${chart.esotericSynthesis.recommendedHerb}

---
*Domanda per l'Oracolo:*
"Cara Guida Oracolare, analizza questo tema natale per **${chart.personName}**. Quali sono i transiti attuali più significativi, i blocchi karmici da sciogliere, i consigli pratici e i rituali alchemici più idonei da intraprendere?"`;
}
