import 'dotenv/config';
import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const SEED_USERS = {
  admin: {
    email: 'admin@laundry.local',
    password: 'admin-password-123',
    name: 'Admin User',
    address: '1 Admin Plaza',
    phone: '555-111-1111',
    role: 'admin',
  },
  customer: {
    email: 'customer@laundry.local',
    password: 'customer-password-123',
    name: 'Customer User',
    address: '123 Laundry Lane',
    phone: '555-222-2222',
    role: 'customer',
  },
  staff: {
    email: 'staff@laundry.local',
    password: 'staff-password-123',
    name: 'Staff User',
    address: '99 Backroom Blvd',
    phone: '555-333-3333',
    role: 'staff',
  },
};

const PRICING_TIERS = [
  { min_weight_kg: 0, max_weight_kg: 5, base_price: 15, extra_kg_price: 3 },
  { min_weight_kg: 5.01, max_weight_kg: 10, base_price: 25, extra_kg_price: 3 },
  { min_weight_kg: 10.01, max_weight_kg: 20, base_price: 40, extra_kg_price: 3.5 },
];

const SEED_ORDERS = [
  {
    status: 'seed',
    weight_kg: 7.5,
    garments: [
      {
        type: 'Shirt',
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
    ],
  },
  {
    status: 'seed-2',
    weight_kg: 3.2,
    garments: [
      {
        type: 'Dress',
        quantity: 1,
        care_instructions: 'Hand wash only',
        delicate_flag: true,
        unit_price: 6.0,
      },
      {
        type: 'Towels',
        quantity: 5,
        care_instructions: 'Hot wash, tumble dry',
        delicate_flag: false,
        unit_price: 1.75,
      },
    ],
  },
];

function todayYyyyMmDd() {
  return new Date().toISOString().slice(0, 10);
}

function calcTotalFromGarments(garments) {
  return garments.reduce((sum, g) => sum + Number(g.quantity) * Number(g.unit_price), 0);
}

async function ensureUser(user) {
  const existing = await prisma.user.findFirst({ where: { email: user.email } });
  if (existing) return existing;

  const hashedPassword = await bcrypt.hash(user.password, 10);
  return prisma.user.create({
    data: {
      email: user.email,
      password: hashedPassword,
      name: user.name,
      address: user.address,
      phone: user.phone,
      role: user.role,
    },
  });
}

async function ensureStaffForUser(staffUserId) {
  const existing = await prisma.staff.findFirst({ where: { userId: staffUserId } });
  if (existing) return existing;

  return prisma.staff.create({
    data: {
      userId: staffUserId,
      employee_role: 'washer',
      active_flag: true,
    },
  });
}

async function ensurePricingTier(tier) {
  const existing = await prisma.pricingTier.findFirst({
    where: {
      min_weight_kg: tier.min_weight_kg,
      max_weight_kg: tier.max_weight_kg,
    },
  });

  if (existing) {
    // Keep values in sync if you rerun the seed.
    return prisma.pricingTier.update({
      where: { id: existing.id },
      data: {
        base_price: tier.base_price,
        extra_kg_price: tier.extra_kg_price,
      },
    });
  }

  return prisma.pricingTier.create({ data: tier });
}

async function ensureSubscription({ userId, plan, discount_percentage, active_flag }) {
  const existing = await prisma.subscriptions.findFirst({
    where: { userId, plan },
  });

  if (existing) {
    return prisma.subscriptions.update({
      where: { id: existing.id },
      data: { discount_percentage, active_flag },
    });
  }

  return prisma.subscriptions.create({
    data: {
      userId,
      plan,
      discount_percentage,
      active_flag,
    },
  });
}

async function upsertSeedOrderWithGarments({ userId, status, pickup_date, weight_kg, garments }) {
  const existing = await prisma.order.findFirst({ where: { userId, status } });

  if (existing) {
    // Clear garments and re-seed to keep it deterministic.
    await prisma.garments.deleteMany({ where: { orderId: existing.id } });

    const created = await prisma.garments.createMany({
      data: garments.map((g) => ({ ...g, orderId: existing.id })),
    });

    const total_price = calcTotalFromGarments(garments);

    const order = await prisma.order.update({
      where: { id: existing.id },
      data: {
        pickup_date,
        weight_kg,
        total_price,
      },
    });

    return { order, garmentsCreated: created.count };
  }

  const total_price = calcTotalFromGarments(garments);

  const order = await prisma.order.create({
    data: {
      userId,
      pickup_date,
      weight_kg,
      status,
      total_price,
      garments: {
        create: garments,
      },
    },
  });

  return { order, garmentsCreated: garments.length };
}

async function purgeSeedData() {
  // Only purge records that are clearly seed-owned.
  const seedEmails = Object.values(SEED_USERS).map((u) => u.email);
  const users = await prisma.user.findMany({ where: { email: { in: seedEmails } } });
  const userIds = users.map((u) => u.id);

  // Delete garments for seed orders, then orders.
  const seedOrders = await prisma.order.findMany({
    where: { userId: { in: userIds }, status: { startsWith: 'seed' } },
    select: { id: true },
  });

  await prisma.garments.deleteMany({ where: { orderId: { in: seedOrders.map((o) => o.id) } } });

  // Join table depends on both order and staff.
  await prisma.staffOrder.deleteMany({ where: { order_id: { in: seedOrders.map((o) => o.id) } } });

  await prisma.order.deleteMany({ where: { id: { in: seedOrders.map((o) => o.id) } } });
  await prisma.subscriptions.deleteMany({ where: { userId: { in: userIds } } });

  // Staff rows depend on user.
  await prisma.staff.deleteMany({ where: { userId: { in: userIds } } });

  // NOTE: We intentionally do NOT delete users or pricing tiers.
}

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is missing. Set it in your .env before seeding.');
  }

  if (process.env.SEED_PURGE === 'true') {
    await purgeSeedData();
  }

  const admin = await ensureUser(SEED_USERS.admin);
  const customer = await ensureUser(SEED_USERS.customer);
  const staffUser = await ensureUser(SEED_USERS.staff);

  const staff = await ensureStaffForUser(staffUser.id);

  const tiers = [];
  for (const tier of PRICING_TIERS) tiers.push(await ensurePricingTier(tier));

  const sub = await ensureSubscription({
    userId: customer.id,
    plan: 'basic',
    discount_percentage: 10,
    active_flag: true,
  });

  const pickup_date = todayYyyyMmDd();

  const seededOrders = [];
  for (const o of SEED_ORDERS) {
    const seeded = await upsertSeedOrderWithGarments({
      userId: customer.id,
      status: o.status,
      pickup_date,
      weight_kg: o.weight_kg,
      garments: o.garments,
    });
    seededOrders.push(seeded);
  }

  // Assign the first seeded order to staff.
  const firstOrderId = seededOrders[0]?.order?.id;
  if (firstOrderId) {
    const existingLink = await prisma.staffOrder.findFirst({
      where: { order_id: firstOrderId, staff_id: staff.id },
    });
    if (!existingLink) {
      await prisma.staffOrder.create({
        data: { order_id: firstOrderId, staff_id: staff.id },
      });
    }
  }

  console.log('Seed complete.');
  console.log(`Users: admin=${admin.id}, customer=${customer.id}, staffUser=${staffUser.id}`);
  console.log(`Staff: id=${staff.id}`);
  console.log(`PricingTiers: ${tiers.length}`);
  console.log(`Subscription: id=${sub.id} (discount=${sub.discount_percentage}%)`);
  console.log(
    `Orders: ${seededOrders
      .map((x) => `${x.order.id} (${x.order.status}, garments=${x.garmentsCreated}, total=$${x.order.total_price})`)
      .join(', ')}`,
  );
}

main()
  .catch((err) => {
    console.error('Seed failed:', err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
