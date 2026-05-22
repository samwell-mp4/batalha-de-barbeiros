import { Router } from 'express';
import { prisma } from '../lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'elite_barber_secret_2026';

function generateToken(user: any) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

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

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Auto-resolve cityId + neighborhoodId for BARBER registration
    let cityId: number | null = null;
    let neighborhoodId: number | null = null;
    if (role === 'BARBER' && city && state) {
      const foundCity = await (prisma as any).city.findFirst({
        where: {
          name: { contains: city, mode: 'insensitive' },
          state: { sigla: state }
        }
      });
      if (foundCity) {
        cityId = foundCity.id;
        if (neighborhood) {
          let hood = await (prisma as any).neighborhood.findFirst({
            where: {
              name: { contains: neighborhood, mode: 'insensitive' },
              cityId: foundCity.id
            }
          });
          if (!hood) {
            hood = await (prisma as any).neighborhood.create({
              data: {
                name: neighborhood,
                slug: neighborhood.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
                cityId: foundCity.id,
                barbers_count: 0
              }
            });
          }
          neighborhoodId = hood.id;
        }
      }
    }

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
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
            isOnline: true,
            cityId,
            neighborhoodId,
          }
        } : undefined
      },
      include: {
        barberProfile: true
      }
    });

    const token = generateToken(user);
    res.json({ user, token });
  } catch (error: any) {
    console.error('[API ERROR] Registration failed:', error.message);
    res.status(500).json({ error: `Registration failed: ${error.message}` });
  }
});

// Login with Password
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

    if (!user.password) {
      return res.status(401).json({ error: 'Senha não configurada' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Senha incorreta' });
    }

    const token = generateToken(user);
    res.json({ user, token });
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
    
    let avatarToSave = avatar;

    // Handle base64 avatar upload
    if (avatar && avatar.startsWith('data:image/')) {
      try {
        const matches = avatar.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        if (matches && matches.length === 3) {
          const base64Data = matches[2];
          const buffer = Buffer.from(base64Data, 'base64');
          
          const filename = `avatar-${id}-${Date.now()}.webp`;
          
          const uploadsDir = require('path').join(__dirname, '..', '..', '..', 'public', 'uploads');
          if (!require('fs').existsSync(uploadsDir)) {
            require('fs').mkdirSync(uploadsDir, { recursive: true });
          }
          
          const filePath = require('path').join(uploadsDir, filename);
          require('fs').writeFileSync(filePath, buffer);
          
          avatarToSave = `/uploads/${filename}`;
        }
      } catch (e: any) {
        console.error('[UPLOAD ERROR] Failed to save avatar:', e.message);
      }
    }
    
    const user = await prisma.user.update({
      where: { id },
      data: { name, bio, avatar: avatarToSave },
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
    
    if (!user.password) {
      return res.status(401).json({ error: 'Senha não configurada' });
    }

    const passwordMatch = await bcrypt.compare(currentPassword, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Senha atual incorreta' });
    }
    
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    const updatedUser = await prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
      include: { barberProfile: true }
    });
    
    res.json(updatedUser);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
