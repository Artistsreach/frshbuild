import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "@/db/schema";

// Create a connection pool with better error handling and timeout settings
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
  max: 10, // Reduce max connections to avoid overwhelming the database
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 5000, // Increase connection timeout to 5 seconds
  query_timeout: 10000, // Query timeout of 10 seconds
  statement_timeout: 10000, // Statement timeout of 10 seconds
});

// Handle pool errors
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  // Don't exit the process, just log the error
});

// Handle connection events
pool.on('connect', (client) => {
  console.log('Database client connected');
});

pool.on('remove', (client) => {
  console.log('Database client removed from pool');
});

export const db = drizzle(pool, { schema });

// Test the connection with retry logic
export async function testConnection(retries = 3): Promise<boolean> {
  for (let i = 0; i < retries; i++) {
    try {
      console.log(`Testing database connection (attempt ${i + 1}/${retries})`);
      await pool.query('SELECT NOW()');
      console.log('Database connection successful');
      return true;
    } catch (error) {
      console.error(`Database connection attempt ${i + 1} failed:`, error);
      if (i === retries - 1) {
        console.error('All database connection attempts failed');
        return false;
      }
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
  return false;
}
