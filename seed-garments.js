import 'dotenv/config';
import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const seedEmail = 'seed.user@laundry.local';
const seedPassword = 'seed-password-123';

const garmentsTemplate = [
  {
    type: 'Shirts',
    quantity: 3,
    care_instructions: 'Machine wash cold',
    delicate_flag: false,
    unit_price: 2.5,
  },
  {
    type: 'Pants',
    quantity: 2,
    care_instructions: 'Warm wash, tumble dry low',
    delicate_flag: false,
    unit_price: 3.25,
  },
  {
    type: 'Dress',
    quantity: 1,
    care_instructions: 'Hand wash only',
    delicate_flag: true,
    unit_price: 6.0,
  },
  {
    type: 'Jacket',
    quantity: 1,
    care_instructions: 'Dry clean only',
    delicate_flag: true,
    unit_price: 8.5,
  },
  {
    type: 'Towels',
    quantity: 5,
    care_instructions: 'Hot wash, tumble dry',
    delicate_flag: false,
    unit_price: 1.75,
  },
];

async function ensureUser() {
  let user = await prisma.user.findFirst({ where: { email: seedEmail } });
  if (!user) {
    const hashedPassword = await bcrypt.hash(seedPassword, 10);
    user = await prisma.user.create({
      data: {
        email: seedEmail,
        password: hashedPassword,
        name: 'Seed User',
        address: '123 Laundry Lane',
        phone: '555-000-0000',
        role: 'customer',
      },
    });
  }
  return user;
}

async function ensureOrder(userId) {
  const existingOrder = await prisma.order.findFirst({
    where: { userId, status: 'seed' },
  });

  if (existingOrder) {
    await prisma.garments.deleteMany({ where: { orderId: existingOrder.id } });
    return existingOrder;
  }

  const pickupDate = new Date().toISOString().slice(0, 10);
  return prisma.order.create({
    data: {
      userId,
      pickup_date: pickupDate,
      weight_kg: 7.5,
      status: 'seed',
      total_price: 0,
    },
  });
}

async function seed() {
  const user = await ensureUser();
  const order = await ensureOrder(user.id);

  const garmentsData = garmentsTemplate.map((garment) => ({
    ...garment,
    orderId: order.id,
  }));

  await prisma.garments.createMany({ data: garmentsData });

  const totalPrice = garmentsTemplate.reduce(
    (sum, item) => sum + item.quantity * item.unit_price,
    0,
  );

  await prisma.order.update({
    where: { id: order.id },
    data: {
      total_price: totalPrice,
    },
  });

  console.log(`Seeded ${garmentsData.length} garments on order ${order.id}.`);
}

seed()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
