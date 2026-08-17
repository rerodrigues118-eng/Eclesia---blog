import React, { useState, useEffect } from 'react';
import { ShieldCheck, Cookie, X, CheckCircle, Heart } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase/client';
import { ActiveView } from '../types';
import { initAdcashIfConsented } from '../lib/adcash';

interface CookieBannerProps {
  onOpenPrivacy?: () => void;
  setActiveView?: (view: ActiveView) => void;
}

const COOKIE_CONSENT_KEY = 'eclesia_cookie_consent_v1';

export const CookieBanner: React.FC<CookieBannerProps> = ({ setActiveView }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isThanked, setIsThanked] = useState(false);

  useEffect(() => {
    // Check if consent is already given in localStorage
    const savedConsent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!savedConsent) {
      // Delay slightly for smooth entrance
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      // Inicializa anúncios se o consentimento anterior foi concedido
      initAdcashIfConsented();
    }
  }, []);

  const handleConsent = async (consentType: 'all' | 'essential') => {
    setIsSaving(true);
    const consentData = {
      accepted: true,
      type: consentType,
      timestamp: new Date().toISOString(),
    };

    // 1. Save to local storage immediately
    try {
      localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(consentData));
      if (consentType === 'all') {
        initAdcashIfConsented();
      }
    } catch (err) {
      console.warn('LocalStorage error:', err);
    }

    // 2. Record to Supabase DB if configured
    if (isSupabaseConfigured) {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        await supabase.from('cookie_consents').insert({
          user_id: session?.user?.id || null,
          consent_type: consentType,
          user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
          accepted_at: new Date().toISOString(),
        });
      } catch (dbError) {
        console.warn('Could not record cookie consent to database:', dbError);
      }
    }

    setIsSaving(false);
    setIsThanked(true);

    // Keep thank you message visible for 1.8 seconds before closing
    setTimeout(() => {
      setIsVisible(false);
    }, 1800);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-3 left-3 right-3 sm:bottom-6 sm:left-6 sm:right-6 lg:left-auto lg:right-6 lg:max-w-xl z-50 animate-slide-up">
      <div className="bg-white border-2 border-[#d3c4af] rounded-3xl p-5 sm:p-6 shadow-2xl text-[#1c1b1b] space-y-4 relative overflow-hidden">
        {/* Decorative Golden Top Accent */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#785600] via-[#f7bd48] to-[#785600]" />

        {isThanked ? (
          /* Thank You Confirmation State */
          <div className="py-3 px-2 flex items-center gap-4 animate-fade-in">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-300 flex items-center justify-center shrink-0 shadow-xs">
              <CheckCircle className="w-6 h-6 text-emerald-600 animate-bounce" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[#785600] font-bold text-sm">✝</span>
                <h3 className="font-display text-base sm:text-lg font-bold text-[#1c1b1b]">
                  Muito obrigado por sua preferência!
                </h3>
              </div>
              <p className="font-sans text-xs text-[#4f4535] leading-relaxed">
                Suas configurações foram salvas com sucesso. Tenha uma excelente e abençoada leitura no portal Eclesia.
              </p>
            </div>
          </div>
        ) : (
          /* Standard Cookie Notice State */
          <>
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-300 flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                <Cookie className="w-5 h-5 text-[#785600]" />
              </div>

              <div className="flex-1 space-y-1.5 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-display text-base sm:text-lg font-bold text-[#1c1b1b]">
                    Privacidade & Cookies
                  </h3>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-300 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> LGPD
                  </span>
                </div>
                <p className="font-sans text-xs text-[#4f4535] leading-relaxed">
                  Utilizamos cookies essenciais para o funcionamento seguro do portal Eclesia e para aprimorar sua experiência de leitura devocional. Seus dados são protegidos em conformidade com a LGPD.
                </p>
              </div>

              <button
                onClick={() => handleConsent('essential')}
                className="text-[#817563] hover:text-[#1c1b1b] p-1 rounded-lg transition-colors cursor-pointer"
                title="Fechar e aceitar essenciais"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-[#d3c4af]/50">
              <div className="flex items-center gap-1.5 text-[11px] text-[#817563]">
                <span>Conheça nossa</span>
                <button
                  type="button"
                  onClick={() => {
                    if (setActiveView) {
                      setActiveView('privacidade');
                    }
                  }}
                  className="text-[#785600] hover:underline font-bold cursor-pointer"
                >
                  Política de Privacidade
                </button>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => handleConsent('essential')}
                  className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl text-xs font-semibold text-[#4f4535] hover:text-[#1c1b1b] bg-[#f6f3f2] hover:bg-[#eae4e0] border border-[#d3c4af] transition-all cursor-pointer whitespace-nowrap text-center"
                >
                  Apenas Essenciais
                </button>

                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => handleConsent('all')}
                  className="flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-[#785600] hover:bg-[#9a7000] transition-all shadow-sm cursor-pointer whitespace-nowrap text-center hover:scale-[1.02]"
                >
                  {isSaving ? 'Salvando...' : 'Aceitar Todos'}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
