import { getAll, getById, create, update, remove } from '../repositories/OrderRepo.js';
import { findCoveringTier, getHighestTier } from '../repositories/PricingTierRepo.js';
import { getActiveForUser } from '../repositories/SubscriptionsRepo.js';

function clampInt(n, min, max) {
  const v = Number(n);
  if (!Number.isFinite(v)) return min;
  return Math.max(min, Math.min(max, Math.trunc(v)));
}

function roundMoney(n) {
  return Math.round((Number(n) + Number.EPSILON) * 100) / 100;
}

function applyDiscount(rawTotal, discountPercentage) {
  const pct = clampInt(discountPercentage ?? 0, 0, 100);
  return rawTotal * (1 - pct / 100);
}

export async function calculateOrderTotalPrice({ userId, weight_kg }) {
  const weightKg = Number(weight_kg);
  if (!Number.isFinite(weightKg) || weightKg <= 0) {
    const err = new Error('weight_kg must be a positive number');
    err.status = 400;
    throw err;
  }

  // Prefer a tier that covers the weight.
  let tier = await findCoveringTier(weightKg);
  let rawTotal;

  if (tier) {
    rawTotal = Number(tier.base_price);
  } else {
    // If weight exceeds all tiers, bill off the highest tier + extra kg.
    tier = await getHighestTier();
    if (!tier) {
      const err = new Error('No pricing tiers exist. Seed PricingTier first.');
      err.status = 500;
      throw err;
    }

    const extraKg = Math.max(0, weightKg - Number(tier.max_weight_kg));
    rawTotal = Number(tier.base_price) + extraKg * Number(tier.extra_kg_price);
  }

  const sub = await getActiveForUser(userId);
  const discounted = applyDiscount(rawTotal, sub?.discount_percentage ?? 0);
  return roundMoney(discounted);
}

export async function getAllOrders(options) {
  return getAll(options);
}

export async function getOrderById(id) {
  const order = await getById(id);

  if (order) return order;

  const error = new Error(`Order ${id} not found`);
  error.status = 404;
  throw error;
}

export async function createOrder(orderData) {
  const total_price = await calculateOrderTotalPrice({
    userId: orderData.userId,
    weight_kg: orderData.weight_kg,
  });

  return create({
    ...orderData,
    total_price,
  });
}

export async function updatedOrder(id, updatedOrderData) {
  // Recompute total_price if weight changes.
  if (updatedOrderData.weight_kg !== undefined) {
    const existing = await getById(id);
    if (!existing) {
      const error = new Error(`Order ${id} not found`);
      error.status = 404;
      throw error;
    }

    const total_price = await calculateOrderTotalPrice({
      userId: existing.userId,
      weight_kg: updatedOrderData.weight_kg,
    });

    updatedOrderData.total_price = total_price;
  }

  const order = await update(id, updatedOrderData);
  if (order) return order;

  const error = new Error(`Order ${id} not found`);
  error.status = 404;
  throw error;
}

export async function deleteOrder(id) {
  const result = await remove(id);
  if (result) return;

  const error = new Error(`Order ${id} not found`);
  error.status = 404;
  throw error;
}
