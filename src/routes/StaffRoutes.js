import express from 'express';

import {
  getAllStaffHandler,
  getMyStaffHandler,
  getStaffByIdHandler,
  createStaffHandler,
  updateStaffHandler,
  deleteStaffHandler,
} from '../controllers/StaffControllers.js';

import {
  validateId,
  validateCreateStaff,
  validateUpdateStaff,
  validateStaffQuery,
} from '../middleware/staffValidators.js';

import { authenticate } from '../middleware/authenticate.js';
import { requireAdmin } from '../middleware/requireAdmin.js';
import { authorizeStaffSelfOrAdmin } from '../middleware/authorizeStaffSelfOrAdmin.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = express.Router();

// Admin list
router.get('/', authenticate, requireAdmin, validateStaffQuery, asyncHandler(getAllStaffHandler));

// Self lookup (useful for staff users)
router.get('/me', authenticate, asyncHandler(getMyStaffHandler));

// Admin or self
router.get('/:id', authenticate, validateId, asyncHandler(authorizeStaffSelfOrAdmin), asyncHandler(getStaffByIdHandler));

// Admin-only write
router.post('/', authenticate, requireAdmin, validateCreateStaff, asyncHandler(createStaffHandler));
router.put('/:id', authenticate, requireAdmin, validateId, validateUpdateStaff, asyncHandler(updateStaffHandler));
router.delete('/:id', authenticate, requireAdmin, validateId, asyncHandler(deleteStaffHandler));

export default router;
