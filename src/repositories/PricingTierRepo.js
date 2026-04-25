import prisma from '../config/db.js';

export async function getAll({ search, sortBy, order, offset, limit }) {
  const conditions = {};

  // Optional "search": treat it as a number and match numeric columns.
  if (search) {
    const n = Number(search);
    if (Number.isFinite(n)) {
      conditions.OR = [
        { min_weight_kg: { equals: n } },
        { max_weight_kg: { equals: n } },
        { base_price: { equals: n } },
        { extra_kg_price: { equals: n } },
      ];
    }
  }

  return prisma.pricingTier.findMany({
    where: conditions,
    orderBy: { [sortBy]: order },
    take: limit,
    skip: offset,
  });
}

export async function getByPricingTier(id) {
  return prisma.pricingTier.findUnique({ where: { id } });
}

// Find a tier that covers this weight. If none exists, callers can fall back
// to the "highest" tier and charge extra kg.
export async function findCoveringTier(weightKg) {
  return prisma.pricingTier.findFirst({
    where: {
      min_weight_kg: { lte: weightKg },
      max_weight_kg: { gte: weightKg },
    },
    orderBy: { max_weight_kg: 'asc' },
  });
}

export async function getHighestTier() {
  return prisma.pricingTier.findFirst({
    orderBy: { max_weight_kg: 'desc' },
  });
}

export async function create(pricingTierData) {
  return prisma.pricingTier.create({ data: pricingTierData });
}

export async function update(id, updatedPricingTier) {
  try {
    return await prisma.pricingTier.update({
      where: { id },
      data: updatedPricingTier,
    });
  } catch (error) {
    if (error.code === 'P2025') return null;
    throw error;
  }
}

export async function remove(id) {
  try {
    return await prisma.pricingTier.delete({ where: { id } });
  } catch (error) {
    if (error.code === 'P2025') return null;
    throw error;
  }
}
