import { INITIAL_GROUPS_DATA } from './teams';
import { SEDES_2026 } from './sedes';

// Helper to determine the host stadium and timezone for a group
const getSedeForGroupMatch = (groupKey, matchIdx) => {
  const groupIndex = groupKey.charCodeAt(0) - 65; // A=0, B=1, ..., L=11
  
  // Realistic regional pods for the 12 groups
  const groupSedesMap = {
    0: [0, 1, 2],    // Grupo A: México (CDMX, Guadalajara, Monterrey)
    1: [4, 13, 15],  // Grupo B: Canadá Leste e EUA Nordeste (Toronto, NY/NJ, Boston)
    2: [12, 11, 14], // Grupo C: EUA Sudeste/Leste (Miami, Atlanta, Philly)
    3: [5, 6, 7],    // Grupo D: EUA Costa Oeste (LA, SF, Seattle)
    4: [8, 9, 10],   // Grupo E: EUA Central/Sul (Dallas, Houston, KC)
    5: [3, 5, 6],    // Grupo F: Canadá Oeste e EUA Oeste (Vancouver, LA, SF)
    6: [13, 14, 15], // Grupo G: EUA Nordeste (NY/NJ, Philly, Boston)
    7: [12, 8, 9],   // Grupo H: EUA Sul/Sudeste (Miami, Dallas, Houston)
    8: [0, 1, 2],    // Grupo I: México (CDMX, Guadalajara, Monterrey)
    9: [4, 13, 11],  // Grupo J: Canadá Leste e EUA Leste (Toronto, NY/NJ, Atlanta)
    10: [5, 7, 8],   // Grupo K: EUA Oeste/Central (LA, Seattle, Dallas)
    11: [14, 15, 12]  // Grupo L: EUA Leste/Sudeste (Philly, Boston, Miami)
  };

  const sedesAvailable = groupSedesMap[groupIndex] || [13, 14, 15];
  const sedeIdx = sedesAvailable[matchIdx % sedesAvailable.length];
  return SEDES_2026[sedeIdx];
};

// Helper to assign a realistic date based on group and round
const getMatchDateAndHour = (groupKey, roundStr, matchIdx) => {
  const groupIndex = groupKey.charCodeAt(0) - 65; // A=0, B=1, ..., L=11
  
  // World Cup 2026 group stage runs from June 11 to June 27, 2026
  let day = 11;
  let localTime = "18:00";

  if (roundStr === "Rodada 1") {
    day = 11 + Math.floor(groupIndex / 3); // June 11 to 14
    // Match times (Local) can be 13:00, 16:00, 19:00, 21:00
    localTime = matchIdx % 2 === 0 ? "15:00" : "19:00";
    if (groupKey === "A" && matchIdx === 0) {
      day = 11; // Opening match México
      localTime = "17:00";
    }
  } else if (roundStr === "Rodada 2") {
    day = 16 + Math.floor(groupIndex / 3); // June 16 to 19
    localTime = matchIdx % 2 === 0 ? "14:00" : "18:00";
  } else {
    // Rodada 3 (simultaneous matches for fairness)
    day = 21 + Math.floor(groupIndex / 3); // June 21 to 24
    localTime = "16:00"; // All final group matches usually kickoff at same local time
  }

  return {
    date: `${String(day).padStart(2, '0')}/06/2026`,
    localTime
  };
};

export const getBrasiliaTime = (localTime, fusoSede) => {
  // fusoSede is a string like "UTC-4", "UTC-5", "UTC-6", "UTC-7"
  const fusoNum = parseInt(fusoSede.replace("UTC", ""), 10); // ex: -4, -5, -6, -7
  // Brasília is UTC-3. Difference is -3 - (fusoSede)
  const diffHours = -3 - fusoNum;
  
  const [hours, minutes] = localTime.split(":").map(Number);
  let brHours = hours + diffHours;
  
  // Handle overflow/underflow
  if (brHours >= 24) {
    brHours = brHours - 24;
  } else if (brHours < 0) {
    brHours = brHours + 24;
  }
  
  return `${String(brHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};

export const generateInitialMatches = () => {
  const matches = {};
  
  Object.keys(INITIAL_GROUPS_DATA).forEach(groupKey => {
    const teams = INITIAL_GROUPS_DATA[groupKey].teams;
    
    // 6 matches per group
    const matchTemplates = [
      { id: `${groupKey}1`, home: teams[0].id, away: teams[1].id, round: "Rodada 1", idx: 0 },
      { id: `${groupKey}2`, home: teams[2].id, away: teams[3].id, round: "Rodada 1", idx: 1 },
      { id: `${groupKey}3`, home: teams[0].id, away: teams[2].id, round: "Rodada 2", idx: 2 },
      { id: `${groupKey}4`, home: teams[3].id, away: teams[1].id, round: "Rodada 2", idx: 3 },
      { id: `${groupKey}5`, home: teams[3].id, away: teams[0].id, round: "Rodada 3", idx: 4 },
      { id: `${groupKey}6`, home: teams[1].id, away: teams[2].id, round: "Rodada 3", idx: 5 }
    ];

    matches[groupKey] = matchTemplates.map(tmpl => {
      const sede = getSedeForGroupMatch(groupKey, tmpl.idx);
      const { date, localTime } = getMatchDateAndHour(groupKey, tmpl.round, tmpl.idx);
      
      return {
        id: tmpl.id,
        home: tmpl.home,
        away: tmpl.away,
        scoreHome: "",
        scoreAway: "",
        round: tmpl.round,
        date,
        localTime,
        estadio: sede.estadio,
        cidade: sede.cidade,
        fuso: sede.fuso,
        pais: sede.pais,
        bandeira: sede.bandeira
      };
    });
  });
  
  return matches;
};
