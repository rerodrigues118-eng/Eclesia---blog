import React, { useState } from 'react';
import { ShoppingBag, Plus, Minus, Trash2, Check, X, ArrowRight } from 'lucide-react';
import { Product } from '../types';
import { PRODUCTS_DATA } from '../data/eclesiaData';

interface LojaViewProps {
  cart: { product: Product; quantity: number }[];
  onAddToCart: (product: Product) => void;
  onRemoveFromCart: (productId: string) => void;
  onUpdateQuantity: (productId: string, delta: number) => void;
}

export const LojaView: React.FC<LojaViewProps> = ({
  cart,
  onAddToCart,
  onRemoveFromCart,
  onUpdateQuantity
}) => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);

  const totalCartPrice = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const handleCheckout = () => {
    setCheckoutSuccess(true);
    setTimeout(() => {
      setCheckoutSuccess(false);
      setIsCartOpen(false);
    }, 4000);
  };

  return (
    <div className="w-full max-w-[1120px] mx-auto px-4 md:px-12 py-12 space-y-12">
      {/* Header */}
      <section className="flex flex-col items-center text-center max-w-2xl mx-auto gap-4">
        <span className="bg-[#6E1E1E] text-white font-sans text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest">
          Loja Eclesia
        </span>
        <h1 className="font-display text-4xl md:text-5xl font-bold text-[#785600]">
          Curadoria de Arte & Devoção
        </h1>
        <p className="font-sans text-base text-[#4f4535] leading-relaxed">
          Edições de luxo, crucifixos em latão e ornamentos sacros selecionados para aprofundar sua vida de oração.
        </p>
      </section>

      {/* Products Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {PRODUCTS_DATA.map((product) => (
          <article
            key={product.id}
            className="bg-white rounded border border-[#d3c4af]/60 overflow-hidden flex flex-col justify-between group hover:border-[#785600] hover:shadow-md transition-all"
          >
            <div>
              <div
                onClick={() => setSelectedProduct(product)}
                className="aspect-[4/3] p-2 bg-[#fcf9f8] relative cursor-pointer overflow-hidden"
              >
                <img
                  src={product.imageUrl}
                  alt={product.title}
                  className="w-full h-full object-cover rounded transition-transform duration-500 group-hover:scale-103"
                />
              </div>
              <div className="p-6 space-y-2">
                <span className="font-sans text-[10px] font-bold text-[#785600] uppercase tracking-widest block">
                  {product.category}
                </span>
                <h3
                  onClick={() => setSelectedProduct(product)}
                  className="font-display text-2xl font-bold text-[#1c1b1b] cursor-pointer hover:text-[#785600] transition-colors"
                >
                  {product.title}
                </h3>
                <p className="font-sans text-xs text-[#817563] font-medium">{product.subtitle}</p>
                <p className="font-sans text-sm text-[#4f4535] line-clamp-3 leading-relaxed mt-2">
                  {product.description}
                </p>
              </div>
            </div>

            <div className="p-6 pt-0 flex items-center justify-between border-t border-[#d3c4af]/30 mt-4">
              <div>
                <span className="font-sans text-xs text-[#817563] block">Preço</span>
                <span className="font-display text-2xl font-bold text-[#785600]">
                  R$ {product.price.toFixed(2)}
                </span>
              </div>
              <button
                onClick={() => onAddToCart(product)}
                className="px-4 py-2 bg-[#1c1b1b] text-white font-sans text-xs font-bold uppercase tracking-widest rounded hover:bg-[#785600] transition-colors flex items-center gap-1.5"
              >
                <ShoppingBag className="w-3.5 h-3.5" /> Adicionar
              </button>
            </div>
          </article>
        ))}
      </section>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 md:p-8 relative border border-[#d3c4af] grid grid-cols-1 md:grid-cols-2 gap-6">
            <button
              onClick={() => setSelectedProduct(null)}
              className="absolute top-4 right-4 p-1 text-[#817563] hover:text-black rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="aspect-square bg-[#fcf9f8] p-2 rounded border border-[#d3c4af]/50">
              <img
                src={selectedProduct.imageUrl}
                alt={selectedProduct.title}
                className="w-full h-full object-cover rounded"
              />
            </div>

            <div className="flex flex-col justify-between space-y-4">
              <div>
                <span className="font-sans text-xs font-bold text-[#785600] uppercase tracking-widest block mb-1">
                  {selectedProduct.category}
                </span>
                <h3 className="font-display text-3xl font-bold text-[#1c1b1b]">{selectedProduct.title}</h3>
                <p className="font-sans text-sm text-[#817563] font-medium mb-4">{selectedProduct.subtitle}</p>
                <p className="font-sans text-sm text-[#4f4535] leading-relaxed">{selectedProduct.description}</p>
              </div>

              <div className="pt-4 border-t border-[#d3c4af]/40 space-y-3">
                <div className="font-display text-3xl font-bold text-[#785600]">
                  R$ {selectedProduct.price.toFixed(2)}
                </div>
                <button
                  onClick={() => {
                    onAddToCart(selectedProduct);
                    setSelectedProduct(null);
                  }}
                  className="w-full py-3 bg-[#785600] text-white font-sans text-xs font-bold uppercase tracking-widest rounded hover:bg-[#9a6f00] transition-colors flex items-center justify-center gap-2"
                >
                  <ShoppingBag className="w-4 h-4" /> Adicionar ao Carrinho
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
