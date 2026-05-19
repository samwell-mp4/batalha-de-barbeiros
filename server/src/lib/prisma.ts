import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();
dotenv.config({ path: path.join(process.cwd(), '.env') });

const databaseUrl = process.env.DATABASE_URL;

const realPrisma = new PrismaClient(
  databaseUrl 
    ? { datasources: { db: { url: databaseUrl } } }
    : undefined
);

let useMock = false;

// Simple database in memory
const db: Record<string, any[]> = {
  user: [
    { id: 'client-1', name: 'Luis Cliente', email: 'client@battlebarber.com', password: '123', role: 'CLIENT', avatar: 'https://i.pravatar.cc/150?u=1' },
    { id: 'barber-user-1', name: 'Gustavo Barbeiro', email: 'barber@battlebarber.com', password: '123', role: 'BARBER', avatar: 'https://i.pravatar.cc/150?u=2' },
    { id: 'barber-user-2', name: 'Henrique Barber', email: 'henrique@elite.com', password: '123', role: 'BARBER', avatar: 'https://i.pravatar.cc/150?u=3' },
    { id: 'barber-user-3', name: 'Vitor do Corte', email: 'vitor@elite.com', password: '123', role: 'BARBER', avatar: 'https://i.pravatar.cc/150?u=4' }
  ],
  barber: [
    {
      id: 'barber-1',
      userId: 'barber-user-1',
      barberShop: 'Arena Gustavo',
      latitude: -23.525,
      longitude: -46.522,
      specialties: ['Cabelo', 'Barba'],
      workingHours: '08:00 às 22:00',
      rating: 4.9,
      isOnline: true,
      gallery: [],
      user: { id: 'barber-user-1', name: 'Gustavo Barbeiro', email: 'barber@battlebarber.com', avatar: 'https://i.pravatar.cc/150?u=2' }
    },
    {
      id: 'barber-2',
      userId: 'barber-user-2',
      barberShop: 'Elite Barber Shop',
      latitude: -23.525,
      longitude: -46.522,
      specialties: ['Fade', 'Pigmentação'],
      workingHours: '09:00 às 20:00',
      rating: 4.9,
      isOnline: true,
      gallery: [],
      user: { id: 'barber-user-2', name: 'Henrique Barber', email: 'henrique@elite.com', avatar: 'https://i.pravatar.cc/150?u=3' }
    },
    {
      id: 'barber-3',
      userId: 'barber-user-3',
      barberShop: 'Mooca Barber',
      latitude: -23.535,
      longitude: -46.532,
      specialties: ['Navalhado'],
      workingHours: '09:00 às 21:00',
      rating: 4.8,
      isOnline: true,
      gallery: [],
      user: { id: 'barber-user-3', name: 'Vitor do Corte', email: 'vitor@elite.com', avatar: 'https://i.pravatar.cc/150?u=4' }
    }
  ],
  appointment: [],
  mapmarker: [],
  championship: [
    {
      id: 'champ-1',
      name: 'Batalha do Tatuapé',
      ligaId: 2,
      modality: 'x1',
      theme: 'Degradê Perfeito',
      prize: 'R$ 1.000 + Kit Premium',
      status: 'ONGOING',
      arbitration: 'hybrid',
      maxParticipants: 2,
      createdAt: new Date(),
      updatedAt: new Date(),
      _participantIds: ['barber-2', 'barber-3']
    }
  ],
  match: [
    {
      id: 'match-1',
      championshipId: 'champ-1',
      round: 1,
      player1Id: 'barber-2',
      player2Id: 'barber-3',
      status: 'LIVE',
      score1: 0,
      score2: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ],
  vote: [],
  refereelog: []
};

// Check if database is reachable on startup
realPrisma.$connect()
  .then(() => {
    console.log('[PRISMA] Connected to Database successfully.');
  })
  .catch((err) => {
    console.warn('[PRISMA WARNING] Could not connect to Database. Falling back to IN-MEMORY Mock DB.', err.message);
    useMock = true;
  });

function matchesWhere(item: any, where: any): boolean {
  if (!where) return true;
  
  // Handle OR
  if (where.OR && Array.isArray(where.OR)) {
    return where.OR.some((subWhere: any) => matchesWhere(item, subWhere));
  }
  
  // Handle AND
  if (where.AND && Array.isArray(where.AND)) {
    return where.AND.every((subWhere: any) => matchesWhere(item, subWhere));
  }

  for (const key of Object.keys(where)) {
    const filter = where[key];

    // Compound key matchId_userId support
    if (key === 'matchId_userId' && filter && typeof filter === 'object') {
      if (item.matchId !== filter.matchId || item.userId !== filter.userId) {
        return false;
      }
      continue;
    }

    const val = item[key];

    if (filter && typeof filter === 'object' && !Array.isArray(filter)) {
      if ('in' in filter && Array.isArray(filter.in)) {
        if (!filter.in.includes(val)) return false;
      } else if ('equals' in filter) {
        if (val !== filter.equals) return false;
      }
    } else {
      if (val !== filter) return false;
    }
  }
  return true;
}

function resolveRelations(modelName: string, item: any, include: any): any {
  if (!item) return item;
  const copy = { ...item };
  
  if (modelName === 'barber' && include?.user) {
    copy.user = db.user.find(u => u.id === copy.userId);
  }
  if (modelName === 'user' && include?.barberProfile) {
    const barber = db.barber.find(b => b.userId === copy.id);
    if (barber) {
      copy.barberProfile = {
        ...barber,
        user: db.user.find(u => u.id === barber.userId)
      };
    }
  }
  if (modelName === 'appointment') {
    if (include?.client) {
      copy.client = db.user.find(u => u.id === copy.clientId);
    }
    if (include?.barber) {
      const barber = db.barber.find(b => b.id === copy.barberId);
      if (barber) {
        copy.barber = {
          ...barber,
          user: db.user.find(u => u.id === barber.userId)
        };
      }
    }
  }
  if (modelName === 'championship') {
    if (include?.participants) {
      const pIds = item._participantIds || [];
      copy.participants = db.barber
        .filter(b => pIds.includes(b.id))
        .map(b => resolveRelations('barber', b, include.participants.include || { user: true }));
    }
    if (include?.matches) {
      copy.matches = db.match
        .filter(m => m.championshipId === item.id)
        .map(m => resolveRelations('match', m, include.matches.include));
    }
  }
  if (modelName === 'match') {
    if (include?.votes) {
      copy.votes = db.vote.filter(v => v.matchId === item.id);
    }
    if (include?.refereeLogs) {
      copy.refereeLogs = db.refereelog.filter(r => r.matchId === item.id);
    }
  }
  return copy;
}

const mockPrisma = new Proxy({}, {
  get(target, propKey) {
    const modelName = String(propKey).toLowerCase();
    
    // Check if the property corresponds to a table in our in-memory DB
    if (modelName in db) {
      return {
        findUnique: async (args: any) => {
          const item = db[modelName].find(x => matchesWhere(x, args?.where));
          return resolveRelations(modelName, item, args?.include);
        },
        findFirst: async (args: any) => {
          const item = db[modelName].find(x => matchesWhere(x, args?.where));
          return resolveRelations(modelName, item, args?.include);
        },
        findMany: async (args: any) => {
          let items = db[modelName].filter(x => matchesWhere(x, args?.where));
          return items.map(x => resolveRelations(modelName, x, args?.include));
        },
        create: async (args: any) => {
          const newId = modelName + '-' + Math.random().toString(36).substr(2, 9);
          
          let parsedData = { ...args.data };
          let participantIds: string[] = [];
          
          if (modelName === 'championship' && args.data.participants?.connect) {
            participantIds = args.data.participants.connect.map((c: any) => c.id);
            delete parsedData.participants;
          }

          if (modelName === 'user' && args.data.barberProfile?.create) {
            const barberData = args.data.barberProfile.create;
            const newBarberId = 'barber-' + Math.random().toString(36).substr(2, 9);
            const newBarber = {
              id: newBarberId,
              userId: newId,
              rating: 5.0,
              isOnline: true,
              gallery: [],
              ...barberData
            };
            db.barber.push(newBarber);
            delete parsedData.barberProfile;
          }

          const newItem = {
            id: newId,
            createdAt: new Date(),
            updatedAt: new Date(),
            ...parsedData,
            ...(modelName === 'championship' ? { _participantIds: participantIds } : {})
          };
          db[modelName].push(newItem);
          return resolveRelations(modelName, newItem, args?.include);
        },
        update: async (args: any) => {
          const index = db[modelName].findIndex(x => matchesWhere(x, args?.where));
          if (index !== -1) {
            const currentItem = db[modelName][index];
            const updatedData = { ...args.data };
            
            for (const k of Object.keys(updatedData)) {
              if (updatedData[k] && typeof updatedData[k] === 'object' && 'increment' in updatedData[k]) {
                const incValue = updatedData[k].increment;
                updatedData[k] = (currentItem[k] || 0) + incValue;
              }
            }

            db[modelName][index] = {
              ...currentItem,
              ...updatedData,
              updatedAt: new Date()
            };
            return resolveRelations(modelName, db[modelName][index], args?.include);
          }
          throw new Error(`Record to update not found in mock ${modelName}`);
        },
        delete: async (args: any) => {
          const index = db[modelName].findIndex(x => matchesWhere(x, args?.where));
          if (index !== -1) {
            const deleted = db[modelName].splice(index, 1)[0];
            return resolveRelations(modelName, deleted, args?.include);
          }
          throw new Error(`Record to delete not found in mock ${modelName}`);
        },
        deleteMany: async (args: any) => {
          const initialLength = db[modelName].length;
          db[modelName] = db[modelName].filter(x => !matchesWhere(x, args?.where));
          return { count: initialLength - db[modelName].length };
        }
      };
    }
    
    // Fallback for $connect, $disconnect, etc.
    if (propKey === '$connect') return async () => {};
    if (propKey === '$disconnect') return async () => {};
    
    return undefined;
  }
});

export const prisma = new Proxy({}, {
  get(target, propKey) {
    if (useMock) {
      return (mockPrisma as any)[propKey];
    }
    return (realPrisma as any)[propKey];
  }
}) as PrismaClient;
