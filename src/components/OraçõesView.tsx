import React, { useState } from 'react';
import { BookOpen, Sparkles, Search, Filter, Share2, Check, ArrowLeft } from 'lucide-react';
import { PrayerItem } from '../types';

export const PRAYERS_DATA: PrayerItem[] = [
  {
    id: '1',
    title: 'Oração pela Cura e Saúde',
    slug: 'oracao-pela-cura-e-saude',
    situation: 'Saúde',
    content: `Senhor Jesus Cristo, que durante Vossa vida na terra curastes os enfermos e consolastes os que sofriam, olhai com misericórdia para este vosso servo que vos implora.

Pela Vossa santa agonia e pela intercessão da Santíssima Virgem Maria, nossa Mãe, e de todos os Santos, afastai a doença que aflige o corpo e restaurai as forças da saúde, para que com vigor renovado possa louvai-Vos e servir-Vos.

Não nos deixeis desanimar na prova, mas que a tribulação do momento presente nos prepare para a glória eterna que nos prometestes. Amém.`,
    isFeaturedToday: true
  },
  {
    id: '2',
    title: 'Oração pelo Trabalho e Sustento',
    slug: 'oracao-pelo-trabalho-e-sustento',
    situation: 'Trabalho',
    content: `São José, padroeiro dos trabalhadores e guardião da Sagrada Família, intercedei por mim perante o Pai Celestial.

Ajudai-me a encontrar trabalho digno com que possa sustentar minha família e contribuir para o bem de todos. Concedei-me competência, honestidade e diligência em minha profissão.

Que o fruto de meu trabalho seja bênção para os meus e glória para Deus, que é o Senhor de toda obra boa. Amém.`
  },
  {
    id: '3',
    title: 'Oração pela Família',
    slug: 'oracao-pela-familia',
    situation: 'Família',
    content: `Sagrada Família de Nazaré, modelo de amor, obediência e serviço, protegei nossa família.

Que reine em nosso lar o amor de Jesus, a ternura de Maria e a fortaleza de José. Que nossas refeições sejam partilha, nossas alegrias sejam ação de graças e nossas tristezas sejam unidas à Cruz de Cristo.

Afastai de nós toda discórdia, e fazei de nosso lar uma pequena Igreja doméstica, onde cada membro cresça em santidade e amor a Vós. Amém.`
  },
  {
    id: '4',
    title: 'Oração no Luto e na Perda',
    slug: 'oracao-no-luto-e-na-perda',
    situation: 'Luto',
    content: `Senhor da vida e da ressurreição, que chorastes diante do túmulo de Lázaro e consolastes Maria Madalena no jardim da Páscoa, consolai meu coração ferido pela perda daquele que amei.

Que a fé na ressurreição seja minha âncora nesta dor. Crede que aquele que morreu em Vós não pereceu, mas passou desta vida para a Vida Eterna que prometestes.

Dai-me força para atravessar este vale de lágrimas com a esperança que não envergonha, sabendo que nos reuniremos na Vossa glória. Amém.`
  },
  {
    id: '5',
    title: 'Oração de Gratidão',
    slug: 'oracao-de-gratidao',
    situation: 'Gratidão',
    content: `Bom Deus, Pai de toda bondade, de quem procedem todos os dons perfeitos, elevo meu coração a Vós em ação de graças.

Obrigado pela vida, pela saúde, pela fé, pela família, pelos amigos e por tantos bens que não mereço, mas que generosamente concedeis. Obrigado pelas provas que purificam, pelas esperas que ensinam e pelas graças que sustentam.

Que minha gratidão não seja apenas de palavras, mas de uma vida inteira a Vos servir com alegria. Deo Gratias! Amém.`
  },
  {
    id: '6',
    title: 'Oração pela Proteção Espiritual',
    slug: 'oracao-pela-protecao-espiritual',
    situation: 'Proteção',
    content: `São Miguel Arcanjo, defendei-nos no combate. Sede nosso socorro contra a malícia e as ciladas do demônio.

Que Deus lhe imponha a sua autoridade, é o nosso humilde pedido. E vós, príncipe da milícia celestial, precipitai no inferno, pelo divino poder, Satanás e os outros espíritos malignos que vagam pelo mundo para a perdição das almas.

Arcanjo poderoso, protegei esta família, este lar e esta alma que se entregam ao vosso cuidado. Amém.`
  }
];

// ── Prayer Detail Page ─────────────────────────────────────────────
const PrayerDetail: React.FC<{ prayer: PrayerItem; onBack: () => void }> = ({ prayer, onBack }) => {
  const [copied, setCopied] = useState(false);
  const prayerText = prayer.content || prayer.text || '';
  const prayerCategory = prayer.situation || prayer.category || 'Geral';

  const handleCopy = () => {
    navigator.clipboard.writeText(`${prayer.title}\n\n${prayerText}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-20 animate-fade-in">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-[#785600] hover:text-[#9a7000] font-sans text-xs font-bold uppercase tracking-wider mb-6 cursor-pointer transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Voltar às Orações
      </button>

      <div className="space-y-4 mb-6">
        <span className="inline-block px-3 py-1 bg-[#785600]/10 text-[#785600] text-[11px] font-bold uppercase tracking-widest rounded-full">
          {prayerCategory}
        </span>

        <h1 className="font-display text-3xl md:text-5xl font-bold text-[#1c1b1b] leading-tight">
          {prayer.title}
        </h1>

        {prayer.description && (
          <p className="font-sans text-sm text-[#817563] italic">
            {prayer.description}
          </p>
        )}
      </div>

      {/* Featured Prayer Image if present */}
      {prayer.imageUrl && (
        <div className="aspect-[16/9] md:aspect-[21/9] rounded-2xl overflow-hidden border border-[#d3c4af]/60 mb-8 shadow-xs">
          <img
            src={prayer.imageUrl}
            alt={prayer.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="bg-white border-2 border-[#785600]/30 rounded-2xl p-6 md:p-10 shadow-sm relative overflow-hidden mb-8">
        {/* decorative cross watermark */}
        <div className="absolute top-4 right-4 opacity-5 pointer-events-none select-none">
          <svg viewBox="0 0 64 64" className="w-32 h-32 fill-[#785600]">
            <rect x="27" y="4" width="10" height="56" rx="3"/>
            <rect x="8" y="22" width="48" height="10" rx="3"/>
          </svg>
        </div>

        <div className="flex items-start gap-2 mb-6 relative z-10">
          <Sparkles className="w-4 h-4 text-[#785600] shrink-0 mt-0.5" />
          <span className="font-sans text-xs font-bold uppercase tracking-widest text-[#785600]">
            Texto Completo da Oração
          </span>
        </div>

        <blockquote className="font-sans text-base md:text-lg text-[#2d2a22] leading-[1.9] whitespace-pre-line italic border-l-4 border-[#785600] pl-5 md:pl-7 relative z-10 font-serif">
          {prayerText}
        </blockquote>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={handleCopy}
          className="flex-1 py-3 bg-[#785600] hover:bg-[#9a7000] text-white font-sans text-xs font-bold uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
        >
          {copied ? (
            <><Check className="w-4 h-4" /> Oração Copiada!</>
          ) : (
            <><Share2 className="w-4 h-4" /> Copiar Oração</>
          )}
        </button>
        <button
          onClick={onBack}
          className="flex-1 py-3 bg-[#f0eded] hover:bg-[#e0d8cf] text-[#4f4535] font-sans text-xs font-bold uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <BookOpen className="w-4 h-4" /> Ver Outras Orações
        </button>
      </div>
    </div>
  );
};

// ── Main OraçõesView ───────────────────────────────────────────────
export const OraçõesView: React.FC<{ prayers?: PrayerItem[] }> = ({ prayers = PRAYERS_DATA }) => {
  const [selectedSituation, setSelectedSituation] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedPrayer, setSelectedPrayer] = useState<PrayerItem | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const featuredPrayer = prayers.find((p) => p.isFeaturedToday || p.isDaySpecial) || prayers[0];

  const situations = ['all', 'diarias', 'marianas', 'santos', 'latim'];

  const filteredPrayers = prayers.filter((p) => {
    const pCategory = p.category || p.situation || '';
    const matchSituation =
      selectedSituation === 'all' ||
      pCategory.toLowerCase() === selectedSituation.toLowerCase() ||
      (selectedSituation === 'diarias' && (pCategory === 'Saúde' || pCategory === 'Trabalho' || pCategory === 'Família' || pCategory === 'Gratidão' || pCategory === 'Luto'));

    const pText = (p.text || p.content || '').toLowerCase();
    const pTitle = (p.title || '').toLowerCase();
    const q = searchQuery.toLowerCase().trim();
    const matchSearch =
      !q ||
      pTitle.includes(q) ||
      pText.includes(q) ||
      pCategory.toLowerCase().includes(q);

    return matchSituation && matchSearch;
  });

  const handleCopy = (prayer: PrayerItem) => {
    const text = prayer.content || prayer.text || '';
    navigator.clipboard.writeText(`${prayer.title}\n\n${text}`);
    setCopiedId(prayer.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  if (selectedPrayer) {
    return <PrayerDetail prayer={selectedPrayer} onBack={() => setSelectedPrayer(null)} />;
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20 space-y-10 animate-fade-in">
      {/* Header */}
      <div className="border-b border-[#d3c4af]/50 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="font-sans text-xs font-bold text-[#785600] uppercase tracking-widest block mb-1">
            Devocionário Católico
          </span>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-[#1c1b1b] tracking-tight">
            Orações Tradicionais
          </h1>
          <p className="font-sans text-sm md:text-base text-[#4f4535] mt-2 max-w-2xl leading-relaxed">
            Preces da Santa Igreja, orações dos santos doutores, devoções marianas e orações diárias para sua elevação a Deus.
          </p>
        </div>
      </div>

      {/* Featured Prayer of the Day */}
      {featuredPrayer && (
        <div className="bg-white border-2 border-[#785600]/30 rounded-3xl p-6 sm:p-10 shadow-xs relative overflow-hidden">
          <div className="flex flex-col lg:flex-row gap-6 items-start justify-between">
            <div className="space-y-3 flex-1">
              <span className="inline-block px-3 py-1 bg-[#785600] text-white text-[10px] font-bold uppercase tracking-widest rounded-full">
                ★ Oração do Dia
              </span>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#1c1b1b]">
                {featuredPrayer.title}
              </h2>
              <blockquote className="font-sans text-sm md:text-base text-[#4f4535] leading-relaxed line-clamp-3 italic font-serif">
                "{featuredPrayer.text || featuredPrayer.content}"
              </blockquote>
            </div>

            {featuredPrayer.imageUrl && (
              <div className="w-full lg:w-48 h-32 rounded-2xl overflow-hidden border border-[#d3c4af]/60 shrink-0">
                <img src={featuredPrayer.imageUrl} alt={featuredPrayer.title} className="w-full h-full object-cover" />
              </div>
            )}
          </div>

          <div className="pt-6 mt-4 border-t border-[#d3c4af]/30 flex flex-wrap gap-3">
            <button
              onClick={() => setSelectedPrayer(featuredPrayer)}
              className="px-6 py-2.5 bg-[#785600] hover:bg-[#9a7000] text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all cursor-pointer shadow-sm"
            >
              Rezar Completa
            </button>
            <button
              onClick={() => handleCopy(featuredPrayer)}
              className="px-4 py-2.5 bg-[#f6f3f2] hover:bg-[#e8e2de] text-[#1c1b1b] text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center gap-1.5 border border-[#d3c4af]/60"
            >
              {copiedId === featuredPrayer.id ? <><Check className="w-3.5 h-3.5" /> Copiado!</> : <><Share2 className="w-3.5 h-3.5" /> Copiar</>}
            </button>
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-[#f6f3f2] p-4 rounded-2xl border border-[#d3c4af]/50">
        <div className="flex flex-wrap gap-2 items-center w-full md:w-auto">
          <span className="font-sans text-xs font-bold uppercase tracking-widest text-[#817563] flex items-center gap-1 mr-1">
            <Filter className="w-3.5 h-3.5" /> Categoria:
          </span>
          {[
            { id: 'all', label: 'Todas' },
            { id: 'diarias', label: 'Diárias' },
            { id: 'marianas', label: 'Marianas' },
            { id: 'santos', label: 'Santos' },
            { id: 'latim', label: 'Latim' },
          ].map((sit) => (
            <button
              key={sit.id}
              onClick={() => setSelectedSituation(sit.id)}
              className={`px-3 py-1.5 text-xs font-sans font-semibold rounded-full transition-all cursor-pointer ${
                selectedSituation.toLowerCase() === sit.id.toLowerCase()
                  ? 'bg-[#785600] text-white shadow-xs'
                  : 'bg-white border border-[#d3c4af]/60 text-[#4f4535] hover:border-[#785600]'
              }`}
            >
              {sit.label}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 text-[#817563] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar orações..."
            className="w-full pl-9 pr-3.5 py-2 bg-white border border-[#d3c4af] rounded-xl font-sans text-xs text-[#1c1b1b] placeholder:text-[#817563] focus:border-[#785600] focus:ring-0 shadow-2xs"
          />
        </div>
      </div>

      {/* Prayers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredPrayers.map((prayer) => (
          <div
            key={prayer.id}
            className="bg-white border border-[#d3c4af]/60 rounded-3xl p-6 shadow-xs space-y-4 flex flex-col justify-between hover:border-[#785600] hover:shadow-xl transition-all duration-300 group"
          >
            <div className="space-y-3">
              {prayer.imageUrl && (
                <div className="h-44 -mx-6 -mt-6 rounded-t-3xl overflow-hidden border-b border-[#d3c4af]/40 mb-3 bg-[#fcf9f8]">
                  <img
                    src={prayer.imageUrl}
                    alt={prayer.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="inline-block px-2.5 py-0.5 bg-[#785600]/10 text-[#785600] text-[10px] font-bold uppercase tracking-wider rounded-md">
                  {prayer.situation || prayer.category || 'Geral'}
                </span>
                {(prayer.isFeaturedToday || prayer.isDaySpecial) && (
                  <span className="text-[10px] font-bold uppercase text-amber-800 bg-amber-200 px-2 py-0.5 rounded-full">
                    ★ Oração do Dia
                  </span>
                )}
              </div>

              <h3
                onClick={() => setSelectedPrayer(prayer)}
                className="font-display text-xl font-bold text-[#1c1b1b] leading-snug cursor-pointer hover:text-[#785600] transition-colors"
              >
                {prayer.title}
              </h3>
              <p className="font-sans text-xs text-[#4f4535] leading-relaxed line-clamp-3 whitespace-pre-line font-serif italic">
                "{prayer.text || prayer.content}"
              </p>
            </div>

            <div className="pt-4 border-t border-[#d3c4af]/30 flex items-center gap-3">
              <button
                onClick={() => setSelectedPrayer(prayer)}
                className="flex-1 py-2.5 bg-[#785600] hover:bg-[#9a7000] text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <BookOpen className="w-3.5 h-3.5" /> Ler Completa
              </button>
              <button
                onClick={() => handleCopy(prayer)}
                className="px-3.5 py-2.5 bg-[#f0eded] hover:bg-[#e0d8cf] text-[#4f4535] text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                {copiedId === prayer.id ? (
                  <><Check className="w-3.5 h-3.5 text-emerald-600" /> Copiado!</>
                ) : (
                  <><Share2 className="w-3.5 h-3.5" /> Copiar</>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
