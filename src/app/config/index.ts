import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join((process.cwd(), ".env")) });

export default {
  node_env: process.env.NODE_ENV,
  port: process.env.PORT,
  database_url: process.env.DATABASE_URL,
  bcrypt_salt_rounds: process.env.BCRYPT_SALT_ROUNDS,
  default_password: process.env.DEFAULT_PASSWORD,
  jwt_access_secret_token: process.env.JWT_ACCESS_SECRET_TOKEN,
  jwt_access_refrest_secret_token: process.env.JWT_ACCESS_REFREST_SECRET_TOKEN,
  jwt_access_expire_time: process.env.JWT_ACCESS_EXPIRES_IN,
  jwt_refresh_expires_time: process.env.JWT_REFREST_EXPIRES_IN,
  cloudinary_name: process.env.CLOUDINARY_NAME,
  cloudinary_api_key: process.env.CLOUDINARY_API_KEY,
  cloudinary_api_secret: process.env.CLOUDINARY_API_SECRET,
};
