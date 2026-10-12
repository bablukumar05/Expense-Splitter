import mongoose from 'mongoose';
import { fromPaise } from '../utils/money.js';
import { SUPPORTED_CURRENCIES } from '../config/exchangeRates.js';

export const CATEGORIES = [
  'general', 'food', 'groceries', 'transport', 'travel', 'stay',
  'entertainment', 'shopping', 'bills', 'rent', 'health', 'other'
];
export const SPLIT_TYPES = ['EQUAL', 'EXACT', 'PERCENTAGE', 'SHARES'];

const paidBySchema = new mongoose.Schema({
  member: { type: mongoose.Schema.Types.ObjectId, required: true },
  amount: {
    type: Number,
    required: true,
    min: 1,
    validate: { validator: Number.isSafeInteger, message: 'Amount must be an integer number of paise' }
  }
}, { _id: false });

const splitSchema = new mongoose.Schema({
  member: { type: mongoose.Schema.Types.ObjectId, required: true },
  owedAmount: {
    type: Number,
    required: true,
    min: 0,
    validate: { validator: Number.isSafeInteger, message: 'Owed amount must be an integer number of paise' }
  },
  percentage: { type: Number, min: 0, max: 100 },
  shares: { type: Number, min: 1, validate: Number.isSafeInteger }
}, { _id: false });

const commentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userName: { type: String, required: true, trim: true, maxlength: 80 },
  text: { type: String, required: true, trim: true, maxlength: 500 },
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now }
});

commentSchema.set('toJSON', {
  transform(_document, result) {
    delete result.isDeleted;
    delete result.deletedAt;
    delete result.__v;
    return result;
  }
});

const expenseSchema = new mongoose.Schema({
  group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },
  description: { type: String, required: true, trim: true, maxlength: 100 },
  amount: {
    type: Number,
    required: true,
    min: 1,
    validate: { validator: Number.isSafeInteger, message: 'Amount must be an integer number of paise' }
  },
  currency: { type: String, enum: SUPPORTED_CURRENCIES, default: 'INR', uppercase: true },
  category: { type: String, enum: CATEGORIES, default: 'general' },
  date: { type: Date, default: Date.now },
  paidBy: {
    type: [paidBySchema],
    validate: { validator: (entries) => entries.length > 0, message: 'At least one payer is required' }
  },
  splitType: { type: String, enum: SPLIT_TYPES, required: true },
  splits: {
    type: [splitSchema],
    validate: { validator: (entries) => entries.length > 0, message: 'At least one split is required' }
  },
  notes: { type: String, trim: true, maxlength: 500, default: '' },
  receiptUrl: { type: String, default: '' },
  receiptPublicId: { type: String, default: '' },
  comments: { type: [commentSchema], default: [] },
  recurringExpenseId: { type: mongoose.Schema.Types.ObjectId, ref: 'RecurringExpense', default: null, select: false },
  recurringOccurrenceAt: { type: Date, default: null, select: false },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date, default: null },
  deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }
}, { timestamps: true });

expenseSchema.index({ group: 1, isDeleted: 1, date: -1 });
expenseSchema.index({ group: 1, 'paidBy.member': 1 });
expenseSchema.index({ group: 1, 'splits.member': 1 });
expenseSchema.index(
  { recurringExpenseId: 1, recurringOccurrenceAt: 1 },
  {
    unique: true,
    partialFilterExpression: {
      recurringExpenseId: { $type: 'objectId' },
      recurringOccurrenceAt: { $type: 'date' }
    }
  }
);

expenseSchema.pre('validate', function validateFinancialTotals() {
  const paidTotal = this.paidBy.reduce((sum, payer) => sum + payer.amount, 0);
  if (paidTotal !== this.amount) {
    this.invalidate('paidBy', 'Invariant broken: payer amounts must equal expense amount');
  }

  const owedTotal = this.splits.reduce((sum, split) => sum + split.owedAmount, 0);
  if (owedTotal !== this.amount) {
    this.invalidate('splits', 'Invariant broken: split amounts must equal expense amount');
  }
});

expenseSchema.set('toJSON', {
  transform(document, result) {
    result.amount = fromPaise(result.amount);
    result.paidBy = result.paidBy.map((payer) => ({ ...payer, amount: fromPaise(payer.amount) }));
    result.splits = result.splits.map((split) => ({ ...split, owedAmount: fromPaise(split.owedAmount) }));
    const visibleCommentIds = new Set(document.comments
      .filter((comment) => !comment.isDeleted)
      .map((comment) => String(comment._id)));
    result.comments = result.comments.filter((comment) => visibleCommentIds.has(String(comment._id))).map((comment) => {
      delete comment.isDeleted;
      delete comment.deletedAt;
      return comment;
    });
    delete result.receiptPublicId;
    delete result.__v;
    return result;
  }
});

const Expense = mongoose.model('Expense', expenseSchema);

export { Expense };
export default Expense;