import React from 'react';
import { ActiveView } from '../types';

interface FooterProps {
  setActiveView: (view: ActiveView) => void;
}

export const Footer: React.FC<FooterProps> = ({ setActiveView }) => {
  return (
    <footer className="bg-[#1c1b1b] text-white pt-12 pb-6 border-t border-[#785600] mt-auto">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Top row: brand + main nav + legal */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-10">
          {/* Brand */}
          <div className="space-y-2">
            <button
              onClick={() => setActiveView('home')}
              className="font-display text-3xl text-[#ffdea6] tracking-tight hover:opacity-90 transition-opacity"
            >
              Eclesia
            </button>
            <p className="font-sans text-xs text-gray-400 max-w-[200px] leading-relaxed">
              Plataforma editorial católica e apostolado digital. Ad Majorem Dei Gloriam.
            </p>
          </div>

          {/* Main Navigation */}
          <div className="space-y-3">
            <p className="font-sans text-[10px] font-bold uppercase tracking-widest text-[#785600]">Navegação</p>
            <nav className="flex flex-wrap gap-x-6 gap-y-3">
              {[
                { label: 'Início', view: 'home' },
                { label: 'Blog & Notícias', view: 'blog' },
                { label: 'Santoral', view: 'santoral' },
                { label: 'Liturgia', view: 'liturgia' },
                { label: 'Orações', view: 'oracoes' },
                { label: 'Loja', view: 'loja' },
              ].map(({ label, view }) => (
                <button
                  key={view}
                  onClick={() => setActiveView(view as ActiveView)}
                  className="font-sans text-xs uppercase tracking-widest text-gray-400 hover:text-white transition-colors cursor-pointer"
                >
                  {label}
                </button>
              ))}
            </nav>
          </div>

          {/* Legal Links */}
          <div className="space-y-3">
            <p className="font-sans text-[10px] font-bold uppercase tracking-widest text-[#785600]">Institucional</p>
            <nav className="flex flex-col gap-2.5">
              <button
                onClick={() => setActiveView('termos')}
                className="font-sans text-xs uppercase tracking-widest text-gray-400 hover:text-white transition-colors text-left cursor-pointer"
              >
                Termos de Uso
              </button>
              <button
                onClick={() => setActiveView('privacidade')}
                className="font-sans text-xs uppercase tracking-widest text-gray-400 hover:text-white transition-colors text-left cursor-pointer"
              >
                Política de Privacidade
              </button>
              <button
                onClick={() => setActiveView('conduta')}
                className="font-sans text-xs uppercase tracking-widest text-gray-400 hover:text-white transition-colors text-left cursor-pointer"
              >
                Código de Conduta Cristã
              </button>
              <a
                href="mailto:contato@eclesia.com.br"
                className="font-sans text-xs uppercase tracking-widest text-gray-400 hover:text-white transition-colors text-left"
              >
                Contato & Suporte
              </a>
            </nav>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-white/10" />

        {/* Bottom row: copyright */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
          <p className="font-sans text-xs text-gray-500">
            © 2024 Eclesia Editorial. Ad Majorem Dei Gloriam. Todos os direitos reservados.
          </p>
          <p className="font-sans text-[10px] text-gray-600 uppercase tracking-widest">
            LGPD • Dados protegidos
          </p>
        </div>
      </div>
    </footer>
  );
};
