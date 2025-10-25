import e from 'express';
import express from 'express';
import { logIn, logOut, register } from '../controller/authController.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', logIn);
router.post('/logout', logOut);
export default router;
