'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, Menu, X, ShoppingBag, User, LogOut, ShieldCheck, ChevronDown, Sun, Moon, HeartHandshake } from 'lucide-react';
import { ActiveView, UserProfile } from '../types';
import { useDarkMode } from '../hooks/useDarkMode';

interface HeaderProps {
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  onOpenSearch: () => void;
  cartCount: number;
  onOpenCart: () => void;
  user: any;
  profile: UserProfile | null;
  onSignOut: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeView,
  setActiveView,
  onOpenSearch,
  cartCount,
  onOpenCart,
  user,
  profile,
  onSignOut,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [cartBounce, setCartBounce] = useState(false);
  const prevCartCount = useRef(cartCount);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Strict Admin/Editor Check from Supabase Auth Profile
  const isAdmin = Boolean(user && profile && (profile.role === 'admin' || profile.role === 'editor' || user.email === 'suporte.delski@gmail.com'));

  // Trigger bounce animation when cart count increases
  useEffect(() => {
    if (cartCount > prevCartCount.current) {
      setCartBounce(true);
      setTimeout(() => setCartBounce(false), 700);
    }
    prevCartCount.current = cartCount;
  }, [cartCount]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const { isDark, toggleDarkMode } = useDarkMode();

  return (
    <header className="bg-white/95 dark:bg-[#161412]/95 backdrop-blur-md border-b border-[#d3c4af]/50 dark:border-[#38322a] sticky top-0 z-50 transition-colors w-full shadow-xs">
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3.5 flex justify-between items-center gap-2 sm:gap-4">
        {/* Far Left: Brand Logo & Aligned BLOG Tag with Golden Cross Icon */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          <button
            onClick={() => setActiveView('home')}
            className="font-display text-xl sm:text-2xl md:text-3xl font-bold text-[#785600] tracking-tight hover:opacity-90 transition-opacity text-left cursor-pointer flex items-center gap-1.5 sm:gap-2 leading-none"
          >
            <img src="/favicon.svg" alt="Cruz Eclesia" className="w-5 h-5 sm:w-6 sm:h-6 object-contain drop-shadow-xs" />
            <span>Eclesia</span>
          </button>
          <div className="flex items-center gap-1.5 sm:gap-2.5 self-center">
            <span className="w-px h-3.5 sm:h-4 bg-[#d3c4af] block" />
            <span className="text-[9px] sm:text-[11px] uppercase font-sans font-bold tracking-widest text-[#817563] leading-none">
              BLOG
            </span>
          </div>
        </div>

        {/* Center: Desktop Navigation */}
        <nav className="hidden lg:flex items-center justify-center gap-1 xl:gap-2 flex-nowrap">
          <button
            onClick={() => setActiveView('home')}
            className={`font-sans text-xs uppercase tracking-wider font-bold py-1 px-2.5 border-b-2 transition-all duration-150 whitespace-nowrap cursor-pointer ${
              activeView === 'home'
                ? 'border-[#785600] text-[#785600] dark:text-[#ffdea6] dark:border-[#ffdea6]'
                : 'border-transparent text-[#4f4535] dark:text-[#c4b9a7] hover:text-[#785600] dark:hover:text-[#ffdea6]'
            }`}
          >
            Início
          </button>

          <button
            onClick={() => setActiveView('blog')}
            className={`font-sans text-xs uppercase tracking-wider font-bold py-1 px-2.5 border-b-2 transition-all duration-150 whitespace-nowrap cursor-pointer ${
              activeView === 'blog'
                ? 'border-[#785600] text-[#785600] dark:text-[#ffdea6] dark:border-[#ffdea6]'
                : 'border-transparent text-[#4f4535] dark:text-[#c4b9a7] hover:text-[#785600] dark:hover:text-[#ffdea6]'
            }`}
          >
            Artigos
          </button>

          <button
            onClick={() => setActiveView('terco')}
            className={`font-sans text-xs uppercase tracking-wider font-bold py-1 px-2.5 border-b-2 transition-all duration-150 whitespace-nowrap cursor-pointer ${
              activeView === 'terco'
                ? 'border-[#785600] text-[#785600] dark:text-[#ffdea6] dark:border-[#ffdea6]'
                : 'border-transparent text-[#4f4535] dark:text-[#c4b9a7] hover:text-[#785600] dark:hover:text-[#ffdea6]'
            }`}
          >
            Santo Terço
          </button>

          <button
            onClick={() => setActiveView('terco-kids')}
            className={`font-sans text-xs uppercase tracking-wider font-bold py-1 px-2.5 border-b-2 transition-all duration-150 whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeView === 'terco-kids'
                ? 'border-[#0284c7] text-[#0284c7] dark:text-[#38bdf8] dark:border-[#38bdf8]'
                : 'border-transparent text-[#0369a1] dark:text-[#7dd3fc] hover:text-[#0284c7] dark:hover:text-[#bae6fd]'
            }`}
          >
            <span>🎈</span>
            <span>Terço Kids</span>
            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-sky-100 dark:bg-sky-900/60 text-sky-700 dark:text-sky-200 font-extrabold border border-sky-300 dark:border-sky-700">NOVO</span>
          </button>

          <button
            onClick={() => setActiveView('oracoes')}
            className={`font-sans text-xs uppercase tracking-wider font-bold py-1 px-2.5 border-b-2 transition-all duration-150 whitespace-nowrap cursor-pointer ${
              activeView === 'oracoes'
                ? 'border-[#785600] text-[#785600] dark:text-[#ffdea6] dark:border-[#ffdea6]'
                : 'border-transparent text-[#4f4535] dark:text-[#c4b9a7] hover:text-[#785600] dark:hover:text-[#ffdea6]'
            }`}
          >
            Orações
          </button>

          <button
            onClick={() => setActiveView('liturgia')}
            className={`font-sans text-xs uppercase tracking-wider font-bold py-1 px-2.5 border-b-2 transition-all duration-150 whitespace-nowrap cursor-pointer ${
              activeView === 'liturgia'
                ? 'border-[#785600] text-[#785600] dark:text-[#ffdea6] dark:border-[#ffdea6]'
                : 'border-transparent text-[#4f4535] dark:text-[#c4b9a7] hover:text-[#785600] dark:hover:text-[#ffdea6]'
            }`}
          >
            Liturgia
          </button>

          <button
            onClick={() => setActiveView('santoral')}
            className={`font-sans text-xs uppercase tracking-wider font-bold py-1 px-2.5 border-b-2 transition-all duration-150 whitespace-nowrap cursor-pointer ${
              activeView === 'santoral'
                ? 'border-[#785600] text-[#785600] dark:text-[#ffdea6] dark:border-[#ffdea6]'
                : 'border-transparent text-[#4f4535] dark:text-[#c4b9a7] hover:text-[#785600] dark:hover:text-[#ffdea6]'
            }`}
          >
            Santoral
          </button>

          <button
            onClick={() => setActiveView('benfeitores')}
            className={`font-sans text-xs uppercase tracking-wider font-bold py-1 px-2.5 border-b-2 transition-all duration-150 whitespace-nowrap cursor-pointer ${
              activeView === 'benfeitores'
                ? 'border-[#785600] text-[#785600] dark:text-[#ffdea6] dark:border-[#ffdea6]'
                : 'border-transparent text-[#4f4535] dark:text-[#c4b9a7] hover:text-[#785600] dark:hover:text-[#ffdea6]'
            }`}
          >
            Benfeitores
          </button>

          <button
            onClick={() => setActiveView('loja')}
            className={`font-sans text-xs uppercase tracking-wider font-bold py-1 px-2.5 border-b-2 transition-all duration-150 whitespace-nowrap cursor-pointer ${
              activeView === 'loja'
                ? 'border-[#785600] text-[#785600] dark:text-[#ffdea6] dark:border-[#ffdea6]'
                : 'border-transparent text-[#4f4535] dark:text-[#c4b9a7] hover:text-[#785600] dark:hover:text-[#ffdea6]'
            }`}
          >
            Loja
          </button>
        </nav>

        {/* Far Right Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Theme Switcher Toggle (Dark Mode) - Sempre visível */}
          <button
            onClick={toggleDarkMode}
            className="p-1.5 sm:p-2 text-[#4f4535] dark:text-[#ffdea6] hover:text-[#785600] rounded-full hover:bg-[#f0eded] dark:hover:bg-[#28231e] transition-colors cursor-pointer"
            title={isDark ? "Mudar para Modo Claro" : "Mudar para Modo Noturno / Confortável"}
            aria-label="Alternar tema claro e escuro"
          >
            {isDark ? (
              <Sun className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-amber-400 animate-spin-slow" />
            ) : (
              <Moon className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-[#785600]" />
            )}
          </button>

          {/* Search Pill Input - Visível a partir de sm: */}
          <button
            onClick={onOpenSearch}
            className="hidden sm:flex items-center gap-1.5 p-1.5 sm:px-3 sm:py-1.5 bg-[#f6f3f2] dark:bg-[#24201c] hover:bg-[#e8e4e2] dark:hover:bg-[#2e2924] border border-[#d3c4af]/60 dark:border-[#3a3229] rounded-full text-xs text-[#817563] dark:text-[#b3a898] cursor-pointer transition-colors"
            title="Pesquisar..."
          >
            <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#785600] dark:text-[#ffdea6]" />
            <span className="hidden sm:inline pr-1">Pesquisar</span>
          </button>

          {/* Store Cart Icon - Visível a partir de sm: */}
          <button
            onClick={onOpenCart}
            className={`hidden sm:flex relative p-1.5 sm:p-2 text-[#1c1b1b] dark:text-[#f3ede2] hover:text-[#785600] transition-colors rounded-full hover:bg-[#f0eded] dark:hover:bg-[#28231e] cursor-pointer ${cartBounce ? 'animate-bounce' : ''}`}
            title="Ver carrinho de compras"
          >
            <ShoppingBag className={`w-4.5 h-4.5 sm:w-5 sm:h-5 transition-transform ${cartBounce ? 'scale-110' : ''}`} />
            {cartCount > 0 && (
              <span className={`absolute -top-1 -right-1 bg-[#785600] text-white text-[9px] sm:text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center transition-transform ${cartBounce ? 'scale-125' : ''}`}>
                {cartCount}
              </span>
            )}
          </button>

          {/* STRICT ADMIN ONLY BUTTON: Only shown if logged in AND is admin */}
          {isAdmin && (
            <button
              onClick={() => setActiveView('admin')}
              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full hidden sm:flex items-center justify-center shadow-md transition-all hover:scale-110 cursor-pointer shrink-0 ${
                activeView === 'admin'
                  ? 'bg-[#991b1b] text-white ring-2 ring-red-400'
                  : 'bg-[#dc2626] hover:bg-[#b91c1c] text-white'
              }`}
              title="Painel Administrativo"
            >
              <ShieldCheck className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
            </button>
          )}

          {/* User Profile / Auth Button - Visível a partir de sm: */}
          {user && profile ? (
            <div className="relative hidden sm:block" ref={dropdownRef}>
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-1 py-1 px-2 sm:px-2.5 rounded-full hover:bg-[#f0eded] dark:hover:bg-[#28231e] transition-colors cursor-pointer border border-[#d3c4af]/80 dark:border-[#38322a] bg-[#fcf9f8] dark:bg-[#1a1714]"
                title="Minha Conta"
              >
                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#785600]/10 text-[#785600] dark:text-[#ffdea6] flex items-center justify-center font-bold">
                  <User className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                </div>
                <ChevronDown className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#817563]" />
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-[#1a1714] border border-[#d3c4af] dark:border-[#38322a] rounded-2xl shadow-xl py-2 z-50 animate-fade-in">
                  <div className="px-4 py-2 border-b border-[#d3c4af]/40 dark:border-[#38322a]">
                    <p className="font-sans text-xs font-bold text-[#1c1b1b] dark:text-[#f3ede2] truncate">{profile.name}</p>
                    <p className="font-sans text-[10px] text-[#817563] dark:text-[#a89d8d] truncate">{user.email}</p>
                  </div>

                  <button
                    onClick={() => {
                      setActiveView('auth');
                      setUserDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-[#4f4535] dark:text-[#c4b9a7] hover:bg-amber-50 dark:hover:bg-[#28231e] flex items-center gap-2 cursor-pointer"
                  >
                    <User className="w-3.5 h-3.5 text-[#785600] dark:text-[#ffdea6]" /> Minha Conta
                  </button>

                  {isAdmin && (
                    <button
                      onClick={() => {
                        setActiveView('admin');
                        setUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-bold text-[#dc2626] hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center gap-2 cursor-pointer"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" /> Painel ADM Completo
                    </button>
                  )}

                  <button
                    onClick={() => {
                      onSignOut();
                      setUserDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center gap-2 cursor-pointer border-t border-[#d3c4af]/30 dark:border-[#38322a] mt-1"
                  >
                    <LogOut className="w-3.5 h-3.5" /> Sair da Conta
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => setActiveView('auth')}
              className="hidden sm:flex p-2 text-[#4f4535] dark:text-[#c4b9a7] hover:text-[#785600] dark:hover:text-[#ffdea6] rounded-full hover:bg-[#f0eded] dark:hover:bg-[#28231e] transition-colors cursor-pointer"
              title="Entrar ou Criar Conta"
            >
              <User className="w-5 h-5" />
            </button>
          )}

          {/* Mobile menu button (Hambúrguer) */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-[#1c1b1b] dark:text-[#F9FAFB] cursor-pointer rounded-lg hover:bg-[#f0eded] dark:hover:bg-[#28231e] transition-colors"
            aria-label="Abrir menu de navegação"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer (Menu Lateral / Overlay) */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#d3c4af]/30 dark:border-[#38322a] bg-white dark:bg-[#1a1714] px-4 py-6 space-y-4 shadow-xl animate-fade-in w-full overflow-x-hidden">
          <nav className="flex flex-col space-y-2">
            {/* Atalho de Pesquisa Móvel */}
            <button
              onClick={() => {
                onOpenSearch();
                setMobileMenuOpen(false);
              }}
              className="w-full text-left font-sans text-xs uppercase tracking-wider font-semibold py-2.5 px-3 rounded-lg flex items-center gap-2.5 bg-[#f6f3f2] dark:bg-[#24201c] text-[#817563] dark:text-[#b3a898] border border-[#d3c4af]/40 dark:border-[#38322a] cursor-pointer"
            >
              <Search className="w-4 h-4 text-[#785600] dark:text-[#ffdea6]" />
              <span>Pesquisar artigos, santos, orações...</span>
            </button>

            {/* Atalho de Carrinho da Loja Móvel */}
            <button
              onClick={() => {
                onOpenCart();
                setMobileMenuOpen(false);
              }}
              className="w-full text-left font-sans text-xs uppercase tracking-wider font-semibold py-2.5 px-3 rounded-lg flex items-center justify-between bg-[#fcf9f8] dark:bg-[#24201c] text-[#1c1b1b] dark:text-[#f3ede2] border border-[#d3c4af]/40 dark:border-[#38322a] cursor-pointer"
            >
              <span className="flex items-center gap-2.5">
                <ShoppingBag className="w-4 h-4 text-[#785600] dark:text-[#ffdea6]" />
                <span>Carrinho de Compras</span>
              </span>
              {cartCount > 0 ? (
                <span className="bg-[#785600] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {cartCount} {cartCount === 1 ? 'item' : 'itens'}
                </span>
              ) : (
                <span className="text-[10px] text-[#817563] dark:text-[#a89d8d]">Vazio</span>
              )}
            </button>

            {/* Links de Páginas */}
            {[
              { label: 'Início', view: 'home' as ActiveView },
              { label: 'Artigos & Blog', view: 'blog' as ActiveView },
              { label: 'Santo Terço Interativo', view: 'terco' as ActiveView },
              { label: '🎈 Santo Terço Kids (Infantil)', view: 'terco-kids' as ActiveView },
              { label: 'Orações Católicas', view: 'oracoes' as ActiveView },
              { label: 'Liturgia Diária', view: 'liturgia' as ActiveView },
              { label: 'Santoral', view: 'santoral' as ActiveView },
              { label: 'Benfeitores do Eclesia', view: 'benfeitores' as ActiveView },
              { label: 'Loja Sacra', view: 'loja' as ActiveView },
            ].map((item) => (
              <button
                key={item.label}
                onClick={() => {
                  setActiveView(item.view);
                  setMobileMenuOpen(false);
                }}
                className={`text-left font-sans text-xs uppercase tracking-widest font-semibold py-2.5 px-3 rounded-lg cursor-pointer transition-colors ${
                  activeView === item.view
                    ? 'bg-[#f0eded] dark:bg-[#2b251f] text-[#785600] dark:text-[#ffdea6] font-bold'
                    : 'text-[#4f4535] dark:text-[#c4b9a7] hover:bg-[#fcf9f8] dark:hover:bg-[#24201c]'
                }`}
              >
                {item.label}
              </button>
            ))}

            {/* Dark Mode switcher inside mobile drawer */}
            <button
              onClick={toggleDarkMode}
              className="text-left font-sans text-xs uppercase tracking-widest font-semibold py-2.5 px-3 rounded-lg cursor-pointer flex items-center justify-between text-[#4f4535] dark:text-[#c4b9a7] bg-[#fcf9f8] dark:bg-[#24201c] border border-[#d3c4af]/40 dark:border-[#38322a]"
            >
              <span className="flex items-center gap-2">
                {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-[#785600]" />}
                Modo de Visualização
              </span>
              <span className="text-[10px] font-bold text-[#785600] dark:text-[#ffdea6]">
                {isDark ? 'Noturno Ativo' : 'Claro Ativo'}
              </span>
            </button>

            {!user && (
              <button
                onClick={() => {
                  setActiveView('auth');
                  setMobileMenuOpen(false);
                }}
                className="text-left font-sans text-xs uppercase tracking-widest font-bold py-2.5 px-3 rounded-lg text-[#785600] bg-amber-50 dark:bg-amber-950/40 dark:text-amber-300 cursor-pointer flex items-center gap-2"
              >
                <User className="w-4 h-4" /> Entrar / Criar Conta
              </button>
            )}

            {isAdmin && (
              <button
                onClick={() => {
                  setActiveView('admin');
                  setMobileMenuOpen(false);
                }}
                className="text-left font-sans text-xs uppercase tracking-widest font-bold py-2.5 px-3 rounded-lg text-white bg-red-600 hover:bg-red-700 cursor-pointer flex items-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" /> Painel Administrativo
              </button>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};
