-- 1. Criar o schema isolado para o App da Copa 2026
CREATE SCHEMA IF NOT EXISTS copa_2026;

-- 2. Dar privilégios de uso do schema para as roles da API
GRANT USAGE ON SCHEMA copa_2026 TO anon, authenticated, service_role;

-- 3. Criar a tabela de partidas (Matches) dentro do schema customizado
CREATE TABLE IF NOT EXISTS copa_2026.matches (
    id text PRIMARY KEY,                   
    home text NOT NULL,                    
    away text NOT NULL,                    
    score_home integer,                    
    score_away integer,                    
    pen_home integer,                      
    pen_away integer,                      
    round text NOT NULL,                   
    date text NOT NULL,                    
    local_time text NOT NULL,              
    estadio text NOT NULL,                 
    cidade text NOT NULL,                  
    fuso text NOT NULL,                    
    pais text NOT NULL,                    
    bandeira text NOT NULL,                
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Dar permissões de leitura/escrita nas tabelas
GRANT ALL ON ALL TABLES IN SCHEMA copa_2026 TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA copa_2026 TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA copa_2026 GRANT ALL ON TABLES TO anon, authenticated, service_role;

-- 5. Habilitar RLS (Row Level Security)
ALTER TABLE copa_2026.matches ENABLE ROW LEVEL SECURITY;

-- 6. Politicas RLS
DROP POLICY IF EXISTS allow_public_select ON copa_2026.matches;
CREATE POLICY allow_public_select ON copa_2026.matches FOR SELECT USING (true);

DROP POLICY IF EXISTS allow_public_update ON copa_2026.matches;
CREATE POLICY allow_public_update ON copa_2026.matches FOR UPDATE USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS allow_service_role_insert ON copa_2026.matches;
CREATE POLICY allow_service_role_insert ON copa_2026.matches FOR INSERT WITH CHECK (true);
