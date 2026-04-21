import prisma from '../config/db.js';

export async function getAll({ search, sortBy, order, offset, limit }) {
  const conditions = {};
  if (search) {
    conditions.OR = [
      { type: { contains: search, mode: 'insensitive' } },
      { care_instructions: { contains: search, mode: 'insensitive' } },
    ];
  }
  const garments = await prisma.garments.findMany({
    where: conditions,
    orderBy: { [sortBy]: order },
    take: limit,
    skip: offset,
  });

  return garments;
}

export async function getById(id) {
  const garment = await prisma.garments.findUnique({
    where: { id },
    include: {
      order: {
        select: { userId: true },
      },
    },
  });
  return garment;
}

export async function create(garmentData) {
  try {
    const newGarment = await prisma.garments.create({ data: garmentData });
    return newGarment;
  } catch (error) {
    // Foreign key constraint failed (usually: orderId doesn't exist)
    if (error.code === 'P2003') {
      const err = new Error('Invalid orderId: order does not exist');
      err.status = 400;
      throw err;
    }
    throw error;
  }
}

export async function update(id, updatedGarment) {
  try {
    const updatedClothing = await prisma.garments.update({
      where: { id },
      data: updatedGarment,
    });
    return updatedClothing;
  } catch (error) {
    if (error.code === 'P2025') return null;
    throw error;
  }
}

export async function remove(id) {
  try {
    const deletedGarment = await prisma.garments.delete({
      where: { id },
    });

    return deletedGarment;
  } catch (error) {
    if (error.code === 'P2025') return null;
    throw error;
  }
}
