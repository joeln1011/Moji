import e from 'express';
import express from 'express';
import { logIn, register } from '../controller/authController.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', logIn);

export default router;
