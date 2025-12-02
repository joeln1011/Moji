import Friends from '../models/Friends.js';
import User from '../models/User.js';
import FriendRequests from '../models/FriendRequests.js';

export const sendFriendRequests = async (req, res) => {
  try {
    const { to, message } = req.body;
    const from = req.user._id;

    if (from === to) {
      return res
        .status(400)
        .json({ message: 'Cannot send friend request to yourself' });
    }
    const userExists = await User.exists({ _id: to });
    if (!userExists) {
      return res.status(404).json({ message: 'User not found' });
    }

    let userA = from.toString();
    let userB = to.toString();
    if (userA > userB) {
      [userA, userB] = [userB, userA];
    }
    const [alreadyFriends, existingRequest] = await Promise.all([
      Friends.findOne({ userA, userB }),
      FriendRequests.findOne({
        $or: [
          { from, to },
          { from: to, to: from },
        ],
      }),
    ]);
    if (alreadyFriends) {
      return res.status(400).json({ message: 'Already friends' });
    }
    if (existingRequest) {
      return res.status(400).json({ message: 'Friend request already exists' });
    }

    const request = await FriendRequests.create({
      from,
      to,
      message,
    });
    return res
      .status(201)
      .json({ message: 'Friend request sent successfully', request });
  } catch (error) {
    console.error('Error adding friend:', error);
    res.status(500).json({ message: 'Failed to add friend' });
  }
};

export const acceptFriendRequests = async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.user._id;

    const request = await FriendRequests.findById(requestId);

    if (!request) {
      return res.status(404).json({ message: 'Friend request not found' });
    }
    if (request.to.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ message: 'Not authorized to accept this friend request' });
    }
    const friend = await Friends.create({
      userA: request.from,
      userB: request.to,
    });

    await FriendRequests.findByIdAndDelete(requestId);

    const from = await User.findById(request.from)
      .select('_id displayName avatarUrl')
      .lean();

    return res.status(200).json({
      message: 'Friend request accepted successfully',
      newFriend: {
        _id: from?._id,
        displayName: from?.displayName,
        avatarUrl: from?.avatarUrl,
      },
    });
  } catch (error) {
    console.error('Error accepting friend request:', error);
    res.status(500).json({ message: 'Failed to accept friend request' });
  }
};

export const declineFriendRequests = async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.user._id;
    const request = await FriendRequests.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: 'Friend request not found' });
    }
    if (request.to.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ message: 'Not authorized to decline this friend request' });
    }
    await FriendRequests.findByIdAndDelete(requestId);
    return res
      .status(200)
      .json({ message: 'Friend request declined successfully' });
  } catch (error) {
    console.error('Error declining friend request:', error);
    res.status(500).json({ message: 'Failed to decline friend request' });
  }
};

export const getAllFriends = async (req, res) => {
  try {
    const userId = req.user._id;
    const friendships = await Friends.find({
      $or: [{ userA: userId }, { userB: userId }],
    })
      .populate('userA', '_id displayName avatarUrl')
      .populate('userB', '_id displayName avatarUrl')
      .lean();
    if (!friendships.length) {
      return res.status(200).json({ friends: [] });
    }
    const friends = friendships.map((f) =>
      f.userA._id.toString() === userId.toString() ? f.userB : f.userA
    );
    return res.status(200).json({ friends });
  } catch (error) {
    console.error('Error getting all friends:', error);
    res.status(500).json({ message: 'Failed to get all friends' });
  }
};

export const getFriendRequests = async (req, res) => {
  try {
    const 
  } catch (error) {
    console.error('Error getting all friend requests:', error);
    res.status(500).json({ message: 'Failed to get all friend requests' });
  }
};
