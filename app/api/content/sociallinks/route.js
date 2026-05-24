import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  try {
    const results = await query("SELECT * FROM social_links LIMIT 1;");
    return NextResponse.json({ success: true, data: results[0] || {} });
  } catch (error) {
    console.error("GET /api/content/sociallinks error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch social links" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { linkedin, github, mail, whatsapp, mobile } = body;

    const results = await query("SELECT COUNT(*) as count FROM social_links;");
    if (results[0].count === 0) {
      await query(
        "INSERT INTO social_links (linkedin, github, mail, whatsapp, mobile) VALUES (?, ?, ?, ?, ?);",
        [linkedin || "", github || "", mail || "", whatsapp || "", mobile || ""]
      );
    } else {
      await query(
        "UPDATE social_links SET linkedin = ?, github = ?, mail = ?, whatsapp = ?, mobile = ? WHERE id = 1;",
        [linkedin || "", github || "", mail || "", whatsapp || "", mobile || ""]
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("POST /api/content/sociallinks error:", error);
    return NextResponse.json({ success: false, error: "Failed to update social links" }, { status: 500 });
  }
}
