import { Server } from 'socket.io';
import http from 'http';
import express from 'express';
import { socketAuthMiddleware } from '../middlewares/socketMiddleware.js';
import { getUserConversationsForSocketIO } from '../controller/conversationController.js';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    credentials: true,
  },
});
app.set('io', io);
io.use(socketAuthMiddleware);

const onlineUsers = new Map(); //{userId: socketId}

io.on('connection', async (socket) => {
  const user = socket.user;
  console.log(`${user.displayName} online with socket ID: ${socket.id}`);

  if (user.showOnlineStatus !== false) {
    onlineUsers.set(user._id.toString(), socket.id);
    io.emit('online-users', Array.from(onlineUsers.keys()));
  }

  const conversationIds = await getUserConversationsForSocketIO(user._id);
  conversationIds.forEach((id) => {
    socket.join(id);
  });

  socket.on('join-conversation', (conversationId) => {
    socket.join(conversationId);
  });

  socket.join(user._id.toString());

  socket.on('toggle-online-status', async (showOnlineStatus) => {
    await user.constructor.findByIdAndUpdate(user._id, { showOnlineStatus });
    if (showOnlineStatus) {
      onlineUsers.set(user._id.toString(), socket.id);
    } else {
      onlineUsers.delete(user._id.toString());
    }
    io.emit('online-users', Array.from(onlineUsers.keys()));
  });

  socket.on('disconnect', () => {
    onlineUsers.delete(user._id.toString());
    io.emit('online-users', Array.from(onlineUsers.keys()));
  });
});
export { io, app, server };
