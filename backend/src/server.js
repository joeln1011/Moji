import express from 'express';
import dotenv from 'dotenv';
import { connectDb } from './libs/mongodb.js';
import authRoute from './routes/authRoute.js';
import userRoute from './routes/userRoute.js';
import cookieParser from 'cookie-parser';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(express.json());
app.use(cookieParser());
// Public Routes
app.use('/api/auth', authRoute);
// Private Routes
app.use('/api/user', userRoute);
connectDb().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});
