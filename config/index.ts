import { config as dotEnvConfig } from "dotenv"

dotEnvConfig() ;

export const config = {
  server : {
    port : process.env.PORT 
  },
  database : {
    uri : process.env.DB_URI
  }
}