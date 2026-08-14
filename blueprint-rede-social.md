# Blueprint — Módulo de Rede Social Católica

Complementa o `blueprint-blog-catolico.md`. Este documento cobre: feed social, chat, comunidades/grupos, planos de oração compartilhados, e — o ponto mais crítico — **arquitetura de segurança e moderação**, já que o app permitirá menores de 16 anos.

---

## 1. Por que segurança vem antes de tudo aqui

Você decidiu: escopo completo desde o lançamento, moderação em camada dupla (IA + humana), idade mínima 16 anos. Isso muda a natureza do projeto — deixa de ser "site com automação" e passa a ser **plataforma social com dados sensíveis de menores**, o que traz responsabilidade legal (LGPD) e reputacional real. As decisões abaixo não são burocracia — evitam que o app vire canal de assédio, bullying religioso ou aliciamento.

**Recomendação forte:** consulte um advogado especializado em LGPD/proteção de menores antes do lançamento público. Este documento te dá a arquitetura técnica, não é aconselhamento jurídico.

---

## 2. Regras específicas para usuários 16–17 anos

- **Cadastro:** exige confirmação de e-mail + declaração de data de nascimento; conta marcada internamente como `is_minor = true` até completar 18.
- **Consentimento:** ao cadastrar menor, exibir termo específico e (recomendado) campo de e-mail de responsável para notificação — mesmo sem obrigar aprovação, cria trilha de transparência.
- **Mensagens diretas (DM):** por padrão, um adulto **não pode iniciar DM** com uma conta marcada como menor a menos que já se sigam mutuamente há um tempo mínimo (ex: 7 dias) e ambos tenham interagido publicamente antes (comentário, curtida). Menor pode desativar DMs de desconhecidos completamente nas configurações.
- **Visibilidade padrão:** perfil de menor nasce com "amigos/seguidores aprovados only" para posts, nunca público por padrão.
- **Sem geolocalização:** nunca expor localização exata de contas de menores em posts/perfil.
- **Fila de moderação prioritária:** qualquer conteúdo reportado envolvendo conta de menor (como autor ou como destinatário de comentário) pula a fila e vai para revisão humana imediata.
- **Sem anúncios/loja direcionados a menores** com coleta de dados de pagamento — compras na loja exigem conta adulta ou responsável.

---

## 3. Arquitetura de moderação em camada dupla

**Camada 1 — IA (pré-moderação automática)**
- Todo post/comentário passa por um classificador de toxicidade/discurso de ódio **antes** de ficar visível (moderação síncrona, latência baixa — ex: chamada a um modelo via Groq, que você já usa, com prompt de classificação, ou uma API de moderação dedicada).
- Categorias de bloqueio automático: assédio, discurso de ódio, conteúdo sexual, spam, incitação à violência, ataques doutrinários agressivos (ex: proselitismo hostil contra outras confissões — decisão editorial sua definir o limite).
- Resultado:
  - **Claramente violento/ofensivo** → bloqueado automaticamente, autor notificado, log criado
  - **Borderline** → publicado com "sombra" (visível pro autor, invisível pra rede) até revisão humana, ou publicado normalmente mas marcado pra fila de revisão (decisão de produto: prefiro a primeira opção, é mais segura)
  - **Limpo** → publicado normalmente

**Camada 2 — Moderação humana**
- Painel dentro do `/admin` já planejado no blueprint do blog: fila de itens sinalizados pela IA + itens denunciados por usuários
- Ações do moderador: aprovar, remover, advertir usuário, suspender temporariamente, banir
- SLA sugerido: itens envolvendo menores revisados em até 2h; demais em até 24h

**Denúncia pelo usuário**
- Botão de denúncia em todo post/comentário/mensagem/perfil
- Bloqueio de usuário (impede visualização mútua e DMs) disponível a 1 clique

---

## 4. Novas tabelas (extensão do schema Supabase)

```sql
-- Marca de menoridade e configurações de privacidade
alter table profiles add column is_minor boolean default false;
alter table profiles add column birth_date date;
alter table profiles add column guardian_email text;
alter table profiles add column profile_visibility text default 'privado'; -- privado, seguidores, publico
alter table profiles add column dm_policy text default 'seguidores_mutuos'; -- todos, seguidores_mutuos, ninguem

-- POSTS SOCIAIS (diferente de "articles", que é editorial)
create table social_posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid references profiles(id),
  content text,
  image_url text,
  visibility text default 'publico', -- publico, seguidores, comunidade
  community_id uuid references communities(id), -- null se for feed pessoal
  moderation_status text default 'publicado', -- publicado, sombra, removido, em_analise
  created_at timestamptz default now()
);

create table post_likes (
  post_id uuid references social_posts(id),
  user_id uuid references profiles(id),
  created_at timestamptz default now(),
  primary key (post_id, user_id)
);

create table post_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references social_posts(id),
  author_id uuid references profiles(id),
  content text not null,
  moderation_status text default 'publicado',
  created_at timestamptz default now()
);

-- CONEXÕES SOCIAIS
create table follows (
  follower_id uuid references profiles(id),
  following_id uuid references profiles(id),
  status text default 'ativo', -- ativo, bloqueado
  created_at timestamptz default now(),
  primary key (follower_id, following_id)
);

create table blocked_users (
  blocker_id uuid references profiles(id),
  blocked_id uuid references profiles(id),
  created_at timestamptz default now(),
  primary key (blocker_id, blocked_id)
);

-- CHAT
create table conversations (
  id uuid primary key default gen_random_uuid(),
  is_group boolean default false,
  community_id uuid references communities(id), -- null se DM 1:1
  created_at timestamptz default now()
);

create table conversation_members (
  conversation_id uuid references conversations(id),
  user_id uuid references profiles(id),
  joined_at timestamptz default now(),
  primary key (conversation_id, user_id)
);

create table messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid references conversations(id),
  sender_id uuid references profiles(id),
  content text,
  moderation_status text default 'publicado',
  created_at timestamptz default now()
);

-- COMUNIDADES / GRUPOS
create table communities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  description text,
  cover_image text,
  created_by uuid references profiles(id),
  is_public boolean default false, -- só true após aprovação de moderador
  approval_status text default 'pendente', -- pendente, aprovado, rejeitado
  linked_parish text, -- opcional: comunidade vinculada a paróquia real
  created_at timestamptz default now()
);

create table community_members (
  community_id uuid references communities(id),
  user_id uuid references profiles(id),
  role text default 'membro', -- membro, moderador, admin
  joined_at timestamptz default now(),
  primary key (community_id, user_id)
);

-- MODERAÇÃO
create table moderation_reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid references profiles(id),
  target_type text not null, -- post, comment, message, profile, community
  target_id uuid not null,
  reason text,
  status text default 'pendente', -- pendente, revisado, arquivado
  priority text default 'normal', -- alta (envolve menor), normal
  created_at timestamptz default now()
);

create table moderation_actions (
  id uuid primary key default gen_random_uuid(),
  report_id uuid references moderation_reports(id),
  moderator_id uuid references profiles(id),
  action text, -- aprovado, removido, advertencia, suspensao, banimento
  notes text,
  created_at timestamptz default now()
);

-- PLANOS DE ORAÇÃO / NOVENAS / ADORAÇÃO / CALENDÁRIO COMPARTILHADO
create table prayer_journeys (
  id uuid primary key default gen_random_uuid(),
  type text not null, -- novena, plano_oracao, adoracao, jejum
  title text not null,
  description text,
  duration_days int,
  created_by uuid references profiles(id), -- null se for oficial/curado pela equipe
  community_id uuid references communities(id), -- null se individual
  is_official boolean default false,
  created_at timestamptz default now()
);

create table prayer_journey_days (
  id uuid primary key default gen_random_uuid(),
  journey_id uuid references prayer_journeys(id),
  day_number int not null,
  content text not null
);

create table prayer_journey_participants (
  journey_id uuid references prayer_journeys(id),
  user_id uuid references profiles(id),
  current_day int default 1,
  started_at timestamptz default now(),
  last_checkin timestamptz,
  primary key (journey_id, user_id)
);

-- CALENDÁRIO COMPARTILHADO (comunidade/grupo)
create table shared_calendar_events (
  id uuid primary key default gen_random_uuid(),
  community_id uuid references communities(id),
  title text not null,
  description text,
  event_type text, -- missa, confissao, adoracao, encontro, novena
  starts_at timestamptz not null,
  location text,
  created_by uuid references profiles(id),
  created_at timestamptz default now()
);

create table event_rsvps (
  event_id uuid references shared_calendar_events(id),
  user_id uuid references profiles(id),
  status text default 'confirmado', -- confirmado, talvez, recusado
  primary key (event_id, user_id)
);
```

**RLS — pontos-chave**
- `social_posts`/`post_comments`: leitura respeita `visibility` e `blocked_users` (bloqueio é mútuo — nenhum dos dois vê o conteúdo do outro)
- `messages`: só membros de `conversation_members` leem
- `moderation_reports`/`moderation_actions`: só moderadores/admins
- Antes de qualquer insert em `social_posts`/`post_comments`/`messages`: trigger ou edge function chama a camada de IA de moderação e seta `moderation_status` no próprio insert (moderação síncrona)

---

## 5. Comunidades e grupos — fluxo

1. Usuário cria comunidade → `approval_status = 'pendente'`, `is_public = false` (só ele e convidados diretos veem)
2. Moderador revisa (nome, descrição, foto) no painel admin → aprova ou rejeita
3. Aprovada → `is_public = true`, aparece em busca/diretório
4. Dentro da comunidade: feed próprio, chat em grupo, calendário compartilhado, planos de oração da comunidade (novenas em grupo, escala de adoração)
5. Comunidades podem opcionalmente se vincular a uma paróquia real (`linked_parish`) — abre espaço futuro para parceria com paróquias verificadas (maior confiança)

---

## 6. Chat — infraestrutura

Para o MVP, **Supabase Realtime** (Postgres + websockets nativos) dá conta de chat 1:1 e em grupo sem custo extra de infraestrutura — você já usa Supabase, reaproveita 100%.

Se a base crescer muito (dezenas de milhares de usuários simultâneos em chat), migrar para um serviço dedicado (Stream Chat, Sendbird) é o caminho — mas não é necessário para lançamento. Recomendo **não otimizar prematuramente** essa parte.

---

## 7. Planos de oração, novenas, adoração, confissão

- **Planos de oração / novenas**: sequência de N dias com conteúdo diário (`prayer_journeys` + `prayer_journey_days`). Usuário "entra" na jornada (`prayer_journey_participants`), recebe notificação diária (push ou e-mail via Brevo) com o conteúdo do dia, marca check-in.
- **Podem ser oficiais** (curadas pela sua equipe/padre) **ou criadas por usuários/comunidades** — sugiro que só as oficiais fiquem em destaque na Home; as de usuários ficam dentro das comunidades.
- **Adoração ao Santíssimo**: use `shared_calendar_events` com `event_type = 'adoracao'` + `event_rsvps` para escala de horários — comunidade monta um "quadro de horários" onde cada membro confirma presença num slot.
- **Confissão**: não dá pra "agendar confissão" tecnicamente (não é um sacramento marcável como reunião), mas o app pode: (a) mostrar horários de confissão de paróquias parceiras via `shared_calendar_events`, (b) oferecer lembretes/planos de "exame de consciência" antes da confissão como conteúdo de apoio, dentro de `prayer_journeys` tipo `jejum`/reflexão.
- **Notificações diárias**: reaproveita o N8N (cron diário) — mesmo motor que já dispara santo do dia/liturgia dispara lembrete de jornada de oração pro participante.

---

## 8. Ordem técnica recomendada de construção

Mesmo lançando como produto único e completo, tecnicamente vale construir nesta ordem (evita retrabalho e permite testar moderação isoladamente antes de expor tudo):

1. **Perfis + Auth + regras de menor de idade** (fundação de tudo — se isso estiver errado, o resto herda o problema)
2. **Camada de moderação de IA** isolada e testável (endpoint interno que classifica texto), antes de plugar em qualquer feature
3. **Feed + posts + comentários + curtidas**, já com moderação síncrona plugada desde o dia 1
4. **Follows, bloqueio, denúncia, painel de moderação humana**
5. **Comunidades/grupos** (com fluxo de aprovação)
6. **Chat** (1:1 primeiro, depois grupo)
7. **Planos de oração/novenas/adoração/calendário compartilhado**
8. Testes de segurança focados em contas de menor (simular DM indesejada, verificar se bloqueio funciona, verificar fila de prioridade de denúncia) **antes** de abrir cadastro público

---

## 9. Pontos de atenção

- **LGPD e menores**: dado sensível de adolescente exige cuidado redobrado no tratamento e retenção de dados. Consulte um especialista em LGPD antes do lançamento — este documento não substitui aconselhamento jurídico.
- **Moderação de IA não é infalível**: sempre manter a denúncia de usuário como rede de segurança, mesmo com IA rodando.
- **Cultura da comunidade**: regras de convivência claras publicadas (código de conduta) ajudam tanto a IA quanto os moderadores humanos a terem critério consistente — vale escrever isso antes de lançar, não depois.
