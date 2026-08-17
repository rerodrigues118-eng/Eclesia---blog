/**
 * Utilitários de segurança do frontend Eclesia
 */

/**
 * Valida rigorosamente se uma URL é segura para abertura externa,
 * permitindo exclusivamente os protocolos HTTP e HTTPS.
 * Bloqueia esquemas perigosos como javascript:, data:, vbscript:, file:, etc.
 */
export function isSafeHttpUrl(url?: string | null): boolean {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  
  // Rejeita explicitamente protocolos maliciosos
  if (/^(javascript|data|vbscript|file):/i.test(trimmed)) {
    return false;
  }

  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    // Se for URL relativa iniciando com '/', não é externa, mas para redirecionamento externo aceitamos apenas http(s)
    return false;
  }
}

/**
 * Abre uma URL externa de forma segura com proteções anti-tabnabbing (noopener, noreferrer)
 * após validar o protocolo seguro.
 */
export function openSafeExternalUrl(url?: string | null): boolean {
  if (!url || !isSafeHttpUrl(url)) {
    console.warn('[Security] Tentativa de abertura de URL inválida ou não segura:', url);
    return false;
  }

  window.open(url.trim(), '_blank', 'noopener,noreferrer');
  return true;
}
