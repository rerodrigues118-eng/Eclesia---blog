import React, { useState } from 'react';
import { User, Camera, Feather, Church, Heart, Save, CheckCircle2, ShieldCheck, ArrowLeft, Sparkles, Lock } from 'lucide-react';
import { UserProfile, ActiveView } from '../types';

interface ProfileViewProps {
  profile: UserProfile | null;
  onUpdateProfile: (data: Partial<UserProfile>) => Promise<{ success: boolean; message: string }>;
  setActiveView: (view: ActiveView) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  profile,
  onUpdateProfile,
  setActiveView,
}) => {
  if (!profile) {
    return (
      <div className="w-full max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <Lock className="w-12 h-12 text-[#785600] mx-auto" />
        <h2 className="font-display text-2xl font-bold text-[#1c1b1b]">Acesso Restrito</h2>
        <p className="font-sans text-sm text-[#817563]">Faça login para visualizar e editar o seu perfil.</p>
        <button
          onClick={() => setActiveView('home')}
          className="px-6 py-2.5 bg-[#785600] text-white font-bold text-xs uppercase rounded-xl"
        >
          Voltar ao Início
        </button>
      </div>
    );
  }

  const [name, setName] = useState(profile.name || '');
  const [handle, setHandle] = useState(profile.handle || '');
  const [bio, setBio] = useState(profile.bio || '');
  const [parish, setParish] = useState(profile.parish_name || '');
  const [patronSaint, setPatronSaint] = useState(profile.patron_saint || 'Nossa Senhora Aparecida');
  const [avatar, setAvatar] = useState(profile.avatar || '');
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Avatar file upload handler
  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setAvatar(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const res = await onUpdateProfile({
      name,
      handle: handle.startsWith('@') ? handle : `@${handle}`,
      bio,
      parish_name: parish,
      patron_saint: patronSaint,
      avatar
    });
    setIsSaving(false);
    setFeedback(res.message);
    setTimeout(() => setFeedback(null), 4000);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in pb-20">
      {/* Top Breadcrumb */}
      <button
        onClick={() => setActiveView('comunidade')}
        className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#785600] hover:underline cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" /> Voltar para a Comunidade
      </button>

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#1c1b1b] via-[#2d2516] to-[#785600] text-white rounded-3xl p-6 sm:p-10 shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row items-center gap-6">
          {/* Avatar with live upload overlay */}
          <div className="relative group">
            <img
              src={avatar || profile.avatar}
              alt={name}
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-[#f7bd48] shadow-md bg-white"
            />
            <label
              htmlFor="avatar-upload"
              className="absolute inset-0 bg-black/60 rounded-full flex flex-col items-center justify-center text-white text-[11px] font-bold opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer backdrop-blur-xs"
            >
              <Camera className="w-6 h-6 mb-1" />
              <span>Trocar Foto</span>
            </label>
            <input
              id="avatar-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarFileChange}
            />
          </div>

          <div className="text-center sm:text-left space-y-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <span className="px-3 py-0.5 bg-[#f7bd48] text-[#1c1b1b] text-[10px] font-bold uppercase tracking-widest rounded-full flex items-center gap-1">
                <Feather className="w-3 h-3" /> {profile.role === 'admin' ? 'Administrador Geral' : 'Escritor Cristão'}
              </span>
              <span className="text-amber-200 text-xs font-semibold">{handle}</span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold">{name}</h1>
            <p className="font-sans text-xs text-amber-100/90 max-w-md">
              {parish ? `📍 ${parish}` : 'Católico fiel'} · Devoção: {patronSaint}
            </p>
          </div>
        </div>
      </div>

      {/* Success Notification */}
      {feedback && (
        <div className="bg-[#1c5d3a]/10 border border-[#1c5d3a]/30 text-[#1c5d3a] px-4 py-3 rounded-xl text-xs font-sans font-semibold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-[#1c5d3a]" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Edit Form */}
      <form onSubmit={handleSubmit} className="bg-white border border-[#d3c4af]/80 rounded-3xl p-6 sm:p-10 shadow-sm space-y-6">
        <div className="border-b border-[#d3c4af]/40 pb-4 flex items-center justify-between">
          <div>
            <h2 className="font-display text-xl font-bold text-[#1c1b1b]">Editar Dados do Perfil</h2>
            <p className="font-sans text-xs text-[#817563]">Atualize sua foto, informações pessoais e de apostolado.</p>
          </div>
          <span className="text-xs text-[#1c5d3a] font-semibold flex items-center gap-1">
            <ShieldCheck className="w-4 h-4" /> Perfil Verificado
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Nome */}
          <div>
            <label className="block text-xs font-bold text-[#1c1b1b] uppercase tracking-wider mb-1.5">
              Nome Completo *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 bg-[#fcf9f8] border border-[#d3c4af] rounded-xl font-sans text-xs text-[#1c1b1b] focus:border-[#785600] focus:ring-0"
              placeholder="Seu nome"
            />
          </div>

          {/* Handle */}
          <div>
            <label className="block text-xs font-bold text-[#1c1b1b] uppercase tracking-wider mb-1.5">
              Nome de Usuário (@handle) *
            </label>
            <input
              type="text"
              required
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              className="w-full px-4 py-2.5 bg-[#fcf9f8] border border-[#d3c4af] rounded-xl font-sans text-xs text-[#1c1b1b] focus:border-[#785600] focus:ring-0"
              placeholder="@seu_usuario"
            />
          </div>

          {/* Paróquia */}
          <div>
            <label className="block text-xs font-bold text-[#1c1b1b] uppercase tracking-wider mb-1.5">
              Paróquia ou Diocese de Pertença
            </label>
            <input
              type="text"
              value={parish}
              onChange={(e) => setParish(e.target.value)}
              className="w-full px-4 py-2.5 bg-[#fcf9f8] border border-[#d3c4af] rounded-xl font-sans text-xs text-[#1c1b1b] focus:border-[#785600] focus:ring-0"
              placeholder="Ex: Paróquia São José Operário - SP"
            />
          </div>

          {/* Santo de Devoção */}
          <div>
            <label className="block text-xs font-bold text-[#1c1b1b] uppercase tracking-wider mb-1.5">
              Santo(a) de Devoção Principal
            </label>
            <input
              type="text"
              value={patronSaint}
              onChange={(e) => setPatronSaint(e.target.value)}
              className="w-full px-4 py-2.5 bg-[#fcf9f8] border border-[#d3c4af] rounded-xl font-sans text-xs text-[#1c1b1b] focus:border-[#785600] focus:ring-0"
              placeholder="Ex: São Bento, Santa Teresinha, São Miguel"
            />
          </div>
        </div>

        {/* Biografia */}
        <div>
          <label className="block text-xs font-bold text-[#1c1b1b] uppercase tracking-wider mb-1.5">
            Biografia ou Testemunho Espiritual
          </label>
          <textarea
            rows={4}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="w-full p-4 bg-[#fcf9f8] border border-[#d3c4af] rounded-xl font-sans text-xs text-[#1c1b1b] focus:border-[#785600] focus:ring-0 placeholder:text-[#817563] resize-none leading-relaxed"
            placeholder="Compartilhe um pouco da sua caminhada com Cristo e sua vocação..."
          />
        </div>

        {/* Save Button */}
        <div className="pt-4 border-t border-[#d3c4af]/40 flex items-center justify-between">
          <p className="font-sans text-[11px] text-[#817563]">
            Suas informações são salvas de forma segura na Eclesia.
          </p>

          <button
            type="submit"
            disabled={isSaving}
            className="px-8 py-3 bg-[#785600] hover:bg-[#9a7000] text-white font-sans text-xs font-bold uppercase tracking-widest rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 hover:scale-[1.02]"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </div>
      </form>
    </div>
  );
};
