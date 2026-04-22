import prisma from '../config/db.js';

const SORTABLE_FIELDS = new Set(['id', 'userId', 'employee_role', 'active_flag']);
const ORDER_VALUES = new Set(['asc', 'desc']);

function parseBooleanSearch(s) {
  const v = String(s).trim().toLowerCase();
  if (v === 'true') return true;
  if (v === 'false') return false;
  return null;
}

/**
 * Search is intentionally flexible for a student project:
 * - numeric: matches id or userId
 * - true/false: matches active_flag
 * - string: matches employee_role or linked user's email/name/role
 */
export async function getAll({ search, sortBy, order, offset, limit }) {
  const conditions = {};

  if (search !== undefined && String(search).trim() !== '') {
    const s = String(search).trim();

    const or = [];

    const asNumber = Number(s);
    if (Number.isFinite(asNumber)) {
      const asInt = Math.trunc(asNumber);
      or.push({ id: asInt }, { userId: asInt });
    }

    const asBool = parseBooleanSearch(s);
    if (asBool !== null) {
      or.push({ active_flag: asBool });
    }

    // Staff fields
    or.push({ employee_role: { contains: s, mode: 'insensitive' } });

    // Linked user fields
    or.push({ user: { email: { contains: s, mode: 'insensitive' } } });
    or.push({ user: { name: { contains: s, mode: 'insensitive' } } });
    or.push({ user: { role: { contains: s, mode: 'insensitive' } } });

    conditions.OR = or;
  }

  const sortKey = SORTABLE_FIELDS.has(sortBy) ? sortBy : 'id';
  const sortOrder = ORDER_VALUES.has(order) ? order : 'asc';

  const staff = await prisma.staff.findMany({
    where: conditions,
    orderBy: { [sortKey]: sortOrder },
    take: limit,
    skip: offset,
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
        },
      },
    },
  });

  return staff;
}

export async function getById(id) {
  const staff = await prisma.staff.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
        },
      },
      staffOrders: {
        select: {
          order_id: true,
          staff_id: true,
        },
      },
    },
  });

  return staff;
}

export async function create(staffData) {
  try {
    const staff = await prisma.staff.create({ data: staffData });
    return staff;
  } catch (error) {
    // Foreign key constraint failed (usually: userId doesn't exist)
    if (error.code === 'P2003') {
      const err = new Error('Invalid userId: user does not exist');
      err.status = 400;
      throw err;
    }
    throw error;
  }
}

export async function update(id, updatedStaff) {
  try {
    const updated = await prisma.staff.update({
      where: { id },
      data: updatedStaff,
    });

    return updated;
  } catch (error) {
    if (error.code === 'P2025') return null;
    throw error;
  }
}

export async function remove(id) {
  try {
    const deletedStaff = await prisma.staff.delete({
      where: { id },
    });

    return deletedStaff;
  } catch (error) {
    if (error.code === 'P2025') return null;
    throw error;
  }
}
