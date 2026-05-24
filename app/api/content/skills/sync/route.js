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

export async function POST(request) {
  if (!(await verifyAdmin())) return NextResponse.json({ success: false, error: "Unauthorized." }, { status: 401 });
  
  try {
    const { skills } = await request.json();
    if (!Array.isArray(skills)) return NextResponse.json({ success: false, error: "Invalid data." }, { status: 400 });

    for (const skill of skills) {
      await query(
        "UPDATE skills SET category=?, is_visible=?, display_order=? WHERE id=?;",
        [skill.category, skill.isVisible ? 1 : 0, skill.order, skill.id]
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Skills sync error:", error);
    return NextResponse.json({ success: false, error: "Failed to sync skills." }, { status: 500 });
  }
}
