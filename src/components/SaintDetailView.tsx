import React, { useState } from 'react';
import { ArrowLeft, Sparkles, Heart, Share2, Copy, Check, Bookmark, Image as ImageIcon } from 'lucide-react';
import { Saint } from '../types';
import { AffiliateProductSection } from './AffiliateProductSection';
import { SocialCardModal, SocialCardData } from './SocialCardModal';

interface SaintDetailViewProps {
  saint: Saint;
  onBack: () => void;
  onSelectSaint: (saint: Saint) => void;
  allSaints?: Saint[];
}

export const SaintDetailView: React.FC<SaintDetailViewProps> = ({ saint, onBack, onSelectSaint, allSaints = [] }) => {
  const [copiedPrayer, setCopiedPrayer] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [cardModalData, setCardModalData] = useState<SocialCardData | null>(null);

  // Other saints for recommendation
  const otherSaints = allSaints.filter((s) => s.id !== saint.id).slice(0, 3);

  const handleCopyPrayer = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(saint.prayer);
      setCopiedPrayer(true);
      setTimeout(() => setCopiedPrayer(false), 3000);
    }
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 animate-fade-in">
      {/* Top Navigation / Breadcrumb */}
      <div className="flex items-center justify-between border-b border-[#d3c4af]/50 pb-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#785600] hover:text-[#9a7000] bg-[#f6f3f2] hover:bg-[#e8e2de] px-4 py-2 rounded-full border border-[#d3c4af]/60 transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar para o Santoral
        </button>

        <button
          onClick={handleShare}
          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-md bg-white border border-[#d3c4af] text-[#4f4535] hover:border-[#785600] transition-all cursor-pointer"
        >
          {copiedLink ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-emerald-700">Link Copiado!</span>
            </>
          ) : (
            <>
              <Share2 className="w-3.5 h-3.5 text-[#785600]" />
              <span>Compartilhar Santo</span>
            </>
          )}
        </button>
      </div>

      {/* Main Saint Page Card */}
      <article className="bg-white border border-[#d3c4af]/60 rounded-xl p-6 md:p-12 space-y-10 shadow-xs">
        {/* Hero Header Section */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start border-b border-[#d3c4af]/50 pb-8">
          {/* Saint Artwork Frame */}
          <div className="md:col-span-4 lg:col-span-4 aspect-[3/4] relative p-2 bg-[#fcf9f8] border-2 border-[#785600]/30 rounded-lg shadow-sm">
            <img
              src={saint.imageUrl ? `${saint.imageUrl}${saint.imageUrl.includes('?') ? '&' : '?'}v=${encodeURIComponent(saint.id)}` : 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&q=80&w=1200'}
              alt={saint.name}
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&q=80&w=1200';
              }}
              className="w-full h-full object-cover rounded-md"
              loading="lazy"
              decoding="async"
            />
            <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-xs p-2 rounded text-center border border-[#d3c4af]">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#785600]">Iconografia Sagrada</span>
            </div>
          </div>

          {/* Saint Info Details */}
          <div className="md:col-span-8 lg:col-span-8 space-y-5">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#785600]" />
              <span className="font-sans text-xs font-bold text-[#785600] uppercase tracking-widest bg-[#ffdea6]/30 px-3 py-1 rounded">
                Festividade Litúrgica • {saint.feastDate}
              </span>
            </div>

            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-[#1c1b1b] leading-tight">
              {saint.name}
            </h1>

            <p className="font-sans text-lg font-semibold text-[#817563]">{saint.title}</p>

            <div className="p-4 bg-[#fcf9f8] rounded-lg border border-[#d3c4af]/40 space-y-2">
              <div className="text-xs font-sans text-[#4f4535]">
                <strong className="text-[#1c1b1b] uppercase tracking-wider text-[11px] block mb-0.5">Padroeiro de:</strong>
                <span className="text-sm font-semibold text-[#785600]">{saint.patronage}</span>
              </div>
            </div>

            <p className="font-sans text-base text-[#4f4535] leading-relaxed italic border-l-4 border-[#785600] pl-4 py-1">
              "{saint.summary || (saint as any).shortBio}"
            </p>
          </div>
        </div>

        {/* Full Biography */}
        <section className="space-y-4 max-w-3xl">
          <div className="flex items-center gap-2">
            <span className="w-2 h-6 bg-[#785600] rounded-full inline-block"></span>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-[#1c1b1b]">
              Biografia & Trajetória Espiritual
            </h2>
          </div>

          <div className="font-sans text-[#1c1b1b] text-base md:text-lg leading-relaxed space-y-6 whitespace-pre-line drop-cap">
            {saint.fullBio}
          </div>
        </section>

        {/* Quotes Section */}
        {saint.quotes && saint.quotes.length > 0 && (
          <section className="bg-[#fcf9f8] dark:bg-[#1a1714] p-6 md:p-8 rounded-2xl border-l-4 border-[#785600] space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-xl font-bold text-[#1c1b1b] dark:text-[#f3ede2]">
                Palavras & Ensinamentos Espirituais
              </h3>
            </div>
            <div className="space-y-4">
              {saint.quotes.map((quote, idx) => (
                <div key={idx} className="bg-white dark:bg-[#221d19] p-5 rounded-xl border border-[#d3c4af]/40 dark:border-[#383027] shadow-2xs space-y-3">
                  <p className="font-sans text-sm md:text-base italic text-[#4f4535] dark:text-[#d3c4af] leading-relaxed">
                    "{quote}"
                  </p>
                  <div className="flex justify-end pt-2 border-t border-[#d3c4af]/30 dark:border-[#332b23]">
                    <button
                      onClick={() => setCardModalData({
                        quote,
                        author: saint.name,
                        subtitle: saint.title,
                        dateStr: saint.feastDate
                      })}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-900/50 border border-amber-300 dark:border-amber-800/60 text-[11px] font-bold text-[#785600] dark:text-[#ffdea6] transition-colors cursor-pointer"
                    >
                      <ImageIcon className="w-3.5 h-3.5" />
                      <span>Gerar Card para Redes Sociais</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Prayer Section */}
        <section className="bg-gradient-to-br from-[#ffdea6]/30 to-[#f6f3f2] dark:from-[#2a221a] dark:to-[#171412] border-2 border-[#785600]/30 dark:border-[#ffdea6]/30 p-6 md:p-8 rounded-2xl space-y-4 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[#785600] dark:text-[#ffdea6]">
              <Heart className="w-5 h-5 fill-[#785600]/20" />
              <h3 className="font-display text-2xl font-bold">Oração de Intercessão</h3>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCardModalData({
                  quote: saint.prayer,
                  author: saint.name,
                  subtitle: `Oração de Intercessão • ${saint.feastDate}`
                })}
                className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1.5 bg-white dark:bg-[#24201c] border border-[#785600]/40 rounded text-xs font-bold text-[#785600] dark:text-[#ffdea6] hover:bg-amber-50 transition-all cursor-pointer"
                title="Criar card visual da oração"
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Gerar Card</span>
              </button>

              <button
                onClick={handleCopyPrayer}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-[#24201c] border border-[#785600]/40 rounded text-xs font-bold text-[#785600] dark:text-[#ffdea6] hover:bg-[#785600] hover:text-white transition-all cursor-pointer shadow-2xs"
              >
                {copiedPrayer ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700">Oração Copiada!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar Oração</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="bg-white/80 dark:bg-[#1a1714]/90 backdrop-blur-xs p-6 rounded-xl border border-[#785600]/20 dark:border-[#383027]">
            <p className="font-sans text-base md:text-lg text-[#271900] dark:text-[#f3ede2] leading-relaxed italic text-center font-serif">
              "{saint.prayer}"
            </p>
          </div>
        </section>
      </article>

      {/* Vitrine de Produtos Católicos Recomendados */}
      <AffiliateProductSection
        title={`Livros e Artigos Inspirados na Vida de ${saint.name}`}
        subtitle="Fortaleça sua devoção católica com Bíblias, clássicos da literatura sacra e artigos de oração."
      />

      {/* Recommended Other Saints Section */}
      <section className="space-y-6 pt-4">
        <div className="flex items-center justify-between pb-2 border-b border-[#d3c4af]/50 dark:border-[#383027]">
          <h3 className="font-display text-2xl font-bold text-[#1c1b1b] dark:text-[#f3ede2]">Outros Santos do Calendário</h3>
          <button
            onClick={onBack}
            className="text-xs font-bold text-[#785600] hover:underline uppercase tracking-wider"
          >
            Ver Santoral Completo
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {otherSaints.map((item) => (
            <div
              key={item.id}
              onClick={() => onSelectSaint(item)}
              className="group cursor-pointer bg-white rounded-lg border border-[#d3c4af]/50 overflow-hidden shadow-2xs hover:border-[#785600] transition-all p-4 flex gap-4 items-center"
            >
              <img
                src={item.imageUrl}
                alt={item.name}
                className="w-16 h-20 object-cover rounded border border-[#d3c4af]/40 shrink-0 group-hover:scale-105 transition-transform"
                loading="lazy"
                decoding="async"
              />
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#785600]">
                  {item.feastDate}
                </span>
                <h4 className="font-display text-base font-bold text-[#1c1b1b] group-hover:text-[#785600] transition-colors leading-tight">
                  {item.name}
                </h4>
                <p className="text-[11px] text-[#817563] line-clamp-1">{item.title}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Social Card Generator Modal */}
      {cardModalData && (
        <SocialCardModal
          isOpen={Boolean(cardModalData)}
          onClose={() => setCardModalData(null)}
          data={cardModalData}
        />
      )}
    </div>
  );
};
