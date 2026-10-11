import mongoose from 'mongoose';
import { SUPPORTED_CURRENCIES } from '../config/exchangeRates.js';
import { fromPaise } from '../utils/money.js';

const payerSchema = new mongoose.Schema({
  member: { type: mongoose.Schema.Types.ObjectId, required: true },
  amount: {
    type: Number,
    required: true,
    min: 1,
    validate: { validator: Number.isSafeInteger, message: 'Amount must be a safe integer number of paise' }
  }
}, { _id: false });

const recurringSplitSchema = new mongoose.Schema({
  member: { type: mongoose.Schema.Types.ObjectId, required: true },
  amount: { type: Number, min: 1, validate: Number.isSafeInteger },
  percentage: { type: Number, min: 0, max: 100 },
  shares: { type: Number, min: 1, validate: Number.isSafeInteger }
}, { _id: false });

const recurringExpenseSchema = new mongoose.Schema({
  group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },
  description: { type: String, required: true, trim: true, maxlength: 100 },
  amount: {
    type: Number,
    required: true,
    min: 1,
    validate: { validator: Number.isSafeInteger, message: 'Amount must be a safe integer number of paise' }
  },
  currency: { type: String, enum: SUPPORTED_CURRENCIES, required: true },
  category: { type: String, required: true, default: 'general' },
  notes: { type: String, trim: true, maxlength: 500, default: '' },
  paidBy: { type: [payerSchema], required: true },
  splitType: { type: String, enum: ['EQUAL', 'EXACT', 'PERCENTAGE', 'SHARES'], required: true },
  splits: { type: [recurringSplitSchema], required: true },
  frequency: { type: String, enum: ['weekly', 'monthly'], required: true },
  anchorDay: { type: Number, min: 1, max: 31, default: null },
  nextRunAt: { type: Date, required: true, index: true },
  lastRunAt: { type: Date, default: null },
  leaseToken: { type: String, default: null, select: false },
  leaseExpiresAt: { type: Date, default: null, select: false },
  isActive: { type: Boolean, default: true, index: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

recurringExpenseSchema.index({ isActive: 1, nextRunAt: 1 });

recurringExpenseSchema.set('toJSON', {
  transform(_document, result) {
    result.amount = fromPaise(result.amount);
    result.paidBy = result.paidBy.map((payer) => ({ ...payer, amount: fromPaise(payer.amount) }));
    result.splits = result.splits.map((split) => ({
      ...split,
      ...(split.amount !== undefined ? { amount: fromPaise(split.amount) } : {})
    }));
    delete result.leaseToken;
    delete result.leaseExpiresAt;
    delete result.__v;
    return result;
  }
});

const RecurringExpense = mongoose.model('RecurringExpense', recurringExpenseSchema);

export { RecurringExpense };
export default RecurringExpense;