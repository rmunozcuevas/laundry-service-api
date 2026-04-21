import express from 'express';
import {
  getAllOrdersHandlers,
  getOrderByIdHandlers,
  createOrdersHandler,
  updateOrdersHandler,
  deleteOrdersHandler,
} from '../controllers/OrderControllers.js';

import {
  validateId,
  validateCreateOrder,
  validateUpdateOrder,
  validateOrderQuery,
} from '../middleware/orderValidators.js';

import { authenticate } from '../middleware/authenticate.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = express.Router();

router.get('/', validateOrderQuery, asyncHandler(getAllOrdersHandlers));
router.get('/:id', validateId, asyncHandler(getOrderByIdHandlers));
router.post('/', authenticate, validateCreateOrder, asyncHandler(createOrdersHandler));
router.put('/:id', authenticate, validateId, validateUpdateOrder, asyncHandler(updateOrdersHandler));
router.delete('/:id', authenticate, validateId, asyncHandler(deleteOrdersHandler));

export default router;
