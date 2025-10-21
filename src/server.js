import express from 'express';
import dotenv from 'dotenv';
import { connectDb } from './libs/mongodb.js';
import authRoute from './routes/authRoute.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(express.json());

// Public Routes
app.use('/api/auth', authRoute);
// Private Routes

connectDb().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});
