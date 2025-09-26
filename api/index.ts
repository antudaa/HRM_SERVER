// api/index.ts
import serverless from "serverless-http";
import mongoose from "mongoose";
import app from "../src/app";

let connPromise: Promise<typeof mongoose> | null = null;
async function initDb() {
  if (!connPromise) {
    const uri = process.env.DATABASE_URL;
    if (!uri) throw new Error("DATABASE_URL env var missing");
    connPromise = mongoose.connect(uri);
  }
  return connPromise;
}

const handler = serverless(app);

export default async (req: any, res: any) => {
  try {
    // ⚠️ Do NOT block preflight on the DB connection
    if (req.method !== "OPTIONS") {
      await initDb();
    }
    return handler(req, res);
  } catch (err: any) {
    // Always reply with JSON so the browser doesn't mislabel as a CORS failure
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ ok: false, error: err?.message || "Internal Error" }));
  }
};
