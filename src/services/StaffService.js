import {
    getAll,
    getById,
    create,
    update,
    remove
} from '../repositories/StaffRepo.js';

export async function getAllStaff(options) {
    return getAll(options);
}

export async function getStaffById(id) {
    const staff = await getById(id)

    if(staff) return staff;

    const error = new Error(`Staff ${id} not found`);
    error.status = 404;
    throw error;
}

export async function createStaff(staffData) {
    return create(staffData);
}

export async function updatedStaff(id, updatedStaffData) {
    const updated_staff_data = await update(id, updatedStaffData);
    if(updated_staff_data) return updated_staff_data;
    else{
        const error = new Error(`Staff ${id} not found`);
        error.status = 404;
        throw error;
    }
}

export async function deleteStaff(id) {
    const result = await remove(id);
    if(result) return;
    else {
        const error = new Error(`Staff ${id} not found`);
        error.status = 404;
        throw error;
    }
}