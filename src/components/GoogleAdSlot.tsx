import React, { useEffect, useRef } from 'react';
import { Megaphone, Sparkles } from 'lucide-react';
import { initAdcashIfConsented } from '../lib/adcash';

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
  const isRealAdConfigured = Boolean(adClient && adClient !== 'ca-pub-0000000000000000' && adSlot && !isPreview);

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

    // 2. Garante que o Adcash esteja carregado globalmente com consentimento
    if (!isPreview) {
      initAdcashIfConsented();
    }
  }, [isRealAdConfigured, isPreview]);

  // Dimensões fixas rigorosas por formato para eliminar Cumulative Layout Shift (CLS)
  const getSlotDetails = () => {
    switch (slotType) {
      case 'top':
        return {
          title: 'Anúncio Topo do Artigo',
          size: 'Leaderboard (728x90 / Banner)',
          heightClass: 'h-[90px] sm:h-[100px]',
          zoneId: '42nihnnc5l'
        };
      case 'middle':
        return {
          title: 'Anúncio In-Article (Meio do Conteúdo)',
          size: 'Display Nativo In-Feed',
          heightClass: 'h-[140px]',
          zoneId: '42nihnnc5l'
        };
      case 'sidebar':
        return {
          title: 'Anúncio Barra Lateral (Sidebar)',
          size: 'Retângulo Médio / Vertical (300x250)',
          heightClass: 'h-[250px]',
          zoneId: '42nihnnc5l'
        };
      case 'bottom':
        return {
          title: 'Anúncio Rodapé do Artigo',
          size: 'Banner Horizontal de Encerramento',
          heightClass: 'h-[100px]',
          zoneId: '42nihnnc5l'
        };
      default:
        return {
          title: 'Espaço Publicitário',
          size: 'Adcash Zone',
          heightClass: 'h-[100px]',
          zoneId: '42nihnnc5l'
        };
    }
  };

  const details = getSlotDetails();

  return (
    <div
      ref={adRef}
      data-ad-slot-type={slotType}
      data-adcash-zone={details.zoneId}
      className={`w-full my-6 rounded-2xl overflow-hidden border transition-all duration-300 ${
        isPreview
          ? 'border-dashed border-amber-400/80 bg-amber-50/40 shadow-xs ring-2 ring-amber-400/20'
          : 'border-[#d3c4af]/40 bg-[#faf8f6]/50 shadow-xs'
      } ${className}`}
    >
      <div className="flex items-center justify-between px-4 py-1.5 bg-stone-100/90 border-b border-stone-200 text-[10px] uppercase font-bold tracking-wider text-stone-500">
        <span className="flex items-center gap-1.5 text-[#785600]">
          <Megaphone className="w-3 h-3" /> Publicidade
        </span>
        {isPreview && onConfigure && (
          <button
            type="button"
            onClick={onConfigure}
            className="text-[10px] text-[#785600] hover:underline font-bold flex items-center gap-1 cursor-pointer"
          >
            <Sparkles className="w-2.5 h-2.5" /> Configurar Anúncio
          </button>
        )}
      </div>

      <div className={`w-full flex items-center justify-center ${details.heightClass} overflow-hidden`}>
        {isRealAdConfigured ? (
          <ins
            className="adsbygoogle"
            style={{ display: 'block', width: '100%', height: '100%' }}
            data-ad-client={adClient}
            data-ad-slot={adSlot}
            data-ad-format={format}
            data-full-width-responsive="true"
          />
        ) : isPreview ? (
          /* Preview explicativo visível SOMENTE no modal administrativo */
          <div className="w-full flex flex-col items-center justify-center p-3 text-center space-y-1">
            <span className="text-xs font-bold text-[#785600] uppercase tracking-wider block">
              {details.title}
            </span>
            <span className="text-[11px] font-sans text-stone-600 block">
              {details.size}
            </span>
            <span className="text-[10px] font-mono text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md border border-amber-300">
              Zona Adcash: {details.zoneId}
            </span>
          </div>
        ) : (
          /* Container limpo para inserção dinâmica da rede sem texto de placeholder */
          <div
            className="adcash-zone-container w-full h-full flex items-center justify-center"
            data-zone-id={details.zoneId}
          />
        )}
      </div>
    </div>
  );
};
