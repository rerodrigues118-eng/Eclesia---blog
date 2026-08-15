import React, { useState } from 'react';
import { Search, Newspaper, BookOpen, TrendingUp, Calendar, Clock, ArrowRight, Filter, Check } from 'lucide-react';
import { Essay } from '../types';
import { useNewsletter } from '../hooks/useNewsletter';

interface BlogViewProps {
  onSelectEssay: (essay: Essay) => void;
  articles?: Essay[];
}

export const BlogView: React.FC<BlogViewProps> = ({ onSelectEssay, articles = [] }) => {
  const [selectedFormat, setSelectedFormat] = useState<'all' | 'artigo' | 'noticia'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const { email: newsletterEmail, setEmail: setNewsletterEmail, subscribed: newsletterSubscribed, handleSubmit: handleNewsletterSubmit } = useNewsletter();

  const categories = ['all', 'Vaticano', 'Teologia', 'História', 'Cultura', 'Notícias'];

  const filteredPosts = articles.filter((essay) => {
    const matchesFormat =
      selectedFormat === 'all'
        ? true
        : selectedFormat === 'artigo'
        ? essay.type === 'artigo' || !essay.type
        : essay.type === 'noticia';

    const matchesCategory =
      selectedCategory === 'all' ? true : (essay.category || '').toLowerCase() === selectedCategory.toLowerCase();

    const matchesSearch =
      (essay.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (essay.excerpt || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (essay.author || '').toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFormat && matchesCategory && matchesSearch;
  });

  const featuredPost = filteredPosts[0] || articles[0];
  const gridPosts = filteredPosts.filter((e) => e.id !== featuredPost?.id);
  const trendingPosts = articles.filter((e) => e.id !== featuredPost?.id).slice(0, 3);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-20 space-y-10">
      {/* Page Title & Subtitle */}
      <div className="border-b border-[#d3c4af]/50 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[#785600] font-sans text-xs font-bold uppercase tracking-widest mb-1">
            <Newspaper className="w-4 h-4" /> Editorial & Atualidades
          </div>
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-[#1c1b1b] tracking-tight">
            Blog: Artigos & Notícias
          </h1>
          <p className="font-sans text-sm md:text-base text-[#4f4535] mt-2 max-w-2xl leading-relaxed">
            Reflexões teológicas profundas, ensaios históricos e as principais atualidades da Igreja e do Vaticano.
          </p>
        </div>

        {/* Quick Format Toggle */}
        <div className="flex bg-[#f0eded] p-1 rounded-lg border border-[#d3c4af]/50 self-start md:self-auto">
          <button
            onClick={() => setSelectedFormat('all')}
            className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded transition-all cursor-pointer ${
              selectedFormat === 'all'
                ? 'bg-white text-[#1c1b1b] shadow-xs'
                : 'text-[#4f4535] hover:text-[#1c1b1b]'
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => setSelectedFormat('artigo')}
            className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded transition-all flex items-center gap-1.5 cursor-pointer ${
              selectedFormat === 'artigo'
                ? 'bg-[#785600] text-white shadow-xs'
                : 'text-[#4f4535] hover:text-[#1c1b1b]'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" /> Artigos
          </button>
          <button
            onClick={() => setSelectedFormat('noticia')}
            className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded transition-all flex items-center gap-1.5 cursor-pointer ${
              selectedFormat === 'noticia'
                ? 'bg-[#9a3e3c] text-white shadow-xs'
                : 'text-[#4f4535] hover:text-[#1c1b1b]'
            }`}
          >
            <Newspaper className="w-3.5 h-3.5" /> Notícias
          </button>
        </div>
      </div>

      {/* Hero Featured Article/News Banner (Design Retangular, Compacto e Elegante) */}
      {featuredPost ? (
        <section
          onClick={() => onSelectEssay(featuredPost)}
          className="group cursor-pointer bg-white border border-[#d3c4af]/70 rounded-2xl overflow-hidden shadow-xs hover:shadow-md hover:border-[#785600]/60 transition-all grid grid-cols-1 lg:grid-cols-12 items-stretch"
        >
          {/* Imagem Retangular em Proporção Paisagem Compacta */}
          <div className="lg:col-span-5 relative w-full h-52 sm:h-64 lg:h-full min-h-[220px] lg:min-h-[250px] max-h-[300px] overflow-hidden bg-[#1c1b1b]">
            <img
              src={featuredPost.imageUrl}
              alt={featuredPost.title}
              className="w-full h-full object-cover object-center aspect-[16/9] lg:aspect-auto group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute top-3 left-3 flex gap-2 z-10">
              <span className={`px-2.5 py-1 text-[11px] font-bold uppercase tracking-widest rounded-md text-white shadow-md ${
                featuredPost.type === 'noticia' ? 'bg-[#9a3e3c]' : 'bg-[#785600]'
              }`}>
                {featuredPost.type === 'noticia' ? 'Notícia em Destaque' : 'Artigo em Destaque'}
              </span>
            </div>
          </div>

          {/* Conteúdo do Destaque */}
          <div className="lg:col-span-7 p-6 sm:p-7 flex flex-col justify-between bg-[#fcf9f8]">
            <div className="space-y-2.5">
              <div className="flex items-center gap-2 text-xs text-[#817563] font-sans">
                <span className="font-bold uppercase tracking-wider text-[#785600]">{featuredPost.category}</span>
                <span>•</span>
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {featuredPost.date}</span>
              </div>

              <h2 className="font-display text-xl sm:text-2xl lg:text-3xl font-bold text-[#1c1b1b] group-hover:text-[#785600] transition-colors leading-snug">
                {featuredPost.title}
              </h2>

              <p className="font-sans text-xs sm:text-sm text-[#4f4535] leading-relaxed line-clamp-2 sm:line-clamp-3">
                {featuredPost.excerpt}
              </p>
            </div>

            <div className="pt-4 border-t border-[#d3c4af]/40 mt-4 flex items-center justify-between">
              <div className="text-xs text-[#817563]">
                <p className="font-bold text-[#1c1b1b]">{featuredPost.author}</p>
                <p className="flex items-center gap-1 mt-0.5"><Clock className="w-3 h-3" /> {featuredPost.readTime}</p>
              </div>

              <span className="text-xs font-bold text-[#785600] flex items-center gap-1 group-hover:translate-x-1 transition-transform uppercase tracking-wider">
                Ler matéria <ArrowRight className="w-4 h-4" />
              </span>
            </div>
          </div>
        </section>
      ) : (
        <div className="text-center py-12 bg-white border border-[#d3c4af]/50 rounded-2xl p-8 space-y-3">
          <BookOpen className="w-10 h-10 text-[#785600] mx-auto opacity-50" />
          <h3 className="font-display text-xl font-bold text-[#1c1b1b]">Nenhum artigo publicado no momento</h3>
          <p className="font-sans text-xs sm:text-sm text-[#4f4535] max-w-md mx-auto">
            Os artigos e notícias são sincronizados em tempo real com o banco de dados. Cadastre publicações pelo painel administrativo.
          </p>
        </div>
      )}

      {/* Filters & Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-[#f6f3f2] p-4 rounded-xl border border-[#d3c4af]/50">
        {/* Category Filter Pills */}
        <div className="flex flex-wrap gap-2 items-center w-full md:w-auto">
          <span className="font-sans text-xs font-bold uppercase tracking-widest text-[#817563] flex items-center gap-1 mr-1">
            <Filter className="w-3.5 h-3.5" /> Categoria:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 text-xs font-sans font-semibold rounded-full transition-all cursor-pointer ${
                selectedCategory.toLowerCase() === cat.toLowerCase()
                  ? 'bg-[#1c1b1b] text-white shadow-xs'
                  : 'bg-white border border-[#d3c4af]/60 text-[#4f4535] hover:border-[#785600]'
              }`}
            >
              {cat === 'all' ? 'Todas' : cat}
            </button>
          ))}
        </div>

        {/* Search Field */}
        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 text-[#817563] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar notícias e artigos..."
            className="w-full pl-9 pr-3 py-1.5 bg-white border border-[#d3c4af] rounded-lg font-sans text-xs text-[#1c1b1b] placeholder:text-[#817563] focus:border-[#785600] focus:ring-0"
          />
        </div>
      </div>

      {/* Main Content Layout: Grid + Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Articles & News List */}
        <div className="lg:col-span-8 space-y-6">
          {filteredPosts.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-[#d3c4af]/40 p-8 space-y-3">
              <BookOpen className="w-10 h-10 text-[#817563] mx-auto opacity-40" />
              <h3 className="font-display text-xl font-bold text-[#1c1b1b]">Nenhuma publicação encontrada</h3>
              <p className="font-sans text-sm text-[#4f4535]">
                Tente ajustar os filtros de busca ou categoria para encontrar o conteúdo desejado.
              </p>
              <button
                onClick={() => {
                  setSelectedFormat('all');
                  setSelectedCategory('all');
                  setSearchQuery('');
                }}
                className="px-4 py-2 bg-[#1c1b1b] text-white text-xs font-bold uppercase tracking-widest rounded-lg hover:bg-[#785600] transition-colors mt-2 inline-block cursor-pointer"
              >
                Limpar Filtros
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {(gridPosts.length > 0 ? gridPosts : filteredPosts).map((essay) => (
                <article
                  key={essay.id}
                  onClick={() => onSelectEssay(essay)}
                  className="group cursor-pointer bg-white rounded-xl border border-[#d3c4af]/50 overflow-hidden shadow-2xs hover:border-[#785600] hover:shadow-sm transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="aspect-[16/10] overflow-hidden relative bg-[#1c1b1b]">
                      <img
                        src={essay.imageUrl}
                        alt={essay.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <span className={`absolute top-3 left-3 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest rounded text-white ${
                        essay.type === 'noticia' ? 'bg-[#9a3e3c]' : 'bg-[#785600]'
                      }`}>
                        {essay.type === 'noticia' ? 'Notícia' : 'Artigo'}
                      </span>
                    </div>

                    <div className="p-5 space-y-2">
                      <div className="flex items-center justify-between text-[11px] text-[#817563]">
                        <span className="font-bold uppercase tracking-wider text-[#785600]">{essay.category}</span>
                        <span>{essay.date}</span>
                      </div>

                      <h3 className="font-display text-lg sm:text-xl font-bold text-[#1c1b1b] group-hover:text-[#785600] transition-colors leading-snug line-clamp-2">
                        {essay.title}
                      </h3>

                      <p className="font-sans text-xs text-[#4f4535] line-clamp-3 leading-relaxed">
                        {essay.excerpt}
                      </p>
                    </div>
                  </div>

                  <div className="px-5 py-3 border-t border-[#d3c4af]/30 bg-[#fcf9f8] flex items-center justify-between text-[11px] text-[#817563]">
                    <span className="font-semibold text-[#1c1b1b]">{essay.author}</span>
                    <span>{essay.readTime}</span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        {/* Right Sidebar: Trending & Newsletter */}
        <aside className="lg:col-span-4 space-y-6">
          {/* Trending / Populares */}
          <div className="bg-white p-6 rounded-xl border border-[#d3c4af]/60 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-[#d3c4af]/40">
              <TrendingUp className="w-4 h-4 text-[#785600]" />
              <h3 className="font-display text-lg font-bold text-[#1c1b1b]">Mais Lidos & Notícias</h3>
            </div>

            {trendingPosts.length > 0 ? (
              <div className="space-y-4">
                {trendingPosts.map((post, idx) => (
                  <div
                    key={post.id}
                    onClick={() => onSelectEssay(post)}
                    className="group cursor-pointer flex gap-3 items-start pb-3 border-b border-[#d3c4af]/30 last:border-0 last:pb-0"
                  >
                    <span className="font-display text-2xl font-bold text-[#d3c4af] group-hover:text-[#785600] transition-colors w-6">
                      0{idx + 1}
                    </span>
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[#785600]">
                        {post.category}
                      </span>
                      <h4 className="font-display text-sm font-semibold text-[#1c1b1b] group-hover:text-[#785600] transition-colors leading-snug">
                        {post.title}
                      </h4>
                      <p className="text-[11px] text-[#817563]">{post.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#817563]">Nenhum artigo adicional no momento.</p>
            )}
          </div>

          {/* Dedicated Blog Newsletter Box */}
          <div className="bg-[#1c1b1b] text-white p-6 rounded-xl space-y-4 relative overflow-hidden">
            <div className="space-y-2 relative z-10">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#f7bd48]">
                Informativo Diário
              </span>
              <h3 className="font-display text-xl font-bold">Receba os Artigos & Notícias</h3>
              <p className="font-sans text-xs text-gray-300 leading-relaxed">
                Cadastre seu e-mail para receber as análises teológicas e o boletim de notícias católicas da Eclesia em sua caixa de entrada.
              </p>
            </div>

            {newsletterSubscribed ? (
              <div className="bg-[#1c5d3a]/20 border border-[#1c5d3a]/40 text-emerald-300 p-3 rounded-lg text-xs flex items-center gap-2 font-semibold">
                <Check className="w-4 h-4" /> Cadastrado com sucesso!
              </div>
            ) : (
              <form onSubmit={handleNewsletterSubmit} className="space-y-2 relative z-10">
                <input
                  type="email"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="Seu melhor e-mail"
                  required
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 text-white rounded-lg text-xs placeholder:text-gray-400 focus:outline-none focus:border-[#f7bd48]"
                />
                <button
                  type="submit"
                  className="w-full py-2 bg-[#785600] hover:bg-[#9a7000] text-white text-xs font-bold uppercase tracking-widest rounded-lg transition-colors cursor-pointer"
                >
                  Assinar Boletim
                </button>
              </form>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
};
