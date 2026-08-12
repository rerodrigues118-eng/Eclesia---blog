import React, { useState } from 'react';
import { ActiveView, Saint, Essay, Product } from './types';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HomeView } from './components/HomeView';
import { SantoralView } from './components/SantoralView';
import { LiturgiaView } from './components/LiturgiaView';
import { AssinaturasView } from './components/AssinaturasView';
import { LojaView } from './components/LojaView';
import { BlogView } from './components/BlogView';
import { IgrejasView } from './components/IgrejasView';
import { RedeSocialView } from './components/RedeSocialView';
import { EssayDetailView } from './components/EssayDetailView';
import { SaintDetailView } from './components/SaintDetailView';
import { SearchModal } from './components/SearchModal';

export const App: React.FC = () => {
  const [activeView, setActiveView] = useState<ActiveView>('home');
  const [selectedSaint, setSelectedSaint] = useState<Saint | null>(null);
  const [selectedEssay, setSelectedEssay] = useState<Essay | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [cart, setCart] = useState<{ product: Product; quantity: number }[]>([]);

  const handleNavChange = (view: ActiveView) => {
    setSelectedEssay(null);
    setSelectedSaint(null);
    setActiveView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectEssay = (essay: Essay) => {
    setSelectedSaint(null);
    setSelectedEssay(essay);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectSaint = (saint: Saint) => {
    setSelectedEssay(null);
    setSelectedSaint(saint);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleUpdateQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as { product: Product; quantity: number }[]
    );
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen flex flex-col bg-[#fcf9f8] text-[#1c1b1b]">
      {/* Navigation Header */}
      <Header
        activeView={activeView}
        setActiveView={handleNavChange}
        onOpenSearch={() => setIsSearchOpen(true)}
        cartCount={cartCount}
      />

      {/* View Switcher */}
      <main className="flex-1">
        {selectedEssay ? (
          <EssayDetailView
            essay={selectedEssay}
            onBack={() => setSelectedEssay(null)}
            onSelectEssay={handleSelectEssay}
          />
        ) : selectedSaint ? (
          <SaintDetailView
            saint={selectedSaint}
            onBack={() => setSelectedSaint(null)}
            onSelectSaint={handleSelectSaint}
          />
        ) : (
          <>
            {activeView === 'home' && (
              <HomeView
                setActiveView={handleNavChange}
                onSelectSaint={handleSelectSaint}
                onSelectEssay={handleSelectEssay}
              />
            )}

            {activeView === 'blog' && (
              <BlogView onSelectEssay={handleSelectEssay} />
            )}

            {activeView === 'comunidade' && <RedeSocialView />}

            {activeView === 'santoral' && (
              <SantoralView onSelectSaint={handleSelectSaint} />
            )}

            {activeView === 'liturgia' && <LiturgiaView />}

            {activeView === 'igrejas' && <IgrejasView />}

            {activeView === 'assinaturas' && <AssinaturasView />}

            {activeView === 'loja' && (
              <LojaView
                cart={cart}
                onAddToCart={handleAddToCart}
                onRemoveFromCart={handleRemoveFromCart}
                onUpdateQuantity={handleUpdateQuantity}
              />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <Footer setActiveView={handleNavChange} />

      {/* Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectSaint={handleSelectSaint}
        onSelectEssay={handleSelectEssay}
        setActiveView={handleNavChange}
      />
    </div>
  );
};


export default App;
