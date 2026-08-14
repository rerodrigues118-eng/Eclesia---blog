import React, { useState } from 'react';
import {
  Feather,
  Heart,
  MessageCircle,
  Share2,
  Send,
  PlusCircle,
  ShieldCheck,
  BookOpen,
  Users,
  Sparkles,
  Lock,
  Tag,
  PenTool,
  Quote,
  Flame,
  CheckCircle2,
  Bookmark,
  Calendar,
  Search,
  Check,
  Camera,
  Image as ImageIcon,
  X,
  Church,
  ArrowLeft,
  Copy,
  Plus,
  Key,
  Globe,
  Lock as LockIcon,
  MessageSquare,
  Settings,
  Trash2,
  CheckSquare,
  Square,
  Clock,
  UserCheck,
  Edit3
} from 'lucide-react';

import { UserProfile, SocialPost, Community, CommunityPrayerPlan, ActiveView } from '../types';
import { INITIAL_SOCIAL_POSTS, INITIAL_COMMUNITIES } from '../data/socialData';

interface RedeSocialViewProps {
  user: any;
  profile: UserProfile | null;
  onOpenAuth: (tab?: 'signup' | 'login') => void;
}

export type PostCategory = 'sentimento' | 'reflexao' | 'oracao' | 'meditacao' | 'testemunho';

export interface ChristianPost extends SocialPost {
  category?: PostCategory;
  verse_reference?: string;
  title?: string;
}

export interface CommunityTask {
  id: string;
  title: string;
  type: 'confissao' | 'missa' | 'terco' | 'evento' | 'outro';
  date_time: string;
  completed: boolean;
  created_by: string;
}

export const RedeSocialView: React.FC<RedeSocialViewProps> = ({
  user,
  profile,
  onOpenAuth
}) => {
  // If not logged in, render the Auth Guard screen
  if (!user || !profile) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="max-w-xl mx-auto bg-white border border-[#d3c4af]/80 rounded-3xl p-8 sm:p-12 shadow-md space-y-6">
          <div className="w-16 h-16 rounded-full bg-[#785600] text-white flex items-center justify-center mx-auto shadow-lg">
            <Feather className="w-8 h-8" />
          </div>
          <span className="inline-block px-3 py-1 bg-[#785600]/10 text-[#785600] font-sans text-xs font-bold uppercase tracking-widest rounded-full">
            Área Exclusiva para Membros Logados
          </span>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#1c1b1b] leading-tight">
            Comunidade Eclesia de Escritores Cristãos
          </h1>
          <p className="font-sans text-sm text-[#4f4535] leading-relaxed">
            A área de Comunidades e Rede Social é um ambiente reservado para fiéis cadastrados expressarem sentimentos, partilharem reflexões teológicas, versículos comoventes e intenções de oração.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => onOpenAuth('signup')}
              className="px-6 py-3.5 bg-[#785600] hover:bg-[#9a7000] text-white font-sans text-xs font-bold uppercase tracking-widest rounded-xl shadow-md transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              <PenTool className="w-4 h-4" /> Criar Conta de Escritor
            </button>
            <button
              onClick={() => onOpenAuth('login')}
              className="px-6 py-3.5 border border-[#785600] text-[#785600] hover:bg-[#f6f3f2] font-sans text-xs font-bold uppercase tracking-widest rounded-xl transition-colors cursor-pointer"
            >
              Já possuo uma conta (Entrar)
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- LOGGED IN USER INTERFACE ---
  const [activeTab, setActiveTab] = useState<'feed' | 'escrever' | 'meus-escritos' | 'comunidades'>('feed');
  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(null);
  const [commSubTab, setCommSubTab] = useState<'chat' | 'oracoes' | 'agenda' | 'posts' | 'membros' | 'config'>('chat');

  // Posts State
  const [posts, setPosts] = useState<ChristianPost[]>(INITIAL_SOCIAL_POSTS.map(p => ({
    ...p,
    category: 'reflexao' as PostCategory,
    title: p.id === 'post-1' ? 'A Presença Real na Eucaristia' : p.id === 'post-2' ? 'Confiança na Mãe de Deus' : 'A Graça e a Natureza'
  })));

  // Form Composer State
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [postCategory, setPostCategory] = useState<PostCategory>('sentimento');
  const [postVerse, setPostVerse] = useState('');
  const [postImageFile, setPostImageFile] = useState<string | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // Filter Tag state for Feed
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('todos');

  // Comments state
  const [commentInputs, setCommentInputs] = useState<{ [postId: string]: string }>({});
  const [postComments, setPostComments] = useState<{ [postId: string]: { id: string; author: UserProfile; content: string; created_at: string }[] }>({
    'post-1': [
      {
        id: 'c-1',
        author: {
          id: 'usr-03',
          name: 'Mariana Costa',
          handle: '@maricosta',
          avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
          bio: '',
          is_minor: false,
          age: 29,
          profile_visibility: 'publico',
          dm_policy: 'todos'
        },
        content: 'Bela partilha! Que a Eucaristia seja sempre nosso alimento diário.',
        created_at: 'Há 1 hora'
      }
    ]
  });

  // Communities state
  const [communities, setCommunities] = useState<Community[]>(INITIAL_COMMUNITIES.map(c => ({
    ...c,
    patron_saint: c.id === 'comm-1' ? 'São João Paulo II' : c.id === 'comm-2' ? 'São Tomás de Aquino' : 'Nossa Senhora do Carmo',
    invite_code: `eclesia-${c.slug}`,
    prayer_plans: [
      {
        id: 'plan-1',
        title: 'Terço Comunitário da Misericórdia',
        description: 'Rezamos todos os dias às 15h pelas famílias e intenções do grupo.',
        prayer_text: 'Pai Eterno, eu Vos ofereço o Corpo e o Sangue, a Alma e a Divindade de Vosso diletíssimo Filho...',
        created_by: 'Administrador',
        created_at: 'Hoje'
      },
      {
        id: 'plan-2',
        title: 'Novena Perpétua ao Padroeiro',
        description: 'Súplica diária pela santificação e união dos membros.',
        prayer_text: 'Glorioso padroeiro, intercedei por nós junto ao trono da Divina Graça...',
        created_by: 'Coordenação',
        created_at: 'Esta semana'
      }
    ]
  })));

  // Community Chat Messages state
  const [communityChats, setCommunityChats] = useState<{ [commId: string]: { id: string; sender: UserProfile; text: string; time: string }[] }>({
    'comm-1': [
      {
        id: 'm-1',
        sender: {
          id: 'usr-02',
          name: 'Pe. Mateus Silva',
          handle: '@prmateus',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
          is_minor: false,
          age: 38,
          profile_visibility: 'publico',
          dm_policy: 'todos'
        },
        text: 'Paz e Bem a todos os jovens da comunidade! Que tenhamos uma semana abençoada na graça do Senhor.',
        time: '09:15'
      },
      {
        id: 'm-2',
        sender: profile,
        text: 'Amém, Padre! Contem com minhas orações de hoje.',
        time: '10:02'
      }
    ]
  });

  const [chatInput, setChatInput] = useState('');

  // Community Tasks & Catholic Agenda state
  const [communityTasks, setCommunityTasks] = useState<{ [commId: string]: CommunityTask[] }>({
    'comm-1': [
      { id: 't-1', title: 'Confissão Paroquial Pré-Páscoa', type: 'confissao', date_time: 'Sábado às 16:00', completed: false, created_by: 'Pe. Mateus' },
      { id: 't-2', title: 'Terço dos Jovens pela Paz', type: 'terco', date_time: 'Hoje às 19:30', completed: true, created_by: 'Coordenação' },
      { id: 't-3', title: 'Missa Dominical em Comunidade', type: 'missa', date_time: 'Domingo às 10:00', completed: false, created_by: 'Comunidade' }
    ]
  });

  // Task form state
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskType, setNewTaskType] = useState<'confissao' | 'missa' | 'terco' | 'evento' | 'outro'>('confissao');
  const [newTaskDate, setNewTaskDate] = useState('');
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);

  // New Community Form State
  const [showNewCommModal, setShowNewCommModal] = useState(false);
  const [newCommName, setNewCommName] = useState('');
  const [newCommDesc, setNewCommDesc] = useState('');
  const [newCommParish, setNewCommParish] = useState('');
  const [newCommSaint, setNewCommSaint] = useState('');
  const [newCommIsPublic, setNewCommIsPublic] = useState(true);
  const [newCommCat, setNewCommCat] = useState<'juventude' | 'oracao' | 'estudos' | 'paroquia' | 'familias'>('estudos');
  const [newCommCover, setNewCommCover] = useState('https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&q=80&w=800');

  // Edit Community Config State
  const [editCommName, setEditCommName] = useState('');
  const [editCommDesc, setEditCommDesc] = useState('');
  const [editCommParish, setEditCommParish] = useState('');
  const [editCommSaint, setEditCommSaint] = useState('');
  const [editCommIsPublic, setEditCommIsPublic] = useState(true);

  // New Prayer Plan in Community Modal
  const [showNewPlanModal, setShowNewPlanModal] = useState(false);
  const [newPlanTitle, setNewPlanTitle] = useState('');
  const [newPlanDesc, setNewPlanDesc] = useState('');
  const [newPlanText, setNewPlanText] = useState('');

  // Internal Community Quick Post
  const [commPostText, setCommPostText] = useState('');

  // Invite code search state
  const [inviteCodeInput, setInviteCodeInput] = useState('');
  const [commViewFilter, setCommViewFilter] = useState<'publicas' | 'minhas'>('publicas');

  // Bookmarked posts
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);
  const [copiedLink, setCopiedLink] = useState(false);

  // Category labels helper
  const categoryLabels: Record<PostCategory, { label: string; color: string }> = {
    sentimento: { label: 'Sentimento Cristão', color: 'bg-rose-100 text-rose-800 border-rose-200' },
    reflexao: { label: 'Reflexão Teológica', color: 'bg-amber-100 text-amber-900 border-amber-200' },
    oracao: { label: 'Intenção de Oração', color: 'bg-emerald-100 text-emerald-900 border-emerald-200' },
    meditacao: { label: 'Meditação Bíblica', color: 'bg-indigo-100 text-indigo-900 border-indigo-200' },
    testemunho: { label: 'Testemunho de Fé', color: 'bg-purple-100 text-purple-900 border-purple-200' }
  };

  // Image Upload File Handler for New Post
  const handlePostImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setPostImageFile(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Publish New Christian Post
  const handlePublishPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postContent.trim()) return;

    setIsPublishing(true);

    setTimeout(() => {
      const newPost: ChristianPost = {
        id: `post-${Date.now()}`,
        author: profile,
        title: postTitle.trim() || undefined,
        content: postContent,
        category: postCategory,
        verse_reference: postVerse.trim() || undefined,
        image_url: postImageFile || undefined,
        visibility: 'publico',
        moderation_status: 'publicado',
        likes_count: 0,
        comments_count: 0,
        user_liked: false,
        created_at: 'Agora mesmo'
      };

      setPosts([newPost, ...posts]);
      setPostTitle('');
      setPostContent('');
      setPostVerse('');
      setPostImageFile(null);
      setIsPublishing(false);
      setSuccessNotice('Sua publicação com imagem foi compartilhada com sucesso no feed cristão!');
      setActiveTab('feed');

      setTimeout(() => setSuccessNotice(null), 5000);
    }, 400);
  };

  // Toggle Like
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

  // Toggle Bookmark
  const handleToggleBookmark = (postId: string) => {
    if (bookmarkedIds.includes(postId)) {
      setBookmarkedIds(bookmarkedIds.filter(id => id !== postId));
    } else {
      setBookmarkedIds([...bookmarkedIds, postId]);
    }
  };

  // Add Comment
  const handleAddComment = (postId: string) => {
    const text = commentInputs[postId];
    if (!text || !text.trim()) return;

    const newCmt = {
      id: `c-${Date.now()}`,
      author: profile,
      content: text.trim(),
      created_at: 'Agora'
    };

    setPostComments(prev => ({
      ...prev,
      [postId]: [...(prev[postId] || []), newCmt]
    }));

    setPosts(prev =>
      prev.map(p => (p.id === postId ? { ...p, comments_count: p.comments_count + 1 } : p))
    );

    setCommentInputs({ ...commentInputs, [postId]: '' });
  };

  // Create Community with AUTO-REDIRECT
  const handleCreateCommunity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommName.trim()) return;

    const code = `eclesia-${newCommName.toLowerCase().replace(/\s+/g, '-')}-${Math.floor(100 + Math.random() * 900)}`;

    const newComm: Community = {
      id: `comm-${Date.now()}`,
      name: newCommName,
      slug: newCommName.toLowerCase().replace(/\s+/g, '-'),
      description: newCommDesc,
      cover_image: newCommCover,
      created_by: profile.id,
      is_public: newCommIsPublic,
      approval_status: 'aprovado',
      linked_parish: newCommParish || undefined,
      patron_saint: newCommSaint || 'Nossa Senhora',
      invite_code: code,
      member_count: 1,
      is_member: true,
      category: newCommCat,
      prayer_plans: [
        {
          id: `plan-${Date.now()}`,
          title: 'Plano de Oração Inicial da Comunidade',
          description: 'Momento diário de preces comunitárias.',
          prayer_text: 'Senhor, abençoai esta comunidade e todos os seus membros.',
          created_by: profile.name,
          created_at: 'Hoje'
        }
      ]
    };

    setCommunities([newComm, ...communities]);
    setShowNewCommModal(false);
    setNewCommName('');
    setNewCommDesc('');
    setNewCommParish('');
    setNewCommSaint('');

    // AUTO-REDIRECT TO CREATED COMMUNITY
    setSelectedCommunity(newComm);
    setCommSubTab('chat');
    setEditCommName(newComm.name);
    setEditCommDesc(newComm.description);
    setEditCommParish(newComm.linked_parish || '');
    setEditCommSaint(newComm.patron_saint || '');
    setEditCommIsPublic(newComm.is_public);

    setSuccessNotice(`Comunidade "${newComm.name}" criada com sucesso! Você foi redirecionado para dentro dela.`);
    setTimeout(() => setSuccessNotice(null), 5000);
  };

  // Join/Leave Community
  const handleToggleJoinComm = (commId: string) => {
    setCommunities(prev =>
      prev.map(c => {
        if (c.id === commId) {
          const isM = !c.is_member;
          const updated = {
            ...c,
            is_member: isM,
            member_count: isM ? c.member_count + 1 : c.member_count - 1
          };
          if (selectedCommunity?.id === commId) setSelectedCommunity(updated);
          return updated;
        }
        return c;
      })
    );
  };

  // Send Chat Message inside community
  const handleSendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !selectedCommunity) return;

    const newMsg = {
      id: `m-${Date.now()}`,
      sender: profile,
      text: chatInput.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setCommunityChats(prev => ({
      ...prev,
      [selectedCommunity.id]: [...(prev[selectedCommunity.id] || []), newMsg]
    }));

    setChatInput('');
  };

  // Add Prayer Plan to Community
  const handleAddPrayerPlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlanTitle.trim() || !selectedCommunity) return;

    const newPlan: CommunityPrayerPlan = {
      id: `plan-${Date.now()}`,
      title: newPlanTitle,
      description: newPlanDesc,
      prayer_text: newPlanText || undefined,
      created_by: profile.name,
      created_at: 'Hoje'
    };

    const updatedComm = {
      ...selectedCommunity,
      prayer_plans: [...(selectedCommunity.prayer_plans || []), newPlan]
    };

    setSelectedCommunity(updatedComm);
    setCommunities(prev => prev.map(c => c.id === updatedComm.id ? updatedComm : c));
    setShowNewPlanModal(false);
    setNewPlanTitle('');
    setNewPlanDesc('');
    setNewPlanText('');
    setSuccessNotice('Novo plano de oração adicionado à comunidade!');
    setTimeout(() => setSuccessNotice(null), 4000);
  };

  // Add Community Task
  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !selectedCommunity) return;

    const newTask: CommunityTask = {
      id: `task-${Date.now()}`,
      title: newTaskTitle.trim(),
      type: newTaskType,
      date_time: newTaskDate.trim() || 'A definir',
      completed: false,
      created_by: profile.name
    };

    setCommunityTasks(prev => ({
      ...prev,
      [selectedCommunity.id]: [newTask, ...(prev[selectedCommunity.id] || [])]
    }));

    setShowNewTaskModal(false);
    setNewTaskTitle('');
    setNewTaskDate('');
    setSuccessNotice('Nova tarefa/evento adicionado à agenda da comunidade!');
    setTimeout(() => setSuccessNotice(null), 4000);
  };

  // Toggle Task Completion
  const handleToggleTask = (taskId: string) => {
    if (!selectedCommunity) return;
    setCommunityTasks(prev => ({
      ...prev,
      [selectedCommunity.id]: (prev[selectedCommunity.id] || []).map(t =>
        t.id === taskId ? { ...t, completed: !t.completed } : t
      )
    }));
  };

  // Quick Post inside Community
  const handlePublishCommPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commPostText.trim() || !selectedCommunity) return;

    const newPost: ChristianPost = {
      id: `post-${Date.now()}`,
      author: profile,
      content: commPostText,
      community_id: selectedCommunity.id,
      community_name: selectedCommunity.name,
      category: 'reflexao',
      visibility: selectedCommunity.is_public ? 'publico' : 'comunidade',
      moderation_status: 'publicado',
      likes_count: 0,
      comments_count: 0,
      user_liked: false,
      created_at: 'Agora'
    };

    setPosts([newPost, ...posts]);
    setCommPostText('');
    setSuccessNotice('Publicação compartilhada com a comunidade!');
    setTimeout(() => setSuccessNotice(null), 4000);
  };

  // Save Community Settings
  const handleSaveCommunityConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCommunity) return;

    const updatedComm: Community = {
      ...selectedCommunity,
      name: editCommName,
      description: editCommDesc,
      linked_parish: editCommParish || undefined,
      patron_saint: editCommSaint || undefined,
      is_public: editCommIsPublic
    };

    setSelectedCommunity(updatedComm);
    setCommunities(prev => prev.map(c => c.id === updatedComm.id ? updatedComm : c));
    setSuccessNotice('Informações da comunidade atualizadas!');
    setTimeout(() => setSuccessNotice(null), 4000);
  };

  // Delete Community
  const handleDeleteCommunity = () => {
    if (!selectedCommunity) return;
    if (confirm(`Tem certeza que deseja apagar a comunidade "${selectedCommunity.name}"? Esta ação não pode ser desfeita.`)) {
      setCommunities(prev => prev.filter(c => c.id !== selectedCommunity.id));
      setSelectedCommunity(null);
      setSuccessNotice('Comunidade apagada com sucesso.');
      setTimeout(() => setSuccessNotice(null), 4000);
    }
  };

  // Join private community by invite code
  const handleJoinByCode = (e: React.FormEvent) => {
    e.preventDefault();
    const code = inviteCodeInput.trim().toLowerCase();
    const found = communities.find(c => c.invite_code?.toLowerCase() === code || c.slug === code);
    if (found) {
      if (!found.is_member) handleToggleJoinComm(found.id);
      setSelectedCommunity(found);
      setCommSubTab('chat');
      setInviteCodeInput('');
    } else {
      alert('Código de convite não encontrado. Verifique o link fornecido pelo líder da comunidade.');
    }
  };

  // Copy Community Invite Link
  const handleCopyInviteLink = (comm: Community) => {
    const link = `${window.location.origin}/#comunidade=${comm.invite_code || comm.slug}`;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  // Filtered posts for feed
  const filteredPosts = posts.filter(p => {
    if (selectedCategoryFilter === 'todos') return true;
    if (selectedCategoryFilter === 'salvos') return bookmarkedIds.includes(p.id);
    return p.category === selectedCategoryFilter;
  });

  // User's own posts
  const myPosts = posts.filter(p => p.author.id === profile.id);

  // Communities filtered by view
  const visibleCommunities = communities.filter(c => {
    if (commViewFilter === 'minhas') return c.is_member;
    return c.is_public; // Only public in public directory!
  });

  // =========================================================================
  // VIEW: COMMUNITY DETAIL HUB WITH SUB-PAGES / TABS
  // =========================================================================
  if (selectedCommunity) {
    const commMsgs = communityChats[selectedCommunity.id] || [];
    const commTasks = communityTasks[selectedCommunity.id] || [];
    const commPosts = posts.filter(p => p.community_id === selectedCommunity.id);
    const isOwner = selectedCommunity.created_by === profile.id || profile.role === 'admin';

    return (
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8 animate-fade-in pb-24">
        {/* Back Button */}
        <button
          onClick={() => setSelectedCommunity(null)}
          className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#785600] hover:underline cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar para Todas as Comunidades
        </button>

        {/* Community Header Banner */}
        <div className="bg-white border border-[#d3c4af]/80 rounded-3xl overflow-hidden shadow-md">
          <div className="h-48 sm:h-64 bg-gray-200 relative">
            <img
              src={selectedCommunity.cover_image}
              alt={selectedCommunity.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
            
            <div className="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 text-white">
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 bg-[#f7bd48] text-[#1c1b1b] text-[10px] font-bold uppercase tracking-widest rounded-full">
                    {selectedCommunity.category}
                  </span>
                  <span className={`px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full flex items-center gap-1 ${
                    selectedCommunity.is_public ? 'bg-emerald-600 text-white' : 'bg-amber-600 text-white'
                  }`}>
                    {selectedCommunity.is_public ? <><Globe className="w-3 h-3" /> Pública</> : <><LockIcon className="w-3 h-3" /> Privada (Por Convite)</>}
                  </span>
                  {selectedCommunity.patron_saint && (
                    <span className="px-2.5 py-0.5 bg-white/20 backdrop-blur-xs text-white text-[10px] font-semibold rounded-full">
                      🕊️ Devoção: {selectedCommunity.patron_saint}
                    </span>
                  )}
                </div>

                <h1 className="font-display text-2xl sm:text-4xl font-bold tracking-tight">
                  {selectedCommunity.name}
                </h1>

                {selectedCommunity.linked_parish && (
                  <p className="font-sans text-xs text-amber-200 flex items-center gap-1">
                    <Church className="w-3.5 h-3.5" /> {selectedCommunity.linked_parish}
                  </p>
                )}
              </div>

              {/* Actions: Join & Share */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopyInviteLink(selectedCommunity)}
                  className="px-4 py-2.5 bg-white/20 hover:bg-white/30 backdrop-blur-xs text-white text-xs font-bold uppercase rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                  title="Copiar link de convite"
                >
                  {copiedLink ? <><Check className="w-4 h-4 text-emerald-400" /> Link Copiado!</> : <><Share2 className="w-4 h-4" /> Convidar Irmãos</>}
                </button>

                <button
                  onClick={() => handleToggleJoinComm(selectedCommunity.id)}
                  className={`px-6 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-md ${
                    selectedCommunity.is_member
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      : 'bg-[#f7bd48] hover:bg-[#ffcd66] text-[#1c1b1b]'
                  }`}
                >
                  {selectedCommunity.is_member ? '✓ Participando' : '+ Participar do Grupo'}
                </button>
              </div>
            </div>
          </div>

          {/* Sub-Navigation Bar inside Community */}
          <div className="px-6 py-3 bg-[#fcf9f8] flex flex-wrap items-center justify-between gap-3 border-t border-[#d3c4af]/40">
            <nav className="flex flex-wrap gap-1.5">
              {[
                { id: 'chat', label: 'Chat da Comunidade', icon: MessageSquare },
                { id: 'oracoes', label: `Planos de Oração (${selectedCommunity.prayer_plans?.length || 0})`, icon: Heart },
                { id: 'agenda', label: `Agenda & Tarefas (${commTasks.length})`, icon: Calendar },
                { id: 'posts', label: `Mural de Partilhas (${commPosts.length})`, icon: BookOpen },
                { id: 'membros', label: `Participantes (${selectedCommunity.member_count})`, icon: Users },
                ...(isOwner ? [{ id: 'config', label: 'Configurações', icon: Settings }] : [])
              ].map(tab => {
                const Icon = tab.icon;
                const active = commSubTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setCommSubTab(tab.id as any);
                      if (tab.id === 'config') {
                        setEditCommName(selectedCommunity.name);
                        setEditCommDesc(selectedCommunity.description);
                        setEditCommParish(selectedCommunity.linked_parish || '');
                        setEditCommSaint(selectedCommunity.patron_saint || '');
                        setEditCommIsPublic(selectedCommunity.is_public);
                      }
                    }}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
                      active
                        ? 'bg-[#785600] text-white shadow-xs'
                        : 'bg-white border border-[#d3c4af]/60 text-[#4f4535] hover:border-[#785600]'
                    }`}
                  >
                    <Icon className="w-4 h-4" /> {tab.label}
                  </button>
                );
              })}
            </nav>

            <span className="text-[11px] text-[#817563] font-mono">
              Código: <strong>{selectedCommunity.invite_code}</strong>
            </span>
          </div>
        </div>

        {/* Global Notice */}
        {successNotice && (
          <div className="bg-[#1c5d3a]/10 border border-[#1c5d3a]/30 text-[#1c5d3a] px-4 py-3 rounded-xl text-xs font-sans font-semibold flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-[#1c5d3a]" />
            <span>{successNotice}</span>
          </div>
        )}

        {/* =========================================================================
            SUB-PAGE 1: CHAT AO VIVO
        ========================================================================= */}
        {commSubTab === 'chat' && (
          <div className="bg-white rounded-3xl border border-[#d3c4af]/80 p-6 shadow-sm space-y-4 flex flex-col h-[600px]">
            <div className="flex items-center justify-between border-b border-[#d3c4af]/40 pb-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-[#785600]" />
                <h3 className="font-display text-lg font-bold text-[#1c1b1b]">Chat Fraterno ao Vivo</h3>
              </div>
              <span className="text-[11px] font-semibold text-[#1c5d3a] bg-emerald-50 px-2.5 py-0.5 rounded-full">
                {selectedCommunity.member_count} fiéis conectados
              </span>
            </div>

            {/* Chat Messages Stream */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-2">
              {commMsgs.length === 0 ? (
                <div className="text-center py-20 text-[#817563] space-y-2">
                  <MessageCircle className="w-12 h-12 text-[#d3c4af] mx-auto" />
                  <p className="text-xs">Nenhuma mensagem ainda no chat deste grupo.</p>
                  <p className="text-[11px]">Envie uma saudação de paz para começar!</p>
                </div>
              ) : (
                commMsgs.map((msg) => {
                  const isMe = msg.sender.id === profile.id;
                  return (
                    <div key={msg.id} className={`flex items-start gap-2.5 ${isMe ? 'flex-row-reverse' : ''}`}>
                      <img
                        src={msg.sender.avatar}
                        alt={msg.sender.name}
                        className="w-8 h-8 rounded-full object-cover border border-[#d3c4af] shrink-0 mt-1 bg-white"
                      />
                      <div className={`max-w-[78%] p-3.5 rounded-2xl space-y-0.5 text-xs ${
                        isMe
                          ? 'bg-[#785600] text-white rounded-tr-xs shadow-xs'
                          : 'bg-[#f6f3f2] text-[#1c1b1b] rounded-tl-xs border border-[#d3c4af]/40'
                      }`}>
                        <div className={`flex items-center gap-2 text-[10px] font-bold ${isMe ? 'text-amber-200' : 'text-[#785600]'}`}>
                          <span>{msg.sender.name}</span>
                          <span className={`font-normal ${isMe ? 'text-white/70' : 'text-[#817563]'}`}>{msg.time}</span>
                        </div>
                        <p className="leading-relaxed whitespace-pre-line">{msg.text}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Chat Input */}
            <form onSubmit={handleSendChatMessage} className="pt-3 border-t border-[#d3c4af]/30 flex items-center gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder={selectedCommunity.is_member ? "Envie uma mensagem ou intenção de oração..." : "Participe do grupo para conversar no chat..."}
                disabled={!selectedCommunity.is_member}
                className="flex-1 px-4 py-3 bg-[#fcf9f8] border border-[#d3c4af] rounded-2xl font-sans text-xs text-[#1c1b1b] focus:border-[#785600] focus:ring-0 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!selectedCommunity.is_member || !chatInput.trim()}
                className="px-6 py-3 bg-[#785600] hover:bg-[#9a7000] text-white font-bold text-xs rounded-2xl transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5 shadow-sm"
              >
                <Send className="w-4 h-4" /> Enviar
              </button>
            </form>
          </div>
        )}

        {/* =========================================================================
            SUB-PAGE 2: PLANOS DE ORAÇÃO & INTENÇÕES
        ========================================================================= */}
        {commSubTab === 'oracoes' && (
          <div className="bg-white rounded-3xl border border-[#d3c4af]/80 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#d3c4af]/40 pb-4">
              <div>
                <h3 className="font-display text-xl font-bold text-[#1c1b1b]">Planos & Projetos de Oração Compartilhada</h3>
                <p className="font-sans text-xs text-[#817563]">Novenas, terços e correntes de oração unindo os membros.</p>
              </div>

              {selectedCommunity.is_member && (
                <button
                  onClick={() => setShowNewPlanModal(true)}
                  className="px-4 py-2.5 bg-[#785600] hover:bg-[#9a7000] text-white font-sans text-xs font-bold uppercase tracking-wider rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Plus className="w-4 h-4" /> Novo Plano de Oração
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {(!selectedCommunity.prayer_plans || selectedCommunity.prayer_plans.length === 0) ? (
                <div className="col-span-2 text-center py-16 text-[#817563] space-y-2">
                  <Heart className="w-12 h-12 text-[#d3c4af] mx-auto" />
                  <p className="text-xs">Nenhum plano de oração cadastrado ainda.</p>
                </div>
              ) : (
                selectedCommunity.prayer_plans.map((plan) => (
                  <div key={plan.id} className="p-6 bg-[#fcf9f8] border border-[#d3c4af]/60 rounded-3xl space-y-3 shadow-xs">
                    <div className="flex items-start justify-between">
                      <h4 className="font-display text-base font-bold text-[#1c1b1b]">{plan.title}</h4>
                      <span className="text-[10px] text-[#785600] font-bold uppercase bg-amber-100 px-2.5 py-0.5 rounded-full">
                        Em Oração
                      </span>
                    </div>
                    <p className="font-sans text-xs text-[#4f4535] leading-relaxed">{plan.description}</p>
                    {plan.prayer_text && (
                      <blockquote className="text-xs font-sans italic text-[#785600] bg-white p-3.5 rounded-2xl border border-[#d3c4af]/40 border-l-4 border-l-[#785600] leading-relaxed">
                        "{plan.prayer_text}"
                      </blockquote>
                    )}
                    <div className="text-[10px] text-[#817563] pt-2 border-t border-[#d3c4af]/30 flex justify-between">
                      <span>Proposto por: <strong>{plan.created_by}</strong></span>
                      <span>{plan.created_at}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* =========================================================================
            SUB-PAGE 3: TAREFAS DIÁRIAS & AGENDA CATÓLICA
        ========================================================================= */}
        {commSubTab === 'agenda' && (
          <div className="bg-white rounded-3xl border border-[#d3c4af]/80 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#d3c4af]/40 pb-4">
              <div>
                <h3 className="font-display text-xl font-bold text-[#1c1b1b]">Tarefas Diárias & Agenda Católica</h3>
                <p className="font-sans text-xs text-[#817563]">Acompanhe compromissos de fé: confissão, terços, vigílias e missas.</p>
              </div>

              {selectedCommunity.is_member && (
                <button
                  onClick={() => setShowNewTaskModal(true)}
                  className="px-4 py-2.5 bg-[#785600] hover:bg-[#9a7000] text-white font-sans text-xs font-bold uppercase tracking-wider rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Plus className="w-4 h-4" /> Marcar na Agenda
                </button>
              )}
            </div>

            <div className="space-y-3">
              {commTasks.length === 0 ? (
                <div className="text-center py-16 text-[#817563] space-y-2">
                  <Calendar className="w-12 h-12 text-[#d3c4af] mx-auto" />
                  <p className="text-xs">Nenhum evento ou tarefa agendada.</p>
                </div>
              ) : (
                commTasks.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => handleToggleTask(t.id)}
                    className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 cursor-pointer ${
                      t.completed
                        ? 'bg-emerald-50/60 border-emerald-200 opacity-75'
                        : 'bg-[#fcf9f8] border-[#d3c4af]/60 hover:border-[#785600]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {t.completed ? (
                        <CheckSquare className="w-5 h-5 text-emerald-600 shrink-0" />
                      ) : (
                        <Square className="w-5 h-5 text-[#817563] shrink-0" />
                      )}
                      <div>
                        <h4 className={`font-sans text-xs sm:text-sm font-bold ${t.completed ? 'line-through text-gray-500' : 'text-[#1c1b1b]'}`}>
                          {t.title}
                        </h4>
                        <span className="text-[11px] text-[#817563] flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3 text-[#785600]" /> {t.date_time} • {t.type.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full ${
                      t.completed ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {t.completed ? 'Concluído' : 'Pendente'}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* =========================================================================
            SUB-PAGE 4: MURAL DE PUBLICAÇÕES DA COMUNIDADE
        ========================================================================= */}
        {commSubTab === 'posts' && (
          <div className="bg-white rounded-3xl border border-[#d3c4af]/80 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="border-b border-[#d3c4af]/40 pb-4">
              <h3 className="font-display text-xl font-bold text-[#1c1b1b]">Mural de Partilhas do Grupo</h3>
              <p className="font-sans text-xs text-[#817563]">Reflexões teológicas e testemunhos publicados pelos membros.</p>
            </div>

            {/* Quick Composer for community */}
            {selectedCommunity.is_member && (
              <form onSubmit={handlePublishCommPost} className="bg-[#fcf9f8] p-4 rounded-2xl border border-[#d3c4af]/60 space-y-3">
                <textarea
                  rows={3}
                  required
                  value={commPostText}
                  onChange={(e) => setCommPostText(e.target.value)}
                  placeholder={`Compartilhe uma reflexão ou pensamento bíblico com o grupo ${selectedCommunity.name}...`}
                  className="w-full p-3 bg-white border border-[#d3c4af] rounded-xl text-xs resize-none"
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#785600] text-white font-bold text-xs uppercase rounded-xl hover:bg-[#9a7000] cursor-pointer shadow-xs flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" /> Publicar no Grupo
                  </button>
                </div>
              </form>
            )}

            {/* Posts list */}
            <div className="space-y-4">
              {commPosts.length === 0 ? (
                <p className="text-center text-xs text-[#817563] py-12">Nenhuma reflexão compartilhada exclusivamente neste grupo ainda.</p>
              ) : (
                commPosts.map(p => (
                  <article key={p.id} className="p-5 bg-[#fcf9f8] rounded-2xl border border-[#d3c4af]/50 space-y-2">
                    <div className="flex items-center gap-3">
                      <img src={p.author.avatar} alt={p.author.name} className="w-8 h-8 rounded-full object-cover" />
                      <div>
                        <h4 className="font-sans text-xs font-bold text-[#1c1b1b]">{p.author.name}</h4>
                        <span className="text-[10px] text-[#817563]">{p.created_at}</span>
                      </div>
                    </div>
                    <p className="font-sans text-xs text-[#1c1b1b] leading-relaxed whitespace-pre-line">{p.content}</p>
                  </article>
                ))
              )}
            </div>
          </div>
        )}

        {/* =========================================================================
            SUB-PAGE 5: PARTICIPANTES
        ========================================================================= */}
        {commSubTab === 'membros' && (
          <div className="bg-white rounded-3xl border border-[#d3c4af]/80 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex justify-between items-center border-b border-[#d3c4af]/40 pb-4">
              <div>
                <h3 className="font-display text-xl font-bold text-[#1c1b1b]">Membros da Comunidade</h3>
                <p className="font-sans text-xs text-[#817563]">{selectedCommunity.member_count} irmãos em comunhão fraterna.</p>
              </div>

              <button
                onClick={() => handleCopyInviteLink(selectedCommunity)}
                className="px-4 py-2 bg-[#785600] text-white text-xs font-bold uppercase rounded-xl hover:bg-[#9a7000] cursor-pointer flex items-center gap-1.5"
              >
                <Share2 className="w-3.5 h-3.5" /> Convidar Mais Irmãos
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div className="p-4 bg-[#fcf9f8] rounded-2xl border border-[#d3c4af]/60 flex items-center gap-3">
                <img src={profile.avatar} alt={profile.name} className="w-10 h-10 rounded-full object-cover border border-[#785600]" />
                <div>
                  <h4 className="font-sans text-xs font-bold text-[#1c1b1b]">{profile.name} (Você)</h4>
                  <span className="text-[10px] text-[#785600] font-semibold">{isOwner ? '👑 Fundador / Líder' : 'Membro Ativo'}</span>
                </div>
              </div>

              <div className="p-4 bg-[#fcf9f8] rounded-2xl border border-[#d3c4af]/60 flex items-center gap-3">
                <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200" alt="Pe. Mateus" className="w-10 h-10 rounded-full object-cover" />
                <div>
                  <h4 className="font-sans text-xs font-bold text-[#1c1b1b]">Pe. Mateus Silva</h4>
                  <span className="text-[10px] text-[#1c5d3a] font-semibold">Orientador Espiritual</span>
                </div>
              </div>

              <div className="p-4 bg-[#fcf9f8] rounded-2xl border border-[#d3c4af]/60 flex items-center gap-3">
                <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200" alt="Mariana" className="w-10 h-10 rounded-full object-cover" />
                <div>
                  <h4 className="font-sans text-xs font-bold text-[#1c1b1b]">Mariana Costa</h4>
                  <span className="text-[10px] text-[#785600] font-semibold">Coordenadora de Oração</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            SUB-PAGE 6: CONFIGURAÇÕES DA COMUNIDADE (APAGAR / EDITAR)
        ========================================================================= */}
        {commSubTab === 'config' && isOwner && (
          <div className="bg-white rounded-3xl border border-[#d3c4af]/80 p-6 sm:p-8 shadow-sm space-y-8">
            <div className="border-b border-[#d3c4af]/40 pb-4">
              <h3 className="font-display text-xl font-bold text-[#1c1b1b]">Configurações da Comunidade</h3>
              <p className="font-sans text-xs text-[#817563]">Gerencie informações, privacidade ou apague a comunidade.</p>
            </div>

            {/* Edit Form */}
            <form onSubmit={handleSaveCommunityConfig} className="space-y-4 max-w-2xl">
              <div>
                <label className="block text-xs font-bold uppercase mb-1">Nome do Grupo</label>
                <input
                  type="text"
                  required
                  value={editCommName}
                  onChange={(e) => setEditCommName(e.target.value)}
                  className="w-full px-3 py-2 border border-[#d3c4af] rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase mb-1">Descrição</label>
                <textarea
                  rows={3}
                  required
                  value={editCommDesc}
                  onChange={(e) => setEditCommDesc(e.target.value)}
                  className="w-full p-3 border border-[#d3c4af] rounded-xl text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase mb-1">Paróquia / Local</label>
                  <input
                    type="text"
                    value={editCommParish}
                    onChange={(e) => setEditCommParish(e.target.value)}
                    className="w-full px-3 py-2 border border-[#d3c4af] rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase mb-1">Santo de Devoção</label>
                  <input
                    type="text"
                    value={editCommSaint}
                    onChange={(e) => setEditCommSaint(e.target.value)}
                    className="w-full px-3 py-2 border border-[#d3c4af] rounded-xl text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase mb-1">Visibilidade</label>
                <select
                  value={editCommIsPublic ? 'publica' : 'privada'}
                  onChange={(e) => setEditCommIsPublic(e.target.value === 'publica')}
                  className="w-full p-2 border border-[#d3c4af] rounded-xl text-xs"
                >
                  <option value="publica">Pública (Listada no feed de comunidades)</option>
                  <option value="privada">Privada (Apenas pessoas com código de convite)</option>
                </select>
              </div>

              <button
                type="submit"
                className="px-6 py-2.5 bg-[#785600] hover:bg-[#9a7000] text-white font-bold text-xs uppercase rounded-xl shadow-xs cursor-pointer"
              >
                Salvar Alterações
              </button>
            </form>

            {/* Danger Zone: Delete Community */}
            <div className="pt-6 border-t border-red-200 space-y-3">
              <h4 className="font-display text-base font-bold text-red-600">Zona de Perigo</h4>
              <p className="font-sans text-xs text-[#817563]">
                Ao apagar a comunidade, todas as mensagens, orações e tarefas associadas a ela serão removidas permanentemente.
              </p>
              <button
                type="button"
                onClick={handleDeleteCommunity}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" /> Apagar Comunidade Permanentemente
              </button>
            </div>
          </div>
        )}

        {/* Modal: New Prayer Plan */}
        {showNewPlanModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="bg-white rounded-3xl border border-[#d3c4af] p-6 max-w-md w-full space-y-4 shadow-2xl">
              <div className="flex justify-between items-center border-b pb-3">
                <h3 className="font-display text-lg font-bold text-[#1c1b1b]">Novo Tema de Oração</h3>
                <button onClick={() => setShowNewPlanModal(false)} className="p-1 hover:bg-gray-100 rounded-full cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddPrayerPlan} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold uppercase mb-1">Título do Projeto *</label>
                  <input
                    type="text"
                    required
                    value={newPlanTitle}
                    onChange={(e) => setNewPlanTitle(e.target.value)}
                    placeholder="Ex: Cerco de Jericó pelas Famílias"
                    className="w-full px-3 py-2 border border-[#d3c4af] rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase mb-1">Descrição e Horário *</label>
                  <textarea
                    rows={2}
                    required
                    value={newPlanDesc}
                    onChange={(e) => setNewPlanDesc(e.target.value)}
                    placeholder="Objetivo da oração e horário de encontro espiritual..."
                    className="w-full p-3 border border-[#d3c4af] rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase mb-1">Texto da Oração (Opcional)</label>
                  <textarea
                    rows={3}
                    value={newPlanText}
                    onChange={(e) => setNewPlanText(e.target.value)}
                    placeholder="Oração específica a ser recitada pelos membros..."
                    className="w-full p-3 border border-[#d3c4af] rounded-xl text-xs"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowNewPlanModal(false)}
                    className="px-4 py-2 border rounded-xl text-xs font-bold"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#785600] text-white rounded-xl text-xs font-bold shadow-sm"
                  >
                    Adicionar Oração
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: New Task / Agenda */}
        {showNewTaskModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="bg-white rounded-3xl border border-[#d3c4af] p-6 max-w-md w-full space-y-4 shadow-2xl">
              <div className="flex justify-between items-center border-b pb-3">
                <h3 className="font-display text-lg font-bold text-[#1c1b1b]">Agendar Tarefa ou Evento Católico</h3>
                <button onClick={() => setShowNewTaskModal(false)} className="p-1 hover:bg-gray-100 rounded-full cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddTask} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold uppercase mb-1">Título do Evento / Tarefa *</label>
                  <input
                    type="text"
                    required
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    placeholder="Ex: Confissão Paroquial / Terço dos Homens"
                    className="w-full px-3 py-2 border border-[#d3c4af] rounded-xl text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase mb-1">Tipo</label>
                    <select
                      value={newTaskType}
                      onChange={(e) => setNewTaskType(e.target.value as any)}
                      className="w-full p-2 border border-[#d3c4af] rounded-xl text-xs"
                    >
                      <option value="confissao">Confissão</option>
                      <option value="missa">Santa Missa</option>
                      <option value="terco">Santo Terço</option>
                      <option value="evento">Evento / Encontro</option>
                      <option value="outro">Outro</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase mb-1">Data / Horário</label>
                    <input
                      type="text"
                      value={newTaskDate}
                      onChange={(e) => setNewTaskDate(e.target.value)}
                      placeholder="Ex: Sábado às 16:00"
                      className="w-full px-3 py-2 border border-[#d3c4af] rounded-xl text-xs"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowNewTaskModal(false)}
                    className="px-4 py-2 border rounded-xl text-xs font-bold"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#785600] text-white rounded-xl text-xs font-bold shadow-sm"
                  >
                    Salvar na Agenda
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // =========================================================================
  // VIEW: MAIN SOCIAL / COMMUNITY TABS
  // =========================================================================
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-24 space-y-8">
      {/* Top Banner: User Writer Identity */}
      <div className="bg-gradient-to-r from-[#1c1b1b] via-[#2d2516] to-[#785600] text-white rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4 relative z-10">
          <img
            src={profile.avatar}
            alt={profile.name}
            className="w-16 h-16 rounded-full object-cover border-2 border-[#f7bd48] shadow-md shrink-0 bg-white"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 bg-[#f7bd48] text-[#1c1b1b] text-[10px] font-bold uppercase tracking-widest rounded-full flex items-center gap-1">
                <Feather className="w-3 h-3" /> {profile.role === 'admin' ? 'Administrador Geral' : 'Escritor Cristão'}
              </span>
              <span className="text-amber-200 text-xs font-semibold">{profile.handle}</span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold mt-1">
              Paz e Bem, {profile.name}!
            </h1>
            <p className="font-sans text-xs sm:text-sm text-amber-100/90 mt-1 max-w-xl">
              Este é o seu espaço para compartilhar sentimentos de fé, reflexões teológicas e orações fraternas.
            </p>
          </div>
        </div>

        <button
          onClick={() => setActiveTab('escrever')}
          className="px-5 py-3 bg-[#f7bd48] hover:bg-[#ffcd66] text-[#1c1b1b] font-sans text-xs font-bold uppercase tracking-wider rounded-2xl shadow-md transition-all flex items-center gap-2 shrink-0 cursor-pointer relative z-10"
        >
          <PenTool className="w-4 h-4" /> Escrever Nova Reflexão
        </button>
      </div>

      {/* Global Success Notification */}
      {successNotice && (
        <div className="bg-[#1c5d3a]/10 border border-[#1c5d3a]/30 text-[#1c5d3a] px-4 py-3 rounded-xl text-xs font-sans font-semibold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-[#1c5d3a]" />
          <span>{successNotice}</span>
        </div>
      )}

      {/* Main Navigation Sub-Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-[#d3c4af]/50 pb-2">
        <button
          onClick={() => setActiveTab('feed')}
          className={`flex items-center gap-2 px-4 py-2.5 font-sans text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
            activeTab === 'feed'
              ? 'bg-[#785600] text-white shadow-xs'
              : 'bg-white border border-[#d3c4af]/60 text-[#4f4535] hover:border-[#785600]'
          }`}
        >
          <BookOpen className="w-4 h-4" /> Feed de Reflexões ({posts.length})
        </button>

        <button
          onClick={() => setActiveTab('escrever')}
          className={`flex items-center gap-2 px-4 py-2.5 font-sans text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
            activeTab === 'escrever'
              ? 'bg-[#785600] text-white shadow-xs'
              : 'bg-white border border-[#d3c4af]/60 text-[#4f4535] hover:border-[#785600]'
          }`}
        >
          <PenTool className="w-4 h-4" /> Escrever Publicação
        </button>

        <button
          onClick={() => setActiveTab('meus-escritos')}
          className={`flex items-center gap-2 px-4 py-2.5 font-sans text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
            activeTab === 'meus-escritos'
              ? 'bg-[#785600] text-white shadow-xs'
              : 'bg-white border border-[#d3c4af]/60 text-[#4f4535] hover:border-[#785600]'
          }`}
        >
          <Feather className="w-4 h-4" /> Meus Escritos ({myPosts.length})
        </button>

        <button
          onClick={() => setActiveTab('comunidades')}
          className={`flex items-center gap-2 px-4 py-2.5 font-sans text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
            activeTab === 'comunidades'
              ? 'bg-[#785600] text-white shadow-xs'
              : 'bg-white border border-[#d3c4af]/60 text-[#4f4535] hover:border-[#785600]'
          }`}
        >
          <Users className="w-4 h-4" /> Comunidades & Círculos ({communities.length})
        </button>
      </div>

      {/* ================= TAB 1: FEED DE REFLEXÕES ================= */}
      {activeTab === 'feed' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 space-y-6">
            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center gap-2 bg-white p-3 rounded-2xl border border-[#d3c4af]/60">
              <span className="text-[11px] font-bold text-[#817563] uppercase tracking-wider px-2">Filtrar:</span>
              <button
                onClick={() => setSelectedCategoryFilter('todos')}
                className={`px-3 py-1 font-sans text-xs font-semibold rounded-full transition-all cursor-pointer ${
                  selectedCategoryFilter === 'todos'
                    ? 'bg-[#1c1b1b] text-white'
                    : 'bg-[#f6f3f2] text-[#4f4535] hover:bg-[#e8e4e2]'
                }`}
              >
                Todos
              </button>
              {(Object.keys(categoryLabels) as PostCategory[]).map(catKey => (
                <button
                  key={catKey}
                  onClick={() => setSelectedCategoryFilter(catKey)}
                  className={`px-3 py-1 font-sans text-xs font-semibold rounded-full transition-all cursor-pointer ${
                    selectedCategoryFilter === catKey
                      ? 'bg-[#785600] text-white'
                      : 'bg-[#f6f3f2] text-[#4f4535] hover:bg-[#e8e4e2]'
                  }`}
                >
                  {categoryLabels[catKey].label}
                </button>
              ))}
              <button
                onClick={() => setSelectedCategoryFilter('salvos')}
                className={`px-3 py-1 font-sans text-xs font-semibold rounded-full transition-all cursor-pointer flex items-center gap-1 ${
                  selectedCategoryFilter === 'salvos'
                    ? 'bg-[#785600] text-white'
                    : 'bg-[#f6f3f2] text-[#4f4535] hover:bg-[#e8e4e2]'
                }`}
              >
                <Bookmark className="w-3 h-3" /> Salvos ({bookmarkedIds.length})
              </button>
            </div>

            {/* Stream of Posts */}
            {filteredPosts.length === 0 ? (
              <div className="bg-white p-8 rounded-2xl border border-[#d3c4af]/60 text-center space-y-3">
                <BookOpen className="w-10 h-10 text-[#d3c4af] mx-auto" />
                <h3 className="font-display text-lg font-bold text-[#1c1b1b]">Nenhuma publicação encontrada nessa categoria</h3>
                <p className="font-sans text-xs text-[#817563]">Seja o primeiro a compartilhar uma reflexão!</p>
                <button
                  onClick={() => setActiveTab('escrever')}
                  className="px-4 py-2 bg-[#785600] text-white font-sans text-xs font-bold uppercase tracking-wider rounded-xl cursor-pointer"
                >
                  Escrever Agora
                </button>
              </div>
            ) : (
              filteredPosts.map(post => {
                const catMeta = post.category ? categoryLabels[post.category] : categoryLabels.sentimento;
                const isSaved = bookmarkedIds.includes(post.id);

                return (
                  <article key={post.id} className="bg-white p-6 rounded-3xl border border-[#d3c4af]/60 shadow-xs space-y-4 hover:shadow-md transition-shadow">
                    {/* Header: Author & Category Tag */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={post.author.avatar}
                          alt={post.author.name}
                          className="w-11 h-11 rounded-full object-cover border border-[#d3c4af] bg-white"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-sans text-sm font-bold text-[#1c1b1b]">{post.author.name}</h4>
                            <span className="text-[10px] text-[#785600] font-semibold">{post.author.handle}</span>
                          </div>
                          <span className="text-[11px] text-[#817563]">{post.created_at}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${catMeta.color}`}>
                          {catMeta.label}
                        </span>
                        <button
                          onClick={() => handleToggleBookmark(post.id)}
                          className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                            isSaved ? 'text-[#785600] bg-amber-50' : 'text-[#817563] hover:bg-gray-100'
                          }`}
                          title="Salvar nos meus favoritos"
                        >
                          <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-[#785600]' : ''}`} />
                        </button>
                      </div>
                    </div>

                    {post.title && (
                      <h3 className="font-display text-xl font-bold text-[#1c1b1b] leading-tight pt-1">
                        {post.title}
                      </h3>
                    )}

                    {post.verse_reference && (
                      <blockquote className="bg-[#fcf9f8] border-l-3 border-[#785600] p-3 rounded-r-xl text-xs font-sans italic text-[#4f4535] flex items-start gap-2">
                        <Quote className="w-4 h-4 text-[#785600] shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-[#785600] font-bold not-italic block mb-0.5">{post.verse_reference}</strong>
                        </div>
                      </blockquote>
                    )}

                    <p className="font-sans text-sm text-[#1c1b1b] leading-relaxed whitespace-pre-line">
                      {post.content}
                    </p>

                    {post.image_url && (
                      <div className="rounded-2xl overflow-hidden border border-[#d3c4af]/40 max-h-[420px] bg-black/5">
                        <img src={post.image_url} alt="Ilustração" className="w-full h-full object-cover" />
                      </div>
                    )}

                    {/* Interaction Bar */}
                    <div className="pt-3 border-t border-[#d3c4af]/30 flex items-center justify-between text-xs text-[#817563]">
                      <div className="flex items-center gap-6">
                        <button
                          onClick={() => handleToggleLike(post.id)}
                          className={`flex items-center gap-1.5 font-bold transition-colors cursor-pointer ${
                            post.user_liked ? 'text-[#9a3e3c]' : 'hover:text-[#9a3e3c]'
                          }`}
                        >
                          <Heart className={`w-4.5 h-4.5 ${post.user_liked ? 'fill-[#9a3e3c]' : ''}`} />
                          <span>{post.likes_count} Curtidas</span>
                        </button>

                        <span className="flex items-center gap-1.5 font-semibold">
                          <MessageCircle className="w-4.5 h-4.5 text-[#785600]" /> {post.comments_count} Comentários
                        </span>
                      </div>

                      <span className="text-[11px] text-[#1c5d3a] font-semibold flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-[#1c5d3a]" /> Verificado pela Eclesia
                      </span>
                    </div>

                    {/* Comments Section */}
                    <div className="bg-[#fcf9f8] p-4 rounded-2xl border border-[#d3c4af]/30 space-y-3">
                      {postComments[post.id]?.map(cmt => (
                        <div key={cmt.id} className="flex items-start gap-2.5 text-xs">
                          <img src={cmt.author.avatar} alt={cmt.author.name} className="w-7 h-7 rounded-full object-cover mt-0.5 border border-[#d3c4af]" />
                          <div className="bg-white p-3 rounded-xl border border-[#d3c4af]/30 flex-1 space-y-0.5">
                            <span className="font-bold text-[#1c1b1b] block">{cmt.author.name}</span>
                            <p className="text-[#4f4535]">{cmt.content}</p>
                          </div>
                        </div>
                      ))}

                      {/* Comment Input */}
                      <div className="flex items-center gap-2 pt-1">
                        <input
                          type="text"
                          value={commentInputs[post.id] || ''}
                          onChange={(e) => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })}
                          onKeyDown={(e) => e.key === 'Enter' && handleAddComment(post.id)}
                          placeholder="Escreva uma palavra fraterna de comentário..."
                          className="flex-1 px-3 py-2 bg-white border border-[#d3c4af] rounded-xl font-sans text-xs text-[#1c1b1b] focus:border-[#785600] focus:ring-0"
                        />
                        <button
                          onClick={() => handleAddComment(post.id)}
                          className="px-4 py-2 bg-[#785600] text-white font-bold text-xs rounded-xl hover:bg-[#9a7000] cursor-pointer"
                        >
                          Enviar
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })
            )}
          </div>

          {/* Right Sidebar: Writer Inspiration */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-[#d3c4af]/60 space-y-3 shadow-2xs">
              <div className="flex items-center gap-2 text-[#785600]">
                <Feather className="w-5 h-5" />
                <h3 className="font-display text-base font-bold text-[#1c1b1b]">O Escritor Cristão</h3>
              </div>
              <p className="font-sans text-xs text-[#4f4535] leading-relaxed">
                "Escrever sobre a fé é uma vocação de partilha. Ao expressar seus pensamentos, alegrias e cruzes, você ilumina o caminho de outros irmãos em Cristo."
              </p>
              <div className="pt-2 border-t border-[#d3c4af]/30 flex items-center justify-between text-[11px] text-[#785600] font-semibold">
                <span>Moderação Fraterna Ativa</span>
                <ShieldCheck className="w-4 h-4 text-[#1c5d3a]" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#785600]/10 to-amber-50 p-6 rounded-3xl border border-[#785600]/30 space-y-3">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#785600] flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> Inspiração para o seu escrito de hoje:
              </span>
              <h4 className="font-display text-base font-bold text-[#1c1b1b]">
                "Em que momentos desta semana você percebeu a Providência Divina agir?"
              </h4>
              <button
                onClick={() => {
                  setPostCategory('sentimento');
                  setPostTitle('A Providência Divina na minha semana');
                  setActiveTab('escrever');
                }}
                className="w-full py-2.5 bg-[#785600] text-white font-sans text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-[#9a7000] cursor-pointer"
              >
                Escrever sobre este tema →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 2: FORMULÁRIO DE PUBLICAÇÃO (ESCREVER) ================= */}
      {activeTab === 'escrever' && (
        <div className="max-w-3xl mx-auto bg-white p-6 sm:p-10 rounded-3xl border border-[#d3c4af]/80 shadow-md space-y-6">
          <div className="border-b border-[#d3c4af]/40 pb-4">
            <h2 className="font-display text-2xl font-bold text-[#1c1b1b] flex items-center gap-2">
              <PenTool className="w-6 h-6 text-[#785600]" /> Nova Reflexão ou Sentimento Cristão
            </h2>
            <p className="font-sans text-xs text-[#817563] mt-1">
              Sua publicação será visível a toda a comunidade católica da Eclesia.
            </p>
          </div>

          <form onSubmit={handlePublishPost} className="space-y-5">
            {/* Category Selector */}
            <div>
              <label className="block font-sans text-xs font-bold text-[#1c1b1b] uppercase tracking-wider mb-2">
                Tipo de Publicação
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {(Object.keys(categoryLabels) as PostCategory[]).map(catKey => (
                  <button
                    key={catKey}
                    type="button"
                    onClick={() => setPostCategory(catKey)}
                    className={`p-3 text-left rounded-2xl border text-xs font-sans font-semibold transition-all cursor-pointer ${
                      postCategory === catKey
                        ? 'border-[#785600] bg-[#785600] text-white shadow-xs'
                        : 'border-[#d3c4af]/60 bg-[#fcf9f8] text-[#4f4535] hover:border-[#785600]'
                    }`}
                  >
                    {categoryLabels[catKey].label}
                  </button>
                ))}
              </div>
            </div>

            {/* Title (Optional) */}
            <div>
              <label className="block font-sans text-xs font-bold text-[#1c1b1b] uppercase tracking-wider mb-1">
                Título do Pensamento (Opcional)
              </label>
              <input
                type="text"
                value={postTitle}
                onChange={(e) => setPostTitle(e.target.value)}
                placeholder="Ex: A Paz de Cristo nos Dias Difíceis..."
                className="w-full px-4 py-2.5 bg-[#fcf9f8] border border-[#d3c4af] rounded-2xl font-sans text-xs text-[#1c1b1b] focus:border-[#785600] focus:ring-0 placeholder:text-[#817563]"
              />
            </div>

            {/* Verse Reference (Optional) */}
            <div>
              <label className="block font-sans text-xs font-bold text-[#1c1b1b] uppercase tracking-wider mb-1">
                Passagem Bíblica / Citação de Santo (Opcional)
              </label>
              <input
                type="text"
                value={postVerse}
                onChange={(e) => setPostVerse(e.target.value)}
                placeholder="Ex: Salmo 23, 1 — O Senhor é o meu pastor..."
                className="w-full px-4 py-2.5 bg-[#fcf9f8] border border-[#d3c4af] rounded-2xl font-sans text-xs text-[#1c1b1b] focus:border-[#785600] focus:ring-0 placeholder:text-[#817563]"
              />
            </div>

            {/* Main Content */}
            <div>
              <label className="block font-sans text-xs font-bold text-[#1c1b1b] uppercase tracking-wider mb-1">
                Sua Reflexão ou Sentimento Cristão *
              </label>
              <textarea
                required
                rows={6}
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                placeholder="Escreva livremente aqui a sua meditação, ideia teológica, oração ou sentimento espiritual..."
                className="w-full p-4 bg-[#fcf9f8] border border-[#d3c4af] rounded-2xl font-sans text-sm text-[#1c1b1b] focus:border-[#785600] focus:ring-0 placeholder:text-[#817563] resize-none leading-relaxed"
              />
            </div>

            {/* Real Image File Upload */}
            <div>
              <label className="block font-sans text-xs font-bold text-[#1c1b1b] uppercase tracking-wider mb-2">
                Anexar Imagem ou Foto da Publicação (Upload)
              </label>
              
              {postImageFile ? (
                <div className="relative rounded-2xl overflow-hidden border-2 border-[#785600] max-h-64 bg-black/5">
                  <img src={postImageFile} alt="Preview" className="w-full h-full object-cover max-h-64" />
                  <button
                    type="button"
                    onClick={() => setPostImageFile(null)}
                    className="absolute top-3 right-3 p-1.5 bg-black/70 hover:bg-black text-white rounded-full transition-colors cursor-pointer"
                    title="Remover imagem"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="border-2 border-dashed border-[#d3c4af] hover:border-[#785600] rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors bg-[#fcf9f8] hover:bg-amber-50/50">
                  <ImageIcon className="w-8 h-8 text-[#785600] mb-2" />
                  <span className="font-sans text-xs font-bold text-[#1c1b1b]">
                    Clique para selecionar uma foto ou arte
                  </span>
                  <span className="font-sans text-[11px] text-[#817563] mt-0.5">
                    PNG, JPG, WebP suportados
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePostImageUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-[11px] text-[#817563] flex items-center gap-1">
                <Lock className="w-3.5 h-3.5 text-[#1c5d3a]" /> Verificação de conteúdo fraterno antes da exibição
              </span>

              <div className="flex gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setActiveTab('feed')}
                  className="flex-1 sm:flex-none px-5 py-3 border border-[#d3c4af] text-[#4f4535] font-sans text-xs font-bold uppercase tracking-wider rounded-2xl hover:bg-[#f6f3f2] cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isPublishing || !postContent.trim()}
                  className="flex-1 sm:flex-none px-8 py-3 bg-[#785600] hover:bg-[#9a7000] text-white font-sans text-xs font-bold uppercase tracking-widest rounded-2xl shadow-md transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  {isPublishing ? 'Publicando...' : 'Publicar Agora'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* ================= TAB 3: MEUS ESCRITOS ================= */}
      {activeTab === 'meus-escritos' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-[#d3c4af]/60 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="font-display text-2xl font-bold text-[#1c1b1b]">Meus Escritos & Publicações</h2>
              <p className="font-sans text-xs text-[#817563]">Histórico de todos os seus pensamentos compartilhados na Eclesia.</p>
            </div>
            <button
              onClick={() => setActiveTab('escrever')}
              className="px-5 py-2.5 bg-[#785600] text-white font-sans text-xs font-bold uppercase tracking-wider rounded-2xl hover:bg-[#9a7000] cursor-pointer"
            >
              + Novo Escrito
            </button>
          </div>

          {myPosts.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl border border-[#d3c4af]/60 text-center space-y-3">
              <Feather className="w-12 h-12 text-[#d3c4af] mx-auto" />
              <h3 className="font-display text-lg font-bold text-[#1c1b1b]">Você ainda não publicou nenhuma reflexão</h3>
              <p className="font-sans text-xs text-[#817563]">Compartilhe sua primeira ideia ou sentimento cristão com a comunidade!</p>
              <button
                onClick={() => setActiveTab('escrever')}
                className="px-6 py-3 bg-[#785600] text-white font-sans text-xs font-bold uppercase tracking-wider rounded-2xl cursor-pointer"
              >
                Escrever Minha Primeira Reflexão
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {myPosts.map(post => (
                <div key={post.id} className="bg-white p-6 rounded-3xl border border-[#d3c4af]/60 shadow-xs space-y-3 flex flex-col justify-between">
                  <div>
                    <span className="px-2.5 py-0.5 bg-amber-100 text-amber-900 border border-amber-200 rounded-full text-[10px] font-bold uppercase tracking-wider inline-block mb-2">
                      {post.category ? categoryLabels[post.category].label : 'Reflexão'}
                    </span>
                    {post.title && <h3 className="font-display text-lg font-bold text-[#1c1b1b] mb-1">{post.title}</h3>}
                    <p className="font-sans text-xs text-[#4f4535] leading-relaxed line-clamp-4">{post.content}</p>
                  </div>

                  <div className="pt-3 border-t border-[#d3c4af]/30 flex justify-between items-center text-xs text-[#817563]">
                    <span>{post.created_at}</span>
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1 font-bold text-[#9a3e3c]">
                        <Heart className="w-4 h-4 fill-[#9a3e3c]" /> {post.likes_count}
                      </span>
                      <span className="flex items-center gap-1 font-semibold text-[#785600]">
                        <MessageCircle className="w-4 h-4" /> {post.comments_count}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 4: COMUNIDADES & CÍRCULOS ================= */}
      {activeTab === 'comunidades' && (
        <div className="space-y-6">
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#d3c4af]/60 shadow-2xs">
            <div>
              <h2 className="font-display text-2xl font-bold text-[#1c1b1b]">Comunidades & Círculos de Estudo</h2>
              <p className="font-sans text-xs text-[#817563] mt-0.5">
                Junte-se a grupos de oração, novenas comunitárias e estudos catequéticos.
              </p>
            </div>

            <button
              onClick={() => setShowNewCommModal(true)}
              className="px-5 py-3 bg-[#785600] hover:bg-[#9a7000] text-white font-sans text-xs font-bold uppercase tracking-wider rounded-2xl flex items-center gap-2 shrink-0 cursor-pointer shadow-sm"
            >
              <PlusCircle className="w-4 h-4" /> Criar Nova Comunidade
            </button>
          </div>

          {/* Sub-Filter & Invite Code Form */}
          <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 bg-white p-4 rounded-2xl border border-[#d3c4af]/50">
            {/* Filter Toggle */}
            <div className="flex bg-[#f6f3f2] p-1 rounded-xl">
              <button
                onClick={() => setCommViewFilter('publicas')}
                className={`px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                  commViewFilter === 'publicas' ? 'bg-white text-[#1c1b1b] shadow-xs' : 'text-[#4f4535]'
                }`}
              >
                Comunidades Públicas ({communities.filter(c => c.is_public).length})
              </button>
              <button
                onClick={() => setCommViewFilter('minhas')}
                className={`px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                  commViewFilter === 'minhas' ? 'bg-white text-[#1c1b1b] shadow-xs' : 'text-[#4f4535]'
                }`}
              >
                Minhas Comunidades ({communities.filter(c => c.is_member).length})
              </button>
            </div>

            {/* Join private by code */}
            <form onSubmit={handleJoinByCode} className="flex items-center gap-2">
              <input
                type="text"
                value={inviteCodeInput}
                onChange={(e) => setInviteCodeInput(e.target.value)}
                placeholder="Código de convite privado..."
                className="px-3 py-1.5 bg-[#fcf9f8] border border-[#d3c4af] rounded-xl text-xs flex-1 md:w-56"
              />
              <button
                type="submit"
                className="px-4 py-1.5 bg-[#1c1b1b] text-white text-xs font-bold uppercase rounded-xl hover:bg-[#785600] transition-colors cursor-pointer"
              >
                Entrar
              </button>
            </form>
          </div>

          {/* Communities Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {visibleCommunities.map((comm) => (
              <div
                key={comm.id}
                onClick={() => {
                  setSelectedCommunity(comm);
                  setCommSubTab('chat');
                }}
                className="bg-white rounded-3xl border border-[#d3c4af]/60 overflow-hidden shadow-xs space-y-3 flex flex-col justify-between cursor-pointer hover:border-[#785600] hover:shadow-md transition-all group"
              >
                <div className="h-40 bg-gray-200 relative overflow-hidden">
                  <img
                    src={comm.cover_image}
                    alt={comm.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  
                  {comm.linked_parish && (
                    <span className="absolute bottom-3 left-3 bg-[#1c1b1b]/80 backdrop-blur-xs text-white font-sans text-[10px] font-semibold px-2.5 py-1 rounded-md flex items-center gap-1">
                      <Church className="w-3.5 h-3.5" /> {comm.linked_parish}
                    </span>
                  )}

                  <span className={`absolute top-3 right-3 text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                    comm.is_public ? 'bg-emerald-600 text-white' : 'bg-amber-600 text-white'
                  }`}>
                    {comm.is_public ? 'Pública' : 'Privada'}
                  </span>
                </div>

                <div className="p-6 space-y-3 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[#785600]">
                        {comm.category} {comm.patron_saint && `• Devoção a ${comm.patron_saint}`}
                      </span>
                      <span className="text-xs font-bold text-[#817563] bg-[#f6f3f2] px-2.5 py-0.5 rounded-full">
                        {comm.member_count} membros
                      </span>
                    </div>

                    <h3 className="font-display text-xl font-bold text-[#1c1b1b] leading-snug group-hover:text-[#785600] transition-colors">
                      {comm.name}
                    </h3>
                    <p className="font-sans text-xs text-[#4f4535] mt-1 line-clamp-2 leading-relaxed">
                      {comm.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[#d3c4af]/30 flex justify-between items-center">
                    <span className="text-[11px] text-[#785600] font-bold uppercase tracking-wider flex items-center gap-1">
                      Abrir Comunidade →
                    </span>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleJoinComm(comm.id);
                      }}
                      className={`px-4 py-2 rounded-xl text-xs font-sans font-bold uppercase tracking-wider transition-all cursor-pointer ${
                        comm.is_member
                          ? 'bg-[#1c5d3a]/10 text-[#1c5d3a] border border-[#1c5d3a]/30'
                          : 'bg-[#785600] text-white hover:bg-[#9a7000]'
                      }`}
                    >
                      {comm.is_member ? '✓ Participando' : '+ Participar'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= MODAL: CRIAR NOVA COMUNIDADE ================= */}
      {showNewCommModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl border border-[#d3c4af] p-6 sm:p-8 max-w-lg w-full space-y-4 shadow-2xl my-8">
            <div className="flex justify-between items-center border-b border-[#d3c4af]/40 pb-3">
              <h3 className="font-display text-xl font-bold text-[#1c1b1b]">Criar Nova Comunidade</h3>
              <button onClick={() => setShowNewCommModal(false)} className="p-1 hover:bg-gray-100 rounded-full cursor-pointer">
                <X className="w-5 h-5 text-[#817563]" />
              </button>
            </div>

            <form onSubmit={handleCreateCommunity} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1">Nome do Grupo *</label>
                <input
                  type="text"
                  required
                  value={newCommName}
                  onChange={(e) => setNewCommName(e.target.value)}
                  placeholder="Ex: Círculo de Leitura das Cartas de São Paulo"
                  className="w-full px-3 py-2 border border-[#d3c4af] rounded-xl text-xs font-sans"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1">Descrição e Objetivos *</label>
                <textarea
                  required
                  rows={3}
                  value={newCommDesc}
                  onChange={(e) => setNewCommDesc(e.target.value)}
                  placeholder="Objetivo e dinâmica dos encontros de oração/estudo..."
                  className="w-full p-3 border border-[#d3c4af] rounded-xl text-xs font-sans leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1">Paróquia / Local</label>
                  <input
                    type="text"
                    value={newCommParish}
                    onChange={(e) => setNewCommParish(e.target.value)}
                    placeholder="Ex: Catedral da Sé - SP"
                    className="w-full px-3 py-2 border border-[#d3c4af] rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1">Santo(a) de Devoção</label>
                  <input
                    type="text"
                    value={newCommSaint}
                    onChange={(e) => setNewCommSaint(e.target.value)}
                    placeholder="Ex: São Bento, Sta Teresinha"
                    className="w-full px-3 py-2 border border-[#d3c4af] rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1">Categoria</label>
                  <select
                    value={newCommCat}
                    onChange={(e) => setNewCommCat(e.target.value as any)}
                    className="w-full p-2 border border-[#d3c4af] rounded-xl text-xs font-sans"
                  >
                    <option value="estudos">Estudos Teológicos</option>
                    <option value="oracao">Grupo de Oração</option>
                    <option value="juventude">Juventude</option>
                    <option value="paroquia">Paróquia / Pastoral</option>
                    <option value="familias">Famílias</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1">Privacidade</label>
                  <select
                    value={newCommIsPublic ? 'publica' : 'privada'}
                    onChange={(e) => setNewCommIsPublic(e.target.value === 'publica')}
                    className="w-full p-2 border border-[#d3c4af] rounded-xl text-xs font-sans"
                  >
                    <option value="publica">Pública (Listada no Feed)</option>
                    <option value="privada">Privada (Apenas com Convite)</option>
                  </select>
                </div>
              </div>

              {/* Cover Image Upload / Selection */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1">Foto de Capa do Grupo</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        if (typeof reader.result === 'string') setNewCommCover(reader.result);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="text-xs w-full"
                />
              </div>

              <div className="pt-3 flex justify-end gap-3 border-t border-[#d3c4af]/40">
                <button
                  type="button"
                  onClick={() => setShowNewCommModal(false)}
                  className="px-5 py-2.5 border border-[#d3c4af] rounded-xl text-xs font-bold uppercase cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#785600] hover:bg-[#9a7000] text-white rounded-xl text-xs font-bold uppercase cursor-pointer shadow-sm"
                >
                  Criar Comunidade
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
