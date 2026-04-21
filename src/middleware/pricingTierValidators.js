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

export const validateCreatePricingTier = [
  body('min_weight_kg')
    .exists({ values: 'falsy' })
    .withMessage('min_weight_kg is required')
    .bail()
    .isFloat({ min: 0 })
    .withMessage('min_weight_kg must be a non-negative number')
    .toFloat(),

  body('max_weight_kg')
    .exists({ values: 'falsy' })
    .withMessage('max_weight_kg is required')
    .bail()
    .isFloat({ min: 0 })
    .withMessage('max_weight_kg must be a non-negative number')
    .toFloat()
    .custom((max, { req }) => {
      const min = Number(req.body.min_weight_kg);
      if (Number.isFinite(min) && Number(max) < min) {
        throw new Error('max_weight_kg must be greater than or equal to min_weight_kg');
      }
      return true;
    }),

  body('base_price')
    .exists({ values: 'falsy' })
    .withMessage('base_price is required')
    .bail()
    .isFloat({ min: 0 })
    .withMessage('base_price must be a non-negative number')
    .toFloat(),

  body('extra_kg_price')
    .exists({ values: 'falsy' })
    .withMessage('extra_kg_price is required')
    .bail()
    .isFloat({ min: 0 })
    .withMessage('extra_kg_price must be a non-negative number')
    .toFloat(),

  handleValidationErrors,
];

export const validateUpdatePricingTier = [
  oneOf(
    [
      body('min_weight_kg').exists({ values: 'falsy' }),
      body('max_weight_kg').exists({ values: 'falsy' }),
      body('base_price').exists({ values: 'falsy' }),
      body('extra_kg_price').exists({ values: 'falsy' }),
    ],
    {
      message:
        'At least one field (min_weight_kg, max_weight_kg, base_price, extra_kg_price) must be provided',
    },
  ),

  body('min_weight_kg')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('min_weight_kg must be a non-negative number')
    .toFloat(),

  body('max_weight_kg')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('max_weight_kg must be a non-negative number')
    .toFloat(),

  body('base_price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('base_price must be a non-negative number')
    .toFloat(),

  body('extra_kg_price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('extra_kg_price must be a non-negative number')
    .toFloat(),

  body().custom((_, { req }) => {
    const minRaw = req.body.min_weight_kg;
    const maxRaw = req.body.max_weight_kg;
    if (minRaw === undefined || maxRaw === undefined) return true;

    const min = Number(minRaw);
    const max = Number(maxRaw);
    if (Number.isFinite(min) && Number.isFinite(max) && max < min) {
      throw new Error('max_weight_kg must be greater than or equal to min_weight_kg');
    }
    return true;
  }),

  handleValidationErrors,
];

export const validatePricingTierQuery = [
  query('search')
    .optional()
    .isString()
    .withMessage('search must be a string')
    .trim()
    .escape(),

  query('sortBy')
    .optional()
    .isIn(['id', 'min_weight_kg', 'max_weight_kg', 'base_price', 'extra_kg_price'])
    .withMessage('sortBy must be one of id, min_weight_kg, max_weight_kg, base_price, extra_kg_price'),

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
