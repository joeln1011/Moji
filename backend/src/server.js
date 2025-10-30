import express from 'express';
import dotenv from 'dotenv';
import authRoute from './routes/authRoute.js';
import userRoute from './routes/userRoute.js';
import cookieParser from 'cookie-parser';
import { connectDb } from './libs/mongodb.js';
import { protectedRoute } from './middlewares/authMiddleware.js';
import cors from 'cors';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
// Public Routes
app.use('/api/auth', authRoute);

// Private Routes
app.use(protectedRoute);
app.use('/api/users', userRoute);

connectDb().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});
