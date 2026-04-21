import { getGarmentById } from '../services/GarmentServices.js';

export async function authorizeOwnership(req, res, next) {
    const id = parseInt(req.params.id);
    const garment = await getGarmentById(id);

    if (!garment?.order || garment.order.userId !== req.user.id) {
        const error = new Error('Forbidden: Insufficient Permissions');
        error.status = 403;
        return next(error);
    }

    return next();
}
