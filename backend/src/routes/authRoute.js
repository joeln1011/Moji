import express from 'express';
import {
  signOut,
  signIn,
  signUp,
  refreshToken,
  deleteAccount,
} from '../controller/authController.js';
import { protectedRoute } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/signup', signUp);
router.post('/signin', signIn);
router.post('/signout', signOut);
router.post('/refresh', refreshToken);
router.delete('/account', protectedRoute, deleteAccount);

export default router;
