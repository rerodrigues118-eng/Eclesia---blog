import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Volume2, Clock, Type, Bookmark, Share2, Sparkles, AlertCircle } from 'lucide-react';
import { READINGS_DATA } from '../data/eclesiaData';
import { supabase, isSupabaseConfigured } from '../lib/supabase/client';

export const LiturgiaView: React.FC = () => {
  const getTodayISO = () => new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(getTodayISO());
  const [fontSizeClass, setFontSizeClass] = useState<'text-base' | 'text-lg' | 'text-xl'>('text-lg');
  const [savedBookmark, setSavedBookmark] = useState(false);
  const [dbLiturgy, setDbLiturgy] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  // Busca do banco Supabase dinamicamente
  useEffect(() => {
    let isMounted = true;

    async function loadLiturgy() {
      if (!isSupabaseConfigured) return;
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('daily_liturgy')
          .select('*')
          .eq('date', selectedDate)
          .maybeSingle();

        if (!error && data && isMounted) {
          setDbLiturgy(data);
        } else if (isMounted) {
          setDbLiturgy(null);
        }
      } catch (err) {
        console.warn('[LiturgiaView] Erro ao buscar liturgia do dia:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadLiturgy();
    return () => { isMounted = false; };
  }, [selectedDate]);

  // Formatação de data em português
  const formatDisplayDate = (isoDate: string) => {
    try {
      const [year, month, day] = isoDate.split('-').map(Number);
      const d = new Date(year, month - 1, day);
      return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
    } catch {
      return isoDate;
    }
  };

  // Fallback padrão se ainda não cadastrado no banco para a data exata
  const fallbackReading = READINGS_DATA[selectedDate] || READINGS_DATA['2026-11-15'] || {
    date: formatDisplayDate(selectedDate),
    season: 'Tempo Comum',
    colorName: 'Verde',
    colorHex: '#1c5d3a',
    fullDateStr: `Liturgia Diária — ${formatDisplayDate(selectedDate)}`,
    firstReading: {
      title: 'Primeira Leitura (Ap 1, 1-4; 2, 1-5a)',
      reference: 'Apocalipse 1, 1-4; 2, 1-5a',
      rubric: 'Revelação de Jesus Cristo, que Deus lhe concedeu...',
      text: ['Revelação de Jesus Cristo, que Deus lhe concedeu para mostrar aos seus servos as coisas que devem acontecer muito em breve.'],
      response: '— Palavra do Senhor. / Graças a Deus.'
    },
    psalm: {
      reference: 'Salmo 1',
      antiphon: 'Ao vencedor darei de comer da árvore da vida.',
      stanzas: ['Feliz é todo aquele que não anda conforme os conselhos dos perversos,', 'Mas tem seu prazer na lei do Senhor e a medita dia e noite.']
    },
    gospel: {
      reference: 'Lucas 18, 35-43',
      dialogue: {
        lordBeWithYou: '— O Senhor esteja convosco.',
        andWithYourSpirit: '— Ele está no meio de nós.',
        gospelProclamation: '— Proclamação do Evangelho de Jesus Cristo segundo Lucas.',
        gloryToYou: '— Glória a vós, Senhor.'
      },
      text: ['Quando Jesus se aproximava de Jericó, um cego estava sentado à beira do caminho, pedindo esmolas.', 'Jesus perguntou-lhe: "O que queres que eu te faça?" Ele respondeu: "Senhor, que eu veja!" Jesus lhe disse: "Vê! A tua fé te salvou".'],
      acclamation: 'Aleluia, aleluia, aleluia.',
      praise: '— Palavra da Salvação. / Glória a vós, Senhor.'
    }
  };

  const currentReading = dbLiturgy ? {
    date: formatDisplayDate(dbLiturgy.date),
    season: dbLiturgy.liturgical_season || 'Tempo Comum',
    colorName: dbLiturgy.liturgical_color || 'Verde',
    colorHex: dbLiturgy.color_hex || '#1c5d3a',
    fullDateStr: dbLiturgy.full_date_str || `Liturgia Diária — ${formatDisplayDate(dbLiturgy.date)}`,
    firstReading: dbLiturgy.first_reading || fallbackReading.firstReading,
    psalm: dbLiturgy.psalm || fallbackReading.psalm,
    gospel: dbLiturgy.gospel || fallbackReading.gospel
  } : fallbackReading;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12 animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Sidebar Navigation */}
        <aside className="lg:col-span-4 bg-white p-6 rounded-2xl border border-[#d3c4af]/60 space-y-6 lg:sticky lg:top-24 shadow-xs">
          <div>
            <span className="font-sans text-xs font-bold text-[#785600] uppercase tracking-widest block mb-1">
              Calendário Litúrgico
            </span>
            <h2 className="font-display text-2xl font-bold text-[#1c1b1b]">Liturgia da Palavra</h2>
          </div>

          {/* Date Selector */}
          <div className="space-y-3">
            <label className="font-sans text-xs font-semibold text-[#817563] uppercase tracking-wider block">
              Selecione a Data
            </label>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setSelectedDate(getTodayISO())}
                className={`flex-1 py-2 px-3 rounded-xl font-sans text-xs font-bold transition-all text-center border cursor-pointer ${
                  selectedDate === getTodayISO()
                    ? 'bg-[#785600] text-white border-[#785600] shadow-xs'
                    : 'bg-[#fcf9f8] text-[#1c1b1b] border-[#d3c4af]/60 hover:border-[#785600]'
                }`}
              >
                Hoje
              </button>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="flex-1 py-1.5 px-3 rounded-xl font-sans text-xs font-bold border border-[#d3c4af]/60 bg-[#fcf9f8] text-[#1c1b1b] focus:border-[#785600] focus:outline-none"
              />
            </div>
          </div>

          {/* Liturgical Season Tag */}
          <div className="p-4 rounded-xl border border-[#d3c4af]/40 bg-[#fcf9f8] space-y-2">
            <div className="flex items-center gap-2">
              <span
                className="w-3.5 h-3.5 rounded-full inline-block shadow-xs"
                style={{ backgroundColor: currentReading.colorHex }}
              ></span>
              <span className="font-sans text-xs font-bold text-[#1c1b1b] uppercase tracking-widest">
                {currentReading.season}
              </span>
            </div>
            <p className="font-sans text-xs text-[#817563] font-medium">Cor Litúrgica: {currentReading.colorName}</p>
          </div>

          {/* Audio Reader Notice - Transparente e Sem Simulação */}
          <div className="p-4 bg-[#fbf8f5] border border-[#d3c4af]/70 rounded-2xl space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-sans text-xs font-bold uppercase tracking-wider text-[#785600] flex items-center gap-1.5">
                <Volume2 className="w-4 h-4 text-[#785600]" /> Áudio Litúrgico
              </span>
              <span className="bg-amber-100 text-amber-800 text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border border-amber-300">
                Em Produção
              </span>
            </div>
            <p className="font-sans text-xs text-[#4f4535] leading-relaxed">
              A gravação em voz humana das leituras com fundo de canto gregoriano está sendo preparada pela nossa equipe e estará disponível em breve.
            </p>
          </div>

          {/* Typography Controls */}
          <div className="flex justify-between items-center pt-2 border-t border-[#d3c4af]/40">
            <span className="font-sans text-xs font-semibold text-[#817563]">Tamanho do Texto:</span>
            <div className="flex gap-1">
              <button
                onClick={() => setFontSizeClass('text-base')}
                className={`w-8 h-8 flex items-center justify-center rounded-lg font-sans text-xs font-bold cursor-pointer transition-colors ${
                  fontSizeClass === 'text-base' ? 'bg-[#785600] text-white' : 'bg-[#f0eded] text-[#1c1b1b] hover:bg-[#e4deda]'
                }`}
              >
                A-
              </button>
              <button
                onClick={() => setFontSizeClass('text-lg')}
                className={`w-8 h-8 flex items-center justify-center rounded-lg font-sans text-xs font-bold cursor-pointer transition-colors ${
                  fontSizeClass === 'text-lg' ? 'bg-[#785600] text-white' : 'bg-[#f0eded] text-[#1c1b1b] hover:bg-[#e4deda]'
                }`}
              >
                A
              </button>
              <button
                onClick={() => setFontSizeClass('text-xl')}
                className={`w-8 h-8 flex items-center justify-center rounded-lg font-sans text-xs font-bold cursor-pointer transition-colors ${
                  fontSizeClass === 'text-xl' ? 'bg-[#785600] text-white' : 'bg-[#f0eded] text-[#1c1b1b] hover:bg-[#e4deda]'
                }`}
              >
                A+
              </button>
            </div>
          </div>
        </aside>

        {/* Main Liturgical Text Column */}
        <main className="lg:col-span-8 bg-white p-6 md:p-12 rounded-3xl border border-[#d3c4af]/60 space-y-12 shadow-xs">
          {/* Header Badge */}
          <header className="border-b border-[#d3c4af]/50 pb-6 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <span
                className="px-3.5 py-1 text-white font-sans text-xs font-bold uppercase tracking-widest rounded-full shadow-xs"
                style={{ backgroundColor: currentReading.colorHex }}
              >
                {currentReading.date} • {currentReading.colorName}
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
                    navigator.clipboard.writeText(window.location.href);
                    alert('Link da liturgia copiado com sucesso!');
                  }}
                  className="p-2 rounded-xl border border-[#d3c4af] text-[#817563] hover:text-[#1c1b1b] transition-colors cursor-pointer"
                  title="Compartilhar"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-[#1c1b1b]">
              Liturgia Diária
            </h1>
            <p className="font-sans text-sm md:text-base text-[#785600] font-semibold">
              {currentReading.fullDateStr}
            </p>
          </header>

          {/* Primeira Leitura */}
          <section className="space-y-4">
            <div className="flex justify-between items-baseline border-b border-[#d3c4af]/30 pb-2">
              <h2 className="font-display text-2xl font-bold text-[#1c1b1b]">
                {currentReading.firstReading.title}
              </h2>
              <span className="font-sans text-xs font-bold text-[#785600] uppercase tracking-widest">
                {currentReading.firstReading.reference}
              </span>
            </div>

            {currentReading.firstReading.rubric && (
              <p className="font-sans text-sm italic text-[#817563]">
                {currentReading.firstReading.rubric}
              </p>
            )}

            <div className={`font-sans text-[#1c1b1b] leading-relaxed space-y-4 ${fontSizeClass}`}>
              {Array.isArray(currentReading.firstReading.text) ? (
                currentReading.firstReading.text.map((p: string, idx: number) => (
                  <p key={idx} className={idx === 0 ? 'drop-cap' : ''}>
                    {p}
                  </p>
                ))
              ) : (
                <p className="drop-cap">{currentReading.firstReading.text}</p>
              )}
            </div>

            {currentReading.firstReading.response && (
              <p className="font-sans text-sm font-semibold text-[#785600] pt-2 border-t border-[#d3c4af]/30">
                {currentReading.firstReading.response}
              </p>
            )}
          </section>

          {/* Salmo Responsorial */}
          <section className="space-y-4 bg-[#fcf9f8] p-6 rounded-2xl border border-[#d3c4af]/50">
            <div className="flex justify-between items-baseline border-b border-[#d3c4af]/30 pb-2">
              <h2 className="font-display text-2xl font-bold text-[#1c1b1b]">Salmo Responsorial</h2>
              <span className="font-sans text-xs font-bold text-[#785600] uppercase tracking-widest">
                {currentReading.psalm.reference}
              </span>
            </div>

            <div className="p-4 bg-[#ffdea6]/30 border-l-4 border-[#785600] text-[#785600] font-sans font-bold text-base rounded-r-xl">
              <span className="text-xs uppercase tracking-widest block font-sans text-[#817563] mb-1">
                R. Refrão:
              </span>
              — {currentReading.psalm.antiphon}
            </div>

            <div className={`font-sans text-[#1c1b1b] space-y-4 whitespace-pre-line leading-relaxed ${fontSizeClass}`}>
              {Array.isArray(currentReading.psalm.stanzas) ? (
                currentReading.psalm.stanzas.map((stanza: string, idx: number) => (
                  <div key={idx} className="pl-4 border-l border-[#d3c4af]/40 italic">
                    {stanza}
                  </div>
                ))
              ) : (
                <div className="pl-4 border-l border-[#d3c4af]/40 italic">
                  {currentReading.psalm.stanzas}
                </div>
              )}
            </div>
          </section>

          {/* Evangelho */}
          <section className="space-y-4">
            <div className="flex justify-between items-baseline border-b border-[#d3c4af]/30 pb-2">
              <h2 className="font-display text-2xl font-bold text-[#1c1b1b]">Evangelho</h2>
              <span className="font-sans text-xs font-bold text-[#785600] uppercase tracking-widest">
                {currentReading.gospel.reference}
              </span>
            </div>

            {/* Liturgical Dialogue */}
            {currentReading.gospel.dialogue && (
              <div className="space-y-1 font-sans text-sm font-semibold text-[#785600] bg-[#fcf9f8] p-4 rounded-xl border border-[#d3c4af]/30">
                <p>{currentReading.gospel.dialogue.lordBeWithYou}</p>
                <p className="pl-4 text-[#1c1b1b]">{currentReading.gospel.dialogue.andWithYourSpirit}</p>
                <p className="pt-2">{currentReading.gospel.dialogue.gospelProclamation}</p>
                <p className="pl-4 text-[#1c1b1b]">{currentReading.gospel.dialogue.gloryToYou}</p>
              </div>
            )}

            {/* Gospel Content */}
            <div className={`font-sans text-[#1c1b1b] leading-relaxed space-y-4 ${fontSizeClass}`}>
              {Array.isArray(currentReading.gospel.text) ? (
                currentReading.gospel.text.map((p: string, idx: number) => (
                  <p key={idx} className={idx === 0 ? 'drop-cap' : ''}>
                    {p}
                  </p>
                ))
              ) : (
                <p className="drop-cap">{currentReading.gospel.text}</p>
              )}
            </div>

            {/* Gospel Acclamation */}
            <div className="pt-4 border-t border-[#d3c4af]/40 font-sans text-sm font-bold text-[#785600] space-y-1">
              <p>{currentReading.gospel.acclamation}</p>
              <p className="text-[#1c1b1b]">{currentReading.gospel.praise}</p>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};
