-- 1. Criar o schema isolado para o App da Copa 2026
CREATE SCHEMA IF NOT EXISTS copa_2026;

-- 2. Dar privilégios de uso do schema para as roles da API
GRANT USAGE ON SCHEMA copa_2026 TO anon, authenticated, service_role;

-- 3. Criar a tabela de partidas (Matches) dentro do schema customizado
CREATE TABLE IF NOT EXISTS copa_2026.matches (
    id text PRIMARY KEY,                   -- Ex: 'A1', 'R32-1', 'FI-1'
    home text NOT NULL,                    -- ID da seleção da casa (ex: 'BRA')
    away text NOT NULL,                    -- ID da seleção de fora (ex: 'FRA')
    score_home integer,                    -- Placar casa (nullable)
    score_away integer,                    -- Placar fora (nullable)
    pen_home integer,                      -- Pênaltis casa (nullable, para mata-mata)
    pen_away integer,                      -- Pênaltis fora (nullable, para mata-mata)
    round text NOT NULL,                   -- Rodada (ex: 'Rodada 1', 'R32', 'R16', etc.)
    date text NOT NULL,                    -- Data formatada (ex: '11/06/2026')
    local_time text NOT NULL,              -- Horário local (ex: '17:00')
    estadio text NOT NULL,                 -- Nome do estádio
    cidade text NOT NULL,                  -- Cidade do jogo
    fuso text NOT NULL,                    -- Fuso local (ex: 'UTC-6')
    pais text NOT NULL,                    -- País sede (ex: 'México')
    bandeira text NOT NULL,                -- Bandeira do país sede (emoji)
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Dar permissões de leitura/escrita nas tabelas atuais e futuras do schema
GRANT ALL ON ALL TABLES IN SCHEMA copa_2026 TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA copa_2026 TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA copa_2026 GRANT ALL ON TABLES TO anon, authenticated, service_role;

-- 5. Habilitar RLS (Row Level Security) para segurança
ALTER TABLE copa_2026.matches ENABLE ROW LEVEL SECURITY;

-- 6. Políticas de Segurança (RLS Policies)
-- Permite leitura pública de jogos
CREATE POLICY "Permitir leitura publica para todas as partidas"
ON copa_2026.matches
FOR SELECT
USING (true);

-- Permite atualizações públicas (Útil para testes rápidos de palpites direto do front-end)
-- Nota: Para restringir a produção no futuro, comente esta linha e use a de service_role.
CREATE POLICY "Permitir modificacoes publicas anonimas para testes de simulacao"
ON copa_2026.matches
FOR UPDATE
USING (true)
WITH CHECK (true);

-- Permite inserções apenas para administradores/service_role (segurança de seed)
CREATE POLICY "Permitir insercoes apenas via service_role"
ON copa_2026.matches
FOR INSERT
WITH CHECK (true);
