import { param, body, oneOf, query } from 'express-validator';
import { handleValidationErrors } from './handleValidationErrors.js';

export const validateId = [
  param('id').trim().escape().isInt({ min: 1 }).withMessage('Id must be a positive integer'),
  handleValidationErrors,
];

export const validateCreateStaff = [
  body('userId')
    .exists({ values: 'falsy' })
    .withMessage('userId is required')
    .bail()
    .isInt({ min: 1 })
    .withMessage('userId must be a positive integer')
    .toInt(),

  body('employee_role')
    .exists({ values: 'falsy' })
    .withMessage('employee_role is required')
    .bail()
    .isString()
    .withMessage('employee_role must be a string')
    .bail()
    .isLength({ min: 2, max: 50 })
    .withMessage('employee_role must be between 2 and 50 characters')
    .trim()
    .escape(),

  body('active_flag')
    .optional()
    .isBoolean()
    .withMessage('active_flag must be a boolean')
    .toBoolean(),

  handleValidationErrors,
];

export const validateUpdateStaff = [
  oneOf([body('employee_role').exists({ values: 'falsy' }), body('active_flag').exists({ values: 'falsy' })], {
    message: 'At least one field (employee_role, active_flag) must be provided',
  }),

  body('employee_role')
    .optional()
    .isString()
    .withMessage('employee_role must be a string')
    .bail()
    .isLength({ min: 2, max: 50 })
    .withMessage('employee_role must be between 2 and 50 characters')
    .trim()
    .escape(),

  body('active_flag')
    .optional()
    .isBoolean()
    .withMessage('active_flag must be a boolean')
    .toBoolean(),

  body('userId').not().exists().withMessage('userId cannot be updated'),

  handleValidationErrors,
];

export const validateStaffQuery = [
  query('search').optional().isString().withMessage('search must be a string').trim().escape(),

  query('sortBy')
    .optional()
    .isIn(['id', 'userId', 'employee_role', 'active_flag'])
    .withMessage('sortBy must be one of id, userId, employee_role, active_flag'),

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
