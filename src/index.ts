import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { appointmentRouter } from './routes/appointments';
import { serviceRouter } from './routes/services';
import { userRouter } from './routes/users';
import { availabilityRouter } from './routes/availability';
import { authRouter } from './routes/auth';
import { messageRouter } from './routes/messages';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'https://medease-phi.vercel.app',
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRouter);
app.use('/api/appointments', appointmentRouter);
app.use('/api/services', serviceRouter);
app.use('/api/users', userRouter);
app.use('/api/availability', availabilityRouter);
app.use('/api/messages', messageRouter);

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Socket.IO setup
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'https://medease-phi.vercel.app',
    credentials: true
  }
});

// Store online users
const onlineUsers = new Map<string, string>(); // userId -> socketId

// Socket.IO authentication middleware
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  
  if (!token) {
    return next(new Error('Authentication error'));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as { userId: string };
    socket.data.userId = decoded.userId;
    next();
  } catch (error) {
    next(new Error('Authentication error'));
  }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  const userId = socket.data.userId;
  console.log(`✅ User connected: ${userId}`);
  
  // Store user as online
  onlineUsers.set(userId, socket.id);
  
  // Notify others that user is online
  socket.broadcast.emit('user:online', { userId });

  // Join user's personal room
  socket.join(userId);

  // Handle sending messages
  socket.on('message:send', (data: { receiverId: string; message: string; timestamp?: string; id?: string }) => {
    const { receiverId, message, timestamp, id } = data;
    
    console.log(`📤 Message from ${userId} to ${receiverId}:`, { message, id });
    
    // Emit to receiver if online
    const receiverSocketId = onlineUsers.get(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('message:receive', {
        senderId: userId,
        message,
        timestamp: timestamp || new Date().toISOString(),
        id: id || Date.now().toString()
      });
      console.log(`✅ Message delivered to ${receiverId}`);
    } else {
      console.log(`⚠️ Receiver ${receiverId} is offline`);
    }
  });

  // Handle typing indicator
  socket.on('typing:start', (data: { receiverId: string }) => {
    const receiverSocketId = onlineUsers.get(data.receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('typing:start', { userId });
    }
  });

  socket.on('typing:stop', (data: { receiverId: string }) => {
    const receiverSocketId = onlineUsers.get(data.receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('typing:stop', { userId });
    }
  });

  // Handle mark as read
  socket.on('message:read', (data: { messageIds: string[] }) => {
    // This will be handled by the API endpoint
    socket.emit('message:read:confirmed', data);
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log(`❌ User disconnected: ${userId}`);
    onlineUsers.delete(userId);
    socket.broadcast.emit('user:offline', { userId });
  });
});

// Make io available to routes
export { io };

httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`🔌 Socket.IO server ready`);
});
