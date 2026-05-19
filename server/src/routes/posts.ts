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
        likes: true,
        comments: {
          include: {
            user: true
          },
          orderBy: {
            createdAt: 'asc'
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 20
    });
    res.json(posts);
  } catch (error: any) {
    console.error('[API ERROR] Failed to fetch feed:', error.message);
    res.status(500).json({ error: 'Failed to fetch feed' });
  }
});

// Like a post (toggle)
router.post('/:id/like', async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const existingLike = await prisma.like.findUnique({
      where: {
        postId_userId: {
          postId: req.params.id,
          userId: userId
        }
      }
    });

    if (existingLike) {
      await prisma.like.delete({
        where: {
          postId_userId: {
            postId: req.params.id,
            userId: userId
          }
        }
      });
      return res.json({ liked: false });
    } else {
      const like = await prisma.like.create({
        data: {
          postId: req.params.id,
          userId
        }
      });
      return res.json({ liked: true, like });
    }
  } catch (error: any) {
    console.error('[API ERROR] Failed to toggle like:', error.message);
    res.status(500).json({ error: 'Failed to toggle like' });
  }
});

// Comment on a post
router.post('/:id/comment', async (req, res) => {
  try {
    const { userId, content } = req.body;
    if (!userId || !content) {
      return res.status(400).json({ error: 'User ID and Content are required' });
    }

    const comment = await prisma.comment.create({
      data: {
        postId: req.params.id,
        userId,
        content
      },
      include: {
        user: true
      }
    });
    res.json(comment);
  } catch (error: any) {
    console.error('[API ERROR] Failed to comment:', error.message);
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
