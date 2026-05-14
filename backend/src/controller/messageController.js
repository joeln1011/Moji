import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import {
  emitNewMessage,
  updateConversationAfterCreateMessage,
} from '../utils/messageHelper.js';
import { io } from '../socket/index.js';
import { uploadImageFromBuffer } from '../middlewares/uploadMiddleware.js';

export const sendDirectMessage = async (req, res) => {
  try {
    const { recipientId, content, conversationId } = req.body;
    const senderId = req.user._id;

    let imgUrl;
    if (req.file) {
      const result = await uploadImageFromBuffer(req.file.buffer, 'moji_chat/messages');
      imgUrl = result.secure_url;
    }

    if (!content?.trim() && !imgUrl) {
      return res
        .status(400)
        .json({ message: 'Message must have content or an image' });
    }

    let conversation;
    if (conversationId) {
      conversation = await Conversation.findById(conversationId);
    }

    if (!conversation) {
      conversation = await Conversation.create({
        type: 'direct',
        participants: [
          { userId: senderId, joinedAt: new Date() },
          { userId: recipientId, joinedAt: new Date() },
        ],
        lastMessageAt: new Date(),
        unreadCounts: new Map(),
      });
    }

    const message = await Message.create({
      conversationId: conversation._id,
      senderId,
      content: content?.trim() || '',
      imgUrl,
    });

    updateConversationAfterCreateMessage(conversation, message, senderId);

    await conversation.save();

    emitNewMessage(io, conversation, message);

    return res.status(201).json(message);
  } catch (error) {
    console.error('Error sending message:', error);
    return res.status(500).json({ message: 'Failed to send message' });
  }
};

export const sendGroupMessage = async (req, res) => {
  try {
    const { conversationId, content } = req.body;
    const senderId = req.user._id;

    const conversation = req.conversation;

    let imgUrl;
    if (req.file) {
      const result = await uploadImageFromBuffer(req.file.buffer, 'moji_chat/messages');
      imgUrl = result.secure_url;
    }

    if (!content?.trim() && !imgUrl) {
      return res
        .status(400)
        .json({ message: 'Message must have content or an image' });
    }

    const message = await Message.create({
      conversationId,
      senderId,
      content: content?.trim() || '',
      imgUrl,
    });
    updateConversationAfterCreateMessage(conversation, message, senderId);

    await conversation.save();
    emitNewMessage(io, conversation, message);

    return res.status(201).json(message);
  } catch (error) {
    console.error('Error sending group message:', error);
    res.status(500).json({ message: 'Failed to send group message' });
  }
};
