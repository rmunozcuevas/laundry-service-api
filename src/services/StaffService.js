import {
    getAll,
    getById,
    create,
    update,
    remove
} from '../repositories/StaffRepo.js';

export async function getAllStaff(options) {
    const staff = await getAll(options);
}

export async function getStaffById(id) {
    const staff = await getById(id)

    if(staff) return staff;

    const error = new Error(`Staff ${id} not found`);
    error.status = 404;
    throw error;
}