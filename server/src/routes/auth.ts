import { Router } from 'express';
import { prisma } from '../lib/prisma';

const router = Router();

// Register a new user (Client or Barber)
router.post('/register', async (req, res) => {
  try {
    const { 
      name, email, password, role, city, state, neighborhood, address, number,
      instagram, whatsapp, barberShop, latitude, longitude, 
      specialties, schedule, workingHours, bio 
    } = req.body;
    
    console.log('[API] Tentativa de Registro:', { name, email, role });
    
    if (!process.env.DATABASE_URL) {
      console.error('[CRITICAL] DATABASE_URL não configurada no servidor!');
      return res.status(500).json({ error: 'Erro de configuração do servidor (Banco de Dados)' });
    }

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
        password,
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
            bio: bio || '',
            isOnline: true // Já começa online para aparecer no mapa
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

// Simple Login with Password
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(`[API] Tentativa de login para: ${email}`);
    
    const user = await prisma.user.findUnique({
      where: { email },
      include: { barberProfile: true }
    });

    if (!user) {
      return res.status(404).json({ error: 'E-mail não encontrado' });
    }

    // Por enquanto conferência direta de texto (depois podemos usar bcrypt)
    if (user.password && user.password !== password) {
      return res.status(401).json({ error: 'Senha incorreta' });
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
      where: { id },
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
// Atualizar Perfil do Usuário
router.put('/profile/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, bio, avatar } = req.body;
    
    const user = await prisma.user.update({
      where: { id },
      data: { name, bio, avatar },
      include: { barberProfile: true }
    });
    
    res.json(user);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Trocar Senha do Usuário
router.put('/password/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { currentPassword, newPassword } = req.body;
    
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });
    
    if (user.password && user.password !== currentPassword) {
      return res.status(401).json({ error: 'Senha atual incorreta' });
    }
    
    const updatedUser = await prisma.user.update({
      where: { id },
      data: { password: newPassword },
      include: { barberProfile: true }
    });
    
    res.json(updatedUser);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
