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
  Baby,
  Check,
  Music,
  HelpCircle,
  Info
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
  beadId: string;
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

export interface RosaryTrailBead {
  id: string;
  x: number;
  y: number;
  radius: number;
  type: 'cross' | 'pn-intro' | 'ave-intro' | 'gloria-intro' | 'medal' | 'pn-decade' | 'ave-decade' | 'gloria-decade';
  decadeIndex?: number;
  aveIndex?: number;
  colorName?: string;
  colorHex?: string;
  gradientId?: string;
  label?: string;
  tooltip: string;
}

/* ============================================================================
   PALETA DE 10 CORES PASTEL LÚDICAS E ALEGRES PARA AS AVE-MARIAS
   ============================================================================ */
export const PASTEL_BEAD_THEMES = [
  { name: 'Rosa Flor', hex: '#f43f5e', fillLight: '#ffe4e6', stroke: '#f43f5e', gradientId: 'grad-ave-0', emoji: '🌸' },
  { name: 'Azul Céu', hex: '#0284c7', fillLight: '#e0f2fe', stroke: '#0284c7', gradientId: 'grad-ave-1', emoji: '🌤️' },
  { name: 'Amarelo Sol', hex: '#d97706', fillLight: '#fef3c7', stroke: '#d97706', gradientId: 'grad-ave-2', emoji: '☀️' },
  { name: 'Verde Menta', hex: '#059669', fillLight: '#d1fae5', stroke: '#059669', gradientId: 'grad-ave-3', emoji: '🍃' },
  { name: 'Lavanda', hex: '#7c3aed', fillLight: '#ede9fe', stroke: '#7c3aed', gradientId: 'grad-ave-4', emoji: '💜' },
  { name: 'Pêssego', hex: '#ea580c', fillLight: '#ffedd5', stroke: '#ea580c', gradientId: 'grad-ave-5', emoji: '🍑' },
  { name: 'Turquesa', hex: '#0891b2', fillLight: '#cffafe', stroke: '#0891b2', gradientId: 'grad-ave-6', emoji: '💎' },
  { name: 'Rosa Bebê', hex: '#db2777', fillLight: '#fce7f3', stroke: '#db2777', gradientId: 'grad-ave-7', emoji: '🎀' },
  { name: 'Verde Folha', hex: '#0d9488', fillLight: '#ccfbf1', stroke: '#0d9488', gradientId: 'grad-ave-8', emoji: '🌿' },
  { name: 'Dourado Luz', hex: '#ca8a04', fillLight: '#fef9c3', stroke: '#ca8a04', gradientId: 'grad-ave-9', emoji: '✨' },
];

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
        fruit: 'Pureza de coração e amor à Igreja'
      },
      {
        number: 5,
        title: 'O Menino Jesus Encontrado no Templo',
        kidsExplanation: 'Aos doze anos, Jesus conversa com os doutores da Lei no Templo de Jerusalém, ensinando as coisas mais lindas sobre Deus com muita sabedoria!',
        audioSrc: '/terco-kids/gozoso-5.mp3',
        fruit: 'Buscar Jesus e escutar Seus ensinamentos'
      }
    ]
  },
  {
    id: 'dolorosos',
    name: 'Mistérios Dolorosos',
    badgeEmoji: '❤️‍🔥',
    themeColor: '#E53E3E',
    daysDescription: 'Terça-feira e Sexta-feira',
    days: [2, 5],
    introAudio: '/terco-kids/intro-dolorosos.mp3',
    mysteries: [
      {
        number: 1,
        title: 'A Oração de Jesus no Horto das Oliveiras',
        kidsExplanation: 'No jardim do Getsêmani, Jesus reza com muito amor por todos nós e diz ao Pai do Céu: "Pai, faça-se a Tua santa vontade!"',
        audioSrc: '/terco-kids/doloroso-1.mp3',
        fruit: 'Rezar sempre com confiança'
      },
      {
        number: 2,
        title: 'A Flagelação de Nosso Senhor Jesus Cristo',
        kidsExplanation: 'Jesus sofre por amor infinito a cada um de nós, ensinando-nos o valor de um coração paciente e perdoador.',
        audioSrc: '/terco-kids/doloroso-2.mp3',
        fruit: 'Paciência e pureza nos pensamentos'
      },
      {
        number: 3,
        title: 'A Coroação de Espinhos de Jesus',
        kidsExplanation: 'Os soldados colocam uma coroa de espinhos na cabecinha de Jesus, mas Ele é o verdadeiro Rei do Céu e da Terra, o Rei do Amor!',
        audioSrc: '/terco-kids/doloroso-3.mp3',
        fruit: 'Humildade e bondade com todos'
      },
      {
        number: 4,
        title: 'Jesus Carrega a Pesada Cruz',
        kidsExplanation: 'Jesus abraça a pesada cruz a caminho do Calvário. No caminho, Ele encontra Sua Mãezinha Maria que Lhe dá consolo e força!',
        audioSrc: '/terco-kids/doloroso-4.mp3',
        fruit: 'Ajudar os amigos em suas dificuldades'
      },
      {
        number: 5,
        title: 'A Crucificação e Morte de Jesus',
        kidsExplanation: 'No alto da Cruz, Jesus nos entrega Nossa Senhora por Mãe dizendo: "Eis aí a tua Mãe!" Ele abre as portas do Céu com Seu amor infinito!',
        audioSrc: '/terco-kids/doloroso-5.mp3',
        fruit: 'Perdoar de coração e amar a Mãezinha do Céu'
      }
    ]
  },
  {
    id: 'gloriosos',
    name: 'Mistérios Gloriosos',
    badgeEmoji: '👑',
    themeColor: '#D69E2E',
    daysDescription: 'Quarta-feira e Domingo',
    days: [0, 3],
    introAudio: '/terco-kids/intro-gloriosos.mp3',
    mysteries: [
      {
        number: 1,
        title: 'A Ressurreição Gloriosa de Jesus',
        kidsExplanation: 'No terceiro dia, a pedra do túmulo se abre e Jesus ressuscita cheio de luz e glória! Ele venceu a morte e vive para sempre conosco!',
        audioSrc: '/terco-kids/glorioso-1.mp3',
        fruit: 'Fé viva e alegria que nunca acaba'
      },
      {
        number: 2,
        title: 'A Ascensão Admirável de Jesus ao Céu',
        kidsExplanation: 'Quarenta dias depois, diante dos Apóstolos e de Maria, Jesus sobe aos Céus em uma nuvem luminosa para nos preparar um lugar lindo!',
        audioSrc: '/terco-kids/glorioso-2.mp3',
        fruit: 'Desejo do Céu e esperança'
      },
      {
        number: 3,
        title: 'A Vinda do Espírito Santo em Pentecostes',
        kidsExplanation: 'No Cenáculo com Maria reunida em oração, o Espírito Santo desce como línguas de fogo e vento forte, enchendo os corações de coragem e amor!',
        audioSrc: '/terco-kids/glorioso-3.mp3',
        fruit: 'Amor a Deus e os 7 dons do Espírito Santo'
      },
      {
        number: 4,
        title: 'A Assunção de Nossa Senhora ao Céu',
        kidsExplanation: 'Os anjinhos descem do Céu e levam Nossa Senhora em corpo e alma para os braços de Jesus, cercada de flores celestiais!',
        audioSrc: '/terco-kids/glorioso-4.mp3',
        fruit: 'Confiança na intercessão de Maria'
      },
      {
        number: 5,
        title: 'A Coroação de Maria como Rainha do Céu',
        kidsExplanation: 'A Santíssima Trindade coroa Nossa Senhora com doze estrelas brilhantes como Rainha de todo o Universo e Protetora dos pequeninos!',
        audioSrc: '/terco-kids/glorioso-5.mp3',
        fruit: 'Devoção filial e entrega total a Maria'
      }
    ]
  },
  {
    id: 'luminosos',
    name: 'Mistérios Luminosos',
    badgeEmoji: '💡',
    themeColor: '#38A169',
    daysDescription: 'Quinta-feira',
    days: [4],
    introAudio: '/terco-kids/intro-luminosos.mp3',
    mysteries: [
      {
        number: 1,
        title: 'O Batismo de Jesus no Rio Jordão',
        kidsExplanation: 'São João Batista batiza Jesus no rio Jordão. O céu se abre, o Espírito Santo desce como pomba e a voz do Pai diz: "Este é meu Filho muito amado!"',
        audioSrc: '/terco-kids/luminoso-1.mp3',
        fruit: 'Viver a graça e pureza do nosso Batismo'
      },
      {
        number: 2,
        title: 'As Bodas de Caná e o Primeiro Milagre',
        kidsExplanation: 'Na festa de casamento, Nossa Senhora percebe que o vinho acabou e diz a Jesus. Maria pede aos garçons: "Fazei tudo o que Ele vos disser!" E a água vira vinho excelente!',
        audioSrc: '/terco-kids/luminoso-2.mp3',
        fruit: 'Obediência aos pedidos da Mãezinha'
      },
      {
        number: 3,
        title: 'O Anúncio do Reino de Deus e Conversão',
        kidsExplanation: 'Jesus caminha pelas cidades curando os doentinhos, acolhendo as criancinhas e anunciando que o Reino dos Céus é para os corações bons e humildes!',
        audioSrc: '/terco-kids/luminoso-3.mp3',
        fruit: 'Confissão frequente e coração bondoso'
      },
      {
        number: 4,
        title: 'A Transfiguração de Jesus no Monte Tabor',
        kidsExplanation: 'No alto do monte Tabor, as roupinhas de Jesus ficam brilhando como a luz do sol, mais brancas que a neve, revelando Sua glória divina aos apóstolos!',
        audioSrc: '/terco-kids/luminoso-4.mp3',
        fruit: 'Vida de oração diária e comunhão com Deus'
      },
      {
        number: 5,
        title: 'A Instituição da Santíssima Eucaristia',
        kidsExplanation: 'Na Última Ceia, Jesus pega o pão e o cálice e nos dá Seu verdadeiro Corpo e Sangue no Santíssimo Sacramento! Ele fica para sempre na Hóstia Santa por nós!',
        audioSrc: '/terco-kids/luminoso-5.mp3',
        fruit: 'Amor fervoroso à Santa Missa e adoração'
      }
    ]
  }
];

/* ============================================================================
   AVATARES ILUSTRADOS DA MÃEZINHA DO CÉU
   ============================================================================ */
const AVATAR_IMAGES = {
  sorrindo: '/terco-kids/SORINDO-NORMAL.png',
  falando: '/terco-kids/FALANDO.png',
  ensinando: '/terco-kids/ENSINANDO.png'
};

/* ============================================================================
   TEXTOS DAS ORAÇÕES
   ============================================================================ */
const PRAYERS_TEXT = {
  credo: "Em nome do Pai, do Filho e do Espírito Santo. Amém! [...] Creio em Deus Pai Todo-Poderoso, [...] Criador do céu e da terra; [...] e em Jesus Cristo, seu único Filho, Nosso Senhor; [...] que foi concebido pelo poder do Espírito Santo; [...] nasceu da Virgem Maria; [...] padeceu sob Pôncio Pilatos; [...] foi crucificado, morto e sepultado; [...] desceu à mansão dos mortos; [...] ressuscitou ao terceiro dia; [...] subiu aos céus, [...] está sentado à direita de Deus Pai Todo-Poderoso, [...] donde há de vir a julgar os vivos e os mortos. [...] Creio no Espírito Santo; [...] na Santa Igreja Católica; [...] na comunhão dos santos; [...] na remissão dos pecados; [...] na ressurreição da carne; [...] na vida eterna. Amém!",
  paiNosso: "Pai Nosso que estais no céu, [...] santificado seja o vosso Nome; [...] venha a nós o vosso Reino; [...] seja feita a vossa vontade, [...] assim na terra como no céu. [...] O pão nosso de cada dia nos dai hoje; [...] perdoai-nos as nossas ofensas, [...] assim como nós perdoamos a quem nos tem ofendido; [...] e não nos deixeis cair em tentação, [...] mas livrai-nos do mal. Amém!",
  aveMaria: "Ave Maria, cheia de graça, [...] o Senhor é convosco; [...] bendita sois vós entre as mulheres, [...] e bendito é o fruto do vosso ventre, Jesus. [...] Santa Maria, Mãe de Deus, [...] rogai por nós, pecadores, [...] agora e na hora da nossa morte. Amém!",
  gloria: "Glória ao Pai, ao Filho e ao Espírito Santo. [...] Como era no princípio, agora e sempre. Amém! [...] Ó meu Jesus, perdoai-nos, livrai-nos do fogo do inferno, [...] levai as almas todas para o céu [...] e socorrei principalmente as que mais precisarem. Amém!",
  salveRainha: "Salve, Rainha, Mãe de misericórdia, [...] vida, doçura e esperança nossa, salve! [...] A vós bradamos os degredados filhos de Eva. [...] A vós suspiramos, gemendo e chorando neste vale de lágrimas. [...] Eia, pois, advogada nossa, [...] esses vossos olhos misericordiosos a nós volvei, [...] e depois deste desterro mostrai-nos Jesus, [...] bendito fruto do vosso ventre, [...] ó clemente, ó piedosa, ó doce sempre Virgem Maria. [...] Rogai por nós, Santa Mãe de Deus, [...] para que sejamos dignos das promessas de Cristo. Amém!",
  santoAnjo: "Santo Anjo do Senhor, [...] meu zeloso guardador, [...] se a ti me confiou a piedade divina, [...] sempre me rege, me guarda, [...] me governa, me ilumina. Amém! [...] Nossa Senhora Rainha da Paz, rogai por nós e pelas nossas famílias!"
};

/* ============================================================================
   EFEITO SONORO NATIVO DE SININHO CELESTIAL AO TOCAR NA CONTA (WEB AUDIO API)
   ============================================================================ */
function playBeadClickSound() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime); // Tom A5
    osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.15); // A6
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.25);
  } catch {
    // Silencioso se navegador bloquear autoplay de áudio
  }
}

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
    beadId: 'bead-cross'
  });

  // 2. Sinal da Cruz e Credo (Crucifixo)
  steps.push({
    id: 'credo',
    title: 'Sinal da Cruz e o Santo Credo',
    subtitle: 'Na Cruz do nosso Terço, professamos nossa fé em Deus Pai',
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
    beadId: 'bead-pn-intro'
  });

  // 4. 3 Ave-Marias Iniciais (Fé, Esperança e Caridade)
  steps.push({
    id: 'ave-maria-intro-1',
    title: '1ª Ave-Maria: Virtude da Fé',
    subtitle: 'Para termos um coração que confia sempre em Jesus',
    category: 'ave-maria',
    audioSrc: '/terco-kids/ave-maria.mp3',
    state: 'falando',
    text: PRAYERS_TEXT.aveMaria,
    beadId: 'bead-ave-intro-1'
  });

  steps.push({
    id: 'ave-maria-intro-2',
    title: '2ª Ave-Maria: Virtude da Esperança',
    subtitle: 'Para esperar com alegria nas promessas de Deus',
    category: 'ave-maria',
    audioSrc: '/terco-kids/ave-maria-2.mp3',
    state: 'falando',
    text: PRAYERS_TEXT.aveMaria,
    beadId: 'bead-ave-intro-2'
  });

  steps.push({
    id: 'ave-maria-intro-3',
    title: '3ª Ave-Maria: Virtude da Caridade',
    subtitle: 'Para amarmos com carinho todos os nossos irmãos',
    category: 'ave-maria',
    audioSrc: '/terco-kids/ave-maria.mp3',
    state: 'falando',
    text: PRAYERS_TEXT.aveMaria,
    beadId: 'bead-ave-intro-3'
  });

  // 5. Glória ao Pai Inicial
  steps.push({
    id: 'gloria-intro',
    title: 'Glória ao Pai Inicial',
    subtitle: 'Louvor à Santíssima Trindade antes da Medalha',
    category: 'gloria',
    audioSrc: '/terco-kids/gloria-ao-pai.mp3',
    state: 'falando',
    text: PRAYERS_TEXT.gloria,
    beadId: 'bead-gloria-intro'
  });

  // 6. Os 5 Mistérios com suas 10 Ave-Marias e Glória
  mysteryGroup.mysteries.forEach((mystery, decIdx) => {
    // 6.1 Anúncio do Mistério
    steps.push({
      id: `misterio-${decIdx + 1}-anuncio`,
      title: `${mystery.number}º Mistério: ${mystery.title}`,
      subtitle: `Meditação infantil: ${mystery.fruit}`,
      category: 'misterio',
      mysteryNumber: mystery.number,
      decadeIndex: decIdx,
      audioSrc: mystery.audioSrc,
      state: 'ensinando',
      text: `${mystery.kidsExplanation} [...] Fruto do mistério para o seu coração: ${mystery.fruit}`,
      fruit: mystery.fruit,
      beadId: `bead-dec-${decIdx}-pn`
    });

    // 6.2 Pai Nosso da Dezena
    steps.push({
      id: `misterio-${decIdx + 1}-pn`,
      title: `Pai Nosso (${mystery.number}º Mistério)`,
      subtitle: 'Rezando juntos o Pai Nosso da dezena',
      category: 'pai-nosso',
      mysteryNumber: mystery.number,
      decadeIndex: decIdx,
      audioSrc: '/terco-kids/pai-nosso.mp3',
      state: 'falando',
      text: PRAYERS_TEXT.paiNosso,
      beadId: `bead-dec-${decIdx}-pn`
    });

    // 6.3 10 Ave-Marias da Dezena
    for (let aveIdx = 1; aveIdx <= 10; aveIdx++) {
      steps.push({
        id: `misterio-${decIdx + 1}-ave-${aveIdx}`,
        title: `${aveIdx}ª Ave-Maria (${mystery.number}º Mistério)`,
        subtitle: `Rosa ${aveIdx}/10 ofertada à Mãezinha do Céu 🌸`,
        category: 'ave-maria',
        mysteryNumber: mystery.number,
        decadeIndex: decIdx,
        beadIndex: aveIdx,
        audioSrc: aveIdx % 2 === 0 ? '/terco-kids/ave-maria-2.mp3' : '/terco-kids/ave-maria.mp3',
        state: 'falando',
        text: PRAYERS_TEXT.aveMaria,
        beadId: `bead-dec-${decIdx}-ave-${aveIdx}`
      });
    }

    // 6.4 Glória ao Pai e Jaculatória
    steps.push({
      id: `misterio-${decIdx + 1}-gloria`,
      title: `Glória ao Pai (${mystery.number}º Mistério)`,
      subtitle: 'Glória e Oração de Fátima (Ó meu Jesus...)',
      category: 'gloria',
      mysteryNumber: mystery.number,
      decadeIndex: decIdx,
      audioSrc: decIdx % 2 === 0 ? '/terco-kids/gloria-ao-pai.mp3' : '/terco-kids/gloria-ao-pai-2.mp3',
      state: 'falando',
      text: PRAYERS_TEXT.gloria,
      beadId: `bead-dec-${decIdx}-gloria`
    });
  });

  // 7. Encerramento na Medalha: Salve Rainha e Bênção
  steps.push({
    id: 'salve-rainha',
    title: 'Salve Rainha na Medalha de Nossa Senhora',
    subtitle: 'Consagração final à Mãezinha do Céu',
    category: 'final',
    audioSrc: '/terco-kids/santo-anjo.mp3',
    state: 'sorrindo',
    text: PRAYERS_TEXT.salveRainha,
    beadId: 'bead-medal'
  });

  // 8. Oração ao Santo Anjo da Guarda e Parabéns
  steps.push({
    id: 'final-blessing',
    title: 'Parabéns! Terço Concluído com Amor! 🌟',
    subtitle: 'Oração ao Santo Anjo e Bênção de Jesus e Maria',
    category: 'final',
    audioSrc: '/terco-kids/santo-anjo.mp3',
    state: 'sorrindo',
    text: "Parabéns, meu querido amiguinho! [...] Você concluiu o Santo Terço com muito amor no coração! [...] Jesus e Nossa Senhora estão muito felizes com a sua oração! [...] Vamos pedir a proteção do nosso Anjo da Guarda: [...] " + PRAYERS_TEXT.santoAnjo,
    beadId: 'bead-medal'
  });

  return steps;
}

/* ============================================================================
   CÁLCULO DAS COORDENADAS DA TRILHA COMPLETA DO TERÇO (INFOGRÁFICO INTERATIVO)
   ============================================================================ */
function generateRosaryTrailBeads(): { beads: RosaryTrailBead[]; cordPath: string; stemPath: string } {
  const beads: RosaryTrailBead[] = [];

  // Dimensões do viewBox: 860 x 1120
  const cx = 430;
  const cy = 350;
  const rx = 285;
  const ry = 225;

  // 1. HASTE VERTICAL (Crucifixo até a Medalha)
  // Crucifixo na base
  beads.push({
    id: 'bead-cross',
    x: 430,
    y: 1010,
    radius: 24,
    type: 'cross',
    tooltip: 'Crucifixo: Sinal da Cruz e Santo Credo'
  });

  // Pai Nosso Inicial
  beads.push({
    id: 'bead-pn-intro',
    x: 430,
    y: 900,
    radius: 17,
    type: 'pn-intro',
    label: 'PN',
    tooltip: 'Pai Nosso Inicial'
  });

  // 3 Ave-Marias Iniciais
  beads.push({
    id: 'bead-ave-intro-1',
    x: 430,
    y: 840,
    radius: 12,
    type: 'ave-intro',
    colorName: 'Fé',
    colorHex: PASTEL_BEAD_THEMES[0].hex,
    gradientId: PASTEL_BEAD_THEMES[0].gradientId,
    label: '1',
    tooltip: '1ª Ave-Maria: Virtude da Fé'
  });

  beads.push({
    id: 'bead-ave-intro-2',
    x: 430,
    y: 790,
    radius: 12,
    type: 'ave-intro',
    colorName: 'Esperança',
    colorHex: PASTEL_BEAD_THEMES[1].hex,
    gradientId: PASTEL_BEAD_THEMES[1].gradientId,
    label: '2',
    tooltip: '2ª Ave-Maria: Virtude da Esperança'
  });

  beads.push({
    id: 'bead-ave-intro-3',
    x: 430,
    y: 740,
    radius: 12,
    type: 'ave-intro',
    colorName: 'Caridade',
    colorHex: PASTEL_BEAD_THEMES[2].hex,
    gradientId: PASTEL_BEAD_THEMES[2].gradientId,
    label: '3',
    tooltip: '3ª Ave-Maria: Virtude da Caridade'
  });

  // Glória Inicial
  beads.push({
    id: 'bead-gloria-intro',
    x: 430,
    y: 685,
    radius: 9,
    type: 'gloria-intro',
    tooltip: 'Glória ao Pai Inicial'
  });

  // 2. MEDALHA CENTRAL DE NOSSA SENHORA
  beads.push({
    id: 'bead-medal',
    x: 430,
    y: 610,
    radius: 28,
    type: 'medal',
    tooltip: 'Medalha de Nossa Senhora (Salve Rainha)'
  });

  // 3. O GRANDE CÍRCULO DAS 5 DEZENAS (60 nós ao todo)
  const loopCoords: { x: number; y: number }[] = [];

  for (let dec = 0; dec < 5; dec++) {
    const startAngle = 18 + dec * 64.8;

    // Pai Nosso da Dezena (Bola Grande)
    const pnRad = (startAngle * Math.PI) / 180;
    const pnx = +(cx + rx * Math.sin(pnRad)).toFixed(1);
    const pny = +(cy + ry * Math.cos(pnRad)).toFixed(1);

    beads.push({
      id: `bead-dec-${dec}-pn`,
      x: pnx,
      y: pny,
      radius: 17,
      type: 'pn-decade',
      decadeIndex: dec,
      label: `${dec + 1}º`,
      tooltip: `${dec + 1}ª Dezena: Pai Nosso e Anúncio do Mistério`
    });
    loopCoords.push({ x: pnx, y: pny });

    // 10 Ave-Marias da Dezena (Bolinhas Coloridas)
    for (let ave = 1; ave <= 10; ave++) {
      const angle = startAngle + 5.5 + (ave - 1) * 4.6;
      const aveRad = (angle * Math.PI) / 180;
      const aveX = +(cx + rx * Math.sin(aveRad)).toFixed(1);
      const aveY = +(cy + ry * Math.cos(aveRad)).toFixed(1);
      const theme = PASTEL_BEAD_THEMES[(ave - 1) % PASTEL_BEAD_THEMES.length];

      beads.push({
        id: `bead-dec-${dec}-ave-${ave}`,
        x: aveX,
        y: aveY,
        radius: 11,
        type: 'ave-decade',
        decadeIndex: dec,
        aveIndex: ave,
        colorName: theme.name,
        colorHex: theme.hex,
        gradientId: theme.gradientId,
        label: `${ave}`,
        tooltip: `${ave}ª Ave-Maria (${dec + 1}º Mistério)`
      });
      loopCoords.push({ x: aveX, y: aveY });
    }

    // Glória ao Pai da Dezena (Bolinha separadora vermelha)
    const gloriaAngle = startAngle + 55;
    const gloriaRad = (gloriaAngle * Math.PI) / 180;
    const gx = +(cx + rx * Math.sin(gloriaRad)).toFixed(1);
    const gy = +(cy + ry * Math.cos(gloriaRad)).toFixed(1);

    beads.push({
      id: `bead-dec-${dec}-gloria`,
      x: gx,
      y: gy,
      radius: 9,
      type: 'gloria-decade',
      decadeIndex: dec,
      tooltip: `Glória ao Pai da ${dec + 1}ª Dezena e Jaculatória de Fátima`
    });
    loopCoords.push({ x: gx, y: gy });
  }

  // Caminho do cordão: Haste e Círculo do Colar
  const stemPath = `M 430,970 L 430,645`;
  const medalTop = `430,578`;
  const loopPathPoints = loopCoords.map(p => `${p.x},${p.y}`).join(' L ');
  const cordPath = `M ${medalTop} L ${loopPathPoints} Z`;

  return { beads, cordPath, stemPath };
}

/* ============================================================================
   COMPONENTE PRINCIPAL: SANTO TERÇO KIDS (TRILHA VISUAL COMPLETA)
   ============================================================================ */
export const SantoTercoKids: React.FC<{ onSwitchToAdult?: () => void }> = ({ onSwitchToAdult }) => {
  const getTodayMysteryId = (): MysteryGroupKids => {
    const day = new Date().getDay();
    const found = KIDS_MYSTERY_GROUPS.find((g) => g.days.includes(day));
    return found ? found.id : 'gloriosos';
  };

  const [selectedGroup, setSelectedGroup] = useState<MysteryGroupKids>(getTodayMysteryId);
  const activeGroup = useMemo(() => {
    return KIDS_MYSTERY_GROUPS.find((g) => g.id === selectedGroup)!;
  }, [selectedGroup]);

  const steps = useMemo(() => {
    return buildPrayerSteps(activeGroup);
  }, [activeGroup]);

  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const currentStep = steps[currentStepIndex] || steps[0];

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [autoAdvance, setAutoAdvance] = useState<boolean>(true);
  const [activePhraseIndex, setActivePhraseIndex] = useState<number>(0);
  const [audioProgress, setAudioProgress] = useState<number>(0);
  const [isSpeechFallback, setIsSpeechFallback] = useState<boolean>(false);
  const [avatarStateOverride, setAvatarStateOverride] = useState<AvatarState | null>(null);
  const [hoveredBeadTooltip, setHoveredBeadTooltip] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const preloaderRef = useRef<HTMLAudioElement | null>(null);
  const progressIntervalRef = useRef<any>(null);

  const rosaryTrail = useMemo(() => generateRosaryTrailBeads(), []);

  // Avatar atual
  const currentAvatarState: AvatarState = useMemo(() => {
    if (avatarStateOverride) return avatarStateOverride;
    if (isPlaying) return 'falando';
    return currentStep.state || 'sorrindo';
  }, [avatarStateOverride, isPlaying, currentStep.state]);

  // Divide o texto em frases para leitura pausada
  const phrases = useMemo(() => {
    return currentStep.text
      .split(/\[\.\.\.\]/g)
      .map((p) => p.trim())
      .filter((p) => p.length > 0);
  }, [currentStep.text]);

  // Inicializa elemento de áudio
  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'auto';
    audioRef.current = audio;

    const preloader = new Audio();
    preloaderRef.current = preloader;

    return () => {
      audio.pause();
      audio.src = '';
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    };
  }, []);

  // Pré-carrega o próximo áudio
  useEffect(() => {
    const nextStep = steps[currentStepIndex + 1];
    if (nextStep && preloaderRef.current && nextStep.audioSrc) {
      preloaderRef.current.src = nextStep.audioSrc;
    }
  }, [currentStepIndex, steps]);

  // Fala nativa via Web Speech API
  const speakWithSynthesis = useCallback((textToSpeak: string, onEnd?: () => void) => {
    if (!('speechSynthesis' in window)) {
      if (onEnd) onEnd();
      return;
    }
    window.speechSynthesis.cancel();
    setIsSpeechFallback(true);

    const cleanText = textToSpeak.replace(/\[\.\.\.\]/g, ', ');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'pt-BR';
    utterance.rate = 0.88; // Ritmo mais calmo e doce para crianças
    utterance.pitch = 1.15; // Tom meigo

    utterance.onend = () => {
      setIsSpeechFallback(false);
      if (onEnd) onEnd();
    };

    utterance.onerror = () => {
      setIsSpeechFallback(false);
      if (onEnd) onEnd();
    };

    window.speechSynthesis.speak(utterance);
  }, []);

  // Para áudios em andamento
  const stopAllAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }
    setIsPlaying(false);
    setIsSpeechFallback(false);
    setAudioProgress(0);
  }, []);

  // Avançar passo
  const goToNextStep = useCallback(() => {
    stopAllAudio();
    playBeadClickSound();
    setCurrentStepIndex((prev) => {
      if (prev < steps.length - 1) return prev + 1;
      return prev;
    });
    setActivePhraseIndex(0);
  }, [steps.length, stopAllAudio]);

  // Voltar passo
  const goToPrevStep = useCallback(() => {
    stopAllAudio();
    playBeadClickSound();
    setCurrentStepIndex((prev) => (prev > 0 ? prev - 1 : 0));
    setActivePhraseIndex(0);
  }, [stopAllAudio]);

  // Pular para conta clicada
  const jumpToBead = useCallback((beadId: string) => {
    stopAllAudio();
    playBeadClickSound();

    // Acha o passo correspondente a essa conta
    const targetIdx = steps.findIndex((s) => s.beadId === beadId);
    if (targetIdx !== -1) {
      setCurrentStepIndex(targetIdx);
      setActivePhraseIndex(0);
    }
  }, [steps, stopAllAudio]);

  // Reproduzir áudio do passo atual
  const playCurrentStepAudio = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isMuted) {
      setIsPlaying(false);
      return;
    }

    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }

    audio.pause();
    audio.src = currentStep.audioSrc;
    audio.currentTime = 0;

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setIsPlaying(true);
          setIsSpeechFallback(false);

          progressIntervalRef.current = setInterval(() => {
            if (audio.duration && !isNaN(audio.duration)) {
              const pct = (audio.currentTime / audio.duration) * 100;
              setAudioProgress(pct);

              if (phrases.length > 0) {
                const phraseIdx = Math.min(
                  Math.floor((audio.currentTime / audio.duration) * phrases.length),
                  phrases.length - 1
                );
                setActivePhraseIndex(phraseIdx);
              }
            }
          }, 150);

          audio.onended = () => {
            clearInterval(progressIntervalRef.current);
            setIsPlaying(false);
            setAudioProgress(100);
            if (autoAdvance && currentStepIndex < steps.length - 1) {
              setTimeout(() => {
                goToNextStep();
              }, 800);
            }
          };
        })
        .catch(() => {
          // Fallback para SpeechSynthesis
          setIsPlaying(true);
          speakWithSynthesis(currentStep.text, () => {
            setIsPlaying(false);
            setAudioProgress(100);
            if (autoAdvance && currentStepIndex < steps.length - 1) {
              setTimeout(() => {
                goToNextStep();
              }, 800);
            }
          });
        });
    }
  }, [autoAdvance, currentStep.audioSrc, currentStep.text, currentStepIndex, goToNextStep, isMuted, phrases.length, speakWithSynthesis, steps.length]);

  // Tocar / Pausar
  const togglePlayPause = () => {
    if (isPlaying) {
      stopAllAudio();
    } else {
      playCurrentStepAudio();
    }
  };

  // Reiniciar Terço
  const restartRosary = () => {
    stopAllAudio();
    playBeadClickSound();
    setCurrentStepIndex(0);
    setActivePhraseIndex(0);
  };

  // Percentual de progresso total
  const totalProgressPercent = useMemo(() => {
    if (steps.length <= 1) return 0;
    return Math.round((currentStepIndex / (steps.length - 1)) * 100);
  }, [currentStepIndex, steps.length]);

  // Verifica se uma conta está rezada ou ativa
  const isBeadActive = (beadId: string) => currentStep.beadId === beadId;
  const isBeadCompleted = (beadId: string) => {
    const beadStepIdx = steps.findIndex((s) => s.beadId === beadId);
    return beadStepIdx !== -1 && beadStepIdx < currentStepIndex;
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 py-4 sm:py-6 select-none font-sans text-slate-800 dark:text-amber-50">
      
      {/* 1. TOPO: HEADER LÚDICO COM SELEÇÃO DE MISTÉRIOS */}
      <header className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700/60 text-amber-900 dark:text-amber-200 text-xs sm:text-sm font-bold shadow-sm mb-2">
          <span>✨</span>
          <span>Trilha Interativa de Catequese Infantil</span>
          <span>📿</span>
        </div>

        <h1 className="text-2xl sm:text-4xl md:text-5xl font-serif font-black text-amber-900 dark:text-amber-300 tracking-tight flex items-center justify-center gap-2">
          <span>🎈</span> Santo Terço Kids <span>🕊️</span>
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-amber-200/80 max-w-2xl mx-auto mt-1">
          Toque em qualquer bolinha do terço para rezar com a Mãezinha do Céu! Acompanhe a trilha passo a passo com cores alegres e meditações.
        </p>

        {/* SELETOR DOS 4 MISTÉRIOS COM DESTAQUE PARA O DIA DE HOJE */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
          {KIDS_MYSTERY_GROUPS.map((group) => {
            const isToday = group.days.includes(new Date().getDay());
            const isSelected = selectedGroup === group.id;

            return (
              <button
                key={group.id}
                type="button"
                onClick={() => {
                  stopAllAudio();
                  playBeadClickSound();
                  setSelectedGroup(group.id);
                  setCurrentStepIndex(0);
                  setActivePhraseIndex(0);
                }}
                className={`px-3.5 py-2 rounded-2xl text-xs sm:text-sm font-bold transition-all duration-300 flex items-center gap-1.5 cursor-pointer border ${
                  isSelected
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white border-amber-500 shadow-md scale-105'
                    : 'bg-white/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-amber-200/60 dark:border-slate-700 hover:bg-amber-50'
                }`}
              >
                <span>{group.badgeEmoji}</span>
                <span>{group.name}</span>
                {isToday && (
                  <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-white/20 text-white font-extrabold">
                    Hoje!
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </header>

      {/* 2. BARRA SUPERIOR DE PROGRESSO E STATUS */}
      <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-3xl p-4 shadow-md border border-amber-200/70 dark:border-slate-800 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300">
              <Sparkles className="w-4 h-4 animate-spin text-amber-600" />
            </span>
            <div>
              <p className="font-extrabold text-amber-950 dark:text-amber-200">
                {currentStep.title}
              </p>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
                {currentStep.subtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="font-bold text-amber-700 dark:text-amber-300 text-xs sm:text-sm">
                Passo {currentStepIndex + 1} de {steps.length}
              </span>
              <span className="text-xs text-slate-400 block">({totalProgressPercent}% concluído)</span>
            </div>
            {onSwitchToAdult && (
              <button
                type="button"
                onClick={onSwitchToAdult}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition-colors"
              >
                Modo Adulto
              </button>
            )}
          </div>
        </div>

        {/* Linha colorida de progresso */}
        <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full mt-3 overflow-hidden p-0.5">
          <div
            className="h-full bg-gradient-to-r from-amber-400 via-rose-400 to-emerald-400 rounded-full transition-all duration-500 shadow-sm"
            style={{ width: `${Math.max(totalProgressPercent, 3)}%` }}
          />
        </div>
      </div>

      {/* 3. CORPO PRINCIPAL: TRILHA VISUAL DO TERÇO (ESQUERDA) + GUIA COM NOSSA SENHORA (DIREITA) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* COLUNA DA ESQUERDA: O TERÇO COMPLETO INTERATIVO (INFOGRÁFICO EM SVG) */}
        <div className="lg:col-span-7 xl:col-span-8 bg-gradient-to-b from-sky-50/50 via-amber-50/30 to-purple-50/40 dark:from-slate-900/60 dark:to-slate-950 rounded-3xl p-3 sm:p-5 shadow-lg border-2 border-amber-200/60 dark:border-slate-800 relative overflow-hidden flex flex-col items-center">
          
          {/* Fundo decorativo com nuvens e estrelas */}
          <div className="absolute top-3 left-4 text-sky-200 dark:text-slate-800 text-2xl select-none pointer-events-none">☁️</div>
          <div className="absolute top-10 right-8 text-sky-200 dark:text-slate-800 text-3xl select-none pointer-events-none">☁️</div>
          <div className="absolute bottom-20 left-6 text-amber-200 dark:text-slate-800 text-xl select-none pointer-events-none">⭐</div>
          <div className="absolute bottom-16 right-8 text-amber-200 dark:text-slate-800 text-2xl select-none pointer-events-none">🌟</div>

          {/* Dica de clique para a criança */}
          <div className="w-full flex items-center justify-between px-2 mb-2 z-10 text-xs font-bold text-amber-800 dark:text-amber-200">
            <span className="flex items-center gap-1 bg-amber-100/80 dark:bg-amber-950/80 px-3 py-1 rounded-full border border-amber-200 dark:border-amber-800">
              👉 Toque em qualquer conta para rezar!
            </span>
            {hoveredBeadTooltip && (
              <span className="hidden sm:inline-block bg-white dark:bg-slate-800 px-3 py-1 rounded-full shadow text-amber-900 dark:text-amber-200 border border-amber-300">
                {hoveredBeadTooltip}
              </span>
            )}
          </div>

          {/* SVG DO TERÇO COMPLETO */}
          <div className="w-full max-w-[620px] aspect-[860/1120] relative z-10 flex items-center justify-center">
            <svg
              viewBox="0 0 860 1120"
              className="w-full h-full drop-shadow-md select-none"
              style={{ overflow: 'visible' }}
            >
              <defs>
                {/* Sombra suave das contas */}
                <filter id="beadShadow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.25" floodColor="#78350f" />
                </filter>

                {/* Brilho da conta ativa */}
                <filter id="activeGlow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="6" result="blur" />
                  <feComponentTransfer in="blur" result="glow">
                    <feFuncA type="linear" slope="2" />
                  </feComponentTransfer>
                  <feMerge>
                    <feMergeNode in="glow" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>

                {/* Gradiente Dourado Real (Pai Nosso) */}
                <radialGradient id="goldBeadGrad" cx="35%" cy="35%" r="65%">
                  <stop offset="0%" stopColor="#fef08a" />
                  <stop offset="45%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#b45309" />
                </radialGradient>

                {/* Gradiente Rubi (Glória ao Pai) */}
                <radialGradient id="rubyBeadGrad" cx="35%" cy="35%" r="65%">
                  <stop offset="0%" stopColor="#fca5a5" />
                  <stop offset="50%" stopColor="#ef4444" />
                  <stop offset="100%" stopColor="#991b1b" />
                </radialGradient>

                {/* 10 Gradientes Pastéis para as Ave-Marias */}
                <radialGradient id="grad-ave-0" cx="35%" cy="35%" r="65%">
                  <stop offset="0%" stopColor="#ffe4e6" /><stop offset="60%" stopColor="#fda4af" /><stop offset="100%" stopColor="#f43f5e" />
                </radialGradient>
                <radialGradient id="grad-ave-1" cx="35%" cy="35%" r="65%">
                  <stop offset="0%" stopColor="#e0f2fe" /><stop offset="60%" stopColor="#7dd3fc" /><stop offset="100%" stopColor="#0284c7" />
                </radialGradient>
                <radialGradient id="grad-ave-2" cx="35%" cy="35%" r="65%">
                  <stop offset="0%" stopColor="#fef3c7" /><stop offset="60%" stopColor="#fcd34d" /><stop offset="100%" stopColor="#d97706" />
                </radialGradient>
                <radialGradient id="grad-ave-3" cx="35%" cy="35%" r="65%">
                  <stop offset="0%" stopColor="#d1fae5" /><stop offset="60%" stopColor="#6ee7b7" /><stop offset="100%" stopColor="#059669" />
                </radialGradient>
                <radialGradient id="grad-ave-4" cx="35%" cy="35%" r="65%">
                  <stop offset="0%" stopColor="#ede9fe" /><stop offset="60%" stopColor="#c4b5fd" /><stop offset="100%" stopColor="#7c3aed" />
                </radialGradient>
                <radialGradient id="grad-ave-5" cx="35%" cy="35%" r="65%">
                  <stop offset="0%" stopColor="#ffedd5" /><stop offset="60%" stopColor="#fdba74" /><stop offset="100%" stopColor="#ea580c" />
                </radialGradient>
                <radialGradient id="grad-ave-6" cx="35%" cy="35%" r="65%">
                  <stop offset="0%" stopColor="#cffafe" /><stop offset="60%" stopColor="#67e8f9" /><stop offset="100%" stopColor="#0891b2" />
                </radialGradient>
                <radialGradient id="grad-ave-7" cx="35%" cy="35%" r="65%">
                  <stop offset="0%" stopColor="#fce7f3" /><stop offset="60%" stopColor="#f472b6" /><stop offset="100%" stopColor="#db2777" />
                </radialGradient>
                <radialGradient id="grad-ave-8" cx="35%" cy="35%" r="65%">
                  <stop offset="0%" stopColor="#ccfbf1" /><stop offset="60%" stopColor="#5eead4" /><stop offset="100%" stopColor="#0d9488" />
                </radialGradient>
                <radialGradient id="grad-ave-9" cx="35%" cy="35%" r="65%">
                  <stop offset="0%" stopColor="#fef9c3" /><stop offset="60%" stopColor="#fde047" /><stop offset="100%" stopColor="#ca8a04" />
                </radialGradient>

                {/* Recorte circular para medalha */}
                <clipPath id="medalClip">
                  <ellipse cx="430" cy="610" rx="30" ry="36" />
                </clipPath>
              </defs>

              {/* 1. LINHAS DO CORDÃO (HASTE E CÍRCULO PRINCIPAL) */}
              {/* Cordão da Haste Vertical */}
              <path
                d={rosaryTrail.stemPath}
                fill="none"
                stroke="#d97706"
                strokeWidth="4"
                strokeDasharray="4 3"
                opacity="0.75"
              />

              {/* Cordão do Círculo das 5 Dezenas */}
              <path
                d={rosaryTrail.cordPath}
                fill="none"
                stroke="#d97706"
                strokeWidth="4"
                strokeDasharray="4 3"
                opacity="0.75"
              />

              {/* 2. MEDALHÃO CENTRAL DO MISTÉRIO ATUAL (DENTRO DO CÍRCULO) */}
              <g transform="translate(430, 340)">
                <circle r="120" fill="#ffffff" fillOpacity="0.85" stroke="#fcd34d" strokeWidth="3" className="dark:fill-slate-900/90 dark:stroke-amber-600/50" />
                <circle r="112" fill="none" stroke="#f59e0b" strokeWidth="1" strokeDasharray="5 3" opacity="0.6" />
                
                {/* Ícone e título do mistério */}
                <text y="-50" textAnchor="middle" fontSize="32">
                  {currentStep.mysteryNumber ? '🌟' : '🕊️'}
                </text>
                <text y="-20" textAnchor="middle" fontSize="15" fontWeight="bold" fill="#78350f" className="dark:fill-amber-200">
                  {currentStep.mysteryNumber ? `${currentStep.mysteryNumber}º MISTÉRIO` : 'SANTO TERÇO KIDS'}
                </text>
                <text y="5" textAnchor="middle" fontSize="13" fontWeight="600" fill="#92400e" className="dark:fill-amber-300">
                  {currentStep.mysteryNumber ? activeGroup.mysteries[currentStep.mysteryNumber - 1]?.title.slice(0, 28) + '...' : 'Reze com Nossa Senhora'}
                </text>

                {/* Fruto do Mistério */}
                {currentStep.fruit && (
                  <text y="30" textAnchor="middle" fontSize="11" fontStyle="italic" fill="#047857" className="dark:fill-emerald-300">
                    🌱 Fruto: {currentStep.fruit}
                  </text>
                )}

                {/* Indicador da oração no centro */}
                <rect x="-80" y="45" width="160" height="28" rx="14" fill="#fef3c7" stroke="#f59e0b" strokeWidth="1.5" className="dark:fill-amber-950 dark:stroke-amber-600" />
                <text y="64" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#78350f" className="dark:fill-amber-200">
                  {currentStep.category === 'ave-maria' && currentStep.beadIndex
                    ? `Ave-Maria ${currentStep.beadIndex} / 10 🌸`
                    : currentStep.title.slice(0, 18)}
                </text>
              </g>

              {/* 3. BANNERS DAS 5 DEZENAS NO SVG */}
              <g transform="translate(630, 520)" className="cursor-pointer" onClick={() => jumpToBead('bead-dec-0-pn')}>
                <rect x="-45" y="-12" width="90" height="24" rx="12" fill="#dbeafe" stroke="#3b82f6" strokeWidth="1.5" />
                <text y="4" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#1e40af">1ª Dezena</text>
              </g>
              <g transform="translate(710, 310)" className="cursor-pointer" onClick={() => jumpToBead('bead-dec-1-pn')}>
                <rect x="-45" y="-12" width="90" height="24" rx="12" fill="#dbeafe" stroke="#3b82f6" strokeWidth="1.5" />
                <text y="4" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#1e40af">2ª Dezena</text>
              </g>
              <g transform="translate(430, 95)" className="cursor-pointer" onClick={() => jumpToBead('bead-dec-2-pn')}>
                <rect x="-45" y="-12" width="90" height="24" rx="12" fill="#dbeafe" stroke="#3b82f6" strokeWidth="1.5" />
                <text y="4" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#1e40af">3ª Dezena</text>
              </g>
              <g transform="translate(150, 310)" className="cursor-pointer" onClick={() => jumpToBead('bead-dec-3-pn')}>
                <rect x="-45" y="-12" width="90" height="24" rx="12" fill="#dbeafe" stroke="#3b82f6" strokeWidth="1.5" />
                <text y="4" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#1e40af">4ª Dezena</text>
              </g>
              <g transform="translate(230, 520)" className="cursor-pointer" onClick={() => jumpToBead('bead-dec-4-pn')}>
                <rect x="-45" y="-12" width="90" height="24" rx="12" fill="#dbeafe" stroke="#3b82f6" strokeWidth="1.5" />
                <text y="4" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#1e40af">5ª Dezena</text>
              </g>

              {/* 4. RENDERIZAÇÃO DE TODAS AS CONTAS DO TERÇO */}
              {rosaryTrail.beads.map((bead) => {
                const active = isBeadActive(bead.id);
                const completed = isBeadCompleted(bead.id);

                return (
                  <g
                    key={bead.id}
                    className="cursor-pointer transition-transform duration-200"
                    onClick={() => jumpToBead(bead.id)}
                    onMouseEnter={() => setHoveredBeadTooltip(bead.tooltip)}
                    onMouseLeave={() => setHoveredBeadTooltip(null)}
                  >
                    {/* HALO ANIMADO PARA A CONTA ATIVA */}
                    {active && (
                      <>
                        <circle
                          cx={bead.x}
                          cy={bead.y}
                          r={bead.radius + 12}
                          fill="none"
                          stroke="#f59e0b"
                          strokeWidth="3"
                          opacity="0.8"
                          className="animate-ping"
                        />
                        <circle
                          cx={bead.x}
                          cy={bead.y}
                          r={bead.radius + 7}
                          fill="#fef08a"
                          opacity="0.45"
                          className="animate-pulse"
                        />
                        <text
                          x={bead.x}
                          y={bead.y - bead.radius - 8}
                          textAnchor="middle"
                          fontSize="22"
                          className="animate-bounce"
                        >
                          ⭐
                        </text>
                      </>
                    )}

                    {/* A) CRUCIFIXO */}
                    {bead.type === 'cross' && (
                      <g transform={`translate(${bead.x - 28}, ${bead.y - 42})`}>
                        <rect x="20" y="0" width="16" height="84" rx="4" fill="#1e3a8a" stroke="#f59e0b" strokeWidth="3" filter="url(#beadShadow)" />
                        <rect x="0" y="20" width="56" height="16" rx="4" fill="#1e3a8a" stroke="#f59e0b" strokeWidth="3" />
                        <circle cx="28" cy="28" r="8" fill="#fef08a" opacity="0.8" />
                        <text x="28" y="32" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#1e3a8a">✝️</text>
                        <text x="28" y="98" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#78350f" className="dark:fill-amber-200">
                          Creio / Início
                        </text>
                      </g>
                    )}

                    {/* B) MEDALHA DE NOSSA SENHORA */}
                    {bead.type === 'medal' && (
                      <g>
                        <ellipse
                          cx={bead.x}
                          cy={bead.y}
                          rx={bead.radius}
                          ry={bead.radius + 6}
                          fill="#fef08a"
                          stroke="#d97706"
                          strokeWidth="3.5"
                          filter="url(#beadShadow)"
                        />
                        <image
                          href="/terco-kids/SORINDO-NORMAL.png"
                          x={bead.x - 26}
                          y={bead.y - 30}
                          width="52"
                          height="60"
                          clipPath="url(#medalClip)"
                          preserveAspectRatio="xMidYMid slice"
                        />
                        {/* 12 Estrelas em volta da medalha */}
                        <circle cx={bead.x} cy={bead.y - 36} r="2.5" fill="#ca8a04" />
                        <circle cx={bead.x + 28} cy={bead.y} r="2.5" fill="#ca8a04" />
                        <circle cx={bead.x} cy={bead.y + 36} r="2.5" fill="#ca8a04" />
                        <circle cx={bead.x - 28} cy={bead.y} r="2.5" fill="#ca8a04" />
                      </g>
                    )}

                    {/* C) PAI NOSSO (BOLA GRANDE DOURADA) */}
                    {(bead.type === 'pn-intro' || bead.type === 'pn-decade') && (
                      <g>
                        <circle
                          cx={bead.x}
                          cy={bead.y}
                          r={bead.radius}
                          fill="url(#goldBeadGrad)"
                          stroke="#78350f"
                          strokeWidth="1.5"
                          filter="url(#beadShadow)"
                        />
                        <circle cx={bead.x - 4} cy={bead.y - 4} r={bead.radius * 0.35} fill="#ffffff" opacity="0.6" />
                        <text
                          x={bead.x}
                          y={bead.y + 4}
                          textAnchor="middle"
                          fontSize="10"
                          fontWeight="bold"
                          fill="#78350f"
                        >
                          👑
                        </text>
                      </g>
                    )}

                    {/* D) GLÓRIA AO PAI (BOLINHA VERMELHA SEPARADORA) */}
                    {(bead.type === 'gloria-intro' || bead.type === 'gloria-decade') && (
                      <g>
                        <circle
                          cx={bead.x}
                          cy={bead.y}
                          r={bead.radius}
                          fill="url(#rubyBeadGrad)"
                          stroke="#7f1d1d"
                          strokeWidth="1.2"
                          filter="url(#beadShadow)"
                        />
                        <circle cx={bead.x - 2} cy={bead.y - 2} r={bead.radius * 0.35} fill="#ffffff" opacity="0.6" />
                      </g>
                    )}

                    {/* E) AVE-MARIAS (BOLINHAS COLORIDAS PASTÉIS) */}
                    {(bead.type === 'ave-intro' || bead.type === 'ave-decade') && (
                      <g>
                        <circle
                          cx={bead.x}
                          cy={bead.y}
                          r={bead.radius}
                          fill={`url(#${bead.gradientId || 'grad-ave-0'})`}
                          stroke={bead.colorHex || '#d97706'}
                          strokeWidth="1.5"
                          filter="url(#beadShadow)"
                        />
                        <circle cx={bead.x - 3} cy={bead.y - 3} r={bead.radius * 0.35} fill="#ffffff" opacity="0.65" />
                        
                        {/* Indicador de orado ou número da ave maria */}
                        {completed ? (
                          <text x={bead.x} y={bead.y + 3.5} textAnchor="middle" fontSize="9" fontWeight="bold" fill="#ffffff">
                            ✓
                          </text>
                        ) : (
                          <text x={bead.x} y={bead.y + 3.5} textAnchor="middle" fontSize="8" fontWeight="bold" fill="#ffffff">
                            {bead.label}
                          </text>
                        )}
                      </g>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>

          {/* LEGENDA VISUAL DO TERÇO (INSPIRADA NO POSTER DE CATEQUESE) */}
          <div className="w-full mt-4 bg-white/80 dark:bg-slate-900/80 rounded-2xl p-3 border border-amber-200 dark:border-slate-800 text-xs">
            <p className="font-extrabold text-amber-900 dark:text-amber-200 mb-2 flex items-center gap-1.5">
              <span>📖</span> Legenda das Contas do Terço:
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
              <div className="flex items-center gap-1.5">
                <span className="text-base">✝️</span>
                <span><strong>Crucifixo:</strong> Creio / Começo</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded-full bg-amber-400 border border-amber-600 block shadow-xs" />
                <span><strong>Bola Grande:</strong> Pai Nosso</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded-full bg-rose-400 border border-rose-600 block shadow-xs" />
                <span><strong>Coloridas:</strong> 10 Ave-Marias</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-red-600 border border-red-800 block shadow-xs" />
                <span><strong>Vermelha:</strong> Glória ao Pai</span>
              </div>
            </div>
          </div>
        </div>

        {/* COLUNA DA DIREITA: PERSONAGEM COM BALÃO DE FALA & CONTROLES */}
        <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-5 sticky top-6">
          
          {/* CARTÃO DA GUIA: MÃEZINHA DO CÉU COM BALÃO DE CONVERSA */}
          <div className="bg-gradient-to-b from-amber-50 to-orange-50/40 dark:from-slate-900 dark:to-slate-950 rounded-3xl p-5 shadow-xl border-2 border-amber-200 dark:border-amber-800/60 relative">
            
            {/* AVATAR ILUSTRADO DE NOSSA SENHORA */}
            <div className="flex items-center gap-4 mb-4">
              <div className="relative">
                {/* Halo celestial animado */}
                <div className="absolute -inset-2 bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 rounded-full blur-md opacity-75 animate-pulse" />
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-4 border-amber-300 shadow-lg bg-amber-100 flex items-center justify-center">
                  <img
                    src={AVATAR_IMAGES[currentAvatarState] || AVATAR_IMAGES.sorrindo}
                    alt="Nossa Senhora ensinando a rezar o terço"
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = '/terco-kids/SORINDO-NORMAL.png';
                    }}
                  />
                </div>
                {/* Badge de presença de Nossa Senhora */}
                <div className="absolute -bottom-1 -right-1 bg-amber-500 text-white rounded-full p-1 shadow-md">
                  <Heart className="w-3.5 h-3.5 fill-white" />
                </div>
              </div>

              <div>
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-700 dark:text-amber-300 flex items-center gap-1">
                  <span>👑</span> Mãezinha do Céu
                </span>
                <h3 className="text-lg font-serif font-black text-amber-950 dark:text-amber-100">
                  Nossa Senhora
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {isPlaying ? 'Rezando com você agora... 🕊️' : 'Pronta para rezar com você!'}
                </p>
              </div>
            </div>

            {/* BALÃO DE CONVERSA DINÂMICO (SPEECH BUBBLE) */}
            <div className="relative bg-white/95 dark:bg-slate-850/95 rounded-3xl p-5 shadow-md border-2 border-amber-200 dark:border-slate-700 text-slate-800 dark:text-amber-50">
              
              {/* Cauda do Balão de Fala apontando para o avatar */}
              <div className="absolute -top-3 left-8 w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-b-[14px] border-b-amber-200 dark:border-b-slate-700" />
              <div className="absolute -top-2.5 left-8 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[12px] border-b-white dark:border-b-slate-850" />

              {/* Título da Oração Atual dentro do balão */}
              <div className="flex items-center justify-between mb-2 pb-2 border-b border-amber-100 dark:border-slate-800">
                <span className="text-xs font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1">
                  <span>💬</span> {currentStep.title}
                </span>
                {currentStep.fruit && (
                  <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded-full font-bold">
                    {currentStep.fruit}
                  </span>
                )}
              </div>

              {/* TEXTO DA ORAÇÃO COM FRASES PAUSADAS PARA A CRIANÇA ACOMPANHAR */}
              <div className="space-y-2 text-sm sm:text-base leading-relaxed max-h-[220px] overflow-y-auto pr-1">
                {phrases.map((phrase, idx) => {
                  const isCurrentPhrase = isPlaying && activePhraseIndex === idx;

                  return (
                    <p
                      key={idx}
                      className={`transition-all duration-300 rounded-xl px-2.5 py-1 ${
                        isCurrentPhrase
                          ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-950 dark:text-amber-200 font-bold border-l-4 border-amber-500 scale-[1.02]'
                          : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {phrase}
                    </p>
                  );
                })}
              </div>

              {/* Barra de progresso do áudio dentro do balão */}
              {isPlaying && (
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full transition-all duration-200"
                    style={{ width: `${audioProgress}%` }}
                  />
                </div>
              )}
            </div>

            {/* CONTROLES PRINCIPAIS GRANDES (TOUCH-FRIENDLY PARA CELULARES E TABLETS) */}
            <div className="mt-5 space-y-3">
              
              {/* Botão Gigante de Play/Pausa */}
              <button
                type="button"
                onClick={togglePlayPause}
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-orange-500 text-white font-black text-base shadow-lg shadow-amber-500/30 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 cursor-pointer"
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-6 h-6 fill-white" />
                    <span>Pausar Oração</span>
                  </>
                ) : (
                  <>
                    <Play className="w-6 h-6 fill-white" />
                    <span>Ouvir e Rezar Juntos</span>
                  </>
                )}
              </button>

              {/* Botões de Navegação (Anterior, Repetir, Próxima) */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={goToPrevStep}
                  disabled={currentStepIndex === 0}
                  className="py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-amber-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center gap-1 disabled:opacity-40 hover:bg-amber-50 cursor-pointer shadow-xs"
                >
                  <SkipBack className="w-4 h-4" />
                  <span>Voltar</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    stopAllAudio();
                    playBeadClickSound();
                    setActivePhraseIndex(0);
                    playCurrentStepAudio();
                  }}
                  className="py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-amber-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center gap-1 hover:bg-amber-50 cursor-pointer shadow-xs"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Repetir</span>
                </button>

                <button
                  type="button"
                  onClick={goToNextStep}
                  disabled={currentStepIndex >= steps.length - 1}
                  className="py-2.5 rounded-xl bg-amber-500 text-white font-bold text-xs flex items-center justify-center gap-1 hover:bg-amber-600 cursor-pointer shadow-xs disabled:opacity-40"
                >
                  <span>Próxima</span>
                  <SkipForward className="w-4 h-4" />
                </button>
              </div>

              {/* Opções extras (Mudo, Auto-Avanço, Reiniciar) */}
              <div className="flex items-center justify-between pt-2 border-t border-amber-200/50 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
                <button
                  type="button"
                  onClick={() => setIsMuted((prev) => !prev)}
                  className="flex items-center gap-1 hover:text-amber-700 cursor-pointer"
                >
                  {isMuted ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4 text-emerald-600" />}
                  <span>{isMuted ? 'Mudo' : 'Som Ligado'}</span>
                </button>

                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoAdvance}
                    onChange={(e) => setAutoAdvance(e.target.checked)}
                    className="rounded text-amber-500 focus:ring-amber-400 w-3.5 h-3.5"
                  />
                  <span>Avançar sozinho</span>
                </label>

                <button
                  type="button"
                  onClick={restartRosary}
                  className="text-amber-700 dark:text-amber-300 hover:underline cursor-pointer font-bold"
                >
                  Do Início
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SantoTercoKids;
