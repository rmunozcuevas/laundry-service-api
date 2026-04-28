import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

function assert(condition, message) {
  if (!condition) {
    const err = new Error(message);
    err.status = 1;
    throw err;
  }
}

async function main() {
  assert(process.env.DATABASE_URL, 'DATABASE_URL is missing (set it in .env or environment).');

  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
  });

  try {
    const emails = {
      admin: 'admin@laundry.local',
      customer: 'customer@laundry.local',
      staff: 'staff@laundry.local',
    };

    const admin = await prisma.user.findFirst({ where: { email: emails.admin } });
    const customer = await prisma.user.findFirst({ where: { email: emails.customer } });
    const staffUser = await prisma.user.findFirst({ where: { email: emails.staff } });

    assert(admin, `Missing seed admin user (${emails.admin}). Run: npm run seed:db`);
    assert(customer, `Missing seed customer user (${emails.customer}). Run: npm run seed:db`);
    assert(staffUser, `Missing seed staff user (${emails.staff}). Run: npm run seed:db`);

    const staff = await prisma.staff.findFirst({ where: { userId: staffUser.id } });
    assert(staff, 'Missing Staff row for seeded staff user. Seed should create one.');

    const pricingTierCount = await prisma.pricingTier.count();
    assert(pricingTierCount > 0, 'No PricingTier rows found. Seed should create tiers.');

    const subCount = await prisma.subscriptions.count({ where: { userId: customer.id } });
    assert(subCount > 0, 'No Subscriptions found for seeded customer. Seed should create one.');

    const orders = await prisma.order.findMany({
      where: { userId: customer.id },
      orderBy: { id: 'asc' },
      include: { garments: true },
    });
    assert(orders.length > 0, 'No Orders found for seeded customer. Seed should create orders.');

    const garmentsCount = orders.reduce((sum, o) => sum + o.garments.length, 0);
    assert(garmentsCount > 0, 'No Garments found on seeded customer orders. Seed should create garments.');

    const assignment = await prisma.staffOrder.findFirst({
      where: { staff_id: staff.id },
      include: {
        staff: { select: { id: true, userId: true, employee_role: true, active_flag: true } },
        order: { select: { id: true, userId: true, pickup_date: true, status: true, total_price: true } },
      },
    });

    assert(assignment, 'No StaffOrder assignment found for seeded staff. Seed should assign at least one order.');

    // Report
    const counts = {
      users: await prisma.user.count(),
      staff: await prisma.staff.count(),
      staffOrders: await prisma.staffOrder.count(),
      pricingTiers: pricingTierCount,
      subscriptions: await prisma.subscriptions.count(),
      orders: await prisma.order.count(),
      garments: await prisma.garments.count(),
    };

    console.log('DB flow check: OK');
    console.log('Counts:', counts);
    console.log('Seed customer id:', customer.id);
    console.log('Seed staff id:', staff.id);
    console.log('Example assignment:', {
      order_id: assignment.order_id,
      staff_id: assignment.staff_id,
      order: assignment.order,
      staff: assignment.staff,
    });
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error('DB flow check: FAILED');
  console.error(err.message || err);
  process.exit(typeof err.status === 'number' ? err.status : 1);
});
