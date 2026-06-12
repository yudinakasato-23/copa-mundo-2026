import { INITIAL_GROUPS_DATA } from './teams';

// Timezones, dates, and stadiums of all 72 Group Stage matches (from official FIFA World Cup 2026 schedule)
const GROUP_SCHEDULES_MAP = {
  "A1": {
    "date": "11/06/2026",
    "localTime": "13:00",
    "estadio": "Estádio Azteca",
    "cidade": "Cidade do México",
    "fuso": "UTC-6",
    "pais": "México",
    "bandeira": "🇲🇽",
    "isInverted": false
  },
  "A2": {
    "date": "11/06/2026",
    "localTime": "20:00",
    "estadio": "Estádio Akron",
    "cidade": "Guadalajara",
    "fuso": "UTC-6",
    "pais": "México",
    "bandeira": "🇲🇽",
    "isInverted": false
  },
  "A3": {
    "date": "18/06/2026",
    "localTime": "19:00",
    "estadio": "Estádio Akron",
    "cidade": "Guadalajara",
    "fuso": "UTC-6",
    "pais": "México",
    "bandeira": "🇲🇽",
    "isInverted": false
  },
  "A4": {
    "date": "18/06/2026",
    "localTime": "12:00",
    "estadio": "Mercedes-Benz Stadium",
    "cidade": "Atlanta",
    "fuso": "UTC-4",
    "pais": "EUA",
    "bandeira": "🇺🇸",
    "isInverted": false
  },
  "A5": {
    "date": "24/06/2026",
    "localTime": "19:00",
    "estadio": "Estádio Azteca",
    "cidade": "Cidade do México",
    "fuso": "UTC-6",
    "pais": "México",
    "bandeira": "🇲🇽",
    "isInverted": false
  },
  "A6": {
    "date": "24/06/2026",
    "localTime": "19:00",
    "estadio": "Estádio BBVA",
    "cidade": "Monterrey",
    "fuso": "UTC-6",
    "pais": "México",
    "bandeira": "🇲🇽",
    "isInverted": false
  },
  "B1": {
    "date": "12/06/2026",
    "localTime": "15:00",
    "estadio": "BMO Field",
    "cidade": "Toronto",
    "fuso": "UTC-4",
    "pais": "Canadá",
    "bandeira": "🇨🇦",
    "isInverted": false
  },
  "B2": {
    "date": "13/06/2026",
    "localTime": "12:00",
    "estadio": "Levi's Stadium",
    "cidade": "São Francisco / Bay Area",
    "fuso": "UTC-7",
    "pais": "EUA",
    "bandeira": "🇺🇸",
    "isInverted": false
  },
  "B3": {
    "date": "18/06/2026",
    "localTime": "15:00",
    "estadio": "BC Place",
    "cidade": "Vancouver",
    "fuso": "UTC-7",
    "pais": "Canadá",
    "bandeira": "🇨🇦",
    "isInverted": false
  },
  "B4": {
    "date": "18/06/2026",
    "localTime": "12:00",
    "estadio": "SoFi Stadium",
    "cidade": "Los Angeles",
    "fuso": "UTC-7",
    "pais": "EUA",
    "bandeira": "🇺🇸",
    "isInverted": false
  },
  "B5": {
    "date": "24/06/2026",
    "localTime": "12:00",
    "estadio": "BC Place",
    "cidade": "Vancouver",
    "fuso": "UTC-7",
    "pais": "Canadá",
    "bandeira": "🇨🇦",
    "isInverted": false
  },
  "B6": {
    "date": "24/06/2026",
    "localTime": "12:00",
    "estadio": "Lumen Field",
    "cidade": "Seattle",
    "fuso": "UTC-7",
    "pais": "EUA",
    "bandeira": "🇺🇸",
    "isInverted": false
  },
  "C1": {
    "date": "13/06/2026",
    "localTime": "18:00",
    "estadio": "MetLife Stadium",
    "cidade": "Nova York / Nova Jersey",
    "fuso": "UTC-4",
    "pais": "EUA",
    "bandeira": "🇺🇸",
    "isInverted": false
  },
  "C2": {
    "date": "13/06/2026",
    "localTime": "21:00",
    "estadio": "Gillette Stadium",
    "cidade": "Boston",
    "fuso": "UTC-4",
    "pais": "EUA",
    "bandeira": "🇺🇸",
    "isInverted": false
  },
  "C3": {
    "date": "19/06/2026",
    "localTime": "21:00",
    "estadio": "Lincoln Financial Field",
    "cidade": "Philadelphia",
    "fuso": "UTC-4",
    "pais": "EUA",
    "bandeira": "🇺🇸",
    "isInverted": false
  },
  "C4": {
    "date": "19/06/2026",
    "localTime": "18:00",
    "estadio": "Gillette Stadium",
    "cidade": "Boston",
    "fuso": "UTC-4",
    "pais": "EUA",
    "bandeira": "🇺🇸",
    "isInverted": false
  },
  "C5": {
    "date": "24/06/2026",
    "localTime": "18:00",
    "estadio": "Hard Rock Stadium",
    "cidade": "Miami",
    "fuso": "UTC-4",
    "pais": "EUA",
    "bandeira": "🇺🇸",
    "isInverted": false
  },
  "C6": {
    "date": "24/06/2026",
    "localTime": "18:00",
    "estadio": "Mercedes-Benz Stadium",
    "cidade": "Atlanta",
    "fuso": "UTC-4",
    "pais": "EUA",
    "bandeira": "🇺🇸",
    "isInverted": false
  },
  "D1": {
    "date": "12/06/2026",
    "localTime": "18:00",
    "estadio": "SoFi Stadium",
    "cidade": "Los Angeles",
    "fuso": "UTC-7",
    "pais": "EUA",
    "bandeira": "🇺🇸",
    "isInverted": false
  },
  "D2": {
    "date": "13/06/2026",
    "localTime": "21:00",
    "estadio": "BC Place",
    "cidade": "Vancouver",
    "fuso": "UTC-7",
    "pais": "Canadá",
    "bandeira": "🇨🇦",
    "isInverted": false
  },
  "D3": {
    "date": "19/06/2026",
    "localTime": "12:00",
    "estadio": "Lumen Field",
    "cidade": "Seattle",
    "fuso": "UTC-7",
    "pais": "EUA",
    "bandeira": "🇺🇸",
    "isInverted": false
  },
  "D4": {
    "date": "19/06/2026",
    "localTime": "20:00",
    "estadio": "Levi's Stadium",
    "cidade": "São Francisco / Bay Area",
    "fuso": "UTC-7",
    "pais": "EUA",
    "bandeira": "🇺🇸",
    "isInverted": false
  },
  "D5": {
    "date": "25/06/2026",
    "localTime": "19:00",
    "estadio": "SoFi Stadium",
    "cidade": "Los Angeles",
    "fuso": "UTC-7",
    "pais": "EUA",
    "bandeira": "🇺🇸",
    "isInverted": false
  },
  "D6": {
    "date": "25/06/2026",
    "localTime": "19:00",
    "estadio": "Levi's Stadium",
    "cidade": "São Francisco / Bay Area",
    "fuso": "UTC-7",
    "pais": "EUA",
    "bandeira": "🇺🇸",
    "isInverted": false
  },
  "E1": {
    "date": "14/06/2026",
    "localTime": "12:00",
    "estadio": "NRG Stadium",
    "cidade": "Houston",
    "fuso": "UTC-5",
    "pais": "EUA",
    "bandeira": "🇺🇸",
    "isInverted": false
  },
  "E2": {
    "date": "14/06/2026",
    "localTime": "19:00",
    "estadio": "Lincoln Financial Field",
    "cidade": "Philadelphia",
    "fuso": "UTC-4",
    "pais": "EUA",
    "bandeira": "🇺🇸",
    "isInverted": false
  },
  "E3": {
    "date": "20/06/2026",
    "localTime": "16:00",
    "estadio": "BMO Field",
    "cidade": "Toronto",
    "fuso": "UTC-4",
    "pais": "Canadá",
    "bandeira": "🇨🇦",
    "isInverted": false
  },
  "E4": {
    "date": "20/06/2026",
    "localTime": "19:00",
    "estadio": "GEHA Field at Arrowhead",
    "cidade": "Kansas City",
    "fuso": "UTC-5",
    "pais": "EUA",
    "bandeira": "🇺🇸",
    "isInverted": false
  },
  "E5": {
    "date": "25/06/2026",
    "localTime": "16:00",
    "estadio": "MetLife Stadium",
    "cidade": "Nova York / Nova Jersey",
    "fuso": "UTC-4",
    "pais": "EUA",
    "bandeira": "🇺🇸",
    "isInverted": false
  },
  "E6": {
    "date": "25/06/2026",
    "localTime": "16:00",
    "estadio": "Lincoln Financial Field",
    "cidade": "Philadelphia",
    "fuso": "UTC-4",
    "pais": "EUA",
    "bandeira": "🇺🇸",
    "isInverted": false
  },
  "F1": {
    "date": "14/06/2026",
    "localTime": "15:00",
    "estadio": "AT&T Stadium",
    "cidade": "Dallas",
    "fuso": "UTC-5",
    "pais": "EUA",
    "bandeira": "🇺🇸",
    "isInverted": false
  },
  "F2": {
    "date": "14/06/2026",
    "localTime": "20:00",
    "estadio": "Estádio BBVA",
    "cidade": "Monterrey",
    "fuso": "UTC-6",
    "pais": "México",
    "bandeira": "🇲🇽",
    "isInverted": false
  },
  "F3": {
    "date": "20/06/2026",
    "localTime": "12:00",
    "estadio": "NRG Stadium",
    "cidade": "Houston",
    "fuso": "UTC-5",
    "pais": "EUA",
    "bandeira": "🇺🇸",
    "isInverted": false
  },
  "F4": {
    "date": "20/06/2026",
    "localTime": "22:00",
    "estadio": "Estádio BBVA",
    "cidade": "Monterrey",
    "fuso": "UTC-6",
    "pais": "México",
    "bandeira": "🇲🇽",
    "isInverted": false
  },
  "F5": {
    "date": "25/06/2026",
    "localTime": "18:00",
    "estadio": "GEHA Field at Arrowhead",
    "cidade": "Kansas City",
    "fuso": "UTC-5",
    "pais": "EUA",
    "bandeira": "🇺🇸",
    "isInverted": false
  },
  "F6": {
    "date": "25/06/2026",
    "localTime": "18:00",
    "estadio": "AT&T Stadium",
    "cidade": "Dallas",
    "fuso": "UTC-5",
    "pais": "EUA",
    "bandeira": "🇺🇸",
    "isInverted": false
  },
  "G1": {
    "date": "15/06/2026",
    "localTime": "12:00",
    "estadio": "Lumen Field",
    "cidade": "Seattle",
    "fuso": "UTC-7",
    "pais": "EUA",
    "bandeira": "🇺🇸",
    "isInverted": false
  },
  "G2": {
    "date": "15/06/2026",
    "localTime": "18:00",
    "estadio": "SoFi Stadium",
    "cidade": "Los Angeles",
    "fuso": "UTC-7",
    "pais": "EUA",
    "bandeira": "🇺🇸",
    "isInverted": false
  },
  "G3": {
    "date": "21/06/2026",
    "localTime": "12:00",
    "estadio": "SoFi Stadium",
    "cidade": "Los Angeles",
    "fuso": "UTC-7",
    "pais": "EUA",
    "bandeira": "🇺🇸",
    "isInverted": false
  },
  "G4": {
    "date": "21/06/2026",
    "localTime": "18:00",
    "estadio": "BC Place",
    "cidade": "Vancouver",
    "fuso": "UTC-7",
    "pais": "Canadá",
    "bandeira": "🇨🇦",
    "isInverted": false
  },
  "G5": {
    "date": "26/06/2026",
    "localTime": "20:00",
    "estadio": "BC Place",
    "cidade": "Vancouver",
    "fuso": "UTC-7",
    "pais": "Canadá",
    "bandeira": "🇨🇦",
    "isInverted": false
  },
  "G6": {
    "date": "26/06/2026",
    "localTime": "20:00",
    "estadio": "Lumen Field",
    "cidade": "Seattle",
    "fuso": "UTC-7",
    "pais": "EUA",
    "bandeira": "🇺🇸",
    "isInverted": false
  },
  "H1": {
    "date": "15/06/2026",
    "localTime": "12:00",
    "estadio": "Mercedes-Benz Stadium",
    "cidade": "Atlanta",
    "fuso": "UTC-4",
    "pais": "EUA",
    "bandeira": "🇺🇸",
    "isInverted": false
  },
  "H2": {
    "date": "15/06/2026",
    "localTime": "18:00",
    "estadio": "Hard Rock Stadium",
    "cidade": "Miami",
    "fuso": "UTC-4",
    "pais": "EUA",
    "bandeira": "🇺🇸",
    "isInverted": false
  },
  "H3": {
    "date": "21/06/2026",
    "localTime": "12:00",
    "estadio": "Mercedes-Benz Stadium",
    "cidade": "Atlanta",
    "fuso": "UTC-4",
    "pais": "EUA",
    "bandeira": "🇺🇸",
    "isInverted": false
  },
  "H4": {
    "date": "21/06/2026",
    "localTime": "18:00",
    "estadio": "Hard Rock Stadium",
    "cidade": "Miami",
    "fuso": "UTC-4",
    "pais": "EUA",
    "bandeira": "🇺🇸",
    "isInverted": false
  },
  "H5": {
    "date": "26/06/2026",
    "localTime": "18:00",
    "estadio": "Estádio Akron",
    "cidade": "Guadalajara",
    "fuso": "UTC-6",
    "pais": "México",
    "bandeira": "🇲🇽",
    "isInverted": false
  },
  "H6": {
    "date": "26/06/2026",
    "localTime": "19:00",
    "estadio": "NRG Stadium",
    "cidade": "Houston",
    "fuso": "UTC-5",
    "pais": "EUA",
    "bandeira": "🇺🇸",
    "isInverted": false
  },
  "I1": {
    "date": "16/06/2026",
    "localTime": "15:00",
    "estadio": "MetLife Stadium",
    "cidade": "Nova York / Nova Jersey",
    "fuso": "UTC-4",
    "pais": "EUA",
    "bandeira": "🇺🇸",
    "isInverted": false
  },
  "I2": {
    "date": "16/06/2026",
    "localTime": "18:00",
    "estadio": "Gillette Stadium",
    "cidade": "Boston",
    "fuso": "UTC-4",
    "pais": "EUA",
    "bandeira": "🇺🇸",
    "isInverted": true
  },
  "I3": {
    "date": "26/06/2026",
    "localTime": "15:00",
    "estadio": "Gillette Stadium",
    "cidade": "Boston",
    "fuso": "UTC-4",
    "pais": "EUA",
    "bandeira": "🇺🇸",
    "isInverted": true
  },
  "I4": {
    "date": "26/06/2026",
    "localTime": "15:00",
    "estadio": "BMO Field",
    "cidade": "Toronto",
    "fuso": "UTC-4",
    "pais": "Canadá",
    "bandeira": "🇨🇦",
    "isInverted": true
  },
  "I5": {
    "date": "22/06/2026",
    "localTime": "17:00",
    "estadio": "Lincoln Financial Field",
    "cidade": "Philadelphia",
    "fuso": "UTC-4",
    "pais": "EUA",
    "bandeira": "🇺🇸",
    "isInverted": true
  },
  "I6": {
    "date": "22/06/2026",
    "localTime": "20:00",
    "estadio": "MetLife Stadium",
    "cidade": "Nova York / Nova Jersey",
    "fuso": "UTC-4",
    "pais": "EUA",
    "bandeira": "🇺🇸",
    "isInverted": true
  },
  "J1": {
    "date": "16/06/2026",
    "localTime": "20:00",
    "estadio": "GEHA Field at Arrowhead",
    "cidade": "Kansas City",
    "fuso": "UTC-5",
    "pais": "EUA",
    "bandeira": "🇺🇸",
    "isInverted": false
  },
  "J2": {
    "date": "16/06/2026",
    "localTime": "21:00",
    "estadio": "Levi's Stadium",
    "cidade": "São Francisco / Bay Area",
    "fuso": "UTC-7",
    "pais": "EUA",
    "bandeira": "🇺🇸",
    "isInverted": false
  },
  "J3": {
    "date": "22/06/2026",
    "localTime": "12:00",
    "estadio": "AT&T Stadium",
    "cidade": "Dallas",
    "fuso": "UTC-5",
    "pais": "EUA",
    "bandeira": "🇺🇸",
    "isInverted": false
  },
  "J4": {
    "date": "22/06/2026",
    "localTime": "20:00",
    "estadio": "Levi's Stadium",
    "cidade": "São Francisco / Bay Area",
    "fuso": "UTC-7",
    "pais": "EUA",
    "bandeira": "🇺🇸",
    "isInverted": false
  },
  "J5": {
    "date": "27/06/2026",
    "localTime": "21:00",
    "estadio": "AT&T Stadium",
    "cidade": "Dallas",
    "fuso": "UTC-5",
    "pais": "EUA",
    "bandeira": "🇺🇸",
    "isInverted": false
  },
  "J6": {
    "date": "27/06/2026",
    "localTime": "21:00",
    "estadio": "GEHA Field at Arrowhead",
    "cidade": "Kansas City",
    "fuso": "UTC-5",
    "pais": "EUA",
    "bandeira": "🇺🇸",
    "isInverted": false
  },
  "K1": {
    "date": "17/06/2026",
    "localTime": "12:00",
    "estadio": "NRG Stadium",
    "cidade": "Houston",
    "fuso": "UTC-5",
    "pais": "EUA",
    "bandeira": "🇺🇸",
    "isInverted": false
  },
  "K2": {
    "date": "17/06/2026",
    "localTime": "20:00",
    "estadio": "Estádio Azteca",
    "cidade": "Cidade do México",
    "fuso": "UTC-6",
    "pais": "México",
    "bandeira": "🇲🇽",
    "isInverted": false
  },
  "K3": {
    "date": "23/06/2026",
    "localTime": "12:00",
    "estadio": "NRG Stadium",
    "cidade": "Houston",
    "fuso": "UTC-5",
    "pais": "EUA",
    "bandeira": "🇺🇸",
    "isInverted": false
  },
  "K4": {
    "date": "23/06/2026",
    "localTime": "20:00",
    "estadio": "Estádio Akron",
    "cidade": "Guadalajara",
    "fuso": "UTC-6",
    "pais": "México",
    "bandeira": "🇲🇽",
    "isInverted": false
  },
  "K5": {
    "date": "27/06/2026",
    "localTime": "19:30",
    "estadio": "Hard Rock Stadium",
    "cidade": "Miami",
    "fuso": "UTC-4",
    "pais": "EUA",
    "bandeira": "🇺🇸",
    "isInverted": false
  },
  "K6": {
    "date": "27/06/2026",
    "localTime": "19:30",
    "estadio": "Mercedes-Benz Stadium",
    "cidade": "Atlanta",
    "fuso": "UTC-4",
    "pais": "EUA",
    "bandeira": "🇺🇸",
    "isInverted": false
  },
  "L1": {
    "date": "17/06/2026",
    "localTime": "15:00",
    "estadio": "AT&T Stadium",
    "cidade": "Dallas",
    "fuso": "UTC-5",
    "pais": "EUA",
    "bandeira": "🇺🇸",
    "isInverted": false
  },
  "L2": {
    "date": "17/06/2026",
    "localTime": "19:00",
    "estadio": "BMO Field",
    "cidade": "Toronto",
    "fuso": "UTC-4",
    "pais": "Canadá",
    "bandeira": "🇨🇦",
    "isInverted": true
  },
  "L3": {
    "date": "27/06/2026",
    "localTime": "17:00",
    "estadio": "MetLife Stadium",
    "cidade": "Nova York / Nova Jersey",
    "fuso": "UTC-4",
    "pais": "EUA",
    "bandeira": "🇺🇸",
    "isInverted": true
  },
  "L4": {
    "date": "27/06/2026",
    "localTime": "17:00",
    "estadio": "Lincoln Financial Field",
    "cidade": "Philadelphia",
    "fuso": "UTC-4",
    "pais": "EUA",
    "bandeira": "🇺🇸",
    "isInverted": true
  },
  "L5": {
    "date": "23/06/2026",
    "localTime": "16:00",
    "estadio": "Gillette Stadium",
    "cidade": "Boston",
    "fuso": "UTC-4",
    "pais": "EUA",
    "bandeira": "🇺🇸",
    "isInverted": true
  },
  "L6": {
    "date": "23/06/2026",
    "localTime": "19:00",
    "estadio": "BMO Field",
    "cidade": "Toronto",
    "fuso": "UTC-4",
    "pais": "Canadá",
    "bandeira": "🇨🇦",
    "isInverted": true
  }
};

export const getBrasiliaTime = (localTime, fusoSede) => {
  if (!localTime || !fusoSede) return "18:00";
  // fusoSede is a string like "UTC-4", "UTC-5", "UTC-6", "UTC-7"
  const fusoNum = parseInt(fusoSede.replace("UTC", "").trim(), 10); // ex: -4, -5, -6, -7
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
    
    // 6 matches per group templates
    const matchTemplates = [
      { id: `${groupKey}1`, home: teams[0].id, away: teams[1].id, round: "Rodada 1" },
      { id: `${groupKey}2`, home: teams[2].id, away: teams[3].id, round: "Rodada 1" },
      { id: `${groupKey}3`, home: teams[0].id, away: teams[2].id, round: "Rodada 2" },
      { id: `${groupKey}4`, home: teams[3].id, away: teams[1].id, round: "Rodada 2" },
      { id: `${groupKey}5`, home: teams[3].id, away: teams[0].id, round: "Rodada 3" },
      { id: `${groupKey}6`, home: teams[1].id, away: teams[2].id, round: "Rodada 3" }
    ];

    matches[groupKey] = matchTemplates.map(tmpl => {
      const sched = GROUP_SCHEDULES_MAP[tmpl.id];
      if (!sched) {
        console.error("Schedule not found for match", tmpl.id);
      }
      
      return {
        id: tmpl.id,
        home: tmpl.home,
        away: tmpl.away,
        scoreHome: "",
        scoreAway: "",
        round: tmpl.round,
        date: sched ? sched.date : "A definir",
        localTime: sched ? sched.localTime : "18:00",
        estadio: sched ? sched.estadio : "A definir",
        cidade: sched ? sched.cidade : "A definir",
        fuso: sched ? sched.fuso : "UTC-5",
        pais: sched ? sched.pais : "A definir",
        bandeira: sched ? sched.bandeira : "🏳️"
      };
    });
  });
  
  return matches;
};
