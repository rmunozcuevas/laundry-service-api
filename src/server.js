import 'dotenv/config';
import express from 'express';
import morgan from 'morgan';

import GarmentRoutes from './routes/GarmentRoutes.js';
import OrderRoutes from './routes/OrderRoutes.js';
import authRoutes from './routes/authRoutes.js';
import PricingTierRoutes from './routes/PricingTierRoutes.js';
import SubscriptionRoutes from './routes/SubscriptionRoutes.js';
import StaffRoutes from './routes/StaffRoutes.js';
import StaffOrderRoutes from './routes/StaffOrderRoutes.js';

import swaggerUi from 'swagger-ui-express';
import yaml from 'js-yaml';
import fs from 'fs';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
if (process.env.NODE_ENV !== 'test') app.use(morgan('tiny'));

let specs;
try {
  specs = yaml.load(fs.readFileSync('./docs/openapi.yaml', 'utf8'));
} catch (error) {
  console.log('Failed to load OpenAPI specification', error);
  process.exit(1);
}

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

app.use('/api/garments', GarmentRoutes);
app.use('/api/orders', OrderRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/pricing-tiers', PricingTierRoutes);
app.use('/api/subscriptions', SubscriptionRoutes);
app.use('/api/staff', StaffRoutes);
app.use('/api/staff-orders', StaffOrderRoutes);

app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

app.use((err, req, res, next) => {
  // Keep the stack for local debugging.
  console.log(err.stack);

  // If a Prisma error bubbled up without an HTTP status, map it.
  if (!err.status && err.code) {
    if (err.code === 'P2002') {
      err.status = 409;
      err.message = err.message || 'Unique constraint failed';
    } else if (err.code === 'P2003') {
      err.status = 400;
      err.message = err.message || 'Foreign key constraint failed';
    } else if (err.code === 'P2025') {
      err.status = 404;
      err.message = err.message || 'Record not found';
    } else if (err.code === 'P2009' || err.code === 'P2012') {
      err.status = 400;
      err.message = err.message || 'Invalid request';
    }
  }

  if (!err.status) {
    err.status = 500;
    err.message = 'Internal Server Error';
  }

  res.status(err.status).json({ error: err.message });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
}

export default app;
