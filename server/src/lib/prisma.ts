import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';

// Garante que as variáveis sejam carregadas antes de iniciar o cliente
dotenv.config();
dotenv.config({ path: path.join(process.cwd(), '.env') });

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.warn('[PRISMA WARNING] DATABASE_URL is not defined in environment variables.');
}

export const prisma = new PrismaClient(
  databaseUrl 
    ? { datasources: { db: { url: databaseUrl } } }
    : undefined
);
