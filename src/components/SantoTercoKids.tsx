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
  Star
} from 'lucide-react';

/* ============================================================================
   TIPAGEM E ESTRUTURA DE DADOS
   ============================================================================ */

export type AvatarState = 'sorrindo' | 'falando' | 'ensinando';
export type MysteryGroupKids = 'gozosos' | 'dolorosos' | 'gloriosos' | 'luminosos';

export interface PrayerStep {
  id: string;
  title: string;
  subtitle: string;
  category: 'intro' | 'credo' | 'pai-nosso' | 'ave-maria' | 'gloria' | 'misterio' | 'final';
  mysteryNumber?: number;
  decadeIndex?: number;
  beadIndex?: number;
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
  badgeEmoji: string;
  days: number[];
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
   10 CORES PASTEL VIVAS PARA AS AVE-MARIAS
   ============================================================================ */
export const PASTEL_BEAD_THEMES = [
  { name: 'Rosa Flor', hex: '#f43f5e', gradientId: 'grad-ave-0' },
  { name: 'Azul Céu', hex: '#0284c7', gradientId: 'grad-ave-1' },
  { name: 'Amarelo Sol', hex: '#d97706', gradientId: 'grad-ave-2' },
  { name: 'Verde Menta', hex: '#059669', gradientId: 'grad-ave-3' },
  { name: 'Lavanda', hex: '#7c3aed', gradientId: 'grad-ave-4' },
  { name: 'Pêssego', hex: '#ea580c', gradientId: 'grad-ave-5' },
  { name: 'Turquesa', hex: '#0891b2', gradientId: 'grad-ave-6' },
  { name: 'Rosa Bebê', hex: '#db2777', gradientId: 'grad-ave-7' },
  { name: 'Verde Folha', hex: '#0d9488', gradientId: 'grad-ave-8' },
  { name: 'Dourado Luz', hex: '#ca8a04', gradientId: 'grad-ave-9' },
];

/* ============================================================================
   MISTÉRIOS DO TERÇO PARA CRIANÇAS
   ============================================================================ */
export const KIDS_MYSTERY_GROUPS: MysteryGroupData[] = [
  {
    id: 'gozosos',
    name: 'Mistérios Gozosos',
    badgeEmoji: '🌟',
    days: [1, 6],
    mysteries: [
      {
        number: 1,
        title: 'A Anunciação do Anjo Gabriel a Maria',
        kidsExplanation: 'O lindo anjo Gabriel desce do céu e diz a Maria que ela será a Mãezinha de Jesus! Maria responde com amor: "Faça-se em mim a vontade de Deus!"',
        audioSrc: '/terco-kids/gozoso-1.mp3',
        fruit: 'Humildade e obedecer com alegria'
      },
      {
        number: 2,
        title: 'A Visita de Nossa Senhora a Santa Isabel',
        kidsExplanation: 'Maria viaja pelas montanhas para ajudar sua prima Isabel. Quando Maria chega, todos se enchem do Espírito Santo!',
        audioSrc: '/terco-kids/gozoso-2.mp3',
        fruit: 'Ajudar os outros com carinho'
      },
      {
        number: 3,
        title: 'O Nascimento de Jesus em Belém',
        kidsExplanation: 'Jesus nasce em uma manjedoura simples, cheia de palhinha, entre os animaizinhos. Os anjos cantam Glória a Deus!',
        audioSrc: '/terco-kids/gozoso-3.mp3',
        fruit: 'Coração simples e agradecido'
      },
      {
        number: 4,
        title: 'A Apresentação de Jesus no Templo',
        kidsExplanation: 'Maria e José levam o bebê Jesus ao Templo para consagrá-lo a Deus Pai. O vovô Simeão fica radiante e abraça o Salvador!',
        audioSrc: '/terco-kids/gozoso-4.mp3',
        fruit: 'Pureza de coração e amor à Igreja'
      },
      {
        number: 5,
        title: 'O Menino Jesus Encontrado no Templo',
        kidsExplanation: 'Aos doze anos, Jesus conversa com os doutores no Templo de Jerusalém, ensinando as coisas mais lindas sobre Deus com muita sabedoria!',
        audioSrc: '/terco-kids/gozoso-5.mp3',
        fruit: 'Buscar sempre a Jesus'
      }
    ]
  },
  {
    id: 'dolorosos',
    name: 'Mistérios Dolorosos',
    badgeEmoji: '❤️‍🔥',
    days: [2, 5],
    mysteries: [
      {
        number: 1,
        title: 'A Oração de Jesus no Horto',
        kidsExplanation: 'No jardim do Getsêmani, Jesus reza com muito amor por nós e diz ao Pai: "Seja feita a Tua vontade!"',
        audioSrc: '/terco-kids/doloroso-1.mp3',
        fruit: 'Rezar sempre com confiança'
      },
      {
        number: 2,
        title: 'A Flagelação de Jesus',
        kidsExplanation: 'Jesus sofre por amor infinito a cada um de nós, ensinando-nos o valor de um coração paciente e perdoador.',
        audioSrc: '/terco-kids/doloroso-2.mp3',
        fruit: 'Paciência e bondade'
      },
      {
        number: 3,
        title: 'A Coroação de Espinhos',
        kidsExplanation: 'Os soldados colocam uma coroa de espinhos em Jesus, mas Ele é o verdadeiro Rei do Amor!',
        audioSrc: '/terco-kids/doloroso-3.mp3',
        fruit: 'Humildade e mansidão'
      },
      {
        number: 4,
        title: 'Jesus Carrega a Cruz',
        kidsExplanation: 'Jesus carrega a pesada cruz com coragem. No caminho, Ele encontra Sua Mãezinha Maria que Lhe dá consolo!',
        audioSrc: '/terco-kids/doloroso-4.mp3',
        fruit: 'Ajudar os amigos'
      },
      {
        number: 5,
        title: 'A Morte de Jesus na Cruz',
        kidsExplanation: 'No alto da Cruz, Jesus nos entrega Nossa Senhora por Mãe dizendo: "Eis aí a tua Mãe!" Ele abre as portas do Céu!',
        audioSrc: '/terco-kids/doloroso-5.mp3',
        fruit: 'Perdoar de coração'
      }
    ]
  },
  {
    id: 'gloriosos',
    name: 'Mistérios Gloriosos',
    badgeEmoji: '👑',
    days: [0, 3],
    mysteries: [
      {
        number: 1,
        title: 'A Ressurreição de Jesus',
        kidsExplanation: 'No terceiro dia, Jesus ressuscita cheio de luz e glória! Ele venceu a morte e vive para sempre!',
        audioSrc: '/terco-kids/glorioso-1.mp3',
        fruit: 'Fé viva e alegria'
      },
      {
        number: 2,
        title: 'A Ascensão de Jesus ao Céu',
        kidsExplanation: 'Jesus sobe aos Céus em uma nuvem luminosa para nos preparar um lugar muito lindo junto de Deus!',
        audioSrc: '/terco-kids/glorioso-2.mp3',
        fruit: 'Esperança no Céu'
      },
      {
        number: 3,
        title: 'A Vinda do Espírito Santo',
        kidsExplanation: 'Com Maria em oração, o Espírito Santo desce sobre os apóstolos como chamas de amor e paz!',
        audioSrc: '/terco-kids/glorioso-3.mp3',
        fruit: 'Amor a Deus e sabedoria'
      },
      {
        number: 4,
        title: 'A Assunção de Nossa Senhora',
        kidsExplanation: 'Os anjinhos levam Nossa Senhora em corpo e alma para o Céu, direto para os braços de Jesus!',
        audioSrc: '/terco-kids/glorioso-4.mp3',
        fruit: 'Confiança na Mãezinha'
      },
      {
        number: 5,
        title: 'A Coroação de Maria',
        kidsExplanation: 'Nossa Senhora é coroada com 12 estrelas brilhantes como Rainha do Céu e protetora dos pequeninos!',
        audioSrc: '/terco-kids/glorioso-5.mp3',
        fruit: 'Amar muito a Maria'
      }
    ]
  },
  {
    id: 'luminosos',
    name: 'Mistérios Luminosos',
    badgeEmoji: '💡',
    days: [4],
    mysteries: [
      {
        number: 1,
        title: 'O Batismo de Jesus no Jordão',
        kidsExplanation: 'São João Batista batiza Jesus no rio. O céu se abre e a voz do Pai diz: "Este é meu Filho muito amado!"',
        audioSrc: '/terco-kids/luminoso-1.mp3',
        fruit: 'Pureza no coração'
      },
      {
        number: 2,
        title: 'O Primeiro Milagre em Caná',
        kidsExplanation: 'Nossa Senhora pede a Jesus e diz: "Fazei tudo o que Ele vos disser!" E a água vira vinho excelente!',
        audioSrc: '/terco-kids/luminoso-2.mp3',
        fruit: 'Obedecer a Jesus'
      },
      {
        number: 3,
        title: 'O Anúncio do Reino de Deus',
        kidsExplanation: 'Jesus cura os doentinhos, acolhe as criancinhas e ensina o amor a Deus Pai!',
        audioSrc: '/terco-kids/luminoso-3.mp3',
        fruit: 'Coração bondoso'
      },
      {
        number: 4,
        title: 'A Transfiguração no Tabor',
        kidsExplanation: 'No alto do monte, as roupinhas de Jesus brilham como a luz do sol, cheias de glória!',
        audioSrc: '/terco-kids/luminoso-4.mp3',
        fruit: 'Rezar todo dia'
      },
      {
        number: 5,
        title: 'A Instituição da Eucaristia',
        kidsExplanation: 'Na Última Ceia, Jesus nos dá Seu verdadeiro Corpo e Sangue na Santa Hóstia, ficando para sempre conosco!',
        audioSrc: '/terco-kids/luminoso-5.mp3',
        fruit: 'Amor à Santa Missa'
      }
    ]
  }
];

/* ============================================================================
   AVATARES DE NOSSA SENHORA
   ============================================================================ */
const AVATAR_IMAGES = {
  sorrindo: '/terco-kids/SORINDO-NORMAL.png',
  falando: '/terco-kids/FALANDO.png',
  ensinando: '/terco-kids/ENSINANDO.png'
};

/* ============================================================================
   ORAÇÕES CATÓLICAS
   ============================================================================ */
const PRAYERS_TEXT = {
  credo: "Em nome do Pai, do Filho e do Espírito Santo. Amém! [...] Creio em Deus Pai Todo-Poderoso, [...] Criador do céu e da terra; [...] e em Jesus Cristo, seu único Filho, Nosso Senhor; [...] que foi concebido pelo poder do Espírito Santo; [...] nasceu da Virgem Maria; [...] padeceu sob Pôncio Pilatos; [...] foi crucificado, morto e sepultado; [...] desceu à mansão dos mortos; [...] ressuscitou ao terceiro dia; [...] subiu aos céus, [...] está sentado à direita de Deus Pai Todo-Poderoso, [...] donde há de vir a julgar os vivos e os mortos. [...] Creio no Espírito Santo; [...] na Santa Igreja Católica; [...] na comunhão dos santos; [...] na remissão dos pecados; [...] na ressurreição da carne; [...] na vida eterna. Amém!",
  paiNosso: "Pai Nosso que estais no céu, [...] santificado seja o vosso Nome; [...] venha a nós o vosso Reino; [...] seja feita a vossa vontade, [...] assim na terra como no céu. [...] O pão nosso de cada dia nos dai hoje; [...] perdoai-nos as nossas ofensas, [...] assim como nós perdoamos a quem nos tem ofendido; [...] e não nos deixeis cair em tentação, [...] mas livrai-nos do mal. Amém!",
  aveMaria: "Ave Maria, cheia de graça, [...] o Senhor é convosco; [...] bendita sois vós entre as mulheres, [...] e bendito é o fruto do vosso ventre, Jesus. [...] Santa Maria, Mãe de Deus, [...] rogai por nós, pecadores, [...] agora e na hora da nossa morte. Amém!",
  gloria: "Glória ao Pai, ao Filho e ao Espírito Santo. [...] Como era no princípio, agora e sempre. Amém! [...] Ó meu Jesus, perdoai-nos, livrai-nos do fogo do inferno, [...] levai as almas todas para o céu [...] e socorrei principalmente as que mais precisarem. Amém!",
  salveRainha: "Salve, Rainha, Mãe de misericórdia, [...] vida, doçura e esperança nossa, salve! [...] A vós bradamos os degredados filhos de Eva. [...] A vós suspiramos, gemendo e chorando neste vale de lágrimas. [...] Eia, pois, advogada nossa, [...] esses vossos olhos misericordiosos a nós volvei, [...] e depois deste desterro mostrai-nos Jesus, [...] bendito fruto do vosso ventre, [...] ó clemente, ó piedosa, ó doce sempre Virgem Maria. [...] Rogai por nós, Santa Mãe de Deus, [...] para que sejamos dignos das promessas de Cristo. Amém!",
  santoAnjo: "Santo Anjo do Senhor, [...] meu zeloso guardador, [...] se a ti me confiou a piedade divina, [...] sempre me rege, me guarda, [...] me governa, me ilumina. Amém! [...] Nossa Senhora Rainha da Paz, rogai por nós!"
};

/* ============================================================================
   SOM DE SININHO CELESTIAL
   ============================================================================ */
function playBeadClickSound() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.15);
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.25);
  } catch {
    // Silencioso
  }
}

/* ============================================================================
   GERAÇÃO DOS PASSOS
   ============================================================================ */
function buildPrayerSteps(mysteryGroup: MysteryGroupData): PrayerStep[] {
  const steps: PrayerStep[] = [];

  // Sinal da Cruz e Credo
  steps.push({
    id: 'credo',
    title: 'Sinal da Cruz e o Credo',
    subtitle: 'Segure a Cruz e professe a nossa Fé',
    category: 'credo',
    audioSrc: '/terco-kids/CREIO.mp3',
    state: 'falando',
    text: PRAYERS_TEXT.credo,
    beadId: 'bead-cross'
  });

  // Pai Nosso Inicial
  steps.push({
    id: 'pai-nosso-intro',
    title: 'Pai Nosso Inicial',
    subtitle: 'A oração que Jesus nos ensinou',
    category: 'pai-nosso',
    audioSrc: '/terco-kids/pai-nosso.mp3',
    state: 'falando',
    text: PRAYERS_TEXT.paiNosso,
    beadId: 'bead-pn-intro'
  });

  // 3 Ave-Marias Iniciais
  steps.push({
    id: 'ave-maria-intro-1',
    title: '1ª Ave-Maria: Virtude da Fé',
    subtitle: 'Para confiar sempre em Jesus',
    category: 'ave-maria',
    audioSrc: '/terco-kids/ave-maria.mp3',
    state: 'falando',
    text: PRAYERS_TEXT.aveMaria,
    beadId: 'bead-ave-intro-1'
  });

  steps.push({
    id: 'ave-maria-intro-2',
    title: '2ª Ave-Maria: Virtude da Esperança',
    subtitle: 'Para esperar com alegria no Céu',
    category: 'ave-maria',
    audioSrc: '/terco-kids/ave-maria-2.mp3',
    state: 'falando',
    text: PRAYERS_TEXT.aveMaria,
    beadId: 'bead-ave-intro-2'
  });

  steps.push({
    id: 'ave-maria-intro-3',
    title: '3ª Ave-Maria: Virtude da Caridade',
    subtitle: 'Para amar a todos os irmãos',
    category: 'ave-maria',
    audioSrc: '/terco-kids/ave-maria.mp3',
    state: 'falando',
    text: PRAYERS_TEXT.aveMaria,
    beadId: 'bead-ave-intro-3'
  });

  // Glória Inicial
  steps.push({
    id: 'gloria-intro',
    title: 'Glória ao Pai Inicial',
    subtitle: 'Louvor a Deus Pai, Filho e Espírito Santo',
    category: 'gloria',
    audioSrc: '/terco-kids/gloria-ao-pai.mp3',
    state: 'falando',
    text: PRAYERS_TEXT.gloria,
    beadId: 'bead-gloria-intro'
  });

  // 5 Dezenas
  mysteryGroup.mysteries.forEach((mystery, decIdx) => {
    // Pai Nosso da Dezena (e Anúncio)
    steps.push({
      id: `misterio-${decIdx + 1}-pn`,
      title: `${mystery.number}º Mistério: ${mystery.title}`,
      subtitle: `Pai Nosso da ${decIdx + 1}ª Dezena`,
      category: 'pai-nosso',
      mysteryNumber: mystery.number,
      decadeIndex: decIdx,
      audioSrc: mystery.audioSrc || '/terco-kids/pai-nosso.mp3',
      state: 'ensinando',
      text: `${mystery.kidsExplanation} [...] Vamos rezar juntos: [...] ` + PRAYERS_TEXT.paiNosso,
      fruit: mystery.fruit,
      beadId: `bead-dec-${decIdx}-pn`
    });

    // 10 Ave-Marias
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
        beadId: `bead-dec-${decIdx}-ave-${aveIdx}`
      });
    }

    // Glória ao Pai
    steps.push({
      id: `misterio-${decIdx + 1}-gloria`,
      title: `Glória ao Pai (${mystery.number}º Mistério)`,
      subtitle: 'Glória ao Pai e Oração de Fátima',
      category: 'gloria',
      mysteryNumber: mystery.number,
      decadeIndex: decIdx,
      audioSrc: decIdx % 2 === 0 ? '/terco-kids/gloria-ao-pai.mp3' : '/terco-kids/gloria-ao-pai-2.mp3',
      state: 'falando',
      text: PRAYERS_TEXT.gloria,
      beadId: `bead-dec-${decIdx}-gloria`
    });
  });

  // Salve Rainha na Medalha
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

  // Bênção Final
  steps.push({
    id: 'final-blessing',
    title: 'Parabéns! Terço Concluído com Amor! 🌟',
    subtitle: 'Oração ao Santo Anjo da Guarda',
    category: 'final',
    audioSrc: '/terco-kids/santo-anjo.mp3',
    state: 'sorrindo',
    text: "Parabéns, meu querido amiguinho! [...] Você concluiu o Santo Terço com muito amor no coração! [...] Vamos rezar ao nosso Anjinho da Guarda: [...] " + PRAYERS_TEXT.santoAnjo,
    beadId: 'bead-medal'
  });

  return steps;
}

/* ============================================================================
   CÁLCULO GEOMÉTRICO DO TERÇO AMPLIADO E LIMPO
   ============================================================================ */
function generateCleanRosaryTrail(): { beads: RosaryTrailBead[]; cordPath: string; stemPath: string } {
  const beads: RosaryTrailBead[] = [];

  // Dimensões do viewBox: 800 x 980 (espaçoso, grande e sem poluição)
  const cx = 400;
  const cy = 300;
  const rx = 295;
  const ry = 225;

  // 1. HASTE VERTICAL (Crucifixo -> Medalha)
  beads.push({
    id: 'bead-cross',
    x: 400,
    y: 890,
    radius: 26,
    type: 'cross',
    tooltip: 'Crucifixo: Sinal da Cruz e Credo'
  });

  beads.push({
    id: 'bead-pn-intro',
    x: 400,
    y: 795,
    radius: 19,
    type: 'pn-intro',
    label: 'PN',
    tooltip: 'Pai Nosso Inicial'
  });

  beads.push({
    id: 'bead-ave-intro-1',
    x: 400,
    y: 740,
    radius: 13,
    type: 'ave-intro',
    colorHex: PASTEL_BEAD_THEMES[0].hex,
    gradientId: PASTEL_BEAD_THEMES[0].gradientId,
    label: '1',
    tooltip: '1ª Ave-Maria'
  });

  beads.push({
    id: 'bead-ave-intro-2',
    x: 400,
    y: 692,
    radius: 13,
    type: 'ave-intro',
    colorHex: PASTEL_BEAD_THEMES[1].hex,
    gradientId: PASTEL_BEAD_THEMES[1].gradientId,
    label: '2',
    tooltip: '2ª Ave-Maria'
  });

  beads.push({
    id: 'bead-ave-intro-3',
    x: 400,
    y: 644,
    radius: 13,
    type: 'ave-intro',
    colorHex: PASTEL_BEAD_THEMES[2].hex,
    gradientId: PASTEL_BEAD_THEMES[2].gradientId,
    label: '3',
    tooltip: '3ª Ave-Maria'
  });

  beads.push({
    id: 'bead-gloria-intro',
    x: 400,
    y: 596,
    radius: 10,
    type: 'gloria-intro',
    tooltip: 'Glória ao Pai Inicial'
  });

  // 2. MEDALHA CENTRAL DE NOSSA SENHORA
  beads.push({
    id: 'bead-medal',
    x: 400,
    y: 530,
    radius: 32,
    type: 'medal',
    tooltip: 'Medalha de Nossa Senhora'
  });

  // 3. O GRANDE ARCO DAS 5 DEZENAS (60 nós)
  const loopCoords: { x: number; y: number }[] = [];

  for (let dec = 0; dec < 5; dec++) {
    const startAngle = 18 + dec * 64.8;

    // Pai Nosso da Dezena (Bola Grande Dourada)
    const pnRad = (startAngle * Math.PI) / 180;
    const pnx = +(cx + rx * Math.sin(pnRad)).toFixed(1);
    const pny = +(cy + ry * Math.cos(pnRad)).toFixed(1);

    beads.push({
      id: `bead-dec-${dec}-pn`,
      x: pnx,
      y: pny,
      radius: 19,
      type: 'pn-decade',
      decadeIndex: dec,
      label: `${dec + 1}º`,
      tooltip: `${dec + 1}ª Dezena: Pai Nosso`
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
        radius: 12.5,
        type: 'ave-decade',
        decadeIndex: dec,
        aveIndex: ave,
        colorHex: theme.hex,
        gradientId: theme.gradientId,
        label: `${ave}`,
        tooltip: `${ave}ª Ave-Maria`
      });
      loopCoords.push({ x: aveX, y: aveY });
    }

    // Glória ao Pai da Dezena (Bolinha Vermelha)
    const gloriaAngle = startAngle + 55;
    const gloriaRad = (gloriaAngle * Math.PI) / 180;
    const gx = +(cx + rx * Math.sin(gloriaRad)).toFixed(1);
    const gy = +(cy + ry * Math.cos(gloriaRad)).toFixed(1);

    beads.push({
      id: `bead-dec-${dec}-gloria`,
      x: gx,
      y: gy,
      radius: 10,
      type: 'gloria-decade',
      decadeIndex: dec,
      tooltip: `Glória ao Pai da ${dec + 1}ª Dezena`
    });
    loopCoords.push({ x: gx, y: gy });
  }

  const stemPath = `M 400,860 L 400,565`;
  const medalTop = `400,496`;
  const loopPathPoints = loopCoords.map(p => `${p.x},${p.y}`).join(' L ');
  const cordPath = `M ${medalTop} L ${loopPathPoints} Z`;

  return { beads, cordPath, stemPath };
}

/* ============================================================================
   COMPONENTE PRINCIPAL
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
  const [activePhraseIndex, setActivePhraseIndex] = useState<number>(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const preloaderRef = useRef<HTMLAudioElement | null>(null);
  const progressIntervalRef = useRef<any>(null);

  const rosaryTrail = useMemo(() => generateCleanRosaryTrail(), []);

  // Frases curtas para leitura acompanhada
  const phrases = useMemo(() => {
    return currentStep.text
      .split(/\[\.\.\.\]/g)
      .map((p) => p.trim())
      .filter((p) => p.length > 0);
  }, [currentStep.text]);

  // Inicializa áudio
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

  // Síntese de voz fallback
  const speakWithSynthesis = useCallback((textToSpeak: string, onEnd?: () => void) => {
    if (!('speechSynthesis' in window)) {
      if (onEnd) onEnd();
      return;
    }
    window.speechSynthesis.cancel();
    const cleanText = textToSpeak.replace(/\[\.\.\.\]/g, ', ');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'pt-BR';
    utterance.rate = 0.88;
    utterance.pitch = 1.15;
    utterance.onend = () => { if (onEnd) onEnd(); };
    utterance.onerror = () => { if (onEnd) onEnd(); };
    window.speechSynthesis.speak(utterance);
  }, []);

  // Para áudios
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
  }, []);

  // Avançar passo
  const goToNextStep = useCallback(() => {
    stopAllAudio();
    playBeadClickSound();
    setCurrentStepIndex((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    setActivePhraseIndex(0);
  }, [steps.length, stopAllAudio]);

  // Voltar passo
  const goToPrevStep = useCallback(() => {
    stopAllAudio();
    playBeadClickSound();
    setCurrentStepIndex((prev) => (prev > 0 ? prev - 1 : 0));
    setActivePhraseIndex(0);
  }, [stopAllAudio]);

  // Clicar em uma conta da trilha
  const jumpToBead = useCallback((beadId: string) => {
    stopAllAudio();
    playBeadClickSound();
    const targetIdx = steps.findIndex((s) => s.beadId === beadId);
    if (targetIdx !== -1) {
      setCurrentStepIndex(targetIdx);
      setActivePhraseIndex(0);
    }
  }, [steps, stopAllAudio]);

  // Reproduzir áudio atual
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
          progressIntervalRef.current = setInterval(() => {
            if (audio.duration && !isNaN(audio.duration) && phrases.length > 0) {
              const phraseIdx = Math.min(
                Math.floor((audio.currentTime / audio.duration) * phrases.length),
                phrases.length - 1
              );
              setActivePhraseIndex(phraseIdx);
            }
          }, 150);

          audio.onended = () => {
            clearInterval(progressIntervalRef.current);
            setIsPlaying(false);
            if (currentStepIndex < steps.length - 1) {
              setTimeout(() => {
                goToNextStep();
              }, 800);
            }
          };
        })
        .catch(() => {
          setIsPlaying(true);
          speakWithSynthesis(currentStep.text, () => {
            setIsPlaying(false);
            if (currentStepIndex < steps.length - 1) {
              setTimeout(() => {
                goToNextStep();
              }, 800);
            }
          });
        });
    }
  }, [currentStep.audioSrc, currentStep.text, currentStepIndex, goToNextStep, isMuted, phrases.length, speakWithSynthesis, steps.length]);

  const togglePlayPause = () => {
    if (isPlaying) {
      stopAllAudio();
    } else {
      playCurrentStepAudio();
    }
  };

  const isBeadActive = (beadId: string) => currentStep.beadId === beadId;
  const isBeadCompleted = (beadId: string) => {
    const beadStepIdx = steps.findIndex((s) => s.beadId === beadId);
    return beadStepIdx !== -1 && beadStepIdx < currentStepIndex;
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 py-2 sm:py-4 select-none font-sans text-slate-800 dark:text-amber-50">
      
      {/* 1. SELETOR LIMPO DOS 4 MISTÉRIOS NO TOPO */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
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
              className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 border shadow-xs ${
                isSelected
                  ? 'bg-amber-500 text-white border-amber-600 scale-105 shadow-md'
                  : 'bg-white/90 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-amber-200 dark:border-slate-700 hover:bg-amber-50'
              }`}
            >
              <span>{group.badgeEmoji}</span>
              <span>{group.name}</span>
              {isToday && (
                <span className="text-[10px] bg-white/25 text-white px-1.5 py-0.2 rounded-full font-black uppercase">
                  Hoje
                </span>
              )}
            </button>
          );
        })}

        {onSwitchToAdult && (
          <button
            type="button"
            onClick={onSwitchToAdult}
            className="px-3 py-1.5 rounded-full text-xs font-semibold text-slate-500 hover:text-slate-700 dark:text-slate-400 hover:underline"
          >
            Modo Adulto
          </button>
        )}
      </div>

      {/* 2. LAYOUT LIMPO COM DOIS BLOCOS: TERÇO GIGANTE (ESQUERDA) + CARD DE NOSSA SENHORA (DIREITA) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        
        {/* BLOCO 1: O TERÇO GRANDE, FLUIDO E CENTRALIZADO (SEM POLUIÇÃO VISUAL) */}
        <div className="lg:col-span-7 xl:col-span-7 flex flex-col items-center justify-center bg-white/60 dark:bg-slate-900/40 rounded-3xl p-2 sm:p-4 border border-amber-100 dark:border-slate-800">
          
          <div className="w-full max-w-[620px] aspect-[800/980] relative flex items-center justify-center">
            <svg
              viewBox="0 0 800 980"
              className="w-full h-full drop-shadow-sm select-none"
              style={{ overflow: 'visible' }}
            >
              <defs>
                {/* Sombra das contas */}
                <filter id="cleanShadow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="2" stdDeviation="2.5" floodOpacity="0.2" floodColor="#78350f" />
                </filter>

                {/* Dourado para Pai Nosso */}
                <radialGradient id="cleanGoldGrad" cx="35%" cy="35%" r="65%">
                  <stop offset="0%" stopColor="#fef08a" />
                  <stop offset="45%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#b45309" />
                </radialGradient>

                {/* Rubi para Glória */}
                <radialGradient id="cleanRubyGrad" cx="35%" cy="35%" r="65%">
                  <stop offset="0%" stopColor="#fca5a5" />
                  <stop offset="50%" stopColor="#ef4444" />
                  <stop offset="100%" stopColor="#991b1b" />
                </radialGradient>

                {/* 10 Cores Pastéis Vivas das Ave-Marias */}
                <radialGradient id="grad-ave-0" cx="35%" cy="35%" r="65%"><stop offset="0%" stopColor="#ffe4e6" /><stop offset="60%" stopColor="#fda4af" /><stop offset="100%" stopColor="#f43f5e" /></radialGradient>
                <radialGradient id="grad-ave-1" cx="35%" cy="35%" r="65%"><stop offset="0%" stopColor="#e0f2fe" /><stop offset="60%" stopColor="#7dd3fc" /><stop offset="100%" stopColor="#0284c7" /></radialGradient>
                <radialGradient id="grad-ave-2" cx="35%" cy="35%" r="65%"><stop offset="0%" stopColor="#fef3c7" /><stop offset="60%" stopColor="#fcd34d" /><stop offset="100%" stopColor="#d97706" /></radialGradient>
                <radialGradient id="grad-ave-3" cx="35%" cy="35%" r="65%"><stop offset="0%" stopColor="#d1fae5" /><stop offset="60%" stopColor="#6ee7b7" /><stop offset="100%" stopColor="#059669" /></radialGradient>
                <radialGradient id="grad-ave-4" cx="35%" cy="35%" r="65%"><stop offset="0%" stopColor="#ede9fe" /><stop offset="60%" stopColor="#c4b5fd" /><stop offset="100%" stopColor="#7c3aed" /></radialGradient>
                <radialGradient id="grad-ave-5" cx="35%" cy="35%" r="65%"><stop offset="0%" stopColor="#ffedd5" /><stop offset="60%" stopColor="#fdba74" /><stop offset="100%" stopColor="#ea580c" /></radialGradient>
                <radialGradient id="grad-ave-6" cx="35%" cy="35%" r="65%"><stop offset="0%" stopColor="#cffafe" /><stop offset="60%" stopColor="#67e8f9" /><stop offset="100%" stopColor="#0891b2" /></radialGradient>
                <radialGradient id="grad-ave-7" cx="35%" cy="35%" r="65%"><stop offset="0%" stopColor="#fce7f3" /><stop offset="60%" stopColor="#f472b6" /><stop offset="100%" stopColor="#db2777" /></radialGradient>
                <radialGradient id="grad-ave-8" cx="35%" cy="35%" r="65%"><stop offset="0%" stopColor="#ccfbf1" /><stop offset="60%" stopColor="#5eead4" /><stop offset="100%" stopColor="#0d9488" /></radialGradient>
                <radialGradient id="grad-ave-9" cx="35%" cy="35%" r="65%"><stop offset="0%" stopColor="#fef9c3" /><stop offset="60%" stopColor="#fde047" /><stop offset="100%" stopColor="#ca8a04" /></radialGradient>

                <clipPath id="cleanMedalClip">
                  <ellipse cx="400" cy="530" rx="28" ry="34" />
                </clipPath>
              </defs>

              {/* Cordão Dourado Suave */}
              <path
                d={rosaryTrail.stemPath}
                fill="none"
                stroke="#d97706"
                strokeWidth="4"
                strokeDasharray="4 3"
                opacity="0.65"
              />
              <path
                d={rosaryTrail.cordPath}
                fill="none"
                stroke="#d97706"
                strokeWidth="4"
                strokeDasharray="4 3"
                opacity="0.65"
              />

              {/* Centro do Terço: Título Limpo do Mistério Atual */}
              <g transform="translate(400, 300)" className="pointer-events-none">
                <circle r="90" fill="#ffffff" fillOpacity="0.75" stroke="#fcd34d" strokeWidth="2" className="dark:fill-slate-900/80 dark:stroke-amber-600/40" />
                <text y="-25" textAnchor="middle" fontSize="30">🕊️</text>
                <text y="5" textAnchor="middle" fontSize="13" fontWeight="bold" fill="#78350f" className="dark:fill-amber-200">
                  {currentStep.mysteryNumber ? `${currentStep.mysteryNumber}º MISTÉRIO` : 'SANTO TERÇO'}
                </text>
                <text y="25" textAnchor="middle" fontSize="11" fontWeight="600" fill="#92400e" className="dark:fill-amber-300">
                  {currentStep.mysteryNumber ? activeGroup.mysteries[currentStep.mysteryNumber - 1]?.title.slice(0, 26) + '...' : 'Reze com Amor'}
                </text>
              </g>

              {/* Contas Grandes e Clicáveis */}
              {rosaryTrail.beads.map((bead) => {
                const active = isBeadActive(bead.id);
                const completed = isBeadCompleted(bead.id);

                return (
                  <g
                    key={bead.id}
                    className="cursor-pointer transition-transform duration-200 hover:scale-110"
                    onClick={() => jumpToBead(bead.id)}
                  >
                    {/* Área de Toque Invisível Ampliada (Touch Target) */}
                    <circle cx={bead.x} cy={bead.y} r={bead.radius + 10} fill="transparent" />

                    {/* Destaque suave na conta ativa */}
                    {active && (
                      <>
                        <circle
                          cx={bead.x}
                          cy={bead.y}
                          r={bead.radius + 9}
                          fill="none"
                          stroke="#f59e0b"
                          strokeWidth="3.5"
                          opacity="0.85"
                          className="animate-pulse"
                        />
                        <text
                          x={bead.x}
                          y={bead.y - bead.radius - 8}
                          textAnchor="middle"
                          fontSize="20"
                          className="animate-bounce"
                        >
                          ⭐
                        </text>
                      </>
                    )}

                    {/* Crucifixo */}
                    {bead.type === 'cross' && (
                      <g transform={`translate(${bead.x - 24}, ${bead.y - 36})`}>
                        <rect x="17" y="0" width="14" height="72" rx="3" fill="#1e3a8a" stroke="#f59e0b" strokeWidth="2.5" filter="url(#cleanShadow)" />
                        <rect x="0" y="17" width="48" height="14" rx="3" fill="#1e3a8a" stroke="#f59e0b" strokeWidth="2.5" />
                        <text x="24" y="28" textAnchor="middle" fontSize="10">✝️</text>
                      </g>
                    )}

                    {/* Medalha de Nossa Senhora */}
                    {bead.type === 'medal' && (
                      <g>
                        <ellipse
                          cx={bead.x}
                          cy={bead.y}
                          rx={bead.radius}
                          ry={bead.radius + 6}
                          fill="#fef08a"
                          stroke="#d97706"
                          strokeWidth="3"
                          filter="url(#cleanShadow)"
                        />
                        <image
                          href="/terco-kids/SORINDO-NORMAL.png"
                          x={bead.x - 25}
                          y={bead.y - 30}
                          width="50"
                          height="60"
                          clipPath="url(#cleanMedalClip)"
                          preserveAspectRatio="xMidYMid slice"
                        />
                      </g>
                    )}

                    {/* Pai Nosso (Grande Dourado) */}
                    {(bead.type === 'pn-intro' || bead.type === 'pn-decade') && (
                      <g>
                        <circle
                          cx={bead.x}
                          cy={bead.y}
                          r={bead.radius}
                          fill="url(#cleanGoldGrad)"
                          stroke="#78350f"
                          strokeWidth="1.5"
                          filter="url(#cleanShadow)"
                        />
                        <text x={bead.x} y={bead.y + 4.5} textAnchor="middle" fontSize="11" fontWeight="bold" fill="#78350f">
                          👑
                        </text>
                      </g>
                    )}

                    {/* Glória ao Pai (Bolinha Vermelha) */}
                    {(bead.type === 'gloria-intro' || bead.type === 'gloria-decade') && (
                      <circle
                        cx={bead.x}
                        cy={bead.y}
                        r={bead.radius}
                        fill="url(#cleanRubyGrad)"
                        stroke="#7f1d1d"
                        strokeWidth="1.2"
                        filter="url(#cleanShadow)"
                      />
                    )}

                    {/* Ave-Marias (Grandes e Coloridas) */}
                    {(bead.type === 'ave-intro' || bead.type === 'ave-decade') && (
                      <g>
                        <circle
                          cx={bead.x}
                          cy={bead.y}
                          r={bead.radius}
                          fill={`url(#${bead.gradientId || 'grad-ave-0'})`}
                          stroke={bead.colorHex || '#d97706'}
                          strokeWidth="1.5"
                          filter="url(#cleanShadow)"
                        />
                        <circle cx={bead.x - 3} cy={bead.y - 3} r={bead.radius * 0.35} fill="#ffffff" opacity="0.6" />
                        <text x={bead.x} y={bead.y + 4} textAnchor="middle" fontSize="9" fontWeight="bold" fill="#ffffff">
                          {completed ? '✓' : bead.label}
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* BLOCO 2: CARD ACOLHEDOR DE NOSSA SENHORA COM BALÃO DE FALA E CONTROLES */}
        <div className="lg:col-span-5 xl:col-span-5 flex flex-col gap-4">
          
          <div className="bg-gradient-to-b from-amber-50 to-orange-50/30 dark:from-slate-900 dark:to-slate-950 rounded-3xl p-5 sm:p-6 shadow-lg border border-amber-200 dark:border-amber-800/50">
            
            {/* PERSONAGEM: NOSSA SENHORA */}
            <div className="flex items-center gap-4 mb-4">
              <div className="relative">
                <div className="absolute -inset-1.5 bg-amber-300 rounded-full blur-sm opacity-70 animate-pulse" />
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-3 border-amber-300 shadow-md bg-amber-100 flex items-center justify-center">
                  <img
                    src={isPlaying ? AVATAR_IMAGES.falando : AVATAR_IMAGES.sorrindo}
                    alt="Nossa Senhora ensinando a rezar"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = '/terco-kids/SORINDO-NORMAL.png';
                    }}
                  />
                </div>
                <div className="absolute -bottom-1 -right-1 bg-amber-500 text-white rounded-full p-1 shadow-sm">
                  <Heart className="w-3.5 h-3.5 fill-white" />
                </div>
              </div>

              <div>
                <span className="text-xs font-bold text-amber-700 dark:text-amber-300 uppercase tracking-wide">
                  Mãezinha do Céu
                </span>
                <h2 className="text-xl font-serif font-black text-amber-950 dark:text-amber-100">
                  {currentStep.title}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {currentStep.subtitle}
                </p>
              </div>
            </div>

            {/* BALÃO DE CONVERSA COM A ORAÇÃO LIMPA E DESTACADA */}
            <div className="relative bg-white dark:bg-slate-850 rounded-3xl p-5 shadow-sm border border-amber-200/80 dark:border-slate-700 min-h-[160px] flex flex-col justify-center">
              
              {/* Cauda suave do balão */}
              <div className="absolute -top-2.5 left-8 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[10px] border-b-white dark:border-b-slate-850" />

              <div className="space-y-2 text-sm sm:text-base leading-relaxed text-slate-700 dark:text-slate-200 max-h-[220px] overflow-y-auto">
                {phrases.map((phrase, idx) => {
                  const isCurrentPhrase = isPlaying && activePhraseIndex === idx;

                  return (
                    <p
                      key={idx}
                      className={`transition-colors duration-200 rounded-lg px-2 py-0.5 ${
                        isCurrentPhrase
                          ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-950 dark:text-amber-200 font-bold border-l-3 border-amber-500'
                          : ''
                      }`}
                    >
                      {phrase}
                    </p>
                  );
                })}
              </div>
            </div>

            {/* BOTÕES GRANDES DE NAVEGAÇÃO */}
            <div className="mt-5 space-y-3">
              
              {/* Botão Gigante de Ouvir / Pausar */}
              <button
                type="button"
                onClick={togglePlayPause}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 text-white font-black text-base sm:text-lg shadow-md hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-3 cursor-pointer"
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-6 h-6 fill-white" />
                    <span>Pausar Oração</span>
                  </>
                ) : (
                  <>
                    <Play className="w-6 h-6 fill-white" />
                    <span>Ouvir Oração</span>
                  </>
                )}
              </button>

              {/* Botões de Voltar e Avançar */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={goToPrevStep}
                  disabled={currentStepIndex === 0}
                  className="py-3 px-4 rounded-xl bg-white dark:bg-slate-800 border border-amber-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold text-sm flex items-center justify-center gap-2 hover:bg-amber-50 disabled:opacity-40 cursor-pointer shadow-xs"
                >
                  <SkipBack className="w-4 h-4" />
                  <span>Voltar</span>
                </button>

                <button
                  type="button"
                  onClick={goToNextStep}
                  disabled={currentStepIndex >= steps.length - 1}
                  className="py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-40"
                >
                  <span>Próxima</span>
                  <SkipForward className="w-4 h-4" />
                </button>
              </div>

              {/* Controle simples de som */}
              <div className="flex items-center justify-between pt-2 text-xs text-slate-500 dark:text-slate-400">
                <button
                  type="button"
                  onClick={() => setIsMuted((prev) => !prev)}
                  className="flex items-center gap-1.5 hover:text-amber-700 cursor-pointer"
                >
                  {isMuted ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4 text-emerald-600" />}
                  <span>{isMuted ? 'Sem som' : 'Com som'}</span>
                </button>

                <span>Conta {currentStepIndex + 1} de {steps.length}</span>
              </div>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};

export default SantoTercoKids;
