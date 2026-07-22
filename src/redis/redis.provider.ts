import Redis from 'ioredis';
import { config } from '../../config';

export const RedisProvider = {
  provide: 'REDIS_CLIENT',
  useFactory: () => {
    if (!config.redis.url) {
      throw new Error('REDIS_URL is not defined');
    }
    return new Redis(config.redis.url);
  },
};
