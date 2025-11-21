import { Server } from 'http';
import app from './app';
import config from './app/config';
import connectDB from './db';

let server: Server;

async function main() {
  try {
    await connectDB();
    server = app.listen(config.port, () => {
      console.log(`HRM_V2.0 Server is running on port ${config.port}`);
    });
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

// Only start HTTP server when not on Vercel
if (!process.env.VERCEL) {
  main();
}

process.on('unhandledRejection', (reason) => {
  console.error('UnhandledRejection:', reason);
  if (server) server.close(() => process.exit(1));
  else process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.error('UncaughtException:', err);
  process.exit(1);
});
