import { getAll, getById, getByUserId, create, update, remove } from '../repositories/SubscriptionsRepo.js';

export async function getAllSubscriptions(options) {
  return getAll(options);
}

export async function getSubscriptionById(id) {
  const subscription = await getById(id);

  if (subscription) return subscription;

  const error = new Error(`Subscription ${id} not found`);
  error.status = 404;
  throw error;
}

export async function getSubscriptionsForUser(userId) {
  return getByUserId(userId);
}

export async function createSubscription(subscriptionData) {
  // Ensure required DB fields always exist.
  const data = {
    ...subscriptionData,
    discount_percentage:
      subscriptionData.discount_percentage === undefined ? 0 : Number(subscriptionData.discount_percentage),
    active_flag: subscriptionData.active_flag === undefined ? true : Boolean(subscriptionData.active_flag),
  };

  return create(data);
}

export async function updatedSubscription(id, updatedSubscriptionData) {
  const subscription = await update(id, updatedSubscriptionData);

  if (subscription) return subscription;

  const error = new Error(`Subscription ${id} not found`);
  error.status = 404;
  throw error;
}

export async function deleteSubscription(id) {
  const result = await remove(id);
  if (result) return;

  const error = new Error(`Subscription ${id} not found`);
  error.status = 404;
  throw error;
}
