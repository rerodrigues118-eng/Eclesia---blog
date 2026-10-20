import React, { useState, useEffect } from 'react';
import { ShoppingBag, Star, ArrowRight, ShieldCheck, BookOpen, ExternalLink, Loader2 } from 'lucide-react';
import { Product } from '../types';
import { fetchActiveStoreProducts } from '../services/dbService';
import { openSafeExternalUrl } from '../lib/security';

interface AffiliateProductSectionProps {
  title?: string;
  subtitle?: string;
  onGoToShop?: () => void;
  onAddToCart?: (product: Product) => void;
}

export const AffiliateProductSection: React.FC<AffiliateProductSectionProps> = ({
  title = 'Livraria & Artigos Católicos Recomendados',
  subtitle = 'Aprofunde sua vida de oração com as obras essenciais da tradição católica e sacramentais abençoados.',
  onGoToShop,
  onAddToCart
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadStoreProducts() {
      try {
        setLoading(true);
        const data = await fetchActiveStoreProducts(4);
        if (isMounted) {
          setProducts(data || []);
        }
      } catch (err) {
        console.error('[AffiliateProductSection] Erro ao carregar produtos da Loja:', err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }
    loadStoreProducts();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleProductAction = (item: Product) => {
    // Se o produto possui link direto de afiliado / marketplace
    if (item.buyUrl && (item.buyUrl.startsWith('http://') || item.buyUrl.startsWith('https://'))) {
      openSafeExternalUrl(item.buyUrl);
      return;
    }

    if (onAddToCart) {
      onAddToCart(item);
    } else if (onGoToShop) {
      onGoToShop();
    } else {
      // Redirecionamento padrão para a página da loja
      window.location.href = '/loja';
    }
  };

  const handleGoToShop = () => {
    if (onGoToShop) {
      onGoToShop();
    } else {
      window.location.href = '/loja';
    }
  };

  // Se não estiver carregando e não houver nenhum produto cadastrado na tabela products
  if (!loading && products.length === 0) {
    return null;
  }

  return (
    <section className="my-12 sm:my-16 p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-[#fbf8f5] to-[#f4ede4] dark:from-zinc-900/90 dark:to-zinc-950/90 border border-[#d3c4af]/70 dark:border-zinc-800 shadow-sm transition-colors duration-200">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[#d3c4af]/50 dark:border-zinc-800">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest font-bold text-[#785600] dark:text-amber-400">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Loja & Livraria Eclesia</span>
          </div>
          <h3 className="font-display text-2xl sm:text-3xl font-bold text-[#1c1b1b] dark:text-[#F9FAFB]">
            {title}
          </h3>
          <p className="font-sans text-xs sm:text-sm text-[#4f4535] dark:text-zinc-300 max-w-2xl leading-relaxed">
            {subtitle}
          </p>
        </div>

        <button
          onClick={handleGoToShop}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#785600] dark:text-amber-400 hover:underline cursor-pointer shrink-0 py-1 transition-colors"
        >
          <span>Ver Catálogo Completo na Loja</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Loading Skeleton */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-6">
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className="bg-white dark:bg-zinc-800/80 rounded-2xl border border-[#d3c4af]/40 dark:border-zinc-700/60 overflow-hidden p-4 space-y-3 animate-pulse"
            >
              <div className="aspect-4/3 w-full bg-zinc-200 dark:bg-zinc-700 rounded-xl" />
              <div className="h-3 bg-zinc-200 dark:bg-zinc-700 rounded w-1/3" />
              <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-4/5" />
              <div className="h-3 bg-zinc-200 dark:bg-zinc-700 rounded w-full" />
              <div className="h-8 bg-zinc-200 dark:bg-zinc-700 rounded-xl mt-4" />
            </div>
          ))}
        </div>
      ) : (
        /* Product Cards Grid - 100% Dinâmicos do Supabase */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-6">
          {products.map((prod) => (
            <div
              key={prod.id}
              className="flex flex-col justify-between bg-white dark:bg-zinc-800/90 rounded-2xl border border-[#d3c4af]/60 dark:border-zinc-700 overflow-hidden shadow-xs hover:shadow-md hover:border-[#785600] dark:hover:border-amber-500/70 transition-all duration-200 group"
            >
              <div>
                {/* Product Image */}
                <div className="relative aspect-4/3 w-full bg-[#f0eded] dark:bg-zinc-900 overflow-hidden">
                  <img
                    src={prod.imageUrl}
                    alt={prod.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  {prod.category && (
                    <span className="absolute top-2 left-2 bg-[#785600] dark:bg-amber-600 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shadow-xs">
                      {prod.category}
                    </span>
                  )}
                  {prod.buyUrl && (
                    <span className="absolute top-2 right-2 bg-amber-500 text-zinc-950 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shadow-xs">
                      Compra Direta
                    </span>
                  )}
                </div>

                {/* Product Info */}
                <div className="p-4 space-y-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-[#817563] dark:text-zinc-400 block">
                    {prod.subtitle || prod.category || 'Curadoria Eclesia'}
                  </span>

                  <h4 className="font-serif font-bold text-sm text-[#1c1b1b] dark:text-zinc-100 line-clamp-2 leading-snug group-hover:text-[#785600] dark:group-hover:text-amber-300 transition-colors">
                    {prod.title}
                  </h4>

                  <p className="font-sans text-xs text-[#4f4535] dark:text-zinc-300 line-clamp-2 leading-relaxed">
                    {prod.description}
                  </p>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="p-4 pt-0 space-y-3">
                <div className="flex items-center justify-between pt-2 border-t border-[#d3c4af]/40 dark:border-zinc-700/60">
                  <div className="text-base font-bold text-[#785600] dark:text-amber-300">
                    R$ {prod.price.toFixed(2).replace('.', ',')}
                  </div>
                  <div className="flex items-center text-amber-500 text-xs">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span className="ml-1 text-[11px] font-bold text-[#4f4535] dark:text-zinc-300">5.0</span>
                  </div>
                </div>

                <button
                  onClick={() => handleProductAction(prod)}
                  className="w-full py-2.5 px-3 rounded-xl bg-[#785600] hover:bg-[#5f4400] dark:bg-amber-600 dark:hover:bg-amber-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>{prod.buyUrl ? 'Adquirir na Loja' : 'Ver na Loja'}</span>
                  {prod.buyUrl && <ExternalLink className="w-3 h-3 ml-0.5 opacity-80" />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Trust Banner */}
      <div className="mt-6 pt-4 border-t border-[#d3c4af]/40 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-3 text-[11px] text-[#817563] dark:text-zinc-400">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-[#785600] dark:text-amber-400" />
          <span>Curadoria de fidelidade ao Magistério e à Tradição da Igreja</span>
        </div>
        <span>Cada aquisição apoia diretamente a manutenção do apostolado Eclesia.</span>
      </div>
    </section>
  );
};
