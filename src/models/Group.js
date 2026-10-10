import mongoose from 'mongoose';

export const MAX_MEMBERS = 50;
export const MAX_GROUPS_PER_USER = 100;

const memberSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  name: { type: String, required: true, trim: true, maxlength: 50 },
  role: { type: String, enum: ['admin', 'member'], default: 'member' },
  isPlaceholder: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  isBlocked: { type: Boolean, default: false },
  joinedAt: { type: Date, default: Date.now },
  leftAt: { type: Date, default: null },
  mergedInto: { type: mongoose.Schema.Types.ObjectId, default: null }
});

const inviteSchema = new mongoose.Schema({
  code: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  expiresAt: { type: Date, default: null },
  maxUses: { type: Number, default: null, min: 1 },
  usedCount: { type: Number, default: 0, min: 0 }
}, { _id: false });

const groupSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, minlength: 2, maxlength: 60 },
  description: { type: String, trim: true, maxlength: 200, default: '' },
  type: { type: String, enum: ['trip', 'home', 'couple', 'friends', 'other'], default: 'other' },
  emoji: { type: String, default: '💸', maxlength: 8 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  currency: { type: String, default: 'INR', uppercase: true, minlength: 3, maxlength: 3 },
  members: { type: [memberSchema], default: [] },
  invite: { type: inviteSchema, required: true, select: false },
  balanceRevision: { type: Number, default: 0, select: false },
  isArchived: { type: Boolean, default: false },
  archivedAt: { type: Date, default: null }
}, { timestamps: true });

groupSchema.index({ 'members.user': 1 });
groupSchema.index({ 'invite.code': 1 }, { unique: true, sparse: true });

groupSchema.methods.activeMembers = function activeMembers() {
  return this.members.filter((member) => member.isActive);
};

groupSchema.methods.findMemberByUser = function findMemberByUser(userId) {
  return this.members.find((member) => {
    if (!member.user) return false;
    return String(member.user._id ?? member.user) === String(userId);
  });
};

groupSchema.methods.findActiveMemberByUser = function findActiveMemberByUser(userId) {
  const member = this.findMemberByUser(userId);
  return member?.isActive ? member : undefined;
};

groupSchema.set('toJSON', {
  transform(_document, result) {
    delete result.invite;
    delete result.__v;
    return result;
  }
});

const Group = mongoose.model('Group', groupSchema);

export { Group };
export default Group;