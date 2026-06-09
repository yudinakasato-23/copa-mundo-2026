import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Trophy, 
  Users, 
  Play, 
  RotateCcw, 
  Search, 
  TrendingUp, 
  Calendar, 
  MapPin, 
  ChevronLeft, 
  ChevronRight,
  Award, 
  BarChart2, 
  Info,
  CheckCircle,
  Clock,
  Sparkles,
  X,
  Plus,
  Minus,
  Database
} from 'lucide-react';

import { SEDES_2026 } from './data/sedes';
import { TEAM_RATINGS, INITIAL_GROUPS_DATA } from './data/teams';
import { generateInitialMatches, getBrasiliaTime } from './data/matches';
import { supabase, isSupabaseConfigured } from './lib/supabase';

export default function App() {
  const [activeTab, setActiveTab] = useState("grupos"); // "grupos" | "matamata" | "estatisticas" | "sedes"
  const [groupMatches, setGroupMatches] = useState(generateInitialMatches);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedGroup, setExpandedGroup] = useState("A");
  const [isSimulating, setIsSimulating] = useState(false);
  const [isDbSyncing, setIsDbSyncing] = useState(false);
  
  // State for active match editing in Bottom Sheet / Modal
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [editingScoreHome, setEditingScoreHome] = useState("");
  const [editingScoreAway, setEditingScoreAway] = useState("");
  const [editingPenHome, setEditingPenHome] = useState("");
  const [editingPenAway, setEditingPenAway] = useState("");
  
  // Touch gestures for swipe detection
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  // Active knockout phase selection for mobile swipe layout
  const [activeKnockoutPhase, setActiveKnockoutPhase] = useState("R32");

  // Knockout stage matches structure
  const [knockoutMatches, setKnockoutMatches] = useState({
    R32: Array.from({ length: 16 }, (_, i) => ({
      id: `R32-${i + 1}`, home: null, away: null, scoreHome: "", scoreAway: "", penHome: "", penAway: ""
    })),
    R16: Array.from({ length: 8 }, (_, i) => ({
      id: `R16-${i + 1}`, home: null, away: null, scoreHome: "", scoreAway: "", penHome: "", penAway: ""
    })),
    QF: Array.from({ length: 4 }, (_, i) => ({
      id: `QF-${i + 1}`, home: null, away: null, scoreHome: "", scoreAway: "", penHome: "", penAway: ""
    })),
    SF: Array.from({ length: 2 }, (_, i) => ({
      id: `SF-${i + 1}`, home: null, away: null, scoreHome: "", scoreAway: "", penHome: "", penAway: ""
    })),
    T3: [{ id: "T3-1", home: null, away: null, scoreHome: "", scoreAway: "", penHome: "", penAway: "" }],
    FI: [{ id: "FI-1", home: null, away: null, scoreHome: "", scoreAway: "", penHome: "", penAway: "" }]
  });

  // Team mapping cache
  const teamMap = useMemo(() => {
    const map = {};
    Object.values(INITIAL_GROUPS_DATA).forEach(group => {
      group.teams.forEach(team => {
        map[team.id] = team;
      });
    });
    return map;
  }, []);

  // Sync state to Supabase in batches (helper function)
  const syncMatchesToSupabase = async (gMatches, kMatches) => {
    if (!isSupabaseConfigured) return;
    setIsDbSyncing(true);

    const updates = [];

    // Map group matches
    Object.keys(gMatches).forEach(groupKey => {
      gMatches[groupKey].forEach(m => {
        updates.push({
          id: m.id,
          home: m.home,
          away: m.away,
          score_home: m.scoreHome === "" ? null : parseInt(m.scoreHome, 10),
          score_away: m.scoreAway === "" ? null : parseInt(m.scoreAway, 10),
          pen_home: null,
          pen_away: null,
          round: m.round,
          date: m.date,
          local_time: m.localTime,
          estadio: m.estadio,
          cidade: m.cidade,
          fuso: m.fuso,
          pais: m.pais,
          bandeira: m.bandeira
        });
      });
    });

    // Map knockout matches
    Object.keys(kMatches).forEach(stage => {
      kMatches[stage].forEach(m => {
        updates.push({
          id: m.id,
          home: m.home || "",
          away: m.away || "",
          score_home: m.scoreHome === "" ? null : parseInt(m.scoreHome, 10),
          score_away: m.scoreAway === "" ? null : parseInt(m.scoreAway, 10),
          pen_home: m.penHome === "" ? null : parseInt(m.penHome, 10),
          pen_away: m.penAway === "" ? null : parseInt(m.penAway, 10),
          round: stage === 'T3' ? 'Decisão de 3º Lugar' : stage === 'FI' ? 'Final' : stage,
          date: m.date || 'A definir',
          local_time: m.localTime || 'A definir',
          estadio: m.estadio || 'A definir',
          cidade: m.cidade || 'A definir',
          fuso: m.fuso || 'UTC-5',
          pais: m.pais || 'A definir',
          bandeira: m.bandeira || '🏳️'
        });
      });
    });

    try {
      const { error } = await supabase.from('matches').upsert(updates, { onConflict: 'id' });
      if (error) throw error;
    } catch (err) {
      console.error("Erro ao sincronizar com o Supabase:", err.message);
    } finally {
      setIsDbSyncing(false);
    }
  };

  // Seed initial matches in the Supabase database
  const seedSupabaseDatabase = async () => {
    setIsDbSyncing(true);
    const initialGroups = generateInitialMatches();
    const matchesToInsert = [];

    // Group matches
    Object.keys(initialGroups).forEach(groupKey => {
      initialGroups[groupKey].forEach(m => {
        matchesToInsert.push({
          id: m.id,
          home: m.home,
          away: m.away,
          score_home: null,
          score_away: null,
          pen_home: null,
          pen_away: null,
          round: m.round,
          date: m.date,
          local_time: m.localTime,
          estadio: m.estadio,
          cidade: m.cidade,
          fuso: m.fuso,
          pais: m.pais,
          bandeira: m.bandeira
        });
      });
    });

    // Knockout phases
    const stages = ['R32', 'R16', 'QF', 'SF', 'T3', 'FI'];
    stages.forEach(stage => {
      const count = stage === 'T3' || stage === 'FI' ? 1 : stage === 'SF' ? 2 : stage === 'QF' ? 4 : stage === 'R16' ? 8 : 16;
      for (let i = 1; i <= count; i++) {
        matchesToInsert.push({
          id: `${stage}-${i}`,
          home: '',
          away: '',
          score_home: null,
          score_away: null,
          pen_home: null,
          pen_away: null,
          round: stage === 'T3' ? 'Decisão de 3º Lugar' : stage === 'FI' ? 'Final' : stage,
          date: 'A definir',
          local_time: 'A definir',
          estadio: 'A definir',
          cidade: 'A definir',
          fuso: 'UTC-5',
          pais: 'A definir',
          bandeira: '🏳️'
        });
      }
    });

    try {
      const { error } = await supabase.from('matches').insert(matchesToInsert);
      if (error) throw error;
      console.log("Banco de dados Supabase inicializado com sucesso!");
    } catch (err) {
      console.error("Erro ao popular dados iniciais do Supabase:", err.message);
    } finally {
      setIsDbSyncing(false);
    }
  };

  // Load matches from Supabase on mount
  useEffect(() => {
    const loadMatches = async () => {
      if (!isSupabaseConfigured) return;
      setIsDbSyncing(true);
      try {
        const { data, error } = await supabase.from('matches').select('*');
        if (error) throw error;

        if (data && data.length > 0) {
          const loadedGroupMatches = generateInitialMatches();
          const loadedKnockout = {
            R32: Array.from({ length: 16 }, (_, i) => ({ id: `R32-${i + 1}`, home: null, away: null, scoreHome: "", scoreAway: "", penHome: "", penAway: "" })),
            R16: Array.from({ length: 8 }, (_, i) => ({ id: `R16-${i + 1}`, home: null, away: null, scoreHome: "", scoreAway: "", penHome: "", penAway: "" })),
            QF: Array.from({ length: 4 }, (_, i) => ({ id: `QF-${i + 1}`, home: null, away: null, scoreHome: "", scoreAway: "", penHome: "", penAway: "" })),
            SF: Array.from({ length: 2 }, (_, i) => ({ id: `SF-${i + 1}`, home: null, away: null, scoreHome: "", scoreAway: "", penHome: "", penAway: "" })),
            T3: [{ id: "T3-1", home: null, away: null, scoreHome: "", scoreAway: "", penHome: "", penAway: "" }],
            FI: [{ id: "FI-1", home: null, away: null, scoreHome: "", scoreAway: "", penHome: "", penAway: "" }]
          };

          data.forEach(m => {
            const isKnockout = m.id.includes('-') || m.id.startsWith('T3') || m.id.startsWith('FI');
            
            if (isKnockout) {
              const stage = m.id.split('-')[0];
              const match = loadedKnockout[stage]?.find(x => x.id === m.id);
              if (match) {
                match.home = m.home || null;
                match.away = m.away || null;
                match.scoreHome = m.score_home !== null ? m.score_home.toString() : "";
                match.scoreAway = m.score_away !== null ? m.score_away.toString() : "";
                match.penHome = m.pen_home !== null ? m.pen_home.toString() : "";
                match.penAway = m.pen_away !== null ? m.pen_away.toString() : "";
              }
            } else {
              const groupKey = m.id.charAt(0);
              const match = loadedGroupMatches[groupKey]?.find(x => x.id === m.id);
              if (match) {
                match.scoreHome = m.score_home !== null ? m.score_home.toString() : "";
                match.scoreAway = m.score_away !== null ? m.score_away.toString() : "";
              }
            }
          });

          setGroupMatches(loadedGroupMatches);
          setKnockoutMatches(loadedKnockout);
        } else {
          // Database is empty, let's seed it
          await seedSupabaseDatabase();
        }
      } catch (err) {
        console.error("Erro ao buscar dados do Supabase:", err.message);
      } finally {
        setIsDbSyncing(false);
      }
    };

    loadMatches();
  }, []);

  // Group standings computation
  const groupStandings = useMemo(() => {
    const standings = {};

    Object.keys(INITIAL_GROUPS_DATA).forEach(groupKey => {
      standings[groupKey] = INITIAL_GROUPS_DATA[groupKey].teams.map(team => ({
        ...team,
        j: 0, v: 0, e: 0, d: 0, gp: 0, gc: 0, sg: 0, pts: 0
      }));
    });

    Object.keys(groupMatches).forEach(groupKey => {
      groupMatches[groupKey].forEach(match => {
        if (match.scoreHome !== "" && match.scoreAway !== "" && match.scoreHome !== null && match.scoreAway !== null) {
          const homeId = match.home;
          const awayId = match.away;
          const sh = parseInt(match.scoreHome, 10);
          const sa = parseInt(match.scoreAway, 10);

          if (isNaN(sh) || isNaN(sa)) return;

          const homeTeam = standings[groupKey].find(t => t.id === homeId);
          const awayTeam = standings[groupKey].find(t => t.id === awayId);

          if (homeTeam && awayTeam) {
            homeTeam.j += 1;
            awayTeam.j += 1;
            homeTeam.gp += sh;
            homeTeam.gc += sa;
            awayTeam.gp += sa;
            awayTeam.gc += sh;

            if (sh > sa) {
              homeTeam.v += 1;
              homeTeam.pts += 3;
              awayTeam.d += 1;
            } else if (sh < sa) {
              awayTeam.v += 1;
              awayTeam.pts += 3;
              homeTeam.d += 1;
            } else {
              homeTeam.e += 1;
              awayTeam.e += 1;
              homeTeam.pts += 1;
              awayTeam.pts += 1;
            }
          }
        }
      });
    });

    Object.keys(standings).forEach(groupKey => {
      standings[groupKey].forEach(team => {
        team.sg = team.gp - team.gc;
      });

      // Tiebreakers: 1. Points, 2. GD, 3. Goals Scored, 4. Rating
      standings[groupKey].sort((a, b) => {
        if (b.pts !== a.pts) return b.pts - a.pts;
        if (b.sg !== a.sg) return b.sg - a.sg;
        if (b.gp !== a.gp) return b.gp - a.gp;
        return (TEAM_RATINGS[b.id] || 0) - (TEAM_RATINGS[a.id] || 0);
      });
    });

    return standings;
  }, [groupMatches]);

  // Qualification data for top 32
  const qualificationData = useMemo(() => {
    const firsts = [];
    const seconds = [];
    const thirds = [];

    Object.keys(groupStandings).forEach(groupKey => {
      const groupArr = groupStandings[groupKey];
      if (groupArr[0]) firsts.push({ ...groupArr[0], group: groupKey });
      if (groupArr[1]) seconds.push({ ...groupArr[1], group: groupKey });
      if (groupArr[2]) thirds.push({ ...groupArr[2], group: groupKey });
    });

    const sortedThirds = [...thirds].sort((a, b) => {
      if (b.pts !== a.pts) return b.pts - a.pts;
      if (b.sg !== a.sg) return b.sg - a.sg;
      if (b.gp !== a.gp) return b.gp - a.gp;
      return (TEAM_RATINGS[b.id] || 0) - (TEAM_RATINGS[a.id] || 0);
    });

    const bestEightThirds = sortedThirds.slice(0, 8);

    return {
      firsts,
      seconds,
      thirds: sortedThirds,
      bestEightThirds
    };
  }, [groupStandings]);

  // Handle R32 bracket generation when group matches update
  useEffect(() => {
    const { firsts, seconds, bestEightThirds } = qualificationData;

    const getTeam = (list, key) => {
      const item = list.find(t => t.group === key);
      return item ? item.id : null;
    };

    const getThirdByRank = (rank) => {
      const team = bestEightThirds[rank - 1];
      return team ? team.id : null;
    };

    // Symmetric 32-team bracket pairing
    const r32Teams = [
      { home: getTeam(firsts, "A"), away: getThirdByRank(1) }, // R32-1
      { home: getTeam(seconds, "B"), away: getTeam(seconds, "C") }, // R32-2
      { home: getTeam(firsts, "C"), away: getThirdByRank(2) }, // R32-3
      { home: getTeam(seconds, "D"), away: getTeam(seconds, "E") }, // R32-4
      { home: getTeam(firsts, "E"), away: getThirdByRank(3) }, // R32-5
      { home: getTeam(seconds, "F"), away: getTeam(seconds, "G") }, // R32-6
      { home: getTeam(firsts, "G"), away: getThirdByRank(4) }, // R32-7
      { home: getTeam(seconds, "H"), away: getTeam(seconds, "I") }, // R32-8
      { home: getTeam(firsts, "I"), away: getThirdByRank(5) }, // R32-9
      { home: getTeam(seconds, "J"), away: getTeam(seconds, "K") }, // R32-10
      { home: getTeam(firsts, "K"), away: getThirdByRank(6) }, // R32-11
      { home: getTeam(seconds, "L"), away: getTeam(seconds, "A") }, // R32-12
      { home: getTeam(firsts, "B"), away: getThirdByRank(7) }, // R32-13
      { home: getTeam(firsts, "D"), away: getThirdByRank(8) }, // R32-14
      { home: getTeam(firsts, "F"), away: getTeam(firsts, "H") }, // R32-15
      { home: getTeam(firsts, "J"), away: getTeam(firsts, "L") }  // R32-16
    ];

    setKnockoutMatches(prev => {
      const newR32 = prev.R32.map((match, idx) => ({
        ...match,
        home: r32Teams[idx].home,
        away: r32Teams[idx].away
      }));
      return { ...prev, R32: newR32 };
    });
  }, [qualificationData]);

  // Helper to determine winner/loser
  const getMatchWinner = (match) => {
    if (!match || match.scoreHome === "" || match.scoreAway === "" || match.scoreHome === null || match.scoreAway === null) return null;
    const sh = parseInt(match.scoreHome, 10);
    const sa = parseInt(match.scoreAway, 10);
    if (sh > sa) return match.home;
    if (sa > sh) return match.away;

    if (match.penHome !== "" && match.penAway !== "" && match.penHome !== null && match.penAway !== null) {
      const ph = parseInt(match.penHome, 10);
      const pa = parseInt(match.penAway, 10);
      if (ph > pa) return match.home;
      if (pa > ph) return match.away;
    }
    return null;
  };

  const getMatchLoser = (match) => {
    const winner = getMatchWinner(match);
    if (!winner) return null;
    return winner === match.home ? match.away : match.home;
  };

  // Reactively propagate through Knockout Bracket
  useEffect(() => {
    setKnockoutMatches(prev => {
      // 1. R16 from R32 winners
      const r16Mapping = [
        { hIdx: 0, aIdx: 1 }, { hIdx: 2, aIdx: 3 },
        { hIdx: 4, aIdx: 5 }, { hIdx: 6, aIdx: 7 },
        { hIdx: 8, aIdx: 9 }, { hIdx: 10, aIdx: 11 },
        { hIdx: 12, aIdx: 13 }, { hIdx: 14, aIdx: 15 }
      ];
      const newR16 = prev.R16.map((match, idx) => {
        const map = r16Mapping[idx];
        return {
          ...match,
          home: getMatchWinner(prev.R32[map.hIdx]),
          away: getMatchWinner(prev.R32[map.aIdx])
        };
      });

      // 2. QF from R16 winners
      const qfMapping = [
        { hIdx: 0, aIdx: 1 }, { hIdx: 2, aIdx: 3 },
        { hIdx: 4, aIdx: 5 }, { hIdx: 6, aIdx: 7 }
      ];
      const newQF = prev.QF.map((match, idx) => {
        const map = qfMapping[idx];
        return {
          ...match,
          home: getMatchWinner(newR16[map.hIdx]),
          away: getMatchWinner(newR16[map.aIdx])
        };
      });

      // 3. SF from QF winners
      const sfMapping = [
        { hIdx: 0, aIdx: 1 }, { hIdx: 2, aIdx: 3 }
      ];
      const newSF = prev.SF.map((match, idx) => {
        const map = sfMapping[idx];
        return {
          ...match,
          home: getMatchWinner(newQF[map.hIdx]),
          away: getMatchWinner(newQF[map.aIdx])
        };
      });

      // 4. 3rd Place (T3) and Final (FI)
      const newT3 = [{
        ...prev.T3[0],
        home: getMatchLoser(newSF[0]),
        away: getMatchLoser(newSF[1])
      }];

      const newFI = [{
        ...prev.FI[0],
        home: getMatchWinner(newSF[0]),
        away: getMatchWinner(newSF[1])
      }];

      return {
        ...prev,
        R16: newR16,
        QF: newQF,
        SF: newSF,
        T3: newT3,
        FI: newFI
      };
    });
  }, [groupMatches, knockoutMatches.R32, knockoutMatches.R16, knockoutMatches.QF, knockoutMatches.SF]);

  // Score simulator using team ratings (poisson-like simple model)
  const simulateMatchScore = (homeId, awayId) => {
    const rateHome = TEAM_RATINGS[homeId] || 75;
    const rateAway = TEAM_RATINGS[awayId] || 75;

    const diff = rateHome - rateAway;
    const baseHome = 1.35 + (diff / 50);
    const baseAway = 1.35 - (diff / 50);

    const generateGoals = (lambda) => {
      let L = Math.exp(-lambda);
      let k = 0;
      let p = 1.0;
      do {
        k++;
        p *= Math.random();
      } while (p > L);
      return Math.max(0, k - 1);
    };

    let sh = generateGoals(Math.max(0.4, baseHome));
    let sa = generateGoals(Math.max(0.4, baseAway));

    // Force excitement
    if (Math.random() < 0.15) sh += 1;
    if (Math.random() < 0.15) sa += 1;
    
    return { sh, sa };
  };

  // Simulate group stage
  const simulateGroupStage = () => {
    const simulated = {};
    Object.keys(groupMatches).forEach(groupKey => {
      simulated[groupKey] = groupMatches[groupKey].map(match => {
        const { sh, sa } = simulateMatchScore(match.home, match.away);
        return {
          ...match,
          scoreHome: sh.toString(),
          scoreAway: sa.toString()
        };
      });
    });
    return simulated;
  };

  // Simulate full knockout bracket sequentially and returns state
  const simulateFullKnockoutState = (currentGroupMatches) => {
    const standings = {};
    Object.keys(INITIAL_GROUPS_DATA).forEach(groupKey => {
      standings[groupKey] = INITIAL_GROUPS_DATA[groupKey].teams.map(team => ({
        ...team,
        j: 0, v: 0, e: 0, d: 0, gp: 0, gc: 0, sg: 0, pts: 0
      }));
    });
    Object.keys(currentGroupMatches).forEach(groupKey => {
      currentGroupMatches[groupKey].forEach(match => {
        if (match.scoreHome !== "" && match.scoreAway !== "") {
          const sh = parseInt(match.scoreHome, 10);
          const sa = parseInt(match.scoreAway, 10);
          const homeTeam = standings[groupKey].find(t => t.id === match.home);
          const awayTeam = standings[groupKey].find(t => t.id === match.away);
          if (homeTeam && awayTeam) {
            homeTeam.j += 1; awayTeam.j += 1;
            homeTeam.gp += sh; homeTeam.gc += sa;
            awayTeam.gp += sa; awayTeam.gc += sh;
            if (sh > sa) { homeTeam.v += 1; homeTeam.pts += 3; awayTeam.d += 1; }
            else if (sh < sa) { awayTeam.v += 1; awayTeam.pts += 3; homeTeam.d += 1; }
            else { homeTeam.e += 1; awayTeam.e += 1; homeTeam.pts += 1; awayTeam.pts += 1; }
          }
        }
      });
    });
    Object.keys(standings).forEach(groupKey => {
      standings[groupKey].forEach(t => { t.sg = t.gp - t.gc; });
      standings[groupKey].sort((a, b) => {
        if (b.pts !== a.pts) return b.pts - a.pts;
        if (b.sg !== a.sg) return b.sg - a.sg;
        if (b.gp !== a.gp) return b.gp - a.gp;
        return (TEAM_RATINGS[b.id] || 0) - (TEAM_RATINGS[a.id] || 0);
      });
    });

    const firsts = []; const seconds = []; const thirds = [];
    Object.keys(standings).forEach(gKey => {
      firsts.push({ ...standings[gKey][0], group: gKey });
      seconds.push({ ...standings[gKey][1], group: gKey });
      thirds.push({ ...standings[gKey][2], group: gKey });
    });
    const bestEightThirds = [...thirds].sort((a, b) => {
      if (b.pts !== a.pts) return b.pts - a.pts;
      if (b.sg !== a.sg) return b.sg - a.sg;
      if (b.gp !== a.gp) return b.gp - a.gp;
      return (TEAM_RATINGS[b.id] || 0) - (TEAM_RATINGS[a.id] || 0);
    }).slice(0, 8);

    const getTeam = (list, key) => list.find(t => t.group === key)?.id || null;
    const getThirdByRank = (rank) => bestEightThirds[rank - 1]?.id || null;

    const r32Teams = [
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

    // Sim R32
    const simR32 = r32Teams.map((m, idx) => {
      if (!m.home || !m.away) return { id: `R32-${idx + 1}`, home: null, away: null, scoreHome: "", scoreAway: "", penHome: "", penAway: "" };
      const { sh, sa } = simulateMatchScore(m.home, m.away);
      let ph = ""; let pa = "";
      if (sh === sa) {
        ph = Math.random() > 0.5 ? "5" : "4";
        pa = ph === "5" ? "4" : "5";
      }
      return { id: `R32-${idx + 1}`, home: m.home, away: m.away, scoreHome: sh.toString(), scoreAway: sa.toString(), penHome: ph, penAway: pa };
    });

    const getWinnerSim = (match) => {
      const sh = parseInt(match.scoreHome, 10);
      const sa = parseInt(match.scoreAway, 10);
      if (sh > sa) return match.home;
      if (sa > sh) return match.away;
      return parseInt(match.penHome, 10) > parseInt(match.penAway, 10) ? match.home : match.away;
    };

    const getLoserSim = (match) => {
      const w = getWinnerSim(match);
      return w === match.home ? match.away : match.home;
    };

    // Sim R16
    const r16Mapping = [
      { hIdx: 0, aIdx: 1 }, { hIdx: 2, aIdx: 3 }, { hIdx: 4, aIdx: 5 }, { hIdx: 6, aIdx: 7 },
      { hIdx: 8, aIdx: 9 }, { hIdx: 10, aIdx: 11 }, { hIdx: 12, aIdx: 13 }, { hIdx: 14, aIdx: 15 }
    ];
    const simR16 = r16Mapping.map((map, idx) => {
      const h = getWinnerSim(simR32[map.hIdx]);
      const a = getWinnerSim(simR32[map.aIdx]);
      if (!h || !a) return { id: `R16-${idx + 1}`, home: null, away: null, scoreHome: "", scoreAway: "", penHome: "", penAway: "" };
      const { sh, sa } = simulateMatchScore(h, a);
      let ph = ""; let pa = "";
      if (sh === sa) { ph = Math.random() > 0.5 ? "5" : "4"; pa = ph === "5" ? "4" : "5"; }
      return { id: `R16-${idx + 1}`, home: h, away: a, scoreHome: sh.toString(), scoreAway: sa.toString(), penHome: ph, penAway: pa };
    });

    // Sim QF
    const qfMapping = [
      { hIdx: 0, aIdx: 1 }, { hIdx: 2, aIdx: 3 }, { hIdx: 4, aIdx: 5 }, { hIdx: 6, aIdx: 7 }
    ];
    const simQF = qfMapping.map((map, idx) => {
      const h = getWinnerSim(simR16[map.hIdx]);
      const a = getWinnerSim(simR16[map.aIdx]);
      if (!h || !a) return { id: `QF-${idx + 1}`, home: null, away: null, scoreHome: "", scoreAway: "", penHome: "", penAway: "" };
      const { sh, sa } = simulateMatchScore(h, a);
      let ph = ""; let pa = "";
      if (sh === sa) { ph = Math.random() > 0.5 ? "5" : "4"; pa = ph === "5" ? "4" : "5"; }
      return { id: `QF-${idx + 1}`, home: h, away: a, scoreHome: sh.toString(), scoreAway: sa.toString(), penHome: ph, penAway: pa };
    });

    // Sim SF
    const sfMapping = [{ hIdx: 0, aIdx: 1 }, { hIdx: 2, aIdx: 3 }];
    const simSF = sfMapping.map((map, idx) => {
      const h = getWinnerSim(simQF[map.hIdx]);
      const a = getWinnerSim(simQF[map.aIdx]);
      if (!h || !a) return { id: `SF-${idx + 1}`, home: null, away: null, scoreHome: "", scoreAway: "", penHome: "", penAway: "" };
      const { sh, sa } = simulateMatchScore(h, a);
      let ph = ""; let pa = "";
      if (sh === sa) { ph = Math.random() > 0.5 ? "5" : "4"; pa = ph === "5" ? "4" : "5"; }
      return { id: `SF-${idx + 1}`, home: h, away: a, scoreHome: sh.toString(), scoreAway: sa.toString(), penHome: ph, penAway: pa };
    });

    // Sim T3
    const hT3 = getLoserSim(simSF[0]);
    const aT3 = getLoserSim(simSF[1]);
    let simT3 = { id: "T3-1", home: hT3, away: aT3, scoreHome: "", scoreAway: "", penHome: "", penAway: "" };
    if (hT3 && aT3) {
      const { sh, sa } = simulateMatchScore(hT3, aT3);
      let ph = ""; let pa = "";
      if (sh === sa) { ph = Math.random() > 0.5 ? "5" : "4"; pa = ph === "5" ? "4" : "5"; }
      simT3 = { ...simT3, scoreHome: sh.toString(), scoreAway: sa.toString(), penHome: ph, penAway: pa };
    }

    // Sim FI
    const hFI = getWinnerSim(simSF[0]);
    const aFI = getWinnerSim(simSF[1]);
    let simFI = { id: "FI-1", home: hFI, away: aFI, scoreHome: "", scoreAway: "", penHome: "", penAway: "" };
    if (hFI && aFI) {
      const { sh, sa } = simulateMatchScore(hFI, aFI);
      let ph = ""; let pa = "";
      if (sh === sa) { ph = Math.random() > 0.5 ? "5" : "4"; pa = ph === "5" ? "4" : "5"; }
      simFI = { ...simFI, scoreHome: sh.toString(), scoreAway: sa.toString(), penHome: ph, penAway: pa };
    }

    return {
      R32: simR32,
      R16: simR16,
      QF: simQF,
      SF: simSF,
      T3: [simT3],
      FI: [simFI]
    };
  };

  // Simulates the entire tournament (groups + bracket) with database synchronization
  const simulateEntireTournament = async () => {
    setIsSimulating(true);
    const simulatedGroups = simulateGroupStage();
    const simulatedKnockout = simulateFullKnockoutState(simulatedGroups);
    
    setGroupMatches(simulatedGroups);
    setKnockoutMatches(simulatedKnockout);

    if (isSupabaseConfigured) {
      await syncMatchesToSupabase(simulatedGroups, simulatedKnockout);
    }
    
    setIsSimulating(false);
  };

  // Resets everything in memory and on Supabase
  const resetAll = async () => {
    const emptyGroups = generateInitialMatches();
    const emptyKnockout = {
      R32: Array.from({ length: 16 }, (_, i) => ({ id: `R32-${i + 1}`, home: null, away: null, scoreHome: "", scoreAway: "", penHome: "", penAway: "" })),
      R16: Array.from({ length: 8 }, (_, i) => ({ id: `R16-${i + 1}`, home: null, away: null, scoreHome: "", scoreAway: "", penHome: "", penAway: "" })),
      QF: Array.from({ length: 4 }, (_, i) => ({ id: `QF-${i + 1}`, home: null, away: null, scoreHome: "", scoreAway: "", penHome: "", penAway: "" })),
      SF: Array.from({ length: 2 }, (_, i) => ({ id: `SF-${i + 1}`, home: null, away: null, scoreHome: "", scoreAway: "", penHome: "", penAway: "" })),
      T3: [{ id: "T3-1", home: null, away: null, scoreHome: "", scoreAway: "", penHome: "", penAway: "" }],
      FI: [{ id: "FI-1", home: null, away: null, scoreHome: "", scoreAway: "", penHome: "", penAway: "" }]
    };

    setGroupMatches(emptyGroups);
    setKnockoutMatches(emptyKnockout);

    if (isSupabaseConfigured) {
      await syncMatchesToSupabase(emptyGroups, emptyKnockout);
    }
  };

  // Opens Bottom Sheet for match editing
  const openEditMatch = (match, type = "group", groupKey = "") => {
    setSelectedMatch({ ...match, type, groupKey });
    setEditingScoreHome(match.scoreHome || "");
    setEditingScoreAway(match.scoreAway || "");
    setEditingPenHome(match.penHome || "");
    setEditingPenAway(match.penAway || "");
  };

  // Confirms match editing inside Bottom Sheet and saves to database
  const saveMatchScore = async () => {
    if (!selectedMatch) return;

    const sh = editingScoreHome.trim();
    const sa = editingScoreAway.trim();
    
    const isTie = sh !== "" && sa !== "" && parseInt(sh, 10) === parseInt(sa, 10);
    const ph = isTie ? editingPenHome.trim() : "";
    const pa = isTie ? editingPenAway.trim() : "";

    let updatedGroups = { ...groupMatches };
    let updatedKnockout = { ...knockoutMatches };

    if (selectedMatch.type === "group") {
      updatedGroups = {
        ...groupMatches,
        [selectedMatch.groupKey]: groupMatches[selectedMatch.groupKey].map(m => {
          if (m.id === selectedMatch.id) {
            return { ...m, scoreHome: sh, scoreAway: sa };
          }
          return m;
        })
      };
      setGroupMatches(updatedGroups);
    } else {
      const stage = selectedMatch.type; 
      updatedKnockout = {
        ...knockoutMatches,
        [stage]: knockoutMatches[stage].map(m => {
          if (m.id === selectedMatch.id) {
            return { 
              ...m, 
              scoreHome: sh, 
              scoreAway: sa,
              penHome: ph,
              penAway: pa
            };
          }
          return m;
        })
      };
      setKnockoutMatches(updatedKnockout);
    }

    setSelectedMatch(null);

    // Save to Supabase
    if (isSupabaseConfigured) {
      setIsDbSyncing(true);
      try {
        const scoreHomeVal = sh === "" ? null : parseInt(sh, 10);
        const scoreAwayVal = sa === "" ? null : parseInt(sa, 10);
        const penHomeVal = ph === "" ? null : parseInt(ph, 10);
        const penAwayVal = pa === "" ? null : parseInt(pa, 10);

        // Update match score
        const { error } = await supabase
          .from('matches')
          .update({
            score_home: scoreHomeVal,
            score_away: scoreAwayVal,
            pen_home: penHomeVal,
            pen_away: penAwayVal,
            home: selectedMatch.home || "",
            away: selectedMatch.away || ""
          })
          .eq('id', selectedMatch.id);

        if (error) throw error;

        // If a group stage match changed, update all bracket dependencies dynamically in Supabase as well
        if (selectedMatch.type === "group") {
          // Re-simulate knockout propagation from local state updates and sync
          const localKnockoutSync = simulateFullKnockoutState(updatedGroups);
          await syncMatchesToSupabase(updatedGroups, localKnockoutSync);
        } else {
          // Update subsequent knockout phases
          const localKnockoutSync = simulateFullKnockoutState(updatedGroups);
          await syncMatchesToSupabase(updatedGroups, localKnockoutSync);
        }
      } catch (err) {
        console.error("Erro ao salvar no Supabase:", err.message);
      } finally {
        setIsDbSyncing(false);
      }
    }
  };

  // Quick simulate single match
  const simulateSingleMatchInSheet = () => {
    if (!selectedMatch) return;
    const { sh, sa } = simulateMatchScore(selectedMatch.home, selectedMatch.away);
    setEditingScoreHome(sh.toString());
    setEditingScoreAway(sa.toString());
    
    if (sh === sa && selectedMatch.type !== "group") {
      const ph = Math.random() > 0.5 ? "5" : "4";
      const pa = ph === "5" ? "4" : "5";
      setEditingPenHome(ph);
      setEditingPenAway(pa);
    } else {
      setEditingPenHome("");
      setEditingPenAway("");
    }
  };

  // Swipe gesture detection to change group
  const handleTouchStart = (e) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    const groups = Object.keys(INITIAL_GROUPS_DATA);
    const currentIndex = groups.indexOf(expandedGroup);

    if (diff > 60) {
      if (currentIndex < groups.length - 1) {
        setExpandedGroup(groups[currentIndex + 1]);
      }
    } else if (diff < -60) {
      if (currentIndex > 0) {
        setExpandedGroup(groups[currentIndex - 1]);
      }
    }
  };

  // Stats calculation
  const stats = useMemo(() => {
    let totalGoals = 0;
    let matchesWithScore = 0;
    let biggestBlowout = { diff: -1, text: "Nenhum jogo registrado" };
    const goalsByTeam = {};

    Object.keys(groupMatches).forEach(groupKey => {
      groupMatches[groupKey].forEach(match => {
        if (match.scoreHome !== "" && match.scoreAway !== "" && match.scoreHome !== null && match.scoreAway !== null) {
          const sh = parseInt(match.scoreHome, 10);
          const sa = parseInt(match.scoreAway, 10);
          if (!isNaN(sh) && !isNaN(sa)) {
            totalGoals += sh + sa;
            matchesWithScore += 1;

            const diff = Math.abs(sh - sa);
            if (diff > biggestBlowout.diff) {
              const homeTeam = teamMap[match.home]?.name || match.home;
              const awayTeam = teamMap[match.away]?.name || match.away;
              biggestBlowout = {
                diff,
                text: `${teamMap[match.home]?.flag || ""} ${homeTeam} ${sh} x ${sa} ${teamMap[match.away]?.flag || ""} ${awayTeam}`
              };
            }

            goalsByTeam[match.home] = (goalsByTeam[match.home] || 0) + sh;
            goalsByTeam[match.away] = (goalsByTeam[match.away] || 0) + sa;
          }
        }
      });
    });

    Object.keys(knockoutMatches).forEach(stage => {
      knockoutMatches[stage].forEach(match => {
        if (match.scoreHome !== "" && match.scoreAway !== "" && match.scoreHome !== null && match.scoreAway !== null) {
          const sh = parseInt(match.scoreHome, 10);
          const sa = parseInt(match.scoreAway, 10);
          if (!isNaN(sh) && !isNaN(sa)) {
            totalGoals += sh + sa;
            matchesWithScore += 1;

            const diff = Math.abs(sh - sa);
            if (diff > biggestBlowout.diff) {
              const homeTeam = teamMap[match.home]?.name || match.home;
              const awayTeam = teamMap[match.away]?.name || match.away;
              biggestBlowout = {
                diff,
                text: `${teamMap[match.home]?.flag || ""} ${homeTeam} ${sh} x ${sa} ${teamMap[match.away]?.flag || ""} ${awayTeam}`
              };
            }

            if (match.home) goalsByTeam[match.home] = (goalsByTeam[match.home] || 0) + sh;
            if (match.away) goalsByTeam[match.away] = (goalsByTeam[match.away] || 0) + sa;
          }
        }
      });
    });

    let topScoringTeam = { name: "-", goals: 0 };
    Object.keys(goalsByTeam).forEach(teamId => {
      if (goalsByTeam[teamId] > topScoringTeam.goals) {
        topScoringTeam = {
          name: teamMap[teamId]?.name || teamId,
          flag: teamMap[teamId]?.flag || "",
          goals: goalsByTeam[teamId]
        };
      }
    });

    const averageGoals = matchesWithScore > 0 ? (totalGoals / matchesWithScore).toFixed(2) : "0.00";
    const finalMatch = knockoutMatches.FI[0];
    const championId = getMatchWinner(finalMatch);
    const champion = championId ? teamMap[championId] : null;

    return {
      totalGoals,
      matchesWithScore,
      averageGoals,
      biggestBlowout: biggestBlowout.text,
      topScoringTeam,
      champion,
      progressPercent: Math.min(100, Math.round((matchesWithScore / 104) * 100))
    };
  }, [groupMatches, knockoutMatches, teamMap]);

  return (
    <div className="min-h-screen pb-24 lg:pb-8 flex flex-col transition-native">
      {/* Premium Dark Header banner */}
      <header className="relative overflow-hidden bg-radial from-emerald-950/45 to-slate-950 border-b border-emerald-500/15 py-6 px-4 md:px-8 shadow-2xl">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-500/10 via-transparent to-transparent pointer-events-none"></div>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="p-3.5 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl shadow-xl shadow-amber-500/10 border border-amber-300/20">
              <Trophy className="w-8 h-8 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl md:text-3xl font-black tracking-tight bg-gradient-to-r from-yellow-400 via-amber-200 to-emerald-400 bg-clip-text text-transparent">
                  COPA DO MUNDO 2026
                </h1>
                
                {isSupabaseConfigured && (
                  <span className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 uppercase tracking-wider">
                    <Database className={`w-3 h-3 ${isDbSyncing ? 'animate-spin' : ''}`} /> Supabase Conectado
                  </span>
                )}
              </div>
              <p className="text-xs md:text-sm text-slate-400 mt-0.5 font-medium flex items-center gap-1.5">
                <span>Canadá • México • Estados Unidos</span>
                <span className="w-1 h-1 rounded-full bg-slate-700"></span>
                <span>12 Grupos • 48 Seleções</span>
              </p>
            </div>
          </div>

          {/* Progress & Fast Sim Controls */}
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
            <div className="bg-slate-900/60 backdrop-blur-md p-3 rounded-xl border border-slate-800/80 w-full sm:w-60">
              <div className="flex justify-between text-xs font-semibold mb-1.5">
                <span className="text-slate-400">Progresso do Torneio</span>
                <span className="text-emerald-400 font-mono font-bold">
                  {stats.matchesWithScore} / 104 jogos ({stats.progressPercent}%)
                </span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-emerald-500 to-teal-400 h-2 rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" 
                  style={{ width: `${stats.progressPercent}%` }}
                ></div>
              </div>
            </div>
            
            <div className="flex gap-2 w-full sm:w-auto">
              <button 
                onClick={simulateEntireTournament}
                disabled={isSimulating || isDbSyncing}
                className="flex-1 sm:flex-initial bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 disabled:opacity-50 text-slate-950 font-bold px-4 py-2.5 rounded-xl transition duration-300 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10 cursor-pointer text-sm"
              >
                {isSimulating ? (
                  <>
                    <Clock className="w-4 h-4 animate-spin" /> Simulando...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-slate-950 fill-slate-950" /> Simular Tudo
                  </>
                )}
              </button>
              <button 
                onClick={resetAll}
                disabled={isDbSyncing}
                className="bg-slate-900/80 hover:bg-slate-850 disabled:opacity-50 text-rose-400 hover:text-rose-300 border border-slate-800 hover:border-slate-750 font-bold p-3 rounded-xl transition duration-300 flex items-center justify-center cursor-pointer"
                title="Reiniciar campeonato"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Metrics Row */}
      <section className="bg-slate-950/20 border-b border-slate-900/50 py-3.5 px-4 md:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-900/30 border border-slate-900 p-3 rounded-xl flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider">Total Gols</p>
              <p className="text-base font-bold text-slate-100 font-mono">{stats.totalGoals}</p>
            </div>
          </div>
          <div className="bg-slate-900/30 border border-slate-900 p-3 rounded-xl flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 rounded-lg text-amber-400">
              <BarChart2 className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider">Média Gols</p>
              <p className="text-base font-bold text-slate-100 font-mono">{stats.averageGoals}</p>
            </div>
          </div>
          <div className="bg-slate-900/30 border border-slate-900 p-3 rounded-xl flex items-center gap-3">
            <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
              <Award className="w-4 h-4" />
            </div>
            <div className="truncate">
              <p className="text-[10px] text-slate-400 uppercase tracking-wider">Melhor Ataque</p>
              <p className="text-xs font-bold text-slate-100 truncate max-w-[140px] mt-0.5">
                {stats.topScoringTeam.goals > 0 ? (
                  <span className="flex items-center gap-1">
                    <span>{stats.topScoringTeam.flag}</span>
                    <span>{stats.topScoringTeam.name}</span>
                    <span className="text-[10px] text-emerald-400 font-mono">({stats.topScoringTeam.goals})</span>
                  </span>
                ) : '-'}
              </p>
            </div>
          </div>
          <div className="bg-slate-900/30 border border-slate-900 p-3 rounded-xl flex items-center gap-3">
            <div className="p-2 bg-yellow-500/10 rounded-lg text-yellow-400">
              <Trophy className="w-4 h-4" />
            </div>
            <div className="truncate">
              <p className="text-[10px] text-slate-400 uppercase tracking-wider">Campeão 2026</p>
              <p className="text-xs font-black text-emerald-400 truncate max-w-[140px] mt-0.5">
                {stats.champion ? (
                  <span className="flex items-center gap-1">
                    <span>{stats.champion.flag}</span>
                    <span className="tracking-tight uppercase">{stats.champion.name}</span>
                  </span>
                ) : 'Aguardando Final'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Desktop Navigation Tabs (Top) */}
      <nav className="bg-slate-950/40 border-b border-slate-900 sticky top-0 z-40 shadow-md backdrop-blur-xl hidden lg:block">
        <div className="max-w-7xl mx-auto px-6 flex space-x-2 py-3.5">
          {[
            { id: "grupos", label: "Fase de Grupos", icon: Users },
            { id: "matamata", label: "Chaveamento Mata-Mata", icon: Trophy },
            { id: "estatisticas", label: "Estatísticas & Regras", icon: BarChart2 },
            { id: "sedes", label: "Sedes & Estádios", icon: MapPin }
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 flex items-center gap-2 cursor-pointer ${
                activeTab === tab.id 
                  ? "bg-gradient-to-r from-emerald-500 to-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/15" 
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/50"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-6 flex-1 w-full">
        
        {/* TAB 1: GROUP STAGE */}
        {activeTab === "grupos" && (
          <div className="space-y-6">
            
            {/* Description Card */}
            <div className="bg-slate-900/40 p-4.5 rounded-2xl border border-slate-900 flex flex-col md:flex-row justify-between items-center gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                  <Info className="w-5 h-5 text-emerald-400" /> Classificação & Jogos
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Selecione um grupo. Toque em qualquer jogo para ver detalhes e editar. 
                  No celular, você pode **deslizar para o lado (swipe)** nos jogos para mudar de grupo.
                </p>
              </div>
              
              <div className="relative w-full md:w-64">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                <input 
                  type="text" 
                  placeholder="Buscar país..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500/50"
                />
              </div>
            </div>

            {/* Quick Groups Pills Scroller (Mobile UI / Scroll horizontal) */}
            <div className="flex overflow-x-auto no-scrollbar gap-2 pb-1 lg:hidden">
              {Object.keys(INITIAL_GROUPS_DATA).map(groupKey => {
                const isSelected = expandedGroup === groupKey;
                return (
                  <button
                    key={groupKey}
                    onClick={() => setExpandedGroup(groupKey)}
                    className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all duration-200 cursor-pointer ${
                      isSelected 
                        ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20" 
                        : "bg-slate-900/70 text-slate-400 border border-slate-900"
                    }`}
                  >
                    Grupo {groupKey}
                  </button>
                );
              })}
            </div>

            {/* Main Double Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Column: List of Groups (A-L) with summary */}
              <div className="lg:col-span-5 space-y-3 max-h-[75vh] overflow-y-auto pr-1 custom-scrollbar hidden lg:block">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 pl-1">Selecione um Grupo</p>
                {Object.keys(INITIAL_GROUPS_DATA).map(groupKey => {
                  const group = INITIAL_GROUPS_DATA[groupKey];
                  const isExpanded = expandedGroup === groupKey;
                  const standings = groupStandings[groupKey];
                  
                  if (searchTerm) {
                    const matchesSearch = group.teams.some(team => 
                      team.name.toLowerCase().includes(searchTerm.toLowerCase())
                    );
                    if (!matchesSearch) return null;
                  }

                  return (
                    <div 
                      key={groupKey}
                      onClick={() => setExpandedGroup(groupKey)}
                      className={`p-3.5 rounded-xl border transition-all duration-300 cursor-pointer ${
                        isExpanded 
                          ? "bg-slate-900 border-emerald-500/30 shadow-lg shadow-emerald-500/5" 
                          : "bg-slate-900/30 border-slate-900 hover:border-slate-800 hover:bg-slate-900/50"
                      }`}
                    >
                      <div className="flex justify-between items-center mb-2.5">
                        <span className="font-extrabold text-slate-200 text-sm tracking-wide">Grupo {groupKey}</span>
                        <span className="text-[9px] text-slate-400 bg-slate-950 px-2 py-0.5 rounded-full border border-slate-900">
                          {isExpanded ? "Visualizando" : "Selecionar"}
                        </span>
                      </div>
                      
                      {/* Mini standings list */}
                      <div className="space-y-1 text-[11px]">
                        {standings.map((team, idx) => (
                          <div 
                            key={team.id} 
                            className={`flex items-center justify-between p-1 rounded ${
                              idx < 2 ? "bg-emerald-500/5 text-slate-200" : "text-slate-400"
                            }`}
                          >
                            <span className="flex items-center gap-1.5 truncate max-w-[160px]">
                              <span className="font-mono text-[9px] text-slate-500 w-3">{idx + 1}º</span>
                              <span className="text-sm">{team.flag}</span>
                              <span className="font-medium truncate">{team.name}</span>
                            </span>
                            <div className="flex items-center gap-2 font-bold text-[10px]">
                              <span className="text-slate-500 font-normal">S:{team.sg >= 0 ? `+${team.sg}` : team.sg}</span>
                              <span className={idx < 2 ? "text-emerald-400" : "text-slate-300"}>{team.pts} pts</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Right Column: Detailed Group View (Standings Table + Matches) */}
              <div 
                className="lg:col-span-7 space-y-6"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                {expandedGroup && (
                  <div className="bg-slate-900/30 rounded-2xl border border-slate-900 p-4 md:p-6 space-y-6">
                    <div className="flex justify-between items-center border-b border-slate-900 pb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-xl font-extrabold text-slate-100">
                            Grupo {expandedGroup}
                          </h3>
                          <span className="text-[10px] text-slate-500 bg-slate-900 px-2.5 py-0.5 rounded-full border border-slate-800 lg:hidden">
                            Arraste para o lado
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">Classificação do grupo e calendário</p>
                      </div>
                      
                      <button 
                        onClick={async () => {
                          const updatedMatchesForThisGroup = groupMatches[expandedGroup].map(match => {
                            const { sh, sa } = simulateMatchScore(match.home, match.away);
                            return { ...match, scoreHome: sh.toString(), scoreAway: sa.toString() };
                          });

                          const newGroupMatchesState = {
                            ...groupMatches,
                            [expandedGroup]: updatedMatchesForThisGroup
                          };

                          const localKnockoutSync = simulateFullKnockoutState(newGroupMatchesState);

                          setGroupMatches(newGroupMatchesState);
                          setKnockoutMatches(localKnockoutSync);

                          if (isSupabaseConfigured) {
                            await syncMatchesToSupabase(newGroupMatchesState, localKnockoutSync);
                          }
                        }}
                        disabled={isDbSyncing}
                        className="bg-slate-900 hover:bg-slate-850 disabled:opacity-50 text-slate-200 border border-slate-800 hover:border-slate-750 text-xs font-bold py-2 px-3.5 rounded-xl transition cursor-pointer"
                      >
                        Simular Grupo
                      </button>
                    </div>

                    {/* Table of Standings */}
                    <div className="space-y-2">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-1">Classificação</p>
                      <div className="overflow-x-auto no-scrollbar">
                        <table className="w-full text-left text-xs text-slate-300">
                          <thead>
                            <tr className="text-slate-500 border-b border-slate-900 pb-2 font-bold uppercase tracking-wider text-[9px]">
                              <th className="py-2.5 pl-2">Seleção</th>
                              <th className="py-2.5 text-center w-8">J</th>
                              <th className="py-2.5 text-center w-8">V</th>
                              <th className="py-2.5 text-center w-8">E</th>
                              <th className="py-2.5 text-center w-8">D</th>
                              <th className="py-2.5 text-center w-10">GP</th>
                              <th className="py-2.5 text-center w-10">GC</th>
                              <th className="py-2.5 text-center w-10">SG</th>
                              <th className="py-2.5 text-center pr-2 w-12 font-bold text-slate-400">PTS</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-900/30">
                            {groupStandings[expandedGroup].map((team, idx) => {
                              const isQualifying = idx < 2;
                              const isBestThirdCandidate = idx === 2;
                              return (
                                <tr 
                                  key={team.id}
                                  className={`hover:bg-slate-900/30 transition duration-150 ${
                                    isQualifying ? "bg-emerald-500/[0.01]" : ""
                                  }`}
                                >
                                  <td className="py-3 pl-2 flex items-center gap-2 font-medium">
                                    <span className={`w-1 h-5 rounded-full ${
                                      isQualifying 
                                        ? "bg-emerald-500" 
                                        : isBestThirdCandidate 
                                          ? "bg-yellow-500/40" 
                                          : "bg-transparent"
                                    }`}></span>
                                    <span className="font-mono text-[10px] text-slate-500">{idx + 1}º</span>
                                    <span className="text-base">{team.flag}</span>
                                    <span className="font-bold text-slate-100">{team.name}</span>
                                  </td>
                                  <td className="py-3 text-center font-mono">{team.j}</td>
                                  <td className="py-3 text-center font-mono text-slate-400">{team.v}</td>
                                  <td className="py-3 text-center font-mono text-slate-400">{team.e}</td>
                                  <td className="py-3 text-center font-mono text-slate-400">{team.d}</td>
                                  <td className="py-3 text-center font-mono text-slate-400">{team.gp}</td>
                                  <td className="py-3 text-center font-mono text-slate-400">{team.gc}</td>
                                  <td className={`py-3 text-center font-mono font-bold ${
                                    team.sg > 0 ? "text-emerald-400" : team.sg < 0 ? "text-rose-400" : "text-slate-400"
                                  }`}>{team.sg > 0 ? `+${team.sg}` : team.sg}</td>
                                  <td className={`py-3 text-center font-extrabold pr-2 font-mono text-sm ${
                                    isQualifying ? "text-emerald-400" : "text-slate-200"
                                  }`}>{team.pts}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                      
                      <div className="flex gap-4 text-[10px] text-slate-400 pt-1.5 pl-1.5">
                        <span className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Classifica direto (Top 2)
                        </span>
                        <span className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-yellow-500/40"></span> Disputa vaga de 3º lugar
                        </span>
                      </div>
                    </div>

                    {/* Group Matches Calendar List */}
                    <div className="space-y-3.5 pt-2">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-1">
                        Calendário & Jogos
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                        {groupMatches[expandedGroup].map((match) => {
                          const homeTeam = teamMap[match.home] || { name: match.home, flag: "" };
                          const awayTeam = teamMap[match.away] || { name: match.away, flag: "" };
                          const showResults = match.scoreHome !== "" && match.scoreAway !== "";
                          
                          // Calculate Brasilia Time
                          const brTime = getBrasiliaTime(match.localTime, match.fuso);
                          
                          return (
                            <div 
                              key={match.id}
                              onClick={() => openEditMatch(match, "group", expandedGroup)}
                              className="bg-slate-900 border border-slate-900 hover:border-slate-800 p-3.5 rounded-xl transition duration-200 cursor-pointer flex flex-col justify-between group shadow-sm"
                            >
                              {/* Match header info */}
                              <div className="flex justify-between items-center text-[10px] text-slate-400 border-b border-slate-950 pb-2 mb-3">
                                <span className="font-bold bg-slate-950 px-2 py-0.5 rounded border border-slate-900">
                                  {match.round}
                                </span>
                                <span className="text-slate-500 font-medium">
                                  {match.date}
                                </span>
                              </div>
                              
                              {/* Scoreline */}
                              <div className="flex justify-between items-center gap-3 py-1.5">
                                <div className="flex items-center gap-2 max-w-[42%] truncate">
                                  <span className="text-xl leading-none shrink-0">{homeTeam.flag}</span>
                                  <span className="font-bold text-xs text-slate-100 truncate">{homeTeam.name}</span>
                                </div>
                                
                                <div className="flex items-center gap-1 bg-slate-950/40 px-2.5 py-1 rounded-lg border border-slate-950">
                                  {showResults ? (
                                    <>
                                      <span className="font-mono font-bold text-sm text-slate-100">{match.scoreHome}</span>
                                      <span className="text-slate-600 font-semibold px-0.5">-</span>
                                      <span className="font-mono font-bold text-sm text-slate-100">{match.scoreAway}</span>
                                    </>
                                  ) : (
                                    <span className="text-[10px] font-bold text-emerald-400 uppercase px-1 py-0.5">Editar</span>
                                  )}
                                </div>

                                <div className="flex items-center gap-2 max-w-[42%] truncate justify-end">
                                  <span className="font-bold text-xs text-slate-100 truncate">{awayTeam.name}</span>
                                  <span className="text-xl leading-none shrink-0">{awayTeam.flag}</span>
                                </div>
                              </div>
                              
                              {/* Timezone display & venue */}
                              <div className="mt-3.5 pt-2 border-t border-slate-950 flex flex-col gap-1 text-[9px] text-slate-400 group-hover:text-slate-350 transition">
                                <div className="flex items-center justify-between text-slate-500">
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3 text-emerald-500/70" /> 
                                    <span>Brasília: <strong className="text-slate-300 font-bold">{brTime}</strong></span>
                                  </span>
                                  <span>Local: <strong className="text-slate-350">{match.localTime} ({match.fuso})</strong></span>
                                </div>
                                <div className="flex items-center gap-1 text-[9px] text-slate-500">
                                  <MapPin className="w-2.5 h-2.5" />
                                  <span className="truncate">{match.estadio} ({match.cidade})</span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: KNOCKOUT BRACKET */}
        {activeTab === "matamata" && (
          <div className="space-y-6">
            
            {/* Description Card */}
            <div className="bg-slate-900/40 p-4.5 rounded-2xl border border-slate-900 flex flex-col md:flex-row justify-between items-center gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-500" /> Chaveamento do Mata-Mata
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Os classificados são calculados e emparelhados automaticamente a partir da fase de grupos! 
                  Empates ativam botões de pênaltis. No celular, selecione a fase nas abas abaixo para deslizar horizontalmente.
                </p>
              </div>
              
              <button 
                onClick={async () => {
                  const localKnockoutSync = simulateFullKnockoutState(groupMatches);
                  setKnockoutMatches(localKnockoutSync);
                  if (isSupabaseConfigured) {
                    await syncMatchesToSupabase(groupMatches, localKnockoutSync);
                  }
                }}
                disabled={isDbSyncing}
                className="w-full md:w-auto bg-slate-900 hover:bg-slate-850 text-slate-200 border border-slate-800 hover:border-slate-750 text-xs font-bold py-2 px-3.5 rounded-xl transition cursor-pointer"
              >
                Simular Só Mata-Mata
              </button>
            </div>

            {/* Mobile Knockout Stage Tabs */}
            <div className="flex overflow-x-auto no-scrollbar gap-1.5 pb-1 lg:hidden">
              {[
                { id: "R32", label: "32-avos" },
                { id: "R16", label: "Oitavas" },
                { id: "QF", label: "Quartas" },
                { id: "SF", label: "Semifinais" },
                { id: "FI", label: "Decisões" }
              ].map(phase => (
                <button
                  key={phase.id}
                  onClick={() => setActiveKnockoutPhase(phase.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer whitespace-nowrap ${
                    activeKnockoutPhase === phase.id 
                      ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20" 
                      : "bg-slate-900/70 text-slate-400 border border-slate-900"
                  }`}
                >
                  {phase.label}
                </button>
              ))}
            </div>

            {/* Knockout Bracket Grid (Responsive scroll-snap layout on mobile, side by side on desktop) */}
            <div className="relative">
              
              {/* Desktop view: Layout with columns Side by Side */}
              <div className="hidden lg:grid grid-cols-5 gap-4 overflow-x-auto pb-4 custom-scrollbar">
                
                {/* 32-avos (R32) */}
                <div className="space-y-4">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center border-b border-slate-900 pb-2 mb-2">32-avos de Final</p>
                  <div className="space-y-3 max-h-[80vh] overflow-y-auto pr-1 custom-scrollbar">
                    {knockoutMatches.R32.map((match) => (
                      <KnockoutMatchCard key={match.id} match={match} stage="R32" teamMap={teamMap} onClick={() => openEditMatch(match, "R32")} />
                    ))}
                  </div>
                </div>

                {/* Oitavas (R16) */}
                <div className="space-y-4">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center border-b border-slate-900 pb-2 mb-2">Oitavas de Final</p>
                  <div className="space-y-3 max-h-[80vh] overflow-y-auto pr-1 custom-scrollbar justify-center flex flex-col pt-[50%]">
                    {knockoutMatches.R16.map((match) => (
                      <KnockoutMatchCard key={match.id} match={match} stage="R16" teamMap={teamMap} onClick={() => openEditMatch(match, "R16")} />
                    ))}
                  </div>
                </div>

                {/* Quartas (QF) */}
                <div className="space-y-4">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center border-b border-slate-900 pb-2 mb-2">Quartas de Final</p>
                  <div className="space-y-4 max-h-[80vh] overflow-y-auto pr-1 custom-scrollbar justify-center flex flex-col pt-[100%]">
                    {knockoutMatches.QF.map((match) => (
                      <KnockoutMatchCard key={match.id} match={match} stage="QF" teamMap={teamMap} onClick={() => openEditMatch(match, "QF")} />
                    ))}
                  </div>
                </div>

                {/* Semifinais (SF) */}
                <div className="space-y-4">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center border-b border-slate-900 pb-2 mb-2">Semifinais</p>
                  <div className="space-y-4 max-h-[80vh] overflow-y-auto pr-1 custom-scrollbar justify-center flex flex-col pt-[150%]">
                    {knockoutMatches.SF.map((match) => (
                      <KnockoutMatchCard key={match.id} match={match} stage="SF" teamMap={teamMap} onClick={() => openEditMatch(match, "SF")} />
                    ))}
                  </div>
                </div>

                {/* Finals (FI / T3) */}
                <div className="space-y-6">
                  <div>
                    <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider text-center border-b border-emerald-500/25 pb-2 mb-3">Final</p>
                    <div className="pt-[15%]">
                      {knockoutMatches.FI.map((match) => (
                        <KnockoutMatchCard key={match.id} match={match} stage="FI" teamMap={teamMap} onClick={() => openEditMatch(match, "FI")} />
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center border-b border-slate-900 pb-2 mb-3">Terceiro Lugar</p>
                    <div>
                      {knockoutMatches.T3.map((match) => (
                        <KnockoutMatchCard key={match.id} match={match} stage="T3" teamMap={teamMap} onClick={() => openEditMatch(match, "T3")} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Mobile View: Render only the active phase */}
              <div className="lg:hidden space-y-3">
                {activeKnockoutPhase === "R32" && (
                  <div className="space-y-3">
                    <p className="text-xs text-slate-400 font-medium pb-1">Confrontos dos 32-avos:</p>
                    {knockoutMatches.R32.map((match) => (
                      <KnockoutMatchCard key={match.id} match={match} stage="R32" teamMap={teamMap} onClick={() => openEditMatch(match, "R32")} />
                    ))}
                  </div>
                )}
                {activeKnockoutPhase === "R16" && (
                  <div className="space-y-3">
                    <p className="text-xs text-slate-400 font-medium pb-1">Confrontos das Oitavas de Final:</p>
                    {knockoutMatches.R16.map((match) => (
                      <KnockoutMatchCard key={match.id} match={match} stage="R16" teamMap={teamMap} onClick={() => openEditMatch(match, "R16")} />
                    ))}
                  </div>
                )}
                {activeKnockoutPhase === "QF" && (
                  <div className="space-y-3">
                    <p className="text-xs text-slate-400 font-medium pb-1">Confrontos das Quartas de Final:</p>
                    {knockoutMatches.QF.map((match) => (
                      <KnockoutMatchCard key={match.id} match={match} stage="QF" teamMap={teamMap} onClick={() => openEditMatch(match, "QF")} />
                    ))}
                  </div>
                )}
                {activeKnockoutPhase === "SF" && (
                  <div className="space-y-3">
                    <p className="text-xs text-slate-400 font-medium pb-1">Confrontos das Semifinais:</p>
                    {knockoutMatches.SF.map((match) => (
                      <KnockoutMatchCard key={match.id} match={match} stage="SF" teamMap={teamMap} onClick={() => openEditMatch(match, "SF")} />
                    ))}
                  </div>
                )}
                {activeKnockoutPhase === "FI" && (
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs text-emerald-400 font-bold uppercase pb-1 border-b border-emerald-500/20 mb-2">Decisão do Campeão (Final)</p>
                      {knockoutMatches.FI.map((match) => (
                        <KnockoutMatchCard key={match.id} match={match} stage="FI" teamMap={teamMap} onClick={() => openEditMatch(match, "FI")} />
                      ))}
                    </div>
                    <div className="pt-2">
                      <p className="text-xs text-slate-400 font-bold uppercase pb-1 border-b border-slate-800 mb-2">Decisão de Terceiro Lugar</p>
                      {knockoutMatches.T3.map((match) => (
                        <KnockoutMatchCard key={match.id} match={match} stage="T3" teamMap={teamMap} onClick={() => openEditMatch(match, "T3")} />
                      ))}
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

        {/* TAB 3: STATISTICS & RULES */}
        {activeTab === "estatisticas" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Stats Summary Panel */}
            <div className="bg-slate-900/30 rounded-2xl border border-slate-900 p-6 space-y-6">
              <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2 border-b border-slate-900 pb-3">
                <BarChart2 className="w-5 h-5 text-emerald-400" /> Métricas Detalhadas do Simulador
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800/80">
                  <p className="text-xs text-slate-400 uppercase tracking-wider">Jogos Registrados</p>
                  <p className="text-2xl font-bold font-mono text-slate-200 mt-1">{stats.matchesWithScore}</p>
                </div>
                <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800/80">
                  <p className="text-xs text-slate-400 uppercase tracking-wider">Total de Gols</p>
                  <p className="text-2xl font-bold font-mono text-slate-200 mt-1">{stats.totalGoals}</p>
                </div>
                <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800/80">
                  <p className="text-xs text-slate-400 uppercase tracking-wider">Gols por Partida</p>
                  <p className="text-2xl font-bold font-mono text-slate-200 mt-1">{stats.averageGoals}</p>
                </div>
                <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800/80">
                  <p className="text-xs text-slate-400 uppercase tracking-wider">Maior Goleada</p>
                  <p className="text-xs font-bold text-slate-200 mt-2 truncate" title={stats.biggestBlowout.replace(/<[^>]*>/g, '')}>
                    {stats.biggestBlowout}
                  </p>
                </div>
              </div>

              {/* Progress visual bar */}
              <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-800/80 space-y-2">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-slate-400">Progresso do Simulador</span>
                  <span className="text-emerald-400 font-mono font-bold">{stats.matchesWithScore} / 104 Jogos</span>
                </div>
                <div className="w-full bg-slate-950 rounded-full h-3.5 border border-slate-900 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 h-full rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                    style={{ width: `${stats.progressPercent}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Rules Panel */}
            <div className="bg-slate-900/30 rounded-2xl border border-slate-900 p-6 space-y-5">
              <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2 border-b border-slate-900 pb-3">
                <Info className="w-5 h-5 text-amber-500" /> Regulamento da Copa 2026
              </h3>
              
              <div className="space-y-4 text-xs text-slate-400 leading-relaxed">
                <div>
                  <p className="font-bold text-slate-200 mb-1">A Maior Copa da História</p>
                  <p>A edição de 2026 será a primeira com 48 países e 104 jogos totais. Sendo sediada conjuntamente nos EUA, Canadá e México.</p>
                </div>
                <div>
                  <p className="font-bold text-slate-200 mb-1">Fase de Grupos (12 Chaves)</p>
                  <p>Os 48 times foram divididos em 12 grupos de 4 (A ao L). Os dois melhores de cada grupo (24 seleções) e os 8 melhores terceiros colocados no geral classificam-se para os 32-avos de final.</p>
                </div>
                <div>
                  <p className="font-bold text-slate-200 mb-1">Critérios de Desempate nos Grupos</p>
                  <p>1. Pontos; 2. Saldo de gols; 3. Gols marcados; 4. Confronto direto. No simulador, a força real aproximada da seleção (Rating) é utilizada como tiebreaker secundário para desempates.</p>
                </div>
                <div>
                  <p className="font-bold text-slate-200 mb-1">Mata-Mata Estendido</p>
                  <p>Iniciando-se em uma fase de 32 times (32-avos). Jogos empatados no mata-mata vão diretamente para as cobranças de pênaltis para decidir quem avança à próxima fase do torneio.</p>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* TAB 4: VENUES & STADIUMS */}
        {activeTab === "sedes" && (
          <div className="space-y-6">
            <div className="bg-slate-900/40 p-4.5 rounded-2xl border border-slate-900">
              <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-emerald-400" /> As 16 Sedes & Estádios Oficiais
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Conheça os palcos que receberão as 48 seleções em 2026 nos três países-sede.
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4.5">
              {SEDES_2026.map(sede => (
                <div 
                  key={sede.id}
                  className="bg-slate-900 border border-slate-900 rounded-2xl overflow-hidden hover:border-slate-800 transition duration-300 flex flex-col group shadow-md"
                >
                  <div className="h-40 overflow-hidden relative">
                    <img 
                      src={sede.imagem} 
                      alt={sede.estadio}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                    <div className="absolute top-2.5 right-2.5 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-full border border-slate-900 text-xs font-bold flex items-center gap-1">
                      <span>{sede.bandeira}</span>
                      <span>{sede.pais}</span>
                    </div>
                  </div>
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <h4 className="font-bold text-slate-100 text-sm leading-tight group-hover:text-emerald-400 transition">
                        {sede.estadio}
                      </h4>
                      <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-500" /> {sede.cidade}
                      </p>
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-slate-400 pt-3 border-t border-slate-950/50">
                      <span>Capacidade: <strong className="text-slate-200">{sede.capacidade}</strong></span>
                      <span className="bg-slate-950 px-2 py-0.5 rounded border border-slate-900 font-mono text-[9px]">
                        Fuso: {sede.fuso}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>

      {/* MOBILE BOTTOM NAVIGATION BAR (Floating & Blur native feel) */}
      <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-4 lg:hidden pointer-events-none">
        <nav className="max-w-md mx-auto bg-slate-950/80 backdrop-blur-xl border border-slate-900/60 p-2 rounded-2xl shadow-2xl flex justify-between items-center pointer-events-auto">
          {[
            { id: "grupos", label: "Grupos", icon: Users },
            { id: "matamata", label: "Mata-Mata", icon: Trophy },
            { id: "estatisticas", label: "Estatísticas", icon: BarChart2 },
            { id: "sedes", label: "Sedes", icon: MapPin }
          ].map(tab => {
            const isSelected = activeTab === tab.id;
            return (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-xl transition duration-200 cursor-pointer ${
                  isSelected ? "text-emerald-400 bg-emerald-500/5 font-bold" : "text-slate-500 hover:text-slate-300"
                }`}
              >
                <tab.icon className={`w-5 h-5 mb-1 ${isSelected ? "text-emerald-400" : "text-slate-500"}`} />
                <span className="text-[10px]">{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* BOTTOM SHEET / DIALOG FOR EDITING MATCH SCORES (Responsive Sheet for Mobile, Modal for Desktop) */}
      {selectedMatch && (
        <div className="fixed inset-0 z-50 flex items-end lg:items-center justify-center p-0 lg:p-4 bottom-sheet-backdrop">
          
          {/* Backdrop dismisser tap area */}
          <div 
            className="absolute inset-0 cursor-default" 
            onClick={() => setSelectedMatch(null)}
          ></div>
          
          {/* Sheet container */}
          <div className="w-full lg:max-w-lg bg-slate-950 lg:rounded-2xl border border-slate-900 p-6 flex flex-col gap-5 relative z-10 bottom-sheet-container open shadow-2xl safe-bottom max-h-[90vh] overflow-y-auto no-scrollbar">
            
            {/* Slide drawer handle line (Only on mobile) */}
            <div className="w-12 h-1 bg-slate-800 rounded-full mx-auto mb-1 lg:hidden"></div>
            
            {/* Header info */}
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[9px] uppercase tracking-wider font-extrabold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded">
                  {selectedMatch.type === "group" ? `Grupo ${selectedMatch.groupKey} • ${selectedMatch.round}` : "Fase de Mata-Mata"}
                </span>
                <h3 className="font-extrabold text-slate-100 text-base mt-2">
                  Registro de Placar
                </h3>
              </div>
              <button 
                onClick={() => setSelectedMatch(null)}
                className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-850 text-slate-400 hover:text-slate-200 border border-slate-900 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Stadium / Timezone Summary card */}
            <div className="bg-slate-900/60 border border-slate-900/80 p-3.5 rounded-xl flex items-start gap-3 text-xs">
              <MapPin className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <div className="space-y-1.5 flex-1 text-[11px] text-slate-400">
                <p className="font-bold text-slate-200">
                  {selectedMatch.estadio || "Estádio da Copa 2026"}
                </p>
                <p className="flex items-center gap-1.5">
                  <span>{selectedMatch.cidade || "Sede Oficial"}</span>
                  {selectedMatch.pais && (
                    <>
                      <span className="w-1 h-1 rounded-full bg-slate-700"></span>
                      <span>{selectedMatch.bandeira} {selectedMatch.pais}</span>
                    </>
                  )}
                </p>
                
                {selectedMatch.localTime && (
                  <div className="pt-2 border-t border-slate-950 flex flex-col gap-1 text-[10px]">
                    <p className="flex justify-between">
                      <span>Data:</span>
                      <strong className="text-slate-350">{selectedMatch.date}</strong>
                    </p>
                    <p className="flex justify-between">
                      <span>Horário de Brasília:</span>
                      <strong className="text-emerald-400">{getBrasiliaTime(selectedMatch.localTime, selectedMatch.fuso)}</strong>
                    </p>
                    <p className="flex justify-between">
                      <span>Horário Local:</span>
                      <strong className="text-slate-350">{selectedMatch.localTime} ({selectedMatch.fuso})</strong>
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Score editing core */}
            {selectedMatch.home && selectedMatch.away ? (
              <div className="space-y-5">
                <div className="flex justify-between items-center gap-2">
                  
                  {/* Home Team */}
                  <div className="flex-1 flex flex-col items-center gap-2 text-center max-w-[40%]">
                    <span className="text-4xl leading-none">{teamMap[selectedMatch.home]?.flag}</span>
                    <span className="font-extrabold text-xs text-slate-100 truncate w-full">
                      {teamMap[selectedMatch.home]?.name}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">Rating: {TEAM_RATINGS[selectedMatch.home]}</span>
                  </div>

                  {/* Inputs and Counters */}
                  <div className="flex items-center gap-2 bg-slate-900 p-2 rounded-2xl border border-slate-800">
                    
                    {/* Home Incrementers */}
                    <div className="flex flex-col gap-1">
                      <button 
                        onClick={() => {
                          const val = parseInt(editingScoreHome, 10) || 0;
                          setEditingScoreHome((val + 1).toString());
                        }}
                        className="p-1 rounded bg-slate-950 hover:bg-slate-850 border border-slate-900 text-slate-300 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => {
                          const val = parseInt(editingScoreHome, 10) || 0;
                          setEditingScoreHome(Math.max(0, val - 1).toString());
                        }}
                        className="p-1 rounded bg-slate-950 hover:bg-slate-850 border border-slate-900 text-slate-300 cursor-pointer"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <input 
                      type="text" 
                      inputMode="numeric" 
                      pattern="[0-9]*"
                      value={editingScoreHome}
                      onChange={(e) => setEditingScoreHome(e.target.value.replace(/\D/g, '').slice(0, 2))}
                      placeholder="0"
                      className="w-12 h-14 bg-slate-950 border border-slate-800 rounded-xl text-center text-xl font-bold font-mono text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                    
                    <span className="text-slate-600 font-black text-lg px-0.5">:</span>
                    
                    <input 
                      type="text" 
                      inputMode="numeric" 
                      pattern="[0-9]*"
                      value={editingScoreAway}
                      onChange={(e) => setEditingScoreAway(e.target.value.replace(/\D/g, '').slice(0, 2))}
                      placeholder="0"
                      className="w-12 h-14 bg-slate-950 border border-slate-800 rounded-xl text-center text-xl font-bold font-mono text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />

                    {/* Away Incrementers */}
                    <div className="flex flex-col gap-1">
                      <button 
                        onClick={() => {
                          const val = parseInt(editingScoreAway, 10) || 0;
                          setEditingScoreAway((val + 1).toString());
                        }}
                        className="p-1 rounded bg-slate-950 hover:bg-slate-850 border border-slate-900 text-slate-300 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => {
                          const val = parseInt(editingScoreAway, 10) || 0;
                          setEditingScoreAway(Math.max(0, val - 1).toString());
                        }}
                        className="p-1 rounded bg-slate-950 hover:bg-slate-850 border border-slate-900 text-slate-300 cursor-pointer"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                  </div>

                  {/* Away Team */}
                  <div className="flex-1 flex flex-col items-center gap-2 text-center max-w-[40%]">
                    <span className="text-4xl leading-none">{teamMap[selectedMatch.away]?.flag}</span>
                    <span className="font-extrabold text-xs text-slate-100 truncate w-full">
                      {teamMap[selectedMatch.away]?.name}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">Rating: {TEAM_RATINGS[selectedMatch.away]}</span>
                  </div>

                </div>

                {/* Penalty Shootout section (only for tie in knockout stages) */}
                {selectedMatch.type !== "group" && 
                 editingScoreHome !== "" && 
                 editingScoreAway !== "" && 
                 parseInt(editingScoreHome, 10) === parseInt(editingScoreAway, 10) && (
                  <div className="bg-slate-900 border border-slate-900/60 p-4 rounded-xl space-y-3.5 transition-all">
                    <div className="text-center">
                      <span className="text-[10px] text-amber-400 font-extrabold uppercase bg-amber-500/10 px-2 py-0.5 rounded">
                        Decisão por Pênaltis Necessária
                      </span>
                    </div>
                    
                    <div className="flex justify-center items-center gap-4">
                      <div className="flex flex-col items-center">
                        <label className="text-[10px] text-slate-500 font-bold mb-1">Pênaltis {teamMap[selectedMatch.home]?.name}</label>
                        <input 
                          type="text" 
                          inputMode="numeric" 
                          pattern="[0-9]*"
                          value={editingPenHome}
                          onChange={(e) => setEditingPenHome(e.target.value.replace(/\D/g, '').slice(0, 2))}
                          placeholder="5"
                          className="w-12 h-10 bg-slate-950 border border-slate-800 rounded-lg text-center font-bold font-mono text-slate-100 focus:outline-none"
                        />
                      </div>
                      <span className="text-slate-700 font-bold mt-4">x</span>
                      <div className="flex flex-col items-center">
                        <label className="text-[10px] text-slate-500 font-bold mb-1">Pênaltis {teamMap[selectedMatch.away]?.name}</label>
                        <input 
                          type="text" 
                          inputMode="numeric" 
                          pattern="[0-9]*"
                          value={editingPenAway}
                          onChange={(e) => setEditingPenAway(e.target.value.replace(/\D/g, '').slice(0, 2))}
                          placeholder="4"
                          className="w-12 h-10 bg-slate-950 border border-slate-800 rounded-lg text-center font-bold font-mono text-slate-100 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Panel Actions */}
                <div className="flex gap-2.5 pt-3">
                  <button 
                    onClick={simulateSingleMatchInSheet}
                    disabled={isDbSyncing}
                    className="flex-1 bg-slate-900 hover:bg-slate-850 text-slate-200 border border-slate-800 hover:border-slate-750 font-bold py-3 px-4 rounded-xl transition duration-200 cursor-pointer flex items-center justify-center gap-2 text-xs disabled:opacity-50"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> Simular Jogo
                  </button>
                  <button 
                    onClick={saveMatchScore}
                    disabled={isDbSyncing}
                    className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black py-3 px-4 rounded-xl transition duration-200 cursor-pointer text-xs disabled:opacity-50"
                  >
                    Confirmar
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-slate-500 text-xs">
                <Info className="w-6 h-6 mx-auto mb-2 text-slate-600" />
                Aguardando definição das seleções classificadas.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Subcomponent: Knockout Bracket Card
function KnockoutMatchCard({ match, stage, teamMap, onClick }) {
  const home = match.home ? (teamMap[match.home] || { name: match.home, flag: "" }) : null;
  const away = match.away ? (teamMap[match.away] || { name: match.away, flag: "" }) : null;
  const hasPlayed = match.scoreHome !== "" && match.scoreAway !== "";
  
  // Highlight winner visually
  const sh = parseInt(match.scoreHome, 10);
  const sa = parseInt(match.scoreAway, 10);
  const ph = parseInt(match.penHome, 10) || 0;
  const pa = parseInt(match.penAway, 10) || 0;
  
  let homeWinner = false;
  let awayWinner = false;
  if (hasPlayed) {
    if (sh > sa) homeWinner = true;
    else if (sa > sh) awayWinner = true;
    else if (ph > pa) homeWinner = true;
    else if (pa > ph) awayWinner = true;
  }

  return (
    <div 
      onClick={onClick}
      className="bg-slate-900 border border-slate-900 hover:border-slate-800 p-3 rounded-xl transition duration-200 cursor-pointer flex flex-col justify-center text-xs group shadow animate-fade-in"
    >
      <div className="flex justify-between items-center text-[8.5px] text-slate-500 border-b border-slate-950 pb-1.5 mb-2.5">
        <span className="font-bold">{match.id}</span>
        <span>Mata-mata</span>
      </div>

      <div className="space-y-2">
        {/* Home */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-1.5 max-w-[78%] truncate">
            {home ? (
              <>
                <span className="text-base leading-none shrink-0">{home.flag}</span>
                <span className={`font-bold truncate ${homeWinner ? "text-emerald-400 font-extrabold" : hasPlayed ? "text-slate-400" : "text-slate-200"}`}>
                  {home.name}
                </span>
              </>
            ) : (
              <span className="text-slate-500 font-mono text-[10px]">—</span>
            )}
          </div>
          
          <div className="flex items-center gap-1 font-mono text-xs">
            {hasPlayed && (
              <>
                {match.penHome !== "" && (
                  <span className="text-[9px] text-slate-500 bg-slate-950 px-1 rounded">({match.penHome})</span>
                )}
                <span className={`font-bold w-4 text-center ${homeWinner ? "text-emerald-400" : "text-slate-500"}`}>{match.scoreHome}</span>
              </>
            )}
          </div>
        </div>

        {/* Away */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-1.5 max-w-[78%] truncate">
            {away ? (
              <>
                <span className="text-base leading-none shrink-0">{away.flag}</span>
                <span className={`font-bold truncate ${awayWinner ? "text-emerald-400 font-extrabold" : hasPlayed ? "text-slate-400" : "text-slate-200"}`}>
                  {away.name}
                </span>
              </>
            ) : (
              <span className="text-slate-500 font-mono text-[10px]">—</span>
            )}
          </div>
          
          <div className="flex items-center gap-1 font-mono text-xs">
            {hasPlayed && (
              <>
                {match.penAway !== "" && (
                  <span className="text-[9px] text-slate-500 bg-slate-950 px-1 rounded">({match.penAway})</span>
                )}
                <span className={`font-bold w-4 text-center ${awayWinner ? "text-emerald-400" : "text-slate-500"}`}>{match.scoreAway}</span>
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* Edit overlay prompt */}
      {!home || !away ? (
        <div className="text-[8px] text-slate-650 border-t border-slate-950/40 pt-1.5 mt-2 flex items-center justify-between">
          <span>Aguardando confrontos</span>
        </div>
      ) : !hasPlayed ? (
        <div className="text-[8px] text-emerald-500/70 border-t border-slate-950/40 pt-1.5 mt-2 flex items-center justify-between group-hover:text-emerald-400 transition font-bold uppercase">
          <span>Registrar placar</span>
          <Plus className="w-2.5 h-2.5" />
        </div>
      ) : (
        <div className="text-[8px] text-slate-500 border-t border-slate-950/45 pt-1.5 mt-2 flex items-center justify-between">
          <span className="truncate">Confirmado</span>
          <span className="text-slate-600">Editar</span>
        </div>
      )}
    </div>
  );
}
