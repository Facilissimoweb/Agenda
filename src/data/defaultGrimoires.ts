import { SacredBook } from '../types';

export const DEFAULT_SACRED_BOOKS: SacredBook[] = [
  {
    id: 'book-tarot-manual',
    title: 'Manuale dei 78 Tarocchi & Simbologia Archetipica',
    author: 'Archivio Tradizione Ermetica & Esoterica',
    category: 'tarocchi',
    coverEmoji: '🃏',
    description: 'Guida completa all\'interpretazione degli Arcani Maggiori e Minori, stese alchemiche, chiavi evolutive e corrispondenze cabalistiche.',
    isEnabled: true,
    isCustom: false,
    tags: ['tarocchi', 'arcani maggiori', 'arcani minori', 'stese', 'simbologia', 'divinazione'],
    lastUpdated: '2026-08-15',
    sections: [
      {
        id: 'sec-tarot-1',
        title: 'Il Viaggio del Matto: Gli Arcani Maggiori da 0 a XXI',
        chapterNumber: 'Capitolo 1',
        content: `GLI ARCANI MAGGIORI E IL LORO PERCORSO INIZIATICO:
- 0 Il Matto (Urano/Aria): L'impulso originale, il salto di fede, la libertà assoluta dai condizionamenti, l'inizio del viaggio dello spirito.
- I Il Bagatto/Mago (Mercurio): Volontà cosciente, allineamento dei 4 elementi (bastone, coppa, spada, denaro), capacità di manifestare nella materia ("Come in alto, così in basso").
- II La Papessa/Alta Sacerdotessa (Luna): Conoscenza intuitiva, il velo dei misteri, silenzio sacro, gestazione interiore, saggezza dell'inconscio.
- III L'Imperatrice (Venere): Fertilità, creatività feconda, bellezza, nutrimento amoroso, abbondanza della Madre Terra.
- IV L'Imperatore (Ariete): Struttura, autorità benefica, ordine, radici stabili, protezione e discernimento razionale.
- V Il Papa/Ierofante (Toro): Insegnamento spirituale, tradizione sacra, pontifex tra visibile e invisibile, etica d'anima.
- VI Gli Amanti (Gemelli): Scelta del cuore, unione sacra degli opposti (coniunctio alchemica), allineamento dei valori.
- VII Il Carro (Cancro): Trionfo della volontà orientata, padronanza delle emozioni, avanzamento deciso verso la propria meta.
- VIII La Giustizia (Bilancia): Verità cosmica, legge del karma, causa ed effetto, equilibrio lucido e onestà radicale.
- IX L'Eremita (Vergine): Ritiro contemplativo, la lanterna della saggezza interiore, pazienza, ricerca della verità essenziale.
- X La Ruota della Fortuna (Giove): Cicli del destino, transitorietà delle fasi terrene, tempismo cosmico, opportunità evolutive.
- XI La Forza (Leone): Dominio amorevole dell'istinto, coraggio compassionevole, integrazione della parte selvaggia con grazia.
- XII L'Appeso (Nettuno/Acqua): Cambio radicale di prospettiva, resa sacra (non passività), sospensione necessaria, illuminazione.
- XIII La Morte/Senza Nome (Scorpione): Trasmutazione profonda, rilascio del vecchio, potatura alchemica per rinascere a nuova vita.
- XIV La Temperanza (Sagittario): Guarigione, alchimia interiore, flusso armonico, mescolanza delle acque superiori e inferiori.
- XV Il Diavolo (Capricorno): Attaccamenti materiali, ombre inconsce, illusioni della paura, catene autoimposte da riconoscere e spezzare.
- XVI La Torre (Marte): Crollo delle strutture false, fulmine di liberazione, risveglio repentino, distruzione del castello dell'ego.
- XVII La Stella (Acquario): Speranza, fede pura, guarigione cosmica, canali aperti con il divino, ispirazione poetica.
- XVIII La Luna (Pesci): Regno dell'ombra, sogni profetici, allucinazioni vs intuizione, acque ancestrali, magia notturna.
- XIX Il Sole (Sole): Chiarezza solare, gioia autentica, successo, calore vitale, fratellanza e celebrazione della vita.
- XX Il Giudizio (Plutone/Fuoco): Chiamata dell'anima, risveglio spirituale, resurrezione, perdono del passato e redenzione.
- XXI Il Mondo (Saturno/Terra): Compimento del ciclo, totalità, danza cosmica, armonia integrata dei 4 elementi.`,
      },
      {
        id: 'sec-tarot-2',
        title: 'I Quattro Semi dei Minori & i 4 Elementi Alchemici',
        chapterNumber: 'Capitolo 2',
        content: `I SEMI DEGLI ARCANI MINORI:
1. BASTONI (Elemento Fuoco 🔥):
   - Rappresentano la passione, la creatività, l'energia vitale (Prana), la scintilla divina, la carriera e l'azione trasformativa.
   - Asso: Nuova ispirazione fiammeggiante; Due: Visione e pianificazione; Tre: Espansione; Quattro: Celebrazione domestica; Cinque: Sfida o competizione; Sei: Vittoria pubblica; Sette: Difesa della propria verità; Otto: Rapidità e messaggi in arrivo; Nove: Resilienza finale; Dieci: Sovraccarico di responsabilità da delegare.
2. COPPE (Elemento Acqua 🌊):
   - Rappresentano i sentimenti, le relazioni, l'amore, l'intuito, la psiche, la guarigione e la vulnerabilità del cuore.
   - Asso: Amore traboccante; Due: Unione sacra d'anime; Tre: Sorellanza e festa; Quattro: Apatia o disillusione; Cinque: Lutto e rimpianto (ma rimangono 2 coppe in piedi); Sei: Memorie d'infanzia e dolcezza; Sette: Illusioni e fantasie; Otto: Lasciare andare ciò che non nutre più; Nove: Desiderio del cuore appagato; Dieci: Beatitudine familiare e armonia duratura.
3. SPADE (Elemento Aria 💨):
   - Rappresentano la mente, il pensiero, la verità, le sfide intellettuali, i conflitti e la chiarezza di spada.
   - Asso: Chiarezza mentale tagliente; Due: Scelta bloccata o cecità autoindotta; Tre: Ferita al cuore e disillusione necessaria; Quattro: Riposo mentale e meditazione; Cinque: Vittoria amara o ego; Sei: Transizione verso acque più calme; Sette: Astuzia o fuga dalle responsabilità; Otto: Prigione mentale illusoria; Nove: Ansia notturna e rimuginii; Dieci: Fine definitiva di un calvario (alba all'orizzonte).
4. DENARI/PENTACOLI (Elemento Terra 🌿):
   - Rappresentano la materia, il corpo, la salute, il denaro, la casa, la natura e il radicamento concreto.
   - Asso: Seme di prosperità tangibile; Due: Flessibilità e bilanciamento delle risorse; Tre: Maestria artigianale e lavoro d'equipe; Quattro: Avarizia o bisogno di sicurezza; Cinque: Senso di scarsità momentaneo; Sei: Generosità reciproca e dare/ricevere; Sette: Pazienza e maturazione dei frutti; Otto: Dedizione e affinamento delle abilità; Nove: Indipendenza, grazia e abbondanza personale; Dieci: Eredità spirituale e stabilità generazionale.`,
      },
      {
        id: 'sec-tarot-3',
        title: 'Metodi di Lettura & Stese Sacre di Consulto',
        chapterNumber: 'Capitolo 3',
        content: `STESE DI TAROCCHI PER CONSULTI PROFESSIONALI:
1. Stesa a Tre Carte (Passato / Presente / Evoluzione Futura):
   - Posizione 1: Radice energetica o causa passata.
   - Posizione 2: Stato di coscienza attuale e sfida del momento.
   - Posizione 3: Direzione karmica se l'energia fluisce senza blocchi.
2. Croce Celtica Evolutiva (10 carte):
   - Centro (1 e 2): Il Cuore del quesito e l'Ostacolo/Supporto incrociato.
   - Base (3): Radice inconscia.
   - Passato Recente (4).
   - Corona Superiore (5): Massima aspirazione cosciente.
   - Futuro Immediato (6).
   - Il Consultante (7): Attitudine interiore.
   - Ambiente Esterno (8): Influenze delle persone circostanti.
   - Speranze & Paure (9).
   - Esito Finale / Sintesi Alchemica (10).
3. Stesa della Guida Lunare (3 carte):
   - Carta 1: Cosa rilasciare in questa fase lunare.
   - Carta 2: Quale seme interiore innaffiare.
   - Carta 3: Il messaggio dell'Oracolo per la notte.`,
      },
    ],
  },
  {
    id: 'book-astro-treatise',
    title: 'Trattato di Astrologia Tradizionale, Case Karmiche & Transiti',
    author: 'Scuola di Ermetismo Stellare',
    category: 'astrologia',
    coverEmoji: '🌌',
    description: 'Significato esoterico dei 10 pianeti, 12 case astrologiche, transiti lenti, Nodi Lunari, Lilith e Chirone.',
    isEnabled: true,
    isCustom: false,
    tags: ['astrologia', 'tema natale', 'pianeti', 'case astrologiche', 'transiti', 'karma', 'lilith', 'chirone'],
    lastUpdated: '2026-08-15',
    sections: [
      {
        id: 'sec-astro-1',
        title: 'Le 12 Case Astrologiche & il Loro Significato Esoterico',
        chapterNumber: 'Capitolo 1',
        content: `LE 12 CASE ASTROLOGICHE:
- CASA I (Ascendente): L'Incarnazione, il corpo fisico, la maschera archetipica con cui l'anima si presenta al mondo.
- CASA II (Toro/Venere): I Valori personali, il senso di autostima, i talenti innati e il rapporto con il denaro e il nutrimento.
- CASA III (Gemelli/Mercurio): La Comunicazione, l'apprendimento intuitivo, i fratelli, i viaggi brevi e il linguaggio magico.
- CASA IV (Imum Coeli/Cancro): Le Radici ancestrali, la casa d'infanzia, l'utero materno, la base sicura della psiche.
- CASA V (Leone/Sole): La Scintilla creativa, l'amore appassionato, i figli (reali o artistici), il gioco e la celebrazione dell'Io.
- CASA VI (Vergine/Mercurio): Il Servizio sacro, la cura quotidiana del corpo, la salute olistica, i rituali giornalieri e gli animali guida.
- CASA VII (Discendente/Bilancia): L'Altro specchio dell'Io, le relazioni d'anima, i patti e i contratti karmici.
- CASA VIII (Scorpione/Plutone): Le Acque profonde, le trasmutazioni, l'eredità occulta, la sessualità sacra, la morte e rinascita.
- CASA IX (Sagittario/Giove): La Ricerca della verità superiore, i viaggi iniziatici lontani, la filosofia, l'astrologia e la fede.
- CASA X (Medium Coeli/Capricorno): La Vocazione spirituale, la missione pubblica nel mondo, la maestria e l'eredità d'anima.
- CASA XI (Acquario/Urano): La Comunità di luce, le amicizie elettive, i sogni collettivi e le visioni del futuro.
- CASA XII (Pesci/Nettuno): Il Velo dell'Invisibile, il karma pregresso, la solitudine monastica, i sogni premonitori e la fusione mistica.`,
      },
      {
        id: 'sec-astro-2',
        title: 'I Punti Karmici: Nodi Lunari, Lilith & Chirone',
        chapterNumber: 'Capitolo 2',
        content: `PUNTI KARMICI FONDAMENTALI NEL TEMA NATALE:
1. NODO SUD & NODO NORD (L'Asse del Destino):
   - Nodo Sud: La memoria delle vite precedenti, la zona di comfort innata ma stagnante, i talenti già acquisiti da non esasperare.
   - Nodo Nord: La bussola dell'anima, il territorio inesplorato che l'anima ha scelto di integrare in questa incarnazione per evolvere.
2. LILITH (La Luna Nera):
   - Rappresenta l'archetipo del potere femminile primordiale, selvaggio e indomito.
   - Mostra dove la persona rifiuta il compromesso sociale, dove ha subito ferite da tabù o censura e dove risiede la sua più potente forza magnetica ed erotica trasmutativa.
3. CHIRONE (Il Guaritore Ferito):
   - Indica la ferita esistenziale più profonda e apparentemente insanabile (rifiuto, inadeguatezza, valore).
   - È proprio attraverso l'accettazione e l'alchimia di questa ferita che la persona scopre la sua capacità unica di guarire e guidare gli altri.`,
      },
    ],
  },
  {
    id: 'book-herbal-crystals',
    title: 'Compendio di Erboristeria Sacra, Resine & Cristalloterapia',
    author: 'Tradizione delle Curandere & Speziali Alchemici',
    category: 'erboristeria',
    coverEmoji: '🌿',
    description: 'Proprietà magico-vibrazionali di erbe sacre, incensi, resine purificatrici e pietre per la protezione e il riequilibrio energetico.',
    isEnabled: true,
    isCustom: false,
    tags: ['erbe', 'cristalli', 'purificazione', 'oli essenziali', 'resine', 'chakra', 'incensi'],
    lastUpdated: '2026-08-15',
    sections: [
      {
        id: 'sec-herb-1',
        title: 'Le Grandi Erbe di Purificazione & Protezione',
        chapterNumber: 'Capitolo 1',
        content: `ERBE SACRE FONDAMENTALI:
1. Salvia Bianca / Salvia Officinale (Elemento Aria/Terra - Giove):
   - La regina della fumigazione. Dissolve le energie pesanti, azzera i campi astrali ristagnanti e consacra lo spazio dei consulti.
   - Uso: Fumigazione prima di iniziare una seduta di tarocchi o dopo aver ospitato persone cariche di ansia.
2. Rosmarino (Elemento Fuoco - Sole):
   - Erba della chiarezza, del ricordo d'anima e della protezione solare.
   - Uso: Bagni di scarico (infuso forte versato dal collo in giù), rametti bruciati per allontanare incubi e stanchezza psichica.
3. Artemisia Vulgaris (Elemento Acqua/Aria - Luna):
   - Erba dell'intuito e dei sogni lucidi.
   - Uso: Cuscino dei sogni sotto il guanciale, tisana leggera prima della divinazione notturna.
4. Iperico / Erba di San Giovanni (Elemento Fuoco - Sole):
   - Allontana ogni forma di malinconia o attacco psichico. Porta la luce del solstizio nelle ore buie dell'anima.
5. Alloro (Elemento Fuoco - Sole/Giove):
   - Erba della vittoria, della profezia e dell'abbondanza.
   - Uso: Scrivere un desiderio su una foglia secca di alloro e bruciarla nel braciere consacrato.`,
      },
      {
        id: 'sec-cryst-2',
        title: 'Cristalli Fondamentali per il Lavoro Esoterico',
        chapterNumber: 'Capitolo 2',
        content: `MINERALI GUIDA & FREQUENZE CRISTALLINE:
1. Ametista (Elemento Aria/Spirito - Terzo Occhio & Corona):
   - Trasmutazione dell'energia densa in vibrazione spirituale elevata. Calma la mente logica e apre il canale medianico.
2. Quarzo Ialino / Cristallo di Rocca (Tutti gli Elementi - Master Healer):
   - Amplificatore universale. Programmazione di intenzioni pure, pulizia delle stese di carte e chiarezza aurica.
3. Selenite (Elemento Acqua/Spirito - Luna):
   - Luce lunare solidificata. Si autopulisce e pulisce gli altri cristalli e i mazzi di tarocchi. Non bagnare mai con acqua!
4. Ossidiana Nera / Tormalina Nera (Elemento Terra - Radice):
   - Scudo impenetrabile contro vampirismo energetico e proiezioni negative. Radicamento essenziale dopo i consulti.
5. Labradorite (Elemento Acqua/Aria - Scudo dell'Operatore):
   - La pietra dei maghi e dei terapeuti. Previene la dispersione dell'aura quando si lavora a contatto con persone sofferenti.
6. Quarzo Rosa (Elemento Acqua - Cuore):
   - Amore incondizionato, guarigione delle ferite emotive d'infanzia, autocompassione e dolcezza.`,
      },
    ],
  },
  {
    id: 'book-moon-rituals',
    title: 'Grimorio dei Rituali di Luna & Cerchi Sacri',
    author: 'Sorellanza Lunare & Tradizione Ancestrale',
    category: 'rituali',
    coverEmoji: '🕯️',
    description: 'Istruzioni dettagliate per celebrare le 4 fasi lunari, creare cerchi di protezione, consacrare strumenti e allinearsi alle maree cosmiche.',
    isEnabled: true,
    isCustom: false,
    tags: ['rituali', 'luna nuova', 'luna piena', 'luna calante', 'cerchio sacro', 'consacrazione', 'candele'],
    lastUpdated: '2026-08-15',
    sections: [
      {
        id: 'sec-ritual-1',
        title: 'Le Quattro Fasi Lunari & i Loro Lavori Magici',
        chapterNumber: 'Capitolo 1',
        content: `RITUALI PER LE FASI DELLA LUNA:
1. LUNA NUOVA / NOVELLINO (Il Seme nel Buio Fertile):
   - Focus: Nuove intenzioni, semina spirituale, silenzio interiore, invocazione di nuovi cicli.
   - Strumenti: Candela bianca o nera, taccuino degli intenti, semi di piante, quarzo ialino.
   - Formula: "Nel buio grembo della notte cosmica, pianto con fiducia il seme di [intenzione]. Che cresca secondo l'ordine divino."
2. LUNA CRESCENTE (Il Germoglio & l'Azione):
   - Focus: Espansione, prosperità, attrazione d'amore e salute, coraggio, studio e sviluppo di talenti.
   - Strumenti: Candela verde o dorata, cannella, alloro, pirite o citrino.
3. LUNA PIENA (Il Fiore & la Massima Luminosità):
   - Focus: Celebrazione, culminazione, divinazione di massima precisione, caricamento di pietre e acque di luna.
   - Strumenti: Candela argentata, coppa d'acqua di fonte, selenite, specchio nero o tarocchi.
4. LUNA CALANTE (Il Raccolto & il Rilascio):
   - Focus: Bando, taglio di corde energetiche con relazioni tossiche, purificazione di case, disintossicazione corporea.
   - Strumenti: Candela blu scuro o viola, sale grosso marino, salvia o chiodi di garofano, tormalina nera.`,
      },
      {
        id: 'sec-ritual-2',
        title: 'Apertura e Chiusura del Cerchio Sacro di Consulto',
        chapterNumber: 'Capitolo 2',
        content: `STRUTTURA DEL CERCHIO SACRO:
1. Purificazione dello Spazio: Spazzare simbolicamente l'aria con piume o fumo di incenso d'olibano nei 4 punti cardinali.
2. Tracciamento del Cerchio:
   - "Traccio questo cerchio di pura luce dorata. Nulla di ciò che è disarmonico può varcare questo confine. Qui regnano verità, amore e protezione."
3. Invocazione dei 4 Elementi:
   - Est / Aria: Piuma o incenso (Chiarezza mentale e respiro di vita).
   - Sud / Fuoco: Candela (Volontà, coraggio e trasmutazione).
   - Ovest / Acqua: Coppa d'acqua (Amore, intuito e guarigione emotiva).
   - Nord / Terra: Sale o cristallo (Radicamento, stabilità e abbondanza).
4. Chiusura del Cerchio:
   - Ringraziare gli elementi e le guide di luce: "Il cerchio è aperto ma mai spezzato. La pace sia nel nostro cuore. Così è, così sia."`,
      },
    ],
  },
];
