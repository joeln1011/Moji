import express from 'express';
import {
  createConversation,
  getConversations,
  getMessages,
} from '../controller/conversationController.js';
import { checkFriendShip } from '../middlewares/friendMiddleware.js';

const router = express.Router();

router.post('/', checkFriendShip, createConversation);
router.get('/', getConversations);
router.get('/:conversationId/messages', getMessages);

export default router;
