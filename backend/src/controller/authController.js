import bcrypt from 'bcrypt';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import Session from '../models/Session.js';

const ACCESS_TOKEN_TTL = '30m';
const REFRESH_TOKEN_TTL = 14 * 24 * 60 * 60 * 1000; // 14 days in milliseconds

export const signUp = async (req, res) => {
  try {
    const { username, password, email, firstName, lastName } = req.body;
    if (!username || !password || !email || !firstName || !lastName) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // check if user already exists
    const duplicate = await User.findOne({ username });
    if (duplicate) {
      return res.status(409).json({ message: 'Username already exists' });
    }
    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // create user in db
    await User.create({
      username,
      hashedPassword,
      email,
      displayName: `${firstName} ${lastName}`,
    });

    // return
    return res.sendStatus(204);
  } catch (error) {
    console.error('Sign Up error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const signIn = async (req, res) => {
  try {
    //get inputs
    const { username, password } = req.body;
    if (!username || !password) {
      return res
        .status(400)
        .json({ message: 'Username or Password is missing' });
    }

    // find hashed password from db to comprare password input
    const user = await User.findOne({ username });
    if (!user) {
      return res
        .status(401)
        .json({ message: 'Username or password is incorrect' });
    }

    // check password
    const passwordCorrect = await bcrypt.compare(password, user.hashedPassword);
    if (!passwordCorrect) {
      return res
        .status(401)
        .json({ message: 'Username or password is incorrect' });
    }

    // if correct create accessToken with  JWT
    const accessToken = jwt.sign(
      { userId: user._id },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: ACCESS_TOKEN_TTL }
    );

    //create refreshToken with JWT
    const refreshToken = crypto.randomBytes(64).toString('hex');

    // store refreshToken in db
    await Session.create({
      userId: user._id,
      refreshToken,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL),
    });

    // send refreshToken to cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true, //can't be accessed by JS
      secure: true, //only sent over HTTPS
      sameSite: 'none', // sent in cross-site requests
      maxAge: REFRESH_TOKEN_TTL,
    });

    // send accessToken to res
    return res.status(200).json({
      message: `User ${username} logged in successfully`,
      accessToken,
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const signOut = async (req, res) => {
  try {
    //get refreshToken from cookie
    const token = req.cookies?.refreshToken;
    if (token) {
      //delete refreshToken from Session
      await Session.deleteOne({ refreshToken: token });
      //clear cookie
      res.clearCookie('refreshToken');
    }
    return res.sendStatus(204);
  } catch (error) {
    console.error('Sign Out error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
