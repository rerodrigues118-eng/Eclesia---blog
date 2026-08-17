-- =====================================================================
-- PROMOVER OU CONFIGURAR USUÁRIO ADMINISTRADOR NO SUPABASE
-- Email do Administrador: suporte.delski@gmail.com
-- =====================================================================
-- OBSERVAÇÃO DE SEGURANÇA:
-- A senha NUNCA deve ser versionada em código ou scripts SQL.
-- O usuário deve ser criado/ter sua senha definida através de:
-- 1. Painel do Supabase: Authentication > Users > "Add user" ou "Send password reset"
-- 2. Link de redefinição de senha na tela /admin da própria aplicação.
-- =====================================================================

-- 1. Garante que o tipo user_role exista
do $$
begin
  if not exists (select 1 from pg_type where typname = 'user_role') then
    create type user_role as enum ('admin', 'editor', 'assinante');
  end if;
end $$;

-- 2. Promove o usuário existente com o email informado para a função ADMIN em public.profiles
do $$
declare
  v_user_id uuid;
begin
  -- Busca o UID do usuário na tabela de autenticação
  select id into v_user_id from auth.users where email = 'suporte.delski@gmail.com';

  if v_user_id is not null then
    -- Garante que o perfil público existe e atribui a permissão de 'admin'
    insert into public.profiles (id, full_name, role)
    values (v_user_id, 'Administrador Eclesia', 'admin'::user_role)
    on conflict (id) do update
    set
      role = 'admin'::user_role,
      full_name = coalesce(public.profiles.full_name, 'Administrador Eclesia');

    raise notice 'Permissão de ADMIN atribuída com sucesso para o usuário: suporte.delski@gmail.com (ID: %)', v_user_id;
  else
    raise warning 'Usuário com o email suporte.delski@gmail.com não foi encontrado em auth.users. Crie-o primeiro no painel Authentication do Supabase.';
  end if;
end $$;

-- =====================================================================
-- VERIFICAÇÃO FINAL
-- =====================================================================
select 
  u.id as auth_user_id,
  u.email,
  u.email_confirmed_at,
  p.full_name,
  p.role
from auth.users u
left join public.profiles p on p.id = u.id
where u.email = 'suporte.delski@gmail.com';
