import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX } from 'lucide-react';

/* ============================================================================
   TIPOS
   ============================================================================ */
export type MysteryGroupKids = 'gozosos' | 'dolorosos' | 'gloriosos' | 'luminosos';

export interface PrayerStep {
  id: string;
  title: string;
  category: 'credo' | 'pai-nosso' | 'ave-maria' | 'gloria' | 'final';
  mysteryNumber?: number;
  decadeIndex?: number;
  audioSrc: string;
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

/* ============================================================================
   10 CORES PASTEL VIVAS (Uma por Ave-Maria)
   ============================================================================ */
const BEAD_COLORS = [
  { grad: 'g0', light: '#ffe4e6', mid: '#fda4af', dark: '#f43f5e' },
  { grad: 'g1', light: '#e0f2fe', mid: '#7dd3fc', dark: '#0284c7' },
  { grad: 'g2', light: '#fef3c7', mid: '#fcd34d', dark: '#d97706' },
  { grad: 'g3', light: '#d1fae5', mid: '#6ee7b7', dark: '#059669' },
  { grad: 'g4', light: '#ede9fe', mid: '#c4b5fd', dark: '#7c3aed' },
  { grad: 'g5', light: '#ffedd5', mid: '#fdba74', dark: '#ea580c' },
  { grad: 'g6', light: '#cffafe', mid: '#67e8f9', dark: '#0891b2' },
  { grad: 'g7', light: '#fce7f3', mid: '#f472b6', dark: '#db2777' },
  { grad: 'g8', light: '#ccfbf1', mid: '#5eead4', dark: '#0d9488' },
  { grad: 'g9', light: '#fef9c3', mid: '#fde047', dark: '#ca8a04' },
];

/* ============================================================================
   MISTÉRIOS
   ============================================================================ */
export const KIDS_MYSTERY_GROUPS: MysteryGroupData[] = [
  {
    id: 'gozosos', name: 'Mistérios Gozosos', badgeEmoji: '🌟', days: [1, 6],
    mysteries: [
      { number: 1, title: 'A Anunciação do Anjo Gabriel', kidsExplanation: 'O lindo anjo Gabriel desce do céu e diz a Maria que ela será a Mãezinha de Jesus! Maria responde com amor: "Faça-se em mim a vontade de Deus!"', audioSrc: '/terco-kids/gozoso-1.mp3', fruit: 'Humildade' },
      { number: 2, title: 'A Visita de Maria a Santa Isabel', kidsExplanation: 'Maria viaja pelas montanhas para ajudar sua prima Isabel. Quando Maria chega, todos se enchem do Espírito Santo!', audioSrc: '/terco-kids/gozoso-2.mp3', fruit: 'Caridade' },
      { number: 3, title: 'O Nascimento de Jesus em Belém', kidsExplanation: 'Jesus nasce numa manjedoura simples, entre os animaizinhos. Os anjos cantam Glória a Deus!', audioSrc: '/terco-kids/gozoso-3.mp3', fruit: 'Gratidão' },
      { number: 4, title: 'A Apresentação de Jesus no Templo', kidsExplanation: 'Maria e José levam o bebê Jesus ao Templo para consagrá-lo a Deus Pai. O vovô Simeão abraça o Salvador com alegria!', audioSrc: '/terco-kids/gozoso-4.mp3', fruit: 'Pureza' },
      { number: 5, title: 'O Menino Jesus no Templo', kidsExplanation: 'Aos doze anos, Jesus ensina os doutores no Templo com muita sabedoria e amor a Deus!', audioSrc: '/terco-kids/gozoso-5.mp3', fruit: 'Buscar Jesus' },
    ]
  },
  {
    id: 'dolorosos', name: 'Mistérios Dolorosos', badgeEmoji: '❤️‍🔥', days: [2, 5],
    mysteries: [
      { number: 1, title: 'A Oração no Horto', kidsExplanation: 'No jardim do Getsêmani, Jesus reza com amor por nós e diz ao Pai: "Seja feita a Tua vontade!"', audioSrc: '/terco-kids/doloroso-1.mp3', fruit: 'Confiança' },
      { number: 2, title: 'A Flagelação de Jesus', kidsExplanation: 'Jesus sofre por amor infinito a cada um de nós, ensinando o valor da paciência e do perdão.', audioSrc: '/terco-kids/doloroso-2.mp3', fruit: 'Paciência' },
      { number: 3, title: 'A Coroação de Espinhos', kidsExplanation: 'Os soldados colocam uma coroa de espinhos em Jesus, mas Ele é o verdadeiro Rei do Amor!', audioSrc: '/terco-kids/doloroso-3.mp3', fruit: 'Humildade' },
      { number: 4, title: 'Jesus Carrega a Cruz', kidsExplanation: 'Jesus carrega a pesada cruz com coragem. A Mãezinha Maria encontra Seu Filho e Lhe dá consolo!', audioSrc: '/terco-kids/doloroso-4.mp3', fruit: 'Ajudar o próximo' },
      { number: 5, title: 'A Morte de Jesus na Cruz', kidsExplanation: 'Na Cruz, Jesus nos entrega Nossa Senhora por Mãe. Ele abre as portas do Céu com Seu amor infinito!', audioSrc: '/terco-kids/doloroso-5.mp3', fruit: 'Perdoar' },
    ]
  },
  {
    id: 'gloriosos', name: 'Mistérios Gloriosos', badgeEmoji: '👑', days: [0, 3],
    mysteries: [
      { number: 1, title: 'A Ressurreição de Jesus', kidsExplanation: 'No terceiro dia, Jesus ressuscita cheio de luz e glória! Ele venceu a morte para sempre!', audioSrc: '/terco-kids/glorioso-1.mp3', fruit: 'Fé e alegria' },
      { number: 2, title: 'A Ascensão ao Céu', kidsExplanation: 'Jesus sobe aos Céus numa nuvem luminosa para nos preparar um lugar belíssimo!', audioSrc: '/terco-kids/glorioso-2.mp3', fruit: 'Esperança' },
      { number: 3, title: 'A Vinda do Espírito Santo', kidsExplanation: 'Com Maria em oração, o Espírito Santo desce sobre os apóstolos como chamas de amor!', audioSrc: '/terco-kids/glorioso-3.mp3', fruit: 'Sabedoria' },
      { number: 4, title: 'A Assunção de Nossa Senhora', kidsExplanation: 'Os anjinhos levam Nossa Senhora em corpo e alma para os braços de Jesus no Céu!', audioSrc: '/terco-kids/glorioso-4.mp3', fruit: 'Confiança em Maria' },
      { number: 5, title: 'A Coroação de Maria Rainha', kidsExplanation: 'Nossa Senhora é coroada com 12 estrelas como Rainha do Céu e protetora dos pequeninos!', audioSrc: '/terco-kids/glorioso-5.mp3', fruit: 'Amor a Maria' },
    ]
  },
  {
    id: 'luminosos', name: 'Mistérios Luminosos', badgeEmoji: '💡', days: [4],
    mysteries: [
      { number: 1, title: 'O Batismo de Jesus', kidsExplanation: 'Jesus é batizado no rio Jordão. O Pai do Céu diz: "Este é meu Filho muito amado!"', audioSrc: '/terco-kids/luminoso-1.mp3', fruit: 'Pureza' },
      { number: 2, title: 'O Milagre em Caná', kidsExplanation: 'Maria pede a Jesus. Ela diz: "Fazei tudo o que Ele vos disser!" E a água vira vinho excelente!', audioSrc: '/terco-kids/luminoso-2.mp3', fruit: 'Obediência' },
      { number: 3, title: 'O Anúncio do Reino', kidsExplanation: 'Jesus cura os doentinhos e acolhe as criancinhas, ensinando o amor a Deus Pai!', audioSrc: '/terco-kids/luminoso-3.mp3', fruit: 'Bondade' },
      { number: 4, title: 'A Transfiguração no Tabor', kidsExplanation: 'No alto do monte, as roupinhas de Jesus brilham como a luz do sol, revelando Sua glória!', audioSrc: '/terco-kids/luminoso-4.mp3', fruit: 'Oração' },
      { number: 5, title: 'A Instituição da Eucaristia', kidsExplanation: 'Na Última Ceia, Jesus nos dá Seu Corpo e Sangue na Santa Hóstia, ficando para sempre conosco!', audioSrc: '/terco-kids/luminoso-5.mp3', fruit: 'Amor à Missa' },
    ]
  }
];

/* ============================================================================
   TEXTOS DAS ORAÇÕES
   ============================================================================ */
const PRAYERS = {
  credo: "Em nome do Pai, do Filho e do Espírito Santo. Amém! [...] Creio em Deus Pai Todo-Poderoso, [...] Criador do céu e da terra; [...] e em Jesus Cristo, seu único Filho, Nosso Senhor; [...] nasceu da Virgem Maria; [...] foi crucificado, morto e sepultado; [...] ressuscitou ao terceiro dia; [...] subiu aos céus. [...] Creio no Espírito Santo; [...] na Santa Igreja Católica; [...] na comunhão dos santos; [...] na remissão dos pecados; [...] na vida eterna. Amém!",
  paiNosso: "Pai Nosso que estais no céu, [...] santificado seja o vosso Nome; [...] venha a nós o vosso Reino; [...] seja feita a vossa vontade, [...] assim na terra como no céu. [...] O pão nosso de cada dia nos dai hoje; [...] perdoai-nos as nossas ofensas, [...] assim como nós perdoamos a quem nos tem ofendido; [...] e não nos deixeis cair em tentação, [...] mas livrai-nos do mal. Amém!",
  aveMaria: "Ave Maria, cheia de graça, [...] o Senhor é convosco; [...] bendita sois vós entre as mulheres, [...] e bendito é o fruto do vosso ventre, Jesus. [...] Santa Maria, Mãe de Deus, [...] rogai por nós, pecadores, [...] agora e na hora da nossa morte. Amém!",
  gloria: "Glória ao Pai, ao Filho e ao Espírito Santo. [...] Como era no princípio, agora e sempre. Amém! [...] Ó meu Jesus, perdoai-nos, [...] livrai-nos do fogo do inferno, [...] levai as almas todas para o Céu. Amém!",
  salve: "Salve, Rainha, Mãe de misericórdia, [...] vida, doçura e esperança nossa, salve! [...] A vós bradamos os degredados filhos de Eva. [...] Eia, pois, advogada nossa, [...] esses vossos olhos misericordiosos a nós volvei. [...] Rogai por nós, Santa Mãe de Deus, [...] para que sejamos dignos das promessas de Cristo. Amém!",
  final: "Parabéns, meu querido amiguinho! [...] Você concluiu o Santo Terço com muito amor no coração! [...] Jesus e Nossa Senhora estão muito felizes com a sua oração! [...] Que Deus abençoe a você e a toda a sua família! Amém!"
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
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.15);
    gain.gain.setValueAtTime(0.18, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.28);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.28);
  } catch { /* silencioso */ }
}

/* ============================================================================
   CONSTRUÇÃO DOS PASSOS
   ============================================================================ */
function buildSteps(group: MysteryGroupData): PrayerStep[] {
  const s: PrayerStep[] = [];

  s.push({ id: 'credo', title: 'Sinal da Cruz e o Credo', category: 'credo', audioSrc: '/terco-kids/CREIO.mp3', text: PRAYERS.credo, beadId: 'bead-cross' });
  s.push({ id: 'pn0', title: 'Pai Nosso Inicial', category: 'pai-nosso', audioSrc: '/terco-kids/pai-nosso.mp3', text: PRAYERS.paiNosso, beadId: 'bead-pn-intro' });
  s.push({ id: 'av0-1', title: '1ª Ave-Maria — Pela Fé', category: 'ave-maria', audioSrc: '/terco-kids/ave-maria.mp3', text: PRAYERS.aveMaria, beadId: 'bead-av0-1' });
  s.push({ id: 'av0-2', title: '2ª Ave-Maria — Pela Esperança', category: 'ave-maria', audioSrc: '/terco-kids/ave-maria-2.mp3', text: PRAYERS.aveMaria, beadId: 'bead-av0-2' });
  s.push({ id: 'av0-3', title: '3ª Ave-Maria — Pela Caridade', category: 'ave-maria', audioSrc: '/terco-kids/ave-maria.mp3', text: PRAYERS.aveMaria, beadId: 'bead-av0-3' });
  s.push({ id: 'gl0', title: 'Glória ao Pai', category: 'gloria', audioSrc: '/terco-kids/gloria-ao-pai.mp3', text: PRAYERS.gloria, beadId: 'bead-gl-intro' });

  group.mysteries.forEach((m, di) => {
    s.push({ id: `pn${di + 1}`, title: `${m.number}º Mistério — ${m.title}`, category: 'pai-nosso', mysteryNumber: m.number, decadeIndex: di, audioSrc: m.audioSrc, text: `${m.kidsExplanation} [...] ${PRAYERS.paiNosso}`, fruit: m.fruit, beadId: `bead-dec${di}-pn` });
    for (let a = 1; a <= 10; a++) {
      s.push({ id: `av${di + 1}-${a}`, title: `${a}ª Ave-Maria`, category: 'ave-maria', mysteryNumber: m.number, decadeIndex: di, audioSrc: a % 2 === 0 ? '/terco-kids/ave-maria-2.mp3' : '/terco-kids/ave-maria.mp3', text: PRAYERS.aveMaria, beadId: `bead-dec${di}-av${a}` });
    }
    s.push({ id: `gl${di + 1}`, title: `Glória ao Pai — ${m.number}º Mistério`, category: 'gloria', decadeIndex: di, audioSrc: di % 2 === 0 ? '/terco-kids/gloria-ao-pai.mp3' : '/terco-kids/gloria-ao-pai-2.mp3', text: PRAYERS.gloria, beadId: `bead-dec${di}-gl` });
  });

  s.push({ id: 'salve', title: 'Salve Rainha', category: 'final', audioSrc: '/terco-kids/santo-anjo.mp3', text: PRAYERS.salve, beadId: 'bead-medal' });
  s.push({ id: 'final', title: 'Terço Concluído! 🌟', category: 'final', audioSrc: '/terco-kids/santo-anjo.mp3', text: PRAYERS.final, beadId: 'bead-medal' });
  return s;
}

/* ============================================================================
   GEOMETRIA DAS CONTAS — CÍRCULO GRANDE E ESPAÇADO
   ============================================================================ */
interface BeadDef {
  id: string;
  x: number; y: number; r: number;
  type: 'cross' | 'pn' | 'ave' | 'gloria' | 'medal';
  colorIdx?: number;
  label?: string;
}

function buildBeads(): { beads: BeadDef[]; loopPath: string; stemPath: string } {
  // ViewBox 900 × 960. Círculo grande central.
  const CX = 450, CY = 330, RX = 320, RY = 250;
  const beads: BeadDef[] = [];
  const loopPts: string[] = [];

  /* ---- HASTE (base) ---- */
  // Cruz
  beads.push({ id: 'bead-cross',    x: 450, y: 890, r: 28, type: 'cross' });
  // PN inicial
  beads.push({ id: 'bead-pn-intro', x: 450, y: 790, r: 21, type: 'pn' });
  // 3 Ave-Marias iniciais
  beads.push({ id: 'bead-av0-1',   x: 450, y: 730, r: 14, type: 'ave', colorIdx: 0, label: '1' });
  beads.push({ id: 'bead-av0-2',   x: 450, y: 680, r: 14, type: 'ave', colorIdx: 1, label: '2' });
  beads.push({ id: 'bead-av0-3',   x: 450, y: 630, r: 14, type: 'ave', colorIdx: 2, label: '3' });
  // Glória intro
  beads.push({ id: 'bead-gl-intro', x: 450, y: 579, r: 10, type: 'gloria' });
  // Medalha
  beads.push({ id: 'bead-medal',    x: 450, y: 515, r: 35, type: 'medal' });

  /* ---- CÍRCULO DAS 5 DEZENAS ---- */
  for (let dec = 0; dec < 5; dec++) {
    const startAngle = 18 + dec * 64.8;           // cada dezena ocupa ~64.8 graus

    // Pai Nosso (bola grande)
    const pnRad = (startAngle * Math.PI) / 180;
    const px = +(CX + RX * Math.sin(pnRad)).toFixed(1);
    const py = +(CY + RY * Math.cos(pnRad)).toFixed(1);
    beads.push({ id: `bead-dec${dec}-pn`, x: px, y: py, r: 21, type: 'pn', label: `${dec + 1}º` });
    loopPts.push(`${px},${py}`);

    // 10 Ave-Marias
    for (let a = 1; a <= 10; a++) {
      const ang = startAngle + 5.2 + (a - 1) * 4.7;
      const rad = (ang * Math.PI) / 180;
      const ax = +(CX + RX * Math.sin(rad)).toFixed(1);
      const ay = +(CY + RY * Math.cos(rad)).toFixed(1);
      beads.push({ id: `bead-dec${dec}-av${a}`, x: ax, y: ay, r: 14, type: 'ave', colorIdx: (a - 1) % 10, label: `${a}` });
      loopPts.push(`${ax},${ay}`);
    }

    // Glória
    const glAng = startAngle + 56.5;
    const glRad = (glAng * Math.PI) / 180;
    const gx = +(CX + RX * Math.sin(glRad)).toFixed(1);
    const gy = +(CY + RY * Math.cos(glRad)).toFixed(1);
    beads.push({ id: `bead-dec${dec}-gl`, x: gx, y: gy, r: 10, type: 'gloria' });
    loopPts.push(`${gx},${gy}`);
  }

  const stemPath = `M 450,860 L 450,552`;
  const loopPath = `M 450,478 L ${loopPts.join(' L ')} Z`;
  return { beads, loopPath, stemPath };
}

const { beads: BEAD_DEFS, loopPath: LOOP_PATH, stemPath: STEM_PATH } = buildBeads();

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
  const steps = useMemo(() => buildSteps(activeGroup), [activeGroup]);

  const [stepIdx, setStepIdx] = useState(0);
  const step = steps[stepIdx] ?? steps[0];

  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [phraseIdx, setPhraseIdx] = useState(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<any>(null);

  // Frase ativa
  const phrases = useMemo(
    () => step.text.split(/\[\.\.\.\]/g).map(p => p.trim()).filter(Boolean),
    [step.text]
  );

  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.preload = 'auto';
    return () => {
      audioRef.current?.pause();
      clearInterval(timerRef.current);
      window.speechSynthesis?.cancel();
    };
  }, []);

  const stopAll = useCallback(() => {
    audioRef.current?.pause();
    clearInterval(timerRef.current);
    window.speechSynthesis?.cancel();
    setPlaying(false);
  }, []);

  const advance = useCallback(() => {
    stopAll();
    playBell();
    setStepIdx(i => Math.min(i + 1, steps.length - 1));
    setPhraseIdx(0);
  }, [steps.length, stopAll]);

  const playAudio = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || muted) return;
    audio.pause();
    audio.src = step.audioSrc;
    audio.currentTime = 0;
    audio.play()
      .then(() => {
        setPlaying(true);
        timerRef.current = setInterval(() => {
          if (audio.duration && phrases.length > 0) {
            setPhraseIdx(Math.min(
              Math.floor((audio.currentTime / audio.duration) * phrases.length),
              phrases.length - 1
            ));
          }
        }, 150);
        audio.onended = () => {
          clearInterval(timerRef.current);
          setPlaying(false);
          setTimeout(advance, 800);
        };
      })
      .catch(() => {
        setPlaying(true);
        const utt = new SpeechSynthesisUtterance(step.text.replace(/\[\.\.\.\]/g, ', '));
        utt.lang = 'pt-BR'; utt.rate = 0.88; utt.pitch = 1.1;
        utt.onend = () => { setPlaying(false); setTimeout(advance, 600); };
        window.speechSynthesis.speak(utt);
      });
  }, [advance, muted, phrases.length, step.audioSrc, step.text]);

  const togglePlay = () => playing ? stopAll() : playAudio();

  const jumpTo = (beadId: string) => {
    stopAll();
    playBell();
    const idx = steps.findIndex(s => s.beadId === beadId);
    if (idx !== -1) { setStepIdx(idx); setPhraseIdx(0); }
  };

  const prev = () => { stopAll(); playBell(); setStepIdx(i => Math.max(i - 1, 0)); setPhraseIdx(0); };

  const isActive = (id: string) => step.beadId === id;
  const isDone   = (id: string) => {
    const bi = steps.findIndex(s => s.beadId === id);
    return bi !== -1 && bi < stepIdx;
  };

  return (
    <div className="w-full max-w-screen-2xl mx-auto px-2 sm:px-4 py-2 select-none">

      {/* ── SELETOR DE MISTÉRIOS ── */}
      <div className="flex flex-wrap justify-center gap-2 mb-3">
        {KIDS_MYSTERY_GROUPS.map(g => {
          const today = g.days.includes(new Date().getDay());
          const sel   = g.id === groupId;
          return (
            <button
              key={g.id}
              type="button"
              onClick={() => { stopAll(); playBell(); setGroupId(g.id); setStepIdx(0); setPhraseIdx(0); }}
              className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
                sel
                  ? 'bg-amber-500 text-white border-amber-600 shadow-md scale-105'
                  : 'bg-white/90 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-amber-200 dark:border-slate-700 hover:bg-amber-50'
              }`}
            >
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

      {/* ── LAYOUT PRINCIPAL: TERÇO GIGANTE + CARD NOSSA SENHORA ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[62%_38%] xl:grid-cols-[65%_35%] gap-4 items-center">

        {/* ════ BLOCO 1: TERÇO GIGANTE, FLUTUANDO SEM CONTAINER ════ */}
        <div className="flex items-center justify-center">
          <div className="w-full" style={{ maxWidth: '720px' }}>
            <svg
              viewBox="0 0 900 960"
              className="w-full h-auto drop-shadow-xl select-none"
              style={{ overflow: 'visible' }}
            >
              <defs>
                {/* Sombra suave */}
                <filter id="bs" x="-30%" y="-30%" width="160%" height="160%">
                  <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.22" floodColor="#7c3aed" />
                </filter>
                {/* Brilho ativo */}
                <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="6" result="b" />
                  <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
                {/* Dourado */}
                <radialGradient id="gold" cx="35%" cy="30%" r="65%">
                  <stop offset="0%" stopColor="#fef9c3" />
                  <stop offset="50%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#92400e" />
                </radialGradient>
                {/* Rubi */}
                <radialGradient id="ruby" cx="35%" cy="30%" r="65%">
                  <stop offset="0%" stopColor="#fecaca" />
                  <stop offset="55%" stopColor="#ef4444" />
                  <stop offset="100%" stopColor="#7f1d1d" />
                </radialGradient>
                {/* Azul Cruz */}
                <linearGradient id="crossBg" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#1e40af" />
                  <stop offset="100%" stopColor="#1e3a8a" />
                </linearGradient>
                {/* Clip medalha */}
                <clipPath id="mc"><ellipse cx="450" cy="515" rx="30" ry="37" /></clipPath>
                {/* 10 gradientes das Ave-Marias */}
                {BEAD_COLORS.map((c, i) => (
                  <radialGradient key={i} id={c.grad} cx="35%" cy="30%" r="65%">
                    <stop offset="0%"   stopColor={c.light} />
                    <stop offset="55%"  stopColor={c.mid}   />
                    <stop offset="100%" stopColor={c.dark}  />
                  </radialGradient>
                ))}
              </defs>

              {/* Cordão */}
              <path d={STEM_PATH} fill="none" stroke="#d97706" strokeWidth="4.5" strokeDasharray="5 3" opacity="0.7" />
              <path d={LOOP_PATH} fill="none" stroke="#d97706" strokeWidth="4.5" strokeDasharray="5 3" opacity="0.7" />

              {/* Centro do círculo: nome do mistério ativo */}
              <g transform="translate(450,330)" className="pointer-events-none">
                <circle r="80" fill="white" fillOpacity="0.75" stroke="#fcd34d" strokeWidth="2" className="dark:fill-slate-900/80" />
                <text y="-18" textAnchor="middle" fontSize="28">🕊️</text>
                <text y="10"  textAnchor="middle" fontSize="13" fontWeight="bold" fill="#78350f" className="dark:fill-amber-200">
                  {step.mysteryNumber ? `${step.mysteryNumber}º MISTÉRIO` : 'SANTO TERÇO'}
                </text>
                {step.fruit && (
                  <text y="30" textAnchor="middle" fontSize="11" fontStyle="italic" fill="#059669">
                    🌱 {step.fruit}
                  </text>
                )}
              </g>

              {/* ── CONTAS ── */}
              {BEAD_DEFS.map(bead => {
                const active    = isActive(bead.id);
                const completed = isDone(bead.id);
                const color     = bead.colorIdx !== undefined ? BEAD_COLORS[bead.colorIdx] : null;

                return (
                  <g
                    key={bead.id}
                    onClick={() => jumpTo(bead.id)}
                    className="cursor-pointer"
                    style={{ transition: 'transform 0.15s' }}
                  >
                    {/* Área de toque ampliada */}
                    <circle cx={bead.x} cy={bead.y} r={bead.r + 12} fill="transparent" />

                    {/* Halo animado da conta ATIVA */}
                    {active && (
                      <>
                        <circle cx={bead.x} cy={bead.y} r={bead.r + 13} fill="none"
                          stroke="#f59e0b" strokeWidth="4" opacity="0.9"
                          className="animate-ping" />
                        <circle cx={bead.x} cy={bead.y} r={bead.r + 7} fill="#fef08a"
                          opacity="0.45" className="animate-pulse" />
                        <text x={bead.x} y={bead.y - bead.r - 10} textAnchor="middle"
                          fontSize="22" className="animate-bounce">⭐</text>
                      </>
                    )}

                    {/* ── Cruz ── */}
                    {bead.type === 'cross' && (
                      <g transform={`translate(${bead.x - 26}, ${bead.y - 40})`}>
                        <rect x="18" y="0" width="16" height="80" rx="4"
                          fill="url(#crossBg)" stroke="#fcd34d" strokeWidth="2.5" filter="url(#bs)" />
                        <rect x="0" y="20" width="52" height="16" rx="4"
                          fill="url(#crossBg)" stroke="#fcd34d" strokeWidth="2.5" />
                        <text x="26" y="66" textAnchor="middle" fontSize="11">✝️</text>
                      </g>
                    )}

                    {/* ── Medalha ── */}
                    {bead.type === 'medal' && (
                      <g>
                        <ellipse cx={bead.x} cy={bead.y} rx={bead.r} ry={bead.r + 8}
                          fill="#fef08a" stroke="#f59e0b" strokeWidth="3.5" filter="url(#bs)" />
                        <image href="/terco-kids/SORINDO-NORMAL.png"
                          x={bead.x - 28} y={bead.y - 34} width="56" height="70"
                          clipPath="url(#mc)" preserveAspectRatio="xMidYMid slice" />
                        {active && <ellipse cx={bead.x} cy={bead.y} rx={bead.r + 2} ry={bead.r + 10}
                          fill="none" stroke="#f59e0b" strokeWidth="4"
                          className="animate-pulse" />}
                      </g>
                    )}

                    {/* ── Pai Nosso (Bola Dourada Grande) ── */}
                    {bead.type === 'pn' && (
                      <g>
                        <circle cx={bead.x} cy={bead.y} r={bead.r}
                          fill="url(#gold)" stroke="#78350f" strokeWidth="1.8"
                          filter={active ? 'url(#glow)' : 'url(#bs)'} />
                        <circle cx={bead.x - 5} cy={bead.y - 5} r={bead.r * 0.33} fill="white" opacity="0.55" />
                        <text x={bead.x} y={bead.y + 5} textAnchor="middle" fontSize="13">👑</text>
                      </g>
                    )}

                    {/* ── Glória (Bolinha Vermelha) ── */}
                    {bead.type === 'gloria' && (
                      <circle cx={bead.x} cy={bead.y} r={bead.r}
                        fill="url(#ruby)" stroke="#7f1d1d" strokeWidth="1.2"
                        filter="url(#bs)" />
                    )}

                    {/* ── Ave-Maria (Bolinha Pastel Colorida Grande) ── */}
                    {bead.type === 'ave' && color && (
                      <g>
                        <circle cx={bead.x} cy={bead.y} r={bead.r}
                          fill={`url(#${color.grad})`}
                          stroke={color.dark} strokeWidth="1.5"
                          filter={active ? 'url(#glow)' : 'url(#bs)'} />
                        <circle cx={bead.x - 3} cy={bead.y - 3} r={bead.r * 0.35} fill="white" opacity="0.6" />
                        <text x={bead.x} y={bead.y + 4} textAnchor="middle" fontSize="9" fontWeight="bold" fill="white">
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

        {/* ════ BLOCO 2: CARD LIMPO DE NOSSA SENHORA ════ */}
        <div className="flex flex-col gap-0 rounded-3xl overflow-hidden shadow-2xl border border-amber-200 dark:border-amber-800/60 bg-gradient-to-b from-amber-50 to-white dark:from-slate-900 dark:to-slate-950">

          {/* Cabeçalho: imagem + título da oração */}
          <div className="flex items-center gap-4 px-6 pt-6 pb-4 border-b border-amber-100 dark:border-slate-800">
            {/* Imagem circular de Nossa Senhora com halo */}
            <div className="relative shrink-0">
              <div className="absolute -inset-1.5 bg-amber-300 rounded-full blur-sm opacity-70 animate-pulse" />
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-4 border-amber-300 shadow-md bg-amber-100">
                <img
                  src={playing ? '/terco-kids/FALANDO.png' : '/terco-kids/SORINDO-NORMAL.png'}
                  alt="Nossa Senhora"
                  className="w-full h-full object-cover"
                  onError={e => { (e.currentTarget as HTMLImageElement).src = '/terco-kids/SORINDO-NORMAL.png'; }}
                />
              </div>
            </div>
            <div className="min-w-0">
              <p className="text-base sm:text-lg font-serif font-black text-amber-950 dark:text-amber-100 leading-tight line-clamp-2">
                {step.title}
              </p>
              {step.mysteryNumber && step.fruit && (
                <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-0.5 font-medium">
                  🌱 {step.fruit}
                </p>
              )}
            </div>
          </div>

          {/* Balão de Fala com a Oração */}
          <div className="flex-1 px-6 py-4 overflow-y-auto max-h-[300px] sm:max-h-[360px]">
            <div className="space-y-2.5">
              {phrases.map((ph, i) => {
                const cur = playing && phraseIdx === i;
                return (
                  <p key={i} className={`text-base sm:text-lg leading-relaxed rounded-xl px-3 py-1 transition-all duration-200 font-medium ${
                    cur
                      ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-950 dark:text-amber-100 border-l-4 border-amber-500 font-bold'
                      : 'text-slate-700 dark:text-slate-200'
                  }`}>
                    {ph}
                  </p>
                );
              })}
            </div>
          </div>

          {/* Botões de Controle */}
          <div className="px-5 pb-6 pt-4 space-y-3 border-t border-amber-100 dark:border-slate-800">

            {/* Play / Pause Grande */}
            <button
              type="button"
              onClick={togglePlay}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 text-white font-black text-lg shadow-md hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-3 cursor-pointer"
            >
              {playing
                ? <><Pause className="w-6 h-6 fill-white" /> Pausar Oração</>
                : <><Play  className="w-6 h-6 fill-white" /> Ouvir Oração</>
              }
            </button>

            {/* Voltar / Próxima */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={prev}
                disabled={stepIdx === 0}
                className="py-3 rounded-xl bg-white dark:bg-slate-800 border border-amber-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold flex items-center justify-center gap-2 hover:bg-amber-50 disabled:opacity-40 cursor-pointer shadow-sm"
              >
                <SkipBack className="w-4 h-4" /> Voltar
              </button>
              <button
                type="button"
                onClick={advance}
                disabled={stepIdx >= steps.length - 1}
                className="py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-40"
              >
                Próxima <SkipForward className="w-4 h-4" />
              </button>
            </div>

            {/* Mudo (minimalista) */}
            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => setMuted(m => !m)}
                className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-amber-700 cursor-pointer"
              >
                {muted
                  ? <><VolumeX className="w-4 h-4 text-rose-400" /> Sem som</>
                  : <><Volume2 className="w-4 h-4 text-emerald-500" /> Com som</>
                }
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SantoTercoKids;
