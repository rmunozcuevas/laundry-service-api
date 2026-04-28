import {
  getAllStaffOrders,
  getMyAssignments,
  createStaffOrderAssignment,
  deleteStaffOrderAssignment,
} from '../services/StaffOrderServices.js';

export async function getAllStaffOrdersHandler(req, res) {
  const { staffId, orderId, offset = 0, limit = 50 } = req.query;

  const parsedStaffId = staffId === undefined ? undefined : parseInt(staffId, 10);
  const parsedOrderId = orderId === undefined ? undefined : parseInt(orderId, 10);

  const options = {
    staffId: Number.isNaN(parsedStaffId) ? undefined : parsedStaffId,
    orderId: Number.isNaN(parsedOrderId) ? undefined : parsedOrderId,
    offset: parseInt(offset, 10),
    limit: parseInt(limit, 10),
  };

  const rows = await getAllStaffOrders(options);
  res.status(200).json(rows);
}

export async function getMyStaffOrdersHandler(req, res) {
  const userId = req.user?.id;
  if (!userId) {
    const err = new Error('Not authenticated. Please provide a valid token.');
    err.status = 401;
    throw err;
  }

  const { offset = 0, limit = 50 } = req.query;
  const rows = await getMyAssignments({ userId, offset: parseInt(offset, 10), limit: parseInt(limit, 10) });
  res.status(200).json(rows);
}

export async function createStaffOrderHandler(req, res) {
  const { orderId, staffId } = req.body;
  const created = await createStaffOrderAssignment({ orderId, staffId });
  res.status(201).json(created);
}

export async function deleteStaffOrderHandler(req, res) {
  const { orderId, staffId } = req.body;
  await deleteStaffOrderAssignment({ orderId, staffId });
  res.status(204).send();
}
