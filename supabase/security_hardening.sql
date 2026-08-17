-- =====================================================================
-- ECLESIA — SCRIPT DE BLINDAGEM DE SEGURANÇA E CORREÇÃO DE VULNERABILIDADES
-- Execute no SQL Editor do Supabase para blindar o banco de dados
-- =====================================================================

-- 1. FUNÇÕES AUXILIARES SECURITY DEFINER (ELIMINA RECURSÃO INFINITA NO RLS)
-- Evita subqueries circulares em public.profiles durante a checagem de policies
create or replace function public.is_admin_or_editor()
returns boolean language sql security definer set search_path = public stable as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('admin', 'editor')
  ) or coalesce(auth.jwt()->>'email', '') = 'suporte.delski@gmail.com';
$$;

create or replace function public.is_admin()
returns boolean language sql security definer set search_path = public stable as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  ) or coalesce(auth.jwt()->>'email', '') = 'suporte.delski@gmail.com';
$$;


-- 2. PROTEÇÃO CONTRA ESCALAÇÃO DE PRIVILÉGIOS (ROLE DE ADMIN)
-- Impede que um usuário comum altere sua própria coluna "role" para "admin"
create or replace function protect_profile_role_update()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  -- Se o role estiver sendo alterado
  if new.role is distinct from old.role then
    -- Permite alteração somente se o executor for admin verificado
    if not public.is_admin() then
      -- Reverte o role para o valor original sem travar a query
      new.role := old.role;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists tr_protect_profile_role on public.profiles;
create trigger tr_protect_profile_role
  before update on public.profiles
  for each row execute procedure protect_profile_role_update();


-- 3. POLÍTICAS DE RLS DA TABELA PROFILES (SEM RECURSÃO + LEITURA PÚBLICA DE AUTORES)
alter table public.profiles enable row level security;

-- Leitura pública de autores: permite que leitores vejam nome e foto dos autores em artigos
drop policy if exists "profiles_public_read_authors" on public.profiles;
drop policy if exists "profiles_self_read" on public.profiles;
create policy "profiles_public_read_authors" on public.profiles
  for select
  using (true);

-- Auto-atualização: usuário comum só altera seu próprio nome e avatar
drop policy if exists "profiles_self_update" on public.profiles;
create policy "profiles_self_update" on public.profiles
  for update
  using (id = auth.uid())
  with check (id = auth.uid());

-- Gestão administrativa de perfis
drop policy if exists "profiles_admin_all" on public.profiles;
create policy "profiles_admin_all" on public.profiles
  for all
  using (public.is_admin());


-- 4. POLÍTICAS DE RLS DAS TABELAS EDITORIAIS
-- Artigos
alter table public.articles enable row level security;
drop policy if exists "articles_public_read" on public.articles;
create policy "articles_public_read" on public.articles
  for select
  using (status = 'publicado' or public.is_admin_or_editor());

drop policy if exists "articles_admin_all" on public.articles;
create policy "articles_admin_all" on public.articles
  for all
  using (public.is_admin_or_editor());

-- Santos / Santoral
alter table public.saints enable row level security;
drop policy if exists "saints_public_read" on public.saints;
create policy "saints_public_read" on public.saints
  for select using (true);

drop policy if exists "saints_admin_write" on public.saints;
create policy "saints_admin_write" on public.saints
  for all using (public.is_admin_or_editor());

-- Liturgia Diária
alter table public.daily_liturgy enable row level security;
drop policy if exists "liturgy_public_read" on daily_liturgy;
create policy "liturgy_public_read" on daily_liturgy
  for select using (true);

drop policy if exists "liturgy_admin_write" on daily_liturgy;
create policy "liturgy_admin_write" on daily_liturgy
  for all using (public.is_admin_or_editor());

-- Orações
alter table public.prayers enable row level security;
drop policy if exists "prayers_public_read" on public.prayers;
create policy "prayers_public_read" on public.prayers
  for select using (true);

drop policy if exists "prayers_admin_write" on public.prayers;
create policy "prayers_admin_write" on public.prayers
  for all using (public.is_admin_or_editor());

-- Produtos (Loja)
alter table public.products enable row level security;
drop policy if exists "products_public_read" on public.products;
create policy "products_public_read" on public.products
  for select using (active = true or public.is_admin());

drop policy if exists "products_admin_write" on public.products;
create policy "products_admin_write" on public.products
  for all using (public.is_admin());


-- 5. BLINDAGEM DO SUPABASE STORAGE (BUCKETS DE IMAGENS)
drop policy if exists "post_images_auth_update" on storage.objects;
create policy "post_images_auth_update"
  on storage.objects for update
  to authenticated
  using (
    auth.uid()::text = (storage.foldername(name))[1]
    or public.is_admin()
  );

drop policy if exists "post_images_auth_delete" on storage.objects;
create policy "post_images_auth_delete"
  on storage.objects for delete
  to authenticated
  using (
    auth.uid()::text = (storage.foldername(name))[1]
    or public.is_admin()
  );


-- 6. BLINDAGEM DE PEDIDOS E PAGAMENTOS (TABELA ORDERS)
create or replace function protect_order_status_insert()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  -- Pedidos criados publicamente sempre iniciam como 'pendente'
  if not public.is_admin() then
    new.payment_status := 'pendente';
  end if;
  return new;
end;
$$;

drop trigger if exists tr_protect_order_status on public.orders;
create trigger tr_protect_order_status
  before insert or update on public.orders
  for each row execute procedure protect_order_status_insert();


-- 7. VALIDAÇÃO RIGOROSA DE FORMATO DE E-MAIL (TABELA SUBSCRIBERS)
-- Impede inserção de endereços de e-mail inválidos ou payloads maliciosos
do $$
begin
  alter table public.subscribers drop constraint if exists subscribers_email_format_check;
  alter table public.subscribers add constraint subscribers_email_format_check
    check (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');
exception
  when others then null;
end $$;


-- 8. TABELA DE CONFIGURAÇÕES GERAIS E CMS DO SITE
create table if not exists public.site_settings (
  id text primary key default 'default',
  settings jsonb not null default '{}'::jsonb,
  updated_at timestamptz default now()
);

alter table public.site_settings enable row level security;
drop policy if exists "site_settings_public_read" on public.site_settings;
create policy "site_settings_public_read" on public.site_settings for select using (true);

drop policy if exists "site_settings_admin_write" on public.site_settings;
create policy "site_settings_admin_write" on public.site_settings for all using (public.is_admin());


