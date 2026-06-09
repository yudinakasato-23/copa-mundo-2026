import { createClient } from '@supabase/supabase-js';

// Initialize Supabase with Service Role Key to bypass RLS write restrictions on the backend
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export default async function handler(req, res) {
  // Simple auth check to ensure only Vercel Crons (or you) trigger it
  const authHeader = req.headers.authorization;
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized request' });
  }

  if (!supabaseUrl || !supabaseServiceKey) {
    return res.status(500).json({ 
      error: 'Supabase credentials missing on Vercel. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in Vercel settings.' 
    });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    // 1. Fetch all matches from Supabase
    const { data: dbMatches, error: dbError } = await supabase.from('matches').select('*');
    if (dbError) throw dbError;

    if (!dbMatches || dbMatches.length === 0) {
      return res.status(200).json({ message: 'No matches in database yet. Populate it first by loading the app.' });
    }

    // Check if user set up an external Sports API key
    const sportsApiKey = process.env.SPORTS_API_KEY; // e.g. RapidAPI-key for API-Football

    if (sportsApiKey) {
      // ==========================================
      // LIVE MODE: FETCH REAL SCORES FROM SPORTS API
      // ==========================================
      // Example utilizing API-Football (rapidapi)
      const apiResponse = await fetch('https://api-football-v1.p.rapidapi.com/v3/fixtures?league=1&season=2026', {
        headers: {
          'X-RapidAPI-Key': sportsApiKey,
          'X-RapidAPI-Host': 'api-football-v1.p.rapidapi.com'
        }
      });
      const apiData = await apiResponse.json();
      
      if (!apiData.response || apiData.response.length === 0) {
        return res.status(502).json({ error: 'Failed to retrieve fixtures from Sports API' });
      }

      // Logic to map apiData.response games to your supabase matches and update
      // (This can be fully configured when the official 2026 API fixtures IDs are released)
      
      return res.status(200).json({ message: 'Live Mode: Fetch executed (fixture IDs mapping pending official FIFA API release)' });

    } else {
      // ==========================================
      // DEMO MODE: AUTOMATIC SIMULATION OF PLAYED GAMES
      // ==========================================
      // Find the first group match that hasn't been played yet (score_home is null)
      // We exclude knockout stages ('R32', 'R16', 'QF', 'SF', 'T3', 'FI') in demo to keep it simple
      const nextMatch = dbMatches
        .filter(m => !m.id.includes('-') && m.score_home === null)
        .sort((a, b) => a.id.localeCompare(b.id))[0];

      if (!nextMatch) {
        return res.status(200).json({ message: 'All group stage matches have already been played!' });
      }

      // Generate a realistic score based on team ratings
      // Since we don't have ratings in the API directly, we mock basic probabilities
      const sh = Math.floor(Math.random() * 4);
      const sa = Math.floor(Math.random() * 3);

      const { error: updateError } = await supabase
        .from('matches')
        .update({
          score_home: sh,
          score_away: sa,
          updated_at: new Date().toISOString()
        })
        .eq('id', nextMatch.id);

      if (updateError) throw updateError;

      // Reactively propagate knockout dependencies in database if this was a group stage change
      // Fetch all matches again to get the updated scores
      const { data: updatedDbMatches } = await supabase.from('matches').select('*');
      
      // Calculate new qualifiers and updates
      const simulatedState = triggerKnockoutPropagation(updatedDbMatches);
      
      // Upsert the updated knockout matches back to the database
      const { error: upsertError } = await supabase.from('matches').upsert(simulatedState);
      if (upsertError) throw upsertError;

      return res.status(200).json({ 
        message: `Demo Mode: Match ${nextMatch.id} simulated successfully! Result: ${nextMatch.home} ${sh} x ${sa} ${nextMatch.away}. Knockout bracket updated.` 
      });
    }
  } catch (err) {
    console.error("Cron Error:", err);
    return res.status(500).json({ error: err.message });
  }
}

// Logic helper to compute brackets inside the serverless cron function to keep DB synchronized
function triggerKnockoutPropagation(matches) {
  // We recreate the standings calculations in Node.js
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

  // The 16 pairings for R32
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

  // Update R32 details in database
  r32Pairings.forEach((p, idx) => {
    const existing = matches.find(m => m.id === `R32-${idx + 1}`);
    knockoutUpdates.push({
      ...existing,
      home: p.home,
      away: p.away
    });
  });

  // Since it is a sequential simulation, we propagate to R16, QF, SF, T3, FI if games are played
  // Helper to determine winner in matches data
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
      ...existing,
      home: getSimWinner(map.h, knockoutUpdates),
      away: getSimWinner(map.a, knockoutUpdates)
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
      ...existing,
      home: getSimWinner(map.h, knockoutUpdates),
      away: getSimWinner(map.a, knockoutUpdates)
    });
  });

  // SF
  const sfMapping = [{ h: "QF-1", a: "QF-2" }, { h: "QF-3", a: "QF-4" }];
  sfMapping.forEach((map, idx) => {
    const existing = matches.find(m => m.id === `SF-${idx + 1}`);
    knockoutUpdates.push({
      ...existing,
      home: getSimWinner(map.h, knockoutUpdates),
      away: getSimWinner(map.a, knockoutUpdates)
    });
  });

  // T3 & FI
  const t3Existing = matches.find(m => m.id === "T3-1");
  knockoutUpdates.push({
    ...t3Existing,
    home: getSimLoser("SF-1", knockoutUpdates),
    away: getSimLoser("SF-2", knockoutUpdates)
  });

  const fiExisting = matches.find(m => m.id === "FI-1");
  knockoutUpdates.push({
    ...fiExisting,
    home: getSimWinner("SF-1", knockoutUpdates),
    away: getSimWinner("SF-2", knockoutUpdates)
  });

  return knockoutUpdates;
}
