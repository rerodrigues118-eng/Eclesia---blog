import React, { useEffect, useState } from 'react';
import { ArrowLeft, BookOpen, Share2, Clock, Calendar, Newspaper, Bookmark, Check, Image as ImageIcon } from 'lucide-react';
import { Essay } from '../types';
import { updateDocumentSeo, resetPortalSeo } from '../utils/seo';
import { RichArticleRenderer } from './RichArticleRenderer';
import { GoogleAdSlot } from './GoogleAdSlot';
import { AffiliateProductSection } from './AffiliateProductSection';
import { SocialCardModal, SocialCardData } from './SocialCardModal';

interface EssayDetailViewProps {
  essay: Essay;
  onBack: () => void;
  onSelectEssay: (essay: Essay) => void;
  allArticles?: Essay[];
}

export const EssayDetailView: React.FC<EssayDetailViewProps> = ({ essay, onBack, onSelectEssay, allArticles = [] }) => {
  const [copied, setCopied] = React.useState(false);
  const [bookmarked, setBookmarked] = React.useState(false);
  const [shareMenuOpen, setShareMenuOpen] = React.useState(false);
  const [cardModalData, setCardModalData] = useState<SocialCardData | null>(null);

  // Injeta automaticamente as Meta Tags e o Schema.org JSON-LD para o Googlebot
  useEffect(() => {
    if (essay) updateDocumentSeo(essay);
    return () => {
      resetPortalSeo();
    };
  }, [essay]);

  if (!essay) {
    return (
      <div className="w-full max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="font-display text-2xl font-bold text-[#1c1b1b] dark:text-[#F9FAFB]">Artigo não encontrado</h2>
        <p className="text-sm text-[#4f4535] dark:text-zinc-400">O artigo solicitado não foi localizado ou ainda está sendo publicado.</p>
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#785600] text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar ao Blog
        </button>
      </div>
    );
  }

  // Find related articles (excluding current one)
  const relatedEssays = (allArticles || []).filter((e) => e && e.id !== essay.id).slice(0, 3);

  const getShareUrl = () => {
    const baseUrl = window.location.origin;
    const slug = (essay as any).slug || essay.id;
    return `${baseUrl}/blog/${slug}`;
  };

  const handleCopyLink = async () => {
    const url = getShareUrl();
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      const el = document.createElement('textarea');
      el.value = url;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const handleShare = async () => {
    const url = getShareUrl();
    const shareData = {
      title: essay.title,
      text: essay.excerpt || essay.title,
      url: url,
    };
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch (err) {
        // user cancelled or share failed
      }
    }
    // Fallback to copy link
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      handleCopyLink();
    }
  };

  const hasSidebarAd = essay.adConfig?.showSidebarAd;

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-6 sm:space-y-10 animate-fade-in">
      {/* Top Navigation / Breadcrumb & Action Buttons (Clean & Responsive for Mobile) */}
      <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 border-b border-[#d3c4af]/50 pb-4">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 sm:gap-2 text-xs font-bold uppercase tracking-wider text-[#785600] dark:text-amber-400 hover:text-[#9a7000] bg-[#f6f3f2] hover:bg-[#e8e2de] dark:bg-zinc-800 dark:hover:bg-zinc-700 px-3 sm:px-4 py-2 rounded-full border border-[#d3c4af]/60 dark:border-zinc-700 transition-all cursor-pointer shrink-0 whitespace-nowrap"
        >
          <ArrowLeft className="w-4 h-4" /> <span>Voltar</span><span className="hidden sm:inline"> para o Blog</span>
        </button>

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button
            onClick={() => setCardModalData({
              quote: essay.excerpt || essay.title,
              author: essay.author || 'Eclesia',
              subtitle: essay.title,
              dateStr: essay.date
            })}
            className="flex items-center gap-1 sm:gap-1.5 text-xs font-semibold px-2.5 sm:px-3 py-1.5 rounded-lg border border-amber-300 dark:border-amber-700 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 text-[#785600] dark:text-[#ffdea6] transition-all cursor-pointer whitespace-nowrap"
            title="Gerar Card para Redes Sociais"
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span className="hidden xs:inline sm:inline">Gerar Card</span>
          </button>

          <button
            onClick={() => setBookmarked(!bookmarked)}
            className={`flex items-center gap-1 sm:gap-1.5 text-xs font-semibold px-2.5 sm:px-3 py-1.5 rounded-lg border transition-all cursor-pointer whitespace-nowrap ${
              bookmarked
                ? 'bg-[#785600] text-white border-[#785600]'
                : 'bg-white dark:bg-zinc-800 text-[#4f4535] dark:text-zinc-200 border-[#d3c4af] dark:border-zinc-700 hover:border-[#785600]'
            }`}
            title={bookmarked ? 'Salvo nos favoritos' : 'Salvar artigo'}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span className="hidden xs:inline sm:inline">{bookmarked ? 'Salvo' : 'Salvar'}</span>
          </button>

          {/* Unified Share Button */}
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-[#785600] hover:bg-[#9a7000] text-white transition-all shadow-xs cursor-pointer whitespace-nowrap"
            title="Compartilhar matéria"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-300" />
                <span>Link Copiado!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5 text-amber-200" />
                <span>Compartilhar Matéria</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Toast Notification for Copied Link */}
      {copied && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1c1b1b] text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 border border-emerald-500/50 animate-bounce">
          <Check className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-bold font-sans">Link do artigo copiado com sucesso!</span>
        </div>
      )}

      {/* Main Article Layout (With optional Sidebar when sidebar ads are enabled) */}
      <div className={`grid grid-cols-1 ${hasSidebarAd ? 'lg:grid-cols-12 gap-8' : 'gap-0'}`}>
        <article className={`bg-white dark:bg-zinc-900/90 border border-[#d3c4af]/60 dark:border-zinc-800 rounded-2xl p-4 sm:p-8 md:p-12 space-y-6 sm:space-y-8 shadow-xs ${
          hasSidebarAd ? 'lg:col-span-8' : 'w-full'
        }`}>
          {/* Article Meta Header */}
          <header className="space-y-3 sm:space-y-4 border-b border-[#d3c4af]/40 dark:border-zinc-800 pb-6 sm:pb-8">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`px-2.5 sm:px-3 py-1 text-[11px] sm:text-xs font-bold uppercase tracking-widest rounded text-white ${
                essay.type === 'noticia' ? 'bg-[#9a3e3c]' : 'bg-[#785600]'
              }`}>
                {essay.type === 'noticia' ? 'Notícia' : 'Artigo'}
              </span>
              <span className="font-sans text-[11px] sm:text-xs font-bold uppercase tracking-widest text-[#785600] dark:text-amber-400 bg-[#ffdea6]/40 dark:bg-amber-950/40 px-2.5 sm:px-3 py-1 rounded">
                {essay.category}
              </span>
            </div>

            <h1 className="font-display text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-[#1c1b1b] dark:text-[#F9FAFB] leading-tight sm:leading-[1.15] tracking-tight break-words">
              {essay.title}
            </h1>

            {essay.excerpt && (
              <p className="font-sans text-sm sm:text-lg md:text-xl text-[#4f4535] dark:text-zinc-200 leading-relaxed italic border-l-4 border-[#785600] dark:border-amber-500 pl-3 sm:pl-4 py-1.5 bg-[#fcf9f8] dark:bg-zinc-800/80 rounded-r-lg">
                {essay.excerpt}
              </p>
            )}

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 sm:pt-4 text-xs font-sans text-[#817563] dark:text-zinc-400">
              <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#817563] dark:text-zinc-400 block">Escrito por</span>
                  <span className="font-bold text-[#1c1b1b] dark:text-zinc-200 text-xs sm:text-sm">{essay.author}</span>
                </div>
                <span className="text-[#d3c4af] dark:text-zinc-700 hidden xs:inline">|</span>
                <div className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-[#785600] dark:text-amber-400" />
                  <span>{essay.date}</span>
                </div>
                <span className="text-[#d3c4af] dark:text-zinc-700 hidden xs:inline">|</span>
                <div className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[#785600] dark:text-amber-400" />
                  <span>{essay.readTime}</span>
                </div>
              </div>
            </div>
          </header>

          {/* Featured Image */}
          <div className="aspect-[16/9] md:aspect-[21/9] rounded-xl overflow-hidden border border-[#d3c4af]/50 dark:border-zinc-800 shadow-xs relative">
            <img
              src={essay.imageUrl}
              alt={essay.title}
              className="w-full h-full max-w-full object-cover"
              loading="lazy"
              decoding="async"
            />
          </div>

          {/* ──────────────── TOP GOOGLE AD SLOT ──────────────── */}
          {essay.adConfig?.showTopAd && (
            <GoogleAdSlot
              slotType="top"
              adClient={essay.adConfig.adClient}
              adSlot={essay.adConfig.topSlotId}
            />
          )}

          {/* Article Content Body with Rich Headings, Floating Images, and In-Article Ads */}
          <div className="max-w-3xl mx-auto w-full">
            <RichArticleRenderer
              content={essay.content}
              mediaMap={essay.mediaMap || {}}
              adConfig={essay.adConfig}
            />
          </div>

          {/* ──────────────── BOTTOM GOOGLE AD SLOT ──────────────── */}
          {essay.adConfig?.showBottomAd && (
            <GoogleAdSlot
              slotType="bottom"
              adClient={essay.adConfig.adClient}
              adSlot={essay.adConfig.bottomSlotId}
            />
          )}

          {/* Article Footer & Author Signature with Sharing Links */}
          <div className="pt-8 border-t border-[#d3c4af]/50 dark:border-zinc-800 max-w-3xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#fcf9f8] dark:bg-zinc-800/60 p-6 rounded-2xl border border-[#d3c4af]/40 dark:border-zinc-700/60">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-widest text-[#785600] dark:text-amber-400">Eclesia Editorial</span>
              <p className="text-sm font-semibold text-[#1c1b1b] dark:text-[#F9FAFB]">Gostou deste conteúdo?</p>
              <p className="text-xs text-[#4f4535] dark:text-zinc-300">Compartilhe com amigos, sua comunidade de fé ou grupo de oração.</p>
            </div>

            <button
              onClick={handleShare}
              className="px-5 py-3 bg-[#785600] hover:bg-[#9a7000] text-white font-sans text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer whitespace-nowrap hover:scale-[1.02]"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>Link Copiado!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4 text-amber-200" />
                  <span>Compartilhar Matéria</span>
                </>
              )}
            </button>
          </div>
        </article>

        {/* ──────────────── SIDEBAR GOOGLE AD SLOT ──────────────── */}
        {hasSidebarAd && (
          <aside className="lg:col-span-4 space-y-6">
            <div className="sticky top-24 space-y-6">
              <GoogleAdSlot
                slotType="sidebar"
                adClient={essay.adConfig?.adClient}
                adSlot={essay.adConfig?.sidebarSlotId}
              />

              <div className="bg-[#fcf9f8] dark:bg-zinc-900/90 p-6 rounded-2xl border border-[#d3c4af]/60 dark:border-zinc-800 space-y-4">
                <h4 className="font-display font-bold text-base text-[#1c1b1b] dark:text-[#F9FAFB]">Nossos Destaques</h4>
                <div className="space-y-3">
                  {relatedEssays.slice(0, 2).map(r => (
                    <div
                      key={r.id}
                      onClick={() => onSelectEssay(r)}
                      className="cursor-pointer group flex items-start gap-3 border-b border-[#d3c4af]/30 dark:border-zinc-800 pb-3"
                    >
                      <img src={r.imageUrl} alt={r.title} className="w-16 h-12 object-cover rounded-lg shrink-0" loading="lazy" decoding="async" />
                      <div>
                        <h5 className="text-xs font-bold text-[#1c1b1b] dark:text-zinc-200 group-hover:text-[#785600] dark:group-hover:text-amber-400 line-clamp-2">{r.title}</h5>
                        <span className="text-[10px] text-[#817563] dark:text-zinc-400">{r.date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        )}
      </div>

      {/* Vitrine de Produtos Católicos Recomendados ao Fim do Artigo */}
      <AffiliateProductSection
        title="Livraria & Artigos Católicos Recomendados"
        subtitle="Aprofunde sua vida de oração com as obras essenciais da tradição católica e sacramentais abençoados."
      />

      {/* Recommended / Related Posts Section */}
      <section className="space-y-6 pt-6">
        <div className="flex items-center justify-between pb-2 border-b border-[#d3c4af]/50 dark:border-[#383027]">
          <h3 className="font-display text-2xl font-bold text-[#1c1b1b] dark:text-[#f3ede2]">Outras Publicações Recomendadas</h3>
          <button
            onClick={onBack}
            className="text-xs font-bold text-[#785600] hover:underline uppercase tracking-wider cursor-pointer"
          >
            Ver Todas
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {relatedEssays.map((item) => (
            <article
              key={item.id}
              onClick={() => onSelectEssay(item)}
              className="group cursor-pointer bg-white dark:bg-[#1a1714] rounded-lg border border-[#d3c4af]/50 dark:border-[#383027] overflow-hidden shadow-2xs hover:border-[#785600] transition-all flex flex-col justify-between"
            >
              <div>
                <div className="aspect-[16/10] overflow-hidden relative">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                    decoding="async"
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
                  <h4 className="font-display text-base font-bold text-[#1c1b1b] dark:text-[#f3ede2] group-hover:text-[#785600] transition-colors leading-snug line-clamp-2">
                    {item.title}
                  </h4>
                </div>
              </div>

              <div className="px-4 py-2 border-t border-[#d3c4af]/30 dark:border-[#332b23] bg-[#fcf9f8] dark:bg-[#201c18] flex items-center justify-between text-[10px] text-[#817563]">
                <span>{item.author}</span>
                <span>{item.readTime}</span>
              </div>
            </article>
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
