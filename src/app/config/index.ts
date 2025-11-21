// import dotenv from "dotenv";
// import path from "path";

// dotenv.config({ path: path.join((process.cwd(), ".env")) });

// export default {
//   node_env: process.env.NODE_ENV,
//   port: process.env.PORT,
//   database_url: process.env.DATABASE_URL,
//   bcrypt_salt_rounds: process.env.BCRYPT_SALT_ROUNDS,
//   default_password: process.env.DEFAULT_PASSWORD,
//   jwt_access_secret_token: process.env.JWT_ACCESS_SECRET_TOKEN,
//   jwt_access_refrest_secret_token: process.env.JWT_ACCESS_REFREST_SECRET_TOKEN,
//   jwt_access_expire_time: process.env.JWT_ACCESS_EXPIRES_IN,
//   jwt_refresh_expires_time: process.env.JWT_REFREST_EXPIRES_IN,
//   cloudinary_name: process.env.CLOUDINARY_NAME,
//   cloudinary_api_key: process.env.CLOUDINARY_API_KEY,
//   cloudinary_api_secret: process.env.CLOUDINARY_API_SECRET,
// };





import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

const num = (v: unknown, fallback: number): number => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};

export default {
  // Basics
  node_env: process.env.NODE_ENV ?? 'development',
  port: num(process.env.PORT, 4000),
  database_url: process.env.DATABASE_URL || (process.env as any).database_url,

  // Password / bcrypt
  bcrypt_salt_rounds: num(process.env.BCRYPT_SALT_ROUNDS, 10),
  default_password: process.env.DEFAULT_PASSWORD,

  // JWT secrets (prefer correct names; tolerate old typos)
  jwt_access_secret_token:
    process.env.JWT_ACCESS_SECRET_TOKEN ||
    (process.env as any).jwt_access_secret_token,

  // canonical refresh secret
  jwt_refresh_secret_token:
    process.env.JWT_REFRESH_SECRET_TOKEN ||
    process.env.JWT_ACCESS_REFREST_SECRET_TOKEN || // tolerate legacy typo
    (process.env as any).jwt_refresh_secret_token,

  // keep this alias too if some code still reads the typo'd key from config
  jwt_access_refrest_secret_token:
    process.env.JWT_ACCESS_REFREST_SECRET_TOKEN ||
    process.env.JWT_REFRESH_SECRET_TOKEN ||
    (process.env as any).jwt_access_refrest_secret_token,

  // Expirations (strings like "15m", "1d", "30d")
  jwt_access_expires_time:
    process.env.JWT_ACCESS_EXPIRES_IN ||
    (process.env as any).jwt_access_expires_time ||
    '15m',

  jwt_refresh_expires_time:
    process.env.JWT_REFRESH_EXPIRES_IN ||
    process.env.JWT_REFREST_EXPIRES_IN || // tolerate legacy typo
    (process.env as any).jwt_refresh_expires_time ||
    '7d',

  // also expose the singular key you requested (maps to same value)
  jwt_access_expire_time:
    process.env.JWT_ACCESS_EXPIRES_IN ||
    (process.env as any).jwt_access_expire_time ||
    '15m',

  // Cloudinary
  cloudinary_name: process.env.CLOUDINARY_NAME,
  cloudinary_api_key: process.env.CLOUDINARY_API_KEY,
  cloudinary_api_secret: process.env.CLOUDINARY_API_SECRET,
};