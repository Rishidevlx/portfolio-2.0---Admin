import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

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

export async function GET() {
  try {
    const rows = await query("SELECT * FROM about_content LIMIT 1;");
    if (rows.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          heading: "About the Developer",
          biography: "I am Rishi, a Full Stack Developer specializing in architecting scalable web applications using the MERN stack (MongoDB, Express.js, React, Node.js).",
          resume_button_text: "Open My CV",
          resume_url: "/assets/Rishi_Resume.pdf",
          profile_image_url: ""
        }
      });
    }
    return NextResponse.json({ success: true, data: rows[0] });
  } catch (error) {
    console.error("GET About Error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch about content." }, { status: 500 });
  }
}

export async function POST(req) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) return NextResponse.json({ success: false, error: "Unauthorized." }, { status: 401 });

  try {
    const body = await req.json();
    const { heading, biography, resume_button_text, resume_url, profile_image_url } = body;

    const existing = await query("SELECT id FROM about_content LIMIT 1;");
    
    if (existing.length === 0) {
      await query(
        `INSERT INTO about_content (heading, biography, resume_button_text, resume_url, profile_image_url) VALUES (?, ?, ?, ?, ?)`,
        [heading, biography, resume_button_text, resume_url, profile_image_url]
      );
    } else {
      await query(
        `UPDATE about_content SET heading = ?, biography = ?, resume_button_text = ?, resume_url = ?, profile_image_url = ? WHERE id = ?`,
        [heading, biography, resume_button_text, resume_url, profile_image_url, existing[0].id]
      );
    }

    return NextResponse.json({ success: true, message: "About content successfully updated." });
  } catch (error) {
    console.error("POST About Error:", error);
    return NextResponse.json({ success: false, error: "Failed to save about content." }, { status: 500 });
  }
}
