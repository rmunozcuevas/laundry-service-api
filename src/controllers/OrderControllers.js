import {
  getAllOrders,
  getOrderById,
  createOrder,
  updatedOrder,
  deleteOrder,
} from '../services/OrderServices.js';

function toYyyyMmDd(d) {
  return d.toISOString().slice(0, 10);
}

function computePickupDateFromNow() {
  const leadDaysRaw = process.env.PICKUP_LEAD_DAYS;
  const leadDaysParsed = leadDaysRaw === undefined ? 2 : Number(leadDaysRaw);
  const leadDays = Number.isFinite(leadDaysParsed) ? leadDaysParsed : 2;

  const pickup = new Date();
  pickup.setDate(pickup.getDate() + leadDays);
  return toYyyyMmDd(pickup);
}

function requireOwnerOrAdmin(req, order) {
  if (req.user?.role === 'admin') return;

  if (order.userId !== req.user.id) {
    const err = new Error('Forbidden: Insufficient Permissions');
    err.status = 403;
    throw err;
  }
}

export async function getAllOrdersHandlers(req, res, next) {
  try {
    const { search = '', sortBy = 'id', order = 'asc', offset = 0, limit = 5 } = req.query;

    const isAdmin = req.user?.role === 'admin';

    const options = {
      search,
      sortBy,
      order,
      offset: parseInt(offset, 10),
      limit: parseInt(limit, 10),
      userId: isAdmin ? undefined : req.user.id,
    };

    const orders = await getAllOrders(options);
    res.status(200).json(orders);
  } catch (error) {
    next(error);
  }
}

export async function getOrderByIdHandlers(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    const order = await getOrderById(id);

    requireOwnerOrAdmin(req, order);

    res.status(200).json(order);
  } catch (error) {
    next(error);
  }
}

export async function createOrdersHandler(req, res, next) {
  try {
    // pickup_date + total_price are server-generated.
    const { userId: userIdFromBody, weight_kg, status } = req.body;

    const isAdmin = req.user?.role === 'admin';

    if (!isAdmin && userIdFromBody !== undefined && Number(userIdFromBody) !== Number(req.user.id)) {
      const err = new Error('Forbidden: Admin access required to create an order for another user');
      err.status = 403;
      throw err;
    }

    const userId = isAdmin && userIdFromBody ? Number(userIdFromBody) : Number(req.user.id);

    if (weight_kg === undefined) {
      const err = new Error('weight_kg is required');
      err.status = 400;
      throw err;
    }

    const pickup_date = computePickupDateFromNow();

    const newOrder = await createOrder({
      userId,
      pickup_date,
      weight_kg: Number(weight_kg),
      status: status ?? 'pending',
    });

    res.status(201).json(newOrder);
  } catch (error) {
    next(error);
  }
}

export async function updateOrdersHandler(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    const existing = await getOrderById(id);

    requireOwnerOrAdmin(req, existing);

    // pickup_date + total_price stay server-managed.
    const { weight_kg, status } = req.body;

    const updated = await updatedOrder(id, {
      weight_kg,
      status,
    });

    res.status(200).json(updated);
  } catch (error) {
    next(error);
  }
}

export async function deleteOrdersHandler(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    const existing = await getOrderById(id);

    requireOwnerOrAdmin(req, existing);

    await deleteOrder(id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}
