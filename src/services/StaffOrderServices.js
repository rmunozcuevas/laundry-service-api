import { getAll, create, remove } from '../repositories/StaffOrderRepo.js';
import { getStaffByUserId } from './StaffService.js';

export async function getAllStaffOrders(options) {
  return getAll(options);
}

export async function createStaffOrderAssignment({ orderId, staffId }) {
  return create({ orderId, staffId });
}

export async function deleteStaffOrderAssignment({ orderId, staffId }) {
  const deleted = await remove({ orderId, staffId });
  if (deleted) return;

  const err = new Error('Assignment not found');
  err.status = 404;
  throw err;
}

export async function getMyAssignments({ userId, offset, limit }) {
  const staff = await getStaffByUserId(userId);
  return getAll({ staffId: staff.id, offset, limit });
}
