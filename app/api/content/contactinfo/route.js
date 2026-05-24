import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  try {
    const results = await query("SELECT * FROM contact_info LIMIT 1;");
    return NextResponse.json({ success: true, data: results[0] || {} });
  } catch (error) {
    console.error("GET /api/content/contactinfo error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch contact info" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { email, phone, location } = body;

    const results = await query("SELECT COUNT(*) as count FROM contact_info;");
    if (results[0].count === 0) {
      await query(
        "INSERT INTO contact_info (email, phone, location) VALUES (?, ?, ?);",
        [email || "", phone || "", location || ""]
      );
    } else {
      await query(
        "UPDATE contact_info SET email = ?, phone = ?, location = ? WHERE id = 1;",
        [email || "", phone || "", location || ""]
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("POST /api/content/contactinfo error:", error);
    return NextResponse.json({ success: false, error: "Failed to update contact info" }, { status: 500 });
  }
}
