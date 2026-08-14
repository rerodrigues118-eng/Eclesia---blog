import React, { useState } from 'react';
import {
  Mail,
  Lock,
  User,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  ShoppingBag,
  Heart,
  BookOpen,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { ActiveView } from '../types';

interface AuthViewProps {
  onLogin: (email: string, pass: string) => Promise<{ success: boolean; message: string }>;
  onSignUp: (email: string, pass: string, name: string, bio?: string) => Promise<{ success: boolean; message: string }>;
  setActiveView: (view: ActiveView) => void;
  user?: any;
  onSignOut?: () => void;
}

export const AuthView: React.FC<AuthViewProps> = ({
  onLogin,
  onSignUp,
  setActiveView,
  user,
  onSignOut
}) => {
  const [tab, setTab] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // If already logged in, show user account info page
  if (user) {
    return (
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 animate-fade-in">
        <div className="bg-white border border-[#d3c4af]/80 rounded-3xl p-8 sm:p-12 shadow-md space-y-6 text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase tracking-widest rounded-full">
            Conta Conectada
          </span>

          <h1 className="font-display text-3xl font-bold text-[#1c1b1b]">
            Bem-vindo(a) à sua Conta Eclesia
          </h1>

          <p className="font-sans text-sm text-[#4f4535] max-w-md mx-auto">
            Você está autenticado como <strong>{user.email}</strong>. Seu carrinho de compras e preferências estão salvos.
          </p>

          <div className="pt-4 flex flex-wrap justify-center gap-3">
            <button
              onClick={() => setActiveView('home')}
              className="px-6 py-3 bg-[#785600] hover:bg-[#9a7000] text-white font-sans text-xs font-bold uppercase tracking-widest rounded-xl transition-all shadow-md cursor-pointer"
            >
              Ir para a Página Inicial
            </button>
            <button
              onClick={() => setActiveView('loja')}
              className="px-6 py-3 bg-[#f6f3f2] hover:bg-[#e8e2de] text-[#1c1b1b] border border-[#d3c4af] font-sans text-xs font-bold uppercase tracking-widest rounded-xl transition-all cursor-pointer flex items-center gap-2"
            >
              <ShoppingBag className="w-4 h-4" /> Acessar a Loja
            </button>
            {onSignOut && (
              <button
                onClick={onSignOut}
                className="px-6 py-3 text-red-600 hover:bg-red-50 font-sans text-xs font-bold uppercase tracking-widest rounded-xl transition-all cursor-pointer"
              >
                Sair da Conta
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (!email || !password) {
      setFeedback({ type: 'error', message: 'Por favor, preencha todos os campos obrigatórios.' });
      return;
    }

    if (tab === 'signup' && !name.trim()) {
      setFeedback({ type: 'error', message: 'Por favor, informe seu nome completo para criar a conta.' });
      return;
    }

    setIsSubmitting(true);

    try {
      let res: { success: boolean; message: string };
      if (tab === 'signup') {
        res = await onSignUp(email, password, name);
      } else {
        res = await onLogin(email, password);
      }

      if (res.success) {
        setFeedback({ type: 'success', message: res.message });
        setTimeout(() => {
          setActiveView('home');
        }, 1200);
      } else {
        setFeedback({ type: 'error', message: res.message });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Erro inesperado ao processar.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-24 space-y-8 animate-fade-in">
      {/* Back Button */}
      <button
        onClick={() => setActiveView('home')}
        className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#785600] hover:text-[#9a7000] cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" /> Voltar ao Início
      </button>

      {/* Main Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        {/* Left Side: Brand Story & Member Perks */}
        <div className="lg:col-span-5 space-y-6">
          <div className="space-y-3">
            <span className="inline-block px-3 py-1 bg-[#785600]/10 text-[#785600] font-sans text-xs font-bold tracking-widest uppercase rounded-full">
              Portal Eclesia
            </span>
            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1c1b1b] leading-tight">
              Aprofunde sua Fé & Vida de Oração
            </h1>
            <p className="font-sans text-sm text-[#4f4535] leading-relaxed">
              Crie sua conta para adquirir livros clássicos, sacramentais de curadoria e ter acesso a todo o acervo de teologia e orações católicas.
            </p>
          </div>

          <div className="space-y-4 pt-2">
            {[
              {
                icon: ShoppingBag,
                title: 'Carrinho & Pedidos Salvos',
                desc: 'Guarde seus livros e sacramentais no carrinho em qualquer dispositivo.'
              },
              {
                icon: BookOpen,
                title: 'Formação & Doutrina Católica',
                desc: 'Artigos teológicos, biografias do santoral e liturgia diária.'
              },
              {
                icon: Heart,
                title: 'Acervo Completo de Orações',
                desc: 'Preces tradicionais em latim e português para o seu dia a dia.'
              }
            ].map((perk, i) => {
              const Icon = perk.icon;
              return (
                <div key={i} className="flex items-start gap-3.5 p-4 bg-white rounded-2xl border border-[#d3c4af]/60 shadow-xs">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 text-[#785600] flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-sans text-xs font-bold text-[#1c1b1b]">{perk.title}</h4>
                    <p className="font-sans text-xs text-[#817563] mt-0.5 leading-relaxed">{perk.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Auth Form Card */}
        <div className="lg:col-span-7 bg-white border border-[#d3c4af] rounded-3xl shadow-xl overflow-hidden">
          {/* Tabs Selector */}
          <div className="flex border-b border-[#d3c4af]/40 bg-[#f6f3f2] p-1.5">
            <button
              onClick={() => { setTab('login'); setFeedback(null); }}
              className={`flex-1 py-3 font-sans text-xs font-bold uppercase tracking-wider rounded-2xl transition-all cursor-pointer ${
                tab === 'login'
                  ? 'bg-white text-[#785600] shadow-sm'
                  : 'text-[#4f4535] hover:text-[#1c1b1b]'
              }`}
            >
              Entrar na Conta
            </button>
            <button
              onClick={() => { setTab('signup'); setFeedback(null); }}
              className={`flex-1 py-3 font-sans text-xs font-bold uppercase tracking-wider rounded-2xl transition-all cursor-pointer ${
                tab === 'signup'
                  ? 'bg-white text-[#785600] shadow-sm'
                  : 'text-[#4f4535] hover:text-[#1c1b1b]'
              }`}
            >
              Criar Nova Conta
            </button>
          </div>

          <div className="p-8 sm:p-10 space-y-6">
            <div>
              <h2 className="font-display text-2xl font-bold text-[#1c1b1b]">
                {tab === 'login' ? 'Bem-vindo de volta' : 'Crie sua conta gratuita'}
              </h2>
              <p className="font-sans text-xs text-[#817563] mt-1">
                {tab === 'login'
                  ? 'Informe seu e-mail e senha cadastrados para acessar sua conta.'
                  : 'Preencha seus dados abaixo para se cadastrar na Eclesia.'}
              </p>
            </div>

            {/* Feedback Message */}
            {feedback && (
              <div className={`p-4 rounded-2xl text-xs flex items-center gap-2.5 ${
                feedback.type === 'success'
                  ? 'bg-[#1c5d3a]/10 text-[#1c5d3a] border border-[#1c5d3a]/30'
                  : 'bg-[#9a3e3c]/10 text-[#9a3e3c] border border-[#9a3e3c]/30'
              }`}>
                {feedback.type === 'success' ? <CheckCircle2 className="w-4.5 h-4.5 shrink-0" /> : <AlertCircle className="w-4.5 h-4.5 shrink-0" />}
                <span className="font-sans font-semibold">{feedback.message}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name (Sign Up only) */}
              {tab === 'signup' && (
                <div>
                  <label className="block font-sans text-xs font-bold text-[#1c1b1b] uppercase tracking-wider mb-1.5">
                    Nome Completo *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-[#817563] absolute left-4 top-3.5" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ex: Maria de Jesus"
                      className="w-full pl-11 pr-4 py-3 bg-[#fcf9f8] border border-[#d3c4af] rounded-2xl font-sans text-xs text-[#1c1b1b] focus:border-[#785600] focus:ring-0 placeholder:text-[#817563]"
                    />
                  </div>
                </div>
              )}

              {/* Email */}
              <div>
                <label className="block font-sans text-xs font-bold text-[#1c1b1b] uppercase tracking-wider mb-1.5">
                  Endereço de E-mail *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#817563] absolute left-4 top-3.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu.email@exemplo.com"
                    className="w-full pl-11 pr-4 py-3 bg-[#fcf9f8] border border-[#d3c4af] rounded-2xl font-sans text-xs text-[#1c1b1b] focus:border-[#785600] focus:ring-0 placeholder:text-[#817563]"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block font-sans text-xs font-bold text-[#1c1b1b] uppercase tracking-wider mb-1.5">
                  Senha *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#817563] absolute left-4 top-3.5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="w-full pl-11 pr-11 py-3 bg-[#fcf9f8] border border-[#d3c4af] rounded-2xl font-sans text-xs text-[#1c1b1b] focus:border-[#785600] focus:ring-0 placeholder:text-[#817563]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-3.5 text-[#817563] hover:text-[#1c1b1b]"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-3 py-3.5 bg-[#785600] hover:bg-[#9a7000] text-white font-sans text-xs font-bold uppercase tracking-widest rounded-2xl transition-all shadow-md cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting
                  ? 'Processando...'
                  : tab === 'login'
                  ? 'Entrar na Conta'
                  : 'Criar Minha Conta'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
