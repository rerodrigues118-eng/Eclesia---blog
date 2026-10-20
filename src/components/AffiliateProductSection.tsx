import React from 'react';
import { ShoppingBag, Star, ExternalLink, ArrowRight, ShieldCheck, BookOpen } from 'lucide-react';
import { Product } from '../types';

interface AffiliateProduct {
  id: string;
  title: string;
  category: 'livro' | 'artigo_sacro' | 'devocional';
  categoryLabel: string;
  badge?: string;
  imageUrl: string;
  priceFormatted: string;
  rating: number;
  description: string;
  affiliateUrl?: string;
  isShopProduct?: boolean;
}

const FEATURED_PRODUCTS: AffiliateProduct[] = [
  {
    id: 'biblia-sagrada-luxo',
    title: 'Bíblia Sagrada Edição Pastoral com Notas Exegéticas',
    category: 'livro',
    categoryLabel: 'Sagrada Escritura',
    badge: 'Mais Lido',
    imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80',
    priceFormatted: 'R$ 119,90',
    rating: 5,
    description: 'Tradução oficial da Igreja com introduções bíblicas, mapas coloridos, fitas litúrgicas e acabamento nobre.'
  },
  {
    id: 'catecismo-igreja-catolica',
    title: 'Catecismo da Igreja Católica (Edição Típica Vaticana)',
    category: 'livro',
    categoryLabel: 'Doutrina e Magistério',
    badge: 'Essencial',
    imageUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&auto=format&fit=crop&q=80',
    priceFormatted: 'R$ 89,00',
    rating: 5,
    description: 'A exposição sistemática da fé católica, dogmas, sacramentos, mandamentos e da oração cristã promulgada por São João Paulo II.'
  },
  {
    id: 'terco-madeira-sao-bento',
    title: 'Terço Artesanal em Madeira de Oliveira com Medalha de São Bento',
    category: 'artigo_sacro',
    categoryLabel: 'Sacramental',
    badge: 'Devocional',
    imageUrl: 'https://images.unsplash.com/photo-1543373014-cfe4f4bc1cdf?w=600&auto=format&fit=crop&q=80',
    priceFormatted: 'R$ 59,90',
    rating: 5,
    description: 'Contas polidas de oliveira com cordão reforçado de alta durabilidade e crucifixo com a bênção e medalha de São Bento.'
  },
  {
    id: 'tratado-verdadeira-devocao',
    title: 'Tratado da Verdadeira Devoção à Santíssima Virgem',
    category: 'livro',
    categoryLabel: 'Espiritualidade Mariana',
    badge: 'Clássico Sacro',
    imageUrl: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&auto=format&fit=crop&q=80',
    priceFormatted: 'R$ 49,90',
    rating: 5,
    description: 'A célebre consagração como escravo de amor a Jesus por Maria de São Luís Maria Grignion de Montfort.'
  }
];

interface AffiliateProductSectionProps {
  title?: string;
  subtitle?: string;
  onGoToShop?: () => void;
  onAddToCart?: (product: Product) => void;
}

export const AffiliateProductSection: React.FC<AffiliateProductSectionProps> = ({
  title = 'Recomendações Católicas para seu Crescimento Espiritual',
  subtitle = 'Livros de formação sólida, Bíblias sagradas e sacramentais cuidadosamente selecionados pela redação do Eclesia.',
  onGoToShop,
  onAddToCart
}) => {
  const handleProductAction = (item: AffiliateProduct) => {
    if (onAddToCart) {
      const mockProduct: Product = {
        id: item.id,
        title: item.title,
        subtitle: item.categoryLabel,
        price: parseFloat(item.priceFormatted.replace('R$', '').replace(',', '.').trim()) || 79,
        imageUrl: item.imageUrl,
        category: item.category === 'livro' ? 'livro' : 'sacramental',
        description: item.description,
        inStock: true
      };
      onAddToCart(mockProduct);
    } else if (onGoToShop) {
      onGoToShop();
    }
  };

  return (
    <section className="my-12 sm:my-16 p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-[#fbf8f5] to-[#f4ede4] dark:from-[#1c1815] dark:to-[#14110f] border border-[#d3c4af]/70 dark:border-[#383027] shadow-sm animate-fade-in">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[#d3c4af]/50 dark:border-[#332a22]">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest font-bold text-[#785600] dark:text-[#ffdea6]">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Loja & Livraria Eclesia</span>
          </div>
          <h3 className="font-display text-2xl sm:text-3xl font-bold text-[#785600] dark:text-[#f3c877]">
            {title}
          </h3>
          <p className="font-sans text-xs sm:text-sm text-[#4f4535] dark:text-[#c4b9a7] max-w-2xl leading-relaxed">
            {subtitle}
          </p>
        </div>

        {onGoToShop && (
          <button
            onClick={onGoToShop}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#785600] dark:text-[#ffdea6] hover:underline cursor-pointer shrink-0 py-1"
          >
            <span>Ver Catálogo Completo na Loja</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Product Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-6">
        {FEATURED_PRODUCTS.map((prod) => (
          <div
            key={prod.id}
            className="flex flex-col justify-between bg-white dark:bg-[#1f1b17] rounded-2xl border border-[#d3c4af]/60 dark:border-[#383027] overflow-hidden shadow-xs hover:shadow-md hover:border-[#785600]/60 transition-all duration-200 group"
          >
            <div>
              {/* Product Image */}
              <div className="relative aspect-4/3 w-full bg-[#f0eded] dark:bg-[#28221b] overflow-hidden">
                <img
                  src={prod.imageUrl}
                  alt={prod.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
                {prod.badge && (
                  <span className="absolute top-2 left-2 bg-[#785600] text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shadow-xs">
                    {prod.badge}
                  </span>
                )}
              </div>

              {/* Product Info */}
              <div className="p-4 space-y-2">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#817563] dark:text-[#a89d8d] block">
                  {prod.categoryLabel}
                </span>

                <h4 className="font-serif font-bold text-sm text-[#1c1b1b] dark:text-[#f3ede2] line-clamp-2 leading-snug group-hover:text-[#785600] dark:group-hover:text-[#ffdea6] transition-colors">
                  {prod.title}
                </h4>

                <p className="font-sans text-xs text-[#4f4535] dark:text-[#c4b9a7] line-clamp-2 leading-relaxed">
                  {prod.description}
                </p>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="p-4 pt-0 space-y-3">
              <div className="flex items-center justify-between pt-2 border-t border-[#d3c4af]/40 dark:border-[#332a22]">
                <div className="text-base font-bold text-[#785600] dark:text-[#ffdea6]">
                  {prod.priceFormatted}
                </div>
                <div className="flex items-center text-amber-500 text-xs">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span className="ml-1 text-[11px] font-bold text-[#4f4535] dark:text-[#c4b9a7]">5.0</span>
                </div>
              </div>

              <button
                onClick={() => handleProductAction(prod)}
                className="w-full py-2.5 px-3 rounded-xl bg-[#785600] hover:bg-[#5f4400] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Adquirir na Loja</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Trust Banner */}
      <div className="mt-6 pt-4 border-t border-[#d3c4af]/40 dark:border-[#332a22] flex flex-wrap items-center justify-between gap-3 text-[11px] text-[#817563] dark:text-[#a89d8d]">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-[#785600] dark:text-[#ffdea6]" />
          <span>Curadoria de fidelidade ao Magistério e à Tradição da Igreja</span>
        </div>
        <span>Cada aquisição apoia diretamente a manutenção do apostolado Eclesia.</span>
      </div>
    </section>
  );
};
