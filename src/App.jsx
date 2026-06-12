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
import { TEAM_RATINGS, INITIAL_GROUPS_DATA, TEAM_PLAYERS } from './data/teams';
import { generateInitialMatches, getBrasiliaTime } from './data/matches';
import { supabase, isSupabaseConfigured } from './lib/supabase';

// FIFA 3-letter codes mapped to FlagCDN 2-letter ISO codes for high-quality SVG country flags
const FIFA_TO_ISO = {
  MEX: "mx", RSA: "za", KOR: "kr", CZE: "cz",
  CAN: "ca", BIH: "ba", QAT: "qa", SUI: "ch",
  BRA: "br", MAR: "ma", HAI: "ht", SCO: "gb-sct",
  USA: "us", PAR: "py", AUS: "au", TUR: "tr",
  GER: "de", CUW: "cw", CIV: "ci", ECU: "ec",
  NED: "nl", JPN: "jp", SWE: "se", TUN: "tn",
  BEL: "be", EGY: "eg", IRN: "ir", NZL: "nz",
  ESP: "es", CPV: "cv", KSA: "sa", URU: "uy",
  FRA: "fr", SEN: "sn", NOR: "no", IRQ: "iq",
  ARG: "ar", ALG: "dz", AUT: "at", JOR: "jo",
  POR: "pt", COD: "cd", UZB: "uz", COL: "co",
  ENG: "gb-eng", CRO: "hr", PAN: "pa", GHA: "gh"
};

// Schedule, venue and timezone mapping for World Cup 2026 knockout stage matches
const KNOCKOUT_SCHEDULE_DATA = {
  "R32-1": { date: "28/06/2026", localTime: "18:00", estadio: "SoFi Stadium", cidade: "Los Angeles", fuso: "UTC-7", pais: "EUA", bandeira: "🇺🇸" },
  "R32-2": { date: "28/06/2026", localTime: "19:00", estadio: "AT&T Stadium", cidade: "Dallas", fuso: "UTC-5", pais: "EUA", bandeira: "🇺🇸" },
  "R32-3": { date: "28/06/2026", localTime: "15:00", estadio: "MetLife Stadium", cidade: "Nova York / Nova Jersey", fuso: "UTC-4", pais: "EUA", bandeira: "🇺🇸" },
  "R32-4": { date: "29/06/2026", localTime: "17:00", estadio: "BC Place", cidade: "Vancouver", fuso: "UTC-7", pais: "Canadá", bandeira: "🇨🇦" },
  "R32-5": { date: "29/06/2026", localTime: "18:00", estadio: "Estádio Azteca", cidade: "Cidade do México", fuso: "UTC-6", pais: "México", bandeira: "🇲🇽" },
  "R32-6": { date: "29/06/2026", localTime: "19:00", estadio: "Mercedes-Benz Stadium", cidade: "Atlanta", fuso: "UTC-4", pais: "EUA", bandeira: "🇺🇸" },
  "R32-7": { date: "30/06/2026", localTime: "16:00", estadio: "Hard Rock Stadium", cidade: "Miami", fuso: "UTC-4", pais: "EUA", bandeira: "🇺🇸" },
  "R32-8": { date: "30/06/2026", localTime: "15:00", estadio: "Gillette Stadium", cidade: "Boston", fuso: "UTC-4", pais: "EUA", bandeira: "🇺🇸" },
  "R32-9": { date: "30/06/2026", localTime: "18:00", estadio: "NRG Stadium", cidade: "Houston", fuso: "UTC-5", pais: "EUA", bandeira: "🇺🇸" },
  "R32-10": { date: "01/07/2026", localTime: "17:00", estadio: "Levi's Stadium", cidade: "São Francisco / Bay Area", fuso: "UTC-7", pais: "EUA", bandeira: "🇺🇸" },
  "R32-11": { date: "01/07/2026", localTime: "19:00", estadio: "Lumen Field", cidade: "Seattle", fuso: "UTC-7", pais: "EUA", bandeira: "🇺🇸" },
  "R32-12": { date: "01/07/2026", localTime: "15:00", estadio: "Lincoln Financial Field", cidade: "Philadelphia", fuso: "UTC-4", pais: "EUA", bandeira: "🇺🇸" },
  "R32-13": { date: "02/07/2026", localTime: "18:00", estadio: "GEHA Field at Arrowhead", cidade: "Kansas City", fuso: "UTC-5", pais: "EUA", bandeira: "🇺🇸" },
  "R32-14": { date: "02/07/2026", localTime: "17:00", estadio: "BMO Field", cidade: "Toronto", fuso: "UTC-4", pais: "Canadá", bandeira: "🇨🇦" },
  "R32-15": { date: "03/07/2026", localTime: "19:00", estadio: "Estádio BBVA", cidade: "Monterrey", fuso: "UTC-6", pais: "México", bandeira: "🇲🇽" },
  "R32-16": { date: "03/07/2026", localTime: "18:00", estadio: "Estádio Akron", cidade: "Guadalajara", fuso: "UTC-6", pais: "México", bandeira: "🇲🇽" },
  
  "R16-1": { date: "04/07/2026", localTime: "16:00", estadio: "Lincoln Financial Field", cidade: "Philadelphia", fuso: "UTC-4", pais: "EUA", bandeira: "🇺🇸" },
  "R16-2": { date: "04/07/2026", localTime: "19:00", estadio: "NRG Stadium", cidade: "Houston", fuso: "UTC-5", pais: "EUA", bandeira: "🇺🇸" },
  "R16-3": { date: "05/07/2026", localTime: "15:00", estadio: "MetLife Stadium", cidade: "Nova York / Nova Jersey", fuso: "UTC-4", pais: "EUA", bandeira: "🇺🇸" },
  "R16-4": { date: "05/07/2026", localTime: "17:00", estadio: "Estádio Azteca", cidade: "Cidade do México", fuso: "UTC-6", pais: "México", bandeira: "🇲🇽" },
  "R16-5": { date: "06/07/2026", localTime: "18:00", estadio: "Lumen Field", cidade: "Seattle", fuso: "UTC-7", pais: "EUA", bandeira: "🇺🇸" },
  "R16-6": { date: "06/07/2026", localTime: "19:00", estadio: "BC Place", cidade: "Vancouver", fuso: "UTC-7", pais: "Canadá", bandeira: "🇨🇦" },
  "R16-7": { date: "07/07/2026", localTime: "16:00", estadio: "Mercedes-Benz Stadium", cidade: "Atlanta", fuso: "UTC-4", pais: "EUA", bandeira: "🇺🇸" },
  "R16-8": { date: "07/07/2026", localTime: "17:00", estadio: "Gillette Stadium", cidade: "Boston", fuso: "UTC-4", pais: "EUA", bandeira: "🇺🇸" },
  
  "QF-1": { date: "09/07/2026", localTime: "18:00", estadio: "Gillette Stadium", cidade: "Boston", fuso: "UTC-4", pais: "EUA", bandeira: "🇺🇸" },
  "QF-2": { date: "10/07/2026", localTime: "17:00", estadio: "SoFi Stadium", cidade: "Los Angeles", fuso: "UTC-7", pais: "EUA", bandeira: "🇺🇸" },
  "QF-3": { date: "11/07/2026", localTime: "15:00", estadio: "Hard Rock Stadium", cidade: "Miami", fuso: "UTC-4", pais: "EUA", bandeira: "🇺🇸" },
  "QF-4": { date: "11/07/2026", localTime: "19:00", estadio: "GEHA Field at Arrowhead", cidade: "Kansas City", fuso: "UTC-5", pais: "EUA", bandeira: "🇺🇸" },
  
  "SF-1": { date: "14/07/2026", localTime: "19:00", estadio: "AT&T Stadium", cidade: "Dallas", fuso: "UTC-5", pais: "EUA", bandeira: "🇺🇸" },
  "SF-2": { date: "15/07/2026", localTime: "19:00", estadio: "Mercedes-Benz Stadium", cidade: "Atlanta", fuso: "UTC-4", pais: "EUA", bandeira: "🇺🇸" },
  
  "T3-1": { date: "18/07/2026", localTime: "16:00", estadio: "Hard Rock Stadium", cidade: "Miami", fuso: "UTC-4", pais: "EUA", bandeira: "🇺🇸" },
  "FI-1": { date: "19/07/2026", localTime: "16:00", estadio: "MetLife Stadium", cidade: "Nova York / Nova Jersey", fuso: "UTC-4", pais: "EUA", bandeira: "🇺🇸" }
};

const enrichKnockoutMatch = (match) => {
  const sched = KNOCKOUT_SCHEDULE_DATA[match.id];
  if (!sched) return match;
  return { ...match, ...sched };
};

const enrichKnockoutState = (koState) => {
  if (!koState) return koState;
  const enriched = {};
  Object.keys(koState).forEach(stage => {
    enriched[stage] = koState[stage].map(enrichKnockoutMatch);
  });
  return enriched;
};

// Reusable flag component that renders a high-res SVG image
function TeamFlag({ teamId, className = "w-5 h-3.5 object-cover rounded shadow-xs inline-block align-middle mr-1.5" }) {
  if (!teamId) return <span className="inline-block mr-1 text-xs">🏳️</span>;
  const iso = FIFA_TO_ISO[teamId];
  if (!iso) {
    // If it's a placeholder (like "1º Grupo A") rather than a 3-letter FIFA code
    return <span className="inline-block mr-1 text-xs">🏳️</span>;
  }
  return (
    <img 
      src={`https://flagcdn.com/w40/${iso}.png`} 
      alt={teamId}
      className={className}
      loading="lazy"
      onError={(e) => {
        e.target.onerror = null;
        e.target.src = "https://flagcdn.com/w40/un.png";
      }}
    />
  );
}

// Hook for swipe-down-to-close gesture on bottom sheets / modals
function useSwipeToClose(isOpen, onClose) {
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);

  const touchStartY = useRef(0);
  const touchStartX = useRef(0);
  const activeScrollEl = useRef(null);
  const isScrollTop = useRef(true);
  const draggingRef = useRef(false);
  const dragYRef = useRef(0);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) {
      setDragY(0);
      setIsDragging(false);
      draggingRef.current = false;
      dragYRef.current = 0;
      return;
    }

    const container = containerRef.current;
    if (!container) return;

    const handleTouchStart = (e) => {
      const touch = e.touches[0];
      touchStartY.current = touch.clientY;
      touchStartX.current = touch.clientX;
      draggingRef.current = false;
      dragYRef.current = 0;
      
      let el = e.target;
      let foundScroll = null;
      while (el && el !== container) {
        const style = window.getComputedStyle(el);
        if (style.overflowY === 'auto' || style.overflowY === 'scroll') {
          foundScroll = el;
          break;
        }
        el = el.parentElement;
      }
      activeScrollEl.current = foundScroll;
      isScrollTop.current = foundScroll ? foundScroll.scrollTop <= 0 : true;
    };

    const handleTouchMove = (e) => {
      const touch = e.touches[0];
      const diffY = touch.clientY - touchStartY.current;
      const diffX = touch.clientX - touchStartX.current;

      if (activeScrollEl.current) {
        isScrollTop.current = activeScrollEl.current.scrollTop <= 0;
      }

      if (draggingRef.current) {
        if (e.cancelable) e.preventDefault();
        const val = Math.max(0, diffY);
        dragYRef.current = val;
        setDragY(val);
      } else if (diffY > 8 && Math.abs(diffY) > Math.abs(diffX) && isScrollTop.current) {
        draggingRef.current = true;
        setIsDragging(true);
        if (e.cancelable) e.preventDefault();
        const val = Math.max(0, diffY);
        dragYRef.current = val;
        setDragY(val);
      }
    };

    const handleTouchEnd = () => {
      if (draggingRef.current) {
        if (dragYRef.current > 120) {
          onCloseRef.current();
        }
        setDragY(0);
        setIsDragging(false);
        draggingRef.current = false;
        dragYRef.current = 0;
      }
    };

    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isOpen]);

  return {
    containerRef,
    dragY,
    isDragging
  };
}

// Calendar Event Helper Functions
const getUTCDateTime = (dateStr, timeStr, fusoStr) => {
  if (!dateStr || !timeStr) return new Date();
  const [day, month, year] = dateStr.split("/").map(Number);
  const [hour, minute] = timeStr.split(":").map(Number);
  
  let offsetHours = 3; // Default offset is Brasília (UTC-3), so +3 to get to UTC
  if (fusoStr && fusoStr.startsWith("UTC")) {
    const offsetPart = fusoStr.replace("UTC", "").trim();
    if (offsetPart) {
      offsetHours = -parseInt(offsetPart, 10);
    } else {
      offsetHours = 0;
    }
  }
  return new Date(Date.UTC(year, month - 1, day, hour + offsetHours, minute));
};

const getBrasiliaDateTimeParts = (dateStr, timeStr, fusoStr) => {
  const utcDate = getUTCDateTime(dateStr, timeStr, fusoStr);
  
  // Format in America/Sao_Paulo timezone
  const formatterDate = new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });
  
  const formatterTime = new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  });
  
  return {
    date: formatterDate.format(utcDate),
    time: formatterTime.format(utcDate)
  };
};

const getBrasiliaTodayStr = () => {
  const formatter = new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });
  return formatter.format(new Date());
};

const getBrasiliaTomorrowStr = () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const formatter = new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });
  return formatter.format(tomorrow);
};

const formatFriendlyDate = (dateStr, todayStr, tomorrowStr) => {
  if (dateStr === todayStr) return "Hoje";
  if (dateStr === tomorrowStr) return "Amanhã";
  
  const [day, month, year] = dateStr.split("/").map(Number);
  const dateObj = new Date(year, month - 1, day);
  
  const weekdays = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];
  const months = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
  
  const weekday = weekdays[dateObj.getDay()];
  const monthName = months[dateObj.getMonth()];
  
  return `${weekday}, ${day} de ${monthName}`;
};

const formatUTCForCalendar = (dateObj) => {
  const pad = (n) => String(n).padStart(2, '0');
  const y = dateObj.getUTCFullYear();
  const m = pad(dateObj.getUTCMonth() + 1);
  const d = pad(dateObj.getUTCDate());
  const h = pad(dateObj.getUTCHours());
  const min = pad(dateObj.getUTCMinutes());
  const s = pad(dateObj.getUTCSeconds());
  return `${y}${m}${d}T${h}${min}${s}Z`;
};

const generateGoogleCalendarUrl = (match, homeName, awayName) => {
  const startObj = getUTCDateTime(match.date, match.localTime, match.fuso);
  const endObj = new Date(startObj.getTime() + 2 * 60 * 60 * 1000); // 2 hours duration
  
  const dates = `${formatUTCForCalendar(startObj)}/${formatUTCForCalendar(endObj)}`;
  const title = encodeURIComponent(`Copa 2026: ${homeName} x ${awayName}`);
  const details = encodeURIComponent(
    `Jogo da Copa do Mundo 2026\nFase: ${match.stageName}\nEstádio: ${match.estadio}\nCidade: ${match.cidade}`
  );
  const location = encodeURIComponent(`${match.estadio}, ${match.cidade}, ${match.pais}`);
  
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&details=${details}&location=${location}`;
};

const downloadIcsFile = (match, homeName, awayName) => {
  const startObj = getUTCDateTime(match.date, match.localTime, match.fuso);
  const endObj = new Date(startObj.getTime() + 2 * 60 * 60 * 1000);
  
  const startStr = formatUTCForCalendar(startObj);
  const endStr = formatUTCForCalendar(endObj);
  
  const title = `Copa 2026: ${homeName} x ${awayName}`;
  const description = `Jogo da Copa do Mundo 2026\\nFase: ${match.stageName}\\nEstádio: ${match.estadio}\\nCidade: ${match.cidade}`;
  const location = `${match.estadio}, ${match.cidade}, ${match.pais}`;
  
  const icsLines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Antigravity Copa 2026//NONSGML v1.0//PT",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `DTSTART:${startStr}`,
    `DTEND:${endStr}`,
    `SUMMARY:${title}`,
    `DESCRIPTION:${description}`,
    `LOCATION:${location}`,
    `UID:match-2026-${match.id}@copa2026.app`,
    "SEQUENCE:0",
    "STATUS:CONFIRMED",
    "TRANSP:OPAQUE",
    "END:VEVENT",
    "END:VCALENDAR"
  ];
  
  const icsString = icsLines.join("\r\n");
  const blob = new Blob([icsString], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement("a");
  link.href = url;
  link.download = `jogo_${match.id}_${homeName.replace(/\s+/g, '_')}_x_${awayName.replace(/\s+/g, '_')}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export default function App() {
  const [activeTab, setActiveTab] = useState(() => {
    try {
      return localStorage.getItem("copa2026_activeTab") || "grupos";
    } catch (e) {
      return "grupos";
    }
  }); // "grupos" | "calendario" | "matamata" | "estatisticas" | "sedes"
  const [groupMatches, setGroupMatches] = useState(generateInitialMatches);
  const [searchTerm, setSearchTerm] = useState("");
  const [calendarStageFilter, setCalendarStageFilter] = useState("all");
  const [calendarStatusFilter, setCalendarStatusFilter] = useState("all");
  const [activeCalendarMenu, setActiveCalendarMenu] = useState(null);
  const [expandedGroup, setExpandedGroup] = useState(() => {
    try {
      return localStorage.getItem("copa2026_expandedGroup") || "A";
    } catch (e) {
      return "A";
    }
  });
  const [isSimulating, setIsSimulating] = useState(false);
  const [isDbSyncing, setIsDbSyncing] = useState(false);
  const [isTableFlipped, setIsTableFlipped] = useState(false);
  
  // Custom simulation and admin states
  const [isSimulationMode, setIsSimulationMode] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [officialGroupMatches, setOfficialGroupMatches] = useState(null);
  const [officialKnockoutMatches, setOfficialKnockoutMatches] = useState(null);
  const [slideDirection, setSlideDirection] = useState("right"); // "right" | "left"

  // Refs and arrow states for scroll indicators
  const groupScrollRef = useRef(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const handleGroupScroll = () => {
    if (groupScrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = groupScrollRef.current;
      setShowLeftArrow(scrollLeft > 10);
      setShowRightArrow(scrollLeft + clientWidth < scrollWidth - 10);
    }
  };

  const koScrollRef = useRef(null);
  const [showKoLeft, setShowKoLeft] = useState(false);
  const [showKoRight, setShowKoRight] = useState(true);

  const handleKoScroll = () => {
    if (koScrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = koScrollRef.current;
      setShowKoLeft(scrollLeft > 10);
      setShowKoRight(scrollLeft + clientWidth < scrollWidth - 10);
    }
  };
  
  // State for active match editing in Bottom Sheet / Modal
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [editingScoreHome, setEditingScoreHome] = useState("");
  const [editingScoreAway, setEditingScoreAway] = useState("");
  const [editingPenHome, setEditingPenHome] = useState("");
  const [editingPenAway, setEditingPenAway] = useState("");
  
  // Touch gestures for swipe detection
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const touchStartY = useRef(0);
  const touchEndY = useRef(0);

  // Active knockout phase selection for mobile swipe layout
  const [activeKnockoutPhase, setActiveKnockoutPhase] = useState(() => {
    try {
      return localStorage.getItem("copa2026_activeKnockoutPhase") || "R32";
    } catch (e) {
      return "R32";
    }
  });
  const [selectedTeam, setSelectedTeam] = useState(null);
  const mobileKoScrollContainerRef = useRef(null);
  const [isScrollingProgrammatically, setIsScrollingProgrammatically] = useState(false);

  // Swipe-to-close modal hook instances
  const matchSwipe = useSwipeToClose(!!selectedMatch, () => setSelectedMatch(null));
  const teamSwipe = useSwipeToClose(!!selectedTeam, () => setSelectedTeam(null));

  // Mobile horizontal scroll-snap states and sync for groups
  const mobileGroupScrollContainerRef = useRef(null);
  const isScrollingGroupProgrammaticallyRef = useRef(false);

  const visibleGroups = useMemo(() => {
    const allGroupKeys = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];
    if (!searchTerm.trim()) return allGroupKeys;
    const query = searchTerm.toLowerCase().trim();
    return allGroupKeys.filter(groupKey => {
      const group = INITIAL_GROUPS_DATA[groupKey];
      return group.teams.some(team => 
        team.name.toLowerCase().includes(query)
      );
    });
  }, [searchTerm]);

  const handleMobileGroupScroll = () => {
    if (isScrollingGroupProgrammaticallyRef.current) return;
    const container = mobileGroupScrollContainerRef.current;
    if (!container) return;

    const scrollLeft = container.scrollLeft;
    const containerWidth = container.clientWidth;
    if (containerWidth === 0) return;

    const index = Math.round(scrollLeft / containerWidth);
    if (index >= 0 && index < visibleGroups.length) {
      const currentGroup = visibleGroups[index];
      if (expandedGroup !== currentGroup) {
        setExpandedGroup(currentGroup);
        
        // Scroll the quick pills tab buttons to keep the active one in view
        if (groupScrollRef.current) {
          const tabButton = groupScrollRef.current.children[index];
          if (tabButton) {
            tabButton.scrollIntoView({
              behavior: "smooth",
              block: "nearest",
              inline: "center"
            });
          }
        }
      }
    }
  };

  const scrollToGroupColumn = (groupId) => {
    setExpandedGroup(groupId);
    const container = mobileGroupScrollContainerRef.current;
    if (!container) return;

    const index = visibleGroups.indexOf(groupId);
    if (index !== -1) {
      isScrollingGroupProgrammaticallyRef.current = true;
      const containerWidth = container.clientWidth;
      container.scrollTo({
        left: index * containerWidth,
        behavior: "smooth"
      });
      
      setTimeout(() => {
        isScrollingGroupProgrammaticallyRef.current = false;
      }, 500);
    }
  };

  // Save navigation states to localStorage for persistence across reloads (F5)
  useEffect(() => {
    try {
      localStorage.setItem("copa2026_activeTab", activeTab);
    } catch (e) {
      console.warn("Failed to save activeTab to localStorage:", e);
    }
  }, [activeTab]);

  useEffect(() => {
    try {
      localStorage.setItem("copa2026_expandedGroup", expandedGroup);
    } catch (e) {
      console.warn("Failed to save expandedGroup to localStorage:", e);
    }
  }, [expandedGroup]);

  useEffect(() => {
    try {
      localStorage.setItem("copa2026_activeKnockoutPhase", activeKnockoutPhase);
    } catch (e) {
      console.warn("Failed to save activeKnockoutPhase to localStorage:", e);
    }
  }, [activeKnockoutPhase]);

  // Auto-focus the first matching group when searching
  useEffect(() => {
    if (activeTab === "grupos" && searchTerm.trim() !== "") {
      const matchQuery = searchTerm.toLowerCase();
      const firstMatchingGroupKey = Object.keys(INITIAL_GROUPS_DATA).find(groupKey =>
        INITIAL_GROUPS_DATA[groupKey].teams.some(team =>
          team.name.toLowerCase().includes(matchQuery)
        )
      );
      if (firstMatchingGroupKey) {
        const currentGroupMatches = INITIAL_GROUPS_DATA[expandedGroup]?.teams.some(team =>
          team.name.toLowerCase().includes(matchQuery)
        );
        if (!currentGroupMatches) {
          setExpandedGroup(firstMatchingGroupKey);
        }
      }
    }
  }, [activeTab, searchTerm, expandedGroup]);

  // Sync scroll position of groups container when activeTab, expandedGroup or searchTerm changes
  useEffect(() => {
    if (activeTab === "grupos" && mobileGroupScrollContainerRef.current) {
      const index = visibleGroups.indexOf(expandedGroup);
      if (index !== -1) {
        const timer = setTimeout(() => {
          const container = mobileGroupScrollContainerRef.current;
          if (container) {
            const containerWidth = container.clientWidth;
            if (containerWidth > 0 && Math.abs(container.scrollLeft - index * containerWidth) > 5) {
              isScrollingGroupProgrammaticallyRef.current = true;
              container.scrollLeft = index * containerWidth;
              setTimeout(() => {
                isScrollingGroupProgrammaticallyRef.current = false;
              }, 150);
            }
          }
        }, 50);
        return () => clearTimeout(timer);
      }
    }
  }, [activeTab, expandedGroup, searchTerm, visibleGroups]);

  // Lock body scroll when a modal is open to prevent background page from scrolling
  useEffect(() => {
    if (selectedMatch || selectedTeam) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [selectedMatch, selectedTeam]);

  // Close calendar menu when clicking outside
  useEffect(() => {
    const handleOutsideClick = () => {
      setActiveCalendarMenu(null);
    };
    document.addEventListener("click", handleOutsideClick);
    return () => {
      document.removeEventListener("click", handleOutsideClick);
    };
  }, []);

  const handleMobileKoScroll = () => {
    if (isScrollingProgrammatically) return;
    const container = mobileKoScrollContainerRef.current;
    if (!container) return;

    const scrollLeft = container.scrollLeft;
    const containerWidth = container.clientWidth;
    if (containerWidth === 0) return;

    const index = Math.round(scrollLeft / containerWidth);
    const phases = ["R32", "R16", "QF", "SF", "FI"];
    if (index >= 0 && index < phases.length) {
      const currentPhase = phases[index];
      if (activeKnockoutPhase !== currentPhase) {
        setActiveKnockoutPhase(currentPhase);
        
        // Also scroll the mobile tab buttons to keep the active one in view
        if (koScrollRef.current) {
          const tabButton = koScrollRef.current.children[index];
          if (tabButton) {
            tabButton.scrollIntoView({
              behavior: "smooth",
              block: "nearest",
              inline: "center"
            });
          }
        }
      }
    }
  };

  const scrollToKoColumn = (phaseId) => {
    setActiveKnockoutPhase(phaseId);
    const container = mobileKoScrollContainerRef.current;
    if (!container) return;

    const phases = ["R32", "R16", "QF", "SF", "FI"];
    const index = phases.indexOf(phaseId);
    if (index !== -1) {
      setIsScrollingProgrammatically(true);
      const containerWidth = container.clientWidth;
      container.scrollTo({
        left: index * containerWidth,
        behavior: "smooth"
      });
      
      // Reset the block flag after the animation completes
      setTimeout(() => {
        setIsScrollingProgrammatically(false);
      }, 450);
    }
  };

  // Sync scroll position of knockout container when tab activeTab or activeKnockoutPhase changes
  useEffect(() => {
    if (activeTab === "matamata" && mobileKoScrollContainerRef.current) {
      const phases = ["R32", "R16", "QF", "SF", "FI"];
      const index = phases.indexOf(activeKnockoutPhase);
      if (index !== -1) {
        setTimeout(() => {
          const container = mobileKoScrollContainerRef.current;
          if (container) {
            container.scrollLeft = index * container.clientWidth;
          }
        }, 50);
      }
    }
  }, [activeTab, activeKnockoutPhase]);

  // Knockout stage matches structure
  const [knockoutMatches, setKnockoutMatches] = useState({
    R32: Array.from({ length: 16 }, (_, i) => enrichKnockoutMatch({
      id: `R32-${i + 1}`, home: null, away: null, scoreHome: "", scoreAway: "", penHome: "", penAway: ""
    })),
    R16: Array.from({ length: 8 }, (_, i) => enrichKnockoutMatch({
      id: `R16-${i + 1}`, home: null, away: null, scoreHome: "", scoreAway: "", penHome: "", penAway: ""
    })),
    QF: Array.from({ length: 4 }, (_, i) => enrichKnockoutMatch({
      id: `QF-${i + 1}`, home: null, away: null, scoreHome: "", scoreAway: "", penHome: "", penAway: ""
    })),
    SF: Array.from({ length: 2 }, (_, i) => enrichKnockoutMatch({
      id: `SF-${i + 1}`, home: null, away: null, scoreHome: "", scoreAway: "", penHome: "", penAway: ""
    })),
    T3: [enrichKnockoutMatch({ id: "T3-1", home: null, away: null, scoreHome: "", scoreAway: "", penHome: "", penAway: "" })],
    FI: [enrichKnockoutMatch({ id: "FI-1", home: null, away: null, scoreHome: "", scoreAway: "", penHome: "", penAway: "" })]
  });

  const teamMap = useMemo(() => {
    const map = {};
    Object.entries(INITIAL_GROUPS_DATA).forEach(([groupKey, group]) => {
      group.teams.forEach(team => {
        map[team.id] = { ...team, groupKey };
      });
    });
    return map;
  }, []);

  const R32_PLACEHOLDERS = useMemo(() => [
    { home: "1º Grupo A", away: "3º Colocado Rank 1" },
    { home: "2º Grupo B", away: "2º Grupo C" },
    { home: "1º Grupo C", away: "3º Colocado Rank 2" },
    { home: "2º Grupo D", away: "2º Grupo E" },
    { home: "1º Grupo E", away: "3º Colocado Rank 3" },
    { home: "2º Grupo F", away: "2º Grupo G" },
    { home: "1º Grupo G", away: "3º Colocado Rank 4" },
    { home: "2º Grupo H", away: "2º Grupo I" },
    { home: "1º Grupo I", away: "3º Colocado Rank 5" },
    { home: "2º Grupo J", away: "2º Grupo K" },
    { home: "1º Grupo K", away: "3º Colocado Rank 6" },
    { home: "2º Grupo L", away: "2º Grupo A" },
    { home: "1º Grupo B", away: "3º Colocado Rank 7" },
    { home: "1º Grupo D", away: "3º Colocado Rank 8" },
    { home: "1º Grupo F", away: "1º Grupo H" },
    { home: "1º Grupo J", away: "1º Grupo L" }
  ], []);

  const getPlaceholderName = (matchId, role) => {
    const parts = matchId.split("-");
    const stage = parts[0];
    const idx = parseInt(parts[1], 10) - 1;
    
    if (stage === "R32") {
      const ph = R32_PLACEHOLDERS[idx];
      return ph ? ph[role] : role === "home" ? "Equipe A" : "Equipe B";
    }
    if (stage === "R16") {
      const matchNum = idx * 2 + (role === "home" ? 1 : 2);
      return `Vencedor R32-${matchNum}`;
    }
    if (stage === "QF") {
      const matchNum = idx * 2 + (role === "home" ? 1 : 2);
      return `Vencedor Oitavas ${matchNum}`;
    }
    if (stage === "SF") {
      const matchNum = idx * 2 + (role === "home" ? 1 : 2);
      return `Vencedor Quartas ${matchNum}`;
    }
    if (stage === "T3") {
      return role === "home" ? "Perdedor Semifinal 1" : "Perdedor Semifinal 2";
    }
    if (stage === "FI") {
      return role === "home" ? "Vencedor Semifinal 1" : "Vencedor Semifinal 2";
    }
    return role === "home" ? "Equipe A" : "Equipe B";
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (document.activeElement) {
      document.activeElement.blur();
    }
    
    if (activeTab === "grupos") {
      const matchQuery = searchTerm.toLowerCase().trim();
      if (!matchQuery) return;
      
      const firstMatchingGroupKey = Object.keys(INITIAL_GROUPS_DATA).find(groupKey =>
        INITIAL_GROUPS_DATA[groupKey].teams.some(team =>
          team.name.toLowerCase().includes(matchQuery)
        )
      );
      
      if (firstMatchingGroupKey) {
        setExpandedGroup(firstMatchingGroupKey);
        setTimeout(() => {
          const element = document.getElementById("active-group-details-section");
          if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        }, 100);
      }
    } else if (activeTab === "calendario") {
      const matchQuery = searchTerm.toLowerCase().trim();
      if (!matchQuery) return;
      
      setTimeout(() => {
        const highlightedMatch = document.querySelector(".match-card-highlighted");
        if (highlightedMatch) {
          highlightedMatch.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 100);
    }
  };

  const bolaoStats = useMemo(() => {
    let totalPoints = 0;
    let exactCount = 0;
    let outcomeCount = 0;
    let wrongCount = 0;
    let matchesCompared = 0;

    if (!isSimulationMode || !officialGroupMatches) {
      return { totalPoints, exactCount, outcomeCount, wrongCount, matchesCompared };
    }

    // 1. Compare Group Matches
    Object.keys(groupMatches).forEach(groupKey => {
      const simGroup = groupMatches[groupKey] || [];
      const realGroup = officialGroupMatches[groupKey] || [];

      simGroup.forEach((simMatch, idx) => {
        const realMatch = realGroup[idx];
        if (!realMatch) return;

        const hasRealScore = realMatch.scoreHome !== "" && realMatch.scoreAway !== "";
        const hasSimScore = simMatch.scoreHome !== "" && simMatch.scoreAway !== "";

        if (hasRealScore && hasSimScore) {
          const simHome = parseInt(simMatch.scoreHome, 10);
          const simAway = parseInt(simMatch.scoreAway, 10);
          const realHome = parseInt(realMatch.scoreHome, 10);
          const realAway = parseInt(realMatch.scoreAway, 10);

          if (isNaN(simHome) || isNaN(simAway) || isNaN(realHome) || isNaN(realAway)) return;

          matchesCompared++;
          if (simHome === realHome && simAway === realAway) {
            totalPoints += 3;
            exactCount++;
          } else {
            const simOutcome = Math.sign(simHome - simAway);
            const realOutcome = Math.sign(realHome - realAway);
            if (simOutcome === realOutcome) {
              totalPoints += 1;
              outcomeCount++;
            } else {
              wrongCount++;
            }
          }
        }
      });
    });

    // 2. Compare Knockout Matches
    if (officialKnockoutMatches && knockoutMatches) {
      Object.keys(knockoutMatches).forEach(stageKey => {
        const simStage = knockoutMatches[stageKey] || [];
        const realStage = officialKnockoutMatches[stageKey] || [];

        simStage.forEach((simMatch) => {
          const realMatch = realStage.find(m => m.id === simMatch.id);
          if (!realMatch) return;

          const hasRealScore = realMatch.scoreHome !== "" && realMatch.scoreAway !== "";
          const hasSimScore = simMatch.scoreHome !== "" && simMatch.scoreAway !== "";
          const teamsMatch = simMatch.home && simMatch.away && simMatch.home === realMatch.home && simMatch.away === realMatch.away;

          if (hasRealScore && hasSimScore && teamsMatch) {
            const simHome = parseInt(simMatch.scoreHome, 10);
            const simAway = parseInt(simMatch.scoreAway, 10);
            const realHome = parseInt(realMatch.scoreHome, 10);
            const realAway = parseInt(realMatch.scoreAway, 10);

            if (isNaN(simHome) || isNaN(simAway) || isNaN(realHome) || isNaN(realAway)) return;

            matchesCompared++;
            if (simHome === realHome && simAway === realAway) {
              totalPoints += 3;
              exactCount++;
            } else {
              const simOutcome = Math.sign(simHome - simAway);
              const realOutcome = Math.sign(realHome - realAway);
              if (simOutcome === realOutcome) {
                totalPoints += 1;
                outcomeCount++;
              } else {
                wrongCount++;
              }
            }
          }
        });
      });
    }

    return { totalPoints, exactCount, outcomeCount, wrongCount, matchesCompared };
  }, [isSimulationMode, groupMatches, knockoutMatches, officialGroupMatches, officialKnockoutMatches]);

  const allMatches = useMemo(() => {
    const list = [];

    // Add all Group matches
    Object.keys(groupMatches).forEach(groupKey => {
      groupMatches[groupKey].forEach(match => {
        list.push({
          ...match,
          isKnockout: false,
          stageName: `Grupo ${groupKey}`,
          stageKey: "group",
          groupKey
        });
      });
    });

    // Add all Knockout matches
    const stageNames = {
      R32: "32-avos de Final",
      R16: "Oitavas de Final",
      QF: "Quartas de Final",
      SF: "Semifinal",
      T3: "Terceiro Lugar",
      FI: "Final"
    };

    Object.keys(knockoutMatches).forEach(stageKey => {
      knockoutMatches[stageKey].forEach(match => {
        const sched = KNOCKOUT_SCHEDULE_DATA[match.id] || {};
        list.push({
          ...match,
          ...sched,
          isKnockout: true,
          stageName: stageNames[stageKey] || stageKey,
          stageKey
        });
      });
    });

    list.sort((a, b) => {
      const timeA = getUTCDateTime(a.date, a.localTime, a.fuso).getTime();
      const timeB = getUTCDateTime(b.date, b.localTime, b.fuso).getTime();
      if (timeA !== timeB) return timeA - timeB;
      return a.id.localeCompare(b.id);
    });

    return list;
  }, [groupMatches, knockoutMatches]);

  const filteredMatches = useMemo(() => {
    return allMatches.filter(match => {
      const homeName = match.home ? (teamMap[match.home]?.name || match.home) : getPlaceholderName(match.id, "home");
      const awayName = match.away ? (teamMap[match.away]?.name || match.away) : getPlaceholderName(match.id, "away");
      
      // 1. Search term filter
      if (searchTerm.trim() !== "") {
        const query = searchTerm.toLowerCase().trim();
        const matchesHome = homeName.toLowerCase().includes(query);
        const matchesAway = awayName.toLowerCase().includes(query);
        const matchesRound = match.round?.toLowerCase().includes(query) || match.stageName?.toLowerCase().includes(query);
        const matchesVenue = match.estadio?.toLowerCase().includes(query) || match.cidade?.toLowerCase().includes(query);
        
        if (!matchesHome && !matchesAway && !matchesRound && !matchesVenue) {
          return false;
        }
      }

      // 2. Stage filter
      if (calendarStageFilter !== "all") {
        if (calendarStageFilter === "group" && match.isKnockout) return false;
        if (calendarStageFilter === "R32" && match.stageKey !== "R32") return false;
        if (calendarStageFilter === "R16" && match.stageKey !== "R16") return false;
        if (calendarStageFilter === "QF" && match.stageKey !== "QF") return false;
        if (calendarStageFilter === "finals" && !["SF", "T3", "FI"].includes(match.stageKey)) return false;
      }

      // 3. Status filter
      const hasPlayed = match.scoreHome !== "" && match.scoreAway !== "";
      if (calendarStatusFilter !== "all") {
        if (calendarStatusFilter === "played" && !hasPlayed) return false;
        if (calendarStatusFilter === "scheduled" && hasPlayed) return false;
      }

      return true;
    });
  }, [allMatches, searchTerm, calendarStageFilter, calendarStatusFilter, teamMap]);

  const { playedGroups, upcomingGroups } = useMemo(() => {
    const played = [];
    const upcoming = [];
    
    filteredMatches.forEach(match => {
      const hasPlayed = match.scoreHome !== "" && match.scoreAway !== "";
      if (hasPlayed) {
        played.push(match);
      } else {
        upcoming.push(match);
      }
    });
    
    const todayStr = getBrasiliaTodayStr();
    const tomorrowStr = getBrasiliaTomorrowStr();
    
    const groupMatchesFn = (list) => {
      const groupsMap = new Map();
      list.forEach(match => {
        const brParts = getBrasiliaDateTimeParts(match.date, match.localTime, match.fuso);
        const friendly = formatFriendlyDate(brParts.date, todayStr, tomorrowStr);
        
        if (!groupsMap.has(friendly)) {
          groupsMap.set(friendly, []);
        }
        groupsMap.get(friendly).push({ ...match, brParts });
      });
      return Array.from(groupsMap.entries()).map(([friendlyDate, matches]) => ({
        friendlyDate,
        matches
      }));
    };
    
    return {
      playedGroups: groupMatchesFn(played),
      upcomingGroups: groupMatchesFn(upcoming)
    };
  }, [filteredMatches]);

  const renderCalendarMatchCard = (match) => {
    const homeTeam = match.home ? (teamMap[match.home] || { name: match.home, flag: "" }) : null;
    const awayTeam = match.away ? (teamMap[match.away] || { name: match.away, flag: "" }) : null;
    const homePlaceholder = getPlaceholderName(match.id, "home");
    const awayPlaceholder = getPlaceholderName(match.id, "away");
    const showResults = match.scoreHome !== "" && match.scoreAway !== "";
    const brDate = match.brParts.date;
    const brTime = match.brParts.time;
    
    const isMatchHighlighted = searchTerm && (
      (homeTeam && homeTeam.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (awayTeam && awayTeam.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      match.round?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      match.stageName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      match.estadio?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      match.cidade?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
      <div 
        key={match.id}
        onClick={() => {
          if (match.isKnockout) {
            openEditMatch(match, match.stageKey);
          } else {
            openEditMatch(match, "group", match.groupKey);
          }
        }}
        className={`border p-4.5 rounded-2xl transition duration-200 cursor-pointer flex flex-col justify-between group shadow-md hover:-translate-y-0.5 hover:shadow-lg ${
          isMatchHighlighted 
            ? "bg-emerald-500/10 border-emerald-500/35 shadow-emerald-500/5 hover:border-emerald-500/40 match-card-highlighted" 
            : "bg-slate-900 border-slate-900/60 hover:border-slate-800"
        }`}
      >
        {/* Card Header: Group/Knockout info & Date */}
        <div className="flex justify-between items-center text-xs text-slate-400 border-b border-slate-950 pb-2.5 mb-3.5">
          <div className="flex items-center gap-1.5">
            <span className={`px-2.5 py-0.5 rounded-full font-extrabold text-[10px] uppercase tracking-wider border ${
              match.isKnockout 
                ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" 
                : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
            }`}>
              {match.stageName}
            </span>
          </div>
          <span className="text-slate-400 font-bold bg-slate-950 px-2 py-0.5 rounded border border-slate-900 text-[10px] md:text-xs font-mono">
            {brDate}
          </span>
        </div>

        {/* Scoreline */}
        <div className="flex justify-between items-center gap-2 py-2">
          {/* Home Team */}
          <div className="flex items-center gap-2 max-w-[42%] truncate">
            {homeTeam ? (
              <>
                <TeamFlag teamId={match.home} className="w-5.5 h-3.5 object-cover rounded shadow-xs shrink-0" />
                <span className="font-bold text-xs md:text-sm text-slate-100 truncate">{homeTeam.name}</span>
              </>
            ) : (
              <>
                <span className="inline-block shrink-0 text-xs">🏳️</span>
                <span className="text-slate-500 text-[11px] md:text-xs font-medium italic truncate">{homePlaceholder}</span>
              </>
            )}
          </div>

          {/* Scores */}
          <div className="flex items-center gap-1 bg-slate-950 px-2 py-1 rounded-xl border border-slate-900 shrink-0 font-mono text-xs md:text-sm font-bold min-w-[50px] justify-center">
            {showResults ? (
              <div className="flex items-center gap-0.5">
                {match.penHome !== "" && (
                  <span className="text-[10px] text-slate-500 mr-0.5">({match.penHome})</span>
                )}
                <span className="text-slate-100">{match.scoreHome}</span>
                <span className="text-slate-600 px-0.5">-</span>
                <span className="text-slate-100">{match.scoreAway}</span>
                {match.penAway !== "" && (
                  <span className="text-[10px] text-slate-500 ml-0.5">({match.penAway})</span>
                )}
              </div>
            ) : (
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider px-1 font-sans">Editar</span>
            )}
          </div>

          {/* Away Team */}
          <div className="flex items-center gap-2 max-w-[42%] truncate justify-end">
            {awayTeam ? (
              <>
                <span className="font-bold text-xs md:text-sm text-slate-100 truncate">{awayTeam.name}</span>
                <TeamFlag teamId={match.away} className="w-5.5 h-3.5 object-cover rounded shadow-xs shrink-0" />
              </>
            ) : (
              <>
                <span className="text-slate-500 text-[11px] md:text-xs font-medium italic truncate">{awayPlaceholder}</span>
                <span className="inline-block shrink-0 text-xs">🏳️</span>
              </>
            )}
          </div>
        </div>

        {(() => {
          if (!isSimulationMode) return null;
          
          const realMatch = match.isKnockout
            ? officialKnockoutMatches?.[match.stageKey]?.find(m => m.id === match.id)
            : officialGroupMatches?.[match.groupKey]?.find(m => m.id === match.id);
            
          if (!realMatch || realMatch.scoreHome === "" || realMatch.scoreAway === "") return null;
          
          const teamsMatch = !match.isKnockout || (match.home && match.away && match.home === realMatch.home && match.away === realMatch.away);
          
          let comparisonType = "none";
          if (!teamsMatch) {
            comparisonType = "teamsMismatch";
          } else if (match.scoreHome !== "" && match.scoreAway !== "") {
            const simHome = parseInt(match.scoreHome, 10);
            const simAway = parseInt(match.scoreAway, 10);
            const realHome = parseInt(realMatch.scoreHome, 10);
            const realAway = parseInt(realMatch.scoreAway, 10);
            
            if (!isNaN(simHome) && !isNaN(simAway) && !isNaN(realHome) && !isNaN(realAway)) {
              if (simHome === realHome && simAway === realAway) {
                comparisonType = "exact";
              } else {
                const simOutcome = Math.sign(simHome - simAway);
                const realOutcome = Math.sign(realHome - realAway);
                if (simOutcome === realOutcome) {
                  comparisonType = "outcome";
                } else {
                  comparisonType = "wrong";
                }
              }
            }
          }
          
          if (comparisonType === "none") return null;

          return (
            <div className="mt-3 mb-1 px-2.5 py-2 rounded-lg bg-slate-950/60 border border-slate-900 flex flex-row justify-between items-center gap-2 text-xs">
              <div className="flex items-center gap-1.5 text-slate-400">
                <span className="font-semibold text-slate-500 uppercase text-[9px] tracking-wider shrink-0">Real:</span>
                <div className="flex items-center gap-1 bg-slate-950 px-2 py-0.5 rounded border border-slate-900/80 font-mono font-bold text-slate-200">
                  <span>{realMatch.scoreHome}</span>
                  <span className="text-slate-650">-</span>
                  <span>{realMatch.scoreAway}</span>
                </div>
              </div>
              
              {comparisonType === "exact" && (
                <span className="text-[10px] font-extrabold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  🎯 Placar Exato (+3 pts)
                </span>
              )}
              {comparisonType === "outcome" && (
                <span className="text-[10px] font-extrabold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                  ✌️ Vencedor/Empate (+1 pt)
                </span>
              )}
              {comparisonType === "wrong" && (
                <span className="text-[10px] font-extrabold text-slate-400 bg-slate-900/50 px-2 py-0.5 rounded border border-slate-800">
                  ❌ Errou (0 pts)
                </span>
              )}
              {comparisonType === "teamsMismatch" && (
                <span className="text-[10px] font-medium text-slate-500 bg-slate-900/50 px-2 py-0.5 rounded border border-slate-850 italic">
                  ⚠️ Confronto Diferente
                </span>
              )}
            </div>
          );
        })()}

        {/* Venue and Clock footer */}
        <div className="mt-4 pt-2.5 border-t border-slate-950/70 flex flex-col gap-1 text-[11px] text-slate-500">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-emerald-500/70" /> 
              <span>DF: <strong className="text-slate-350 font-extrabold">{brTime}</strong></span>
            </span>
            <span className="font-mono text-slate-500">Local: {match.date} {match.localTime} ({match.fuso})</span>
          </div>
          <div className="flex justify-between items-center gap-2 mt-1">
            <div className="flex items-center gap-1.5 text-slate-500 min-w-0 max-w-[60%]">
              <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-600" />
              <span className="truncate">{match.estadio} ({match.cidade})</span>
            </div>
            
            {/* Calendar Menu */}
            <div className="relative shrink-0">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveCalendarMenu(activeCalendarMenu === match.id ? null : match.id);
                }}
                className="flex items-center gap-1 text-[9px] font-bold text-slate-400 hover:text-emerald-400 bg-slate-950 px-2 py-1.5 rounded-lg border border-slate-900 transition cursor-pointer"
              >
                <Calendar className="w-3 h-3 text-emerald-400" />
                <span>Salvar Agenda</span>
              </button>
              
              {activeCalendarMenu === match.id && (
                <div className="absolute right-0 bottom-full mb-2 w-48 bg-slate-950 border border-slate-800 rounded-xl shadow-2xl p-1.5 z-20 flex flex-col gap-1 text-[10px] font-bold animate-fade-in">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveCalendarMenu(null);
                      window.open(generateGoogleCalendarUrl(match, homeTeam?.name || homePlaceholder, awayTeam?.name || awayPlaceholder), '_blank');
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-slate-100 hover:bg-slate-900 transition flex items-center gap-2 cursor-pointer"
                  >
                    <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0"></span>
                    <span>Google Agenda</span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveCalendarMenu(null);
                      downloadIcsFile(match, homeTeam?.name || homePlaceholder, awayTeam?.name || awayPlaceholder);
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-slate-100 hover:bg-slate-900 transition flex items-center gap-2 cursor-pointer"
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
                    <span>Apple / Outlook / ICS</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

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
      let dbGroupMatches = generateInitialMatches();
      let dbKnockoutMatches = enrichKnockoutState({
        R32: Array.from({ length: 16 }, (_, i) => ({ id: `R32-${i + 1}`, home: null, away: null, scoreHome: "", scoreAway: "", penHome: "", penAway: "" })),
        R16: Array.from({ length: 8 }, (_, i) => ({ id: `R16-${i + 1}`, home: null, away: null, scoreHome: "", scoreAway: "", penHome: "", penAway: "" })),
        QF: Array.from({ length: 4 }, (_, i) => ({ id: `QF-${i + 1}`, home: null, away: null, scoreHome: "", scoreAway: "", penHome: "", penAway: "" })),
        SF: Array.from({ length: 2 }, (_, i) => ({ id: `SF-${i + 1}`, home: null, away: null, scoreHome: "", scoreAway: "", penHome: "", penAway: "" })),
        T3: [{ id: "T3-1", home: null, away: null, scoreHome: "", scoreAway: "", penHome: "", penAway: "" }],
        FI: [{ id: "FI-1", home: null, away: null, scoreHome: "", scoreAway: "", penHome: "", penAway: "" }]
      });

      if (isSupabaseConfigured) {
        setIsDbSyncing(true);
        try {
          const { data, error } = await supabase.from('matches').select('*');
          if (error) throw error;

          if (data && data.length > 0) {
            data.forEach(m => {
              const isKnockout = m.id.includes('-') || m.id.startsWith('T3') || m.id.startsWith('FI');
              
              if (isKnockout) {
                const stage = m.id.split('-')[0];
                const match = dbKnockoutMatches[stage]?.find(x => x.id === m.id);
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
                const match = dbGroupMatches[groupKey]?.find(x => x.id === m.id);
                if (match) {
                  match.scoreHome = m.score_home !== null ? m.score_home.toString() : "";
                  match.scoreAway = m.score_away !== null ? m.score_away.toString() : "";
                }
              }
            });
          } else {
            // Database is empty, let's seed it
            await seedSupabaseDatabase();
          }
        } catch (err) {
          console.error("Erro ao buscar dados do Supabase:", err.message);
        } finally {
          setIsDbSyncing(false);
        }
      }

      setOfficialGroupMatches(dbGroupMatches);
      setOfficialKnockoutMatches(dbKnockoutMatches);

      // Check if user has an active simulation in localStorage
      const savedG = localStorage.getItem("copa_2026_group_matches");
      const savedK = localStorage.getItem("copa_2026_knockout_matches");

      let finalG = dbGroupMatches;
      let finalK = dbKnockoutMatches;
      let isSim = false;

      if (savedG && savedK) {
        try {
          finalG = JSON.parse(savedG);
          finalK = enrichKnockoutState(JSON.parse(savedK));
          isSim = true;
        } catch (e) {
          console.error("Erro ao carregar simulação salva:", e);
        }
      }

      // Run a migration to update dates, times, and venues from generateInitialMatches
      const correctInitialG = generateInitialMatches();
      let migrated = false;
      const migratedG = {};

      Object.keys(finalG).forEach(groupKey => {
        migratedG[groupKey] = finalG[groupKey].map((m, idx) => {
          const correctM = correctInitialG[groupKey]?.[idx];
          if (correctM && (m.date !== correctM.date || m.localTime !== correctM.localTime || m.estadio !== correctM.estadio)) {
            migrated = true;
            return {
              ...m,
              date: correctM.date,
              localTime: correctM.localTime,
              estadio: correctM.estadio,
              cidade: correctM.cidade,
              fuso: correctM.fuso,
              pais: correctM.pais,
              bandeira: correctM.bandeira
            };
          }
          return m;
        });
      });

      if (migrated) {
        finalG = migratedG;
        // Save back to localStorage if in simulation mode
        if (isSim) {
          try {
            localStorage.setItem("copa_2026_group_matches", JSON.stringify(finalG));
          } catch (e) {
            console.error("Failed to save migrated matches:", e);
          }
        }
      }

      setGroupMatches(finalG);
      setKnockoutMatches(finalK);
      setIsSimulationMode(isSim);
    };

    loadMatches();
  }, []);

  // Scroll event listener effect for mobile scrollers
  useEffect(() => {
    const timer = setTimeout(() => {
      handleGroupScroll();
      handleKoScroll();
    }, 100);

    const groupEl = groupScrollRef.current;
    if (groupEl) {
      groupEl.addEventListener('scroll', handleGroupScroll);
    }

    const koEl = koScrollRef.current;
    if (koEl) {
      koEl.addEventListener('scroll', handleKoScroll);
    }

    const handleResize = () => {
      handleGroupScroll();
      handleKoScroll();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      clearTimeout(timer);
      if (groupEl) groupEl.removeEventListener('scroll', handleGroupScroll);
      if (koEl) koEl.removeEventListener('scroll', handleKoScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, [activeTab, expandedGroup]);

  // Leave Simulation Mode helper
  const leaveSimulationMode = () => {
    localStorage.removeItem("copa_2026_group_matches");
    localStorage.removeItem("copa_2026_knockout_matches");
    
    if (officialGroupMatches && officialKnockoutMatches) {
      setGroupMatches(officialGroupMatches);
      setKnockoutMatches(officialKnockoutMatches);
    } else {
      setGroupMatches(generateInitialMatches());
      setKnockoutMatches({
        R32: Array.from({ length: 16 }, (_, i) => ({ id: `R32-${i + 1}`, home: null, away: null, scoreHome: "", scoreAway: "", penHome: "", penAway: "" })),
        R16: Array.from({ length: 8 }, (_, i) => ({ id: `R16-${i + 1}`, home: null, away: null, scoreHome: "", scoreAway: "", penHome: "", penAway: "" })),
        QF: Array.from({ length: 4 }, (_, i) => ({ id: `QF-${i + 1}`, home: null, away: null, scoreHome: "", scoreAway: "", penHome: "", penAway: "" })),
        SF: Array.from({ length: 2 }, (_, i) => ({ id: `SF-${i + 1}`, home: null, away: null, scoreHome: "", scoreAway: "", penHome: "", penAway: "" })),
        T3: [{ id: "T3-1", home: null, away: null, scoreHome: "", scoreAway: "", penHome: "", penAway: "" }],
        FI: [{ id: "FI-1", home: null, away: null, scoreHome: "", scoreAway: "", penHome: "", penAway: "" }]
      });
    }
    setIsSimulationMode(false);
  };

  // Toggle Admin / Editor Mode helper
  const toggleAdminMode = () => {
    if (isAdminMode) {
      setIsAdminMode(false);
    } else {
      const pass = prompt("Digite a senha do administrador para salvar placares diretamente no Supabase:");
      if (pass === "copa2026") {
        setIsAdminMode(true);
        setIsSimulationMode(false);
        if (officialGroupMatches && officialKnockoutMatches) {
          setGroupMatches(officialGroupMatches);
          setKnockoutMatches(officialKnockoutMatches);
        }
      } else if (pass !== null) {
        alert("Senha incorreta!");
      }
    }
  };

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

    const hasAnyGroupScores = Object.values(groupMatches).some(group => 
      group.some(match => match.scoreHome !== "" && match.scoreAway !== "")
    );

    setKnockoutMatches(prev => {
      let changed = false;
      const newR32 = prev.R32.map((match, idx) => {
        const h = hasAnyGroupScores ? r32Teams[idx].home : null;
        const a = hasAnyGroupScores ? r32Teams[idx].away : null;
        if (match.home !== h || match.away !== a) {
          changed = true;
          return { ...match, home: h, away: a };
        }
        return match;
      });
      if (!changed) return prev;
      return { ...prev, R32: newR32 };
    });
  }, [qualificationData, groupMatches]);

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
      let changed = false;
      const newR16 = prev.R16.map((match, idx) => {
        const map = r16Mapping[idx];
        const h = getMatchWinner(prev.R32[map.hIdx]);
        const a = getMatchWinner(prev.R32[map.aIdx]);
        if (match.home !== h || match.away !== a) {
          changed = true;
          return { ...match, home: h, away: a };
        }
        return match;
      });

      // 2. QF from R16 winners
      const qfMapping = [
        { hIdx: 0, aIdx: 1 }, { hIdx: 2, aIdx: 3 },
        { hIdx: 4, aIdx: 5 }, { hIdx: 6, aIdx: 7 }
      ];
      const newQF = prev.QF.map((match, idx) => {
        const map = qfMapping[idx];
        const h = getMatchWinner(newR16[map.hIdx]);
        const a = getMatchWinner(newR16[map.aIdx]);
        if (match.home !== h || match.away !== a) {
          changed = true;
          return { ...match, home: h, away: a };
        }
        return match;
      });

      // 3. SF from QF winners
      const sfMapping = [
        { hIdx: 0, aIdx: 1 }, { hIdx: 2, aIdx: 3 }
      ];
      const newSF = prev.SF.map((match, idx) => {
        const map = sfMapping[idx];
        const h = getMatchWinner(newQF[map.hIdx]);
        const a = getMatchWinner(newQF[map.aIdx]);
        if (match.home !== h || match.away !== a) {
          changed = true;
          return { ...match, home: h, away: a };
        }
        return match;
      });

      // 4. 3rd Place (T3) and Final (FI)
      const t3Home = getMatchLoser(newSF[0]);
      const t3Away = getMatchLoser(newSF[1]);
      let newT3 = prev.T3;
      if (prev.T3[0].home !== t3Home || prev.T3[0].away !== t3Away) {
        changed = true;
        newT3 = [{ ...prev.T3[0], home: t3Home, away: t3Away }];
      }

      const fiHome = getMatchWinner(newSF[0]);
      const fiAway = getMatchWinner(newSF[1]);
      let newFI = prev.FI;
      if (prev.FI[0].home !== fiHome || prev.FI[0].away !== fiAway) {
        changed = true;
        newFI = [{ ...prev.FI[0], home: fiHome, away: fiAway }];
      }

      if (!changed) {
        return prev;
      }

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
      R32: simR32.map(enrichKnockoutMatch),
      R16: simR16.map(enrichKnockoutMatch),
      QF: simQF.map(enrichKnockoutMatch),
      SF: simSF.map(enrichKnockoutMatch),
      T3: [simT3].map(enrichKnockoutMatch),
      FI: [simFI].map(enrichKnockoutMatch)
    };
  };

  // Simulates the entire tournament (groups + bracket) with local storage or database synchronization
  const simulateEntireTournament = async () => {
    // Check if there are any manual entries
    const hasManualScores = Object.values(groupMatches).some(group => 
      group.some(m => m.scoreHome !== "" || m.scoreAway !== "")
    );
    
    if (hasManualScores) {
      const confirmSim = window.confirm(
        "Atenção: Você possui placares inseridos manualmente. Ao realizar a simulação automática de todo o torneio, todos os seus placares manuais serão substituídos por palpites simulados. Deseja continuar?"
      );
      if (!confirmSim) return;
    }

    setIsSimulating(true);
    const simulatedGroups = simulateGroupStage();
    const simulatedKnockout = simulateFullKnockoutState(simulatedGroups);
    
    setGroupMatches(simulatedGroups);
    setKnockoutMatches(simulatedKnockout);

    if (isAdminMode) {
      if (isSupabaseConfigured) {
        await syncMatchesToSupabase(simulatedGroups, simulatedKnockout);
        setOfficialGroupMatches(simulatedGroups);
        setOfficialKnockoutMatches(simulatedKnockout);
      }
    } else {
      setIsSimulationMode(true);
      localStorage.setItem("copa_2026_group_matches", JSON.stringify(simulatedGroups));
      localStorage.setItem("copa_2026_knockout_matches", JSON.stringify(simulatedKnockout));
    }
    
    setIsSimulating(false);
  };

  // Resets everything in memory, localStorage, and/or Supabase
  const resetAll = async () => {
    if (isAdminMode) {
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
      setOfficialGroupMatches(emptyGroups);
      setOfficialKnockoutMatches(emptyKnockout);

      if (isSupabaseConfigured) {
        await syncMatchesToSupabase(emptyGroups, emptyKnockout);
      }
    } else {
      localStorage.removeItem("copa_2026_group_matches");
      localStorage.removeItem("copa_2026_knockout_matches");
      
      if (officialGroupMatches && officialKnockoutMatches) {
        setGroupMatches(officialGroupMatches);
        setKnockoutMatches(officialKnockoutMatches);
      } else {
        setGroupMatches(generateInitialMatches());
        setKnockoutMatches({
          R32: Array.from({ length: 16 }, (_, i) => ({ id: `R32-${i + 1}`, home: null, away: null, scoreHome: "", scoreAway: "", penHome: "", penAway: "" })),
          R16: Array.from({ length: 8 }, (_, i) => ({ id: `R16-${i + 1}`, home: null, away: null, scoreHome: "", scoreAway: "", penHome: "", penAway: "" })),
          QF: Array.from({ length: 4 }, (_, i) => ({ id: `QF-${i + 1}`, home: null, away: null, scoreHome: "", scoreAway: "", penHome: "", penAway: "" })),
          SF: Array.from({ length: 2 }, (_, i) => ({ id: `SF-${i + 1}`, home: null, away: null, scoreHome: "", scoreAway: "", penHome: "", penAway: "" })),
          T3: [{ id: "T3-1", home: null, away: null, scoreHome: "", scoreAway: "", penHome: "", penAway: "" }],
          FI: [{ id: "FI-1", home: null, away: null, scoreHome: "", scoreAway: "", penHome: "", penAway: "" }]
        });
      }
      setIsSimulationMode(false);
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

  // Confirms match editing inside Bottom Sheet and saves
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
      updatedKnockout = simulateFullKnockoutState(updatedGroups);
      setGroupMatches(updatedGroups);
      setKnockoutMatches(updatedKnockout);
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
      updatedKnockout = simulateFullKnockoutState(updatedGroups, updatedKnockout);
      setKnockoutMatches(updatedKnockout);
    }

    setSelectedMatch(null);

    if (isAdminMode) {
      if (isSupabaseConfigured) {
        setIsDbSyncing(true);
        try {
          const scoreHomeVal = sh === "" ? null : parseInt(sh, 10);
          const scoreAwayVal = sa === "" ? null : parseInt(sa, 10);
          const penHomeVal = ph === "" ? null : parseInt(ph, 10);
          const penAwayVal = pa === "" ? null : parseInt(pa, 10);

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
          
          await syncMatchesToSupabase(updatedGroups, updatedKnockout);
          setOfficialGroupMatches(updatedGroups);
          setOfficialKnockoutMatches(updatedKnockout);
        } catch (err) {
          console.error("Erro ao salvar no Supabase:", err.message);
        } finally {
          setIsDbSyncing(false);
        }
      }
    } else {
      setIsSimulationMode(true);
      localStorage.setItem("copa_2026_group_matches", JSON.stringify(updatedGroups));
      localStorage.setItem("copa_2026_knockout_matches", JSON.stringify(updatedKnockout));
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

  // Swipe gesture detection to change group with direction layout
  const handleTouchStart = (e) => {
    touchStartX.current = e.targetTouches[0].clientX;
    touchEndX.current = e.targetTouches[0].clientX;
    touchStartY.current = e.targetTouches[0].clientY;
    touchEndY.current = e.targetTouches[0].clientY;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.targetTouches[0].clientX;
    touchEndY.current = e.targetTouches[0].clientY;
  };

  const handleTouchEnd = () => {
    const diffX = touchStartX.current - touchEndX.current;
    const diffY = touchStartY.current - touchEndY.current;

    // Ignore swipe if vertical movement is greater than horizontal movement (scrolling)
    if (Math.abs(diffY) > Math.abs(diffX)) {
      return;
    }

    const groups = Object.keys(INITIAL_GROUPS_DATA);
    const currentIndex = groups.indexOf(expandedGroup);

    if (diffX > 60) {
      if (currentIndex < groups.length - 1) {
        setSlideDirection("right");
        if (document.startViewTransition) {
          document.startViewTransition(() => {
            setExpandedGroup(groups[currentIndex + 1]);
          });
        } else {
          setExpandedGroup(groups[currentIndex + 1]);
        }
      }
    } else if (diffX < -60) {
      if (currentIndex > 0) {
        setSlideDirection("left");
        if (document.startViewTransition) {
          document.startViewTransition(() => {
            setExpandedGroup(groups[currentIndex - 1]);
          });
        } else {
          setExpandedGroup(groups[currentIndex - 1]);
        }
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
          id: teamId,
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

  const renderGroupDetails = (groupKey) => {
    if (!groupKey) return null;
    const standings = groupStandings[groupKey];
    const matches = groupMatches[groupKey];
    if (!standings || !matches) return null;

    return (
      <div className="bg-slate-900/30 rounded-2xl border border-slate-900 p-4 md:p-6 space-y-6">
        <div className="flex justify-between items-center border-b border-slate-900 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-extrabold text-slate-100">
                Grupo {groupKey}
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">Classificação do grupo e calendário</p>
          </div>
          
          <button 
            onClick={async () => {
              const hasManualScoresInGroup = groupMatches[groupKey].some(m => m.scoreHome !== "" || m.scoreAway !== "");
              if (hasManualScoresInGroup) {
                const confirmSim = window.confirm(
                  `Atenção: Você possui placares inseridos manualmente no Grupo ${groupKey}. Ao simular este grupo automaticamente, esses placares serão substituídos. Deseja continuar?`
                );
                if (!confirmSim) return;
              }

              const updatedMatchesForThisGroup = groupMatches[groupKey].map(match => {
                const { sh, sa } = simulateMatchScore(match.home, match.away);
                return { ...match, scoreHome: sh.toString(), scoreAway: sa.toString() };
              });

              const newGroupMatchesState = {
                ...groupMatches,
                [groupKey]: updatedMatchesForThisGroup
              };

              const localKnockoutSync = simulateFullKnockoutState(newGroupMatchesState);

              setGroupMatches(newGroupMatchesState);
              setKnockoutMatches(localKnockoutSync);

              if (isAdminMode) {
                if (isSupabaseConfigured) {
                  await syncMatchesToSupabase(newGroupMatchesState, localKnockoutSync);
                  setOfficialGroupMatches(newGroupMatchesState);
                  setOfficialKnockoutMatches(localKnockoutSync);
                }
              } else {
                setIsSimulationMode(true);
                localStorage.setItem("copa_2026_group_matches", JSON.stringify(newGroupMatchesState));
                localStorage.setItem("copa_2026_knockout_matches", JSON.stringify(localKnockoutSync));
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
          <p className="text-xs md:text-sm font-bold text-slate-450 uppercase tracking-wider pl-1 flex items-center justify-between">
            <span>Classificação</span>
            <span className="text-[10px] md:text-xs text-slate-500 font-medium normal-case font-mono">
              (Clique na seleção para ver escalação/estrelas)
            </span>
          </p>
          
          <div 
            onTouchStart={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
            onTouchEnd={(e) => e.stopPropagation()}
            className="overflow-x-auto no-scrollbar bg-slate-950 rounded-xl border border-slate-900 relative"
          >
            <table className="w-full text-left text-xs md:text-sm text-slate-350 min-w-[540px] lg:min-w-0 border-collapse">
              <thead>
                <tr className="text-slate-500 border-b border-slate-900 pb-2 font-bold uppercase tracking-wider text-xs select-none">
                  <th className="py-3 pl-3 pr-2 sticky left-0 z-20 bg-slate-950 border-r border-slate-900/60 shadow-[1px_0_0_0_rgba(255,255,255,0.05)] w-40 md:w-52 min-w-[160px] md:min-w-[208px] max-w-[160px] md:max-w-[208px]">Seleção</th>
                  <th className="py-3 text-center w-12 min-w-[48px] font-extrabold text-emerald-450 cursor-help" title="Pontos">PTS</th>
                  <th className="py-3 text-center w-10 min-w-[40px] font-bold text-slate-300 cursor-help" title="Jogos (Partidas jogadas)">J</th>
                  <th className="py-3 text-center w-10 min-w-[40px] cursor-help" title="Vitórias">V</th>
                  <th className="py-3 text-center w-10 min-w-[40px] cursor-help" title="Empates">E</th>
                  <th className="py-3 text-center w-10 min-w-[40px] cursor-help" title="Derrotas">D</th>
                  <th className="py-3 text-center w-12 min-w-[48px] cursor-help" title="Gols Pró (Gols marcados)">GP</th>
                  <th className="py-3 text-center w-12 min-w-[48px] cursor-help" title="Gols Contra (Gols sofridos)">GC</th>
                  <th className="py-3 text-center w-12 min-w-[48px] cursor-help" title="Saldo de Gols (Gols marcados - Gols sofridos)">SG</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900/30">
                {standings.map((team, idx) => {
                  const isQualifying = idx < 2;
                  const isBestThirdCandidate = idx === 2;
                  const isHighlighted = searchTerm && team.name.toLowerCase().includes(searchTerm.toLowerCase());
                  return (
                    <tr 
                      key={team.id}
                      className={`hover:bg-slate-900/30 transition duration-150 ${
                        isHighlighted 
                          ? "bg-emerald-500/10 border-y border-emerald-500/25" 
                          : isQualifying 
                            ? "bg-emerald-500/[0.005]" 
                            : ""
                      }`}
                    >
                      <td className="py-3.5 pl-3 pr-2 font-medium sticky left-0 z-10 bg-slate-950 border-r border-slate-900/60 shadow-[1px_0_0_0_rgba(255,255,255,0.05)] w-40 md:w-52 min-w-[160px] md:min-w-[208px] max-w-[160px] md:max-w-[208px]">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className={`w-1 h-5 rounded-full shrink-0 ${
                            isQualifying 
                              ? "bg-emerald-500" 
                              : isBestThirdCandidate 
                                ? "bg-yellow-500/40" 
                                : "bg-transparent"
                          }`}></span>
                          <span className="font-mono text-xs text-slate-500 shrink-0">{idx + 1}º</span>
                          <TeamFlag teamId={team.id} />
                          <button 
                            onClick={() => setSelectedTeam(team.id)}
                            className="font-bold text-slate-100 hover:text-emerald-400 transition-colors text-left truncate cursor-pointer focus:outline-hidden"
                          >
                            {team.name}
                          </button>
                        </div>
                      </td>
                      <td className={`py-3.5 text-center font-extrabold font-mono text-sm md:text-base ${
                        isQualifying ? "text-emerald-450" : "text-slate-200"
                      }`}>{team.pts}</td>
                      <td className="py-3.5 text-center font-mono font-semibold text-slate-300">{team.j}</td>
                      <td className="py-3.5 text-center font-mono text-slate-400">{team.v}</td>
                      <td className="py-3.5 text-center font-mono text-slate-400">{team.e}</td>
                      <td className="py-3.5 text-center font-mono text-slate-400">{team.d}</td>
                      <td className="py-3.5 text-center font-mono text-slate-400">{team.gp}</td>
                      <td className="py-3.5 text-center font-mono text-slate-400">{team.gc}</td>
                      <td className={`py-3.5 text-center font-mono font-bold ${
                        team.sg > 0 ? "text-emerald-400" : team.sg < 0 ? "text-rose-400" : "text-slate-450"
                      }`}>{team.sg > 0 ? `+${team.sg}` : team.sg}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex flex-col gap-2 pt-1.5 pl-1.5">
          <div className="flex gap-4 text-xs md:text-sm text-slate-450">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Classifica direto (Top 2)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-yellow-500/40"></span> Disputa vaga de 3º lugar
            </span>
          </div>
          
          {/* Explicação das siglas da classificação */}
          <div className="mt-1.5 p-3 rounded-xl bg-slate-900/30 border border-slate-900/50 text-[10px] md:text-xs text-slate-500 flex flex-wrap gap-x-4 gap-y-1.5 leading-none">
            <span><strong>J:</strong> Jogos</span>
            <span><strong>V:</strong> Vitórias</span>
            <span><strong>E:</strong> Empates</span>
            <span><strong>D:</strong> Derrotas</span>
            <span><strong>GP:</strong> Gols Pró (Marcados)</span>
            <span><strong>GC:</strong> Gols Contra (Sofridos)</span>
            <span><strong>SG:</strong> Saldo de Gols</span>
            <span><strong>PTS:</strong> Pontos</span>
          </div>
        </div>

        {/* Group Matches Calendar List */}
        <div className="space-y-3.5 pt-4">
          <p className="text-xs md:text-sm font-bold text-slate-400 uppercase tracking-wider pl-1">
            Calendário & Jogos
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {matches.map((match) => {
              const homeTeam = teamMap[match.home] || { name: match.home, flag: "" };
              const awayTeam = teamMap[match.away] || { name: match.away, flag: "" };
              const showResults = match.scoreHome !== "" && match.scoreAway !== "";
              
              // Calculate Brasilia Time
              const brTime = getBrasiliaTime(match.localTime, match.fuso);
              
              const isMatchHighlighted = searchTerm && (
                homeTeam.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                awayTeam.name.toLowerCase().includes(searchTerm.toLowerCase())
              );
              
              return (
                <div 
                  key={match.id}
                  onClick={() => openEditMatch(match, "group", groupKey)}
                  className={`border p-3.5 rounded-xl transition duration-200 cursor-pointer flex flex-col justify-between group shadow-sm ${
                    isMatchHighlighted 
                      ? "bg-emerald-500/10 border-emerald-500/35 shadow-emerald-500/5 hover:border-emerald-500/40" 
                      : "bg-slate-900 border-slate-900 hover:border-slate-800"
                  }`}
                >
                  {/* Match header info */}
                  <div className="flex justify-between items-center text-xs md:text-sm text-slate-400 border-b border-slate-950 pb-2 mb-3">
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
                      <TeamFlag teamId={match.home} />
                      <span className="font-bold text-sm md:text-base text-slate-100 truncate">{homeTeam.name}</span>
                    </div>
                    
                    <div className="flex items-center gap-1 bg-slate-950/40 px-2.5 py-1 rounded-lg border border-slate-950">
                      {showResults ? (
                        <>
                          <span className="font-mono font-bold text-sm md:text-base text-slate-100">{match.scoreHome}</span>
                          <span className="text-slate-600 font-semibold px-0.5">-</span>
                          <span className="font-mono font-bold text-sm md:text-base text-slate-100">{match.scoreAway}</span>
                        </>
                      ) : (
                        <span className="text-xs font-bold text-emerald-400 uppercase px-1 py-0.5">Editar</span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 max-w-[42%] truncate justify-end">
                      <span className="font-bold text-sm md:text-base text-slate-100 truncate">{awayTeam.name}</span>
                      <TeamFlag teamId={match.away} />
                    </div>
                  </div>

                  {(() => {
                    if (!isSimulationMode) return null;
                    const realMatch = officialGroupMatches?.[groupKey]?.find(m => m.id === match.id);
                    if (!realMatch || realMatch.scoreHome === "" || realMatch.scoreAway === "") return null;
                    
                    const simHome = parseInt(match.scoreHome, 10);
                    const simAway = parseInt(match.scoreAway, 10);
                    const realHome = parseInt(realMatch.scoreHome, 10);
                    const realAway = parseInt(realMatch.scoreAway, 10);
                    
                    let comparisonType = "none";
                    if (match.scoreHome !== "" && match.scoreAway !== "" && !isNaN(simHome) && !isNaN(simAway) && !isNaN(realHome) && !isNaN(realAway)) {
                      if (simHome === realHome && simAway === realAway) {
                        comparisonType = "exact";
                      } else {
                        const simOutcome = Math.sign(simHome - simAway);
                        const realOutcome = Math.sign(realHome - realAway);
                        if (simOutcome === realOutcome) {
                          comparisonType = "outcome";
                        } else {
                          comparisonType = "wrong";
                        }
                      }
                    }
                    
                    if (comparisonType === "none") return null;

                    return (
                      <div className="mt-2.5 mb-1 px-2.5 py-2 rounded-lg bg-slate-950/60 border border-slate-900 flex flex-row justify-between items-center gap-2 text-xs">
                        <div className="flex items-center gap-1.5 text-slate-400">
                          <span className="font-semibold text-slate-500 uppercase text-[9px] tracking-wider shrink-0">Real:</span>
                          <div className="flex items-center gap-1 bg-slate-950 px-2 py-0.5 rounded border border-slate-900/80 font-mono font-bold text-slate-200">
                            <span>{realMatch.scoreHome}</span>
                            <span className="text-slate-650">-</span>
                            <span>{realMatch.scoreAway}</span>
                          </div>
                        </div>
                        
                        {comparisonType === "exact" && (
                          <span className="text-[10px] font-extrabold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                            🎯 Placar Exato (+3 pts)
                          </span>
                        )}
                        {comparisonType === "outcome" && (
                          <span className="text-[10px] font-extrabold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                            ✌️ Vencedor/Empate (+1 pt)
                          </span>
                        )}
                        {comparisonType === "wrong" && (
                          <span className="text-[10px] font-extrabold text-slate-400 bg-slate-900/50 px-2 py-0.5 rounded border border-slate-800">
                            ❌ Errou (0 pts)
                          </span>
                        )}
                      </div>
                    );
                  })()}
                  
                  {/* Timezone display & venue */}
                  <div className="mt-3.5 pt-2 border-t border-slate-950 flex flex-col gap-1 text-xs md:text-sm text-slate-400 group-hover:text-slate-350 transition">
                    <div className="flex items-center justify-between text-slate-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-emerald-500/70" /> 
                        <span>Brasília: <strong className="text-slate-300 font-bold">{brTime}</strong></span>
                      </span>
                      <span>Local: <strong className="text-slate-350">{match.localTime} ({match.fuso})</strong></span>
                    </div>
                    <div className="flex items-center gap-1 text-xs md:text-sm text-slate-500">
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
    );
  };

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
                    <TeamFlag teamId={stats.topScoringTeam.id} />
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
                    <TeamFlag teamId={stats.champion.id} />
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
            { id: "calendario", label: "Calendário Completo", icon: Calendar },
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
        
        {/* Banner Status do Banco vs Simulação */}
        <div className="mb-6">
          {isSimulationMode ? (
            <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 shadow-md animate-fade-in">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 flex-1">
                <div className="flex items-center gap-2 text-amber-400 text-xs font-bold shrink-0">
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                  </span>
                  <span>🔮 MODO SIMULAÇÃO ATIVO</span>
                </div>
                
                {bolaoStats.matchesCompared > 0 ? (
                  <div className="flex flex-wrap items-center gap-2 bg-slate-950/60 py-1.5 px-3 rounded-xl border border-slate-900 text-xs">
                    <span className="text-slate-400">Pontuação do Bolão:</span>
                    <span className="text-amber-450 font-extrabold flex items-center gap-1 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                      🏆 {bolaoStats.totalPoints} pts
                    </span>
                    <div className="h-3.5 w-[1px] bg-slate-800 hidden xs:inline-block"></div>
                    <span className="text-slate-400 text-[11px] flex items-center gap-1">
                      🎯 <strong className="text-emerald-450 font-bold">{bolaoStats.exactCount}</strong> placar exato
                    </span>
                    <span className="text-slate-400 text-[11px] flex items-center gap-1">
                      ✌️ <strong className="text-blue-450 font-bold">{bolaoStats.outcomeCount}</strong> vencedor/empate
                    </span>
                    <span className="text-slate-500 text-[10px] italic">
                      ({bolaoStats.matchesCompared} {bolaoStats.matchesCompared === 1 ? 'jogo comparado' : 'jogos comparados'})
                    </span>
                  </div>
                ) : (
                  <span className="text-[10px] text-slate-400 font-medium">
                    (Insira placares para comparar com os resultados reais do banco e pontuar!)
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0 justify-end">
                <button 
                  onClick={leaveSimulationMode}
                  className="text-[10px] font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 px-3 py-1.5 rounded-lg transition cursor-pointer"
                >
                  Voltar para Resultados Reais
                </button>
              </div>
            </div>
          ) : isAdminMode ? (
            <div className="bg-red-500/10 border border-red-500/20 p-3.5 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-3 shadow-md animate-fade-in">
              <div className="flex items-center gap-2 text-red-400 text-xs font-bold">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
                <span>✍️ MODO EDITOR ATIVO (ADMIN)</span>
                <span className="text-[10px] text-slate-400 font-medium hidden sm:inline">(Alterações gravam diretamente no Supabase)</span>
              </div>
              <button 
                onClick={() => setIsAdminMode(false)}
                className="text-[10px] font-bold text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-800 px-3 py-1.5 rounded-lg transition cursor-pointer"
              >
                Sair do Modo Editor
              </button>
            </div>
          ) : (
            <div className="bg-emerald-500/5 border border-emerald-500/10 p-3.5 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-3 shadow-sm animate-fade-in">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>⚽ RESULTADOS OFICIAIS DA COPA</span>
              </div>
              <span className="text-[10px] text-slate-500 font-medium">
                Edite qualquer placar para entrar no modo de simulação pessoal
              </span>
            </div>
          )}
        </div>
        
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
              
              <form onSubmit={handleSearchSubmit} className="relative w-full md:w-64">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                <input 
                  type="text" 
                  placeholder="Buscar país..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-9 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500/50"
                />
                {searchTerm && (
                  <button 
                    type="button"
                    onClick={() => setSearchTerm("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-350 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </form>
            </div>

            {/* Quick Groups Pills Scroller (Mobile UI / Scroll horizontal - Sticky and Fade arrows) */}
            <div className="sticky top-0 z-30 lg:hidden -mx-4 px-4 py-3 bg-slate-950/95 backdrop-blur-md border-b border-slate-900 shadow-md">
              <div className="relative">
                {/* Left Arrow overlay */}
                {showLeftArrow && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent pr-4 pl-1 flex items-center z-10 pointer-events-none">
                    <ChevronLeft className="w-4 h-4 text-emerald-400" />
                  </div>
                )}

                {/* The scroll list */}
                <div 
                  ref={groupScrollRef}
                  className="flex overflow-x-auto no-scrollbar gap-2"
                >
                  {visibleGroups.map(groupKey => {
                    const isSelected = expandedGroup === groupKey;
                    return (
                      <button
                        key={groupKey}
                        onClick={() => scrollToGroupColumn(groupKey)}
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

                {/* Right Arrow overlay */}
                {showRightArrow && (
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 bg-gradient-to-l from-slate-950 via-slate-950/80 to-transparent pl-4 pr-1 flex items-center z-10 pointer-events-none">
                    <ChevronRight className="w-4 h-4 text-emerald-400" />
                  </div>
                )}
              </div>
            </div>

            {/* Main Double Column Layout */}
            <div id="active-group-details-section" className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
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
                      <div className="flex justify-between items-center mb-3">
                        <span className="font-extrabold text-slate-200 text-base md:text-lg tracking-wide">Grupo {groupKey}</span>
                        <span className="text-xs text-slate-400 bg-slate-950 px-2.5 py-1 rounded-full border border-slate-900 font-bold uppercase tracking-wider text-[10px]">
                          {isExpanded ? "Ativo" : "Ver Grupo"}
                        </span>
                      </div>
                      
                      {/* Mini standings list */}
                      <div className="space-y-1.5 text-xs md:text-sm">
                        {standings.map((team, idx) => (
                          <div 
                            key={team.id} 
                            className={`flex items-center justify-between p-1.5 rounded transition ${
                              idx < 2 ? "bg-emerald-500/[0.03] text-slate-250" : "text-slate-400 hover:text-slate-350"
                            }`}
                          >
                            <span className="flex items-center gap-2 truncate max-w-[190px]">
                              <span className="font-mono text-xs text-slate-500 w-4 shrink-0">{idx + 1}º</span>
                              <TeamFlag teamId={team.id} className="w-5.5 h-3.5 object-cover rounded shadow-xs shrink-0" />
                              <span className="font-bold truncate text-slate-100">{team.name}</span>
                            </span>
                            <div className="flex items-center gap-2.5 font-bold text-xs md:text-sm shrink-0">
                              <span className="text-slate-500 font-medium font-mono text-[11px] md:text-xs">Saldo: {team.sg >= 0 ? `+${team.sg}` : team.sg}</span>
                              <span className={`font-extrabold ${idx < 2 ? "text-emerald-400" : "text-slate-300"}`}>{team.pts} pts</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Desktop View: Renders only active group details */}
              <div className="lg:col-span-7 space-y-6 hidden lg:block">
                {renderGroupDetails(expandedGroup)}
              </div>

              {/* Mobile View: Horizontal Scroll-snap columns for groups */}
              <div className="lg:hidden relative -mx-4 px-4 overflow-hidden lg:col-span-7">
                <div 
                  ref={mobileGroupScrollContainerRef}
                  onScroll={handleMobileGroupScroll}
                  className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar gap-0 pb-4 scroll-smooth"
                  style={{ WebkitOverflowScrolling: 'touch' }}
                >
                  {visibleGroups.map(groupKey => (
                    <div 
                      key={groupKey} 
                      className="w-full shrink-0 snap-center snap-always px-1" 
                      style={{ scrollSnapStop: 'always' }}
                      data-group={groupKey}
                    >
                      {renderGroupDetails(groupKey)}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB: CALENDÁRIO COMPLETO */}
        {activeTab === "calendario" && (
          <div className="space-y-6 animate-fade-in">
            {/* Description & Filters Row */}
            <div className="bg-slate-900/40 p-4.5 rounded-2xl border border-slate-900 flex flex-col gap-4">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-emerald-400" /> Calendário Cronológico de Jogos
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Acompanhe a tabela completa dos 104 jogos em ordem cronológica de Brasília. Toque em qualquer jogo para editar o placar.
                  </p>
                </div>
                
                {/* Search Bar in Calendar */}
                <form onSubmit={handleSearchSubmit} className="relative w-full md:w-64">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                  <input 
                    type="text" 
                    placeholder="Buscar país, estádio ou cidade..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-9 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500/50"
                  />
                  {searchTerm && (
                    <button 
                      type="button"
                      onClick={() => setSearchTerm("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-350 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </form>
              </div>

              {/* Filters Row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 border-t border-slate-950/40">
                {/* Stage Filters */}
                <div className="flex flex-wrap gap-1.5 items-center">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mr-1">Fase:</span>
                  {[
                    { id: "all", label: "Todos" },
                    { id: "group", label: "Grupos" },
                    { id: "R32", label: "32-avos" },
                    { id: "R16", label: "Oitavas" },
                    { id: "QF", label: "Quartas" },
                    { id: "finals", label: "Finais" }
                  ].map(filter => (
                    <button
                      key={filter.id}
                      onClick={() => setCalendarStageFilter(filter.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition duration-200 cursor-pointer ${
                        calendarStageFilter === filter.id
                          ? "bg-emerald-500 text-slate-950 shadow-sm shadow-emerald-500/20"
                          : "bg-slate-950 text-slate-400 border border-slate-900 hover:text-slate-200 hover:bg-slate-900/50"
                      }`}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>

                {/* Status Filters */}
                <div className="flex flex-wrap gap-1.5 items-center">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mr-1">Status:</span>
                  {[
                    { id: "all", label: "Todos" },
                    { id: "played", label: "Finalizados" },
                    { id: "scheduled", label: "Agendados" }
                  ].map(filter => (
                    <button
                      key={filter.id}
                      onClick={() => setCalendarStatusFilter(filter.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition duration-200 cursor-pointer ${
                        calendarStatusFilter === filter.id
                          ? "bg-emerald-500 text-slate-950 shadow-sm shadow-emerald-500/20"
                          : "bg-slate-950 text-slate-400 border border-slate-900 hover:text-slate-200 hover:bg-slate-900/50"
                      }`}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Results Count Banner */}
            <div className="flex justify-between items-center px-1">
              <p className="text-xs text-slate-400">
                Mostrando <strong className="text-slate-200 font-bold">{filteredMatches.length}</strong> de <strong className="text-slate-350">{allMatches.length}</strong> jogos
              </p>
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm("")}
                  className="text-xs text-emerald-400 hover:text-emerald-300 font-bold transition cursor-pointer"
                >
                  Limpar busca
                </button>
              )}
            </div>

            {/* Matches Chronological Grid */}
            {filteredMatches.length > 0 ? (
              <div className="space-y-10">
                {/* 1. PRÓXIMOS JOGOS */}
                <div className="space-y-4">
                  <h3 className="text-sm font-extrabold text-emerald-400 uppercase tracking-wider pl-1 flex items-center gap-2">
                    <Play className="w-4 h-4 text-emerald-500 animate-pulse" /> 
                    <span>Próximos Jogos ({upcomingGroups.reduce((acc, g) => acc + g.matches.length, 0)})</span>
                  </h3>
                  
                  {upcomingGroups.length > 0 ? (
                    <div className="space-y-8">
                      {upcomingGroups.map(group => (
                        <div key={group.friendlyDate} className="space-y-3">
                          <div className="flex items-center gap-2 px-1">
                            <span className="text-xs font-bold text-slate-350 bg-slate-900 border border-slate-800 px-3 py-1 rounded-full shadow-xs">
                              {group.friendlyDate}
                            </span>
                            <div className="h-[1px] flex-1 bg-slate-900"></div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4.5">
                            {group.matches.map(match => renderCalendarMatchCard(match))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-slate-900/10 border border-slate-900/40 p-6 rounded-2xl text-center text-xs text-slate-500 italic">
                      Nenhum jogo agendado nos filtros selecionados.
                    </div>
                  )}
                </div>

                {/* 2. JOGOS FINALIZADOS */}
                <div className="space-y-4 pt-4 border-t border-slate-900/40">
                  <h3 className="text-sm font-extrabold text-slate-400 uppercase tracking-wider pl-1 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-slate-500" /> 
                    <span>Jogos Finalizados ({playedGroups.reduce((acc, g) => acc + g.matches.length, 0)})</span>
                  </h3>

                  {playedGroups.length > 0 ? (
                    <div className="space-y-8">
                      {playedGroups.map(group => (
                        <div key={group.friendlyDate} className="space-y-3">
                          <div className="flex items-center gap-2 px-1">
                            <span className="text-xs font-bold text-slate-300 bg-slate-900 border border-slate-850 px-3 py-1 rounded-full shadow-xs">
                              {group.friendlyDate}
                            </span>
                            <div className="h-[1px] flex-1 bg-slate-900/60"></div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4.5">
                            {group.matches.map(match => renderCalendarMatchCard(match))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-slate-900/10 border border-slate-900/40 p-6 rounded-2xl text-center text-xs text-slate-500 italic">
                      Nenhum jogo finalizado nos filtros selecionados.
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-slate-900/10 border border-slate-900 p-12 rounded-2xl text-center">
                <Calendar className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400 font-medium">Nenhum jogo encontrado com os filtros atuais.</p>
                <p className="text-xs text-slate-500 mt-1">Experimente limpar a busca ou selecionar outra fase.</p>
                {(searchTerm || calendarStageFilter !== "all" || calendarStatusFilter !== "all") && (
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      setCalendarStageFilter("all");
                      setCalendarStatusFilter("all");
                    }}
                    className="mt-4 bg-emerald-500 text-slate-950 font-bold text-xs py-2 px-4 rounded-xl transition cursor-pointer"
                  >
                    Resetar Filtros
                  </button>
                )}
              </div>
            )}
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
                  const hasManualKnockoutScores = Object.values(knockoutMatches).some(stage =>
                    stage.some(m => m.scoreHome !== "" || m.scoreAway !== "")
                  );
                  if (hasManualKnockoutScores) {
                    const confirmSim = window.confirm(
                      "Atenção: Você possui placares inseridos manualmente no mata-mata. Ao realizar a simulação automática dos confrontos, esses placares serão substituídos. Deseja continuar?"
                    );
                    if (!confirmSim) return;
                  }

                  const localKnockoutSync = simulateFullKnockoutState(groupMatches);
                  setKnockoutMatches(localKnockoutSync);
                  if (isAdminMode) {
                    if (isSupabaseConfigured) {
                      await syncMatchesToSupabase(groupMatches, localKnockoutSync);
                      setOfficialKnockoutMatches(localKnockoutSync);
                    }
                  } else {
                    setIsSimulationMode(true);
                    localStorage.setItem("copa_2026_knockout_matches", JSON.stringify(localKnockoutSync));
                  }
                }}
                disabled={isDbSyncing}
                className="w-full md:w-auto bg-slate-900 hover:bg-slate-850 text-slate-200 border border-slate-800 hover:border-slate-750 text-xs font-bold py-2 px-3.5 rounded-xl transition cursor-pointer"
              >
                Simular Só Mata-Mata
              </button>
            </div>

            {/* Mobile Knockout Stage Tabs */}
            <div className="sticky top-0 z-30 lg:hidden -mx-4 px-4 py-3 bg-slate-950/95 backdrop-blur-md border-b border-slate-900 shadow-md">
              <div className="relative">
                {/* Left Arrow overlay */}
                {showKoLeft && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent pr-4 pl-1 flex items-center z-10 pointer-events-none">
                    <ChevronLeft className="w-4 h-4 text-emerald-400" />
                  </div>
                )}

                {/* The scroll list */}
                <div 
                  ref={koScrollRef}
                  className="flex overflow-x-auto no-scrollbar gap-1.5 pb-1"
                >
                  {[
                    { id: "R32", label: "32-avos" },
                    { id: "R16", label: "Oitavas" },
                    { id: "QF", label: "Quartas" },
                    { id: "SF", label: "Semifinais" },
                    { id: "FI", label: "Decisões" }
                  ].map(phase => (
                    <button
                      key={phase.id}
                      onClick={() => scrollToKoColumn(phase.id)}
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

                {/* Right Arrow overlay */}
                {showKoRight && (
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 bg-gradient-to-l from-slate-950 via-slate-950/80 to-transparent pl-4 pr-1 flex items-center z-10 pointer-events-none">
                    <ChevronRight className="w-4 h-4 text-emerald-400" />
                  </div>
                )}
              </div>
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

              {/* Mobile View: Horizontal Scroll-snap columns */}
              <div className="lg:hidden relative -mx-4 px-4 overflow-hidden">
                <div 
                  ref={mobileKoScrollContainerRef}
                  onScroll={handleMobileKoScroll}
                  className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar gap-0 pb-4 scroll-smooth"
                  style={{ WebkitOverflowScrolling: 'touch' }}
                >
                  {/* 32-avos (R32) Column */}
                  <div className="w-full shrink-0 snap-center snap-always px-1" style={{ scrollSnapStop: 'always' }} data-phase="R32">
                    <div className="space-y-4">
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-wider text-center border-b border-slate-900 pb-2 mb-2">32-avos de Final</p>
                      <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1 custom-scrollbar">
                        {knockoutMatches.R32.map((match) => (
                          <KnockoutMatchCard key={match.id} match={match} stage="R32" teamMap={teamMap} onClick={() => openEditMatch(match, "R32")} />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Oitavas (R16) Column */}
                  <div className="w-full shrink-0 snap-center snap-always px-1" style={{ scrollSnapStop: 'always' }} data-phase="R16">
                    <div className="space-y-4">
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-wider text-center border-b border-slate-900 pb-2 mb-2">Oitavas de Final</p>
                      <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1 custom-scrollbar">
                        {knockoutMatches.R16.map((match) => (
                          <KnockoutMatchCard key={match.id} match={match} stage="R16" teamMap={teamMap} onClick={() => openEditMatch(match, "R16")} />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Quartas (QF) Column */}
                  <div className="w-full shrink-0 snap-center snap-always px-1" style={{ scrollSnapStop: 'always' }} data-phase="QF">
                    <div className="space-y-4">
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-wider text-center border-b border-slate-900 pb-2 mb-2">Quartas de Final</p>
                      <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1 custom-scrollbar">
                        {knockoutMatches.QF.map((match) => (
                          <KnockoutMatchCard key={match.id} match={match} stage="QF" teamMap={teamMap} onClick={() => openEditMatch(match, "QF")} />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Semifinais (SF) Column */}
                  <div className="w-full shrink-0 snap-center snap-always px-1" style={{ scrollSnapStop: 'always' }} data-phase="SF">
                    <div className="space-y-4">
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-wider text-center border-b border-slate-900 pb-2 mb-2">Semifinais</p>
                      <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1 custom-scrollbar">
                        {knockoutMatches.SF.map((match) => (
                          <KnockoutMatchCard key={match.id} match={match} stage="SF" teamMap={teamMap} onClick={() => openEditMatch(match, "SF")} />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Decisões (FI / T3) Column */}
                  <div className="w-full shrink-0 snap-center snap-always px-1" style={{ scrollSnapStop: 'always' }} data-phase="FI">
                    <div className="space-y-4">
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-wider text-center border-b border-slate-900 pb-2 mb-2">Decisões</p>
                      <div className="space-y-5 max-h-[70vh] overflow-y-auto pr-1 custom-scrollbar">
                        <div>
                          <p className="text-[10px] text-emerald-400 font-bold uppercase pb-1 border-b border-emerald-500/10 mb-2.5">Decisão do Campeão (Final)</p>
                          {knockoutMatches.FI.map((match) => (
                            <KnockoutMatchCard key={match.id} match={match} stage="FI" teamMap={teamMap} onClick={() => openEditMatch(match, "FI")} />
                          ))}
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-500 font-bold uppercase pb-1 border-b border-slate-800/60 mb-2.5">Decisão de Terceiro Lugar</p>
                          {knockoutMatches.T3.map((match) => (
                            <KnockoutMatchCard key={match.id} match={match} stage="T3" teamMap={teamMap} onClick={() => openEditMatch(match, "T3")} />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
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
            { id: "calendario", label: "Calendário", icon: Calendar },
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
                <span className="text-xs">{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* BOTTOM SHEET / DIALOG FOR EDITING MATCH SCORES (Responsive Sheet for Mobile, Modal for Desktop) */}
      {selectedMatch && (
        <div 
          className="fixed inset-0 z-50 flex items-end lg:items-center justify-center p-0 lg:p-4 bottom-sheet-backdrop"
          style={{
            backgroundColor: `rgba(3, 7, 18, ${Math.max(0, 0.6 * (1 - matchSwipe.dragY / 300))})`,
            backdropFilter: `blur(${Math.max(0, 4 * (1 - matchSwipe.dragY / 250))}px)`,
            transition: matchSwipe.isDragging ? 'none' : 'background-color 0.3s ease-out, backdrop-filter 0.3s ease-out'
          }}
        >
          
          {/* Backdrop dismisser tap area */}
          <div 
            className="absolute inset-0 cursor-default" 
            onClick={() => setSelectedMatch(null)}
          ></div>
          
          {/* Sheet container */}
          <div 
            ref={matchSwipe.containerRef}
            className="w-full lg:max-w-lg bg-slate-950 lg:rounded-2xl border border-slate-900 p-4 sm:p-6 flex flex-col gap-4 sm:gap-5 relative z-10 bottom-sheet-container open shadow-2xl safe-bottom max-h-[90vh] overflow-y-auto no-scrollbar overscroll-contain"
            style={{
              transform: `translateY(${matchSwipe.dragY}px)`,
              transition: matchSwipe.isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.32, 0.94, 0.6, 1)'
            }}
          >
            
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
            <div className="bg-slate-900/60 border border-slate-900/80 p-3 sm:p-3.5 rounded-xl flex items-start gap-2.5 sm:gap-3 text-xs">
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
              <div className="space-y-4 sm:space-y-5">
                <div className="flex justify-between items-center gap-1.5 sm:gap-2">
                  
                  {/* Home Team */}
                  <div className="flex-1 flex flex-col items-center gap-1 sm:gap-2 text-center max-w-[35%] sm:max-w-[40%] min-w-0">
                    <TeamFlag teamId={selectedMatch.home} className="w-10 h-7 sm:w-14 sm:h-10 object-cover rounded shadow-md shrink-0" />
                    <span className="font-extrabold text-[10px] sm:text-xs text-slate-100 truncate w-full">
                      {teamMap[selectedMatch.home]?.name}
                    </span>
                    <span className="text-[9px] sm:text-[10px] text-slate-500 font-mono shrink-0">Rating: {TEAM_RATINGS[selectedMatch.home]}</span>
                  </div>

                  {/* Inputs and Counters */}
                  <div className="flex items-center gap-1 sm:gap-2 bg-slate-900 p-1.5 sm:p-2 rounded-xl sm:rounded-2xl border border-slate-800 shrink-0">
                    
                    {/* Home Incrementers */}
                    <div className="flex flex-col gap-0.5 sm:gap-1">
                      <button 
                        onClick={() => {
                          const val = parseInt(editingScoreHome, 10) || 0;
                          setEditingScoreHome((val + 1).toString());
                        }}
                        className="p-0.5 sm:p-1 rounded bg-slate-950 hover:bg-slate-850 border border-slate-900 text-slate-300 cursor-pointer"
                      >
                        <Plus className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                      </button>
                      <button 
                        onClick={() => {
                          const val = parseInt(editingScoreHome, 10) || 0;
                          setEditingScoreHome(Math.max(0, val - 1).toString());
                        }}
                        className="p-0.5 sm:p-1 rounded bg-slate-950 hover:bg-slate-850 border border-slate-900 text-slate-300 cursor-pointer"
                      >
                        <Minus className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                      </button>
                    </div>

                    <input 
                      type="text" 
                      inputMode="numeric" 
                      pattern="[0-9]*"
                      value={editingScoreHome}
                      onChange={(e) => setEditingScoreHome(e.target.value.replace(/\D/g, '').slice(0, 2))}
                      placeholder="0"
                      className="w-9 h-11 sm:w-12 sm:h-14 bg-slate-950 border border-slate-800 rounded-lg sm:rounded-xl text-center text-lg sm:text-xl font-bold font-mono text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                    
                    <span className="text-slate-600 font-black text-base sm:text-lg px-0.5">:</span>
                    
                    <input 
                      type="text" 
                      inputMode="numeric" 
                      pattern="[0-9]*"
                      value={editingScoreAway}
                      onChange={(e) => setEditingScoreAway(e.target.value.replace(/\D/g, '').slice(0, 2))}
                      placeholder="0"
                      className="w-9 h-11 sm:w-12 sm:h-14 bg-slate-950 border border-slate-800 rounded-lg sm:rounded-xl text-center text-lg sm:text-xl font-bold font-mono text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />

                    {/* Away Incrementers */}
                    <div className="flex flex-col gap-0.5 sm:gap-1">
                      <button 
                        onClick={() => {
                          const val = parseInt(editingScoreAway, 10) || 0;
                          setEditingScoreAway((val + 1).toString());
                        }}
                        className="p-0.5 sm:p-1 rounded bg-slate-950 hover:bg-slate-850 border border-slate-900 text-slate-300 cursor-pointer"
                      >
                        <Plus className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                      </button>
                      <button 
                        onClick={() => {
                          const val = parseInt(editingScoreAway, 10) || 0;
                          setEditingScoreAway(Math.max(0, val - 1).toString());
                        }}
                        className="p-0.5 sm:p-1 rounded bg-slate-950 hover:bg-slate-850 border border-slate-900 text-slate-300 cursor-pointer"
                      >
                        <Minus className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                      </button>
                    </div>

                  </div>

                  {/* Away Team */}
                  <div className="flex-1 flex flex-col items-center gap-1 sm:gap-2 text-center max-w-[35%] sm:max-w-[40%] min-w-0">
                    <TeamFlag teamId={selectedMatch.away} className="w-10 h-7 sm:w-14 sm:h-10 object-cover rounded shadow-md shrink-0" />
                    <span className="font-extrabold text-[10px] sm:text-xs text-slate-100 truncate w-full">
                      {teamMap[selectedMatch.away]?.name}
                    </span>
                    <span className="text-[9px] sm:text-[10px] text-slate-500 font-mono shrink-0">Rating: {TEAM_RATINGS[selectedMatch.away]}</span>
                  </div>

                </div>

                {/* Penalty Shootout section (only for tie in knockout stages) */}
                {selectedMatch.type !== "group" && 
                 editingScoreHome !== "" && 
                 editingScoreAway !== "" && 
                 parseInt(editingScoreHome, 10) === parseInt(editingScoreAway, 10) && (
                  <div className="bg-slate-900 border border-slate-900/60 p-3 sm:p-4 rounded-xl space-y-3.5 transition-all">
                    <div className="text-center">
                      <span className="text-[9px] sm:text-[10px] text-amber-400 font-extrabold uppercase bg-amber-500/10 px-2 py-0.5 rounded">
                        Decisão por Pênaltis Necessária
                      </span>
                    </div>
                    
                    <div className="flex justify-center items-center gap-2 sm:gap-4">
                      <div className="flex flex-col items-center flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-1.5 max-w-full">
                          <TeamFlag teamId={selectedMatch.home} className="w-4 h-3 object-cover rounded shadow-xs shrink-0" />
                          <span className="text-[10px] text-slate-450 font-extrabold truncate max-w-[80px] sm:max-w-[120px]">
                            {teamMap[selectedMatch.home]?.name}
                          </span>
                        </div>
                        <input 
                          type="text" 
                          inputMode="numeric" 
                          pattern="[0-9]*"
                          value={editingPenHome}
                          onChange={(e) => setEditingPenHome(e.target.value.replace(/\D/g, '').slice(0, 2))}
                          placeholder="5"
                          className="w-10 h-9 sm:w-12 sm:h-10 bg-slate-950 border border-slate-800 rounded-lg text-center font-bold font-mono text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-sm sm:text-base"
                        />
                      </div>
                      <span className="text-slate-700 font-bold self-end mb-2 sm:mb-2.5">x</span>
                      <div className="flex flex-col items-center flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-1.5 max-w-full">
                          <TeamFlag teamId={selectedMatch.away} className="w-4 h-3 object-cover rounded shadow-xs shrink-0" />
                          <span className="text-[10px] text-slate-450 font-extrabold truncate max-w-[80px] sm:max-w-[120px]">
                            {teamMap[selectedMatch.away]?.name}
                          </span>
                        </div>
                        <input 
                          type="text" 
                          inputMode="numeric" 
                          pattern="[0-9]*"
                          value={editingPenAway}
                          onChange={(e) => setEditingPenAway(e.target.value.replace(/\D/g, '').slice(0, 2))}
                          placeholder="4"
                          className="w-10 h-9 sm:w-12 sm:h-10 bg-slate-950 border border-slate-800 rounded-lg text-center font-bold font-mono text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-sm sm:text-base"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Panel Actions */}
                <div className="flex gap-2 pt-3">
                  <button 
                    onClick={simulateSingleMatchInSheet}
                    disabled={isDbSyncing}
                    className="flex-1 bg-slate-900 hover:bg-slate-850 text-slate-200 border border-slate-800 hover:border-slate-750 font-bold py-2.5 px-2 sm:py-3 sm:px-4 rounded-xl transition duration-200 cursor-pointer flex items-center justify-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs disabled:opacity-50"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> Simular Jogo
                  </button>
                  <button 
                    onClick={saveMatchScore}
                    disabled={isDbSyncing}
                    className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black py-2.5 px-2 sm:py-3 sm:px-4 rounded-xl transition duration-200 cursor-pointer text-[11px] sm:text-xs disabled:opacity-50"
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

      {/* TEAM PROFILE MODAL / DRAWER */}
      {selectedTeam && (() => {
        const teamInfo = teamMap[selectedTeam];
        const playerData = TEAM_PLAYERS[selectedTeam];
        if (!teamInfo || !playerData) return null;

        return (
          <div 
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-xs animate-fade-in"
            style={{
              backgroundColor: `rgba(2, 6, 23, ${Math.max(0, 0.8 * (1 - teamSwipe.dragY / 300))})`,
              backdropFilter: `blur(${Math.max(0, 4 * (1 - teamSwipe.dragY / 250))}px)`,
              transition: teamSwipe.isDragging ? 'none' : 'background-color 0.3s ease-out, backdrop-filter 0.3s ease-out'
            }}
          >
            {/* Backdrop click to close */}
            <div className="absolute inset-0 cursor-default" onClick={() => setSelectedTeam(null)}></div>
            
            {/* Container */}
            <div 
              ref={teamSwipe.containerRef}
              className="relative w-full sm:max-w-lg bg-[#151d30] border border-slate-800 rounded-t-3xl sm:rounded-2xl overflow-hidden shadow-2xl z-10 max-h-[90vh] flex flex-col animate-slide-up sm:animate-zoom-in"
              style={{
                transform: `translateY(${teamSwipe.dragY}px)`,
                transition: teamSwipe.isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.32, 0.94, 0.6, 1)',
                animation: teamSwipe.isDragging || teamSwipe.dragY > 0 ? 'none' : undefined
              }}
            >
              
              {/* Slide handle on mobile */}
              <div className="w-12 h-1 bg-slate-800 rounded-full mx-auto mt-3 sm:hidden"></div>

              {/* Header */}
              <div className="relative p-5 border-b border-slate-850/85 bg-gradient-to-b from-emerald-950/20 to-[#151d30] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <TeamFlag teamId={selectedTeam} className="w-10 h-7 object-cover rounded shadow-md" />
                  <div>
                    <h3 className="text-lg font-black text-slate-100 flex items-center gap-1.5 leading-none">
                      {teamInfo.name}
                    </h3>
                    <p className="text-xs text-slate-450 font-medium mt-1.5">
                      Grupo {teamInfo.groupKey} • FIFA Rank Est. #{playerData.ranking}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedTeam(null)}
                  className="p-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-850 text-slate-450 hover:text-slate-200 border border-slate-800 transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto space-y-6 no-scrollbar overscroll-contain">
                {/* Coach & Simulator Rating */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-950/45 p-3.5 rounded-xl border border-slate-900/60">
                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Treinador</span>
                    <p className="text-sm font-bold text-slate-200 mt-1">{playerData.coach}</p>
                  </div>
                  <div className="bg-slate-950/45 p-3.5 rounded-xl border border-slate-900/60">
                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Força Simulador</span>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm font-black text-emerald-450 font-mono">{TEAM_RATINGS[selectedTeam] || 70}</span>
                      <div className="flex-1 bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-850">
                        <div 
                          className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full" 
                          style={{ width: `${TEAM_RATINGS[selectedTeam] || 70}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="text-xs text-slate-400 leading-relaxed bg-slate-950/25 p-4 rounded-xl border border-slate-900/40">
                  {playerData.description}
                </div>

                {/* Key Players */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 pl-1">
                    <Users className="w-4 h-4 text-emerald-400" /> Jogadores em Destaque
                  </h4>
                  <div className="space-y-2.5">
                    {playerData.players.map((player, idx) => (
                      <div 
                        key={idx} 
                        className={`p-3 rounded-xl border flex items-center justify-between ${
                          player.star 
                            ? "bg-emerald-950/10 border-emerald-500/20 shadow-xs shadow-emerald-500/[0.02]" 
                            : "bg-slate-950/30 border-slate-900/60"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                            player.star 
                              ? "bg-emerald-500 text-slate-950" 
                              : "bg-slate-900 text-slate-400"
                          }`}>
                            {player.star ? <Sparkles className="w-3.5 h-3.5" /> : idx + 1}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs md:text-sm font-bold text-slate-100 truncate">{player.name}</span>
                              {player.star && (
                                <span className="text-[8px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded-full border border-emerald-500/20 font-bold uppercase tracking-wider shrink-0">
                                  Estrela
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-500 block mt-0.5">{player.pos}</span>
                          </div>
                        </div>
                        <span className="text-[10px] font-semibold text-slate-400 bg-slate-900/50 px-2 py-1 rounded-lg border border-slate-850 shrink-0">
                          {player.club}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-slate-850 bg-slate-950/30 flex justify-end">
                <button 
                  onClick={() => setSelectedTeam(null)}
                  className="w-full sm:w-auto bg-slate-900 hover:bg-slate-850 text-slate-200 border border-slate-800 hover:border-slate-750 text-xs font-bold py-2.5 px-5 rounded-xl transition cursor-pointer"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        );
      })()}
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
      className="bg-slate-900 border border-slate-900 hover:border-slate-800 p-3 rounded-xl transition duration-200 cursor-pointer flex flex-col justify-center text-xs md:text-sm group shadow animate-fade-in"
    >
      <div className="flex justify-between items-center text-[10px] md:text-xs text-slate-500 border-b border-slate-950 pb-1.5 mb-2.5">
        <span className="font-bold">{match.id}</span>
        <span>Mata-mata</span>
      </div>

      <div className="space-y-2">
        {/* Home */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-1.5 max-w-[78%] truncate">
            {home ? (
              <>
                <TeamFlag teamId={match.home} className="w-4 h-3 object-cover rounded shadow-xs inline-block align-middle mr-1" />
                <span className={`font-bold truncate ${homeWinner ? "text-emerald-400 font-extrabold" : hasPlayed ? "text-slate-400" : "text-slate-200"}`}>
                  {home.name}
                </span>
              </>
            ) : (
              <span className="text-slate-500 font-mono text-xs">—</span>
            )}
          </div>
          
          <div className="flex items-center gap-1 font-mono text-xs md:text-sm">
            {hasPlayed && (
              <>
                {match.penHome !== "" && (
                  <span className="text-[10px] md:text-xs text-slate-500 bg-slate-950 px-1 rounded">({match.penHome})</span>
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
                <TeamFlag teamId={match.away} className="w-4 h-3 object-cover rounded shadow-xs inline-block align-middle mr-1" />
                <span className={`font-bold truncate ${awayWinner ? "text-emerald-400 font-extrabold" : hasPlayed ? "text-slate-400" : "text-slate-200"}`}>
                  {away.name}
                </span>
              </>
            ) : (
              <span className="text-slate-500 font-mono text-xs">—</span>
            )}
          </div>
          
          <div className="flex items-center gap-1 font-mono text-xs md:text-sm">
            {hasPlayed && (
              <>
                {match.penAway !== "" && (
                  <span className="text-[10px] md:text-xs text-slate-500 bg-slate-950 px-1 rounded">({match.penAway})</span>
                )}
                <span className={`font-bold w-4 text-center ${awayWinner ? "text-emerald-400" : "text-slate-500"}`}>{match.scoreAway}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Date & Venue Info */}
      {match.date && (
        <div className="text-[9px] text-slate-500 border-t border-slate-950/20 pt-2 mt-2.5 flex flex-col gap-0.5 leading-tight select-none">
          <div className="flex justify-between items-center text-slate-400 font-semibold">
            <span>{match.date} • {getBrasiliaTime(match.localTime, match.fuso)} (DF)</span>
            <span className="text-slate-500 font-mono text-[8px]">{match.cidade}</span>
          </div>
          <span className="text-[8px] text-slate-600 truncate">{match.estadio}</span>
        </div>
      )}
      
      {/* Edit overlay prompt */}
      {!home || !away ? (
        <div className="text-[10px] md:text-xs text-slate-600 border-t border-slate-950/40 pt-1.5 mt-2 flex items-center justify-between">
          <span>Aguardando confrontos</span>
        </div>
      ) : !hasPlayed ? (
        <div className="text-[10px] md:text-xs text-emerald-500/70 border-t border-slate-950/40 pt-1.5 mt-2 flex items-center justify-between group-hover:text-emerald-400 transition font-bold uppercase">
          <span>Registrar placar</span>
          <Plus className="w-2.5 h-2.5" />
        </div>
      ) : (
        <div className="text-[10px] md:text-xs text-slate-500 border-t border-slate-950/45 pt-1.5 mt-2 flex items-center justify-between">
          <span className="truncate">Confirmado</span>
          <span className="text-slate-600">Editar</span>
        </div>
      )}
    </div>
  );
}
