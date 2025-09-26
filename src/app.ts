import express, { Application, Request, Response } from "express";
import cors from "cors";
import globalErrorHandler from "./app/middlewares/globalErrorHandler";
import notFoundRoute from "./app/middlewares/notFoundRoute";
import router from "./app/routes";
import cookieParser from "cookie-parser";

const app: Application = express();

app.use(express.json());
app.use(cors({
  origin: (origin, cb) => {
    const allowed = [
      "https://hrm-v2-frontend.vercel.app",
      "http://localhost:3000",
      "http://localhost:3001",
      "http://localhost:5173",
      "http://localhost:5174",
    ];
    // Allow all *.vercel.app previews for your frontend:
    const ok = !origin
      || allowed.includes(origin)
      || /\.vercel\.app$/.test(origin);

    cb(null, ok);
  },
  credentials: true,
}));
app.use(cookieParser());

app.use(`/api/v2`, router);

app.get("/", (req: Request, res: Response) => {
  res.send(`Wellcome to HRM_V2.0 Server 😎`);
});

// Global Error Handler.
app.use(globalErrorHandler);

// Not Found Router.
app.use(notFoundRoute);

export default app;
