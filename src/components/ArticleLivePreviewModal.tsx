import React, { useState } from 'react';
import {
  ArrowLeft,
  Settings,
  Sparkles,
  Megaphone,
  Check,
  Eye,
  Sliders,
  CheckCircle,
  X,
  Share2,
  Calendar,
  Clock,
  LayoutTemplate,
  Info
} from 'lucide-react';
import { Essay, ArticleAdConfig } from '../types';
import { RichArticleRenderer } from './RichArticleRenderer';
import { GoogleAdSlot } from './GoogleAdSlot';

interface ArticleLivePreviewModalProps {
  essay: Essay;
  isOpen: boolean;
  onClose: () => void;
  onUpdateAdConfig: (config: ArticleAdConfig) => void;
}

export const ArticleLivePreviewModal: React.FC<ArticleLivePreviewModalProps> = ({
  essay,
  isOpen,
  onClose,
  onUpdateAdConfig
}) => {
  if (!isOpen) return null;

  // Local state for interactive AdSense controller
  const [adConfig, setAdConfig] = useState<ArticleAdConfig>(
    essay.adConfig || {
      showTopAd: true,
      showMiddleAd: true,
      middleAdParagraph: 3,
      showSidebarAd: true,
      showBottomAd: true,
      adClient: 'ca-pub-1234567890123456',
      topSlotId: '1001',
      middleSlotId: '1002',
      sidebarSlotId: '1003',
      bottomSlotId: '1004'
    }
  );

  const [isConfigDrawerOpen, setIsConfigDrawerOpen] = useState(false);
  const [savedFeedback, setSavedFeedback] = useState(false);

  const handleToggle = (key: keyof ArticleAdConfig, value: any) => {
    const updated = { ...adConfig, [key]: value };
    setAdConfig(updated);
    onUpdateAdConfig(updated);
  };

  const handleSaveAndClose = () => {
    onUpdateAdConfig(adConfig);
    setSavedFeedback(true);
    setTimeout(() => {
      setSavedFeedback(false);
      onClose();
    }, 400);
  };

  const hasSidebarAd = adConfig.showSidebarAd;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex flex-col">
      {/* ──────────────── STICKY ADMIN ADS CONTROL TOOLBAR ──────────────── */}
      <header className="sticky top-0 z-40 bg-slate-900 border-b border-amber-500/30 px-3 sm:px-6 py-2.5 sm:py-3 shadow-xl text-white">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={onClose}
              className="px-3 py-1.5 sm:px-3.5 sm:py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors border border-slate-700 cursor-pointer shrink-0"
            >
              <ArrowLeft className="w-4 h-4" /> <span>Voltar</span><span className="hidden sm:inline"> ao Editor</span>
            </button>

            <div className="hidden sm:block h-6 w-px bg-slate-800" />

            <div className="flex items-center gap-2">
              <span className="px-2 sm:px-2.5 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-lg text-[11px] sm:text-xs font-bold flex items-center gap-1.5 whitespace-nowrap">
                <Eye className="w-3.5 h-3.5" /> Prévia Real da Página
              </span>
            </div>
          </div>

          {/* Quick Ad Toggle Pills */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800 text-[10px] sm:text-[11px] font-bold overflow-x-auto max-w-full">
              <button
                type="button"
                onClick={() => handleToggle('showTopAd', !adConfig.showTopAd)}
                className={`px-2 sm:px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer whitespace-nowrap ${
                  adConfig.showTopAd
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {adConfig.showTopAd ? <Check className="w-3 h-3" /> : null} Topo
              </button>

              <button
                type="button"
                onClick={() => handleToggle('showMiddleAd', !adConfig.showMiddleAd)}
                className={`px-2 sm:px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer whitespace-nowrap ${
                  adConfig.showMiddleAd
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {adConfig.showMiddleAd ? <Check className="w-3 h-3" /> : null} Meio
              </button>

              <button
                type="button"
                onClick={() => handleToggle('showSidebarAd', !adConfig.showSidebarAd)}
                className={`px-2 sm:px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer whitespace-nowrap ${
                  adConfig.showSidebarAd
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {adConfig.showSidebarAd ? <Check className="w-3 h-3" /> : null} Lateral
              </button>

              <button
                type="button"
                onClick={() => handleToggle('showBottomAd', !adConfig.showBottomAd)}
                className={`px-2 sm:px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer whitespace-nowrap ${
                  adConfig.showBottomAd
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {adConfig.showBottomAd ? <Check className="w-3 h-3" /> : null} Rodapé
              </button>
            </div>

            <button
              type="button"
              onClick={() => setIsConfigDrawerOpen(!isConfigDrawerOpen)}
              className="px-2.5 sm:px-3 py-1.5 sm:py-2 bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 rounded-xl text-[11px] sm:text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer whitespace-nowrap"
            >
              <Sliders className="w-3.5 h-3.5" /> <span className="hidden sm:inline">IDs Google Ads</span><span className="sm:hidden">IDs</span>
            </button>

            <button
              type="button"
              onClick={handleSaveAndClose}
              className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl text-[11px] sm:text-xs flex items-center gap-1 transition-all shadow-md cursor-pointer whitespace-nowrap"
            >
              <CheckCircle className="w-4 h-4" /> <span>Salvar</span>
            </button>
          </div>
        </div>

        {/* ──────────────── ADVANCED GOOGLE ADS SETTINGS DRAWER ──────────────── */}
        {isConfigDrawerOpen && (
          <div className="max-w-7xl mx-auto mt-3 sm:mt-4 p-4 sm:p-5 bg-slate-950 border border-slate-800 rounded-2xl animate-fade-in text-slate-200 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-amber-400" />
                <h4 className="text-sm font-bold text-white">Configuração dos Blocos Google AdSense</h4>
              </div>
              <button
                type="button"
                onClick={() => setIsConfigDrawerOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div>
                <label className="block text-slate-400 font-bold mb-1">ID Cliente Google AdSense</label>
                <input
                  type="text"
                  value={adConfig.adClient || ''}
                  onChange={(e) => handleToggle('adClient', e.target.value)}
                  placeholder="ca-pub-XXXXXXXXXXXXXXXX"
                  className="w-full p-2 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Slot Anúncio Topo (data-ad-slot)</label>
                <input
                  type="text"
                  value={adConfig.topSlotId || ''}
                  onChange={(e) => handleToggle('topSlotId', e.target.value)}
                  placeholder="Ex: 1234567890"
                  className="w-full p-2 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">
                  Posição In-Article (Após qual parágrafo?)
                </label>
                <select
                  value={adConfig.middleAdParagraph || 3}
                  onChange={(e) => handleToggle('middleAdParagraph', parseInt(e.target.value, 10))}
                  className="w-full p-2 rounded-lg bg-slate-900 border border-slate-700 text-white"
                >
                  <option value={1}>Após o 1º parágrafo</option>
                  <option value={2}>Após o 2º parágrafo</option>
                  <option value={3}>Após o 3º parágrafo (Recomendado)</option>
                  <option value={4}>Após o 4º parágrafo</option>
                  <option value={5}>Após o 5º parágrafo</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Slot Anúncio Lateral / Rodapé</label>
                <input
                  type="text"
                  value={adConfig.sidebarSlotId || ''}
                  onChange={(e) => handleToggle('sidebarSlotId', e.target.value)}
                  placeholder="Ex: 1234567890"
                  className="w-full p-2 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono"
                />
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center gap-2 text-[11px] text-amber-300/80">
              <Info className="w-4 h-4 shrink-0" />
              <span>
                As alterações feitas refletem instantaneamente no artigo abaixo. Quando o artigo for publicado, o código oficial do Google AdSense será injetado nos locais selecionados.
              </span>
            </div>
          </div>
        )}
      </header>

      {/* ──────────────── REAL POSTED ARTICLE CANVAS ──────────────── */}
      <main className="flex-1 bg-[#f6f3f2] overflow-y-auto py-4 sm:py-8 px-3 sm:px-6 lg:px-8">
        <div className="w-full max-w-7xl mx-auto space-y-6 sm:space-y-8 animate-fade-in">
          {/* Article Header Bar */}
          <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 border-b border-[#d3c4af]/50 pb-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#785600] bg-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-[#d3c4af]/60 truncate max-w-full">
              <span>Eclesia</span>
              <span className="text-[#d3c4af]">/</span>
              <span>{essay.category}</span>
              <span className="text-[#d3c4af] hidden xs:inline">/</span>
              <span className="text-slate-600 truncate max-w-xs hidden xs:inline">{essay.title}</span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="px-2.5 sm:px-3 py-1 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-[11px] sm:text-xs font-bold flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Prévia Real Publicada
              </span>
            </div>
          </div>

          {/* Main Grid: Article Content + Optional Google Ads Sidebar */}
          <div className={`grid grid-cols-1 ${hasSidebarAd ? 'lg:grid-cols-12 gap-8' : 'gap-0'}`}>
            <article className={`bg-white border border-[#d3c4af]/60 rounded-2xl p-4 sm:p-8 md:p-12 space-y-6 sm:space-y-8 shadow-xs ${
              hasSidebarAd ? 'lg:col-span-8' : 'w-full max-w-4xl mx-auto'
            }`}>
              {/* Category & Badge */}
              <header className="space-y-3 sm:space-y-4 border-b border-[#d3c4af]/40 pb-6 sm:pb-8">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`px-2.5 sm:px-3 py-1 text-[11px] sm:text-xs font-bold uppercase tracking-widest rounded text-white ${
                    essay.type === 'noticia' ? 'bg-[#9a3e3c]' : 'bg-[#785600]'
                  }`}>
                    {essay.type === 'noticia' ? 'Notícia' : 'Artigo'}
                  </span>
                  <span className="font-sans text-[11px] sm:text-xs font-bold uppercase tracking-widest text-[#785600] bg-[#ffdea6]/40 px-2.5 sm:px-3 py-1 rounded">
                    {essay.category}
                  </span>
                </div>

                <h1 className="font-display text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-[#1c1b1b] leading-tight sm:leading-[1.15] tracking-tight break-words">
                  {essay.title || 'Título do Artigo'}
                </h1>

                {essay.excerpt && (
                  <p className="font-sans text-sm sm:text-lg md:text-xl text-[#4f4535] leading-relaxed italic border-l-4 border-[#785600] pl-3 sm:pl-4 py-1.5 bg-[#fcf9f8] rounded-r-lg">
                    {essay.excerpt}
                  </p>
                )}

                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 sm:pt-4 text-xs font-sans text-[#817563]">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#817563] block">Escrito por</span>
                      <span className="font-bold text-[#1c1b1b] text-xs sm:text-sm">{essay.author || 'Redação Eclesia'}</span>
                    </div>
                    <span className="text-[#d3c4af] hidden xs:inline">|</span>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-[#785600]" />
                      <span>{essay.date || 'Hoje'}</span>
                    </div>
                    <span className="text-[#d3c4af] hidden xs:inline">|</span>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-[#785600]" />
                      <span>{essay.readTime || '5 min'}</span>
                    </div>
                  </div>
                </div>
              </header>

              {/* Full Featured Cover Image */}
              {essay.imageUrl && (
                <div className="aspect-[16/9] md:aspect-[21/9] rounded-xl overflow-hidden border border-[#d3c4af]/50 shadow-xs relative">
                  <img
                    src={essay.imageUrl}
                    alt={essay.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* ──────────────── TOP GOOGLE AD SLOT ──────────────── */}
              {adConfig.showTopAd && (
                <GoogleAdSlot
                  slotType="top"
                  adClient={adConfig.adClient}
                  adSlot={adConfig.topSlotId}
                  isPreview={true}
                  onConfigure={() => setIsConfigDrawerOpen(true)}
                />
              )}

              {/* Article Content Body with Rich Headings, Floating Images, and In-Article Ads */}
              <div className="max-w-3xl mx-auto">
                <RichArticleRenderer
                  content={essay.content || '*(O texto do seu artigo aparecerá formatado aqui)*'}
                  mediaMap={essay.mediaMap}
                  adConfig={adConfig}
                  isPreview={true}
                  onConfigureAd={() => setIsConfigDrawerOpen(true)}
                />
              </div>

              {/* ──────────────── BOTTOM GOOGLE AD SLOT ──────────────── */}
              {adConfig.showBottomAd && (
                <GoogleAdSlot
                  slotType="bottom"
                  adClient={adConfig.adClient}
                  adSlot={adConfig.bottomSlotId}
                  isPreview={true}
                  onConfigure={() => setIsConfigDrawerOpen(true)}
                />
              )}

              {/* Article Footer & Author Signature */}
              <div className="pt-8 border-t border-[#d3c4af]/50 max-w-3xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#fcf9f8] p-6 rounded-2xl border">
                <div className="space-y-1">
                  <span className="text-xs font-bold uppercase tracking-widest text-[#785600]">Eclesia Editorial</span>
                  <p className="text-sm font-semibold text-[#1c1b1b]">Gostou deste conteúdo?</p>
                  <p className="text-xs text-[#4f4535]">Compartilhe com amigos, sua comunidade de fé ou grupo de oração.</p>
                </div>

                <button
                  type="button"
                  className="px-5 py-3 bg-[#785600] text-white font-sans text-xs font-bold uppercase tracking-wider rounded-xl shadow-sm flex items-center gap-2"
                >
                  <Share2 className="w-4 h-4 text-amber-200" />
                  <span>Compartilhar Matéria</span>
                </button>
              </div>
            </article>

            {/* ──────────────── SIDEBAR GOOGLE AD SLOT ──────────────── */}
            {hasSidebarAd && (
              <aside className="lg:col-span-4 space-y-6">
                <div className="sticky top-24 space-y-6">
                  <GoogleAdSlot
                    slotType="sidebar"
                    adClient={adConfig.adClient}
                    adSlot={adConfig.sidebarSlotId}
                    isPreview={true}
                    onConfigure={() => setIsConfigDrawerOpen(true)}
                  />

                  <div className="bg-white p-6 rounded-2xl border border-[#d3c4af]/60 space-y-4 shadow-xs">
                    <h4 className="font-display font-bold text-base text-[#1c1b1b]">Barra Lateral de Destaques</h4>
                    <p className="text-xs text-[#817563] leading-relaxed">
                      Quando o anúncio lateral está ativo, a página ganha um layout elegante em 2 colunas, exibindo o banner do Google Ads e cards complementares do portal.
                    </p>
                  </div>
                </div>
              </aside>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
