import express, { Application, Request, Response, NextFunction } from 'express';
import cookieParser from 'cookie-parser';
import bcrypt from 'bcrypt';
import router from './app/routes';
import globalErrorHandler from './app/middlewares/globalErrorHandler';
import notFoundRoute from './app/middlewares/notFoundRoute';
import httpStatus from 'http-status';
import { User } from './app/modules/User/user.model';
import config from './app/config';
import { createToken } from './app/modules/Auth/auth.utils';

const app: Application = express();

app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

/* -------- Credentialed CORS for direct cross-origin requests ---------- */
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:3000';

app.use((req: Request, res: Response, next: NextFunction) => {
  res.header('Access-Control-Allow-Origin', FRONTEND_ORIGIN);
  res.header('Vary', 'Origin');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, Content-Type, Authorization, X-Requested-With'
  );
  res.header('Access-Control-Max-Age', '600');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

/* ------------------------------ LOGIN ------------------------------- */
const loginHandler = async (req: Request, res: Response) => {
  const t0 = Date.now();
  try {
    const { email, password } = req.body ?? {};
    if (!email || !password) {
      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: 'Email and password are required.',
      });
    }

    const user = await User.findOne({ email })
      .select('+password +status +role +employeeId +email')
      .lean();

    if (!user || !(user as any)._id) {
      return res.status(httpStatus.NOT_FOUND).json({
        success: false,
        message: 'User not found or invalid _id!',
      });
    }

    const ok = await bcrypt.compare(password, (user as any).password || '');
    if (!ok) {
      return res.status(httpStatus.FORBIDDEN).json({
        success: false,
        message: 'Password does not match!',
      });
    }

    const jwtPayload = {
      id: (user as any)._id,
      employeeId: (user as any).employeeId,
      email: (user as any).email,
      role: (user as any).role,
      status: (user as any).status,
    };

    const accessSecret =
      (config as any).jwt_access_secret_token ?? config.jwt_access_secret_token;
    const refreshSecret =
      (config as any).jwt_refresh_secret_token ?? config.jwt_refresh_secret_token;

    const accessExpires =
      (config as any).jwt_access_expires_time ?? config.jwt_access_expires_time ?? '15m';
    const refreshExpires =
      (config as any).jwt_refresh_expires_time ?? config.jwt_refresh_expires_time ?? '7d';

    if (!accessSecret || !refreshSecret) {
      return res
        .status(httpStatus.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: 'JWT secrets are not configured.' });
    }

    const accessToken = createToken(jwtPayload, accessSecret, accessExpires);
    const refreshToken = createToken(jwtPayload, refreshSecret, refreshExpires);

    res.cookie('refreshToken', refreshToken, {
      secure: true,
      httpOnly: true,
      sameSite: 'none',
      path: '/',
    });

    return res.status(httpStatus.OK).json({
      success: true,
      message: 'User Logged in Successfully',
      data: { accessToken },
      meta: { tookMs: Date.now() - t0 },
    });
  } catch (err: any) {
    console.error('LOGIN_ERROR', { message: err?.message, stack: err?.stack });
    return res.status(err?.statusCode || 500).json({
      success: false,
      message:
        process.env.NODE_ENV === 'production'
          ? 'Internal Server Error'
          : err?.message || 'Internal Server Error',
      ...(process.env.NODE_ENV !== 'production' && err?.stack ? { stack: err.stack } : {}),
    });
  }
};

app.post('/login', loginHandler);
app.post('/api/login', loginHandler); // alias

/* ----------------------------- API Mount ----------------------------- */
app.use('/api', router);

app.get('/', (_req: Request, res: Response) => res.send('HRM Server is up.'));
app.get('/api', (_req: Request, res: Response) => res.json({ ok: true }));

/* -------------------- 404 then Error handler (order) ----------------- */
app.use(notFoundRoute);
app.use(globalErrorHandler);

export default app;
