import Group from '../models/Group.js';
import RecurringExpense from '../models/RecurringExpense.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const loadRecurringExpense = asyncHandler(async (request, _response, next) => {
  const recurringId = request.validated?.params?.recurringExpenseId ?? request.params.recurringExpenseId;
  const recurringExpense = await RecurringExpense.findById(recurringId);
  if (!recurringExpense) throw new AppError('Recurring expense not found', 404);

  const group = await Group.findById(recurringExpense.group);
  const member = group && !group.isArchived
    ? group.findActiveMemberByUser(request.user._id)
    : null;
  if (!member) throw new AppError('Recurring expense not found', 404);

  request.recurringExpense = recurringExpense;
  request.group = group;
  request.member = member;
  return next();
});