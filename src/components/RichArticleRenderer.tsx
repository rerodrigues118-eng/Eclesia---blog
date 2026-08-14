import React from 'react';
import { ArticleAdConfig } from '../types';
import { GoogleAdSlot } from './GoogleAdSlot';

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

  // Split by double newline or single newline to process paragraphs and custom tags
  const rawBlocks = content.split(/\n\n+/);
  const middleAdPos = adConfig?.middleAdParagraph || 3;
  let paragraphCount = 0;
  const hasManualAdTag = rawBlocks.some(b => /^\[anuncio(?::\s*[^\]]+)?\]$/i.test(b.trim()));

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

      // Check if part1 is a width like "300px", "50%", "400"
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

  return (
    <div className="rich-article-content font-sans text-[#1c1b1b] text-base md:text-lg leading-relaxed space-y-6 pt-2 clearfix">
      {rawBlocks.map((block, index) => {
        const trimmed = block.trim();
        if (!trimmed) return null;

        // Custom Ad Tag: [anuncio] or [anuncio: meio] or [adsense]
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

        // 1. Tag [img-esquerda: URL_OU_ID | (OPCIONAL: LARGURA) | (OPCIONAL: LEGENDA)]
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
              />
              {caption && (
                <figcaption className="text-center font-sans text-xs text-[#817563] italic pt-2 px-2">
                  {caption}
                </figcaption>
              )}
            </figure>
          );
        }

        // 2. Tag [img-direita: URL_OU_ID | (OPCIONAL: LARGURA) | (OPCIONAL: LEGENDA)]
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
              />
              {caption && (
                <figcaption className="text-center font-sans text-xs text-[#817563] italic pt-2 px-2">
                  {caption}
                </figcaption>
              )}
            </figure>
          );
        }

        // 3. Tag [img-centro: URL_OU_ID | (OPCIONAL: LARGURA) | (OPCIONAL: LEGENDA)]
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
              />
              {caption && (
                <figcaption className="font-sans text-xs text-[#817563] italic pt-2">
                  {caption}
                </figcaption>
              )}
            </figure>
          );
        }

        // 4. Headings: # H1, ## H2, ### H3, #### H4
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

        // 5. Citação Sacra / Frase de Santo (> ...)
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

        // 6. Divisor Decorativo (--- ou ⸻)
        if (trimmed === '---' || trimmed === '⸻') {
          return (
            <div key={index} className="my-6 sm:my-8 clear-both flex items-center justify-center gap-3 text-[#d3c4af]">
              <span className="w-12 sm:w-16 h-px bg-[#d3c4af]" />
              <span className="text-sm font-bold text-[#785600]">✤ ✤ ✤</span>
              <span className="w-12 sm:w-16 h-px bg-[#d3c4af]" />
            </div>
          );
        }

        // 7. Regular Paragraph
        paragraphCount++;
        const isMiddleAdTarget = !hasManualAdTag && adConfig?.showMiddleAd && paragraphCount === middleAdPos;

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

      {/* Clearfix spacer */}
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
          style={{ fontSize: `clamp(14px, ${sizePx}px, ${sizePx}px)`, lineHeight: 1.3 }}
          className="font-bold inline-block my-1 text-[#1c1b1b] max-w-full break-words"
        >
          {innerText}
        </span>
      );
    }

    // Bold: **text**
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-bold text-[#1c1b1b] break-words">{part.slice(2, -2)}</strong>;
    }

    // Italic: *text*
    if (part.startsWith('*') && part.endsWith('*')) {
      return <em key={i} className="italic text-[#4f4535] break-words">{part.slice(1, -1)}</em>;
    }

    // Handle single newlines inside paragraph
    if (part.includes('\n')) {
      const lineSegments = part.split('\n');
      return (
        <React.Fragment key={i}>
          {lineSegments.map((segment, segIdx) => (
            <React.Fragment key={segIdx}>
              {segment}
              {segIdx < lineSegments.length - 1 && <br />}
            </React.Fragment>
          ))}
        </React.Fragment>
      );
    }

    return part;
  });
}
