import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';

const router = Router();

router.get('/search', async (req: Request, res: Response) => {
  try {
    const q = (req.query.q as string || '').trim();
    if (!q || q.length < 2) {
      return res.json([]);
    }

    const cities = await (prisma as any).city.findMany({
      where: {
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { state: { nome: { contains: q, mode: 'insensitive' } } },
          { state: { sigla: { contains: q, mode: 'insensitive' } } },
        ],
      },
      include: { state: true },
      orderBy: [{ barbers_count: 'desc' }],
      take: 20,
    });

    return res.json(cities.map((c: any) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      state: { sigla: c.state.sigla, nome: c.state.nome, slug: c.state.slug },
      barbers_count: c.barbers_count,
      latitude: c.latitude,
      longitude: c.longitude,
    })));
  } catch (error: any) {
    console.error('[CITIES] Erro ao buscar:', error);
    return res.status(500).json({ error: error.message });
  }
});

router.get('/top', async (req: Request, res: Response) => {
  try {
    const cities = await (prisma as any).city.findMany({
      where: { barbers_count: { gte: 1 } },
      include: { state: true },
      orderBy: { barbers_count: 'desc' },
      take: 10,
    });

    return res.json(cities.map((c: any) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      state: { sigla: c.state.sigla, nome: c.state.nome },
      barbers_count: c.barbers_count,
      latitude: c.latitude,
      longitude: c.longitude,
    })));
  } catch (error: any) {
    console.error('[CITIES] Erro ao listar top:', error);
    return res.status(500).json({ error: error.message });
  }
});

export default router;
