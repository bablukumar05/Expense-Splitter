export const openApiDocument = {
  openapi: '3.0.3',
  info: {
    title: 'Expense Splitter API',
    version: '1.0.0',
    description: 'MERN backend API for groups, expenses, settlements, balances, activity and recurring expenses.'
  },
  servers: [{ url: '/api', description: 'Current server' }],
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }
    },
    schemas: {
      Response: {
        type: 'object',
        required: ['success', 'message', 'data'],
        properties: {
          success: { type: 'boolean' },
          message: { type: 'string' },
          data: { nullable: true }
        }
      },
      ExpenseInput: {
        type: 'object',
        required: ['description', 'amount', 'paidBy', 'splitType', 'splits'],
        properties: {
          description: { type: 'string', maxLength: 100 },
          amount: { type: 'number', description: 'Rupees, maximum two decimal places' },
          currency: { type: 'string', enum: ['INR', 'USD', 'EUR', 'GBP'] },
          splitType: { type: 'string', enum: ['EQUAL', 'EXACT', 'PERCENTAGE', 'SHARES'] },
          paidBy: { type: 'array', items: { type: 'object', required: ['member', 'amount'] } },
          splits: { type: 'array', items: { type: 'object', required: ['member'] } }
        }
      },
      SettlementInput: {
        type: 'object',
        required: ['from', 'to', 'amount'],
        properties: {
          from: { type: 'string', description: 'Debtor group-member ObjectId' },
          to: { type: 'string', description: 'Creditor group-member ObjectId' },
          amount: { type: 'number', description: 'Rupees, limited to the outstanding debt' },
          method: { type: 'string', enum: ['cash', 'upi', 'bank', 'other'] },
          note: { type: 'string', maxLength: 200 }
        }
      }
    }
  },
  paths: {
    '/health': {
      get: { summary: 'Health and MongoDB status', responses: { 200: { description: 'Healthy' }, 503: { description: 'Database unavailable' } } }
    },
    '/health/live': {
      get: { summary: 'Liveness probe (process uptime)', responses: { 200: { description: 'Alive' } } }
    },
    '/health/ready': {
      get: { summary: 'Readiness probe (database ping)', responses: { 200: { description: 'Ready' }, 503: { description: 'Database ping failed' } } }
    },
    '/auth/register': {
      post: {
        summary: 'Register a user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'email', 'password'],
                properties: {
                  name: { type: 'string' },
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string', minLength: 8 }
                }
              }
            }
          }
        },
        responses: { 201: { description: 'Created' }, 400: { description: 'Validation failure' } }
      }
    },
    '/auth/login': {
      post: { summary: 'Log in and receive access/refresh tokens', responses: { 200: { description: 'Authenticated' }, 401: { description: 'Invalid credentials' } } }
    },
    '/groups': {
      post: { security: [{ bearerAuth: [] }], summary: 'Create a group', responses: { 201: { description: 'Created' } } },
      get: { security: [{ bearerAuth: [] }], summary: 'List groups', responses: { 200: { description: 'Group page' } } }
    },
    '/groups/{groupId}/expenses': {
      parameters: [{ name: 'groupId', in: 'path', required: true, schema: { type: 'string' } }],
      post: {
        security: [{ bearerAuth: [] }],
        summary: 'Add an expense; money is in rupees and split members are group-member IDs',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/ExpenseInput' } } }
        },
        responses: { 201: { description: 'Expense created' }, 400: { description: 'Invalid split/member' } }
      },
      get: { security: [{ bearerAuth: [] }], summary: 'Search and page expenses', responses: { 200: { description: 'Expenses and filtered summary' } } }
    },
    '/groups/{groupId}/stats': {
      get: { security: [{ bearerAuth: [] }], summary: 'Group spend analytics', responses: { 200: { description: 'Spend, category, member, month and top spender stats' } } }
    },
    '/groups/{groupId}/export': {
      get: { security: [{ bearerAuth: [] }], summary: 'Export group expenses as CSV or PDF', parameters: [{ name: 'format', in: 'query', schema: { type: 'string', enum: ['csv', 'pdf'], default: 'csv' } }], responses: { 200: { description: 'CSV or PDF attachment' } } }
    },
    '/groups/{groupId}/balances': {
      get: { security: [{ bearerAuth: [] }], summary: 'Calculate current member balances', responses: { 200: { description: 'Group balances' } } }
    },
    '/groups/{groupId}/settlements': {
      post: {
        security: [{ bearerAuth: [] }],
        summary: 'Record a settlement without overpaying',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/SettlementInput' } } }
        },
        responses: { 201: { description: 'Settlement recorded' }, 400: { description: 'Would over-settle' } }
      },
      get: {
        security: [{ bearerAuth: [] }],
        summary: 'List settlements with optional member and date filters',
        responses: { 200: { description: 'Settlement page with member names' } }
      }
    },
    '/groups/{groupId}/activity': {
      get: {
        security: [{ bearerAuth: [] }],
        summary: 'List group activity with an optional before cursor',
        parameters: [
          { name: 'before', in: 'query', schema: { type: 'string' } },
          { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 50, default: 20 } }
        ],
        responses: { 200: { description: 'Activity page and next cursor' } }
      }
    },
    '/groups/{groupId}/recurring-expenses': {
      post: { security: [{ bearerAuth: [] }], summary: 'Create weekly or monthly expense template', responses: { 201: { description: 'Recurring template created' } } },
      get: { security: [{ bearerAuth: [] }], summary: 'List recurring expense templates', responses: { 200: { description: 'Templates' } } }
    },
    '/expenses/{expenseId}/comments': {
      parameters: [{ name: 'expenseId', in: 'path', required: true, schema: { type: 'string' } }],
      get: {
        security: [{ bearerAuth: [] }],
        summary: 'List expense comments with an optional after cursor',
        parameters: [
          { name: 'after', in: 'query', schema: { type: 'string' } },
          { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 50, default: 20 } }
        ],
        responses: { 200: { description: 'Comment page and next cursor' } }
      },
      post: { security: [{ bearerAuth: [] }], summary: 'Add a comment', responses: { 201: { description: 'Comment added' } } }
    },
    '/settlements/{settlementId}': {
      get: { security: [{ bearerAuth: [] }], summary: 'Fetch a settlement', responses: { 200: { description: 'Settlement with member names' }, 404: { description: 'Not found' } } },
      delete: { security: [{ bearerAuth: [] }], summary: 'Undo a settlement (creator or admin)', responses: { 200: { description: 'Settlement voided' } } }
    },
    '/auth/refresh-token': {
      post: { summary: 'Rotate the refresh token', responses: { 200: { description: 'New access/refresh pair' }, 401: { description: 'Invalid refresh token' } } }
    },
    '/auth/logout': {
      post: { summary: 'Revoke a refresh token', responses: { 200: { description: 'Logged out' } } }
    },
    '/auth/forgot-password': {
      post: { summary: 'Request password reset email', responses: { 200: { description: 'Generic success response' } } }
    },
    '/auth/reset-password': {
      post: { summary: 'Reset password with email token', responses: { 200: { description: 'Password reset' }, 400: { description: 'Invalid or expired token' } } }
    },
    '/auth/me': {
      get: { security: [{ bearerAuth: [] }], summary: 'Get current user', responses: { 200: { description: 'Current user' } } }
    },
    '/users/me': {
      patch: { security: [{ bearerAuth: [] }], summary: 'Update profile and email notification preference', responses: { 200: { description: 'Updated profile' } } }
    },
    '/users/change-password': {
      patch: { security: [{ bearerAuth: [] }], summary: 'Change password', responses: { 200: { description: 'Password changed; sessions revoked' } } }
    },
    '/users/me/balances': {
      get: { security: [{ bearerAuth: [] }], summary: 'Get personal balances', responses: { 200: { description: 'Balances grouped by currency' } } }
    },
    '/users/me/stats': {
      get: { security: [{ bearerAuth: [] }], summary: 'Personal spend summary grouped by currency', responses: { 200: { description: 'Personal stats' } } }
    },
    '/groups/{groupId}': {
      parameters: [{ name: 'groupId', in: 'path', required: true, schema: { type: 'string' } }],
      get: { security: [{ bearerAuth: [] }], summary: 'Get a group and active members', responses: { 200: { description: 'Group' }, 404: { description: 'Not found' } } },
      patch: { security: [{ bearerAuth: [] }], summary: 'Update group (admin)', responses: { 200: { description: 'Updated group' } } },
      delete: { security: [{ bearerAuth: [] }], summary: 'Archive group (admin)', responses: { 200: { description: 'Archived' } } }
    },
    '/groups/{groupId}/restore': {
      post: { security: [{ bearerAuth: [] }], summary: 'Restore archived group within 30 days', responses: { 200: { description: 'Restored' }, 410: { description: 'Restore window expired' } } }
    },
    '/groups/{groupId}/invitations': {
      post: { security: [{ bearerAuth: [] }], summary: 'Email the invite link without account enumeration', responses: { 200: { description: 'Generic invitation response' } } }
    },
    '/groups/{groupId}/placeholders': {
      post: { security: [{ bearerAuth: [] }], summary: 'Add a placeholder member (admin)', responses: { 201: { description: 'Placeholder created' } } }
    },
    '/groups/{groupId}/members/{memberId}': {
      parameters: [
        { name: 'groupId', in: 'path', required: true, schema: { type: 'string' } },
        { name: 'memberId', in: 'path', required: true, schema: { type: 'string' } }
      ],
      delete: { security: [{ bearerAuth: [] }], summary: 'Soft-remove or block a member (admin)', responses: { 200: { description: 'Removed' }, 400: { description: 'Unsettled balance' } } }
    },
    '/groups/{groupId}/members/{memberId}/role': {
      patch: { security: [{ bearerAuth: [] }], summary: 'Change member role (admin)', responses: { 200: { description: 'Role updated' } } }
    },
    '/groups/{groupId}/members/{memberId}/unblock': {
      post: { security: [{ bearerAuth: [] }], summary: 'Unblock a removed member (admin)', responses: { 200: { description: 'Member unblocked' } } }
    },
    '/groups/{groupId}/leave': {
      post: { security: [{ bearerAuth: [] }], summary: 'Leave group when balance is zero', responses: { 200: { description: 'Left group' }, 400: { description: 'Unsettled balance' } } }
    },
    '/groups/{groupId}/placeholders/{placeholderId}/merge': {
      post: { security: [{ bearerAuth: [] }], summary: 'Merge placeholder history into active member (admin)', responses: { 200: { description: 'History merged' } } }
    },
    '/groups/{groupId}/simplify': {
      get: { security: [{ bearerAuth: [] }], summary: 'Generate simplified debt plan; mine=true filters transfers', responses: { 200: { description: 'Settle-up plan' } } }
    },
    '/groups/{groupId}/invite': {
      get: { security: [{ bearerAuth: [] }], summary: 'Get invite settings (admin)', responses: { 200: { description: 'Invite link and settings' } } },
      patch: { security: [{ bearerAuth: [] }], summary: 'Update invite settings (admin)', responses: { 200: { description: 'Updated invite' } } },
      delete: { security: [{ bearerAuth: [] }], summary: 'Revoke invite (admin)', responses: { 200: { description: 'Revoked invite' } } }
    },
    '/groups/{groupId}/invite/regenerate': {
      post: { security: [{ bearerAuth: [] }], summary: 'Regenerate invite code (admin)', responses: { 200: { description: 'New invite link' } } }
    },
    '/invite/{inviteCode}': {
      get: { summary: 'Public invite preview', responses: { 200: { description: 'Group name and active count only' }, 404: { description: 'Invalid invite' } } }
    },
    '/invite/{inviteCode}/join': {
      post: { security: [{ bearerAuth: [] }], summary: 'Join group through invite', responses: { 200: { description: 'Joined group' }, 403: { description: 'Blocked from group' } } }
    },
    '/recurring-expenses/trigger': {
      post: { summary: 'Trigger due recurring expense execution (external scheduler)', responses: { 200: { description: 'Recurring job executed' }, 401: { description: 'Unauthorized' } } }
    },
    '/recurring-expenses/{recurringExpenseId}': {
      delete: { security: [{ bearerAuth: [] }], summary: 'Stop recurring expense (creator or admin)', responses: { 200: { description: 'Recurring expense stopped' } } }
    },
    '/recurring-expenses/{recurringExpenseId}/pause': {
      post: { security: [{ bearerAuth: [] }], summary: 'Pause recurring expense template', responses: { 200: { description: 'Recurring expense paused' } } }
    },
    '/recurring-expenses/{recurringExpenseId}/resume': {
      post: { security: [{ bearerAuth: [] }], summary: 'Resume recurring expense template', responses: { 200: { description: 'Recurring expense resumed' } } }
    },
    '/recurring-expenses/{recurringExpenseId}/skip': {
      post: { security: [{ bearerAuth: [] }], summary: 'Skip next occurrence of recurring expense', responses: { 200: { description: 'Occurrence skipped' } } }
    },
    '/recurring-expenses/{recurringExpenseId}/run-now': {
      post: { security: [{ bearerAuth: [] }], summary: 'Immediately run next occurrence (test trigger)', responses: { 200: { description: 'Occurrence executed' } } }
    },
    '/expenses/{expenseId}': {
      get: { security: [{ bearerAuth: [] }], summary: 'Get expense', responses: { 200: { description: 'Expense' } } },
      patch: { security: [{ bearerAuth: [] }], summary: 'Update expense (creator/admin)', responses: { 200: { description: 'Updated expense' } } },
      delete: { security: [{ bearerAuth: [] }], summary: 'Soft-delete expense (creator/admin)', responses: { 200: { description: 'Deleted' } } }
    },
    '/expenses/{expenseId}/receipt': {
      post: { security: [{ bearerAuth: [] }], summary: 'Upload JPG/PNG/WEBP receipt', responses: { 200: { description: 'Receipt attached' }, 503: { description: 'Cloudinary not configured' } } },
      delete: { security: [{ bearerAuth: [] }], summary: 'Remove receipt', responses: { 200: { description: 'Receipt removed' } } }
    },
    '/expenses/{expenseId}/comments/{commentId}': {
      delete: { security: [{ bearerAuth: [] }], summary: 'Delete comment (author/admin)', responses: { 200: { description: 'Comment deleted' } } }
    }
  }
};

for (const [path, pathItem] of Object.entries(openApiDocument.paths)) {
  const names = [...path.matchAll(/\{([^}]+)\}/g)].map((match) => match[1]);
  const existing = new Set((pathItem.parameters ?? []).map((parameter) => parameter.name));
  pathItem.parameters = [
    ...(pathItem.parameters ?? []),
    ...names.filter((name) => !existing.has(name)).map((name) => ({
      name,
      in: 'path',
      required: true,
      schema: { type: 'string' }
    }))
  ];
}