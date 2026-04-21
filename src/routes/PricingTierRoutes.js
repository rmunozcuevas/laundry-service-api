import express from 'express';
import {
  getAllPricingTierHandlers,
  getPricingTierByIdHandler,
  createPricingTierHandler,
  updatePricingTierHandler,
  deletePricingTierHandler,
} from '../controllers/PricingTierControllers.js';

import {
  validateId,
  validateCreatePricingTier,
  validateUpdatePricingTier,
  validatePricingTierQuery,
} from '../middleware/pricingTierValidators.js';

import { authenticate } from '../middleware/authenticate.js';
import { requireAdmin } from '../middleware/requireAdmin.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = express.Router();

// Public read
router.get('/', validatePricingTierQuery, asyncHandler(getAllPricingTierHandlers));
router.get('/:id', validateId, asyncHandler(getPricingTierByIdHandler));

// Admin write
router.post('/', authenticate, requireAdmin, validateCreatePricingTier, asyncHandler(createPricingTierHandler));
router.put(
  '/:id',
  authenticate,
  requireAdmin,
  validateId,
  validateUpdatePricingTier,
  asyncHandler(updatePricingTierHandler),
);
router.delete('/:id', authenticate, requireAdmin, validateId, asyncHandler(deletePricingTierHandler));

export default router;
