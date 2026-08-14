import React from 'react';
import { Users, PlusCircle, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { Community } from '../../types';

interface CommunityListProps {
  communities: Community[];
  onToggleJoin: (commId: string) => void;
  showModal: boolean;
  setShowModal: (val: boolean) => void;
  newCommName: string;
  setNewCommName: (val: string) => void;
  newCommDesc: string;
  setNewCommDesc: (val: string) => void;
  newCommCategory: 'juventude' | 'oracao' | 'estudos' | 'paroquia' | 'familias';
  setNewCommCategory: (val: 'juventude' | 'oracao' | 'estudos' | 'paroquia' | 'familias') => void;
  handleCreateCommunity: (e: React.FormEvent) => void;
  commNotice: string | null;
}

export const CommunityList: React.FC<CommunityListProps> = ({
  communities,
  onToggleJoin,
  showModal,
  setShowModal,
  newCommName,
  setNewCommName,
  newCommDesc,
  setNewCommDesc,
  newCommCategory,
  setNewCommCategory,
  handleCreateCommunity,
  commNotice
}) => {
  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-[#d3c4af]/60 p-6 rounded-xl shadow-xs">
        <div>
          <h2 className="font-display text-2xl font-bold text-[#1c1b1b]">Comunidades & Grupos</h2>
          <p className="font-sans text-xs text-[#4f4535] mt-1">
            Participe de grupos moderados de oração, estudo e juventude.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-[#785600] text-white font-sans text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-[#9a7000] transition-colors flex items-center gap-2 shrink-0 cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" /> Criar Comunidade
        </button>
      </div>

      {commNotice && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{commNotice}</span>
        </div>
      )}

      {/* Grid of Communities */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {communities.map((comm) => (
          <div
            key={comm.id}
            className="bg-white border border-[#d3c4af]/60 rounded-xl overflow-hidden shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between"
          >
            <div>
              <div className="h-32 relative overflow-hidden">
                <img src={comm.cover_image} alt={comm.name} className="w-full h-full object-cover" />
                <span className="absolute top-3 left-3 px-2.5 py-1 bg-[#1c1b1b]/80 text-white text-[10px] font-bold uppercase tracking-widest rounded-md backdrop-blur-xs">
                  {comm.category}
                </span>
                {comm.approval_status === 'pendente' && (
                  <span className="absolute top-3 right-3 px-2.5 py-1 bg-amber-500 text-white text-[10px] font-bold uppercase rounded-md flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> Em Análise
                  </span>
                )}
              </div>
              <div className="p-5 space-y-2">
                <h3 className="font-display text-lg font-bold text-[#1c1b1b] leading-snug">
                  {comm.name}
                </h3>
                <p className="font-sans text-xs text-[#4f4535] leading-relaxed line-clamp-3">
                  {comm.description}
                </p>
              </div>
            </div>

            <div className="p-5 pt-0 flex items-center justify-between border-t border-[#d3c4af]/30 mt-4">
              <span className="text-[11px] text-[#817563] flex items-center gap-1">
                <Users className="w-3.5 h-3.5" /> {comm.member_count} membros
              </span>
              <button
                onClick={() => onToggleJoin(comm.id)}
                className={`px-4 py-1.5 text-xs font-sans font-bold uppercase tracking-wider rounded-md transition-colors cursor-pointer ${
                  comm.is_member
                    ? 'bg-[#f0eded] text-[#4f4535] hover:bg-red-50 hover:text-red-700'
                    : 'bg-[#1c1b1b] text-white hover:bg-[#785600]'
                }`}
              >
                {comm.is_member ? 'Membro (Sair)' : 'Participar'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create Community Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4 shadow-xl border border-[#d3c4af]/60">
            <h3 className="font-display text-xl font-bold text-[#1c1b1b]">Criar Nova Comunidade</h3>
            <p className="font-sans text-xs text-[#4f4535]">
              As comunidades passam por moderação antes de ficarem visíveis na busca pública.
            </p>

            <form onSubmit={handleCreateCommunity} className="space-y-3">
              <div>
                <label className="block text-xs font-bold uppercase text-[#4f4535] mb-1">
                  Nome da Comunidade
                </label>
                <input
                  type="text"
                  required
                  value={newCommName}
                  onChange={(e) => setNewCommName(e.target.value)}
                  placeholder="Ex: Grupo de Jovens São João Paulo II"
                  className="w-full px-3 py-2 bg-[#fcf9f8] border border-[#d3c4af] rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-[#4f4535] mb-1">
                  Categoria
                </label>
                <select
                  value={newCommCategory}
                  onChange={(e) => setNewCommCategory(e.target.value as any)}
                  className="w-full px-3 py-2 bg-[#fcf9f8] border border-[#d3c4af] rounded-lg text-xs"
                >
                  <option value="juventude">Juventude</option>
                  <option value="oracao">Oração</option>
                  <option value="estudos">Estudos Teológicos</option>
                  <option value="paroquia">Paróquia</option>
                  <option value="familias">Famílias</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-[#4f4535] mb-1">
                  Descrição
                </label>
                <textarea
                  required
                  rows={3}
                  value={newCommDesc}
                  onChange={(e) => setNewCommDesc(e.target.value)}
                  placeholder="Descreva o propósito do grupo..."
                  className="w-full px-3 py-2 bg-[#fcf9f8] border border-[#d3c4af] rounded-lg text-xs resize-none"
                />
              </div>

              <div className="flex gap-2 pt-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-bold uppercase text-[#4f4535] hover:bg-[#f0eded] rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#785600] text-white text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-[#9a7000]"
                >
                  Enviar para Aprovação
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
