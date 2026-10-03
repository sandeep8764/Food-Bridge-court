import { validationResult } from 'express-validator';

export function validateRequest(req, res, next) {
  const result = validationResult(req);

  if (!result.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: 'Validation failed',
      errors: result.array().map((error) => ({ field: error.path, message: error.msg }))
    });
  }

  return next();
}
