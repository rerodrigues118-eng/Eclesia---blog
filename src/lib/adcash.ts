/**
 * Gerenciador de Anúncios Adcash com conformidade LGPD
 */

let adcashInitialized = false;

export function hasAcceptedAdCookies(): boolean {
  try {
    const consent = localStorage.getItem('eclesia_cookie_consent_v1');
    if (!consent) return false;
    const parsed = JSON.parse(consent);
    return parsed.accepted === true && parsed.type === 'all';
  } catch {
    return false;
  }
}

/**
 * Inicializa a biblioteca de anúncios Adcash de forma assíncrona,
 * somente se o usuário tiver aceitado os cookies de publicidade (LGPD).
 * Garante execução única global sem disparos duplicados por slot.
 */
export function initAdcashIfConsented(): void {
  if (typeof window === 'undefined') return;
  if (adcashInitialized) return;

  if (!hasAcceptedAdCookies()) {
    return;
  }

  adcashInitialized = true;

  // Carrega o script acscdn de forma assíncrona
  const existingScript = document.getElementById('aclib');
  if (!existingScript) {
    const script = document.createElement('script');
    script.id = 'aclib';
    script.type = 'text/javascript';
    script.src = '//acscdn.com/script/aclib.js';
    script.async = true;
    script.onload = () => {
      try {
        // @ts-ignore
        if (window.aclib) {
          // @ts-ignore
          window.aclib.runAutoTag({ zoneId: 'zlxbp9tnn8' });
          // @ts-ignore
          window.aclib.runAutoTag({ zoneId: 't7mdnha0np' });
        }
      } catch (e) {
        console.warn('[Adcash] Erro na execução de runAutoTag:', e);
      }
    };
    document.head.appendChild(script);
  } else {
    try {
      // @ts-ignore
      if (window.aclib) {
        // @ts-ignore
        window.aclib.runAutoTag({ zoneId: 'zlxbp9tnn8' });
        // @ts-ignore
        window.aclib.runAutoTag({ zoneId: 't7mdnha0np' });
      }
    } catch (e) {
      console.warn('[Adcash] Erro na execução:', e);
    }
  }
}
