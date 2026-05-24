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
    const { experiences } = await request.json();
    if (!Array.isArray(experiences)) {
      return NextResponse.json({ success: false, error: "Invalid data format." }, { status: 400 });
    }

    for (const exp of experiences) {
      await query(
        "UPDATE experiences SET roles=?, skills=?, display_order=? WHERE id=?;",
        [JSON.stringify(exp.roles), JSON.stringify(exp.skills), exp.order, exp.id]
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Experiences Sync Error:", error);
    return NextResponse.json({ success: false, error: "Failed to sync experiences." }, { status: 500 });
  }
}
