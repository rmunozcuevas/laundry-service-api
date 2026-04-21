import {
  getAllSubscriptions,
  getSubscriptionById,
  getSubscriptionsForUser,
  createSubscription,
  updatedSubscription,
  deleteSubscription,
} from '../services/SubscriptionServices.js';

function isAdmin(req) {
  return req.user?.role === 'admin';
}

export async function getAllSubscriptionsHandler(req, res, next) {
  try {
    const { search = '', sortBy = 'id', order = 'asc', offset = 0, limit = 5 } = req.query;

    const options = {
      search,
      sortBy,
      order,
      offset: parseInt(offset, 10),
      limit: parseInt(limit, 10),
    };

    const subscriptions = await getAllSubscriptions(options);
    res.status(200).json(subscriptions);
  } catch (error) {
    next(error);
  }
}

export async function getMySubscriptionsHandler(req, res, next) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      const err = new Error('Not authenticated. Please provide a valid token.');
      err.status = 401;
      throw err;
    }

    const subscriptions = await getSubscriptionsForUser(userId);
    res.status(200).json(subscriptions);
  } catch (error) {
    next(error);
  }
}

export async function getSubscriptionByIdHandler(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    const subscription = await getSubscriptionById(id);

    if (!isAdmin(req) && subscription.userId !== req.user.id) {
      const err = new Error('Forbidden: Insufficient Permissions');
      err.status = 403;
      throw err;
    }

    res.status(200).json(subscription);
  } catch (error) {
    next(error);
  }
}

export async function createSubscriptionHandler(req, res, next) {
  try {
    const { userId: userIdFromBody, plan, discount_percentage, active_flag } = req.body;

    const authedUserId = req.user?.id;
    if (!authedUserId) {
      const err = new Error('Not authenticated. Please provide a valid token.');
      err.status = 401;
      throw err;
    }

    // Non-admins cannot create subscriptions for other users.
    if (!isAdmin(req) && userIdFromBody !== undefined && Number(userIdFromBody) !== Number(authedUserId)) {
      const err = new Error('Forbidden: Admin access required to create a subscription for another user');
      err.status = 403;
      throw err;
    }

    const userId = isAdmin(req) && userIdFromBody ? Number(userIdFromBody) : Number(authedUserId);

    const newSubscription = await createSubscription({
      userId,
      plan,
      discount_percentage,
      active_flag,
    });

    res.status(201).json(newSubscription);
  } catch (error) {
    next(error);
  }
}

export async function updatedSubscriptionHandler(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    const existing = await getSubscriptionById(id);

    if (!isAdmin(req) && existing.userId !== req.user.id) {
      const err = new Error('Forbidden: Insufficient Permissions');
      err.status = 403;
      throw err;
    }

    const { plan, discount_percentage, active_flag } = req.body;

    const updated = await updatedSubscription(id, {
      plan,
      discount_percentage,
      active_flag,
    });

    res.status(200).json(updated);
  } catch (error) {
    next(error);
  }
}

export async function deleteSubscriptionHandler(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    const existing = await getSubscriptionById(id);

    if (!isAdmin(req) && existing.userId !== req.user.id) {
      const err = new Error('Forbidden: Insufficient Permissions');
      err.status = 403;
      throw err;
    }

    await deleteSubscription(id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}
