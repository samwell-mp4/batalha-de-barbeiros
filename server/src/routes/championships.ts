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
    const { name, ligaId, modality, theme, prize, votingTime, maxParticipants, startDate, startTime, creatorId, opponentId } = req.body;
    
    const participantIds: string[] = [];
    if (creatorId) participantIds.push(creatorId);
    if (opponentId) participantIds.push(opponentId);

    const isX1 = modality === 'x1' || parseInt(ligaId) === 1;

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
        creatorId,
        status: isX1 ? 'ONGOING' : 'OPEN',
        participants: {
          connect: participantIds.map(id => ({ id }))
        }
      },
      include: {
        participants: {
          include: {
            user: true
          }
        }
      }
    });

    // If it's a 1x1 match, create the Match automatically and set it to LIVE
    if (isX1) {
      await prisma.match.create({
        data: {
          championshipId: championship.id,
          round: 1,
          player1Id: creatorId || null,
          player2Id: opponentId || null,
          status: 'LIVE',
          score1: 0,
          score2: 0,
        }
      });
    }

    res.json(championship);
  } catch (error: any) {
    console.error('[API ERROR] Failed to create championship:', error.message);
    res.status(500).json({ error: 'Failed to create championship' });
  }
});

// Vote for a player in a match of a championship
router.post('/:id/vote', async (req, res) => {
  try {
    const { id } = req.params; // championshipId
    const { userId, matchId, choiceId } = req.body;

    if (!userId || !choiceId) {
      return res.status(400).json({ error: 'userId and choiceId are required' });
    }

    // Find the match
    let targetMatchId = matchId;
    if (!targetMatchId) {
      const match = await prisma.match.findFirst({
        where: { championshipId: id, status: 'LIVE' }
      });
      if (!match) {
        return res.status(404).json({ error: 'No live match found for this championship' });
      }
      targetMatchId = match.id;
    }

    // Check if user already voted in this match
    const existingVote = await prisma.vote.findUnique({
      where: {
        matchId_userId: {
          matchId: targetMatchId,
          userId: userId
        }
      }
    });

    if (existingVote) {
      return res.status(400).json({ error: 'Você já votou nesta batalha!' });
    }

    // Create the vote
    const vote = await prisma.vote.create({
      data: {
        matchId: targetMatchId,
        userId: userId,
        choiceId: choiceId
      }
    });

    // Update match score (public vote count)
    const match = await prisma.match.findUnique({
      where: { id: targetMatchId }
    });

    if (match) {
      if (choiceId === match.player1Id) {
        await prisma.match.update({
          where: { id: targetMatchId },
          data: { score1: { increment: 1 } }
        });
      } else if (choiceId === match.player2Id) {
        await prisma.match.update({
          where: { id: targetMatchId },
          data: { score2: { increment: 1 } }
        });
      }
    }

    res.json({ success: true, vote });
  } catch (error: any) {
    console.error('[API ERROR] Failed to submit vote:', error.message);
    res.status(500).json({ error: 'Failed to submit vote' });
  }
});

// Submit referee evaluation
router.post('/:id/referee', async (req, res) => {
  try {
    const { id } = req.params; // championshipId
    const { refereeId, matchId, criteria, score, notes } = req.body;

    let targetMatchId = matchId;
    if (!targetMatchId) {
      const match = await prisma.match.findFirst({
        where: { championshipId: id, status: 'LIVE' }
      });
      if (!match) {
        return res.status(404).json({ error: 'No live match found for this championship' });
      }
      targetMatchId = match.id;
    }

    const log = await prisma.refereeLog.create({
      data: {
        matchId: targetMatchId,
        refereeId: refereeId || 'ia-referee',
        criteria: criteria || 'General Technical',
        score: parseFloat(score || 0),
        notes: notes || ''
      }
    });

    // Optional: Update match final status if referee sets score
    res.json({ success: true, log });
  } catch (error: any) {
    console.error('[API ERROR] Failed to submit referee log:', error.message);
    res.status(500).json({ error: 'Failed to submit referee log' });
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
