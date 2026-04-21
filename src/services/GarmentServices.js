import {
    getAll,
    getById,
    create,
    update,
    remove
} from '../repositories/GarmentRepo.js';

export async function getAllGarments(options) {
    return getAll(options);
}

export async function getGarmentById(id) {
    const garment = await getById(id);

    if(garment) return garment;
    else{
        const error = new Error(`Garment ${id} not found`);
        error.status = 404;
        throw error;
    }
}

export async function createGarment(garmentData) {
    return create(garmentData);
}

export async function updatedGarment(id, updatedGarment) {
    const updatedClothing = await update(id, updatedGarment);
    if (updatedClothing) return updatedClothing;
    else {
        const error = new Error(`Garment ${id} not found`);
        error.status = 404;
        throw error
    }
}

export async function deleteGarment(id) {
    const result = await remove(id);
    if(result) return;
    else{
        const error = new Error(`Garment ${id} not found`);
        error.status = 404;
        throw error;
    }
}
