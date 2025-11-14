import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware, AuthRequest } from '../lib/auth';

const prisma = new PrismaClient();
export const messageRouter = Router();

// Send a message
messageRouter.post(
  '/',
  authMiddleware,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { receiverId, message } = req.body;
      const senderId = req.userId!;

      if (!receiverId || !message) {
        res.status(400).json({ error: 'Receiver ID and message are required' });
        return;
      }

      // Create message in database
      const newMessage = await prisma.message.create({
        data: {
          senderId,
          receiverId,
          message,
        },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              role: true,
            },
          },
          receiver: {
            select: {
              id: true,
              name: true,
              role: true,
            },
          },
        },
      });

      res.status(201).json(newMessage);
    } catch (error) {
      console.error('Error sending message:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Get conversation between two users
messageRouter.get(
  '/conversation/:otherUserId',
  authMiddleware,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { otherUserId } = req.params;
      const userId = req.userId!;

      const messages = await prisma.message.findMany({
        where: {
          OR: [
            { senderId: userId, receiverId: otherUserId },
            { senderId: otherUserId, receiverId: userId },
          ],
        },
        orderBy: {
          createdAt: 'asc',
        },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              role: true,
            },
          },
          receiver: {
            select: {
              id: true,
              name: true,
              role: true,
            },
          },
        },
      });

      res.json(messages);
    } catch (error) {
      console.error('Error fetching conversation:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Get all conversations for a user (list of people they've chatted with)
messageRouter.get(
  '/conversations',
  authMiddleware,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.userId!;

      // Get all unique users the current user has exchanged messages with
      const sentMessages = await prisma.message.findMany({
        where: { senderId: userId },
        select: { receiverId: true },
        distinct: ['receiverId'],
      });

      const receivedMessages = await prisma.message.findMany({
        where: { receiverId: userId },
        select: { senderId: true },
        distinct: ['senderId'],
      });

      const userIds = new Set([
        ...sentMessages.map((m) => m.receiverId),
        ...receivedMessages.map((m) => m.senderId),
      ]);

      // Get user details and unread count for each conversation
      const conversations = await Promise.all(
        Array.from(userIds).map(async (otherUserId) => {
          const user = await prisma.user.findUnique({
            where: { id: otherUserId },
            select: {
              id: true,
              name: true,
              role: true,
              specialty: true,
              gender: true,
            },
          });

          const unreadCount = await prisma.message.count({
            where: {
              senderId: otherUserId,
              receiverId: userId,
              isRead: false,
            },
          });

          const lastMessage = await prisma.message.findFirst({
            where: {
              OR: [
                { senderId: userId, receiverId: otherUserId },
                { senderId: otherUserId, receiverId: userId },
              ],
            },
            orderBy: {
              createdAt: 'desc',
            },
          });

          return {
            user,
            unreadCount,
            lastMessage,
          };
        })
      );

      res.json(conversations);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Mark messages as read
messageRouter.patch(
  '/mark-read',
  authMiddleware,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { senderId } = req.body;
      const receiverId = req.userId!;

      if (!senderId) {
        res.status(400).json({ error: 'Sender ID is required' });
        return;
      }

      await prisma.message.updateMany({
        where: {
          senderId,
          receiverId,
          isRead: false,
        },
        data: {
          isRead: true,
        },
      });

      res.json({ success: true });
    } catch (error) {
      console.error('Error marking messages as read:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Get unread message count
messageRouter.get(
  '/unread-count',
  authMiddleware,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.userId!;

      const count = await prisma.message.count({
        where: {
          receiverId: userId,
          isRead: false,
        },
      });

      res.json({ count });
    } catch (error) {
      console.error('Error fetching unread count:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);
