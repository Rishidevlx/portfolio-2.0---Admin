const mysql = require('mysql2/promise');

async function checkDb() {
  const dbConfig = {
    host: 'gateway01.ap-southeast-1.prod.aws.tidbcloud.com',
    port: 4000,
    user: '4K8bhHm6EmGrFmi.root',
    password: 'LUWwPzCV0HxRhoUb',
    database: 'portfolio_admin_db',
    ssl: { minVersion: "TLSv1.2", rejectUnauthorized: false }
  };

  try {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.query("SELECT id, email, password FROM admin_users;");
    console.log("Admin Users in DB:");
    console.log(rows);
    
    // Check about admins table as well
    const [adminsRows] = await connection.query("SELECT id, email, password FROM admins;");
    console.log("Admins Table:");
    console.log(adminsRows);
    
    await connection.end();
  } catch (err) {
    console.error(err);
  }
}

checkDb();
