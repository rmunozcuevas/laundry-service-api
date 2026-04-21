import { body } from 'express-validator';
import { handleValidationErrors } from './handleValidationErrors.js';

export const validateSignUp = [
  body('email')
    .isEmail()
    .withMessage('A valid email is required')
    .normalizeEmail(),

  body('password')
    .isString()
    .withMessage('Password is required')
    .bail()
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters'),

  body('name')
    .isString()
    .withMessage('Name is required')
    .bail()
    .isLength({ min: 2 })
    .withMessage('Name must be at least 2 characters'),

  body('address')
    .isString()
    .withMessage('Address is required')
    .bail()
    .isLength({ min: 5 })
    .withMessage('Address must be at least 5 characters'),

  body('phone')
    .isString()
    .withMessage('Phone is required')
    .bail()
    .isLength({ min: 7 })
    .withMessage('Phone must be at least 7 characters'),

  body('role')
    .isString()
    .withMessage('Role is required')
    .bail()
    .isLength({ min: 3 })
    .withMessage('Role must be at least 3 characters'),

  handleValidationErrors,
];

export const validateLogIn = [
  body('email')
    .isEmail()
    .withMessage('A valid email is required')
    .normalizeEmail(),

  body('password')
    .isString()
    .withMessage('Password is required')
    .bail()
    .isLength({ min: 1 })
    .withMessage('Password is required'),

  handleValidationErrors,
];
