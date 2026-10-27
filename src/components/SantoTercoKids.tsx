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
   MISTÉRIOS
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
   TEXTOS CURTOS PARA O BALÃO (SEM ORAÇÃO POR EXTENSO)
   ============================================================================ */
const SHORT_TEXTS = {
  credo:    'Vamos começar rezando o Sinal da Cruz e o Santo Credo! ✝️',
  pnIntro:  'Rezemos juntos o Pai Nosso, a oração que Jesus nos ensinou! 🙏',
  av1:      'Primeira Ave-Maria pela Santa Fé! 🌸',
  av2:      'Segunda Ave-Maria pela Santa Esperança! 💛',
  av3:      'Terceira Ave-Maria pela Santa Caridade! 💖',
  gloriaI:  'Glória ao Pai, ao Filho e ao Espírito Santo! ✨',
  salve:    'Salve Rainha! Vamos rezar à nossa Mãezinha do Céu! 👑',
  final:    'Parabéns! Você terminou o Santo Terço com muito amor! 🎉',
};

/* ============================================================================
   SOM DE SININHO
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
  s.push({ id: 'credo',  title: 'Sinal da Cruz e o Credo',  shortText: SHORT_TEXTS.credo,   audioSrc: '/terco-kids/CREIO.mp3',        beadId: 'bead-cross'   });
  s.push({ id: 'pn0',    title: 'Pai Nosso Inicial',         shortText: SHORT_TEXTS.pnIntro, audioSrc: '/terco-kids/pai-nosso.mp3',    beadId: 'bead-pn-intro' });
  s.push({ id: 'av0-1',  title: '1ª Ave-Maria — pela Fé',    shortText: SHORT_TEXTS.av1,     audioSrc: '/terco-kids/ave-maria.mp3',    beadId: 'bead-av0-1'   });
  s.push({ id: 'av0-2',  title: '2ª Ave-Maria — pela Esperança', shortText: SHORT_TEXTS.av2, audioSrc: '/terco-kids/ave-maria-2.mp3',  beadId: 'bead-av0-2'   });
  s.push({ id: 'av0-3',  title: '3ª Ave-Maria — pela Caridade',  shortText: SHORT_TEXTS.av3, audioSrc: '/terco-kids/ave-maria.mp3',    beadId: 'bead-av0-3'   });
  s.push({ id: 'gl-i',   title: 'Glória ao Pai',             shortText: SHORT_TEXTS.gloriaI, audioSrc: '/terco-kids/gloria-ao-pai.mp3',beadId: 'bead-gl-intro' });

  group.mysteries.forEach((m, di) => {
    s.push({
      id: `pn${di+1}`, title: `${m.number}º Mistério — ${m.title}`,
      shortText: m.kidsExplanation,
      audioSrc: m.audioSrc,
      mysteryNumber: m.number, decadeIndex: di, fruit: m.fruit,
      beadId: `bead-dec${di}-pn`
    });
    for (let a = 1; a <= 10; a++) {
      s.push({
        id: `av${di+1}-${a}`, title: `${a}ª Ave-Maria`,
        shortText: `${a}ª Ave-Maria da ${m.number}ª Dezena — ${m.title} 🌸`,
        audioSrc: a % 2 === 0 ? '/terco-kids/ave-maria-2.mp3' : '/terco-kids/ave-maria.mp3',
        mysteryNumber: m.number, decadeIndex: di,
        beadId: `bead-dec${di}-av${a}`
      });
    }
    s.push({
      id: `gl${di+1}`, title: `Glória ao Pai — ${m.number}ª Dezena`,
      shortText: `Glória ao Pai! Rezamos com amor pela ${m.number}ª Dezena! ✨`,
      audioSrc: di % 2 === 0 ? '/terco-kids/gloria-ao-pai.mp3' : '/terco-kids/gloria-ao-pai-2.mp3',
      decadeIndex: di,
      beadId: `bead-dec${di}-gl`
    });
  });

  s.push({ id: 'salve', title: 'Salve Rainha', shortText: SHORT_TEXTS.salve, audioSrc: '/terco-kids/santo-anjo.mp3', beadId: 'bead-medal' });
  s.push({ id: 'final', title: 'Terço Concluído! 🌟',       shortText: SHORT_TEXTS.final,   audioSrc: '/terco-kids/santo-anjo.mp3',   beadId: 'bead-medal'   });
  return s;
}

/* ============================================================================
   GEOMETRIA DAS CONTAS — CÍRCULO GRANDE
   ViewBox 900 × 960
   ============================================================================ */
interface BeadDef {
  id: string; x: number; y: number; r: number;
  type: 'cross' | 'pn' | 'ave' | 'gloria' | 'medal';
}

function buildBeads(): { beads: BeadDef[]; loopPath: string; stemPath: string } {
  const CX = 450, CY = 315, RX = 330, RY = 255;
  const beads: BeadDef[] = [];
  const loopPts: string[] = [];

  // Haste
  beads.push({ id: 'bead-cross',    x: 450, y: 895, r: 28,   type: 'cross'  });
  beads.push({ id: 'bead-pn-intro', x: 450, y: 800, r: 22,   type: 'pn'     });
  beads.push({ id: 'bead-av0-1',    x: 450, y: 742, r: 15,   type: 'ave'    });
  beads.push({ id: 'bead-av0-2',    x: 450, y: 692, r: 15,   type: 'ave'    });
  beads.push({ id: 'bead-av0-3',    x: 450, y: 642, r: 15,   type: 'ave'    });
  beads.push({ id: 'bead-gl-intro', x: 450, y: 592, r: 11,   type: 'gloria' });
  beads.push({ id: 'bead-medal',    x: 450, y: 525, r: 36,   type: 'medal'  });

  for (let dec = 0; dec < 5; dec++) {
    const startAngle = 18 + dec * 64.8;
    const pnRad = (startAngle * Math.PI) / 180;
    const px = +(CX + RX * Math.sin(pnRad)).toFixed(1);
    const py = +(CY + RY * Math.cos(pnRad)).toFixed(1);
    beads.push({ id: `bead-dec${dec}-pn`, x: px, y: py, r: 22, type: 'pn' });
    loopPts.push(`${px},${py}`);

    for (let a = 1; a <= 10; a++) {
      const ang = startAngle + 5.2 + (a - 1) * 4.7;
      const rad = (ang * Math.PI) / 180;
      const ax  = +(CX + RX * Math.sin(rad)).toFixed(1);
      const ay  = +(CY + RY * Math.cos(rad)).toFixed(1);
      beads.push({ id: `bead-dec${dec}-av${a}`, x: ax, y: ay, r: 15, type: 'ave' });
      loopPts.push(`${ax},${ay}`);
    }

    const glAng = startAngle + 56.5;
    const glRad = (glAng * Math.PI) / 180;
    const gx    = +(CX + RX * Math.sin(glRad)).toFixed(1);
    const gy    = +(CY + RY * Math.cos(glRad)).toFixed(1);
    beads.push({ id: `bead-dec${dec}-gl`, x: gx, y: gy, r: 11, type: 'gloria' });
    loopPts.push(`${gx},${gy}`);
  }

  const stemPath = `M 450,866 L 450,563`;
  const loopPath = `M 450,488 L ${loopPts.join(' L ')} Z`;
  return { beads, loopPath, stemPath };
}

const { beads: BEAD_DEFS, loopPath: LOOP_PATH, stemPath: STEM_PATH } = buildBeads();

/* ============================================================================
   CORES POR ESTADO DA CONTA
   - Não rezada   → madeira neutra suave
   - Rezada       → âmbar/dourado rico
   - Ativa agora  → branco-âmbar brilhante com anel destacado
   ============================================================================ */
const NEUTRAL  = { fill: '#f5e6c8', stroke: '#c9a96e', shimmer: '#e8d0a4' };
const PRAYED   = { fill: '#f59e0b', stroke: '#92400e', shimmer: '#fcd34d' };
const ACTIVE   = { fill: '#fef3c7', stroke: '#d97706', shimmer: '#fef9c3' };

// Glória: variações da bolinha vermelha separadora
const GLORIA_NEUTRAL = { fill: '#fecaca', stroke: '#ef4444' };
const GLORIA_PRAYED  = { fill: '#b91c1c', stroke: '#7f1d1d' };
const GLORIA_ACTIVE  = { fill: '#ef4444', stroke: '#991b1b' };

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
    const idx = steps.findIndex(s => s.beadId === beadId);
    if (idx === -1) return;
    setStepIdx(idx);
    const target = steps[idx];
    // Autoplay com pequeno delay para garantir que o estado foi atualizado
    setTimeout(() => {
      playStep(target.audioSrc, target.shortText, () => setTimeout(advance, 700));
    }, 60);
  }, [advance, playStep, steps, stopAll]);

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
  const isActive    = (id: string) => step.beadId === id;
  const isPrayed    = (id: string) => {
    const bi = steps.findIndex(s => s.beadId === id);
    return bi !== -1 && bi < stepIdx;
  };

  /* ── Cor da conta baseada no estado ── */
  function beadColors(bead: BeadDef) {
    const active  = isActive(bead.id);
    const prayed  = isPrayed(bead.id);
    if (bead.type === 'gloria') {
      if (active)  return GLORIA_ACTIVE;
      if (prayed)  return GLORIA_PRAYED;
      return GLORIA_NEUTRAL;
    }
    if (active)  return ACTIVE;
    if (prayed)  return PRAYED;
    return NEUTRAL;
  }

  return (
    <div className="w-full max-w-screen-2xl mx-auto px-2 sm:px-4 py-2 select-none">

      {/* ── SELETOR DE MISTÉRIOS ── */}
      <div className="flex flex-wrap justify-center gap-2 mb-3">
        {KIDS_MYSTERY_GROUPS.map(g => {
          const today = g.days.includes(new Date().getDay());
          const sel   = g.id === groupId;
          return (
            <button key={g.id} type="button"
              onClick={() => { stopAll(); playBell(); setGroupId(g.id); setStepIdx(0); }}
              className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 border shadow-xs ${
                sel
                  ? 'bg-amber-500 text-white border-amber-600 shadow-md scale-105'
                  : 'bg-white/90 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-amber-200 dark:border-slate-700 hover:bg-amber-50'
              }`}>
              {g.badgeEmoji} {g.name}
              {today && <span className="text-[10px] bg-white/25 px-1.5 rounded-full font-black">Hoje</span>}
            </button>
          );
        })}
        {onSwitchToAdult && (
          <button type="button" onClick={onSwitchToAdult}
            className="px-3 py-1.5 rounded-full text-xs text-slate-400 hover:text-slate-600 cursor-pointer hover:underline">
            Modo Adulto
          </button>
        )}
      </div>

      {/* ── LAYOUT: TERÇO GIGANTE (65%) + CARD MARIA (35%) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[65%_35%] gap-6 items-center">

        {/* ═══ TERÇO GIGANTE (sem container, flutuante) ═══ */}
        <div className="flex items-center justify-center">
          <div className="w-full" style={{ maxWidth: '760px' }}>
            <svg viewBox="0 0 900 960" className="w-full h-auto select-none" style={{ overflow: 'visible' }}>
              <defs>
                {/* Sombra suave */}
                <filter id="bs" x="-30%" y="-30%" width="160%" height="160%">
                  <feDropShadow dx="0" dy="2" stdDeviation="2.5" floodOpacity="0.2" floodColor="#78350f" />
                </filter>
                {/* Brilho da conta ativa */}
                <filter id="activeGlow" x="-60%" y="-60%" width="220%" height="220%">
                  <feGaussianBlur stdDeviation="5" result="blur" />
                  <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
                {/* Cruz */}
                <linearGradient id="crossBg" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#1e40af" /><stop offset="100%" stopColor="#1e3a8a" />
                </linearGradient>
                {/* Clip medalha */}
                <clipPath id="mc"><ellipse cx="450" cy="525" rx="31" ry="38" /></clipPath>
              </defs>

              {/* Cordão dourado suave */}
              <path d={STEM_PATH} fill="none" stroke="#c9a96e" strokeWidth="4" strokeDasharray="5 3" opacity="0.7" />
              <path d={LOOP_PATH} fill="none" stroke="#c9a96e" strokeWidth="4" strokeDasharray="5 3" opacity="0.7" />

              {/* Centro: título do mistério atual */}
              <g transform="translate(450,315)" className="pointer-events-none">
                <circle r="78" fill="white" fillOpacity="0.82" stroke="#e5c97a" strokeWidth="2"
                  className="dark:fill-slate-900/80 dark:stroke-amber-700/40" />
                <text y="-20" textAnchor="middle" fontSize="26">🕊️</text>
                <text y="8" textAnchor="middle" fontSize="12" fontWeight="800" fill="#78350f"
                  className="dark:fill-amber-200">
                  {step.mysteryNumber ? `${step.mysteryNumber}º MISTÉRIO` : 'SANTO TERÇO'}
                </text>
                {step.fruit && (
                  <text y="27" textAnchor="middle" fontSize="11" fontStyle="italic" fill="#059669">
                    🌱 {step.fruit}
                  </text>
                )}
              </g>

              {/* ── CONTAS ── */}
              {BEAD_DEFS.map(bead => {
                const active = isActive(bead.id);
                const colors = beadColors(bead);

                return (
                  <g key={bead.id} onClick={() => jumpToBead(bead.id)}
                    className="cursor-pointer"
                    style={{ transition: 'transform 0.1s ease-out' }}>

                    {/* Área de toque ampliada */}
                    <circle cx={bead.x} cy={bead.y} r={bead.r + 12} fill="transparent" />

                    {/* Anel indicador estático na conta ativa (sem pulse) */}
                    {active && (
                      <circle cx={bead.x} cy={bead.y} r={bead.r + 8}
                        fill="none" stroke="#f59e0b" strokeWidth="4" opacity="0.95" />
                    )}

                    {/* ── Crucifixo ── */}
                    {bead.type === 'cross' && (
                      <g transform={`translate(${bead.x - 26}, ${bead.y - 42})`}>
                        <rect x="18" y="0" width="16" height="84" rx="4"
                          fill="url(#crossBg)" stroke="#fcd34d" strokeWidth="2.5" filter="url(#bs)" />
                        <rect x="0" y="22" width="52" height="16" rx="4"
                          fill="url(#crossBg)" stroke="#fcd34d" strokeWidth="2.5" />
                        <circle cx="26" cy="30" r="7" fill="#fef08a" opacity="0.7" />
                        <text x="26" y="71" textAnchor="middle" fontSize="10">✝️</text>
                      </g>
                    )}

                    {/* ── Medalha de Nossa Senhora ── */}
                    {bead.type === 'medal' && (() => {
                      const c = active ? ACTIVE : isPrayed(bead.id) ? PRAYED : NEUTRAL;
                      return (
                        <g>
                          <ellipse cx={bead.x} cy={bead.y} rx={bead.r} ry={bead.r + 8}
                            fill={c.fill} stroke={c.stroke} strokeWidth="3.5" filter="url(#bs)" />
                          <image href="/terco-kids/SORINDO-NORMAL.png"
                            x={bead.x - 29} y={bead.y - 35} width="58" height="72"
                            clipPath="url(#mc)" preserveAspectRatio="xMidYMid slice" />
                          {/* estrelas decorativas */}
                          {[-1, 1].map((s, i) => (
                            <circle key={i} cx={bead.x + s * (bead.r + 5)} cy={bead.y}
                              r="4" fill="#fcd34d" opacity="0.8" />
                          ))}
                        </g>
                      );
                    })()}

                    {/* ── Pai Nosso (bola grande) ── */}
                    {bead.type === 'pn' && (() => {
                      const c = active ? ACTIVE : isPrayed(bead.id) ? PRAYED : NEUTRAL;
                      return (
                        <g filter={active ? 'url(#activeGlow)' : 'url(#bs)'}>
                          <circle cx={bead.x} cy={bead.y} r={bead.r}
                            fill={c.fill} stroke={c.stroke} strokeWidth="2" />
                          <circle cx={bead.x - 6} cy={bead.y - 6} r={bead.r * 0.32}
                            fill="white" opacity="0.55" />
                          <text x={bead.x} y={bead.y + 6} textAnchor="middle" fontSize="13">👑</text>
                        </g>
                      );
                    })()}

                    {/* ── Glória ao Pai (bolinha separadora) ── */}
                    {bead.type === 'gloria' && (() => {
                      const c = colors as typeof GLORIA_NEUTRAL;
                      return (
                        <circle cx={bead.x} cy={bead.y} r={bead.r}
                          fill={c.fill} stroke={c.stroke} strokeWidth="1.5"
                          filter="url(#bs)" />
                      );
                    })()}

                    {/* ── Ave-Maria (bolinha de cor por progresso) ── */}
                    {bead.type === 'ave' && (() => {
                      const c = colors as typeof NEUTRAL;
                      const done = isPrayed(bead.id);
                      return (
                        <g filter={active ? 'url(#activeGlow)' : 'url(#bs)'}>
                          <circle cx={bead.x} cy={bead.y} r={bead.r}
                            fill={c.fill} stroke={c.stroke} strokeWidth="1.5" />
                          <circle cx={bead.x - 4} cy={bead.y - 4} r={bead.r * 0.32}
                            fill="white" opacity={active ? 0.75 : 0.5} />
                          {done && (
                            <text x={bead.x} y={bead.y + 5} textAnchor="middle"
                              fontSize="10" fontWeight="bold" fill="white">✓</text>
                          )}
                        </g>
                      );
                    })()}
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* ═══ CARD DE NOSSA SENHORA (limpo, compacto, apenas ícone + fala + botões) ═══ */}
        <div className="flex flex-col rounded-3xl overflow-hidden shadow-2xl border border-amber-200 dark:border-amber-800/50 bg-gradient-to-b from-amber-50 to-white dark:from-slate-900 dark:to-slate-950">

          {/* Ícone grande de Nossa Senhora + balão de fala */}
          <div className="flex flex-col items-center px-6 pt-8 pb-4 gap-4">
            {/* Ícone circular da Mãezinha */}
            <div className="relative">
              <div className="absolute -inset-2 bg-amber-300 rounded-full blur-md opacity-50" />
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-4 border-amber-300 shadow-lg bg-amber-100">
                <img
                  src={playing ? '/terco-kids/FALANDO.png' : '/terco-kids/SORINDO-NORMAL.png'}
                  alt="Nossa Senhora"
                  className="w-full h-full object-cover"
                  onError={e => { (e.currentTarget as HTMLImageElement).src = '/terco-kids/SORINDO-NORMAL.png'; }}
                />
              </div>
              {/* Coroa animada */}
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-2xl pointer-events-none">👑</span>
            </div>

            {/* Balão de fala: APENAS o shortText da oração atual */}
            <div className="relative w-full bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-amber-200 dark:border-slate-700 px-5 py-4">
              {/* Cauda do balão apontando para cima (Nossa Senhora) */}
              <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-0 h-0
                border-l-[10px] border-l-transparent
                border-r-[10px] border-r-transparent
                border-b-[12px] border-b-white dark:border-b-slate-800" />

              {/* Título do passo atual */}
              <p className="text-xs font-extrabold uppercase tracking-wider text-amber-700 dark:text-amber-400 mb-1">
                {step.mysteryNumber ? `${step.mysteryNumber}º Mistério` : step.title}
              </p>

              {/* Frase curta e alegre */}
              <p className="text-base sm:text-lg font-semibold text-slate-800 dark:text-amber-50 leading-snug">
                {step.shortText}
              </p>

              {step.fruit && (
                <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-2 font-medium">
                  🌱 Fruto: {step.fruit}
                </p>
              )}
            </div>
          </div>

          {/* Botões de controle */}
          <div className="px-5 pb-7 pt-2 space-y-3">

            {/* Play / Pausa */}
            <button type="button" onClick={togglePlay}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 text-white font-black text-lg shadow-md hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-3 cursor-pointer">
              {playing
                ? <><Pause className="w-6 h-6 fill-white" /> Pausar</>
                : <><Play  className="w-6 h-6 fill-white" /> Ouvir Oração</>
              }
            </button>

            {/* Voltar / Próxima */}
            <div className="grid grid-cols-2 gap-3">
              <button type="button" onClick={prev} disabled={stepIdx === 0}
                className="py-3 rounded-xl bg-white dark:bg-slate-800 border border-amber-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold flex items-center justify-center gap-2 hover:bg-amber-50 disabled:opacity-40 cursor-pointer shadow-sm">
                <SkipBack className="w-4 h-4" /> Voltar
              </button>
              <button type="button" onClick={next} disabled={stepIdx >= steps.length - 1}
                className="py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-40">
                Próxima <SkipForward className="w-4 h-4" />
              </button>
            </div>

            {/* Mudo */}
            <div className="flex justify-center">
              <button type="button" onClick={() => setMuted(m => !m)}
                className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-amber-700 cursor-pointer">
                {muted
                  ? <><VolumeX className="w-4 h-4 text-rose-400" /> Sem som</>
                  : <><Volume2 className="w-4 h-4 text-emerald-500" /> Com som</>}
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SantoTercoKids;
