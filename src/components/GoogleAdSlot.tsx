import React, { useEffect, useRef } from 'react';
import { Megaphone, ExternalLink, Sparkles } from 'lucide-react';

interface GoogleAdSlotProps {
  slotType: 'top' | 'middle' | 'sidebar' | 'bottom' | 'inline';
  adClient?: string;
  adSlot?: string;
  format?: 'auto' | 'rectangle' | 'horizontal' | 'vertical';
  isPreview?: boolean;
  className?: string;
  onConfigure?: () => void;
}

export const GoogleAdSlot: React.FC<GoogleAdSlotProps> = ({
  slotType,
  adClient = 'ca-pub-0000000000000000',
  adSlot,
  format = 'auto',
  isPreview = false,
  className = '',
  onConfigure
}) => {
  const adRef = useRef<HTMLDivElement>(null);
  const isRealAdConfigured = adClient && adClient !== 'ca-pub-0000000000000000' && adSlot && !isPreview;

  useEffect(() => {
    // 1. If Google AdSense is configured
    if (isRealAdConfigured) {
      try {
        // @ts-ignore
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (e) {
        console.warn('Google AdSense script push:', e);
      }
    }

    // 2. Trigger Adcash in-article AutoTag and Zone delivery
    try {
      // @ts-ignore
      if (typeof window !== 'undefined' && window.aclib) {
        // @ts-ignore
        window.aclib.runAutoTag({ zoneId: 'zlxbp9tnn8' });
        // @ts-ignore
        window.aclib.runAutoTag({ zoneId: 't7mdnha0np' });
      }
    } catch (err) {
      console.warn('Adcash execution notice:', err);
    }
  }, [isRealAdConfigured, slotType, adSlot]);

  // Labels and descriptions according to position
  const getSlotDetails = () => {
    switch (slotType) {
      case 'top':
        return {
          title: 'Anúncio Topo do Artigo',
          size: 'Banner Horizontal (Adcash zoneId: zlxbp9tnn8)',
          minHeight: 'min-h-[100px]',
          bg: 'bg-gradient-to-r from-amber-50/70 via-slate-50 to-amber-50/70'
        };
      case 'middle':
        return {
          title: 'Anúncio In-Article (Meio do Conteúdo)',
          size: 'Nativo In-Feed (Adcash zoneId: zlxbp9tnn8)',
          minHeight: 'min-h-[140px]',
          bg: 'bg-slate-50'
        };
      case 'sidebar':
        return {
          title: 'Anúncio Barra Lateral (Sidebar)',
          size: 'Display Vertical (Adcash zoneId: t7mdnha0np)',
          minHeight: 'min-h-[260px]',
          bg: 'bg-gradient-to-b from-slate-50 to-amber-50/40'
        };
      case 'bottom':
        return {
          title: 'Anúncio Rodapé do Artigo',
          size: 'Banner de Encerramento (Adcash zoneId: zlxbp9tnn8)',
          minHeight: 'min-h-[100px]',
          bg: 'bg-gradient-to-r from-slate-50 via-amber-50/50 to-slate-50'
        };
      default:
        return {
          title: 'Espaço de Anúncio Publicitário',
          size: 'Adcash AutoTag Zone',
          minHeight: 'min-h-[100px]',
          bg: 'bg-slate-50'
        };
    }
  };

  const details = getSlotDetails();

  return (
    <div
      ref={adRef}
      data-ad-slot-type={slotType}
      data-adcash-zone="zlxbp9tnn8"
      className={`w-full my-6 rounded-2xl overflow-hidden border border-dashed transition-all duration-300 ${
        isPreview
          ? 'border-amber-400/80 shadow-xs ring-2 ring-amber-400/20'
          : 'border-[#d3c4af]/80 shadow-xs'
      } ${details.bg} ${className}`}
    >
      <div className="flex items-center justify-between px-4 py-1.5 bg-slate-100/90 dark:bg-slate-800/80 border-b border-slate-200 text-[10px] uppercase font-bold tracking-wider text-slate-500">
        <span className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400">
          <Megaphone className="w-3 h-3" /> Publicidade
        </span>
        {isPreview && onConfigure && (
          <button
            type="button"
            onClick={onConfigure}
            className="text-[10px] text-amber-700 hover:text-amber-800 font-bold underline flex items-center gap-1 cursor-pointer"
          >
            <Sparkles className="w-2.5 h-2.5" /> Configurar Anúncio
          </button>
        )}
      </div>

      <div className={`p-4 flex flex-col items-center justify-center text-center ${details.minHeight}`}>
        {isRealAdConfigured ? (
          <ins
            className="adsbygoogle"
            style={{ display: 'block', width: '100%' }}
            data-ad-client={adClient}
            data-ad-slot={adSlot}
            data-ad-format={format}
            data-full-width-responsive="true"
          />
        ) : (
          <div className="adcash-zone-container w-full flex flex-col items-center justify-center py-2 space-y-1.5" data-zone-id="zlxbp9tnn8">
            <span className="text-xs font-bold text-[#785600] uppercase tracking-wider block">
              {details.title}
            </span>
            <span className="text-[11px] font-sans text-[#817563] block">
              {details.size}
            </span>
            <span className="inline-block text-[10px] font-semibold px-2.5 py-0.5 bg-amber-100/80 text-amber-900 rounded-full border border-amber-300">
              ✓ Zona Ativa Adcash: zlxbp9tnn8
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
