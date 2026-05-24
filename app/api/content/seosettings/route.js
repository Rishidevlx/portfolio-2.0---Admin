import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

// Helper: verify admin JWT
async function verifyAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  if (!token) return false;
  try {
    jwt.verify(token, process.env.JWT_SECRET);
    return true;
  } catch {
    return false;
  }
}

// Ensure table exists
async function ensureTableExists() {
  await query(`
    CREATE TABLE IF NOT EXISTS seo_settings (
      id INT AUTO_INCREMENT PRIMARY KEY,
      meta_title VARCHAR(255),
      meta_description TEXT,
      og_image VARCHAR(512),
      keywords TEXT,
      sitemap VARCHAR(255),
      google_analytics_id VARCHAR(50),
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );
  `);
}

// GET — fetch seo settings
export async function GET() {
  try {
    await ensureTableExists();
    const rows = await query("SELECT * FROM seo_settings LIMIT 1;");
    if (rows.length === 0) {
      return NextResponse.json({ success: true, data: {} }, { status: 200 }); // return empty data if not exists
    }
    return NextResponse.json({ success: true, data: rows[0] }, { status: 200 });
  } catch (error) {
    console.error("❌ GET /api/content/seosettings error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch SEO settings." }, { status: 500 });
  }
}

// POST — update seo settings (admin only)
export async function POST(request) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) {
    return NextResponse.json({ success: false, error: "Unauthorized." }, { status: 401 });
  }

  try {
    await ensureTableExists();
    const body = await request.json();
    const { meta_title, meta_description, og_image, keywords, sitemap, google_analytics_id } = body;

    const existing = await query("SELECT id FROM seo_settings LIMIT 1;");

    if (existing.length > 0) {
      await query(
        `UPDATE seo_settings SET meta_title=?, meta_description=?, og_image=?, keywords=?, sitemap=?, google_analytics_id=? WHERE id=?;`,
        [meta_title || "", meta_description || "", og_image || "", keywords || "", sitemap || "", google_analytics_id || "", existing[0].id]
      );
    } else {
      await query(
        `INSERT INTO seo_settings (meta_title, meta_description, og_image, keywords, sitemap, google_analytics_id) VALUES (?, ?, ?, ?, ?, ?);`,
        [meta_title || "", meta_description || "", og_image || "", keywords || "", sitemap || "", google_analytics_id || ""]
      );
    }

    return NextResponse.json({ success: true, message: "SEO settings updated successfully." }, { status: 200 });
  } catch (error) {
    console.error("❌ POST /api/content/seosettings error:", error);
    return NextResponse.json({ success: false, error: "Failed to update SEO settings." }, { status: 500 });
  }
}
