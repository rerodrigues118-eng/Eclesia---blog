import React, { useState } from 'react';
import { Search, X, Sparkles, BookOpen, ShoppingBag, Church } from 'lucide-react';
import { Saint, Essay, Product, ActiveView } from '../types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSaint: (saint: Saint) => void;
  onSelectEssay: (essay: Essay) => void;
  setActiveView: (view: ActiveView) => void;
  saints?: Saint[];
  articles?: Essay[];
  products?: Product[];
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  onSelectSaint,
  onSelectEssay,
  setActiveView,
  saints = [],
  articles = [],
  products = []
}) => {
  const [query, setQuery] = useState('');

  if (!isOpen) return null;

  const q = query.toLowerCase().trim();

  const matchedSaints = q
    ? saints.filter(
        (s) =>
          (s.name || '').toLowerCase().includes(q) ||
          (s.summary || '').toLowerCase().includes(q) ||
          (s.title || '').toLowerCase().includes(q)
      )
    : [];

  const matchedEssays = q
    ? articles.filter(
        (e) =>
          (e.title || '').toLowerCase().includes(q) ||
          (e.excerpt || '').toLowerCase().includes(q) ||
          (e.category || '').toLowerCase().includes(q)
      )
    : [];

  const matchedProducts = q
    ? products.filter(
        (p) =>
          (p.title || '').toLowerCase().includes(q) ||
          (p.description || '').toLowerCase().includes(q) ||
          (p.subtitle || '').toLowerCase().includes(q)
      )
    : [];

  const totalResults = matchedSaints.length + matchedEssays.length + matchedProducts.length;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-start justify-center pt-20 px-4">
      <div className="bg-white rounded-xl max-w-2xl w-full border border-[#d3c4af] shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        {/* Search Input Bar */}
        <div className="p-4 border-b border-[#d3c4af]/50 flex items-center gap-3 bg-[#fcf9f8]">
          <Search className="w-5 h-5 text-[#817563]" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por santos, ensaios, leituras ou produtos..."
            autoFocus
            className="flex-1 bg-transparent border-none focus:ring-0 font-sans text-sm sm:text-base text-[#1c1b1b] placeholder:text-[#817563]"
          />
          {query && (
            <button onClick={() => setQuery('')} className="p-1 text-[#817563] hover:text-black cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          )}
          <button onClick={onClose} className="px-3 py-1 bg-gray-200 hover:bg-gray-300 font-sans text-xs rounded cursor-pointer">
            Fechar
          </button>
        </div>

        {/* Results List */}
        <div className="overflow-y-auto p-6 space-y-6">
          {!q && (
            <div className="text-center py-8 text-[#817563]">
              <Church className="w-12 h-12 mx-auto mb-2 opacity-50 text-[#785600]" />
              <p className="font-sans text-sm">Digite uma palavra para buscar no portal Eclesia.</p>
            </div>
          )}

          {q && totalResults === 0 && (
            <div className="text-center py-8 text-[#817563]">
              <p className="font-sans text-sm">Nenhum resultado encontrado para "{query}".</p>
            </div>
          )}

          {/* Saints Results */}
          {matchedSaints.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-sans text-xs font-bold text-[#785600] uppercase tracking-widest flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Santos ({matchedSaints.length})
              </h4>
              <div className="space-y-2">
                {matchedSaints.map((saint) => (
                  <div
                    key={saint.id}
                    onClick={() => {
                      onSelectSaint(saint);
                      onClose();
                    }}
                    className="p-3 bg-[#fcf9f8] hover:bg-[#f6f3f2] border border-[#d3c4af]/40 rounded-lg cursor-pointer transition-colors flex items-center gap-3"
                  >
                    <img src={saint.imageUrl} alt={saint.name} className="w-10 h-10 rounded-md object-cover" />
                    <div>
                      <h5 className="font-display font-bold text-[#1c1b1b]">{saint.name}</h5>
                      <p className="font-sans text-xs text-[#817563]">{saint.feastDate}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Essays Results */}
          {matchedEssays.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-sans text-xs font-bold text-[#785600] uppercase tracking-widest flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" /> Artigos & Notícias ({matchedEssays.length})
              </h4>
              <div className="space-y-2">
                {matchedEssays.map((essay) => (
                  <div
                    key={essay.id}
                    onClick={() => {
                      onSelectEssay(essay);
                      onClose();
                    }}
                    className="p-3 bg-[#fcf9f8] hover:bg-[#f6f3f2] border border-[#d3c4af]/40 rounded-lg cursor-pointer transition-colors flex items-center gap-3"
                  >
                    <img src={essay.imageUrl} alt={essay.title} className="w-12 h-9 rounded-md object-cover" />
                    <div>
                      <h5 className="font-display font-bold text-[#1c1b1b]">{essay.title}</h5>
                      <p className="font-sans text-xs text-[#817563]">{essay.category} • {essay.author}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Products Results */}
          {matchedProducts.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-sans text-xs font-bold text-[#785600] uppercase tracking-widest flex items-center gap-1.5">
                <ShoppingBag className="w-3.5 h-3.5" /> Loja ({matchedProducts.length})
              </h4>
              <div className="space-y-2">
                {matchedProducts.map((product) => (
                  <div
                    key={product.id}
                    onClick={() => {
                      setActiveView('loja');
                      onClose();
                    }}
                    className="p-3 bg-[#fcf9f8] hover:bg-[#f6f3f2] border border-[#d3c4af]/40 rounded-lg cursor-pointer transition-colors flex items-center gap-3"
                  >
                    <img src={product.imageUrl} alt={product.title} className="w-10 h-10 rounded-md object-cover" />
                    <div>
                      <h5 className="font-display font-bold text-[#1c1b1b]">{product.title}</h5>
                      <p className="font-sans text-xs text-[#785600] font-bold">R$ {product.price.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
