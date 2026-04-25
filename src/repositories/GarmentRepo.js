import prisma from '../config/db.js';

export async function getAll({ search, sortBy, order, offset, limit, userId }) {
  const and = [];

  if (userId) {
    and.push({ order: { is: { userId } } });
  }

  if (search) {
    and.push({
      OR: [
        { type: { contains: search, mode: 'insensitive' } },
        { care_instructions: { contains: search, mode: 'insensitive' } },
      ],
    });
  }

  const where = and.length ? { AND: and } : {};

  return prisma.garments.findMany({
    where,
    orderBy: { [sortBy]: order },
    take: limit,
    skip: offset,
  });
}

export async function getById(id) {
  return prisma.garments.findUnique({
    where: { id },
    include: {
      order: {
        select: { userId: true },
      },
    },
  });
}

export async function create(garmentData) {
  try {
    return await prisma.garments.create({ data: garmentData });
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
    return await prisma.garments.update({
      where: { id },
      data: updatedGarment,
    });
  } catch (error) {
    if (error.code === 'P2025') return null;
    throw error;
  }
}

export async function remove(id) {
  try {
    return await prisma.garments.delete({ where: { id } });
  } catch (error) {
    if (error.code === 'P2025') return null;
    throw error;
  }
}
