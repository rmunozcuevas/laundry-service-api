import {
  getAll,
  getById,
  getByUserId,
  create,
  update,
  remove,
} from '../repositories/StaffRepo.js';

export async function getAllStaff(options) {
  return getAll(options);
}

export async function getStaffById(id) {
  const staff = await getById(id);

  if (staff) return staff;

  const error = new Error(`Staff ${id} not found`);
  error.status = 404;
  throw error;
}

export async function getStaffByUserId(userId) {
  const staff = await getByUserId(userId);

  if (staff) return staff;

  const error = new Error('Staff profile not found for this user');
  error.status = 404;
  throw error;
}

export async function createStaff(staffData) {
  return create(staffData);
}

export async function updatedStaff(id, updatedStaffData) {
  const updated = await update(id, updatedStaffData);
  if (updated) return updated;

  const error = new Error(`Staff ${id} not found`);
  error.status = 404;
  throw error;
}

export async function deleteStaff(id) {
  const result = await remove(id);
  if (result) return;

  const error = new Error(`Staff ${id} not found`);
  error.status = 404;
  throw error;
}
