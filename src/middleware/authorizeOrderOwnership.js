import { getOrderById } from '../services/OrderServices.js';

// For endpoints that accept an orderId in the request body (e.g. POST /garments)
// ensure the authenticated user owns that order, unless they are an admin.
export async function authorizeOrderOwnership(req, res, next) {
  if (req.user?.role === 'admin') return next();

  const orderId = Number(req.body.orderId);
  if (!Number.isInteger(orderId) || orderId < 1) {
    const err = new Error('orderId is required');
    err.status = 400;
    return next(err);
  }

  const order = await getOrderById(orderId); // throws 404 if missing

  if (order.userId !== req.user.id) {
    const err = new Error('Forbidden: Insufficient Permissions');
    err.status = 403;
    return next(err);
  }

  return next();
}
