import React from 'react';
import { ActiveView } from '../types';

interface FooterProps {
  setActiveView: (view: ActiveView) => void;
}

export const Footer: React.FC<FooterProps> = ({ setActiveView }) => {
  return (
    <footer className="bg-[#1c1b1b] text-white py-12 border-t border-[#785600] mt-auto">
      <div className="flex flex-col md:flex-row justify-between items-center px-4 md:px-12 gap-8 w-full max-w-[1120px] mx-auto">
        <button
          onClick={() => setActiveView('home')}
          className="font-display text-3xl text-[#ffdea6] tracking-tight hover:opacity-90 transition-opacity"
        >
          Eclesia
        </button>

        <nav className="flex flex-wrap justify-center gap-6 md:gap-8">
          <button
            onClick={() => setActiveView('home')}
            className="font-sans text-xs uppercase tracking-widest text-gray-400 hover:text-white transition-colors"
          >
            Início
          </button>
          <button
            onClick={() => setActiveView('blog')}
            className="font-sans text-xs uppercase tracking-widest text-gray-400 hover:text-white transition-colors"
          >
            Blog & Notícias
          </button>
          <button
            onClick={() => setActiveView('comunidade')}
            className="font-sans text-xs uppercase tracking-widest text-gray-400 hover:text-white transition-colors"
          >
            Comunidades
          </button>
          <button
            onClick={() => setActiveView('santoral')}
            className="font-sans text-xs uppercase tracking-widest text-gray-400 hover:text-white transition-colors"
          >
            Santoral
          </button>
          <button
            onClick={() => setActiveView('liturgia')}
            className="font-sans text-xs uppercase tracking-widest text-gray-400 hover:text-white transition-colors"
          >
            Liturgia
          </button>
          <button
            onClick={() => setActiveView('igrejas')}
            className="font-sans text-xs uppercase tracking-widest text-gray-400 hover:text-white transition-colors"
          >
            Igrejas Próximas
          </button>
          <button
            onClick={() => setActiveView('loja')}
            className="font-sans text-xs uppercase tracking-widest text-gray-400 hover:text-white transition-colors"
          >
            Loja
          </button>
          <button
            onClick={() => setActiveView('assinaturas')}
            className="font-sans text-xs uppercase tracking-widest text-gray-400 hover:text-white transition-colors"
          >
            Assinaturas
          </button>
        </nav>

        <div className="font-sans text-xs text-gray-400 text-center md:text-right">
          © 2024 Eclesia Editorial. Ad Majorem Dei Gloriam.
        </div>
      </div>
    </footer>
  );
};
