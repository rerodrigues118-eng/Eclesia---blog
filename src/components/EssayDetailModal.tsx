import React from 'react';
import { X, BookOpen, Share2, Clock, Calendar } from 'lucide-react';
import { Essay } from '../types';

interface EssayDetailModalProps {
  essay: Essay | null;
  onClose: () => void;
}

export const EssayDetailModal: React.FC<EssayDetailModalProps> = ({ essay, onClose }) => {
  if (!essay) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-lg max-w-3xl w-full relative border border-[#d3c4af] my-8 max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 bg-white/80 backdrop-blur-xs text-[#1c1b1b] rounded-full hover:bg-white shadow"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="overflow-y-auto p-6 md:p-12 space-y-8">
          {/* Header */}
          <header className="space-y-4 border-b border-[#d3c4af]/50 pb-6">
            <span className="font-sans text-xs font-bold text-[#785600] uppercase tracking-widest bg-[#ffdea6]/30 px-3 py-1 rounded">
              {essay.category}
            </span>
            <h1 className="font-display text-3xl md:text-5xl font-bold text-[#1c1b1b] leading-tight">
              {essay.title}
            </h1>

            <div className="flex flex-wrap items-center justify-between gap-4 font-sans text-xs text-[#817563] pt-2">
              <div className="flex items-center gap-4">
                <span className="font-semibold text-[#1c1b1b]">{essay.author}</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> {essay.date}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> {essay.readTime}
                </span>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  alert('Link do ensaio copiado para a área de transferência!');
                }}
                className="flex items-center gap-1 text-[#785600] hover:underline font-bold"
              >
                <Share2 className="w-4 h-4" /> Compartilhar
              </button>
            </div>
          </header>

          {/* Featured Image */}
          <div className="aspect-[16/9] rounded overflow-hidden border border-[#d3c4af]/50">
            <img
              src={essay.imageUrl}
              alt={essay.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Content */}
          <article className="font-sans text-[#1c1b1b] text-base md:text-lg leading-relaxed space-y-6 whitespace-pre-line drop-cap">
            {essay.content}
          </article>
        </div>
      </div>
    </div>
  );
};
