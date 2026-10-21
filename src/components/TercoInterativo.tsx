import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  ChevronRight, 
  ChevronLeft, 
  RotateCcw, 
  CheckCircle2, 
  BookOpen, 
  Heart, 
  Volume2, 
  Calendar,
  Share2,
  Check,
  Baby
} from 'lucide-react';
import { SantoTercoKids } from './SantoTercoKids';

export type MysteryType = 'gozosos' | 'dolorosos' | 'gloriosos' | 'luminosos';

interface MysteryItem {
  number: number;
  title: string;
  biblicalRef: string;
  meditation: string;
  fruit: string; // Virtude / Fruto do mistério
}

interface MysteryGroup {
  id: MysteryType;
  name: string;
  daysDescription: string;
  days: number[]; // 0=Dom, 1=Seg, 2=Ter, 3=Qua, 4=Qui, 5=Sex, 6=Sab
  mysteries: MysteryItem[];
}

export const MYSTERY_GROUPS: MysteryGroup[] = [
  {
    id: 'gozosos',
    name: 'Mistérios Gozosos',
    daysDescription: 'Segunda-feira e Sábado',
    days: [1, 6],
    mysteries: [
      {
        number: 1,
        title: 'A Anunciação do Arcanjo São Gabriel a Nossa Senhora',
        biblicalRef: 'Lucas 1, 26-38',
        meditation: 'O anjo Gabriel anuncia a Maria que Ela conceberá e dará à luz o Filho do Altíssimo pelo poder do Espírito Santo.',
        fruit: 'Humildade e aceitação da Vontade Divina'
      },
      {
        number: 2,
        title: 'A Visitação de Nossa Senhora a sua prima Santa Isabel',
        biblicalRef: 'Lucas 1, 39-56',
        meditation: 'Maria parte apressadamente para as montanhas da Judeia para servir à sua prima Isabel, gerando louvor e alegria no seio materno.',
        fruit: 'Caridade fraterna e solicitude ao próximo'
      },
      {
        number: 3,
        title: 'O Nascimento de Jesus no presépio de Belém',
        biblicalRef: 'Lucas 2, 1-20',
        meditation: 'Nasce o Salvador do mundo em pobreza extrema, adorado pelos anjos, humildes pastores e santos reis magos.',
        fruit: 'Desapego dos bens materiais e espírito de pobreza'
      },
      {
        number: 4,
        title: 'A Apresentação do Menino Jesus no Templo e Purificação de Maria',
        biblicalRef: 'Lucas 2, 22-38',
        meditation: 'Cumprindo a lei de Moisés, José e Maria consagram o Menino Jesus no Templo, onde o velho Simeão profetiza a espada de dor.',
        fruit: 'Pureza de coração e obediência à Igreja'
      },
      {
        number: 5,
        title: 'A Perda e o Encontro de Jesus no Templo entre os Doutores',
        biblicalRef: 'Lucas 2, 41-52',
        meditation: 'Aos doze anos, Jesus permanece no Templo conversando com os doutores sobre a Lei divina e a Casa de Seu Pai celestial.',
        fruit: 'Piedade, busca sincera por Jesus e zelo apostólico'
      }
    ]
  },
  {
    id: 'dolorosos',
    name: 'Mistérios Dolorosos',
    daysDescription: 'Terça-feira e Sexta-feira',
    days: [2, 5],
    mysteries: [
      {
        number: 1,
        title: 'A Agonia de Nosso Senhor Jesus Cristo no Horto das Oliveiras',
        biblicalRef: 'Mateus 26, 36-46',
        meditation: 'No Getsêmani, Jesus experimenta a angústia de todos os pecados da humanidade e ora em obediência: "Pai, faça-se a Tua vontade".',
        fruit: 'Contrição sincera dos pecados e conformidade com a Cruz'
      },
      {
        number: 2,
        title: 'A Flagelação de Nosso Senhor atado à coluna',
        biblicalRef: 'João 19, 1',
        meditation: 'Jesus é impiedosamente açoitado no pretório romano para expiar os pecados de concupiscência e impureza dos homens.',
        fruit: 'Mortificação dos sentidos e pureza corporal'
      },
      {
        number: 3,
        title: 'A Coroação de Espinhos e o Escárnio de Cristo',
        biblicalRef: 'Mateus 27, 27-31',
        meditation: 'Os soldados zombam de Sua realeza com coroa pontiaguda de espinhos, cana por cetro e manto de púrpura.',
        fruit: 'Humildade interior e vitória sobre o orgulho e vaidade'
      },
      {
        number: 4,
        title: 'O Carregamento da Cruz a caminho do Monte Calvário',
        biblicalRef: 'Lucas 23, 26-32',
        meditation: 'Exausto e ferido, Nosso Senhor abraça o pesado madeiro e sobe ao Calvário consolado por Maria e pelas piedosas mulheres.',
        fruit: 'Paciência diante dos sofrimentos cotidianos'
      },
      {
        number: 5,
        title: 'A Crucificação e Morte de Nosso Senhor na Cruz',
        biblicalRef: 'João 19, 17-30',
        meditation: 'Após três horas de indizível martírio, Jesus nos entrega Nossa Senhora por Mãe e expira entregando o Seu espírito ao Pai.',
        fruit: 'Perdão aos inimigos e salvação das almas'
      }
    ]
  },
  {
    id: 'gloriosos',
    name: 'Mistérios Gloriosos',
    daysDescription: 'Quarta-feira e Domingo',
    days: [3, 0],
    mysteries: [
      {
        number: 1,
        title: 'A Gloriosa Ressurreição de Nosso Senhor Jesus Cristo',
        biblicalRef: 'Mateus 28, 1-10',
        meditation: 'Na manhã do terceiro dia, Cristo vence para sempre o pecado, a morte e o inferno, ressurgindo revestido de glória incorruptível.',
        fruit: 'Fé viva e conversão para a vida da graça'
      },
      {
        number: 2,
        title: 'A Admirável Ascensão de Jesus Cristo aos Céus',
        biblicalRef: 'Atos 1, 6-11',
        meditation: 'Diante de Seus apóstolos e da Virgem Maria, Nosso Senhor sobe aos Céus e senta-Se à direita de Deus Pai Todo-Poderoso.',
        fruit: 'Esperança e ardente desejo do Paraíso eterno'
      },
      {
        number: 3,
        title: 'A Descida do Espírito Santo no Cenáculo de Jerusalém',
        biblicalRef: 'Atos 2, 1-13',
        meditation: 'Em oração com Maria Santíssima, os apóstolos recebem o fogo consolador do Paráclito e partem para evangelizar o mundo.',
        fruit: 'Amor ardente a Deus e docilidade aos dons do Espírito Santo'
      },
      {
        number: 4,
        title: 'A Triunfante Assunção de Nossa Senhora em Corpo e Alma ao Céu',
        biblicalRef: 'Apocalipse 12, 1',
        meditation: 'Terminada Sua peregrinação terrena, a Mãe de Deus é elevada pelos anjos em corpo e alma à bem-aventurança eterna.',
        fruit: 'Devoção filial a Maria e graça da boa morte'
      },
      {
        number: 5,
        title: 'A Coroação de Nossa Senhora como Rainha do Céu e da Terra',
        biblicalRef: 'Cânticos 4, 8; Apocalipse 12, 1',
        meditation: 'A Santíssima Trindade coroa a Virgem Imaculada Rainha dos anjos, patriarcas, profetas, apóstolos e de toda a criação.',
        fruit: 'Perseverança final e filial confiança na intercessão materna'
      }
    ]
  },
  {
    id: 'luminosos',
    name: 'Mistérios Luminosos',
    daysDescription: 'Quinta-feira',
    days: [4],
    mysteries: [
      {
        number: 1,
        title: 'O Batismo de Jesus no Rio Jordão por São João Batista',
        biblicalRef: 'Mateus 3, 13-17',
        meditation: 'Jesus santifica as águas; o Espírito Santo desce sob a forma de pomba e o Pai atesta: "Este é meu Filho muito amado".',
        fruit: 'Fidelidade às promessas do nosso Batismo'
      },
      {
        number: 2,
        title: 'A Auto-revelação de Jesus nas Bodas de Caná',
        biblicalRef: 'João 2, 1-11',
        meditation: 'Atendendo à súplica de Maria — "Fazei tudo o que Ele vos disser" —, Jesus transforma a água em vinho fino, revelando Sua glória.',
        fruit: 'Confiança na mediação da Virgem Maria e santidade familiar'
      },
      {
        number: 3,
        title: 'O Anúncio do Reino de Deus e o Convite à Conversão',
        biblicalRef: 'Marcos 1, 14-15',
        meditation: 'Jesus percorre a Galileia anunciando o Evangelho, perdoando os pecados e convidando todos à penitência e à graça.',
        fruit: 'Espírito de conversão contínua e busca da confissão sacramental'
      },
      {
        number: 4,
        title: 'A Transfiguração de Nosso Senhor no Monte Tabor',
        biblicalRef: 'Lucas 9, 28-36',
        meditation: 'Diante de Pedro, Tiago e João, o rosto de Jesus resplandece como o sol para fortalecer a fé dos apóstolos na Paixão.',
        fruit: 'Espírito de oração e contemplação das coisas celestes'
      },
      {
        number: 5,
        title: 'A Instituição da Santíssima Eucaristia na Última Ceia',
        biblicalRef: 'Mateus 26, 26-29',
        meditation: 'Na véspera de Sua Paixão, Cristo nos dá Seu verdadeiro Corpo e Sangue no Santíssimo Sacramento do Altar.',
        fruit: 'Amor fervoroso à Santa Missa e comunhão frequente'
      }
    ]
  }
];

export const TercoInterativo: React.FC = () => {
  // Modo de visualização: Tradicional (adulto) ou Kids (infantil)
  const [tercoMode, setTercoMode] = useState<'adult' | 'kids'>(() => {
    if (typeof window !== 'undefined') {
      const urlParam = new URLSearchParams(window.location.search).get('modo');
      if (urlParam === 'kids' || window.location.hash.includes('kids')) return 'kids';
    }
    return 'adult';
  });

  // 1. Lógica Automática do Dia da Semana
  const getTodayMysteryId = (): MysteryType => {
    const day = new Date().getDay();
    const group = MYSTERY_GROUPS.find((g) => g.days.includes(day));
    return group ? group.id : 'gloriosos';
  };

  const [selectedGroup, setSelectedGroup] = useState<MysteryType>(getTodayMysteryId);
  const [currentStep, setCurrentStep] = useState<number>(0); 
  // 0: Abertura / Oferecimento / Credo
  // 1: Pai Nosso e 3 Ave-Marias Iniciais
  // 2, 3, 4, 5, 6: Mistérios 1 a 5
  // 7: Agradecimento e Salve Rainha

  const [aveMariaCount, setAveMariaCount] = useState<number>(0);
  const [copiedShare, setCopiedShare] = useState(false);

  const activeGroup = MYSTERY_GROUPS.find((g) => g.id === selectedGroup)!;

  // Reseta contas ao trocar de mistério ou grupo
  useEffect(() => {
    setAveMariaCount(0);
  }, [currentStep, selectedGroup]);

  const handleNextStep = () => {
    if (currentStep < 7) {
      setCurrentStep(currentStep + 1);
      setAveMariaCount(0);
      window.scrollTo({ top: 300, behavior: 'smooth' });
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setAveMariaCount(0);
      window.scrollTo({ top: 300, behavior: 'smooth' });
    }
  };

  const handleRestart = () => {
    setCurrentStep(0);
    setAveMariaCount(0);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAveMariaClick = (index: number) => {
    if (index === aveMariaCount + 1) {
      setAveMariaCount(index);
    } else {
      setAveMariaCount(index);
    }
  };

  const handleShareTerco = () => {
    const shareText = `Estou rezando os ${activeGroup.name} no Portal Eclesia: ${window.location.origin}/terco`;
    if (navigator.share) {
      navigator.share({
        title: 'Santo Terço Interativo - Eclesia',
        text: shareText,
        url: `${window.location.origin}/terco`
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(`${window.location.origin}/terco`);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2500);
    }
  };

  // Se o Modo Kids estiver ativo, renderiza o componente infantil dedicado
  if (tercoMode === 'kids') {
    return <SantoTercoKids onSwitchToAdult={() => setTercoMode('adult')} />;
  }

  // Identifica se estamos em uma das 5 dezenas (steps 2 a 6)
  const isDecadeStep = currentStep >= 2 && currentStep <= 6;
  const currentMysteryIndex = isDecadeStep ? currentStep - 2 : null;
  const currentMystery = currentMysteryIndex !== null ? activeGroup.mysteries[currentMysteryIndex] : null;

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-8 md:py-12 animate-fade-in text-[#1c1b1b] dark:text-[#f3ede2]">
      {/* Seletor de Modo no Topo: Adulto Tradicional / Kids */}
      <div className="flex justify-center mb-6">
        <div className="inline-flex p-1.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 shadow-xs">
          <button
            onClick={() => setTercoMode('adult')}
            className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 bg-[#785600] text-white shadow-xs"
          >
            <span>✝️</span>
            <span>Modo Tradicional</span>
          </button>
          <button
            onClick={() => setTercoMode('kids')}
            className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 text-[#817563] dark:text-[#c4b9a7] hover:text-[#2B6CB0] hover:bg-white/80 dark:hover:bg-[#2c2620]"
          >
            <span>🎈</span>
            <span>Santo Terço Kids ✨</span>
          </button>
        </div>
      </div>

      {/* Top Banner & Day Badge */}
      <div className="text-center space-y-4 mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 text-[#785600] dark:text-[#ffdea6] text-xs font-semibold tracking-wide uppercase">
          <Calendar className="w-3.5 h-3.5" />
          <span>Mistérios de Hoje: {MYSTERY_GROUPS.find(g => g.id === getTodayMysteryId())?.name}</span>
        </div>

        <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-[#785600] dark:text-[#f3c877] tracking-tight">
          Santo Terço Interativo
        </h1>
        <p className="font-sans text-sm sm:text-base text-[#4f4535] dark:text-[#c4b9a7] max-w-xl mx-auto leading-relaxed">
          Reze e contemple os mistérios da Redenção passo a passo com contagem guiada de Ave-Marias e meditações bíblicas.
        </p>

        {/* Selector de Mistérios */}
        <div className="flex flex-wrap justify-center gap-2 pt-2">
          {MYSTERY_GROUPS.map((group) => {
            const isSelected = selectedGroup === group.id;
            const isToday = group.id === getTodayMysteryId();
            return (
              <button
                key={group.id}
                onClick={() => {
                  setSelectedGroup(group.id);
                  setCurrentStep(0);
                  setAveMariaCount(0);
                }}
                className={`relative px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer border ${
                  isSelected
                    ? 'bg-[#785600] text-white border-[#785600] shadow-md scale-102'
                    : 'bg-white dark:bg-[#1f1b17] text-[#4f4535] dark:text-[#d3c4af] border-[#d3c4af]/60 dark:border-[#38322a] hover:border-[#785600]/60'
                }`}
              >
                <span>{group.name}</span>
                {isToday && (
                  <span className="block text-[9px] opacity-90 font-normal">
                    (Hoje: {group.daysDescription.split(' e ')[0]})
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Progress Tracker Steps (0 a 7) */}
      <div className="bg-white dark:bg-[#1a1714] border border-[#d3c4af]/50 dark:border-[#332c25] rounded-2xl p-4 sm:p-5 shadow-xs mb-8">
        <div className="flex items-center justify-between text-xs text-[#817563] dark:text-[#a89d8d] mb-2 font-medium">
          <span>Passo {currentStep + 1} de 8</span>
          <span className="font-bold text-[#785600] dark:text-[#ffdea6]">
            {currentStep === 0 && 'Orações Iniciais'}
            {currentStep === 1 && '3 Ave-Marias Iniciais'}
            {isDecadeStep && `${currentStep - 1}º Mistério`}
            {currentStep === 7 && 'Orações Finais e Salve Rainha'}
          </span>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full h-2 bg-[#f0eded] dark:bg-[#2c2620] rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#b38422] to-[#785600] transition-all duration-300"
            style={{ width: `${((currentStep + 1) / 8) * 100}%` }}
          />
        </div>
      </div>

      {/* Main Prayer Step Card */}
      <div className="bg-white dark:bg-[#1a1714] border border-[#d3c4af]/60 dark:border-[#332c25] rounded-3xl p-6 sm:p-8 md:p-10 shadow-lg space-y-8 relative overflow-hidden">
        {/* Subtle decorative cross watermark */}
        <div className="absolute top-2 right-4 text-[#785600]/5 dark:text-[#ffdea6]/5 pointer-events-none select-none font-serif text-9xl font-bold">
          ✝
        </div>

        {/* STEP 0: ORAÇÕES INICIAIS */}
        {currentStep === 0 && (
          <div className="space-y-6">
            <div className="border-b border-[#d3c4af]/40 dark:border-[#332c25] pb-4">
              <span className="text-xs uppercase tracking-widest text-[#785600] dark:text-[#ffdea6] font-bold">
                Início do Terço
              </span>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#785600] dark:text-[#f3c877] mt-1">
                Sinal da Cruz e Credo
              </h2>
            </div>

            <div className="bg-[#fcf9f8] dark:bg-[#241f1a] p-5 rounded-2xl border border-[#d3c4af]/40 dark:border-[#3a3229] space-y-3">
              <p className="font-bold text-sm text-[#785600] dark:text-[#ffdea6]">
                ✟ Pelo sinal da Santa Cruz, livrai-nos, Deus, Nosso Senhor, dos nossos inimigos espirituais e carnais.
              </p>
              <p className="font-sans text-sm text-[#4f4535] dark:text-[#d3c4af] italic">
                Em nome do Pai, do Filho e do Espírito Santo. Amém.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="font-serif font-bold text-lg text-[#1c1b1b] dark:text-[#f3ede2]">Oferecimento do Santo Terço</h3>
              <p className="font-sans text-sm sm:text-base text-[#4f4535] dark:text-[#c4b9a7] leading-relaxed">
                "Divino Jesus, nós Vos oferecemos este Terço que vamos rezar, contemplando os mistérios de nossa Redenção. Concedei-nos, pelas mãos puríssimas da Virgem Maria, vossa e nossa Mãe, as virtudes necessárias para bem rezá-lo e as graças que vos pedimos por esta nossa oração..."
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="font-serif font-bold text-lg text-[#1c1b1b] dark:text-[#f3ede2]">Símbolo dos Apóstolos (Credo)</h3>
              <p className="font-sans text-sm sm:text-base text-[#4f4535] dark:text-[#c4b9a7] leading-relaxed bg-[#f6f3f2] dark:bg-[#201c18] p-5 rounded-2xl border border-[#d3c4af]/40 dark:border-[#332c25]">
                Creio em Deus Pai Todo-Poderoso, Criador do céu e da terra. E em Jesus Cristo, Seu único Filho, Nosso Senhor; que foi concebido pelo poder do Espírito Santo, nasceu da Virgem Maria; padeceu sob Pôncio Pilatos, foi crucificado, morto e sepultado; desceu à mansão dos mortos; ressuscitou ao terceiro dia; subiu aos céus, está sentado à direita de Deus Pai Todo-Poderoso, donde há de vir a julgar os vivos e os mortos. Creio no Espírito Santo; na Santa Igreja Católica; na comunhão dos santos; na remissão dos pecados; na ressurreição da carne; na vida eterna. Amém.
              </p>
            </div>
          </div>
        )}

        {/* STEP 1: PAI NOSSO E 3 AVE-MARIAS INICIAIS */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="border-b border-[#d3c4af]/40 dark:border-[#332c25] pb-4">
              <span className="text-xs uppercase tracking-widest text-[#785600] dark:text-[#ffdea6] font-bold">
                Três Virtudes Teologais
              </span>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#785600] dark:text-[#f3c877] mt-1">
                Pai-Nosso e 3 Ave-Marias Iniciais
              </h2>
            </div>

            <div className="space-y-4">
              <div className="bg-[#fcf9f8] dark:bg-[#241f1a] p-4 rounded-xl border border-[#d3c4af]/40 dark:border-[#3a3229]">
                <h4 className="font-bold text-sm text-[#785600] dark:text-[#ffdea6] mb-1">Pai-Nosso</h4>
                <p className="font-sans text-xs sm:text-sm text-[#4f4535] dark:text-[#c4b9a7] leading-relaxed">
                  Pai nosso que estais nos céus, santificado seja o vosso nome; venha a nós o vosso reino; seja feita a vossa vontade assim na terra como no céu. O pão nosso de cada dia nos dai hoje; perdoai-nos as nossas ofensas assim como nós perdoamos a quem nos tem ofendido; e não nos deixeis cair em tentação, mas livrai-nos do mal. Amém.
                </p>
              </div>

              <div className="space-y-3">
                <p className="text-xs font-bold uppercase tracking-wider text-[#817563] dark:text-[#a89d8d]">
                  Toque para registrar as 3 Ave-Marias iniciais:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { num: 1, virtue: 'Aumento da Fé' },
                    { num: 2, virtue: 'Consolidação da Esperança' },
                    { num: 3, virtue: 'Ardor da Caridade' }
                  ].map((item) => {
                    const isDone = aveMariaCount >= item.num;
                    return (
                      <button
                        key={item.num}
                        onClick={() => setAveMariaCount(item.num)}
                        className={`p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer ${
                          isDone
                            ? 'bg-amber-50 dark:bg-amber-950/40 border-[#785600] dark:border-[#ffdea6]/60 shadow-xs'
                            : 'bg-white dark:bg-[#1a1714] border-[#d3c4af]/60 dark:border-[#38322a] hover:border-[#785600]/40'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-bold text-[#785600] dark:text-[#ffdea6]">
                            {item.num}ª Ave-Maria
                          </span>
                          {isDone ? (
                            <CheckCircle2 className="w-4 h-4 text-[#785600] dark:text-[#ffdea6]" />
                          ) : (
                            <div className="w-4 h-4 rounded-full border border-gray-300 dark:border-gray-600" />
                          )}
                        </div>
                        <p className="text-xs text-[#4f4535] dark:text-[#c4b9a7]">{item.virtue}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="bg-[#f6f3f2] dark:bg-[#201c18] p-4 rounded-xl border border-[#d3c4af]/40 dark:border-[#332c25]">
                <h4 className="font-bold text-sm text-[#785600] dark:text-[#ffdea6] mb-1">Glória ao Pai</h4>
                <p className="font-sans text-xs sm:text-sm text-[#4f4535] dark:text-[#c4b9a7]">
                  Glória ao Pai, ao Filho e ao Espírito Santo. Como era no princípio, agora e sempre. Amém.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* STEPS 2 A 6: OS 5 MISTÉRIOS COM DEZENA INTERATIVA */}
        {isDecadeStep && currentMystery && (
          <div className="space-y-6">
            {/* Header do Mistério */}
            <div className="border-b border-[#d3c4af]/40 dark:border-[#332c25] pb-4">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-widest text-[#785600] dark:text-[#ffdea6] font-bold">
                  {activeGroup.name} • {currentMystery.number}º Mistério
                </span>
                <span className="text-xs text-[#817563] dark:text-[#a89d8d] font-mono">
                  {currentMystery.biblicalRef}
                </span>
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#785600] dark:text-[#f3c877] mt-1">
                {currentMystery.title}
              </h2>
            </div>

            {/* Meditação Bíblica */}
            <div className="bg-[#fcf9f8] dark:bg-[#241f1a] p-5 rounded-2xl border border-[#d3c4af]/40 dark:border-[#3a3229] space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-[#785600] dark:text-[#ffdea6]">
                <BookOpen className="w-4 h-4" />
                <span>Meditação Contemplativa</span>
              </div>
              <p className="font-sans text-sm sm:text-base text-[#4f4535] dark:text-[#d3c4af] leading-relaxed">
                {currentMystery.meditation}
              </p>
              <div className="pt-2 text-xs text-[#817563] dark:text-[#a89d8d] flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 text-[#785600] dark:text-[#ffdea6]" />
                <span><strong>Fruto da oração:</strong> {currentMystery.fruit}</span>
              </div>
            </div>

            {/* Oração do Pai Nosso */}
            <div className="bg-[#f6f3f2] dark:bg-[#201c18] p-4 rounded-xl border border-[#d3c4af]/40 dark:border-[#332c25] text-xs sm:text-sm text-[#4f4535] dark:text-[#c4b9a7]">
              <strong className="text-[#785600] dark:text-[#ffdea6] block mb-1">1x Pai-Nosso:</strong>
              Pai nosso que estais nos céus, santificado seja o vosso nome; venha a nós o vosso reino; seja feita a vossa vontade assim na terra como no céu...
            </div>

            {/* Contador Interativo de 10 Ave-Marias (Rosary Beads) */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-serif font-bold text-base sm:text-lg text-[#1c1b1b] dark:text-[#f3ede2]">
                    Contador da Dezena (10 Ave-Marias)
                  </h4>
                  <p className="text-xs text-[#817563] dark:text-[#a89d8d]">
                    Toque nas contas ou no botão para avançar a oração
                  </p>
                </div>
                <span className="text-xl sm:text-2xl font-bold font-mono text-[#785600] dark:text-[#ffdea6]">
                  {aveMariaCount}/10
                </span>
              </div>

              {/* Rosary Beads visual */}
              <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 sm:gap-3 py-3">
                {Array.from({ length: 10 }, (_, i) => i + 1).map((bead) => {
                  const isDone = aveMariaCount >= bead;
                  const isCurrent = aveMariaCount === bead - 1;
                  return (
                    <button
                      key={bead}
                      onClick={() => handleAveMariaClick(bead)}
                      className={`h-11 sm:h-12 rounded-xl flex flex-col items-center justify-center font-bold text-xs transition-all duration-200 cursor-pointer border ${
                        isDone
                          ? 'bg-[#785600] text-white border-[#785600] shadow-xs scale-105 ring-2 ring-amber-300 dark:ring-amber-500/40'
                          : isCurrent
                          ? 'bg-amber-100 dark:bg-amber-950/60 text-[#785600] dark:text-[#ffdea6] border-[#785600] animate-pulse ring-1 ring-[#785600]'
                          : 'bg-white dark:bg-[#1a1714] text-[#817563] dark:text-[#a89d8d] border-[#d3c4af]/50 dark:border-[#38322a] hover:bg-amber-50/50'
                      }`}
                      title={`Ave-Maria ${bead}`}
                    >
                      <span>{bead}</span>
                      {isDone && <Check className="w-3 h-3 text-white mt-0.5" />}
                    </button>
                  );
                })}
              </div>

              {/* Botão de Avanço Rápido de Ave-Maria */}
              {aveMariaCount < 10 ? (
                <button
                  onClick={() => setAveMariaCount(Math.min(10, aveMariaCount + 1))}
                  className="w-full py-3 px-4 rounded-xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-900/40 border border-amber-300 dark:border-amber-700/60 text-[#785600] dark:text-[#ffdea6] font-bold text-sm flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Rezar {aveMariaCount + 1}ª Ave-Maria</span>
                </button>
              ) : (
                <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 text-xs sm:text-sm font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                  <span>Dezena completa! Reze o Glória ao Pai e a Jaculatória de Fátima abaixo.</span>
                </div>
              )}
            </div>

            {/* Orações de Encerramento da Dezena */}
            <div className="bg-[#f6f3f2] dark:bg-[#201c18] p-4 rounded-xl border border-[#d3c4af]/40 dark:border-[#332c25] space-y-3 text-xs sm:text-sm text-[#4f4535] dark:text-[#c4b9a7]">
              <div>
                <strong className="text-[#785600] dark:text-[#ffdea6] block mb-0.5">Glória ao Pai:</strong>
                Glória ao Pai, ao Filho e ao Espírito Santo. Como era no princípio, agora e sempre. Amém.
              </div>
              <div className="pt-2 border-t border-[#d3c4af]/30 dark:border-[#332c25]">
                <strong className="text-[#785600] dark:text-[#ffdea6] block mb-0.5">Jaculatória de Nossa Senhora de Fátima:</strong>
                "Ó meu Jesus, perdoai-nos, livrai-nos do fogo do inferno, levai as almas todas para o Céu e socorrei principalmente as que mais precisarem."
              </div>
            </div>
          </div>
        )}

        {/* STEP 7: ORAÇÕES FINAIS E SALVE RAINHA */}
        {currentStep === 7 && (
          <div className="space-y-6">
            <div className="border-b border-[#d3c4af]/40 dark:border-[#332c25] pb-4">
              <span className="text-xs uppercase tracking-widest text-[#785600] dark:text-[#ffdea6] font-bold">
                Conclusão do Terço
              </span>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#785600] dark:text-[#f3c877] mt-1">
                Agradecimento e Salve Rainha
              </h2>
            </div>

            <div className="space-y-4">
              <div className="bg-[#fcf9f8] dark:bg-[#241f1a] p-5 rounded-2xl border border-[#d3c4af]/40 dark:border-[#3a3229]">
                <h3 className="font-serif font-bold text-lg text-[#785600] dark:text-[#ffdea6] mb-2">
                  Infinitas Graças vos damos
                </h3>
                <p className="font-sans text-sm sm:text-base text-[#4f4535] dark:text-[#c4b9a7] leading-relaxed">
                  "Infinitas graças vos damos, Soberana Rainha, pelos benefícios que todos os dias recebemos de vossas mãos maternais. Dignai-vos agora e para sempre tomar-nos debaixo do vosso poderoso amparo, e para mais vos agradecer vos saudamos com uma Salve Rainha..."
                </p>
              </div>

              <div className="bg-amber-50 dark:bg-amber-950/30 p-6 rounded-2xl border border-amber-200 dark:border-amber-800/40 space-y-3">
                <h3 className="font-serif font-bold text-xl text-[#785600] dark:text-[#f3c877]">
                  Salve Rainha
                </h3>
                <p className="font-sans text-sm sm:text-base text-[#4f4535] dark:text-[#f3ede2] leading-relaxed">
                  Salve, Rainha, Mãe de misericórdia, vida, doçura e esperança nossa, salve! A vós bradamos os degredados filhos de Eva. A vós suspiramos, gemendo e chorando neste vale de lágrimas. Eia, pois, advogada nossa, esses vossos olhos misericordiosos a nós volvei, e depois deste desterro mostrai-nos Jesus, bendito fruto do vosso ventre, ó clemente, ó piedosa, ó doce sempre Virgem Maria.
                </p>
                <div className="pt-2 text-xs text-[#785600] dark:text-[#ffdea6] font-semibold space-y-1">
                  <p>— Rogai por nós, Santa Mãe de Deus.</p>
                  <p>— Para que sejamos dignos das promessas de Cristo. Amém.</p>
                </div>
              </div>

              <div className="text-center pt-4">
                <p className="font-bold text-sm text-[#785600] dark:text-[#ffdea6]">
                  ✟ Em nome do Pai, do Filho e do Espírito Santo. Amém.
                </p>
                <p className="text-xs text-[#817563] dark:text-[#a89d8d] mt-1">
                  Parabéns por concluir a oração do Santo Terço hoje! Que Nossa Senhora interceda sempre por sua família.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Footer Navigation Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-[#d3c4af]/40 dark:border-[#332c25]">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handlePrevStep}
              disabled={currentStep === 0}
              className={`flex-1 sm:flex-none px-4 py-2.5 rounded-xl border text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                currentStep === 0
                  ? 'opacity-40 cursor-not-allowed border-gray-200 dark:border-gray-800'
                  : 'bg-white dark:bg-[#1a1714] text-[#4f4535] dark:text-[#d3c4af] border-[#d3c4af]/60 dark:border-[#38322a] hover:border-[#785600]'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Anterior</span>
            </button>

            <button
              onClick={handleRestart}
              className="p-2.5 rounded-xl border border-[#d3c4af]/60 dark:border-[#38322a] text-[#817563] hover:text-[#785600] hover:border-[#785600] transition-colors cursor-pointer"
              title="Reiniciar Terço"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleShareTerco}
              className="px-3.5 py-2.5 rounded-xl border border-[#d3c4af]/60 dark:border-[#38322a] text-xs font-semibold text-[#817563] dark:text-[#c4b9a7] hover:text-[#785600] flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
            >
              <Share2 className="w-4 h-4 text-[#785600]" />
              <span>{copiedShare ? 'Link Copiado!' : 'Compartilhar'}</span>
            </button>

            {currentStep < 7 ? (
              <button
                onClick={handleNextStep}
                className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-[#785600] hover:bg-[#5f4400] text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer"
              >
                <span>Próximo Passo</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleRestart}
                className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-[#785600] hover:bg-[#5f4400] text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Rezar Novamente</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
