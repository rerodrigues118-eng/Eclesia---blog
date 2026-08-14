import React from 'react';
import { ArrowLeft, ScrollText } from 'lucide-react';
import { ActiveView } from '../types';

interface TermosViewProps {
  setActiveView: (view: ActiveView) => void;
}

export const TermosView: React.FC<TermosViewProps> = ({ setActiveView }) => {
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
          <ScrollText className="w-4 h-4" /> Documentos Legais
        </div>
        <h1 className="font-display text-4xl md:text-5xl font-bold text-[#1c1b1b] tracking-tight">
          Termos de Uso
        </h1>
        <p className="font-sans text-sm text-[#4f4535] mt-2 leading-relaxed">
          Última atualização: agosto de 2026. Ao navegar e utilizar o portal Eclesia, você concorda integralmente com estes termos.
        </p>
      </div>

      <div className="prose prose-sm max-w-none font-sans text-[#4f4535] space-y-8 leading-relaxed">

        <section>
          <h2 className="font-display text-2xl font-bold text-[#1c1b1b] mb-3">1. Aceite dos Termos</h2>
          <p>
            Ao acessar e utilizar o portal Eclesia ("Portal" ou "Plataforma"), você declara ter lido, compreendido e concordado
            integralmente com estes Termos de Uso, nossa Política de Privacidade e as Diretrizes Editoriais. Se você
            não concordar com qualquer termo, pedimos que cesse a utilização do portal.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl font-bold text-[#1c1b1b] mb-3">2. Descrição dos Serviços Oferecidos</h2>
          <p>
            A Eclesia é um portal editorial, teológico e devocional católico, que disponibiliza aos fiéis:
          </p>
          <ul className="list-disc list-inside space-y-1 mt-2 ml-2">
            <li>Artigos formativos, ensaios teológicos e notícias oficiais da Igreja Católica</li>
            <li>Santoral com biografias, memórias litúrgicas e orações dos Santos</li>
            <li>Liturgia Diária completa (leituras, salmo e evangelho com comentários)</li>
            <li>Acervo devocional de orações tradicionais da Santa Igreja</li>
            <li>Loja e catálogo com indicação de livros e sacramentais católicos</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-2xl font-bold text-[#1c1b1b] mb-3">3. Cadastro e Conta de Acesso</h2>
          <p>
            O portal permite a criação de conta para salvar artigos favoritos, orações e acompanhar pedidos e produtos na loja.
            O usuário compromete-se a:
          </p>
          <ul className="list-disc list-inside space-y-1 mt-2 ml-2">
            <li>Fornecer dados cadastrais autênticos e válidos</li>
            <li>Manter o sigilo e segurança de suas credenciais de acesso</li>
            <li>Notificar a equipe caso identifique qualquer acesso não autorizado</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-2xl font-bold text-[#1c1b1b] mb-3">4. Loja e Links de Compra (Afiliados e Parceiros)</h2>
          <p>
            A Loja Eclesia apresenta produtos religiosos, livros e sacramentais. Algumas ofertas podem redirecionar o usuário para
            plataformas parceiras oficiais (como Mercado Livre, Shopee ou livrarias parceiras). O processamento de pagamentos, prazos
            de frete e entrega nesses casos são regidos pelos termos do respectivo marketplace de destino.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl font-bold text-[#1c1b1b] mb-3">5. Propriedade Intelectual e Direitos Autorais</h2>
          <p>
            Todo o conteúdo textual, ilustrações, identidade visual, logotipos e design do portal Eclesia são protegidos pelas leis de
            direitos autorais e propriedade intelectual. É permitida a citação e compartilhamento com atribuição de autoria e link para a
            matéria original, sendo expressamente vedada a reprodução comercial sem prévia autorização por escrito.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl font-bold text-[#1c1b1b] mb-3">6. Limitação de Responsabilidade</h2>
          <p>
            Os artigos e ensaios publicados possuem finalidade informativa, devocional e catequética. O portal não substitui a orientação
            pastoral direta, confissão sacramental ou discernimento espiritual com o seu pároco ou confessor.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl font-bold text-[#1c1b1b] mb-3">7. Atualizações e Alterações</h2>
          <p>
            A Eclesia reserva-se o direito de aprimorar funcionalidades e atualizar estes Termos periodicamente. Qualquer modificação substancial
            será informada na página inicial do portal.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl font-bold text-[#1c1b1b] mb-3">8. Contato e Dúvidas</h2>
          <p>
            Para esclarecimentos sobre estes Termos de Uso, envie um e-mail para:{' '}
            <a href="mailto:suporte.delski@gmail.com" className="text-[#785600] hover:underline font-semibold">
              suporte.delski@gmail.com
            </a>
          </p>
        </section>

        <div className="bg-[#f6f3f2] border border-[#d3c4af]/60 rounded-xl p-6 mt-10 text-center">
          <p className="font-sans text-xs text-[#817563]">
            © 2026 Eclesia Editorial. Ad Majorem Dei Gloriam. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </div>
  );
};
