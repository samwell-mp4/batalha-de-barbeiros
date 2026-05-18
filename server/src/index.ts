import express from 'express';
import path from 'path';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables immediately
dotenv.config();
dotenv.config({ path: path.join(__dirname, '..', '.env') });
dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });
dotenv.config({ path: path.join(process.cwd(), '.env') });
dotenv.config({ path: path.join(process.cwd(), 'server', '.env') });

import { PrismaClient } from '@prisma/client';
import championshipRoutes from './routes/championships';
import barberRoutes from './routes/barbers';
import postRoutes from './routes/posts';
import authRoutes from './routes/auth';
import appointmentRoutes from './routes/appointments';

const app = express();
import { prisma } from './lib/prisma';
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Pasta pública do Front-end (será populada no build)
const publicPath = path.join(__dirname, '..', '..', 'public');
console.log(`[SERVER] Caminho absoluto da pasta public: ${publicPath}`);

// Serve arquivos estáticos com cache agressivo
app.use(express.static(publicPath, {
  maxAge: '1d',
  immutable: true
}));

// Rota de Debug para ver arquivos na VPS
app.get('/api/debug-files', (req, res) => {
  const fs = require('fs');
  const path = require('path');
  try {
    const files = fs.readdirSync(publicPath, { recursive: true });
    res.json({ publicPath, cwd: process.cwd(), files });
  } catch (e: any) {
    res.json({ error: e.message, publicPath, cwd: process.cwd() });
  }
});

// --- ROUTES ---

app.use('/api/championships', championshipRoutes);
app.use('/api/barbers', barberRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/appointments', appointmentRoutes);

// Wildcard route to serve index.html for client-side routing
app.get(/.*/, (req, res) => {
  // Se a rota parecer um arquivo (tiver extensão), não entrega o index.html
  if (req.path.includes('.') && !req.path.endsWith('.html')) {
    return res.status(404).send('File not found');
  }
  
  // NUNCA cacheia o index.html para evitar telas brancas por arquivos antigos
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.sendFile(path.join(publicPath, 'index.html'));
});

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'Battle Barber API is LIVE' });
});

app.listen(port, () => {
  console.log(`[SERVER] Battle Barber API running on port ${port}`);
});

export { prisma };
