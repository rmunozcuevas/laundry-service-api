import {
    getAll,
    getById,
    create,
    update,
    remove

} from '../repositories/OrderRepo.js';


export async function getAllOrders(options) {
    return getAll(options);
}

export async function getOrderById(id) {
    const order = await getById(id);

    if(order) return order;
    else {
        const error = new Error(`Order ${id} not found`);
        error.status = 404;
        throw error;
    }

}

export async function createOrder(orderData) {
    return create(orderData);
}

export async function updatedOrder(id, updatedOrderData) {
    const order = await update(id, updatedOrderData);
    if (order) return order;
    else {
        const error = new Error(`Order ${id} not found`);
        error.status = 404;
        throw error;
    }
}

export async function deleteOrder(id) {
    const result = await remove(id);
    if(result) return;
    else {
        const error = new Error(`Order ${id} not found`);
        error.status = 404;
        throw error;
    }
}
