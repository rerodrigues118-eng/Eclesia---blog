// ============================================================================
// ECLESIA BLOG CATÓLICO - SUPABASE EDGE FUNCTION: GERAR / ATUALIZAR ORAÇÕES
// Catálogo tradicional católico autêntico (Diárias, Marianas, Santos, Latim)
// Cadastra/ativa 3 orações tradicionais por dia sem duplicação
// ============================================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS"
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

interface OraçãoTradicional {
  title: string;
  slug: string;
  category: "Diárias" | "Marianas" | "Santos" | "Latim";
  description: string;
  content: string;
  imageUrl: string;
}

// ────────────────────────────────────────────────────────────────────────────
// CATÁLOGO CANÔNICO DE ORAÇÕES TRADICIONAIS DA IGREJA CATÓLICA
// 100% Autênticas, consagradas pela Tradição, sem invenções modernas
// ────────────────────────────────────────────────────────────────────────────
const CATALOGO_ORACOES_TRADICIONAIS: OraçãoTradicional[] = [
  // ── DIÁRIAS FUNDAMENTAIS ──
  {
    title: "Pai-Nosso (Oração do Senhor)",
    slug: "pai-nosso",
    category: "Diárias",
    description: "A oração ensinada pelo próprio Nosso Senhor Jesus Cristo aos Apóstolos (Mt 6, 9-13).",
    content: `Pai Nosso que estais nos Céus,
santificado seja o Vosso Nome,
venha a nós o Vosso Reino,
seja feita a Vossa Vontade, assim na terra como no Céu.
O pão nosso de cada dia nos dai hoje,
perdoai-nos as nossas ofensas,
assim como nós perdoamos a quem nos tem ofendido,
e não nos deixeis cair em tentação,
mas livrai-nos do mal.
Amém.`,
    imageUrl: "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&q=80&w=1200"
  },
  {
    title: "Ave-Maria",
    slug: "ave-maria",
    category: "Marianas",
    description: "A saudação angélica do Arcanjo Gabriel e de Santa Isabel à Mãe de Deus (Lc 1, 28.42).",
    content: `Ave Maria, cheia de graça,
o Senhor é convosco,
bendita sois vós entre as mulheres
e bendito é o fruto do vosso ventre, Jesus.
Santa Maria, Mãe de Deus,
rogai por nós, pecadores,
agora e na hora de nossa morte.
Amém.`,
    imageUrl: "https://images.unsplash.com/photo-1577083552431-6e5fd01aa342?auto=format&fit=crop&q=80&w=1200"
  },
  {
    title: "Glória ao Pai",
    slug: "gloria-ao-pai",
    category: "Diárias",
    description: "A solene doxologia trinitária rezada desde os primeiros séculos do Cristianismo.",
    content: `Glória ao Pai, ao Filho e ao Espírito Santo.
Como era no princípio, agora e sempre.
Amém.`,
    imageUrl: "https://images.unsplash.com/photo-1548625361-195979bc7583?auto=format&fit=crop&q=80&w=1200"
  },
  {
    title: "Creio em Deus Pai (Símbolo dos Apóstolos)",
    slug: "credo-dos-apostolos",
    category: "Diárias",
    description: "A profissão de fé apostólica recebida dos doze apóstolos da Igreja primitiva.",
    content: `Creio em Deus Pai Todo-Poderoso,
Criador do Céu e da Terra;
e em Jesus Cristo, Seu único Filho, nosso Senhor,
que foi concebido pelo poder do Espírito Santo,
nasceu da Virgem Maria,
padeceu sob Pôncio Pilatos,
foi crucificado, morto e sepultado;
desceu à mansão dos mortos;
ressuscitou ao terceiro dia;
subiu aos Céus,
está sentado à direita de Deus Pai Todo-Poderoso,
donde há de vir a julgar os vivos e os mortos.
Creio no Espírito Santo,
na Santa Igreja Católica,
na comunhão dos santos,
na remissão dos pecados,
na ressurreição da carne,
na vida eterna.
Amém.`,
    imageUrl: "https://images.unsplash.com/photo-1519491050282-cf00c82424b4?auto=format&fit=crop&q=80&w=1200"
  },
  {
    title: "Santo Anjo do Senhor",
    slug: "santo-anjo-do-senhor",
    category: "Diárias",
    description: "Oração tradicional católica de invocação e confiança no Anjo da Guarda pessoal.",
    content: `Santo Anjo do Senhor,
meu zeloso guardador,
pois que a ti me confiou a Piedade Divina,
sempre me rege, me guarde,
me governe e me ilumine.
Amém.`,
    imageUrl: "https://images.unsplash.com/photo-1507692049790-de58290a4334?auto=format&fit=crop&q=80&w=1200"
  },
  {
    title: "Ato de Contrição",
    slug: "ato-de-contricao",
    category: "Diárias",
    description: "Oração penitencial solene para o exame de consciência e o Sacramento da Reconciliação.",
    content: `Meu Deus, eu me arrependo de todo o coração de Vos ter ofendido,
porque sois sumamente bom e digno de ser amado sobre todas as coisas.
Prometo firmemente, com a ajuda da Vossa graça,
fazer penitência, nunca mais pecar e evitar as ocasiões próximas de pecado.
Senhor, tende piedade de mim, pecador.
Amém.`,
    imageUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&q=80&w=1200"
  },
  {
    title: "Salve Rainha (Salve Regina)",
    slug: "salve-rainha",
    category: "Marianas",
    description: "Antífona mariana composta pelo Beato Hermann de Reichenau no século XI.",
    content: `Salve, Rainha, Mãe de Misericórdia,
vida, doçura e esperança nossa, salve!
A vós bradamos, os degredados filhos de Eva;
a vós suspiramos, gemendo e chorando neste vale de lágrimas.
Eia, pois, advogada nossa,
esses vossos olhos misericordiosos a nós volvei,
e depois deste desterro, mostrai-nos Jesus,
bendito fruto do vosso ventre,
ó clemente, ó piedosa, ó doce sempre Virgem Maria.

V. Rogai por nós, Santa Mãe de Deus.
R. Para que sejamos dignos das promessas de Cristo. Amém.`,
    imageUrl: "https://images.unsplash.com/photo-1577083552431-6e5fd01aa342?auto=format&fit=crop&q=80&w=1200"
  },
  {
    title: "Oração a São Miguel Arcanjo",
    slug: "oracao-sao-miguel-arcanjo",
    category: "Santos",
    description: "Oração de combate espiritual prescrita pelo Papa Leão XIII para a proteção da Igreja.",
    content: `São Miguel Arcanjo, defendei-nos no combate;
sede o nosso refúgio contra as maldades e ciladas do demônio.
Ordene-lhe Deus, instantemente o pedimos,
e vós, Príncipe da Milícia Celeste,
pelo Divino Poder, precipitai no inferno a Satanás
e a todos os espíritos malignos que andam pelo mundo
para perder as almas.
Amém.`,
    imageUrl: "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&q=80&w=1200"
  },
  {
    title: "Oração de São Francisco de Assis",
    slug: "oracao-sao-francisco",
    category: "Santos",
    description: "Oração clássica pela paz, fraternidade e caridade desinteressada de Cristo.",
    content: `Senhor, fazei-me instrumento de Vossa paz.
Onde houver ódio, que eu leve o amor;
onde houver ofensa, que eu leve o perdão;
onde houver discórdia, que eu leve a união;
onde houver dúvida, que eu leve a fé;
onde houver erro, que eu leve a verdade;
onde houver desespero, que eu leve a esperança;
onde houver tristeza, que eu leve a alegria;
onde houver trevas, que eu leve a luz.

Ó Mestre, fazei que eu procure mais:
consolar, que ser consolado;
compreender, que ser compreendido;
amar, que ser amado.
Pois é dando que se recebe,
é perdoando que se é perdoado,
e é morrendo que se vive para a vida eterna.
Amém.`,
    imageUrl: "https://images.unsplash.com/photo-1507692049790-de58290a4334?auto=format&fit=crop&q=80&w=1200"
  },
  {
    title: "Alma de Cristo (Anima Christi)",
    slug: "alma-de-cristo",
    category: "Diárias",
    description: "Oração eucarística medieval recomendada por Santo Inácio de Loyola após a Comunhão.",
    content: `Alma de Cristo, santificai-me.
Corpo de Cristo, salvai-me.
Sangue de Cristo, inebriai-me.
Água do lado de Cristo, lavai-me.
Paixão de Cristo, confortai-me.
Ó bom Jesus, ouvi-me.
Dentro das Vossas chagas, escondei-me.
Não permitais que me separe de Vós.
Do espírito maligno, defendei-me.
Na hora da minha morte, chamai-me
e mandai-me ir para Vós,
para que, com os Vossos Santos, Vos louve
por todos os séculos dos séculos.
Amém.`,
    imageUrl: "https://images.unsplash.com/photo-1548625361-195979bc7583?auto=format&fit=crop&q=80&w=1200"
  },
  {
    title: "Vinde, Espírito Santo",
    slug: "vinde-espirito-santo",
    category: "Diárias",
    description: "Invocação tradicional dos sete dons do Espírito Santo sobre os corações dos fiéis.",
    content: `Vinde, Espírito Santo, enchei os corações dos Vossos fiéis
e acendei neles o fogo do Vosso amor.
Enviai o Vosso Espírito e tudo será criado,
e renovareis a face da terra.

Oremos:
Ó Deus, que instruístes os corações dos Vossos fiéis
com a luz do Espírito Santo, fazei que apreciemos retamente
todas as coisas segundo o mesmo Espírito
e gozemos sempre da Sua consolação.
Por Cristo, Nosso Senhor.
Amém.`,
    imageUrl: "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?auto=format&fit=crop&q=80&w=1200"
  },
  {
    title: "Magnificat (Cântico de Nossa Senhora)",
    slug: "magnificat",
    category: "Marianas",
    description: "O hino de júbilo da Virgem Maria proclamado na casa de Santa Isabel (Lc 1, 46-55).",
    content: `A minha alma engrandece o Senhor
e o meu espírito se alegra em Deus, meu Salvador,
porque olhou para a humildade de Sua serva.
Doravante todas as gerações me chamarão bem-aventurada,
porque o Todo-Poderoso fez em mim grandes coisas.
Santo é o Seu Nome!
A Sua misericórdia estende-se de geração em geração
sobre aqueles que O temem.
Manifestou o poder do Seu braço,
dispersou os homens de coração soberbo.
Derrubou dos tronos os poderosos
e exaltou os humildes.
Encheu de bens os famintos
e despediu os ricos de mãos vazias.
Acolheu a Israel, Seu servo,
lembrado da Sua misericórdia,
como havia prometido a nossos pais,
em favor de Abraão e de sua descendência para sempre.
Glória ao Pai, ao Filho e ao Espírito Santo.
Como era no princípio, agora e sempre.
Amém.`,
    imageUrl: "https://images.unsplash.com/photo-1577083552431-6e5fd01aa342?auto=format&fit=crop&q=80&w=1200"
  },
  {
    title: "Oração a São Bento (Medalha de São Bento)",
    slug: "oracao-sao-bento",
    category: "Santos",
    description: "Invocação de proteção contra o mal e oração gravada na sagrada Medalha de São Bento.",
    content: `A Cruz Sagrada seja a minha luz,
não seja o dragão o meu guia.
Retira-te, Satanás!
Nunca me aconselhes coisas vãs.
É mau o que tu me ofereces:
bebe tu mesmo o teu veneno!
Pela intercessão de São Bento, patriarca dos monges,
livrai-me de toda cilada maligna e preservai a minha alma na paz de Cristo.
Amém.`,
    imageUrl: "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&q=80&w=1200"
  },
  {
    title: "Oração a São José (Terror dos Demônios)",
    slug: "oracao-sao-jose",
    category: "Santos",
    description: "Súplica a São José, Pai Adotivo de Jesus, Patrono Universal da Igreja e das Famílias.",
    content: `A vós, São José, recorremos em nossa tribulação
e, cheios de confiança, solicitamos o vosso patrocínio.
Pelo laço sagrado de caridade que vos uniu à Virgem Imaculada, Mãe de Deus,
e pelo amor paternal que tivestes ao Menino Jesus,
suplicamos que lanceis um olhar benigno sobre a herança
que Jesus Cristo adquiriu com o Seu Sangue,
e nos socorrais em nossas necessidades com o vosso auxílio e poder.
Defendei, ó guardião providente da Sagrada Família,
a prole escolhida de Jesus Cristo.
Afastai de nós todo contágio de erro e de corrupção.
Sede-nos propício e assisti-nos do céu na luta contra o poder das trevas.
E, assim como outrora salvastes da morte a vida ameaçada do Menino Jesus,
defendei agora a Santa Igreja de Deus das ciladas do inimigo.
Amém.`,
    imageUrl: "https://images.unsplash.com/photo-1507692049790-de58290a4334?auto=format&fit=crop&q=80&w=1200"
  },
  {
    title: "Lembrai-vos (Memorare de São Bernardo)",
    slug: "memorare-sao-bernardo",
    category: "Marianas",
    description: "A clássica prece de total confiança na intercessão materna da Santíssima Virgem Maria.",
    content: `Lembrai-vos, ó puríssima Virgem Maria,
que nunca se ouviu dizer que algum daqueles que têm recorrido à vossa proteção,
implorado a vossa assistência e reclamado o vosso socorro,
tenha sido por vós desamparado.
Animado eu, pois, com igual confiança, a vós, Virgem das virgens e Mãe minha,
recorro e, gemendo sob o peso dos meus pecados,
me prostro a vossos pés.
Não desprezeis as minhas súplicas, ó Mãe do Verbo encarnado,
mas ouvi-as propícia e alcançai-me o que vos peço.
Amém.`,
    imageUrl: "https://images.unsplash.com/photo-1577083552431-6e5fd01aa342?auto=format&fit=crop&q=80&w=1200"
  },
  // ── LATIM CANÔNICO (COM TRADUÇÃO FIEL) ──
  {
    title: "Pater Noster (Pai-Nosso em Latim)",
    slug: "pater-noster-latim",
    category: "Latim",
    description: "Oração Dominical em língua latina, voz universal da Liturgia Romana da Igreja Católica.",
    content: `[LATIM]
Pater noster, qui es in caelis,
sanctificetur nomen tuum.
Adveniat regnum tuum.
Fiat voluntas tua, sicut in caelo et in terra.
Panem nostrum cotidianum da nobis hodie,
et dimitte nobis debita nostra,
sicut et nos dimittimus debitoribus nostris.
Et ne nos inducas in tentationem,
sed libera nos a malo.
Amen.

[TRADUÇÃO EM PORTUGUÊS]
Pai nosso, que estais nos céus, santificado seja o Vosso nome. Venha a nós o Vosso reino. Seja feita a Vossa vontade, assim na terra como no céu. O pão nosso de cada dia nos dai hoje. E perdoai-nos as nossas ofensas, assim como nós perdoamos a quem nos tem ofendido. E não nos deixeis cair em tentação, mas livrai-nos do mal. Amém.`,
    imageUrl: "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&q=80&w=1200"
  },
  {
    title: "Ave Maria (Saudação Angélica em Latim)",
    slug: "ave-maria-latim",
    category: "Latim",
    description: "A saudação à Mãe de Deus no latim litúrgico tradicional.",
    content: `[LATIM]
Ave Maria, gratia plena,
Dominus tecum.
Benedicta tu in mulieribus,
et benedictus fructus ventris tui, Iesus.
Sancta Maria, Mater Dei,
ora pro nobis peccatoribus,
nunc et in hora mortis nostrae.
Amen.

[TRADUÇÃO EM PORTUGUÊS]
Ave Maria, cheia de graça, o Senhor é convosco. Bendita sois vós entre as mulheres e bendito é o fruto do vosso ventre, Jesus. Santa Maria, Mãe de Deus, rogai por nós pecadores, agora e na hora de nossa morte. Amém.`,
    imageUrl: "https://images.unsplash.com/photo-1577083552431-6e5fd01aa342?auto=format&fit=crop&q=80&w=1200"
  },
  {
    title: "Sancte Michael Archangele (Latim)",
    slug: "sancte-michael-archangele-latim",
    category: "Latim",
    description: "Invocação latina original a São Miguel Arcanjo promulgada pelo Papa Leão XIII.",
    content: `[LATIM]
Sancte Michael Archangele, defende nos in proelio;
contra nequitiam et insidias diaboli esto praesidium.
Imperet illi Deus, supplices deprecamur:
tuque, Princeps militiae caelestis,
Satanam aliosque spiritus malignos,
qui ad perditionem animarum pervagantur in mundo,
divina virtute, in infernum detrude.
Amen.

[TRADUÇÃO EM PORTUGUÊS]
São Miguel Arcanjo, defendei-nos no combate; sede o nosso refúgio contra as maldades e ciladas do demônio. Ordene-lhe Deus, instantemente o pedimos, e vós, Príncipe da Milícia Celeste, pelo Divino Poder, precipitai no inferno a Satanás e a todos os espíritos malignos que andam pelo mundo para perder as almas. Amém.`,
    imageUrl: "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&q=80&w=1200"
  },
  {
    title: "Tantum Ergo Sacramentum (Latim)",
    slug: "tantum-ergo-latim",
    category: "Latim",
    description: "Hino eucarístico solene composto por Santo Tomás de Aquino para a Bênção do Santíssimo Sacramento.",
    content: `[LATIM]
Tantum ergo Sacramentum
veneremur cernui:
et antiquum documentum
novo cedat ritui:
praestet fides supplementum
sensuum defectui.

Genitori, Genitoque
laus et iubilatio,
salus, honor, virtus quoque
sit et benedictio:
procedenti ab utroque
compar sit laudatio.
Amen.

[TRADUÇÃO EM PORTUGUÊS]
Tão sublime Sacramento adoremos curvados; e a antiga aliança ceda lugar ao novo rito. A fé supra a carência dos sentidos. Ao Pai e ao Filho sejam dados o louvor e o júbilo, a salvação, a honra, o poder e a bênção. E àquele que de ambos procede seja dada igual louvação. Amém.`,
    imageUrl: "https://images.unsplash.com/photo-1548625361-195979bc7583?auto=format&fit=crop&q=80&w=1200"
  },
  {
    title: "Anima Christi (Alma de Cristo em Latim)",
    slug: "anima-christi-latim",
    category: "Latim",
    description: "A clássica oração em latim de adoração e súplica ao Corpo e Sangue de Cristo.",
    content: `[LATIM]
Anima Christi, sanctifica me.
Corpus Christi, salva me.
Sanguis Christi, inebria me.
Aqua lateris Christi, lava me.
Passio Christi, conforta me.
O bone Iesu, exaudi me.
Intra tua vulnera absconde me.
Ne permittas me separari a te.
Ab hoste maligno defende me.
In hora mortis meae voca me.
Et iube me venire ad te,
ut cum Sanctis tuis laudem te
in saecula saeculorum.
Amen.

[TRADUÇÃO EM PORTUGUÊS]
Alma de Cristo, santificai-me. Corpo de Cristo, salvai-me. Sangue de Cristo, inebriai-me. Água do lado de Cristo, lavai-me. Paixão de Cristo, confortai-me. Ó bom Jesus, ouvi-me. Dentro das Vossas chagas, escondei-me. Não permitais que me separe de Vós. Do espírito maligno, defendei-me. Na hora da minha morte, chamai-me e mandai-me ir para Vós, para que com os Vossos Santos Vos louve por todos os séculos dos séculos. Amém.`,
    imageUrl: "https://images.unsplash.com/photo-1548625361-195979bc7583?auto=format&fit=crop&q=80&w=1200"
  }
];

// ────────────────────────────────────────────────────────────────────────────
// HANDLER PRINCIPAL
// ────────────────────────────────────────────────────────────────────────────
serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const hojeStr = new Date().toISOString().split("T")[0];

    // 1. Consulta orações já cadastradas no banco
    const { data: oracoesExistentes, error: selectErr } = await supabase
      .from("prayers")
      .select("id, slug");

    if (selectErr) {
      throw new Error(`Erro ao consultar orações existentes: ${selectErr.message}`);
    }

    const slugsCadastrados = new Set((oracoesExistentes || []).map((o: any) => o.slug));

    // Se o banco estiver totalmente vazio (0 orações), faz o seed inicial de todas as tradicionais
    let oracoesParaInserir: OraçãoTradicional[] = [];

    if (slugsCadastrados.size === 0) {
      console.log("[gerar-oracoes] Banco vazio! Inserindo catálogo inicial completo...");
      oracoesParaInserir = CATALOGO_ORACOES_TRADICIONAIS;
    } else {
      // Rotina diária: busca até 3 orações tradicionais que ainda não foram cadastradas
      const oracoesNaoCadastradas = CATALOGO_ORACOES_TRADICIONAIS.filter(
        (o) => !slugsCadastrados.has(o.slug)
      );

      if (oracoesNaoCadastradas.length > 0) {
        // Seleciona 3 orações não cadastradas
        oracoesParaInserir = oracoesNaoCadastradas.slice(0, 3);
      } else {
        // Se todas já foram cadastradas, rotaciona a oração do dia
        console.log("[gerar-oracoes] Todas as orações canônicas já cadastradas. Rotacionando oração do dia...");
      }
    }

    // 2. Desmarca is_featured_today de orações anteriores
    await supabase
      .from("prayers")
      .update({ is_featured_today: false })
      .eq("is_featured_today", true);

    const insertedList: any[] = [];

    // 3. Insere as orações no banco
    for (let i = 0; i < oracoesParaInserir.length; i++) {
      const oracao = oracoesParaInserir[i];
      const isFeatured = i === 0; // Primeira do lote é a oração em destaque do dia

      const payload = {
        title: oracao.title,
        slug: oracao.slug,
        category: oracao.category,
        situation: oracao.category, // Para compatibilidade
        content: oracao.content,
        text: oracao.content,
        description: oracao.description,
        image_url: oracao.imageUrl,
        is_featured_today: isFeatured,
        featured_date: hojeStr,
        created_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from("prayers")
        .upsert(payload, { onConflict: "slug" })
        .select()
        .single();

      if (error) {
        console.error(`Erro ao inserir oração ${oracao.slug}:`, error.message);
      } else {
        insertedList.push(data);
      }
    }

    // 4. Se nenhuma oração precisou ser inserida, garante que ao menos 1 esteja marcada como oração do dia
    if (insertedList.length === 0 && oracoesExistentes && oracoesExistentes.length > 0) {
      // Sorteia ou pega por data uma oração existente para ser destaque
      const idx = Math.floor(Math.random() * oracoesExistentes.length);
      const chosen = oracoesExistentes[idx];
      await supabase
        .from("prayers")
        .update({ is_featured_today: true, featured_date: hojeStr })
        .eq("id", chosen.id);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Automação de orações concluída com sucesso. (${insertedList.length} orações processadas).`,
        novas_oracoes: insertedList
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );

  } catch (err: any) {
    console.error("[gerar-oracoes] Erro fatal:", err);
    return new Response(
      JSON.stringify({ success: false, error: err.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
