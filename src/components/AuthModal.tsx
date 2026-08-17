import React, { useState } from 'react';
import { X, Mail, Lock, User, ShoppingBag, CheckCircle2, AlertCircle, Eye, EyeOff, ArrowLeft, KeyRound } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase/client';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (email: string, pass: string) => Promise<{ success: boolean; message: string }>;
  onSignUp: (email: string, pass: string, name: string, bio?: string) => Promise<{ success: boolean; message: string }>;
  initialTab?: 'signup' | 'login';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLogin,
  onSignUp,
  initialTab = 'login'
}) => {
  const [tab, setTab] = useState<'signup' | 'login' | 'forgot'>(initialTab);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (tab === 'forgot') {
      if (!email.trim()) {
        setFeedback({ type: 'error', message: 'Por favor, informe seu e-mail para recuperar a senha.' });
        return;
      }
      setIsSubmitting(true);
      try {
        if (isSupabaseConfigured) {
          const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
            redirectTo: `${window.location.origin}/admin`
          });
          if (error) throw error;
        }
        setFeedback({
          type: 'success',
          message: 'Link de redefinição de senha enviado! Verifique sua caixa de entrada e spam.'
        });
      } catch (err: any) {
        setFeedback({
          type: 'error',
          message: err?.message || 'Erro ao solicitar redefinição de senha.'
        });
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

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
          onClose();
          setFeedback(null);
        }, 1200);
      } else {
        setFeedback({ type: 'error', message: res.message });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Erro inesperado ao autenticar.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs transition-opacity animate-fade-in">
      <div className="bg-[#fcf9f8] border border-[#d3c4af] rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-[#817563] hover:text-[#1c1b1b] rounded-full transition-colors cursor-pointer z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="bg-gradient-to-b from-[#785600]/10 to-transparent p-6 text-center border-b border-[#d3c4af]/30">
          <div className="w-12 h-12 rounded-full bg-[#785600] text-white flex items-center justify-center mx-auto mb-3 shadow-md">
            {tab === 'forgot' ? <KeyRound className="w-6 h-6" /> : <ShoppingBag className="w-6 h-6" />}
          </div>
          <h2 className="font-display text-2xl font-bold text-[#1c1b1b]">
            {tab === 'signup' ? 'Criar Nova Conta' : tab === 'forgot' ? 'Recuperar Senha' : 'Bem-vindo de volta'}
          </h2>
          <p className="font-sans text-xs text-[#4f4535] mt-1 max-w-xs mx-auto leading-relaxed">
            {tab === 'signup'
              ? 'Cadastre-se para adicionar compras ao carrinho e acompanhar pedidos.'
              : tab === 'forgot'
              ? 'Informe seu e-mail cadastrado e enviaremos um link de redefinição seguro.'
              : 'Informe seu e-mail e senha cadastrados para acessar sua conta.'}
          </p>
        </div>

        {/* Tabs Switcher (Only when not in forgot mode) */}
        {tab !== 'forgot' ? (
          <div className="flex border-b border-[#d3c4af]/40 bg-[#f0eded] p-1">
            <button
              onClick={() => { setTab('login'); setFeedback(null); }}
              className={`flex-1 py-2.5 font-sans text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
                tab === 'login'
                  ? 'bg-white text-[#785600] shadow-xs'
                  : 'text-[#4f4535] hover:text-[#1c1b1b]'
              }`}
            >
              Entrar na Conta
            </button>
            <button
              onClick={() => { setTab('signup'); setFeedback(null); }}
              className={`flex-1 py-2.5 font-sans text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
                tab === 'signup'
                  ? 'bg-white text-[#785600] shadow-xs'
                  : 'text-[#4f4535] hover:text-[#1c1b1b]'
              }`}
            >
              Criar Nova Conta
            </button>
          </div>
        ) : (
          <div className="px-6 pt-3">
            <button
              type="button"
              onClick={() => { setTab('login'); setFeedback(null); }}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#785600] hover:underline cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Voltar para o login
            </button>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Feedback Alert */}
          {feedback && (
            <div className={`p-3.5 rounded-xl text-xs flex items-center gap-2 ${
              feedback.type === 'success'
                ? 'bg-[#1c5d3a]/10 text-[#1c5d3a] border border-[#1c5d3a]/30'
                : 'bg-[#9a3e3c]/10 text-[#9a3e3c] border border-[#9a3e3c]/30'
            }`}>
              {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
              <span className="font-sans font-semibold">{feedback.message}</span>
            </div>
          )}

          {/* Name (Sign Up only) */}
          {tab === 'signup' && (
            <div>
              <label className="block font-sans text-xs font-bold text-[#1c1b1b] uppercase tracking-wider mb-1">
                Nome Completo *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[#817563] absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Maria de Jesus"
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#d3c4af] rounded-xl font-sans text-xs text-[#1c1b1b] focus:border-[#785600] focus:ring-0"
                />
              </div>
            </div>
          )}

          {/* Email */}
          <div>
            <label className="block font-sans text-xs font-bold text-[#1c1b1b] uppercase tracking-wider mb-1">
              Endereço de E-mail *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#817563] absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu.email@exemplo.com"
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#d3c4af] rounded-xl font-sans text-xs text-[#1c1b1b] focus:border-[#785600] focus:ring-0"
              />
            </div>
          </div>

          {/* Password (Not in forgot mode) */}
          {tab !== 'forgot' && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block font-sans text-xs font-bold text-[#1c1b1b] uppercase tracking-wider">
                  Senha *
                </label>
                {tab === 'login' && (
                  <button
                    type="button"
                    onClick={() => { setTab('forgot'); setFeedback(null); }}
                    className="text-[11px] font-bold text-[#785600] hover:underline cursor-pointer"
                  >
                    Esqueceu a senha?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#817563] absolute left-3.5 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full pl-10 pr-10 py-2.5 bg-white border border-[#d3c4af] rounded-xl font-sans text-xs text-[#1c1b1b] focus:border-[#785600] focus:ring-0"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-[#817563] hover:text-[#1c1b1b] cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 py-3 bg-[#785600] hover:bg-[#9a7000] text-white font-sans text-xs font-bold uppercase tracking-widest rounded-xl transition-all shadow-md cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSubmitting
              ? 'Processando...'
              : tab === 'signup'
              ? 'Concluir Cadastro'
              : tab === 'forgot'
              ? 'Enviar Link de Recuperação'
              : 'Entrar na Conta'}
          </button>
        </form>
      </div>
    </div>
  );
};
