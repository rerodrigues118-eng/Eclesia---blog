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
    if (isRealAdConfigured) {
      try {
        // @ts-ignore
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (e) {
        console.warn('Google AdSense script push:', e);
      }
    }
  }, [isRealAdConfigured, slotType, adSlot]);

  // Labels and descriptions according to position
  const getSlotDetails = () => {
    switch (slotType) {
      case 'top':
        return {
          title: 'Anúncio Topo do Artigo',
          size: 'Banner Horizontal Responsivo (728x90 / 970x90)',
          minHeight: 'min-h-[100px]',
          bg: 'bg-gradient-to-r from-amber-50/70 via-slate-50 to-amber-50/70'
        };
      case 'middle':
        return {
          title: 'Anúncio In-Article (Meio do Conteúdo)',
          size: 'Nativo In-Feed / Retângulo Médio (336x280 / Fluido)',
          minHeight: 'min-h-[140px]',
          bg: 'bg-slate-50'
        };
      case 'sidebar':
        return {
          title: 'Anúncio Barra Lateral (Sidebar)',
          size: 'Display Vertical (300x250 / 300x600)',
          minHeight: 'min-h-[260px]',
          bg: 'bg-gradient-to-b from-slate-50 to-amber-50/40'
        };
      case 'bottom':
        return {
          title: 'Anúncio Rodapé do Artigo',
          size: 'Banner de Encerramento (728x90 / Responsivo)',
          minHeight: 'min-h-[100px]',
          bg: 'bg-gradient-to-r from-slate-50 via-amber-50/50 to-slate-50'
        };
      default:
        return {
          title: 'Espaço de Anúncio Google Ads',
          size: 'Formato Responsivo',
          minHeight: 'min-h-[100px]',
          bg: 'bg-slate-50'
        };
    }
  };

  const details = getSlotDetails();

  return (
    <div
      ref={adRef}
      className={`w-full my-6 rounded-2xl overflow-hidden border border-dashed transition-all duration-300 ${
        isPreview
          ? 'border-amber-400/80 shadow-xs ring-2 ring-amber-400/20'
          : 'border-slate-200'
      } ${details.bg} ${className}`}
    >
      <div className="flex items-center justify-between px-4 py-1.5 bg-slate-100/90 dark:bg-slate-800/80 border-b border-slate-200 text-[10px] uppercase font-bold tracking-wider text-slate-500">
        <span className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400">
          <Megaphone className="w-3 h-3" /> Publicidade Google Ads
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
          <div className="space-y-1.5 max-w-md py-2">
            <span className="text-xs font-bold text-slate-800 block">
              {details.title}
            </span>
            <span className="text-[11px] font-mono text-slate-500 block">
              {details.size}
            </span>
            {isPreview && (
              <span className="inline-block text-[10px] font-bold px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full">
                Posição Ativa • Visível no Artigo Publicado
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
