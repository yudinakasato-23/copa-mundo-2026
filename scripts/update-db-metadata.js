import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import ws from 'ws';

// Configure dotenv to load environment variables from the root .env
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Erro: Credenciais do Supabase ausentes no arquivo .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  db: { schema: 'copa_2026' },
  auth: { persistSession: false },
  realtime: { transport: ws }
});

const NAME_TO_FIFA = {
  "Mexico": "MEX", "México": "MEX",
  "South Africa": "RSA", "África do Sul": "RSA",
  "South Korea": "KOR", "Korea Republic": "KOR", "Coreia do Sul": "KOR",
  "Czech Republic": "CZE", "Czechia": "CZE", "República Tcheca": "CZE",
  "Canada": "CAN", "Canadá": "CAN",
  "Bosnia and Herzegovina": "BIH", "Bosnia": "BIH", "Bósnia": "BIH",
  "Qatar": "QAT", "Catar": "QAT",
  "Switzerland": "SUI", "Suíça": "SUI",
  "Brazil": "BRA", "Brasil": "BRA",
  "Morocco": "MAR", "Marrocos": "MAR",
  "Haiti": "HAI", "Haiti": "HAI",
  "Scotland": "SCO", "Escócia": "SCO",
  "United States": "USA", "Estados Unidos": "USA",
  "Paraguay": "PAR", "Paraguai": "PAR",
  "Australia": "AUS", "Austrália": "AUS",
  "Turkey": "TUR", "Türkiye": "TUR", "Turquia": "TUR",
  "Germany": "GER", "Alemanha": "GER",
  "Curaçao": "CUW", "Curaçao": "CUW",
  "Ivory Coast": "CIV", "Costa do Marfim": "CIV",
  "Ecuador": "ECU", "Equador": "ECU",
  "Netherlands": "NED", "Holanda": "NED",
  "Japan": "JPN", "Japão": "JPN",
  "Sweden": "SWE", "Suécia": "SWE",
  "Tunisia": "TUN", "Tunísia": "TUN",
  "Belgium": "BEL", "Bélgica": "BEL",
  "Egypt": "EGY", "Egito": "EGY",
  "Iran": "IRN", "Irã": "IRN",
  "New Zealand": "NZL", "Nova Zelândia": "NZL",
  "Spain": "ESP", "Espanha": "ESP",
  "Cape Verde": "CPV", "Cabo Verde": "CPV",
  "Saudi Arabia": "KSA", "Arábia Saudita": "KSA",
  "Uruguay": "URU", "Uruguai": "URU",
  "France": "FRA", "França": "FRA",
  "Senegal": "SEN", "Senegal": "SEN",
  "Norway": "NOR", "Noruega": "NOR",
  "Iraq": "IRQ", "Iraque": "IRQ",
  "Argentina": "ARG", "Argentina": "ARG",
  "Algeria": "ALG", "Argélia": "ALG",
  "Austria": "AUT", "Áustria": "AUT",
  "Jordan": "JOR", "Jordânia": "JOR",
  "Portugal": "POR", "Portugal": "POR",
  "DR Congo": "COD", "RD do Congo": "COD",
  "Uzbekistan": "UZB", "Uzbequistão": "UZB",
  "Colombia": "COL", "Colômbia": "COL",
  "England": "ENG", "Inglaterra": "ENG",
  "Croatia": "CRO", "Croácia": "CRO",
  "Ghana": "GHA", "Gana": "GHA",
  "Panama": "PAN", "Panamá": "PAN"
};

const GROUPS_DATA = {
  A: ["MEX", "RSA", "KOR", "CZE"],
  B: ["CAN", "BIH", "QAT", "SUI"],
  C: ["BRA", "MAR", "HAI", "SCO"],
  D: ["USA", "PAR", "AUS", "TUR"],
  E: ["GER", "CUW", "CIV", "ECU"],
  F: ["NED", "JPN", "SWE", "TUN"],
  G: ["BEL", "EGY", "IRN", "NZL"],
  H: ["ESP", "CPV", "KSA", "URU"],
  I: ["FRA", "SEN", "NOR", "IRQ"],
  J: ["ARG", "ALG", "AUT", "JOR"],
  K: ["POR", "COD", "UZB", "COL"],
  L: ["ENG", "CRO", "PAN", "GHA"]
};

async function main() {
  try {
    const parsed = JSON.parse(fs.readFileSync('scratch/parsed_matches.json', 'utf8'));
    
    // 1. Fetch current matches from Supabase
    console.log("Conectando ao Supabase para carregar partidas...");
    const { data: dbMatches, error: fetchError } = await supabase.from('matches').select('*');
    if (fetchError) throw fetchError;
    console.log(`Carregadas ${dbMatches.length} partidas do Supabase.`);
    
    const updates = [];
    
    Object.keys(GROUPS_DATA).forEach(groupKey => {
      const teams = GROUPS_DATA[groupKey];
      
      const templates = [
        { id: `${groupKey}1`, home: teams[0], away: teams[1] },
        { id: `${groupKey}2`, home: teams[2], away: teams[3] },
        { id: `${groupKey}3`, home: teams[0], away: teams[2] },
        { id: `${groupKey}4`, home: teams[3], away: teams[1] },
        { id: `${groupKey}5`, home: teams[3], away: teams[0] },
        { id: `${groupKey}6`, home: teams[1], away: teams[2] }
      ];
      
      const groupParsedMatches = parsed[groupKey] || [];
      
      templates.forEach(tmpl => {
        const match = groupParsedMatches.find(p => {
          const pHome = NAME_TO_FIFA[p.homeTeam];
          const pAway = NAME_TO_FIFA[p.awayTeam];
          
          return (pHome === tmpl.home && pAway === tmpl.away) ||
                 (pHome === tmpl.away && pAway === tmpl.home);
        });
        
        if (match) {
          const dbMatch = dbMatches.find(m => m.id === tmpl.id);
          if (dbMatch) {
            // Apply manual override for Brazil vs Haiti (C3)
            let localTime = match.localTime;
            if (tmpl.id === "C3") {
              localTime = "21:00";
            }
            
            updates.push({
              ...dbMatch,
              date: match.date,
              local_time: localTime,
              estadio: match.estadio,
              cidade: match.cidade,
              fuso: match.fuso,
              pais: match.pais,
              bandeira: match.bandeira,
              updated_at: new Date().toISOString()
            });
          }
        }
      });
    });
    
    if (updates.length === 0) {
      console.log("Nenhuma partida para atualizar.");
      return;
    }
    
    console.log(`Atualizando ${updates.length} partidas no Supabase...`);
    const { error: upsertError } = await supabase.from('matches').upsert(updates, { onConflict: 'id' });
    if (upsertError) throw upsertError;
    
    console.log("Metadados das partidas atualizados com sucesso no Supabase!");
    process.exit(0);
  } catch (err) {
    console.error("Erro ao sincronizar metadados no Supabase:", err.message);
    process.exit(1);
  }
}

main();
