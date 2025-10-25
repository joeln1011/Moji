import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protectedRoute = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
  } catch (error) {
    console.log('Auth middleware error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
