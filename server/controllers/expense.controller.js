import * as expenseService from '../services/expense.service.js';
import * as receiptService from '../services/receipt.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/response.js';

export const createExpense = asyncHandler(async (request, response) => {
  const expense = await expenseService.createExpense(request.group, request.user, request.validated.body);
  return sendSuccess(response, 201, 'Expense added', { expense });
});

export const listExpenses = asyncHandler(async (request, response) => {
  const data = await expenseService.listExpenses(request.group, request.validated.query);
  return sendSuccess(response, 200, 'Expenses fetched', data);
});

export const getExpense = asyncHandler(async (request, response) => (
  sendSuccess(response, 200, 'Expense fetched', { expense: request.expense })
));

export const updateExpense = asyncHandler(async (request, response) => {
  const expense = await expenseService.updateExpense(
    request.expense,
    request.group,
    request.user,
    request.validated.body
  );
  return sendSuccess(response, 200, 'Expense updated', { expense });
});

export const deleteExpense = asyncHandler(async (request, response) => {
  await expenseService.softDeleteExpense(request.expense, request.user);
  return sendSuccess(response, 200, 'Expense deleted', null);
});

export const uploadReceipt = asyncHandler(async (request, response) => {
  const expense = await receiptService.attachReceipt(request.expense, request.file);
  return sendSuccess(response, 200, 'Receipt uploaded', { expense });
});

export const deleteReceipt = asyncHandler(async (request, response) => {
  const expense = await receiptService.removeReceipt(request.expense);
  return sendSuccess(response, 200, 'Receipt removed', { expense });
});