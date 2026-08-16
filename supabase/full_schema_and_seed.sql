-- =============================================================================
-- ECLESIA — MASTER SCHEMA & SEED SCRIPT (SQL COMPLETO E IDEMPOTENTE)
-- Execute este script no SQL Editor do Supabase para criar/atualizar todas as
-- tabelas, colunas, índices, políticas de segurança (RLS) e dados iniciais.
-- =============================================================================

-- Extensão UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- 1. TIPOS ENUM (com verificação segura)
-- =============================================================================
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin', 'editor', 'assinante');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE article_status AS ENUM ('rascunho', 'agendado', 'publicado');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE article_source AS ENUM ('manual', 'n8n_ia');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE article_type AS ENUM ('artigo', 'noticia');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE product_category AS ENUM ('livro', 'sacramental', 'arte', 'vestuario');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- =============================================================================
-- 2. TABELA: PROFILES (Perfis e Autenticação)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT,
    role user_role DEFAULT 'assinante',
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Trigger de criação automática de Profile ao registrar no Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, role)
    VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', 'Usuário Eclesia'), 'assinante')
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- =============================================================================
-- 3. TABELA: ARTICLES (Artigos e Notícias do Blog)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    excerpt TEXT,
    content TEXT NOT NULL,
    cover_image TEXT,
    category TEXT DEFAULT 'Teologia',
    type article_type DEFAULT 'artigo',
    author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    author_name TEXT DEFAULT 'Redação Eclesia',
    read_time TEXT DEFAULT '5 min de leitura',
    status article_status DEFAULT 'publicado',
    source article_source DEFAULT 'manual',
    featured BOOLEAN DEFAULT false,
    trending BOOLEAN DEFAULT false,
    meta_title TEXT,
    meta_description TEXT,
    keywords TEXT[],
    media_map JSONB,
    published_at TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Colunas adicionais garantidas caso a tabela já existisse no banco anteriormente
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS author_name TEXT DEFAULT 'Redação Eclesia';
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS read_time TEXT DEFAULT '5 min de leitura';
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false;
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS trending BOOLEAN DEFAULT false;
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS meta_title TEXT;
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS meta_description TEXT;
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS keywords TEXT[];
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS media_map JSONB;
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS status article_status DEFAULT 'publicado';
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS source article_source DEFAULT 'manual';
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS type article_type DEFAULT 'artigo';

CREATE INDEX IF NOT EXISTS idx_articles_status ON public.articles (status, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_slug ON public.articles (slug);
CREATE INDEX IF NOT EXISTS idx_articles_category ON public.articles (category);
CREATE INDEX IF NOT EXISTS idx_articles_featured ON public.articles (featured) WHERE featured = true;

-- =============================================================================
-- 4. TABELA: PRODUCTS (Loja Católica)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    subtitle TEXT,
    description TEXT,
    price_cents INT NOT NULL DEFAULT 0,
    images TEXT[],
    stock INT DEFAULT 50,
    category product_category DEFAULT 'livro',
    buy_url TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.products ADD COLUMN IF NOT EXISTS subtitle TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS price_cents INT DEFAULT 0;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS images TEXT[];
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS stock INT DEFAULT 50;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS category product_category DEFAULT 'livro';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS buy_url TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT true;

CREATE INDEX IF NOT EXISTS idx_products_category ON public.products (category);
CREATE INDEX IF NOT EXISTS idx_products_active ON public.products (active) WHERE active = true;

-- =============================================================================
-- 5. TABELA: SAINTS (Santoral / Santo do Dia)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.saints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    title TEXT,
    feast_month INT NOT NULL CHECK (feast_month BETWEEN 1 AND 12),
    feast_day INT NOT NULL CHECK (feast_day BETWEEN 1 AND 31),
    feast_date TEXT,
    short_bio TEXT,
    summary TEXT,
    full_bio TEXT,
    patronage TEXT,
    category TEXT,
    image_url TEXT,
    prayer TEXT,
    quotes TEXT[],
    featured BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.saints ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE public.saints ADD COLUMN IF NOT EXISTS feast_date TEXT;
ALTER TABLE public.saints ADD COLUMN IF NOT EXISTS short_bio TEXT;
ALTER TABLE public.saints ADD COLUMN IF NOT EXISTS summary TEXT;
ALTER TABLE public.saints ADD COLUMN IF NOT EXISTS full_bio TEXT;
ALTER TABLE public.saints ADD COLUMN IF NOT EXISTS patronage TEXT;
ALTER TABLE public.saints ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE public.saints ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE public.saints ADD COLUMN IF NOT EXISTS prayer TEXT;
ALTER TABLE public.saints ADD COLUMN IF NOT EXISTS quotes TEXT[];
ALTER TABLE public.saints ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_saints_feast ON public.saints (feast_month, feast_day);
CREATE INDEX IF NOT EXISTS idx_saints_slug ON public.saints (slug);
CREATE INDEX IF NOT EXISTS idx_saints_featured ON public.saints (featured) WHERE featured = true;

-- =============================================================================
-- 6. TABELA: PRAYERS (Orações Católicas)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.prayers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    situation TEXT NOT NULL DEFAULT 'diarias',
    category TEXT DEFAULT 'diarias',
    content TEXT NOT NULL,
    text TEXT,
    description TEXT,
    is_featured_today BOOLEAN DEFAULT false,
    featured_date DATE,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.prayers ADD COLUMN IF NOT EXISTS situation TEXT DEFAULT 'diarias';
ALTER TABLE public.prayers ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'diarias';
ALTER TABLE public.prayers ADD COLUMN IF NOT EXISTS content TEXT;
ALTER TABLE public.prayers ADD COLUMN IF NOT EXISTS text TEXT;
ALTER TABLE public.prayers ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.prayers ADD COLUMN IF NOT EXISTS is_featured_today BOOLEAN DEFAULT false;
ALTER TABLE public.prayers ADD COLUMN IF NOT EXISTS featured_date DATE;
ALTER TABLE public.prayers ADD COLUMN IF NOT EXISTS image_url TEXT;

CREATE INDEX IF NOT EXISTS idx_prayers_situation ON public.prayers (situation);
CREATE INDEX IF NOT EXISTS idx_prayers_slug ON public.prayers (slug);
CREATE INDEX IF NOT EXISTS idx_prayers_featured ON public.prayers (is_featured_today) WHERE is_featured_today = true;

-- =============================================================================
-- 7. TABELA: DAILY_LITURGY (Liturgia Diária da Palavra)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.daily_liturgy (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE UNIQUE NOT NULL,
    liturgical_season TEXT,
    liturgical_color TEXT,
    color_hex TEXT DEFAULT '#1c5d3a',
    full_date_str TEXT,
    first_reading JSONB,
    psalm JSONB,
    second_reading JSONB,
    gospel JSONB,
    source TEXT DEFAULT 'CNBB / Liturgia Diária',
    inserted_manually BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.daily_liturgy ADD COLUMN IF NOT EXISTS liturgical_season TEXT;
ALTER TABLE public.daily_liturgy ADD COLUMN IF NOT EXISTS liturgical_color TEXT;
ALTER TABLE public.daily_liturgy ADD COLUMN IF NOT EXISTS color_hex TEXT DEFAULT '#1c5d3a';
ALTER TABLE public.daily_liturgy ADD COLUMN IF NOT EXISTS full_date_str TEXT;
ALTER TABLE public.daily_liturgy ADD COLUMN IF NOT EXISTS first_reading JSONB;
ALTER TABLE public.daily_liturgy ADD COLUMN IF NOT EXISTS psalm JSONB;
ALTER TABLE public.daily_liturgy ADD COLUMN IF NOT EXISTS second_reading JSONB;
ALTER TABLE public.daily_liturgy ADD COLUMN IF NOT EXISTS gospel JSONB;
ALTER TABLE public.daily_liturgy ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'CNBB / Liturgia Diária';
ALTER TABLE public.daily_liturgy ADD COLUMN IF NOT EXISTS inserted_manually BOOLEAN DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_liturgy_date ON public.daily_liturgy (date DESC);

-- =============================================================================
-- 8. TABELA: ORDERS (Pedidos da Loja)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_email TEXT NOT NULL,
    customer_name TEXT,
    items JSONB NOT NULL,
    total_cents INT NOT NULL DEFAULT 0,
    payment_status TEXT DEFAULT 'pendente',
    payment_method TEXT,
    pagarme_order_id TEXT,
    shipping_address JSONB,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS customer_name TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS items JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS total_cents INT DEFAULT 0;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pendente';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_method TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS pagarme_order_id TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS shipping_address JSONB;

CREATE INDEX IF NOT EXISTS idx_orders_email ON public.orders (customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders (payment_status);

-- =============================================================================
-- 9. TABELA: SUBSCRIBERS (Newsletter Eclesia)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.subscribers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    status TEXT DEFAULT 'ativo',
    brevo_contact_id TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.subscribers ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE public.subscribers ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'ativo';
ALTER TABLE public.subscribers ADD COLUMN IF NOT EXISTS brevo_contact_id TEXT;

-- =============================================================================
-- 10. TABELAS: SUBSCRIPTION_PLANS & SUBSCRIPTIONS (Clube / Assinaturas)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.subscription_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    tagline TEXT,
    price_cents INT NOT NULL,
    interval TEXT NOT NULL DEFAULT 'month',
    interval_count INT DEFAULT 1,
    benefits TEXT[],
    pagarme_plan_id TEXT,
    active BOOLEAN DEFAULT true
);

ALTER TABLE public.subscription_plans ADD COLUMN IF NOT EXISTS tagline TEXT;
ALTER TABLE public.subscription_plans ADD COLUMN IF NOT EXISTS price_cents INT DEFAULT 0;
ALTER TABLE public.subscription_plans ADD COLUMN IF NOT EXISTS interval TEXT DEFAULT 'month';
ALTER TABLE public.subscription_plans ADD COLUMN IF NOT EXISTS interval_count INT DEFAULT 1;
ALTER TABLE public.subscription_plans ADD COLUMN IF NOT EXISTS benefits TEXT[];
ALTER TABLE public.subscription_plans ADD COLUMN IF NOT EXISTS pagarme_plan_id TEXT;
ALTER TABLE public.subscription_plans ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT true;

CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    plan_id UUID REFERENCES public.subscription_plans(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'ativa',
    started_at TIMESTAMPTZ DEFAULT now(),
    renews_at TIMESTAMPTZ,
    canceled_at TIMESTAMPTZ,
    pagarme_subscription_id TEXT
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON public.subscriptions (user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions (status);

-- =============================================================================
-- 11. TABELA: COOKIE_CONSENTS (LGPD)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.cookie_consents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    consent_type TEXT NOT NULL DEFAULT 'all',
    user_agent TEXT,
    ip_address TEXT,
    accepted_at TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================================================
-- 12. ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================================================

-- Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "profiles_public_read" ON public.profiles;
CREATE POLICY "profiles_public_read" ON public.profiles FOR SELECT USING (true);
DROP POLICY IF EXISTS "profiles_self_update" ON public.profiles;
CREATE POLICY "profiles_self_update" ON public.profiles FOR UPDATE USING (id = auth.uid());

-- Articles
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "articles_public_read" ON public.articles;
CREATE POLICY "articles_public_read" ON public.articles FOR SELECT USING (status = 'publicado' OR auth.role() = 'authenticated');
DROP POLICY IF EXISTS "articles_authenticated_write" ON public.articles;
CREATE POLICY "articles_authenticated_write" ON public.articles FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Products
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "products_public_read" ON public.products;
CREATE POLICY "products_public_read" ON public.products FOR SELECT USING (active = true OR auth.role() = 'authenticated');
DROP POLICY IF EXISTS "products_authenticated_write" ON public.products;
CREATE POLICY "products_authenticated_write" ON public.products FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Saints
ALTER TABLE public.saints ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "saints_public_read" ON public.saints;
CREATE POLICY "saints_public_read" ON public.saints FOR SELECT USING (true);
DROP POLICY IF EXISTS "saints_authenticated_write" ON public.saints;
CREATE POLICY "saints_authenticated_write" ON public.saints FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Prayers
ALTER TABLE public.prayers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "prayers_public_read" ON public.prayers;
CREATE POLICY "prayers_public_read" ON public.prayers FOR SELECT USING (true);
DROP POLICY IF EXISTS "prayers_authenticated_write" ON public.prayers;
CREATE POLICY "prayers_authenticated_write" ON public.prayers FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Daily Liturgy
ALTER TABLE public.daily_liturgy ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "liturgy_public_read" ON public.daily_liturgy;
CREATE POLICY "liturgy_public_read" ON public.daily_liturgy FOR SELECT USING (true);
DROP POLICY IF EXISTS "liturgy_authenticated_write" ON public.daily_liturgy;
CREATE POLICY "liturgy_authenticated_write" ON public.daily_liturgy FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Orders
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "orders_public_insert" ON public.orders;
CREATE POLICY "orders_public_insert" ON public.orders FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "orders_public_select" ON public.orders;
CREATE POLICY "orders_public_select" ON public.orders FOR SELECT USING (customer_email = auth.email() OR auth.role() = 'authenticated');

-- Subscribers
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "subscribers_public_insert" ON public.subscribers;
CREATE POLICY "subscribers_public_insert" ON public.subscribers FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "subscribers_admin_read" ON public.subscribers;
CREATE POLICY "subscribers_admin_read" ON public.subscribers FOR SELECT TO authenticated USING (true);

-- Cookie Consents
ALTER TABLE public.cookie_consents ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "cookie_consents_public_insert" ON public.cookie_consents;
CREATE POLICY "cookie_consents_public_insert" ON public.cookie_consents FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "cookie_consents_admin_read" ON public.cookie_consents;
CREATE POLICY "cookie_consents_admin_read" ON public.cookie_consents FOR SELECT TO authenticated USING (true);

-- Subscription Plans & Subscriptions
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "plans_public_read" ON public.subscription_plans;
CREATE POLICY "plans_public_read" ON public.subscription_plans FOR SELECT USING (true);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "subscriptions_user_read" ON public.subscriptions;
CREATE POLICY "subscriptions_user_read" ON public.subscriptions FOR SELECT USING (user_id = auth.uid() OR auth.role() = 'authenticated');
DROP POLICY IF EXISTS "subscriptions_user_insert" ON public.subscriptions;
CREATE POLICY "subscriptions_user_insert" ON public.subscriptions FOR INSERT WITH CHECK (user_id = auth.uid() OR auth.role() = 'authenticated');

-- =============================================================================
-- 13. SEED DATA REAL (CARGA INICIAL DE CONTEÚDO CATÓLICO NO BANCO)
-- =============================================================================

-- ARTIGOS DO BLOG
INSERT INTO public.articles (id, title, slug, excerpt, content, cover_image, category, type, author_name, read_time, status, featured, trending, published_at)
VALUES
(
    'a1111111-1111-1111-1111-111111111111',
    'Papa Francisco Convocou o Ano de Oração em Preparação para o Jubileu de 2025',
    'papa-convocou-ano-oracao-jubileu-2025',
    'Durante o Angelus na Praça de São Pedro, o Santo Padre destacou a necessidade urgente de reconectar os corações à oração diária e comunitária.',
    'Na manhã do último domingo, o Papa Francisco exortou os fiéis do mundo inteiro a intensificarem a oração pessoal e litúrgica como uma verdadeira peregrinação da esperança em direção ao Ano Santo de 2025.\n\n"Pedindo o dom da paz para todas as nações flageladas por conflitos, o Ano de Oração deve ser uma oportunidade para redescobrirmos a beleza do Pai Nosso e a importância do silêncio contemplativo em nossas paróquias e lares", afirmou o Papa.\n\nO Dicastério para a Evangelização publicou uma série de cadernos de oração em diversas línguas para auxiliar dioceses, grupos de jovens e famílias no aprofundamento das virtudes cardeais e na prática dos sacramentos.',
    'https://images.unsplash.com/photo-1548625361-195979bc7583?auto=format&fit=crop&q=80&w=1200',
    'Vaticano',
    'noticia',
    'Redação Eclesia / Sala de Imprensa da Santa Sé',
    '3 min de leitura',
    'publicado',
    true,
    true,
    now() - interval '1 day'
),
(
    'a2222222-2222-2222-2222-222222222222',
    'A Beleza Silenciosa da Liturgia Tradicional',
    'beleza-silenciosa-liturgia-tradicional',
    'Uma exploração sobre como o silêncio e o mistério na liturgia nos aproximam do transcendente, contrapondo o ruído moderno.',
    'Na aceleração desenfreada do mundo contemporâneo, a Liturgia Sagrada ergue-se como um oásis de atemporalidade. O silêncio litúrgico não é mera ausência de som, mas uma plenitude de presença — o espaço onde a alma suspende a tagarelice humana para escutar a linguagem incriada do Criador.\n\nO Cardeal Robert Sarah frequentemente nos recorda que "o silêncio é a primeira linguagem de Deus". Quando observamos os ritos milenares da Santa Missa, o olhar contemplativo percebe que cada gesto do sacerdote, a orientação do altar ad orientem, o perfume suave do incenso e o som sacro do Canto Gregoriano convergem para um único centro: o Sacrifício Redentor do Calvário.\n\nA verdadeira beleza não necessita de artifícios nem de animações profanas. Ela brilha com a claridade serena da verdade e convida o fiel à adoração em espírito e em verdade.',
    'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&q=80&w=1200',
    'Teologia',
    'artigo',
    'Pe. Guilherme de Alcantara',
    '8 min de leitura',
    'publicado',
    false,
    true,
    now() - interval '3 days'
),
(
    'a3333333-3333-3333-3333-333333333333',
    'Restauração de Afrescos do Século XVIII Mobiliza Artesãos em Minas Gerais',
    'restauracao-afrescos-seculo-xviii-minas-gerais',
    'O projeto pioneiro de preservação histórica resgata painéis barrocos dedicados a Nossa Senhora do Carmo, empregando pigmentos minerais naturais.',
    'Uma comissão de peritos em restauro e mestres pintores iniciou a revitalização das abóbadas do teto nave da antiga Matriz de São João del-Rei. Os afrescos, afetados pela umidade ao longo dos séculos, estão recebendo consolidantes e higienização criteriosa.\n\nSegundo a historiadora Dra. Helena Drummond, "cada centímetro de pintura barroca recuperado restitui à comunidade católica a iconografia catequética com que nossos antepassados meditavam os mistérios do Rosário".',
    'https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&q=80&w=1200',
    'Notícias',
    'noticia',
    'Informa Eclesia',
    '4 min de leitura',
    'publicado',
    false,
    false,
    now() - interval '5 days'
),
(
    'a4444444-4444-4444-4444-444444444444',
    'Padres do Deserto: Sabedoria Antiga para o Homem Moderno',
    'padres-do-deserto-sabedoria-antiga',
    'As lições perenes de ascetismo e oração profunda que a vida no deserto do século IV ainda nos ensina hoje.',
    'Nos desertos ardentes do Egito e da Síria, durante os séculos IV e V, homens e mulheres impulsionados por um amor ardente por Cristo abandonaram a sedução do Império Romano para inaugurar o monaquismo cristão. Nomes como Santo Antão o Grande, São Pacômio e Santo Evágrio do Ponto tornaram-se os faróis do combate espiritual.\n\nSeus ensinamentos, preservados nos célebres Apophthegmata Patrum (Ditos dos Padres), tratam com precisão cirúrgica a anatomia das paixões humanas e os remédios da alma.\n\nEles nos ensinam a vigiar os pensamentos (logismoi), cultivar a hesychia (paz interior) e abraçar a oração contínua. Em uma época marcada por distrações incessantes e telas reluzentes, os conselhos do deserto soam surpreendentemente atuais e libertadores.',
    'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&q=80&w=1200',
    'História',
    'artigo',
    'Dom Bernardo da Mota, OSB',
    '12 min de leitura',
    'publicado',
    false,
    false,
    now() - interval '7 days'
)
ON CONFLICT (slug) DO UPDATE SET
    title = EXCLUDED.title,
    excerpt = EXCLUDED.excerpt,
    content = EXCLUDED.content,
    cover_image = EXCLUDED.cover_image,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    author_name = EXCLUDED.author_name,
    read_time = EXCLUDED.read_time,
    status = EXCLUDED.status,
    featured = EXCLUDED.featured;

-- PRODUTOS DA LOJA
INSERT INTO public.products (id, name, slug, subtitle, description, price_cents, images, stock, category, active, buy_url)
VALUES
(
    '11111111-1111-1111-1111-111111111111',
    'Terço de Madeira Nobre e Cordão Militar',
    'terco-madeira-nobre-cordao-militar',
    'Contas em jacarandá maciço 8mm e medalha de São Bento em bronze envelhecido.',
    'Terço artesanal confeccionado com contas de madeira nobre de alta densidade e cordão paracord 550 resistente. Acompanha medalha de São Bento com indulgência e crucifixo clássico detalhado.',
    8900,
    ARRAY['https://images.unsplash.com/photo-1548625361-195979bc7583?auto=format&fit=crop&q=80&w=800'],
    35,
    'sacramental',
    true,
    'https://loja.eclesia.blog.br/terco'
),
(
    '22222222-2222-2222-2222-222222222222',
    'Summa Theologiae — Edição Integral em 9 Volumes',
    'summa-theologiae-edicao-integral',
    'Obra prima de Santo Tomás de Aquino traduzida diretamente do latim.',
    'A mais completa e rigorosa edição em língua portuguesa da obra que sintetizou a teologia católica. Capa dura com gravação em ouro nobre, fitas marcadoras e notas teológicas extensas.',
    48900,
    ARRAY['https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=800'],
    12,
    'livro',
    true,
    'https://loja.eclesia.blog.br/summa'
),
(
    '33333333-3333-3333-3333-333333333333',
    'Ícone de Nossa Senhora do Perpétuo Socorro',
    'icone-nossa-senhora-perpetuo-socorro',
    'Pintura em têmpera de ovo sobre madeira com folha de ouro 24k.',
    'Ícone bizantino tradicional reproduzido fielmente por mestres iconógrafos católicos. Base em madeira de tília tratada com acabamento em cera de abelha natural.',
    24000,
    ARRAY['https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&q=80&w=800'],
    8,
    'arte',
    true,
    'https://loja.eclesia.blog.br/icone-ns-socorro'
),
(
    '44444444-4444-4444-4444-444444444444',
    'Escapulário do Carmo em Tecido de Lã Pura',
    'escapulario-do-carmo-la-pura',
    'Fiel à tradição carmelitana com cordão marrom e acabamento reforçado.',
    'Escapulário tradicional confeccionado em lã 100% pura marrom com estampa bordada do Sagrado Coração de Jesus e de Nossa Senhora do Monte Carmelo. Promessa sabatina de salvação.',
    3500,
    ARRAY['https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&q=80&w=800'],
    80,
    'sacramental',
    true,
    'https://loja.eclesia.blog.br/escapulario'
)
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    subtitle = EXCLUDED.subtitle,
    description = EXCLUDED.description,
    price_cents = EXCLUDED.price_cents,
    images = EXCLUDED.images,
    category = EXCLUDED.category,
    active = EXCLUDED.active;

-- SANTOS (SANTORAL)
INSERT INTO public.saints (id, name, slug, title, feast_month, feast_day, feast_date, short_bio, summary, full_bio, patronage, image_url, prayer, quotes, featured)
VALUES
(
    '55555555-5555-5555-5555-555555555555',
    'Santo Tomás de Aquino',
    'santo-tomas-de-aquino',
    'Doutor Angélico e Príncipe dos Teólogos',
    1,
    28,
    '28 de Janeiro',
    'Doutor Angélico da Igreja Católica. Autor da Summa Theologiae.',
    'Doutor Angélico da Igreja. Suas contribuições monumentais para a teologia e a filosofia, unindo a razão aristotélica à revelação divina, continuam a ser a base do ensino católico.',
    'Santo Tomás de Aquino nasceu em 1225 em Roccasecca, perto de Nápoles. Ingressou na Ordem dos Pregadores (Dominicanos) contra a vontade inicial de sua nobre família. Estudou sob a orientação de Santo Alberto Magno em Paris e Colônia.\n\nConhecido por sua inteligência fulgurante e profundo espírito de oração, escreveu obras monumentais como a Summa Theologiae e o Summa contra Gentiles, além dos hinos eucarísticos como o Tantum Ergo e Panis Angelicus. Uniu perfeitamente a filosofia aristotélica e a teologia cristã, demonstrando que fé e razão não se opõem, mas se completam.',
    'Estudantes, Teólogos e Academias',
    'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&q=80&w=800',
    'Ó Deus, que tornastes Santo Tomás de Aquino admirável pelo zelo da santidade e pelo amor aos estudos teológicos, concedei-nos compreender seus ensinamentos e imitar seus exemplos de virtude. Por Nosso Senhor Jesus Cristo, vosso Filho, na unidade do Espírito Santo. Amém.',
    ARRAY['Para aquele que tem fé, nenhuma explicação é necessária. Para aquele sem fé, nenhuma explicação é possível.', 'A virtude da caridade nos une a Deus em um abraço de amizade profunda.', 'A Eucaristia é o sacramento do amor, sinal da nossa união com Cristo.'],
    true
),
(
    '66666666-6666-6666-6666-666666666666',
    'Santa Teresinha do Menino Jesus',
    'santa-teresinha-do-menino-jesus',
    'Virgem e Doutora da Igreja',
    10,
    1,
    '1 de Outubro',
    'Padroeira das Missões e mestra da Pequena Via da infância espiritual.',
    'Virgem e Doutora da Igreja. O "pequeno caminho" da infância espiritual e a vocação para o amor no coração da Igreja.',
    'Thérèse Martin nasceu em Alençon, França, em 1873. Aos 15 anos, ingressou no Carmelo de Lisieux, adotando o nome de Teresa do Menino Jesus e da Sagrada Face.\n\nCom sua espiritualidade da "Infância Espiritual" ou "Pequena Via", ensinou que a santidade não exige obras grandiosas e inacessíveis, mas o abandono de uma criança nos braços do Pai Celestial e a realização dos pequenos atos do cotidiano com um amor infinito. Escreveu a célebre autobiografia ''História de uma Alma''. Foi declarada Padroeira das Missões e Doutora da Igreja por São João Paulo II.',
    'Missões e Floristas',
    'https://images.unsplash.com/photo-1548625361-195979bc7583?auto=format&fit=crop&q=80&w=800',
    'Ó Deus, que preparastes o vosso Reino para os pequeninos e humildes, dai-nos seguir confiantes o caminho de Santa Teresa, para que, por sua intercessão, nos seja revelada a vossa glória. Por nosso Senhor Jesus Cristo, vosso Filho, na unidade do Espírito Santo. Amém.',
    ARRAY['No coração da Igreja, minha Mãe, eu serei o Amor!', 'Quero passar o meu céu fazendo o bem sobre a terra. Farei cair uma chuva de rosas.', 'O que me atrai para o Reino dos Céus é o amor de Deus que me preenche.'],
    false
),
(
    '77777777-7777-7777-7777-777777777777',
    'São Francisco de Assis',
    'sao-francisco-de-assis',
    'O Poverello de Assis',
    10,
    4,
    '4 de Outubro',
    'Fundador da Ordem Franciscana e apóstolo da santa pobreza.',
    'Fundador da Ordem dos Frades Menores, dedicou sua vida à pobreza radical e à imitação de Cristo crucificado.',
    'Nascido em Assis, Itália, em 1181, filho de um rico comerciante de tecidos, Francisco abandonou suas riquezas ao ouvir o chamado de Cristo na igrejinha de São Damião: "Francisco, vai e restaura a minha casa que está em ruínas".\n\nFundou a Ordem dos Frades Menores, caracterizada pela pobreza evangélica, fraternidade e amor compassivo pelas criaturas. Em Monte Alverne, recebeu no próprio corpo os Estigmas da Paixão de Cristo, tornando-se o primeiro estigmatizado da história.',
    'Ecologia, Animais e Ordem Franciscana',
    'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&q=80&w=800',
    'Senhor, fazei-me instrumento de vossa paz. Onde houver ódio, que eu leve o amor; onde houver ofensa, que eu leve o perdão; onde houver discórdia, que eu leve a união. Amém.',
    ARRAY['Comece fazendo o que é necessário, depois o que é possível, e de repente você estará fazendo o impossível.', 'Pregue o Evangelho em todo o tempo. Se necessário, use palavras.', 'Louvado sejas, meu Senhor, com todas as tuas criaturas.'],
    false
)
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    title = EXCLUDED.title,
    feast_month = EXCLUDED.feast_month,
    feast_day = EXCLUDED.feast_day,
    feast_date = EXCLUDED.feast_date,
    summary = EXCLUDED.summary,
    full_bio = EXCLUDED.full_bio,
    patronage = EXCLUDED.patronage,
    image_url = EXCLUDED.image_url,
    prayer = EXCLUDED.prayer,
    quotes = EXCLUDED.quotes,
    featured = EXCLUDED.featured;

-- ORAÇÕES CATÓLICAS
INSERT INTO public.prayers (id, title, slug, situation, category, content, text, description, is_featured_today)
VALUES
(
    '88888888-8888-8888-8888-888888888888',
    'Oração de São Bento contra as Ciladas do Inimigo',
    'oracao-de-sao-bento',
    'protecao',
    'protecao',
    'A Cruz Sagrada seja a minha luz, não seja o dragão meu guia. Retira-te, satanás! Nunca me aconselhes coisas vãs. É mau o que me ofereces, bebe tu mesmo o teu veneno. Em nome do Pai, do Filho e do Espírito Santo. Amém.',
    'A Cruz Sagrada seja a minha luz, não seja o dragão meu guia. Retira-te, satanás! Nunca me aconselhes coisas vãs. É mau o que me ofereces, bebe tu mesmo o teu veneno. Em nome do Pai, do Filho e do Espírito Santo. Amém.',
    'Poderosa invocação da Cruz de São Bento para livramento espiritual e proteção do lar.',
    true
),
(
    '99999999-9999-9999-9999-999999999999',
    'Salve Regina (Salve Rainha)',
    'salve-regina',
    'mariana',
    'mariana',
    'Salve, Rainha, Mãe de misericórdia, vida, doçura e esperança nossa, salve! A vós bradamos, os degredados filhos de Eva. A vós suspiramos, gemendo e chorando neste vale de lágrimas. Eia, pois, advogada nossa, esses vossos olhos misericordiosos a nós volvei, e depois deste desterro mostrai-nos Jesus, bendito fruto do vosso ventre, ó clemente, ó piedosa, ó doce sempre Virgem Maria. Rogai por nós, Santa Mãe de Deus, para que sejamos dignos das promessas de Cristo. Amém.',
    'Salve, Rainha, Mãe de misericórdia, vida, doçura e esperança nossa, salve! A vós bradamos, os degredados filhos de Eva. A vós suspiramos, gemendo e chorando neste vale de lágrimas. Eia, pois, advogada nossa, esses vossos olhos misericordiosos a nós volvei, e depois deste desterro mostrai-nos Jesus, bendito fruto do vosso ventre, ó clemente, ó piedosa, ó doce sempre Virgem Maria. Rogai por nós, Santa Mãe de Deus, para que sejamos dignos das promessas de Cristo. Amém.',
    'A mais célebre antífona mariana, cantada pela Igreja há quase um milênio ao final do dia.',
    false
),
(
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'Pater Noster (Pai Nosso em Latim)',
    'pater-noster-latim',
    'latim',
    'latim',
    'Pater noster, qui es in caelis, sanctificetur nomen tuum. Adveniat regnum tuum. Fiat voluntas tua, sicut in caelo et in terra. Panem nostrum quotidianum da nobis hodie, et dimitte nobis debita nostra sicut et nos dimittimus debitoribus nostris. Et ne nos inducas in tentationem, sed libera nos a malo. Amen.',
    'Pater noster, qui es in caelis, sanctificetur nomen tuum. Adveniat regnum tuum. Fiat voluntas tua, sicut in caelo et in terra. Panem nostrum quotidianum da nobis hodie, et dimitte nobis debita nostra sicut et nos dimittimus debitoribus nostris. Et ne nos inducas in tentationem, sed libera nos a malo. Amen.',
    'A oração ensinada pelo próprio Senhor Jesus na língua universal da Igreja Católica.',
    false
)
ON CONFLICT (slug) DO UPDATE SET
    title = EXCLUDED.title,
    situation = EXCLUDED.situation,
    category = EXCLUDED.category,
    content = EXCLUDED.content,
    text = EXCLUDED.text,
    description = EXCLUDED.description,
    is_featured_today = EXCLUDED.is_featured_today;

-- LITURGIA DIÁRIA (Exemplo Hoje)
INSERT INTO public.daily_liturgy (date, liturgical_season, liturgical_color, color_hex, full_date_str, first_reading, psalm, gospel, source)
VALUES
(
    CURRENT_DATE,
    'Tempo Comum — 33º Domingo do Tempo Comum',
    'Verde',
    '#1c5d3a',
    TO_CHAR(CURRENT_DATE, 'DD "de" Month "de" YYYY'),
    '{"title": "Leitura do Livro do Profeta Daniel", "ref": "Dn 12, 1-3", "text": "Naquele tempo, levantar-se-á Miguel, o grande príncipe que protege os filhos do teu povo. Será um tempo de angústia como nunca houve... Os que forem sábios resplandecerão como o fulgor do firmamento; e os que tiverem ensinado a muitos a justiça brilharão para sempre como as estrelas."}',
    '{"title": "Salmo Responsorial", "ref": "Sl 15 (16)", "response": "Guardai-me, ó Deus, porque em vós me refugio!", "text": "Ó Senhor, vós sois a minha herança e o meu cálice; meu destino está seguro em vossas mãos. Tenho sempre o Senhor ante os meus olhos; com Ele a meu lado, jamais vacilarei."}',
    '{"title": "Proclamação do Evangelho de Jesus Cristo segundo Marcos", "ref": "Mc 13, 24-32", "text": "Naquele tempo, disse Jesus aos seus discípulos: Naqueles dias, depois de uma grande tribulação, o sol se escurecerá e a lua não dará mais a sua luz... Vereis então o Filho do Homem vir sobre as nuvens com grande poder e glória. Ele enviará os anjos e reunirá os seus eleitos dos quatro cantos da terra."}',
    'CNBB / Liturgia Diária Oficial'
)
ON CONFLICT (date) DO NOTHING;
