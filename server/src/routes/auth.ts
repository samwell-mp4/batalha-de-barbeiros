import { Router } from 'express';
import { prisma } from '../lib/prisma';

const router = Router();

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
  } catch (error: any) {
    console.error('[API ERROR] Registration failed:', error.message);
    res.status(500).json({ error: `Registration failed: ${error.message}` });
  }
});

// Simple Login (Simulation for now)
router.post('/login', async (req, res) => {
  try {
    const { email } = req.body;
    console.log(`[API] Tentativa de login para: ${email}`);
    
    const user = await prisma.user.findUnique({
      where: { email },
      include: { barberProfile: true }
    });

    if (!user) {
      console.log(`[API] Usuário não encontrado: ${email}`);
      return res.status(404).json({ error: 'E-mail não encontrado' });
    }

    res.json(user);
  } catch (error: any) {
    console.error('[API ERROR] Login failed:', error.message);
    res.status(500).json({ error: `Login failed: ${error.message}` });
  }
});

// Busca dados atualizados do usuário logado
router.get('/me/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) },
      include: { barberProfile: true }
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    res.json(user);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
