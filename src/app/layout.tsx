import type { Metadata } from 'next';
import React from 'react';
import '../index.css';

export const metadata: Metadata = {
  title: 'Eclesia — Portal Editorial Católico, Liturgia e Devoção',
  description: 'Reflexões teológicas, liturgia diária, santoral completo, orações e loja católica.',
  openGraph: {
    title: 'Eclesia — Portal Editorial Católico',
    description: 'Reflexões teológicas, liturgia diária, santoral completo, orações e loja católica.',
    type: 'website',
    locale: 'pt_BR'
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <head>

        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Inter:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#fcf9f8] text-[#1c1b1b] min-h-screen flex flex-col font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
