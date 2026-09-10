import { AppError } from '../utils/AppError.js';

export function validateRequest(schema) {
  return (req, res, next) => {
    try {
      const parsed = schema.safeParse({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      if (!parsed.success) {
        const issues = parsed.error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
          rule: issue.code,
        }));

        throw new AppError('Validation failed for request parameters', 400, 'VALIDATION_ERROR', issues);
      }

      // Assign parsed/coerced data back to request
      if (parsed.data.body) req.body = parsed.data.body;
      if (parsed.data.query) req.query = parsed.data.query;
      if (parsed.data.params) req.params = parsed.data.params;

      return next();
    } catch (err) {
      return next(err);
    }
  };
}
