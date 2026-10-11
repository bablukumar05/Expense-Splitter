import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema({
  group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },
  actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  actorName: { type: String, required: true, trim: true, maxlength: 80 },
  event: {
    type: String,
    enum: [
      'group.created',
      'group.updated',
      'group.placeholder_added',
      'group.member_joined',
      'group.member_removed',
      'group.member_left',
      'group.role_changed',
      'group.placeholder_merged',
      'group.invite_regenerated',
      'group.invite_revoked',
      'group.invitation_sent',
      'expense.created',
      'expense.updated',
      'expense.deleted',
      'expense.commented',
      'settlement.created',
      'settlement.voided'
    ],
    required: true
  },
  message: { type: String, required: true, trim: true, maxlength: 240 },
  entityType: { type: String, enum: ['group', 'expense', 'settlement'], default: 'group' },
  entityId: { type: mongoose.Schema.Types.ObjectId, default: null },
  targetMember: { type: mongoose.Schema.Types.ObjectId, default: null },
  targetName: { type: String, trim: true, maxlength: 80, default: '' },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} }
}, { timestamps: true });

activitySchema.index({ group: 1, _id: -1 });

const Activity = mongoose.model('Activity', activitySchema);

export { Activity };
export default Activity;