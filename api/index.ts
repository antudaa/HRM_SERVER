import type { VercelRequest, VercelResponse } from '@vercel/node';
import app from '../src/app';
import connectDB from '../src/db';

export const config = { maxDuration: 30, regions: ['bom1'] };

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    await connectDB();
  } catch (e: any) {
    console.error('DB_CONNECT_ERROR', e?.message, e?.stack);
    return res.status(500).json({ success: false, message: 'DB connect failed', detail: e?.message });
  }
  return (app as any)(req, res);
}
