-- Schema para a Copa do Mundo 2026

-- 1. Tabela de partidas (Matches)
CREATE TABLE IF NOT EXISTS public.matches (
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

-- 2. Habilitar RLS (Row Level Security) para segurança
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

-- 3. Políticas de Segurança (RLS Policies)
-- Qualquer usuário pode ver (ler) os resultados oficiais dos jogos
CREATE POLICY "Permitir leitura pública para todas as partidas"
ON public.matches
FOR SELECT
USING (true);

-- Permite escrita/modificação apenas com chave de serviço (Service Role) 
-- para que o Cron Job de resultados ou você como admin possa atualizar, impedindo usuários comuns de alterarem dados reais.
CREATE POLICY "Permitir escrita apenas com chave autenticada de admin"
ON public.matches
FOR ALL
USING (auth.role() = 'service_role');
