import { query } from "./lib/db.js";

async function run() {
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS testimonials (
        id VARCHAR(255) PRIMARY KEY,
        client_name VARCHAR(255) NOT NULL,
        company VARCHAR(255),
        review TEXT NOT NULL,
        rating INT DEFAULT 5,
        platform VARCHAR(255),
        avatar_url VARCHAR(500),
        display_order INT DEFAULT 0
      );
    `);
    console.log("Success: Created testimonials table");
  } catch (err) {
    console.error("Failed to create testimonials table:", err);
  }
  process.exit(0);
}

run();
