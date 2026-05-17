import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { io, type Socket } from 'socket.io-client';
import { useAuthStore } from './useAuthStore';
import type { SocketState } from '../types/store';
import { useChatStore } from './useChatStore';

const baseURL = import.meta.env.VITE_SOCKET_URL;

export const useSocketStore = create<SocketState>()(
  persist(
    (set, get) => ({
      socket: null,
      onlineUsers: [],
      showOnlineStatus: true,
      connectSocket: () => {
        const accessToken = useAuthStore.getState().accessToken;
        const existingSocket = get().socket;

        if (existingSocket) return;

        const socket: Socket = io(baseURL, {
          auth: { token: accessToken },
          transports: ['websocket'],
        });
        set({ socket });

        socket.on('connect', () => {
          console.log('Socket connected:', socket.id);
          const { showOnlineStatus } = get();
          if (!showOnlineStatus) {
            socket.emit('set-visibility', { visible: false });
          }
        });

        // online users
        socket.on('online-users', (userIds) => {
          set({ onlineUsers: userIds });
        });

        // new message
        socket.on('new-message', ({ message, conversation, unreadCounts }) => {
          useChatStore.getState().addMessage(message);
          const lastMessage = {
            _id: conversation.lastMessage._id,
            content: conversation.lastMessage.content,
            createdAt: conversation.lastMessage.createdAt,
            sender: {
              _id: conversation.lastMessage.senderId,
              displayName: '',
              avatarUrl: null,
            },
          };
          const updatedConversation = {
            ...conversation,
            lastMessage,
            unreadCounts,
          };
          if (
            useChatStore.getState().activeConversationId ===
            message.conversationId
          ) {
            useChatStore.getState().markAsSeen();
          }
          useChatStore.getState().updateConversation(updatedConversation);
        });

        // read message
        socket.on('read-message', ({ conversation, lastMessage }) => {
          const updated = {
            ...conversation,
            lastMessage,
          };
          useChatStore.getState().updateConversation(updated);
        });

        //new group
        socket.on('new-group', (conversation) => {
          useChatStore.getState().addConvo(conversation);
          socket.emit('join-conversation', conversation._id);
        });
      },
      disconnectSocket: () => {
        const socket = get().socket;
        if (socket) {
          socket.disconnect();
          set({ socket: null });
        }
      },
      setShowOnlineStatus: (show) => {
        set({ showOnlineStatus: show });
        get().socket?.emit('set-visibility', { visible: show });
      },
    }),
    {
      name: 'socket-storage',
      partialize: (state) => ({ showOnlineStatus: state.showOnlineStatus }),
    },
  ),
);
