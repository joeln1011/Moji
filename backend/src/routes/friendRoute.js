import express from 'express';

import {
  sendFriendRequests,
  acceptFriendRequests,
  declineFriendRequests,
  getAllFriends,
  getFriendRequests,
} from '../controller/friendController.js';

const router = express.Router();

router.get('/', getAllFriends);
router.get('/requests', getFriendRequests);

router.post('/requests', sendFriendRequests);

router.post('/requests/:requestId/accept', acceptFriendRequests);
router.post('/requests/:requestId/decline', declineFriendRequests);

export default router;
