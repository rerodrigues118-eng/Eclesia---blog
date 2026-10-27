import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Heart, 
  Star, 
  Sun,
  Smile,
  CheckCircle2,
  Calendar,
  Volume1,
  Baby
} from 'lucide-react';

/* ============================================================================
   TIPAGEM E ESTRUTURA DE DADOS DO TERÇO KIDS
   ============================================================================ */

export type AvatarState = 'sorrindo' | 'falando' | 'ensinando';
export type MysteryGroupKids = 'gozosos' | 'dolorosos' | 'gloriosos' | 'luminosos';

export interface PrayerStep {
  id: string;
  title: string;
  subtitle: string;
  category: 'intro' | 'credo' | 'pai-nosso' | 'ave-maria' | 'gloria' | 'misterio' | 'final';
  mysteryNumber?: number; // 1 a 5
  decadeIndex?: number;   // 0 a 4
  beadIndex?: number;     // 1 a 10 para Ave-Marias
  audioSrc: string;
  state: AvatarState;
  text: string;
  fruit?: string;
  beadId?: string; // id correspondente no SVG
}

export interface MysteryInfo {
  number: number;
  title: string;
  kidsExplanation: string;
  audioSrc: string;
  fruit: string;
}

export interface MysteryGroupData {
  id: MysteryGroupKids;
  name: string;
  themeColor: string;
  badgeEmoji: string;
  daysDescription: string;
  days: number[]; // 0=Dom, 1=Seg, 2=Ter, 3=Qua, 4=Qui, 5=Sex, 6=Sab
  introAudio: string;
  mysteries: MysteryInfo[];
}

/* ============================================================================
   MISTÉRIOS DO TERÇO ADAPTADOS PARA CRIANÇAS
   ============================================================================ */

export const KIDS_MYSTERY_GROUPS: MysteryGroupData[] = [
  {
    id: 'gozosos',
    name: 'Mistérios Gozosos',
    badgeEmoji: '🌟',
    themeColor: '#4A90E2',
    daysDescription: 'Segunda-feira e Sábado',
    days: [1, 6],
    introAudio: '/terco-kids/intro-gozosos.mp3',
    mysteries: [
      {
        number: 1,
        title: 'A Anunciação do Anjo Gabriel a Maria',
        kidsExplanation: 'O lindo anjo Gabriel desce do céu e diz a Maria que ela será a Mãezinha de Jesus! Maria responde com muito amor: "Faça-se em mim a vontade de Deus!"',
        audioSrc: '/terco-kids/gozoso-1.mp3',
        fruit: 'Humildade e obedecer com alegria'
      },
      {
        number: 2,
        title: 'A Visita de Nossa Senhora a Santa Isabel',
        kidsExplanation: 'Maria viaja pelas montanhas para ajudar sua prima Isabel que estava esperando o bebê João Batista. Quando Maria chega, todos se enchem do Espírito Santo!',
        audioSrc: '/terco-kids/gozoso-2.mp3',
        fruit: 'Ajudar os outros com carinho'
      },
      {
        number: 3,
        title: 'O Nascimento de Jesus em Belém',
        kidsExplanation: 'Jesus nasce em uma manjedoura simples, cheia de palhinha, entre os animaizinhos. Os anjos cantam "Glória a Deus nas alturas" e os pastores vão adorar o Menino Deus!',
        audioSrc: '/terco-kids/gozoso-3.mp3',
        fruit: 'Coração simples e agradecido'
      },
      {
        number: 4,
        title: 'A Apresentação de Jesus no Templo',
        kidsExplanation: 'Maria e José levam o bebê Jesus ao Templo para consagrá-lo a Deus Pai. O vovô Simeão fica radiante de alegria e abraça o Salvador nos braços!',
        audioSrc: '/terco-kids/gozoso-4.mp3',
        fruit: 'Amor à oração e à Casa de Deus'
      },
      {
        number: 5,
        title: 'O Menino Jesus Encontrado no Templo',
        kidsExplanation: 'Aos 12 anos, Jesus foi a Jerusalém e ficou no Templo ensinando os sábios. Quando Maria e José o encontram, Ele diz: "Devo cuidar das coisas do meu Pai!"',
        audioSrc: '/terco-kids/gozoso-5.mp3',
        fruit: 'Gostar de aprender sobre Deus'
      }
    ]
  },
  {
    id: 'dolorosos',
    name: 'Mistérios Dolorosos',
    badgeEmoji: '❤️‍🔥',
    themeColor: '#D9534F',
    daysDescription: 'Terça-feira e Sexta-feira',
    days: [2, 5],
    introAudio: '/terco-kids/intro-dolorosos.mp3',
    mysteries: [
      {
        number: 1,
        title: 'A Oração de Jesus no Horto das Oliveiras',
        kidsExplanation: 'Jesus reza no jardim das oliveiras. Ele pede força ao Pai e nos ensina que, mesmo nos momentos difíceis, a oração acalma o coração.',
        audioSrc: '/terco-kids/doloroso-1.mp3',
        fruit: 'Pedir força a Deus nos momentos difíceis'
      },
      {
        number: 2,
        title: 'A Flagelação de Nosso Senhor Jesus Cristo',
        kidsExplanation: 'Jesus sofre por nós sem reclamar, porque o amor dEle por cada um de nós é infinito. Ele nos abraça mesmo quando sofremos.',
        audioSrc: '/terco-kids/doloroso-2.mp3',
        fruit: 'Paciência e saber perdoar'
      },
      {
        number: 3,
        title: 'A Coroação de Espinhos',
        kidsExplanation: 'Os soldados colocam uma coroa de espinhos em Jesus. Mesmo assim, Jesus os perdoa e é o nosso verdadeiro e eterno Rei do Amor.',
        audioSrc: '/terco-kids/doloroso-3.mp3',
        fruit: 'Mansidão e respeito a todos'
      },
      {
        number: 4,
        title: 'Jesus Carrega a Sua Cruz',
        kidsExplanation: 'Jesus carrega a pesada cruz com paciência. No caminho, Ele encontra Sua Mãezinha Maria, que caminha ao lado dEle com carinho sem igual.',
        audioSrc: '/terco-kids/doloroso-4.mp3',
        fruit: 'Coragem para fazer as coisas certas'
      },
      {
        number: 5,
        title: 'A Crucificação e Morte de Jesus',
        kidsExplanation: 'Do alto da Cruz, Jesus nos dá Maria como nossa própria Mãe do céu dizendo: "Eis aí a tua mãe!". Ele entrega Sua vida por amor a nós.',
        audioSrc: '/terco-kids/doloroso-5.mp3',
        fruit: 'Amor a Nossa Senhora e a Jesus'
      }
    ]
  },
  {
    id: 'gloriosos',
    name: 'Mistérios Gloriosos',
    badgeEmoji: '👑',
    themeColor: '#D4AF37',
    daysDescription: 'Quarta-feira e Domingo',
    days: [0, 3],
    introAudio: '/terco-kids/intro-gloriosos.mp3',
    mysteries: [
      {
        number: 1,
        title: 'A Ressurreição de Jesus',
        kidsExplanation: 'No domingo de manhã, o túmulo está vazio! Jesus venceu a morte e ressuscitou brilhando de luz! Ele está vivo para sempre no meio de nós!',
        audioSrc: '/terco-kids/glorioso-1.mp3',
        fruit: 'Alegria de viver na graça de Deus'
      },
      {
        number: 2,
        title: 'A Ascensão de Jesus ao Céu',
        kidsExplanation: 'Jesus abençoa Seus amigos apóstolos e sobe glorioso ao céu, prometendo: "Estarei com vocês todos os dias até o fim do mundo!"',
        audioSrc: '/terco-kids/glorioso-2.mp3',
        fruit: 'Esperança do céu'
      },
      {
        number: 3,
        title: 'A Vinda do Espírito Santo (Pentecostes)',
        kidsExplanation: 'Nossa Senhora e os apóstolos estão rezando juntos quando o Espírito Santo desce como línguas de fogo e enche a todos de coragem e amor!',
        audioSrc: '/terco-kids/glorioso-3.mp3',
        fruit: 'Falar de Jesus com alegria'
      },
      {
        number: 4,
        title: 'A Assunção de Nossa Senhora ao Céu',
        kidsExplanation: 'Nossa Senhora é levada pelos anjinhos em corpo e alma para o céu! Ela agora olha por nós do céu como nossa carinhosa protetora.',
        audioSrc: '/terco-kids/glorioso-4.mp3',
        fruit: 'Confiança na Mãezinha do Céu'
      },
      {
        number: 5,
        title: 'A Coroação de Maria como Rainha do Céu',
        kidsExplanation: 'Deus coroa Maria como Rainha de todo o Universo, cercada de anjos e santos cantando! Ela é a nossa Rainha e Mãe muito amada!',
        audioSrc: '/terco-kids/glorioso-5.mp3',
        fruit: 'Devoção filial e amor sem fim'
      }
    ]
  },
  {
    id: 'luminosos',
    name: 'Mistérios Luminosos',
    badgeEmoji: '✨',
    themeColor: '#F5A623',
    daysDescription: 'Quinta-feira',
    days: [4],
    introAudio: '/terco-kids/intro-luminosos.mp3',
    mysteries: [
      {
        number: 1,
        title: 'O Batismo de Jesus no Rio Jordão',
        kidsExplanation: 'São João Batista batiza Jesus no rio. O céu se abre, o Espírito Santo desce como pomba e a voz do Pai diz: "Este é o meu Filho muito amado!"',
        audioSrc: '/terco-kids/luminoso-1.mp3',
        fruit: 'Agradecer pelo nosso Santo Batismo'
      },
      {
        number: 2,
        title: 'O Primeiro Milagre nas Bodas de Caná',
        kidsExplanation: 'Faltou vinho em uma festa de casamento. Maria diz aos serventes: "Fazei tudo o que Ele vos disser!". E Jesus transforma água no melhor vinho!',
        audioSrc: '/terco-kids/luminoso-2.mp3',
        fruit: 'Confiar na intercessão de Maria'
      },
      {
        number: 3,
        title: 'O Anúncio do Reino de Deus',
        kidsExplanation: 'Jesus caminha pelas cidades curando os doentes, acolhendo as criancinhas e ensinando que o Reino dos Céus é dos puros de coração.',
        audioSrc: '/terco-kids/luminoso-3.mp3',
        fruit: 'Bondade com todos os amiguinhos'
      },
      {
        number: 4,
        title: 'A Transfiguração de Jesus no Monte Tabor',
        kidsExplanation: 'No alto do monte, o rosto de Jesus brilha como o sol e Suas roupas ficam brancas como a neve! Os apóstolos contemplam a glória divina!',
        audioSrc: '/terco-kids/luminoso-4.mp3',
        fruit: 'Ver a luz de Jesus em nossa vida'
      },
      {
        number: 5,
        title: 'A Instituição da Santíssima Eucaristia',
        kidsExplanation: 'Na Última Ceia, Jesus parte o pão e dá o cálice dizendo: "Isto é o Meu Corpo, este é o Meu Sangue". Ele fica para sempre na Hóstia Santa!',
        audioSrc: '/terco-kids/luminoso-5.mp3',
        fruit: 'Amor fervoroso à Santa Missa'
      }
    ]
  }
];

/* ============================================================================
   AVATARES 3D DE NOSSA SENHORA (FALLBACKS RESILIENTES)
   ============================================================================ */
const AVATAR_IMAGES = {
  sorrindo: '/terco-kids/ns-sorrindo.png',
  falando: '/terco-kids/ns-falando.png',
  ensinando: '/terco-kids/ns-ensinando.png'
};

/* ============================================================================
   TEXTOS DAS ORAÇÕES PADRÃO COM PAUSAS VISUAIS [...]
   ============================================================================ */
const PRAYERS_TEXT = {
  credo: "Em nome do Pai, do Filho e do Espírito Santo. Amém! [...] Creio em Deus Pai Todo-Poderoso, [...] Criador do céu e da terra; [...] e em Jesus Cristo, seu único Filho, Nosso Senhor; [...] que foi concebido pelo poder do Espírito Santo; [...] nasceu da Virgem Maria; [...] padeceu sob Pôncio Pilatos; [...] foi crucificado, morto e sepultado; [...] desceu à mansão dos mortos; [...] ressuscitou ao terceiro dia; [...] subiu aos céus, [...] está sentado à direita de Deus Pai Todo-Poderoso, [...] donde há de vir a julgar os vivos e os mortos. [...] Creio no Espírito Santo; [...] na Santa Igreja Católica; [...] na comunhão dos santos; [...] na remissão dos pecados; [...] na ressurreição da carne; [...] na vida eterna. Amém!",
  paiNosso: "Pai Nosso que estais no céu, [...] santificado seja o vosso Nome; [...] venha a nós o vosso Reino; [...] seja feita a vossa vontade, [...] assim na terra como no céu. [...] O pão nosso de cada dia nos dai hoje; [...] perdoai-nos as nossas ofensas, [...] assim como nós perdoamos a quem nos tem ofendido; [...] e não nos deixeis cair em tentação, [...] mas livrai-nos do mal. Amém!",
  aveMaria: "Ave Maria, cheia de graça, [...] o Senhor é convosco; [...] bendita sois vós entre as mulheres, [...] e bendito é o fruto do vosso ventre, Jesus. [...] Santa Maria, Mãe de Deus, [...] rogai por nós, pecadores, [...] agora e na hora da nossa morte. Amém!",
  gloria: "Glória ao Pai, ao Filho e ao Espírito Santo. [...] Como era no princípio, agora e sempre. Amém! [...] Ó meu Jesus, perdoai-nos, livrai-nos do fogo do inferno, [...] levai as almas todas para o céu [...] e socorrei principalmente as que mais precisarem. Amém!",
  santoAnjo: "Santo Anjo do Senhor, [...] meu zeloso guardador, [...] se a ti me confiou a piedade divina, [...] sempre me rege, me guarda, [...] me governa, me ilumina. Amém! [...] Nossa Senhora Rainha da Paz, rogai por nós e pelas nossas famílias!"
};

/* ============================================================================
   GERADOR DA LISTA COMPLETA DE PASSOS DO TERÇO KIDS
   ============================================================================ */
function buildPrayerSteps(mysteryGroup: MysteryGroupData): PrayerStep[] {
  const steps: PrayerStep[] = [];

  // 1. Mensagem Inicial Acolhedora
  steps.push({
    id: 'intro-welcome',
    title: 'Olá, meu querido amiguinho!',
    subtitle: 'Nossa Senhora acolhe você para rezar',
    category: 'intro',
    audioSrc: '/terco-kids/ola-meu-querido-amiguinho.mp3',
    state: 'ensinando',
    text: "Olá meu querido amiguinho! [...] Que alegria no coração rezar o Santo Terço com você! [...] Vamos juntos pedir a Jesus e a Nossa Senhora por você, pela sua família e por todo o mundo? [...] Pegue o seu tercinho bem bonito e vamos começar!",
    beadId: 'bead-intro'
  });

  // 2. Sinal da Cruz e Credo
  steps.push({
    id: 'credo',
    title: 'Sinal da Cruz e o Santo Credo',
    subtitle: 'Na Cruz do nosso Terço, professamos nossa fé',
    category: 'credo',
    audioSrc: '/terco-kids/CREIO.mp3',
    state: 'falando',
    text: PRAYERS_TEXT.credo,
    beadId: 'bead-cross'
  });

  // 3. Pai Nosso Inicial
  steps.push({
    id: 'pai-nosso-intro',
    title: 'Pai Nosso Inicial',
    subtitle: 'A oração que o próprio Jesus nos ensinou',
    category: 'pai-nosso',
    audioSrc: '/terco-kids/pai-nosso.mp3',
    state: 'falando',
    text: PRAYERS_TEXT.paiNosso,
    beadId: 'bead-intro-pn'
  });

  // 4. 3 Ave-Marias Iniciais (Fé, Esperança e Caridade)
  steps.push({
    id: 'ave-maria-intro-1',
    title: '1ª Ave-Maria: Pelo Aumento da Fé',
    subtitle: 'Para termos um coração que confia sempre em Jesus',
    category: 'ave-maria',
    audioSrc: '/terco-kids/ave-maria.mp3',
    state: 'falando',
    text: PRAYERS_TEXT.aveMaria,
    beadId: 'bead-intro-ave-1'
  });

  steps.push({
    id: 'ave-maria-intro-2',
    title: '2ª Ave-Maria: Pelo Aumento da Esperança',
    subtitle: 'Para esperar com alegria nas promessas de Deus',
    category: 'ave-maria',
    audioSrc: '/terco-kids/ave-maria-2.mp3',
    state: 'falando',
    text: PRAYERS_TEXT.aveMaria,
    beadId: 'bead-intro-ave-2'
  });

  steps.push({
    id: 'ave-maria-intro-3',
    title: '3ª Ave-Maria: Pelo Aumento da Caridade',
    subtitle: 'Para amarmos a todos os nossos irmãos',
    category: 'ave-maria',
    audioSrc: '/terco-kids/ave-maria.mp3',
    state: 'falando',
    text: PRAYERS_TEXT.aveMaria,
    beadId: 'bead-intro-ave-3'
  });

  // 5. Glória ao Pai Inicial
  steps.push({
    id: 'gloria-intro',
    title: 'Glória ao Pai',
    subtitle: 'Louvor à Santíssima Trindade',
    category: 'gloria',
    audioSrc: '/terco-kids/gloria-ao-pai.mp3',
    state: 'falando',
    text: PRAYERS_TEXT.gloria,
    beadId: 'bead-intro-gloria'
  });

  // 6. Os 5 Mistérios com suas 10 Ave-Marias
  mysteryGroup.mysteries.forEach((mystery, decIdx) => {
    // 6.1 Anúncio do Mistério
    steps.push({
      id: `misterio-${decIdx + 1}-anuncio`,
      title: `${mystery.number}º Mistério: ${mystery.title}`,
      subtitle: `Meditação para o nosso coraçãozinho: ${mystery.fruit}`,
      category: 'misterio',
      mysteryNumber: mystery.number,
      decadeIndex: decIdx,
      audioSrc: mystery.audioSrc,
      state: 'ensinando',
      text: `${mystery.kidsExplanation} [...] Fruto do mistério: ${mystery.fruit}`,
      fruit: mystery.fruit,
      beadId: `decade-${decIdx}-pn`
    });

    // 6.2 Pai Nosso da Dezena
    steps.push({
      id: `misterio-${decIdx + 1}-pn`,
      title: `Pai Nosso (${mystery.number}º Mistério)`,
      subtitle: 'Rezando juntos com Nossa Senhora',
      category: 'pai-nosso',
      mysteryNumber: mystery.number,
      decadeIndex: decIdx,
      audioSrc: '/terco-kids/pai-nosso.mp3',
      state: 'falando',
      text: PRAYERS_TEXT.paiNosso,
      beadId: `decade-${decIdx}-pn`
    });

    // 6.3 10 Ave-Marias da Dezena
    for (let aveIdx = 1; aveIdx <= 10; aveIdx++) {
      steps.push({
        id: `misterio-${decIdx + 1}-ave-${aveIdx}`,
        title: `${aveIdx}ª Ave-Maria do ${mystery.number}º Mistério`,
        subtitle: `Rosa de amor ofertada a Nossa Senhora (${aveIdx}/10)`,
        category: 'ave-maria',
        mysteryNumber: mystery.number,
        decadeIndex: decIdx,
        beadIndex: aveIdx,
        // Alterna suavemente os áudios gravados
        audioSrc: aveIdx % 2 === 0 ? '/terco-kids/ave-maria-2.mp3' : '/terco-kids/ave-maria.mp3',
        state: 'falando',
        text: PRAYERS_TEXT.aveMaria,
        beadId: `decade-${decIdx}-ave-${aveIdx}`
      });
    }

    // 6.4 Glória ao Pai e Jaculatória
    steps.push({
      id: `misterio-${decIdx + 1}-gloria`,
      title: `Glória ao Pai (${mystery.number}º Mistério)`,
      subtitle: 'Louvor a Deus e Jaculatória de Fátima',
      category: 'gloria',
      mysteryNumber: mystery.number,
      decadeIndex: decIdx,
      audioSrc: decIdx % 2 === 0 ? '/terco-kids/gloria-ao-pai.mp3' : '/terco-kids/gloria-ao-pai-2.mp3',
      state: 'falando',
      text: PRAYERS_TEXT.gloria,
      beadId: `decade-${decIdx}-gloria`
    });
  });

  // 7. Encerramento: Santo Anjo e Bênção Final
  steps.push({
    id: 'final-blessing',
    title: 'Parabéns! Terço Concluído com Amor!',
    subtitle: 'Oração ao Santo Anjo da Guarda e Bênção de Nossa Senhora',
    category: 'final',
    audioSrc: '/terco-kids/santo-anjo.mp3',
    state: 'sorrindo',
    text: "Parabéns, meu querido amiguinho! [...] Você concluiu o Santo Terço com muito amor no coração! [...] Jesus e Nossa Senhora estão muito felizes com a sua oração! [...] Vamos pedir a proteção do nosso Anjo da Guarda: [...] " + PRAYERS_TEXT.santoAnjo,
    beadId: 'bead-center'
  });

  return steps;
}

/* ============================================================================
   COMPONENTE PRINCIPAL: SANTO TERÇO KIDS
   ============================================================================ */

export const SantoTercoKids: React.FC<{ onSwitchToAdult?: () => void }> = ({ onSwitchToAdult }) => {
  // 1. Identifica os mistérios do dia atual
  const getTodayMysteryId = (): MysteryGroupKids => {
    const day = new Date().getDay();
    const found = KIDS_MYSTERY_GROUPS.find((g) => g.days.includes(day));
    return found ? found.id : 'gloriosos';
  };

  const [selectedGroup, setSelectedGroup] = useState<MysteryGroupKids>(getTodayMysteryId);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [autoAdvance, setAutoAdvance] = useState<boolean>(true);
  const [audioProgress, setAudioProgress] = useState<number>(0); // 0 a 100
  const [activePhraseIndex, setActivePhraseIndex] = useState<number>(0);
  const [isSpeechFallback, setIsSpeechFallback] = useState<boolean>(false);
  const [avatarStateOverride, setAvatarStateOverride] = useState<AvatarState | null>(null);

  // Áudio HTML5 singleton
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const preloaderRef = useRef<HTMLAudioElement | null>(null);
  const progressIntervalRef = useRef<number | null>(null);

  // Grupo e Passos ativos
  const activeGroup = useMemo(() => {
    return KIDS_MYSTERY_GROUPS.find((g) => g.id === selectedGroup)!;
  }, [selectedGroup]);

  const steps = useMemo(() => {
    return buildPrayerSteps(activeGroup);
  }, [activeGroup]);

  const currentStep = steps[currentStepIndex] || steps[0];

  // Frases divididas por [...]
  const phrases = useMemo(() => {
    if (!currentStep.text) return [];
    return currentStep.text
      .split('[...]')
      .map((p) => p.trim())
      .filter((p) => p.length > 0);
  }, [currentStep.text]);

  // Determina o avatar ativo
  const currentAvatarState: AvatarState = useMemo(() => {
    if (avatarStateOverride) return avatarStateOverride;
    if (!isPlaying) return 'sorrindo';
    return currentStep.state;
  }, [avatarStateOverride, isPlaying, currentStep.state]);

  /* ==========================================================================
     GERENCIADOR DE ÁUDIO ROBUSTO (ZERO TRAVAMENTOS & SPEECH SYNTHESIS FALLBACK)
     ========================================================================== */

  // Inicializa o objeto de áudio
  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'auto';
    audioRef.current = audio;

    const preloader = new Audio();
    preloaderRef.current = preloader;

    return () => {
      audio.pause();
      audio.src = '';
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Pré-carrega o próximo áudio em background
  useEffect(() => {
    const nextStep = steps[currentStepIndex + 1];
    if (nextStep && preloaderRef.current && nextStep.audioSrc) {
      preloaderRef.current.src = nextStep.audioSrc;
      preloaderRef.current.load();
    }
  }, [currentStepIndex, steps]);

  // Fallback de fala via Web Speech API
  const speakFallback = useCallback((textToSpeak: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    // Limpa marcadores
    const clean = textToSpeak.replace(/\[\.\.\.\]/g, ' ').replace(/\s+/g, ' ').trim();
    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.lang = 'pt-BR';
    utterance.rate = 0.92; // tom calmo para crianças
    utterance.pitch = 1.05;

    // Procura voz feminina em pt-BR se disponível
    const voices = window.speechSynthesis.getVoices();
    const ptVoice = voices.find((v) => v.lang.startsWith('pt') && /female|mulher|maria|helena|luciana/i.test(v.name)) ||
      voices.find((v) => v.lang.startsWith('pt'));
    if (ptVoice) utterance.voice = ptVoice;

    utterance.onstart = () => {
      setIsSpeechFallback(true);
      setIsPlaying(true);
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setIsSpeechFallback(false);
      if (autoAdvance && currentStepIndex < steps.length - 1) {
        setCurrentStepIndex((prev) => prev + 1);
      }
    };

    utterance.onerror = () => {
      setIsPlaying(false);
      setIsSpeechFallback(false);
    };

    window.speechSynthesis.speak(utterance);
  }, [autoAdvance, currentStepIndex, steps.length]);

  // Toca o áudio do passo atual
  const playCurrentAudio = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return;

    // Cancela qualquer fala pendente
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    try {
      audio.pause();
      audio.src = currentStep.audioSrc;
      audio.muted = isMuted;
      audio.currentTime = 0;

      // Tratamento estrito de promessa
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        await playPromise;
        setIsPlaying(true);
        setIsSpeechFallback(false);
      }
    } catch (err: unknown) {
      console.warn('[SantoTercoKids] Áudio nativo falhou ou foi bloqueado, usando Fallback:', err);
      // Fallback para SpeechSynthesis
      speakFallback(currentStep.text);
    }
  }, [currentStep.audioSrc, currentStep.text, isMuted, speakFallback]);

  // Pausa
  const pauseAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
    setAvatarStateOverride('sorrindo');
    setTimeout(() => setAvatarStateOverride(null), 1000);
  }, []);

  // Monitora timeupdate do áudio e sincroniza frases
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      if (audio.duration && audio.duration > 0) {
        const percent = (audio.currentTime / audio.duration) * 100;
        setAudioProgress(percent);

        // Calcula qual frase está ativa proporcionalmente à duração
        if (phrases.length > 0) {
          const phraseIndex = Math.min(
            phrases.length - 1,
            Math.floor((audio.currentTime / audio.duration) * phrases.length)
          );
          setActivePhraseIndex(phraseIndex);
        }
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setAudioProgress(100);
      setAvatarStateOverride('sorrindo');
      setTimeout(() => setAvatarStateOverride(null), 1500);

      // Avança automaticamente se o modo estiver ligado
      if (autoAdvance && currentStepIndex < steps.length - 1) {
        setTimeout(() => {
          setCurrentStepIndex((prev) => prev + 1);
        }, 800);
      }
    };

    const handleError = () => {
      console.warn('[SantoTercoKids] Erro no carregamento do arquivo de áudio:', currentStep.audioSrc);
      speakFallback(currentStep.text);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, [currentStep.audioSrc, currentStep.text, phrases.length, autoAdvance, currentStepIndex, steps.length, speakFallback]);

  // Quando o índice do passo muda, toca o áudio se já estiver no fluxo de oração
  useEffect(() => {
    setActivePhraseIndex(0);
    setAudioProgress(0);

    // Se estiver tocando, dispara a oração do novo passo automaticamente
    if (isPlaying) {
      playCurrentAudio();
    }
  }, [currentStepIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  // Troca de grupo de mistério
  const handleSelectGroup = (groupId: MysteryGroupKids) => {
    pauseAudio();
    setSelectedGroup(groupId);
    setCurrentStepIndex(0);
  };

  // Botões de navegação
  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
      if (isPlaying) {
        setTimeout(() => playCurrentAudio(), 100);
      }
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
      if (isPlaying) {
        setTimeout(() => playCurrentAudio(), 100);
      }
    }
  };

  const handleReplay = () => {
    playCurrentAudio();
  };

  const handleTogglePlay = () => {
    if (isPlaying) {
      pauseAudio();
    } else {
      playCurrentAudio();
    }
  };

  const handleToggleMute = () => {
    setIsMuted((prev) => {
      const next = !prev;
      if (audioRef.current) {
        audioRef.current.muted = next;
      }
      return next;
    });
  };

  // Clique direto na bolinha do terço
  const handleBeadClick = (stepIndex: number) => {
    setCurrentStepIndex(stepIndex);
    setTimeout(() => {
      playCurrentAudio();
    }, 150);
  };

  /* ==========================================================================
     MAPEAMENTO DE COORDENADAS DO TERÇO SVG INTERATIVO
     ========================================================================== */

  // Coordenadas calculadas para as 5 dezenas em círculo/oval
  const decadeBeads = useMemo(() => {
    const decades = [];
    const centerX = 200;
    const centerY = 175;
    const radiusX = 130;
    const radiusY = 110;

    // 5 dezenas com 10 Ave-Marias cada = 50 contas no laço
    // Começa na parte inferior da medalha e dá a volta completa
    for (let d = 0; d < 5; d++) {
      const beadsInDecade = [];
      const startAngle = (d * 72 + 20) * (Math.PI / 180);
      const endAngle = ((d + 1) * 72 - 8) * (Math.PI / 180);

      // Pai Nosso da dezena (conta maior)
      const pnAngle = (d * 72 + 6) * (Math.PI / 180);
      const pnX = centerX + radiusX * Math.cos(pnAngle + Math.PI / 2);
      const pnY = centerY + radiusY * Math.sin(pnAngle + Math.PI / 2);

      // 10 Ave-Marias da dezena
      for (let b = 0; b < 10; b++) {
        const angle = startAngle + (b / 9) * (endAngle - startAngle);
        const x = centerX + radiusX * Math.cos(angle + Math.PI / 2);
        const y = centerY + radiusY * Math.sin(angle + Math.PI / 2);
        beadsInDecade.push({ x, y, beadNum: b + 1 });
      }

      decades.push({
        decadeIndex: d,
        pn: { x: pnX, y: pnY },
        aves: beadsInDecade
      });
    }

    return decades;
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto px-3 sm:px-6 py-6 font-sans text-[#2c3e50] select-none">
      
      {/* ────────────────────────────────────────────────────────────────────
          CABEÇALHO LÚDICO: TÍTULO, BADGE DE HOJE E BOTÃO ADULTO
          ──────────────────────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-b from-[#EBF3FA] via-[#F8FBFF] to-white rounded-3xl p-5 sm:p-7 shadow-lg border-2 border-[#D4E6F1] text-center mb-6 relative overflow-hidden">
        
        {/* Nuvens e estrelinhas decorativas no fundo */}
        <div className="absolute top-2 left-4 text-2xl opacity-70 animate-pulse pointer-events-none">☁️</div>
        <div className="absolute top-3 right-6 text-2xl opacity-70 animate-pulse pointer-events-none">⭐</div>
        <div className="absolute bottom-2 left-10 text-xl opacity-60 pointer-events-none">✨</div>

        {/* Barra superior de utilitários */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#BEE3F8] shadow-xs text-xs sm:text-sm font-bold text-[#2B6CB0]">
            <Calendar className="w-4 h-4 text-[#3182CE]" />
            <span>Mistérios de Hoje: {activeGroup.name} {activeGroup.badgeEmoji}</span>
          </div>

          {onSwitchToAdult && (
            <button
              onClick={onSwitchToAdult}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 hover:bg-white text-xs font-semibold text-[#4A5568] hover:text-[#2D3748] border border-[#CBD5E0] shadow-xs transition-all hover:scale-102 cursor-pointer"
            >
              <span>✝️ Modo Tradicional</span>
            </button>
          )}
        </div>

        {/* Título com Tipografia Arredondada e Amigável */}
        <div className="space-y-2">
          <div className="inline-flex items-center justify-center gap-2">
            <span className="text-3xl sm:text-4xl">🎈</span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#2B6CB0] tracking-tight drop-shadow-xs font-display">
              Santo Terço Kids
            </h1>
            <span className="text-3xl sm:text-4xl">🕊️</span>
          </div>
          <p className="text-sm sm:text-base text-[#4A5568] max-w-lg mx-auto font-medium">
            Reze com a Mãezinha do Céu! Clique nas bolinhas, ouça a voz carinhosa e acompanhe cada oração com o coração.
          </p>
        </div>

        {/* Seletor Amigável de Mistérios */}
        <div className="flex flex-wrap justify-center gap-2 pt-4">
          {KIDS_MYSTERY_GROUPS.map((group) => {
            const isSelected = selectedGroup === group.id;
            const isToday = group.id === getTodayMysteryId();
            return (
              <button
                key={group.id}
                onClick={() => handleSelectGroup(group.id)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs sm:text-sm font-extrabold transition-all duration-200 cursor-pointer shadow-xs ${
                  isSelected
                    ? 'bg-[#3182CE] text-white shadow-md scale-105 border-2 border-[#2B6CB0]'
                    : 'bg-white hover:bg-[#EBF8FF] text-[#4A5568] border border-[#CBD5E0]'
                }`}
              >
                <span>{group.badgeEmoji}</span>
                <span>{group.name}</span>
                {isToday && (
                  <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded-full bg-[#EBF8FF] text-[#2B6CB0] font-black">
                    Hoje!
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────────────────
          BARRA DE PROGRESSO INFANTIL COM CONTADOR VISUAL
          ──────────────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#E2E8F0] mb-6">
        <div className="flex items-center justify-between text-xs sm:text-sm font-bold text-[#4A5568] mb-2">
          <span className="flex items-center gap-1.5 text-[#2B6CB0]">
            <Star className="w-4 h-4 text-[#D69E2E] fill-[#D69E2E]" />
            Passo {currentStepIndex + 1} de {steps.length}
          </span>
          <span className="px-2.5 py-1 rounded-full bg-[#EBF8FF] text-[#2B6CB0] text-xs font-black">
            {currentStep.category === 'intro' && 'Boas-Vindas'}
            {currentStep.category === 'credo' && 'Santo Credo'}
            {currentStep.category === 'pai-nosso' && 'Pai Nosso'}
            {currentStep.category === 'ave-maria' && 'Ave Maria'}
            {currentStep.category === 'gloria' && 'Glória ao Pai'}
            {currentStep.category === 'misterio' && 'Meditação do Mistério'}
            {currentStep.category === 'final' && 'Bênção Final'}
          </span>
        </div>

        {/* Barra de Progresso com cantos redondos e cor vibrante */}
        <div className="w-full h-3 bg-[#EDF2F7] rounded-full overflow-hidden p-0.5 border border-[#E2E8F0]">
          <div
            className="h-full bg-gradient-to-r from-[#63B3ED] via-[#4299E1] to-[#3182CE] rounded-full transition-all duration-300"
            style={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────────────────
          ÁREA CENTRAL: AVATAR 3D DE NOSSA SENHORA + BALÃO DE FALA
          ──────────────────────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-b from-white to-[#F7FAFC] rounded-3xl p-5 sm:p-8 shadow-xl border-2 border-[#E2E8F0] mb-8 relative">
        
        {/* AVATAR 3D DE NOSSA SENHORA */}
        <div className="flex flex-col items-center justify-center mb-6">
          <div className="relative group">
            {/* Halo Dourado Luminoso com Animação Suave */}
            <div
              className={`absolute -inset-3 rounded-full blur-md transition-all duration-500 pointer-events-none ${
                isPlaying
                  ? 'bg-gradient-to-tr from-[#ECC94B] via-[#F6E05E] to-[#FAF089] opacity-80 scale-105 animate-pulse'
                  : 'bg-[#FEFCBF] opacity-50'
              }`}
            />

            {/* Moldura Circular do Avatar */}
            <div className="relative w-36 h-36 sm:w-44 sm:h-44 md:w-52 md:h-52 rounded-full p-2 bg-gradient-to-b from-[#FFFDF0] via-[#FEEBC8] to-[#CBD5E0] shadow-xl border-4 border-white overflow-hidden transition-transform duration-300 hover:scale-103">
              <img
                src={AVATAR_IMAGES[currentAvatarState]}
                alt={`Nossa Senhora ${currentAvatarState}`}
                className="w-full h-full object-cover rounded-full transition-all duration-300"
                onError={(e) => {
                  // Fallback se a imagem falhar
                  const target = e.currentTarget;
                  if (!target.src.includes('SORINDO-NORMAL')) {
                    target.src = '/terco-kids/SORINDO-NORMAL.png';
                  }
                }}
              />
            </div>

            {/* Badge de Estado no Avatar */}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-white border-2 border-[#ECC94B] shadow-md flex items-center gap-1.5 text-xs font-black text-[#744210] whitespace-nowrap">
              {currentAvatarState === 'sorrindo' && (
                <>
                  <Smile className="w-3.5 h-3.5 text-[#D69E2E]" />
                  <span>Acolhendo você ❤️</span>
                </>
              )}
              {currentAvatarState === 'falando' && (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-[#3182CE] animate-pulse" />
                  <span>Rezando com você 🕊️</span>
                </>
              )}
              {currentAvatarState === 'ensinando' && (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-[#D69E2E]" />
                  <span>Ensinando com amor ✨</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* BALÃO DE FALA DE NOSSA SENHORA (SPEECH BUBBLE) */}
        <div className="relative bg-[#FFFDF7] border-2 border-[#ECC94B] rounded-3xl p-5 sm:p-7 shadow-md mb-6">
          {/* Triângulo pontudo apontando para o avatar */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-[#FFFDF7] border-t-2 border-l-2 border-[#ECC94B] rotate-45" />

          {/* Cabeçalho da fala */}
          <div className="text-center mb-3">
            <h2 className="text-xl sm:text-2xl font-black text-[#2B6CB0] font-display">
              {currentStep.title}
            </h2>
            <p className="text-xs sm:text-sm text-[#718096] font-medium mt-0.5">
              {currentStep.subtitle}
            </p>
          </div>

          {/* Texto da Oração com Frases Destacadas Dinamicamente */}
          <div className="text-base sm:text-lg md:text-xl text-[#2D3748] leading-relaxed text-center font-medium min-h-[90px] flex flex-wrap items-center justify-center gap-1 sm:gap-1.5 py-2">
            {phrases.map((phrase, idx) => {
              const isCurrentPhrase = isPlaying && idx === activePhraseIndex;
              const isPastPhrase = isPlaying && idx < activePhraseIndex;

              return (
                <span
                  key={idx}
                  className={`inline-block px-1.5 py-0.5 rounded-lg transition-all duration-300 ${
                    isCurrentPhrase
                      ? 'bg-[#FEFCBF] text-[#744210] font-black scale-108 shadow-xs border border-[#ECC94B]'
                      : isPastPhrase
                      ? 'text-[#4A5568] opacity-80'
                      : 'text-[#2D3748]'
                  }`}
                >
                  {phrase}
                  {idx < phrases.length - 1 && <span className="opacity-40 ml-1">·</span>}
                </span>
              );
            })}
          </div>

          {/* Barra de progresso sutil do áudio atual */}
          {isPlaying && (
            <div className="w-full h-1.5 bg-[#EDF2F7] rounded-full overflow-hidden mt-3">
              <div
                className="h-full bg-[#ECC94B] transition-all duration-150"
                style={{ width: `${audioProgress}%` }}
              />
            </div>
          )}

          {isSpeechFallback && (
            <div className="text-center mt-2">
              <span className="text-[11px] text-[#A0AEC0] italic">
                (Reproduzindo com voz assistida do navegador)
              </span>
            </div>
          )}
        </div>

        {/* ────────────────────────────────────────────────────────────────────
            PAINEL DE CONTROLE DE ÁUDIO COM BOTÕES GRANDES PARA CRIANÇAS
            ──────────────────────────────────────────────────────────────────── */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 pt-2">
          
          {/* Botão Voltar */}
          <button
            onClick={handlePrev}
            disabled={currentStepIndex === 0}
            className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white hover:bg-[#F7FAFC] disabled:opacity-40 text-[#4A5568] border-2 border-[#CBD5E0] shadow-sm transition-all hover:scale-105 active:scale-95 cursor-pointer disabled:cursor-not-allowed"
            title="Oração Anterior"
          >
            <SkipBack className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          {/* Botão Repetir */}
          <button
            onClick={handleReplay}
            className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white hover:bg-[#F7FAFC] text-[#4A5568] border-2 border-[#CBD5E0] shadow-sm transition-all hover:scale-105 active:scale-95 cursor-pointer"
            title="Rezar Novamente Esta Oração"
          >
            <RotateCcw className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          {/* Botão Principal: Play / Pause Grande e Chamativo */}
          <button
            onClick={handleTogglePlay}
            className={`flex items-center justify-center gap-2 px-6 sm:px-8 h-14 sm:h-16 rounded-3xl font-black text-lg sm:text-xl shadow-lg transition-all duration-200 cursor-pointer transform hover:scale-105 active:scale-95 ${
              isPlaying
                ? 'bg-[#E53E3E] text-white border-2 border-[#C53030] hover:bg-[#C53030]'
                : 'bg-gradient-to-r from-[#38A169] to-[#2F855A] text-white border-2 border-[#276749] hover:from-[#2F855A] hover:to-[#22543D]'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-7 h-7 fill-white" />
                <span>Pausar</span>
              </>
            ) : (
              <>
                <Play className="w-7 h-7 fill-white" />
                <span>{currentStepIndex === 0 ? 'Começar a Rezar 🌸' : 'Continuar Oração'}</span>
              </>
            )}
          </button>

          {/* Botão Avançar */}
          <button
            onClick={handleNext}
            disabled={currentStepIndex === steps.length - 1}
            className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white hover:bg-[#F7FAFC] disabled:opacity-40 text-[#4A5568] border-2 border-[#CBD5E0] shadow-sm transition-all hover:scale-105 active:scale-95 cursor-pointer disabled:cursor-not-allowed"
            title="Próxima Oração"
          >
            <SkipForward className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          {/* Botão de Som / Mudo */}
          <button
            onClick={handleToggleMute}
            className={`flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-2xl border-2 shadow-sm transition-all hover:scale-105 active:scale-95 cursor-pointer ${
              isMuted
                ? 'bg-[#FFF5F5] border-[#FEB2B2] text-[#E53E3E]'
                : 'bg-white hover:bg-[#F7FAFC] border-[#CBD5E0] text-[#4A5568]'
            }`}
            title={isMuted ? 'Ativar Voz' : 'Silenciar Voz'}
          >
            {isMuted ? <VolumeX className="w-5 h-5 sm:w-6 sm:h-6" /> : <Volume2 className="w-5 h-5 sm:w-6 sm:h-6" />}
          </button>
        </div>

        {/* Chave de Avanço Automático */}
        <div className="flex items-center justify-center gap-2 mt-4 text-xs font-semibold text-[#718096]">
          <span>Modo contínuo:</span>
          <button
            onClick={() => setAutoAdvance(!autoAdvance)}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
              autoAdvance
                ? 'bg-[#C6F6D5] text-[#22543D] border border-[#9AE6B4]'
                : 'bg-[#EDF2F7] text-[#718096] border border-[#CBD5E0]'
            }`}
          >
            {autoAdvance ? 'Ligado (avança sozinho) ⏩' : 'Manual (no seu ritmo) 🖐️'}
          </button>
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────────────────
          TERÇO INTERATIVO EM SVG COM AS BOLINHAS CLICÁVEIS
          ──────────────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-3xl p-5 sm:p-8 shadow-xl border-2 border-[#E2E8F0] mb-8">
        <div className="text-center mb-4">
          <h3 className="text-xl sm:text-2xl font-black text-[#2B6CB0] font-display flex items-center justify-center gap-2">
            <span>📿</span>
            <span>Seu Tercinho Interativo</span>
            <span>✨</span>
          </h3>
          <p className="text-xs sm:text-sm text-[#718096]">
            Toque em qualquer bolinha para rezar aquela oração! As bolinhas douradas já foram rezadas com amor.
          </p>
        </div>

        {/* SVG DO TERÇO INFANTIL */}
        <div className="w-full max-w-lg mx-auto flex items-center justify-center">
          <svg
            viewBox="0 0 400 480"
            className="w-full h-auto max-h-[460px] filter drop-shadow-sm select-none"
          >
            <defs>
              {/* Filtro de Brilho Dourado para a Bolinha Atual */}
              <filter id="glow-gold" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>

              {/* Gradiente Dourado para Contas Concluídas */}
              <linearGradient id="grad-gold" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#F6E05E" />
                <stop offset="100%" stopColor="#D69E2E" />
              </linearGradient>

              {/* Gradiente Azul Celestial para Conta Atual */}
              <linearGradient id="grad-active" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#63B3ED" />
                <stop offset="100%" stopColor="#2B6CB0" />
              </linearGradient>

              {/* Gradiente Branco/Prateado para Contas Futuras */}
              <linearGradient id="grad-bead-future" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="100%" stopColor="#E2E8F0" />
              </linearGradient>
            </defs>

            {/* Fio de conexão do laço superior */}
            <ellipse
              cx="200"
              cy="175"
              rx="130"
              ry="110"
              fill="none"
              stroke="#CBD5E0"
              strokeWidth="2.5"
              strokeDasharray="4 3"
            />

            {/* Fio de conexão inferior (haste da cruz) */}
            <line x1="200" y1="285" x2="200" y2="430" stroke="#CBD5E0" strokeWidth="2.5" />

            {/* 1. CRUZ INFERIOR (PASSO DO CREDO) */}
            {(() => {
              const isCurrent = currentStep.beadId === 'bead-cross';
              const isPast = currentStepIndex > 1;

              return (
                <g
                  onClick={() => handleBeadClick(1)}
                  className="cursor-pointer transition-transform hover:scale-110"
                  transform="translate(200, 430)"
                >
                  {/* Sombra suave */}
                  <rect
                    x="-10"
                    y="-5"
                    width="20"
                    height="36"
                    rx="4"
                    fill={isCurrent ? '#F6E05E' : isPast ? '#ECC94B' : '#A0AEC0'}
                    filter={isCurrent ? 'url(#glow-gold)' : undefined}
                  />
                  <rect
                    x="-18"
                    y="5"
                    width="36"
                    height="12"
                    rx="3"
                    fill={isCurrent ? '#F6E05E' : isPast ? '#ECC94B' : '#A0AEC0'}
                    filter={isCurrent ? 'url(#glow-gold)' : undefined}
                  />
                  {/* Ícone sutil no crucifixo */}
                  <text x="0" y="20" fontSize="12" textAnchor="middle" fill="#744210" fontWeight="bold">
                    ✝
                  </text>
                </g>
              );
            })()}

            {/* 2. CONTAS DA HASTE INICIAL */}
            {/* Pai Nosso Inicial */}
            {(() => {
              const isCurrent = currentStep.beadId === 'bead-intro-pn';
              const isPast = currentStepIndex > 2;
              return (
                <circle
                  cx="200"
                  cy="390"
                  r={isCurrent ? 11 : 9}
                  fill={isCurrent ? 'url(#grad-active)' : isPast ? 'url(#grad-gold)' : 'url(#grad-bead-future)'}
                  stroke={isCurrent ? '#F6E05E' : '#A0AEC0'}
                  strokeWidth="2"
                  filter={isCurrent ? 'url(#glow-gold)' : undefined}
                  className="cursor-pointer transition-all hover:scale-125"
                  onClick={() => handleBeadClick(2)}
                />
              );
            })()}

            {/* 3 Ave-Marias Iniciais */}
            {[
              { cy: 360, step: 3, id: 'bead-intro-ave-1' },
              { cy: 340, step: 4, id: 'bead-intro-ave-2' },
              { cy: 320, step: 5, id: 'bead-intro-ave-3' }
            ].map((b, idx) => {
              const isCurrent = currentStep.beadId === b.id;
              const isPast = currentStepIndex > b.step;
              return (
                <circle
                  key={idx}
                  cx="200"
                  cy={b.cy}
                  r={isCurrent ? 8.5 : 6.5}
                  fill={isCurrent ? 'url(#grad-active)' : isPast ? 'url(#grad-gold)' : 'url(#grad-bead-future)'}
                  stroke={isCurrent ? '#F6E05E' : '#CBD5E0'}
                  strokeWidth="1.5"
                  filter={isCurrent ? 'url(#glow-gold)' : undefined}
                  className="cursor-pointer transition-all hover:scale-125"
                  onClick={() => handleBeadClick(b.step)}
                />
              );
            })}

            {/* Glória ao Pai Inicial */}
            {(() => {
              const isCurrent = currentStep.beadId === 'bead-intro-gloria';
              const isPast = currentStepIndex > 6;
              return (
                <circle
                  cx="200"
                  cy="295"
                  r={isCurrent ? 9 : 7}
                  fill={isCurrent ? 'url(#grad-active)' : isPast ? 'url(#grad-gold)' : 'url(#grad-bead-future)'}
                  stroke={isCurrent ? '#F6E05E' : '#CBD5E0'}
                  strokeWidth="1.5"
                  filter={isCurrent ? 'url(#glow-gold)' : undefined}
                  className="cursor-pointer transition-all hover:scale-125"
                  onClick={() => handleBeadClick(6)}
                />
              );
            })()}

            {/* 3. MEDALHA CENTRAL DE NOSSA SENHORA */}
            {(() => {
              const isFinalStep = currentStep.category === 'final';
              return (
                <g
                  transform="translate(200, 260)"
                  className="cursor-pointer transition-transform hover:scale-115"
                  onClick={() => handleBeadClick(steps.length - 1)}
                >
                  <circle
                    cx="0"
                    cy="0"
                    r={isFinalStep ? 16 : 14}
                    fill={isFinalStep ? 'url(#grad-gold)' : '#FEFCBF'}
                    stroke="#D69E2E"
                    strokeWidth="2.5"
                    filter={isFinalStep ? 'url(#glow-gold)' : undefined}
                  />
                  <text x="0" y="5" fontSize="13" textAnchor="middle">
                    👸
                  </text>
                </g>
              );
            })()}

            {/* 4. AS 5 DEZENAS DO LAÇO (50 AVE-MARIAS + 5 PAI-NOSSOS) */}
            {decadeBeads.map((decade) => {
              // Encontra o passo do Pai Nosso desta dezena
              const pnStepIdx = steps.findIndex(
                (s) => s.category === 'pai-nosso' && s.decadeIndex === decade.decadeIndex
              );
              const isPnCurrent = currentStep.decadeIndex === decade.decadeIndex && currentStep.category === 'pai-nosso';
              const isPnPast = pnStepIdx !== -1 && currentStepIndex > pnStepIdx;

              return (
                <g key={decade.decadeIndex}>
                  {/* Conta maior do Pai Nosso / Anúncio do Mistério */}
                  <circle
                    cx={decade.pn.x}
                    cy={decade.pn.y}
                    r={isPnCurrent ? 12 : 9.5}
                    fill={isPnCurrent ? 'url(#grad-active)' : isPnPast ? 'url(#grad-gold)' : 'url(#grad-bead-future)'}
                    stroke={isPnCurrent ? '#F6E05E' : '#BEE3F8'}
                    strokeWidth="2"
                    filter={isPnCurrent ? 'url(#glow-gold)' : undefined}
                    className="cursor-pointer transition-all hover:scale-125"
                    onClick={() => {
                      if (pnStepIdx !== -1) handleBeadClick(pnStepIdx);
                    }}
                  />

                  {/* 10 Contas de Ave-Maria */}
                  {decade.aves.map((ave) => {
                    const aveStepIdx = steps.findIndex(
                      (s) =>
                        s.category === 'ave-maria' &&
                        s.decadeIndex === decade.decadeIndex &&
                        s.beadIndex === ave.beadNum
                    );
                    const isAveCurrent =
                      currentStep.decadeIndex === decade.decadeIndex &&
                      currentStep.category === 'ave-maria' &&
                      currentStep.beadIndex === ave.beadNum;
                    const isAvePast = aveStepIdx !== -1 && currentStepIndex > aveStepIdx;

                    return (
                      <circle
                        key={ave.beadNum}
                        cx={ave.x}
                        cy={ave.y}
                        r={isAveCurrent ? 9 : 6.5}
                        fill={isAveCurrent ? 'url(#grad-active)' : isAvePast ? 'url(#grad-gold)' : 'url(#grad-bead-future)'}
                        stroke={isAveCurrent ? '#F6E05E' : '#CBD5E0'}
                        strokeWidth="1.5"
                        filter={isAveCurrent ? 'url(#glow-gold)' : undefined}
                        className="cursor-pointer transition-all hover:scale-130"
                        onClick={() => {
                          if (aveStepIdx !== -1) handleBeadClick(aveStepIdx);
                        }}
                      />
                    );
                  })}
                </g>
              );
            })}
          </svg>
        </div>

        {/* Legenda das bolinhas do terço */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-[#718096] pt-3 border-t border-[#EDF2F7]">
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-full bg-[#3182CE] border border-[#2B6CB0] inline-block shadow-xs" />
            <span>Oração Atual</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-full bg-[#ECC94B] border border-[#D69E2E] inline-block shadow-xs" />
            <span>Já Rezada com Amor</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-full bg-[#EDF2F7] border border-[#CBD5E0] inline-block" />
            <span>Próximas Contas</span>
          </div>
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────────────────
          CARD FINAL DE ENCORAJAMENTO
          ──────────────────────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-[#FEFCBF]/60 via-[#EBF8FF]/60 to-[#EBF3FA] rounded-2xl p-4 text-center border border-[#ECC94B]/50 text-xs sm:text-sm text-[#744210]">
        <p className="font-bold flex items-center justify-center gap-1.5">
          <Heart className="w-4 h-4 text-[#E53E3E] fill-[#E53E3E]" />
          <span>"Cada Ave-Maria que uma criança reza é como uma rosa perfumada aos pés de Nossa Senhora."</span>
        </p>
      </div>

    </div>
  );
};

export default SantoTercoKids;
