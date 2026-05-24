import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import speakeasy from "speakeasy";
import QRCode from "qrcode";

// Internal helper: ensure admin table exists and sync env if empty
async function ensureAdminUser() {
  await query(`
    CREATE TABLE IF NOT EXISTS admin_users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      two_factor_secret VARCHAR(255),
      two_factor_enabled BOOLEAN DEFAULT FALSE
    );
  `);

  const existing = await query("SELECT * FROM admin_users LIMIT 1;");
  if (existing.length === 0) {
    const envEmail = process.env.ADMIN_EMAIL || "admin@rishi.com";
    const envPass = process.env.ADMIN_PASSWORD || "rishi4693";
    const hashedPass = await bcrypt.hash(envPass, 10);
    await query("INSERT INTO admin_users (email, password) VALUES (?, ?);", [envEmail, hashedPass]);
    return { email: envEmail, two_factor_enabled: false };
  }
  return existing[0];
}

async function verifyAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded;
  } catch {
    return null;
  }
}

export async function GET() {
  const decoded = await verifyAdmin();
  if (!decoded) return NextResponse.json({ success: false, error: "Unauthorized." }, { status: 401 });

  try {
    const adminUser = await ensureAdminUser();
    return NextResponse.json({ 
      success: true, 
      data: {
        email: adminUser.email,
        is2FAEnabled: adminUser.two_factor_enabled === 1 || adminUser.two_factor_enabled === true
      } 
    }, { status: 200 });
  } catch (error) {
    console.error("GET Admin Settings Error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch settings." }, { status: 500 });
  }
}

export async function POST(request) {
  const decoded = await verifyAdmin();
  if (!decoded) return NextResponse.json({ success: false, error: "Unauthorized." }, { status: 401 });

  try {
    const adminUser = await ensureAdminUser();
    const body = await request.json();
    const { action } = body;

    if (action === "update_email") {
      const { newEmail } = body;
      if (!newEmail) return NextResponse.json({ success: false, error: "Email required." }, { status: 400 });
      await query("UPDATE admin_users SET email = ? WHERE id = ?;", [newEmail, adminUser.id]);
      
      // Update JWT cookie with new email
      const jwtSecret = process.env.JWT_SECRET || "rishi_portfolio_super_secure_secret_key_2026_dev";
      const token = jwt.sign({ email: newEmail }, jwtSecret, { expiresIn: "8h" });
      const cookieStore = await cookies();
      cookieStore.set("admin_token", token, { httpOnly: true, path: "/", maxAge: 60*60*8 });

      return NextResponse.json({ success: true, message: "Email updated." }, { status: 200 });
    }

    if (action === "update_password") {
      const { currentPassword, newPassword } = body;
      const isMatch = await bcrypt.compare(currentPassword, adminUser.password);
      if (!isMatch) return NextResponse.json({ success: false, error: "Incorrect current password." }, { status: 400 });
      
      const hashedPass = await bcrypt.hash(newPassword, 10);
      await query("UPDATE admin_users SET password = ? WHERE id = ?;", [hashedPass, adminUser.id]);
      return NextResponse.json({ success: true, message: "Password updated." }, { status: 200 });
    }

    if (action === "setup_2fa") {
      // Generate secret
      const secret = speakeasy.generateSecret({ name: "Rishi CMS Admin" });
      // Generate QR code data URL
      const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);
      
      return NextResponse.json({ 
        success: true, 
        data: { 
          secret: secret.base32,
          qrCodeUrl 
        } 
      }, { status: 200 });
    }

    if (action === "verify_2fa") {
      const { token, secret } = body;
      const verified = speakeasy.totp.verify({
        secret: secret,
        encoding: "base32",
        token: token,
        window: 1 // Allow 30 seconds before/after
      });

      if (!verified) {
        return NextResponse.json({ success: false, error: "Invalid 2FA code." }, { status: 400 });
      }

      await query("UPDATE admin_users SET two_factor_secret = ?, two_factor_enabled = 1 WHERE id = ?;", [secret, adminUser.id]);
      return NextResponse.json({ success: true, message: "2FA successfully enabled." }, { status: 200 });
    }

    if (action === "disable_2fa") {
      await query("UPDATE admin_users SET two_factor_secret = NULL, two_factor_enabled = 0 WHERE id = ?;", [adminUser.id]);
      return NextResponse.json({ success: true, message: "2FA disabled." }, { status: 200 });
    }

    return NextResponse.json({ success: false, error: "Invalid action." }, { status: 400 });
  } catch (error) {
    console.error("POST Admin Settings Error:", error);
    return NextResponse.json({ success: false, error: "Internal server error." }, { status: 500 });
  }
}
