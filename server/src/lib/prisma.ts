import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';

// Garante que as variáveis sejam carregadas antes de iniciar o cliente
dotenv.config();
dotenv.config({ path: path.join(process.cwd(), '.env') });

export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});
