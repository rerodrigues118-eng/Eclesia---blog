import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX } from 'lucide-react';

/* ============================================================================
   TIPOS
   ============================================================================ */
export type MysteryGroupKids = 'gozosos' | 'dolorosos' | 'gloriosos' | 'luminosos';

export interface PrayerStep {
  id: string;
  title: string;
  shortText: string;     // fala curta para o balão de Nossa Senhora
  audioSrc: string;
  mysteryNumber?: number;
  decadeIndex?: number;
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

/* ============================================================================
   MISTÉRIOS COM TEXTOS E ÁUDIOS INFANTIS
   ============================================================================ */
export const KIDS_MYSTERY_GROUPS: MysteryGroupData[] = [
  {
    id: 'gozosos', name: 'Mistérios Gozosos', badgeEmoji: '🌟', days: [1, 6],
    mysteries: [
      { number: 1, title: 'A Anunciação do Anjo Gabriel', kidsExplanation: 'O lindo anjo Gabriel diz a Maria que ela será a Mãezinha de Jesus! 🌸', audioSrc: '/terco-kids/gozoso-1.mp3', fruit: 'Humildade' },
      { number: 2, title: 'A Visita de Maria a Santa Isabel', kidsExplanation: 'Maria vai ajudar sua prima Isabel com muito amor e alegria! 💛', audioSrc: '/terco-kids/gozoso-2.mp3', fruit: 'Caridade' },
      { number: 3, title: 'O Nascimento de Jesus em Belém', kidsExplanation: 'Jesus nasce numa manjedoura simples, cheio de luz e amor! ⭐', audioSrc: '/terco-kids/gozoso-3.mp3', fruit: 'Gratidão' },
      { number: 4, title: 'A Apresentação de Jesus no Templo', kidsExplanation: 'Maria e José apresentam o bebê Jesus a Deus Pai com muita alegria! 🕊️', audioSrc: '/terco-kids/gozoso-4.mp3', fruit: 'Pureza' },
      { number: 5, title: 'O Menino Jesus no Templo', kidsExplanation: 'Jesus ensina os sábios com muita sabedoria e amor a Deus! 📖', audioSrc: '/terco-kids/gozoso-5.mp3', fruit: 'Buscar Jesus' },
    ]
  },
  {
    id: 'dolorosos', name: 'Mistérios Dolorosos', badgeEmoji: '❤️‍🔥', days: [2, 5],
    mysteries: [
      { number: 1, title: 'A Oração de Jesus no Horto', kidsExplanation: 'Jesus reza com muito amor por todos nós no jardim! 🙏', audioSrc: '/terco-kids/doloroso-1.mp3', fruit: 'Confiança' },
      { number: 2, title: 'A Flagelação de Jesus', kidsExplanation: 'Jesus sofre com paciência por amor a cada um de nós! 💝', audioSrc: '/terco-kids/doloroso-2.mp3', fruit: 'Paciência' },
      { number: 3, title: 'A Coroação de Espinhos', kidsExplanation: 'Jesus é o verdadeiro Rei do Amor, mesmo sofrendo! 👑', audioSrc: '/terco-kids/doloroso-3.mp3', fruit: 'Humildade' },
      { number: 4, title: 'Jesus Carrega a Cruz', kidsExplanation: 'Jesus abraça a cruz com coragem e amor por nós! ✝️', audioSrc: '/terco-kids/doloroso-4.mp3', fruit: 'Ajudar' },
      { number: 5, title: 'A Morte de Jesus na Cruz', kidsExplanation: 'Jesus nos dá Maria como Mãe e abre as portas do Céu! 💖', audioSrc: '/terco-kids/doloroso-5.mp3', fruit: 'Perdão' },
    ]
  },
  {
    id: 'gloriosos', name: 'Mistérios Gloriosos', badgeEmoji: '👑', days: [0, 3],
    mysteries: [
      { number: 1, title: 'A Ressurreição de Jesus', kidsExplanation: 'Jesus ressuscita cheio de luz e vitória! Aleluia! 🌅', audioSrc: '/terco-kids/glorioso-1.mp3', fruit: 'Fé e alegria' },
      { number: 2, title: 'A Ascensão de Jesus ao Céu', kidsExplanation: 'Jesus sobe ao Céu para nos preparar um lugar lindo! ☁️', audioSrc: '/terco-kids/glorioso-2.mp3', fruit: 'Esperança' },
      { number: 3, title: 'A Vinda do Espírito Santo', kidsExplanation: 'O Espírito Santo desce como fogo de amor sobre Maria e os apóstolos! 🔥', audioSrc: '/terco-kids/glorioso-3.mp3', fruit: 'Sabedoria' },
      { number: 4, title: 'A Assunção de Nossa Senhora', kidsExplanation: 'Os anjinhos levam Maria para o Céu em corpo e alma! 🌸', audioSrc: '/terco-kids/glorioso-4.mp3', fruit: 'Confiança' },
      { number: 5, title: 'A Coroação de Maria Rainha', kidsExplanation: 'Maria é coroada Rainha do Céu com 12 estrelas! 👸', audioSrc: '/terco-kids/glorioso-5.mp3', fruit: 'Amor a Maria' },
    ]
  },
  {
    id: 'luminosos', name: 'Mistérios Luminosos', badgeEmoji: '💡', days: [4],
    mysteries: [
      { number: 1, title: 'O Batismo de Jesus no Jordão', kidsExplanation: 'Deus diz: "Este é meu Filho muito amado!" ao batizar Jesus! 🕊️', audioSrc: '/terco-kids/luminoso-1.mp3', fruit: 'Pureza' },
      { number: 2, title: 'O Milagre em Caná', kidsExplanation: 'Maria pede e Jesus transforma água em vinho com amor! 🍇', audioSrc: '/terco-kids/luminoso-2.mp3', fruit: 'Obediência' },
      { number: 3, title: 'O Anúncio do Reino de Deus', kidsExplanation: 'Jesus cura, abraça crianças e ensina o amor! 💛', audioSrc: '/terco-kids/luminoso-3.mp3', fruit: 'Bondade' },
      { number: 4, title: 'A Transfiguração no Monte Tabor', kidsExplanation: 'Jesus brilha como o sol no alto do monte! ✨', audioSrc: '/terco-kids/luminoso-4.mp3', fruit: 'Oração' },
      { number: 5, title: 'A Instituição da Eucaristia', kidsExplanation: 'Jesus fica para sempre conosco na Santa Hóstia! 🍞', audioSrc: '/terco-kids/luminoso-5.mp3', fruit: 'Amor à Missa' },
    ]
  }
];

/* ============================================================================
   TEXTOS CURTOS PARA O BALÃO DE DIÁLOGO
   ============================================================================ */
const SHORT_TEXTS = {
  credo:    'Vamos começar rezando o Sinal da Cruz e o Santo Credo! ✝️',
  pnIntro:  'Rezemos juntos o Pai Nosso, a oração que Jesus nos ensinou! 🙏',
  av1:      'Primeira Ave-Maria pela Santa Fé! 🌸',
  av2:      'Segunda Ave-Maria pela Santa Esperança! 💛',
  av3:      'Terceira Ave-Maria pela Santa Caridade! 💖',
  gloriaI:  'Glória ao Pai, ao Filho e ao Espírito Santo! ✨',
  trans:    'Mãezinha do Céu, abençoai nossa oração ao iniciarmos os Santos Mistérios! 🌸',
  salve:    'Salve Rainha! Vamos rezar com muito amor à nossa Mãezinha do Céu! 👑',
  final:    'Parabéns! Você terminou o Santo Terço com muito amor e fé! 🎉',
};

/* ============================================================================
   SOM DE SININHO SUAVE
   ============================================================================ */
function playBell() {
  try {
    const Ctx = window.AudioContext || (window as any).webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const osc = ctx.createOscillator();
    const g   = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.15);
    g.gain.setValueAtTime(0.18, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.28);
    osc.connect(g); g.connect(ctx.destination);
    osc.start(); osc.stop(ctx.currentTime + 0.28);
  } catch { /* silencioso */ }
}

/* ============================================================================
   CONSTRUÇÃO DOS PASSOS
   ============================================================================ */
function buildSteps(group: MysteryGroupData): PrayerStep[] {
  const s: PrayerStep[] = [];
  // 1. Sinal da Cruz e Credo
  s.push({ id: 'credo',  title: 'Sinal da Cruz e o Credo',  shortText: SHORT_TEXTS.credo,   audioSrc: '/terco-kids/CREIO.mp3',        beadId: 'bead-cross'   });
  // 2. Pai Nosso Inicial
  s.push({ id: 'pn0',    title: 'Pai Nosso Inicial',         shortText: SHORT_TEXTS.pnIntro, audioSrc: '/terco-kids/pai-nosso.mp3',    beadId: 'bead-pn-intro' });
  // 3-5. 3 Ave-Marias
  s.push({ id: 'av0-1',  title: '1ª Ave-Maria — pela Fé',    shortText: SHORT_TEXTS.av1,     audioSrc: '/terco-kids/ave-maria.mp3',    beadId: 'bead-av0-1'   });
  s.push({ id: 'av0-2',  title: '2ª Ave-Maria — pela Esperança', shortText: SHORT_TEXTS.av2, audioSrc: '/terco-kids/ave-maria-2.mp3',  beadId: 'bead-av0-2'   });
  s.push({ id: 'av0-3',  title: '3ª Ave-Maria — pela Caridade',  shortText: SHORT_TEXTS.av3, audioSrc: '/terco-kids/ave-maria.mp3',    beadId: 'bead-av0-3'   });
  // 6. Glória ao Pai inicial
  s.push({ id: 'gl-i',   title: 'Glória ao Pai',             shortText: SHORT_TEXTS.gloriaI, audioSrc: '/terco-kids/gloria-ao-pai.mp3',beadId: 'bead-gl-intro' });

  // 7. Passo de transição na Medalha de Nossa Senhora
  s.push({
    id: 'trans-medal',
    title: 'Medalha de Nossa Senhora',
    shortText: SHORT_TEXTS.trans,
    audioSrc: '/terco-kids/santo-anjo.mp3',
    beadId: 'bead-medal'
  });

  // 5 Dezenas completas
  group.mysteries.forEach((m, di) => {
    s.push({
      id: `pn${di+1}`,
      title: `${m.number}º Mistério — ${m.title}`,
      shortText: m.kidsExplanation,
      audioSrc: m.audioSrc,
      mysteryNumber: m.number,
      decadeIndex: di,
      fruit: m.fruit,
      beadId: `bead-dec${di}-pn`
    });
    for (let a = 1; a <= 10; a++) {
      s.push({
        id: `av${di+1}-${a}`,
        title: `${a}ª Ave-Maria`,
        shortText: `${a}ª Ave-Maria da ${m.number}ª Dezena — ${m.title} 🌸`,
        audioSrc: a % 2 === 0 ? '/terco-kids/ave-maria-2.mp3' : '/terco-kids/ave-maria.mp3',
        mysteryNumber: m.number,
        decadeIndex: di,
        beadId: `bead-dec${di}-av${a}`
      });
    }
    s.push({
      id: `gl${di+1}`,
      title: `Glória ao Pai — ${m.number}ª Dezena`,
      shortText: `Glória ao Pai! Rezamos com amor pela ${m.number}ª Dezena! ✨`,
      audioSrc: di % 2 === 0 ? '/terco-kids/gloria-ao-pai.mp3' : '/terco-kids/gloria-ao-pai-2.mp3',
      decadeIndex: di,
      beadId: `bead-dec${di}-gl`
    });
  });

  // Retorno à Medalha: Salve Rainha e Conclusão
  s.push({ id: 'salve', title: 'Salve Rainha', shortText: SHORT_TEXTS.salve, audioSrc: '/terco-kids/santo-anjo.mp3', beadId: 'bead-medal' });
  s.push({ id: 'final', title: 'Terço Concluído! 🌟', shortText: SHORT_TEXTS.final, audioSrc: '/terco-kids/santo-anjo.mp3', beadId: 'bead-medal' });
  return s;
}

/* ============================================================================
   GEOMETRIA DAS CONTAS — NOVO FORMATO ESGUIO E VERTICAL (CAIMENTO REAL EM "U" / GOTA)
   ViewBox 0 0 900 1280
   Laço vertical alongado, proporção natural com caimento suave em direção à Medalha,
   e haste inferior confortável com a Cruz Azul e Coração Dourado.
   ============================================================================ */
export interface BeadDef {
  id: string;
  x: number;
  y: number;
  r: number;
  type: 'cross' | 'pn' | 'ave' | 'gloria' | 'medal';
}

function buildBeads(): { beads: BeadDef[]; loopPath: string; stemPath: string } {
  const beads: BeadDef[] = [];
  const loopPts: string[] = [];

  // 1. HASTE VERTICAL INFERIOR (da Cruz subindo até a Medalha)
  // X = 450 fixo, com amplo espaço para não espremer nada
  beads.push({ id: 'bead-cross',    x: 450, y: 1175, r: 28, type: 'cross'  });
  beads.push({ id: 'bead-gl-intro', x: 450, y: 1055, r: 10, type: 'gloria' });
  beads.push({ id: 'bead-av0-3',    x: 450, y: 1005, r: 15, type: 'ave'    });
  beads.push({ id: 'bead-av0-2',    x: 450, y: 960,  r: 15, type: 'ave'    });
  beads.push({ id: 'bead-av0-1',    x: 450, y: 915,  r: 15, type: 'ave'    });
  beads.push({ id: 'bead-pn-intro', x: 450, y: 855,  r: 22, type: 'pn'     });
  beads.push({ id: 'bead-medal',    x: 450, y: 745,  r: 38, type: 'medal'  });

  // 2. LAÇO DAS 5 DEZENAS (Curva paramétrica orgânica em gota/colar natural da foto de referência)
  const N = 1000;
  const samples: { x: number; y: number }[] = [];
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    const phi = t * 2 * Math.PI;
    // Y: 710 nas pontas conectando em V suave à medalha, 85 no topo com arco relaxado
    const topFactor = Math.pow((1 - Math.cos(phi)) / 2, 0.82);
    const y = 710 - 625 * topFactor;

    // X: simétrico com abertura elegante de 230px
    const baseOffset = -24 * Math.cos(phi / 2);
    const bulge = -230 * Math.sin(phi);
    const x = 450 + bulge + baseOffset;
    samples.push({ x, y });
  }

  // Comprimento acumulado do arco para distribuição milimétrica uniforme das 60 contas
  const dists = [0];
  let totalLen = 0;
  for (let i = 1; i <= N; i++) {
    const dx = samples[i].x - samples[i - 1].x;
    const dy = samples[i].y - samples[i - 1].y;
    totalLen += Math.sqrt(dx * dx + dy * dy);
    dists.push(totalLen);
  }

  function getPt(len: number) {
    let low = 0, high = N;
    while (low <= high) {
      const mid = (low + high) >> 1;
      if (dists[mid] < len) low = mid + 1;
      else high = mid - 1;
    }
    const idx = Math.min(Math.max(low, 1), N);
    const d0 = dists[idx - 1], d1 = dists[idx];
    const f = (len - d0) / (d1 - d0);
    const p0 = samples[idx - 1], p1 = samples[idx];
    return {
      x: +(p0.x + f * (p1.x - p0.x)).toFixed(1),
      y: +(p0.y + f * (p1.y - p0.y)).toFixed(1)
    };
  }

  // 60 contas ao longo do colar (5 dezenas x 12: 1 PN, 10 AV, 1 Glória)
  const marginStart = totalLen * 0.02;
  const marginEnd = totalLen * 0.98;
  const usableLen = marginEnd - marginStart;
  const count = 60;
  const step = usableLen / (count - 1);

  for (let dec = 0; dec < 5; dec++) {
    // Pai Nosso da dezena
    const pnIdx = dec * 12;
    const pnPt = getPt(marginStart + pnIdx * step);
    beads.push({ id: `bead-dec${dec}-pn`, x: pnPt.x, y: pnPt.y, r: 21, type: 'pn' });
    loopPts.push(`${pnPt.x},${pnPt.y}`);

    // 10 Ave-Marias
    for (let a = 1; a <= 10; a++) {
      const avIdx = dec * 12 + a;
      const avPt = getPt(marginStart + avIdx * step);
      beads.push({ id: `bead-dec${dec}-av${a}`, x: avPt.x, y: avPt.y, r: 14.5, type: 'ave' });
      loopPts.push(`${avPt.x},${avPt.y}`);
    }

    // Glória ao Pai (marcador separador)
    const glIdx = dec * 12 + 11;
    const glPt = getPt(marginStart + glIdx * step);
    beads.push({ id: `bead-dec${dec}-gl`, x: glPt.x, y: glPt.y, r: 9.5, type: 'gloria' });
    loopPts.push(`${glPt.x},${glPt.y}`);
  }

  const stemPath = 'M 450,1140 L 450,780';
  const loopPath = `M 426,710 L ${loopPts.join(' L ')} L 474,710`;

  return { beads, loopPath, stemPath };
}

const { beads: BEAD_DEFS, loopPath: LOOP_PATH, stemPath: STEM_PATH } = buildBeads();

/* ============================================================================
   ILUSTRAÇÕES VETORIAIS DE NUVENS E SOL (ZERO FUNDO XADREZ, MACIAS E PURAS)
   ============================================================================ */
const SoftCloudSVG: React.FC<{ className?: string; flipped?: boolean; opacity?: number }> = ({
  className = '',
  flipped = false,
  opacity = 0.95
}) => (
  <svg
    viewBox="0 0 360 200"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={{ transform: flipped ? 'scaleX(-1)' : undefined, opacity }}
  >
    <defs>
      <linearGradient id={flipped ? "cloudGradR" : "cloudGradL"} x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.99" />
        <stop offset="55%" stopColor="#f8fafc" stopOpacity="0.96" />
        <stop offset="100%" stopColor="#e0f2fe" stopOpacity="0.90" />
      </linearGradient>
      <filter id={flipped ? "cloudShadowR" : "cloudShadowL"} x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor="#7dd3fc" floodOpacity="0.35" />
      </filter>
    </defs>
    <g filter={`url(#${flipped ? "cloudShadowR" : "cloudShadowL"})`}>
      <path
        d="M 60,150 L 300,150 A 35,35 0 0,0 330,105 A 42,42 0 0,0 270,55 A 58,58 0 0,0 155,42 A 48,48 0 0,0 65,80 A 35,35 0 0,0 60,150 Z"
        fill={`url(#${flipped ? "cloudGradR" : "cloudGradL"})`}
      />
      <ellipse cx="180" cy="90" rx="60" ry="32" fill="#ffffff" opacity="0.65" />
      <ellipse cx="120" cy="115" rx="45" ry="22" fill="#ffffff" opacity="0.5" />
      <ellipse cx="240" cy="118" rx="48" ry="22" fill="#ffffff" opacity="0.5" />
    </g>
  </svg>
);

const GentleSunSVG: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg
    viewBox="0 0 160 160"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <defs>
      <radialGradient id="gentleSunCore" cx="40%" cy="40%" r="60%">
        <stop offset="0%" stopColor="#fef08a" />
        <stop offset="40%" stopColor="#facc15" />
        <stop offset="85%" stopColor="#f59e0b" />
        <stop offset="100%" stopColor="#d97706" />
      </radialGradient>
      <filter id="sunGlow" x="-25%" y="-25%" width="150%" height="150%">
        <feGaussianBlur stdDeviation="5" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
    <g transform="translate(80, 80)" filter="url(#sunGlow)">
      {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg, i) => (
        <rect
          key={i}
          x="-4.5"
          y="-66"
          width="9"
          height="18"
          rx="4.5"
          fill="#fbbf24"
          opacity="0.85"
          transform={`rotate(${deg})`}
        />
      ))}
      <circle r="42" fill="url(#gentleSunCore)" stroke="#fef08a" strokeWidth="2.5" />
      <circle cx="-12" cy="-12" r="12" fill="#ffffff" opacity="0.55" />
      <circle cx="-15" cy="8" r="4.5" fill="#f87171" opacity="0.5" />
      <circle cx="15" cy="8" r="4.5" fill="#f87171" opacity="0.5" />
      <path d="M -8,5 Q 0,13 8,5" stroke="#78350f" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.75" />
      <circle cx="-13" cy="-3" r="2.5" fill="#78350f" opacity="0.8" />
      <circle cx="13" cy="-3" r="2.5" fill="#78350f" opacity="0.8" />
    </g>
  </svg>
);

/* ============================================================================
   ANJINHO SVG INLINE — 100% vetorial, zero fundo xadrez, flutua no céu
   ============================================================================ */
const AnjinhoSVG: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg viewBox="0 0 200 240" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <defs>
      <radialGradient id="skinGrad" cx="40%" cy="35%" r="65%">
        <stop offset="0%" stopColor="#ffe8d6" />
        <stop offset="60%" stopColor="#f5c6a0" />
        <stop offset="100%" stopColor="#e8a87c" />
      </radialGradient>
      <radialGradient id="hairGrad" cx="40%" cy="30%" r="65%">
        <stop offset="0%" stopColor="#ffe066" />
        <stop offset="70%" stopColor="#f59e0b" />
        <stop offset="100%" stopColor="#b45309" />
      </radialGradient>
      <radialGradient id="robeGrad" cx="40%" cy="30%" r="65%">
        <stop offset="0%" stopColor="#f0f9ff" />
        <stop offset="60%" stopColor="#bae6fd" />
        <stop offset="100%" stopColor="#7dd3fc" />
      </radialGradient>
      <radialGradient id="wingGrad" cx="30%" cy="30%" r="70%">
        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.98"/>
        <stop offset="50%" stopColor="#f0f9ff" stopOpacity="0.92"/>
        <stop offset="100%" stopColor="#bae6fd" stopOpacity="0.80"/>
      </radialGradient>
      <radialGradient id="cloudGradAnj" cx="40%" cy="30%" r="60%">
        <stop offset="0%" stopColor="#ffffff"/>
        <stop offset="60%" stopColor="#f0f9ff"/>
        <stop offset="100%" stopColor="#e0f2fe"/>
      </radialGradient>
      <filter id="anjShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#60a5fa" floodOpacity="0.25"/>
      </filter>
      <filter id="anjWingShadow" x="-10%" y="-10%" width="120%" height="120%">
        <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#7dd3fc" floodOpacity="0.35"/>
      </filter>
    </defs>

    {/* Asa esquerda */}
    <ellipse cx="52" cy="130" rx="52" ry="30" fill="url(#wingGrad)" stroke="#bae6fd" strokeWidth="1" transform="rotate(-25 52 130)" filter="url(#anjWingShadow)" opacity="0.9"/>
    <ellipse cx="48" cy="118" rx="38" ry="18" fill="#ffffff" opacity="0.6" transform="rotate(-20 48 118)"/>

    {/* Asa direita */}
    <ellipse cx="148" cy="130" rx="52" ry="30" fill="url(#wingGrad)" stroke="#bae6fd" strokeWidth="1" transform="rotate(25 148 130)" filter="url(#anjWingShadow)" opacity="0.9"/>
    <ellipse cx="152" cy="118" rx="38" ry="18" fill="#ffffff" opacity="0.6" transform="rotate(20 152 118)"/>

    {/* Nuvem base */}
    <g filter="url(#anjShadow)">
      <ellipse cx="100" cy="215" rx="68" ry="22" fill="url(#cloudGradAnj)"/>
      <ellipse cx="68" cy="207" rx="36" ry="20" fill="url(#cloudGradAnj)"/>
      <ellipse cx="132" cy="207" rx="36" ry="20" fill="url(#cloudGradAnj)"/>
      <ellipse cx="100" cy="200" rx="48" ry="24" fill="#ffffff" opacity="0.7"/>
    </g>

    {/* Corpinho — roupa azul clara */}
    <ellipse cx="100" cy="175" rx="38" ry="34" fill="url(#robeGrad)" stroke="#7dd3fc" strokeWidth="1.5"/>
    {/* Detalhe do laço do pescoço */}
    <path d="M 86,152 Q 100,158 114,152" stroke="#bae6fd" strokeWidth="2" strokeLinecap="round" fill="none"/>

    {/* Bracinho esquerdo */}
    <ellipse cx="65" cy="168" rx="13" ry="9" fill="url(#skinGrad)" transform="rotate(-30 65 168)"/>
    {/* Mãozinha esquerda */}
    <circle cx="58" cy="176" r="8" fill="url(#skinGrad)"/>
    <circle cx="52" cy="174" r="5" fill="url(#skinGrad)"/>

    {/* Bracinho direito */}
    <ellipse cx="135" cy="168" rx="13" ry="9" fill="url(#skinGrad)" transform="rotate(30 135 168)"/>
    {/* Mãozinha direita (segurando terço/coração) */}
    <circle cx="142" cy="176" r="8" fill="url(#skinGrad)"/>
    <circle cx="148" cy="174" r="5" fill="url(#skinGrad)"/>
    {/* Coraçãozinho dourado na mão */}
    <path d="M 148,170 C 145,165 140,168 140,172 C 140,176 148,181 148,181 C 148,181 156,176 156,172 C 156,168 151,165 148,170 Z" fill="#facc15" stroke="#b45309" strokeWidth="1"/>

    {/* Cabecinha */}
    <circle cx="100" cy="118" r="38" fill="url(#skinGrad)" stroke="#f5c6a0" strokeWidth="1.5"/>
    {/* Bochechinhas */}
    <circle cx="82" cy="124" r="8" fill="#f87171" opacity="0.35"/>
    <circle cx="118" cy="124" r="8" fill="#f87171" opacity="0.35"/>
    {/* Olhinhos */}
    <ellipse cx="88" cy="115" rx="6" ry="7" fill="#3b1c08"/>
    <ellipse cx="112" cy="115" rx="6" ry="7" fill="#3b1c08"/>
    <circle cx="90" cy="113" r="2.5" fill="#ffffff"/>
    <circle cx="114" cy="113" r="2.5" fill="#ffffff"/>
    {/* Sorriso */}
    <path d="M 90,129 Q 100,138 110,129" stroke="#b45309" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
    {/* Narizinho */}
    <ellipse cx="100" cy="123" rx="4" ry="2.5" fill="#e8a87c" opacity="0.7"/>

    {/* Cabelo dourado fofinho */}
    <ellipse cx="100" cy="88" rx="38" ry="20" fill="url(#hairGrad)"/>
    <ellipse cx="72" cy="98" rx="16" ry="20" fill="url(#hairGrad)"/>
    <ellipse cx="128" cy="98" rx="16" ry="20" fill="url(#hairGrad)"/>
    <ellipse cx="85" cy="84" rx="20" ry="14" fill="#ffe066" opacity="0.6"/>

    {/* Auréola dourada */}
    <circle cx="100" cy="82" r="34" fill="none" stroke="#facc15" strokeWidth="3" opacity="0.7"/>
    <circle cx="100" cy="82" r="38" fill="none" stroke="#fef08a" strokeWidth="1" opacity="0.4"/>
  </svg>
);

/* ============================================================================
   MENINO JESUS SVG INLINE — 100% vetorial, zero fundo xadrez
   ============================================================================ */
const MeninoJesusSVG: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg viewBox="0 0 200 250" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <defs>
      <radialGradient id="jSkinGrad" cx="40%" cy="35%" r="65%">
        <stop offset="0%" stopColor="#ffe8d6"/>
        <stop offset="60%" stopColor="#f5c6a0"/>
        <stop offset="100%" stopColor="#e8a87c"/>
      </radialGradient>
      <radialGradient id="jHairGrad" cx="40%" cy="30%" r="65%">
        <stop offset="0%" stopColor="#8b4513"/>
        <stop offset="60%" stopColor="#5c2d0a"/>
        <stop offset="100%" stopColor="#3b1c08"/>
      </radialGradient>
      <radialGradient id="jRobeGrad" cx="40%" cy="30%" r="65%">
        <stop offset="0%" stopColor="#fffbf0"/>
        <stop offset="50%" stopColor="#fef9c3"/>
        <stop offset="100%" stopColor="#fde047"/>
      </radialGradient>
      <radialGradient id="jMantleGrad" cx="40%" cy="30%" r="65%">
        <stop offset="0%" stopColor="#bfdbfe"/>
        <stop offset="60%" stopColor="#3b82f6"/>
        <stop offset="100%" stopColor="#1e3a8a"/>
      </radialGradient>
      <radialGradient id="jCloudGrad" cx="40%" cy="30%" r="60%">
        <stop offset="0%" stopColor="#ffffff"/>
        <stop offset="60%" stopColor="#f0f9ff"/>
        <stop offset="100%" stopColor="#e0f2fe"/>
      </radialGradient>
      <filter id="jesusShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="4" stdDeviation="7" floodColor="#60a5fa" floodOpacity="0.3"/>
      </filter>
    </defs>

    {/* Nuvem base */}
    <g filter="url(#jesusShadow)">
      <ellipse cx="100" cy="230" rx="70" ry="22" fill="url(#jCloudGrad)"/>
      <ellipse cx="66" cy="220" rx="38" ry="22" fill="url(#jCloudGrad)"/>
      <ellipse cx="134" cy="220" rx="38" ry="22" fill="url(#jCloudGrad)"/>
      <ellipse cx="100" cy="212" rx="52" ry="26" fill="#ffffff" opacity="0.7"/>
    </g>

    {/* Manto azul real */}
    <path d="M 55,175 Q 46,200 52,220 Q 100,228 148,220 Q 154,200 145,175 Q 128,165 100,163 Q 72,165 55,175 Z" fill="url(#jMantleGrad)" stroke="#1e40af" strokeWidth="1.5"/>

    {/* Túnica branca/dourada */}
    <ellipse cx="100" cy="178" rx="40" ry="36" fill="url(#jRobeGrad)" stroke="#fde047" strokeWidth="1.5"/>
    {/* Detalhe da túnica */}
    <path d="M 85,160 Q 100,166 115,160" stroke="#fde047" strokeWidth="2" strokeLinecap="round" fill="none"/>

    {/* Bracinho esquerdo — mão com chaga */}
    <ellipse cx="62" cy="172" rx="14" ry="9" fill="url(#jSkinGrad)" transform="rotate(-25 62 172)"/>
    <circle cx="56" cy="180" r="9" fill="url(#jSkinGrad)"/>
    {/* Chaga na mão */}
    <circle cx="56" cy="180" r="3.5" fill="#dc2626" opacity="0.75"/>
    <circle cx="56" cy="180" r="1.5" fill="#ffffff" opacity="0.6"/>

    {/* Bracinho direito — mão abençoando */}
    <ellipse cx="138" cy="172" rx="14" ry="9" fill="url(#jSkinGrad)" transform="rotate(25 138 172)"/>
    <circle cx="144" cy="180" r="9" fill="url(#jSkinGrad)"/>
    {/* Dedos abençoando */}
    <ellipse cx="150" cy="174" rx="4" ry="6" fill="url(#jSkinGrad)"/>
    <ellipse cx="155" cy="176" rx="3.5" ry="5" fill="url(#jSkinGrad)"/>
    {/* Chaga na mão */}
    <circle cx="144" cy="180" r="3.5" fill="#dc2626" opacity="0.75"/>
    <circle cx="144" cy="180" r="1.5" fill="#ffffff" opacity="0.6"/>

    {/* Cabecinha */}
    <circle cx="100" cy="118" r="40" fill="url(#jSkinGrad)" stroke="#f5c6a0" strokeWidth="1.5"/>
    {/* Bochechinhas */}
    <circle cx="80" cy="126" r="9" fill="#f87171" opacity="0.3"/>
    <circle cx="120" cy="126" r="9" fill="#f87171" opacity="0.3"/>
    {/* Olhinhos */}
    <ellipse cx="87" cy="114" rx="6.5" ry="7.5" fill="#3b1c08"/>
    <ellipse cx="113" cy="114" rx="6.5" ry="7.5" fill="#3b1c08"/>
    <circle cx="89" cy="112" r="2.5" fill="#ffffff"/>
    <circle cx="115" cy="112" r="2.5" fill="#ffffff"/>
    {/* Sorriso */}
    <path d="M 88,130 Q 100,140 112,130" stroke="#b45309" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
    {/* Narizinho */}
    <ellipse cx="100" cy="123" rx="4.5" ry="3" fill="#e8a87c" opacity="0.65"/>

    {/* Cabelo castanho */}
    <ellipse cx="100" cy="86" rx="40" ry="22" fill="url(#jHairGrad)"/>
    <ellipse cx="70" cy="100" rx="17" ry="22" fill="url(#jHairGrad)"/>
    <ellipse cx="130" cy="100" rx="17" ry="22" fill="url(#jHairGrad)"/>

    {/* Auréola dourada */}
    <circle cx="100" cy="80" r="38" fill="none" stroke="#facc15" strokeWidth="3.5" opacity="0.75"/>
    <circle cx="100" cy="80" r="43" fill="none" stroke="#fef08a" strokeWidth="1.5" opacity="0.4"/>
    {/* Cruz na auréola */}
    <line x1="100" y1="43" x2="100" y2="52" stroke="#facc15" strokeWidth="2.5" opacity="0.8"/>
    <line x1="93" y1="47" x2="107" y2="47" stroke="#facc15" strokeWidth="2.5" opacity="0.8"/>
  </svg>
);

/* ============================================================================
   COMPONENTE PRINCIPAL
   ============================================================================ */
export const SantoTercoKids: React.FC<{ onSwitchToAdult?: () => void }> = ({ onSwitchToAdult }) => {
  const getToday = (): MysteryGroupKids => {
    const d = new Date().getDay();
    return KIDS_MYSTERY_GROUPS.find(g => g.days.includes(d))?.id ?? 'gloriosos';
  };

  const [groupId, setGroupId] = useState<MysteryGroupKids>(getToday);
  const activeGroup = useMemo(() => KIDS_MYSTERY_GROUPS.find(g => g.id === groupId)!, [groupId]);
  const steps       = useMemo(() => buildSteps(activeGroup), [activeGroup]);

  const [stepIdx, setStepIdx] = useState(0);
  const step = steps[stepIdx] ?? steps[0];

  // Marcos importantes para a medalha e progresso
  const transStepIdx      = useMemo(() => steps.findIndex(s => s.id === 'trans-medal'), [steps]);
  const lastDecadeStepIdx = useMemo(() => steps.findIndex(s => s.id === 'gl5'), [steps]);
  const salveStepIdx      = useMemo(() => steps.findIndex(s => s.id === 'salve'), [steps]);
  const finalStepIdx      = useMemo(() => steps.findIndex(s => s.id === 'final'), [steps]);

  const [playing, setPlaying] = useState(false);
  const [muted,   setMuted]   = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.preload = 'auto';
    return () => {
      audioRef.current?.pause();
      clearInterval(timerRef.current);
      window.speechSynthesis?.cancel();
    };
  }, []);

  /* ── parar tudo ── */
  const stopAll = useCallback(() => {
    audioRef.current?.pause();
    clearInterval(timerRef.current);
    window.speechSynthesis?.cancel();
    setPlaying(false);
  }, []);

  /* ── avançar ── */
  const advance = useCallback(() => {
    stopAll();
    setStepIdx(i => Math.min(i + 1, steps.length - 1));
  }, [steps.length, stopAll]);

  /* ── reproduzir áudio do passo indicado ── */
  const playStep = useCallback((audioSrc: string, text: string, onEnd?: () => void) => {
    const audio = audioRef.current;
    if (!audio || muted) { onEnd?.(); return; }
    audio.pause();
    audio.src = audioSrc;
    audio.currentTime = 0;
    audio.play()
      .then(() => {
        setPlaying(true);
        audio.onended = () => {
          clearInterval(timerRef.current);
          setPlaying(false);
          onEnd?.();
        };
      })
      .catch(() => {
        // Fallback SpeechSynthesis
        setPlaying(true);
        const utt = new SpeechSynthesisUtterance(text.replace(/\[\.\.\.\]/g, ', '));
        utt.lang = 'pt-BR'; utt.rate = 0.85; utt.pitch = 1.1;
        utt.onend = () => { setPlaying(false); onEnd?.(); };
        utt.onerror = () => { setPlaying(false); onEnd?.(); };
        window.speechSynthesis.speak(utt);
      });
  }, [muted]);

  /* ── toggle play/pause ── */
  const togglePlay = () => {
    if (playing) { stopAll(); }
    else { playStep(step.audioSrc, step.shortText, () => setTimeout(advance, 700)); }
  };

  /* ── clicar numa conta: navegar E disparar áudio automaticamente ── */
  const jumpToBead = useCallback((beadId: string) => {
    stopAll();
    playBell();

    // ── TRATAMENTO ESPECIAL DA MEDALHA CENTRAL ──
    if (beadId === 'bead-medal') {
      if (lastDecadeStepIdx !== -1 && stepIdx >= lastDecadeStepIdx) {
        setStepIdx(salveStepIdx);
        const target = steps[salveStepIdx];
        setTimeout(() => {
          playStep(target.audioSrc, target.shortText, () => setTimeout(advance, 700));
        }, 60);
        return;
      }

      if (transStepIdx !== -1 && stepIdx <= transStepIdx) {
        setStepIdx(transStepIdx);
        const target = steps[transStepIdx];
        setTimeout(() => {
          playStep(target.audioSrc, target.shortText, () => setTimeout(advance, 700));
        }, 60);
        return;
      }

      playStep(
        '/terco-kids/santo-anjo.mp3',
        'Mãezinha do Céu está com você! Continue rezando os Santos Mistérios com muito amor! 🌸'
      );
      return;
    }

    // ── DEMAIS CONTAS DO TERÇO ──
    const idx = steps.findIndex(s => s.beadId === beadId);
    if (idx === -1) return;
    setStepIdx(idx);
    const target = steps[idx];
    setTimeout(() => {
      playStep(target.audioSrc, target.shortText, () => setTimeout(advance, 700));
    }, 60);
  }, [advance, lastDecadeStepIdx, playStep, salveStepIdx, steps, stopAll, transStepIdx, stepIdx]);

  /* ── voltar ── */
  const prev = () => {
    stopAll(); playBell();
    setStepIdx(i => Math.max(i - 1, 0));
  };

  /* ── avançar manual ── */
  const next = () => {
    stopAll(); playBell(); advance();
  };

  /* ── Lógica de estado de cada conta ── */
  const isActive = (id: string) => step.beadId === id;
  const isPrayed = (id: string) => {
    if (id === 'bead-medal') {
      return finalStepIdx !== -1 && stepIdx >= finalStepIdx;
    }
    const bi = steps.findIndex(s => s.beadId === id);
    return bi !== -1 && bi < stepIdx;
  };

  return (
    <div className="relative w-full select-none">

      {/* ═══ CENÁRIO CELESTIAL DE PERSONAGENS INFANTIS E NUVENS FLUTUANTES ═══ */}

      {/* 1. Sol Dourado — reposicionado no canto superior direito, bem acima da linha de botões */}
      <GentleSunSVG className="absolute top-0 right-4 sm:right-8 md:right-16 w-20 sm:w-24 md:w-28 pointer-events-none select-none z-[1] opacity-100 drop-shadow-md" />

      {/* 2. Anjinho SVG inline — ZERO fundo xadrez, flutua livremente no céu azul pastel */}
      <AnjinhoSVG className="absolute left-0 sm:left-2 md:left-6 top-[34%] sm:top-[36%] w-28 sm:w-36 md:w-44 pointer-events-none select-none z-[2] drop-shadow-lg" />

      {/* 3. Menino Jesus SVG inline — ZERO fundo xadrez, visível no topo direito acima do card */}
      <MeninoJesusSVG className="absolute right-0 sm:right-2 md:right-6 top-[12%] sm:top-[14%] md:top-[16%] w-28 sm:w-36 md:w-44 pointer-events-none select-none z-[2] drop-shadow-lg" />

      {/* 4. Camadas de Nuvens Macias pelo Topo e Laterais (Sem encostar nos botões) */}
      {/* Topo Esquerdo */}
      <SoftCloudSVG className="absolute -top-12 sm:-top-16 -left-8 sm:-left-12 w-52 sm:w-72 md:w-92 pointer-events-none select-none z-0 opacity-70" />
      {/* Topo Direito (recuado para não cobrir o sol) */}
      <SoftCloudSVG flipped className="absolute -top-12 sm:-top-16 -right-8 sm:-right-12 w-52 sm:w-72 md:w-92 pointer-events-none select-none z-0 opacity-70" />
      {/* Meio Esquerdo (abaixo do anjinho) */}
      <SoftCloudSVG className="absolute top-[52%] -left-8 sm:-left-12 w-36 sm:w-52 pointer-events-none select-none z-0 opacity-55" />
      {/* Meio Direito (abaixo do card) */}
      <SoftCloudSVG flipped className="absolute top-[68%] -right-8 sm:-right-12 w-40 sm:w-56 pointer-events-none select-none z-0 opacity-55" />

      {/* ── CONTEÚDO EM CAMADA SUPERIOR (Z-20) 100% LIVRE DE QUALQUER BLOQUEIO DE CLIQUES ── */}
      <div className="relative z-20 pt-6 sm:pt-8 mb-6 sm:mb-8 space-y-4">

        {/* ── SELETOR DE MISTÉRIOS LÚDICO ── */}
        <div className="flex flex-wrap justify-center gap-2">
          {KIDS_MYSTERY_GROUPS.map(g => {
            const today = g.days.includes(new Date().getDay());
            const sel   = g.id === groupId;
            return (
              <button
                key={g.id}
                type="button"
                onClick={() => { stopAll(); playBell(); setGroupId(g.id); setStepIdx(0); }}
                className={`px-4 py-2 rounded-full text-xs sm:text-sm font-black transition-all cursor-pointer flex items-center gap-1.5 border shadow-sm ${
                  sel
                    ? 'bg-amber-500 text-white border-amber-600 shadow-md scale-105'
                    : 'bg-white/90 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-sky-200 dark:border-slate-700 hover:bg-sky-50'
                }`}
              >
                <span>{g.badgeEmoji}</span>
                <span>{g.name}</span>
                {today && (
                  <span className="text-[10px] bg-white/30 text-white px-2 py-0.5 rounded-full font-black uppercase tracking-wider">
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
              className="px-3.5 py-2 rounded-full text-xs font-bold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 cursor-pointer bg-white/60 dark:bg-slate-800/60 border border-sky-100 dark:border-slate-700 hover:shadow-xs transition-all"
            >
              Modo Tradicional
            </button>
          )}
        </div>

        {/* ── LAYOUT PRINCIPAL: TERÇO ESGUIO (62%) + CARD DE NOSSA SENHORA (38%) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[62%_38%] gap-6 items-center pt-2">

          {/* ═══ ÁREA DO TERÇO INFANTIL (CAIMENTO NATURAL EM "U" / GOTA ALONGADA) ═══ */}
          <div className="flex items-center justify-center w-full">
            <div className="w-full max-w-[700px] sm:px-2">
              <svg
                viewBox="0 0 900 1280"
                className="w-full h-auto select-none drop-shadow-md"
                style={{ overflow: 'visible' }}
              >
                <defs>
                  {/* Sombra suave de profundidade */}
                  <filter id="beadShadow" x="-30%" y="-30%" width="160%" height="160%">
                    <feDropShadow dx="0" dy="2.5" stdDeviation="2.5" floodOpacity="0.28" floodColor="#0f172a" />
                  </filter>

                  {/* Brilho da conta ativa com glow radiante */}
                  <filter id="activeBeadGlow" x="-60%" y="-60%" width="220%" height="220%">
                    <feGaussianBlur stdDeviation="6" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>

                  {/* ── GRADIENTES DAS CONTAS ── */}
                  {/* Ave-Maria: Azul Safira Pérola com reflexo esférico 3D (foto de referência) */}
                  <radialGradient id="aveBeadNormal" cx="35%" cy="35%" r="65%">
                    <stop offset="0%" stopColor="#bfdbfe" />
                    <stop offset="25%" stopColor="#60a5fa" />
                    <stop offset="70%" stopColor="#1d4ed8" />
                    <stop offset="100%" stopColor="#172554" />
                  </radialGradient>

                  {/* Ave-Maria Rezada */}
                  <radialGradient id="aveBeadPrayed" cx="35%" cy="35%" r="65%">
                    <stop offset="0%" stopColor="#e0e7ff" />
                    <stop offset="35%" stopColor="#3b82f6" />
                    <stop offset="85%" stopColor="#1e3a8a" />
                    <stop offset="100%" stopColor="#0f172a" />
                  </radialGradient>

                  {/* Ave-Maria Ativa: Azul Celeste Elétrico Radiante */}
                  <radialGradient id="aveBeadActive" cx="35%" cy="35%" r="65%">
                    <stop offset="0%" stopColor="#ffffff" />
                    <stop offset="30%" stopColor="#38bdf8" />
                    <stop offset="75%" stopColor="#0284c7" />
                    <stop offset="100%" stopColor="#0c4a6e" />
                  </radialGradient>

                  {/* Pai Nosso: Esfera Dourada Metálica Brilhante */}
                  <radialGradient id="goldBeadNormal" cx="32%" cy="32%" r="68%">
                    <stop offset="0%" stopColor="#fef9c3" />
                    <stop offset="30%" stopColor="#facc15" />
                    <stop offset="70%" stopColor="#f59e0b" />
                    <stop offset="100%" stopColor="#b45309" />
                  </radialGradient>

                  {/* Pai Nosso Rezado */}
                  <radialGradient id="goldBeadPrayed" cx="32%" cy="32%" r="68%">
                    <stop offset="0%" stopColor="#fef08a" />
                    <stop offset="40%" stopColor="#eab308" />
                    <stop offset="85%" stopColor="#ca8a04" />
                    <stop offset="100%" stopColor="#854d0e" />
                  </radialGradient>

                  {/* Pai Nosso Ativo: Ouro Radiante */}
                  <radialGradient id="goldBeadActive" cx="32%" cy="32%" r="68%">
                    <stop offset="0%" stopColor="#ffffff" />
                    <stop offset="35%" stopColor="#fde047" />
                    <stop offset="80%" stopColor="#eab308" />
                    <stop offset="100%" stopColor="#a16207" />
                  </radialGradient>

                  {/* Cruz: Azul Royal com nuances da foto */}
                  <linearGradient id="crossBlueGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="50%" stopColor="#1d4ed8" />
                    <stop offset="100%" stopColor="#1e3a8a" />
                  </linearGradient>

                  {/* Clip da Medalha de Nossa Senhora relativo ao grupo */}
                  <clipPath id="innerMedalClip">
                    <ellipse cx="0" cy="0" rx="33" ry="39" />
                  </clipPath>
                </defs>

                {/* Cordão Dourado de sustentação passando pelas contas */}
                <path
                  d={STEM_PATH}
                  fill="none"
                  stroke="#d97706"
                  strokeWidth="3.5"
                  strokeDasharray="4 2.5"
                  opacity="0.8"
                />
                <path
                  d={LOOP_PATH}
                  fill="none"
                  stroke="#d97706"
                  strokeWidth="3.5"
                  strokeDasharray="4 2.5"
                  opacity="0.8"
                />

                {/* ── MEDALHÃO CENTRAL DO ESPÍRITO SANTO E MISTÉRIO ATUAL ── */}
                <g transform="translate(450, 360)" className="pointer-events-none">
                  <circle
                    r="86"
                    fill="white"
                    fillOpacity="0.92"
                    stroke="#fbbf24"
                    strokeWidth="3"
                    className="dark:fill-slate-900/90 dark:stroke-amber-500/60"
                    filter="url(#beadShadow)"
                  />
                  <circle
                    r="78"
                    fill="none"
                    stroke="#bfdbfe"
                    strokeWidth="1.5"
                    strokeDasharray="4 3"
                    opacity="0.7"
                  />
                  <text y="-24" textAnchor="middle" fontSize="28">🕊️</text>
                  <text
                    y="4"
                    textAnchor="middle"
                    fontSize="13"
                    fontWeight="900"
                    fill="#1e3a8a"
                    className="dark:fill-sky-200 tracking-wider"
                  >
                    {step.mysteryNumber ? `${step.mysteryNumber}º MISTÉRIO` : 'SANTO TERÇO'}
                  </text>
                  <text
                    y="24"
                    textAnchor="middle"
                    fontSize="12"
                    fontWeight="800"
                    fill="#b45309"
                    className="dark:fill-amber-300"
                  >
                    {activeGroup.name}
                  </text>
                  {step.fruit ? (
                    <text y="44" textAnchor="middle" fontSize="11" fontWeight="700" fill="#059669">
                      🌱 {step.fruit}
                    </text>
                  ) : (
                    <text y="44" textAnchor="middle" fontSize="11" fontWeight="700" fill="#0284c7">
                      Nossa Senhora do Rosário
                    </text>
                  )}
                </g>

                {/* ── RENDERIZAÇÃO DAS CONTAS DO TERÇO ── */}
                {BEAD_DEFS.map(bead => {
                  const active = isActive(bead.id);
                  const prayed = isPrayed(bead.id);

                  return (
                    <g
                      key={bead.id}
                      onClick={() => jumpToBead(bead.id)}
                      className="cursor-pointer transition-transform duration-150 active:scale-95"
                    >
                      {/* Área de toque expandida (facilita o toque em telas sensíveis e celulares) */}
                      <circle cx={bead.x} cy={bead.y} r={bead.r + 14} fill="transparent" />

                      {/* Anel indicador dourado pulsante na conta ativa */}
                      {active && (
                        <circle
                          cx={bead.x}
                          cy={bead.y}
                          r={bead.r + 7}
                          fill="none"
                          stroke="#f59e0b"
                          strokeWidth="3.5"
                          opacity="0.95"
                          className="animate-pulse"
                        />
                      )}

                      {/* ══ 1. CRUCIFIXO AZUL COM CORAÇÃO DOURADO NO CENTRO ══ */}
                      {bead.type === 'cross' && (
                        <g transform={`translate(${bead.x}, ${bead.y})`} filter="url(#beadShadow)">
                          {/* Argolinha dourada superior */}
                          <circle cx="0" cy="-44" r="5" fill="none" stroke="#f59e0b" strokeWidth="2.5" />

                          {/* Braço vertical da cruz com pontas trilobadas */}
                          <path
                            d="M -9,-38 C -14,-38 -18,-33 -18,-27 C -18,-22 -14,-19 -9,-18 L -9,18 C -14,19 -18,22 -18,27 C -18,33 -14,38 -9,38 L 9,38 C 14,38 18,33 18,27 C 18,22 14,19 9,18 L 9,-18 C 14,-19 18,-22 18,-27 C 18,-33 14,-38 9,-38 Z"
                            fill="url(#crossBlueGrad)"
                            stroke="#172554"
                            strokeWidth="2"
                          />
                          {/* Braço horizontal da cruz com pontas trilobadas */}
                          <path
                            d="M -32,-9 C -38,-9 -42,-5 -42,0 C -42,5 -38,9 -32,9 L 32,9 C 38,9 42,5 42,0 C 42,-5 38,-9 32,-9 Z"
                            fill="url(#crossBlueGrad)"
                            stroke="#172554"
                            strokeWidth="2"
                          />

                          {/* Coração Dourado Central (como na foto de referência) */}
                          <path
                            d="M 0,-5 C -4,-13 -12,-9 -12,-2 C -12,5 -5,10 0,16 C 5,10 12,5 12,-2 C 12,-9 4,-13 0,-5 Z"
                            fill="url(#goldBeadNormal)"
                            stroke="#78350f"
                            strokeWidth="1.5"
                          />
                        </g>
                      )}

                      {/* ══ 2. MEDALHA DE NOSSA SENHORA APARECIDA INFANTIL (CENTRALIZADA E ILUMINADA) ══ */}
                      {bead.type === 'medal' && (
                        <g transform={`translate(${bead.x}, ${bead.y})`}>
                          {/* Anéis de fixação dourados laterais e inferior */}
                          <circle cx="-38" cy="-5" r="4.5" fill="none" stroke="#f59e0b" strokeWidth="2.5" />
                          <circle cx="38"  cy="-5" r="4.5" fill="none" stroke="#f59e0b" strokeWidth="2.5" />
                          <circle cx="0"   cy="44" r="4.5" fill="none" stroke="#f59e0b" strokeWidth="2.5" />

                          {/* Moldura da medalha com relevo dourado */}
                          <ellipse
                            cx="0"
                            cy="0"
                            rx="38"
                            ry="44"
                            fill={active ? '#fef08a' : '#1e3a8a'}
                            stroke="#f59e0b"
                            strokeWidth="4"
                            filter="url(#beadShadow)"
                          />

                          {/* Coroa Dourada de 3 Pontas no topo da medalha */}
                          <g transform="translate(0, -42)">
                            <path
                              d="M -16,0 L -20,-12 L -8,-4 L 0,-16 L 8,-4 L 20,-12 L 16,0 Z"
                              fill="url(#goldBeadNormal)"
                              stroke="#78350f"
                              strokeWidth="1.5"
                            />
                            <circle cx="-20" cy="-13" r="2" fill="#ffffff" />
                            <circle cx="0"   cy="-17" r="2.5" fill="#ffffff" />
                            <circle cx="20"  cy="-13" r="2" fill="#ffffff" />
                          </g>

                          {/* Imagem de Nossa Senhora Sorrindo/Falando (100% centralizada na medalha) */}
                          <g clipPath="url(#innerMedalClip)">
                            <image
                              href={playing ? '/terco-kids/medalha-rosto-falando.png' : '/terco-kids/medalha-rosto.png'}
                              x="-33"
                              y="-39"
                              width="66"
                              height="78"
                              preserveAspectRatio="xMidYMid meet"
                            />
                          </g>

                          {/* Aro interno dourado de contorno da medalha */}
                          <ellipse
                            cx="0"
                            cy="0"
                            rx="34"
                            ry="40"
                            fill="none"
                            stroke="#fbbf24"
                            strokeWidth="2"
                            strokeDasharray="5 3"
                            opacity="0.85"
                          />
                        </g>
                      )}

                      {/* ══ 3. PAI NOSSO (ESFERAS DOURADAS GRANDES METÁLICAS) ══ */}
                      {bead.type === 'pn' && (
                        <g filter={active ? 'url(#activeBeadGlow)' : 'url(#beadShadow)'}>
                          <circle
                            cx={bead.x}
                            cy={bead.y}
                            r={bead.r}
                            fill={active ? 'url(#goldBeadActive)' : prayed ? 'url(#goldBeadPrayed)' : 'url(#goldBeadNormal)'}
                            stroke={active ? '#d97706' : '#78350f'}
                            strokeWidth="2.5"
                          />
                          <circle
                            cx={bead.x - bead.r * 0.35}
                            cy={bead.y - bead.r * 0.35}
                            r={bead.r * 0.28}
                            fill="#ffffff"
                            opacity={active ? 0.9 : 0.65}
                          />
                          <text
                            x={bead.x}
                            y={bead.y + 6}
                            textAnchor="middle"
                            fontSize="13"
                            className="pointer-events-none select-none"
                          >
                            👑
                          </text>
                        </g>
                      )}

                      {/* ══ 4. AVE-MARIA (AZUL SAFIRA PÉROLA COM PONTO DE LUZ 3D) ══ */}
                      {bead.type === 'ave' && (
                        <g filter={active ? 'url(#activeBeadGlow)' : 'url(#beadShadow)'}>
                          <circle
                            cx={bead.x}
                            cy={bead.y}
                            r={bead.r}
                            fill={active ? 'url(#aveBeadActive)' : prayed ? 'url(#aveBeadPrayed)' : 'url(#aveBeadNormal)'}
                            stroke={active ? '#38bdf8' : '#1e3a8a'}
                            strokeWidth="2"
                          />
                          <circle
                            cx={bead.x - bead.r * 0.32}
                            cy={bead.y - bead.r * 0.32}
                            r={bead.r * 0.3}
                            fill="#ffffff"
                            opacity={active ? 0.85 : 0.6}
                          />
                          {prayed && (
                            <text
                              x={bead.x}
                              y={bead.y + 4.5}
                              textAnchor="middle"
                              fontSize="11"
                              fontWeight="bold"
                              fill="#fde047"
                              className="pointer-events-none"
                            >
                              ✓
                            </text>
                          )}
                        </g>
                      )}

                      {/* ══ 5. GLÓRIA AO PAI (SEPARADOR DOURADO/ÂMBAR) ══ */}
                      {bead.type === 'gloria' && (
                        <g filter="url(#beadShadow)">
                          <circle
                            cx={bead.x}
                            cy={bead.y}
                            r={bead.r}
                            fill={active ? '#facc15' : prayed ? '#f59e0b' : '#fbbf24'}
                            stroke="#78350f"
                            strokeWidth="1.5"
                          />
                          <circle
                            cx={bead.x - bead.r * 0.3}
                            cy={bead.y - bead.r * 0.3}
                            r={bead.r * 0.3}
                            fill="#ffffff"
                            opacity="0.6"
                          />
                        </g>
                      )}
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>

          {/* ═══ CARD LATERAL DE ORIENTAÇÃO DE NOSSA SENHORA ═══ */}
          <div className="flex flex-col rounded-3xl overflow-hidden shadow-xl border border-sky-200/90 dark:border-sky-800/50 bg-gradient-to-b from-white via-sky-50/40 to-white dark:from-slate-900 dark:via-slate-900/90 dark:to-slate-950 backdrop-blur-xs">

            {/* Imagem de Nossa Senhora + Balão de fala */}
            <div className="flex flex-col items-center px-5 pt-7 pb-3 gap-3">

              {/* Retrato de Nossa Senhora */}
              <div className="relative">
                <div className="absolute -inset-2 bg-amber-300 rounded-full blur-md opacity-40 animate-pulse" />
                <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-4 border-amber-300 shadow-md bg-amber-50">
                  <img
                    src={playing ? '/terco-kids/FALANDO.png' : '/terco-kids/SORINDO-NORMAL.png'}
                    alt="Nossa Senhora"
                    className="w-full h-full object-cover"
                    onError={e => { (e.currentTarget as HTMLImageElement).src = '/terco-kids/SORINDO-NORMAL.png'; }}
                  />
                </div>
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-2xl pointer-events-none">👑</span>
              </div>

              {/* Balão de Fala Acolhedor */}
              <div className="relative w-full bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-sky-200 dark:border-slate-700 px-5 py-4">
                <div
                  className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-0 h-0
                  border-l-[10px] border-l-transparent
                  border-r-[10px] border-r-transparent
                  border-b-[12px] border-b-white dark:border-b-slate-800"
                />

                <p className="text-xs font-black uppercase tracking-wider text-amber-700 dark:text-amber-400 mb-1">
                  {step.mysteryNumber ? `${step.mysteryNumber}º Mistério` : step.title}
                </p>

                <p className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100 leading-snug">
                  {step.shortText}
                </p>

                {step.fruit && (
                  <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-2 font-bold flex items-center gap-1">
                    <span>🌱</span>
                    <span>Fruto: {step.fruit}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Controles de Áudio e Navegação */}
            <div className="px-5 pb-6 pt-2 space-y-3">
              {/* Botão Principal Play/Pause */}
              <button
                type="button"
                onClick={togglePlay}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-black text-base sm:text-lg shadow-md hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2.5 cursor-pointer"
              >
                {playing ? (
                  <>
                    <Pause className="w-5 h-5 fill-white" />
                    <span>Pausar</span>
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 fill-white" />
                    <span>Ouvir Oração</span>
                  </>
                )}
              </button>

              {/* Botões Voltar / Próxima */}
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={prev}
                  disabled={stepIdx === 0}
                  className="py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-sky-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 hover:bg-sky-50 disabled:opacity-40 cursor-pointer shadow-xs transition-colors"
                >
                  <SkipBack className="w-4 h-4" />
                  <span>Voltar</span>
                </button>
                <button
                  type="button"
                  onClick={next}
                  disabled={stepIdx >= steps.length - 1}
                  className="py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-40 transition-colors"
                >
                  <span>Próxima</span>
                  <SkipForward className="w-4 h-4" />
                </button>
              </div>

              {/* Controle de Volume/Mudo */}
              <div className="flex justify-center pt-1">
                <button
                  type="button"
                  onClick={() => setMuted(m => !m)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-amber-700 cursor-pointer transition-colors"
                >
                  {muted ? (
                    <>
                      <VolumeX className="w-4 h-4 text-rose-500" />
                      <span>Sem som</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-4 h-4 text-emerald-600" />
                      <span>Com som</span>
                    </>
                  )}
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
