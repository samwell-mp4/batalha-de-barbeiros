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
      slug: 'gustavo-barbeiro',
      latitude: -23.525,
      longitude: -46.522,
      specialties: ['Cabelo', 'Barba'],
      workingHours: '08:00 às 22:00',
      rating: 4.9,
      reviewsCount: 12,
      isOnline: true,
      isPremium: true,
      gallery: [],
      cityId: 3452927,
      neighborhoodId: null,
      user: { id: 'barber-user-1', name: 'Gustavo Barbeiro', email: 'barber@battlebarber.com', avatar: 'https://i.pravatar.cc/150?u=2' }
    },
    {
      id: 'barber-2',
      userId: 'barber-user-2',
      barberShop: 'Elite Barber Shop',
      slug: 'henrique-barber',
      latitude: -23.525,
      longitude: -46.522,
      specialties: ['Fade', 'Pigmentação'],
      workingHours: '09:00 às 20:00',
      rating: 4.9,
      reviewsCount: 8,
      isOnline: true,
      isPremium: true,
      gallery: [],
      cityId: 3452927,
      neighborhoodId: null,
      user: { id: 'barber-user-2', name: 'Henrique Barber', email: 'henrique@elite.com', avatar: 'https://i.pravatar.cc/150?u=3' }
    },
    {
      id: 'barber-3',
      userId: 'barber-user-3',
      barberShop: 'Mooca Barber',
      slug: 'vitor-do-corte',
      latitude: -23.535,
      longitude: -46.532,
      specialties: ['Navalhado'],
      workingHours: '09:00 às 21:00',
      rating: 4.8,
      reviewsCount: 5,
      isOnline: true,
      isPremium: false,
      gallery: [],
      cityId: 3452927,
      neighborhoodId: null,
      user: { id: 'barber-user-3', name: 'Vitor do Corte', email: 'vitor@elite.com', avatar: 'https://i.pravatar.cc/150?u=4' }
    }
  ],
  state: [
    { id: 35, sigla: 'SP', nome: 'São Paulo', slug: 'sao-paulo', cities: [] },
    { id: 33, sigla: 'RJ', nome: 'Rio de Janeiro', slug: 'rio-de-janeiro', cities: [] },
  ],
  city: [
    {
      id: 3452927, name: 'São Paulo', slug: 'sao-paulo', stateId: 35,
      barbers_count: 3, avg_price: 45.00, top_services: ['Corte Degradê', 'Barba'],
      seo_enabled: false,
    },
    {
      id: 3304557, name: 'Rio de Janeiro', slug: 'rio-de-janeiro', stateId: 33,
      barbers_count: 0, avg_price: null, top_services: [],
      seo_enabled: false,
    },
  ],
  neighborhood: [],
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
  post: [],
  like: [],
  comment: [],
  message: [],
  matchlike: [],
  matchcomment: [],
  payment: [],
};

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
  
  if (where.OR && Array.isArray(where.OR)) {
    return where.OR.some((subWhere: any) => matchesWhere(item, subWhere));
  }
  
  if (where.AND && Array.isArray(where.AND)) {
    return where.AND.every((subWhere: any) => matchesWhere(item, subWhere));
  }

  // Handle NOT
  if (where.NOT) {
    if (matchesWhere(item, where.NOT)) return false;
  }

  for (const key of Object.keys(where)) {
    if (key === 'OR' || key === 'AND' || key === 'NOT') continue;

    const filter = where[key];

    // Handle compound keys
    if (key === 'matchId_userId' && filter && typeof filter === 'object') {
      if (item.matchId !== filter.matchId || item.userId !== filter.userId) return false;
      continue;
    }
    if (key === 'postId_userId' && filter && typeof filter === 'object') {
      if (item.postId !== filter.postId || item.userId !== filter.userId) return false;
      continue;
    }

    // Handle nested relation filters (e.g., state: { slug: 'sp' })
    if (filter && typeof filter === 'object' && !Array.isArray(filter) && !('in' in filter) && !('equals' in filter) && !('gte' in filter) && !('lte' in filter) && !('gt' in filter) && !('lt' in filter) && !('not' in filter) && !('contains' in filter) && !('startsWith' in filter)) {
      // Check if this is a relation lookup - find the related item
      const relatedTable = key.endsWith('ies') ? key.slice(0, -3) + 'y' : key.endsWith('s') ? key.slice(0, -1) : key;
      const relatedItem = db[relatedTable]?.find((r: any) => {
        if (typeof filter === 'object') {
          return Object.entries(filter).every(([fk, fv]) => r[fk] === fv);
        }
        return r.id === filter;
      });
      if (!relatedItem) return false;
      continue;
    }

    // Handle comparison operators
    if (filter && typeof filter === 'object' && !Array.isArray(filter)) {
      if ('in' in filter && Array.isArray(filter.in)) {
        if (!filter.in.includes(item[key])) return false;
      } else if ('notIn' in filter && Array.isArray(filter.notIn)) {
        if (filter.notIn.includes(item[key])) return false;
      } else if ('not' in filter) {
        if (item[key] === filter.not) return false;
      } else if ('equals' in filter) {
        if (item[key] !== filter.equals) return false;
      } else if ('gte' in filter) {
        if ((item[key] ?? -Infinity) < filter.gte) return false;
      } else if ('lte' in filter) {
        if ((item[key] ?? Infinity) > filter.lte) return false;
      } else if ('gt' in filter) {
        if ((item[key] ?? -Infinity) <= filter.gt) return false;
      } else if ('lt' in filter) {
        if ((item[key] ?? Infinity) >= filter.lt) return false;
      } else if ('contains' in filter) {
        if (!String(item[key] ?? '').includes(filter.contains)) return false;
      } else if ('startsWith' in filter) {
        if (!String(item[key] ?? '').startsWith(filter.startsWith)) return false;
      } else if ('has' in filter) {
        if (!Array.isArray(item[key]) || !item[key].includes(filter.has)) return false;
      } else if ('hasSome' in filter && Array.isArray(filter.hasSome)) {
        if (!Array.isArray(item[key])) return false;
        if (!filter.hasSome.some((h: any) => item[key].includes(h))) return false;
      } else {
        // Unknown operator, fall back to direct comparison
        if (item[key] !== filter) return false;
      }
    } else {
      if (item[key] !== filter) return false;
    }
  }
  return true;
}

function resolveRelations(modelName: string, item: any, include: any): any {
  if (!item) return item;
  const copy = { ...item };
  
  if (modelName === 'barber') {
    if (include?.user) {
      copy.user = db.user.find(u => u.id === copy.userId);
    }
    if (include?.city) {
      const city = db.city.find((c: any) => c.id === copy.cityId);
      if (city) {
        copy.city = resolveRelations('city', city, include.city.include);
      }
    }
    if (include?.neighborhood) {
      copy.neighborhood = db.neighborhood.find((n: any) => n.id === copy.neighborhoodId);
    }
    if (include?.posts) {
      copy.posts = (db.post || [])
        .filter(p => p.barberId === copy.id)
        .map(p => resolveRelations('post', p, include.posts.include));
    }
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
  if (modelName === 'city') {
    if (include?.state) {
      copy.state = db.state.find((s: any) => s.id === copy.stateId);
    }
    if (include?.neighborhoods) {
      copy.neighborhoods = (db.neighborhood || [])
        .filter((n: any) => n.cityId === copy.id);
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
  }
  if (modelName === 'post') {
    if (include?.likes) {
      copy.likes = (db.like || []).filter(l => l.postId === copy.id);
    }
    if (include?.comments) {
      copy.comments = (db.comment || [])
        .filter(c => c.postId === copy.id)
        .map(c => resolveRelations('comment', c, include.comments.include));
    }
  }
  if (modelName === 'comment') {
    if (include?.user) {
      copy.user = db.user.find(u => u.id === copy.userId);
    }
  }
  return copy;
}

function getModelName(propKey: string | symbol): string | null {
  const str = String(propKey).toLowerCase();
  const modelMap: Record<string, string> = {
    user: 'user',
    barber: 'barber',
    state: 'state',
    city: 'city',
    neighborhood: 'neighborhood',
    appointment: 'appointment',
    mapmarker: 'mapmarker',
    championship: 'championship',
    match: 'match',
    vote: 'vote',
    post: 'post',
    like: 'like',
    comment: 'comment',
    message: 'message',
    matchlike: 'matchlike',
    matchcomment: 'matchcomment',
    payment: 'payment',
  };
  return modelMap[str] || null;
}

const mockPrisma = new Proxy({}, {
  get(target, propKey) {
    const modelName = getModelName(propKey);
    
    if (modelName && modelName in db) {
      return {
        findUnique: async (args: any) => {
          const item = db[modelName].find((x: any) => matchesWhere(x, args?.where));
          return resolveRelations(modelName, item, args?.include);
        },
        findFirst: async (args: any) => {
          const item = db[modelName].find((x: any) => matchesWhere(x, args?.where));
          return resolveRelations(modelName, item, args?.include);
        },
        findMany: async (args: any) => {
          let items = db[modelName].filter((x: any) => matchesWhere(x, args?.where));
          
          // Handle orderBy
          if (args?.orderBy) {
            for (const [field, dir] of Object.entries(args.orderBy)) {
              items.sort((a: any, b: any) => {
                if (dir === 'desc') return (b[field] ?? 0) > (a[field] ?? 0) ? 1 : -1;
                return (a[field] ?? 0) > (b[field] ?? 0) ? 1 : -1;
              });
            }
          }
          
          // Handle take
          if (args?.take) {
            items = items.slice(0, args.take);
          }
          
          return items.map((x: any) => resolveRelations(modelName, x, args?.include));
        },
        count: async (args: any) => {
          return db[modelName].filter((x: any) => matchesWhere(x, args?.where)).length;
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
        upsert: async (args: any) => {
          const existing = db[modelName].find((x: any) => matchesWhere(x, args?.where));
          if (existing) {
            const idx = db[modelName].indexOf(existing);
            const updatedData = { ...args.update };
            db[modelName][idx] = {
              ...existing,
              ...updatedData,
              updatedAt: new Date(),
            };
            return resolveRelations(modelName, db[modelName][idx], args?.include);
          }
          // Use create
          const newId = modelName + '-' + Math.random().toString(36).substr(2, 9);
          const newItem = {
            id: newId,
            createdAt: new Date(),
            updatedAt: new Date(),
            ...args.create,
          };
          db[modelName].push(newItem);
          return resolveRelations(modelName, newItem, args?.include);
        },
        update: async (args: any) => {
          const index = db[modelName].findIndex((x: any) => matchesWhere(x, args?.where));
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
          const index = db[modelName].findIndex((x: any) => matchesWhere(x, args?.where));
          if (index !== -1) {
            const deleted = db[modelName].splice(index, 1)[0];
            return resolveRelations(modelName, deleted, args?.include);
          }
          throw new Error(`Record to delete not found in mock ${modelName}`);
        },
        deleteMany: async (args: any) => {
          const initialLength = db[modelName].length;
          db[modelName] = db[modelName].filter((x: any) => !matchesWhere(x, args?.where));
          return { count: initialLength - db[modelName].length };
        }
      };
    }
    
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
