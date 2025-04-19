import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

// Use the provided Neon database connection string from the screenshot
const DATABASE_URL = 'postgresql://neondb_owner:npg_rGmYDzhSJ91T@ep-muddy-brook-a4zqcmq3-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require';

export const pool = new Pool({ connectionString: DATABASE_URL });
export const db = drizzle(pool, { schema });