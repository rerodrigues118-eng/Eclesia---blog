import React, { useState } from 'react';
import { ArrowRight, Sparkles, Church, ShoppingBag, Check, MapPin, Navigation } from 'lucide-react';
import { ActiveView, Saint, Essay } from '../types';
import { SAINTS_DATA, ESSAYS_DATA, PRODUCTS_DATA } from '../data/eclesiaData';

interface HomeViewProps {
  setActiveView: (view: ActiveView) => void;
  onSelectSaint: (saint: Saint) => void;
  onSelectEssay: (essay: Essay) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  setActiveView,
  onSelectSaint,
  onSelectEssay
}) => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const saintOfTheDay = SAINTS_DATA.find((s) => s.id === 'santa-teresinha') || SAINTS_DATA[1];

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setTimeout(() => {
        setSubscribed(false);
        setEmail('');
      }, 4000);
    }
  };

  return (
    <div className="w-full max-w-[1120px] mx-auto px-4 md:px-12 pt-8 pb-20 space-y-16">
      {/* Hero Section: Saint of the Day & Liturgy Summary */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Daily Liturgy Summary (Left Column) */}
        <div className="lg:col-span-4 space-y-8 border-t lg:border-t-0 lg:border-r border-[#d3c4af]/50 pt-6 lg:pt-0 lg:pr-8">
          <div className="space-y-3">
            <span className="inline-block px-3 py-1 bg-[#9a3e3c] text-white font-sans text-xs font-bold tracking-widest uppercase rounded-full">
              Tempo Comum
            </span>
            <div className="flex items-center justify-between">
              <h2 className="font-display text-2xl font-semibold text-[#1c1b1b]">Liturgia Diária</h2>
              <button
                onClick={() => setActiveView('liturgia')}
                className="text-xs font-bold text-[#785600] hover:underline uppercase tracking-wider flex items-center gap-1"
              >
                Ler hoje <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            <p className="font-sans text-sm text-[#4f4535] leading-relaxed">
              Leitura do Livro do Profeta Zacarias (Zc 8,20-23)<br />
              Salmo 86(87)<br />
              Evangelho de Jesus Cristo segundo Lucas (Lc 9,51-56)
            </p>
          </div>

          <div className="pt-6 border-t border-[#d3c4af]/50">
            <h3 className="font-display text-xl font-semibold text-[#1c1b1b] mb-3">Oração do Dia</h3>
            <blockquote className="font-sans text-sm text-[#4f4535] italic border-l-2 border-[#785600] pl-4 py-1 leading-relaxed">
              "Ó Deus, que preparastes o vosso Reino para os pequeninos e humildes, dai-nos seguir confiantes o caminho de Santa Teresa, para que, por sua intercessão, nos seja revelada a vossa glória. Por nosso Senhor Jesus Cristo, vosso Filho, na unidade do Espírito Santo."
            </blockquote>
          </div>
        </div>

        {/* Saint of the Day Feature (Right Column) */}
        <div
          onClick={() => onSelectSaint(saintOfTheDay)}
          className="lg:col-span-8 bg-white rounded border border-[#d3c4af]/60 p-1 shadow-sm relative overflow-hidden group cursor-pointer hover:shadow-md transition-all"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent z-10 pointer-events-none"></div>
          <img
            src={saintOfTheDay.imageUrl}
            alt={saintOfTheDay.name}
            className="w-full h-[420px] md:h-[480px] object-cover rounded transition-transform duration-700 group-hover:scale-102"
          />
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 z-20 text-white">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-[#ffdea6]" />
              <span className="font-sans text-xs font-bold text-[#ffdea6] tracking-widest uppercase">
                Santo do Dia
              </span>
            </div>
            <h1 className="font-display text-3xl md:text-5xl font-bold mb-2 tracking-tight">
              {saintOfTheDay.name}
            </h1>
            <p className="font-sans text-sm md:text-base text-gray-200 max-w-2xl leading-relaxed">
              {saintOfTheDay.summary}
            </p>
          </div>
        </div>
      </section>

      <hr className="border-t border-[#d3c4af]/40" />

      {/* Editorial & News Section (Blog) */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3 pb-2 border-b border-[#d3c4af]/50">
          <div>
            <span className="font-sans text-xs text-[#785600] uppercase tracking-widest font-bold">
              Blog Eclesia • Editorial & Notícias
            </span>
            <h2 className="font-display text-3xl font-semibold text-[#1c1b1b]">Artigos & Notícias</h2>
          </div>
          <button
            onClick={() => setActiveView('blog')}
            className="font-sans text-xs font-bold text-[#785600] hover:text-[#9a7000] transition-colors flex items-center gap-1 uppercase tracking-widest bg-[#f6f3f2] px-4 py-2 rounded-full border border-[#d3c4af]/60"
          >
            Ver Blog Completo <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {ESSAYS_DATA.slice(0, 3).map((essay) => (
            <article
              key={essay.id}
              onClick={() => onSelectEssay(essay)}
              className="group cursor-pointer bg-white p-3 rounded-lg border border-[#d3c4af]/50 hover:border-[#785600] transition-all flex flex-col justify-between shadow-2xs hover:shadow-xs"
            >
              <div>
                <div className="aspect-[16/10] mb-3 overflow-hidden rounded relative border border-[#d3c4af]/30">
                  <img
                    src={essay.imageUrl}
                    alt={essay.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <span className={`absolute top-2 left-2 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest rounded text-white ${
                    essay.type === 'noticia' ? 'bg-[#9a3e3c]' : 'bg-[#785600]'
                  }`}>
                    {essay.type === 'noticia' ? 'Notícia' : 'Artigo'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-[#817563] mb-1">
                  <span className="font-sans font-bold text-[#785600] tracking-widest uppercase">
                    {essay.category}
                  </span>
                  <span>{essay.date}</span>
                </div>
                <h3 className="font-display text-lg font-bold text-[#1c1b1b] group-hover:text-[#785600] transition-colors leading-snug">
                  {essay.title}
                </h3>
                <p className="font-sans text-xs text-[#4f4535] mt-2 line-clamp-3 leading-relaxed">
                  {essay.excerpt}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-[#d3c4af]/30 flex justify-between items-center text-[11px] text-[#817563]">
                <span className="font-semibold text-[#1c1b1b]">{essay.author}</span>
                <span>{essay.readTime}</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Church Locator Banner */}
      <section className="bg-gradient-to-r from-[#785600] to-[#593f00] text-white rounded-xl p-6 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm relative overflow-hidden">
        <div className="space-y-2 max-w-xl relative z-10">
          <div className="flex items-center gap-2 text-[#f7bd48] text-xs font-bold uppercase tracking-widest">
            <MapPin className="w-4 h-4" /> Encontre Igrejas & Horários de Missa
          </div>
          <h3 className="font-display text-2xl md:text-3xl font-bold leading-tight">
            Procurando uma igreja católica perto de você?
          </h3>
          <p className="font-sans text-xs md:text-sm text-amber-100/90 leading-relaxed">
            Localize paróquias, catedrais e santuários católicos utilizando o mapa interativo. Consulte horários de missas, confissões e trace rotas.
          </p>
        </div>

        <button
          onClick={() => setActiveView('igrejas')}
          className="px-6 py-3.5 bg-[#f7bd48] hover:bg-[#ffcd66] text-[#1c1b1b] font-sans text-xs font-bold uppercase tracking-widest rounded-lg transition-all flex items-center gap-2 shrink-0 shadow-md cursor-pointer relative z-10"
        >
          <Navigation className="w-4 h-4" /> Buscar Igrejas Próximas
        </button>
      </section>

      {/* Catholic Social Network Banner */}
      <section className="bg-[#1c1b1b] text-white rounded-xl p-6 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-md relative overflow-hidden border border-[#785600]">
        <div className="space-y-2 max-w-xl relative z-10">
          <div className="flex items-center gap-2 text-[#f7bd48] text-xs font-bold uppercase tracking-widest">
            <Sparkles className="w-4 h-4 text-[#f7bd48]" /> Rede Social Católica & Comunidades
          </div>
          <h3 className="font-display text-2xl md:text-3xl font-bold leading-tight">
            Partilhe sua caminhada de fé com segurança
          </h3>
          <p className="font-sans text-xs md:text-sm text-gray-300 leading-relaxed">
            Participe de grupos de oração, novenas comunitárias, bate-papo paroquial e feed de partilha espiritual com moderação em camada dupla e proteção integral a jovens.
          </p>
        </div>

        <button
          onClick={() => setActiveView('comunidade')}
          className="px-6 py-3.5 bg-[#785600] hover:bg-[#9a7000] text-white font-sans text-xs font-bold uppercase tracking-widest rounded-lg transition-all flex items-center gap-2 shrink-0 shadow-md cursor-pointer relative z-10"
        >
          Acessar Comunidades →
        </button>
      </section>

      {/* Newsletter & Shop Bento Section */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Newsletter CTA */}
        <div className="bg-[#f6f3f2] border border-[#d3c4af]/60 rounded p-8 md:p-10 flex flex-col justify-center relative overflow-hidden">
          <Church className="absolute -right-8 -bottom-8 w-64 h-64 text-[#d3c4af]/20 pointer-events-none" />
          <div className="relative z-10">
            <h3 className="font-display text-2xl md:text-3xl font-semibold text-[#1c1b1b] mb-3">
              Assine a Eclesia
            </h3>
            <p className="font-sans text-sm text-[#4f4535] mb-6 max-w-md leading-relaxed">
              Receba reflexões teológicas exclusivas, resumos litúrgicos e novidades editoriais diretamente em seu e-mail. Ad Majorem Dei Gloriam.
            </p>

            {subscribed ? (
              <div className="bg-[#1c5d3a]/10 border border-[#1c5d3a]/30 text-[#1c5d3a] p-4 rounded flex items-center gap-3">
                <Check className="w-5 h-5 text-[#1c5d3a]" />
                <span className="font-sans text-sm font-semibold">Inscrição realizada com sucesso! Deo Gratias.</span>
              </div>
            ) : (
              <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Seu e-mail"
                  required
                  className="flex-1 bg-white border border-[#d3c4af] focus:border-[#785600] focus:ring-0 px-4 py-2.5 font-sans text-sm text-[#1c1b1b] rounded placeholder:text-[#817563]"
                />
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#1c1b1b] text-white font-sans text-xs font-bold uppercase tracking-widest rounded hover:bg-[#785600] transition-colors whitespace-nowrap"
                >
                  Inscrever-se
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Mini Shop Showcase */}
        <div className="bg-white border border-[#d3c4af]/60 rounded p-8 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="font-display text-2xl font-semibold text-[#1c1b1b]">A Loja Eclesia</h3>
              <p className="font-sans text-sm text-[#4f4535] mt-1">Curadoria de livros e sacramentais para a vida de oração.</p>
            </div>
            <button
              onClick={() => setActiveView('loja')}
              className="w-10 h-10 rounded-full border border-[#d3c4af] flex items-center justify-center hover:bg-[#f0eded] transition-colors text-[#1c1b1b]"
              title="Ir para a loja"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          <div className="flex gap-4">
            {PRODUCTS_DATA.slice(0, 2).map((product) => (
              <div
                key={product.id}
                onClick={() => setActiveView('loja')}
                className="w-1/3 aspect-[3/4] bg-[#fcf9f8] border border-[#d3c4af]/50 p-1.5 rounded shadow-xs group cursor-pointer hover:border-[#785600] transition-colors"
              >
                <img
                  src={product.imageUrl}
                  alt={product.title}
                  className="w-full h-full object-cover rounded-xs group-hover:opacity-90 transition-opacity"
                />
              </div>
            ))}
            <div
              onClick={() => setActiveView('loja')}
              className="w-1/3 aspect-[3/4] flex flex-col items-center justify-center border border-dashed border-[#d3c4af] rounded hover:bg-[#f6f3f2] transition-colors cursor-pointer text-[#817563] hover:text-[#785600]"
            >
              <ShoppingBag className="w-6 h-6 mb-2" />
              <span className="font-sans text-xs font-bold uppercase tracking-wider text-center leading-tight">
                Ver<br />Catálogo
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
