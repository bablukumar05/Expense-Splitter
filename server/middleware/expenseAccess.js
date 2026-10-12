import Expense from '../models/Expense.js';
import Group from '../models/Group.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const loadExpense = asyncHandler(async (request, _response, next) => {
  const expenseId = request.validated?.params?.expenseId ?? request.params.expenseId;
  const expense = await Expense.findOne({ _id: expenseId, isDeleted: false });
  if (!expense) throw new AppError('Expense not found', 404);

  const group = await Group.findById(expense.group);
  const member = group && !group.isArchived
    ? group.findActiveMemberByUser(request.user._id)
    : null;
  if (!member) throw new AppError('Expense not found', 404);

  request.expense = expense;
  request.group = group;
  request.member = member;
  return next();
});

export function requireOwnerOrAdmin(request, _response, next) {
  const isOwner = request.expense.createdBy.equals(request.user._id);
  if (!isOwner && request.member.role !== 'admin') {
    return next(new AppError('Only the expense creator or a group admin can do this', 403));
  }
  return next();
}