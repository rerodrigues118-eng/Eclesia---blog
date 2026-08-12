import React, { useState, useMemo } from 'react';
import { Search, ArrowRight, ChevronLeft, ChevronRight, X, Heart, Sparkles, BookOpen } from 'lucide-react';
import { Saint } from '../types';
import { SAINTS_DATA } from '../data/eclesiaData';

interface SantoralViewProps {
  onSelectSaint: (saint: Saint) => void;
}

export const SantoralView: React.FC<SantoralViewProps> = ({ onSelectSaint }) => {
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [selectedDay, setSelectedDay] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);

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

  const filteredSaints = useMemo(() => {
    return SAINTS_DATA.filter((saint) => {
      if (selectedMonth && saint.month !== parseInt(selectedMonth, 10)) {
        return false;
      }
      if (selectedDay && saint.day !== parseInt(selectedDay, 10)) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = saint.name.toLowerCase().includes(q);
        const matchTitle = saint.title.toLowerCase().includes(q);
        const matchBio = saint.fullBio.toLowerCase().includes(q);
        const matchSummary = saint.summary.toLowerCase().includes(q);
        if (!matchName && !matchTitle && !matchBio && !matchSummary) {
          return false;
        }
      }
      return true;
    });
  }, [selectedMonth, selectedDay, searchQuery]);

  // Featured Saint (Santo Tomás de Aquino if visible, else first)
  const featuredSaint = filteredSaints.find((s) => s.featured) || filteredSaints[0];
  const gridSaints = filteredSaints.filter((s) => s.id !== featuredSaint?.id);

  return (
    <div className="w-full max-w-[1120px] mx-auto px-4 md:px-12 py-12 space-y-12">
      {/* Header Section */}
      <section className="flex flex-col items-center text-center max-w-2xl mx-auto gap-4">
        <span className="bg-[#6E1E1E] text-white font-sans text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest">
          Santoral
        </span>
        <h1 className="font-display text-4xl md:text-5xl font-bold text-[#785600]">
          Os Santos da Igreja
        </h1>
        <p className="font-sans text-base text-[#4f4535] leading-relaxed">
          Conheça a vida, os ensinamentos e a intercessão daqueles que nos precederam na glória celeste. Um guia litúrgico para a devoção diária.
        </p>
      </section>

      {/* Filters & Search */}
      <section className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-6 rounded border border-[#d3c4af]/60 shadow-xs">
        <div className="flex gap-4 w-full md:w-auto">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="border-b border-[#d3c4af] border-0 focus:ring-0 focus:border-[#785600] bg-transparent text-[#4f4535] font-sans text-sm w-full md:w-48 py-2 cursor-pointer"
          >
            <option value="">Todos os Meses</option>
            {months.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>

          <select
            value={selectedDay}
            onChange={(e) => setSelectedDay(e.target.value)}
            className="border-b border-[#d3c4af] border-0 focus:ring-0 focus:border-[#785600] bg-transparent text-[#4f4535] font-sans text-sm w-full md:w-32 py-2 cursor-pointer"
          >
            <option value="">Dia</option>
            {Array.from({ length: 31 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {i + 1}
              </option>
            ))}
          </select>
        </div>

        <div className="relative w-full md:w-72">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar santo..."
            className="w-full border-b border-[#d3c4af] border-0 focus:ring-0 focus:border-[#785600] bg-transparent text-[#1c1b1b] font-sans text-sm pl-8 py-2"
          />
          <Search className="w-4 h-4 absolute left-0 top-1/2 -translate-y-1/2 text-[#817563]" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-0 top-1/2 -translate-y-1/2 text-[#817563] hover:text-black"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </section>

      {/* Saints Content */}
      {filteredSaints.length === 0 ? (
        <div className="text-center py-16 bg-white border border-[#d3c4af]/50 rounded p-8">
          <p className="font-display text-xl text-[#785600] mb-2">Nenhum santo encontrado</p>
          <p className="font-sans text-sm text-[#817563]">Tente ajustar os filtros de mês, dia ou termo de busca.</p>
        </div>
      ) : (
        <section className="space-y-8">
          {/* Featured Saint (Span 8 style card) */}
          {featuredSaint && (
            <article
              onClick={() => onSelectSaint(featuredSaint)}
              className="bg-white rounded overflow-hidden border border-[#d3c4af]/60 shadow-xs group cursor-pointer hover:shadow-md transition-all flex flex-col md:flex-row"
            >
              <div className="w-full md:w-1/2 p-2 relative h-64 md:h-80">
                <div className="absolute inset-2 border-2 border-[#B8860B]/40 pointer-events-none z-10"></div>
                <img
                  src={featuredSaint.imageUrl}
                  alt={featuredSaint.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-102"
                />
              </div>
              <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col justify-center gap-3">
                <div className="flex justify-between items-start">
                  <span className="font-sans text-xs font-bold text-[#785600] uppercase tracking-wider">
                    {featuredSaint.feastDate}
                  </span>
                  <ArrowRight className="w-5 h-5 text-[#817563] group-hover:text-[#785600] transition-colors" />
                </div>
                <h2 className="font-display text-2xl md:text-3xl font-bold text-[#1c1b1b] leading-tight">
                  {featuredSaint.name}
                </h2>
                <p className="font-sans text-sm text-[#4f4535] leading-relaxed line-clamp-4">
                  {featuredSaint.summary}
                </p>
                <div className="pt-2">
                  <span className="font-sans text-xs font-bold text-[#785600] uppercase tracking-widest flex items-center gap-1">
                    Ver Biografia Completa <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </article>
          )}

          {/* Grid Saints */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {gridSaints.map((saint) => (
              <article
                key={saint.id}
                onClick={() => onSelectSaint(saint)}
                className="bg-white rounded flex flex-col overflow-hidden border border-[#d3c4af]/60 shadow-xs group cursor-pointer hover:shadow-md transition-all hover:border-[#785600]"
              >
                <div className="w-full h-52 p-2 relative">
                  <div className="absolute inset-2 border-2 border-[#B8860B]/30 pointer-events-none z-10"></div>
                  <img
                    src={saint.imageUrl}
                    alt={saint.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-103"
                  />
                </div>
                <div className="p-6 flex flex-col gap-2 flex-1 justify-between">
                  <div>
                    <span className="font-sans text-xs font-bold text-[#785600] uppercase tracking-wider block mb-1">
                      {saint.feastDate}
                    </span>
                    <h3 className="font-display text-xl font-bold text-[#1c1b1b] group-hover:text-[#785600] transition-colors">
                      {saint.name}
                    </h3>
                    <p className="font-sans text-sm text-[#4f4535] mt-2 line-clamp-3 leading-relaxed">
                      {saint.summary}
                    </p>
                  </div>
                  <div className="pt-3 border-t border-[#d3c4af]/30 flex justify-between items-center text-xs text-[#817563]">
                    <span>{saint.patronage}</span>
                    <span className="font-bold text-[#785600] group-hover:underline">Ler +</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* Pagination */}
      <section className="flex justify-center pt-6">
        <div className="flex gap-2 items-center">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            className="w-10 h-10 flex items-center justify-center border border-[#d3c4af] rounded text-[#817563] hover:border-[#785600] hover:text-[#785600] transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => setCurrentPage(1)}
            className={`w-10 h-10 flex items-center justify-center rounded font-sans text-sm font-bold ${
              currentPage === 1 ? 'bg-[#785600] text-white' : 'border border-[#d3c4af] text-[#1c1b1b]'
            }`}
          >
            1
          </button>
          <button
            onClick={() => setCurrentPage(2)}
            className={`w-10 h-10 flex items-center justify-center rounded font-sans text-sm font-bold ${
              currentPage === 2 ? 'bg-[#785600] text-white' : 'border border-[#d3c4af] text-[#1c1b1b]'
            }`}
          >
            2
          </button>
          <button
            onClick={() => setCurrentPage(3)}
            className={`w-10 h-10 flex items-center justify-center rounded font-sans text-sm font-bold ${
              currentPage === 3 ? 'bg-[#785600] text-white' : 'border border-[#d3c4af] text-[#1c1b1b]'
            }`}
          >
            3
          </button>
          <span className="text-[#817563]">...</span>
          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            className="w-10 h-10 flex items-center justify-center border border-[#d3c4af] rounded text-[#817563] hover:border-[#785600] hover:text-[#785600] transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </section>
    </div>
  );
};
