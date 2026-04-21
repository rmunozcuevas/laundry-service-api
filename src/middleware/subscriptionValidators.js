import { param, body, oneOf, query } from 'express-validator';
import { handleValidationErrors } from './handleValidationErrors.js';

export const validateId = [
  param('id')
    .trim()
    .escape()
    .isInt({ min: 1 })
    .withMessage('Id must be a positive integer'),

  handleValidationErrors,
];

export const validateCreateSubscription = [
  body('userId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('userId must be a positive integer')
    .toInt(),

  body('plan')
    .exists({ values: 'falsy' })
    .withMessage('plan is required')
    .bail()
    .isString()
    .withMessage('plan must be a string')
    .bail()
    .isLength({ min: 2, max: 50 })
    .withMessage('plan must be between 2 and 50 characters')
    .trim()
    .escape(),

  body('discount_percentage')
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage('discount_percentage must be an integer between 0 and 100')
    .toInt(),

  body('active_flag')
    .optional()
    .isBoolean()
    .withMessage('active_flag must be a boolean')
    .toBoolean(),

  handleValidationErrors,
];

export const validateUpdateSubscription = [
  oneOf(
    [
      body('plan').exists({ values: 'falsy' }),
      body('discount_percentage').exists({ values: 'falsy' }),
      body('active_flag').exists({ values: 'falsy' }),
    ],
    { message: 'At least one field (plan, discount_percentage, active_flag) must be provided' },
  ),

  body('plan')
    .optional()
    .isString()
    .withMessage('plan must be a string')
    .bail()
    .isLength({ min: 2, max: 50 })
    .withMessage('plan must be between 2 and 50 characters')
    .trim()
    .escape(),

  body('discount_percentage')
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage('discount_percentage must be an integer between 0 and 100')
    .toInt(),

  body('active_flag')
    .optional()
    .isBoolean()
    .withMessage('active_flag must be a boolean')
    .toBoolean(),

  handleValidationErrors,
];

export const validateSubscriptionQuery = [
  query('search')
    .optional()
    .isString()
    .withMessage('search must be a string')
    .trim()
    .escape(),

  query('sortBy')
    .optional()
    .isIn(['id', 'userId', 'plan', 'discount_percentage', 'active_flag'])
    .withMessage('sortBy must be one of id, userId, plan, discount_percentage, active_flag'),

  query('order')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('order must be either asc or desc'),

  query('offset')
    .optional()
    .isInt({ min: 0 })
    .withMessage('offset must be a non-negative integer')
    .toInt(),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('limit must be an integer between 1 and 50')
    .toInt(),

  handleValidationErrors,
];
