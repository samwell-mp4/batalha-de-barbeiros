import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Get social feed
router.get('/', async (req, res) => {
  try {
    const posts = await prisma.post.findMany({
      include: {
        barber: {
          include: { user: true }
        },
        _count: {
          select: { likes: true, comments: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 20
    });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch feed' });
  }
});

// Like a post
router.post('/:id/like', async (req, res) => {
  try {
    const { userId } = req.body;
    const like = await prisma.like.create({
      data: {
        postId: req.params.id,
        userId
      }
    });
    res.json(like);
  } catch (error) {
    res.status(500).json({ error: 'Failed to like post' });
  }
});

// Comment on a post
router.post('/:id/comment', async (req, res) => {
  try {
    const { userId, content } = req.body;
    const comment = await prisma.comment.create({
      data: {
        postId: req.params.id,
        userId,
        content
      }
    });
    res.json(comment);
  } catch (error) {
    res.status(500).json({ error: 'Failed to comment' });
  }
});

export default router;
