// src/app.ts
import express, { Application, Request, Response } from "express";
import cors, { CorsOptions } from "cors";
import cookieParser from "cookie-parser";
import globalErrorHandler from "./app/middlewares/globalErrorHandler";
import notFoundRoute from "./app/middlewares/notFoundRoute";
import router from "./app/routes";

const app: Application = express();

// Allow these origins:
// - production frontend
// - preview deployments for your project
// - localhost
const corsOptions: CorsOptions = {
  origin(origin, callback) {
    if (!origin) return callback(null, true); // non-browser or server-to-server

    // Match exact prod
    if (origin === "https://hrm-v2-frontend.vercel.app") return callback(null, true);

    // Match your preview URLs: https://hrm-v2-frontend-<slug>-software-engineering-hatechz.vercel.app
    try {
      const host = new URL(origin).host;
      const preview = /^hrm-v2-frontend-[a-z0-9-]+-software-engineering-hatechz\.vercel\.app$/i;
      if (preview.test(host)) return callback(null, true);
    } catch {}

    // Local dev
    if (
      origin === "http://localhost:3000" ||
      origin === "http://localhost:3001" ||
      origin === "http://localhost:5173" ||
      origin === "http://localhost:5174"
    ) {
      return callback(null, true);
    }

    return callback(new Error(`Not allowed by CORS: ${origin}`));
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(express.json());
app.use(cookieParser());

// CORS MUST be before routes; also explicitly enable preflight
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

app.use("/api/v2", router);

// Simple health checks
app.get("/", (_req: Request, res: Response) => {
  res.send("HRM_V2.0 Server is up");
});
app.get("/api", (_req: Request, res: Response) => {
  res.json({ ok: true });
});

// Error handlers
app.use(globalErrorHandler);
app.use(notFoundRoute);

export default app;
