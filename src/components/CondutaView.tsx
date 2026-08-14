import React from 'react';
import { ArrowLeft, Heart } from 'lucide-react';
import { ActiveView } from '../types';

interface CondutaViewProps {
  setActiveView: (view: ActiveView) => void;
}

export const CondutaView: React.FC<CondutaViewProps> = ({ setActiveView }) => {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-20">
      <button
        onClick={() => setActiveView('home')}
        className="flex items-center gap-2 text-[#785600] hover:text-[#9a7000] font-sans text-xs font-bold uppercase tracking-wider mb-8 cursor-pointer transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Voltar ao Início
      </button>

      <div className="border-b border-[#d3c4af]/50 pb-6 mb-10">
        <div className="flex items-center gap-2 text-[#785600] font-sans text-xs font-bold uppercase tracking-widest mb-1">
          <Heart className="w-4 h-4" /> Princípios e Diretrizes
        </div>
        <h1 className="font-display text-4xl md:text-5xl font-bold text-[#1c1b1b] tracking-tight">
          Código de Conduta & Diretrizes Editoriais
        </h1>
        <p className="font-sans text-sm text-[#4f4535] mt-2 leading-relaxed">
          "Amai-vos uns aos outros como Eu vos amei." (Jo 13,34). Nossos princípios de fidelidade à fé, reverência e caridade cristã.
        </p>
      </div>

      {/* Preamble Card */}
      <div className="bg-gradient-to-r from-[#785600] to-[#593f00] text-white rounded-xl p-6 md:p-8 mb-10 shadow-md">
        <h2 className="font-display text-2xl font-bold mb-3">Apostolado Digital & Devoção</h2>
        <p className="font-sans text-sm leading-relaxed text-amber-100">
          O portal Eclesia nasceu com o propósito de edificar a fé dos católicos, divulgando o rico patrimônio espiritual da Igreja,
          a vida dos Santos, a oração diária e a sã doutrina. Todos os nossos conteúdos e interações seguem o compromisso irrenunciável
          com o Magistério da Igreja e o amor fraterno.
        </p>
      </div>

      <div className="font-sans text-[#4f4535] space-y-8 leading-relaxed">

        <section className="bg-white border border-[#d3c4af]/60 rounded-xl p-6 space-y-3">
          <h2 className="font-display text-xl font-bold text-[#1c1b1b]">✝ 1. Fidelidade ao Magistério da Igreja</h2>
          <p>
            Todos os artigos, orações e reflexões publicados na Eclesia devem estar em plena harmonia com a Sagrada Tradição,
            as Sagradas Escrituras e o Magistério perene da Santa Sé.
          </p>
          <ul className="list-disc list-inside space-y-1 ml-2 text-sm">
            <li>Referência fiel ao Catecismo da Igreja Católica e documentos papais</li>
            <li>Reverência ao Santo Padre e à hierarquia eclesiástica</li>
            <li>Zelo pela pureza da fé e combate pastoral a heresias</li>
          </ul>
        </section>

        <section className="bg-white border border-[#d3c4af]/60 rounded-xl p-6 space-y-3">
          <h2 className="font-display text-xl font-bold text-[#1c1b1b]">✝ 2. Caridade e Edificação</h2>
          <p>
            Toda comunicação deve ter como propósito a glória de Deus e a salvação das almas. Em momentos de formação e discussão
            teológica, pautamos nossas matérias pelo respeito à dignidade humana e pela veracidade factual.
          </p>
        </section>

        <section className="bg-white border border-[#d3c4af]/60 rounded-xl p-6 space-y-3">
          <h2 className="font-display text-xl font-bold text-[#1c1b1b]">✝ 3. Integridade na Curadoria da Loja</h2>
          <p>
            Os produtos, livros e sacramentais sugeridos e comercializados na Loja Eclesia passam por criteriosa avaliação para
            garantir valor devocional autêntico, qualidade sacra e fornecedores confiáveis.
          </p>
        </section>

        {/* Closing Quote */}
        <div className="bg-[#f6f3f2] border-l-4 border-[#785600] pl-6 py-4 pr-4 rounded-r-xl mt-8">
          <blockquote className="font-display text-lg italic text-[#1c1b1b] leading-relaxed">
            "Tudo o que é verdadeiro, tudo o que é nobre, tudo o que é justo, tudo o que é puro, tudo o que é amável, tudo o que é de boa fama, se há alguma virtude e se há algum louvor, seja isso o que ocupe os vossos pensamentos."
          </blockquote>
          <cite className="font-sans text-xs text-[#817563] mt-2 block">Filipenses 4,8</cite>
        </div>

        <div className="bg-[#f6f3f2] border border-[#d3c4af]/60 rounded-xl p-6 mt-10 text-center">
          <p className="font-sans text-xs text-[#817563]">
            © 2026 Eclesia Editorial. Ad Majorem Dei Gloriam.
          </p>
        </div>
      </div>
    </div>
  );
};
