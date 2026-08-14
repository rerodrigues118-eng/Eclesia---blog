-- =====================================================================
-- ECLESIA — SCRIPT DE BLINDAGEM DE SEGURANÇA E CORREÇÃO DE VULNERABILIDADES
-- Execute no SQL Editor do Supabase para blindar o banco de dados
-- =====================================================================

-- 1. PROTEÇÃO CONTRA ESCALAÇÃO DE PRIVILÉGIOS (ROLE DE ADMIN)
-- Impede que um usuário comum altere sua própria coluna "role" para "admin"
create or replace function protect_profile_role_update()
returns trigger language plpgsql security definer as $$
begin
  -- Se o role estiver sendo alterado
  if new.role is distinct from old.role then
    -- Permite alteração somente se o executor for superadmin ou o master admin configurado
    if not (
      auth.jwt()->>'email' = 'suporte.delski@gmail.com'
      or exists (
        select 1 from public.profiles
        where id = auth.uid() and role = 'admin'
      )
    ) then
      -- Reverte o role para o valor original sem erro ou trava
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


-- 2. AJUSTE DE RLS DA TABELA PROFILES
-- Garante que um usuário só consiga atualizar seu próprio nome e avatar
drop policy if exists "profiles_self_update" on public.profiles;
create policy "profiles_self_update" on public.profiles
  for update
  using (id = auth.uid())
  with check (id = auth.uid());


-- 3. BLINDAGEM DO SUPABASE STORAGE (BUCKETS DE IMAGENS)
-- Impede que usuários anônimos ou outros usuários sobrescrevam/deletem fotos de terceiros
drop policy if exists "post_images_auth_update" on storage.objects;
create policy "post_images_auth_update"
  on storage.objects for update
  to authenticated
  using (
    -- Permite apenas se o arquivo estiver na pasta do próprio usuário ou for admin
    auth.uid()::text = (storage.foldername(name))[1]
    or exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

drop policy if exists "post_images_auth_delete" on storage.objects;
create policy "post_images_auth_delete"
  on storage.objects for delete
  to authenticated
  using (
    auth.uid()::text = (storage.foldername(name))[1]
    or exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );


-- 4. BLINDAGEM DE PEDIDOS E PAGAMENTOS (TABELA ORDERS)
-- Impede que o cliente marque diretamente um pedido como 'pago' via inserção pública
create or replace function protect_order_status_insert()
returns trigger language plpgsql security definer as $$
begin
  -- Pedidos criados publicamente sempre iniciam como 'pendente'
  if not (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  ) then
    new.payment_status := 'pendente';
  end if;
  return new;
end;
$$;

drop trigger if exists tr_protect_order_status on public.orders;
create trigger tr_protect_order_status
  before insert or update on public.orders
  for each row execute procedure protect_order_status_insert();


-- 5. BLINDAGEM DE ARTIGOS (APENAS ADMINS E EDITORES PUBLICAM)
drop policy if exists "articles_admin_all" on public.articles;
create policy "articles_admin_all" on public.articles
  for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('admin', 'editor')
    )
    or auth.jwt()->>'email' = 'suporte.delski@gmail.com'
  );


-- 6. GARANTIR QUE RLS ESTEJA ATIVADO EM TODAS AS TABELAS
alter table public.profiles enable row level security;
alter table public.articles enable row level security;
alter table public.saints enable row level security;
alter table public.prayers enable row level security;
alter table public.daily_liturgy enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.subscribers enable row level security;
alter table public.subscription_plans enable row level security;
alter table public.subscriptions enable row level security;
