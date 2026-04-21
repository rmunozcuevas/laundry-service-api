import express from 'express';

import {
  getAllSubscriptionsHandler,
  getMySubscriptionsHandler,
  getSubscriptionByIdHandler,
  createSubscriptionHandler,
  updatedSubscriptionHandler,
  deleteSubscriptionHandler,
} from '../controllers/SubscriptionController.js';

import {
  validateId,
  validateCreateSubscription,
  validateUpdateSubscription,
  validateSubscriptionQuery,
} from '../middleware/subscriptionValidators.js';

import { authenticate } from '../middleware/authenticate.js';
import { requireAdmin } from '../middleware/requireAdmin.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = express.Router();

// Admin-only list
router.get('/', authenticate, requireAdmin, validateSubscriptionQuery, asyncHandler(getAllSubscriptionsHandler));

// User endpoints
router.get('/me', authenticate, asyncHandler(getMySubscriptionsHandler));
router.get('/:id', authenticate, validateId, asyncHandler(getSubscriptionByIdHandler));
router.post('/', authenticate, validateCreateSubscription, asyncHandler(createSubscriptionHandler));
router.put('/:id', authenticate, validateId, validateUpdateSubscription, asyncHandler(updatedSubscriptionHandler));
router.delete('/:id', authenticate, validateId, asyncHandler(deleteSubscriptionHandler));

export default router;
