// Real Astronomical Lunar Calculation & Biodynamic Nutrition Engine
import { MoonPhaseInfo } from '../types';

export interface RealMoonDetails {
  date: Date;
  dateFormatted: string;
  phaseKey: 'new' | 'waxing_crescent' | 'first_quarter' | 'waxing_gibbous' | 'full' | 'waning_gibbous' | 'last_quarter' | 'waning_crescent';
  phaseName: string;
  phaseCategory: 'Crescente' | 'Piena' | 'Calante' | 'Nuova';
  icon: string;
  ageDays: number;
  illumination: number; // 0 - 100%
  phaseAngle: number; // 0 - 360 deg
  
  // Zodiac Transit
  zodiacSign: string;
  zodiacSymbol: string;
  zodiacDegree: number;
  element: 'Fuoco' | 'Terra' | 'Aria' | 'Acqua';
  elementIcon: string;
  
  // Biodynamic Plant Part
  biodynamicPlantPart: 'Frutto & Seme' | 'Radice & Tubero' | 'Fiore' | 'Foglia';
  
  // Anatomical / Organ Governance (Classical Astrological Medicine)
  governedOrgans: string;
  bodyAdvice: string;
  
  // Real Nutrition Impact
  nutritionImpact: {
    metabolicTheme: string;
    focusAction: string;
    recommendedFoods: string[];
    foodsToModerate: string[];
    alchemicalTea: {
      name: string;
      herbs: string;
      properties: string;
      brewTime: string;
    };
    sacredSpice: string;
    alchemicalMealIdea: string;
  };
  
  // Esoteric & Sanctuary Advice
  advice: string;
  recommendedHerb: string;
  suggestedRitual: string;
}

export interface UpcomingLunarEvent {
  phaseName: string;
  phaseKey: string;
  icon: string;
  date: Date;
  dateFormatted: string;
  daysRemaining: number;
  zodiacSign: string;
  spiritualFocus: string;
  nutritionTip: string;
}

const ZODIAC_SIGNS = [
  { name: 'Ariete', symbol: '♈', element: 'Fuoco' as const, elementIcon: '🔥', plantPart: 'Frutto & Seme' as const, organs: 'Testa, Occhi, Cervello, Circolazione cranica', advice: 'Evitare eccesso di caffeina, favorire idratazione e cibi freschi per non surriscaldare la testa.' },
  { name: 'Toro', symbol: '♉', element: 'Terra' as const, elementIcon: '🌿', plantPart: 'Radice & Tubero' as const, organs: 'Gola, Collo, Tiroide, Corde vocali', advice: 'Proteggere la gola con infusi caldi di salvia e miele; assimilazione eccellente di sali minerali.' },
  { name: 'Gemelli', symbol: '♊', element: 'Aria' as const, elementIcon: '💨', plantPart: 'Fiore' as const, organs: 'Spalle, Braccia, Polmoni, Sistema nervoso periferico', advice: 'Favorire cibi leggeri ricchi di grassi buoni (noci, semi di lino) per sostenere il sistema nervoso.' },
  { name: 'Cancro', symbol: '♋', element: 'Acqua' as const, elementIcon: '💧', plantPart: 'Foglia' as const, organs: 'Stomaco, Seno, Fegato, Digestione gastrica', advice: 'Stomaco ipersensibile: privilegiare vellutate calde, brodi lenitivi ed evitare cibi acidi o fritti.' },
  { name: 'Leone', symbol: '♌', element: 'Fuoco' as const, elementIcon: '🔥', plantPart: 'Frutto & Seme' as const, organs: 'Cuore, Circolazione sanguigna, Schiena, Diaframma', advice: 'Sostenere il muscolo cardiaco con magnesio, frutti rossi, melagrana e semi di zucca; pasti non troppo pesanti.' },
  { name: 'Vergine', symbol: '♍', element: 'Terra' as const, elementIcon: '🌿', plantPart: 'Radice & Tubero' as const, organs: 'Intestino tenue, Milza, Digestione ed assimilazione', advice: 'Fase d\'oro per l\'equilibrio del microbiota: fibre prebiotiche, cereali integrali, tisane di finocchio e melissa.' },
  { name: 'Bilancia', symbol: '♎', element: 'Aria' as const, elementIcon: '💨', plantPart: 'Fiore' as const, organs: 'Reni, Ghiandole surrenali, Zona lombare, Equilibrio idrico', advice: 'Depurare i reni bevendo molta acqua oligominerale, tisane di equiseto e betulla; moderare il sale.' },
  { name: 'Scorpione', symbol: '♏', element: 'Acqua' as const, elementIcon: '💧', plantPart: 'Foglia' as const, organs: 'Organi riproduttivi, Sistema escretore, Colon', advice: 'Forte potenziale di rigenerazione cellulare e detossinazione profonda: cibi amari, carciofo, tarassaco.' },
  { name: 'Sagittario', symbol: '♐', element: 'Fuoco' as const, elementIcon: '🔥', plantPart: 'Frutto & Seme' as const, organs: 'Fegato, Cosce, Articolazioni sacro-iliache', advice: 'Sostenere il metabolismo epatico con curcuma e cardo mariano; ottimo per attività fisica all\'aperto.' },
  { name: 'Capricorno', symbol: '♑', element: 'Terra' as const, elementIcon: '🌿', plantPart: 'Radice & Tubero' as const, organs: 'Ossa, Denti, Ginocchia, Articolazioni, Pelle', advice: 'Ottima fissazione del calcio e del silicio: sesamo, tahina, brodo di radici, infuso di equiseto.' },
  { name: 'Acquario', symbol: '♒', element: 'Aria' as const, elementIcon: '💨', plantPart: 'Fiore' as const, organs: 'Polpacci, Caviglie, Vene, Circolazione periferica', advice: 'Stimolare il ritorno venoso e la microcircolazione con mirtilli, vite rossa e verdure a fiore.' },
  { name: 'Pesci', symbol: '♓', element: 'Acqua' as const, elementIcon: '💧', plantPart: 'Foglia' as const, organs: 'Piedi, Sistema linfatico, Sistema immunitario', advice: 'Tendenza al ristagno di liquidi: ideale drenaggio linfatico con tisane di pilosella, asparagi e verdure a foglia verde.' },
];

/**
 * Calculates the exact Moon Phase & Moon Zodiac Longitude for any given date
 */
export function calculateRealMoon(date: Date = new Date()): RealMoonDetails {
  const time = date.getTime();
  
  // Epoch for reference: Jan 6, 2000, 18:14 UTC (Known New Moon)
  const knownNewMoonUTC = Date.UTC(2000, 0, 6, 18, 14, 0);
  const synodicMonth = 29.53058867; // days
  
  // Days since J2000 reference
  const diffDays = (time - knownNewMoonUTC) / (1000 * 60 * 60 * 24);
  const cycleProgress = ((diffDays % synodicMonth) + synodicMonth) % synodicMonth;
  const ageDays = Math.round(cycleProgress * 10) / 10;
  const phaseAngle = (cycleProgress / synodicMonth) * 360;
  
  // Illumination percentage
  const illumination = Math.round(((1 - Math.cos((phaseAngle * Math.PI) / 180)) / 2) * 100);
  
  // Astronomical Moon Ecliptic Longitude (Zodiac Sign calculation)
  // J2000.0 is Jan 1.5, 2000 (12:00 UTC) = JD 2451545.0
  const j2000Epoch = Date.UTC(2000, 0, 1, 12, 0, 0);
  const d = (time - j2000Epoch) / (1000 * 60 * 60 * 24);
  
  // Mean longitude of moon
  const L_prime = (218.316 + 13.176396 * d) % 360;
  // Mean elongation of moon
  const D = ((297.850 + 12.190749 * d) * Math.PI) / 180;
  // Sun's mean anomaly
  const M = ((357.529 + 0.985600 * d) * Math.PI) / 180;
  // Moon's mean anomaly
  const M_prime = ((134.963 + 13.064993 * d) * Math.PI) / 180;
  
  // Ecliptic longitude calculation with principal periodic perturbation terms
  let lambda = L_prime 
    + 6.289 * Math.sin(M_prime)
    - 1.274 * Math.sin(M_prime - 2 * D)
    + 0.658 * Math.sin(2 * D)
    - 0.214 * Math.sin(2 * M_prime)
    - 0.110 * Math.sin(M_prime + 2 * D);
    
  lambda = ((lambda % 360) + 360) % 360;
  
  const signIndex = Math.floor(lambda / 30) % 12;
  const zodiacDegree = Math.floor(lambda % 30);
  const signData = ZODIAC_SIGNS[signIndex] || ZODIAC_SIGNS[0];
  
  // Determine Primary Lunar Phase
  let phaseKey: RealMoonDetails['phaseKey'] = 'waxing_crescent';
  let phaseName = 'Falce Crescente';
  let phaseCategory: RealMoonDetails['phaseCategory'] = 'Crescente';
  let icon = '🌒';
  
  if (ageDays < 1.84 || ageDays >= 27.69) {
    phaseKey = 'new';
    phaseName = 'Luna Nuova (Novilunio)';
    phaseCategory = 'Nuova';
    icon = '🌑';
  } else if (ageDays < 5.53) {
    phaseKey = 'waxing_crescent';
    phaseName = 'Falce Crescente (Crescente Iniziale)';
    phaseCategory = 'Crescente';
    icon = '🌒';
  } else if (ageDays < 9.22) {
    phaseKey = 'first_quarter';
    phaseName = 'Primo Quarto (Mezzaluna Crescente)';
    phaseCategory = 'Crescente';
    icon = '🌓';
  } else if (ageDays < 12.91) {
    phaseKey = 'waxing_gibbous';
    phaseName = 'Luna Gibbosa Crescente';
    phaseCategory = 'Crescente';
    icon = '🌔';
  } else if (ageDays < 16.61) {
    phaseKey = 'full';
    phaseName = 'Luna Piena (Plenilunio)';
    phaseCategory = 'Piena';
    icon = '🌕';
  } else if (ageDays < 20.30) {
    phaseKey = 'waning_gibbous';
    phaseName = 'Luna Gibbosa Calante (Disseminante)';
    phaseCategory = 'Calante';
    icon = '🌖';
  } else if (ageDays < 23.99) {
    phaseKey = 'last_quarter';
    phaseName = 'Ultimo Quarto (Mezzaluna Calante)';
    phaseCategory = 'Calante';
    icon = '🌗';
  } else {
    phaseKey = 'waning_crescent';
    phaseName = 'Luna Calante (Balsamica)';
    phaseCategory = 'Calante';
    icon = '🌘';
  }
  
  // Generate Nutrition & Esoteric Content based on Real Phase & Zodiac Element
  const nutritionImpact = generateLunarNutritionDetails(phaseCategory, phaseKey, signData.element, signData.name);
  
  const dateFormatted = date.toLocaleDateString('it-IT', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  
  // Esoteric advice & ritual
  let advice = '';
  let recommendedHerb = '';
  let suggestedRitual = '';
  
  if (phaseCategory === 'Nuova') {
    advice = `Tempo di silenzio, semina delle intenzioni e profonda rigenerazione. Con la Luna in ${signData.name}, l'intuito canalizza nuovi progetti per il santuario.`;
    recommendedHerb = 'Salvia Bianca, Alloro & Radice di Angelica';
    suggestedRitual = 'Scrittura delle intenzioni sacre su carta pergamena alla luce di una candela d\'argento.';
  } else if (phaseCategory === 'Crescente') {
    advice = `Fase di crescita, assorbimento e manifestazione. L'energia del corpo e dello spirito è in ascesa. Ottimo momento per consulti, canalizzazioni e avvio di rituali.`;
    recommendedHerb = 'Rosmarino, Zafferano & Foglie di Menta Selvatica';
    suggestedRitual = 'Caricamento dei cristalli e dei mazzi di tarocchi con fumo di incenso d\'Olibano.';
  } else if (phaseCategory === 'Piena') {
    advice = `Culmine della luce e massimo magnetismo psichico. Le emozioni e le intuizioni sono al loro apice. Consacra i tuoi strumenti e celebra la gratitudine cosmica.`;
    recommendedHerb = 'Fiori di Iperico, Rosa Damascena & Artemisia';
    suggestedRitual = 'Preparazione dell\'Acqua di Luna Piena in bottiglia di vetro blu e bagno purificante ai sali sacri.';
  } else {
    advice = `Fase di rilascio, detossinazione e pulizia dei confini energetici. Lascia andare ciò che è compiuto per fare spazio alla nuova luce.`;
    recommendedHerb = 'Lavanda Officinale, Timo, Carciofo & Betulla';
    suggestedRitual = 'Fumigazione con resina di Mirra e purificazione dell\'altare e degli ambienti di lavoro.';
  }
  
  return {
    date,
    dateFormatted,
    phaseKey,
    phaseName,
    phaseCategory,
    icon,
    ageDays,
    illumination,
    phaseAngle: Math.round(phaseAngle),
    zodiacSign: `${signData.name} ${signData.symbol}`,
    zodiacSymbol: signData.symbol,
    zodiacDegree,
    element: signData.element,
    elementIcon: signData.elementIcon,
    biodynamicPlantPart: signData.plantPart,
    governedOrgans: signData.organs,
    bodyAdvice: signData.advice,
    nutritionImpact,
    advice,
    recommendedHerb,
    suggestedRitual,
  };
}

/**
 * Detailed Biodynamic & Alchemical Nutrition Impact by Real Moon Phase & Element
 */
function generateLunarNutritionDetails(
  category: 'Crescente' | 'Piena' | 'Calante' | 'Nuova',
  phaseKey: string,
  element: 'Fuoco' | 'Terra' | 'Aria' | 'Acqua',
  signName: string
) {
  let metabolicTheme = '';
  let focusAction = '';
  let recommendedFoods: string[] = [];
  let foodsToModerate: string[] = [];
  let alchemicalTea = {
    name: '',
    herbs: '',
    properties: '',
    brewTime: '',
  };
  let sacredSpice = '';
  let alchemicalMealIdea = '';
  
  if (category === 'Crescente') {
    metabolicTheme = 'Assimilazione, Rafforzamento & Fissazione dei Micronutrienti';
    focusAction = 'Il corpo assorbe e trattiene con massima efficacia vitamine, minerali e oligoelementi. Ottimale per nutrire tessuti, sangue ed energia vitale (Ojas).';
    recommendedFoods = [
      'Cereali integrali antichi (Farro, Avena, Grano Saraceno)',
      'Semi oleosi attivati (Mandorle, Noci, Semi di Sesamo e Girasole)',
      'Frutti ricchi di antiossidanti e ferro (Melagrana, Mirtilli, Datteri)',
      'Verdure di stagione cotte al vapore con olio extravergine a crudo',
      'Proteine nobili e legumi leggeri cotti con alloro',
    ];
    foodsToModerate = [
      'Zuccheri raffinati e dolci industriali (si accumulano con maggiore facilità)',
      'Eccesso di sale e sodio (tendenza alla ritenzione idrica fisiologica)',
      'Cibi conservati o iper-processati',
    ];
    alchemicalTea = {
      name: 'Elisir Remineralizzante della Luna Crescente',
      herbs: 'Ortica dioica, Equiseto, Foglie di Lampone e Scorza d\'Arancia dolce',
      properties: 'Nutre il sangue, rinforza capelli e unghie, fissa i minerali e sostiene la vitalità.',
      brewTime: '7-10 minuti coperto, con un cucchiaino di miele millefiori biologico.',
    };
    sacredSpice = 'Zafferano purissimo & Cannella di Ceylon';
    alchemicalMealIdea = `Risotto mantecato allo Zafferano dorato con semi di zucca tostati e verdure di stagione al vapore (Giorno governato da ${signName}).`;
  } else if (category === 'Piena') {
    metabolicTheme = 'Massima Espansione Energetica & Sensibilità Gastrica';
    focusAction = 'Picco del metabolismo idrico e della reattività nervosa. Si consigliano pasti leggeri, idratanti e non infiammatori per mantenere il corpo fluido e la mente serena.';
    recommendedFoods = [
      'Vellutate e creme di verdure delicate (Zucca, Zucchine, Porri dolci)',
      'Cereali leggeri e rinfrescanti (Riso Basmati integrale, Quinoa)',
      'Frutti ad alto contenuto d\'acqua (Cocomero, Melone, Pesche, Frutti di bosco)',
      'Brodi vegetali remineralizzanti alle erbe aromatiche',
      'Semi di lino macerati in acqua per la mucosa gastrica',
    ];
    foodsToModerate = [
      'Cibi fritti, unti o ricchi di grassi saturi',
      'Alcolici e bevande eccitanti o gasate',
      'Pasti pesanti o cene consumate a tarda notte',
    ];
    alchemicalTea = {
      name: 'Infuso della Notte di Luna Piena',
      herbs: 'Fiori di Melissa, Passiflora, Camomilla Romana e Petali di Rosa Damascena',
      properties: 'Calma il sistema nervoso, distende lo stomaco e prepara ad un sonno mistico e ristoratore.',
      brewTime: '8 minuti in infusione lenta a 85°C.',
    };
    sacredSpice = 'Cardamomo verde in bacche & Finocchietto selvatico';
    alchemicalMealIdea = `Crema vellutata di Zucca dorata con semi di canapa decorticati e crostini di segale tostati all'olio di lino.`;
  } else if (category === 'Calante') {
    metabolicTheme = 'Eliminazione delle Tossine, Drenaggio Linfatico & Reset Epatico';
    focusAction = 'Il corpo rilascia spontaneamente scorie, drena i liquidi in eccesso e consuma più energia. È il periodo d\'oro per cure depurative, tisane amare e pulizia profonda.';
    recommendedFoods = [
      'Verdure amare e depurative (Carciofi, Tarassaco, Cicoria selvatica, Rucola)',
      'Crucifere alleate del fegato (Broccoli, Cavolo nero, Cavoletti)',
      'Ortaggi drenanti (Finocchi crudi, Sedano, Cetrioli, Asparagi)',
      'Acqua di sorgente con gocce di succo di limone fresco al mattino',
      'Zuppe di legumi rustici con alloro, rosmarino e zenzero',
    ];
    foodsToModerate = [
      'Latticini stagionati e formaggi grassi',
      'Insaccati e cibi carichi di conservanti',
      'Farine bianche raffinate e lieviti chimici',
    ];
    alchemicalTea = {
      name: 'Tisana Alchemica Drenante & Epatica',
      herbs: 'Foglie di Tarassaco, Betulla, Cardo Mariano, Menta piperita e Zenzero fresco',
      properties: 'Stimola il drenaggio biliare e renale, sgonfia i tessuti e dona leggerezza fisica e mentale.',
      brewTime: '10 minuti di infusione, da bere tiepida prima dei pasti principali.',
    };
    sacredSpice = 'Curcuma dorata con un pizzico di Pepe nero & Zenzero fresco';
    alchemicalMealIdea = `Zuppa rustica di Lenticchie nere con bietole stufate al limone, alloro e olio extravergine al rosmarino.`;
  } else {
    // Luna Nuova
    metabolicTheme = 'Reset Alchemico, Monodiete & Digiuno Intermittente Dolce';
    focusAction = 'Momento di massimo riposo fisiologico degli organi digestivi. Perfetto per una giornata a regime semi-liquido, succhi verdi o brodi di radici per azzerare le tossine.';
    recommendedFoods = [
      'Brodo limpido di radici sacre (Zenzero, Sedano rapa, Carote, Cipolla dorata, Alloro)',
      'Estratti freschi di mele verdi, sedano, cetriolo e zenzero',
      'Monodiete a base di frutta di stagione biologica',
      'Riso integrale bollito con gomasio e olio di sesamo spremuto a freddo',
      'Infusi caldi purificanti con miele grezzo in purezza',
    ];
    foodsToModerate = [
      'Tutti i cibi pesanti, carne rossa, formaggi e cibi industriali',
      'Caffè e zuccheri',
      'Abbuffate o porzioni abbondanti',
    ];
    alchemicalTea = {
      name: 'Balsamo del Novilunio & Rinascita',
      herbs: 'Salvia Officinale, Foglie di Alloro, Melissa e Fiori di Sambuco',
      properties: 'Svuota i canali energetici, protegge la mucosa dello stomaco e favorisce la centratura interiore.',
      brewTime: '6-8 minuti, sorseggiata lentamente nel silenzio serale.',
    };
    sacredSpice = 'Chiodi di Garofano & Noce Moscata';
    alchemicalMealIdea = `Brodo alchemico di Radici sacre con porri stufati, miso bianco delicato e zenzero fresco gratugiato.`;
  }
  
  // Element-based adjustments
  if (element === 'Fuoco') {
    alchemicalMealIdea += ' • *Focus Elemento Fuoco:* Spezie calde e nutrienti che accendono il fuoco digestivo (Agni).';
  } else if (element === 'Terra') {
    alchemicalMealIdea += ' • *Focus Elemento Terra:* Radici e tuberi per donare radicamento profondo e assimilazione minerale.';
  } else if (element === 'Aria') {
    alchemicalMealIdea += ' • *Focus Elemento Aria:* Fiori, semi e grassi nobili per nutrire il sistema nervoso e la lucidità mentale.';
  } else if (element === 'Acqua') {
    alchemicalMealIdea += ' • *Focus Elemento Acqua:* Foglie verdi e ortaggi idratanti per il flusso linfatico e la pulizia cellulare.';
  }
  
  return {
    metabolicTheme,
    focusAction,
    recommendedFoods,
    foodsToModerate,
    alchemicalTea,
    sacredSpice,
    alchemicalMealIdea,
  };
}

/**
 * Calculates upcoming primary moon phases for calendar forecast
 */
export function getUpcomingMoonPhases(startDate: Date = new Date(), count: number = 4): UpcomingLunarEvent[] {
  const events: UpcomingLunarEvent[] = [];
  const synodicMonth = 29.53058867;
  const current = calculateRealMoon(startDate);
  
  // Targets: New (0), First Quarter (7.38), Full (14.765), Last Quarter (22.15)
  const targets = [
    { targetAge: 0, phaseName: 'Luna Nuova (Novilunio)', phaseKey: 'new', icon: '🌑', focus: 'Semina, Intenzioni & Silenzio Sacro', nutrition: 'Semi-digiuno depurativo, brodi di radici e tisana di salvia.' },
    { targetAge: 7.38, phaseName: 'Primo Quarto (Mezzaluna)', phaseKey: 'first_quarter', icon: '🌓', focus: 'Azione, Superamento ostacoli & Costruzione', nutrition: 'Cereali integrali, semi oleosi e cibi ricchi di magnesio e ferro.' },
    { targetAge: 14.765, phaseName: 'Luna Piena (Plenilunio)', phaseKey: 'full', icon: '🌕', focus: 'Massima Espansione, Chiaroveggenza & Gratitudine', nutrition: 'Pasti leggeri e idratanti, creme di verdure e tisane calmanti alla melissa.' },
    { targetAge: 22.15, phaseName: 'Ultimo Quarto (Mezzaluna)', phaseKey: 'last_quarter', icon: '🌗', focus: 'Rilascio, Purificazione profonda & Discernimento', nutrition: 'Cibi amari (carciofo, cicoria, tarassaco) e tisane depurative epatiche.' },
  ];
  
  // Find the next occurrence of each target
  const upcomingList = targets.map((t) => {
    let daysUntil = t.targetAge - current.ageDays;
    if (daysUntil <= 0.3) {
      daysUntil += synodicMonth;
    }
    const eventDate = new Date(startDate.getTime() + daysUntil * 24 * 60 * 60 * 1000);
    const moonAtEvent = calculateRealMoon(eventDate);
    
    return {
      phaseName: t.phaseName,
      phaseKey: t.phaseKey,
      icon: t.icon,
      date: eventDate,
      dateFormatted: eventDate.toLocaleDateString('it-IT', { day: 'numeric', month: 'short' }),
      daysRemaining: Math.round(daysUntil),
      zodiacSign: moonAtEvent.zodiacSign,
      spiritualFocus: t.focus,
      nutritionTip: t.nutrition,
    };
  });
  
  // Sort by earliest date
  upcomingList.sort((a, b) => a.daysRemaining - b.daysRemaining);
  
  return upcomingList.slice(0, count);
}

/**
 * Adapter to return MoonPhaseInfo for backward compatibility with components
 */
export function getCurrentRealMoonInfo(): MoonPhaseInfo {
  const real = calculateRealMoon(new Date());
  return {
    phaseName: real.phaseName,
    icon: real.icon,
    sign: `in ${real.zodiacSign} (${real.illumination}% di Luce)`,
    illumination: real.illumination,
    advice: real.advice,
    element: `${real.element} ${real.elementIcon} (${real.biodynamicPlantPart})`,
    recommendedHerb: real.recommendedHerb,
    suggestedAction: real.suggestedRitual,
  };
}
