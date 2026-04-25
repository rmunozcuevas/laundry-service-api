import { param, body, oneOf, query } from 'express-validator';
import { handleValidationErrors } from './handleValidationErrors.js';

export const validateId = [
  param('id').trim().escape().isInt({ min: 1 }).withMessage('Id must be a positive integer'),
  handleValidationErrors,
];

export const validateCreateOrder = [
  body('userId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('userId must be a positive integer')
    .toInt(),

  body('weight_kg')
    .exists({ values: 'falsy' })
    .withMessage('weight_kg is required')
    .bail()
    .isFloat({ min: 0.01 })
    .withMessage('weight_kg must be a positive number')
    .toFloat(),

  body('status')
    .optional()
    .isString()
    .withMessage('status must be a string')
    .bail()
    .isLength({ min: 2, max: 50 })
    .withMessage('status must be between 2 and 50 characters')
    .trim()
    .escape(),

  body('pickup_date').not().exists().withMessage('pickup_date is server-generated'),
  body('total_price').not().exists().withMessage('total_price is server-generated'),

  handleValidationErrors,
];

export const validateUpdateOrder = [
  oneOf([body('weight_kg').exists({ values: 'falsy' }), body('status').exists({ values: 'falsy' })], {
    message: 'At least one field (weight_kg, status) must be provided',
  }),

  body('weight_kg')
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage('weight_kg must be a positive number')
    .toFloat(),

  body('status')
    .optional()
    .isString()
    .withMessage('status must be a string')
    .bail()
    .isLength({ min: 2, max: 50 })
    .withMessage('status must be between 2 and 50 characters')
    .trim()
    .escape(),

  body('pickup_date').not().exists().withMessage('pickup_date is server-generated'),
  body('total_price').not().exists().withMessage('total_price is server-generated'),

  handleValidationErrors,
];

export const validateOrderQuery = [
  query('search').optional().isString().withMessage('search must be a string').trim().escape(),

  query('sortBy')
    .optional()
    .isIn(['id', 'userId', 'pickup_date', 'weight_kg', 'status', 'total_price', 'created_at'])
    .withMessage(
      'sortBy must be one of id, userId, pickup_date, weight_kg, status, total_price, created_at',
    ),

  query('order').optional().isIn(['asc', 'desc']).withMessage('order must be either asc or desc'),

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
