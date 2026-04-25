import {
  getAllGarments,
  getGarmentById,
  createGarment,
  updatedGarment,
  deleteGarment,
} from '../services/GarmentServices.js';

export async function getAllGarmentsHandlers(req, res) {
  const { search = '', sortBy = 'id', order = 'asc', offset = 0, limit = 5 } = req.query;

  const isAdmin = req.user?.role === 'admin';

  const options = {
    search,
    sortBy,
    order,
    offset: parseInt(offset, 10),
    limit: parseInt(limit, 10),
    userId: isAdmin ? undefined : req.user.id,
  };

  const garments = await getAllGarments(options);
  res.status(200).json(garments);
}

export async function getGarmentByIdHandler(req, res) {
  const id = parseInt(req.params.id, 10);
  const garment = await getGarmentById(id);
  res.status(200).json(garment);
}

export async function createGarmentHandler(req, res) {
  const { type, quantity, care_instructions, delicate_flag, unit_price, orderId } = req.body;

  const newGarment = await createGarment({
    type,
    quantity,
    care_instructions,
    delicate_flag,
    unit_price,
    orderId,
  });

  res.status(201).json(newGarment);
}

export async function updateGarmentHandler(req, res) {
  const id = parseInt(req.params.id, 10);
  const { type, quantity, care_instructions, delicate_flag, unit_price } = req.body;

  const updateGarmentResult = await updatedGarment(id, {
    type,
    quantity,
    care_instructions,
    delicate_flag,
    unit_price,
  });

  res.status(200).json(updateGarmentResult);
}

export async function deleteGarmentHandler(req, res) {
  const id = parseInt(req.params.id, 10);
  await deleteGarment(id);
  res.status(204).send();
}
