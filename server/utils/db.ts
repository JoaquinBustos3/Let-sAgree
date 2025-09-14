import { Pool } from "pg";
import loggerInit from "../logger/index";

const logger = loggerInit("utils/db.ts");
const isRender = process.env.DATABASE_URL?.includes("render.com");

const pool = new Pool({ 
    connectionString: process.env.DATABASE_URL,
    ssl: isRender
    ? { rejectUnauthorized: false } // needed for Render Postgres
    : undefined 
});

// Export the pool so other modules can reuse it
export { pool };

// Helper to increment a metric
export async function incrementMetric(metricName: string) {
  try {
    await pool.query(
      "UPDATE metrics SET value = value + 1 WHERE metric_name = $1",
      [metricName]
    );
  } catch (err) {
    logger.error("Error incrementing metric: ", err);
  }
}
