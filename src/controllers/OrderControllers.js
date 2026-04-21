import {
    getAllOrders,
    getOrderById,
    createOrder,
    updatedOrder,
    deleteOrder
} from '../services/OrderServices.js';

function toYyyyMmDd(d) {
    return d.toISOString().slice(0, 10);
}

function computePickupDateFromNow() {
    const leadDaysRaw = process.env.PICKUP_LEAD_DAYS;
    const leadDaysParsed = leadDaysRaw === undefined ? 2 : Number(leadDaysRaw);
    const leadDays = Number.isFinite(leadDaysParsed) ? leadDaysParsed : 2;

    const pickup = new Date();
    pickup.setDate(pickup.getDate() + leadDays);
    return toYyyyMmDd(pickup);
}

export async function getAllOrdersHandlers(req, res, next) {
    try {
        const {
            search = '',
            sortBy = 'id',
            order = 'asc',
            offset = 0,
            limit = 5,    
        } = req.query;

        const options = {
            search,
            sortBy,
            order,
            offset: parseInt(offset),
            limit: parseInt(limit)
        };

        let orders = await getAllOrders(options);
        res.status(200).json(orders);
    } catch (error) {
        next(error);
    }
}

export async function getOrderByIdHandlers(req, res, next) {
    try {
        const id = parseInt(req.params.id);
        const orders = await getOrderById(id); 
        res.status(200).json(orders);
    } catch (error) {
        next(error);
    }
}

export async function createOrdersHandler(req, res, next) {
    try {
        // pickup_date is derived from the order creation date; do not accept it from the client.
        const { userId: userIdFromBody, weight_kg, status, total_price } = req.body;
        const userId = req.user?.id ?? userIdFromBody;
        if (!userId) {
            const err = new Error('userId is required');
            err.status = 400;
            throw err;
        }

        if (weight_kg === undefined) {
            const err = new Error('weight_kg is required');
            err.status = 400;
            throw err;
        }

        const pickup_date = computePickupDateFromNow();

        const newOrder = await createOrder({
            userId: Number(userId),
            pickup_date,
            weight_kg: Number(weight_kg),
            status: status ?? 'pending',
            total_price: total_price === undefined ? 0 : Number(total_price),
        });
        res.status(201).json(newOrder);
    } catch (error) {
        next(error);
    }
}

export async function updateOrdersHandler(req, res, next) {
    try {
        const id = parseInt(req.params.id);
        // pickup_date stays server-managed.
        const { weight_kg, status, total_price } = req.body;
        const updateOrder = await updatedOrder(id, {
            weight_kg,
            status,
            total_price
        });
        res.status(200).json(updateOrder);
    } catch (error) {
        next(error);
    }
}

export async function deleteOrdersHandler(req, res, next) {
    try {
        const id = parseInt(req.params.id);
        await deleteOrder(id);
        res.status(204).send();
    } catch (error) {
        next(error);
    }
}
