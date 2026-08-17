import React, { useState } from 'react';
import { Check, Sparkles, CreditCard, QrCode, FileText, ArrowRight, X, ShieldCheck, Clock } from 'lucide-react';
import { SubscriptionPlan } from '../types';
import { SUBSCRIPTION_PLANS } from '../data/eclesiaData';
import { supabase, isSupabaseConfigured } from '../lib/supabase/client';

export const AssinaturasView: React.FC = () => {
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'card' | 'boleto'>('pix');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', email: '', cpf: '' });

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) {
      setErrorMessage('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);

    try {
      if (isSupabaseConfigured && selectedPlan) {
        const { data: sessionData } = await supabase.auth.getSession();
        const userId = sessionData?.session?.user?.id || null;

        // Registra lead de assinatura e assinante no banco de dados
        await supabase.from('subscribers').upsert(
          {
            email: formData.email.trim().toLowerCase(),
            name: formData.name.trim(),
            status: 'pendente_checkout',
            created_at: new Date().toISOString()
          },
          { onConflict: 'email' }
        );

        if (userId) {
          await supabase.from('subscriptions').insert({
            user_id: userId,
            plan_id: selectedPlan.id,
            status: 'pendente',
            created_at: new Date().toISOString()
          });
        }
      }

      setIsSuccess(true);
    } catch (err: any) {
      console.error('[AssinaturasView] Erro ao registrar assinatura:', err);
      setErrorMessage(err?.message || 'Erro ao registrar solicitação de assinatura.');
    } finally {
      setIsSaving(false);
    }
  };

  const closeModal = () => {
    setSelectedPlan(null);
    setIsSuccess(false);
    setErrorMessage(null);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16 animate-fade-in">
      {/* Header Section */}
      <section className="flex flex-col items-center text-center max-w-2xl mx-auto gap-4">
        <span className="bg-[#6E1E1E] text-white font-sans text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest">
          Apoie o Apostolado
        </span>
        <h1 className="font-display text-4xl md:text-5xl font-bold text-[#785600]">
          Assine a Eclesia
        </h1>
        <p className="font-sans text-base text-[#4f4535] leading-relaxed">
          Ajude-nos a manter viva a tradição da boa imprensa católica. Escolha o plano que melhor se adapta a você e fortaleça a produção editorial.
        </p>
      </section>

      {/* Pricing Cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
        {SUBSCRIPTION_PLANS.map((plan) => {
          const isRec = plan.recommended;
          return (
            <div
              key={plan.id}
              className={`bg-white rounded-2xl p-8 flex flex-col justify-between border relative transition-all duration-300 ${
                isRec
                  ? 'border-[#785600] ring-2 ring-[#785600]/20 shadow-lg scale-102 md:-translate-y-2'
                  : 'border-[#d3c4af]/60 hover:border-[#785600]/60'
              }`}
            >
              {isRec && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#785600] text-white font-sans text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full shadow-xs flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-[#ffdea6]" /> Recomendado
                </div>
              )}

              <div className="space-y-6">
                <div>
                  <h3 className="font-display text-2xl font-bold text-[#1c1b1b]">{plan.name}</h3>
                  <p className="font-sans text-xs text-[#817563] mt-1">{plan.tagline}</p>
                </div>

                <div className="flex items-baseline gap-1">
                  <span className="font-sans text-sm font-semibold text-[#817563]">R$</span>
                  <span className="font-display text-4xl font-bold text-[#785600]">{plan.price}</span>
                  <span className="font-sans text-xs font-semibold text-[#817563]">{plan.periodLabel}</span>
                </div>

                <hr className="border-t border-[#d3c4af]/40" />

                <ul className="space-y-3 font-sans text-sm text-[#4f4535]">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <span
                        className={`p-0.5 rounded-full mt-0.5 ${
                          feature.included ? 'bg-[#785600]/10 text-[#785600]' : 'bg-gray-100 text-gray-300'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5" />
                      </span>
                      <span className={feature.included ? 'text-[#1c1b1b]' : 'text-gray-400 line-through'}>
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-8 mt-auto">
                <button
                  onClick={() => setSelectedPlan(plan)}
                  className={`w-full py-3 rounded-xl font-sans text-xs font-bold uppercase tracking-widest transition-colors cursor-pointer ${
                    isRec
                      ? 'bg-[#785600] text-white hover:bg-[#9a6f00]'
                      : 'bg-[#1c1b1b] text-white hover:bg-[#785600]'
                  }`}
                >
                  Assinar Agora
                </button>
              </div>
            </div>
          );
        })}
      </section>

      {/* Subscription Checkout Modal */}
      {selectedPlan && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 md:p-8 space-y-6 relative border border-[#d3c4af] shadow-2xl">
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-[#817563] hover:text-[#1c1b1b] p-1 rounded-full hover:bg-[#f0eded] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {isSuccess ? (
              <div className="text-center py-6 space-y-4 animate-fade-in">
                <div className="w-16 h-16 bg-[#1c5d3a]/10 text-[#1c5d3a] rounded-2xl flex items-center justify-center mx-auto border border-[#1c5d3a]/30">
                  <Check className="w-8 h-8 text-[#1c5d3a]" />
                </div>
                <h3 className="font-display text-2xl font-bold text-[#1c1b1b]">Assinatura Registrada!</h3>
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-left space-y-2">
                  <div className="flex items-center gap-2 text-amber-800 text-xs font-bold uppercase tracking-wider">
                    <Clock className="w-4 h-4 text-amber-600" /> Checkout Direto em Configuração
                  </div>
                  <p className="font-sans text-xs text-amber-900 leading-relaxed">
                    Seus dados de assinante para o plano <strong className="text-[#785600]">{selectedPlan.name}</strong> foram salvos com sucesso. Nossa equipe editorial enviará o link de faturamento e ativação diretamente para <strong>{formData.email}</strong>.
                  </p>
                </div>
                <button
                  onClick={closeModal}
                  className="w-full py-3 bg-[#1c1b1b] hover:bg-[#785600] text-white font-sans text-xs font-bold uppercase tracking-widest rounded-xl transition-colors cursor-pointer"
                >
                  Concluir
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-6">
                <div>
                  <span className="font-sans text-xs font-bold text-[#785600] uppercase tracking-widest block">
                    Confirmação de Assinatura
                  </span>
                  <h3 className="font-display text-2xl font-bold text-[#1c1b1b]">
                    Plano {selectedPlan.name} (R$ {selectedPlan.price} {selectedPlan.periodLabel})
                  </h3>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="font-sans text-xs font-semibold text-[#817563] block mb-1">
                      Nome Completo *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Seu nome"
                      className="w-full border border-[#d3c4af] rounded-xl px-3.5 py-2.5 font-sans text-sm focus:border-[#785600] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-sans text-xs font-semibold text-[#817563] block mb-1">
                      E-mail para Acesso *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="seu@email.com"
                      className="w-full border border-[#d3c4af] rounded-xl px-3.5 py-2.5 font-sans text-sm focus:border-[#785600] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="font-sans text-xs font-semibold text-[#817563] block">
                    Preferência de Pagamento
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('pix')}
                      className={`p-3 rounded-xl border text-center font-sans text-xs font-bold flex flex-col items-center gap-1 cursor-pointer transition-all ${
                        paymentMethod === 'pix'
                          ? 'border-[#785600] bg-[#ffdea6]/30 text-[#785600]'
                          : 'border-[#d3c4af] text-[#817563]'
                      }`}
                    >
                      <QrCode className="w-5 h-5" /> PIX
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('card')}
                      className={`p-3 rounded-xl border text-center font-sans text-xs font-bold flex flex-col items-center gap-1 cursor-pointer transition-all ${
                        paymentMethod === 'card'
                          ? 'border-[#785600] bg-[#ffdea6]/30 text-[#785600]'
                          : 'border-[#d3c4af] text-[#817563]'
                      }`}
                    >
                      <CreditCard className="w-5 h-5" /> Cartão
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('boleto')}
                      className={`p-3 rounded-xl border text-center font-sans text-xs font-bold flex flex-col items-center gap-1 cursor-pointer transition-all ${
                        paymentMethod === 'boleto'
                          ? 'border-[#785600] bg-[#ffdea6]/30 text-[#785600]'
                          : 'border-[#d3c4af] text-[#817563]'
                      }`}
                    >
                      <FileText className="w-5 h-5" /> Boleto
                    </button>
                  </div>
                </div>

                {errorMessage && (
                  <p className="text-xs text-rose-600 font-semibold">{errorMessage}</p>
                )}

                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-full py-3 bg-[#785600] hover:bg-[#9a6f00] disabled:opacity-50 text-white font-sans text-xs font-bold uppercase tracking-widest rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-md"
                >
                  {isSaving ? 'Gravando Assinatura...' : `Confirmar Assinatura • R$ ${selectedPlan.price}`}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
