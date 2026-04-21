import prisma from '../config/db.js';

export async function createUser(data) {
  try {
    // Don't depend on a DB-level unique constraint for email during development.
    // This keeps signup/login working even if the Prisma schema hasn't marked email as @unique yet.
    const existing = await prisma.user.findFirst({ where: { email: data.email } });
    if (existing) {
      const err = new Error('Email has already been used');
      err.status = 409;
      throw err;
    }

    const newUser = await prisma.user.create({
      data,
      select: {
        id: true,
        email: true,
        name: true,
        address: true,
        phone: true,
        role: true,
      },
    });
    return newUser;
  } catch (error) {
    if (error.code === 'P2002') {
      const err = new Error('Email has already been used');
      err.status = 409;
      throw err;
    }
    throw error;
  }
}

export async function findUserByEmail(email) {
  return prisma.user.findFirst({ where: { email } });
}
