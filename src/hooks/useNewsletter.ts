import React, { useState } from 'react';

export function useNewsletter() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      // Quando o endpoint do Brevo estiver pronto, chamaremos:
      // await fetch('/api/newsletter', { method: 'POST', body: JSON.stringify({ email }) });

      // Simulação para o estado atual:
      setSubscribed(true);
      setTimeout(() => {
        setSubscribed(false);
        setEmail('');
      }, 4000);
    } catch (err) {
      console.error('Newsletter error:', err);
    } finally {
      setLoading(false);
    }
  };

  return { email, setEmail, subscribed, loading, handleSubmit };
}
