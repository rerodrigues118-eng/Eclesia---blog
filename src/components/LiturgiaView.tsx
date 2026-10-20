import React, { useState, useEffect, useCallback } from 'react';
import { Volume2, Bookmark, Share2, Loader2, CalendarDays, Sparkles, AlertCircle } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase/client';

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Retorna a data de hoje no formato YYYY-MM-DD no fuso de Brasília */
function getTodayISO(): string {
  try {
    const brStr = new Date().toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' });
    const [d, m, y] = brStr.split('/');
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  } catch {
    return new Date().toISOString().split('T')[0];
  }
}

/** Formata YYYY-MM-DD → "20 de outubro de 2026" */
function formatDisplayDate(isoDate: string): string {
  try {
    const [year, month, day] = isoDate.split('-').map(Number);
    const d = new Date(year, month - 1, day);
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
  } catch {
    return isoDate;
  }
}

/** Cores por tempo litúrgico */
const LITURGICAL_COLORS: Record<string, string> = {
  verde: '#1c5d3a',
  roxo: '#6d28d9',
  branco: '#c7a84a',
  vermelho: '#b91c1c',
  rosa: '#db2777',
  dourado: '#c7a84a',
};

function getColorHex(colorName: string, fallback: string): string {
  const key = colorName?.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  return LITURGICAL_COLORS[key] || fallback || '#1c5d3a';
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface ReadingBlock {
  title?: string;
  reference?: string;
  rubric?: string;
  text?: string | string[];
  response?: string;
}

interface PsalmBlock {
  reference?: string;
  antiphon?: string;
  stanzas?: string | string[];
}

interface GospelBlock {
  reference?: string;
  dialogue?: {
    lordBeWithYou?: string;
    andWithYourSpirit?: string;
    gospelProclamation?: string;
    gloryToYou?: string;
  };
  text?: string | string[];
  acclamation?: string;
  praise?: string;
}

interface LiturgyData {
  date: string;
  displayDate: string;
  season: string;
  colorName: string;
  colorHex: string;
  fullDateStr: string;
  firstReading: ReadingBlock;
  psalm: PsalmBlock;
  gospel: GospelBlock;
  secondReading?: ReadingBlock | null;
}

// ─── Status States ────────────────────────────────────────────────────────────

type FetchStatus = 'idle' | 'loading' | 'found' | 'not_found' | 'error';

// ─── Component ────────────────────────────────────────────────────────────────

export const LiturgiaView: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<string>(getTodayISO());
  const [fontSizeClass, setFontSizeClass] = useState<'text-base' | 'text-lg' | 'text-xl'>('text-lg');
  const [savedBookmark, setSavedBookmark] = useState(false);
  const [liturgy, setLiturgy] = useState<LiturgyData | null>(null);
  const [status, setStatus] = useState<FetchStatus>('idle');

  // ── Busca dinâmica no Supabase pelo dia exato ──────────────────────────────
  const loadLiturgy = useCallback(async (dateISO: string) => {
    setStatus('loading');
    setLiturgy(null);

    if (!isSupabaseConfigured) {
      setStatus('not_found');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('daily_liturgy')
        .select('*')
        .eq('date', dateISO) // filtro exato por YYYY-MM-DD
        .maybeSingle();

      if (error) {
        console.error('[LiturgiaView] Erro Supabase:', error.message);
        setStatus('error');
        return;
      }

      if (!data) {
        // Data não cadastrada no banco — exibe estado amigável
        setStatus('not_found');
        return;
      }

      // Mapeia o registro do banco para o formato do componente
      const colorName: string = data.liturgical_color || 'Verde';
      const colorHex: string = getColorHex(colorName, data.color_hex || '#1c5d3a');

      const mapped: LiturgyData = {
        date: data.date,
        displayDate: formatDisplayDate(data.date),
        season: data.liturgical_season || 'Tempo Comum',
        colorName,
        colorHex,
        fullDateStr: data.full_date_str || `Liturgia de ${formatDisplayDate(data.date)}`,
        firstReading: data.first_reading || {},
        psalm: data.psalm || {},
        gospel: data.gospel || {},
        secondReading: data.second_reading || null,
      };

      setLiturgy(mapped);
      setStatus('found');
    } catch (err) {
      console.error('[LiturgiaView] Exceção ao buscar liturgia:', err);
      setStatus('error');
    }
  }, []);

  // Recarrega sempre que a data muda
  useEffect(() => {
    loadLiturgy(selectedDate);
  }, [selectedDate, loadLiturgy]);

  const isToday = selectedDate === getTodayISO();

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12 animate-fade-in overflow-x-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start w-full">

        {/* ── Sidebar ──────────────────────────────────────────────────── */}
        <aside className="lg:col-span-4 bg-white dark:bg-zinc-900/90 p-6 rounded-2xl border border-[#d3c4af]/60 dark:border-zinc-800 space-y-6 lg:sticky lg:top-24 shadow-xs w-full">
          <div>
            <span className="font-sans text-xs font-bold text-[#785600] dark:text-amber-400 uppercase tracking-widest block mb-1">
              Calendário Litúrgico
            </span>
            <h2 className="font-display text-2xl font-bold text-[#1c1b1b] dark:text-[#F9FAFB]">Liturgia da Palavra</h2>
          </div>

          {/* Seletor de Data */}
          <div className="space-y-3">
            <label className="font-sans text-xs font-semibold text-[#817563] dark:text-zinc-400 uppercase tracking-wider block">
              Selecione a Data
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setSelectedDate(getTodayISO())}
                className={`flex-1 py-2 px-3 rounded-xl font-sans text-xs font-bold transition-all text-center border cursor-pointer ${
                  isToday
                    ? 'bg-[#785600] dark:bg-amber-600 text-white border-[#785600] dark:border-amber-600 shadow-xs'
                    : 'bg-[#fcf9f8] dark:bg-zinc-800 text-[#1c1b1b] dark:text-zinc-200 border-[#d3c4af]/60 dark:border-zinc-700 hover:border-[#785600]'
                }`}
              >
                Hoje
              </button>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => {
                  if (e.target.value) setSelectedDate(e.target.value);
                }}
                className="flex-1 py-1.5 px-3 rounded-xl font-sans text-xs font-bold border border-[#d3c4af]/60 dark:border-zinc-700 bg-[#fcf9f8] dark:bg-zinc-800 text-[#1c1b1b] dark:text-zinc-100 focus:border-[#785600] focus:outline-none"
              />
            </div>
          </div>

          {/* Tempo Litúrgico — só mostra se encontrou dados */}
          <div className="p-4 rounded-xl border border-[#d3c4af]/40 dark:border-zinc-750 bg-[#fcf9f8] dark:bg-zinc-800/80 space-y-2">
            <div className="flex items-center gap-2">
              <span
                className="w-3.5 h-3.5 rounded-full inline-block shadow-xs transition-colors"
                style={{ backgroundColor: liturgy?.colorHex ?? '#1c5d3a' }}
              />
              <span className="font-sans text-xs font-bold text-[#1c1b1b] dark:text-zinc-100 uppercase tracking-widest">
                {liturgy?.season ?? (status === 'loading' ? '...' : 'Tempo Comum')}
              </span>
            </div>
            <p className="font-sans text-xs text-[#817563] dark:text-zinc-400 font-medium">
              Cor Litúrgica: {liturgy?.colorName ?? (status === 'loading' ? '...' : '—')}
            </p>
          </div>

          {/* Áudio Litúrgico */}
          <div className="p-4 bg-[#fbf8f5] dark:bg-zinc-800/60 border border-[#d3c4af]/70 dark:border-zinc-700 rounded-2xl space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-sans text-xs font-bold uppercase tracking-wider text-[#785600] dark:text-amber-400 flex items-center gap-1.5">
                <Volume2 className="w-4 h-4 text-[#785600] dark:text-amber-400" /> Áudio Litúrgico
              </span>
              <span className="bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border border-amber-300 dark:border-amber-800">
                Em Produção
              </span>
            </div>
            <p className="font-sans text-xs text-[#4f4535] dark:text-zinc-300 leading-relaxed">
              A gravação em voz humana das leituras com fundo de canto gregoriano está sendo preparada pela nossa equipe.
            </p>
          </div>

          {/* Controles de Tipografia */}
          <div className="flex justify-between items-center pt-2 border-t border-[#d3c4af]/40 dark:border-zinc-800">
            <span className="font-sans text-xs font-semibold text-[#817563] dark:text-zinc-400">Tamanho do Texto:</span>
            <div className="flex gap-1">
              {(['text-base', 'text-lg', 'text-xl'] as const).map((size, i) => (
                <button
                  key={size}
                  onClick={() => setFontSizeClass(size)}
                  className={`w-8 h-8 flex items-center justify-center rounded-lg font-sans font-bold cursor-pointer transition-colors ${
                    fontSizeClass === size
                      ? 'bg-[#785600] dark:bg-amber-600 text-white'
                      : 'bg-[#f0eded] dark:bg-zinc-800 text-[#1c1b1b] dark:text-zinc-200 hover:bg-[#e4deda] dark:hover:bg-zinc-700'
                  }`}
                  style={{ fontSize: ['11px', '13px', '15px'][i] }}
                >
                  {['A-', 'A', 'A+'][i]}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* ── Coluna Principal ──────────────────────────────────────────── */}
        <main className="lg:col-span-8 bg-white dark:bg-zinc-900/90 rounded-3xl border border-[#d3c4af]/60 dark:border-zinc-800 shadow-xs overflow-hidden w-full overflow-x-hidden">

          {/* ── Estado: Carregando ───────────────────────────────────── */}
          {status === 'loading' && (
            <div className="flex flex-col items-center justify-center py-32 px-8 space-y-4 text-[#817563]">
              <Loader2 className="w-10 h-10 animate-spin text-[#785600]" />
              <p className="font-sans text-sm font-medium">
                Buscando liturgia para {formatDisplayDate(selectedDate)}…
              </p>
            </div>
          )}

          {/* ── Estado: Não Encontrado ───────────────────────────────── */}
          {status === 'not_found' && (
            <div className="flex flex-col items-center justify-center py-32 px-8 space-y-6 text-center">
              <div className="w-16 h-16 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center">
                <CalendarDays className="w-8 h-8 text-amber-600" />
              </div>
              <div className="space-y-2 max-w-sm">
                <h3 className="font-display text-xl font-bold text-[#1c1b1b]">
                  Liturgia em Preparação
                </h3>
                <p className="font-sans text-sm text-[#817563] leading-relaxed">
                  A liturgia para <strong className="text-[#1c1b1b]">{formatDisplayDate(selectedDate)}</strong> ainda
                  não foi gerada pela nossa automação ou está sendo preparada.
                </p>
                <p className="font-sans text-xs text-[#a89b85] mt-2">
                  Nossa automação diária gera as leituras toda manhã. Tente novamente mais tarde ou selecione outra data.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedDate(getTodayISO())}
                  className="px-5 py-2.5 bg-[#785600] text-white rounded-xl font-sans text-sm font-bold hover:bg-[#5c4100] transition-colors cursor-pointer"
                >
                  Ver Liturgia de Hoje
                </button>
                <button
                  onClick={() => loadLiturgy(selectedDate)}
                  className="px-5 py-2.5 bg-[#fcf9f8] text-[#785600] border border-[#d3c4af] rounded-xl font-sans text-sm font-bold hover:bg-[#f0eded] transition-colors cursor-pointer"
                >
                  Tentar Novamente
                </button>
              </div>
            </div>
          )}

          {/* ── Estado: Erro de Conexão ──────────────────────────────── */}
          {status === 'error' && (
            <div className="flex flex-col items-center justify-center py-32 px-8 space-y-4 text-center">
              <div className="w-16 h-16 rounded-full bg-red-50 border border-red-200 flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
              <div className="space-y-1">
                <h3 className="font-display text-xl font-bold text-[#1c1b1b]">Erro ao Carregar</h3>
                <p className="font-sans text-sm text-[#817563]">
                  Ocorreu um problema ao buscar a liturgia. Verifique sua conexão.
                </p>
              </div>
              <button
                onClick={() => loadLiturgy(selectedDate)}
                className="px-5 py-2.5 bg-[#785600] text-white rounded-xl font-sans text-sm font-bold hover:bg-[#5c4100] transition-colors cursor-pointer"
              >
                Tentar Novamente
              </button>
            </div>
          )}

          {/* ── Estado: Liturgia Encontrada ──────────────────────────── */}
          {status === 'found' && liturgy && (
            <div className="p-6 md:p-12 space-y-12">

              {/* Cabeçalho */}
              <header className="border-b border-[#d3c4af]/50 pb-6 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <span
                    className="px-3.5 py-1 text-white font-sans text-xs font-bold uppercase tracking-widest rounded-full shadow-xs"
                    style={{ backgroundColor: liturgy.colorHex }}
                  >
                    {liturgy.displayDate.toUpperCase()} • COR {liturgy.colorName.toUpperCase()}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSavedBookmark(!savedBookmark)}
                      className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                        savedBookmark
                          ? 'bg-[#785600] text-white border-[#785600]'
                          : 'border-[#d3c4af] text-[#817563] hover:text-[#1c1b1b]'
                      }`}
                      title="Salvar leitura"
                    >
                      <Bookmark className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        const url = `${window.location.origin}/liturgia?data=${selectedDate}`;
                        navigator.clipboard.writeText(url);
                        alert('Link da liturgia copiado!');
                      }}
                      className="p-2 rounded-xl border border-[#d3c4af] dark:border-zinc-700 text-[#817563] dark:text-zinc-400 hover:text-[#1c1b1b] dark:hover:text-zinc-100 transition-colors cursor-pointer"
                      title="Compartilhar"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <h1 className="font-display text-3xl md:text-4xl font-bold text-[#1c1b1b] dark:text-[#F9FAFB]">
                  Liturgia Diária
                </h1>
                <p className="font-sans text-sm md:text-base text-[#785600] dark:text-amber-400 font-semibold">
                  {liturgy.fullDateStr}
                </p>
              </header>

              {/* Primeira Leitura */}
              {liturgy.firstReading?.reference && (
                <ReadingSection
                  title={liturgy.firstReading.title || 'Primeira Leitura'}
                  reference={liturgy.firstReading.reference}
                  rubric={liturgy.firstReading.rubric}
                  text={liturgy.firstReading.text}
                  response={liturgy.firstReading.response}
                  fontSizeClass={fontSizeClass}
                />
              )}

              {/* Segunda Leitura (domingos / solenidades) */}
              {liturgy.secondReading?.reference && (
                <ReadingSection
                  title={liturgy.secondReading.title || 'Segunda Leitura'}
                  reference={liturgy.secondReading.reference}
                  rubric={liturgy.secondReading.rubric}
                  text={liturgy.secondReading.text}
                  response={liturgy.secondReading.response}
                  fontSizeClass={fontSizeClass}
                />
              )}

              {/* Salmo Responsorial */}
              {liturgy.psalm?.reference && (
                <section className="space-y-4 bg-[#fcf9f8] dark:bg-zinc-800/80 p-6 rounded-2xl border border-[#d3c4af]/50 dark:border-zinc-700">
                  <div className="flex justify-between items-baseline border-b border-[#d3c4af]/30 dark:border-zinc-700 pb-2">
                    <h2 className="font-display text-2xl font-bold text-[#1c1b1b] dark:text-[#F9FAFB]">Salmo Responsorial</h2>
                    <span className="font-sans text-xs font-bold text-[#785600] dark:text-amber-400 uppercase tracking-widest">
                      {liturgy.psalm.reference}
                    </span>
                  </div>
                  {liturgy.psalm.antiphon && (
                    <div className="p-4 bg-[#ffdea6]/30 dark:bg-amber-950/40 border-l-4 border-[#785600] dark:border-amber-500 text-[#785600] dark:text-amber-300 font-sans font-bold text-base rounded-r-xl">
                      <span className="text-xs uppercase tracking-widest block font-sans text-[#817563] dark:text-zinc-400 mb-1">R. Refrão:</span>
                      — {liturgy.psalm.antiphon}
                    </div>
                  )}
                  <div className={`font-sans text-[#1c1b1b] dark:text-zinc-200 space-y-4 leading-relaxed ${fontSizeClass}`}>
                    {Array.isArray(liturgy.psalm.stanzas)
                      ? liturgy.psalm.stanzas.map((stanza, idx) => (
                          <div key={idx} className="pl-4 border-l border-[#d3c4af]/40 dark:border-zinc-700 italic">{stanza}</div>
                        ))
                      : <div className="pl-4 border-l border-[#d3c4af]/40 dark:border-zinc-700 italic">{liturgy.psalm.stanzas}</div>
                    }
                  </div>
                </section>
              )}

              {/* Evangelho */}
              {liturgy.gospel?.reference && (
                <section className="space-y-4">
                  <div className="flex justify-between items-baseline border-b border-[#d3c4af]/30 dark:border-zinc-800 pb-2">
                    <h2 className="font-display text-2xl font-bold text-[#1c1b1b] dark:text-[#F9FAFB]">Evangelho</h2>
                    <span className="font-sans text-xs font-bold text-[#785600] dark:text-amber-400 uppercase tracking-widest">
                      {liturgy.gospel.reference}
                    </span>
                  </div>
                  {liturgy.gospel.dialogue && (
                    <div className="space-y-1 font-sans text-sm font-semibold text-[#785600] dark:text-amber-300 bg-[#fcf9f8] dark:bg-zinc-800/80 p-4 rounded-xl border border-[#d3c4af]/30 dark:border-zinc-700">
                      <p>{liturgy.gospel.dialogue.lordBeWithYou || '— O Senhor esteja convosco.'}</p>
                      <p className="pl-4 text-[#1c1b1b] dark:text-zinc-200">{liturgy.gospel.dialogue.andWithYourSpirit || '— Ele está no meio de nós.'}</p>
                      <p className="pt-2">{liturgy.gospel.dialogue.gospelProclamation}</p>
                      <p className="pl-4 text-[#1c1b1b] dark:text-zinc-200">{liturgy.gospel.dialogue.gloryToYou || '— Glória a vós, Senhor.'}</p>
                    </div>
                  )}
                  <div className={`font-sans text-[#1c1b1b] dark:text-zinc-200 leading-relaxed space-y-4 ${fontSizeClass}`}>
                    {Array.isArray(liturgy.gospel.text)
                      ? liturgy.gospel.text.map((p, idx) => (
                          <p key={idx} className={idx === 0 ? 'drop-cap' : ''}>{p}</p>
                        ))
                      : <p className="drop-cap">{liturgy.gospel.text}</p>
                    }
                  </div>
                  <div className="pt-4 border-t border-[#d3c4af]/40 dark:border-zinc-800 font-sans text-sm font-bold text-[#785600] dark:text-amber-400 space-y-1">
                    <p>{liturgy.gospel.acclamation || 'Aleluia, aleluia, aleluia.'}</p>
                    <p className="text-[#1c1b1b] dark:text-zinc-200">{liturgy.gospel.praise || '— Palavra da Salvação. / Glória a vós, Senhor.'}</p>
                  </div>
                </section>
              )}

            </div>
          )}
        </main>
      </div>
    </div>
  );
};

// ─── Sub-componente: Bloco de Leitura ─────────────────────────────────────────

interface ReadingSectionProps {
  title: string;
  reference: string;
  rubric?: string;
  text?: string | string[];
  response?: string;
  fontSizeClass: string;
}

const ReadingSection: React.FC<ReadingSectionProps> = ({
  title, reference, rubric, text, response, fontSizeClass
}) => (
  <section className="space-y-4">
    <div className="flex justify-between items-baseline border-b border-[#d3c4af]/30 dark:border-zinc-800 pb-2">
      <h2 className="font-display text-2xl font-bold text-[#1c1b1b] dark:text-[#F9FAFB]">{title}</h2>
      <span className="font-sans text-xs font-bold text-[#785600] dark:text-amber-400 uppercase tracking-widest">{reference}</span>
    </div>
    {rubric && <p className="font-sans text-sm italic text-[#817563] dark:text-zinc-400">{rubric}</p>}
    <div className={`font-sans text-[#1c1b1b] dark:text-zinc-200 leading-relaxed space-y-4 ${fontSizeClass}`}>
      {Array.isArray(text)
        ? text.map((p, idx) => <p key={idx} className={idx === 0 ? 'drop-cap' : ''}>{p}</p>)
        : <p className="drop-cap">{text}</p>
      }
    </div>
    {response && (
      <p className="font-sans text-sm font-semibold text-[#785600] dark:text-amber-300 pt-2 border-t border-[#d3c4af]/30 dark:border-zinc-800">
        {response}
      </p>
    )}
  </section>
);
