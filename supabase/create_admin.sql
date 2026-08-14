-- =====================================================================
-- CRIAR OU PROMOVER USUÁRIO ADMINISTRADOR NO SUPABASE
-- Email: suporte.delski@gmail.com
-- Senha: @Ma6tBrai67.
-- =====================================================================
-- Execute este script diretamente no SQL Editor do Painel do Supabase.

-- 1. Garante que a extensão pgcrypto está ativa para criptografar a senha
create extension if not exists pgcrypto with schema extensions;

do $$
declare
  v_user_id uuid;
  v_encrypted_pw text;
begin
  -- Gera o hash bcrypt da senha fornecida
  v_encrypted_pw := extensions.crypt('@Ma6tBrai67.', extensions.gen_salt('bf', 10));

  -- Verifica se o usuário já existe na autenticação
  select id into v_user_id from auth.users where email = 'suporte.delski@gmail.com';

  if v_user_id is null then
    -- Gera novo ID para o usuário
    v_user_id := gen_random_uuid();

    -- Cria o usuário diretamente em auth.users com email confirmado
    insert into auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      recovery_token,
      email_change_token_new,
      email_change
    ) values (
      '00000000-0000-0000-0000-000000000000',
      v_user_id,
      'authenticated',
      'authenticated',
      'suporte.delski@gmail.com',
      v_encrypted_pw,
      now(),
      '{"provider": "email", "providers": ["email"]}'::jsonb,
      '{"full_name": "Administrador Eclesia", "name": "Administrador Eclesia"}'::jsonb,
      now(),
      now(),
      '',
      '',
      '',
      ''
    );

    -- Cria ou atualiza a identidade em auth.identities
    insert into auth.identities (
      id,
      user_id,
      identity_data,
      provider,
      provider_id,
      last_sign_in_at,
      created_at,
      updated_at
    ) values (
      v_user_id,
      v_user_id,
      format('{"sub":"%s","email":"%s"}', v_user_id, 'suporte.delski@gmail.com')::jsonb,
      'email',
      'suporte.delski@gmail.com',
      now(),
      now(),
      now()
    )
    on conflict (provider, provider_id) do update
    set last_sign_in_at = now();

  else
    -- Se já existia, apenas atualiza a senha e confirma o email
    update auth.users
    set
      encrypted_password = v_encrypted_pw,
      email_confirmed_at = coalesce(email_confirmed_at, now()),
      raw_user_meta_data = coalesce(raw_user_meta_data, '{}'::jsonb) || '{"full_name": "Administrador Eclesia", "name": "Administrador Eclesia"}'::jsonb,
      updated_at = now()
    where id = v_user_id;
  end if;

  -- 2. Garante que o perfil público exista e tenha permissão de ADMIN
  insert into public.profiles (id, full_name, role)
  values (v_user_id, 'Administrador Eclesia', 'admin'::user_role)
  on conflict (id) do update
  set
    role = 'admin'::user_role,
    full_name = coalesce(public.profiles.full_name, 'Administrador Eclesia');

  raise notice 'Conta de administrador configurada com sucesso para: suporte.delski@gmail.com (ID: %)', v_user_id;
end $$;

-- =====================================================================
-- VERIFICAÇÃO FINAL
-- =====================================================================
select 
  u.id,
  u.email,
  u.email_confirmed_at,
  p.full_name,
  p.role
from auth.users u
left join public.profiles p on p.id = u.id
where u.email = 'suporte.delski@gmail.com';
