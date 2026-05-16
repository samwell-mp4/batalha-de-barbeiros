import { Router } from 'express';
import { prisma } from '../lib/prisma';

const router = Router();

// Get all championships
router.get('/', async (req, res) => {
  try {
    const championships = await prisma.championship.findMany({
      include: {
        participants: {
          include: {
            user: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(championships);
  } catch (error: any) {
    console.error('[API ERROR] Failed to fetch championships:', error.message);
    res.json([]); // Return empty array to keep frontend alive
  }
});

// Create a new championship
router.post('/', async (req, res) => {
  try {
    const { name, ligaId, modality, theme, prize, votingTime, maxParticipants, startDate, startTime } = req.body;
    const championship = await prisma.championship.create({
      data: {
        name,
        ligaId: parseInt(ligaId),
        modality,
        theme,
        prize,
        votingTime: parseInt(votingTime),
        maxParticipants: parseInt(maxParticipants),
        startDate: startDate ? new Date(startDate) : null,
        startTime,
        status: 'OPEN'
      }
    });
    res.json(championship);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create championship' });
  }
});

// Get single championship details
router.get('/:id', async (req, res) => {
  try {
    const championship = await prisma.championship.findUnique({
      where: { id: req.params.id },
      include: {
        participants: { include: { user: true } },
        matches: {
          include: {
            votes: true,
            refereeLogs: true
          }
        }
      }
    });
    res.json(championship);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch championship details' });
  }
});

export default router;
