import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary] Erro capturado no componente:', error, errorInfo);
  }

  private handleReload = () => {
    this.setState({ hasError: false, error: undefined });
    if (this.props.onReset) {
      this.props.onReset();
    } else {
      window.location.reload();
    }
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="w-full max-w-2xl mx-auto my-12 p-8 bg-white dark:bg-zinc-900 border border-amber-200 dark:border-zinc-800 rounded-3xl shadow-lg text-center space-y-6">
          <div className="w-16 h-16 mx-auto bg-amber-100 dark:bg-amber-950/60 text-[#785600] dark:text-amber-400 rounded-full flex items-center justify-center">
            <AlertCircle className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="font-display text-2xl font-bold text-[#1c1b1b] dark:text-[#F9FAFB]">
              {this.props.fallbackTitle || 'Não foi possível carregar este conteúdo'}
            </h2>
            <p className="text-sm text-[#4f4535] dark:text-zinc-400 max-w-md mx-auto">
              Ocorreu um pequeno imprevisto na renderização desta página. Você pode recarregar ou voltar para a página inicial.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={this.handleReload}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#785600] hover:bg-[#9a7000] text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-sm"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Tentar Novamente</span>
            </button>

            <button
              onClick={this.handleGoHome}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#f6f3f2] hover:bg-[#e8e2de] dark:bg-zinc-800 dark:hover:bg-zinc-700 text-[#4f4535] dark:text-zinc-200 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer border border-[#d3c4af]/60 dark:border-zinc-700"
            >
              <Home className="w-4 h-4" />
              <span>Voltar ao Início</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
