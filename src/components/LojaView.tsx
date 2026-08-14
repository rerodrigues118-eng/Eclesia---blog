import React, { useState } from 'react';
import { ShoppingBag, ArrowLeft, Check, Package, Star, ArrowRight, Lock, UserPlus } from 'lucide-react';
import { Product } from '../types';
import { PRODUCTS_DATA } from '../data/eclesiaData';

interface LojaViewProps {
  cart: { product: Product; quantity: number }[];
  onAddToCart: (product: Product) => void;
  onRemoveFromCart: (productId: string) => void;
  onUpdateQuantity: (productId: string, delta: number) => void;
  products?: Product[];
  user?: any;
  onOpenAuth: (tab?: 'signup' | 'login') => void;
}

// ── Category badge colors ──
const CATEGORY_COLORS: Record<string, string> = {
  livro: 'bg-[#785600]',
  sacramental: 'bg-[#9a3e3c]',
  arte: 'bg-[#2d6a4f]',
  vestuário: 'bg-[#4a3728]',
};

// ── Product Detail Page ───────────────────────────────────────────────
const ProductDetail: React.FC<{
  product: Product;
  cart: { product: Product; quantity: number }[];
  onAddToCart: (p: Product) => void;
  onBack: () => void;
  allProducts: Product[];
  user?: any;
  onOpenAuth: (tab?: 'signup' | 'login') => void;
}> = ({ product, cart, onAddToCart, onBack, allProducts, user, onOpenAuth }) => {
  const [added, setAdded] = useState(false);
  const cartItem = cart.find((i) => i.product.id === product.id);
  const related = allProducts.filter((p) => p.id !== product.id).slice(0, 2);

  const handleAdd = () => {
    if (!user) {
      onOpenAuth('signup');
      return;
    }
    onAddToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20 space-y-10">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-[#785600] hover:text-[#9a7000] font-sans text-xs font-bold uppercase tracking-wider cursor-pointer transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Voltar à Loja
      </button>

      {/* Main Product Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 bg-white rounded-3xl border border-[#d3c4af]/60 p-6 md:p-10 shadow-sm">
        {/* Image */}
        <div className="aspect-square bg-[#fcf9f8] rounded-2xl overflow-hidden border border-[#d3c4af]/40 flex items-center justify-center p-4">
          <img
            src={product.imageUrl}
            alt={product.title}
            className="w-full h-full object-cover rounded-xl"
          />
        </div>

        {/* Info */}
        <div className="flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <span className={`inline-block px-3 py-1 ${CATEGORY_COLORS[product.category] ?? 'bg-[#785600]'} text-white text-[10px] font-bold uppercase tracking-widest rounded-full`}>
              {product.category}
            </span>

            <h1 className="font-display text-3xl md:text-4xl font-bold text-[#1c1b1b] leading-tight">
              {product.title}
            </h1>
            <p className="font-sans text-sm text-[#817563] font-medium">{product.subtitle}</p>

            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-[#f7bd48] text-[#f7bd48]" />
              ))}
              <span className="font-sans text-xs text-[#817563] ml-1">(Produto de curadoria)</span>
            </div>

            <p className="font-sans text-sm text-[#4f4535] leading-relaxed">{product.description}</p>

            <div className="flex items-center gap-2 text-xs text-[#4f4535]">
              <Package className="w-4 h-4 text-[#785600]" />
              <span className="font-semibold">{product.inStock ? 'Em estoque — envio em até 3 dias úteis' : 'Sob encomenda'}</span>
            </div>
          </div>

          <div className="space-y-4 border-t border-[#d3c4af]/40 pt-6">
            <div className="flex items-end gap-3">
              <span className="font-display text-4xl font-bold text-[#785600]">
                R$ {product.price.toFixed(2).replace('.', ',')}
              </span>
              <span className="font-sans text-xs text-[#817563] mb-1">à vista</span>
            </div>

            {cartItem && (
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2">
                <Check className="w-4 h-4" /> {cartItem.quantity}x já no seu carrinho
              </div>
            )}

            {!user && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-[#785600] flex items-center gap-2">
                <Lock className="w-4 h-4 shrink-0" />
                <span>Crie uma conta gratuita ou entre para adicionar itens ao carrinho.</span>
              </div>
            )}

            {/* Actions: Comprar button + Add to Cart Icon Button */}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => {
                  if (product.buyUrl) {
                    window.open(product.buyUrl, '_blank');
                  } else {
                    handleAdd();
                  }
                }}
                className="flex-1 py-4 font-sans text-sm font-bold uppercase tracking-widest rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md bg-[#785600] hover:bg-[#9a7000] text-white hover:scale-[1.01]"
              >
                {product.buyUrl ? (
                  <>Comprar no Marketplace <ArrowRight className="w-4 h-4" /></>
                ) : !user ? (
                  <><UserPlus className="w-4 h-4" /> Criar Conta para Comprar</>
                ) : (
                  <>Comprar Agora</>
                )}
              </button>

              <button
                onClick={handleAdd}
                className={`p-4 rounded-2xl border transition-all cursor-pointer shadow-sm flex items-center justify-center ${
                  added
                    ? 'bg-emerald-600 border-emerald-600 text-white'
                    : 'bg-amber-50 hover:bg-amber-100 border-[#d3c4af] text-[#785600]'
                }`}
                title="Colocar no Carrinho"
              >
                {added ? <Check className="w-5 h-5" /> : <ShoppingBag className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {related.length > 0 && (
        <section className="space-y-4">
          <h2 className="font-display text-2xl font-bold text-[#1c1b1b]">Outros Produtos</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {related.map((p) => (
              <div
                key={p.id}
                onClick={onBack}
                className="flex gap-4 bg-white rounded-2xl border border-[#d3c4af]/50 p-4 cursor-pointer hover:border-[#785600] hover:shadow-sm transition-all group"
              >
                <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-[#f6f3f2]">
                  <img src={p.imageUrl} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="flex flex-col justify-center min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#785600]">{p.category}</span>
                  <h3 className="font-display text-sm font-bold text-[#1c1b1b] line-clamp-1">{p.title}</h3>
                  <p className="font-display text-sm font-bold text-[#785600] mt-1">R$ {p.price.toFixed(2).replace('.', ',')}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-[#d3c4af] shrink-0 self-center group-hover:text-[#785600] transition-colors" />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

// ── Main Store Catalog View ───────────────────────────────────────────
export const LojaView: React.FC<LojaViewProps> = ({
  cart,
  onAddToCart,
  onRemoveFromCart,
  onUpdateQuantity,
  products = PRODUCTS_DATA,
  user,
  onOpenAuth
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [addedMap, setAddedMap] = useState<Record<string, boolean>>({});

  const categories = [
    { id: 'todos', label: 'Todos os Itens' },
    { id: 'livro', label: 'Livros & Manuscritos' },
    { id: 'sacramental', label: 'Sacramentais' },
    { id: 'arte', label: 'Arte Sacra' },
    { id: 'vestuário', label: 'Vestuário Litúrgico' },
  ];

  const filtered = selectedCategory === 'todos'
    ? products
    : products.filter((p) => p.category === selectedCategory);

  const handleAddToCart = (product: Product) => {
    if (!user) {
      onOpenAuth('signup');
      return;
    }
    onAddToCart(product);
    setAddedMap(prev => ({ ...prev, [product.id]: true }));
    setTimeout(() => {
      setAddedMap(prev => ({ ...prev, [product.id]: false }));
    }, 2000);
  };

  const handleBuyProduct = (product: Product) => {
    if (product.buyUrl) {
      window.open(product.buyUrl, '_blank');
    } else {
      handleAddToCart(product);
    }
  };

  if (selectedProduct) {
    return (
      <ProductDetail
        product={selectedProduct}
        cart={cart}
        onAddToCart={onAddToCart}
        onBack={() => setSelectedProduct(null)}
        allProducts={products}
        user={user}
        onOpenAuth={onOpenAuth}
      />
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20 space-y-10 animate-fade-in">
      {/* Header */}
      <div className="border-b border-[#d3c4af]/50 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="font-sans text-xs font-bold text-[#785600] uppercase tracking-widest block mb-1">
            Curadoria Eclesia
          </span>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-[#1c1b1b] tracking-tight">
            Loja & Sacramentais
          </h1>
          <p className="font-sans text-sm md:text-base text-[#4f4535] mt-2 max-w-2xl leading-relaxed">
            Livros de formação espiritual, crucifixos, terços e arte sacra nobre para seu lar e devoção diária.
          </p>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-full font-sans text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-[#785600] text-white shadow-sm'
                  : 'bg-white border border-[#d3c4af]/60 text-[#4f4535] hover:border-[#785600]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Product Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {filtered.map((product) => {
          const isAdded = !!addedMap[product.id];
          const cartItem = cart.find((i) => i.product.id === product.id);

          return (
            <article
              key={product.id}
              className="bg-white rounded-3xl border border-[#d3c4af]/60 overflow-hidden shadow-xs hover:shadow-xl hover:border-[#785600] transition-all duration-300 flex flex-col justify-between group"
            >
              {/* Image Container */}
              <div
                onClick={() => setSelectedProduct(product)}
                className="aspect-[4/3] p-2.5 bg-[#fcf9f8] relative cursor-pointer overflow-hidden"
              >
                <img
                  src={product.imageUrl}
                  alt={product.title}
                  className="w-full h-full object-cover rounded-2xl transition-transform duration-700 group-hover:scale-105"
                />
                {cartItem && (
                  <div className="absolute top-4 left-4 bg-emerald-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                    <Check className="w-3 h-3" /> {cartItem.quantity} no carrinho
                  </div>
                )}
                {product.buyUrl && (
                  <div className="absolute top-4 right-4 bg-amber-500 text-slate-950 text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-sm">
                    Compra Direta
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-6 space-y-1.5">
                <span className="font-sans text-[10px] font-bold text-[#785600] uppercase tracking-widest block">
                  {product.category}
                </span>
                <h3
                  onClick={() => setSelectedProduct(product)}
                  className="font-display text-xl font-bold text-[#1c1b1b] cursor-pointer hover:text-[#785600] transition-colors"
                >
                  {product.title}
                </h3>
                <p className="font-sans text-xs text-[#817563] font-medium">{product.subtitle}</p>
                <p className="font-sans text-xs text-[#4f4535] line-clamp-2 leading-relaxed pt-1">
                  {product.description}
                </p>
              </div>

              {/* Price + Buy Button + Cart Icon Button */}
              <div className="px-6 pb-6 pt-3 flex items-center justify-between border-t border-[#d3c4af]/30 mt-2 gap-3">
                <div>
                  <span className="font-sans text-[10px] text-[#817563] block">Preço</span>
                  <span className="font-display text-2xl font-bold text-[#785600]">
                    R$ {product.price.toFixed(2).replace('.', ',')}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Comprar Button */}
                  <button
                    onClick={() => handleBuyProduct(product)}
                    className="px-4 py-2.5 bg-[#785600] hover:bg-[#9a7000] text-white font-sans text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-sm cursor-pointer hover:scale-105 flex items-center gap-1"
                    title={product.buyUrl ? 'Comprar no Mercado Livre / Shopee' : 'Comprar'}
                  >
                    Comprar
                  </button>

                  {/* Icon to Add to Cart */}
                  <button
                    onClick={() => handleAddToCart(product)}
                    className={`p-2.5 rounded-xl border transition-all cursor-pointer shadow-xs flex items-center justify-center ${
                      isAdded
                        ? 'bg-emerald-600 border-emerald-600 text-white scale-95'
                        : 'bg-amber-50 hover:bg-amber-100 border-[#d3c4af] text-[#785600]'
                    }`}
                    title="Adicionar ao Carrinho"
                  >
                    {isAdded ? <Check className="w-4 h-4" /> : <ShoppingBag className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </section>
    </div>
  );
};
