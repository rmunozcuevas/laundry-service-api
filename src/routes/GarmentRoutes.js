import express from 'express';
import {
  getAllGarmentsHandlers,
  getGarmentByIdHandler,
  createGarmentHandler,
  updateGarmentHandler,
  deleteGarmentHandler,
} from '../controllers/GarmentControllers.js';

import {
  validateId,
  validateCreateGarment,
  validateUpdateGarment,
  validateGarmentQuery,
} from '../middleware/garmentValidators.js';

import { authenticate } from '../middleware/authenticate.js';
import { authorizeOwnership } from '../middleware/authorizeOwnership.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = express.Router();

router.get('/', validateGarmentQuery, asyncHandler(getAllGarmentsHandlers));
router.get('/:id', validateId, asyncHandler(getGarmentByIdHandler));
router.post('/', authenticate, validateCreateGarment, asyncHandler(createGarmentHandler));

router.put(
  '/:id',
  authenticate,
  validateId,
  authorizeOwnership,
  validateUpdateGarment,
  asyncHandler(updateGarmentHandler),
);

router.delete(
  '/:id',
  authenticate,
  validateId,
  authorizeOwnership,
  asyncHandler(deleteGarmentHandler),
);

export default router;
