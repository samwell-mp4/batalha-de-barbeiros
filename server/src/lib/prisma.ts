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
    { id: 'barber-user-1', name: 'Gustavo Barbeiro', email: 'barber@battlebarber.com', password: '123', role: 'BARBER', avatar: 'https://i.pravatar.cc/150?u=2' }
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
    }
  ],
  appointment: [],
  mapmarker: []
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
          const newItem = {
            id: newId,
            createdAt: new Date(),
            updatedAt: new Date(),
            ...args.data
          };
          db[modelName].push(newItem);
          return resolveRelations(modelName, newItem, args?.include);
        },
        update: async (args: any) => {
          const index = db[modelName].findIndex(x => matchesWhere(x, args?.where));
          if (index !== -1) {
            db[modelName][index] = {
              ...db[modelName][index],
              ...args.data,
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
