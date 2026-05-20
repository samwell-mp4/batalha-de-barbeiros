import { Router } from 'express';
import { prisma } from '../lib/prisma';

const router = Router();

// Get messages between two users
router.get('/:userId1/:userId2', async (req, res) => {
  try {
    const { userId1, userId2 } = req.params;
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId1, receiverId: userId2 },
          { senderId: userId2, receiverId: userId1 }
        ]
      },
      orderBy: { createdAt: 'asc' }
    });
    res.json(messages);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Send a message
router.post('/', async (req, res) => {
  try {
    const { senderId, receiverId, content } = req.body;
    if (!senderId || !receiverId || !content) {
      return res.status(400).json({ error: 'Missing parameters' });
    }
    const message = await prisma.message.create({
      data: { senderId, receiverId, content }
    });
    res.json(message);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get conversations list for a user
router.get('/conversations/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // Find all unique users this user has chatted with
    const sentMessages = await prisma.message.findMany({
      where: { senderId: userId },
      select: { receiverId: true }
    });
    const receivedMessages = await prisma.message.findMany({
      where: { receiverId: userId },
      select: { senderId: true }
    });

    const chatUserIds = new Set<string>();
    sentMessages.forEach(m => chatUserIds.add(m.receiverId));
    receivedMessages.forEach(m => chatUserIds.add(m.senderId));

    const conversations = [];
    for (const otherUserId of chatUserIds) {
      const otherUser = await prisma.user.findUnique({
        where: { id: otherUserId },
      });
      if (!otherUser) continue;

      // Find last message
      const lastMsg = await prisma.message.findFirst({
        where: {
          OR: [
            { senderId: userId, receiverId: otherUserId },
            { senderId: otherUserId, receiverId: userId }
          ]
        },
        orderBy: { createdAt: 'desc' }
      });

      if (!lastMsg) continue;

      conversations.push({
        otherUser: {
          id: otherUser.id,
          name: otherUser.name,
          avatar: otherUser.avatar,
        },
        lastMessage: lastMsg,
      });
    }

    // Sort by last message date desc
    conversations.sort(
      (a, b) =>
        new Date(b.lastMessage.createdAt).getTime() -
        new Date(a.lastMessage.createdAt).getTime()
    );

    res.json(conversations);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
