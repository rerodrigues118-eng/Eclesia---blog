import React, { useState, useMemo, useEffect } from 'react';
import { Search, ArrowRight, ChevronLeft, ChevronRight, X, Sparkles, Calendar, BookOpen } from 'lucide-react';
import { Saint } from '../types';
import { fetchSaintOfToday } from '../services/dbService';
import { obterSantoDoCalendario, MONTH_NAMES } from '../data/romanMartyrology';
import { BANCO_SACRO_FALLBACK } from '../services/imageService';

interface SantoralViewProps {
  onSelectSaint: (saint: Saint) => void;
  saints?: Saint[];
}

export const SantoralView: React.FC<SantoralViewProps> = ({ onSelectSaint, saints = [] }) => {
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [selectedDay, setSelectedDay] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [todaySaintDynamic, setTodaySaintDynamic] = useState<Saint | null>(null);
  const [isLoadingToday, setIsLoadingToday] = useState<boolean>(true);

  // Calcula a data atual com base no fuso horário do Brasil (America/Sao_Paulo)
  const { currentDay, currentMonth } = useMemo(() => {
    const now = new Date();
    try {
      const brStr = now.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' });
      const [dia, mes] = brStr.split('/');
      return {
        currentDay: parseInt(dia, 10) || now.getDate(),
        currentMonth: parseInt(mes, 10) || (now.getMonth() + 1)
      };
    } catch {
      return {
        currentDay: now.getDate(),
        currentMonth: now.getMonth() + 1
      };
    }
  }, []);

  const months = [
    { value: '1', label: 'Janeiro' },
    { value: '2', label: 'Fevereiro' },
    { value: '3', label: 'Março' },
    { value: '4', label: 'Abril' },
    { value: '5', label: 'Maio' },
    { value: '6', label: 'Junho' },
    { value: '7', label: 'Julho' },
    { value: '8', label: 'Agosto' },
    { value: '9', label: 'Setembro' },
    { value: '10', label: 'Outubro' },
    { value: '11', label: 'Novembro' },
    { value: '12', label: 'Dezembro' }
  ];

  // Busca o Santo de HOJE no banco ou no Martirológio ao montar o componente
  useEffect(() => {
    let isMounted = true;
    async function loadTodaySaint() {
      setIsLoadingToday(true);
      try {
        // 1. Procura primeiro no array saints recebido via prop
        const foundInProps = saints.find(
          (s) => s.month === currentMonth && s.day === currentDay
        );
        if (foundInProps) {
          if (isMounted) {
            setTodaySaintDynamic(foundInProps);
            setIsLoadingToday(false);
          }
          return;
        }

        // 2. Consulta de alta precisão no Supabase / Fallback Canônico
        const saint = await fetchSaintOfToday();
        if (isMounted) {
          setTodaySaintDynamic(saint);
          setIsLoadingToday(false);
        }
      } catch (err) {
        console.warn('[SantoralView] Erro ao carregar Santo de Hoje:', err);
        if (isMounted) {
          setTodaySaintDynamic(obterSantoDoCalendario(currentMonth, currentDay));
          setIsLoadingToday(false);
        }
      }
    }

    loadTodaySaint();
    return () => {
      isMounted = false;
    };
  }, [saints, currentMonth, currentDay]);

  // Reseta página da grade quando os filtros mudam
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedMonth, selectedDay, searchQuery]);

  // Lista de santos mesclada: banco de dados + santos essenciais do calendário
  const allAvailableSaints = useMemo(() => {
    const map = new Map<string, Saint>();

    // Insere primeiro os santos do prop (do Supabase)
    saints.forEach((s) => {
      const key = `${s.month}-${s.day}`;
      map.set(key, s);
    });

    // Garante que o Santo de Hoje esteja no mapa
    if (todaySaintDynamic) {
      const key = `${todaySaintDynamic.month}-${todaySaintDynamic.day}`;
      map.set(key, todaySaintDynamic);
    }

    return Array.from(map.values());
  }, [saints, todaySaintDynamic]);

  // Filtro de busca e mês/dia
  const filteredSaints = useMemo(() => {
    return allAvailableSaints.filter((saint) => {
      if (selectedMonth && saint.month !== parseInt(selectedMonth, 10)) {
        return false;
      }
      if (selectedDay && saint.day !== parseInt(selectedDay, 10)) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = saint.name.toLowerCase().includes(q);
        const matchTitle = saint.title?.toLowerCase().includes(q);
        const matchBio = saint.fullBio?.toLowerCase().includes(q);
        const matchSummary = saint.summary?.toLowerCase().includes(q);
        const matchPatronage = saint.patronage?.toLowerCase().includes(q);
        if (!matchName && !matchTitle && !matchBio && !matchSummary && !matchPatronage) {
          return false;
        }
      }
      return true;
    });
  }, [allAvailableSaints, selectedMonth, selectedDay, searchQuery]);

  // Card de Destaque Principal:
  // - Se o usuário selecionou um dia/mês específico: exibe o santo daquela data.
  // - Se nenhum filtro de data estiver ativo: exibe SEMPRE o Santo de HOJE.
  const featuredSaint = useMemo(() => {
    // Caso 1: Filtro ativo por mês e dia
    if (selectedMonth && selectedDay) {
      const m = parseInt(selectedMonth, 10);
      const d = parseInt(selectedDay, 10);
      const match = filteredSaints.find((s) => s.month === m && s.day === d);
      if (match) return match;
      return obterSantoDoCalendario(m, d);
    }

    // Caso 2: Filtro ativo apenas por mês
    if (selectedMonth && !selectedDay) {
      const m = parseInt(selectedMonth, 10);
      const matchMonthToday = filteredSaints.find((s) => s.month === m && s.day === currentDay);
      if (matchMonthToday) return matchMonthToday;
      return filteredSaints[0] || obterSantoDoCalendario(m, 1);
    }

    // Caso 3: Busca textual ativa
    if (searchQuery.trim() && filteredSaints.length > 0) {
      return filteredSaints[0];
    }

    // Caso 4 (PADRÃO DA PÁGINA): Santo de HOJE
    return todaySaintDynamic || obterSantoDoCalendario(currentMonth, currentDay);
  }, [filteredSaints, selectedMonth, selectedDay, searchQuery, todaySaintDynamic, currentMonth, currentDay]);

  // Grade de outros santos (exclui o que está no card de destaque)
  const gridSaints = useMemo(() => {
    return filteredSaints.filter((s) => s.id !== featuredSaint?.id && s.name !== featuredSaint?.name);
  }, [filteredSaints, featuredSaint]);

  // Paginação dinâmica da grade (6 itens por página)
  const itemsPerPage = 6;
  const totalPages = Math.max(1, Math.ceil(gridSaints.length / itemsPerPage));
  const paginatedGridSaints = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return gridSaints.slice(start, start + itemsPerPage);
  }, [gridSaints, currentPage]);

  // Sanitizador de imagens com suporte a Supabase Storage, cache-busting e fallback visual sagrado
  const getSanitizedImageUrl = (url?: string, saintId?: string): string => {
    if (!url) return BANCO_SACRO_FALLBACK[0].url;

    // Se for data URL de imagem importada localmente, aceita diretamente
    if (url.startsWith('data:image/')) {
      return url;
    }

    if (
      url.startsWith('http') &&
      !url.includes('temple-bali') &&
      !url.includes('vr-headset')
    ) {
      // Adiciona query param de cache-busting para forçar navegador e CDN a baixar a foto recém-editada
      const sep = url.includes('?') ? '&' : '?';
      return `${url}${sep}v=${encodeURIComponent(saintId || 'eclesia')}`;
    }

    // Fallback sagrado
    return BANCO_SACRO_FALLBACK[0].url;
  };

  const isTodayActive =
    featuredSaint &&
    featuredSaint.month === currentMonth &&
    featuredSaint.day === currentDay;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12 overflow-x-hidden">
      {/* Header Section */}
      <section className="flex flex-col items-center text-center max-w-2xl mx-auto gap-4">
        <span className="bg-[#6E1E1E] text-white font-sans text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest shadow-xs">
          Santoral Católico
        </span>
        <h1 className="font-display text-4xl md:text-5xl font-bold text-[#785600] dark:text-amber-400">
          Os Santos da Igreja
        </h1>
        <p className="font-sans text-base text-[#4f4535] dark:text-zinc-300 leading-relaxed">
          Conheça a vida, os ensinamentos e a intercessão daqueles que nos precederam na glória celeste. Um guia litúrgico vivo para a sua devoção diária.
        </p>
      </section>

      {/* Filters & Search Bar */}
      <section className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white dark:bg-zinc-900/90 p-6 rounded-2xl border border-[#d3c4af]/70 dark:border-zinc-800 shadow-xs">
        <div className="flex gap-4 w-full md:w-auto">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="border-b-2 border-[#d3c4af] dark:border-zinc-700 border-0 focus:ring-0 focus:border-[#785600] bg-transparent text-[#4f4535] dark:text-zinc-200 font-sans text-sm w-full md:w-48 py-2 cursor-pointer font-medium"
          >
            <option value="" className="dark:bg-zinc-900">Todos os Meses</option>
            {months.map((m) => (
              <option key={m.value} value={m.value} className="dark:bg-zinc-900">
                {m.label}
              </option>
            ))}
          </select>

          <select
            value={selectedDay}
            onChange={(e) => setSelectedDay(e.target.value)}
            className="border-b-2 border-[#d3c4af] dark:border-zinc-700 border-0 focus:ring-0 focus:border-[#785600] bg-transparent text-[#4f4535] dark:text-zinc-200 font-sans text-sm w-full md:w-32 py-2 cursor-pointer font-medium"
          >
            <option value="" className="dark:bg-zinc-900">Dia</option>
            {Array.from({ length: 31 }, (_, i) => (
              <option key={i + 1} value={i + 1} className="dark:bg-zinc-900">
                {i + 1}
              </option>
            ))}
          </select>

          {(selectedMonth || selectedDay) && (
            <button
              onClick={() => {
                setSelectedMonth('');
                setSelectedDay('');
              }}
              className="text-xs text-[#785600] dark:text-amber-400 hover:underline self-center font-bold px-2 py-1 bg-amber-50 dark:bg-zinc-800 rounded"
              title="Voltar para o Santo de Hoje"
            >
              Hoje
            </button>
          )}
        </div>

        <div className="relative w-full md:w-72">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nome, virtude ou padroeiro..."
            className="w-full border-b-2 border-[#d3c4af] dark:border-zinc-700 border-0 focus:ring-0 focus:border-[#785600] bg-transparent text-[#1c1b1b] dark:text-zinc-100 font-sans text-sm pl-8 py-2"
          />
          <Search className="w-4 h-4 absolute left-0 top-1/2 -translate-y-1/2 text-[#817563]" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-0 top-1/2 -translate-y-1/2 text-[#817563] hover:text-black cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </section>

      {/* Main Content Area */}
      <section className="space-y-10">
        {/* Card de Destaque Principal (Banner Dinâmico do Santo de Hoje / Filtrado) */}
        {featuredSaint && (
          <article
            onClick={() => onSelectSaint(featuredSaint)}
            className="bg-white dark:bg-zinc-900/90 rounded-2xl overflow-hidden border border-[#d3c4af] dark:border-zinc-800 shadow-md group cursor-pointer hover:shadow-xl transition-all duration-300 flex flex-col md:flex-row hover:border-[#785600] dark:hover:border-amber-500/70"
          >
            {/* Imagem do Santo */}
            <div className="w-full md:w-1/2 p-3 relative h-72 md:h-96 bg-amber-50/50 dark:bg-zinc-950">
              <div className="absolute inset-3 border border-[#B8860B]/40 pointer-events-none z-10 rounded"></div>
              <img
                src={getSanitizedImageUrl(featuredSaint.imageUrl, featuredSaint.id)}
                alt={featuredSaint.name}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = BANCO_SACRO_FALLBACK[0].url;
                }}
                className="w-full h-full max-w-full object-cover rounded transition-transform duration-700 group-hover:scale-102"
                loading="eager"
              />
            </div>

            {/* Dados Textuais do Santo */}
            <div className="w-full md:w-1/2 p-6 md:p-10 flex flex-col justify-between gap-4">
              <div className="space-y-3">
                <div className="flex justify-between items-start flex-wrap gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    {isTodayActive ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border border-amber-400/80 shadow-xs">
                        <Sparkles className="w-3.5 h-3.5 text-amber-600 animate-pulse" /> Santo de Hoje
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-100 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 border border-slate-300 dark:border-zinc-700">
                        <Calendar className="w-3.5 h-3.5 text-slate-600" /> Memória Litúrgica
                      </span>
                    )}

                    <span className="font-sans text-xs font-bold text-[#785600] dark:text-amber-400 uppercase tracking-wider">
                      {featuredSaint.feastDate || `${featuredSaint.day} de ${MONTH_NAMES[featuredSaint.month]}`}
                    </span>
                  </div>

                  <ArrowRight className="w-5 h-5 text-[#817563] dark:text-zinc-400 group-hover:text-[#785600] dark:group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
                </div>

                <h2 className="font-display text-2xl md:text-4xl font-bold text-[#1c1b1b] dark:text-[#F9FAFB] leading-tight group-hover:text-[#785600] dark:group-hover:text-amber-400 transition-colors">
                  {featuredSaint.name}
                </h2>

                {featuredSaint.title && (
                  <p className="font-serif italic text-sm text-[#785600] dark:text-amber-300 font-medium">
                    {featuredSaint.title}
                  </p>
                )}

                <p className="font-sans text-sm md:text-base text-[#4f4535] dark:text-zinc-300 leading-relaxed line-clamp-4 pt-1">
                  {featuredSaint.summary || (featuredSaint.fullBio ? featuredSaint.fullBio.slice(0, 220) + '...' : '')}
                </p>
              </div>

              <div className="pt-4 border-t border-[#d3c4af]/40 dark:border-zinc-800 flex justify-between items-center">
                <span className="text-xs text-[#817563] dark:text-zinc-400 font-sans">
                  Padroeiro: <strong className="text-[#4f4535] dark:text-zinc-200">{featuredSaint.patronage || 'Igreja Católica'}</strong>
                </span>

                <span className="font-sans text-xs font-bold text-[#785600] dark:text-amber-400 uppercase tracking-widest flex items-center gap-1.5 group-hover:underline">
                  Ver Biografia Completa <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </div>
          </article>
        )}

        {/* Grade de Santos (Grid de 3 Colunas) */}
        {gridSaints.length > 0 && (
          <div className="space-y-6 pt-4">
            <div className="flex items-center justify-between border-b border-[#d3c4af]/50 dark:border-zinc-800 pb-2">
              <h3 className="font-display text-xl font-bold text-[#785600] dark:text-amber-400">
                {selectedMonth ? `Santos do Mês de ${MONTH_NAMES[parseInt(selectedMonth, 10)]}` : 'Outros Santos do Calendário'}
              </h3>
              <span className="text-xs text-[#817563] dark:text-zinc-400 font-sans font-medium">
                {gridSaints.length} {gridSaints.length === 1 ? 'santo catalogado' : 'santos catalogados'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedGridSaints.map((saint) => (
                <article
                  key={saint.id}
                  onClick={() => onSelectSaint(saint)}
                  className="bg-white dark:bg-zinc-900/90 rounded-2xl flex flex-col overflow-hidden border border-[#d3c4af]/60 dark:border-zinc-800 shadow-xs group cursor-pointer hover:shadow-md transition-all hover:border-[#785600] dark:hover:border-amber-500/70"
                >
                  <div className="w-full h-52 p-2 relative bg-amber-50/30 dark:bg-zinc-950">
                    <div className="absolute inset-2 border border-[#B8860B]/30 pointer-events-none z-10 rounded"></div>
                    <img
                      src={getSanitizedImageUrl(saint.imageUrl, saint.id)}
                      alt={saint.name}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = BANCO_SACRO_FALLBACK[0].url;
                      }}
                      className="w-full h-full max-w-full object-cover rounded transition-transform duration-500 group-hover:scale-103"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                  <div className="p-6 flex flex-col gap-2 flex-1 justify-between">
                    <div>
                      <span className="font-sans text-xs font-bold text-[#785600] dark:text-amber-400 uppercase tracking-wider block mb-1">
                        {saint.feastDate || `${saint.day} de ${MONTH_NAMES[saint.month]}`}
                      </span>
                      <h4 className="font-display text-xl font-bold text-[#1c1b1b] dark:text-zinc-100 group-hover:text-[#785600] dark:group-hover:text-amber-400 transition-colors leading-snug">
                        {saint.name}
                      </h4>
                      <p className="font-sans text-sm text-[#4f4535] dark:text-zinc-300 mt-2 line-clamp-3 leading-relaxed">
                        {saint.summary || (saint.fullBio ? saint.fullBio.slice(0, 140) + '...' : '')}
                      </p>
                    </div>
                    <div className="pt-3 border-t border-[#d3c4af]/30 dark:border-zinc-800 flex justify-between items-center text-xs text-[#817563] dark:text-zinc-400">
                      <span className="truncate max-w-[180px]">{saint.patronage || 'Igreja Católica'}</span>
                      <span className="font-bold text-[#785600] dark:text-amber-400 group-hover:underline flex items-center gap-1">
                        Ler <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}

        {/* Dynamic Pagination */}
        {totalPages > 1 && (
          <section className="flex justify-center pt-6">
            <div className="flex gap-2 items-center">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className={`w-10 h-10 flex items-center justify-center border border-[#d3c4af] dark:border-zinc-700 rounded transition-colors ${
                  currentPage === 1
                    ? 'opacity-40 cursor-not-allowed text-slate-400'
                    : 'text-[#817563] dark:text-zinc-300 hover:border-[#785600] hover:text-[#785600] cursor-pointer'
                }`}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-10 h-10 flex items-center justify-center rounded font-sans text-sm font-bold cursor-pointer transition-all ${
                    currentPage === pageNum
                      ? 'bg-[#785600] dark:bg-amber-600 text-white shadow-xs'
                      : 'border border-[#d3c4af] dark:border-zinc-700 text-[#1c1b1b] dark:text-zinc-200 hover:border-[#785600]'
                  }`}
                >
                  {pageNum}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className={`w-10 h-10 flex items-center justify-center border border-[#d3c4af] rounded transition-colors ${
                  currentPage === totalPages
                    ? 'opacity-40 cursor-not-allowed text-slate-400'
                    : 'text-[#817563] hover:border-[#785600] hover:text-[#785600] cursor-pointer'
                }`}
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </section>
        )}
      </section>
    </div>
  );
};
