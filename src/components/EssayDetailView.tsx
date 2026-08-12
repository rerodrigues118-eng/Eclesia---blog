import React from 'react';
import { ArrowLeft, BookOpen, Share2, Clock, Calendar, Newspaper, Bookmark, Check } from 'lucide-react';
import { Essay } from '../types';
import { ESSAYS_DATA } from '../data/eclesiaData';

interface EssayDetailViewProps {
  essay: Essay;
  onBack: () => void;
  onSelectEssay: (essay: Essay) => void;
}

export const EssayDetailView: React.FC<EssayDetailViewProps> = ({ essay, onBack, onSelectEssay }) => {
  const [copied, setCopied] = React.useState(false);
  const [bookmarked, setBookmarked] = React.useState(false);

  // Find related articles (excluding current one)
  const relatedEssays = ESSAYS_DATA.filter((e) => e.id !== essay.id).slice(0, 3);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  return (
    <div className="w-full max-w-[1120px] mx-auto px-4 md:px-12 py-8 space-y-10 animate-fade-in">
      {/* Top Navigation / Breadcrumb */}
      <div className="flex items-center justify-between border-b border-[#d3c4af]/50 pb-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#785600] hover:text-[#9a7000] bg-[#f6f3f2] hover:bg-[#e8e2de] px-4 py-2 rounded-full border border-[#d3c4af]/60 transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar para o Blog
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setBookmarked(!bookmarked)}
            className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-md border transition-all ${
              bookmarked
                ? 'bg-[#785600] text-white border-[#785600]'
                : 'bg-white text-[#4f4535] border-[#d3c4af] hover:border-[#785600]'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            {bookmarked ? 'Salvo' : 'Salvar'}
          </button>

          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-md bg-white border border-[#d3c4af] text-[#4f4535] hover:border-[#785600] transition-all cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">Link Copiado!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5 text-[#785600]" />
                <span>Compartilhar</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Article Layout */}
      <article className="bg-white border border-[#d3c4af]/60 rounded-xl p-6 md:p-12 space-y-8 shadow-xs">
        {/* Article Meta Header */}
        <header className="space-y-4 border-b border-[#d3c4af]/40 pb-8">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`px-3 py-1 text-xs font-bold uppercase tracking-widest rounded text-white ${
              essay.type === 'noticia' ? 'bg-[#9a3e3c]' : 'bg-[#785600]'
            }`}>
              {essay.type === 'noticia' ? 'Notícia' : 'Artigo'}
            </span>
            <span className="font-sans text-xs font-bold uppercase tracking-widest text-[#785600] bg-[#ffdea6]/40 px-3 py-1 rounded">
              {essay.category}
            </span>
          </div>

          <h1 className="font-display text-3xl md:text-5xl lg:text-6xl font-bold text-[#1c1b1b] leading-[1.15] tracking-tight">
            {essay.title}
          </h1>

          <p className="font-sans text-base md:text-xl text-[#4f4535] leading-relaxed italic border-l-4 border-[#785600] pl-4 py-1 bg-[#fcf9f8]">
            {essay.excerpt}
          </p>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 text-xs font-sans text-[#817563]">
            <div className="flex items-center gap-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#817563] block">Escrito por</span>
                <span className="font-bold text-[#1c1b1b] text-sm">{essay.author}</span>
              </div>
              <span className="text-[#d3c4af]">|</span>
              <div className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-[#785600]" />
                <span>{essay.date}</span>
              </div>
              <span className="text-[#d3c4af]">|</span>
              <div className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#785600]" />
                <span>{essay.readTime}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Featured Image */}
        <div className="aspect-[16/9] md:aspect-[21/9] rounded-lg overflow-hidden border border-[#d3c4af]/50 shadow-xs relative">
          <img
            src={essay.imageUrl}
            alt={essay.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Article Content Body */}
        <div className="max-w-3xl mx-auto font-sans text-[#1c1b1b] text-base md:text-lg leading-relaxed space-y-6 whitespace-pre-line pt-2">
          {essay.content}
        </div>

        {/* Article Footer & Author Signature */}
        <div className="pt-8 border-t border-[#d3c4af]/50 max-w-3xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#fcf9f8] p-6 rounded-lg border">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-widest text-[#785600]">Eclesia Editorial</span>
            <p className="text-sm font-semibold text-[#1c1b1b]">Gostou deste conteúdo?</p>
            <p className="text-xs text-[#4f4535]">Compartilhe com amigos, sua comunidade de fé ou grupo de oração.</p>
          </div>

          <button
            onClick={handleShare}
            className="px-4 py-2 bg-[#785600] hover:bg-[#9a7000] text-white text-xs font-bold uppercase tracking-widest rounded transition-colors flex items-center gap-2 shrink-0 cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" /> Compartilhar Matéria
          </button>
        </div>
      </article>

      {/* Recommended / Related Posts Section */}
      <section className="space-y-6 pt-6">
        <div className="flex items-center justify-between pb-2 border-b border-[#d3c4af]/50">
          <h3 className="font-display text-2xl font-bold text-[#1c1b1b]">Outras Publicações Recomendadas</h3>
          <button
            onClick={onBack}
            className="text-xs font-bold text-[#785600] hover:underline uppercase tracking-wider"
          >
            Ver Todas
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {relatedEssays.map((item) => (
            <article
              key={item.id}
              onClick={() => onSelectEssay(item)}
              className="group cursor-pointer bg-white rounded-lg border border-[#d3c4af]/50 overflow-hidden shadow-2xs hover:border-[#785600] transition-all flex flex-col justify-between"
            >
              <div>
                <div className="aspect-[16/10] overflow-hidden relative">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className={`absolute top-2 left-2 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest rounded text-white ${
                    item.type === 'noticia' ? 'bg-[#9a3e3c]' : 'bg-[#785600]'
                  }`}>
                    {item.type === 'noticia' ? 'Notícia' : 'Artigo'}
                  </span>
                </div>

                <div className="p-4 space-y-2">
                  <span className="font-sans text-[10px] font-bold uppercase tracking-wider text-[#785600]">
                    {item.category}
                  </span>
                  <h4 className="font-display text-base font-bold text-[#1c1b1b] group-hover:text-[#785600] transition-colors leading-snug line-clamp-2">
                    {item.title}
                  </h4>
                </div>
              </div>

              <div className="px-4 py-2 border-t border-[#d3c4af]/30 bg-[#fcf9f8] flex items-center justify-between text-[10px] text-[#817563]">
                <span>{item.author}</span>
                <span>{item.readTime}</span>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
};
