import React, { useState } from 'react';
import {
  Users,
  MessageSquare,
  ShieldCheck,
  ShieldAlert,
  Heart,
  MessageCircle,
  Share2,
  Send,
  PlusCircle,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Eye,
  EyeOff,
  UserX,
  Flag,
  Sparkles,
  BookOpen,
  Calendar,
  Compass,
  Check,
  ChevronRight,
  Info,
  Sliders,
  Bell,
  Mail,
  UserCheck,
  UserPlus
} from 'lucide-react';

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

import {
  CURRENT_USER,
  SAMPLE_USERS,
  INITIAL_SOCIAL_POSTS,
  INITIAL_COMMUNITIES,
  INITIAL_PRAYER_JOURNEYS,
  INITIAL_CONVERSATIONS,
  INITIAL_MESSAGES,
  INITIAL_MODERATION_REPORTS,
  INITIAL_EVENTS
} from '../data/socialData';

export const RedeSocialView: React.FC = () => {
  // Navigation active tab inside social network
  const [activeTab, setActiveTab] = useState<'feed' | 'comunidades' | 'oracao' | 'chat' | 'moderacao' | 'perfil'>('feed');

  // User state & Profile settings
  const [currentUser, setCurrentUser] = useState<UserProfile>(CURRENT_USER);
  const [blockedUserIds, setBlockedUserIds] = useState<string[]>([]);

  // Feed Posts state
  const [posts, setPosts] = useState<SocialPost[]>(INITIAL_SOCIAL_POSTS);
  const [newPostContent, setNewPostContent] = useState<string>('');
  const [newPostImage, setNewPostImage] = useState<string>('');
  const [isPublishing, setIsPublishing] = useState<boolean>(false);
  const [postAiNotice, setPostAiNotice] = useState<string | null>(null);

  // Active Comment inputs per post
  const [commentInputs, setCommentInputs] = useState<{ [postId: string]: string }>({});
  const [postComments, setPostComments] = useState<{ [postId: string]: { id: string; author: UserProfile; content: string; created_at: string }[] }>({
    'post-1': [
      {
        id: 'c-1',
        author: SAMPLE_USERS[2],
        content: 'Amém! Uma bênção de reflexão, Padre.',
        created_at: 'Há 1 hora'
      }
    ]
  });

  // Communities state
  const [communities, setCommunities] = useState<Community[]>(INITIAL_COMMUNITIES);
  const [newCommName, setNewCommName] = useState<string>('');
  const [newCommDesc, setNewCommDesc] = useState<string>('');
  const [newCommCategory, setNewCommCategory] = useState<'juventude' | 'oracao' | 'estudos' | 'paroquia' | 'familias'>('juventude');
  const [showCreateCommModal, setShowCreateCommModal] = useState<boolean>(false);
  const [commNotice, setCommNotice] = useState<string | null>(null);

  // Prayer Journeys state
  const [journeys, setJourneys] = useState<PrayerJourney[]>(INITIAL_PRAYER_JOURNEYS);
  const [selectedJourney, setSelectedJourney] = useState<PrayerJourney | null>(INITIAL_PRAYER_JOURNEYS[0]);
  const [currentDayIndex, setCurrentDayIndex] = useState<number>(0);

  // Chat state
  const [conversations, setConversations] = useState<Conversation[]>(INITIAL_CONVERSATIONS);
  const [activeConvId, setActiveConvId] = useState<string>('conv-1');
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [newChatMessage, setNewChatMessage] = useState<string>('');
  const [chatWarning, setChatWarning] = useState<string | null>(null);

  // Moderation reports state
  const [moderationReports, setModerationReports] = useState<ModerationReport[]>(INITIAL_MODERATION_REPORTS);
  const [testAiInput, setTestAiInput] = useState<string>('');
  const [testAiResult, setTestAiResult] = useState<{ status: 'limpo' | 'sombra' | 'bloqueado'; reason: string } | null>(null);

  // Report Modal
  const [reportModalTarget, setReportModalTarget] = useState<{ type: string; id: string; preview: string } | null>(null);
  const [reportReason, setReportReason] = useState<string>('');
  const [reportSuccessNotice, setReportSuccessNotice] = useState<string | null>(null);

  // --- Handlers ---

  // Synchronous AI Moderation Simulator
  const checkContentWithAi = (text: string): { status: 'publicado' | 'sombra' | 'removido'; reason?: string } => {
    const lower = text.toLowerCase();

    // Toxic / Hate speech keywords
    const toxicKeywords = ['odeio', 'morte', 'violencia', 'herege idiota', 'burro', 'otario', 'xingamento'];
    const containsToxic = toxicKeywords.some(kw => lower.includes(kw));

    if (containsToxic) {
      return {
        status: 'removido',
        reason: 'Bloqueado por IA de Moderação: Conteúdo contém linguagem agressiva ou ofensiva.'
      };
    }

    // Borderline terms
    const borderlineKeywords = ['polemica', 'disputa agressiva', 'ataque'];
    const containsBorderline = borderlineKeywords.some(kw => lower.includes(kw));

    if (containsBorderline) {
      return {
        status: 'sombra',
        reason: 'Publicado em modo sombra: Marcado pela IA para revisão da equipe humana.'
      };
    }

    return { status: 'publicado' };
  };

  // Publish new social post
  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim()) return;

    setIsPublishing(true);
    setPostAiNotice(null);

    setTimeout(() => {
      const aiResult = checkContentWithAi(newPostContent);

      if (aiResult.status === 'removido') {
        setPostAiNotice(aiResult.reason || 'Publicação bloqueada pela moderação de segurança.');
        setIsPublishing(false);
        return;
      }

      const newPost: SocialPost = {
        id: `post-${Date.now()}`,
        author: currentUser,
        content: newPostContent,
        image_url: newPostImage || undefined,
        visibility: 'publico',
        moderation_status: aiResult.status,
        likes_count: 0,
        comments_count: 0,
        user_liked: false,
        created_at: 'Agora mesmo'
      };

      setPosts([newPost, ...posts]);
      setNewPostContent('');
      setNewPostImage('');
      setIsPublishing(false);

      if (aiResult.status === 'sombra') {
        setPostAiNotice('Sua publicação foi postada e encaminhada para revisão da moderação.');
      } else {
        setPostAiNotice('Publicação realizada com sucesso e verificada pela IA Eclesia!');
      }

      setTimeout(() => setPostAiNotice(null), 5000);
    }, 600);
  };

  // Like Post
  const handleToggleLike = (postId: string) => {
    setPosts(prev =>
      prev.map(p => {
        if (p.id === postId) {
          const newLiked = !p.user_liked;
          return {
            ...p,
            user_liked: newLiked,
            likes_count: newLiked ? p.likes_count + 1 : p.likes_count - 1
          };
        }
        return p;
      })
    );
  };

  // Add Comment
  const handleAddComment = (postId: string) => {
    const text = commentInputs[postId];
    if (!text || !text.trim()) return;

    const aiCheck = checkContentWithAi(text);
    if (aiCheck.status === 'removido') {
      alert('Seu comentário foi bloqueado pelo filtro de moderação de conteúdo.');
      return;
    }

    const newComment = {
      id: `c-${Date.now()}`,
      author: currentUser,
      content: text,
      created_at: 'Agora'
    };

    setPostComments(prev => ({
      ...prev,
      [postId]: [...(prev[postId] || []), newComment]
    }));

    setPosts(prev =>
      prev.map(p => (p.id === postId ? { ...p, comments_count: p.comments_count + 1 } : p))
    );

    setCommentInputs(prev => ({ ...prev, [postId]: '' }));
  };

  // Submit Community Creation
  const handleCreateCommunity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommName.trim()) return;

    const newComm: Community = {
      id: `comm-${Date.now()}`,
      name: newCommName,
      slug: newCommName.toLowerCase().replace(/\s+/g, '-'),
      description: newCommDesc,
      cover_image: 'https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&q=80&w=800',
      created_by: currentUser.id,
      is_public: false,
      approval_status: 'pendente', // Requires admin approval!
      member_count: 1,
      is_member: true,
      category: newCommCategory
    };

    setCommunities([newComm, ...communities]);

    // Create a moderation report for admin
    const newReport: ModerationReport = {
      id: `rep-${Date.now()}`,
      reporter: currentUser,
      target_type: 'community',
      target_id: newComm.id,
      target_preview: `Nova Comunidade criada: "${newComm.name}"`,
      author_profile: currentUser,
      reason: 'Solicitação de criação de nova comunidade para aprovação do moderador.',
      status: 'pendente',
      priority: 'normal',
      ai_flag_reason: 'Aprovação prévia obrigatória de grupos',
      created_at: 'Agora mesmo'
    };

    setModerationReports([newReport, ...moderationReports]);

    setShowCreateCommModal(false);
    setNewCommName('');
    setNewCommDesc('');
    setCommNotice('Sua comunidade foi criada e está em análise na fila de moderação!');
    setTimeout(() => setCommNotice(null), 6000);
  };

  // Join/Leave Community
  const handleToggleJoinCommunity = (commId: string) => {
    setCommunities(prev =>
      prev.map(c => {
        if (c.id === commId) {
          const newMemberState = !c.is_member;
          return {
            ...c,
            is_member: newMemberState,
            member_count: newMemberState ? c.member_count + 1 : c.member_count - 1
          };
        }
        return c;
      })
    );
  };

  // Send Chat Message
  const handleSendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChatMessage.trim()) return;

    const activeConv = conversations.find(c => c.id === activeConvId);

    // Minor protection check for DM
    if (activeConv && !activeConv.is_group && activeConv.other_user) {
      if (currentUser.is_minor && !activeConv.other_user.is_minor) {
        // Warning rule for minor messaging adult or vice versa
      }
    }

    const aiCheck = checkContentWithAi(newChatMessage);
    if (aiCheck.status === 'removido') {
      setChatWarning('Sua mensagem foi bloqueada pelo filtro de moderação síncrona.');
      return;
    }

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      conversation_id: activeConvId,
      sender: currentUser,
      content: newChatMessage,
      moderation_status: aiCheck.status === 'sombra' ? 'em_analise' : 'publicado',
      created_at: 'Agora'
    };

    setMessages([...messages, newMsg]);
    setNewChatMessage('');
    setChatWarning(null);

    // Update conversation last message
    setConversations(prev =>
      prev.map(c =>
        c.id === activeConvId
          ? {
              ...c,
              last_message: `${currentUser.name.split(' ')[0]}: ${newChatMessage}`,
              last_message_time: 'Agora'
            }
          : c
      )
    );
  };

  // Submit Moderation Report by User
  const handleSubmitReport = () => {
    if (!reportModalTarget || !reportReason.trim()) return;

    const isMinorInvolved = currentUser.is_minor;

    const newReport: ModerationReport = {
      id: `rep-${Date.now()}`,
      reporter: currentUser,
      target_type: reportModalTarget.type as any,
      target_id: reportModalTarget.id,
      target_preview: reportModalTarget.preview,
      author_profile: currentUser,
      reason: reportReason,
      status: 'pendente',
      priority: isMinorInvolved ? 'alta' : 'normal',
      ai_flag_reason: isMinorInvolved ? 'Denúncia prioritária (Envolve menor de idade)' : 'Denúncia enviada por usuário',
      created_at: 'Agora'
    };

    setModerationReports([newReport, ...moderationReports]);
    setReportModalTarget(null);
    setReportReason('');
    setReportSuccessNotice('Denúncia enviada com sucesso! Nossa equipe revisará o conteúdo.');
    setTimeout(() => setReportSuccessNotice(null), 5000);
  };

  // Block User
  const handleBlockUser = (userId: string, userName: string) => {
    if (blockedUserIds.includes(userId)) return;
    setBlockedUserIds([...blockedUserIds, userId]);
    alert(`O usuário ${userName} foi bloqueado com sucesso. Vocês não verão mais publicações ou mensagens mútuas.`);
  };

  // Admin Action on Report
  const handleResolveReport = (reportId: string, action: 'aprovado' | 'removido') => {
    setModerationReports(prev =>
      prev.map(r => {
        if (r.id === reportId) {
          return { ...r, status: 'revisado' };
        }
        return r;
      })
    );

    // If report was for a pending community, approve it
    const report = moderationReports.find(r => r.id === reportId);
    if (report && report.target_type === 'community' && action === 'aprovado') {
      setCommunities(prev =>
        prev.map(c => (c.id === report.target_id ? { ...c, approval_status: 'aprovado', is_public: true } : c))
      );
    }
  };

  // AI Tester
  const handleRunAiTester = () => {
    if (!testAiInput.trim()) return;
    const res = checkContentWithAi(testAiInput);
    setTestAiResult({
      status: res.status === 'publicado' ? 'limpo' : res.status === 'sombra' ? 'sombra' : 'bloqueado',
      reason: res.reason || 'Conteúdo aprovado pelos filtros de segurança sem violações.'
    });
  };

  return (
    <div className="w-full max-w-[1120px] mx-auto px-4 md:px-12 pt-8 pb-20 space-y-8">
      {/* Top Banner & Header */}
      <div className="border-b border-[#d3c4af]/50 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[#785600] font-sans text-xs font-bold uppercase tracking-widest mb-1">
            <Users className="w-4 h-4" /> Rede Social Católica & Comunidades • Eclesia
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-[#1c1b1b] tracking-tight">
            Comunidade Eclesia
          </h1>
          <p className="font-sans text-sm md:text-base text-[#4f4535] mt-2 max-w-2xl leading-relaxed">
            Um ambiente seguro para partilha de fé, oração comunitária, grupos paroquiais e amizade cristã com moderação em camada dupla.
          </p>
        </div>

        {/* Safety Badge */}
        <div className="bg-[#1c5d3a]/10 border border-[#1c5d3a]/30 p-3 rounded-lg flex items-center gap-3 shrink-0">
          <ShieldCheck className="w-6 h-6 text-[#1c5d3a] shrink-0" />
          <div className="text-xs font-sans">
            <strong className="block text-[#1c5d3a] font-bold">Moderação Ativa & Proteção a Menores (16-17 anos)</strong>
            <span className="text-[#4f4535] text-[11px]">IA pré-síncrona + Revisão humana prioritária</span>
          </div>
        </div>
      </div>

      {/* Global Success Notices */}
      {reportSuccessNotice && (
        <div className="bg-[#1c5d3a]/10 border border-[#1c5d3a]/30 text-[#1c5d3a] px-4 py-3 rounded-lg text-xs font-sans font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#1c5d3a]" />
          <span>{reportSuccessNotice}</span>
        </div>
      )}

      {commNotice && (
        <div className="bg-[#ffdea6]/40 border border-[#785600]/40 text-[#785600] px-4 py-3 rounded-lg text-xs font-sans font-semibold flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#785600]" />
          <span>{commNotice}</span>
        </div>
      )}

      {/* Navigation Sub-Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-[#d3c4af]/50 pb-2">
        <button
          onClick={() => setActiveTab('feed')}
          className={`flex items-center gap-2 px-4 py-2 font-sans text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
            activeTab === 'feed'
              ? 'bg-[#785600] text-white shadow-2xs'
              : 'bg-white border border-[#d3c4af]/60 text-[#4f4535] hover:border-[#785600]'
          }`}
        >
          <MessageSquare className="w-4 h-4" /> Feed Social
        </button>

        <button
          onClick={() => setActiveTab('comunidades')}
          className={`flex items-center gap-2 px-4 py-2 font-sans text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
            activeTab === 'comunidades'
              ? 'bg-[#785600] text-white shadow-2xs'
              : 'bg-white border border-[#d3c4af]/60 text-[#4f4535] hover:border-[#785600]'
          }`}
        >
          <Users className="w-4 h-4" /> Comunidades & Grupos
        </button>

        <button
          onClick={() => setActiveTab('oracao')}
          className={`flex items-center gap-2 px-4 py-2 font-sans text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
            activeTab === 'oracao'
              ? 'bg-[#785600] text-white shadow-2xs'
              : 'bg-white border border-[#d3c4af]/60 text-[#4f4535] hover:border-[#785600]'
          }`}
        >
          <BookOpen className="w-4 h-4" /> Planos de Oração & Novenas
        </button>

        <button
          onClick={() => setActiveTab('chat')}
          className={`flex items-center gap-2 px-4 py-2 font-sans text-xs font-bold uppercase tracking-wider rounded-lg transition-all relative ${
            activeTab === 'chat'
              ? 'bg-[#785600] text-white shadow-2xs'
              : 'bg-white border border-[#d3c4af]/60 text-[#4f4535] hover:border-[#785600]'
          }`}
        >
          <MessageCircle className="w-4 h-4" /> Mensagens & DM
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
        </button>

        <button
          onClick={() => setActiveTab('moderacao')}
          className={`flex items-center gap-2 px-4 py-2 font-sans text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
            activeTab === 'moderacao'
              ? 'bg-[#1c1b1b] text-white shadow-2xs'
              : 'bg-white border border-[#d3c4af]/60 text-[#4f4535] hover:border-[#785600]'
          }`}
        >
          <ShieldAlert className="w-4 h-4 text-amber-400" /> Painel de Moderação
        </button>

        <button
          onClick={() => setActiveTab('perfil')}
          className={`flex items-center gap-2 px-4 py-2 font-sans text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
            activeTab === 'perfil'
              ? 'bg-[#785600] text-white shadow-2xs'
              : 'bg-white border border-[#d3c4af]/60 text-[#4f4535] hover:border-[#785600]'
          }`}
        >
          <UserCheck className="w-4 h-4" /> Meu Perfil (16-17 Anos)
        </button>
      </div>

      {/* TAB 1: FEED SOCIAL */}
      {activeTab === 'feed' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Feed Column */}
          <div className="lg:col-span-8 space-y-6">
            {/* Create Post Card */}
            <div className="bg-white p-5 rounded-xl border border-[#d3c4af]/60 shadow-xs space-y-4">
              <div className="flex items-center gap-3 border-b border-[#d3c4af]/30 pb-3">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-10 h-10 rounded-full object-cover border border-[#785600]"
                />
                <div>
                  <h3 className="font-sans text-sm font-bold text-[#1c1b1b]">{currentUser.name}</h3>
                  <span className="text-[11px] text-[#785600] font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-[#1c5d3a]" /> Conta Verificada (Menor de Idade - 16 Anos)
                  </span>
                </div>
              </div>

              <form onSubmit={handleCreatePost} className="space-y-3">
                <textarea
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  placeholder="Compartilhe uma intenção de oração, reflexão espiritual ou passagem bíblica..."
                  className="w-full p-3 bg-[#fcf9f8] border border-[#d3c4af]/60 rounded-lg font-sans text-xs text-[#1c1b1b] placeholder:text-[#817563] focus:border-[#785600] focus:ring-0 resize-none h-24"
                />

                <input
                  type="url"
                  value={newPostImage}
                  onChange={(e) => setNewPostImage(e.target.value)}
                  placeholder="URL opcional de imagem (ex: foto de igreja, santo, terço)..."
                  className="w-full px-3 py-2 bg-[#fcf9f8] border border-[#d3c4af]/60 rounded-lg font-sans text-xs text-[#1c1b1b] placeholder:text-[#817563]"
                />

                {postAiNotice && (
                  <div className="bg-[#ffdea6]/40 p-2.5 rounded text-xs font-sans text-[#785600] font-semibold flex items-center gap-2">
                    <Sparkles className="w-4 h-4 shrink-0" />
                    <span>{postAiNotice}</span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-1">
                  <div className="text-[11px] text-[#817563] flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-[#1c5d3a]" />
                    <span>Verificado por IA antes da publicação</span>
                  </div>

                  <button
                    type="submit"
                    disabled={isPublishing || !newPostContent.trim()}
                    className="px-5 py-2 bg-[#785600] hover:bg-[#9a7000] text-white font-sans text-xs font-bold uppercase tracking-wider rounded-lg shadow-2xs transition-all disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    {isPublishing ? 'Analisando...' : 'Publicar'}
                  </button>
                </div>
              </form>
            </div>

            {/* Posts Stream */}
            <div className="space-y-6">
              {posts
                .filter(post => !blockedUserIds.includes(post.author.id))
                .map((post) => (
                  <div key={post.id} className="bg-white p-6 rounded-xl border border-[#d3c4af]/60 shadow-xs space-y-4">
                    {/* Author Bar */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <img
                          src={post.author.avatar}
                          alt={post.author.name}
                          className="w-10 h-10 rounded-full object-cover border border-[#d3c4af]"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-sans text-sm font-bold text-[#1c1b1b]">{post.author.name}</h4>
                            {post.author.is_verified_parish && (
                              <span className="bg-[#785600]/10 text-[#785600] px-1.5 py-0.5 rounded text-[10px] font-bold">
                                Sacerdote / Paróquia
                              </span>
                            )}
                            {post.author.is_minor && (
                              <span className="bg-[#1c5d3a]/10 text-[#1c5d3a] px-1.5 py-0.5 rounded text-[10px] font-bold">
                                Jovem (16-17)
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-[#817563]">{post.author.handle} • {post.created_at}</span>
                        </div>
                      </div>

                      {/* Post Actions Menu */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setReportModalTarget({ type: 'post', id: post.id, preview: post.content })}
                          className="p-1.5 text-[#817563] hover:text-[#9a3e3c] transition-colors rounded hover:bg-gray-100"
                          title="Denunciar conteúdo"
                        >
                          <Flag className="w-4 h-4" />
                        </button>
                        {post.author.id !== currentUser.id && (
                          <button
                            onClick={() => handleBlockUser(post.author.id, post.author.name)}
                            className="p-1.5 text-[#817563] hover:text-[#9a3e3c] transition-colors rounded hover:bg-gray-100"
                            title="Bloquear usuário"
                          >
                            <UserX className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Community Tag if applicable */}
                    {post.community_name && (
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#f6f3f2] text-[#785600] text-[11px] font-bold rounded-md border border-[#d3c4af]/30">
                        <Users className="w-3 h-3" /> {post.community_name}
                      </div>
                    )}

                    {/* Content */}
                    <p className="font-sans text-sm text-[#1c1b1b] leading-relaxed whitespace-pre-line">
                      {post.content}
                    </p>

                    {/* Image Attachment */}
                    {post.image_url && (
                      <div className="rounded-lg overflow-hidden border border-[#d3c4af]/40 max-h-[380px]">
                        <img src={post.image_url} alt="Anexo do Post" className="w-full h-full object-cover" />
                      </div>
                    )}

                    {/* Like & Comment Bar */}
                    <div className="pt-3 border-t border-[#d3c4af]/30 flex items-center justify-between text-xs text-[#817563]">
                      <div className="flex items-center gap-6">
                        <button
                          onClick={() => handleToggleLike(post.id)}
                          className={`flex items-center gap-1.5 font-bold transition-colors ${
                            post.user_liked ? 'text-[#9a3e3c]' : 'hover:text-[#9a3e3c]'
                          }`}
                        >
                          <Heart className={`w-4 h-4 ${post.user_liked ? 'fill-[#9a3e3c]' : ''}`} />
                          <span>{post.likes_count} Curtidas</span>
                        </button>

                        <span className="flex items-center gap-1.5 font-semibold">
                          <MessageCircle className="w-4 h-4" /> {post.comments_count} Comentários
                        </span>
                      </div>

                      <span className="text-[11px] text-[#1c5d3a] font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Moderado por IA
                      </span>
                    </div>

                    {/* Comments Section */}
                    <div className="bg-[#fcf9f8] p-3 rounded-lg border border-[#d3c4af]/30 space-y-3">
                      {postComments[post.id]?.map((cmt) => (
                        <div key={cmt.id} className="flex items-start gap-2 text-xs">
                          <img src={cmt.author.avatar} alt={cmt.author.name} className="w-6 h-6 rounded-full object-cover mt-0.5" />
                          <div className="bg-white p-2 rounded border border-[#d3c4af]/30 flex-1 space-y-0.5">
                            <span className="font-bold text-[#1c1b1b] block">{cmt.author.name}</span>
                            <p className="text-[#4f4535]">{cmt.content}</p>
                          </div>
                        </div>
                      ))}

                      {/* Add Comment Input */}
                      <div className="flex items-center gap-2 pt-1">
                        <input
                          type="text"
                          value={commentInputs[post.id] || ''}
                          onChange={(e) => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })}
                          onKeyDown={(e) => e.key === 'Enter' && handleAddComment(post.id)}
                          placeholder="Escreva um comentário respeitoso..."
                          className="flex-1 px-3 py-1.5 bg-white border border-[#d3c4af]/60 rounded-md font-sans text-xs text-[#1c1b1b]"
                        />
                        <button
                          onClick={() => handleAddComment(post.id)}
                          className="px-3 py-1.5 bg-[#785600] text-white font-bold text-xs rounded-md hover:bg-[#9a7000]"
                        >
                          Comentar
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Right Sidebar: Rules & Daily Intentions */}
          <div className="lg:col-span-4 space-y-6">
            {/* Minor Safety Rules Card */}
            <div className="bg-white p-5 rounded-xl border border-[#d3c4af]/60 space-y-3 shadow-2xs">
              <div className="flex items-center gap-2 text-[#785600]">
                <ShieldCheck className="w-5 h-5 text-[#1c5d3a]" />
                <h3 className="font-display text-base font-bold text-[#1c1b1b]">Proteção a Menores de Idade</h3>
              </div>
              <p className="font-sans text-xs text-[#4f4535] leading-relaxed">
                Nossa rede opera sob rigoroso protocolo de proteção para jovens de 16-17 anos:
              </p>
              <ul className="text-xs font-sans text-[#4f4535] space-y-1.5 list-disc list-inside">
                <li>Perfil privado por padrão para menores.</li>
                <li>DMs restritas a seguidores mútuos.</li>
                <li>Sem exibição de geolocalização exata.</li>
                <li>Fila de denúncia com prioridade máxima de revisão.</li>
              </ul>
            </div>

            {/* Prayer Intentions Community Box */}
            <div className="bg-[#fcf9f8] p-5 rounded-xl border border-[#d3c4af]/60 space-y-3">
              <h3 className="font-display text-base font-bold text-[#1c1b1b] flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#785600]" /> Intenções do Papa e do Bispo
              </h3>
              <div className="p-3 bg-white rounded border border-[#d3c4af]/40 text-xs text-[#4f4535] space-y-1">
                <strong className="text-[#785600] block uppercase tracking-wider text-[10px]">Agosto de 2026:</strong>
                <p>"Pelos jovens da Igreja, para que encontrem na vida comunitária um espaço seguro de fé e vocação."</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: COMUNIDADES & GRUPOS */}
      {activeTab === 'comunidades' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-[#d3c4af]/60 shadow-2xs">
            <div>
              <h2 className="font-display text-2xl font-bold text-[#1c1b1b]">Grupos & Comunidades Católicas</h2>
              <p className="font-sans text-xs text-[#817563] mt-0.5">
                Conecte-se a grupos paroquiais, movimentos e apostolados verificados.
              </p>
            </div>

            <button
              onClick={() => setShowCreateCommModal(true)}
              className="px-4 py-2.5 bg-[#785600] hover:bg-[#9a7000] text-white font-sans text-xs font-bold uppercase tracking-wider rounded-lg flex items-center gap-2 shrink-0 cursor-pointer shadow-2xs"
            >
              <PlusCircle className="w-4 h-4" /> Criar Nova Comunidade
            </button>
          </div>

          {/* Communities Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {communities.map((comm) => (
              <div key={comm.id} className="bg-white rounded-xl border border-[#d3c4af]/60 overflow-hidden shadow-xs space-y-3">
                <div className="h-36 bg-gray-200 relative">
                  <img src={comm.cover_image} alt={comm.name} className="w-full h-full object-cover" />
                  {comm.approval_status === 'pendente' && (
                    <span className="absolute top-3 right-3 bg-amber-500 text-white font-sans text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded shadow">
                      Aguardando Aprovação da Moderação
                    </span>
                  )}
                  {comm.linked_parish && (
                    <span className="absolute bottom-3 left-3 bg-[#1c1b1b]/80 backdrop-blur-xs text-white font-sans text-[10px] font-semibold px-2 py-1 rounded">
                      📍 {comm.linked_parish}
                    </span>
                  )}
                </div>

                <div className="p-5 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[#785600]">
                        Categoria: {comm.category}
                      </span>
                      <h3 className="font-display text-lg font-bold text-[#1c1b1b] leading-snug">{comm.name}</h3>
                    </div>
                    <span className="text-xs font-bold text-[#817563] shrink-0 bg-[#f6f3f2] px-2 py-1 rounded">
                      {comm.member_count} membros
                    </span>
                  </div>

                  <p className="font-sans text-xs text-[#4f4535] leading-relaxed line-clamp-2">
                    {comm.description}
                  </p>

                  <div className="pt-2 border-t border-[#d3c4af]/30 flex items-center justify-between">
                    <span className="text-[11px] text-[#817563]">
                      Status: <strong>{comm.approval_status === 'aprovado' ? 'Pública & Verificada' : 'Em Análise'}</strong>
                    </span>

                    <button
                      onClick={() => handleToggleJoinCommunity(comm.id)}
                      disabled={comm.approval_status !== 'aprovado'}
                      className={`px-4 py-1.5 font-sans text-xs font-bold uppercase tracking-wider rounded transition-all cursor-pointer ${
                        comm.is_member
                          ? 'bg-[#1c5d3a] text-white'
                          : 'bg-[#1c1b1b] hover:bg-[#785600] text-white'
                      } disabled:opacity-50`}
                    >
                      {comm.is_member ? 'Membro Ativo ✓' : 'Participar do Grupo'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Modal for Community Creation */}
          {showCreateCommModal && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
              <div className="bg-white max-w-md w-full p-6 rounded-xl border border-[#d3c4af] space-y-4 shadow-xl">
                <div className="flex items-center justify-between border-b border-[#d3c4af]/40 pb-3">
                  <h3 className="font-display text-lg font-bold text-[#1c1b1b]">Criar Nova Comunidade Católica</h3>
                  <button onClick={() => setShowCreateCommModal(false)} className="text-xs font-bold text-[#817563]">
                    Fechar
                  </button>
                </div>

                <form onSubmit={handleCreateCommunity} className="space-y-3 text-xs font-sans">
                  <div>
                    <label className="font-bold text-[#1c1b1b] block mb-1">Nome do Grupo / Comunidade</label>
                    <input
                      type="text"
                      required
                      value={newCommName}
                      onChange={(e) => setNewCommName(e.target.value)}
                      placeholder="Ex: Apostolado da Oração Paroquial"
                      className="w-full p-2 bg-[#fcf9f8] border border-[#d3c4af]/60 rounded text-[#1c1b1b]"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-[#1c1b1b] block mb-1">Categoria</label>
                    <select
                      value={newCommCategory}
                      onChange={(e) => setNewCommCategory(e.target.value as any)}
                      className="w-full p-2 bg-[#fcf9f8] border border-[#d3c4af]/60 rounded text-[#1c1b1b]"
                    >
                      <option value="juventude">Juventude</option>
                      <option value="oracao">Grupo de Oração / Terço</option>
                      <option value="estudos">Estudos do Catecismo / Teologia</option>
                      <option value="paroquia">Paróquia Local</option>
                      <option value="familias">Famílias & Casais</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-[#1c1b1b] block mb-1">Descrição e Propósito</label>
                    <textarea
                      required
                      value={newCommDesc}
                      onChange={(e) => setNewCommDesc(e.target.value)}
                      placeholder="Explique o propósito espiritual e atividades do grupo..."
                      className="w-full p-2 bg-[#fcf9f8] border border-[#d3c4af]/60 rounded text-[#1c1b1b] h-20"
                    />
                  </div>

                  <div className="p-2.5 bg-[#ffdea6]/30 border border-[#785600]/30 rounded text-[11px] text-[#785600]">
                    ℹ️ Toda nova comunidade passa pela aprovação prévia dos moderadores humanos antes de tornar-se pública.
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowCreateCommModal(false)}
                      className="px-3 py-2 border border-[#d3c4af] rounded font-bold text-[#817563]"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-[#785600] text-white font-bold rounded uppercase tracking-wider"
                    >
                      Enviar para Aprovação
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: PLANOS DE ORAÇÃO & NOVENAS */}
      {activeTab === 'oracao' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Journeys List */}
          <div className="lg:col-span-5 space-y-4">
            <h2 className="font-display text-xl font-bold text-[#1c1b1b]">Jornadas de Oração Disponíveis</h2>

            <div className="space-y-4">
              {journeys.map((jrn) => (
                <div
                  key={jrn.id}
                  onClick={() => {
                    setSelectedJourney(jrn);
                    setCurrentDayIndex(0);
                  }}
                  className={`p-5 rounded-xl border transition-all cursor-pointer space-y-2 ${
                    selectedJourney?.id === jrn.id
                      ? 'bg-white border-2 border-[#785600] shadow-md'
                      : 'bg-[#fcf9f8] border-[#d3c4af]/60 hover:border-[#785600]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#785600]">
                      {jrn.type === 'novena' ? 'Novena Comunitária' : 'Plano de Formação'}
                    </span>
                    <span className="text-xs font-bold text-[#1c5d3a]">
                      {jrn.participants_count} participantes
                    </span>
                  </div>

                  <h3 className="font-display text-lg font-bold text-[#1c1b1b]">{jrn.title}</h3>
                  <p className="font-sans text-xs text-[#4f4535]">{jrn.description}</p>

                  <div className="pt-2 border-t border-[#d3c4af]/30 flex items-center justify-between text-[11px] text-[#817563]">
                    <span>Duração: <strong>{jrn.duration_days} dias</strong></span>
                    <span className="font-bold text-[#785600]">Acessar Jornada →</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Active Selected Journey Content */}
          <div className="lg:col-span-7 bg-white p-6 rounded-xl border-2 border-[#785600] shadow-md space-y-6">
            {selectedJourney ? (
              <>
                <div className="border-b border-[#d3c4af]/40 pb-4 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#785600]">
                    Jornada Ativa de Oração
                  </span>
                  <h3 className="font-display text-2xl font-bold text-[#1c1b1b]">{selectedJourney.title}</h3>
                  <p className="font-sans text-xs text-[#4f4535]">{selectedJourney.description}</p>
                </div>

                {/* Day Navigation Tabs */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[#d3c4af]/30">
                  {selectedJourney.days.map((day, idx) => (
                    <button
                      key={day.day}
                      onClick={() => setCurrentDayIndex(idx)}
                      className={`px-3 py-1.5 font-sans text-xs font-bold rounded-lg transition-all shrink-0 ${
                        currentDayIndex === idx
                          ? 'bg-[#785600] text-white shadow-2xs'
                          : 'bg-[#f6f3f2] text-[#4f4535] hover:bg-[#d3c4af]/30'
                      }`}
                    >
                      Dia {day.day}
                    </button>
                  ))}
                </div>

                {/* Day Content */}
                {selectedJourney.days[currentDayIndex] && (
                  <div className="space-y-4 animate-fade-in">
                    <h4 className="font-display text-xl font-bold text-[#1c1b1b]">
                      {selectedJourney.days[currentDayIndex].title}
                    </h4>

                    {selectedJourney.days[currentDayIndex].scripture && (
                      <div className="p-3 bg-[#f6f3f2] border-l-4 border-[#785600] rounded text-xs font-sans text-[#1c1b1b] italic">
                        {selectedJourney.days[currentDayIndex].scripture}
                      </div>
                    )}

                    <div className="space-y-2">
                      <strong className="text-xs font-bold text-[#785600] uppercase tracking-wider block">Reflexão Diária:</strong>
                      <p className="font-sans text-sm text-[#4f4535] leading-relaxed">
                        {selectedJourney.days[currentDayIndex].reflection}
                      </p>
                    </div>

                    <div className="p-4 bg-[#ffdea6]/20 border border-[#785600]/30 rounded-lg space-y-2">
                      <strong className="text-xs font-bold text-[#785600] uppercase tracking-wider block">Oração do Dia:</strong>
                      <p className="font-serif text-sm text-[#1c1b1b] italic leading-relaxed">
                        "{selectedJourney.days[currentDayIndex].prayer}"
                      </p>
                    </div>

                    <button
                      onClick={() => alert(`Check-in do Dia ${selectedJourney.days[currentDayIndex].day} registrado com sucesso!`)}
                      className="w-full py-3 bg-[#1c5d3a] hover:bg-[#14452a] text-white font-sans text-xs font-bold uppercase tracking-widest rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-2xs"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Marcar Dia Concluído
                    </button>
                  </div>
                )}
              </>
            ) : (
              <p className="text-xs text-[#817563]">Selecione uma jornada ao lado.</p>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: MENSAGENS & CHAT */}
      {activeTab === 'chat' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-white rounded-xl border border-[#d3c4af]/60 overflow-hidden shadow-xs min-h-[500px]">
          {/* Conversations List */}
          <div className="lg:col-span-4 border-r border-[#d3c4af]/40 p-4 space-y-3 bg-[#fcf9f8]">
            <h3 className="font-display text-base font-bold text-[#1c1b1b] border-b border-[#d3c4af]/30 pb-2">
              Mensagens Diretas & Grupos
            </h3>

            <div className="space-y-2">
              {conversations.map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => setActiveConvId(conv.id)}
                  className={`p-3 rounded-lg cursor-pointer transition-all space-y-1 ${
                    activeConvId === conv.id
                      ? 'bg-white border border-[#785600] shadow-2xs'
                      : 'hover:bg-white/60 border border-transparent'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-sans text-xs font-bold text-[#1c1b1b]">{conv.title}</span>
                    <span className="text-[10px] text-[#817563]">{conv.last_message_time}</span>
                  </div>
                  <p className="font-sans text-[11px] text-[#817563] truncate">{conv.last_message}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Active Chat Window */}
          <div className="lg:col-span-8 p-4 flex flex-col justify-between space-y-4">
            {/* Header */}
            <div className="border-b border-[#d3c4af]/40 pb-3 flex items-center justify-between">
              <div>
                <h4 className="font-display text-base font-bold text-[#1c1b1b]">
                  {conversations.find(c => c.id === activeConvId)?.title}
                </h4>
                <span className="text-[11px] text-[#1c5d3a] font-semibold flex items-center gap-1">
                  <Lock className="w-3 h-3 text-[#1c5d3a]" /> Chat Seguro com Filtro de Segurança Infantil
                </span>
              </div>
            </div>

            {/* Messages Container */}
            <div className="flex-1 space-y-3 max-h-[360px] overflow-y-auto p-2">
              {messages.map((msg) => {
                const isMe = msg.sender.id === currentUser.id;
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} space-y-0.5`}
                  >
                    <span className="text-[10px] text-[#817563] px-1">{msg.sender.name}</span>
                    <div
                      className={`max-w-[80%] p-3 rounded-xl text-xs font-sans ${
                        isMe
                          ? 'bg-[#785600] text-white rounded-tr-none'
                          : 'bg-[#f6f3f2] text-[#1c1b1b] rounded-tl-none border border-[#d3c4af]/40'
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                );
              })}
            </div>

            {chatWarning && (
              <div className="bg-[#9a3e3c]/10 text-[#9a3e3c] p-2 rounded text-xs font-semibold">
                {chatWarning}
              </div>
            )}

            {/* Input Form */}
            <form onSubmit={handleSendChatMessage} className="flex items-center gap-2 pt-2 border-t border-[#d3c4af]/30">
              <input
                type="text"
                value={newChatMessage}
                onChange={(e) => setNewChatMessage(e.target.value)}
                placeholder="Escreva sua mensagem com caridade fraterna..."
                className="flex-1 p-2.5 bg-[#fcf9f8] border border-[#d3c4af]/60 rounded-lg font-sans text-xs text-[#1c1b1b]"
              />
              <button
                type="submit"
                className="px-4 py-2.5 bg-[#785600] text-white font-bold text-xs uppercase tracking-wider rounded-lg hover:bg-[#9a7000]"
              >
                Enviar
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TAB 5: PAINEL DE MODERAÇÃO */}
      {activeTab === 'moderacao' && (
        <div className="space-y-6">
          <div className="bg-[#1c1b1b] text-white p-6 rounded-xl space-y-2">
            <div className="flex items-center gap-2 text-amber-400 font-sans text-xs font-bold uppercase tracking-widest">
              <ShieldAlert className="w-4 h-4" /> Painel de Moderação em Camada Dupla
            </div>
            <h2 className="font-display text-2xl font-bold">Gerenciamento de Segurança & Denúncias</h2>
            <p className="font-sans text-xs text-gray-300">
              Itens que violam as diretrizes de conduta católica ou regras de proteção a menores de 16-17 anos.
            </p>
          </div>

          {/* AI Toxicity Tester Utility */}
          <div className="bg-white p-5 rounded-xl border border-[#d3c4af]/60 space-y-3">
            <h3 className="font-display text-base font-bold text-[#1c1b1b] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#785600]" /> Testador de Filtro de IA de Moderação
            </h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={testAiInput}
                onChange={(e) => setTestAiInput(e.target.value)}
                placeholder="Digite uma frase de teste (ex: palavras ofensivas ou mensagens pacíficas)..."
                className="flex-1 p-2 bg-[#fcf9f8] border border-[#d3c4af]/60 rounded text-xs text-[#1c1b1b]"
              />
              <button
                onClick={handleRunAiTester}
                className="px-4 py-2 bg-[#785600] text-white text-xs font-bold uppercase rounded"
              >
                Testar Filtro
              </button>
            </div>

            {testAiResult && (
              <div
                className={`p-3 rounded text-xs font-sans font-semibold ${
                  testAiResult.status === 'limpo'
                    ? 'bg-[#1c5d3a]/10 text-[#1c5d3a]'
                    : testAiResult.status === 'sombra'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                <strong>Resultado IA: [{testAiResult.status.toUpperCase()}]</strong> — {testAiResult.reason}
              </div>
            )}
          </div>

          {/* Active Reports List */}
          <div className="bg-white p-5 rounded-xl border border-[#d3c4af]/60 space-y-4">
            <h3 className="font-display text-lg font-bold text-[#1c1b1b]">Fila de Revisão Humana de Moderação</h3>

            <div className="space-y-4">
              {moderationReports.map((rep) => (
                <div
                  key={rep.id}
                  className={`p-4 rounded-lg border space-y-3 ${
                    rep.priority === 'alta' ? 'bg-red-50 border-red-200' : 'bg-[#fcf9f8] border-[#d3c4af]/60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${
                        rep.priority === 'alta' ? 'bg-red-600 text-white' : 'bg-[#785600] text-white'
                      }`}
                    >
                      {rep.priority === 'alta' ? '🚨 Prioridade Alta (Proteção a Menor)' : 'Denúncia Normal'}
                    </span>
                    <span className="text-xs font-bold text-[#817563]">Status: {rep.status}</span>
                  </div>

                  <p className="font-sans text-xs text-[#1c1b1b]">
                    <strong>Razão:</strong> {rep.reason}
                  </p>
                  <p className="font-sans text-xs text-[#4f4535] bg-white p-2 rounded border border-[#d3c4af]/40">
                    <strong>Preview do Alvo:</strong> "{rep.target_preview}"
                  </p>

                  <div className="flex justify-end gap-2 pt-2 border-t border-[#d3c4af]/30">
                    <button
                      onClick={() => handleResolveReport(rep.id, 'removido')}
                      className="px-3 py-1.5 bg-[#9a3e3c] text-white text-xs font-bold rounded uppercase tracking-wider"
                    >
                      Remover / Punir
                    </button>
                    <button
                      onClick={() => handleResolveReport(rep.id, 'aprovado')}
                      className="px-3 py-1.5 bg-[#1c5d3a] text-white text-xs font-bold rounded uppercase tracking-wider"
                    >
                      Aprovar Conteúdo
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: MEU PERFIL (PROTEÇÃO DE MENOR) */}
      {activeTab === 'perfil' && (
        <div className="max-w-2xl mx-auto bg-white p-6 rounded-xl border border-[#d3c4af]/60 space-y-6 shadow-xs">
          <div className="flex items-center gap-4 border-b border-[#d3c4af]/40 pb-4">
            <img src={currentUser.avatar} alt={currentUser.name} className="w-16 h-16 rounded-full object-cover border-2 border-[#785600]" />
            <div>
              <h2 className="font-display text-2xl font-bold text-[#1c1b1b]">{currentUser.name}</h2>
              <span className="text-xs text-[#785600] font-semibold">{currentUser.handle}</span>
            </div>
          </div>

          {/* Minor Status Banner */}
          <div className="p-4 bg-[#1c5d3a]/10 border border-[#1c5d3a]/30 rounded-lg space-y-2">
            <div className="flex items-center gap-2 text-[#1c5d3a] font-bold text-xs uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" /> Diretrizes de Proteção ao Menor (16-17 anos)
            </div>
            <p className="text-xs text-[#4f4535] leading-relaxed">
              Sua conta está cadastrada com <strong>16 anos</strong>. Por motivos de segurança legal e proteção moral, restrições automáticas de mensagens diretas e privacidade privada estão ativas.
            </p>
            <div className="text-[11px] text-[#1c5d3a] font-semibold pt-1">
              E-mail do responsável notificado: <code>{currentUser.guardian_email}</code>
            </div>
          </div>

          <div className="space-y-4 text-xs font-sans">
            <div>
              <label className="font-bold text-[#1c1b1b] block mb-1">Visibilidade Padrão do Perfil</label>
              <select
                value={currentUser.profile_visibility}
                onChange={(e) => setCurrentUser({ ...currentUser, profile_visibility: e.target.value as any })}
                className="w-full p-2.5 bg-[#fcf9f8] border border-[#d3c4af]/60 rounded text-[#1c1b1b]"
              >
                <option value="privado">Privado (Apenas amigos aprovados)</option>
                <option value="seguidores">Apenas Seguidores Mútuos</option>
                <option value="publico" disabled>Público (Indisponível para menores de 18 anos)</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-[#1c1b1b] block mb-1">Política de Mensagens Diretas (DMs)</label>
              <select
                value={currentUser.dm_policy}
                onChange={(e) => setCurrentUser({ ...currentUser, dm_policy: e.target.value as any })}
                className="w-full p-2.5 bg-[#fcf9f8] border border-[#d3c4af]/60 rounded text-[#1c1b1b]"
              >
                <option value="seguidores_mutuos">Seguidores Mútuos Apenas</option>
                <option value="ninguem">Ninguém (DMs completamente desativadas)</option>
                <option value="todos" disabled>Todos os Usuários (Indisponível para menores)</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {reportModalTarget && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full p-6 rounded-xl border border-[#d3c4af] space-y-4 shadow-xl">
            <h3 className="font-display text-lg font-bold text-[#1c1b1b]">Denunciar Conteúdo</h3>

            <p className="text-xs text-[#817563] bg-[#fcf9f8] p-2 rounded border border-[#d3c4af]/40">
              "{reportModalTarget.preview.slice(0, 100)}..."
            </p>

            <textarea
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              placeholder="Descreva o motivo da denúncia (ofensas, assédio, spam, etc)..."
              className="w-full p-2 bg-[#fcf9f8] border border-[#d3c4af]/60 rounded text-xs h-20 text-[#1c1b1b]"
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setReportModalTarget(null)}
                className="px-3 py-2 border border-[#d3c4af] rounded font-bold text-xs text-[#817563]"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmitReport}
                className="px-4 py-2 bg-[#9a3e3c] text-white font-bold text-xs rounded uppercase tracking-wider"
              >
                Enviar Denúncia
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
