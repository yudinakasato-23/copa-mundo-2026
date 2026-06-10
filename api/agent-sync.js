import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import ws from 'ws';

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const geminiApiKey = process.env.GEMINI_API_KEY;

export default async function handler(req, res) {
  // Simple auth token verification to prevent unauthorized runs
  const authHeader = req.headers.authorization;
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized request' });
  }

  if (!supabaseUrl || !supabaseServiceKey) {
    return res.status(500).json({ 
      error: 'Supabase credentials missing. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY on Vercel.' 
    });
  }

  if (!geminiApiKey) {
    return res.status(500).json({ 
      error: 'Gemini API Key missing. Please set GEMINI_API_KEY on Vercel.' 
    });
  }

  try {
    // 1. Fetch raw HTML from Portuguese Wikipedia page for World Cup 2026
    const wikiUrl = 'https://pt.wikipedia.org/wiki/Copa_do_Mundo_FIFA_de_2026';
    const response = await fetch(wikiUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch Wikipedia page: ${response.statusText}`);
    }

    const wikiHtml = await response.text();
    // Crop HTML slightly to stay well within token limits and avoid unrelated Wikipedia menus
    const croppedHtml = wikiHtml.substring(wikiHtml.indexOf('Grupo A'), wikiHtml.lastIndexOf('Mata-mata') + 50000);

    // 2. Initialize Gemini API
    const genAI = new GoogleGenerativeAI(geminiApiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // 3. Define the prompt requesting structured JSON output
    const prompt = `
Você é o Agente Inteligente de sincronização de dados da Narrativa Sem Limites. 
Abaixo está um trecho de HTML extraído da Wikipédia com os resultados e andamento dos jogos da Copa do Mundo FIFA 2026.

Sua tarefa:
1. Analise o HTML e localize os placares dos jogos da fase de grupos e do mata-mata que já foram disputados.
2. Identifique os IDs dos jogos de acordo com o padrão:
   - Grupo A ao L (cada grupo tem 6 jogos): IDs 'A1', 'A2', 'A3', 'A4', 'A5', 'A6' até 'L1', 'L2', 'L3', 'L4', 'L5', 'L6'
   - Os confrontos do mata-mata seguem IDs como 'R32-1' até 'R32-16', 'R16-1' até 'R16-8', 'QF-1' até 'QF-4', 'SF-1', 'SF-2', 'T3-1' (terceiro lugar), 'FI-1' (final).
3. Extraia o placar de gols (scoreHome e scoreAway) e, se aplicável em jogos de mata-mata, os pênaltis (penHome e penAway).
4. Retorne APENAS um objeto JSON limpo e estruturado (sem formatação markdown \`\`\`json, sem explicações textuais adicionais).

Formato de retorno requerido:
{
  "results": [
    { "id": "A1", "scoreHome": 2, "scoreAway": 1 },
    { "id": "A2", "scoreHome": 0, "scoreAway": 0 },
    { "id": "R32-1", "scoreHome": 1, "scoreAway": 1, "penHome": 5, "penAway": 4 }
  ]
}

Aqui está o código HTML:
---
${croppedHtml}
---
`;

    // 4. Send request to Gemini
    const result = await model.generateContent(prompt);
    const aiResponseText = result.response.text().trim();

    // Clean up potential Markdown block wrap if AI ignored prompt instruction
    const cleanJsonString = aiResponseText
      .replace(/^```json\s*/i, '')
      .replace(/```$/, '')
      .trim();

    const extractedData = JSON.parse(cleanJsonString);

    if (!extractedData.results || !Array.isArray(extractedData.results)) {
      throw new Error('AI returned an invalid data format.');
    }

    // 5. Connect to Supabase
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      db: { schema: 'copa_2026' },
      auth: { persistSession: false },
      realtime: { transport: ws }
    });

    // Fetch existing matches to keep references and compute bracket propagation
    const { data: dbMatches, error: fetchError } = await supabase.from('matches').select('*');
    if (fetchError) throw fetchError;

    // Apply the updates extracted by the AI Agent
    let updatedCount = 0;
    const updatedMatches = dbMatches.map(dbMatch => {
      const update = extractedData.results.find(r => r.id === dbMatch.id);
      if (update && update.scoreHome !== undefined && update.scoreAway !== undefined) {
        updatedCount++;
        return {
          ...dbMatch,
          score_home: update.scoreHome,
          score_away: update.scoreAway,
          pen_home: update.penHome !== undefined ? update.penHome : null,
          pen_away: update.penAway !== undefined ? update.penAway : null,
          updated_at: new Date().toISOString()
        };
      }
      return dbMatch;
    });

    if (updatedCount === 0) {
      return res.status(200).json({ message: 'AI Agent executed: No new matches scores found in Wikipedia source.' });
    }

    // 6. Recalculate Knockout Bracket based on the new updates
    const finalKnockoutBrackets = triggerKnockoutPropagation(updatedMatches);

    // 7. Upsert all updates in a single batch to Supabase
    const allUpdates = [
      ...updatedMatches.map(m => ({
        id: m.id,
        home: m.home,
        away: m.away,
        score_home: m.score_home,
        score_away: m.score_away,
        pen_home: m.pen_home,
        pen_away: m.pen_away,
        round: m.round,
        date: m.date,
        local_time: m.local_time,
        estadio: m.estadio,
        cidade: m.cidade,
        fuso: m.fuso,
        pais: m.pais,
        bandeira: m.bandeira
      })),
      ...finalKnockoutBrackets
    ];

    const { error: upsertError } = await supabase.from('matches').upsert(allUpdates, { onConflict: 'id' });
    if (upsertError) throw upsertError;

    return res.status(200).json({ 
      message: `AI Agent Sync success: ${updatedCount} matches updated in database based on Wikipedia. Knockout stages re-propagated.` 
    });

  } catch (err) {
    console.error("Agent Sync Error:", err);
    return res.status(500).json({ error: err.message });
  }
}

// Logic helper to compute brackets inside the serverless agent function to keep DB synchronized
function triggerKnockoutPropagation(matches) {
  const standings = {};
  const TEAM_RATINGS = {
    ARG: 95, FRA: 94, BRA: 93, ENG: 92, ESP: 91, POR: 90, NED: 89, URU: 88, GER: 88, BEL: 87, 
    CRO: 86, ITA: 85, COL: 85, MAR: 85, JPN: 84, SUI: 83, USA: 82, SEN: 82, NOR: 82, MEX: 81, 
    KOR: 81, SWE: 81, AUT: 80, ECU: 80, CIV: 79, CZE: 78, UKR: 78, TUR: 78, AUS: 78, EGY: 78, 
    IRN: 77, CAN: 77, RSA: 74, TUN: 74, BIH: 74, PAR: 75, SCO: 75, GHA: 74, COD: 72, PAN: 71, 
    UZB: 71, QAT: 70, CPV: 70, KSA: 70, IRQ: 70, BOL: 68, JOR: 66, HAI: 65, CUW: 62, NZL: 64, ALG: 76
  };

  const groups = {
    A: ["MEX", "RSA", "KOR", "CZE"], B: ["CAN", "BIH", "QAT", "SUI"], C: ["BRA", "MAR", "HAI", "SCO"],
    D: ["USA", "PAR", "AUS", "TUR"], E: ["GER", "CUW", "CIV", "ECU"], F: ["NED", "JPN", "SWE", "TUN"],
    G: ["BEL", "EGY", "IRN", "NZL"], H: ["ESP", "CPV", "KSA", "URU"], I: ["FRA", "SEN", "NOR", "IRQ"],
    J: ["ARG", "ALG", "AUT", "JOR"], K: ["POR", "COD", "UZB", "COL"], L: ["ENG", "CRO", "PAN", "GHA"]
  };

  Object.keys(groups).forEach(g => {
    standings[g] = groups[g].map(id => ({ id, j: 0, v: 0, e: 0, d: 0, gp: 0, gc: 0, sg: 0, pts: 0 }));
  });

  matches.forEach(m => {
    const isKnockout = m.id.includes('-') || m.id.startsWith('T3') || m.id.startsWith('FI');
    if (!isKnockout && m.score_home !== null && m.score_away !== null) {
      const g = m.id.charAt(0);
      const sh = m.score_home;
      const sa = m.score_away;
      const hTeam = standings[g].find(t => t.id === m.home);
      const aTeam = standings[g].find(t => t.id === m.away);
      if (hTeam && aTeam) {
        hTeam.j++; aTeam.j++;
        hTeam.gp += sh; hTeam.gc += sa;
        aTeam.gp += sa; aTeam.gc += sh;
        if (sh > sa) { hTeam.v++; hTeam.pts += 3; aTeam.d++; }
        else if (sh < sa) { aTeam.v++; aTeam.pts += 3; hTeam.d++; }
        else { hTeam.e++; aTeam.e++; hTeam.pts++; aTeam.pts++; }
      }
    }
  });

  Object.keys(standings).forEach(g => {
    standings[g].forEach(t => { t.sg = t.gp - t.gc; });
    standings[g].sort((a, b) => {
      if (b.pts !== a.pts) return b.pts - a.pts;
      if (b.sg !== a.sg) return b.sg - a.sg;
      if (b.gp !== a.gp) return b.gp - a.gp;
      return (TEAM_RATINGS[b.id] || 0) - (TEAM_RATINGS[a.id] || 0);
    });
  });

  const firsts = []; const seconds = []; const thirds = [];
  Object.keys(standings).forEach(g => {
    firsts.push({ ...standings[g][0], group: g });
    seconds.push({ ...standings[g][1], group: g });
    thirds.push({ ...standings[g][2], group: g });
  });

  const bestEightThirds = [...thirds].sort((a, b) => {
    if (b.pts !== a.pts) return b.pts - a.pts;
    if (b.sg !== a.sg) return b.sg - a.sg;
    if (b.gp !== a.gp) return b.gp - a.gp;
    return (TEAM_RATINGS[b.id] || 0) - (TEAM_RATINGS[a.id] || 0);
  }).slice(0, 8);

  const getTeam = (list, key) => list.find(t => t.group === key)?.id || "";
  const getThirdByRank = (rank) => bestEightThirds[rank - 1]?.id || "";

  const r32Pairings = [
    { home: getTeam(firsts, "A"), away: getThirdByRank(1) },
    { home: getTeam(seconds, "B"), away: getTeam(seconds, "C") },
    { home: getTeam(firsts, "C"), away: getThirdByRank(2) },
    { home: getTeam(seconds, "D"), away: getTeam(seconds, "E") },
    { home: getTeam(firsts, "E"), away: getThirdByRank(3) },
    { home: getTeam(seconds, "F"), away: getTeam(seconds, "G") },
    { home: getTeam(firsts, "G"), away: getThirdByRank(4) },
    { home: getTeam(seconds, "H"), away: getTeam(seconds, "I") },
    { home: getTeam(firsts, "I"), away: getThirdByRank(5) },
    { home: getTeam(seconds, "J"), away: getTeam(seconds, "K") },
    { home: getTeam(firsts, "K"), away: getThirdByRank(6) },
    { home: getTeam(seconds, "L"), away: getTeam(seconds, "A") },
    { home: getTeam(firsts, "B"), away: getThirdByRank(7) },
    { home: getTeam(firsts, "D"), away: getThirdByRank(8) },
    { home: getTeam(firsts, "F"), away: getTeam(firsts, "H") },
    { home: getTeam(firsts, "J"), away: getTeam(firsts, "L") }
  ];

  const knockoutUpdates = [];

  r32Pairings.forEach((p, idx) => {
    const existing = matches.find(m => m.id === `R32-${idx + 1}`);
    knockoutUpdates.push({
      id: existing.id,
      home: p.home,
      away: p.away,
      score_home: existing.score_home,
      score_away: existing.score_away,
      pen_home: existing.pen_home,
      pen_away: existing.pen_away,
      round: existing.round,
      date: existing.date,
      local_time: existing.local_time,
      estadio: existing.estadio,
      cidade: existing.cidade,
      fuso: existing.fuso,
      pais: existing.pais,
      bandeira: existing.bandeira
    });
  });

  const getSimWinner = (matchId, currentUpdates) => {
    const m = currentUpdates.find(x => x.id === matchId) || matches.find(x => x.id === matchId);
    if (!m || m.score_home === null || m.score_away === null) return "";
    if (m.score_home > m.score_away) return m.home;
    if (m.score_away > m.score_home) return m.away;
    return m.pen_home > m.pen_away ? m.home : m.away;
  };

  const getSimLoser = (matchId, currentUpdates) => {
    const m = currentUpdates.find(x => x.id === matchId) || matches.find(x => x.id === matchId);
    const w = getSimWinner(matchId, currentUpdates);
    if (!w) return "";
    return w === m.home ? m.away : m.home;
  };

  // R16
  const r16Mapping = [
    { h: "R32-1", a: "R32-2" }, { h: "R32-3", a: "R32-4" },
    { h: "R32-5", a: "R32-6" }, { h: "R32-7", a: "R32-8" },
    { h: "R32-9", a: "R32-10" }, { h: "R32-11", a: "R32-12" },
    { h: "R32-13", a: "R32-14" }, { h: "R32-15", a: "R32-16" }
  ];
  r16Mapping.forEach((map, idx) => {
    const existing = matches.find(m => m.id === `R16-${idx + 1}`);
    knockoutUpdates.push({
      id: existing.id,
      home: getSimWinner(map.h, knockoutUpdates),
      away: getSimWinner(map.a, knockoutUpdates),
      score_home: existing.score_home,
      score_away: existing.score_away,
      pen_home: existing.pen_home,
      pen_away: existing.pen_away,
      round: existing.round,
      date: existing.date,
      local_time: existing.local_time,
      estadio: existing.estadio,
      cidade: existing.cidade,
      fuso: existing.fuso,
      pais: existing.pais,
      bandeira: existing.bandeira
    });
  });

  // QF
  const qfMapping = [
    { h: "R16-1", a: "R16-2" }, { h: "R16-3", a: "R16-4" },
    { h: "R16-5", a: "R16-6" }, { h: "R16-7", a: "R16-8" }
  ];
  qfMapping.forEach((map, idx) => {
    const existing = matches.find(m => m.id === `QF-${idx + 1}`);
    knockoutUpdates.push({
      id: existing.id,
      home: getSimWinner(map.h, knockoutUpdates),
      away: getSimWinner(map.a, knockoutUpdates),
      score_home: existing.score_home,
      score_away: existing.score_away,
      pen_home: existing.pen_home,
      pen_away: existing.pen_away,
      round: existing.round,
      date: existing.date,
      local_time: existing.local_time,
      estadio: existing.estadio,
      cidade: existing.cidade,
      fuso: existing.fuso,
      pais: existing.pais,
      bandeira: existing.bandeira
    });
  });

  // SF
  const sfMapping = [{ h: "QF-1", a: "QF-2" }, { h: "QF-3", a: "QF-4" }];
  sfMapping.forEach((map, idx) => {
    const existing = matches.find(m => m.id === `SF-${idx + 1}`);
    knockoutUpdates.push({
      id: existing.id,
      home: getSimWinner(map.h, knockoutUpdates),
      away: getSimWinner(map.a, knockoutUpdates),
      score_home: existing.score_home,
      score_away: existing.score_away,
      pen_home: existing.pen_home,
      pen_away: existing.pen_away,
      round: existing.round,
      date: existing.date,
      local_time: existing.local_time,
      estadio: existing.estadio,
      cidade: existing.cidade,
      fuso: existing.fuso,
      pais: existing.pais,
      bandeira: existing.bandeira
    });
  });

  // T3 & FI
  const t3Existing = matches.find(m => m.id === "T3-1");
  knockoutUpdates.push({
    id: t3Existing.id,
    home: getSimLoser("SF-1", knockoutUpdates),
    away: getSimLoser("SF-2", knockoutUpdates),
    score_home: t3Existing.score_home,
    score_away: t3Existing.score_away,
    pen_home: t3Existing.pen_home,
    pen_away: t3Existing.pen_away,
    round: t3Existing.round,
    date: t3Existing.date,
    local_time: t3Existing.local_time,
    estadio: t3Existing.estadio,
    cidade: t3Existing.cidade,
    fuso: t3Existing.fuso,
    pais: t3Existing.pais,
    bandeira: t3Existing.bandeira
  });

  const fiExisting = matches.find(m => m.id === "FI-1");
  knockoutUpdates.push({
    id: fiExisting.id,
    home: getSimWinner("SF-1", knockoutUpdates),
    away: getSimWinner("SF-2", knockoutUpdates),
    score_home: fiExisting.score_home,
    score_away: fiExisting.score_away,
    pen_home: fiExisting.pen_home,
    pen_away: fiExisting.pen_away,
    round: fiExisting.round,
    date: fiExisting.date,
    local_time: fiExisting.local_time,
    estadio: fiExisting.estadio,
    cidade: fiExisting.cidade,
    fuso: fiExisting.fuso,
    pais: fiExisting.pais,
    bandeira: fiExisting.bandeira
  });

  return knockoutUpdates;
}
