import prisma from '../config/db.js';

export async function getAll({ search, sortBy, order, offset, limit }) {
    const conditions = {};
    if (search) {
        conditions.OR = [
            { status: { contains: search, mode: 'insensitive' } },
            { pickup_date: { contains: search, mode: 'insensitive' } },
        ];
    }
    const orders = await prisma.order.findMany({
        where: conditions,
        orderBy: { [sortBy]: order },
        take: limit,
        skip: offset,
    });

    return orders;

}


export async function getById(id) {
    const order = await prisma.order.findUnique({ where: { id } });
    return order;
}

export async function create(orderData) {
    const newOrder = await prisma.order.create({
        data: orderData
    });

    return newOrder;
}

export async function update(id, updatedOrder) {
    try {
        const updatedDecree = await prisma.order.update({
            where: { id },
            data: updatedOrder,
        });
        return updatedDecree;

    }catch(error) {
        if(error.code === 'P2025') {
            return null;
        }
        throw error;

    }
}

export async function remove(id) {
    try {
        const deletedOrder = await prisma.order.delete({
            where: { id },
        });

        return deletedOrder;


    } catch(error) {
        if (error.code === 'P2025') {
            return null;
        }
        throw error;
    }
}
