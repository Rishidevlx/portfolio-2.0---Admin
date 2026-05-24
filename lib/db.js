import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";

const dbConfig = {
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || "4000"),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: {
    minVersion: "TLSv1.2",
    rejectUnauthorized: false, // Ensures connection succeeds on standard cloud environments
  },
};

// Singleton pool instance
let pool;

export async function getDbPool() {
  if (pool) return pool;

  try {
    const dbName = process.env.DB_NAME || "portfolio_admin_db";
    console.log(`🔌 TiDB Cloud: Connecting to database cluster on gateway01.ap-southeast-1.prod.aws.tidbcloud.com...`);
    
    // 1. Establish connection to check/create database first
    const connection = await mysql.createConnection(dbConfig);
    
    // 2. Create database if it does not exist
    console.log(`🔨 TiDB Cloud: Ensuring database "${dbName}" exists...`);
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
    await connection.end();

    // 3. Create the standard connection pool with the database specified
    pool = mysql.createPool({
      ...dbConfig,
      database: dbName,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });

    console.log(`🎉 TiDB Cloud: Connection pool initialized successfully for "${dbName}".`);

    // 4. Initialize tables and seed initial admin data
    await initializeDatabase();

    return pool;
  } catch (error) {
    console.error("❌ TiDB Cloud: Database connection/initialization failed:", error.message);
    throw error;
  }
}

async function initializeDatabase() {
  const activePool = pool;
  
  // 1. Create Admins Table if it doesn't exist
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS admins (
      id INT AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  await activePool.query(createTableQuery);
  console.log("✅ Admins table verified/created in TiDB.");

  // 2. Check if there are any admins registered
  const [rows] = await activePool.query("SELECT COUNT(*) as count FROM admins;");
  
  if (rows[0].count === 0) {
    // Seed default admin account from .env variables
    const defaultEmail = process.env.ADMIN_EMAIL || "admin@rishi.com";
    const defaultPassword = process.env.ADMIN_PASSWORD || "adminpassword";
    
    // Hash password securely with bcrypt
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(defaultPassword, salt);
    
    await activePool.query(
      "INSERT INTO admins (email, password) VALUES (?, ?);",
      [defaultEmail, hashedPassword]
    );
    
    console.log("✨ Seeded default admin user in TiDB:");
    console.log(`   📧 Email: ${defaultEmail}`);
    console.log(`   🔑 Password: ${defaultPassword}`);
  }

  // 3. Create About Content Table
  await activePool.query(`
    CREATE TABLE IF NOT EXISTS about_content (
      id INT AUTO_INCREMENT PRIMARY KEY,
      heading VARCHAR(255) NOT NULL DEFAULT 'Behind the Developer',
      description TEXT NOT NULL,
      resume_btn_text VARCHAR(100) NOT NULL DEFAULT 'Open my CV',
      resume_link VARCHAR(500) NOT NULL DEFAULT '/assets/Rishi_Resume.pdf',
      profile_image_url VARCHAR(500) NOT NULL DEFAULT './assets/images/about/Rishi Proffess pic.png',
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );
  `);
  console.log("✅ About content table verified/created in TiDB.");

  // 4. Seed default about content if empty
  const [aboutRows] = await activePool.query("SELECT COUNT(*) as count FROM about_content;");
  if (aboutRows[0].count === 0) {
    await activePool.query(`
      INSERT INTO about_content (heading, description, resume_btn_text, resume_link, profile_image_url)
      VALUES (?, ?, ?, ?, ?);
    `, [
      "Behind the Developer",
      "I am Rishi, a Full-Stack Developer specializing in architecting scalable web applications using the MERN stack (MongoDB, Express.js, React, Node.js). I engineer responsive frontends, RESTful APIs, and robust backend systems. I am also proficient in Python for backend development and automation workflows.",
      "Open my CV",
      "/assets/Rishi_Resume.pdf",
      "./assets/images/about/Rishi Proffess pic.png"
    ]);
    console.log("✨ Seeded default About content in TiDB.");
  }

  // 5. Create Skill Categories Table
  await activePool.query(`
    CREATE TABLE IF NOT EXISTS skill_categories (
      name VARCHAR(100) PRIMARY KEY,
      display_order INT DEFAULT 0
    );
  `);
  console.log("✅ Skill Categories table verified/created in TiDB.");

  // Seed default categories
  const [catRows] = await activePool.query("SELECT COUNT(*) as count FROM skill_categories;");
  if (catRows[0].count === 0) {
    const defaultCats = ["Frontend", "Backend", "Database", "Tools", "Testing", "Design", "Other"];
    for (let i = 0; i < defaultCats.length; i++) {
      await activePool.query("INSERT INTO skill_categories (name, display_order) VALUES (?, ?);", [defaultCats[i], i]);
    }
    console.log("✨ Seeded default skill categories in TiDB.");
  }

  // 6. Create Skills Table
  await activePool.query(`
    CREATE TABLE IF NOT EXISTS skills (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      category VARCHAR(100) NOT NULL,
      icon_url VARCHAR(500) NOT NULL,
      link_url VARCHAR(500) DEFAULT '#',
      is_visible BOOLEAN DEFAULT TRUE,
      display_order INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
  
  // Add link_url column if it doesn't exist (for existing tables)
  try {
    await activePool.query("ALTER TABLE skills ADD COLUMN link_url VARCHAR(500) DEFAULT '#';");
    console.log("✅ Added link_url column to skills table.");
  } catch (err) {
    if (err.code !== 'ER_DUP_FIELDNAME') {
      console.log("ℹ️ link_url column already exists or error:", err.message);
    }
  }

  console.log("✅ Skills table verified/created in TiDB.");

  // 7. Create Experiences Table
  await activePool.query(`
    CREATE TABLE IF NOT EXISTS experiences (
      id VARCHAR(100) PRIMARY KEY,
      company_name VARCHAR(255) NOT NULL,
      company_link VARCHAR(500) DEFAULT '#',
      company_logo_url VARCHAR(500) NOT NULL,
      roles JSON NOT NULL,
      skills JSON NOT NULL,
      display_order INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
  console.log("✅ Experiences table verified/created in TiDB.");

  // 8. Create Projects Table
  await activePool.query(`
    CREATE TABLE IF NOT EXISTS projects (
      id VARCHAR(100) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description TEXT NOT NULL,
      thumbnail_url VARCHAR(500) NOT NULL,
      live_url VARCHAR(500) DEFAULT '',
      github_url VARCHAR(500) DEFAULT '',
      tech_stack JSON NOT NULL,
      display_order INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
  console.log("✅ Projects table verified/created in TiDB.");

  // 9. Create Social Links Table
  await activePool.query(`
    CREATE TABLE IF NOT EXISTS social_links (
      id INT AUTO_INCREMENT PRIMARY KEY,
      linkedin VARCHAR(500) DEFAULT '',
      github VARCHAR(500) DEFAULT '',
      mail VARCHAR(500) DEFAULT '',
      whatsapp VARCHAR(500) DEFAULT '',
      mobile VARCHAR(100) DEFAULT '',
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );
  `);
  console.log("✅ Social Links table verified/created in TiDB.");

  const [socialRows] = await activePool.query("SELECT COUNT(*) as count FROM social_links;");
  if (socialRows[0].count === 0) {
    await activePool.query("INSERT INTO social_links (linkedin, github, mail, whatsapp, mobile) VALUES (?, ?, ?, ?, ?)", ["", "", "", "", ""]);
    console.log("✨ Seeded default Social Links in TiDB.");
  }

  // 10. Create Contact Info Table
  await activePool.query(`
    CREATE TABLE IF NOT EXISTS contact_info (
      id INT AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(255) DEFAULT '',
      phone VARCHAR(100) DEFAULT '',
      location TEXT,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );
  `);
  console.log("✅ Contact Info table verified/created in TiDB.");

  const [contactRows] = await activePool.query("SELECT COUNT(*) as count FROM contact_info;");
  if (contactRows[0].count === 0) {
    await activePool.query("INSERT INTO contact_info (email, phone, location) VALUES (?, ?, ?)", ["", "", ""]);
    console.log("✨ Seeded default Contact Info in TiDB.");
  }

  // 11. Create Media Library Table
  await activePool.query(`
    CREATE TABLE IF NOT EXISTS media_library (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      url VARCHAR(500) NOT NULL,
      type VARCHAR(50) DEFAULT 'image',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
  console.log("✅ Media Library table verified/created in TiDB.");
}

// Helper query function for ease of use in API routes
export async function query(sql, params) {
  const activePool = await getDbPool();
  try {
    const [results] = await activePool.query(sql, params);
    return results;
  } catch (error) {
    console.error("❌ Query execution failed:", error);
    throw error;
  }
}
