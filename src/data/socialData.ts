import {
  UserProfile,
  SocialPost,
  Community,
  Conversation,
  ChatMessage,
  ModerationReport,
  PrayerJourney,
  SharedEvent
} from '../types';

export const CURRENT_USER: UserProfile = {
  id: 'usr-curr-01',
  name: 'Gabriel Santos',
  handle: '@gabrielsantos',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
  bio: 'Estudante de Filosofia, coroinha e devoto de São Tomás de Aquino. ⛪✨',
  is_minor: true, // 16 anos - regido pelas diretrizes de proteção de menores
  age: 16,
  guardian_email: 'pai.gabriel@gmail.com',
  profile_visibility: 'seguidores',
  dm_policy: 'seguidores_mutuos',
  parish_name: 'Paróquia Nossa Senhora do Carmo',
  joined_date: 'Agosto de 2026'
};

export const SAMPLE_USERS: UserProfile[] = [
  CURRENT_USER,
  {
    id: 'usr-02',
    name: 'Pe. Mateus Silva',
    handle: '@prmateus',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    bio: 'Vigário Paroquial. Dedicado à evangelização dos jovens e à teologia espiritual.',
    is_minor: false,
    age: 38,
    profile_visibility: 'publico',
    dm_policy: 'todos',
    is_verified_parish: true,
    parish_name: 'Catedral da Sé - SP'
  },
  {
    id: 'usr-03',
    name: 'Mariana Costa',
    handle: '@maricosta_oracao',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
    bio: 'Coordenadora do grupo de oração Mães que Oram. Apaixonada pela Liturgia das Horas.',
    is_minor: false,
    age: 29,
    profile_visibility: 'publico',
    dm_policy: 'seguidores_mutuos',
    parish_name: 'Paróquia Nossa Senhora do Brasil'
  },
  {
    id: 'usr-04',
    name: 'Lucas Andrade',
    handle: '@lucas_acólito',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
    bio: 'Acólito da Igreja Matriz. 17 anos. Deus é a nossa rocha!',
    is_minor: true, // 17 anos
    age: 17,
    guardian_email: 'mae.lucas@hotmail.com',
    profile_visibility: 'seguidores',
    dm_policy: 'seguidores_mutuos'
  }
];

export const INITIAL_SOCIAL_POSTS: SocialPost[] = [
  {
    id: 'post-1',
    author: SAMPLE_USERS[1], // Pe. Mateus
    content: 'A Santa Missa não é apenas uma lembrança, mas a atualização real do Sacrifício do Calvário. Que hoje possamos nos aproximar do altar com o coração contrito e cheio de esperança!',
    visibility: 'publico',
    moderation_status: 'publicado',
    likes_count: 42,
    comments_count: 8,
    user_liked: true,
    created_at: 'Há 2 horas'
  },
  {
    id: 'post-2',
    author: SAMPLE_USERS[2], // Mariana Costa
    content: 'Encerrando o 3º dia da Novena de Nossa Senhora Desatadora dos Nós em nossa comunidade local. Peçamos a intercessão da Santíssima Mãe por todas as famílias em dificuldade!',
    image_url: 'https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&q=80&w=800',
    visibility: 'publico',
    community_id: 'comm-1',
    community_name: 'Jornadas de Oração & Novenas',
    moderation_status: 'publicado',
    likes_count: 28,
    comments_count: 3,
    user_liked: false,
    created_at: 'Há 5 horas'
  },
  {
    id: 'post-3',
    author: CURRENT_USER,
    content: 'Compartilhando uma frase de São Tomás de Aquino que li no estudo do Catecismo hoje: "A graça não destrói a natureza, mas a aperfeiçoa." Uma reflexão profunda para nossa caminhada!',
    visibility: 'publico',
    moderation_status: 'publicado',
    likes_count: 19,
    comments_count: 4,
    user_liked: true,
    created_at: 'Ontem às 18:30'
  }
];

export const INITIAL_COMMUNITIES: Community[] = [
  {
    id: 'comm-1',
    name: 'Grupo de Jovens Juventude Viva',
    slug: 'juventude-viva',
    description: 'Espaço de partilha, encontros de formação, adoração e amizade santa para jovens de 16 a 25 anos.',
    cover_image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&q=80&w=800',
    created_by: 'usr-02',
    is_public: true,
    approval_status: 'aprovado',
    linked_parish: 'Catedral Metropolitana da Sé',
    member_count: 142,
    is_member: true,
    category: 'juventude'
  },
  {
    id: 'comm-2',
    name: 'Estudos do Catecismo & Patrística',
    slug: 'estudos-catecismo',
    description: 'Comunidade voltada à leitura guiada do Catecismo da Igreja Católica, escritos dos Padres da Igreja e Encíclicas.',
    cover_image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=800',
    created_by: 'usr-03',
    is_public: true,
    approval_status: 'aprovado',
    member_count: 89,
    is_member: false,
    category: 'estudos'
  },
  {
    id: 'comm-3',
    name: 'Rede de Adoração Noturna ao Santíssimo',
    slug: 'adoracao-noturna',
    description: 'Organização da escala de vigília e adoração eucarística semanal nas paróquias cadastradas.',
    cover_image: 'https://images.unsplash.com/photo-1543857778-c4a1a3e0b2eb?auto=format&fit=crop&q=80&w=800',
    created_by: 'usr-02',
    is_public: true,
    approval_status: 'aprovado',
    linked_parish: 'Basílica de Nossa Senhora do Carmo',
    member_count: 215,
    is_member: true,
    category: 'oracao'
  },
  {
    id: 'comm-4',
    name: 'Apostolado da Oração - Paróquia São José',
    slug: 'apostolado-sao-jose',
    description: 'Nova proposta de comunidade local submetida para avaliação da moderação.',
    cover_image: 'https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&q=80&w=800',
    created_by: 'usr-04',
    is_public: false,
    approval_status: 'pendente', // Aguardando aprovação do moderador
    member_count: 1,
    is_member: false,
    category: 'paroquia'
  }
];

export const INITIAL_PRAYER_JOURNEYS: PrayerJourney[] = [
  {
    id: 'jrn-1',
    type: 'novena',
    title: 'Novena a Nossa Senhora Desatadora dos Nós',
    description: '9 dias de oração confiando à Virgem Maria as amarras e dificuldades espirituais e familiares.',
    duration_days: 9,
    is_official: true,
    participants_count: 420,
    user_current_day: 3,
    user_started: true,
    days: [
      {
        day: 1,
        title: 'Dia 1: A Virgem que desfaz as amarras da discórdia',
        scripture: 'Lucas 1, 38 — "Eis aqui a serva do Senhor; faça-se em mim segundo a tua palavra."',
        reflection: 'Neste primeiro dia, oferecemos a Nossa Senhora os nós da nossa incompreensão e falta de perdão.',
        prayer: 'Santa Maria, cheia da presença de Deus, durante os dias de tua vida aceitaste com toda a humildade a vontade do Pai. Rogai por nós!'
      },
      {
        day: 2,
        title: 'Dia 2: Confiança na Intercessão Materna',
        scripture: 'João 2, 5 — "Fazei tudo o que Ele vos disser."',
        reflection: 'Em Caná da Galileia, Maria percebeu a necessidade daquela família antes mesmo que pedissem.',
        prayer: 'Mãe amada, que desatas os nós que sufocam nossa paz, estende tuas mãos amorosas sobre a nossa jornada.'
      },
      {
        day: 3,
        title: 'Dia 3: A Esperança diante da Provação',
        scripture: 'Salmo 27, 1 — "O Senhor é a minha luz e a minha salvação; de quem terei medo?"',
        reflection: 'Mesmo nos momentos em que não enxergamos a saída, a fé nos sustenta na presença de Cristo.',
        prayer: 'Nossa Senhora Desatadora dos Nós, desatai o nó da dúvida e do desânimo de meu coração.'
      }
    ]
  },
  {
    id: 'jrn-2',
    type: 'plano_oracao',
    title: 'Exame de Consciência para a Confissão',
    description: 'Guia de reflexão espiritual fundamentado nos 10 Mandamentos para preparar a alma para o Sacramento da Reconciliação.',
    duration_days: 3,
    is_official: true,
    participants_count: 680,
    user_current_day: 1,
    user_started: true,
    days: [
      {
        day: 1,
        title: 'Parte I: Meus Deveres para com Deus (1º ao 3º Mandamento)',
        reflection: 'Tenho reservado um tempo diário para a oração sincera? Tenho participado da Santa Missa nos domingos e dias de preceito?',
        prayer: 'Senhor Jesus, concede-me a luz do Espírito Santo para enxergar minhas faltas com verdadeira contrição e amor.'
      },
      {
        day: 2,
        title: 'Parte II: Amor e Respeito ao Próximo (4º ao 7º Mandamento)',
        reflection: 'Tratei meus pais, professores e autoridades com o devido respeito? Guardei ressentimento ou magoa de alguém?',
        prayer: 'Ó Deus de misericórdia, purifica minha mente de palavras duras e julgamentos precipitados.'
      },
      {
        day: 3,
        title: 'Parte III: Verdade, Pureza e Retidão de Coração (8º ao 10º Mandamento)',
        reflection: 'Fui honesto em minhas palavras? Respeitei a reputação dos outros evitando fofocas e calúnias?',
        prayer: 'Cria em mim, ó Deus, um coração puro e renova em meu íntimo um espírito firme.'
      }
    ]
  }
];

export const INITIAL_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv-1',
    is_group: false,
    title: 'Pe. Mateus Silva',
    other_user: SAMPLE_USERS[1],
    last_message: 'Deus abençoe seus estudos! Estarei rezando por você.',
    last_message_time: '10:45',
    unread_count: 0
  },
  {
    id: 'conv-2',
    is_group: true,
    title: 'Chat da Juventude Viva 🕊️',
    community_id: 'comm-1',
    last_message: 'Mariana: Quem vai participar do ensaio do coral no sábado?',
    last_message_time: '09:12',
    unread_count: 2,
    members_count: 34
  }
];

export const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-1',
    conversation_id: 'conv-1',
    sender: SAMPLE_USERS[1], // Pe. Mateus
    content: 'Paz e Bem, Gabriel! Como estão os estudos sobre a Suma Teológica?',
    moderation_status: 'publicado',
    created_at: '10:30'
  },
  {
    id: 'msg-2',
    conversation_id: 'conv-1',
    sender: CURRENT_USER,
    content: 'Salve Maria, Padre! A leitura sobre as Cinco Vias está sendo incrível. Muito obrigado pela indicação do livro!',
    moderation_status: 'publicado',
    created_at: '10:38'
  },
  {
    id: 'msg-3',
    conversation_id: 'conv-1',
    sender: SAMPLE_USERS[1],
    content: 'Deus abençoe seus estudos! Estarei rezando por você.',
    moderation_status: 'publicado',
    created_at: '10:45'
  }
];

export const INITIAL_MODERATION_REPORTS: ModerationReport[] = [
  {
    id: 'rep-1',
    reporter: SAMPLE_USERS[2],
    target_type: 'comment',
    target_id: 'comm-99',
    target_preview: 'Ataque doutrinário hostil em comentário de post sobre liturgias.',
    author_profile: {
      id: 'usr-unknown',
      name: 'Usuário Anônimo',
      handle: '@anon123',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
      is_minor: false,
      age: 24,
      profile_visibility: 'publico',
      dm_policy: 'todos'
    },
    reason: 'Comentário agressivo promovendo ofensas e discurso de ódio contra sacerdotes.',
    status: 'pendente',
    priority: 'normal',
    ai_flag_reason: 'IA Classificadora: Detectado tom tóxico (Escore 0.89)',
    created_at: 'Há 1 hora'
  },
  {
    id: 'rep-2',
    reporter: SAMPLE_USERS[1],
    target_type: 'message',
    target_id: 'msg-alert-01',
    target_preview: 'Tentativa de DM direta não solicitada para conta de menor de idade.',
    author_profile: {
      id: 'usr-[#999]',
      name: 'Conta Suspeita',
      handle: '@desconhecido_x',
      avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=200',
      is_minor: false,
      age: 32,
      profile_visibility: 'publico',
      dm_policy: 'todos'
    },
    reason: 'Interação direta bloqueada pela política de segurança de menores de 16-17 anos.',
    status: 'pendente',
    priority: 'alta', // Fila prioritária imediata (envolve menor)
    ai_flag_reason: 'Filtro Menores: Bloqueio automático de DM não autorizada',
    created_at: 'Há 25 minutos'
  }
];

export const INITIAL_EVENTS: SharedEvent[] = [
  {
    id: 'evt-1',
    community_id: 'comm-1',
    community_name: 'Grupo de Jovens Juventude Viva',
    title: 'Noite de Adoração & Lual dos Jovens',
    description: 'Momento de oração com o Santíssimo Sacramento exposto, seguido de partilha e música católica.',
    event_type: 'adoracao',
    starts_at: 'Sexta-feira, 20:00',
    location: 'Capela de São Francisco - Paróquia do Carmo',
    rsvps_count: 28,
    user_rsvp: 'confirmado'
  },
  {
    id: 'evt-2',
    community_id: 'comm-3',
    community_name: 'Rede de Adoração Noturna ao Santíssimo',
    title: 'Vigília Eucarística de Sábado',
    description: 'Escala de adoração comunitária para cobertura de oração da madrugada.',
    event_type: 'adoracao',
    starts_at: 'Sábado, 23:00 às 06:00',
    location: 'Basílica de Nossa Senhora do Carmo',
    rsvps_count: 14,
    user_rsvp: 'talvez'
  }
];
