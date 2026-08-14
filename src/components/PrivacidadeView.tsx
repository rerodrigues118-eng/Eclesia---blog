import React from 'react';
import { ArrowLeft, Shield } from 'lucide-react';
import { ActiveView } from '../types';

interface PrivacidadeViewProps {
  setActiveView: (view: ActiveView) => void;
}

export const PrivacidadeView: React.FC<PrivacidadeViewProps> = ({ setActiveView }) => {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-20">
      <button
        onClick={() => setActiveView('home')}
        className="flex items-center gap-2 text-[#785600] hover:text-[#9a7000] font-sans text-xs font-bold uppercase tracking-wider mb-8 cursor-pointer transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Voltar ao Início
      </button>

      <div className="border-b border-[#d3c4af]/50 pb-6 mb-10">
        <div className="flex items-center gap-2 text-[#785600] font-sans text-xs font-bold uppercase tracking-widest mb-1">
          <Shield className="w-4 h-4" /> Documentos Legais
        </div>
        <h1 className="font-display text-4xl md:text-5xl font-bold text-[#1c1b1b] tracking-tight">
          Política de Privacidade
        </h1>
        <p className="font-sans text-sm text-[#4f4535] mt-2 leading-relaxed">
          Última atualização: agosto de 2026. Em total conformidade com a Lei Geral de Proteção de Dados (LGPD — Lei 13.709/2018).
        </p>
      </div>

      <div className="prose prose-sm max-w-none font-sans text-[#4f4535] space-y-8 leading-relaxed">

        <section>
          <h2 className="font-display text-2xl font-bold text-[#1c1b1b] mb-3">1. Compromisso com sua Privacidade</h2>
          <p>
            A Eclesia Editorial preza pelo respeito, integridade e proteção da sua privacidade digital. Coletamos somente as informações estritamente necessárias para proporcionar uma experiência formativa, segura e personalizada aos fiéis que visitam nosso portal.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl font-bold text-[#1c1b1b] mb-3">2. Dados que Coletamos</h2>
          <p>Os dados tratados pela Eclesia dividem-se em:</p>
          <ul className="list-disc list-inside space-y-1 mt-2 ml-2">
            <li><strong>Conta de Usuário:</strong> nome completo e endereço de e-mail ao cadastrar-se no portal</li>
            <li><strong>Preferências Devocionais:</strong> histórico de artigos favoritados e orações salvas no seu perfil</li>
            <li><strong>Newsletter:</strong> e-mail fornecido voluntariamente para receber a liturgia diária e boletins editoriais</li>
            <li><strong>Navegação Técnica:</strong> dados anônimos de acesso para otimização de velocidade e segurança do site</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-2xl font-bold text-[#1c1b1b] mb-3">3. Finalidade do Tratamento de Dados</h2>
          <p>Seus dados são utilizados exclusivamente para:</p>
          <ul className="list-disc list-inside space-y-1 mt-2 ml-2">
            <li>Permitir login e gerenciamento de artigos favoritos e itens da loja</li>
            <li>Envio de comunicações devocionais e informativos (mediante sua autorização)</li>
            <li>Garantir a segurança cibernética e integridade dos serviços</li>
            <li>Atendimento a eventuais dúvidas ou suporte técnico</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-2xl font-bold text-[#1c1b1b] mb-3">4. Não Comercialização e Sigilo</h2>
          <p>
            <strong>A Eclesia não comercializa, aluga ou vende dados pessoais</strong> a terceiros em nenhuma hipótese.
            Os dados são armazenados em servidores com criptografia de ponta e infraestrutura em nuvem certificada (Supabase/PostgreSQL).
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl font-bold text-[#1c1b1b] mb-3">5. Seus Direitos (LGPD)</h2>
          <p>Nos termos da LGPD, você pode a qualquer momento:</p>
          <ul className="list-disc list-inside space-y-1 mt-2 ml-2">
            <li>Confirmar a existência de tratamento e acessar seus dados</li>
            <li>Corrigir informações inexatas ou incompletas</li>
            <li>Solicitar a exclusão definitiva de sua conta e histórico</li>
            <li>Cancelar a assinatura da newsletter pelo link no rodapé de cada e-mail</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-2xl font-bold text-[#1c1b1b] mb-3">6. Encarregado de Proteção de Dados (DPO)</h2>
          <p>
            Para exercer qualquer direito relativo à sua privacidade ou tirar dúvidas, entre em contato pelo e-mail:{' '}
            <a href="mailto:suporte.delski@gmail.com" className="text-[#785600] hover:underline font-semibold">
              suporte.delski@gmail.com
            </a>
          </p>
        </section>

        <div className="bg-[#f6f3f2] border border-[#d3c4af]/60 rounded-xl p-6 mt-10 text-center">
          <p className="font-sans text-xs text-[#817563]">
            © 2026 Eclesia Editorial. Tratamento ético de dados em conformidade com a LGPD (Lei 13.709/2018).
          </p>
        </div>
      </div>
    </div>
  );
};
