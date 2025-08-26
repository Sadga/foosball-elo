import type { Config } from 'drizzle-kit';
import { config } from 'dotenv';

config();

export default {
  schema: './db/schema/index.ts',
  out: './db/migrations',
  driver: 'libsql',
  breakpoints: false,
  strict: false,
  verbose: true
} satisfies Config;
