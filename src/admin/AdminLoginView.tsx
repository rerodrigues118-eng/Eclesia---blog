import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowLeft,
  AlertTriangle,
  CheckCircle2,
  KeyRound,
  LogOut,
  Sparkles,
  Database
} from 'lucide-react';
import { UserProfile } from '../types';

interface AdminLoginViewProps {
  onLogin: (email: string, pass: string) => Promise<{ success: boolean; message: string; role?: string }>;
  onResetPassword?: (email: string) => Promise<{ success: boolean; message: string }>;
  user?: any;
  profile?: UserProfile | null;
  onSignOut?: () => void;
  onBackToSite: () => void;
}

export const AdminLoginView: React.FC<AdminLoginViewProps> = ({
  onLogin,
  onResetPassword,
  user,
  profile,
  onSignOut,
  onBackToSite
}) => {
  const [email, setEmail] = useState('suporte.delski@gmail.com');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // Modo de redefinição de senha
  const [isResetMode, setIsResetMode] = useState(false);
  const [resetEmail, setResetEmail] = useState('suporte.delski@gmail.com');
  const [isResetting, setIsResetting] = useState(false);

  // Caso 1: Usuário já está logado, mas NÃO tem o papel 'admin' ou 'editor' no banco profiles
  const isLoggedButUnauthorized = user && profile && profile.role !== 'admin' && profile.role !== 'editor';

  if (isLoggedButUnauthorized) {
    return (
      <div className="min-h-screen w-full bg-[#090d16] text-slate-100 flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden font-sans selection:bg-amber-500 selection:text-slate-950">
        {/* Background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-red-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-md bg-[#131926]/90 backdrop-blur-xl border border-red-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-center z-10 animate-fade-in">
          <div className="w-16 h-16 rounded-2xl bg-red-500/15 border border-red-500/30 text-red-400 flex items-center justify-center mx-auto shadow-inner">
            <AlertTriangle className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="inline-block px-3 py-1 bg-red-500/15 text-red-400 font-mono text-[10px] font-bold uppercase tracking-widest rounded-full border border-red-500/20">
              Acesso Negado • HTTP 403
            </span>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-display">
              Permissão Insuficiente
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Você está autenticado como <strong className="text-slate-200">{user.email}</strong>, porém o seu perfil na tabela <code className="text-amber-400 bg-slate-800 px-1.5 py-0.5 rounded font-mono">profiles</code> possui o nível <span className="font-semibold text-red-300 uppercase">[{profile.role || 'user'}]</span>.
            </p>
          </div>

          <div className="p-3.5 bg-slate-900/80 border border-slate-800 rounded-xl text-left text-[11px] text-slate-400 space-y-1 font-mono">
            <div>• <strong>UID:</strong> {user.id}</div>
            <div>• <strong>Role requerido:</strong> admin | editor</div>
            <div>• <strong>Role atual:</strong> {profile.role || 'user'}</div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            {onSignOut && (
              <button
                onClick={onSignOut}
                className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogOut className="w-4 h-4" /> Sair da Conta
              </button>
            )}
            <button
              onClick={onBackToSite}
              className="flex-1 px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold uppercase tracking-wider rounded-xl border border-slate-700 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" /> Ir ao Início
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Handler de envio do Login
  const handleSubmitLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (!email || !password) {
      setFeedback({ type: 'error', text: 'Por favor, preencha o email e a senha.' });
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await onLogin(email, password);

      if (res.success) {
        setFeedback({ type: 'success', text: 'Autenticado com sucesso! Carregando painel...' });
      } else {
        setFeedback({ type: 'error', text: res.message || 'Falha ao autenticar.' });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', text: err?.message || 'Erro inesperado na conexão.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handler de solicitação de redefinição de senha
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) {
      setFeedback({ type: 'error', text: 'Digite seu email para receber o link de redefinição.' });
      return;
    }

    setIsResetting(true);
    setFeedback(null);

    try {
      if (onResetPassword) {
        const res = await onResetPassword(resetEmail);
        if (res.success) {
          setFeedback({ type: 'success', text: res.message });
          setIsResetMode(false);
        } else {
          setFeedback({ type: 'error', text: res.message });
        }
      }
    } catch (err: any) {
      setFeedback({ type: 'error', text: err?.message || 'Erro ao processar redefinição.' });
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#090d16] text-slate-100 flex flex-col justify-between items-center p-4 sm:p-6 relative overflow-hidden font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Background Decorative Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[300px] bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Top Bar */}
      <div className="w-full max-w-5xl flex justify-between items-center z-10 pt-2">
        <button
          onClick={onBackToSite}
          className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-amber-400 transition-colors cursor-pointer bg-slate-900/60 hover:bg-slate-900 px-3.5 py-2 rounded-xl border border-slate-800"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar ao Portal Público
        </button>

        <div className="flex items-center gap-2 text-[11px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Supabase Auth Ativo</span>
        </div>
      </div>

      {/* Main Login Card */}
      <div className="w-full max-w-md my-auto py-8 z-10 animate-fade-in">
        <div className="bg-[#131926]/95 backdrop-blur-2xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/80 space-y-6">
          {/* Header Brand */}
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-amber-500/20 mx-auto">
              <ShieldCheck className="w-7 h-7" />
            </div>

            <div className="pt-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-display">
                Eclesia Core ERP
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Painel Administrativo • Autenticação Restrita
              </p>
            </div>
          </div>

          {/* Feedback Alert */}
          {feedback && (
            <div
              className={`p-3.5 rounded-xl text-xs font-semibold flex items-start gap-2.5 border animate-fade-in ${
                feedback.type === 'success'
                  ? 'bg-emerald-950/70 text-emerald-200 border-emerald-800/80'
                  : feedback.type === 'error'
                  ? 'bg-rose-950/70 text-rose-200 border-rose-800/80'
                  : 'bg-blue-950/70 text-blue-200 border-blue-800/80'
              }`}
            >
              {feedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
              ) : (
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
              )}
              <span className="leading-relaxed">{feedback.text}</span>
            </div>
          )}

          {!isResetMode ? (
            /* =========================================================================
               FORMULÁRIO DE LOGIN COM SENHA SUPABASE AUTH
            ========================================================================= */
            <form onSubmit={handleSubmitLogin} className="space-y-4">
              {/* Campo Email */}
              <div className="space-y-1.5 text-left">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-amber-500" /> Email do Administrador
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="suporte.delski@gmail.com"
                  autoComplete="email"
                  className="w-full px-4 py-3 bg-[#0c1018] border border-slate-700/80 focus:border-amber-500 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all font-sans"
                />
              </div>

              {/* Campo Senha */}
              <div className="space-y-1.5 text-left">
                <div className="flex justify-between items-center">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-amber-500" /> Senha de Acesso
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsResetMode(true);
                      setFeedback(null);
                    }}
                    className="text-[11px] text-amber-400 hover:text-amber-300 transition-colors cursor-pointer"
                  >
                    Esqueceu ou criar senha?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••••••"
                    autoComplete="current-password"
                    className="w-full px-4 py-3 bg-[#0c1018] border border-slate-700/80 focus:border-amber-500 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all font-sans pr-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer p-1"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Botão de Envio */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-2"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    <span>Autenticando no Supabase...</span>
                  </>
                ) : (
                  <>
                    <KeyRound className="w-4 h-4" />
                    <span>Entrar no Painel Admin</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            /* =========================================================================
               FORMULÁRIO DE REDEFINIÇÃO / CRIAÇÃO DE SENHA VIA SUPABASE
            ========================================================================= */
            <form onSubmit={handleResetPassword} className="space-y-4 animate-fade-in text-left">
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-200 space-y-1">
                <p className="font-semibold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Redefinição de Senha
                </p>
                <p className="text-[11px] text-amber-300/80">
                  Enviaremos um link de acesso e redefinição para o email da sua conta Supabase.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-amber-500" /> Email Cadastrado
                </label>
                <input
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  required
                  placeholder="suporte.delski@gmail.com"
                  className="w-full px-4 py-3 bg-[#0c1018] border border-slate-700/80 focus:border-amber-500 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all font-sans"
                />
              </div>

              <div className="pt-2 space-y-2">
                <button
                  type="submit"
                  disabled={isResetting}
                  className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-widest rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isResetting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                      <span>Enviando Link...</span>
                    </>
                  ) : (
                    <span>Enviar Link de Redefinição</span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsResetMode(false);
                    setFeedback(null);
                  }}
                  className="w-full py-2.5 bg-transparent hover:bg-slate-800/60 text-slate-400 hover:text-white text-xs font-semibold rounded-xl transition-all text-center cursor-pointer"
                >
                  Voltar para o Login
                </button>
              </div>
            </form>
          )}

          {/* Footer Security Badge */}
          <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500 font-mono">
            <div className="flex items-center gap-1.5">
              <Database className="w-3 h-3 text-amber-500" />
              <span>PostgreSQL RLS Active</span>
            </div>
            <span>v2.4 Production</span>
          </div>
        </div>
      </div>

      {/* Bottom Legal Notice */}
      <div className="text-[11px] text-slate-500 text-center pb-2 z-10">
        Eclesia Catholic Portal & ERP • Acesso estritamente restrito a administradores autorizados.
      </div>
    </div>
  );
};
