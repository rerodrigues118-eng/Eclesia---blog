import React, { useState } from 'react';
import {
  ShieldCheck,
  BookOpen,
  ShoppingBag,
  Heart,
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  CheckCircle2,
  ArrowLeft,
  Image as ImageIcon,
  Star,
  Layers
} from 'lucide-react';
import { Essay, Product, PrayerItem, ActiveView } from '../types';

interface AdminViewProps {
  articles: Essay[];
  onSaveArticle: (article: Essay) => void;
  onDeleteArticle: (id: string) => void;

  products: Product[];
  onSaveProduct: (product: Product) => void;
  onDeleteProduct: (id: string) => void;

  prayers: PrayerItem[];
  onSavePrayer: (prayer: PrayerItem) => void;
  onDeletePrayer: (id: string) => void;

  setActiveView: (view: ActiveView) => void;
}

export const AdminView: React.FC<AdminViewProps> = ({
  articles,
  onSaveArticle,
  onDeleteArticle,
  products,
  onSaveProduct,
  onDeleteProduct,
  prayers,
  onSavePrayer,
  onDeletePrayer,
  setActiveView,
}) => {
  const [activeTab, setActiveTab] = useState<'articles' | 'products' | 'prayers'>('articles');
  const [feedback, setFeedback] = useState<string | null>(null);

  // Article Modal State
  const [editingArticle, setEditingArticle] = useState<Essay | null>(null);
  const [isArticleModalOpen, setIsArticleModalOpen] = useState(false);

  // Product Modal State
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);

  // Prayer Modal State
  const [editingPrayer, setEditingPrayer] = useState<PrayerItem | null>(null);
  const [isPrayerModalOpen, setIsPrayerModalOpen] = useState(false);

  const showFeedback = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 4000);
  };

  // Helper for image upload to base64
  const handleImageFile = (e: React.ChangeEvent<HTMLInputElement>, setter: (val: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') setter(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#d3c4af]/50 pb-6">
        <div>
          <button
            onClick={() => setActiveView('home')}
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#785600] hover:underline mb-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Voltar ao Início
          </button>
          <div className="flex items-center gap-2 text-[#785600] text-xs font-bold uppercase tracking-widest">
            <ShieldCheck className="w-4 h-4" /> Painel de Controle Eclesia
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#1c1b1b]">
            Administração Geral do Site
          </h1>
          <p className="font-sans text-xs sm:text-sm text-[#4f4535] mt-1">
            Crie e edite artigos, produtos da loja e o acervo de orações em tempo real.
          </p>
        </div>

        <div className="flex bg-[#f0eded] p-1.5 rounded-2xl border border-[#d3c4af]/60 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('articles')}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'articles' ? 'bg-[#785600] text-white shadow-xs' : 'text-[#4f4535] hover:text-[#1c1b1b]'
            }`}
          >
            <BookOpen className="w-4 h-4" /> Artigos ({articles.length})
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'products' ? 'bg-[#785600] text-white shadow-xs' : 'text-[#4f4535] hover:text-[#1c1b1b]'
            }`}
          >
            <ShoppingBag className="w-4 h-4" /> Produtos ({products.length})
          </button>
          <button
            onClick={() => setActiveTab('prayers')}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'prayers' ? 'bg-[#785600] text-white shadow-xs' : 'text-[#4f4535] hover:text-[#1c1b1b]'
            }`}
          >
            <Heart className="w-4 h-4" /> Orações ({prayers.length})
          </button>
        </div>
      </div>

      {/* Global Feedback Banner */}
      {feedback && (
        <div className="bg-[#1c5d3a]/10 border border-[#1c5d3a]/30 text-[#1c5d3a] px-4 py-3 rounded-xl text-xs font-sans font-semibold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-[#1c5d3a]" />
          <span>{feedback}</span>
        </div>
      )}

      {/* ================= TAB 1: ARTIGOS DO BLOG ================= */}
      {activeTab === 'articles' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-white p-5 rounded-2xl border border-[#d3c4af]/60">
            <div>
              <h2 className="font-display text-xl font-bold text-[#1c1b1b]">Artigos & Notícias Publicados</h2>
              <p className="font-sans text-xs text-[#817563]">Gerencie o conteúdo editorial exibido no Blog e na Home.</p>
            </div>
            <button
              onClick={() => {
                setEditingArticle({
                  id: `essay-${Date.now()}`,
                  title: '',
                  category: 'Teologia',
                  type: 'artigo',
                  imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=800',
                  excerpt: '',
                  content: '',
                  author: 'Administrador Eclesia',
                  readTime: '5 min de leitura',
                  date: 'Hoje',
                  featured: false
                });
                setIsArticleModalOpen(true);
              }}
              className="px-4 py-2.5 bg-[#785600] hover:bg-[#9a7000] text-white font-sans text-xs font-bold uppercase tracking-wider rounded-xl flex items-center gap-2 shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Novo Artigo
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((art) => (
              <div key={art.id} className="bg-white rounded-2xl border border-[#d3c4af]/60 p-4 flex flex-col justify-between space-y-3 shadow-xs">
                <div className="space-y-2">
                  <div className="h-36 rounded-xl overflow-hidden bg-gray-100 relative">
                    <img src={art.imageUrl} alt={art.title} className="w-full h-full object-cover" />
                    <span className={`absolute top-2 left-2 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded text-white ${
                      art.type === 'noticia' ? 'bg-[#9a3e3c]' : 'bg-[#785600]'
                    }`}>
                      {art.type === 'noticia' ? 'Notícia' : 'Artigo'}
                    </span>
                    <span className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-xs text-white text-[9px] font-semibold px-2 py-0.5 rounded">
                      {art.category}
                    </span>
                  </div>
                  <h3 className="font-display text-base font-bold text-[#1c1b1b] line-clamp-2">{art.title}</h3>
                  <p className="font-sans text-xs text-[#4f4535] line-clamp-2">{art.excerpt}</p>
                </div>

                <div className="pt-3 border-t border-[#d3c4af]/30 flex items-center justify-between">
                  <span className="text-[11px] text-[#817563] font-medium">{art.author}</span>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => {
                        setEditingArticle(art);
                        setIsArticleModalOpen(true);
                      }}
                      className="p-2 text-[#785600] hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                      title="Editar Artigo"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Tem certeza que deseja excluir o artigo "${art.title}"?`)) {
                          onDeleteArticle(art.id);
                          showFeedback('Artigo excluído com sucesso!');
                        }
                      }}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      title="Excluir Artigo"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= TAB 2: PRODUTOS DA LOJA ================= */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-white p-5 rounded-2xl border border-[#d3c4af]/60">
            <div>
              <h2 className="font-display text-xl font-bold text-[#1c1b1b]">Catálogo de Produtos da Loja</h2>
              <p className="font-sans text-xs text-[#817563]">Adicione novos sacramentais, livros de luxo e configure preços.</p>
            </div>
            <button
              onClick={() => {
                setEditingProduct({
                  id: `prod-${Date.now()}`,
                  title: '',
                  subtitle: '',
                  price: 99.00,
                  imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=800',
                  category: 'livro',
                  description: '',
                  inStock: true
                });
                setIsProductModalOpen(true);
              }}
              className="px-4 py-2.5 bg-[#785600] hover:bg-[#9a7000] text-white font-sans text-xs font-bold uppercase tracking-wider rounded-xl flex items-center gap-2 shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Novo Produto
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((prod) => (
              <div key={prod.id} className="bg-white rounded-2xl border border-[#d3c4af]/60 p-4 flex flex-col justify-between space-y-3 shadow-xs">
                <div className="space-y-2">
                  <div className="aspect-[4/3] rounded-xl overflow-hidden bg-[#fcf9f8] p-2 border border-[#d3c4af]/30 relative">
                    <img src={prod.imageUrl} alt={prod.title} className="w-full h-full object-cover rounded-lg" />
                    <span className="absolute top-3 left-3 bg-[#785600] text-white text-[9px] font-bold uppercase px-2 py-0.5 rounded">
                      {prod.category}
                    </span>
                    <span className={`absolute bottom-3 right-3 text-[9px] font-bold px-2 py-0.5 rounded ${
                      prod.inStock ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
                    }`}>
                      {prod.inStock ? 'Em Estoque' : 'Esgotado'}
                    </span>
                  </div>
                  <h3 className="font-display text-base font-bold text-[#1c1b1b]">{prod.title}</h3>
                  <p className="font-sans text-xs text-[#817563]">{prod.subtitle}</p>
                  <p className="font-display text-lg font-bold text-[#785600]">
                    R$ {prod.price.toFixed(2).replace('.', ',')}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#d3c4af]/30 flex items-center justify-between">
                  <span className="text-[11px] text-[#817563]">ID: {prod.id}</span>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => {
                        setEditingProduct(prod);
                        setIsProductModalOpen(true);
                      }}
                      className="p-2 text-[#785600] hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                      title="Editar Produto"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Tem certeza que deseja excluir o produto "${prod.title}"?`)) {
                          onDeleteProduct(prod.id);
                          showFeedback('Produto excluído com sucesso!');
                        }
                      }}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      title="Excluir Produto"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= TAB 3: ORAÇÕES ================= */}
      {activeTab === 'prayers' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-white p-5 rounded-2xl border border-[#d3c4af]/60">
            <div>
              <h2 className="font-display text-xl font-bold text-[#1c1b1b]">Acervo de Orações Católicas</h2>
              <p className="font-sans text-xs text-[#817563]">Crie novas orações tradicionais e defina a oração em destaque.</p>
            </div>
            <button
              onClick={() => {
                setEditingPrayer({
                  id: `pray-${Date.now()}`,
                  title: '',
                  slug: `oracao-${Date.now()}`,
                  situation: 'Proteção',
                  content: '',
                  isFeaturedToday: false
                });
                setIsPrayerModalOpen(true);
              }}
              className="px-4 py-2.5 bg-[#785600] hover:bg-[#9a7000] text-white font-sans text-xs font-bold uppercase tracking-wider rounded-xl flex items-center gap-2 shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Nova Oração
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {prayers.map((pray) => (
              <div key={pray.id} className="bg-white rounded-2xl border border-[#d3c4af]/60 p-5 flex flex-col justify-between space-y-3 shadow-xs">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 bg-[#785600]/10 text-[#785600] text-[10px] font-bold uppercase rounded">
                      {pray.situation}
                    </span>
                    {pray.isFeaturedToday && (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                        <Star className="w-3 h-3 fill-amber-600" /> Destaque do Dia
                      </span>
                    )}
                  </div>
                  <h3 className="font-display text-lg font-bold text-[#1c1b1b]">{pray.title}</h3>
                  <p className="font-sans text-xs text-[#4f4535] line-clamp-3 leading-relaxed whitespace-pre-line">
                    {pray.content}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#d3c4af]/30 flex items-center justify-between">
                  <span className="text-[11px] text-[#817563]">Slug: {pray.slug}</span>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => {
                        setEditingPrayer(pray);
                        setIsPrayerModalOpen(true);
                      }}
                      className="p-2 text-[#785600] hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                      title="Editar Oração"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Tem certeza que deseja excluir a oração "${pray.title}"?`)) {
                          onDeletePrayer(pray.id);
                          showFeedback('Oração excluída com sucesso!');
                        }
                      }}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      title="Excluir Oração"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= MODAL: EDITAR/CRIAR ARTIGO ================= */}
      {isArticleModalOpen && editingArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl border border-[#d3c4af] max-w-3xl w-full p-6 sm:p-8 space-y-6 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-[#d3c4af]/40 pb-4">
              <h3 className="font-display text-xl font-bold text-[#1c1b1b]">
                {editingArticle.title ? 'Editar Artigo' : 'Criar Novo Artigo'}
              </h3>
              <button onClick={() => setIsArticleModalOpen(false)} className="p-1 hover:bg-gray-100 rounded-full cursor-pointer">
                <X className="w-5 h-5 text-[#817563]" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                onSaveArticle(editingArticle);
                setIsArticleModalOpen(false);
                showFeedback('Artigo salvo com sucesso!');
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase mb-1">Título do Artigo *</label>
                  <input
                    type="text"
                    required
                    value={editingArticle.title}
                    onChange={(e) => setEditingArticle({ ...editingArticle, title: e.target.value })}
                    className="w-full px-3 py-2 border border-[#d3c4af] rounded-xl text-xs"
                    placeholder="Título da matéria"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase mb-1">Categoria</label>
                  <select
                    value={editingArticle.category}
                    onChange={(e) => setEditingArticle({ ...editingArticle, category: e.target.value })}
                    className="w-full px-3 py-2 border border-[#d3c4af] rounded-xl text-xs"
                  >
                    <option value="Teologia">Teologia</option>
                    <option value="História">História</option>
                    <option value="Cultura">Cultura</option>
                    <option value="Vaticano">Vaticano</option>
                    <option value="Notícias">Notícias</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase mb-1">Tipo</label>
                  <select
                    value={editingArticle.type || 'artigo'}
                    onChange={(e) => setEditingArticle({ ...editingArticle, type: e.target.value as any })}
                    className="w-full px-3 py-2 border border-[#d3c4af] rounded-xl text-xs"
                  >
                    <option value="artigo">Artigo</option>
                    <option value="noticia">Notícia</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase mb-1">Autor</label>
                  <input
                    type="text"
                    value={editingArticle.author}
                    onChange={(e) => setEditingArticle({ ...editingArticle, author: e.target.value })}
                    className="w-full px-3 py-2 border border-[#d3c4af] rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase mb-1">Tempo de Leitura</label>
                  <input
                    type="text"
                    value={editingArticle.readTime}
                    onChange={(e) => setEditingArticle({ ...editingArticle, readTime: e.target.value })}
                    className="w-full px-3 py-2 border border-[#d3c4af] rounded-xl text-xs"
                    placeholder="Ex: 5 min de leitura"
                  />
                </div>
              </div>

              {/* Image Upload / URL */}
              <div>
                <label className="block text-xs font-bold uppercase mb-1">Imagem de Capa (Upload ou URL)</label>
                <div className="flex gap-2 items-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageFile(e, (url) => setEditingArticle({ ...editingArticle, imageUrl: url }))}
                    className="text-xs"
                  />
                  <input
                    type="url"
                    value={editingArticle.imageUrl}
                    onChange={(e) => setEditingArticle({ ...editingArticle, imageUrl: e.target.value })}
                    placeholder="Ou cole a URL da imagem"
                    className="flex-1 px-3 py-2 border border-[#d3c4af] rounded-xl text-xs"
                  />
                </div>
                {editingArticle.imageUrl && (
                  <div className="mt-2 h-24 w-40 rounded-lg overflow-hidden border border-[#d3c4af]">
                    <img src={editingArticle.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase mb-1">Resumo Curto (Excerpt) *</label>
                <textarea
                  rows={2}
                  required
                  value={editingArticle.excerpt}
                  onChange={(e) => setEditingArticle({ ...editingArticle, excerpt: e.target.value })}
                  className="w-full p-3 border border-[#d3c4af] rounded-xl text-xs resize-none"
                  placeholder="Breve resumo que aparece nos cards..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase mb-1">Conteúdo Completo *</label>
                <textarea
                  rows={8}
                  required
                  value={editingArticle.content}
                  onChange={(e) => setEditingArticle({ ...editingArticle, content: e.target.value })}
                  className="w-full p-3 border border-[#d3c4af] rounded-xl text-xs leading-relaxed"
                  placeholder="Escreva os parágrafos completos do artigo..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#d3c4af]/40">
                <button
                  type="button"
                  onClick={() => setIsArticleModalOpen(false)}
                  className="px-5 py-2.5 border border-[#d3c4af] rounded-xl text-xs font-bold uppercase cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#785600] hover:bg-[#9a7000] text-white rounded-xl text-xs font-bold uppercase cursor-pointer shadow-md flex items-center gap-2"
                >
                  <Save className="w-4 h-4" /> Salvar Artigo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: EDITAR/CRIAR PRODUTO ================= */}
      {isProductModalOpen && editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl border border-[#d3c4af] max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-[#d3c4af]/40 pb-4">
              <h3 className="font-display text-xl font-bold text-[#1c1b1b]">
                {editingProduct.title ? 'Editar Produto' : 'Cadastrar Novo Produto'}
              </h3>
              <button onClick={() => setIsProductModalOpen(false)} className="p-1 hover:bg-gray-100 rounded-full cursor-pointer">
                <X className="w-5 h-5 text-[#817563]" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                onSaveProduct(editingProduct);
                setIsProductModalOpen(false);
                showFeedback('Produto salvo com sucesso!');
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase mb-1">Título do Produto *</label>
                  <input
                    type="text"
                    required
                    value={editingProduct.title}
                    onChange={(e) => setEditingProduct({ ...editingProduct, title: e.target.value })}
                    className="w-full px-3 py-2 border border-[#d3c4af] rounded-xl text-xs"
                    placeholder="Ex: Imitação de Cristo"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase mb-1">Subtítulo</label>
                  <input
                    type="text"
                    value={editingProduct.subtitle}
                    onChange={(e) => setEditingProduct({ ...editingProduct, subtitle: e.target.value })}
                    className="w-full px-3 py-2 border border-[#d3c4af] rounded-xl text-xs"
                    placeholder="Ex: Edição de Luxo Rígida"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase mb-1">Preço (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={editingProduct.price}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-[#d3c4af] rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase mb-1">Categoria</label>
                  <select
                    value={editingProduct.category}
                    onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value as any })}
                    className="w-full px-3 py-2 border border-[#d3c4af] rounded-xl text-xs"
                  >
                    <option value="livro">Livro</option>
                    <option value="sacramental">Sacramental</option>
                    <option value="arte">Arte Sacra</option>
                    <option value="vestuário">Vestuário</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase mb-1">Estoque</label>
                  <select
                    value={editingProduct.inStock ? 'sim' : 'nao'}
                    onChange={(e) => setEditingProduct({ ...editingProduct, inStock: e.target.value === 'sim' })}
                    className="w-full px-3 py-2 border border-[#d3c4af] rounded-xl text-xs"
                  >
                    <option value="sim">Em Estoque</option>
                    <option value="nao">Esgotado</option>
                  </select>
                </div>
              </div>

              {/* Product Image */}
              <div>
                <label className="block text-xs font-bold uppercase mb-1">Foto do Produto (Upload ou URL)</label>
                <div className="flex gap-2 items-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageFile(e, (url) => setEditingProduct({ ...editingProduct, imageUrl: url }))}
                    className="text-xs"
                  />
                  <input
                    type="url"
                    value={editingProduct.imageUrl}
                    onChange={(e) => setEditingProduct({ ...editingProduct, imageUrl: e.target.value })}
                    placeholder="Ou cole a URL da imagem"
                    className="flex-1 px-3 py-2 border border-[#d3c4af] rounded-xl text-xs"
                  />
                </div>
                {editingProduct.imageUrl && (
                  <div className="mt-2 h-20 w-20 rounded-lg overflow-hidden border border-[#d3c4af]">
                    <img src={editingProduct.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase mb-1">Descrição Detalhada *</label>
                <textarea
                  rows={4}
                  required
                  value={editingProduct.description}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  className="w-full p-3 border border-[#d3c4af] rounded-xl text-xs resize-none leading-relaxed"
                  placeholder="Detalhes, material, acabamento e dimensões do produto..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#d3c4af]/40">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-5 py-2.5 border border-[#d3c4af] rounded-xl text-xs font-bold uppercase cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#785600] hover:bg-[#9a7000] text-white rounded-xl text-xs font-bold uppercase cursor-pointer shadow-md flex items-center gap-2"
                >
                  <Save className="w-4 h-4" /> Salvar Produto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: EDITAR/CRIAR ORAÇÃO ================= */}
      {isPrayerModalOpen && editingPrayer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl border border-[#d3c4af] max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-[#d3c4af]/40 pb-4">
              <h3 className="font-display text-xl font-bold text-[#1c1b1b]">
                {editingPrayer.title ? 'Editar Oração' : 'Cadastrar Nova Oração'}
              </h3>
              <button onClick={() => setIsPrayerModalOpen(false)} className="p-1 hover:bg-gray-100 rounded-full cursor-pointer">
                <X className="w-5 h-5 text-[#817563]" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                onSavePrayer(editingPrayer);
                setIsPrayerModalOpen(false);
                showFeedback('Oração salva com sucesso no acervo!');
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase mb-1">Título da Oração *</label>
                  <input
                    type="text"
                    required
                    value={editingPrayer.title}
                    onChange={(e) => setEditingPrayer({ ...editingPrayer, title: e.target.value })}
                    className="w-full px-3 py-2 border border-[#d3c4af] rounded-xl text-xs"
                    placeholder="Ex: Oração de Santo Agostinho"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase mb-1">Situação / Categoria</label>
                  <select
                    value={editingPrayer.situation}
                    onChange={(e) => setEditingPrayer({ ...editingPrayer, situation: e.target.value })}
                    className="w-full px-3 py-2 border border-[#d3c4af] rounded-xl text-xs"
                  >
                    <option value="Saúde">Saúde</option>
                    <option value="Trabalho">Trabalho</option>
                    <option value="Família">Família</option>
                    <option value="Luto">Luto</option>
                    <option value="Gratidão">Gratidão</option>
                    <option value="Proteção">Proteção</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="featured-prayer"
                  checked={editingPrayer.isFeaturedToday || false}
                  onChange={(e) => setEditingPrayer({ ...editingPrayer, isFeaturedToday: e.target.checked })}
                  className="rounded border-[#d3c4af] text-[#785600] focus:ring-[#785600]"
                />
                <label htmlFor="featured-prayer" className="text-xs font-bold text-[#1c1b1b] cursor-pointer flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 text-amber-600" /> Definir como "Oração do Dia" em destaque
                </label>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase mb-1">Texto Completo da Oração *</label>
                <textarea
                  rows={8}
                  required
                  value={editingPrayer.content}
                  onChange={(e) => setEditingPrayer({ ...editingPrayer, content: e.target.value })}
                  className="w-full p-3 border border-[#d3c4af] rounded-xl text-xs leading-relaxed italic"
                  placeholder="Escreva a oração completa com suas estrofes..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#d3c4af]/40">
                <button
                  type="button"
                  onClick={() => setIsPrayerModalOpen(false)}
                  className="px-5 py-2.5 border border-[#d3c4af] rounded-xl text-xs font-bold uppercase cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#785600] hover:bg-[#9a7000] text-white rounded-xl text-xs font-bold uppercase cursor-pointer shadow-md flex items-center gap-2"
                >
                  <Save className="w-4 h-4" /> Salvar Oração
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
