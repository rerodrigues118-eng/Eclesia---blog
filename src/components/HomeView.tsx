import React, { useState, useEffect, useCallback } from 'react';
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Heart,
  Calendar,
  Sparkles,
  Church,
  ShoppingBag,
  MapPin,
  Clock,
  ExternalLink,
  Flame,
  Check,
  Search
} from 'lucide-react';
import { ActiveView, Saint, Essay, Product } from '../types';
import { TODAY_LITURGY_MOCK } from '../data/liturgiaData';

interface HomeViewProps {
  setActiveView: (view: ActiveView) => void;
  onSelectSaint: (saint: Saint) => void;
  onSelectEssay: (essay: Essay) => void;
  articles?: Essay[];
  products?: Product[];
  saints?: Saint[];
}

export const HomeView: React.FC<HomeViewProps> = ({
  setActiveView,
  onSelectSaint,
  onSelectEssay,
  articles = [],
  products = [],
  saints = [],
}) => {
  // 1. Strictly the 3 most recently posted articles
  const recentArticles = (articles || []).slice(0, 3);
  const articleSlides = recentArticles.map((article, idx) => ({
    id: article.id || `article-slide-${idx}`,
    type: 'article' as const,
    title: article.title,
    subtitle: article.category || 'Artigo',
    excerpt: article.excerpt || '',
    imageUrl: article.imageUrl || 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&q=80&w=1400',
    category: article.category || 'Artigo',
    buttonText: 'Saiba mais',
    onClick: () => onSelectEssay(article)
  }));

  // 2. Santo do Dia (Saint of the Day)
  const today = new Date();
  const currentMonth = today.getMonth() + 1;
  const currentDay = today.getDate();
  const saintOfDay =
    saints.find(s => s.month === currentMonth && s.day === currentDay) ||
    saints.find(s => s.featured) ||
    saints[0];

  const saintSlide = saintOfDay ? [{
    id: `saint-${saintOfDay.id}`,
    type: 'saint' as const,
    title: saintOfDay.name,
    subtitle: saintOfDay.title ? `${saintOfDay.title} • Festa: ${saintOfDay.feastDate}` : `Memória Litúrgica: ${saintOfDay.feastDate}`,
    excerpt: saintOfDay.summary || (saintOfDay.fullBio ? saintOfDay.fullBio.slice(0, 160) + '...' : 'Conheça a história e devoção deste grande exemplo de fé e virtude cristã.'),
    imageUrl: saintOfDay.imageUrl || 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&q=80&w=1400',
    category: 'SANTO DO DIA',
    buttonText: 'Conhecer Santo',
    onClick: () => onSelectSaint(saintOfDay)
  }] : [];

  // 3. Produto Mais Recente na Loja (Latest Store Product)
  const latestProduct = products[0];
  const productPriceFormatted = latestProduct && typeof latestProduct.price === 'number'
    ? `R$ ${latestProduct.price.toFixed(2).replace('.', ',')}`
    : 'Lançamento';

  const productSlide = latestProduct ? [{
    id: `product-${latestProduct.id}`,
    type: 'product' as const,
    title: latestProduct.title,
    subtitle: latestProduct.subtitle ? `${latestProduct.subtitle} • ${productPriceFormatted}` : `Disponível na Loja • ${productPriceFormatted}`,
    excerpt: latestProduct.description
      ? (latestProduct.description.slice(0, 150) + (latestProduct.description.length > 150 ? '...' : ''))
      : 'Confira os lançamentos, livros e artigos sacros exclusivos da Loja Eclesia.',
    imageUrl: latestProduct.imageUrl || 'https://images.unsplash.com/photo-1548625361-195979bc7583?auto=format&fit=crop&q=80&w=1400',
    category: `LOJA ECLESIA • ${productPriceFormatted}`,
    buttonText: 'Ver na Loja',
    onClick: () => setActiveView('loja')
  }] : [];

  // Default fallback hero slide if articles/saints/products are empty or still loading
  const defaultFallbackHero = {
    id: 'hero-default',
    type: 'article' as const,
    title: 'Eclesia • Tradição, Fé e Doutrina Católica',
    subtitle: 'Portal Católico Apostólico Romano',
    excerpt: 'Artigos teológicos fundamentados no Magistério, Santoral tradicional e aprofundamento na espiritualidade da Santa Igreja.',
    imageUrl: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&q=80&w=1400',
    category: 'DESTAQUE',
    buttonText: 'Explorar Artigos',
    onClick: () => setActiveView('blog')
  };

  // Combine: 3 Recent Articles + Santo do Dia + Produto Mais Recente da Loja
  const heroSlides = [
    ...articleSlides,
    ...saintSlide,
    ...productSlide
  ];

  const effectiveSlides = heroSlides.length > 0 ? heroSlides : [defaultFallbackHero];

  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);
  const [heroFading, setHeroFading] = useState(false);

  const goToHeroSlide = useCallback((index: number) => {
    if (effectiveSlides.length === 0) return;
    setHeroFading(true);
    setTimeout(() => {
      setCurrentHeroIndex(index % effectiveSlides.length);
      setHeroFading(false);
    }, 250);
  }, [effectiveSlides.length]);

  const nextHeroSlide = useCallback(() => {
    if (effectiveSlides.length === 0) return;
    goToHeroSlide((currentHeroIndex + 1) % effectiveSlides.length);
  }, [currentHeroIndex, effectiveSlides.length, goToHeroSlide]);

  const prevHeroSlide = () => {
    if (effectiveSlides.length === 0) return;
    goToHeroSlide((currentHeroIndex - 1 + effectiveSlides.length) % effectiveSlides.length);
  };

  useEffect(() => {
    const timer = setInterval(nextHeroSlide, 8000);
    return () => clearInterval(timer);
  }, [nextHeroSlide]);

  const currentHero = effectiveSlides[currentHeroIndex] || effectiveSlides[0] || defaultFallbackHero;

  // Reference 3 & 4: Catholic Prayers Cards Data
  const classicPrayers = [
    {
      id: 'p-1',
      title: 'Benedíctio Mensae – Oração em latim e português para antes e depois das refeições',
      category: 'ORAÇÕES CATÓLICAS',
      imageUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&q=80&w=600',
      action: () => setActiveView('oracoes')
    },
    {
      id: 'p-2',
      title: 'Oração ao Divino Espírito Santo – Veni, Sancte Spíritus',
      category: 'ORAÇÕES CATÓLICAS',
      imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=600',
      action: () => setActiveView('oracoes')
    },
    {
      id: 'p-3',
      title: 'Oração a São José pela pureza',
      category: 'ORAÇÕES CATÓLICAS',
      imageUrl: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&q=80&w=600',
      action: () => setActiveView('oracoes')
    },
    {
      id: 'p-4',
      title: 'Oração à Bem-Aventurada Virgem Maria após a Comunhão',
      category: 'ORAÇÕES CATÓLICAS',
      imageUrl: 'https://images.unsplash.com/photo-1548625361-195979bc7583?auto=format&fit=crop&q=80&w=600',
      action: () => setActiveView('oracoes')
    }
  ];

  // Devotion Categories (Ref. Image 4)
  const devotionCategories = [
    {
      title: 'ORAÇÕES A JESUS CRISTO',
      imageUrl: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&q=80&w=600'
    },
    {
      title: 'ORAÇÕES AO SAGRADO CORAÇÃO',
      imageUrl: 'https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&q=80&w=600'
    },
    {
      title: 'ORAÇÕES AO SANTÍSSIMO SACRAMENTO',
      imageUrl: 'https://images.unsplash.com/photo-1548625361-195979bc7583?auto=format&fit=crop&q=80&w=600'
    },
    {
      title: 'ORAÇÕES ÀS CHAGAS DE JESUS CRISTO',
      imageUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&q=80&w=600'
    }
  ];

  return (
    <div className="w-full space-y-16 pb-24">
      {/* =========================================================================
          1. HERO CAROUSEL BANNER (Ref. Minha Biblioteca Católica - Imagens 1 e 2)
      ========================================================================= */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <div className="relative w-full h-[420px] sm:h-[500px] rounded-3xl overflow-hidden shadow-2xl bg-[#1c1b1b] group">
          {/* Background Sacred Painting Image */}
          <div
            className={`absolute inset-0 bg-cover bg-center transition-all duration-700 ${
              heroFading ? 'opacity-30 scale-105' : 'opacity-100 scale-100'
            }`}
            style={{ backgroundImage: `url(${currentHero.imageUrl})` }}
          >
            {/* Atmospheric Heavenly Light Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/20 to-transparent" />
          </div>

          {/* Banner Hero Content */}
          <div
            onClick={() => currentHero?.onClick && currentHero.onClick()}
            className="relative z-10 h-full flex flex-col justify-end p-6 sm:p-14 max-w-2xl text-white space-y-3 sm:space-y-4 cursor-pointer"
          >
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`inline-block px-3.5 py-1 font-sans text-[11px] font-bold uppercase tracking-widest rounded-full self-start shadow-sm ${
                currentHero.type === 'saint'
                  ? 'bg-[#ffe082] text-[#5d4037]'
                  : currentHero.type === 'product'
                  ? 'bg-[#d1fae5] text-[#065f46]'
                  : 'bg-[#f7bd48] text-[#1c1b1b]'
              }`}>
                {currentHero.category}
              </span>
              {currentHero.subtitle && currentHero.type !== 'article' && (
                <span className="font-sans text-xs text-[#fde68a] font-semibold drop-shadow-xs">
                  {currentHero.subtitle}
                </span>
              )}
            </div>

            <h1 className="font-display text-2xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-tight text-white drop-shadow-md">
              {currentHero.title}
            </h1>

            <p className="font-sans text-xs sm:text-base text-gray-200 line-clamp-2 leading-relaxed font-normal">
              {currentHero.excerpt}
            </p>

            <div className="pt-1 sm:pt-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (currentHero?.onClick) {
                    currentHero.onClick();
                  }
                }}
                className="px-6 sm:px-8 py-3 sm:py-3.5 bg-white hover:bg-[#f6f3f2] text-[#1c1b1b] font-sans text-xs font-bold uppercase tracking-widest rounded-full transition-all shadow-lg hover:scale-105 cursor-pointer flex items-center gap-2"
              >
                <span>{currentHero.buttonText || 'Saiba mais'}</span>
                <ArrowRight className="w-4 h-4 text-[#785600]" />
              </button>
            </div>
          </div>

          {/* Navigation Arrows (visíveis no mobile com opacidade suave e no desktop ao passar o mouse) */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              prevHeroSlide();
            }}
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-10 sm:w-11 h-10 sm:h-11 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-xs flex items-center justify-center transition-all opacity-80 sm:opacity-0 sm:group-hover:opacity-100 cursor-pointer z-20 shadow-md"
            title="Anterior"
            aria-label="Slide anterior"
          >
            <ChevronLeft className="w-5 sm:w-6 h-5 sm:h-6" />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              nextHeroSlide();
            }}
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-10 sm:w-11 h-10 sm:h-11 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-xs flex items-center justify-center transition-all opacity-80 sm:opacity-0 sm:group-hover:opacity-100 cursor-pointer z-20 shadow-md"
            title="Próximo"
            aria-label="Próximo slide"
          >
            <ChevronRight className="w-5 sm:w-6 h-5 sm:h-6" />
          </button>

          {/* Carousel Dots */}
          <div className="absolute bottom-4 sm:bottom-5 right-4 sm:right-8 flex items-center gap-1.5 sm:gap-2 z-20">
            {effectiveSlides.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  goToHeroSlide(idx);
                }}
                className={`transition-all rounded-full cursor-pointer ${
                  currentHeroIndex === idx
                    ? 'w-6 h-2 sm:h-2.5 bg-white shadow-xs'
                    : 'w-2 sm:w-2.5 h-2 sm:h-2.5 bg-white/50 hover:bg-white/80'
                }`}
                aria-label={`Ir para slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          2. SEÇÃO DUPLA: LEITURA RECOMENDADA & MAIS LIDAS (Ref. Padre Paulo Ricardo)
      ========================================================================= */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column: ⁝ Leitura recomendada */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center gap-2 border-b border-[#d3c4af]/50 pb-3">
              <span className="text-[#e65100] font-bold text-lg">⁝</span>
              <h2 className="font-display text-2xl font-bold text-[#1c1b1b]">
                Leitura recomendada
              </h2>
            </div>

            {/* Stacked Horizontal Cards */}
            <div className="space-y-4">
              {articles.slice(0, 3).map((essay) => (
                <div
                  key={essay.id}
                  onClick={() => onSelectEssay(essay)}
                  className="bg-white rounded-2xl border border-[#d3c4af]/60 p-4 sm:p-5 flex flex-col sm:flex-row gap-5 hover:border-[#785600] hover:shadow-md transition-all cursor-pointer group"
                >
                  {/* Square Sacred Art Image */}
                  <div className="w-full sm:w-44 h-36 rounded-xl overflow-hidden shrink-0 bg-[#f6f3f2]">
                    <img
                      src={essay.imageUrl}
                      alt={essay.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 flex flex-col justify-between space-y-2">
                    <div>
                      <span className="inline-block px-2.5 py-0.5 bg-[#fff3e0] text-[#e65100] border border-[#ffe0b2] text-[10px] font-bold uppercase tracking-wider rounded-md mb-1.5">
                        {essay.category}
                      </span>
                      <h3 className="font-display text-base sm:text-lg font-bold text-[#1c1b1b] leading-snug group-hover:text-[#785600] transition-colors">
                        {essay.title}
                      </h3>
                      <p className="font-sans text-xs text-[#4f4535] mt-1 line-clamp-2 leading-relaxed">
                        {essay.excerpt}
                      </p>
                    </div>

                    <div className="pt-1">
                      <span className="text-[#c2410c] text-xs font-bold flex items-center gap-1 group-hover:underline">
                        Ler leitura →
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: ⁝ Mais lidas do mês */}
          <div className="lg:col-span-5 space-y-6">
            <div className="flex items-center gap-2 border-b border-[#d3c4af]/50 pb-3">
              <span className="text-[#e65100] font-bold text-lg">⁝</span>
              <h2 className="font-display text-2xl font-bold text-[#1c1b1b]">
                Mais lidas do mês
              </h2>
            </div>

            {/* Featured Hero Article */}
            {articles[0] && (
              <div
                onClick={() => onSelectEssay(articles[0])}
                className="bg-white rounded-2xl border border-[#d3c4af]/60 overflow-hidden hover:border-[#785600] hover:shadow-md transition-all cursor-pointer group space-y-4"
              >
                <div className="h-52 bg-gray-200 overflow-hidden relative">
                  <img
                    src={articles[0].imageUrl}
                    alt={articles[0].title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>

                <div className="p-5 pt-0 space-y-2">
                  <h3 className="font-display text-lg sm:text-xl font-bold text-[#1c1b1b] leading-snug group-hover:text-[#785600] transition-colors">
                    {articles[0].title}
                  </h3>
                  <p className="font-sans text-xs text-[#4f4535] line-clamp-3 leading-relaxed">
                    {articles[0].excerpt}
                  </p>
                  <span className="text-[#c2410c] text-xs font-bold inline-block pt-1 group-hover:underline">
                    Ler leitura →
                  </span>
                </div>
              </div>
            )}

            {/* List of Other Top Reads */}
            <div className="bg-white rounded-2xl border border-[#d3c4af]/50 p-4 divide-y divide-[#d3c4af]/30">
              {articles.slice(1, 4).map((essay, i) => (
                <div
                  key={essay.id}
                  onClick={() => onSelectEssay(essay)}
                  className="py-3 first:pt-0 last:pb-0 flex items-start gap-3 cursor-pointer group"
                >
                  <span className="font-display text-lg font-bold text-[#785600] shrink-0">
                    0{i + 2}.
                  </span>
                  <div>
                    <h4 className="font-display text-xs sm:text-sm font-bold text-[#1c1b1b] group-hover:text-[#785600] leading-snug">
                      {essay.title}
                    </h4>
                    <span className="text-[11px] text-[#817563]">{essay.author}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          3. SEÇÃO DE ORAÇÕES CATÓLICAS COM CARDS SACROS (Ref. Imagens 3 e 4)
      ========================================================================= */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-[#d3c4af]/50 pb-4">
          <div>
            <span className="text-[#785600] font-sans text-xs font-bold uppercase tracking-widest block mb-1">
              Tesouro da Tradição
            </span>
            <h2 className="font-display text-3xl font-bold text-[#1c1b1b]">
              Orações Católicas Tradicionais
            </h2>
          </div>

          <button
            onClick={() => setActiveView('oracoes')}
            className="px-5 py-2.5 bg-[#f6f3f2] hover:bg-[#e8e2de] border border-[#d3c4af] text-[#785600] font-sans text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
          >
            Ver Acervo Completo →
          </button>
        </div>

        {/* 4 Vertical Sacred Art Cards (Ref. Image 3) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {classicPrayers.map((prayer) => (
            <div
              key={prayer.id}
              onClick={prayer.action}
              className="relative h-[380px] rounded-2xl overflow-hidden shadow-md group cursor-pointer border border-[#d3c4af]/60"
            >
              {/* Background Art */}
              <img
                src={prayer.imageUrl}
                alt={prayer.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              {/* Dark Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

              {/* Top Tag */}
              <span className="absolute top-4 left-4 bg-[#c89224] text-white text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded shadow-sm">
                {prayer.category}
              </span>

              {/* Bottom White Inscription Box */}
              <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-xs p-3.5 rounded-xl border border-white/40 shadow-lg">
                <h3 className="font-serif text-xs font-bold text-[#1c1b1b] leading-snug line-clamp-3">
                  {prayer.title}
                </h3>
              </div>
            </div>
          ))}
        </div>

        {/* 4 Devotion Sacred Categories (Ref. Image 4) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
          {devotionCategories.map((cat, i) => (
            <div
              key={i}
              onClick={() => setActiveView('oracoes')}
              className="relative h-72 rounded-2xl overflow-hidden shadow-md group cursor-pointer border border-[#d3c4af]/60 flex flex-col justify-end p-5"
            >
              <img
                src={cat.imageUrl}
                alt={cat.title}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />
              
              <h3 className="relative z-10 font-serif text-sm sm:text-base font-bold text-[#f7bd48] text-center tracking-wider leading-snug drop-shadow-md">
                {cat.title}
              </h3>
            </div>
          ))}
        </div>
      </section>

      {/* =========================================================================
          4. SEÇÃO DA LOJA CATÓLICA & SACRAMENTAIS
      ========================================================================= */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-[#d3c4af]/50 pb-4">
          <div>
            <span className="text-[#785600] font-sans text-xs font-bold uppercase tracking-widest block mb-1">
              Curadoria Católica
            </span>
            <h2 className="font-display text-3xl font-bold text-[#1c1b1b]">
              Livros Raros, Arte Sacra & Sacramentais
            </h2>
          </div>

          <button
            onClick={() => setActiveView('loja')}
            className="px-5 py-2.5 bg-[#785600] hover:bg-[#9a7000] text-white font-sans text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-sm cursor-pointer flex items-center gap-1.5"
          >
            <ShoppingBag className="w-4 h-4" /> Ver Loja Completa →
          </button>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.slice(0, 4).map((product) => (
            <div
              key={product.id}
              onClick={() => setActiveView('loja')}
              className="bg-white rounded-2xl border border-[#d3c4af]/70 overflow-hidden shadow-xs hover:shadow-md hover:border-[#785600] transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="h-48 bg-[#f6f3f2] overflow-hidden relative">
                  <img
                    src={product.imageUrl}
                    alt={product.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className="absolute top-3 right-3 bg-white/90 backdrop-blur-xs text-[#785600] font-sans text-[10px] font-bold uppercase px-2.5 py-1 rounded-full shadow-xs">
                    {product.category}
                  </span>
                </div>

                <div className="p-4 space-y-1">
                  <h3 className="font-display text-sm font-bold text-[#1c1b1b] group-hover:text-[#785600] transition-colors line-clamp-1">
                    {product.title}
                  </h3>
                  <p className="font-sans text-xs text-[#817563] line-clamp-2">
                    {product.subtitle}
                  </p>
                </div>
              </div>

              <div className="p-4 pt-0 border-t border-[#d3c4af]/30 flex items-center justify-between mt-2">
                <span className="font-display text-base font-bold text-[#785600]">
                  R$ {product.price.toFixed(2).replace('.', ',')}
                </span>
                <span className="text-xs font-bold text-[#785600] group-hover:underline flex items-center gap-1">
                  Comprar →
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* =========================================================================
          5. LITURGIA DIÁRIA & SANTO DO DIA
      ========================================================================= */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-[#1c1b1b] via-[#2a2215] to-[#785600] text-white rounded-3xl p-8 sm:p-12 shadow-xl flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
          <div className="space-y-3 max-w-2xl">
            <span className="inline-block px-3 py-1 bg-[#f7bd48] text-[#1c1b1b] font-sans text-xs font-bold tracking-widest uppercase rounded-full">
              Liturgia de Hoje • {TODAY_LITURGY_MOCK.date}
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight">
              {TODAY_LITURGY_MOCK.fullDateStr}
            </h2>
            <p className="font-sans text-sm text-amber-100/90 leading-relaxed italic">
              "{TODAY_LITURGY_MOCK.gospel.acclamation}"
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <button
              onClick={() => setActiveView('liturgia')}
              className="px-6 py-3.5 bg-[#f7bd48] hover:bg-[#ffcd66] text-[#1c1b1b] font-sans text-xs font-bold uppercase tracking-widest rounded-xl transition-all shadow-md cursor-pointer flex items-center gap-2"
            >
              <BookOpen className="w-4 h-4" /> Ler Leituras do Dia
            </button>
            <button
              onClick={() => setActiveView('santoral')}
              className="px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white font-sans text-xs font-bold uppercase tracking-widest rounded-xl transition-all cursor-pointer"
            >
              Santo do Dia
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
