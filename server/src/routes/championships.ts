import { Router } from 'express';
import { prisma } from '../lib/prisma';

const router = Router();

// In-memory likes and comments store to guarantee 100% stability and persistence for the current process
const matchLikesStore: Record<string, string[]> = {}; // matchId -> array of userIds
const matchCommentsStore: Record<string, Array<{ id: string, userId: string, userName: string, userAvatar: string, content: string, createdAt: Date }>> = {}; // matchId -> comments

function injectLikesAndComments(championship: any) {
  if (!championship) return championship;
  
  // Clean up refereeLogs from the response object as requested
  if (championship.matches && championship.matches.length > 0) {
    championship.matches = championship.matches.map((m: any) => {
      const { refereeLogs, ...rest } = m;
      const likes = matchLikesStore[m.id] || [];
      const comments = matchCommentsStore[m.id] || [];
      return {
        ...rest,
        likes,
        comments
      };
    });
  }
  return championship;
}


// Helper to sync and self-heal championship states
async function checkAndSyncChampionship(id: string, nowOverride?: Date) {
  const championship = await prisma.championship.findUnique({
    where: { id },
    include: {
      participants: { include: { user: true } },
      matches: { include: { votes: true, refereeLogs: true } }
    }
  });

  if (!championship) return null;
  const isX1 = championship.modality === 'x1' || championship.ligaId === 1;
  if (!isX1 || championship.matches.length === 0) return championship;

  const match = championship.matches[0];
  const now = nowOverride || new Date();

  // Helper to parse scheduled start
  let scheduledStart: Date | null = null;
  if (championship.startDate) {
    const datePart = new Date(championship.startDate).toISOString().split('T')[0];
    const timePart = championship.startTime || '00:00';
    scheduledStart = new Date(`${datePart}T${timePart}:00`);
  }

  const createdAtTime = new Date(championship.createdAt).getTime();
  const gracePeriodMs = 30 * 60 * 1000;
  const isPastScheduled = scheduledStart && now > scheduledStart;
  const hasExpired = scheduledStart && isPastScheduled && (
    (now.getTime() - createdAtTime > gracePeriodMs) ||
    (createdAtTime - scheduledStart.getTime() > gracePeriodMs)
  );

  // 1. Check if Expired (not accepted past scheduled time)
  if (championship.status === 'WAITING' && match.status === 'PENDING' && !match.photo2 && hasExpired) {
    await prisma.match.update({
      where: { id: match.id },
      data: { status: 'FINISHED' }
    });
    return await prisma.championship.update({
      where: { id },
      data: { status: 'FINISHED' },
      include: {
        participants: { include: { user: true } },
        matches: { include: { votes: true, refereeLogs: true } }
      }
    });
  }

  // 2. Check if Auto-Start Scheduled (accepted and past scheduled time, status is WAITING)
  if (championship.status === 'WAITING' && match.status === 'PENDING' && match.photo2 && scheduledStart && now > scheduledStart) {
    await prisma.match.update({
      where: { id: match.id },
      data: { status: 'LIVE', startedAt: scheduledStart }
    });
    return await prisma.championship.update({
      where: { id },
      data: { status: 'ONGOING' },
      include: {
        participants: { include: { user: true } },
        matches: { include: { votes: true, refereeLogs: true } }
      }
    });
  }

  // 3. Check if Voting Duration has expired
  if (championship.status === 'ONGOING' && match.status === 'LIVE' && match.startedAt) {
    const startedAtDate = new Date(match.startedAt);
    const votingTimeHours = championship.votingTime || 24;
    const expireTime = new Date(startedAtDate.getTime() + votingTimeHours * 60 * 60 * 1000);
    if (now > expireTime) {
      const winnerId = match.score1 >= match.score2 ? match.player1Id : match.player2Id;
      await prisma.match.update({
        where: { id: match.id },
        data: { status: 'FINISHED', winnerId }
      });
      return await prisma.championship.update({
        where: { id },
        data: { status: 'FINISHED' },
        include: {
          participants: { include: { user: true } },
          matches: { include: { votes: true, refereeLogs: true } }
        }
      });
    }
  }

  return championship;
}

// Get all championships
router.get('/', async (req, res) => {
  try {
    const championships = await prisma.championship.findMany({
      include: {
        participants: {
          include: {
            user: true
          }
        },
        matches: {
          include: {
            votes: true,
            refereeLogs: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const simulatedNow = req.headers['x-test-current-time'] ? new Date(req.headers['x-test-current-time'] as string) : undefined;
    const syncedList = [];
    for (const c of championships) {
      if (c.status === 'WAITING' || c.status === 'ONGOING') {
        const synced = await checkAndSyncChampionship(c.id, simulatedNow);
        if (synced) syncedList.push(injectLikesAndComments(synced));
      } else {
        syncedList.push(injectLikesAndComments(c));
      }
    }

    res.json(syncedList);
  } catch (error: any) {
    console.error('[API ERROR] Failed to fetch championships:', error.message);
    res.json([]);
  }
});

// Create a new championship
router.post('/', async (req, res) => {
  try {
    const { name, ligaId, modality, theme, prize, votingTime, maxParticipants, startDate, startTime, creatorId, opponentId, photo1 } = req.body;
    
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
        status: isX1 ? 'WAITING' : 'OPEN', // WAITING for accept if X1
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

    // If it's a 1x1 match, create the Match automatically and set it to PENDING (waiting for accept)
    if (isX1) {
      await prisma.match.create({
        data: {
          championshipId: championship.id,
          round: 1,
          player1Id: creatorId || null,
          player2Id: opponentId || null,
          photo1: photo1 || null,
          photo2: null,
          status: 'PENDING',
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

// Accept a 1x1 Challenge invitation
router.post('/:id/accept', async (req, res) => {
  try {
    const { id } = req.params; // championshipId
    const { photo2 } = req.body;

    if (!photo2) {
      return res.status(400).json({ error: 'A foto do seu trabalho é obrigatória para aceitar o desafio.' });
    }

    const championship = await prisma.championship.findUnique({
      where: { id },
      include: { matches: true }
    });

    if (!championship) {
      return res.status(404).json({ error: 'Campeonato não encontrado' });
    }

    if (championship.matches.length === 0) {
      return res.status(400).json({ error: 'Partida não encontrada para este desafio' });
    }

    const match = championship.matches[0];

    // Check expiration before accepting
    let scheduledStart: Date | null = null;
    if (championship.startDate) {
      const datePart = new Date(championship.startDate).toISOString().split('T')[0];
      const timePart = championship.startTime || '00:00';
      scheduledStart = new Date(`${datePart}T${timePart}:00`);
    }

    const now = req.headers['x-test-current-time'] ? new Date(req.headers['x-test-current-time'] as string) : new Date();

    const createdAtTime = new Date(championship.createdAt).getTime();
    const gracePeriodMs = 30 * 60 * 1000;
    const isPastScheduled = scheduledStart && now > scheduledStart;
    const hasExpired = scheduledStart && isPastScheduled && (
      (now.getTime() - createdAtTime > gracePeriodMs) ||
      (createdAtTime - scheduledStart.getTime() > gracePeriodMs)
    );

    if (hasExpired) {
      await prisma.match.update({
        where: { id: match.id },
        data: { status: 'FINISHED' }
      });
      await prisma.championship.update({
        where: { id },
        data: { status: 'FINISHED' }
      });
      return res.status(400).json({ error: 'Este desafio expirou pois passou do horário de confirmação.' });
    }

    // Update match with player 2 photo
    await prisma.match.update({
      where: { id: match.id },
      data: { photo2 }
    });

    const updated = await checkAndSyncChampionship(id, now);
    res.json({ success: true, championship: updated });
  } catch (error: any) {
    console.error('[API ERROR] Failed to accept challenge:', error.message);
    res.status(500).json({ error: 'Failed to accept challenge' });
  }
});

// Start the 1x1 Battle now (Creator choice)
router.post('/:id/start-now', async (req, res) => {
  try {
    const { id } = req.params;

    const championship = await prisma.championship.findUnique({
      where: { id },
      include: { matches: true }
    });

    if (!championship || championship.matches.length === 0) {
      return res.status(404).json({ error: 'Desafio ou partida não encontrados' });
    }

    const match = championship.matches[0];

    await prisma.match.update({
      where: { id: match.id },
      data: { status: 'LIVE', startedAt: new Date() }
    });

    const updated = await prisma.championship.update({
      where: { id },
      data: { status: 'ONGOING' },
      include: {
        participants: { include: { user: true } },
        matches: { include: { votes: true, refereeLogs: true } }
      }
    });

    res.json({ success: true, championship: updated });
  } catch (error: any) {
    console.error('[API ERROR] Failed to start battle:', error.message);
    res.status(500).json({ error: 'Failed to start battle' });
  }
});

// Start the 1x1 Battle scheduled (Creator choice)
router.post('/:id/start-scheduled', async (req, res) => {
  try {
    const { id } = req.params;

    const championship = await prisma.championship.findUnique({
      where: { id },
      include: { matches: true }
    });

    if (!championship || championship.matches.length === 0) {
      return res.status(404).json({ error: 'Desafio ou partida não encontrados' });
    }

    const match = championship.matches[0];

    // Keep it PENDING so it auto-starts when schedule passes
    await prisma.match.update({
      where: { id: match.id },
      data: { status: 'PENDING' }
    });

    const updated = await prisma.championship.update({
      where: { id },
      data: { status: 'WAITING' },
      include: {
        participants: { include: { user: true } },
        matches: { include: { votes: true, refereeLogs: true } }
      }
    });

    res.json({ success: true, championship: updated });
  } catch (error: any) {
    console.error('[API ERROR] Failed to schedule battle:', error.message);
    res.status(500).json({ error: 'Failed to schedule battle' });
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

    const simulatedNow = req.headers['x-test-current-time'] ? new Date(req.headers['x-test-current-time'] as string) : undefined;
    const champ = await checkAndSyncChampionship(id, simulatedNow);
    if (!champ) {
      return res.status(404).json({ error: 'Championship not found' });
    }

    let targetMatchId = matchId;
    if (!targetMatchId) {
      const match = champ.matches.find(m => m.status === 'LIVE');
      if (!match) {
        return res.status(404).json({ error: 'A votação para esta partida não está ativa no momento.' });
      }
      targetMatchId = match.id;
    }

    const match = champ.matches.find(m => m.id === targetMatchId);
    if (!match || match.status !== 'LIVE') {
      return res.status(400).json({ error: 'A votação para esta partida não está ativa no momento.' });
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

    res.json({ success: true, vote });
  } catch (error: any) {
    console.error('[API ERROR] Failed to submit vote:', error.message);
    res.status(500).json({ error: 'Failed to submit vote' });
  }
});


// Like / unlike a match
router.post('/:id/like', async (req, res) => {
  try {
    const { id } = req.params; // championshipId
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const championship = await prisma.championship.findUnique({
      where: { id },
      include: { matches: true }
    });

    if (!championship || championship.matches.length === 0) {
      return res.status(404).json({ error: 'Championship or match not found' });
    }

    const matchId = championship.matches[0].id;
    if (!matchLikesStore[matchId]) {
      matchLikesStore[matchId] = [];
    }

    const index = matchLikesStore[matchId].indexOf(userId);
    if (index > -1) {
      // Unlike
      matchLikesStore[matchId].splice(index, 1);
    } else {
      // Like
      matchLikesStore[matchId].push(userId);
    }

    res.json({ success: true, likes: matchLikesStore[matchId] });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Add comment to a match
router.post('/:id/comment', async (req, res) => {
  try {
    const { id } = req.params; // championshipId
    const { userId, content } = req.body;
    if (!userId || !content) {
      return res.status(400).json({ error: 'userId and content are required' });
    }

    const championship = await prisma.championship.findUnique({
      where: { id },
      include: { matches: true }
    });

    if (!championship || championship.matches.length === 0) {
      return res.status(404).json({ error: 'Championship or match not found' });
    }

    const matchId = championship.matches[0].id;
    if (!matchCommentsStore[matchId]) {
      matchCommentsStore[matchId] = [];
    }

    // Get user details for comment
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    const newComment = {
      id: `comment-${Math.random().toString(36).substr(2, 9)}`,
      userId,
      userName: user?.name || 'Anônimo',
      userAvatar: user?.avatar || `https://i.pravatar.cc/150?u=${userId}`,
      content,
      createdAt: new Date()
    };

    matchCommentsStore[matchId].push(newComment);
    res.json({ success: true, comment: newComment });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get single championship details
router.get('/:id', async (req, res) => {
  try {
    const simulatedNow = req.headers['x-test-current-time'] ? new Date(req.headers['x-test-current-time'] as string) : undefined;
    const championship = await checkAndSyncChampionship(req.params.id, simulatedNow);
    if (!championship) {
      return res.status(404).json({ error: 'Failed to fetch championship details' });
    }
    res.json(injectLikesAndComments(championship));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch championship details' });
  }
});

export default router;
