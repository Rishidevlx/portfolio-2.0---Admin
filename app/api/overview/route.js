import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

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
    // Note: Wrapping in try-catch in case tables don't exist yet
    let totalSkills = 0;
    let totalProjects = 0;
    let totalExperiences = 0;

    try {
      const skillRes = await query("SELECT COUNT(*) as count FROM skills");
      totalSkills = skillRes[0].count;
    } catch {}

    try {
      const projRes = await query("SELECT COUNT(*) as count FROM projects");
      totalProjects = projRes[0].count;
    } catch {}

    try {
      const expRes = await query("SELECT COUNT(*) as count FROM experiences");
      totalExperiences = expRes[0].count;
    } catch {}

    return NextResponse.json({ 
      success: true, 
      data: {
        totalSkills,
        totalProjects,
        totalExperiences
      } 
    }, { status: 200 });

  } catch (error) {
    console.error("Overview Stats Error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch overview stats." }, { status: 500 });
  }
}
