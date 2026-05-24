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
    const { projects } = await request.json();
    if (!Array.isArray(projects)) {
      return NextResponse.json({ success: false, error: "Invalid data format." }, { status: 400 });
    }

    for (const proj of projects) {
      await query(
        "UPDATE projects SET name=?, description=?, thumbnail_url=?, live_url=?, github_url=?, tech_stack=?, display_order=? WHERE id=?;",
        [proj.name, proj.description, proj.thumbnail, proj.liveUrl, proj.githubUrl, JSON.stringify(proj.techStack), proj.order, proj.id]
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Projects Sync Error:", error);
    return NextResponse.json({ success: false, error: "Failed to sync projects." }, { status: 500 });
  }
}
