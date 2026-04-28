import prisma from '../config/db.js';

export async function getAll({ staffId, orderId, offset, limit }) {
  const where = {};

  if (staffId) where.staff_id = staffId;
  if (orderId) where.order_id = orderId;

  return prisma.staffOrder.findMany({
    where,
    take: limit,
    skip: offset,
    include: {
      staff: {
        select: {
          id: true,
          userId: true,
          employee_role: true,
          active_flag: true,
        },
      },
      order: {
        select: {
          id: true,
          userId: true,
          pickup_date: true,
          status: true,
          total_price: true,
        },
      },
    },
  });
}

export async function create({ orderId, staffId }) {
  try {
    return await prisma.staffOrder.create({
      data: {
        order_id: orderId,
        staff_id: staffId,
      },
    });
  } catch (error) {
    if (error.code === 'P2002') {
      const err = new Error('Assignment already exists');
      err.status = 409;
      throw err;
    }
    if (error.code === 'P2003') {
      const err = new Error('Invalid orderId or staffId');
      err.status = 400;
      throw err;
    }
    throw error;
  }
}

export async function remove({ orderId, staffId }) {
  try {
    return await prisma.staffOrder.delete({
      where: {
        order_id_staff_id: {
          order_id: orderId,
          staff_id: staffId,
        },
      },
    });
  } catch (error) {
    if (error.code === 'P2025') return null;
    throw error;
  }
}
