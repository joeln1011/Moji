import express from 'express';
import {
  authMe,
  searchUserByUsername,
  uploadAvatar,
  updateProfile,
} from '../controller/userController.js';
import { upload } from '../middlewares/uploadMiddleware.js';
const router = express.Router();

router.get('/me', authMe);
router.get('/search', searchUserByUsername);
router.patch('/me', updateProfile);
router.post('/uploadAvatar', upload.single('file'), uploadAvatar);
export default router;
