import mongoose from 'mongoose';

const friendsSchema = new mongoose.Schema(
  {
    userA: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    userB: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

friendsSchema.pre('save', async function (next) {
  const a = this.userA.toString();
  const b = this.userB.toString();
  if (a > b) {
    this.userA = new mongoose.Types.ObjectId(b);
    this.userB = new mongoose.Types.ObjectId(a);
  }
  next();
});

friendsSchema.index({ userA: 1, userB: 1 }, { unique: true });

const Friends = mongoose.model('Friends', friendsSchema);

export default Friends;
