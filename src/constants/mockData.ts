export const LIGAS = {
  BRONZE: { name: 'Bronze', color: '#cd7f32' },
  PRATA: { name: 'Prata', color: '#c0c0c0' },
  OURO: { name: 'Ouro', color: '#ffd700' },
  PLATINA: { name: 'Platina', color: '#e5e4e2' },
  DIAMANTE: { name: 'Diamante', color: '#b9f2ff' },
  LENDA: { name: 'Lenda', color: '#ff4500' },
};

export const STATUS = {
  LIVRE: { id: 's1', label: 'Disponível Agora', color: '#22c55e', icon: '🟢' },
  ULTIMAS_VAGAS: { id: 's2', label: 'Últimas Vagas', color: '#eab308', icon: '🟡' },
  LOTADO: { id: 's3', label: 'Sem horários', color: '#ef4444', icon: '🔴' },
  TRABALHANDO: { id: 's4', label: 'Em Atendimento', color: '#3b82f6', icon: '✂️' },
  FECHADO: { id: 's5', label: 'Fechado', color: '#64748b', icon: '⚫' },
};

export const GUILDS = {
  ESTILO: { id: 'g1', name: 'Clã do Estilo', color: '#ef4444', icon: '✨' },
  MESTRES: { id: 'g2', name: 'Mestres do Corte', color: '#3b82f6', icon: '✂️' },
  LEGIAO: { id: 'g3', name: 'Legião da Régua', color: '#10b981', icon: '📐' },
  ESQUADRAO: { id: 'g4', name: 'Esquadrão Designer', color: '#8b5cf6', icon: '🎨' },
};

export const TOURNAMENT_TYPES = {
  X1: { id: 't_1x1', label: 'Desafio 1x1', icon: '⚔️', color: '#64748b' },
  BAIRRO: { id: 't_bairro', label: 'Bairro', icon: '🏙️', color: '#3b82f6' },
  REGIONAL: { id: 't_regional', label: 'Regional', icon: '🗺️', color: '#8b5cf6' },
  ESTADUAL: { id: 't_estadual', label: 'Estadual', icon: '🔥', color: '#ef4444' },
  NACIONAL: { id: 't_nacional', label: 'Brasileirão', icon: '🏆', color: '#eab308' },
};

const BASE_COORDS = { latitude: -23.525, longitude: -46.522 };

// GERADOR DE BARBEIROS ALEATÓRIOS
const generateBarbers = (count: number) => {
  const names = ['Henrique', 'Gustavo', 'Caio', 'Thiago', 'Bruno', 'Rodrigo', 'Lucas', 'Rafael', 'Diego', 'Matheus', 'Vitor', 'Igor', 'Breno', 'Arthur', 'Leo'];
  const specialties = ['Fade', 'Degradê', 'Navalhado', 'Freestyle', 'Social', 'Barba', 'Pigmentação'];
  const ligas = Object.values(LIGAS);
  const guilds = Object.values(GUILDS);
  const statuses = Object.values(STATUS);

  return Array.from({ length: count }).map((_, i) => {
    const name = names[i % names.length] + ' ' + (i + 1);
    const latOffset = (Math.random() - 0.5) * 0.02;
    const lngOffset = (Math.random() - 0.5) * 0.02;
    
    return {
      id: `b_gen_${i}`,
      name: name,
      username: `${names[i % names.length].toLowerCase()}_${i}`,
      avatar: `https://i.pravatar.cc/150?u=barber${i}`,
      city: 'São Paulo',
      state: 'SP',
      specialty: specialties[i % specialties.length],
      liga: ligas[i % ligas.length],
      guild: guilds[i % guilds.length],
      status: statuses[Math.floor(Math.random() * statuses.length)],
      queueSize: Math.floor(Math.random() * 5),
      waitTime: Math.floor(Math.random() * 60),
      hasStory: Math.random() > 0.5,
      isFlash: Math.random() > 0.8,
      xp: Math.floor(Math.random() * 25000),
      winRate: 50 + Math.floor(Math.random() * 45),
      battles: Math.floor(Math.random() * 500),
      followers: Math.floor(Math.random() * 10000),
      description: 'Barbeiro de elite na arena.',
      coordinates: { 
        latitude: BASE_COORDS.latitude + latOffset, 
        longitude: BASE_COORDS.longitude + lngOffset 
      },
      activeTournament: null,
      tournamentStatus: null,
    };
  });
};

export const MOCK_BARBERS = [
  {
    id: 'vm1', name: 'Junior Vila', username: 'junior_vm', avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=200',
    city: 'São Paulo', state: 'SP', specialty: 'Degradê', liga: LIGAS.OURO, guild: GUILDS.ESTILO,
    status: STATUS.LIVRE, queueSize: 0, waitTime: 0, hasStory: true, isFlash: true,
    xp: 4500, winRate: 68, battles: 150, followers: 1200, description: 'O rei da Vila Matilde.',
    coordinates: { latitude: -23.525, longitude: -46.522 },
    activeTournament: TOURNAMENT_TYPES.REGIONAL, tournamentStatus: 'semifinalist',
  },
  ...generateBarbers(55)
];

export const MOCK_BATTLES = [
  {
    id: 'b1', barberLeft: MOCK_BARBERS[0], barberRight: MOCK_BARBERS[1],
    imageLeft: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=600',
    imageRight: 'https://images.unsplash.com/photo-1593702288056-cc1ec03f9dc3?w=600',
    category: 'Fade',
  }
];

export const MOCK_TOURNAMENTS = [
  { id: 't1', name: 'Copa Leste 2024', type: TOURNAMENT_TYPES.REGIONAL, prize: 'R$ 5.000', players: 32 },
  { id: 't2', name: 'Rei do Bairro', type: TOURNAMENT_TYPES.BAIRRO, prize: 'Troféu de Ouro', players: 16 },
];

export const TERRITORIES = [
  { name: 'Vila Matilde', guild: GUILDS.ESTILO, bounds: [[-23.528, -46.525], [-23.522, -46.518]] },
  { name: 'Penha', guild: GUILDS.MESTRES, bounds: [[-23.525, -46.545], [-23.518, -46.535]] },
];
