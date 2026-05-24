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
    const { testimonials } = await request.json();
    if (!Array.isArray(testimonials)) {
      return NextResponse.json({ success: false, error: "Invalid data format." }, { status: 400 });
    }

    for (const t of testimonials) {
      await query(
        "UPDATE testimonials SET client_name=?, company=?, review=?, rating=?, platform=?, avatar_url=?, display_order=? WHERE id=?;",
        [t.clientName, t.company, t.review, t.rating, t.platform, t.avatarUrl, t.order, t.id]
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Testimonials Sync Error:", error);
    return NextResponse.json({ success: false, error: "Failed to sync testimonials." }, { status: 500 });
  }
}
