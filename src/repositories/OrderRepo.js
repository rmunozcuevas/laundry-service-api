import prisma from '../config/db.js';

export async function getAll({ search, sortBy, order, offset, limit, userId }) {
  const where = {};

  if (userId) {
    where.userId = userId;
  }

  if (search) {
    where.OR = [
      { status: { contains: search, mode: 'insensitive' } },
      { pickup_date: { contains: search, mode: 'insensitive' } },
    ];
  }

  return prisma.order.findMany({
    where,
    orderBy: { [sortBy]: order },
    take: limit,
    skip: offset,
  });
}

export async function getById(id) {
  return prisma.order.findUnique({ where: { id } });
}

export async function create(orderData) {
  return prisma.order.create({ data: orderData });
}

export async function update(id, updatedOrder) {
  try {
    return await prisma.order.update({
      where: { id },
      data: updatedOrder,
    });
  } catch (error) {
    if (error.code === 'P2025') return null;
    throw error;
  }
}

export async function remove(id) {
  try {
    return await prisma.order.delete({ where: { id } });
  } catch (error) {
    if (error.code === 'P2025') return null;
    throw error;
  }
}
