import * as recurringService from '../services/recurringExpense.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/response.js';

export const createRecurringExpense = asyncHandler(async (request, response) => {
  const recurringExpense = await recurringService.createRecurringExpense(
    request.group,
    request.user,
    request.validated.body
  );
  return sendSuccess(response, 201, 'Recurring expense created', { recurringExpense });
});

export const listRecurringExpenses = asyncHandler(async (request, response) => {
  const recurringExpenses = await recurringService.listRecurringExpenses(
    request.group,
    request.validated.query.active
  );
  return sendSuccess(response, 200, 'Recurring expenses fetched', { recurringExpenses });
});

export const deactivateRecurringExpense = asyncHandler(async (request, response) => {
  await recurringService.deactivateRecurringExpense(
    request.recurringExpense,
    request.user,
    request.member
  );
  return sendSuccess(response, 200, 'Recurring expense stopped', null);
});