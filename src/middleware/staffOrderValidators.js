import { body, query } from 'express-validator';
import { handleValidationErrors } from './handleValidationErrors.js';

export const validateCreateStaffOrder = [
  body('orderId')
    .exists({ values: 'falsy' })
    .withMessage('orderId is required')
    .bail()
    .isInt({ min: 1 })
    .withMessage('orderId must be a positive integer')
    .toInt(),

  body('staffId')
    .exists({ values: 'falsy' })
    .withMessage('staffId is required')
    .bail()
    .isInt({ min: 1 })
    .withMessage('staffId must be a positive integer')
    .toInt(),

  handleValidationErrors,
];

export const validateDeleteStaffOrder = validateCreateStaffOrder;

export const validateStaffOrderQuery = [
  query('staffId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('staffId must be a positive integer')
    .toInt(),

  query('orderId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('orderId must be a positive integer')
    .toInt(),

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
