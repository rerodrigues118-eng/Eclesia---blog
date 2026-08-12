import React from 'react';
import { X, Sparkles, Heart, Bookmark, Share2 } from 'lucide-react';
import { Saint } from '../types';

interface SaintDetailModalProps {
  saint: Saint | null;
  onClose: () => void;
}

export const SaintDetailModal: React.FC<SaintDetailModalProps> = ({ saint, onClose }) => {
  if (!saint) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-lg max-w-3xl w-full relative border border-[#d3c4af] my-8 max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 bg-white/80 backdrop-blur-xs text-[#1c1b1b] rounded-full hover:bg-white shadow"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Scrollable Content */}
        <div className="overflow-y-auto p-6 md:p-10 space-y-8">
          {/* Header Image & Meta */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center border-b border-[#d3c4af]/50 pb-6">
            <div className="md:col-span-5 aspect-[3/4] relative p-1 bg-[#fcf9f8] border border-[#B8860B]/40 rounded shadow-xs">
              <img
                src={saint.imageUrl}
                alt={saint.name}
                className="w-full h-full object-cover rounded"
              />
            </div>
            <div className="md:col-span-7 space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#785600]" />
                <span className="font-sans text-xs font-bold text-[#785600] uppercase tracking-widest">
                  Festividade • {saint.feastDate}
                </span>
              </div>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-[#1c1b1b]">
                {saint.name}
              </h2>
              <p className="font-sans text-sm font-semibold text-[#817563]">{saint.title}</p>
              <div className="pt-2 border-t border-[#d3c4af]/30 text-xs font-sans text-[#4f4535]">
                <strong>Padroeiro de:</strong> {saint.patronage}
              </div>
            </div>
          </div>

          {/* Full Biography */}
          <section className="space-y-4">
            <h3 className="font-display text-2xl font-bold text-[#785600]">Biografia & Legado</h3>
            <div className="font-sans text-[#1c1b1b] text-base leading-relaxed space-y-4 whitespace-pre-line drop-cap">
              {saint.fullBio}
            </div>
          </section>

          {/* Quotes */}
          {saint.quotes && saint.quotes.length > 0 && (
            <section className="bg-[#fcf9f8] p-6 rounded border-l-4 border-[#785600] space-y-3">
              <h4 className="font-display text-lg font-bold text-[#1c1b1b]">Palavras do Santo</h4>
              <ul className="space-y-2">
                {saint.quotes.map((quote, idx) => (
                  <li key={idx} className="font-sans text-sm italic text-[#4f4535]">
                    "{quote}"
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Prayer Section */}
          <section className="bg-[#ffdea6]/20 border border-[#785600]/30 p-6 rounded-lg space-y-3">
            <div className="flex items-center gap-2 text-[#785600]">
              <Heart className="w-4 h-4" />
              <h4 className="font-display text-xl font-bold">Oração de Intercessão</h4>
            </div>
            <p className="font-sans text-sm text-[#271900] leading-relaxed italic">
              {saint.prayer}
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};
