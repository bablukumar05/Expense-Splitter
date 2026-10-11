import * as recurringService from '../services/recurringExpense.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/response.js';
import { AppError } from '../utils/AppError.js';

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

export const pauseRecurringExpense = asyncHandler(async (request, response) => {
  await recurringService.pauseRecurringExpense(
    request.recurringExpense,
    request.user,
    request.member
  );
  return sendSuccess(response, 200, 'Recurring expense paused', null);
});

export const resumeRecurringExpense = asyncHandler(async (request, response) => {
  await recurringService.resumeRecurringExpense(
    request.recurringExpense,
    request.user,
    request.member
  );
  return sendSuccess(response, 200, 'Recurring expense resumed', null);
});

export const skipRecurringExpense = asyncHandler(async (request, response) => {
  await recurringService.skipRecurringOccurrence(
    request.recurringExpense,
    request.user,
    request.member
  );
  return sendSuccess(response, 200, 'Next occurrence skipped', {
    nextRunAt: request.recurringExpense.nextRunAt
  });
});

export const runNowRecurringExpense = asyncHandler(async (request, response) => {
  const success = await recurringService.runNowRecurringExpense(
    request.recurringExpense,
    request.user,
    request.member
  );
  return sendSuccess(response, 200, success ? 'Occurrence processed' : 'No occurrence was due or executed', { success });
});

export const triggerRecurringJob = asyncHandler(async (request, response) => {
  const secret = request.headers['x-trigger-secret'] || request.headers['x-cron-secret'];
  if (!recurringService.verifyTriggerSecret(secret)) {
    throw new AppError('Unauthorized trigger request', 401);
  }
  const processed = await recurringService.processDueRecurringExpenses();
  return sendSuccess(response, 200, `Trigger executed; processed ${processed} recurring items`, { processed });
});