import React, { useState, useEffect } from 'react';
import { TercoInterativo } from '../TercoInterativo';
import { KidsRosary } from './KidsRosary';

/**
 * RosaryPage (/terco)
 * Página oficial do Santo Terço com seletor superior de abas obrigatório:
 * [ 🙏 Santo Terço Tradicional ] | [ 🎨 Santo Terço Kids ]
 */
export const RosaryPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'traditional' | 'kids'>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('modo') === 'kids' || window.location.hash.includes('kids')) {
        return 'kids';
      }
    }
    return 'traditional';
  });

  useEffect(() => {
    const handlePop = () => {
      const params = new URLSearchParams(window.location.search);
      if (params.get('modo') === 'kids' || window.location.hash.includes('kids')) {
        setActiveTab('kids');
      } else {
        setActiveTab('traditional');
      }
    };
    window.addEventListener('popstate', handlePop);
    return () => window.removeEventListener('popstate', handlePop);
  }, []);

  const handleTabChange = (tab: 'traditional' | 'kids') => {
    setActiveTab(tab);
    if (typeof window !== 'undefined') {
      const newUrl = tab === 'kids' ? '/terco?modo=kids' : '/terco';
      window.history.replaceState(null, '', newUrl);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in text-[#1c1b1b] dark:text-[#f3ede2]">
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif text-center mb-2 font-bold text-[#785600] dark:text-[#f3c877] tracking-tight">
        Santo Terço Interativo
      </h1>
      <p className="font-sans text-sm sm:text-base text-center text-[#4f4535] dark:text-[#c4b9a7] max-w-xl mx-auto leading-relaxed">
        Reze e contemple os mistérios da Redenção passo a passo com contagem guiada de Ave-Marias e meditações bíblicas.
      </p>

      {/* ABAS DE SELEÇÃO OBRIGATÓRIAS */}
      <div className="flex justify-center gap-4 my-6">
        <button
          id="btn-tab-traditional"
          type="button"
          onClick={() => handleTabChange('traditional')}
          className={`px-6 py-3 rounded-full font-semibold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'traditional'
              ? 'bg-amber-900 text-white shadow-lg scale-105'
              : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
          }`}
        >
          <span>🙏</span>
          <span>Santo Terço Tradicional</span>
        </button>
        <button
          id="btn-tab-kids"
          type="button"
          onClick={() => handleTabChange('kids')}
          className={`px-6 py-3 rounded-full font-semibold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'kids'
              ? 'bg-amber-900 text-white shadow-lg scale-105'
              : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
          }`}
        >
          <span>🎨</span>
          <span>Santo Terço Kids</span>
        </button>
      </div>

      {/* RENDERIZAÇÃO CONDICIONAL */}
      {activeTab === 'traditional' ? (
        <TercoInterativo hideHeaderTitle />
      ) : (
        <div className="w-full max-w-4xl mx-auto pt-2">
          <KidsRosary onSwitchToTraditional={() => handleTabChange('traditional')} />
        </div>
      )}
    </div>
  );
};

export default RosaryPage;
