import React from 'react';
import { ArticleAdConfig } from '../types';
import { GoogleAdSlot } from './GoogleAdSlot';
import { Sparkles, BookOpen } from 'lucide-react';

interface RichArticleRendererProps {
  content: string;
  mediaMap?: Record<string, string>;
  adConfig?: ArticleAdConfig;
  isPreview?: boolean;
  onConfigureAd?: (slot: string) => void;
}

export const RichArticleRenderer: React.FC<RichArticleRendererProps> = ({
  content,
  mediaMap = {},
  adConfig,
  isPreview = false,
  onConfigureAd
}) => {
  if (!content) return null;

  // Separa o conteúdo em blocos estruturados
  const rawBlocks = content.split(/\n\n+/);
  const targetAdParagraph = adConfig?.middleAdParagraph || 3;
  const hasManualAdTag = rawBlocks.some(b => /^\[(anuncio|adsense)(?::\s*[^\]]+)?\]$/i.test(b.trim()));

  // Helper para identificar se um bloco é devocional/sagrado (onde anúncios NUNCA devem ser colados)
  const isSacredBlock = (text: string): boolean => {
    const t = text.trim();
    return (
      t.startsWith('>') ||
      /^\[oracao(?::\s*[^\]]+)?\]/i.test(t) ||
      /^\[citacao_biblica(?::\s*[^\]]+)?\]/i.test(t) ||
      t.startsWith('#') ||
      t === '---' ||
      t === '⸻'
    );
  };

  // Helper to resolve media URL (handles short IDs like "img-1", "1" or direct URLs / base64)
  const resolveImgUrl = (ref: string): string => {
    const cleanRef = ref.trim();
    if (mediaMap[cleanRef]) return mediaMap[cleanRef];
    if (mediaMap[`img-${cleanRef}`]) return mediaMap[`img-${cleanRef}`];
    return cleanRef;
  };

  // Helper to parse width from parts (e.g., "300px", "300", "50%", "450px")
  const parseWidthAndCaption = (parts: string[]) => {
    let width = '340px';
    let caption = '';

    if (parts.length >= 2) {
      const part1 = parts[0].trim();
      const part2 = parts.slice(1).join('|').trim();

      if (/^(\d+px|\d+%|\d+)$/i.test(part1)) {
        width = part1.endsWith('px') || part1.endsWith('%') ? part1 : `${part1}px`;
        caption = part2;
      } else {
        caption = `${part1} ${part2}`;
      }
    } else if (parts.length === 1) {
      const part = parts[0].trim();
      if (/^(\d+px|\d+%|\d+)$/i.test(part)) {
        width = part.endsWith('px') || part.endsWith('%') ? part : `${part}px`;
      } else {
        caption = part;
      }
    }

    return { width, caption };
  };

  let paragraphCount = 0;
  let adInserted = false;

  return (
    <div className="rich-article-content font-sans text-[#1c1b1b] text-base md:text-lg leading-relaxed space-y-6 pt-2 clearfix">
      {rawBlocks.map((block, index) => {
        const trimmed = block.trim();
        if (!trimmed) return null;

        // Custom Ad Tag Manual: [anuncio] ou [anuncio: meio]
        if (/^\[(anuncio|adsense)(?::\s*([^\]]+))?\]$/i.test(trimmed)) {
          return (
            <GoogleAdSlot
              key={`ad-manual-${index}`}
              slotType="middle"
              adClient={adConfig?.adClient}
              adSlot={adConfig?.middleSlotId}
              isPreview={isPreview}
              onConfigure={onConfigureAd ? () => onConfigureAd('middle') : undefined}
            />
          );
        }

        // 1. Tag [ORACAO: Título (opcional)] ... [/ORACAO]
        const oracaoMatch = trimmed.match(/^\[oracao(?::\s*([^\]]+))?\]([\s\S]*?)(?:\[\/oracao\]|$)/i);
        if (oracaoMatch) {
          const prayerTitle = oracaoMatch[1]?.trim() || 'Oração Devocional';
          const prayerBody = oracaoMatch[2]?.trim() || '';

          return (
            <div
              key={index}
              className="my-8 bg-gradient-to-br from-amber-50/80 via-white to-amber-50/50 border-2 border-[#785600]/40 rounded-3xl p-6 md:p-8 shadow-xs relative overflow-hidden"
            >
              <div className="flex items-center gap-2 mb-3 text-[#785600]">
                <Sparkles className="w-4 h-4" />
                <span className="font-sans text-xs font-bold uppercase tracking-widest">{prayerTitle}</span>
              </div>
              <p className="font-serif italic text-base md:text-lg text-[#2e261d] leading-relaxed whitespace-pre-line">
                {formatInlineText(prayerBody)}
              </p>
            </div>
          );
        }

        // 2. Tag [CITACAO_BIBLICA: Referência] ... [/CITACAO_BIBLICA]
        const bibliaMatch = trimmed.match(/^\[citacao_biblica(?::\s*([^\]]+))?\]([\s\S]*?)(?:\[\/citacao_biblica\]|$)/i);
        if (bibliaMatch) {
          const refTitle = bibliaMatch[1]?.trim() || 'Sagrada Escritura';
          const quoteBody = bibliaMatch[2]?.trim() || '';

          return (
            <blockquote
              key={index}
              className="my-6 p-6 bg-[#fbf8f5] border-l-4 border-[#785600] rounded-r-2xl shadow-xs space-y-2"
            >
              <div className="flex items-center gap-2 text-[#785600] text-xs font-bold uppercase tracking-wider">
                <BookOpen className="w-3.5 h-3.5" />
                <span>{refTitle}</span>
              </div>
              <p className="font-serif italic text-base md:text-lg text-[#1c1b1b] leading-relaxed">
                "{formatInlineText(quoteBody)}"
              </p>
            </blockquote>
          );
        }

        // 3. Imagem Esquerda: [img-esquerda: URL_OU_ID | LARGURA | LEGENDA]
        const leftImgMatch = trimmed.match(/^\[img-esquerda:\s*([^|\]]+)(?:\|\s*([^\]]+))?\]$/i);
        if (leftImgMatch) {
          const rawRef = leftImgMatch[1].trim();
          const restParts = leftImgMatch[2] ? leftImgMatch[2].split('|') : [];
          const { width, caption } = parseWidthAndCaption(restParts);
          const url = resolveImgUrl(rawRef);

          return (
            <figure
              key={index}
              style={{ width: width && width !== '100%' ? width : undefined }}
              className="float-none sm:float-left sm:mr-8 mb-6 sm:mb-4 w-full sm:w-[340px] max-w-full rounded-2xl overflow-hidden border border-[#d3c4af] shadow-md bg-white p-2"
            >
              <img
                src={url}
                alt={caption || 'Ilustração do artigo'}
                className="w-full h-auto max-h-[420px] object-cover rounded-xl"
                loading="lazy"
                decoding="async"
              />
              {caption && (
                <figcaption className="text-center font-sans text-xs text-[#817563] italic pt-2 px-2">
                  {caption}
                </figcaption>
              )}
            </figure>
          );
        }

        // 4. Imagem Direita: [img-direita: URL_OU_ID | LARGURA | LEGENDA]
        const rightImgMatch = trimmed.match(/^\[img-direita:\s*([^|\]]+)(?:\|\s*([^\]]+))?\]$/i);
        if (rightImgMatch) {
          const rawRef = rightImgMatch[1].trim();
          const restParts = rightImgMatch[2] ? rightImgMatch[2].split('|') : [];
          const { width, caption } = parseWidthAndCaption(restParts);
          const url = resolveImgUrl(rawRef);

          return (
            <figure
              key={index}
              style={{ width: width && width !== '100%' ? width : undefined }}
              className="float-none sm:float-right sm:ml-8 mb-6 sm:mb-4 w-full sm:w-[340px] max-w-full rounded-2xl overflow-hidden border border-[#d3c4af] shadow-md bg-white p-2"
            >
              <img
                src={url}
                alt={caption || 'Ilustração do artigo'}
                className="w-full h-auto max-h-[420px] object-cover rounded-xl"
                loading="lazy"
                decoding="async"
              />
              {caption && (
                <figcaption className="text-center font-sans text-xs text-[#817563] italic pt-2 px-2">
                  {caption}
                </figcaption>
              )}
            </figure>
          );
        }

        // 5. Imagem Central: [img-centro: URL_OU_ID | LARGURA | LEGENDA]
        const centerImgMatch = trimmed.match(/^\[img-centro:\s*([^|\]]+)(?:\|\s*([^\]]+))?\]$/i);
        if (centerImgMatch) {
          const rawRef = centerImgMatch[1].trim();
          const restParts = centerImgMatch[2] ? centerImgMatch[2].split('|') : [];
          const { width, caption } = parseWidthAndCaption(restParts);
          const url = resolveImgUrl(rawRef);

          return (
            <figure
              key={index}
              style={{ width: width && width !== '340px' ? width : undefined, maxWidth: '100%' }}
              className="my-6 sm:my-8 clear-both w-full max-w-2xl mx-auto rounded-2xl overflow-hidden border border-[#d3c4af] shadow-md bg-white p-2 text-center"
            >
              <img
                src={url}
                alt={caption || 'Ilustração do artigo'}
                className="w-full h-auto max-h-[500px] object-cover rounded-xl mx-auto"
                loading="lazy"
                decoding="async"
              />
              {caption && (
                <figcaption className="font-sans text-xs text-[#817563] italic pt-2">
                  {caption}
                </figcaption>
              )}
            </figure>
          );
        }

        // 6. Headings (#, ##, ###, ####)
        if (trimmed.startsWith('#### ')) {
          return (
            <h4 key={index} className="font-display text-base sm:text-lg lg:text-xl font-bold text-[#1c1b1b] mt-6 mb-2 tracking-tight break-words">
              {formatInlineText(trimmed.replace('#### ', ''))}
            </h4>
          );
        }
        if (trimmed.startsWith('### ')) {
          return (
            <h3 key={index} className="font-display text-lg sm:text-xl lg:text-2xl font-bold text-[#785600] mt-8 mb-3 tracking-tight break-words">
              {formatInlineText(trimmed.replace('### ', ''))}
            </h3>
          );
        }
        if (trimmed.startsWith('## ')) {
          return (
            <h2 key={index} className="font-display text-xl sm:text-2xl lg:text-3xl font-bold text-[#1c1b1b] mt-8 sm:mt-10 mb-3 sm:mb-4 tracking-tight border-b border-[#d3c4af]/40 pb-2 break-words">
              {formatInlineText(trimmed.replace('## ', ''))}
            </h2>
          );
        }
        if (trimmed.startsWith('# ')) {
          return (
            <h1 key={index} className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-[#1c1b1b] mt-8 sm:mt-10 mb-3 sm:mb-4 tracking-tight break-words">
              {formatInlineText(trimmed.replace('# ', ''))}
            </h1>
          );
        }

        // 7. Citação Tradicional (> ...)
        if (trimmed.startsWith('>')) {
          return (
            <blockquote
              key={index}
              className="my-4 sm:my-6 p-4 sm:p-6 bg-gradient-to-r from-amber-50 to-[#fcf9f8] border-l-4 border-[#785600] rounded-r-2xl shadow-xs"
            >
              <p className="font-serif italic text-sm sm:text-base md:text-lg text-[#4f4535] leading-relaxed break-words">
                "{formatInlineText(trimmed.replace(/^>\s*/, ''))}"
              </p>
            </blockquote>
          );
        }

        // 8. Divisor Decorativo
        if (trimmed === '---' || trimmed === '⸻') {
          return (
            <div key={index} className="my-6 sm:my-8 clear-both flex items-center justify-center gap-3 text-[#d3c4af]">
              <span className="w-12 sm:w-16 h-px bg-[#d3c4af]" />
              <span className="text-sm font-bold text-[#785600]">✤ ✤ ✤</span>
              <span className="w-12 sm:w-16 h-px bg-[#d3c4af]" />
            </div>
          );
        }

        // 9. Parágrafo Regular com Injeção Inteligente de Anúncio
        paragraphCount++;

        // Checa se o bloco anterior ou o próximo é sagrado/oração para evitar anúncios colados
        const prevBlockIsSacred = index > 0 && isSacredBlock(rawBlocks[index - 1]);
        const nextBlockIsSacred = index < rawBlocks.length - 1 && isSacredBlock(rawBlocks[index + 1]);
        const canInsertAdHere = !hasManualAdTag && adConfig?.showMiddleAd && !adInserted && !prevBlockIsSacred && !nextBlockIsSacred;

        const isMiddleAdTarget = canInsertAdHere && paragraphCount >= targetAdParagraph;
        if (isMiddleAdTarget) {
          adInserted = true;
        }

        return (
          <React.Fragment key={index}>
            <p className="font-sans text-sm sm:text-base md:text-lg text-[#1c1b1b] leading-relaxed break-words">
              {formatInlineText(trimmed)}
            </p>
            {isMiddleAdTarget && (
              <GoogleAdSlot
                slotType="middle"
                adClient={adConfig?.adClient}
                adSlot={adConfig?.middleSlotId}
                isPreview={isPreview}
                onConfigure={onConfigureAd ? () => onConfigureAd('middle') : undefined}
              />
            )}
          </React.Fragment>
        );
      })}

      <div className="clear-both" />
    </div>
  );
};

// Helper for inline formatting: Custom Font Sizes [tam-XX: text], **bold**, *italic*, newlines
function formatInlineText(text: string): React.ReactNode {
  const pattern = /(\[tam-\d+:\s*[^\]]+\]|\*\*[^*]+\*\*|\*[^*]+\*)/g;
  const parts = text.split(pattern);

  return parts.map((part, i) => {
    if (!part) return null;

    // Custom Font Size: [tam-32: Texto]
    const sizeMatch = part.match(/^\[tam-(\d+):\s*([^\]]+)\]$/);
    if (sizeMatch) {
      const sizePx = parseInt(sizeMatch[1], 10);
      const innerText = sizeMatch[2];
      return (
        <span
          key={i}
          style={{ fontSize: `${sizePx}px`, lineHeight: '1.2' }}
          className="inline-block font-display font-bold my-1 text-[#785600]"
        >
          {innerText}
        </span>
      );
    }

    // Bold **text**
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      return (
        <strong key={i} className="font-bold text-[#1c1b1b]">
          {part.slice(2, -2)}
        </strong>
      );
    }

    // Italic *text*
    if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
      return (
        <em key={i} className="italic text-[#4f4535]">
          {part.slice(1, -1)}
        </em>
      );
    }

    return part;
  });
}
