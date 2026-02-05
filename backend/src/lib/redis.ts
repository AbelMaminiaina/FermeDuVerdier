import Redis from 'ioredis';

const redisUrl = process.env.REDIS_URL || 'redis://:redis123@localhost:6380';

export const redis = new Redis(redisUrl, {
  maxRetriesPerRequest: 3,
  retryDelayOnFailover: 100,
  lazyConnect: true,
});

redis.on('connect', () => {
  console.log('Redis connected successfully');
});

redis.on('error', (err) => {
  console.error('Redis connection error:', err.message);
});

export async function connectRedis(): Promise<void> {
  try {
    await redis.connect();
  } catch (error) {
    console.error('Failed to connect to Redis:', error);
  }
}

export default redis;
