import React, { useState } from 'react';
import { Search, Menu, X, BookOpen, Calendar, ShoppingBag, Sparkles, UserCheck } from 'lucide-react';
import { ActiveView } from '../types';

interface HeaderProps {
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  onOpenSearch: () => void;
  cartCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeView,
  setActiveView,
  onOpenSearch,
  cartCount
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: { label: string; view: ActiveView }[] = [
    { label: 'Início', view: 'home' },
    { label: 'Blog', view: 'blog' },
    { label: 'Comunidades', view: 'comunidade' },
    { label: 'Liturgia', view: 'liturgia' },
    { label: 'Santoral', view: 'santoral' },
    { label: 'Igrejas Próximas', view: 'igrejas' },
    { label: 'Loja', view: 'loja' },
    { label: 'Assinaturas', view: 'assinaturas' }
  ];

  return (
    <header className="bg-[#fcf9f8] dark:bg-[#1c1b1b] border-b border-[#d3c4af]/50 sticky top-0 z-50 transition-colors">
      <div className="flex justify-between items-center w-full px-4 md:px-12 py-4 max-w-[1120px] mx-auto">
        {/* Far Left: Brand Logo */}
        <button
          onClick={() => setActiveView('home')}
          className="font-display text-3xl md:text-4xl text-[#785600] dark:text-[#f7bd48] tracking-tight hover:opacity-90 transition-opacity text-left shrink-0"
        >
          Eclesia
        </button>

        {/* Center: Desktop Navigation */}
        <nav className="hidden md:flex gap-3 lg:gap-6 items-center mx-2">
          {navItems.map((item) => {
            const isActive = activeView === item.view;
            return (
              <button
                key={item.label}
                onClick={() => setActiveView(item.view)}
                className={`font-sans text-[11px] lg:text-xs uppercase tracking-[0.08em] lg:tracking-[0.1em] font-bold py-1 px-1 border-b-2 transition-all duration-200 whitespace-nowrap ${
                  isActive
                    ? 'border-[#785600] text-[#785600] dark:text-[#f7bd48] dark:border-[#f7bd48]'
                    : 'border-transparent text-[#4f4535] hover:text-[#785600] dark:text-gray-300 dark:hover:text-white'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Far Right Actions: Search, Store Icon, Criar conta Button */}
        <div className="flex items-center gap-2 md:gap-3 shrink-0">
          <button
            onClick={onOpenSearch}
            className="p-2 text-[#1c1b1b] hover:text-[#785600] dark:text-gray-200 dark:hover:text-[#f7bd48] transition-colors rounded-full hover:bg-[#f0eded] dark:hover:bg-gray-800"
            title="Buscar..."
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Store Cart Badge */}
          <button
            onClick={() => setActiveView('loja')}
            className="relative p-2 text-[#1c1b1b] hover:text-[#785600] dark:text-gray-200 dark:hover:text-[#f7bd48] transition-colors rounded-full hover:bg-[#f0eded] dark:hover:bg-gray-800"
            title="Ver carrinho"
          >
            <ShoppingBag className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#785600] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>

          {/* Criar Conta Button */}
          <button
            onClick={() => setActiveView('assinaturas')}
            className="hidden sm:inline-flex px-4 py-2 bg-[#1c1b1b] text-white font-sans text-xs font-bold uppercase tracking-widest rounded hover:bg-[#785600] transition-colors shadow-2xs cursor-pointer"
          >
            Criar conta
          </button>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-[#1c1b1b] dark:text-white"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#d3c4af]/30 bg-[#fcf9f8] dark:bg-[#1c1b1b] px-4 py-6 space-y-4 shadow-xl">
          <nav className="flex flex-col space-y-3">
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={() => {
                  setActiveView(item.view);
                  setMobileMenuOpen(false);
                }}
                className={`text-left font-sans text-sm uppercase tracking-widest font-semibold py-2 px-3 rounded ${
                  activeView === item.view
                    ? 'bg-[#f0eded] dark:bg-gray-800 text-[#785600] dark:text-[#f7bd48]'
                    : 'text-[#4f4535] dark:text-gray-300'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="pt-4 border-t border-[#d3c4af]/30">
            <button
              onClick={() => {
                setActiveView('assinaturas');
                setMobileMenuOpen(false);
              }}
              className="w-full py-3 bg-[#1c1b1b] text-white font-sans text-xs font-bold uppercase tracking-widest rounded text-center hover:bg-[#785600]"
            >
              Criar conta
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
