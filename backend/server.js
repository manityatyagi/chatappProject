import express from 'express';
import dotenv from 'dotenv';
import userRoutes from './routes/user.routes.js';
import aiRoutes from './routes/ai.routes.js';
import messageRoutes from './routes/message.routes.js';
import chatRoutes from './routes/chat.routes.js';
import { Server } from 'socket.io';
import http from 'http';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { connectDB } from './libs/connectDB.js';
import { Message } from './models/message.model.js';
import { Chat } from './models/chat.model.js';
import cookieParser from 'cookie-parser';

dotenv.config()
console.log("Frontend URL from .env:", process.env.FRONTEND_URL);

const app = express();

app.use(cors({
  origin: [process.env.FRONTEND_URL],
  credentials: true
}));

app.use(cookieParser());
app.use(express.json());
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/ai', aiRoutes)
app.use('/api/chat', chatRoutes)

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

connectDB();
const PORT = process.env.PORT || 5000;

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ['GET', 'POST'],
    credentials: true
  }
});

const activeUsers = new Map();

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('join', (userId) => {
    activeUsers.set(userId, socket.id);
    socket.userId = userId;
    console.log(`User ${userId} joined with socket ${socket.id}`);
  });

  socket.on('joinChat', (chatId) => {
    socket.join(chatId);
    console.log(`User joined chat: ${chatId}`);
  });

  socket.on('leaveChat', (chatId) => {
    socket.leave(chatId);
    console.log(`User left chat: ${chatId}`);
  });

  socket.on('sendMessage', async ({ chatId, content, messageType = 'text', fileUrl = null }) => {
    try {
      const newMessage = await Message.create({ 
        chatId, 
        sender: socket.userId, 
        content,
        messageType,
        fileUrl
      });
      
      await newMessage.populate('sender', 'name email avatar');
      
      await Chat.findByIdAndUpdate(chatId, { 
        latestMessage: newMessage._id,
        updatedAt: new Date()
      });

      io.to(chatId).emit('receiveMessage', newMessage);
      
    } catch(err) {
      console.error('sendMessage error:', err);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  socket.on('typing', ({ chatId, isTyping }) => {
    socket.to(chatId).emit('userTyping', { 
      userId: socket.userId, 
      isTyping 
    });
  });

  socket.on('sendAudioMessage', async ({ chatId, audioUrl, transcript }) => {
    try {
      const newMessage = await Message.create({
        chatId,
        sender: socket.userId,
        content: transcript || 'Audio message',
        messageType: 'audio',
        fileUrl: audioUrl
      });

      await newMessage.populate('sender', 'name email avatar');
      
      await Chat.findByIdAndUpdate(chatId, { 
        latestMessage: newMessage._id,
        updatedAt: new Date()
      });

      io.to(chatId).emit('receiveMessage', newMessage);
      
    } catch(err) {
      console.error('sendAudioMessage error:', err);
      socket.emit('error', { message: 'Failed to send audio message' });
    }
  });

  socket.on('disconnect', () => {
    if (socket.userId) {
      activeUsers.delete(socket.userId);
      console.log(`User ${socket.userId} disconnected`);
    }
    console.log('User disconnected:', socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export {server, io};

