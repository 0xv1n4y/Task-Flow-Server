import { body, validationResult } from 'express-validator';

export const validateTask = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ max: 200 }).withMessage('Title cannot exceed 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage('Description cannot exceed 1000 characters'),
  body('category')
    .optional()
    .isIn(['Work', 'Health', 'Learning', 'Personal'])
    .withMessage('Invalid category'),
  body('priority')
    .optional()
    .isIn(['high', 'medium', 'low'])
    .withMessage('Invalid priority'),
  body('dueDate')
    .optional({ nullable: true })
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage('dueDate must be in yyyy-MM-dd format'),
  body('dueTime')
    .optional({ nullable: true })
    .matches(/^([01]\d|2[0-3]):[0-5]\d$/)
    .withMessage('dueTime must be in HH:mm format'),
];

export function checkValidation(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
}
