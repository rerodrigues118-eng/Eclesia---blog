import React, { useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase/client';

export function useNewsletter() {
  const [email, setEmail] = useState('');
  const [honeypot, setHoneypot] = useState(''); // Campo invisível anti-bot
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Regex de validação de e-mail seguro
  const EMAIL_REGEX = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // 1. Verificação de Honeypot Anti-Spam: se bots preencherem o campo invisível, descarta silenciosamente
    if (honeypot.trim() !== '') {
      console.warn('[useNewsletter] Bot detectado via honeypot field.');
      setSubscribed(true);
      return;
    }

    const cleanEmail = email.trim().toLowerCase();

    // 2. Validação de formato de e-mail
    if (!cleanEmail || !EMAIL_REGEX.test(cleanEmail)) {
      setErrorMessage('Por favor, informe um endereço de e-mail válido.');
      return;
    }

    setLoading(true);

    try {
      if (isSupabaseConfigured) {
        const { error } = await supabase
          .from('subscribers')
          .upsert(
            {
              email: cleanEmail,
              status: 'ativo',
              created_at: new Date().toISOString()
            },
            { onConflict: 'email' }
          );

        if (error) {
          console.error('[useNewsletter] Erro ao cadastrar assinante no Supabase:', error);
          throw new Error(error.message || 'Erro ao registrar e-mail.');
        }
      }

      setSubscribed(true);
      setTimeout(() => {
        setSubscribed(false);
        setEmail('');
        setHoneypot('');
      }, 5000);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Não foi possível concluir a inscrição no momento.');
    } finally {
      setLoading(false);
    }
  };

  return {
    email,
    setEmail,
    honeypot,
    setHoneypot,
    subscribed,
    loading,
    errorMessage,
    handleSubmit
  };
}
