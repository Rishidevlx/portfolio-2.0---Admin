import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

async function verifyAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  if (!token) return false;
  try { jwt.verify(token, process.env.JWT_SECRET); return true; } catch { return false; }
}

export async function GET() {
  try {
    const rows = await query("SELECT * FROM skill_categories ORDER BY display_order ASC;");
    return NextResponse.json({ success: true, data: rows.map(r => r.name) });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to fetch categories." }, { status: 500 });
  }
}

export async function POST(request) {
  if (!(await verifyAdmin())) return NextResponse.json({ success: false, error: "Unauthorized." }, { status: 401 });
  try {
    const { name } = await request.json();
    if (!name) return NextResponse.json({ success: false, error: "Name required." }, { status: 400 });
    
    const rows = await query("SELECT MAX(display_order) as maxOrder FROM skill_categories;");
    const newOrder = (rows[0].maxOrder || 0) + 1;
    
    await query("INSERT INTO skill_categories (name, display_order) VALUES (?, ?);", [name, newOrder]);
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') return NextResponse.json({ success: false, error: "Category already exists." }, { status: 400 });
    return NextResponse.json({ success: false, error: "Failed to add category." }, { status: 500 });
  }
}
