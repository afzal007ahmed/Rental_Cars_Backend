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
    secret : process.env.JWT_SECRET! ,
    expiry : 7
  },
  cors : {
    origin : process.env.ORIGIN_URL
  }
};
