// TABELA OFICIAL DE NÍVEIS - BATALHA DE BARBEIRO
export const XP_TABLE = [
  { level: 1, xp: 1000 },
  { level: 2, xp: 3000 },
  { level: 3, xp: 6000 },
  { level: 4, xp: 10000 },
  { level: 5, xp: 15000 },
  { level: 6, xp: 21000 },
  { level: 7, xp: 28000 },
  { level: 8, xp: 36000 },
  { level: 9, xp: 45000 },
  { level: 10, xp: 55000 },
  { level: 11, xp: 67000 },
  { level: 12, xp: 80000 },
  { level: 13, xp: 94000 },
  { level: 14, xp: 110000 },
  { level: 15, xp: 127000 },
  { level: 16, xp: 145000 },
  { level: 17, xp: 165000 },
  { level: 18, xp: 186000 },
  { level: 19, xp: 208000 },
  { level: 20, xp: 250000 },
];

export const TITLES_CLIENT = [
  { level: 1, title: "Visitante" },
  { level: 5, title: "Torcedor" },
  { level: 10, title: "Caçador de Cortes" },
  { level: 15, title: "Explorador Mestre" },
  { level: 20, title: "Lenda da Navalha" },
];

export const TITLES_BARBER = [
  { level: 1, title: "Aprendiz" },
  { level: 5, title: "Barbeiro Local" },
  { level: 10, title: "Mestre do Fade" },
  { level: 15, title: "Rei Regional" },
  { level: 20, title: "Lenda Nacional" },
];

export const calculateLevel = (currentXp: number, isBarber: boolean = true) => {
  // Encontrar o nível atual
  let currentLevelData = XP_TABLE[0];
  let nextLevelData = XP_TABLE[1];

  for (let i = 0; i < XP_TABLE.length; i++) {
    if (currentXp >= XP_TABLE[i].xp) {
      currentLevelData = XP_TABLE[i];
      nextLevelData = XP_TABLE[i + 1] || XP_TABLE[i];
    } else {
      break;
    }
  }

  // Encontrar o título atual e próximo
  const titles = isBarber ? TITLES_BARBER : TITLES_CLIENT;
  let currentTitle = titles[0].title;
  let nextTitle = titles[1].title;

  for (let i = 0; i < titles.length; i++) {
    if (currentLevelData.level >= titles[i].level) {
      currentTitle = titles[i].title;
      nextTitle = titles[i + 1]?.title || titles[i].title;
    }
  }

  const remainingXp = nextLevelData.xp - currentXp;
  const progress = ((currentXp - (XP_TABLE[currentLevelData.level - 2]?.xp || 0)) / (nextLevelData.xp - (XP_TABLE[currentLevelData.level - 2]?.xp || 0))) * 100;

  return {
    level: currentLevelData.level,
    xp: currentXp,
    nextLevelXp: nextLevelData.xp,
    remainingXp: Math.max(0, remainingXp),
    progress: Math.min(100, progress),
    title: currentTitle,
    nextTitle: nextTitle,
  };
};
