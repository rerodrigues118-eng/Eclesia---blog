// ============================================================================
// ECLESIA BLOG CATÓLICO - CALENDÁRIO DO SANTORAL ROMANO GERAL & TRADIÇÃO
// Mapeamento e Fallback Canônico para os 365 dias do ano
// ============================================================================

import { Saint } from '../types';
import { selecionarDoBancoSacro } from '../services/imageService';

export interface MartyrologyEntry {
  day: number;
  month: number;
  name: string;
  title: string;
  patronage: string;
  summary: string;
  fullBio: string;
  prayer: string;
  imageUrl: string;
}

export const MONTH_NAMES = [
  '',
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro'
];

/**
 * Principais Festas e Memórias do Calendário Litúrgico Romano e Tradição Católica
 */
export const MARTIROLOGIO_CANONICO: Record<string, MartyrologyEntry> = {
  // OUTUBRO (Mês Corrente)
  '10-1': {
    day: 1,
    month: 10,
    name: 'Santa Teresinha do Menino Jesus',
    title: 'Virgem e Doutora da Igreja',
    patronage: 'Missões e Floristas',
    summary: 'A Doutora da Pequena Via que ensinou a santidade pelo amor heroico nas pequenas coisas cotidianas.',
    fullBio: 'Santa Teresinha nasceu em Alençon em 1873. No Carmelo de Lisieux viveu sua Pequena Via de infância espiritual e confiança cega na misericórdia de Deus. Prometeu passar o céu fazendo o bem sobre a terra, fazendo cair uma chuva de rosas.',
    prayer: 'Santa Teresinha do Menino Jesus, que passais o vosso Céu fazendo o bem sobre a terra, derramai sobre nós uma chuva de rosas de graças e virtudes. Amém.',
    imageUrl: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&q=80&w=1200'
  },
  '10-2': {
    day: 2,
    month: 10,
    name: 'Santos Anjos da Guarda',
    title: 'Memória dos Santos Anjos Custódios',
    patronage: 'Proteção de Todos os Fiéis Cristãos',
    summary: 'Os mensageiros celestes designados pela Divina Providência para nos guiar, guardar e iluminar.',
    fullBio: 'Desde a infância até a morte, a vida humana é cercada pela custódia e intercessão dos Anjos da Guarda. Cada fiel tem a seu lado um anjo como protetor e pastor para conduzi-lo à vida eterna.',
    prayer: 'Santo Anjo do Senhor, meu zeloso guardador, se a ti me confiou a piedade divina, sempre me rege, me guarde, me governe, me ilumine. Amém.',
    imageUrl: 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?auto=format&fit=crop&q=80&w=1200'
  },
  '10-4': {
    day: 4,
    month: 10,
    name: 'São Francisco de Assis',
    title: 'Pai Seráfico e Fundador dos Frades Menores',
    patronage: 'Ecologia, Itália e Pobres',
    summary: 'O Poverello de Assis que abraçou a Dama Pobreza e recebeu em seu próprio corpo os sagrados estigmas de Cristo.',
    fullBio: 'Nascido em Assis em 1182, renunciou a toda herança terrena para viver em perfeita conformidade com o Santo Evangelho. Fundou a Ordem dos Frades Menores e renovou profundamente a Igreja de Cristo.',
    prayer: 'Senhor, fazei-me instrumento de vossa paz. Onde houver ódio, que eu leve o amor; onde houver ofensa, que eu leve o perdão; onde houver discórdia, que eu leve a união. Amém.',
    imageUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&q=80&w=1200'
  },
  '10-12': {
    day: 12,
    month: 10,
    name: 'Nossa Senhora da Conceição Aparecida',
    title: 'Rainha e Padroeira Principal do Brasil',
    patronage: 'Povo Brasileiro e a Nação',
    summary: 'A Imaculada Mãe de Deus encontrada nas águas do Rio Paraíba do Sul, sinal perene de esperança e bênção.',
    fullBio: 'Em 1717, três pescadores encontraram milagrosamente no Rio Paraíba a imagem enegrecida da Imaculada Conceição. Desde então, o Santuário Nacional de Aparecida se tornou o coração mariano do Brasil.',
    prayer: 'Ó incomparável Senhora da Conceição Aparecida, Mãe de Deus e nossa Mãe, protegei o Brasil e acolhei sob vosso manto sagrado todas as nossas famílias. Amém.',
    imageUrl: 'https://images.unsplash.com/photo-1577083552431-6e5fd01aa342?auto=format&fit=crop&q=80&w=1200'
  },
  '10-15': {
    day: 15,
    month: 10,
    name: 'Santa Teresa de Jesus (de Ávila)',
    title: 'Virgem e Doutora da Igreja',
    patronage: 'Escritores Católicos e Religiosos',
    summary: 'A grande reformadora do Carmelo e mestra incomparável da oração contemplativa e das moradas da alma.',
    fullBio: 'Mística e reformadora espanhola do século XVI. Autora do Castelo Interior e do Livro da Vida, alcançou os cumes da união com Deus pela oração mental constante.',
    prayer: 'Nada te turbe, nada te espante, tudo passa, Deus não muda. A paciência tudo alcança; quem a Deus tem, nada lhe falta: só Deus basta! Amém.',
    imageUrl: 'https://images.unsplash.com/photo-1519491050282-cf00c82424b4?auto=format&fit=crop&q=80&w=1200'
  },
  '10-18': {
    day: 18,
    month: 10,
    name: 'São Lucas Evangelista',
    title: 'Evangelista, Apóstolo dos Gentios e Pintor Sacro',
    patronage: 'Médicos, Cirurgiões, Pintores e Artistas',
    summary: 'O médico amado que registrou o Evangelho da Misericórdia e os Atos dos Apóstolos com zelo minucioso.',
    fullBio: 'Companheiro leal de São Paulo em suas viagens missionárias. Seu Evangelho destaca a misericórdia de Jesus, a parábola do Filho Pródigo e o papel singular da Virgem Maria na Encarnação.',
    prayer: 'Senhor Deus, que escolhestes São Lucas para revelar em seu Evangelho o mistério do vosso amor pelos pobres e pecadores, concedei-nos viver segundo o vosso Evangelho. Amém.',
    imageUrl: 'https://images.unsplash.com/photo-1519491050282-cf00c82424b4?auto=format&fit=crop&q=80&w=1200'
  },
  // HOJE: 19 E 20 DE OUTUBRO
  '10-19': {
    day: 19,
    month: 10,
    name: 'São Pedro de Alcântara & Santos Isaac Jogues e Companheiros',
    title: 'Padroeiro do Brasil & Santos Mártires da América',
    patronage: 'Nação Brasileira, Mártires e Guardas Noturnos',
    summary: 'Memória de São Pedro de Alcântara, conselheiro de Santa Teresa e Padroeiro do Brasil, e dos Santos Mártires Isaac Jogues e João de Brébeuf.',
    fullBio: 'São Pedro de Alcântara (1499-1562) foi um frade franciscano de penitência e oração heroicas, declarado em 1826 Padroeiro Principal do Império do Brasil pelo Papa Leão XII. Nesta mesma data, a Igreja celebra os Santos Isaac Jogues, João de Brébeuf e Companheiros, jesuítas que derramaram o sangue evangelizando os povos nativos da América do Norte com admirável fortaleza de fé.',
    prayer: 'Deus de infinita santidade, que ilustrastes São Pedro de Alcântara pelo dom admirável da penitência e da altíssima contemplação, concedei-nos, por seus méritos, mortificar na terra os desejos carnais para merecermos participar dos dons celestes. Por Cristo, Nosso Senhor. Amém.',
    imageUrl: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&q=80&w=1200'
  },
  '10-20': {
    day: 20,
    month: 10,
    name: 'Santa Maria Bertilla Boscardin & Santa Irene de Tomar',
    title: 'Virgem e Mártir da Caridade',
    patronage: 'Enfermeiros, Cuidadores e Vítimas de Guerras',
    summary: 'A humilde serva de Deus que viveu a caridade heróica servindo aos doentes e feridos com pureza e silêncio sublime.',
    fullBio: 'Santa Maria Bertilla Boscardin (1888-1922) nasceu em Brendola, Itália. Religiosa das Irmãs Mestras de Santa Dorotéia, destacou-se pelo cuidado incansável às crianças doentes e aos soldados feridos durante a Primeira Guerra Mundial sob bombardeios, afirmando: "A Jesus toda a glória, ao próximo toda a alegria, a mim todo o sacrifício". Nesta mesma data, a tradição católica recorda Santa Irene de Tomar, virgem e mártir cristã que defendeu sua pureza e fidelidade a Cristo até o martírio no século VII.',
    prayer: 'Ó Deus, que concedestes a Santa Maria Bertilla Boscardin brilhar pela simplicidade evangélica e pelo amor ardente aos irmãos sofredores, dai-nos, por sua intercessão, a graça de vos servir nos doentes e desvalidos com humilde e operosa caridade. Por Cristo, Nosso Senhor. Amém.',
    imageUrl: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&q=80&w=1200'
  },
  '10-22': {
    day: 22,
    month: 10,
    name: 'São João Paulo II',
    title: 'Papa e Doutor da Esperança',
    patronage: 'Juventude, Famílias e Jornadas Mundiais da Juventude',
    summary: 'O Papa Peregrino que cruzou os continentes exortando: "Não tenhais medo! Abri as portas a Cristo!"',
    fullBio: 'Karol Wojtyła liderou a Igreja Católica de 1978 a 2005. Defensor destemido da dignidade humana, do Evangelho da Vida e da família. Criador das Jornadas Mundiais da Juventude e apóstolo incansável da Divina Misericórdia.',
    prayer: 'Ó São João Paulo II, da janela do Céu dá-nos a tua bênção! Abençoa a Igreja, os jovens, as famílias e o mundo inteiro para que jamais tenhamos medo de amar a Cristo. Amém.',
    imageUrl: 'https://images.unsplash.com/photo-1515542622106-78bda8ba0e5b?auto=format&fit=crop&q=80&w=1200'
  },
  '10-28': {
    day: 28,
    month: 10,
    name: 'São Simão e São Judas Tadeu',
    title: 'Apóstolos de Jesus Cristo e Mártires',
    patronage: 'Causas Desesperadas e Aflitas',
    summary: 'Os fiéis apóstolos que pregaram com coragem o Evangelho e testemunharam a fé até a doação da própria vida.',
    fullBio: 'São Judas Tadeu, irmão de Tiago e parente do Senhor, pregou na Mesopotâmia e Pérsia. É venerado mundialmente como o patrono das causas sem solução e aflições desesperadas.',
    prayer: 'São Judas Tadeu, glorioso apóstolo e fiel servo de Jesus, rogai por mim que me encontro em grande aflição, alcançando-me a graça que ardentemente vos peço. Amém.',
    imageUrl: 'https://images.unsplash.com/photo-1548625361-195979bc7583?auto=format&fit=crop&q=80&w=1200'
  },
  // NOVEMBRO
  '11-1': {
    day: 1,
    month: 11,
    name: 'Solenidade de Todos os Santos',
    title: 'Festa da Igreja Triunfante',
    patronage: 'Todos os Filhos de Deus Rumo ao Céu',
    summary: 'Celebração da multidão incontável de santos que já contemplam Deus face a face na glória eterna.',
    fullBio: 'A Igreja peregrina na terra se une à Igreja triunfante no Céu. Comemoramos todos os santos conhecidos e anônimos que lavaram suas vestes no Sangue do Cordeiro.',
    prayer: 'Deus eterno e todo-poderoso, que nos dais celebrar numa só festa os méritos de todos os Santos, concedei-nos, pela sua multiplicada intercessão, a plenitude da vossa graça. Amém.',
    imageUrl: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&q=80&w=1200'
  },
  '11-2': {
    day: 2,
    month: 11,
    name: 'Comemoração de Todos os Fiéis Defuntos',
    title: 'Memória dos Fiéis Falecidos (Finados)',
    patronage: 'Almas do Purgatório',
    summary: 'Oração afetuosa e sufrágio da Igreja pelas almas que esperam a purificação final para ingressar no Céu.',
    fullBio: 'Com base no dogma da Comunhão dos Santos, a Igreja oferece a Santa Missa, esmolas e orações em sufrágio das almas do Purgatório para que alcancem o repouso eterno.',
    prayer: 'Dai-lhes, Senhor, o descanso eterno, e brilhe para eles a vossa luz perpétua. Descansem em paz. Amém.',
    imageUrl: 'https://images.unsplash.com/photo-1518057111178-44a106bad636?auto=format&fit=crop&q=80&w=1200'
  },
  // DEZEMBRO
  '12-8': {
    day: 8,
    month: 12,
    name: 'Imaculada Conceição da Santíssima Virgem Maria',
    title: 'Solenidade da Toda Pura e Cheia de Graça',
    patronage: 'Igreja Universal e Pureza das Almas',
    summary: 'A Virgem Maria preservada imune de toda mancha da culpa original desde o primeiro instante de sua conceição.',
    fullBio: 'Dogma proclamado pelo Beato Papa Pio IX em 1854. Em virtude dos méritos do Salvador, a Mãe de Deus foi concebida sem pecado original.',
    prayer: 'Ó Maria concebida sem pecado, rogai por nós que recorremos a vós! Amém.',
    imageUrl: 'https://images.unsplash.com/photo-1577083552431-6e5fd01aa342?auto=format&fit=crop&q=80&w=1200'
  },
  '12-25': {
    day: 25,
    month: 12,
    name: 'Natividade de Nosso Senhor Jesus Cristo',
    title: 'Solenidade do Santo Natal do Senhor',
    patronage: 'Toda a Humanidade',
    summary: 'O Verbo se fez carne e habitou entre nós! O nascimento do Salvador no presépio de Belém.',
    fullBio: 'O cumprimento das promessas divinas. A segunda Pessoa da Santíssima Trindade nasce da Virgem Maria em Belém para a salvação do mundo.',
    prayer: 'Glória a Deus nas alturas e paz na terra aos homens por Ele amados! Vinde, adoremos o Salvador! Amém.',
    imageUrl: 'https://images.unsplash.com/photo-1543807535-eceef0bc6599?auto=format&fit=crop&q=80&w=1200'
  }
};

/**
 * Retorna o Santo Canônico do Martirológio para qualquer dia do ano com dados e imagem sacra autêntica
 */
export function obterSantoDoCalendario(month: number, day: number): Saint {
  const chave = `${month}-${day}`;
  const entry = MARTIROLOGIO_CANONICO[chave];

  if (entry) {
    return {
      id: `martirologio-${month}-${day}`,
      name: entry.name,
      title: entry.title,
      feastDate: `${day} de ${MONTH_NAMES[month]}`,
      month,
      day,
      imageUrl: entry.imageUrl,
      patronage: entry.patronage,
      summary: entry.summary,
      fullBio: entry.fullBio,
      prayer: entry.prayer,
      featured: true
    };
  }

  // Fallback sagrado elegante baseado nas festas do mês
  const imagemFallback = selecionarDoBancoSacro(`santo catolico ${MONTH_NAMES[month]}`, 'Santoral');
  return {
    id: `santo-generico-${month}-${day}`,
    name: `Memória dos Santos de Deus (${day} de ${MONTH_NAMES[month]})`,
    title: 'Testemunhas da Fé no Martirológio Romano',
    feastDate: `${day} de ${MONTH_NAMES[month]}`,
    month,
    day,
    imageUrl: imagemFallback.url,
    patronage: 'Igreja Católica e Fiéis Cristãos',
    summary: `Comemoração dos santos, confessores e mártires inscritos no Martirológio Romano para o dia ${day} de ${MONTH_NAMES[month]}.`,
    fullBio: `Neste dia ${day} de ${MONTH_NAMES[month]}, a Igreja Católica faz memória dos santos pastores, mártires, virgens e confessores da fé que deram testemunho inabalável do Evangelho de Cristo. Suas vidas heroicas e orações continuam a inspirar e sustentar a caminhada do Povo de Deus na terra rumo à Pátria Celestial.`,
    prayer: `Ó Deus Todo-Poderoso, que acolheis na vossa glória os santos que vos serviram com amor e fidelidade, concedei-nos, pela intercessão dos santos deste dia, perseverar na graça até o fim. Por Cristo, Nosso Senhor. Amém.`,
    featured: false
  };
}
