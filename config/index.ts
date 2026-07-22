import { config as dotEnvConfig } from 'dotenv';

dotEnvConfig();

export const config = {
  server: {
    port: process.env.PORT,
  },

  database: {
    uri: process.env.DB_URI,
  },

  jwt: {
    secret: process.env.JWT_SECRET!,
    expiry: 7,
  },

  cors: {
    origin: process.env.ORIGIN_URL,
  },

  redis: {
    url: process.env.REDIS_URL,
  },

  kafka: {
    broker: process.env.KAFKA_BROKER!,
    username: process.env.KAFKA_USERNAME!,
    password: process.env.KAFKA_PASSWORD!,
    clientOptions: {
      brokers: [process.env.KAFKA_BROKER!],
      ssl: { ca: [require('fs').readFileSync('./certificates/ca.pem')] },
      sasl: {
        mechanism: 'plain' as const,
        username: process.env.KAFKA_USERNAME!,
        password: process.env.KAFKA_PASSWORD!,
      },
      connectionTimeout: 10000,
      requestTimeout: 30000,
      retry: {
        retries: 10,
        initialRetryTime: 3000,
        maxRetryTime: 30000,
      },
    },
  },

  gmail: {
    user: process.env.GMAIL_USER!,
    appPassword: process.env.GMAIL_APP_PASSWORD!,
  },
};