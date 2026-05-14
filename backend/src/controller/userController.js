import { uploadImageFromBuffer } from '../middlewares/uploadMiddleware.js';
import User from '../models/User.js';

export const authMe = async (req, res) => {
  try {
    const user = req.user; // get from authMiddleware
    return res.status(200).json({ user });
  } catch (error) {
    console.error('Auth me error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
export const searchUserByUsername = async (req, res) => {
  try {
    const { username } = req.query;
    if (!username || username.trim() === '') {
      return res.status(400).json({ message: 'Username is required' });
    }

    const user = await User.findOne({ username }).select(
      '_id displayName username avatarUrl',
    );
    return res.status(200).json({ user });
  } catch (error) {
    console.error('Search user error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const { displayName, username, email, phone, bio } = req.body;

    const updates = {};
    if (displayName !== undefined) updates.displayName = displayName.trim();
    if (username !== undefined) updates.username = username.trim().toLowerCase();
    if (email !== undefined) updates.email = email.trim().toLowerCase();
    if (phone !== undefined) updates.phone = phone.trim();
    if (bio !== undefined) updates.bio = bio;

    const updatedUser = await User.findByIdAndUpdate(userId, updates, {
      new: true,
      runValidators: true,
    }).select('-hashedPassword -avatarId');

    return res.status(200).json({ user: updatedUser });
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(409).json({ message: `${field} is already taken` });
    }
    console.error('Update profile error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const uploadAvatar = async (req, res) => {
  try {
    const file = req.file;
    const userId = req.user._id;

    if (!file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const result = await uploadImageFromBuffer(file.buffer);

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        avatarUrl: result.secure_url,
        avatarId: result.public_id,
      },
      {
        new: true,
      },
    ).select('avatarUrl');

    if (!updatedUser.avatarUrl) {
      return res.status(400).json({ message: 'Avatar trả về null' });
    }

    return res.status(200).json({ avatarUrl: updatedUser.avatarUrl });
  } catch (error) {
    console.error('Lỗi xảy ra khi upload avatar', error);
    return res.status(500).json({ message: 'Upload failed' });
  }
};
