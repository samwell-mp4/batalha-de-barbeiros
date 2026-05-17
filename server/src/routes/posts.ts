import { Router } from 'express';
import { prisma } from '../lib/prisma';

const router = Router();

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

// Create a new post
router.post('/', async (req, res) => {
  try {
    const { imageUrl, description, barberId } = req.body;
    
    if (!imageUrl || !barberId) {
      return res.status(400).json({ error: 'Image URL and Barber ID are required' });
    }

    const post = await prisma.post.create({
      data: {
        imageUrl,
        content: description || '',
        barberId
      }
    });
    res.json(post);
  } catch (error: any) {
    console.error('[API ERROR] Failed to create post:', error.message);
    res.status(500).json({ error: `Failed to create post: ${error.message}` });
  }
});

export default router;
