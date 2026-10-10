import mongoose from 'mongoose';
import { fromPaise } from '../utils/money.js';

const settlementSchema = new mongoose.Schema({
  group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },
  from: { type: mongoose.Schema.Types.ObjectId, required: true },
  to: { type: mongoose.Schema.Types.ObjectId, required: true },
  amount: {
    type: Number,
    required: true,
    min: 1,
    validate: { validator: Number.isSafeInteger, message: 'Amount must be a safe integer number of paise' }
  },
  method: { type: String, enum: ['cash', 'upi', 'bank', 'other'], default: 'cash' },
  note: { type: String, trim: true, maxlength: 200, default: '' },
  date: { type: Date, default: Date.now },
  status: { type: String, enum: ['completed', 'void'], default: 'completed' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date, default: null }
}, { timestamps: true });

settlementSchema.index({ group: 1, isDeleted: 1, date: -1 });
settlementSchema.index({ group: 1, from: 1 });
settlementSchema.index({ group: 1, to: 1 });

settlementSchema.pre('validate', function validateSettlementMembers() {
  if (this.from && this.to && this.from.equals(this.to)) {
    this.invalidate('to', 'A member cannot settle with themselves');
  }
});

settlementSchema.set('toJSON', {
  transform(_document, result) {
    result.amount = fromPaise(result.amount);
    delete result.__v;
    return result;
  }
});

const Settlement = mongoose.model('Settlement', settlementSchema);

export { Settlement };
export default Settlement;