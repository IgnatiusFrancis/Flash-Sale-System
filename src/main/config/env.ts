import dotenv from "dotenv";
dotenv.config();

export default {
  mongoUrl: process.env.MONGO_URL,
  port: process.env.PORT || 5050,
  secret_key: process.env.SECRET_KEY,
  redis_host: process.env.REDIS_HOST,
  redis_port: process.env.REDIS_PORT,
  redis_password: process.env.REDIS_PASSWORD,
  redis_lock_key: process.env.REDIS_LOCK_KEY,
};
