-- =====================================================================
-- CONFIGURAÇÃO DE BUCKETS DE ARMAZENAMENTO (SUPABASE STORAGE)
-- Execute no SQL Editor do Painel do Supabase
-- =====================================================================

-- 1. CRIAR O BUCKET "post-images" (para imagens de publicações)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'post-images',
  'post-images',
  true,
  5242880, -- 5 MB limite
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update
set
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

-- 2. CRIAR O BUCKET "avatars" (para fotos de perfil dos fiéis)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'avatars',
  'avatars',
  true,
  3145728, -- 3 MB limite
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set
  public = true,
  file_size_limit = 3145728,
  allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp'];

-- =====================================================================
-- POLÍTICAS DE SEGURANÇA (RLS) PARA STORAGE
-- =====================================================================

-- LEITURA PÚBLICA: Qualquer pessoa pode visualizar as imagens de posts
create policy "post_images_public_select"
  on storage.objects for select
  using (bucket_id in ('post-images', 'avatars'));

-- INSERÇÃO: Apenas usuários autenticados podem enviar imagens
create policy "post_images_auth_insert"
  on storage.objects for insert
  to authenticated
  with check (bucket_id in ('post-images', 'avatars'));

-- ATUALIZAÇÃO: O autor pode atualizar a sua própria imagem
create policy "post_images_auth_update"
  on storage.objects for update
  to authenticated
  using (auth.uid()::text = (storage.foldername(name))[1] or bucket_id in ('post-images', 'avatars'));

-- EXCLUSÃO: Autor ou Admin pode deletar
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

-- =====================================================================
-- CONFIRMAÇÃO
-- =====================================================================
select id, name, public, created_at from storage.buckets;
