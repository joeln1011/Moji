import mongoose from 'mongoose';

const friendRequestsSchema = new mongoose.Schema(
  {
    from: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    to: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    message: { type: String, maxLength: 300 },
  },
  { timestamps: true }
);

friendRequestsSchema.index({ from: 1, to: 1 }, { unique: true });
friendRequestsSchema.index({ from: 1 });
friendRequestsSchema.index({ to: 1 });

const FriendRequests = mongoose.model('FriendRequests', friendRequestsSchema);

export default FriendRequests;
