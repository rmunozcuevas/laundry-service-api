import {
  getAllStaff,
  getStaffById,
  getStaffByUserId,
  createStaff,
  updatedStaff,
  deleteStaff,
} from '../services/StaffService.js';

export async function getAllStaffHandler(req, res) {
  const { search = '', sortBy = 'id', order = 'asc', offset = 0, limit = 5 } = req.query;

  const options = {
    search,
    sortBy,
    order,
    offset: parseInt(offset, 10),
    limit: parseInt(limit, 10),
  };

  const staff = await getAllStaff(options);
  res.status(200).json(staff);
}

export async function getMyStaffHandler(req, res) {
  const userId = req.user?.id;
  if (!userId) {
    const err = new Error('Not authenticated. Please provide a valid token.');
    err.status = 401;
    throw err;
  }

  const staff = await getStaffByUserId(userId);
  res.status(200).json(staff);
}

export async function getStaffByIdHandler(req, res) {
  const id = parseInt(req.params.id, 10);

  // If authorize middleware already fetched it, use that.
  const staff = req.staff ?? (await getStaffById(id));
  res.status(200).json(staff);
}

export async function createStaffHandler(req, res) {
  const { userId, employee_role, active_flag } = req.body;

  const staff = await createStaff({
    userId,
    employee_role,
    active_flag,
  });

  res.status(201).json(staff);
}

export async function updateStaffHandler(req, res) {
  const id = parseInt(req.params.id, 10);
  const { employee_role, active_flag } = req.body;

  const updated = await updatedStaff(id, {
    employee_role,
    active_flag,
  });

  res.status(200).json(updated);
}

export async function deleteStaffHandler(req, res) {
  const id = parseInt(req.params.id, 10);
  await deleteStaff(id);
  res.status(204).send();
}
