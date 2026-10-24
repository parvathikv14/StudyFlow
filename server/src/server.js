import 'dotenv/config';
import app from './app.js';
import { connectDatabase } from './config/db.js';

const port = Number(process.env.PORT) || 5000;

try {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET must be set to a random string of at least 32 characters.');
  }
  await connectDatabase(process.env.MONGO_URI);
  app.listen(port, () => console.log(`StudyFlow API listening on port ${port}`));
} catch (error) {
  console.error(`Server startup failed: ${error.message}`);
  process.exitCode = 1;
}
