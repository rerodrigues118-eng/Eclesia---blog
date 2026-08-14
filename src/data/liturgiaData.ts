import { LiturgicalReading } from '../types';

export const TODAY_LITURGY_MOCK: LiturgicalReading = {
  date: '15 de Novembro',
  fullDateStr: 'Quarta-feira da 32ª Semana do Tempo Comum',
  season: 'Tempo Comum',
  colorName: 'Cor Verde',
  colorHex: '#1c5d3a',
  firstReading: {
    title: 'Primeira Leitura',
    reference: 'Zc 8,20-23',
    rubric: 'Leitura do Livro do Profeta Zacarias',
    text: [
      'Assim diz o Senhor dos Exércitos: "Virão ainda povos e habitantes de muitas cidades; os habitantes de uma cidade irão à outra, dizendo: \'Vamos rezar diante do Senhor e buscar o Senhor dos Exércitos; eu também vou\'.',
      'Muitos povos e nações poderosas virão buscar o Senhor dos Exércitos em Jerusalém e suplicar a face do Senhor.',
      'Assim diz o Senhor dos Exércitos: \'Naqueles dias, dez homens de todas as línguas das nações agarrarão a orla da veste de um judeu, dizendo: Nós vamos convosco, porque ouvimos dizer que Deus está convosco\'."'
    ],
    response: 'Palavra do Senhor. Graças a Deus.'
  },
  psalm: {
    reference: 'Salmo 86(87)',
    antiphon: 'Nós vamos convosco, porque Deus está convosco.',
    stanzas: [
      'O Senhor ama a cidade fundada nos montes santos; ele prefere as portas de Sião a todas as moradas de Jacó.',
      'Coisas gloriosas se dizem de ti, ó cidade de Deus! Cantam dançando: "Todas as minhas fontes estão em ti!"'
    ]
  },
  gospel: {
    reference: 'Lc 9,51-56',
    dialogue: {
      lordBeWithYou: 'O Senhor esteja convosco.',
      andWithYourSpirit: 'Ele está no meio de nós.',
      gospelProclamation: 'Proclamação do Evangelho de Jesus Cristo segundo Lucas.',
      gloryToYou: 'Glória a vós, Senhor.'
    },
    text: [
      'Estava se completando o tempo de Jesus ser elevado ao céu. Ele tomou a firme decisão de partir para Jerusalém e enviou mensageiros à sua frente.',
      'Estes partiram e entraram num povoado de samaritanos para preparar hospedagem para Jesus. Mas os samaritanos não o receberam, porque Jesus dava a impressão de que ia a Jerusalém.',
      'Vendo isso, os discípulos Tiago e João disseram: "Senhor, queres que mandemos descer fogo do céu para destruí-los?"',
      'Jesus, porém, voltou-se e repreendeu-os. E partiram para outro povoado.'
    ],
    acclamation: 'Aleluia, Aleluia, Aleluia.',
    praise: 'Palavra da Salvação. Glória a vós, Senhor.'
  }
};
