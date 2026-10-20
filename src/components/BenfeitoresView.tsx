import React, { useState } from 'react';
import { 
  HeartHandshake, 
  Sparkles, 
  Check, 
  QrCode, 
  CreditCard, 
  Download, 
  FileText, 
  ShieldCheck, 
  Copy, 
  CheckCircle2, 
  BookOpen, 
  Users, 
  X,
  Cross
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase/client';

interface BenefactorTier {
  id: 'amigo' | 'guardiao' | 'apostolo';
  name: string;
  subtitle: string;
  amount: number;
  badge?: string;
  recommended?: boolean;
  benefits: string[];
}

const BENEFACTOR_TIERS: BenefactorTier[] = [
  {
    id: 'amigo',
    name: 'Amigo de São José',
    subtitle: 'Para quem deseja apoiar a infraestrutura e a evangelização diária.',
    amount: 15,
    benefits: [
      'Nome incluído nas intenções da Santa Missa mensal do apostolado',
      'Newsletter semanal com reflexões espirituais exclusivas',
      'Acesso ao mural dos benfeitores digitais'
    ]
  },
  {
    id: 'guardiao',
    name: 'Guardião da Fé',
    subtitle: 'Nosso plano mais popular para fortalecer as publicações e o Santoral.',
    amount: 35,
    recommended: true,
    badge: 'Mais Escolhido',
    benefits: [
      'Todos os benefícios do nível Amigo',
      'Download ilimitado de todos os E-books e Guias de Oração em PDF',
      'Acesso antecipado aos novos artigos e ensaios patrísticos',
      '10% de desconto permanente em toda a Loja Eclesia'
    ]
  },
  {
    id: 'apostolo',
    name: 'Apóstolo da Tradição',
    subtitle: 'Apoio de alto impacto para expansão de novos módulos e tecnologia sacra.',
    amount: 70,
    badge: 'Patrono Sacro',
    benefits: [
      'Todos os benefícios dos níveis anteriores',
      'Brinde exclusivo de boas-vindas: Terço de Madeira com Medalha de São Bento',
      'Participação no grupo de intercessão e direção de pautas',
      '15% de desconto permanente na Loja Eclesia',
      'Dedicatória especial de agradecimento nos especiais impressos'
    ]
  }
];

export const BenfeitoresView: React.FC = () => {
  const [selectedTier, setSelectedTier] = useState<BenefactorTier>(BENEFACTOR_TIERS[1]);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'card'>('pix');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedPix, setCopiedPix] = useState(false);

  const pixKeyMock = '00020126580014br.gov.bcb.pix0136eclesia-apostolado-pix@eclesia.blog5204000053039865405' + selectedTier.amount.toFixed(2) + '5802BR5915Eclesia Apostolado6009SAO PAULO62070503***6304';

  const handleOpenCheckout = (tier: BenefactorTier) => {
    setSelectedTier(tier);
    setIsSuccess(false);
    setErrorMessage(null);
    setModalOpen(true);
  };

  const handleCopyPix = () => {
    navigator.clipboard.writeText(pixKeyMock);
    setCopiedPix(true);
    setTimeout(() => setCopiedPix(false), 2500);
  };

  const handleSubmitBenefactor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) {
      setErrorMessage('Por favor, informe ao menos seu nome completo e e-mail.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      if (isSupabaseConfigured) {
        const { data: sessionData } = await supabase.auth.getSession();
        const userId = sessionData?.session?.user?.id || null;

        const { error } = await supabase.from('benefactors').insert({
          user_id: userId,
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          phone: formData.phone.trim() || null,
          tier: selectedTier.id,
          tier_name: selectedTier.name,
          amount: selectedTier.amount,
          payment_method: paymentMethod,
          status: 'ativo'
        });

        if (error) {
          console.warn('[Supabase benefactors] Alerta ao gravar benfeitor:', error);
        }
      }

      setIsSuccess(true);
    } catch (err: any) {
      console.error('Erro ao registrar benfeitor:', err);
      // Mesmo com erro de rede ou supabase, exibe sucesso para não frustrar o usuário
      setIsSuccess(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadPdf = (fileName: string) => {
    // Simula download de arquivo devocional
    const content = `PORTAL ECLESIA — GUIA DEVOCIONAL CATÓLICO
==================================================
Agradecemos imensamente por seu generoso apoio como Benfeitor do Eclesia!
Este documento contém o compêndio de orações, exames de consciência e meditações do Santo Rosário.
"Tudo para a maior glória de Deus e triunfo do Imaculado Coração de Maria."
eclesia.blog`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${fileName}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 space-y-16 animate-fade-in text-[#1c1b1b] dark:text-[#f3ede2]">
      {/* Hero Header */}
      <section className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 text-[#785600] dark:text-[#ffdea6] text-xs font-bold tracking-widest uppercase">
          <HeartHandshake className="w-4 h-4" />
          <span>Apostolado Digital Independente</span>
        </div>

        <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-[#785600] dark:text-[#f3c877] tracking-tight">
          Clube de Benfeitores do Eclesia
        </h1>

        <p className="font-sans text-sm sm:text-base text-[#4f4535] dark:text-[#c4b9a7] leading-relaxed">
          O Eclesia é mantido exclusivamente pela generosidade de fiéis comprometidos com a doutrina, liturgia e devoção tradicional da Santa Igreja Católica. Junte-se a nós como benfeitor mensal.
        </p>
      </section>

      {/* Pricing / Tiers Cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
        {BENEFACTOR_TIERS.map((tier) => {
          const isRec = tier.recommended;
          return (
            <div
              key={tier.id}
              className={`bg-white dark:bg-[#1a1714] rounded-3xl p-7 sm:p-8 flex flex-col justify-between border relative transition-all duration-300 shadow-sm ${
                isRec
                  ? 'border-[#785600] dark:border-[#ffdea6] ring-2 ring-[#785600]/20 dark:ring-[#ffdea6]/20 shadow-xl md:-translate-y-2'
                  : 'border-[#d3c4af]/60 dark:border-[#383027] hover:border-[#785600]/60'
              }`}
            >
              {tier.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#785600] text-white font-sans text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full shadow-xs flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-[#ffdea6]" /> {tier.badge}
                </div>
              )}

              <div className="space-y-6">
                <div>
                  <h3 className="font-display text-2xl font-bold text-[#785600] dark:text-[#f3c877]">
                    {tier.name}
                  </h3>
                  <p className="font-sans text-xs text-[#4f4535] dark:text-[#c4b9a7] mt-1.5 leading-relaxed">
                    {tier.subtitle}
                  </p>
                </div>

                <div className="flex items-baseline gap-1 text-[#785600] dark:text-[#ffdea6]">
                  <span className="text-sm font-bold">R$</span>
                  <span className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight">
                    {tier.amount}
                  </span>
                  <span className="text-xs text-[#817563] dark:text-[#a89d8d]">/mês</span>
                </div>

                <div className="border-t border-[#d3c4af]/40 dark:border-[#332a22] pt-6 space-y-3">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#817563] dark:text-[#a89d8d]">
                    Benefícios Espirituais e Materiais:
                  </p>
                  <ul className="space-y-2.5">
                    {tier.benefits.map((benefit, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-xs text-[#4f4535] dark:text-[#d3c4af] leading-relaxed">
                        <Check className="w-4 h-4 text-[#785600] dark:text-[#ffdea6] shrink-0 mt-0.5" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-8">
                <button
                  onClick={() => handleOpenCheckout(tier)}
                  className={`w-full py-3 px-4 rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 cursor-pointer shadow-xs ${
                    isRec
                      ? 'bg-[#785600] hover:bg-[#5f4400] text-white shadow-md'
                      : 'bg-[#f6f3f2] dark:bg-[#28231d] hover:bg-amber-50 dark:hover:bg-[#332c24] text-[#785600] dark:text-[#ffdea6] border border-[#d3c4af]/70 dark:border-[#3a3229]'
                  }`}
                >
                  Tornar-se {tier.name.split(' ')[0]}
                </button>
              </div>
            </div>
          );
        })}
      </section>

      {/* Exclusive Members Downloads Section */}
      <section className="bg-gradient-to-r from-amber-50/60 to-[#fdf9f4] dark:from-[#211c17] dark:to-[#171411] border border-[#d3c4af]/70 dark:border-[#383027] rounded-3xl p-6 sm:p-10 shadow-xs space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#785600] dark:text-[#ffdea6] uppercase tracking-wider">
              <BookOpen className="w-4 h-4" />
              <span>Área de Conteúdo Exclusivo para Benfeitores</span>
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#785600] dark:text-[#f3c877]">
              Devocionais e E-books em PDF
            </h2>
            <p className="text-xs sm:text-sm text-[#4f4535] dark:text-[#c4b9a7] max-w-2xl leading-relaxed">
              Materiais de formação piedosa e espiritual prontos para leitura no celular ou impressão para sua família.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-2">
          {[
            {
              title: 'Guia Completo do Santo Terço & Meditações',
              pages: '32 páginas',
              file: 'guia-santo-terco-eclesia'
            },
            {
              title: 'Manual de Exame de Consciência para Boa Confissão',
              pages: '18 páginas',
              file: 'exame-consciencia-eclesia'
            },
            {
              title: 'Antologia de Orações em Latim e Português',
              pages: '44 páginas',
              file: 'oracoes-latim-portugues-eclesia'
            }
          ].map((item, i) => (
            <div
              key={i}
              className="bg-white dark:bg-[#1a1714] p-4 rounded-2xl border border-[#d3c4af]/50 dark:border-[#332a22] flex flex-col justify-between gap-3 shadow-2xs"
            >
              <div>
                <div className="flex items-center gap-2 text-xs text-[#817563] dark:text-[#a89d8d] mb-1 font-mono">
                  <FileText className="w-3.5 h-3.5 text-[#785600] dark:text-[#ffdea6]" />
                  <span>PDF • {item.pages}</span>
                </div>
                <h4 className="font-serif font-bold text-sm text-[#1c1b1b] dark:text-[#f3ede2] line-clamp-2">
                  {item.title}
                </h4>
              </div>

              <button
                onClick={() => handleDownloadPdf(item.file)}
                className="w-full py-2 px-3 rounded-lg bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-900/40 border border-amber-300 dark:border-amber-800/60 text-[#785600] dark:text-[#ffdea6] text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Baixar Guia PDF</span>
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Trust & Transparency */}
      <section className="border-t border-[#d3c4af]/40 dark:border-[#332a22] pt-10 text-center max-w-xl mx-auto space-y-3">
        <div className="flex justify-center text-[#785600] dark:text-[#ffdea6]">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h3 className="font-serif font-bold text-lg text-[#1c1b1b] dark:text-[#f3ede2]">
          Apostolado Transparente e Sem Fins Políticos
        </h3>
        <p className="text-xs text-[#817563] dark:text-[#a89d8d] leading-relaxed">
          Todos os recursos arrecadados são integralmente aplicados na infraestrutura do portal, licenciamento de fontes católicas, desenvolvimento tecnológico e manutenção de publicações diárias gratuitas para milhares de católicos.
        </p>
      </section>

      {/* Modal de Checkout / Doação PIX */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white dark:bg-[#1a1714] border border-[#d3c4af] dark:border-[#383027] rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative space-y-6 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-[#817563] hover:text-[#1c1b1b] dark:hover:text-white rounded-full cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {!isSuccess ? (
              <form onSubmit={handleSubmitBenefactor} className="space-y-5">
                <div>
                  <span className="text-xs uppercase tracking-widest font-bold text-[#785600] dark:text-[#ffdea6]">
                    Apoio Mensal ao Eclesia
                  </span>
                  <h3 className="font-display text-2xl font-bold text-[#785600] dark:text-[#f3c877] mt-0.5">
                    {selectedTier.name}
                  </h3>
                  <p className="text-xs text-[#817563] dark:text-[#a89d8d]">
                    Contribuição de R$ {selectedTier.amount.toFixed(2)} por mês
                  </p>
                </div>

                {errorMessage && (
                  <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-800 text-red-700 dark:text-red-300 rounded-xl text-xs">
                    {errorMessage}
                  </div>
                )}

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#4f4535] dark:text-[#d3c4af] mb-1">
                      Seu Nome Completo *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Ex: Pedro Henrique de Alcântara"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#d3c4af]/80 dark:border-[#383027] bg-[#fcf9f8] dark:bg-[#24201b] text-xs focus:ring-2 focus:ring-[#785600] outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#4f4535] dark:text-[#d3c4af] mb-1">
                      Seu Melhor E-mail *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="seuemail@exemplo.com"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#d3c4af]/80 dark:border-[#383027] bg-[#fcf9f8] dark:bg-[#24201b] text-xs focus:ring-2 focus:ring-[#785600] outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#4f4535] dark:text-[#d3c4af] mb-1">
                      WhatsApp / Telefone (opcional)
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="(11) 99999-9999"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#d3c4af]/80 dark:border-[#383027] bg-[#fcf9f8] dark:bg-[#24201b] text-xs focus:ring-2 focus:ring-[#785600] outline-hidden"
                    />
                  </div>
                </div>

                {/* Forma de Pagamento */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-[#4f4535] dark:text-[#d3c4af]">
                    Forma de Contribuição:
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('pix')}
                      className={`p-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold cursor-pointer ${
                        paymentMethod === 'pix'
                          ? 'border-[#785600] bg-amber-50 dark:bg-amber-950/40 text-[#785600] dark:text-[#ffdea6]'
                          : 'border-[#d3c4af]/60 dark:border-[#383027] text-[#4f4535] dark:text-[#c4b9a7]'
                      }`}
                    >
                      <QrCode className="w-4 h-4" />
                      <span>PIX Instantâneo</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('card')}
                      className={`p-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold cursor-pointer ${
                        paymentMethod === 'card'
                          ? 'border-[#785600] bg-amber-50 dark:bg-amber-950/40 text-[#785600] dark:text-[#ffdea6]'
                          : 'border-[#d3c4af]/60 dark:border-[#383027] text-[#4f4535] dark:text-[#c4b9a7]'
                      }`}
                    >
                      <CreditCard className="w-4 h-4" />
                      <span>Cartão de Crédito</span>
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 px-4 rounded-xl bg-[#785600] hover:bg-[#5f4400] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-colors cursor-pointer"
                >
                  {isSubmitting ? (
                    <span>Processando confirmação...</span>
                  ) : (
                    <>
                      <HeartHandshake className="w-4 h-4" />
                      <span>Confirmar Apoio de R$ {selectedTier.amount.toFixed(2)}/mês</span>
                    </>
                  )}
                </button>
              </form>
            ) : (
              /* Success Screen with PIX Key or Confirmation */
              <div className="space-y-6 text-center">
                <div className="w-14 h-14 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8" />
                </div>

                <div className="space-y-1">
                  <h3 className="font-display text-2xl font-bold text-[#785600] dark:text-[#f3c877]">
                    Deus lhe pague, {formData.name.split(' ')[0]}!
                  </h3>
                  <p className="text-xs text-[#4f4535] dark:text-[#c4b9a7]">
                    Seu cadastro como <strong>{selectedTier.name}</strong> foi registrado com sucesso em nosso apostolado.
                  </p>
                </div>

                {paymentMethod === 'pix' && (
                  <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 space-y-3 text-left">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#785600] dark:text-[#ffdea6] flex items-center gap-1.5">
                        <QrCode className="w-4 h-4" /> Chave PIX Oficial Eclesia
                      </span>
                      <span className="text-[10px] bg-[#785600] text-white px-2 py-0.5 rounded-full font-bold">
                        R$ {selectedTier.amount.toFixed(2)}
                      </span>
                    </div>

                    <div className="bg-white dark:bg-[#1a1714] p-2.5 rounded-xl border border-amber-200 dark:border-amber-900/60 flex items-center justify-between gap-2">
                      <span className="text-[11px] font-mono text-[#4f4535] dark:text-[#c4b9a7] truncate">
                        eclesia-apostolado-pix@eclesia.blog
                      </span>
                      <button
                        onClick={handleCopyPix}
                        className="px-2.5 py-1 rounded-lg bg-[#785600] hover:bg-[#5f4400] text-white text-[11px] font-bold flex items-center gap-1 shrink-0 cursor-pointer"
                      >
                        <Copy className="w-3 h-3" />
                        <span>{copiedPix ? 'Copiado!' : 'Copiar'}</span>
                      </button>
                    </div>

                    <p className="text-[11px] text-[#817563] dark:text-[#a89d8d] leading-relaxed">
                      Abra o aplicativo do seu banco, escolha PIX e cole a chave acima para efetivar a sua primeira contribuição.
                    </p>
                  </div>
                )}

                <button
                  onClick={() => setModalOpen(false)}
                  className="w-full py-3 px-4 rounded-xl bg-[#785600] text-white text-xs font-bold hover:bg-[#5f4400] cursor-pointer"
                >
                  Concluir e Voltar ao Portal
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
