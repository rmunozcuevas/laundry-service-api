import prisma from '../config/db.js';

/**
 * make sure that you can search via employee_role
 * 
 */
export async function getAll({search, sortBy, order, offset, limit}) {
    const conditions = {};

    if (search) {
        conditions.OR = [
            { type: { contains: search, mode: 'insensitive'}},
            { employee_role: {contains: search, mode: 'insensitive'}}
        ];

    }

    const Staff = await prisma.staff.findMany({
        where: conditions,
        orderBy: { [sortBy]: order},
        take: limit, 
        skip: offset
    });

    return Staff;

}

export async function getById(id) {
    const staff = await prisma.staff.findUnique({
        where: { id },
        include: {
            order: {
                select: { userId: true},
            },
        },
    });
    return staff;
}

export async function create(staffData) {
    try {
        const staff = await prisma.staff.create({
            data: staffData
        })
        return staff;

    }catch(error) {
        if(error.code === 'P2003') {
            const err = new Error('Invalid orderId: order does not exist');
            err.status = 400;
            throw err;
        }
        throw error;

    }
}

export async function update(id, updatedStaff) {
    try{
        const updatedStaffPeople = await prisma.staff.update({
            where: { id },
            data: updatedStaff
        })

    }catch(error) {
        if(error.code === 'P2025') {
            return null;
        }
        throw error;
    }
}

export async function remove(id) {
    try {
        const deletedStaff = await prisma.staff.delete({
            where: { id },

        });

        return deletedStaff;

    }catch(error) {
        if(error.code === 'P2025') return null;
        throw error;

    }
}