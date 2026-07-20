import Redis from 'ioredis';
import { config } from '../../config';

export const RedisProvider = {
  provide: 'REDIS_CLIENT',
  useFactory: () => {
    return new Redis({
      host: config.redis.host,
      port: Number(config.redis.port),
    });
  },
};
