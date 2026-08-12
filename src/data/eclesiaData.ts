import { Saint, Essay, LiturgicalReading, Product, SubscriptionPlan } from '../types';

export const SACRED_HEART_ICON = 'https://lh3.googleusercontent.com/aida-public/AB6AXuBMgxJ7BCVSZ5GKf3GowVdz7LNsToPTuRLDhU3adi2xlhRtWOByKtYcXx1eg9tMb7qnELMLXfXiFYNQ72bzaqH2GeALA5XI0TKcv669gw7470MrYrAZstmXibt4gY-Cjrfz1wERr8dcVYyZviCTfSDuWE3_kMVCiJaO0Rlg-Y5Isg0SWQUPKFwtg2MTQZygdspVlHr5NDK5hfVPOLQW8vBBkGU0NfFr0uiXGg6d6GGMmn0EHvB5wuFP';

export const SAINTS_DATA: Saint[] = [
  {
    id: 'st-thomas-aquinas',
    name: 'Santo Tomás de Aquino',
    title: 'Doutor Angélico e Príncipe dos Teólogos',
    feastDate: '28 de Janeiro',
    month: 1,
    day: 28,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBohcZZDNXl47K0mfWhQCGeRP87rslFExViQT6gPyTs4lbDQHsYXwi9FAePoOv5LJMhmA2uicLdCJ1PGAT0GHFomPlprM8LrVCHu1wjVDcN9ckYyCrleIQaTM1LOq8jaADCLvyFZjkryDHn5fH1GfzSBnUbSYimsru38ignckfoXQGCNeIj4hUBA2aZs8AgKWvYliqucTqlkKR3wFbtjIQvcPk4h0pfWUJJ8xfuEVijT5_jYnhWt_7Z',
    patronage: 'Estudantes, Teólogos e Academias',
    summary: 'Doutor Angélico da Igreja. Suas contribuições monumentais para a teologia e a filosofia, unindo a razão aristotélica à revelação divina, continuam a ser a base do ensino católico.',
    fullBio: `Santo Tomás de Aquino nasceu em 1225 em Roccasecca, perto de Nápoles. Ingressou na Ordem dos Pregadores (Dominicanos) contra a vontade inicial de sua nobre família. Estudou sob a orientação de Santo Alberto Magno em Paris e Colônia.

Conhecido por sua inteligência fulgurante e profundo espírito de oração, escreveu obras monumentais como a Summa Theologiae e o Summa contra Gentiles, além dos hinos eucarísticos como o Tantum Ergo e Panis Angelicus. Uniu perfeitamente a filosofia aristotélica e a teologia cristã, demonstrando que fé e razão não se opõem, mas se completam.`,
    prayer: 'Ó Deus, que tornastes Santo Tomás de Aquino admirável pelo zelo da santidade e pelo amor aos estudos teológicos, concedei-nos compreender seus ensinamentos e imitar seus exemplos de virtude. Por Nosso Senhor Jesus Cristo, vosso Filho, na unidade do Espírito Santo. Amém.',
    quotes: [
      'Para aquele que tem fé, nenhuma explicação é necessária. Para aquele sem fé, nenhuma explicação é possível.',
      'A virtude da caridade nos une a Deus em um abraço de amizade profunda.',
      'A Eucaristia é o sacramento do amor, sinal da nossa união com Cristo.'
    ],
    featured: true
  },
  {
    id: 'santa-teresinha',
    name: 'Santa Teresinha do Menino Jesus',
    title: 'Virgem e Doutora da Igreja',
    feastDate: '1 de Outubro',
    month: 10,
    day: 1,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA5ByDCjSbbsT2tnT63_CtgDUltafXV5nr5WV7qP09IBZQqLG7Ekyv6gdC3JPXMzIjF0W4kk2RQA_AEpeIwMJUS93VOtPI_nKqfkAUt4i_3G9htAAuhwowHktnzNpCYWMDkuKW35aglTcnI7E3DiySjpCEBF0zcim6sBKM47peE-Bh65pcgmsYsCinzceLciMd8Wq3ZaXLbbr_cE_OOYBoWgcb6rSf_8UQmVFyw4r8Gud1sovzLCIfT',
    patronage: 'Missões e Floristas',
    summary: 'Virgem e Doutora da Igreja. O "pequeno caminho" da infância espiritual e a vocação para o amor no coração da Igreja.',
    fullBio: `Thérèse Martin nasceu em Alençon, França, em 1873. Aos 15 anos, ingressou no Carmelo de Lisieux, adotando o nome de Teresa do Menino Jesus e da Sagrada Face.

Com sua espiritualidade da "Infância Espiritual" ou "Pequena Via", ensinou que a santidade não exige obras grandiosas e inacessíveis, mas o abandono de uma criança nos braços do Pai Celestial e a realização dos pequenos atos do cotidiano com um amor infinito. Escreveu a célebre autobiografia 'História de uma Alma'. Foi declarada Padroeira das Missões e Doutora da Igreja por São João Paulo II.`,
    prayer: 'Ó Deus, que preparastes o vosso Reino para os pequeninos e humildes, dai-nos seguir confiantes o caminho de Santa Teresa, para que, por sua intercessão, nos seja revelada a vossa glória. Por nosso Senhor Jesus Cristo, vosso Filho, na unidade do Espírito Santo. Amém.',
    quotes: [
      'No coração da Igreja, minha Mãe, eu serei o Amor!',
      'Quero passar o meu céu fazendo o bem sobre a terra. Farei cair uma chuva de rosas.',
      'O que me atrai para o Reino dos CÉUS é o amor de Deus que me preenche.'
    ]
  },
  {
    id: 'sao-pedro',
    name: 'São Pedro Apóstolo',
    title: 'Príncipe dos Apóstolos e Primeiro Papa',
    feastDate: '29 de Junho',
    month: 6,
    day: 29,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA5FqaKyH_1i63aiN8l-OSq317yke20l17WVIA2Jaw15LXWlUORaB_X3JDAkJyszByTmQjG83bnsi66O_4t2VL9JGUk6QiUML5LSkMQrbbosw5oWtXse2TsZxkPhnt5K67BdOLndhhfNUKFwDvmlWvMhEyJo99SYLJwU7QxjyLyDsJaQzzps0IeokOBHIeK6QODdnxP708G0FJ433vlT6SGtUkDE_bjqzOdBdjrqOuMPEJHgRN2vyrb',
    patronage: 'Papas, Pescadores e A Igreja Católica',
    summary: 'O primeiro Papa e rocha sobre a qual Cristo edificou Sua Igreja. Mártir em Roma sob o imperador Nero.',
    fullBio: `Pescador da Galileia chamado Simão, foi nomeado por Jesus como Cephas (Pedro, a Pedra) sobre a qual a Igreja subsiste. Líder do colégio apostólico, confessou com fervor a divindade de Cristo ("Tu és o Cristo, o Filho do Deus vivo").

Após a Ressurreição e Pentecostes, guiou a primeira comunidade cristã em Jerusalém e posteriormente viajou para Roma, onde estabeleceu a Sé Apostólica. Sofreu o martírio por crucificação de cabeça para baixo no Colina do Vaticano por volta do ano 64 d.C.`,
    prayer: 'Ó Deus, que concedestes a São Pedro Apóstolo as chaves do Reino dos Céus e o poder de ligar e desligar, guardai a vossa Igreja fundada sobre a rocha da fé apostólica. Por Cristo, nosso Senhor. Amém.',
    quotes: [
      'Senhor, para quem iremos nós? Tu tens as palavras de vida eterna.',
      'Tu és o Cristo, o Filho do Deus vivo.',
      'Sede sóbrios e vigiai. O vosso adversário, o diabo, rodeia como um leão a rugir.'
    ]
  },
  {
    id: 'sao-francisco',
    name: 'São Francisco de Assis',
    title: 'O Poverello de Assis',
    feastDate: '4 de Outubro',
    month: 10,
    day: 4,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCjOuPzMKTBKWNhnNun7dFxXS_9m1qO5zSvS-1vScStVpMA4VpCnPvhE_vY_mQ0bqSXpFeKtuo8BXQc3PYZU4NxUQZZiM-DZynxTPaEblcBK3rCyT5wp3uqrjSHePUKsgsqyg0eBLJW0_ShKPajyBkaVDfrT0xh1SJAN9IHvs3TfvUUjhaCg99ErUFJzrldjM_sq802Ps38zNsLNbhHCD9Y8m5fBJsVRQavxmvBFLn-iTCekfAbpxpJ',
    patronage: 'Ecologia, Animais e Ordem Franciscana',
    summary: 'Fundador da Ordem dos Frades Menores, dedicou sua vida à pobreza radical e à imitação de Cristo crucificado.',
    fullBio: `Nascido em Assis, Itália, em 1181, filho de um rico comerciante de tecidos, Francisco abandonou suas riquezas ao ouvir o chamado de Cristo na igrejinha de São Damião: "Francisco, vai e restaura a minha casa que está em ruínas".

Fundou a Ordem dos Frades Menores, caracterizada pela pobreza evangélica, fraternidade e amor compassivo pelas criaturas. Em Monte Alverne, recebeu no próprio corpo os Estigmas da Paixão de Cristo, tornando-se o primeiro estigmatizado da história.`,
    prayer: 'Senhor, fazei-me instrumento de vossa paz. Onde houver ódio, que eu leve o amor; onde houver ofensa, que eu leve o perdão; onde houver discórdia, que eu leve a união. Amém.',
    quotes: [
      'Comece fazendo o que é necessário, depois o que é possível, e de repente você estará fazendo o impossível.',
      'Pregue o Evangelho em todo o tempo. Se necessário, use palavras.',
      'Louvado sejas, meu Senhor, com todas as tuas criaturas.'
    ]
  },
  {
    id: 'santa-teresa-avila',
    name: 'Santa Teresa de Ávila',
    title: 'Santa Teresa de Jesus, Doutora da Igreja',
    feastDate: '15 de Outubro',
    month: 10,
    day: 15,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBuhdFY8XmCovMvEXljm9HC1w9-Huj0mJ2h0ge-q4EVPHeqEBGcHjujKfQoHVloZfNMmaOD38fvJzK60h5g924BIUOeBlLXm9eY-0dS9u3UbZWMUxIeErKJSovfLGjjhlaNjNuHvolZWCg5mTNW1V-ZtYsu5cfo0ROrBt1jYS4_Ia4z5NIxC0rHIF6qeeN5ZnLO4Hj-_35r_wpkvGPzbd__xlQk2yZdWsZ4kup3T04DrtB7rvi9H6t0',
    patronage: 'Espanha, Escritores e Místicos',
    summary: 'Reformadora do Carmelo e Doutora da Igreja. Mestra da oração mental e profunda mística espanhola.',
    fullBio: `Nascida em Ávila, Espanha, em 1515, Teresa de Cepeda y Ahumada ingressou no Carmelo da Encarnação. Experimentou uma profunda conversão espiritual que a levou a reformar a Ordem Carmelita juntamente com São João da Cruz, fundando os Carmelitas Descalços.

Autora de clássicos espirituais como 'O Castelo Interior' (Moradas), 'Caminho de Perfeição' e sua 'Vida', descreveu com precisão incomparável as etapas da união mística com Deus. É a primeira mulher proclamada Doutora da Igreja.`,
    prayer: 'Nada te turbe, nada te espante, tudo passa, Deus não muda. A paciência tudo alcança; quem a Deus tem, nada lhe falta: só Deus basta! Amém.',
    quotes: [
      'Só Deus basta!',
      'A oração não é outra coisa senão um trato de amizade, estando muitas vezes a sós com Quem sabemos que nos ama.',
      'Se não nos entregarmos a Deus de todo o coração, nunca teremos paz verdadeira.'
    ]
  }
];

export const ESSAYS_DATA: Essay[] = [
  {
    id: 'papa-homilia-vaticano-2024',
    title: 'Papa Francisco Convocou o Ano de Oração em Preparação para o Jubileu de 2025',
    category: 'Vaticano',
    type: 'noticia',
    featured: true,
    trending: true,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA5FqaKyH_1i63aiN8l-OSq317yke20l17WVIA2Jaw15LXWlUORaB_X3JDAkJyszByTmQjG83bnsi66O_4t2VL9JGUk6QiUML5LSkMQrbbosw5oWtXse2TsZxkPhnt5K67BdOLndhhfNUKFwDvmlWvMhEyJo99SYLJwU7QxjyLyDsJaQzzps0IeokOBHIeK6QODdnxP708G0FJ433vlT6SGtUkDE_bjqzOdBdjrqOuMPEJHgRN2vyrb',
    excerpt: 'Durante o Angelus na Praça de São Pedro, o Santo Padre destacou a necessidade urgente de reconectar os corações à oração diária e comunitária.',
    author: 'Redação Eclesia / Sala de Imprensa da Santa Sé',
    readTime: '3 min de leitura',
    date: '14 de Novembro, 2024',
    content: `Na manhã do último domingo, o Papa Francisco exortou os fiéis do mundo inteiro a intensificarem a oração pessoal e litúrgica como uma verdadeira peregrinação da esperança em direção ao Ano Santo de 2025.

"Pedindo o dom da paz para todas as nações flageladas por conflitos, o Ano de Oração deve ser uma oportunidade para redescobrirmos a beleza do Pai Nosso e a importância do silêncio contemplativo em nossas paróquias e lares", afirmou o Papa.

O Dicastério para a Evangelização publicou uma série de cadernos de oração em diversas línguas para auxiliar dioceses, grupos de jovens e famílias no aprofundamento das virtudes cardeais e na prática dos sacramentos.`
  },
  {
    id: 'beleza-silenciosa-liturgia',
    title: 'A Beleza Silenciosa da Liturgia Tradicional',
    category: 'Teologia',
    type: 'artigo',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDAODQzQTi_tS-DP9xfGlgw7aWGcuRI4BsOCyibJPIAeBCowxZ-iD7bV2RKmtLlsH_dB7t0NcDsxoLiGsjNAund8fM2YJZBqJXkGKEets0_wwjrTPpALfmV769-U-YOpEJVUnW9Kq4VDgX5shsNQrpCJIl6dkPpCv8oBy1FH4Qs3NwhFftfywMI_yMvxBV4VO6biichb5CbnAfpAlibR9Zdve1OXTzVcTMXr9RHYxYDBm0ksayxzWGj',
    excerpt: 'Uma exploração sobre como o silêncio e o mistério na liturgia nos aproximam do transcendente, contrapondo o ruído moderno.',
    author: 'Pe. Guilherme de Alcantara',
    readTime: '8 min de leitura',
    date: '10 de Novembro, 2024',
    content: `Na aceleração desenfreada do mundo contemporâneo, a Liturgia Sagrada ergue-se como um oásis de atemporalidade. O silêncio litúrgico não é mera ausência de som, mas uma plenitude de presença — o espaço onde a alma suspende a tagarelice humana para escutar a linguagem incriada do Criador.

O Cardeal Robert Sarah frequentemente nos recorda que "o silêncio é a primeira linguagem de Deus". Quando observamos os ritos milenares da Santa Missa, o olhar contemplativo percebe que cada gesto do sacerdote, a orientação do altar ad orientem, o perfume suave do incenso e o som sacro do Canto Gregoriano convergem para um único centro: o Sacrifício Redentor do Calvário.

A verdadeira beleza não necessita de artifícios nem de animações profanas. Ela brilha com a claridade serena da verdade e convida o fiel à adoração em espírito e em verdade.`
  },
  {
    id: 'restauracao-catedral-arte-sacra',
    title: 'Restauração de Afrescos do Século XVIII Mobiliza Artesãos em Minas Gerais',
    category: 'Notícias',
    type: 'noticia',
    trending: true,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC_BJeAhYO7SWrQPGll5xd8TlIsq9hLI2JQIsYdcQhWGZkX6QYUWz7jLqfj5dyd_aXN35AQs35DS22G6DqWRPT9CyXaM5QkT3htLOYYJg2_YL2yoqs29PpyIxWcZhnyAooz-X6n4CoGcpElcxdJSAj2Du6emlDvsU30GbPrxp0MHe1-mlMh9GvLtElwBqt991gKTK6fi5qLy_frXjicSMATHta_kIU__ZRJHTyMImPFM-1Op4FEZLMT',
    excerpt: 'O projeto pioneiro de preservação histórica resgata painéis barrocos dedicados a Nossa Senhora do Carmo, empregando pigmentos minerais naturais.',
    author: 'Informa Eclesia',
    readTime: '4 min de leitura',
    date: '8 de Novembro, 2024',
    content: `Uma comissão de peritos em restauro e mestres pintores iniciou a revitalização das abóbadas do teto nave da antiga Matriz de São João del-Rei. Os afrescos, afetados pela umidade ao longo dos séculos, estão recebendo consolidantes e higienização criteriosa.

Segundo a historiadora Dra. Helena Drummond, "cada centímetro de pintura barroca recuperado restitui à comunidade católica a iconografia catequética com que nossos antepassados meditavam os mistérios do Rosário".`
  },
  {
    id: 'padres-do-deserto',
    title: 'Padres do Deserto: Sabedoria Antiga para o Homem Moderno',
    category: 'História',
    type: 'artigo',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuASGfPTcVn_Qjl8mHYjpXQN7PGaLeyX7fYmEp-rlE517uOlGOOM_l54Kvt7YlTNBZ1RPV57o2jDWfpc6muHDI7FE2T5rInZkADqYLdHSgaERaw_fSWB2iz7-YjV83hpt8u1mnjwqBfgtK5Xp5eta52Gx_WnWYutmbgjLYypTsqdMkgx36qlbZPHODNsPziRuCvwMqRy3ibGTmMAAJbuE2tbe8H3PZSWzEyESM9NMyWvWHZVQLkurrnr',
    excerpt: 'As lições perenes de ascetismo e oração profunda que a vida no deserto do século IV ainda nos ensina hoje.',
    author: 'Dom Bernardo da Mota, OSB',
    readTime: '12 min de leitura',
    date: '4 de Novembro, 2024',
    content: `Nos desertos ardentes do Egito e da Síria, durante os séculos IV e V, homens e mulheres impulsionados por um amor ardente por Cristo abandonaram a sedução do Império Romano para inaugurar o monaquismo cristão. Nomes como Santo Antão o Grande, São Pacômio e Santo Evágrio do Ponto tornaram-se os faróis do combate espiritual.

Seus ensinamentos, preservados nos célebres Apophthegmata Patrum (Ditos dos Padres), tratam com precisão cirúrgica a anatomia das paixões humanas e os remédios da alma.

Eles nos ensinam a vigiar os pensamentos (logismoi), cultivar a hesychia (paz interior) e abraçar a oração contínua. Em uma época marcada por distrações incessantes e telas reluzentes, os conselhos do deserto soam surpreendentemente atuais e libertadores.`
  },
  {
    id: 'novo-livro-edicoes-eclesia',
    title: 'Edições Eclesia Lança Tradução Inédita da Summa Teológica em Português',
    category: 'Cultura',
    type: 'noticia',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBMgxJ7BCVSZ5GKf3GowVdz7LNsToPTuRLDhU3adi2xlhRtWOByKtYcXx1eg9tMb7qnELMLXfXiFYNQ72bzaqH2GeALA5XI0TKcv669gw7470MrYrAZstmXibt4gY-Cjrfz1wERr8dcVYyZviCTfSDuWE3_kMVCiJaO0Rlg-Y5Isg0SWQUPKFwtg2MTQZygdspVlHr5NDK5hfVPOLQW8vBBkGU0NfFr0uiXGg6d6GGMmn0EHvB5wuFP',
    excerpt: 'A nova edição traz aparato crítico completo, texto bilingue latim-português e comentários explicativos dos maiores especialistas do tomismo contemporâneo.',
    author: 'Jornalismo Editorial',
    readTime: '5 min de leitura',
    date: '1 de Novembro, 2024',
    content: `É com imensa alegria que anunciamos o lançamento do primeiro volume da nova tradução comentada da Summa Theologiae de Santo Tomás de Aquino. Fruto de cinco anos de trabalho minucioso por uma equipe de teólogos e latinistas, a obra almeja tornar acessível o rigor filosófico e a profundidade mística do Doutor Angélico.

O volume inaugural abrange os Tratados de Deus Um e Trino e da Criação, acompanhado de introduções históricas e glossário tomista.`
  },
  {
    id: 'renascimento-arte-sacra',
    title: 'O Renascimento da Arte Sacra Contemporânea',
    category: 'Cultura',
    type: 'artigo',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC_BJeAhYO7SWrQPGll5xd8TlIsq9hLI2JQIsYdcQhWGZkX6QYUWz7jLqfj5dyd_aXN35AQs35DS22G6DqWRPT9CyXaM5QkT3htLOYYJg2_YL2yoqs29PpyIxWcZhnyAooz-X6n4CoGcpElcxdJSAj2Du6emlDvsU30GbPrxp0MHe1-mlMh9GvLtElwBqt991gKTK6fi5qLy_frXjicSMATHta_kIU__ZRJHTyMImPFM-1Op4FEZLMT',
    excerpt: 'Como novos artistas estão resgatando a tradição iconográfica e integrando-a em espaços de culto modernos.',
    author: 'Isabel de Castilho',
    readTime: '6 min de leitura',
    date: '28 de Outubro, 2024',
    content: `Após décadas de uma estática sacra por vezes empobrecida ou excessivamente abstrata, assistimos a uma florescente renascença na arte sacra católica. Atelieristas e artesãos em todo o mundo estão redescobrindo os segredos das oficinas medievais e renascentistas.

A arte sacra genuína difere da arte profana porque não busca apenas expressar a subjetividade do artista, mas sim servir de janela para o Invisível (Via Pulchritudinis). A têmpera a ovo, a douração em folha de ouro de 24 quilates e a observância dos cânones iconográficos clássicos estão novamente moldando retábulos, afrescos e entalhes em madeira.

Esta redescoberta da nobre simplicidade e do esplendor estético eleva o coração dos fiéis diretamente à adoração do Mistério divino.`
  }
];

export const READINGS_DATA: Record<string, LiturgicalReading> = {
  '2026-11-15': {
    date: '15 de Novembro',
    fullDateStr: 'Quarta-feira da 32ª Semana do Tempo Comum',
    season: 'Tempo Comum',
    colorName: 'Cor Verde',
    colorHex: '#1c5d3a',
    firstReading: {
      title: 'Primeira Leitura',
      reference: 'Sb 6,1-11',
      rubric: 'Leitura do Livro da Sabedoria.',
      text: [
        'Ouvi, ó reis, e compreendei; aprendei, vós que julgais os confins da terra. Prestai atenção, vós que dominais as multidões e vos orgulhais do número de vossos súditos. Pois o poder vos foi dado pelo Senhor, e a soberania, pelo Altíssimo. Ele examinará as vossas obras e sondará os vossos pensamentos.',
        'Ainda que fôsseis ministros do seu reino, não julgais com retidão, nem observais a lei, nem andais segundo a vontade de Deus. Terrível e repentina será a sua intervenção contra vós, pois um julgamento rigoroso é reservado aos que estão no poder. O pequeno é perdoado por misericórdia, mas os poderosos serão examinados com poder.',
        'O Senhor de todos não recuará diante de ninguém, nem se deixará impressionar pela grandeza, porque o pequeno e o grande, foi ele quem os fez, e a sua providência é igual para todos. Mas para os poderosos, o julgamento será severo.',
        'A vós, pois, ó soberanos, dirigem-se as minhas palavras, para que aprendais a sabedoria e não caiais em falta. Aqueles que guardam santamente as coisas santas serão reconhecidos como santos; e os que nelas forem instruídos encontrarão a sua defesa. Desejai, portanto, as minhas palavras, anseiai por elas, e sereis instruídos.'
      ],
      response: '— Palavra do Senhor. / — Graças a Deus.'
    },
    psalm: {
      reference: 'Sl 81',
      antiphon: 'Levantai-vos, ó Deus, julgai a terra!',
      stanzas: [
        'Fazei justiça ao fraco e ao órfão,\nprocedei retamente com o pobre e o oprimido!\nLibertai o fraco e o indigente,\narrancai-os da mão dos ímpios!',
        'Eu disse: "Vós sois deuses,\nsois todos filhos do Altíssimo!"\nContudo, morrereis como qualquer homem\ne caireis como qualquer príncipe.',
        'Levantai-vos, ó Deus, julgai a terra!\nPois a vós pertencem todas as nações.'
      ]
    },
    gospel: {
      reference: 'Lc 17,11-19',
      dialogue: {
        lordBeWithYou: '— O Senhor esteja convosco.',
        andWithYourSpirit: '— Ele está no meio de nós.',
        gospelProclamation: '— Proclamação do Evangelho de Jesus Cristo + segundo Lucas.',
        gloryToYou: '— Glória a vós, Senhor.'
      },
      text: [
        'Aconteceu que, caminhando para Jerusalém, Jesus passava entre a Samaria e a Galileia. Ao entrar num povoado, dez leprosos vieram ao seu encontro. Pararam à distância e gritaram: "Jesus, Mestre, tem compaixão de nós!"',
        'Ao vê-los, Jesus disse: "Ide apresentar-vos aos sacerdotes". E aconteceu que, enquanto iam, ficaram curados. Um deles, ao perceber que estava curado, voltou glorificando a Deus em alta voz; prostrou-se com o rosto em terra aos pés de Jesus e lhe agradeceu. E este era um samaritano.',
        'Então Jesus lhe perguntou: "Não foram dez os curados? E os outros nove, onde estão? Não houve quem voltasse para dar glória a Deus, a não ser este estrangeiro?" E disse-lhe: "Levanta-te e vai! A tua fé te salvou".'
      ],
      acclamation: '— Palavra da Salvação.',
      praise: '— Glória a vós, Senhor.'
    }
  },
  '2026-10-01': {
    date: '1 de Outubro',
    fullDateStr: 'Memória de Santa Teresinha do Menino Jesus, Virgem e Doutora',
    season: 'Tempo Comum',
    colorName: 'Cor Branca',
    colorHex: '#817563',
    firstReading: {
      title: 'Primeira Leitura',
      reference: 'Is 66,10-14c',
      rubric: 'Leitura do Livro do Profeta Isaías.',
      text: [
        'Alegrai-vos com Jerusalém e exultai com ela, todos vós que a amais; enchei-vos de alegria com ela, todos vós que choráveis por ela, para que sejais amamentados e vos sacieis no peito de suas consolações.',
        'Pois assim diz o Senhor: Eis que farei correr para ela a paz como um rio, e a glória das nações como uma torrente transbordante. Sereis amamentados, levados ao colo e acariciados sobre os joelhos. Como uma mãe consola o seu filho, assim eu vos consolarei.'
      ],
      response: '— Palavra do Senhor. / — Graças a Deus.'
    },
    psalm: {
      reference: 'Sl 130',
      antiphon: 'Guardai-me junto a vós, na vossa paz, Senhor!',
      stanzas: [
        'Senhor, meu coração não se orgulhou,\nnem se elevaram altivos os meus olhos;\nnão procuro grandezas para mim,\nnem coisas superiores às minhas forças.',
        'Pelo contrário, fiz calar e sossegar a minha alma,\ncomo criança desmamada no colo de sua mãe,\nassim está a minha alma dentro de mim.',
        'Espere Israel no Senhor,\ndesde agora e para sempre!'
      ]
    },
    gospel: {
      reference: 'Mt 18,1-5',
      dialogue: {
        lordBeWithYou: '— O Senhor esteja convosco.',
        andWithYourSpirit: '— Ele está no meio de nós.',
        gospelProclamation: '— Proclamação do Evangelho de Jesus Cristo + segundo Mateus.',
        gloryToYou: '— Glória a vós, Senhor.'
      },
      text: [
        'Naquela hora, os discípulos aproximaram-se de Jesus e perguntaram: "Quem é o maior no Reino dos Céus?"',
        'Jesus chamou uma criança, colocou-a no meio deles e disse: "Em verdade vos digo, se não vos converterdes e não vos tornardes como crianças, não entrareis no Reino dos Céus. Quem se faz pequeno como esta criança, esse é o maior no Reino dos Céus."'
      ],
      acclamation: '— Palavra da Salvação.',
      praise: '— Glória a vós, Senhor.'
    }
  }
};

export const PRODUCTS_DATA: Product[] = [
  {
    id: 'imitation-of-christ',
    title: 'Imitação de Cristo',
    subtitle: 'Edição de Luxo em Encadernação Rígida',
    price: 89.00,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC-_6zhrGjIiwdw9FI9eqEvsewGHiNBTmF--yxrdGzLWsDBCl6CJtLjUmnGaCzvNqANFrAjfOKP-3W_vrjykBkzWjdIBxXsXs9pLWDEG8GoMiXnFFYMn9sViEqIm2gY1FOPMIdrrzXqT4ERnFPmH_olw_1JKtKdrD0fomqZ0jsBmB7QHGETGkEJSM405_WbPBUGyv5r5Ojqy-zkQKh9_P3u35rIlbtFGBx9WEorOiSWDYUocNXYv8Hm',
    category: 'livro',
    description: 'Obra prima de Tomás de Kempis em papel bíblia ivory, fita de cetim litúrgica e detalhes em alto-relevo dourado. O livro espiritual mais lido do mundo cristão depois da Bíblia Sagrada.',
    inStock: true
  },
  {
    id: 'brass-crucifix',
    title: 'Crucifixo de Bolso em Latão',
    subtitle: 'Artesanal com Acabamento Maciço',
    price: 120.00,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBz1fxvRUX7wTuKuL4JuMcto9KNFbLObenT-UZQepNy-kFKRk-Hc8vZVr2D82lLsD8zIEXxfwl5nyfrfqLxuwRjVLBNrLkR_9gWE7XXHvjKTeNmbuIKPK9WsBuv-G-kRZpqdWcmnYmY2Xxmw24zMiBU0aWNveuDawi-6xJdJhkeunBfdUFLqVAHJDS8OILgupBAoCH4rLfVzX29DRbqEUxv2tez8eMso1Z7kfYVPAlg8oP3eEggK78s',
    category: 'sacramental',
    description: 'Crucifixo de bolso forjado em latão maciço com riqueza de detalhes anatômicos da crucificação. Acompanha saquinho de veludo litúrgico bordado.',
    inStock: true
  },
  {
    id: 'missale-romanum-leather',
    title: 'Missal Diário do Fiel',
    subtitle: 'Capa em Couro Nobre Bordô',
    price: 240.00,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC_BJeAhYO7SWrQPGll5xd8TlIsq9hLI2JQIsYdcQhWGZkX6QYUWz7jLqfj5dyd_aXN35AQs35DS22G6DqWRPT9CyXaM5QkT3htLOYYJg2_YL2yoqs29PpyIxWcZhnyAooz-X6n4CoGcpElcxdJSAj2Du6emlDvsU30GbPrxp0MHe1-mlMh9GvLtElwBqt991gKTK6fi5qLy_frXjicSMATHta_kIU__ZRJHTyMImPFM-1Op4FEZLMT',
    category: 'livro',
    description: 'Missal completo com ordinário da Missa, leituras diárias, orações em latim e português, fitas marcadoras e corte dourado.',
    inStock: true
  }
];

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'mensal',
    name: 'Mensal',
    tagline: 'Acesso contínuo com flexibilidade.',
    price: 25,
    periodLabel: '/mês',
    features: [
      { text: 'Acesso completo a todos os ensaios digitais', included: true },
      { text: 'Comentários litúrgicos semanais', included: true },
      { text: 'Descontos na loja', included: false }
    ]
  },
  {
    id: 'anual',
    name: 'Anual',
    tagline: 'O melhor valor para o nosso apostolado.',
    price: 250,
    periodLabel: '/ano',
    recommended: true,
    features: [
      { text: 'Acesso completo a todos os ensaios digitais', included: true },
      { text: 'Comentários litúrgicos semanais', included: true },
      { text: '15% de desconto em toda a loja', included: true },
      { text: 'Acesso antecipado a novos produtos', included: true }
    ]
  },
  {
    id: 'trimestral',
    name: 'Trimestral',
    tagline: 'Compromisso a médio prazo.',
    price: 70,
    periodLabel: '/trimestre',
    features: [
      { text: 'Acesso completo a todos os ensaios digitais', included: true },
      { text: 'Comentários litúrgicos semanais', included: true },
      { text: '5% de desconto na loja', included: true }
    ]
  }
];
