import { AppError } from '../utils/AppError.js';

export function validate(schemas) {
  return function validateRequest(request, _response, next) {
    const parsed = { body: {}, params: {}, query: {} };

    for (const part of ['body', 'params', 'query']) {
      if (!schemas[part]) continue;

      const result = schemas[part].safeParse(request[part] ?? {});
      if (!result.success) {
        const details = result.error.issues.map((issue) => ({
          field: [part, ...issue.path].join('.'),
          message: issue.message
        }));
        return next(new AppError('Request validation failed', 400, details));
      }
      parsed[part] = result.data;
    }

    if (schemas.body) request.body = parsed.body;
    request.validated = parsed;
    return next();
  };
}