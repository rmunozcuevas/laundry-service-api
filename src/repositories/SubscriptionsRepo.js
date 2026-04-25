import prisma from '../config/db.js';

export async function getAll({ search, sortBy, order, offset, limit }) {
  const conditions = {};
  if (search) {
    conditions.OR = [{ plan: { contains: search, mode: 'insensitive' } }];
  }

  return prisma.subscriptions.findMany({
    where: conditions,
    orderBy: { [sortBy]: order },
    take: limit,
    skip: offset,
  });
}

export async function getById(id) {
  return prisma.subscriptions.findUnique({ where: { id } });
}

export async function getByUserId(userId) {
  return prisma.subscriptions.findMany({ where: { userId } });
}

export async function getActiveForUser(userId) {
  return prisma.subscriptions.findFirst({
    where: { userId, active_flag: true },
    orderBy: { id: 'desc' },
  });
}

export async function create(subscriptionData) {
  return prisma.subscriptions.create({ data: subscriptionData });
}

export async function update(id, updatedSubscription) {
  try {
    return await prisma.subscriptions.update({
      where: { id },
      data: updatedSubscription,
    });
  } catch (error) {
    if (error.code === 'P2025') return null;
    throw error;
  }
}

export async function remove(id) {
  try {
    return await prisma.subscriptions.delete({ where: { id } });
  } catch (error) {
    if (error.code === 'P2025') return null;
    throw error;
  }
}
