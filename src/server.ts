// src/server.ts
import mongoose from "mongoose";
import app from "./app";
import config from "./app/config";
import { Server } from "http";

let server: Server;

async function main() {
  try {
    await mongoose.connect(config.database_url as string);
    server = app.listen(config.port, () => {
      console.log(`HRM_V2.0 Server is running on port ${config.port}`);
    });
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

main();

process.on("unhandledRejection", (reason) => {
  console.error(`UnhandledRejection:`, reason);
  if (server) server.close(() => process.exit(1));
  else process.exit(1);
});

process.on("uncaughtException", (err) => {
  console.error(`UncaughtException:`, err);
  process.exit(1);
});
