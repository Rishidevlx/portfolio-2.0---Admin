import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { query } from "@/lib/db";
import speakeasy from "speakeasy";

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password, totpCode } = body;

    if (!email || !password) {
      return NextResponse.json({ success: false, error: "Please enter both email and password." }, { status: 400 });
    }

    // 1. Initialize DB if empty (auto-migration from .env)
    await query(`
      CREATE TABLE IF NOT EXISTS admins (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        two_factor_secret VARCHAR(255),
        two_factor_enabled BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Auto-add 2FA columns if missing (migration)
    try { await query("ALTER TABLE admins ADD COLUMN two_factor_secret VARCHAR(255);"); } catch(e){}
    try { await query("ALTER TABLE admins ADD COLUMN two_factor_enabled BOOLEAN DEFAULT FALSE;"); } catch(e){}
    
    const users = await query("SELECT * FROM admins LIMIT 1;");
    if (users.length === 0) {
      const envEmail = process.env.ADMIN_EMAIL || "admin@rishi.com";
      const envPass = process.env.ADMIN_PASSWORD || "rishi4693";
      const hashedPass = await bcrypt.hash(envPass, 10);
      await query("INSERT INTO admins (email, password) VALUES (?, ?);", [envEmail, hashedPass]);
    }

    // 2. Fetch User
    const dbUsers = await query("SELECT * FROM admins WHERE email = ? LIMIT 1;", [email]);
    if (dbUsers.length === 0) {
      return NextResponse.json({ success: false, error: "Invalid email or password." }, { status: 401 });
    }

    const admin = dbUsers[0];
    const isMatch = await bcrypt.compare(password, admin.password);
    
    if (!isMatch) {
      return NextResponse.json({ success: false, error: "Invalid email or password." }, { status: 401 });
    }

    // 3. 2FA Check
    const is2faEnabled = admin.two_factor_enabled === 1 || admin.two_factor_enabled === true;
    if (is2faEnabled) {
      if (!totpCode) {
        return NextResponse.json({ success: true, requires2FA: true, message: "2FA code required." }, { status: 200 });
      }

      const verified = speakeasy.totp.verify({
        secret: admin.two_factor_secret,
        encoding: "base32",
        token: totpCode,
        window: 1
      });

      if (!verified) {
        return NextResponse.json({ success: false, error: "Invalid 2FA code." }, { status: 401 });
      }
    }

    // 4. Generate secure JWT token
    const jwtSecret = process.env.JWT_SECRET || "rishi_portfolio_super_secure_secret_key_2026_dev";
    const token = jwt.sign(
      { email: admin.email, id: admin.id },
      jwtSecret,
      { expiresIn: "8h" }
    );

    const response = NextResponse.json({ success: true, message: "Logged in successfully." }, { status: 200 });
    
    response.cookies.set({
      name: "admin_token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 8,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("❌ Authentication error in API Route:", error);
    return NextResponse.json({ success: false, error: "Internal server error. Please try again." }, { status: 500 });
  }
}

