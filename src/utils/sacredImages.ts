/**
 * Curadoria de Imagens Sacras e Utilitários de Fallback Resiliente
 * Elimina completamente cards pretos ou imagens quebradas no Blog Eclesia.
 */

export const SACRED_FALLBACK_IMAGES: Record<string, string> = {
  vaticano: 'https://images.unsplash.com/photo-1543429776-2782fc8e1acd?auto=format&fit=crop&q=80&w=1200',
  teologia: 'https://images.unsplash.com/photo-1548625361-195979bc7583?auto=format&fit=crop&q=80&w=1200',
  espiritualidade: 'https://images.unsplash.com/photo-1507692049790-de58290a4334?auto=format&fit=crop&q=80&w=1200',
  juventude: 'https://images.unsplash.com/photo-1601142634808-38923eb7c560?auto=format&fit=crop&q=80&w=1200',
  liturgia: 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?auto=format&fit=crop&q=80&w=1200',
  santos: 'https://images.unsplash.com/photo-1577083552431-6e5fd01aa342?auto=format&fit=crop&q=80&w=1200',
  default: 'https://images.unsplash.com/photo-1507692049790-de58290a4334?auto=format&fit=crop&q=80&w=1200'
};

export const SACRED_IMAGE_LIST = [
  'https://images.unsplash.com/photo-1543429776-2782fc8e1acd?auto=format&fit=crop&q=80&w=1200',
  'https://images.unsplash.com/photo-1548625361-195979bc7583?auto=format&fit=crop&q=80&w=1200',
  'https://images.unsplash.com/photo-1507692049790-de58290a4334?auto=format&fit=crop&q=80&w=1200',
  'https://images.unsplash.com/photo-1601142634808-38923eb7c560?auto=format&fit=crop&q=80&w=1200',
  'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?auto=format&fit=crop&q=80&w=1200',
  'https://images.unsplash.com/photo-1577083552431-6e5fd01aa342?auto=format&fit=crop&q=80&w=1200'
];

/**
 * Valida se uma URL parece ser uma imagem válida e segura.
 */
export function isValidImageUrl(url?: string | null): boolean {
  if (!url || typeof url !== 'string') return false;
  const u = url.trim().toLowerCase();
  if (!u.startsWith('http://') && !u.startsWith('https://') && !u.startsWith('data:image/')) return false;
  if (u.includes('placeholder') || u.includes('example.com') || u.includes('null') || u.includes('undefined')) return false;
  return true;
}

/**
 * Retorna uma imagem sacra de fallback de altíssima qualidade baseada na categoria ou seed.
 */
export function getSacredFallbackImage(categoryOrSeed?: string): string {
  if (!categoryOrSeed) return SACRED_FALLBACK_IMAGES.default;

  const key = categoryOrSeed.toLowerCase();
  if (key.includes('vatican') || key.includes('santa sé') || key.includes('papa')) {
    return SACRED_FALLBACK_IMAGES.vaticano;
  }
  if (key.includes('teolog') || key.includes('eucarist') || key.includes('doutrin')) {
    return SACRED_FALLBACK_IMAGES.teologia;
  }
  if (key.includes('jovem') || key.includes('juven') || key.includes('missão') || key.includes('acutis')) {
    return SACRED_FALLBACK_IMAGES.juventude;
  }
  if (key.includes('liturg') || key.includes('missa') || key.includes('altar')) {
    return SACRED_FALLBACK_IMAGES.liturgia;
  }
  if (key.includes('santo') || key.includes('santoral') || key.includes('martir')) {
    return SACRED_FALLBACK_IMAGES.santos;
  }
  if (key.includes('espirit') || key.includes('oraç') || key.includes('orac') || key.includes('medita')) {
    return SACRED_FALLBACK_IMAGES.espiritualidade;
  }

  // Hash determinístico se for uma string arbitrária (ex: título ou ID)
  let hash = 0;
  for (let i = 0; i < categoryOrSeed.length; i++) {
    hash = (hash << 5) - hash + categoryOrSeed.charCodeAt(i);
    hash |= 0;
  }
  const idx = Math.abs(hash) % SACRED_IMAGE_LIST.length;
  return SACRED_IMAGE_LIST[idx];
}

/**
 * Handler de erro para tags <img> que substitui automaticamente URLs quebradas por fallback sacro.
 */
export function handleSacredImageError(
  e: React.SyntheticEvent<HTMLImageElement, Event>,
  categoryOrSeed?: string
): void {
  const target = e.currentTarget;
  const fallback = getSacredFallbackImage(categoryOrSeed);
  if (target.src !== fallback) {
    target.src = fallback;
  }
}
