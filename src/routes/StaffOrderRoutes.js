import express from 'express';

import {
  getAllStaffOrdersHandler,
  getMyStaffOrdersHandler,
  createStaffOrderHandler,
  deleteStaffOrderHandler,
} from '../controllers/StaffOrderControllers.js';

import {
  validateCreateStaffOrder,
  validateDeleteStaffOrder,
  validateStaffOrderQuery,
} from '../middleware/staffOrderValidators.js';

import { authenticate } from '../middleware/authenticate.js';
import { requireAdmin } from '../middleware/requireAdmin.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = express.Router();

// Staff can view their own assignments.
router.get('/me', authenticate, validateStaffOrderQuery, asyncHandler(getMyStaffOrdersHandler));

// Admin can list/create/delete assignments.
router.get('/', authenticate, requireAdmin, validateStaffOrderQuery, asyncHandler(getAllStaffOrdersHandler));
router.post('/', authenticate, requireAdmin, validateCreateStaffOrder, asyncHandler(createStaffOrderHandler));
router.delete('/', authenticate, requireAdmin, validateDeleteStaffOrder, asyncHandler(deleteStaffOrderHandler));

export default router;
