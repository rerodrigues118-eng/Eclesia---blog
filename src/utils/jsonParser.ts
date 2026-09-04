function normalizarCamposObjeto(obj: any): any {
  if (!obj || typeof obj !== 'object') return obj;

  // 1. Converte quebras de linha literais em todas as strings
  for (const k of Object.keys(obj)) {
    if (typeof obj[k] === 'string') {
      obj[k] = obj[k].replace(/\\n/g, '\n').replace(/\\r/g, '').trim();
    }
  }

  // 2. Mapeamento bidirecional de chaves inglês <-> português
  if (!obj.titulo && (obj.title || obj.headline || obj.name)) {
    obj.titulo = obj.title || obj.headline || obj.name;
  }
  if (!obj.conteudo && (obj.article || obj.content || obj.body || obj.texto || obj.corpo || obj.artigo)) {
    obj.conteudo = obj.article || obj.content || obj.body || obj.texto || obj.corpo || obj.artigo;
  }
  if (!obj.resumo && (obj.excerpt || obj.summary || obj.description)) {
    obj.resumo = obj.excerpt || obj.summary || obj.description;
  }
  if (!obj.categoria && (obj.category || obj.tag)) {
    obj.categoria = obj.category || obj.tag;
  }
  if (!obj.metaTitle && (obj.meta_title || obj.seo_title || obj.titulo || obj.title)) {
    obj.metaTitle = obj.meta_title || obj.seo_title || obj.titulo || obj.title;
  }
  if (!obj.metaDescription && (obj.meta_description || obj.seo_description || obj.resumo || obj.summary)) {
    obj.metaDescription = obj.meta_description || obj.seo_description || obj.resumo || obj.summary;
  }
  if (!obj.slug && (obj.url_slug || obj.slug_url)) {
    obj.slug = obj.url_slug || obj.slug_url;
  }

  return obj;
}

export function parseJsonSeguro(raw: string): any {
  if (!raw || typeof raw !== 'string') return {};

  let cleaned = raw.trim();

  // 1. Extrai o bloco ```json ... ``` ou ``` ... ``` se existir
  const jsonBlockMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (jsonBlockMatch && jsonBlockMatch[1]) {
    cleaned = jsonBlockMatch[1].trim();
  } else {
    // Isola entre o primeiro '{' e o último '}'
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      cleaned = cleaned.slice(firstBrace, lastBrace + 1);
    } else if (firstBrace !== -1) {
      cleaned = cleaned.slice(firstBrace);
    }
  }

  // 2. Primeira tentativa: JSON.parse nativo
  try {
    const res = JSON.parse(cleaned);
    return normalizarCamposObjeto(res);
  } catch (_err1) {
    // 3. Segunda tentativa: Varredura de caracteres para reparar quebras de linha e strings não finalizadas
    try {
      let dentroDeString = false;
      let escapado = false;
      let consertado = '';

      for (let i = 0; i < cleaned.length; i++) {
        const char = cleaned[i];

        if (char === '\\' && !escapado) {
          escapado = true;
          consertado += char;
          continue;
        }

        if (char === '"' && !escapado) {
          dentroDeString = !dentroDeString;
          consertado += char;
          continue;
        }

        if (dentroDeString) {
          if (char === '\n') {
            consertado += '\\n';
          } else if (char === '\r') {
            // ignora retorno de carro
          } else if (char === '\t') {
            consertado += '\\t';
          } else {
            consertado += char;
          }
        } else {
          consertado += char;
        }

        escapado = false;
      }

      // Se a string foi truncada antes de fechar aspas
      if (dentroDeString) {
        consertado += '"';
      }

      // Fecha chaves ausentes
      const openBraces = (consertado.match(/{/g) || []).length;
      const closeBraces = (consertado.match(/}/g) || []).length;
      if (openBraces > closeBraces) {
        consertado += '}'.repeat(openBraces - closeBraces);
      }

      const res = JSON.parse(consertado);
      return normalizarCamposObjeto(res);
    } catch (_err2) {
      // 4. Terceira tentativa: Extrator cirúrgico por Regex de cada campo (à prova de falhas)
      const extrairCampo = (chave: string): string => {
        const regex = new RegExp(`"${chave}"\\s*:\\s*"([\\s\\S]*?)(?="\\s*,\\s*"[a-zA-Z0-9_]+"|\\s*"\\s*})`, 'i');
        const match = cleaned.match(regex);
        if (match && match[1]) {
          return match[1]
            .replace(/\\n/g, '\n')
            .replace(/\\"/g, '"')
            .replace(/\\\\/g, '\\')
            .trim();
        }
        return '';
      };

      const titulo = 
        extrairCampo('titulo') || 
        extrairCampo('title') || 
        extrairCampo('headline') || 
        'Artigo Editorial Eclesia';

      const slug = 
        extrairCampo('slug') || 
        titulo.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-').replace(/[^\w-]/g, '');

      let conteudo = 
        extrairCampo('conteudo') || 
        extrairCampo('article') || 
        extrairCampo('content') || 
        extrairCampo('body') || 
        extrairCampo('texto') || 
        extrairCampo('corpo');

      if (!conteudo) {
        for (const chaveConteudo of ['"conteudo"', '"article"', '"content"', '"body"', '"texto"']) {
          const idxConteudo = cleaned.indexOf(chaveConteudo);
          if (idxConteudo !== -1) {
            const posInicio = cleaned.indexOf('"', idxConteudo + chaveConteudo.length);
            if (posInicio !== -1) {
              conteudo = cleaned.slice(posInicio + 1).replace(/"\s*}?\s*$/, '');
              conteudo = conteudo.replace(/\\n/g, '\n').replace(/\\"/g, '"').trim();
              break;
            }
          }
        }
      }

      const resumo = 
        extrairCampo('resumo') || 
        extrairCampo('summary') || 
        extrairCampo('excerpt') || 
        extrairCampo('description') || 
        'Reflexão teológica e espiritual no Portal Eclesia.';

      const resultado = {
        titulo,
        slug,
        resumo,
        conteudo: conteudo || cleaned,
        categoria: extrairCampo('categoria') || extrairCampo('category') || 'Teologia',
        tempoLeitura: extrairCampo('tempoLeitura') || extrairCampo('read_time') || '5 min de leitura',
        metaTitle: extrairCampo('metaTitle') || extrairCampo('meta_title') || titulo,
        metaDescription: extrairCampo('metaDescription') || extrairCampo('meta_description') || resumo,
        keywords: ['Teologia', 'Catolicismo', 'Fé Católica', 'Portal Eclesia'],
        promptImagem: extrairCampo('promptImagem') || 'Catholic sacred art oil painting, solemn and reverent',
        altText: extrairCampo('altText') || titulo
      };

      return normalizarCamposObjeto(resultado);
    }
  }
}
