import express from 'express';
import cors from 'cors';
import productsRouter from './routes/products.js';
import chickensRouter from './routes/chickens.js';
import contactRouter from './routes/contact.js';
import checkoutRouter from './routes/checkout.js';
import newsletterRouter from './routes/newsletter.js';
import { connectRedis, redis } from './lib/redis.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());

// Routes
app.use('/api/products', productsRouter);
app.use('/api/chickens', chickensRouter);
app.use('/api/contact', contactRouter);
app.use('/api/checkout', checkoutRouter);
app.use('/api/newsletter', newsletterRouter);

// Health check with Redis status
app.get('/api/health', async (_req, res) => {
  let redisStatus = 'disconnected';
  try {
    await redis.ping();
    redisStatus = 'connected';
  } catch {
    redisStatus = 'error';
  }

  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    redis: redisStatus,
  });
});

// Cache stats endpoint
app.get('/api/cache/stats', async (_req, res) => {
  try {
    const info = await redis.info('stats');
    const dbSize = await redis.dbsize();
    res.json({
      keys: dbSize,
      info: info,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get cache stats' });
  }
});

// Clear cache endpoint (for admin use)
app.delete('/api/cache', async (_req, res) => {
  try {
    await redis.flushdb();
    res.json({ message: 'Cache cleared successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to clear cache' });
  }
});

// Start server
async function start() {
  // Connect to Redis
  await connectRedis();

  app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
  });
}

start().catch(console.error);
