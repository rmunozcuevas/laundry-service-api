import { getStaffById } from '../services/StaffService.js';

export async function authorizeStaffSelfOrAdmin(req, res, next) {
  if (req.user?.role === 'admin') return next();

  const id = parseInt(req.params.id, 10);
  const staff = await getStaffById(id); // throws 404 if missing

  if (staff.userId !== req.user?.id) {
    const err = new Error('Forbidden: Insufficient Permissions');
    err.status = 403;
    return next(err);
  }

  // Cache for handler.
  req.staff = staff;
  return next();
}
