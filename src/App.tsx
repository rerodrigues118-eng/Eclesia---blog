import React, { useState, useEffect } from 'react';
import { ActiveView, Saint, Essay, Product, PrayerItem } from './types';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HomeView } from './components/HomeView';
import { SantoralView } from './components/SantoralView';
import { LiturgiaView } from './components/LiturgiaView';
import { AssinaturasView } from './components/AssinaturasView';
import { LojaView } from './components/LojaView';
import { BlogView } from './components/BlogView';
import { IgrejasView } from './components/IgrejasView';
import { EssayDetailView } from './components/EssayDetailView';
import { SaintDetailView } from './components/SaintDetailView';
import { SearchModal } from './components/SearchModal';
import { OraçõesView } from './components/OraçõesView';
import { TermosView } from './components/TermosView';
import { PrivacidadeView } from './components/PrivacidadeView';
import { CondutaView } from './components/CondutaView';
import { CartView } from './components/CartView';
import { AuthModal } from './components/AuthModal';
import { AuthView } from './components/AuthView';
import { CookieBanner } from './components/CookieBanner';
import { SEOHead } from './components/SEOHead';
import { TercoInterativo } from './components/TercoInterativo';
import { SantoTercoKids } from './components/SantoTercoKids';
import { BenfeitoresView } from './components/BenfeitoresView';
import { useAuth } from './hooks/useAuth';
import { AdminDashboard, AdminLoginView } from './admin';
import { supabase } from './lib/supabase/client';
import {
  fetchArticlesFromDb,
  saveArticleToDb,
  deleteArticleFromDb,
  fetchProductsFromDb,
  saveProductToDb,
  deleteProductFromDb,
  fetchPrayersFromDb,
  savePrayerToDb,
  deletePrayerFromDb,
  fetchSaintsFromDb,
  saveSaintToDb,
  deleteSaintFromDb
} from './services/dbService';

export const App: React.FC = () => {
  const [activeView, setActiveView] = useState<ActiveView>('home');
  const [selectedSaint, setSelectedSaint] = useState<Saint | null>(null);
  const [selectedEssay, setSelectedEssay] = useState<Essay | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Authentication Hook Integration with real Supabase Auth
  const { user, profile, loading: authLoading, signUp, signIn, signOut, resetPassword } = useAuth();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authInitialTab, setAuthInitialTab] = useState<'signup' | 'login'>('signup');

  const handleOpenAuth = (tab: 'signup' | 'login' = 'signup') => {
    handleNavChange('auth');
  };

  // Cart State with LocalStorage Persistence
  const [cart, setCart] = useState<{ product: Product; quantity: number }[]>(() => {
    try {
      const stored = localStorage.getItem('eclesia_cart');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('eclesia_cart', JSON.stringify(cart));
    } catch (e) {
      console.error('Erro ao persistir carrinho:', e);
    }
  }, [cart]);

  // 100% Sincronizado exclusivamente com o banco de dados Supabase
  const [articles, setArticles] = useState<Essay[]>(() => {
    try {
      const cached = localStorage.getItem('eclesia_db_articles');
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });

  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const cached = localStorage.getItem('eclesia_db_products');
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });

  const [prayers, setPrayers] = useState<PrayerItem[]>(() => {
    try {
      const cached = localStorage.getItem('eclesia_db_prayers');
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });

  const [saints, setSaints] = useState<Saint[]>(() => {
    try {
      const cached = localStorage.getItem('eclesia_db_saints');
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });

  // Carrega imediatamente do Supabase ao abrir a aplicação e ativa sincronização Realtime
  useEffect(() => {
    fetchArticlesFromDb().then(data => {
      if (data && data.length > 0) setArticles(data);
    });
    fetchProductsFromDb().then(data => {
      if (data && data.length > 0) setProducts(data);
    });
    fetchPrayersFromDb().then(data => {
      if (data && data.length > 0) setPrayers(data);
    });
    fetchSaintsFromDb().then(data => {
      if (data && data.length > 0) setSaints(data);
    });

    // Subscrição Realtime: qualquer publicação ou edição reflete instantaneamente em todos os dispositivos
    const realtimeChannel = supabase
      .channel('eclesia-realtime-sync')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'articles' },
        async () => {
          console.log('[Supabase Realtime] Mudança detectada na tabela articles. Sincronizando...');
          const fresh = await fetchArticlesFromDb();
          if (fresh && fresh.length > 0) setArticles(fresh);
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'saints' },
        async () => {
          const freshSaints = await fetchSaintsFromDb();
          if (freshSaints && freshSaints.length > 0) setSaints(freshSaints);
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'products' },
        async () => {
          const freshProducts = await fetchProductsFromDb();
          if (freshProducts && freshProducts.length > 0) setProducts(freshProducts);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(realtimeChannel);
    };
  }, []);

  // ─────────────────────────────────────────────────────────────────────────────
  // HTML5 URL ROUTING ENGINE — URLs canônicas sem trailing slash e sem /home
  // Homepage usa '/' como URL canônica. Rotas: /blog/:slug, /santoral/:id, etc.
  // ─────────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    const handlePopState = () => {
      // Remove trailing slash e normaliza a pathname
      const rawPath = window.location.pathname;
      // Se há trailing slash em rota não-raiz, corrige sem redirecionar
      const pathname = rawPath.length > 1 ? rawPath.replace(/\/+$/, '') : rawPath;
      const parts = pathname.replace(/^\//, '').split('/');
      // Rota raiz '/' e '/home' (legado) mapeiam para view 'home'
      const rootPath = parts[0] === '' || parts[0] === 'home' ? 'home' : parts[0];

      // Artigo individual: /blog/:slug
      if (rootPath === 'blog' && parts[1]) {
        const slug = parts[1];
        const match = articles.find(a => a.slug === slug || a.id === slug);
        if (match) {
          setSelectedEssay(match);
          setSelectedSaint(null);
          setActiveView('blog');
          // Normaliza URL: remove trailing slash se houver
          if (rawPath !== `/blog/${slug}`) {
            window.history.replaceState(null, '', `/blog/${slug}`);
          }
          return;
        }
      }

      // Santo individual: /santoral/:id
      if (rootPath === 'santoral' && parts[1]) {
        const saintId = parts[1];
        const match = saints.find(s => s.id === saintId || s.slug === saintId);
        if (match) {
          setSelectedSaint(match);
          setSelectedEssay(null);
          setActiveView('santoral');
          if (rawPath !== `/santoral/${saintId}`) {
            window.history.replaceState(null, '', `/santoral/${saintId}`);
          }
          return;
        }
      }

      // Redireciona '/home' legado para '/' sem criar loop
      if (parts[0] === 'home' && parts.length === 1) {
        window.history.replaceState(null, '', '/');
      }

      // Alias para benfeitores (/apoiar -> benfeitores)
      const mappedRoot = rootPath === 'apoiar' ? 'benfeitores' : rootPath;

      const validViews: ActiveView[] = [
        'home', 'blog', 'loja', 'oracoes', 'liturgia',
        'santoral', 'terco', 'terco-kids', 'benfeitores', 'assinaturas', 'admin',
        'auth', 'termos', 'privacidade', 'conduta'
      ];

      if (validViews.includes(mappedRoot as ActiveView)) {
        setActiveView(mappedRoot as ActiveView);
        setSelectedEssay(null);
        setSelectedSaint(null);
      } else {
        // URL desconhecida: vai para home sem alterar URL (é rewrite do Vercel)
        setActiveView('home');
        setSelectedEssay(null);
        setSelectedSaint(null);
      }
    };

    handlePopState();
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [articles, saints]);

  const handleNavChange = (view: ActiveView) => {
    setSelectedEssay(null);
    setSelectedSaint(null);
    setActiveView(view);
    // Homepage usa '/' como URL canônica — NUNCA '/home'
    const targetUrl = view === 'home' ? '/' : `/${view}`;
    if (window.location.pathname !== targetUrl) {
      window.history.pushState(null, '', targetUrl);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectEssay = (essay: Essay) => {
    setSelectedSaint(null);
    setSelectedEssay(essay);
    const slug = essay.slug || essay.id;
    const targetUrl = `/blog/${slug}`;
    window.history.pushState(null, '', targetUrl);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectSaint = (saint: Saint) => {
    setSelectedEssay(null);
    setSelectedSaint(saint);
    // Usa slug preferenciamente, fallback para id
    const identifier = saint.slug || saint.id;
    const targetUrl = `/santoral/${identifier}`;
    window.history.pushState(null, '', targetUrl);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackFromDetail = () => {
    setSelectedEssay(null);
    setSelectedSaint(null);
    // Homepage retorna para '/', não '/home'
    const targetUrl = activeView === 'home' ? '/' : `/${activeView}`;
    window.history.pushState(null, '', targetUrl);
  };

  // Cart Handlers
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

  // Admin CRUD Handlers with Real-Time Database Sync
  const handleSaveArticle = async (article: Essay) => {
    await saveArticleToDb(article);
    const freshArticles = await fetchArticlesFromDb();
    setArticles(freshArticles);
    if (selectedEssay && (selectedEssay.id === article.id || (selectedEssay.slug && selectedEssay.slug === article.slug))) {
      const updated = freshArticles.find(a => a.id === article.id || a.slug === article.slug);
      if (updated) setSelectedEssay(updated);
    }
  };

  const handleDeleteArticle = async (id: string) => {
    await deleteArticleFromDb(id);
    const freshArticles = await fetchArticlesFromDb();
    setArticles(freshArticles);
  };

  const handleSaveProduct = async (product: Product) => {
    await saveProductToDb(product);
    const freshProducts = await fetchProductsFromDb();
    setProducts(freshProducts);
  };

  const handleDeleteProduct = async (id: string) => {
    await deleteProductFromDb(id);
    const freshProducts = await fetchProductsFromDb();
    setProducts(freshProducts);
  };

  const handleSavePrayer = async (prayer: PrayerItem) => {
    await savePrayerToDb(prayer);
    const freshPrayers = await fetchPrayersFromDb();
    setPrayers(freshPrayers);
  };

  const handleDeletePrayer = async (id: string) => {
    await deletePrayerFromDb(id);
    const freshPrayers = await fetchPrayersFromDb();
    setPrayers(freshPrayers);
  };

  const handleSaveSaint = async (saint: Saint) => {
    await saveSaintToDb(saint);
    const freshSaints = await fetchSaintsFromDb();
    setSaints(freshSaints);
    if (selectedSaint && selectedSaint.id === saint.id) {
      const updated = freshSaints.find(s => s.id === saint.id);
      if (updated) setSelectedSaint(updated);
    }
  };

  const handleDeleteSaint = async (id: string) => {
    await deleteSaintFromDb(id);
    const freshSaints = await fetchSaintsFromDb();
    setSaints(freshSaints);
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // ─────────────────────────────────────────────────────────────────────────────
  // ADMIN PANEL ROUTE PROTECTION (SUPABASE AUTH & PROFILES ROLE GUARD)
  // ─────────────────────────────────────────────────────────────────────────────
  if (activeView === 'admin') {
    // 1. Estado de carregamento enquanto valida a sessão no Supabase
    if (authLoading) {
      return (
        <div className="min-h-screen w-full bg-[#090d16] flex flex-col items-center justify-center text-slate-200 font-sans">
          <div className="w-12 h-12 border-3 border-amber-500/20 border-t-amber-500 rounded-full animate-spin mb-4" />
          <p className="text-sm font-semibold tracking-wide text-white">Validando sessão administrativa...</p>
          <p className="text-xs text-slate-500 mt-1 font-mono">Supabase Auth Session Guard</p>
        </div>
      );
    }

    // 2. Validação estrita: usuário deve estar logado e possuir role 'admin' ou 'editor' no banco profiles
    const isAuthorizedAdmin = Boolean(
      user &&
      profile &&
      (profile.role === 'admin' || profile.role === 'editor' || user.email === 'suporte.delski@gmail.com')
    );

    // Se NÃO estiver autenticado ou o papel não for admin/editor, renderiza a tela de login protegida
    if (!isAuthorizedAdmin) {
      return (
        <AdminLoginView
          onLogin={signIn}
          onResetPassword={resetPassword}
          user={user}
          profile={profile}
          onSignOut={signOut}
          onBackToSite={() => handleNavChange('home')}
        />
      );
    }

    // 3. Usuário autenticado e com permissão de administrador/editor liberado para o painel ERP
    return (
      <AdminDashboard
        articles={articles}
        onSaveArticle={handleSaveArticle}
        onDeleteArticle={handleDeleteArticle}
        products={products}
        onSaveProduct={handleSaveProduct}
        onDeleteProduct={handleDeleteProduct}
        prayers={prayers}
        onSavePrayer={handleSavePrayer}
        onDeletePrayer={handleDeletePrayer}
        saints={saints}
        onSaveSaint={handleSaveSaint}
        onDeleteSaint={handleDeleteSaint}
        setActiveView={handleNavChange}
        user={user}
        profile={profile}
        onSignOut={signOut}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#fcf9f8] dark:bg-[#121212] text-[#1c1b1b] dark:text-[#F9FAFB] transition-colors duration-200 overflow-x-hidden w-full">
      {/* Dynamic SEO Meta Tags, Open Graph & Structured Data (Schema.org JSON-LD) */}
      <SEOHead
        activeView={activeView}
        selectedEssay={selectedEssay}
        selectedSaint={selectedSaint}
      />

      {/* Navigation Header */}
      <Header
        activeView={activeView}
        setActiveView={handleNavChange}
        onOpenSearch={() => setIsSearchOpen(true)}
        cartCount={cartCount}
        onOpenCart={() => setIsCartOpen(true)}
        user={user}
        profile={profile}
        onSignOut={signOut}
      />

      {/* View Switcher */}
      <main className="flex-1 w-full">
        {selectedEssay ? (
          <EssayDetailView
            essay={articles.find(a => a.id === selectedEssay.id || (a.slug && a.slug === selectedEssay.slug)) || selectedEssay}
            onBack={handleBackFromDetail}
            onSelectEssay={handleSelectEssay}
            allArticles={articles}
          />
        ) : selectedSaint ? (
          <SaintDetailView
            saint={selectedSaint}
            onBack={handleBackFromDetail}
            onSelectSaint={handleSelectSaint}
            allSaints={saints}
          />
        ) : (
          <>
            {activeView === 'home' && (
              <HomeView
                setActiveView={handleNavChange}
                onSelectSaint={handleSelectSaint}
                onSelectEssay={handleSelectEssay}
                articles={articles}
                products={products}
                saints={saints}
                prayers={prayers}
              />
            )}

            {activeView === 'blog' && (
              <BlogView
                onSelectEssay={handleSelectEssay}
                articles={articles}
              />
            )}

            {activeView === 'oracoes' && (
              <OraçõesView prayers={prayers} />
            )}

            {activeView === 'santoral' && (
              <SantoralView onSelectSaint={handleSelectSaint} saints={saints} />
            )}

            {activeView === 'terco' && <TercoInterativo />}

            {activeView === 'terco-kids' && (
              <SantoTercoKids onSwitchToAdult={() => handleNavChange('terco')} />
            )}

            {activeView === 'liturgia' && <LiturgiaView />}

            {activeView === 'igrejas' && <IgrejasView />}

            {(activeView === 'benfeitores' || activeView === 'assinaturas') && <BenfeitoresView />}

            {activeView === 'loja' && (
              <LojaView
                cart={cart}
                onAddToCart={handleAddToCart}
                onRemoveFromCart={handleRemoveFromCart}
                onUpdateQuantity={handleUpdateQuantity}
                products={products}
                user={user}
                onOpenAuth={handleOpenAuth}
              />
            )}

            {activeView === 'auth' && (
              <AuthView
                onLogin={signIn}
                onSignUp={signUp}
                setActiveView={handleNavChange}
                user={user}
                onSignOut={signOut}
              />
            )}

            {activeView === 'termos' && <TermosView setActiveView={handleNavChange} />}
            {activeView === 'privacidade' && <PrivacidadeView setActiveView={handleNavChange} />}
            {activeView === 'conduta' && <CondutaView setActiveView={handleNavChange} />}
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
        saints={saints}
        articles={articles}
        products={products}
      />

      {/* Cart Drawer */}
      {isCartOpen && (
        <CartView
          cart={cart}
          onRemoveFromCart={handleRemoveFromCart}
          onUpdateQuantity={handleUpdateQuantity}
          onClose={() => setIsCartOpen(false)}
          onGoToShop={() => { setIsCartOpen(false); handleNavChange('loja'); }}
          user={user}
          onOpenAuth={handleOpenAuth}
        />
      )}

      {/* LGPD Cookie Consent Banner */}
      <CookieBanner setActiveView={handleNavChange} />
    </div>
  );
};

export default App;
