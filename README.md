# 🏆 Simulador e Acompanhamento — Copa do Mundo 2026

Aplicação web premium e responsiva projetada com a estética e fluidez de um aplicativo nativo para simulação e acompanhamento em tempo real dos resultados da Copa do Mundo FIFA 2026.

## 🚀 Tecnologias
- **Frontend:** React, Vite, TailwindCSS v4, Lucide React
- **Banco de Dados:** Supabase (PostgreSQL com schema isolado `copa_2026`)
- **Automação:** Agente local do Antigravity CLI com agendamento cron de scraping a custo zero

---

## ⚙️ Configuração do Supabase (Banco de Dados)

### 1. Criar o Schema e Tabelas
O arquivo de banco de dados está localizado em: `supabase/schema.sql`.

> [!WARNING]  
> **Aviso de Copy-Paste no SQL Editor:**  
> Ao copiar o conteúdo de `supabase/schema.sql` para o SQL Editor do Supabase, certifique-se de copiar **apenas o código SQL de dentro do bloco de código**, excluindo títulos, cabeçalhos do chat ou blocos explicativos em markdown (linhas começando com `###` ou `**`). Comentários muito longos com quebra de linha automática podem ser interpretados incorretamente pelo PostgreSQL e gerar erros de sintaxe (como `ERROR: 42601`).

### 2. Exposição do Schema na API (Obrigatório)
Como as tabelas do aplicativo estão isoladas no schema `copa_2026` para respeitar a arquitetura multi-app do banco de dados, você **deve expor este schema** para que o cliente REST da API (PostgREST) consiga acessá-lo:

1. Acesse o **Supabase Dashboard** do seu projeto.
2. Vá em **Project Settings** (ícone de engrenagem) > **API**.
3. Na seção **Exposed schemas**, adicione `copa_2026` à lista (ela ficará ao lado de `public`).
4. Salve as alterações.

---

## 🤖 Agente Inteligente de Sincronização (Local Cron Scraper)

Para evitar custos com APIs externas de esportes, a sincronização de placares é realizada por um **Agente Inteligente local** configurado no agendador do Antigravity CLI.

### Funcionamento e Janela Temporal
- **Frequência:** O cron é executado a cada 4 horas (`0 */4 * 6,7 *`), mas **apenas durante os meses de Junho e Julho de 2026**.
- **Janela de Atividade:** O agente valida a data atual e só realiza buscas entre **11 de Junho de 2026** (jogo de abertura) e **20 de Julho de 2026** (dia seguinte à final). Fora desse período, ele encerra a execução imediatamente sem gastar banda ou CPU.
- **Workflow:**
  1. O cron aciona o agente com um prompt de atualização.
  2. O agente realiza uma busca web pelos resultados mais recentes da Copa.
  3. Compila as informações no formato JSON esperado.
  4. Executa localmente o script de sincronização:
     ```bash
     node scripts/update-db-scores.js scratch/temp_scores.json
     ```
  5. O script calcula a tabela de classificação dos grupos, atualiza os confrontos do mata-mata (R32, Oitavas, Quartas, Semis e Final) e faz o upsert em lote para o banco de dados.

---

## 📦 Desenvolvimento Local

### 1. Variáveis de Ambiente
Crie um arquivo `.env` na raiz do projeto com as seguintes credenciais (baseadas no seu projeto Supabase):
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 2. Executar o Servidor de Desenvolvimento
```bash
npm install
npm run dev
```
