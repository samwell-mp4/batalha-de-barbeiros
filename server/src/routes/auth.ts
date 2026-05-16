import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Register a new user (Client or Barber)
router.post('/register', async (req, res) => {
  try {
    const { 
      name, email, role, city, state, neighborhood, address, number,
      instagram, whatsapp, barberShop, latitude, longitude, 
      specialties, schedule, workingHours, bio 
    } = req.body;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'E-mail já cadastrado' });
    }

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        role: role === 'BARBER' ? 'BARBER' : 'CLIENT',
        city,
        state,
        neighborhood,
        address,
        number,
        instagram,
        whatsapp,
        barberProfile: role === 'BARBER' ? {
          create: {
            barberShop,
            latitude: parseFloat(latitude || 0),
            longitude: parseFloat(longitude || 0),
            specialties: specialties || [],
            schedule,
            workingHours,
            bio: bio || ''
          }
        } : undefined
      },
      include: {
        barberProfile: true
      }
    });

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Simple Login (Simulation for now)
router.post('/login', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await prisma.user.findUnique({
      where: { email },
      include: { barberProfile: true }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

export default router;
