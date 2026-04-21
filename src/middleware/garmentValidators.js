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

export const validateCreateGarment = [
  body('type')
    .exists({ values: 'falsy' })
    .withMessage('Clothing type is required')
    .bail()
    .trim()
    .escape()
    .isLength({ min: 3 })
    .withMessage('Clothing type must be at least 3 characters'),

  body('quantity')
    .exists({ values: 'falsy' })
    .withMessage('Quantity is required')
    .bail()
    .isInt({ min: 1 })
    .withMessage('Quantity must be a positive integer')
    .toInt(),

  body('care_instructions')
    .exists({ values: 'falsy' })
    .withMessage('Care instructions are required')
    .bail()
    .trim()
    .escape()
    .isLength({ min: 3 })
    .withMessage('Care instructions must be at least 3 characters'),

  body('delicate_flag')
    .exists({ values: 'falsy' })
    .withMessage('Delicate flag is required')
    .bail()
    .isBoolean()
    .withMessage('Delicate flag must be a boolean')
    .toBoolean(),

  body('unit_price')
    .exists({ values: 'falsy' })
    .withMessage('Unit price is required')
    .bail()
    .isFloat({ min: 0 })
    .withMessage('Unit price must be a non-negative number')
    .toFloat(),

  body('orderId')
    .exists({ values: 'falsy' })
    .withMessage('Order ID is required')
    .bail()
    .isInt({ min: 1 })
    .withMessage('Order ID must be a positive integer')
    .toInt(),

  handleValidationErrors,
];

export const validateUpdateGarment = [
  oneOf(
    [
      body('type').exists({ values: 'falsy' }),
      body('quantity').exists({ values: 'falsy' }),
      body('care_instructions').exists({ values: 'falsy' }),
      body('delicate_flag').exists({ values: 'falsy' }),
      body('unit_price').exists({ values: 'falsy' }),
    ],
    {
      message:
        'At least one field (type, quantity, care_instructions, delicate_flag, unit_price) must be provided',
    },
  ),

  body('type')
    .optional()
    .trim()
    .escape()
    .isString()
    .withMessage('Type must be a string')
    .bail()
    .isLength({ min: 3 })
    .withMessage('Type must be at least 3 characters'),

  body('quantity')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Quantity must be a positive integer')
    .toInt(),

  body('care_instructions')
    .optional()
    .trim()
    .escape()
    .isString()
    .withMessage('Care instructions must be a string')
    .bail()
    .isLength({ min: 3 })
    .withMessage('Care instructions must be at least 3 characters'),

  body('delicate_flag')
    .optional()
    .isBoolean()
    .withMessage('Delicate flag must be a boolean')
    .toBoolean(),

  body('unit_price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Unit price must be a non-negative number')
    .toFloat(),

  handleValidationErrors,
];

export const validateGarmentQuery = [
  query('sortBy')
    .optional()
    .isIn(['id', 'type', 'care_instructions', 'delicate_flag', 'quantity', 'unit_price'])
    .withMessage(
      'sortBy must be one of id, type, care_instructions, delicate_flag, quantity, unit_price',
    ),

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
