// ============================================================================
// ECLESIA BLOG CATÓLICO - MOTOR DE AUTOMAÇÃO DE CONTEÚDO EDITORIAL COM IA
// Suporta: 4 Artigos Diários em Alta, Liturgia da Palavra e Santo do Dia (Santoral)
// Modelos: Groq (Llama 3.3 70b) + Fallback Google Gemini + Acervo de Arte Sacra
// ============================================================================

import { createClient } from '@supabase/supabase-js';
import { obterPautaDoSlot, CatholicTrend } from './fetchCatholicTrends';
import { obterImagemDestacada } from './imageService';

// Utilitário de ambiente cross-platform (Vercel Serverless, Node e Vite)
const getEnv = (key: string): string => {
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key] as string;
  }
  const meta = (typeof import.meta !== 'undefined' ? (import.meta as any) : null);
  if (meta && meta.env && meta.env[key]) {
    return meta.env[key] as string;
  }
  return '';
};

const SUPABASE_URL = getEnv('VITE_SUPABASE_URL') || getEnv('NEXT_PUBLIC_SUPABASE_URL') || 'https://sdyytxnmdquriqsxuvhd.supabase.co';
const DEFAULT_ANON_KEY = 'sb_publishable_iBExFVNbs14S0ty_M0pLLw_LubqbWxo';
const SUPABASE_KEY = getEnv('SUPABASE_SERVICE_ROLE_KEY') || getEnv('VITE_SUPABASE_ANON_KEY') || getEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY') || DEFAULT_ANON_KEY;

// As chaves de IA devem estar nas variáveis de ambiente (.env local ou Vercel Dashboard)
const GROK_KEY = getEnv('GROK_API_KEY') || getEnv('VITE_GROK_API_KEY') || '';
const GEMINI_KEY = getEnv('GEMINI_API_KEY') || getEnv('VITE_GEMINI_API_KEY') || '';

export const adminSupabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false }
});

// ============================================================================
// ACERVO DE ARTE SACRA CATÓLICA AUTÊNTICA (100% TESTADA E DE ALTA DEFINIÇÃO)
// ============================================================================
export interface SacredImagePair {
  capa: { url: string; alt: string };
  interna: { url: string; alt: string; legenda: string };
}

export function selecionarArteSacra(tema: string, categoria: string = ''): SacredImagePair {
  const t = `${tema} ${categoria}`.toLowerCase();

  if (t.includes('acutis') || t.includes('jovem') || t.includes('juventude') || t.includes('digital') || t.includes('internet')) {
    return {
      capa: {
        url: 'https://images.unsplash.com/photo-1543807535-eceef0bc6599?auto=format&fit=crop&q=80&w=1200',
        alt: 'Nave de catedral iluminada e Santíssimo Sacramento: Carlo Acutis e a Eucaristia'
      },
      interna: {
        url: 'https://images.unsplash.com/photo-1507692049790-de58290a4334?auto=format&fit=crop&q=80&w=1200',
        alt: 'Altar com a Cruz de Cristo, Bíblia aberta e velas acesas',
        legenda: 'A Palavra de Deus e a Eucaristia que santificam a juventude no mundo contemporâneo'
      }
    };
  }

  if (t.includes('eucaristia') || t.includes('missa') || t.includes('sacramento') || t.includes('comunhao') || t.includes('adoracao')) {
    return {
      capa: {
        url: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&q=80&w=1200',
        alt: 'Cálice de ouro sagrado e Altar da Santa Missa em solene celebração eucarística'
      },
      interna: {
        url: 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?auto=format&fit=crop&q=80&w=1200',
        alt: 'Vitral clássico de catedral com luz sagrada',
        legenda: 'A presença real, corporal e substancial de Nosso Senhor no Santíssimo Sacramento'
      }
    };
  }

  if (t.includes('maria') || t.includes('terco') || t.includes('rosario') || t.includes('nossa senhora') || t.includes('oracao')) {
    return {
      capa: {
        url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&q=80&w=1200',
        alt: 'Santo Terço católico nas mãos em recolhimento e oração profunda'
      },
      interna: {
        url: 'https://images.unsplash.com/photo-1577083552431-6e5fd01aa342?auto=format&fit=crop&q=80&w=1200',
        alt: 'Pintura sacra da Santíssima Virgem Maria',
        legenda: 'A intercessão de Nossa Senhora que nos guia incansavelmente aos braços de Jesus'
      }
    };
  }

  if (t.includes('liturgia') || t.includes('evangelho') || t.includes('leitura') || t.includes('palavra')) {
    return {
      capa: {
        url: 'https://images.unsplash.com/photo-1519491050282-cf00c82424b4?auto=format&fit=crop&q=80&w=1200',
        alt: 'Bíblia Sagrada aberta iluminada pela luz da Palavra de Deus'
      },
      interna: {
        url: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&q=80&w=1200',
        alt: 'Altar da celebração litúrgica em igreja católica',
        legenda: 'A Palavra proclamada na liturgia alimenta o coração dos fiéis a cada dia'
      }
    };
  }

  if (t.includes('santo') || t.includes('martir') || t.includes('santidade') || t.includes('vida')) {
    return {
      capa: {
        url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&q=80&w=1200',
        alt: 'Pintura sacra renascentista retratando a glória dos santos'
      },
      interna: {
        url: 'https://images.unsplash.com/photo-1543807535-eceef0bc6599?auto=format&fit=crop&q=80&w=1200',
        alt: 'Interior solene de basílica católica com relicários',
        legenda: 'O testemunho heroico dos santos que iluminaram a história bimilenar da Igreja'
      }
    };
  }

  // Padrão Geral Teologia / Apologética
  return {
    capa: {
      url: 'https://images.unsplash.com/photo-1507692049790-de58290a4334?auto=format&fit=crop&q=80&w=1200',
      alt: 'Altar com a Cruz de Cristo, velas e Bíblia Sagrada'
    },
    interna: {
      url: 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?auto=format&fit=crop&q=80&w=1200',
      alt: 'Vitral clássico de catedral com luz celestial radiante',
      legenda: 'A imutável beleza e a verdade perene da Santa Fé Católica'
    }
  };
}

// ============================================================================
// AUXILIAR: Chamada à API de IA (Groq / Gemini) com Resiliência Total
// ============================================================================
async function chamarIA(promptSistema: string, promptUsuario: string): Promise<string> {
  // 1. Tentar Groq (Llama 3.3 70b / Mixtral)
  if (GROK_KEY && GROK_KEY.startsWith('gsk_')) {
    const modelos = ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant'];
    for (const model of modelos) {
      try {
        const resp = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${GROK_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model,
            messages: [
              { role: 'system', content: promptSistema + '\nResponda ESTRITAMENTE com um objeto JSON válido, sem texto conversacional antes ou depois.' },
              { role: 'user', content: promptUsuario }
            ],
            response_format: { type: 'json_object' },
            temperature: 0.65,
            max_tokens: 3800
          })
        });

        if (resp.ok) {
          const json = await resp.json();
          const content = json.choices?.[0]?.message?.content?.trim();
          if (content) return content;
        } else {
          console.warn(`[Groq ${model} status ${resp.status}]:`, await resp.text());
        }
      } catch (err) {
        console.warn(`[Groq ${model} error]:`, err);
      }
    }
  }

  // 2. Fallback para Google Gemini se a chave estiver configurada
  if (GEMINI_KEY) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`;
      const resp = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: `${promptSistema}\n\n${promptUsuario}\n\nIMPORTANTE: Responda APENAS com JSON puro.` }]
            }
          ],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.65,
            maxOutputTokens: 3800
          }
        })
      });

      if (resp.ok) {
        const json = await resp.json();
        const text = json.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        if (text) return text;
      }
    } catch (err) {
      console.warn('[Gemini fallback error]:', err);
    }
  }

  throw new Error('Nenhum provedor de Inteligência Artificial (Groq/Gemini) respondeu com sucesso.');
}

function limparJson(raw: string): any {
  let cleaned = raw.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '').trim();
  }
  return JSON.parse(cleaned);
}

function formatarMarkdown(txt: string): string {
  if (!txt) return '';
  return txt
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '')
    .replace(/([^\n])\n(#{2,4}\s)/g, '$1\n\n$2')
    .replace(/([^\n])\n(>\s)/g, '$1\n\n$2')
    .replace(/\s*\[ORACAO(?::\s*([^\]]+))?\]\s*/gi, '\n\n[ORACAO:$1]\n')
    .replace(/\s*\[\/ORACAO\]\s*/gi, '\n[/ORACAO]\n\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function inserirSegundaImagem(conteudo: string, url: string, legenda: string): string {
  if (!conteudo || !url || conteudo.includes('[img-') || conteudo.includes('![')) return conteudo;
  const tag = `\n\n[img-centro: ${url} | 480px | ${legenda}]\n\n`;
  const idx = conteudo.indexOf('\n## ');
  if (idx !== -1) {
    const nextIdx = conteudo.indexOf('\n## ', idx + 4);
    const ponto = nextIdx !== -1 ? nextIdx : idx;
    return conteudo.slice(0, ponto) + tag + conteudo.slice(ponto);
  }
  return conteudo + tag;
}

// ============================================================================
// 1. ROTINA DE 4 ARTIGOS DIÁRIOS EM ALTA
// Slot 1: Espiritualidade Matinal (06:00 BRT)
// Slot 2: Teologia & Catecismo (10:30 BRT)
// Slot 3: Apologética & Juventude (15:00 BRT)
// Slot 4: Temas em Alta da Igreja & Notícias (19:30 BRT)
// ============================================================================
export async function gerarArtigoEmAlta(slot: number = 1): Promise<any> {
  const hoje = new Date();
  const dataExtenso = hoje.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
  const dataCompacta = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}-${String(hoje.getDate()).padStart(2, '0')}`;

  const configuracoesSlot: Record<number, { tema: string; categoria: string; foco: string }> = {
    1: {
      tema: 'Espiritualidade, Oração e Vida Interior',
      categoria: 'Espiritualidade',
      foco: 'Oração matinal, intimidade com Jesus, adoração, silêncio interior e batalha espiritual na vida diária.'
    },
    2: {
      tema: 'Teologia Dogmática, Sacramentos e Patrística',
      categoria: 'Teologia',
      foco: 'A Santa Missa, o mistério da Eucaristia, ensinamentos de Santo Tomás de Aquino, Santo Agostinho e os Santos Padres.'
    },
    3: {
      tema: 'Apologética, Santidade na Juventude e Moral Católica',
      categoria: 'Juventude & Fé',
      foco: 'Carlo Acutis, pureza e castidade, defesa da fé bíblica católica, vocação cristã e heroísmo da juventude.'
    },
    4: {
      tema: 'Temas em Alta, Vaticano e Atualidades da Igreja',
      categoria: 'Vaticano',
      foco: 'Grandes eventos da Santa Sé, pronunciamentos papais, defesa da vida e desafios da fé no mundo contemporâneo.'
    }
  };

  const config = configuracoesSlot[slot] || configuracoesSlot[1];

  // 1. Monitora fontes católicas oficiais (Vatican News, ACI Digital, CNBB, Canção Nova)
  let trend: CatholicTrend | null = null;
  try {
    trend = await obterPautaDoSlot(slot);
    console.log(`[contentAutomation] Pauta católica selecionada para Slot ${slot} (${config.categoria}):`, trend?.title, `[${trend?.source}]`);
  } catch (trendErr) {
    console.warn('[contentAutomation] Falha ao coletar trend católica externa, usando pauta curada:', trendErr);
  }

  const pautaNoticiaContexto = trend ? `
PAUTA EM ALTA MONITORADA DE FONTE CATÓLICA OFICIAL:
- Fonte: ${trend.source}
- Título da Matéria: "${trend.title}"
- Resumo/Contexto Factual: "${trend.description}"
${trend.link ? `- Link Original da Notícia: ${trend.link}` : ''}
- DIRETRIZ EDITORIAL: Desenvolva um artigo editorial profundo e original do "Portal Eclesia" inspirado nesta notícia/acontecimento. Aprofunde teologicamente a questão à luz da Doutrina da Igreja Católica, do Catecismo (CIC), dos Santos Padres e das Sagradas Escrituras. NÃO copie a notícia: ofereça a interpretação doutrinária, pastoral e espiritual que os fiéis precisam.` : '';

  const promptSistema = `Você é um redator sênior, teólogo e comunicador católico apaixonado por Cristo e pela Santa Igreja.
Seu estilo é claro, profundo, ortodoxo com o Magistério e contagiante como São João Paulo II falando à juventude.
PROIBIDO clichês de IA ("No cenário contemporâneo", "Nos dias de hoje", "Em suma", "Vale ressaltar").
PROIBIDO citar fontes fictícias.
Conclua SEMPRE com uma oração católica emocionante entre as tags [ORACAO: Título da Oração] e [/ORACAO].`;

  const promptUsuario = `
Escreva um artigo católico completo, profundo e inédito para publicação hoje (${dataExtenso}).
- Eixo Temático: ${config.tema}
- Foco Editorial: ${config.foco}
- Categoria do Portal: ${config.categoria}
${pautaNoticiaContexto}

Critérios Estritos de SEO do Portal Eclesia:
1. "titulo": Título magnético e direto com EXATAMENTE entre 38 e 62 caracteres.
2. "metaTitle": Título de busca entre 45 e 60 caracteres.
3. "metaDescription": Resumo instigante entre 125 e 155 caracteres.
4. "slug": slug limpo em minúsculas (sem acentos) com prefixo do slot (ex: "slug-artigo-${slot}-${dataCompacta}").
5. "resumo": Síntese para o card com 120 a 160 caracteres.
6. "conteudo": Artigo completo em Markdown rico, com subtítulos "## ", citações "> " e mais de 650 palavras. Finalize com [ORACAO: ...] [/ORACAO].
7. "keywords": Array com 5 a 7 palavras-chave católicas relevantes.
8. "tempoLeitura": "5 min de leitura" ou "6 min de leitura".

Retorne em formato JSON.`;

  const rawJson = await chamarIA(promptSistema, promptUsuario);
  const parsed = limparJson(rawJson);

  // 2. Geração e Associação de Imagem Destacada (Estratégia Dupla: IA + Acervo Sacro Curado)
  const temaImagem = parsed.titulo || trend?.title || config.tema;
  const imagemDestacada = await obterImagemDestacada(temaImagem, config.categoria);
  const arteSacra = selecionarArteSacra(temaImagem, config.categoria);

  let conteudoFinal = formatarMarkdown(parsed.conteudo || '');
  conteudoFinal = inserirSegundaImagem(conteudoFinal, arteSacra.interna.url, arteSacra.interna.legenda);

  const cleanSlug = (parsed.slug || `artigo-slot-${slot}-${dataCompacta}`)
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-');

  const novoArtigo = {
    title: parsed.titulo,
    slug: cleanSlug,
    excerpt: parsed.resumo || parsed.metaDescription,
    content: conteudoFinal,
    cover_image: imagemDestacada.url || arteSacra.capa.url,
    category: config.categoria,
    type: slot === 4 ? 'noticia' : 'artigo',
    author_name: 'Redação Eclesia',
    read_time: parsed.tempoLeitura || '5 min de leitura',
    status: 'publicado',
    source: 'n8n',
    featured: slot === 1 || slot === 4,
    trending: true,
    meta_title: parsed.metaTitle || parsed.titulo,
    meta_description: parsed.metaDescription || parsed.resumo,
    keywords: parsed.keywords || ['Fé Católica', 'Portal Eclesia'],
    published_at: new Date().toISOString()
  };

  const { data, error } = await adminSupabase
    .from('articles')
    .upsert(novoArtigo, { onConflict: 'slug' })
    .select()
    .single();

  if (error) {
    throw new Error(`Erro ao persistir artigo no Supabase: ${error.message}`);
  }

  return { success: true, slot, article: data, trendUsed: trend?.title };
}

// ============================================================================
// 2. ROTINA DA LITURGIA DIÁRIA DA PALAVRA (03:00 BRT = 06:00 UTC)
// ============================================================================
export async function gerarLiturgiaDiaria(forcarDataIso?: string, forceRegen = false): Promise<any> {
  // Usa fuso de Brasília para determinar o dia correto (03:00 BRT = 06:00 UTC)
  const agora = new Date();
  let dataIso: string;
  if (forcarDataIso && /^\d{4}-\d{2}-\d{2}$/.test(forcarDataIso)) {
    dataIso = forcarDataIso;
  } else {
    try {
      const brDateStr = agora.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' });
      const [d, m, y] = brDateStr.split('/');
      dataIso = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
    } catch {
      dataIso = agora.toISOString().split('T')[0];
    }
  }

  const dataExtenso = new Date(dataIso + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
  const hoje = new Date(dataIso + 'T12:00:00');

  // Verifica se já existe registro para este dia — evita geração dupla (a não ser que forceRegen seja true)
  if (!forceRegen) {
    const { data: jaExiste } = await adminSupabase
      .from('daily_liturgy')
      .select('id, date')
      .eq('date', dataIso)
      .maybeSingle();

    if (jaExiste) {
      console.log(`[gerarLiturgiaDiaria] Liturgia de ${dataIso} já existe (id: ${jaExiste.id}). Pulando geração.`);
      return { success: true, skipped: true, date: dataIso, liturgy: jaExiste, article: null };
    }
  }

  console.log(`[gerarLiturgiaDiaria] Gerando liturgia para ${dataIso} (${dataExtenso}) via IA...`);

  const promptSistema = `Você é um biblista e liturgista católico da Comissão Episcopal Pastoral para a Liturgia da Igreja Católica.
Você conhece o Lecionário Dominical e Semanal oficial da Igreja Católica em língua portuguesa.
Gere os textos completos das leituras da Santa Missa de hoje (${dataExtenso}) segundo o calendário litúrgico oficial da Igreja Católica.`;

  const promptUsuario = `
Gere o conteúdo completo da Liturgia Diária de hoje (${dataExtenso}).
Retorne estritamente um JSON com a seguinte estrutura:
{
  "liturgical_season": "Tempo Comum" (ou "Quaresma", "Páscoa", "Advento", "Natal"),
  "liturgical_color": "Verde" (ou "Branco", "Vermelho", "Roxo", "Rosa"),
  "color_hex": "#1c5d3a" (verde: #1c5d3a, branco: #d4af37, vermelho: #9a3e3c, roxo: #5b21b6, rosa: #db2777),
  "full_date_str": "Liturgia Diária — ${dataExtenso}",
  "first_reading": {
    "title": "Primeira Leitura (Referência)",
    "reference": "Livro e capítulos",
    "rubric": "Indicação inicial do leitor",
    "text": ["Parágrafo 1 da leitura...", "Parágrafo 2..."],
    "response": "— Palavra do Senhor. / Graças a Deus."
  },
  "psalm": {
    "reference": "Salmo Responsarial",
    "antiphon": "Refrão responsorial cantado",
    "stanzas": ["Estrofe 1 do Salmo...", "Estrofe 2...", "Estrofe 3..."]
  },
  "second_reading": null,
  "gospel": {
    "reference": "Evangelho segundo...",
    "dialogue": {
      "lordBeWithYou": "— O Senhor esteja convosco.",
      "andWithYourSpirit": "— Ele está no meio de nós.",
      "gospelProclamation": "— Proclamação do Evangelho de Jesus Cristo segundo...",
      "gloryToYou": "— Glória a vós, Senhor."
    },
    "text": ["Texto sagrado do Evangelho proclamado..."],
    "acclamation": "Aleluia, aleluia, aleluia.",
    "praise": "— Palavra da Salvação. / Glória a vós, Senhor."
  },
  "homilia": "Uma reflexão pastoral e homilética profunda de 400 palavras conectando a Primeira Leitura e o Evangelho para o dia de hoje dos fiéis."
}`;

  const rawJson = await chamarIA(promptSistema, promptUsuario);
  const parsed = limparJson(rawJson);

  // 1. Grava na tabela daily_liturgy (usada pelo componente LiturgiaView)
  //    Formato de data obrigatório: YYYY-MM-DD
  const registroLiturgia = {
    date: dataIso,                                                // YYYY-MM-DD (fuso BRT)
    liturgical_season: parsed.liturgical_season || 'Tempo Comum',
    liturgical_color: parsed.liturgical_color || 'Verde',
    color_hex: parsed.color_hex || '#1c5d3a',
    full_date_str: parsed.full_date_str || `Liturgia Diária — ${dataExtenso}`,
    first_reading: parsed.first_reading || null,
    psalm: parsed.psalm || null,
    second_reading: parsed.second_reading || null,
    gospel: parsed.gospel || null,
    inserted_manually: false
  };

  const { data: liturgiaData, error: liturgiaError } = await adminSupabase
    .from('daily_liturgy')
    .upsert(registroLiturgia, { onConflict: 'date' })
    .select()
    .single();

  if (liturgiaError) {
    // Se falhar na persistência, lança para o cron capturar e logar
    throw new Error(`[daily_liturgy] Falha ao salvar liturgia de ${dataIso}: ${liturgiaError.message}`);
  }

  console.log(`[gerarLiturgiaDiaria] ✅ Liturgia de ${dataIso} salva com sucesso (id: ${liturgiaData?.id}).`);

  // 2. Cria também o Artigo no Blog para que os leitores encontrem pelo feed e Google
  const imagemLiturgia = await obterImagemDestacada('Liturgia da Palavra Evangelho Santa Missa', 'Liturgia');
  const arteSacra = selecionarArteSacra('liturgia evangelho da santa missa', 'Liturgia');
  const evangelhoTexto = Array.isArray(parsed.gospel?.text) ? parsed.gospel.text.join('\n\n') : (parsed.gospel?.text || '');
  const primeiraLeituraTexto = Array.isArray(parsed.first_reading?.text) ? parsed.first_reading.text.join('\n\n') : (parsed.first_reading?.text || '');
  const salmoTexto = Array.isArray(parsed.psalm?.stanzas) ? parsed.psalm.stanzas.join('\n\n') : '';

  const artigoConteudo = formatarMarkdown(`
# Liturgia Diária da Santa Missa — ${dataExtenso}

> Cor Litúrgica: **${parsed.liturgical_color || 'Verde'}** | Tempo: **${parsed.liturgical_season || 'Tempo Comum'}**

## Primeira Leitura: ${parsed.first_reading?.reference || ''}
*${parsed.first_reading?.rubric || ''}*

${primeiraLeituraTexto}

**${parsed.first_reading?.response || '— Palavra do Senhor. / Graças a Deus.'}**

---

## Salmo Responsorial: ${parsed.psalm?.reference || ''}
**Refrão:** *${parsed.psalm?.antiphon || ''}*

${salmoTexto}

---

## Evangelho de Jesus Cristo: ${parsed.gospel?.reference || ''}

${evangelhoTexto}

**${parsed.gospel?.praise || '— Palavra da Salvação. / Glória a vós, Senhor.'}**

---

## Meditação e Homilia do Dia
${parsed.homilia || 'Meditemos na Palavra de Deus que transforma nosso coração.'}

[ORACAO: Oração pela Graça da Palavra]
Senhor Deus e Pai de infinita misericórdia, que pela Tua Palavra proclamada na Santa Missa nos iluminas os passos e nos sacias a alma sedenta, faz com que a mensagem do Teu Evangelho de hoje frutifique em nossas famílias e nos inspire à caridade sincera. Por Cristo, Nosso Senhor. Amém.
[/ORACAO]
`);

  const slugLiturgia = `liturgia-diaria-${dataIso}`;
  const artigoLiturgia = {
    title: `Liturgia Diária: Evangelho Comentado (${hoje.getDate()}/${hoje.getMonth() + 1})`,
    slug: slugLiturgia,
    excerpt: `Confira as leituras da Santa Missa de hoje (${dataExtenso}), o Evangelho proclamado e uma homilia para iluminar o seu dia com a Palavra de Deus.`,
    content: artigoConteudo,
    cover_image: imagemLiturgia.url || arteSacra.capa.url,
    category: 'Liturgia Diária',
    type: 'artigo',
    author_name: 'Redação Eclesia',
    read_time: '6 min de leitura',
    status: 'publicado',
    source: 'n8n',
    featured: true,
    trending: false,
    meta_title: `Liturgia Diária: Evangelho de Hoje (${dataExtenso})`,
    meta_description: `Liturgia da Palavra completa: Primeira Leitura, Salmo, Evangelho de hoje e reflexão pastoral no Portal Eclesia.`,
    keywords: ['Liturgia Diária', 'Evangelho de hoje', 'Santa Missa', 'Tempo Comum', 'Palavra de Deus'],
    published_at: new Date().toISOString()
  };

  const { data: artData } = await adminSupabase
    .from('articles')
    .upsert(artigoLiturgia, { onConflict: 'slug' })
    .select()
    .single();

  return { success: true, liturgy: liturgiaData, article: artData };
}

// ============================================================================
// 3. ROTINA DO SANTO DO DIA (SANTORAL) (05:00 BRT)
// ============================================================================
export async function gerarSantoDoDia(): Promise<any> {
  const hoje = new Date();
  const diaNum = hoje.getDate();
  const mesNum = hoje.getMonth() + 1;
  const dataExtenso = hoje.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
  const dataIso = hoje.toISOString().split('T')[0];

  const promptSistema = `Você é um hagiógrafo e historiador da Igreja Católica Apostólica Romana.
Você conhece em profundidade o Martirológio Romano e o Santoral Católico oficial da Igreja.
Gere a história verídica, virtudes heroicas, oração e biografia do Santo ou Festa Litúrgica comemorada hoje, dia ${diaNum} de ${hoje.toLocaleDateString('pt-BR', { month: 'long' })}.`;

  const promptUsuario = `
Identifique e escreva a biografia do Santo do Dia oficial de hoje (${diaNum}/${mesNum} - ${dataExtenso}).
Retorne estritamente um JSON com:
{
  "nome": "Nome do Santo",
  "titulo": "Ex: Bispo e Doutor da Igreja / Mártir / Virgem e Fundadora",
  "patronato": "Padroeiro dos...",
  "resumo": "Síntese biográfica de 130 a 160 caracteres para o card.",
  "biografia_completa": "Biografia inspiradora e detalhada em Markdown com mais de 500 palavras dividida em subtítulos ## destacando a infância, conversão, virtudes heroicas e martírio ou morte santa.",
  "oracao": "Oração oficial ou devocional ao Santo do dia pedindo sua santa intercessão.",
  "frases": ["Frase célebre 1", "Frase célebre 2"],
  "categoria": "Bispos | Mártires | Doutores da Igreja | Religiosos | Papas | Virgens"
}`;

  const rawJson = await chamarIA(promptSistema, promptUsuario);
  const parsed = limparJson(rawJson);

  const imagemSanto = await obterImagemDestacada(parsed.nome || 'Santo Católico', 'Santo');
  const arteSacra = selecionarArteSacra(parsed.nome || 'Santo Católico', 'Santo');
  const slugSanto = (parsed.nome || 'santo-do-dia')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-');

  // 1. Grava na tabela saints (para SantoralView) com image_url obrigatório
  const registroSanto = {
    name: parsed.nome,
    slug: `${slugSanto}-${diaNum}-${mesNum}`,
    title: parsed.titulo,
    feast_month: mesNum,
    feast_day: diaNum,
    short_bio: parsed.resumo,
    full_bio: parsed.biografia_completa,
    patronage: parsed.patronato,
    category: parsed.categoria || 'Geral',
    image_url: imagemSanto.url || arteSacra.capa.url,
    prayer: parsed.oracao,
    quotes: parsed.frases || [],
    featured: true
  };

  const { data: santoData, error: santoError } = await adminSupabase
    .from('saints')
    .upsert(registroSanto, { onConflict: 'slug' })
    .select()
    .single();

  if (santoError) {
    console.warn('[saints upsert warning]:', santoError.message);
  }

  // 2. Publica o Artigo no Blog com cover_image obrigatório
  const artigoConteudo = formatarMarkdown(`
# ${parsed.nome}: ${parsed.titulo || 'Testemunha da Fé'}

> Memória Litúrgica: **${diaNum} de ${hoje.toLocaleDateString('pt-BR', { month: 'long' })}** | Padroeiro: **${parsed.patronato || 'Fiéis Cristãos'}**

${parsed.biografia_completa}

---

[ORACAO: Oração a ${parsed.nome}]
${parsed.oracao || 'Concedei-nos, Senhor, pela intercessão do Teu santo servo, a graça da perseverança na fé e a coragem de testemunhar o Evangelho em todos os dias da nossa vida. Por Cristo, Nosso Senhor. Amém.'}
[/ORACAO]
`);

  const slugArtigoSanto = `santo-do-dia-${slugSanto}-${dataIso}`;
  const artigoSanto = {
    title: `Santo do Dia: ${parsed.nome} (${diaNum}/${mesNum})`,
    slug: slugArtigoSanto,
    excerpt: parsed.resumo || `Conheça a história e a oração do Santo comemorado hoje pela Igreja Católica.`,
    content: artigoConteudo,
    cover_image: imagemSanto.url || arteSacra.capa.url,
    category: 'Santo do Dia',
    type: 'artigo',
    author_name: 'Redação Eclesia',
    read_time: '5 min de leitura',
    status: 'publicado',
    source: 'n8n',
    featured: false,
    trending: true,
    meta_title: `Santo do Dia: ${parsed.nome} — Vida e Oração`,
    meta_description: (parsed.resumo || `Biografia, história inspiradora e oração a ${parsed.nome}`).slice(0, 155),
    keywords: ['Santo do Dia', parsed.nome, 'Santoral Católico', 'Vida dos Santos', 'Oração'],
    published_at: new Date().toISOString()
  };

  const { data: artData } = await adminSupabase
    .from('articles')
    .upsert(artigoSanto, { onConflict: 'slug' })
    .select()
    .single();

  return { success: true, saint: santoData, article: artData };
}
