import { query } from "../lib/db.js";

async function run() {
  try {
    await query("ALTER TABLE skills ADD COLUMN link_url VARCHAR(500) DEFAULT '#';");
    console.log("Success: Added link_url column");
  } catch (err) {
    if (err.code === 'ER_DUP_FIELDNAME') {
      console.log("Column link_url already exists.");
    } else {
      console.error(err);
    }
  }
  process.exit(0);
}

run();
