import { Router } from 'express';
import { prisma } from '../lib/prisma';

const router = Router();

// Get online barbers for the map
router.get('/locations', async (req, res) => {
  try {
    const barbers = await prisma.barber.findMany({
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
    const { id } = req.params;
    const barber = await prisma.barber.findFirst({
      where: {
        OR: [
          { id: id },
          { userId: id }
        ]
      },
      include: {
        user: true,
        posts: { 
          take: 10, 
          orderBy: { createdAt: 'desc' },
          include: {
            likes: true,
            comments: {
              include: {
                user: true
              }
            }
          }
        },
        _count: { select: { appointments: true, posts: true } }
      }
    });
    res.json(barber);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch barber details' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { specialties, workingHours, bio, servicesConfig, barberShop, schedule } = req.body;

    const existingBarber = await prisma.barber.findFirst({
      where: {
        OR: [
          { id: id },
          { userId: id }
        ]
      }
    });

    if (!existingBarber) {
      return res.status(404).json({ error: 'Barber not found' });
    }

    const updated = await prisma.barber.update({
      where: { id: existingBarber.id },
      data: {
        specialties: specialties !== undefined ? specialties : undefined,
        workingHours: workingHours !== undefined ? workingHours : undefined,
        bio: bio !== undefined ? bio : undefined,
        servicesConfig: servicesConfig !== undefined ? servicesConfig : undefined,
        barberShop: barberShop !== undefined ? barberShop : undefined,
        schedule: schedule !== undefined ? schedule : undefined
      },
      include: {
        user: true
      }
    });

    res.json(updated);
  } catch (error: any) {
    console.error('[API ERROR] Failed to update barber profile:', error.message);
    res.status(500).json({ error: 'Failed to update barber profile' });
  }
});

export default router;
