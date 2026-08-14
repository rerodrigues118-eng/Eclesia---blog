-- =========================================================================
-- REGISTRO DE CONSENTIMENTO DE COOKIES (LGPD) - ECLESIA
-- =========================================================================

CREATE TABLE IF NOT EXISTS public.cookie_consents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    consent_type TEXT NOT NULL DEFAULT 'all', -- 'all', 'essential'
    user_agent TEXT,
    ip_address TEXT,
    accepted_at TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.cookie_consents ENABLE ROW LEVEL SECURITY;

-- Permite que qualquer visitante (anônimo ou logado) registre o consentimento de cookies
DROP POLICY IF EXISTS "Permitir inserção pública de consentimento de cookies" ON public.cookie_consents;
CREATE POLICY "Permitir inserção pública de consentimento de cookies"
    ON public.cookie_consents
    FOR INSERT
    TO public, anon, authenticated
    WITH CHECK (true);

-- Permite que o administrador leia os registros para auditoria de LGPD
DROP POLICY IF EXISTS "Permitir leitura de consentimentos por admins" ON public.cookie_consents;
CREATE POLICY "Permitir leitura de consentimentos por admins"
    ON public.cookie_consents
    FOR SELECT
    TO authenticated
    USING (
        auth.uid() = user_id 
        OR EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );
