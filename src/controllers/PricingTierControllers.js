import {
  getAllPricingTierOptions,
  getPricingTierById,
  createPricingTier,
  updatedPricingTier,
  removePricingTier,
} from '../services/PricingTierServices.js';

export async function getAllPricingTierHandlers(req, res, next) {
  try {
    const { search = '', sortBy = 'id', order = 'asc', offset = 0, limit = 5 } = req.query;

    const options = {
      search,
      sortBy,
      order,
      offset: parseInt(offset, 10),
      limit: parseInt(limit, 10),
    };

    const pricingTiers = await getAllPricingTierOptions(options);
    res.status(200).json(pricingTiers);
  } catch (error) {
    next(error);
  }
}

export async function getPricingTierByIdHandler(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    const pricingTier = await getPricingTierById(id);
    res.status(200).json(pricingTier);
  } catch (error) {
    next(error);
  }
}

export async function createPricingTierHandler(req, res, next) {
  try {
    const { min_weight_kg, max_weight_kg, base_price, extra_kg_price } = req.body;

    const pricingTier = await createPricingTier({
      min_weight_kg,
      max_weight_kg,
      base_price,
      extra_kg_price,
    });

    res.status(201).json(pricingTier);
  } catch (error) {
    next(error);
  }
}

export async function updatePricingTierHandler(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    const { min_weight_kg, max_weight_kg, base_price, extra_kg_price } = req.body;

    const pricingTier = await updatedPricingTier(id, {
      min_weight_kg,
      max_weight_kg,
      base_price,
      extra_kg_price,
    });

    res.status(200).json(pricingTier);
  } catch (error) {
    next(error);
  }
}

export async function deletePricingTierHandler(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    await removePricingTier(id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}
