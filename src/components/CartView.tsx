import React from 'react';
import { X, ShoppingBag, Plus, Minus, Trash2, ArrowLeft, ShoppingCart, ExternalLink } from 'lucide-react';
import { Product } from '../types';
import { openSafeExternalUrl, isSafeHttpUrl } from '../lib/security';

interface CartViewProps {
  cart: { product: Product; quantity: number }[];
  onRemoveFromCart: (productId: string) => void;
  onUpdateQuantity: (productId: string, delta: number) => void;
  onClose: () => void;
  onGoToShop: () => void;
  user?: any;
  onOpenAuth: (tab?: 'signup' | 'login') => void;
}

export const CartView: React.FC<CartViewProps> = ({
  cart,
  onRemoveFromCart,
  onUpdateQuantity,
  onClose,
  onGoToShop,
}) => {
  const total = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleBuyItem = (product: Product) => {
    if (product.buyUrl && isSafeHttpUrl(product.buyUrl)) {
      openSafeExternalUrl(product.buyUrl);
    } else if (product.buyUrl) {
      alert('O link de compra deste item é inválido ou não possui protocolo seguro (HTTPS).');
    } else {
      alert(`O link de compra para "${product.title}" estará disponível em breve no parceiro oficial.`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex animate-fade-in">
      {/* Backdrop */}
      <div
        className="flex-1 bg-black/50 backdrop-blur-xs"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="w-full max-w-md bg-[#fcf9f8] h-full flex flex-col shadow-2xl animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#d3c4af]/50 bg-white">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-[#785600]" />
            <h2 className="font-display text-xl font-bold text-[#1c1b1b]">
              Meu Carrinho
            </h2>
            {itemCount > 0 && (
              <span className="bg-[#785600] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                {itemCount} {itemCount === 1 ? 'item' : 'itens'}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#817563] hover:text-[#1c1b1b] rounded-full hover:bg-[#f0eded] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-20 text-center">
              <ShoppingBag className="w-16 h-16 text-[#d3c4af] mb-4" />
              <h3 className="font-display text-xl font-bold text-[#4f4535] mb-2">
                Seu carrinho está vazio
              </h3>
              <p className="font-sans text-sm text-[#817563] mb-6 leading-relaxed">
                Explore nossa curadoria de livros e sacramentais para a sua vida de oração.
              </p>
              <button
                onClick={onGoToShop}
                className="px-6 py-2.5 bg-[#785600] hover:bg-[#9a7000] text-white font-sans text-xs font-bold uppercase tracking-widest rounded-xl transition-colors cursor-pointer flex items-center gap-2 shadow-xs"
              >
                <ShoppingBag className="w-4 h-4" /> Ver Loja
              </button>
            </div>
          ) : (
            cart.map(({ product, quantity }) => (
              <div
                key={product.id}
                className="flex flex-col bg-white rounded-2xl p-4 border border-[#d3c4af]/50 shadow-xs space-y-3"
              >
                <div className="flex gap-4">
                  {/* Product Image */}
                  <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-[#f6f3f2] border border-[#d3c4af]/30">
                    <img
                      src={product.imageUrl}
                      alt={product.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#785600]">
                      {product.category}
                    </span>
                    <h4 className="font-display text-sm font-bold text-[#1c1b1b] leading-snug truncate">
                      {product.title}
                    </h4>
                    <p className="font-sans text-xs text-[#817563] truncate">{product.subtitle}</p>

                    <div className="flex items-center justify-between mt-2">
                      {/* Qty controls */}
                      <div className="flex items-center gap-1 bg-[#f6f3f2] rounded-lg p-0.5">
                        <button
                          onClick={() => onUpdateQuantity(product.id, -1)}
                          className="w-6 h-6 flex items-center justify-center rounded text-[#4f4535] hover:bg-[#785600] hover:text-white transition-colors cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="font-sans text-xs font-bold text-[#1c1b1b] w-5 text-center">
                          {quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(product.id, +1)}
                          className="w-6 h-6 flex items-center justify-center rounded text-[#4f4535] hover:bg-[#785600] hover:text-white transition-colors cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="font-display text-sm font-bold text-[#785600]">
                          R$ {(product.price * quantity).toFixed(2).replace('.', ',')}
                        </span>
                        <button
                          onClick={() => onRemoveFromCart(product.id)}
                          className="p-1 text-[#d3c4af] hover:text-red-500 transition-colors cursor-pointer"
                          title="Remover item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Direct Buy Button for this specific item */}
                <button
                  type="button"
                  onClick={() => handleBuyItem(product)}
                  className="w-full py-2.5 px-4 bg-[#785600] hover:bg-[#9a7000] text-white font-sans text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01]"
                  title={product.buyUrl ? 'Comprar no Mercado Livre / Shopee' : 'Comprar no Parceiro'}
                >
                  <ExternalLink className="w-4 h-4 text-amber-300" />
                  <span>Comprar no Parceiro Oficial</span>
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer — Total */}
        {cart.length > 0 && (
          <div className="px-6 py-5 border-t border-[#d3c4af]/50 bg-white space-y-3">
            {/* Subtotal */}
            <div className="flex justify-between items-center">
              <span className="font-sans text-sm text-[#4f4535]">Subtotal ({itemCount} {itemCount === 1 ? 'item' : 'itens'})</span>
              <span className="font-display text-2xl font-bold text-[#785600]">
                R$ {total.toFixed(2).replace('.', ',')}
              </span>
            </div>

            <p className="font-sans text-[11px] text-[#817563] text-center leading-relaxed">
              💡 Clique no botão <strong>"Comprar no Parceiro Oficial"</strong> de cada produto para concluir o pedido diretamente no Mercado Livre, Shopee ou livraria oficial.
            </p>

            {/* Continue Shopping */}
            <button
              onClick={onClose}
              className="w-full py-3 border-2 border-[#785600] text-[#785600] hover:bg-[#785600] hover:text-white font-sans text-xs font-bold uppercase tracking-widest rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-xs"
            >
              <ArrowLeft className="w-4 h-4" /> Continuar Comprando
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
