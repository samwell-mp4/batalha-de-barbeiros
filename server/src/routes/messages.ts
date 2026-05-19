import { Router } from 'express';
import { prisma } from '../lib/prisma';
import fs from 'fs';
import path from 'path';

const router = Router();
const messagesFilePath = path.join(__dirname, 'messages.json');

function loadMessages() {
  try {
    if (fs.existsSync(messagesFilePath)) {
      const content = fs.readFileSync(messagesFilePath, 'utf-8');
      return JSON.parse(content);
    }
  } catch (e) {
    console.error('[CHAT ERROR] Error loading messages from file:', e);
  }
  return [];
}

function saveMessages(msgs: any[]) {
  try {
    fs.writeFileSync(messagesFilePath, JSON.stringify(msgs, null, 2));
  } catch (e) {
    console.error('[CHAT ERROR] Error saving messages to file:', e);
  }
}

let messages: any[] = loadMessages();

// Get messages between two users
router.get('/:userId1/:userId2', async (req, res) => {
  try {
    const { userId1, userId2 } = req.params;
    const filtered = messages.filter(
      (m) =>
        (m.senderId === userId1 && m.receiverId === userId2) ||
        (m.senderId === userId2 && m.receiverId === userId1)
    );
    res.json(filtered);
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
    const newMessage = {
      id: `msg-${Math.random().toString(36).substr(2, 9)}`,
      senderId,
      receiverId,
      content,
      createdAt: new Date().toISOString(),
    };
    messages.push(newMessage);
    saveMessages(messages);
    res.json(newMessage);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get conversations list for a user
router.get('/conversations/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Find all unique users this user has chatted with
    const chatUserIds = new Set<string>();
    messages.forEach((m) => {
      if (m.senderId === userId) chatUserIds.add(m.receiverId);
      if (m.receiverId === userId) chatUserIds.add(m.senderId);
    });

    const conversations = [];
    for (const otherUserId of chatUserIds) {
      // Find user details
      const otherUser = await prisma.user.findUnique({
        where: { id: otherUserId },
      });
      if (!otherUser) continue;

      // Find last message
      const userMsgs = messages.filter(
        (m) =>
          (m.senderId === userId && m.receiverId === otherUserId) ||
          (m.senderId === otherUserId && m.receiverId === userId)
      );
      const lastMsg = userMsgs[userMsgs.length - 1];

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
