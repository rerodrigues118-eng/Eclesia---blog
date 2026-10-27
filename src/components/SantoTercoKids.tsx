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
  Music
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
  beadId?: string;
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
   PALETA DE CORES DAS CONTAS DE AVE-MARIA (10 CORES PASTEL LÚDICAS E ALEGRES)
   ============================================================================ */
export const PASTEL_BEAD_THEMES = [
  { name: 'Rosa Flor', bg: 'bg-rose-100 dark:bg-rose-950/60', border: 'border-rose-300 dark:border-rose-700', activeRing: 'ring-rose-400', activeBg: 'bg-gradient-to-tr from-rose-400 to-rose-500 text-white shadow-rose-300/80', text: 'text-rose-700 dark:text-rose-300', emoji: '🌸' },
  { name: 'Azul Céu', bg: 'bg-sky-100 dark:bg-sky-950/60', border: 'border-sky-300 dark:border-sky-700', activeRing: 'ring-sky-400', activeBg: 'bg-gradient-to-tr from-sky-400 to-sky-500 text-white shadow-sky-300/80', text: 'text-sky-700 dark:text-sky-300', emoji: '🌤️' },
  { name: 'Amarelo Sol', bg: 'bg-amber-100 dark:bg-amber-950/60', border: 'border-amber-300 dark:border-amber-700', activeRing: 'ring-amber-400', activeBg: 'bg-gradient-to-tr from-amber-400 to-amber-500 text-white shadow-amber-300/80', text: 'text-amber-700 dark:text-amber-300', emoji: '☀️' },
  { name: 'Verde Menta', bg: 'bg-emerald-100 dark:bg-emerald-950/60', border: 'border-emerald-300 dark:border-emerald-700', activeRing: 'ring-emerald-400', activeBg: 'bg-gradient-to-tr from-emerald-400 to-emerald-500 text-white shadow-emerald-300/80', text: 'text-emerald-700 dark:text-emerald-300', emoji: '🍃' },
  { name: 'Lavanda', bg: 'bg-purple-100 dark:bg-purple-950/60', border: 'border-purple-300 dark:border-purple-700', activeRing: 'ring-purple-400', activeBg: 'bg-gradient-to-tr from-purple-400 to-purple-500 text-white shadow-purple-300/80', text: 'text-purple-700 dark:text-purple-300', emoji: '💜' },
  { name: 'Pêssego', bg: 'bg-orange-100 dark:bg-orange-950/60', border: 'border-orange-300 dark:border-orange-700', activeRing: 'ring-orange-400', activeBg: 'bg-gradient-to-tr from-orange-400 to-orange-500 text-white shadow-orange-300/80', text: 'text-orange-700 dark:text-orange-300', emoji: '🍑' },
  { name: 'Turquesa', bg: 'bg-cyan-100 dark:bg-cyan-950/60', border: 'border-cyan-300 dark:border-cyan-700', activeRing: 'ring-cyan-400', activeBg: 'bg-gradient-to-tr from-cyan-400 to-cyan-500 text-white shadow-cyan-300/80', text: 'text-cyan-700 dark:text-cyan-300', emoji: '💎' },
  { name: 'Rosa Bebê', bg: 'bg-pink-100 dark:bg-pink-950/60', border: 'border-pink-300 dark:border-pink-700', activeRing: 'ring-pink-400', activeBg: 'bg-gradient-to-tr from-pink-400 to-pink-500 text-white shadow-pink-300/80', text: 'text-pink-700 dark:text-pink-300', emoji: '🎀' },
  { name: 'Verde Folha', bg: 'bg-teal-100 dark:bg-teal-950/60', border: 'border-teal-300 dark:border-teal-700', activeRing: 'ring-teal-400', activeBg: 'bg-gradient-to-tr from-teal-400 to-teal-500 text-white shadow-teal-300/80', text: 'text-teal-700 dark:text-teal-300', emoji: '🌿' },
  { name: 'Dourado Luz', bg: 'bg-yellow-100 dark:bg-yellow-950/60', border: 'border-yellow-400 dark:border-yellow-700', activeRing: 'ring-yellow-400', activeBg: 'bg-gradient-to-tr from-yellow-400 to-amber-500 text-white shadow-yellow-300/80', text: 'text-yellow-800 dark:text-yellow-300', emoji: '✨' },
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
   AVATARES ILUSTRADOS DA MÃEZINHA DO CÉU (COM FALLBACKS)
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
    title: 'Glória ao Pai Inicial',
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
      beadId: `decade-${decIdx}-misterio`
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
        title: `${aveIdx}ª Ave-Maria (${mystery.number}º Mistério)`,
        subtitle: `Rosa ${aveIdx}/10 ofertada a Nossa Senhora 🌸`,
        category: 'ave-maria',
        mysteryNumber: mystery.number,
        decadeIndex: decIdx,
        beadIndex: aveIdx,
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
    title: 'Parabéns! Terço Concluído com Amor! 🌟',
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
   COMPONENTE PRINCIPAL: SANTO TERÇO KIDS (REDESIGN LÚDICO)
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

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const preloaderRef = useRef<HTMLAudioElement | null>(null);
  const progressIntervalRef = useRef<any>(null);

  const currentAvatarState: AvatarState = useMemo(() => {
    if (avatarStateOverride) return avatarStateOverride;
    if (isPlaying) return 'falando';
    return currentStep.state || 'sorrindo';
  }, [avatarStateOverride, isPlaying, currentStep.state]);

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
      preloaderRef.current.load();
    }
  }, [currentStepIndex, steps]);

  // Fallback Web Speech
  const speakFallback = useCallback((textToSpeak: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    const clean = textToSpeak.replace(/\[\.\.\.\]/g, ' ').replace(/\s+/g, ' ').trim();
    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.lang = 'pt-BR';
    utterance.rate = 0.92;
    utterance.pitch = 1.05;

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

  // Toca o áudio atual
  const playCurrentAudio = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    try {
      audio.pause();
      audio.src = currentStep.audioSrc;
      audio.muted = isMuted;
      audio.currentTime = 0;

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        await playPromise;
        setIsPlaying(true);
        setIsSpeechFallback(false);
      }
    } catch (err: unknown) {
      console.warn('[SantoTercoKids] Usando fallback de voz:', err);
      speakFallback(currentStep.text);
    }
  }, [currentStep.audioSrc, currentStep.text, isMuted, speakFallback]);

  // Pausa
  const pauseAudio = useCallback(() => {
    if (audioRef.current) audioRef.current.pause();
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    setIsPlaying(false);
  }, []);

  // Sincroniza áudio
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      if (audio.duration && audio.duration > 0) {
        const percent = (audio.currentTime / audio.duration) * 100;
        setAudioProgress(percent);

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

      if (autoAdvance && currentStepIndex < steps.length - 1) {
        setTimeout(() => {
          setCurrentStepIndex((prev) => prev + 1);
        }, 700);
      }
    };

    const handleError = () => {
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
  }, [autoAdvance, currentStepIndex, phrases.length, speakFallback, steps.length]);

  // Auto-toca ao mudar de passo se já estava tocando
  useEffect(() => {
    setActivePhraseIndex(0);
    setAudioProgress(0);

    if (isPlaying) {
      playCurrentAudio();
    }
  }, [currentStepIndex]);

  const handleTogglePlay = () => {
    if (isPlaying) {
      pauseAudio();
    } else {
      playCurrentAudio();
    }
  };

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      playBeadClickSound();
      setCurrentStepIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      playBeadClickSound();
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const handleReplay = () => {
    playBeadClickSound();
    playCurrentAudio();
  };

  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    if (audioRef.current) {
      audioRef.current.muted = nextMuted;
    }
  };

  const handleSelectGroup = (groupId: MysteryGroupKids) => {
    playBeadClickSound();
    pauseAudio();
    setSelectedGroup(groupId);
    setCurrentStepIndex(0);
  };

  // Navega diretamente para um passo ao clicar em uma conta
  const handleJumpToStep = (index: number) => {
    playBeadClickSound();
    setCurrentStepIndex(index);
    // Inicia a oração daquela conta
    setTimeout(() => {
      playCurrentAudio();
    }, 100);
  };

  // Identifica a dezena ativa (se estiver rezando uma das 5 dezenas)
  const currentDecadeIdx = currentStep.decadeIndex !== undefined ? currentStep.decadeIndex : null;

  return (
    <div className="w-full max-w-4xl mx-auto px-3 sm:px-6 py-4 font-sans select-none animate-fade-in text-zinc-900 dark:text-zinc-100">
      
      {/* ────────────────────────────────────────────────────────────────────
          1. CABEÇALHO LÚDICO: NUVENS, BADGE E SELETOR DE MISTÉRIOS
          ──────────────────────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-b from-[#EBF5FB] via-[#F4F9FD] to-white dark:from-[#1e293b]/90 dark:via-[#1e232d] dark:to-[#18181b] rounded-3xl p-5 sm:p-7 shadow-lg border-2 border-sky-200/80 dark:border-sky-900/40 text-center mb-6 relative overflow-hidden">
        
        {/* Enfeites no fundo */}
        <div className="absolute top-2 left-4 text-2xl opacity-70 animate-pulse pointer-events-none">☁️</div>
        <div className="absolute top-3 right-6 text-2xl opacity-70 animate-pulse pointer-events-none">⭐</div>
        <div className="absolute bottom-2 left-10 text-xl opacity-60 pointer-events-none">✨</div>
        <div className="absolute bottom-3 right-8 text-xl opacity-60 pointer-events-none">🌈</div>

        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white dark:bg-zinc-800 border border-sky-200 dark:border-sky-800 shadow-xs text-xs sm:text-sm font-bold text-sky-700 dark:text-sky-300">
            <Calendar className="w-4 h-4 text-sky-600 dark:text-sky-400" />
            <span>Mistérios de Hoje: {activeGroup.name} {activeGroup.badgeEmoji}</span>
          </div>

          {onSwitchToAdult && (
            <button
              onClick={onSwitchToAdult}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 hover:bg-white dark:bg-zinc-800 dark:hover:bg-zinc-700 text-xs font-semibold text-zinc-700 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-700 shadow-xs transition-all hover:scale-105 cursor-pointer"
            >
              <span>✝️ Modo Tradicional</span>
            </button>
          )}
        </div>

        {/* Título Infantil */}
        <div className="space-y-1">
          <div className="inline-flex items-center justify-center gap-2">
            <span className="text-3xl sm:text-4xl animate-bounce">🎈</span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#2B6CB0] dark:text-sky-400 tracking-tight drop-shadow-xs font-serif">
              Santo Terço Kids
            </h1>
            <span className="text-3xl sm:text-4xl animate-bounce">🕊️</span>
          </div>
          <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-300 max-w-lg mx-auto font-medium">
            Reze com a Mãezinha do Céu! Clique nas bolinhas coloridas, ouça a voz carinhosa e ofereça cada rosa a Jesus!
          </p>
        </div>

        {/* Seletor Amigável dos 4 Mistérios */}
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
                    ? 'bg-gradient-to-r from-sky-600 to-blue-600 text-white shadow-md scale-105 ring-2 ring-sky-400'
                    : 'bg-white dark:bg-zinc-800 hover:bg-sky-50 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700'
                }`}
              >
                <span>{group.badgeEmoji}</span>
                <span>{group.name}</span>
                {isToday && (
                  <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded-full bg-amber-400 text-amber-950 font-black">
                    Hoje!
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────────────────
          2. SEÇÃO PRINCIPAL: NOSSA SENHORA + BALÃO DE FALA (SPEECH BUBBLE)
          ──────────────────────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-b from-white via-amber-50/30 to-[#FFFDF7] dark:from-zinc-900 dark:via-zinc-900/90 dark:to-zinc-950 rounded-3xl p-5 sm:p-8 shadow-xl border-2 border-amber-200/70 dark:border-amber-900/40 mb-8 relative">
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          
          {/* LADO ESQUERDO / TOPO: AVATAR 3D DE NOSSA SENHORA */}
          <div className="md:col-span-4 flex flex-col items-center justify-center">
            <div className="relative group">
              {/* Halo Dourado Luminoso */}
              <div
                className={`absolute -inset-3 rounded-full blur-md transition-all duration-500 pointer-events-none ${
                  isPlaying
                    ? 'bg-gradient-to-tr from-amber-300 via-yellow-400 to-amber-200 opacity-90 scale-110 animate-pulse'
                    : 'bg-amber-200 dark:bg-amber-800/40 opacity-50'
                }`}
              />

              {/* Moldura Circular do Avatar */}
              <div className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-full p-2 bg-gradient-to-b from-amber-100 via-amber-200 to-sky-200 shadow-2xl border-4 border-white dark:border-zinc-800 overflow-hidden transition-transform duration-300 hover:scale-105">
                <img
                  src={AVATAR_IMAGES[currentAvatarState]}
                  alt={`Nossa Senhora ${currentAvatarState}`}
                  className="w-full h-full object-cover rounded-full transition-all duration-300"
                  onError={(e) => {
                    const target = e.currentTarget;
                    if (!target.src.includes('SORINDO-NORMAL')) {
                      target.src = '/terco-kids/SORINDO-NORMAL.png';
                    }
                  }}
                />
              </div>

              {/* Tag com estado da Mãezinha */}
              <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 px-3.5 py-1 rounded-full bg-white dark:bg-zinc-800 border-2 border-amber-400 shadow-md flex items-center gap-1.5 text-xs font-black text-amber-900 dark:text-amber-300 whitespace-nowrap">
                {currentAvatarState === 'sorrindo' && (
                  <>
                    <Smile className="w-3.5 h-3.5 text-amber-500" />
                    <span>Mãezinha do Céu ❤️</span>
                  </>
                )}
                {currentAvatarState === 'falando' && (
                  <>
                    <Volume2 className="w-3.5 h-3.5 text-sky-500 animate-pulse" />
                    <span>Rezando com Você 🕊️</span>
                  </>
                )}
                {currentAvatarState === 'ensinando' && (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Ensinando com Amor ✨</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* LADO DIREITO: BALÃO DE CONVERSA (SPEECH BUBBLE) */}
          <div className="md:col-span-8 relative">
            <div className="relative bg-[#FFFDF7] dark:bg-zinc-800/95 border-3 border-amber-300/80 dark:border-amber-700/60 rounded-3xl p-5 sm:p-7 shadow-lg">
              
              {/* Cauda do balão apontando para o avatar (visível no desktop) */}
              <div className="hidden md:block absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-[#FFFDF7] dark:bg-zinc-800 border-b-3 border-l-3 border-amber-300/80 dark:border-amber-700/60 rotate-45" />
              {/* Cauda do balão apontando para cima no mobile */}
              <div className="md:hidden absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-[#FFFDF7] dark:bg-zinc-800 border-t-3 border-l-3 border-amber-300/80 dark:border-amber-700/60 rotate-45" />

              {/* Título da Oração no Balão */}
              <div className="text-center sm:text-left mb-3">
                <span className="text-[11px] font-extrabold uppercase tracking-widest text-amber-700 dark:text-amber-400">
                  {currentStep.category === 'intro' && '🌸 Acolhimento Maternal'}
                  {currentStep.category === 'credo' && '✝️ Sinal da Cruz e Profissão de Fé'}
                  {currentStep.category === 'pai-nosso' && '👑 Oração ao Pai do Céu'}
                  {currentStep.category === 'ave-maria' && `🌹 Conta de Ave-Maria (${currentStep.beadIndex || 1}/10)`}
                  {currentStep.category === 'gloria' && '🌟 Glória e Louvor'}
                  {currentStep.category === 'misterio' && `📖 Contemplação do ${currentStep.mysteryNumber}º Mistério`}
                  {currentStep.category === 'final' && '🎉 Bênção dos Pequeninos'}
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-[#2B6CB0] dark:text-sky-400 font-serif leading-snug">
                  {currentStep.title}
                </h2>
                <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 font-medium">
                  {currentStep.subtitle}
                </p>
              </div>

              {/* Texto da Oração com Frases Dinâmicas em Destaque */}
              <div className="text-base sm:text-lg text-zinc-800 dark:text-zinc-100 leading-relaxed font-medium min-h-[90px] flex flex-wrap items-center justify-start gap-1 sm:gap-1.5 py-2">
                {phrases.map((phrase, idx) => {
                  const isCurrentPhrase = isPlaying && idx === activePhraseIndex;
                  const isPastPhrase = isPlaying && idx < activePhraseIndex;

                  return (
                    <span
                      key={idx}
                      className={`inline-block px-1.5 py-0.5 rounded-lg transition-all duration-300 ${
                        isCurrentPhrase
                          ? 'bg-amber-200/90 dark:bg-amber-500/30 text-amber-950 dark:text-amber-200 font-black scale-105 shadow-xs border border-amber-400'
                          : isPastPhrase
                          ? 'text-zinc-500 dark:text-zinc-400'
                          : 'text-zinc-800 dark:text-zinc-100'
                      }`}
                    >
                      {phrase}
                      {idx < phrases.length - 1 && <span className="opacity-40 ml-1">·</span>}
                    </span>
                  );
                })}
              </div>

              {/* Barra de progresso do áudio */}
              {isPlaying && (
                <div className="w-full h-2 bg-amber-100 dark:bg-zinc-700 rounded-full overflow-hidden mt-3">
                  <div
                    className="h-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-150"
                    style={{ width: `${audioProgress}%` }}
                  />
                </div>
              )}

              {/* Fruto do mistério se houver */}
              {currentStep.fruit && (
                <div className="mt-3 pt-3 border-t border-amber-200/60 dark:border-zinc-700 flex items-center gap-2 text-xs text-amber-800 dark:text-amber-300 font-bold">
                  <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                  <span>Para praticar hoje: {currentStep.fruit}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ────────────────────────────────────────────────────────────────────
            PAINEL DE CONTROLE DE ÁUDIO COM BOTÕES GRANDES PARA TABLET/CELULAR
            ──────────────────────────────────────────────────────────────────── */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 pt-6 border-t border-amber-100 dark:border-zinc-800 mt-6">
          
          {/* Voltar */}
          <button
            onClick={handlePrev}
            disabled={currentStepIndex === 0}
            className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 disabled:opacity-40 text-zinc-700 dark:text-zinc-200 border-2 border-zinc-200 dark:border-zinc-700 shadow-sm transition-all hover:scale-105 active:scale-95 cursor-pointer disabled:cursor-not-allowed"
            title="Voltar oração"
          >
            <SkipBack className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          {/* Repetir */}
          <button
            onClick={handleReplay}
            className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 border-2 border-zinc-200 dark:border-zinc-700 shadow-sm transition-all hover:scale-105 active:scale-95 cursor-pointer"
            title="Ouvir novamente"
          >
            <RotateCcw className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          {/* PLAY / PAUSE GIGANTE */}
          <button
            onClick={handleTogglePlay}
            className={`flex items-center justify-center gap-2 px-6 sm:px-8 h-14 sm:h-16 rounded-full font-black text-base sm:text-xl shadow-xl transition-all duration-200 cursor-pointer transform hover:scale-105 active:scale-95 ${
              isPlaying
                ? 'bg-rose-600 hover:bg-rose-700 text-white ring-4 ring-rose-200 dark:ring-rose-900/50'
                : 'bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white ring-4 ring-emerald-200 dark:ring-emerald-900/50'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-6 h-6 fill-white" />
                <span>Pausar Oração</span>
              </>
            ) : (
              <>
                <Play className="w-6 h-6 fill-white" />
                <span>{currentStepIndex === 0 ? 'Começar a Rezar 🌸' : 'Continuar Oração ✨'}</span>
              </>
            )}
          </button>

          {/* Avançar */}
          <button
            onClick={handleNext}
            disabled={currentStepIndex === steps.length - 1}
            className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 disabled:opacity-40 text-zinc-700 dark:text-zinc-200 border-2 border-zinc-200 dark:border-zinc-700 shadow-sm transition-all hover:scale-105 active:scale-95 cursor-pointer disabled:cursor-not-allowed"
            title="Próxima oração"
          >
            <SkipForward className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          {/* Mudo */}
          <button
            onClick={handleToggleMute}
            className={`flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-2xl border-2 shadow-sm transition-all hover:scale-105 active:scale-95 cursor-pointer ${
              isMuted
                ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 text-rose-600'
                : 'bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200'
            }`}
            title={isMuted ? 'Ativar Voz' : 'Silenciar'}
          >
            {isMuted ? <VolumeX className="w-5 h-5 sm:w-6 sm:h-6" /> : <Volume2 className="w-5 h-5 sm:w-6 sm:h-6" />}
          </button>
        </div>

        {/* Barra de Passo com Estrelas */}
        <div className="flex items-center justify-between text-xs font-bold text-zinc-500 dark:text-zinc-400 mt-4 px-2">
          <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
            Passo {currentStepIndex + 1} de {steps.length}
          </span>
          <button
            onClick={() => setAutoAdvance(!autoAdvance)}
            className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
              autoAdvance
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300'
                : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 border border-zinc-300'
            }`}
          >
            {autoAdvance ? 'Avanço Automático: Ligado ⏩' : 'Avanço: Manual 🖐️'}
          </button>
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────────────────
          3. O TERÇO GRANDE E COLORIDO (COM CONTAS PASTEL GRANDES E CLICÁVEIS)
          ──────────────────────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-5 sm:p-8 shadow-xl border-2 border-sky-100 dark:border-zinc-800 mb-8">
        
        {/* Título da Seção do Terço */}
        <div className="text-center mb-6">
          <span className="text-xs font-extrabold uppercase tracking-widest text-sky-600 dark:text-sky-400">
            Terço Interativo dos Pequeninos
          </span>
          <h3 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-zinc-100 font-serif flex items-center justify-center gap-2 mt-1">
            <span>📿</span>
            <span>Toque nas Contas Coloridas</span>
            <span>✨</span>
          </h3>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 max-w-md mx-auto mt-1">
            Cada bolinha colorida é uma oração! Toque na bolinha brilhante para rezar com a Mãezinha.
          </p>
        </div>

        {/* ── SELETOR DE DEZENAS (AS 5 DEZENAS DO MISTÉRIO) ── */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">
              Escolha a Dezena do Terço:
            </span>
            <span className="text-xs font-black text-sky-600 dark:text-sky-400">
              {currentDecadeIdx !== null ? `${currentDecadeIdx + 1}ª Dezena Ativa` : 'Início do Terço'}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {activeGroup.mysteries.map((m, dIdx) => {
              const isCurrentDecade = currentDecadeIdx === dIdx;
              const firstStepOfDecade = steps.findIndex(
                (s) => s.decadeIndex === dIdx && s.category === 'misterio'
              );

              return (
                <button
                  key={dIdx}
                  onClick={() => {
                    if (firstStepOfDecade !== -1) handleJumpToStep(firstStepOfDecade);
                  }}
                  className={`p-2.5 rounded-2xl border-2 transition-all duration-200 text-left cursor-pointer flex flex-col justify-between ${
                    isCurrentDecade
                      ? 'bg-sky-50 dark:bg-sky-950/40 border-sky-500 shadow-md scale-102 ring-2 ring-sky-300'
                      : 'bg-zinc-50 dark:bg-zinc-800/60 border-zinc-200 dark:border-zinc-700 hover:border-sky-300'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-black mb-1">
                    <span className={isCurrentDecade ? 'text-sky-700 dark:text-sky-300' : 'text-zinc-600 dark:text-zinc-400'}>
                      {dIdx + 1}ª Dezena
                    </span>
                    <span className="text-sm">{dIdx === 0 ? '🌸' : dIdx === 1 ? '☀️' : dIdx === 2 ? '👑' : dIdx === 3 ? '🍃' : '⭐'}</span>
                  </div>
                  <p className="text-[11px] font-semibold text-zinc-800 dark:text-zinc-200 line-clamp-1">
                    {m.title.split(':')[0]}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── PAINEL CENTRAL DA DEZENA ATIVA COM CONTAS GIGANTES E COLORIDAS ── */}
        <div className="bg-gradient-to-b from-sky-50/70 via-amber-50/40 to-white dark:from-zinc-800/80 dark:to-zinc-900 rounded-3xl p-5 sm:p-6 border-2 border-sky-200/70 dark:border-zinc-700 mb-6">
          
          {/* Conta Pai Nosso da Dezena (Maior e Dourada) */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-5 border-b border-sky-200/60 dark:border-zinc-700">
            <div className="text-center sm:text-left">
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-amber-700 dark:text-amber-400">
                Abertura da Dezena
              </span>
              <h4 className="text-base sm:text-lg font-black text-zinc-900 dark:text-zinc-100">
                Pai Nosso da {currentDecadeIdx !== null ? `${currentDecadeIdx + 1}ª Dezena` : 'Dezena'}
              </h4>
            </div>

            {(() => {
              const pnStepIdx = steps.findIndex(
                (s) => s.decadeIndex === (currentDecadeIdx ?? 0) && s.category === 'pai-nosso'
              );
              const isPnActive = currentStep.decadeIndex === (currentDecadeIdx ?? 0) && currentStep.category === 'pai-nosso';
              const isPnDone = pnStepIdx !== -1 && currentStepIndex > pnStepIdx;

              return (
                <button
                  type="button"
                  onClick={() => {
                    if (pnStepIdx !== -1) handleJumpToStep(pnStepIdx);
                  }}
                  className={`group relative flex items-center gap-2.5 px-6 py-3 rounded-full font-black text-sm transition-all duration-300 cursor-pointer shadow-md ${
                    isPnActive
                      ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-amber-950 scale-110 ring-4 ring-amber-300 animate-pulse shadow-amber-300/60'
                      : isPnDone
                      ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-2 border-amber-400'
                      : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-2 border-zinc-300 dark:border-zinc-600 hover:scale-105'
                  }`}
                >
                  <span className="text-lg">👑</span>
                  <span>{isPnDone ? 'Pai Nosso Rezado ✓' : 'Conta do Pai Nosso'}</span>
                  {isPnActive && <span className="text-xs bg-amber-950 text-white px-2 py-0.5 rounded-full font-bold">Aqui! 👇</span>}
                </button>
              );
            })()}
          </div>

          {/* AS 10 CONTAS DE AVE-MARIA (GRANDES, PASTEL E COLORIDAS) */}
          <div className="pt-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                As 10 Ave-Marias Coloridas (Toque nas bolinhas):
              </span>
              <span className="text-xs font-semibold text-zinc-500">
                {currentDecadeIdx !== null ? `${currentDecadeIdx + 1}ª Dezena` : 'Dezena'}
              </span>
            </div>

            {/* Grid com as 10 Contas Grandes */}
            <div className="grid grid-cols-5 sm:grid-cols-10 gap-2.5 sm:gap-3 py-2">
              {Array.from({ length: 10 }).map((_, aveIdx) => {
                const beadNumber = aveIdx + 1;
                const theme = PASTEL_BEAD_THEMES[aveIdx % PASTEL_BEAD_THEMES.length];
                
                const targetDecade = currentDecadeIdx !== null ? currentDecadeIdx : 0;
                const stepIdx = steps.findIndex(
                  (s) =>
                    s.decadeIndex === targetDecade &&
                    s.category === 'ave-maria' &&
                    s.beadIndex === beadNumber
                );

                const isActive =
                  currentStep.decadeIndex === targetDecade &&
                  currentStep.category === 'ave-maria' &&
                  currentStep.beadIndex === beadNumber;

                const isDone = stepIdx !== -1 && currentStepIndex > stepIdx;

                return (
                  <button
                    key={aveIdx}
                    type="button"
                    onClick={() => {
                      if (stepIdx !== -1) handleJumpToStep(stepIdx);
                    }}
                    className={`group relative aspect-square rounded-2xl flex flex-col items-center justify-center p-1.5 transition-all duration-300 cursor-pointer shadow-sm border-2 ${
                      isActive
                        ? `${theme.activeBg} scale-115 ring-4 ${theme.activeRing} animate-bounce z-10 shadow-lg`
                        : isDone
                        ? 'bg-amber-100 dark:bg-amber-950/50 border-amber-400 text-amber-800 dark:text-amber-300'
                        : `${theme.bg} ${theme.border} ${theme.text} hover:scale-108 hover:shadow-md`
                    }`}
                    title={`Ave-Maria #${beadNumber} (${theme.name})`}
                  >
                    {/* Emoji / Ícone no topo */}
                    <span className="text-sm sm:text-base leading-none">
                      {isDone ? '⭐' : theme.emoji}
                    </span>

                    {/* Número da Conta */}
                    <span className="text-xs sm:text-sm font-black mt-0.5 leading-none">
                      {beadNumber}
                    </span>

                    {/* Indicador pulsante na conta ativa */}
                    {isActive && (
                      <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-[9px] px-1.5 py-0.2 rounded-full bg-amber-400 text-amber-950 font-black whitespace-nowrap shadow-xs">
                        Aqui!
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Conta do Glória ao Pai da Dezena */}
            {(() => {
              const targetDecade = currentDecadeIdx !== null ? currentDecadeIdx : 0;
              const gloriaStepIdx = steps.findIndex(
                (s) => s.decadeIndex === targetDecade && s.category === 'gloria'
              );
              const isGloriaActive = currentStep.decadeIndex === targetDecade && currentStep.category === 'gloria';
              const isGloriaDone = gloriaStepIdx !== -1 && currentStepIndex > gloriaStepIdx;

              return (
                <div className="flex justify-end pt-3">
                  <button
                    type="button"
                    onClick={() => {
                      if (gloriaStepIdx !== -1) handleJumpToStep(gloriaStepIdx);
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border ${
                      isGloriaActive
                        ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white ring-2 ring-purple-300 shadow-md scale-105'
                        : isGloriaDone
                        ? 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-300'
                        : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:bg-purple-50'
                    }`}
                  >
                    <span>🌟</span>
                    <span>Glória ao Pai ({targetDecade + 1}ª Dezena)</span>
                    {isGloriaDone && <span>✓</span>}
                  </button>
                </div>
              );
            })()}
          </div>
        </div>

        {/* ── BOTÃO DE AÇÃO RÁPIDA: REZAR PRÓXIMA CONTA ── */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-amber-50/70 dark:bg-zinc-800/80 rounded-2xl p-4 border border-amber-200 dark:border-zinc-700">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-amber-900 dark:text-amber-300">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Dica da Mãezinha: Você pode tocar em qualquer bolinha colorida acima!</span>
          </div>

          <button
            type="button"
            onClick={handleNext}
            disabled={currentStepIndex === steps.length - 1}
            className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-amber-950 font-black text-xs sm:text-sm shadow-md transition-all hover:scale-105 cursor-pointer flex items-center justify-center gap-1.5"
          >
            <span>Próxima Bolinha</span>
            <SkipForward className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────────────────
          4. ORAÇÕES INICIAIS DO TERÇO (CRUZ E 3 AVE-MARIAS)
          ──────────────────────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-5 sm:p-6 shadow-sm border border-zinc-200 dark:border-zinc-800 mb-8">
        <h4 className="text-xs font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400 mb-3 text-center sm:text-left">
          Contas do Início do Terço:
        </h4>

        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
          {/* Cruz */}
          <button
            type="button"
            onClick={() => handleJumpToStep(1)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
              currentStepIndex === 1
                ? 'bg-amber-500 text-white ring-2 ring-amber-300 shadow-md scale-105'
                : currentStepIndex > 1
                ? 'bg-amber-100 text-amber-800 border-amber-300'
                : 'bg-zinc-100 text-zinc-700 border-zinc-200 hover:bg-amber-50'
            }`}
          >
            <span>✝️</span>
            <span>Santo Credo na Cruz</span>
          </button>

          {/* Pai Nosso Inicial */}
          <button
            type="button"
            onClick={() => handleJumpToStep(2)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
              currentStepIndex === 2
                ? 'bg-amber-500 text-white ring-2 ring-amber-300 shadow-md scale-105'
                : currentStepIndex > 2
                ? 'bg-amber-100 text-amber-800 border-amber-300'
                : 'bg-zinc-100 text-zinc-700 border-zinc-200 hover:bg-amber-50'
            }`}
          >
            <span>👑</span>
            <span>Pai Nosso Inicial</span>
          </button>

          {/* 3 Ave-Marias Iniciais */}
          {[
            { step: 3, label: '1ª Ave-Maria: Fé 🌸' },
            { step: 4, label: '2ª Ave-Maria: Esperança 🌤️' },
            { step: 5, label: '3ª Ave-Maria: Caridade ❤️' },
          ].map((item) => (
            <button
              key={item.step}
              type="button"
              onClick={() => handleJumpToStep(item.step)}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 border ${
                currentStepIndex === item.step
                  ? 'bg-rose-500 text-white ring-2 ring-rose-300 shadow-md scale-105'
                : currentStepIndex > item.step
                  ? 'bg-rose-100 text-rose-800 border-rose-300'
                  : 'bg-zinc-100 text-zinc-700 border-zinc-200 hover:bg-rose-50'
              }`}
            >
              <span>{item.label}</span>
            </button>
          ))}

          {/* Glória ao Pai Inicial */}
          <button
            type="button"
            onClick={() => handleJumpToStep(6)}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
              currentStepIndex === 6
                ? 'bg-purple-500 text-white ring-2 ring-purple-300 shadow-md scale-105'
                : currentStepIndex > 6
                ? 'bg-purple-100 text-purple-800 border-purple-300'
                : 'bg-zinc-100 text-zinc-700 border-zinc-200 hover:bg-purple-50'
            }`}
          >
            <span>🌟</span>
            <span>Glória ao Pai</span>
          </button>
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────────────────
          5. MENSAGEM FINAL CARINHOSA
          ──────────────────────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-amber-100/70 via-rose-100/60 to-sky-100/70 dark:from-zinc-800 dark:via-zinc-800 dark:to-zinc-800 rounded-3xl p-4 text-center border-2 border-amber-300/60 dark:border-zinc-700 text-xs sm:text-sm text-amber-950 dark:text-amber-200 shadow-sm">
        <p className="font-bold flex items-center justify-center gap-2">
          <Heart className="w-4 h-4 text-rose-500 fill-rose-500 animate-pulse" />
          <span>"Cada Ave-Maria rezada por uma criança é uma flor perfumada oferecida à Mãezinha do Céu!"</span>
          <Heart className="w-4 h-4 text-rose-500 fill-rose-500 animate-pulse" />
        </p>
      </div>

    </div>
  );
};

export default SantoTercoKids;
