import React, { useRef, useEffect, useState } from 'react';
import { Download, Share2, Copy, X, Sparkles, Check, Image as ImageIcon } from 'lucide-react';

export interface SocialCardData {
  quote: string;
  author: string;
  subtitle?: string;
  dateStr?: string;
}

interface SocialCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: SocialCardData;
}

type CardTheme = 'bordo' | 'dourado' | 'monastico' | 'verde';

const THEMES: { id: CardTheme; name: string; bgColors: [string, string]; accent: string; text: string }[] = [
  {
    id: 'bordo',
    name: 'Bordô Sacro',
    bgColors: ['#3b0c11', '#1f0407'],
    accent: '#f3c877',
    text: '#ffffff'
  },
  {
    id: 'monastico',
    name: 'Noite Monástica',
    bgColors: ['#181513', '#0e0c0b'],
    accent: '#d4af37',
    text: '#f5efe6'
  },
  {
    id: 'dourado',
    name: 'Ouro Litúrgico',
    bgColors: ['#4a370e', '#291d05'],
    accent: '#ffd98a',
    text: '#ffffff'
  },
  {
    id: 'verde',
    name: 'Esperança Verde',
    bgColors: ['#0d2b18', '#05140b'],
    accent: '#7be09c',
    text: '#ffffff'
  }
];

export const SocialCardModal: React.FC<SocialCardModalProps> = ({
  isOpen,
  onClose,
  data
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [selectedTheme, setSelectedTheme] = useState<CardTheme>('bordo');
  const [copiedText, setCopiedText] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Resolução de alta fidelidade: 1080 x 1080 (Square Instagram & WhatsApp)
    const size = 1080;
    canvas.width = size;
    canvas.height = size;

    const theme = THEMES.find((t) => t.id === selectedTheme) || THEMES[0];

    // 1. Fundo com Gradiente Nobre
    const gradient = ctx.createLinearGradient(0, 0, size, size);
    gradient.addColorStop(0, theme.bgColors[0]);
    gradient.addColorStop(1, theme.bgColors[1]);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);

    // 2. Moldura Ornamentada Dupla
    ctx.strokeStyle = theme.accent;
    ctx.lineWidth = 4;
    ctx.strokeRect(50, 50, size - 100, size - 100);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(65, 65, size - 130, size - 130);

    // 3. Cantoneiras Clássicas da Moldura
    const cornerSize = 25;
    ctx.fillStyle = theme.accent;
    // Top-Left
    ctx.fillRect(45, 45, cornerSize, 4);
    ctx.fillRect(45, 45, 4, cornerSize);
    // Top-Right
    ctx.fillRect(size - 45 - cornerSize, 45, cornerSize, 4);
    ctx.fillRect(size - 49, 45, 4, cornerSize);
    // Bottom-Left
    ctx.fillRect(45, size - 49, cornerSize, 4);
    ctx.fillRect(45, size - 45 - cornerSize, 4, cornerSize);
    // Bottom-Right
    ctx.fillRect(size - 45 - cornerSize, size - 49, cornerSize, 4);
    ctx.fillRect(size - 49, size - 45 - cornerSize, 4, cornerSize);

    // 4. Marca d'água / Cruz Central ao Fundo (Sutil)
    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.font = 'bold 360px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('✟', size / 2, size / 2 - 20);
    ctx.restore();

    // 5. Header: Logo Cruz e "ECLESIA • PORTAL CATÓLICO"
    ctx.textAlign = 'center';
    ctx.fillStyle = theme.accent;
    ctx.font = 'bold 28px serif';
    ctx.fillText('✟', size / 2, 120);

    ctx.fillStyle = theme.accent;
    ctx.font = 'bold 20px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.letterSpacing = '6px';
    ctx.fillText('ECLESIA', size / 2, 160);

    ctx.font = '13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.letterSpacing = '3px';
    ctx.fillText('eclesia.blog', size / 2, 185);

    // Linha divisória ornamental
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(size / 2 - 120, 215);
    ctx.lineTo(size / 2 + 120, 215);
    ctx.stroke();

    // 6. Aspas Ornamentais
    ctx.fillStyle = theme.accent;
    ctx.font = 'italic 70px Georgia, serif';
    ctx.fillText('“', size / 2, 290);

    // 7. Texto da Citação (Quebra de Linhas Automática)
    ctx.fillStyle = theme.text;
    ctx.font = 'italic 34px Georgia, "Playfair Display", serif';
    ctx.letterSpacing = '0px';

    const cleanQuote = data.quote.replace(/^["“]|["”]$/g, '').trim();
    const maxWidth = 800;
    const lineHeight = 52;
    const words = cleanQuote.split(' ');
    let line = '';
    const lines: string[] = [];

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;
      if (testWidth > maxWidth && n > 0) {
        lines.push(line.trim());
        line = words[n] + ' ';
      } else {
        line = testLine;
      }
    }
    lines.push(line.trim());

    // Se a citação for longa, ajusta o tamanho da fonte
    if (lines.length > 7) {
      ctx.font = 'italic 26px Georgia, "Playfair Display", serif';
    }

    // Calcula Y para centralizar verticalmente no espaço disponível (330 a 820)
    const textBlockHeight = lines.length * lineHeight;
    const startY = Math.max(340, 520 - textBlockHeight / 2);

    for (let i = 0; i < lines.length; i++) {
      ctx.fillText(lines[i], size / 2, startY + i * lineHeight);
    }

    // 8. Autor / Santo e Subtítulo
    const authorY = Math.min(880, startY + textBlockHeight + 70);

    ctx.fillStyle = theme.accent;
    ctx.font = 'bold 30px "Cinzel", Georgia, serif';
    ctx.fillText(`— ${data.author} —`, size / 2, authorY);

    if (data.subtitle || data.dateStr) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.font = '16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.letterSpacing = '1px';
      ctx.fillText(data.subtitle || data.dateStr || '', size / 2, authorY + 36);
    }

    // 9. Rodapé
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.font = '12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.letterSpacing = '2px';
    ctx.fillText('EVANGELIZAÇÃO CATÓLICA DIGITAL • ECLESIA.BLOG', size / 2, 995);

    // Exporta imagem para preview
    try {
      const url = canvas.toDataURL('image/png');
      setGeneratedImageUrl(url);
    } catch (e) {
      console.warn('Erro ao gerar dataURL:', e);
    }
  }, [isOpen, selectedTheme, data]);

  if (!isOpen) return null;

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const url = canvasRef.current.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `eclesia-card-${data.author.toLowerCase().replace(/[^a-z0-9]/g, '-')}.png`;
    link.href = url;
    link.click();
  };

  const handleCopyQuote = () => {
    const text = `"${data.quote}"\n— ${data.author}\n\nVia Portal Católico Eclesia (https://eclesia.blog)`;
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2500);
  };

  const handleShareWhatsApp = () => {
    const text = `"${data.quote}"\n\n— *${data.author}*\n\nLeia mais no Portal Eclesia: https://eclesia.blog`;
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-fade-in text-[#1c1b1b] dark:text-[#f3ede2]">
      <div className="bg-white dark:bg-[#1a1714] border border-[#d3c4af] dark:border-[#383027] rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative space-y-6 max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-[#817563] hover:text-[#1c1b1b] dark:hover:text-white rounded-full cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div>
          <span className="text-xs uppercase tracking-widest font-bold text-[#785600] dark:text-[#ffdea6] flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> Gerador de Cards Sacros
          </span>
          <h3 className="font-display text-2xl font-bold text-[#785600] dark:text-[#f3c877] mt-0.5">
            Compartilhar no Instagram & WhatsApp
          </h3>
          <p className="text-xs text-[#817563] dark:text-[#a89d8d]">
            Card visual gerado em resolução quadrada (1080×1080) pronto para postar ou enviar no WhatsApp.
          </p>
        </div>

        {/* Theme Picker */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[#4f4535] dark:text-[#d3c4af]">
            Escolha a Cor Litúrgica do Card:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {THEMES.map((theme) => (
              <button
                key={theme.id}
                onClick={() => setSelectedTheme(theme.id)}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  selectedTheme === theme.id
                    ? 'border-[#785600] ring-2 ring-[#785600]/30 shadow-xs'
                    : 'border-[#d3c4af]/60 dark:border-[#383027] opacity-80 hover:opacity-100'
                }`}
                style={{
                  background: `linear-gradient(135deg, ${theme.bgColors[0]}, ${theme.bgColors[1]})`,
                  color: theme.text
                }}
              >
                <span>{theme.name}</span>
                {selectedTheme === theme.id && <Check className="w-3.5 h-3.5 text-amber-400" />}
              </button>
            ))}
          </div>
        </div>

        {/* Canvas & Live Preview */}
        <div className="flex justify-center bg-[#141210] p-3 rounded-2xl border border-[#383027]">
          {/* Hidden Canvas (renders at full 1080x1080 resolution) */}
          <canvas ref={canvasRef} className="hidden" />

          {/* Rendered Preview Image */}
          {generatedImageUrl ? (
            <img
              src={generatedImageUrl}
              alt="Pré-visualização do card para redes sociais"
              className="w-full max-w-[340px] aspect-square rounded-xl shadow-lg border border-amber-900/40 object-contain"
            />
          ) : (
            <div className="w-[340px] aspect-square rounded-xl flex items-center justify-center text-xs text-stone-500">
              Gerando card sacro...
            </div>
          )}
        </div>

        {/* Actions Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <button
            onClick={handleDownload}
            className="py-3 px-4 rounded-xl bg-[#785600] hover:bg-[#5f4400] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Baixar Imagem</span>
          </button>

          <button
            onClick={handleShareWhatsApp}
            className="py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-colors cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
            <span>WhatsApp</span>
          </button>

          <button
            onClick={handleCopyQuote}
            className="py-3 px-4 rounded-xl bg-[#f6f3f2] dark:bg-[#28231d] hover:bg-amber-50 dark:hover:bg-[#332c24] border border-[#d3c4af]/80 dark:border-[#383027] text-[#785600] dark:text-[#ffdea6] text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Copy className="w-4 h-4" />
            <span>{copiedText ? 'Copiado!' : 'Copiar Texto'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
