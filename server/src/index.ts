import express from 'express';
import path from 'path';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import championshipRoutes from './routes/championships';
import barberRoutes from './routes/barbers';
import postRoutes from './routes/posts';
import authRoutes from './routes/auth';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Pasta pública do Front-end (será populada no build)
const publicPath = path.resolve(process.cwd(), 'public');
app.use(express.static(publicPath));

// --- ROUTES ---

app.use('/api/championships', championshipRoutes);
app.use('/api/barbers', barberRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/auth', authRoutes);

// Wildcard route to serve index.html for client-side routing
app.get(/.*/, (req, res) => {
  // Se a rota parecer um arquivo (tiver extensão), não entrega o index.html
  if (req.path.includes('.') && !req.path.endsWith('.html')) {
    return res.status(404).send('File not found');
  }
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
