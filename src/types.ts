export type ActiveView = 
  | 'home' 
  | 'santoral' 
  | 'liturgia' 
  | 'assinaturas' 
  | 'loja' 
  | 'ensaio' 
  | 'blog' 
  | 'igrejas' 
  | 'oracoes' 
  | 'termos' 
  | 'privacidade' 
  | 'conduta'
  | 'auth'
  | 'admin';

export interface UserProfile {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  bio?: string;
  role?: 'admin' | 'editor' | 'assinante' | 'user';
  email?: string;
  is_minor: boolean;
  age: number;
  guardian_email?: string;
  profile_visibility: 'privado' | 'seguidores' | 'publico';
  dm_policy: 'todos' | 'seguidores_mutuos' | 'ninguem';
  is_verified_parish?: boolean;
  parish_name?: string;
  patron_saint?: string;
  joined_date?: string;
}

export interface SocialPost {
  id: string;
  author: UserProfile;
  content: string;
  image_url?: string;
  visibility: 'publico' | 'seguidores' | 'comunidade';
  community_id?: string;
  community_name?: string;
  moderation_status: 'publicado' | 'sombra' | 'removido' | 'em_analise';
  likes_count: number;
  comments_count: number;
  user_liked?: boolean;
  created_at: string;
}

export interface PostComment {
  id: string;
  post_id: string;
  author: UserProfile;
  content: string;
  moderation_status: 'publicado' | 'sombra' | 'removido' | 'em_analise';
  created_at: string;
}

export interface CommunityPrayerPlan {
  id: string;
  title: string;
  description: string;
  prayer_text?: string;
  created_by: string;
  created_at: string;
}

export interface Community {
  id: string;
  name: string;
  slug: string;
  description: string;
  cover_image: string;
  created_by: string;
  is_public: boolean;
  approval_status: 'pendente' | 'aprovado' | 'rejeitado';
  linked_parish?: string;
  patron_saint?: string;
  invite_code?: string;
  member_count: number;
  is_member?: boolean;
  category: 'juventude' | 'oracao' | 'estudos' | 'paroquia' | 'familias';
  prayer_plans?: CommunityPrayerPlan[];
}

export interface ChatMessage {
  id: string;
  conversation_id: string;
  sender: UserProfile;
  content: string;
  moderation_status: 'publicado' | 'bloqueado' | 'em_analise';
  created_at: string;
}

export interface Conversation {
  id: string;
  is_group: boolean;
  title: string;
  community_id?: string;
  other_user?: UserProfile;
  last_message?: string;
  last_message_time?: string;
  unread_count?: number;
  members_count?: number;
}

export interface ModerationReport {
  id: string;
  reporter: UserProfile;
  target_type: 'post' | 'comment' | 'message' | 'profile' | 'community';
  target_id: string;
  target_preview: string;
  author_profile: UserProfile;
  reason: string;
  status: 'pendente' | 'revisado' | 'arquivado';
  priority: 'alta' | 'normal'; // alta se envolve menor de idade
  ai_flag_reason?: string;
  created_at: string;
}

export interface PrayerJourneyDay {
  day: number;
  title: string;
  scripture?: string;
  reflection: string;
  prayer: string;
}

export interface PrayerJourney {
  id: string;
  type: 'novena' | 'plano_oracao' | 'adoracao' | 'jejum';
  title: string;
  description: string;
  duration_days: number;
  is_official: boolean;
  community_id?: string;
  community_name?: string;
  days: PrayerJourneyDay[];
  participants_count: number;
  user_current_day?: number;
  user_started?: boolean;
}

export interface SharedEvent {
  id: string;
  community_id: string;
  community_name: string;
  title: string;
  description: string;
  event_type: 'missa' | 'confissao' | 'adoracao' | 'encontro' | 'novena';
  starts_at: string;
  location: string;
  rsvps_count: number;
  user_rsvp?: 'confirmado' | 'talvez' | 'recusado';
}

export interface Church {
  id: string;
  name: string;
  diocese?: string;
  address: string;
  neighborhood?: string;
  city: string;
  state: string;
  lat: number;
  lng: number;
  phone?: string;
  massSchedule?: {
    weekday?: string[];
    saturday?: string[];
    sunday?: string[];
  };
  confessionSchedule?: string;
  imageUrl?: string;
  isCathedral?: boolean;
  distanceKm?: number;
}

export interface Saint {
  id: string;
  name: string;
  title: string;
  feastDate: string; // e.g. "1 de Outubro"
  month: number; // 1-12
  day: number;
  imageUrl: string;
  patronage: string;
  summary: string;
  fullBio: string;
  prayer: string;
  quotes?: string[];
  featured?: boolean;
}

export interface Essay {
  id: string;
  title: string;
  category: string; // "Teologia" | "História" | "Cultura" | "Filosofia" | "Notícias" | "Vaticano"
  type?: 'artigo' | 'noticia';
  imageUrl: string;
  altText?: string; // Alt text for Google Images SEO
  excerpt: string;
  content: string;
  author: string;
  readTime: string;
  date: string;
  featured?: boolean;
  trending?: boolean;
  // Advanced SEO Fields for Google Search
  slug?: string;
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
  canonicalUrl?: string;
  ogImage?: string;
  schemaType?: 'Article' | 'NewsArticle' | 'BlogPosting';
  seoScore?: number;
  mediaMap?: Record<string, string>;
  adConfig?: ArticleAdConfig;
}

export interface ArticleAdConfig {
  showTopAd?: boolean;
  showMiddleAd?: boolean;
  middleAdParagraph?: number; // e.g. 2, 3, 4, 5
  showSidebarAd?: boolean;
  showBottomAd?: boolean;
  adClient?: string; // ca-pub-xxxxxxxxxxxxxxxx
  topSlotId?: string;
  middleSlotId?: string;
  sidebarSlotId?: string;
  bottomSlotId?: string;
  customAdSnippet?: string;
}

export interface ReadingSection {
  title: string;
  reference: string;
  rubric?: string;
  text: string[];
  response?: string;
}

export interface LiturgicalReading {
  date: string; // e.g. "15 de Novembro"
  fullDateStr: string; // "Quarta-feira da 32ª Semana do Tempo Comum"
  season: string; // "Tempo Comum" | "Advento" | "Quaresma" | "Páscoa"
  colorName: string; // "Cor Verde" | "Cor Vermelha" | "Cor Branca" | "Cor Roxa"
  colorHex: string; // "#1c5d3a"
  firstReading: ReadingSection;
  psalm: {
    reference: string;
    antiphon: string;
    stanzas: string[];
  };
  secondReading?: ReadingSection;
  gospel: {
    reference: string;
    dialogue: {
      lordBeWithYou: string;
      andWithYourSpirit: string;
      gospelProclamation: string;
      gloryToYou: string;
    };
    text: string[];
    acclamation: string;
    praise: string;
  };
}

export interface Product {
  id: string;
  title: string;
  subtitle: string;
  price: number;
  imageUrl: string;
  category: 'livro' | 'sacramental' | 'arte' | 'vestuário';
  description: string;
  inStock: boolean;
  buyUrl?: string; // External buy link (Mercado Livre, Shopee, etc.)
}

export interface SubscriptionPlan {
  id: 'mensal' | 'anual' | 'trimestral';
  name: string;
  tagline: string;
  price: number;
  periodLabel: string; // "/mês", "/ano", "/trimestre"
  recommended?: boolean;
  features: { text: string; included: boolean }[];
}

export interface PrayerItem {
  id: string;
  title: string;
  slug?: string;
  category?: 'diarias' | 'marianas' | 'santos' | 'latim';
  situation?: string;
  text?: string;
  content?: string;
  description?: string;
  isDaySpecial?: boolean;
  isFeaturedToday?: boolean;
  imageUrl?: string; // Image for prayer
}
