import { getAll, getByPricingTier, create, update, remove } from '../repositories/PricingTierRepo.js';

export async function getAllPricingTierOptions(options) {
  return getAll(options);
}

export async function getPricingTierById(id) {
  const pricingTier = await getByPricingTier(id);

  if (pricingTier) return pricingTier;

  const error = new Error(`PricingTier ${id} not found`);
  error.status = 404;
  throw error;
}

export async function createPricingTier(pricingTierData) {
  return create(pricingTierData);
}

export async function updatedPricingTier(id, updatedPricingTierData) {
  const pricingTier = await update(id, updatedPricingTierData);

  if (pricingTier) return pricingTier;

  const error = new Error(`PricingTier ${id} not found`);
  error.status = 404;
  throw error;
}

export async function removePricingTier(id) {
  const result = await remove(id);
  if (result) return;

  const error = new Error(`PricingTier ${id} not found`);
  error.status = 404;
  throw error;
}
