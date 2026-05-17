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
const invisibleUsers = new Set(); // userIds who hide their online status

const broadcastOnlineUsers = () => {
  const visible = Array.from(onlineUsers.keys()).filter(
    (id) => !invisibleUsers.has(id),
  );
  io.emit('online-users', visible);
};

io.on('connection', async (socket) => {
  const user = socket.user;
  console.log(`${user.displayName} online with socket ID: ${socket.id}`);

  onlineUsers.set(user._id, socket.id);
  broadcastOnlineUsers();

  const conversationIds = await getUserConversationsForSocketIO(user._id);
  conversationIds.forEach((id) => {
    socket.join(id);
  });

  socket.on('join-conversation', (conversationId) => {
    socket.join(conversationId);
  });

  socket.on('set-visibility', ({ visible }) => {
    if (visible) {
      invisibleUsers.delete(user._id);
    } else {
      invisibleUsers.add(user._id);
    }
    broadcastOnlineUsers();
  });

  socket.join(user._id.toString());

  socket.on('disconnect', () => {
    onlineUsers.delete(user._id);
    invisibleUsers.delete(user._id);
    broadcastOnlineUsers();
  });
});
export { io, app, server };
