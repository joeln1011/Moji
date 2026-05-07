import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import mongoose from 'mongoose';

export const createConversation = async (req, res) => {
  try {
    const { type, name, memberIds } = req.body;
    const userId = req.user._id;

    if (
      !type ||
      (type === 'group' && !name) ||
      !memberIds ||
      !Array.isArray(memberIds) ||
      memberIds.length === 0
    ) {
      return res.status(400).json({ message: 'Invalid conversation data' });
    }

    let conversation;

    if (type === 'direct') {
      const participantId = memberIds[0];
      conversation = await Conversation.findOne({
        type: 'direct',
        'participants.userId': { $all: [userId, participantId] },
      });

      if (!conversation) {
        conversation = new Conversation({
          type: 'direct',
          participants: [{ userId }, { userId: participantId }],
          lastMessageAt: new Date(),
        });
        await conversation.save();
      }
    }

    if (type === 'group') {
      conversation = new Conversation({
        type: 'group',
        participants: [{ userId }, ...memberIds.map((id) => ({ userId: id }))],
        group: { name, createdBy: userId },
        lastMessageAt: new Date(),
      });
      await conversation.save();
    }

    if (!conversation) {
      return res.status(400).json({ message: 'Conversation type is invalid' });
    }

    await conversation.populate([
      { path: 'participants.userId', select: 'displayName avatarUrl' },
      { path: 'seenBy', select: 'displayName avatarUrl' },
      { path: 'lastMessage.senderId', select: 'displayName avatarUrl' },
    ]);
    return res.status(201).json(conversation);
  } catch (error) {
    console.error('Error creating conversation:', error);
    return res.status(500).json({ message: 'Failed to create conversation' });
  }
};

export const getConversations = async (req, res) => {
  try {
    const userId = req.user._id;
    const conversations = await Conversation.find({
      'participants.userId': userId,
    })
      .sort({ lastMessageAt: -1, updatedAt: -1 })
      .populate({
        path: 'participants.userId',
        select: 'displayName avatarUrl',
      })
      .populate({
        path: 'lastMessage.senderId',
        select: 'displayName avatarUrl',
      })
      .populate({
        path: 'seenBy',
        select: 'displayName avatarUrl',
      });

    const formatted = conversations.map((convo) => {
      const participants = (convo.participants || []).map((p) => ({
        _id: p.userId?._id,
        displayName: p.userId?.displayName,
        avatarUrl: p.userId?.avatarUrl ?? null,
        joinedAt: p.joinedAt,
      }));
      return {
        ...convo.toObject(),
        unreadCounts: convo.unreadCounts || {},
        participants,
      };
    });
    return res.status(200).json({ conversations: formatted });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return res.status(500).json({ message: 'Failed to fetch conversations' });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { limit = 50, cursor } = req.query;

    const query = { conversationId };

    if (cursor) {
      query.createdAt = { $lt: new Date(cursor) };
    }

    let messages = await Message.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit) + 1);

    let nextCursor = null;
    if (messages.length > Number(limit)) {
      const nextMessage = messages[messages.length - 1];
      nextCursor = nextMessage.createdAt.toISOString();
      messages.pop();
    }

    messages = messages.reverse();

    return res.status(200).json({ messages, nextCursor });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return res.status(500).json({ message: 'Failed to fetch messages' });
  }
};

export const getUserConversationsForSocketIO = async (userId) => {
  try {
    const conversations = await Conversation.find(
      { 'participants.userId': userId },
      { _id: 1 },
    );
    return conversations.map((c) => c._id.toString());
  } catch (error) {
    console.error('Error fetching user conversations:', error);
    return [];
  }
};

export const markAsSeen = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id.toString();
    const io = req.app.get('io');

    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      return res.status(400).json({ message: 'Invalid conversation id' });
    }

    const conversation = await Conversation.findById(conversationId).lean();

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }
    const last = conversation.lastMessage;

    if (!last) {
      return res.status(200).json({ message: 'No messages to mark as seen' });
    }

    const lastSenderId = last.senderId?.toString();
    if (!lastSenderId) {
      return res.status(200).json({ message: 'No sender to mark as seen' });
    }

    if (lastSenderId === userId) {
      return res
        .status(200)
        .json({ message: 'Sender no need to mark as seen' });
    }

    const updated = await Conversation.findOneAndUpdate(
      { _id: conversationId },
      {
        $addToSet: { seenBy: userId },
        $set: { [`unreadCounts.${userId}`]: 0 },
      },
      {
        new: true,
      },
    );
    if (!updated) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    if (io) {
      io.to(conversationId).emit('read-message', {
        conversation: updated,
        lastMessage: {
          _id: updated.lastMessage?._id,
          content: updated.lastMessage?.content,
          createdAt: updated.lastMessage?.createdAt,
          sender: { _id: updated.lastMessage?.senderId },
        },
      });
    }

    return res.status(200).json({
      message: 'Messages marked as seen',
      seenBy: updated.seenBy || [],
      myUnreadCount:
        updated.unreadCounts instanceof Map
          ? updated.unreadCounts.get(userId) || 0
          : updated.unreadCounts?.[userId] || 0,
    });
  } catch (error) {
    console.error('Error marking messages as seen:', error);
    res.status(500).json({ message: 'Failed to mark messages as seen' });
  }
};
