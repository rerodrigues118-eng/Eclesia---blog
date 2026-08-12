import React, { useState } from 'react';
import { Calendar as CalendarIcon, Volume2, VolumeX, Type, ChevronLeft, ChevronRight, Bookmark, Share2 } from 'lucide-react';
import { READINGS_DATA } from '../data/eclesiaData';

export const LiturgiaView: React.FC = () => {
  const [selectedDateKey, setSelectedDateKey] = useState<string>('2026-11-15');
  const [fontSizeClass, setFontSizeClass] = useState<'text-base' | 'text-lg' | 'text-xl'>('text-lg');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [savedBookmark, setSavedBookmark] = useState(false);

  const currentReading = READINGS_DATA[selectedDateKey] || READINGS_DATA['2026-11-15'];

  return (
    <div className="w-full max-w-[1120px] mx-auto px-4 md:px-12 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Sidebar Navigation */}
        <aside className="lg:col-span-4 bg-white p-6 rounded border border-[#d3c4af]/60 space-y-6 sticky top-24">
          <div>
            <span className="font-sans text-xs font-bold text-[#785600] uppercase tracking-widest block mb-1">
              Calendário Litúrgico
            </span>
            <h2 className="font-display text-2xl font-bold text-[#1c1b1b]">Liturgia da Palavra</h2>
          </div>

          {/* Date Selector */}
          <div className="space-y-2">
            <label className="font-sans text-xs font-semibold text-[#817563] uppercase tracking-wider block">
              Selecione a Data
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedDateKey('2026-11-15')}
                className={`flex-1 py-2 px-3 rounded font-sans text-xs font-bold transition-all text-center border ${
                  selectedDateKey === '2026-11-15'
                    ? 'bg-[#1c5d3a] text-white border-[#1c5d3a]'
                    : 'bg-[#fcf9f8] text-[#1c1b1b] border-[#d3c4af]/60 hover:border-[#785600]'
                }`}
              >
                15 de Nov
              </button>
              <button
                onClick={() => setSelectedDateKey('2026-10-01')}
                className={`flex-1 py-2 px-3 rounded font-sans text-xs font-bold transition-all text-center border ${
                  selectedDateKey === '2026-10-01'
                    ? 'bg-[#785600] text-white border-[#785600]'
                    : 'bg-[#fcf9f8] text-[#1c1b1b] border-[#d3c4af]/60 hover:border-[#785600]'
                }`}
              >
                01 de Out
              </button>
            </div>
          </div>

          {/* Liturgical Season Tag */}
          <div className="p-4 rounded border border-[#d3c4af]/40 bg-[#fcf9f8] space-y-2">
            <div className="flex items-center gap-2">
              <span
                className="w-3.5 h-3.5 rounded-full inline-block"
                style={{ backgroundColor: currentReading.colorHex }}
              ></span>
              <span className="font-sans text-xs font-bold text-[#1c1b1b] uppercase tracking-widest">
                {currentReading.season}
              </span>
            </div>
            <p className="font-sans text-xs text-[#817563]">{currentReading.colorName}</p>
          </div>

          {/* Audio Reader Control */}
          <div className="p-4 bg-[#1c1b1b] text-white rounded space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-sans text-xs font-bold uppercase tracking-wider text-[#ffdea6]">
                Áudio da Liturgia
              </span>
              <button
                onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                className="p-2 rounded-full bg-[#785600] hover:bg-[#9a6f00] transition-colors text-white"
              >
                {isPlayingAudio ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
            </div>
            <p className="font-sans text-xs text-gray-300">
              {isPlayingAudio
                ? 'Reproduzindo narração em voz humana da Liturgia diária...'
                : 'Ouvir narração das leituras diárias com canto gregoriano suave.'}
            </p>
            {isPlayingAudio && (
              <div className="w-full bg-gray-700 h-1.5 rounded-full overflow-hidden">
                <div className="bg-[#ffdea6] h-full w-2/5 animate-pulse"></div>
              </div>
            )}
          </div>

          {/* Typography Controls */}
          <div className="flex justify-between items-center pt-2 border-t border-[#d3c4af]/40">
            <span className="font-sans text-xs font-semibold text-[#817563]">Tamanho do Texto:</span>
            <div className="flex gap-1">
              <button
                onClick={() => setFontSizeClass('text-base')}
                className={`w-7 h-7 flex items-center justify-center rounded font-sans text-xs font-bold ${
                  fontSizeClass === 'text-base' ? 'bg-[#785600] text-white' : 'bg-[#f0eded] text-[#1c1b1b]'
                }`}
              >
                A-
              </button>
              <button
                onClick={() => setFontSizeClass('text-lg')}
                className={`w-7 h-7 flex items-center justify-center rounded font-sans text-xs font-bold ${
                  fontSizeClass === 'text-lg' ? 'bg-[#785600] text-white' : 'bg-[#f0eded] text-[#1c1b1b]'
                }`}
              >
                A
              </button>
              <button
                onClick={() => setFontSizeClass('text-xl')}
                className={`w-7 h-7 flex items-center justify-center rounded font-sans text-xs font-bold ${
                  fontSizeClass === 'text-xl' ? 'bg-[#785600] text-white' : 'bg-[#f0eded] text-[#1c1b1b]'
                }`}
              >
                A+
              </button>
            </div>
          </div>
        </aside>

        {/* Main Liturgical Text Column */}
        <main className="lg:col-span-8 bg-white p-6 md:p-12 rounded border border-[#d3c4af]/60 space-y-12">
          {/* Header Badge */}
          <header className="border-b border-[#d3c4af]/50 pb-6 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <span
                className="px-3 py-1 text-white font-sans text-xs font-bold uppercase tracking-widest rounded-full"
                style={{ backgroundColor: currentReading.colorHex }}
              >
                {currentReading.date} • {currentReading.colorName}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSavedBookmark(!savedBookmark)}
                  className={`p-2 rounded border transition-colors ${
                    savedBookmark
                      ? 'bg-[#785600] text-white border-[#785600]'
                      : 'border-[#d3c4af] text-[#817563] hover:text-[#1c1b1b]'
                  }`}
                  title="Salvar leitura"
                >
                  <Bookmark className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    alert('Link da liturgia copiado para a área de transferência!');
                  }}
                  className="p-2 rounded border border-[#d3c4af] text-[#817563] hover:text-[#1c1b1b] transition-colors"
                  title="Compartilhar"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-[#1c1b1b]">
              Liturgia Diária
            </h1>
            <p className="font-sans text-sm md:text-base text-[#785600] font-semibold">
              {currentReading.fullDateStr}
            </p>
          </header>

          {/* Primeira Leitura */}
          <section className="space-y-4">
            <div className="flex justify-between items-baseline border-b border-[#d3c4af]/30 pb-2">
              <h2 className="font-display text-2xl font-bold text-[#1c1b1b]">
                {currentReading.firstReading.title}
              </h2>
              <span className="font-sans text-xs font-bold text-[#785600] uppercase tracking-widest">
                {currentReading.firstReading.reference}
              </span>
            </div>

            {currentReading.firstReading.rubric && (
              <p className="font-sans text-sm italic text-[#817563]">
                {currentReading.firstReading.rubric}
              </p>
            )}

            <div className={`font-sans text-[#1c1b1b] leading-relaxed space-y-4 ${fontSizeClass}`}>
              {currentReading.firstReading.text.map((p, idx) => (
                <p key={idx} className={idx === 0 ? 'drop-cap' : ''}>
                  {p}
                </p>
              ))}
            </div>

            {currentReading.firstReading.response && (
              <p className="font-sans text-sm font-semibold text-[#785600] pt-2 border-t border-[#d3c4af]/30">
                {currentReading.firstReading.response}
              </p>
            )}
          </section>

          {/* Salmo Responsorial */}
          <section className="space-y-4 bg-[#fcf9f8] p-6 rounded border border-[#d3c4af]/50">
            <div className="flex justify-between items-baseline border-b border-[#d3c4af]/30 pb-2">
              <h2 className="font-display text-2xl font-bold text-[#1c1b1b]">Salmo Responsorial</h2>
              <span className="font-sans text-xs font-bold text-[#785600] uppercase tracking-widest">
                {currentReading.psalm.reference}
              </span>
            </div>

            <div className="p-4 bg-[#ffdea6]/30 border-l-4 border-[#785600] text-[#785600] font-sans font-bold text-base rounded-r">
              <span className="text-xs uppercase tracking-widest block font-sans text-[#817563] mb-1">
                R. Refrão:
              </span>
              — {currentReading.psalm.antiphon}
            </div>

            <div className={`font-sans text-[#1c1b1b] space-y-4 whitespace-pre-line leading-relaxed ${fontSizeClass}`}>
              {currentReading.psalm.stanzas.map((stanza, idx) => (
                <div key={idx} className="pl-4 border-l border-[#d3c4af]/40 italic">
                  {stanza}
                </div>
              ))}
            </div>
          </section>

          {/* Evangelho */}
          <section className="space-y-4">
            <div className="flex justify-between items-baseline border-b border-[#d3c4af]/30 pb-2">
              <h2 className="font-display text-2xl font-bold text-[#1c1b1b]">Evangelho</h2>
              <span className="font-sans text-xs font-bold text-[#785600] uppercase tracking-widest">
                {currentReading.gospel.reference}
              </span>
            </div>

            {/* Liturgical Dialogue */}
            <div className="space-y-1 font-sans text-sm font-semibold text-[#785600] bg-[#fcf9f8] p-4 rounded border border-[#d3c4af]/30">
              <p>{currentReading.gospel.dialogue.lordBeWithYou}</p>
              <p className="pl-4 text-[#1c1b1b]">{currentReading.gospel.dialogue.andWithYourSpirit}</p>
              <p className="pt-2">{currentReading.gospel.dialogue.gospelProclamation}</p>
              <p className="pl-4 text-[#1c1b1b]">{currentReading.gospel.dialogue.gloryToYou}</p>
            </div>

            {/* Gospel Content */}
            <div className={`font-sans text-[#1c1b1b] leading-relaxed space-y-4 ${fontSizeClass}`}>
              {currentReading.gospel.text.map((p, idx) => (
                <p key={idx} className={idx === 0 ? 'drop-cap' : ''}>
                  {p}
                </p>
              ))}
            </div>

            {/* Gospel Acclamation */}
            <div className="pt-4 border-t border-[#d3c4af]/40 font-sans text-sm font-bold text-[#785600] space-y-1">
              <p>{currentReading.gospel.acclamation}</p>
              <p className="text-[#1c1b1b]">{currentReading.gospel.praise}</p>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};
