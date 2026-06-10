// Forças reais aproximadas das seleções para simulações realistas (0 a 100)
export const TEAM_RATINGS = {
  ARG: 95, FRA: 94, BRA: 93, ENG: 92, ESP: 91, POR: 90, NED: 89, URU: 88, GER: 88, BEL: 87, 
  CRO: 86, ITA: 85, COL: 85, MAR: 85, JPN: 84, SUI: 83, USA: 82, SEN: 82, NOR: 82, MEX: 81, 
  KOR: 81, SWE: 81, AUT: 80, ECU: 80, CIV: 79, CZE: 78, UKR: 78, TUR: 78, AUS: 78, EGY: 78, 
  IRN: 77, CAN: 77, RSA: 74, TUN: 74, BIH: 74, PAR: 75, SCO: 75, GHA: 74, COD: 72, PAN: 71, 
  UZB: 71, QAT: 70, CPV: 70, KSA: 70, IRQ: 70, BOL: 68, JOR: 66, HAI: 65, CUW: 62, NZL: 64,
  ALG: 76
};

export const INITIAL_GROUPS_DATA = {
  A: {
    name: "Grupo A",
    teams: [
      { id: "MEX", name: "México", flag: "🇲🇽" },
      { id: "RSA", name: "África do Sul", flag: "🇿🇦" },
      { id: "KOR", name: "Coreia do Sul", flag: "🇰🇷" },
      { id: "CZE", name: "República Tcheca", flag: "🇨🇿" }
    ]
  },
  B: {
    name: "Grupo B",
    teams: [
      { id: "CAN", name: "Canadá", flag: "🇨🇦" },
      { id: "BIH", name: "Bósnia", flag: "🇧🇦" },
      { id: "QAT", name: "Catar", flag: "🇶🇦" },
      { id: "SUI", name: "Suíça", flag: "🇨🇭" }
    ]
  },
  C: {
    name: "Grupo C",
    teams: [
      { id: "BRA", name: "Brasil", flag: "🇧🇷" },
      { id: "MAR", name: "Marrocos", flag: "🇲🇦" },
      { id: "HAI", name: "Haiti", flag: "🇭🇹" },
      { id: "SCO", name: "Escócia", flag: "🏴" }
    ]
  },
  D: {
    name: "Grupo D",
    teams: [
      { id: "USA", name: "Estados Unidos", flag: "🇺🇸" },
      { id: "PAR", name: "Paraguai", flag: "🇵🇾" },
      { id: "AUS", name: "Austrália", flag: "🇦🇺" },
      { id: "TUR", name: "Turquia", flag: "🇹🇷" }
    ]
  },
  E: {
    name: "Grupo E",
    teams: [
      { id: "GER", name: "Alemanha", flag: "🇩🇪" },
      { id: "CUW", name: "Curaçao", flag: "🇨🇼" },
      { id: "CIV", name: "Costa do Marfim", flag: "🇨🇮" },
      { id: "ECU", name: "Equador", flag: "🇪🇨" }
    ]
  },
  F: {
    name: "Grupo F",
    teams: [
      { id: "NED", name: "Holanda", flag: "🇳🇱" },
      { id: "JPN", name: "Japão", flag: "🇯🇵" },
      { id: "SWE", name: "Suécia", flag: "🇸🇪" },
      { id: "TUN", name: "Tunísia", flag: "🇹🇳" }
    ]
  },
  G: {
    name: "Grupo G",
    teams: [
      { id: "BEL", name: "Bélgica", flag: "🇧🇪" },
      { id: "EGY", name: "Egito", flag: "🇪🇬" },
      { id: "IRN", name: "Irã", flag: "🇮🇷" },
      { id: "NZL", name: "Nova Zelândia", flag: "🇳🇿" }
    ]
  },
  H: {
    name: "Grupo H",
    teams: [
      { id: "ESP", name: "Espanha", flag: "🇪🇸" },
      { id: "CPV", name: "Cabo Verde", flag: "🇨🇻" },
      { id: "KSA", name: "Arábia Saudita", flag: "🇸🇦" },
      { id: "URU", name: "Uruguai", flag: "🇺🇾" }
    ]
  },
  I: {
    name: "Grupo I",
    teams: [
      { id: "FRA", name: "França", flag: "🇫🇷" },
      { id: "SEN", name: "Senegal", flag: "🇸🇳" },
      { id: "NOR", name: "Noruega", flag: "🇳🇴" },
      { id: "IRQ", name: "Iraque", flag: "🇮🇶" }
    ]
  },
  J: {
    name: "Grupo J",
    teams: [
      { id: "ARG", name: "Argentina", flag: "🇦🇷" },
      { id: "ALG", name: "Argélia", flag: "🇩🇿" },
      { id: "AUT", name: "Áustria", flag: "🇦🇹" },
      { id: "JOR", name: "Jordânia", flag: "🇯🇴" }
    ]
  },
  K: {
    name: "Grupo K",
    teams: [
      { id: "POR", name: "Portugal", flag: "🇵🇹" },
      { id: "COD", name: "RD do Congo", flag: "🇨🇩" },
      { id: "UZB", name: "Uzbequistão", flag: "🇺🇿" },
      { id: "COL", name: "Colômbia", flag: "🇨🇴" }
    ]
  },
  L: {
    name: "Grupo L",
    teams: [
      { id: "ENG", name: "Inglaterra", flag: "🏴" },
      { id: "CRO", name: "Croácia", flag: "🇭🇷" },
      { id: "PAN", name: "Panamá", flag: "🇵🇦" },
      { id: "GHA", name: "Gana", flag: "🇬🇭" }
    ]
  }
};

// Banco de dados de jogadores destaque (Estrelas) para cada uma das 48 seleções
export const TEAM_PLAYERS = {
  ARG: {
    coach: "Lionel Scaloni",
    ranking: 1,
    description: "Campeã mundial em 2022, a Argentina chega como uma das grandes favoritas trazendo uma mescla de astros experientes e jovens talentos.",
    players: [
      { name: "Lionel Messi", pos: "Atacante", club: "Inter Miami (EUA)", star: true },
      { name: "Lautaro Martínez", pos: "Atacante", club: "Inter de Milão (ITA)", star: false },
      { name: "Alexis Mac Allister", pos: "Meio-campista", club: "Liverpool (ING)", star: false }
    ]
  },
  FRA: {
    coach: "Didier Deschamps",
    ranking: 2,
    description: "Com um elenco estelar e muita força física, a França busca reconquistar o topo do futebol mundial liderada por Mbappé.",
    players: [
      { name: "Kylian Mbappé", pos: "Atacante", club: "Real Madrid (ESP)", star: true },
      { name: "Antoine Griezmann", pos: "Meio-campista", club: "Atlético de Madrid (ESP)", star: false },
      { name: "William Saliba", pos: "Defensor", club: "Arsenal (ING)", star: false }
    ]
  },
  BRA: {
    coach: "Dorival Júnior",
    ranking: 5,
    description: "Buscando o hexacampeonato, a seleção brasileira aposta no brilho de seus pontas no futebol europeu e solidez no meio.",
    players: [
      { name: "Vinícius Júnior", pos: "Atacante", club: "Real Madrid (ESP)", star: true },
      { name: "Rodrygo Goes", pos: "Atacante", club: "Real Madrid (ESP)", star: false },
      { name: "Bruno Guimarães", pos: "Meio-campista", club: "Newcastle (ING)", star: false }
    ]
  },
  ENG: {
    coach: "Thomas Tuchel",
    ranking: 3,
    description: "Com uma das gerações mais talentosas de sua história, o English Team sonha em levantar o troféu mundial após décadas.",
    players: [
      { name: "Jude Bellingham", pos: "Meio-campista", club: "Real Madrid (ESP)", star: true },
      { name: "Harry Kane", pos: "Atacante", club: "Bayern de Munique (ALE)", star: false },
      { name: "Bukayo Saka", pos: "Atacante", club: "Arsenal (ING)", star: false }
    ]
  },
  ESP: {
    coach: "Luis de la Fuente",
    ranking: 4,
    description: "Atual campeã europeia, a Espanha apresenta um futebol envolvente de posse de bola e pontas extremamente velozes.",
    players: [
      { name: "Rodri Hernández", pos: "Meio-campista", club: "Manchester City (ING)", star: true },
      { name: "Lamine Yamal", pos: "Atacante", club: "Barcelona (ESP)", star: true },
      { name: "Pedri González", pos: "Meio-campista", club: "Barcelona (ESP)", star: false }
    ]
  },
  POR: {
    coach: "Roberto Martínez",
    ranking: 7,
    description: "Com fartura de talento técnico em todas as posições, Portugal quer coroar a lendária carreira de Cristiano Ronaldo.",
    players: [
      { name: "Cristiano Ronaldo", pos: "Atacante", club: "Al-Nassr (ARA)", star: true },
      { name: "Bruno Fernandes", pos: "Meio-campista", club: "Manchester United (ING)", star: false },
      { name: "Bernardo Silva", pos: "Meio-campista", club: "Manchester City (ING)", star: false }
    ]
  },
  NED: {
    coach: "Ronald Koeman",
    ranking: 8,
    description: "A Laranja Mecânica exibe uma defesa mundialmente temida e um jogo coletivo estruturado e muito dinâmico.",
    players: [
      { name: "Virgil van Dijk", pos: "Defensor", club: "Liverpool (ING)", star: true },
      { name: "Frenkie de Jong", pos: "Meio-campista", club: "Barcelona (ESP)", star: false },
      { name: "Cody Gakpo", pos: "Atacante", club: "Liverpool (ING)", star: false }
    ]
  },
  URU: {
    coach: "Marcelo Bielsa",
    ranking: 11,
    description: "Sob o comando enérgico de Bielsa, o Uruguai joga com marcação alta, transição fulminante e muita garra charrua.",
    players: [
      { name: "Federico Valverde", pos: "Meio-campista", club: "Real Madrid (ESP)", star: true },
      { name: "Darwin Núñez", pos: "Atacante", club: "Liverpool (ING)", star: false },
      { name: "Ronald Araújo", pos: "Defensor", club: "Barcelona (ESP)", star: false }
    ]
  },
  GER: {
    coach: "Julian Nagelsmann",
    ranking: 12,
    description: "Reconstruída sob nova liderança jovem, a Alemanha aposta em meias criativos brilhantes para controlar o torneio.",
    players: [
      { name: "Florian Wirtz", pos: "Meio-campista", club: "Bayer Leverkusen (ALE)", star: true },
      { name: "Jamal Musiala", pos: "Meio-campista", club: "Bayern de Munique (ALE)", star: true },
      { name: "Antonio Rüdiger", pos: "Defensor", club: "Real Madrid (ESP)", star: false }
    ]
  },
  BEL: {
    coach: "Domenico Tedesco",
    ranking: 10,
    description: "Buscando transição de sua 'Geração de Ouro', a Bélgica ainda depende da genialidade de De Bruyne na armação.",
    players: [
      { name: "Kevin De Bruyne", pos: "Meio-campista", club: "Manchester City (ING)", star: true },
      { name: "Romelu Lukaku", pos: "Atacante", club: "Roma (ITA)", star: false },
      { name: "Jeremy Doku", pos: "Atacante", club: "Manchester City (ING)", star: false }
    ]
  },
  CRO: {
    coach: "Zlatko Dalić",
    ranking: 13,
    description: "Vice-campeã em 2018 e terceira em 2022, a Croácia ostenta resiliência defensiva e o controle mental de Luka Modrić.",
    players: [
      { name: "Luka Modrić", pos: "Meio-campista", club: "Real Madrid (ESP)", star: true },
      { name: "Joško Gvardiol", pos: "Defensor", club: "Manchester City (ING)", star: false },
      { name: "Mateo Kovačić", pos: "Meio-campista", club: "Manchester City (ING)", star: false }
    ]
  },
  COL: {
    coach: "Néstor Lorenzo",
    ranking: 15,
    description: "Com uma grande sequência invicta nas Eliminatórias, a Colômbia mescla a velocidade de Díaz e a maestria de James.",
    players: [
      { name: "Luis Díaz", pos: "Atacante", club: "Liverpool (ING)", star: true },
      { name: "James Rodríguez", pos: "Meio-campista", club: "Rayo Vallecano (ESP)", star: false },
      { name: "Jhon Durán", pos: "Atacante", club: "Aston Villa (ING)", star: false }
    ]
  },
  MAR: {
    coach: "Walid Regragui",
    ranking: 14,
    description: "Semifinalistas históricos em 2022, os Leões do Atlas trazem disciplina defensiva implacável e forte apoio lateral.",
    players: [
      { name: "Achraf Hakimi", pos: "Defensor", club: "PSG (FRA)", star: true },
      { name: "Sofyan Amrabat", pos: "Meio-campista", club: "Fenerbahçe (TUR)", star: false },
      { name: "Yassine Bounou", pos: "Goleiro", club: "Al-Hilal (ARA)", star: false }
    ]
  },
  JPN: {
    coach: "Hajime Moriyasu",
    ranking: 16,
    description: "Destaque pela disciplina tática e contra-ataques ultrarrápidos, os Samurais Azuis querem fazer história.",
    players: [
      { name: "Kaoru Mitoma", pos: "Atacante", club: "Brighton (ING)", star: true },
      { name: "Takefusa Kubo", pos: "Meio-campista", club: "Real Sociedad (ESP)", star: false },
      { name: "Wataru Endo", pos: "Meio-campista", club: "Liverpool (ING)", star: false }
    ]
  },
  SUI: {
    coach: "Murat Yakin",
    ranking: 19,
    description: "Muito competitiva e organizada, a Suíça é figurinha carimbada no mata-mata das principais competições internacionais.",
    players: [
      { name: "Granit Xhaka", pos: "Meio-campista", club: "Bayer Leverkusen (ALE)", star: true },
      { name: "Manuel Akanji", pos: "Defensor", club: "Manchester City (ING)", star: false },
      { name: "Yann Sommer", pos: "Goleiro", club: "Inter de Milão (ITA)", star: false }
    ]
  },
  USA: {
    coach: "Mauricio Pochettino",
    ranking: 22,
    description: "Jogando em casa, a seleção americana chega com sua geração europeia mais madura, liderada pelo 'Capitão América' Pulisic.",
    players: [
      { name: "Christian Pulisic", pos: "Atacante", club: "Milan (ITA)", star: true },
      { name: "Weston McKennie", pos: "Meio-campista", club: "Juventus (ITA)", star: false },
      { name: "Antonee Robinson", pos: "Defensor", club: "Fulham (ING)", star: false }
    ]
  },
  SEN: {
    coach: "Aliou Cissé",
    ranking: 21,
    description: "Uma das maiores potências africanas, Senegal tem atletas muito físicos e experientes nas principais ligas europeias.",
    players: [
      { name: "Sadio Mané", pos: "Atacante", club: "Al-Nassr (ARA)", star: true },
      { name: "Nicolas Jackson", pos: "Atacante", club: "Chelsea (ING)", star: false },
      { name: "Kalidou Koulibaly", pos: "Defensor", club: "Al-Hilal (ARA)", star: false }
    ]
  },
  NOR: {
    coach: "Ståle Solbakken",
    ranking: 44,
    description: "De volta aos grandes palcos, a Noruega tem o ataque mais perigoso do mundo liderado pela máquina de gols Erling Haaland.",
    players: [
      { name: "Erling Haaland", pos: "Atacante", club: "Manchester City (ING)", star: true },
      { name: "Martin Ødegaard", pos: "Meio-campista", club: "Arsenal (ING)", star: true },
      { name: "Alexander Sørloth", pos: "Atacante", club: "Atlético de Madrid (ESP)", star: false }
    ]
  },
  MEX: {
    coach: "Javier Aguirre",
    ranking: 17,
    description: "Sendo um dos países sedes, o México aposta na calorosa torcida e força coletiva para passar das oitavas.",
    players: [
      { name: "Santiago Giménez", pos: "Atacante", club: "Feyenoord (HOL)", star: true },
      { name: "Edson Álvarez", pos: "Meio-campista", club: "West Ham (ING)", star: false },
      { name: "Hirving Lozano", pos: "Atacante", club: "San Diego FC (EUA)", star: false }
    ]
  },
  KOR: {
    coach: "Hong Myung-bo",
    ranking: 23,
    description: "Velozes e técnicos, os sul-coreanos buscam surpreender os favoritos apoiando-se no astro Son da Premier League.",
    players: [
      { name: "Son Heung-min", pos: "Atacante", club: "Tottenham (ING)", star: true },
      { name: "Kim Min-jae", pos: "Defensor", club: "Bayern de Munique (ALE)", star: false },
      { name: "Lee Kang-in", pos: "Meio-campista", club: "PSG (FRA)", star: false }
    ]
  },
  SWE: {
    coach: "Jon Dahl Tomasson",
    ranking: 28,
    description: "Com um ataque extremamente prolífico liderado por Gyökeres e Isak, a Suécia propõe jogos verticais de muitos gols.",
    players: [
      { name: "Viktor Gyökeres", pos: "Atacante", club: "Sporting CP (POR)", star: true },
      { name: "Alexander Isak", pos: "Atacante", club: "Newcastle (ING)", star: false },
      { name: "Dejan Kulusevski", pos: "Meio-campista", club: "Tottenham (ING)", star: false }
    ]
  },
  AUT: {
    coach: "Ralf Rangnick",
    ranking: 25,
    description: "Com o moderno estilo 'Gegenpressing' de Rangnick, a Áustria sufoca adversários e joga com alta intensidade.",
    players: [
      { name: "David Alaba", pos: "Defensor", club: "Real Madrid (ESP)", star: true },
      { name: "Marcel Sabitzer", pos: "Meio-campista", club: "Dortmund (ALE)", star: false },
      { name: "Konrad Laimer", pos: "Meio-campista", club: "Bayern de Munique (ALE)", star: false }
    ]
  },
  ECU: {
    coach: "Sebastián Beccacece",
    ranking: 30,
    description: "O Equador exibe uma excelente safra física e defensiva, competindo em altíssimo nível na América do Sul.",
    players: [
      { name: "Moisés Caicedo", pos: "Meio-campista", club: "Chelsea (ING)", star: true },
      { name: "Piero Hincapié", pos: "Defensor", club: "Bayer Leverkusen (ALE)", star: false },
      { name: "Enner Valencia", pos: "Atacante", club: "Internacional (BRA)", star: false }
    ]
  },
  CIV: {
    coach: "Emerse Faé",
    ranking: 38,
    description: "Campeões da Copa Africana de Nações, os marfinenses esbanjam vitalidade física e poder de decisão.",
    players: [
      { name: "Sébastien Haller", pos: "Atacante", club: "Leganés (ESP)", star: true },
      { name: "Franck Kessié", pos: "Meio-campista", club: "Al-Ahli (ARA)", star: false },
      { name: "Simon Adingra", pos: "Atacante", club: "Brighton (ING)", star: false }
    ]
  },
  CZE: {
    coach: "Ivan Hašek",
    ranking: 40,
    description: "Futebol tradicional de força aérea e solidez física na marcação, a República Tcheca busca surpreender no grupo.",
    players: [
      { name: "Patrik Schick", pos: "Atacante", club: "Bayer Leverkusen (ALE)", star: true },
      { name: "Tomáš Souček", pos: "Meio-campista", club: "West Ham (ING)", star: false },
      { name: "Vladimír Coufal", pos: "Defensor", club: "West Ham (ING)", star: false }
    ]
  },
  TUR: {
    coach: "Vincenzo Montella",
    ranking: 26,
    description: "Apoiados por uma legião de torcedores apaixonados, a Turquia tem jovens com refinada qualidade técnica individual.",
    players: [
      { name: "Arda Güler", pos: "Meio-campista", club: "Real Madrid (ESP)", star: true },
      { name: "Hakan Çalhanoğlu", pos: "Meio-campista", club: "Inter de Milão (ITA)", star: false },
      { name: "Kenan Yıldız", pos: "Atacante", club: "Juventus (ITA)", star: false }
    ]
  },
  AUS: {
    coach: "Tony Popovic",
    ranking: 24,
    description: "Sempre competitivos, os 'Socceroos' apostam na força coletiva, vigor aéreo e organização defensiva.",
    players: [
      { name: "Nestory Irankunda", pos: "Atacante", club: "Bayern de Munique (ALE)", star: true },
      { name: "Jackson Irvine", pos: "Meio-campista", club: "St. Pauli (ALE)", star: false },
      { name: "Mathew Ryan", pos: "Goleiro", club: "Roma (ITA)", star: false }
    ]
  },
  EGY: {
    coach: "Hossam Hassan",
    ranking: 31,
    description: "Os Faraós buscam o estrelato mundial focando sua estratégia no gênio Mohamed Salah e contra-ataques cirúrgicos.",
    players: [
      { name: "Mohamed Salah", pos: "Atacante", club: "Liverpool (ING)", star: true },
      { name: "Omar Marmoush", pos: "Atacante", club: "Eintracht Frankfurt (ALE)", star: true },
      { name: "Mostafa Mohamed", pos: "Atacante", club: "Nantes (FRA)", star: false }
    ]
  },
  IRN: {
    coach: "Amir Ghalenoei",
    ranking: 20,
    description: "Dominante na Ásia, o Irã conta com um ataque veterano e físico capaz de incomodar as defesas mais pesadas.",
    players: [
      { name: "Mehdi Taremi", pos: "Atacante", club: "Inter de Milão (ITA)", star: true },
      { name: "Sardar Azmoun", pos: "Atacante", club: "Shabab Al Ahli (EAU)", star: false },
      { name: "Alireza Jahanbakhsh", pos: "Meio-campista", club: "Heerenveen (HOL)", star: false }
    ]
  },
  CAN: {
    coach: "Jesse Marsch",
    ranking: 35,
    description: "Sede do torneio, o Canadá joga um futebol moderno de alta intensidade física e velocidades absurdas nas alas.",
    players: [
      { name: "Alphonso Davies", pos: "Defensor", club: "Bayern de Munique (ALE)", star: true },
      { name: "Jonathan David", pos: "Atacante", club: "Lille (FRA)", star: false },
      { name: "Stephen Eustáquio", pos: "Meio-campista", club: "Porto (POR)", star: false }
    ]
  },
  RSA: {
    coach: "Hugo Broos",
    ranking: 59,
    description: "Os 'Bafana Bafana' atuam com excelente entrosamento doméstico e jogo de passes rápidos.",
    players: [
      { name: "Percy Tau", pos: "Atacante", club: "Al-Ahly (EGI)", star: true },
      { name: "Teboho Mokoena", pos: "Meio-campista", club: "Mamelodi Sundowns (AFS)", star: false },
      { name: "Ronwen Williams", pos: "Goleiro", club: "Mamelodi Sundowns (AFS)", star: false }
    ]
  },
  TUN: {
    coach: "Faouzi Benzarti",
    ranking: 36,
    description: "A Tunísia se caracteriza pela combatividade no meio-campo e forte espírito defensivo compacto.",
    players: [
      { name: "Ellyes Skhiri", pos: "Meio-campista", club: "Eintracht Frankfurt (ALE)", star: true },
      { name: "Aissa Laïdouni", pos: "Meio-campista", club: "Al-Wakrah (QAT)", star: false },
      { name: "Youssef Msakni", pos: "Atacante", club: "Al-Arabi (QAT)", star: false }
    ]
  },
  BIH: {
    coach: "Sergej Barbarez",
    ranking: 75,
    description: "Com espírito guerreiro, os bósnios contam com a experiência de Džeko na referência ofensiva.",
    players: [
      { name: "Edin Džeko", pos: "Atacante", club: "Fenerbahçe (TUR)", star: true },
      { name: "Sead Kolašinac", pos: "Defensor", club: "Atalanta (ITA)", star: false },
      { name: "Amar Dedić", pos: "Defensor", club: "Red Bull Salzburg (AUT)", star: false }
    ]
  },
  PAR: {
    coach: "Gustavo Alfaro",
    ranking: 56,
    description: "Famoso por sua garra e defesa intransponível, o Paraguai aposta na velocidade e transições rápidas.",
    players: [
      { name: "Julio Enciso", pos: "Atacante", club: "Brighton (ING)", star: true },
      { name: "Miguel Almirón", pos: "Atacante", club: "Newcastle (ING)", star: false },
      { name: "Gustavo Gómez", pos: "Defensor", club: "Palmeiras (BRA)", star: false }
    ]
  },
  SCO: {
    coach: "Steve Clarke",
    ranking: 52,
    description: "A Escócia ostenta muita força no jogo aéreo, espírito de equipe inquebrável e consistência física.",
    players: [
      { name: "Scott McTominay", pos: "Meio-campista", club: "Napoli (ITA)", star: true },
      { name: "Andrew Robertson", pos: "Defensor", club: "Liverpool (ING)", star: false },
      { name: "John McGinn", pos: "Meio-campista", club: "Aston Villa (ING)", star: false }
    ]
  },
  GHA: {
    coach: "Otto Addo",
    ranking: 64,
    description: "Os 'Black Stars' mesclam enorme vigor físico a talentos velozes nas pontas de ligas europeias renomadas.",
    players: [
      { name: "Mohammed Kudus", pos: "Atacante", club: "West Ham (ING)", star: true },
      { name: "Thomas Partey", pos: "Meio-campista", club: "Arsenal (ING)", star: false },
      { name: "Iñaki Williams", pos: "Atacante", club: "Athletic Bilbao (ESP)", star: false }
    ]
  },
  COD: {
    coach: "Sébastien Desabre",
    ranking: 58,
    description: "A RD do Congo tem jogadores habilidosos que atuam com muita dedicação física e jogo de velocidade.",
    players: [
      { name: "Yoane Wissa", pos: "Atacante", club: "Brentford (ING)", star: true },
      { name: "Chancel Mbemba", pos: "Defensor", club: "Marseille (FRA)", star: false },
      { name: "Arthur Masuaku", pos: "Defensor", club: "Beşiktaş (TUR)", star: false }
    ]
  },
  PAN: {
    coach: "Thomas Christiansen",
    ranking: 39,
    description: "Com evolução tática notável na CONCACAF, o Panamá aposta no jogo associativo e técnico.",
    players: [
      { name: "Adalberto Carrasquilla", pos: "Meio-campista", club: "Houston Dynamo (EUA)", star: true },
      { name: "Michael Murillo", pos: "Defensor", club: "Marseille (FRA)", star: false },
      { name: "José Córdoba", pos: "Defensor", club: "Norwich City (ING)", star: false }
    ]
  },
  UZB: {
    coach: "Srečko Katanec",
    ranking: 60,
    description: "Em ascensão meteórica na Ásia, o Uzbequistão joga de forma coesa e com forte dedicação tática.",
    players: [
      { name: "Eldor Shomurodov", pos: "Atacante", club: "Roma (ITA)", star: true },
      { name: "Abbosbek Fayzullaev", pos: "Meio-campista", club: "CSKA Moscou (RUS)", star: false },
      { name: "Jaloliddin Masharipov", pos: "Meio-campista", club: "Esteghlal (IRN)", star: false }
    ]
  },
  QAT: {
    coach: "Tintín Márquez",
    ranking: 34,
    description: "Bicampeão da Copa da Ásia, o Catar conta com ótimo entrosamento e ataque oportunista.",
    players: [
      { name: "Akram Afif", pos: "Atacante", club: "Al-Sadd (QAT)", star: true },
      { name: "Almoez Ali", pos: "Atacante", club: "Al-Duhail (QAT)", star: false },
      { name: "Hassan Al-Haydos", pos: "Meio-campista", club: "Al-Sadd (QAT)", star: false }
    ]
  },
  CPV: {
    coach: "Bubista",
    ranking: 65,
    description: "Os Tubarões Azuis surpreendem pela alta velocidade ofensiva e forte dedicação tática.",
    players: [
      { name: "Ryan Mendes", pos: "Atacante", club: "Fatih Karagümrük (TUR)", star: true },
      { name: "Logan Costa", pos: "Defensor", club: "Villarreal (ESP)", star: false },
      { name: "Garry Rodrigues", pos: "Atacante", club: "Sivasspor (TUR)", star: false }
    ]
  },
  KSA: {
    coach: "Hervé Renard",
    ranking: 56,
    description: "Famosa pela zebra contra a Argentina em 2022, a Arábia Saudita foca no ritmo físico intenso e união.",
    players: [
      { name: "Salem Al-Dawsari", pos: "Atacante", club: "Al-Hilal (ARA)", star: true },
      { name: "Firas Al-Buraikan", pos: "Atacante", club: "Al-Ahli (ARA)", star: false },
      { name: "Saud Abdulhamid", pos: "Defensor", club: "Roma (ITA)", star: false }
    ]
  },
  IRQ: {
    coach: "Jesús Casas",
    ranking: 55,
    description: "Com apoio fervoroso, o Iraque ostenta jogadores aguerridos e muito fortes fisicamente.",
    players: [
      { name: "Aymen Hussein", pos: "Atacante", club: "Al-Khor (QAT)", star: true },
      { name: "Ali Jasim", pos: "Meio-campista", club: "Como (ITA)", star: false },
      { name: "Mohanad Ali", pos: "Atacante", club: "Al-Shorta (IRQ)", star: false }
    ]
  },
  BOL: {
    coach: "Óscar Villegas",
    ranking: 83,
    description: "Buscando competitividade internacional, a Bolívia foca no talento de jovens promessas como Miguelito.",
    players: [
      { name: "Miguel Terceros", pos: "Meio-campista", club: "Santos (BRA)", star: true },
      { name: "Ramiro Vaca", pos: "Meio-campista", club: "Bolívar (BOL)", star: false },
      { name: "Carlos Lampe", pos: "Goleiro", club: "Bolívar (BOL)", star: false }
    ]
  },
  JOR: {
    coach: "Jamal Sellami",
    ranking: 68,
    description: "Vice-campeã asiática, a Jordânia possui contra-ataques extremamente letais puxados por Al-Tamari.",
    players: [
      { name: "Mousa Al-Tamari", pos: "Atacante", club: "Montpellier (FRA)", star: true },
      { name: "Yazan Al-Naimat", pos: "Atacante", club: "Al-Ahli (QAT)", star: false },
      { name: "Ali Olwan", pos: "Atacante", club: "Selangor (MAL)", star: false }
    ]
  },
  HAI: {
    coach: "Sébastien Migné",
    ranking: 86,
    description: "O Haiti aposta na velocidade física de seus atacantes baseados na Europa e nos EUA.",
    players: [
      { name: "Frantzdy Pierrot", pos: "Atacante", club: "AEK Atenas (GRE)", star: true },
      { name: "Duckens Nazon", pos: "Atacante", club: "Kayserispor (TUR)", star: false },
      { name: "Danley Jean Jacques", pos: "Meio-campista", club: "Philadelphia Union (EUA)", star: false }
    ]
  },
  CUW: {
    coach: "Dick Advocaat",
    ranking: 87,
    description: "Com muitos jogadores criados nas ligas holandesas, Curaçao esbanja bom preparo tático europeu.",
    players: [
      { name: "Juninho Bacuna", pos: "Meio-campista", club: "Al-Wahda (EAU)", star: true },
      { name: "Leandro Bacuna", pos: "Meio-campista", club: "Groningen (HOL)", star: false },
      { name: "Kenji Gorré", pos: "Atacante", club: "Umm Salal (QAT)", star: false }
    ]
  },
  NZL: {
    coach: "Darren Bazeley",
    ranking: 94,
    description: "Soberana na Oceania, a Nova Zelândia baseia seu jogo no pivô Chris Wood na Premier League.",
    players: [
      { name: "Chris Wood", pos: "Atacante", club: "Nottingham Forest (ING)", star: true },
      { name: "Liberato Cacace", pos: "Defensor", club: "Empoli (ITA)", star: false },
      { name: "Matthew Garbett", pos: "Meio-campista", club: "NAC Breda (HOL)", star: false }
    ]
  },
  ALG: {
    coach: "Vladimir Petković",
    ranking: 41,
    description: "Força tradicional do norte da África, a Argélia busca protagonismo sob nova direção tática de Petković.",
    players: [
      { name: "Riyad Mahrez", pos: "Atacante", club: "Al-Ahli (ARA)", star: true },
      { name: "Rayan Aït-Nouri", pos: "Defensor", club: "Wolverhampton (ING)", star: false },
      { name: "Ismaël Bennacer", pos: "Meio-campista", club: "Milan (ITA)", star: false }
    ]
  }
};

