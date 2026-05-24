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

// GET — fetch about content
export async function GET() {
  try {
    const rows = await query("SELECT * FROM about_content LIMIT 1;");
    if (rows.length === 0) {
      return NextResponse.json({ success: false, error: "No about content found." }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: rows[0] }, { status: 200 });
  } catch (error) {
    console.error("❌ GET /api/content/about error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch about content." }, { status: 500 });
  }
}

// POST — update about content (admin only)
export async function POST(request) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) {
    return NextResponse.json({ success: false, error: "Unauthorized." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { heading, description, resume_btn_text, resume_link, profile_image_url } = body;

    if (!heading || !description || !resume_btn_text || !resume_link) {
      return NextResponse.json({ success: false, error: "All fields are required." }, { status: 400 });
    }

    // Check if a row exists
    const existing = await query("SELECT id FROM about_content LIMIT 1;");

    if (existing.length > 0) {
      await query(
        `UPDATE about_content SET heading=?, description=?, resume_btn_text=?, resume_link=?, profile_image_url=? WHERE id=?;`,
        [heading, description, resume_btn_text, resume_link, profile_image_url || existing[0].profile_image_url, existing[0].id]
      );
    } else {
      await query(
        `INSERT INTO about_content (heading, description, resume_btn_text, resume_link, profile_image_url) VALUES (?, ?, ?, ?, ?);`,
        [heading, description, resume_btn_text, resume_link, profile_image_url || ""]
      );
    }

    return NextResponse.json({ success: true, message: "About content updated successfully." }, { status: 200 });
  } catch (error) {
    console.error("❌ POST /api/content/about error:", error);
    return NextResponse.json({ success: false, error: "Failed to update about content." }, { status: 500 });
  }
}
