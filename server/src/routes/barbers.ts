import { Router } from 'express';
import { prisma } from '../lib/prisma';

const router = Router();

// Get online barbers for the map
router.get('/locations', async (req, res) => {
  try {
    const barbers = await prisma.barber.findMany({
      where: { isOnline: true },
      include: {
        user: {
          select: {
            name: true,
            avatar: true,
            city: true
          }
        }
      }
    });
    res.json(barbers);
  } catch (error: any) {
    console.error('[API ERROR] Failed to fetch locations:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Get all barbers
router.get('/', async (req, res) => {
  try {
    const barbers = await prisma.barber.findMany({
      include: { user: true }
    });
    res.json(barbers);
  } catch (error: any) {
    console.error('[API ERROR] Failed to fetch barbers:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Update barber location and status
router.post('/status', async (req, res) => {
  try {
    const { barberId, latitude, longitude, isOnline } = req.body;
    const barber = await prisma.barber.update({
      where: { id: barberId },
      data: {
        latitude,
        longitude,
        isOnline,
      }
    });
    res.json(barber);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update status' });
  }
});

// Get barber profile details
router.get('/:id', async (req, res) => {
  try {
    const barber = await prisma.barber.findUnique({
      where: { id: req.params.id },
      include: {
        user: true,
        posts: { take: 10, orderBy: { createdAt: 'desc' } },
        _count: { select: { appointments: true, posts: true } }
      }
    });
    res.json(barber);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch barber details' });
  }
});

export default router;
