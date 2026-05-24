import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function verifyAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  if (!token) return false;
  try { jwt.verify(token, process.env.JWT_SECRET); return true; } catch { return false; }
}

export async function GET() {
  try {
    const rows = await query("SELECT id, name, category, icon_url as iconUrl, link_url as linkUrl, is_visible as isVisible, display_order as `order` FROM skills ORDER BY display_order ASC;");
    return NextResponse.json({ success: true, data: rows.map(r => ({...r, isVisible: Boolean(r.isVisible)})) });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to fetch skills." }, { status: 500 });
  }
}

export async function POST(request) {
  if (!(await verifyAdmin())) return NextResponse.json({ success: false, error: "Unauthorized." }, { status: 401 });
  
  try {
    const formData = await request.formData();
    const name = formData.get("name");
    const category = formData.get("category");
    const iconFile = formData.get("icon"); // Could be File or null
    const existingIconUrl = formData.get("iconUrl"); // Could be a string URL from Media Library
    const linkUrl = formData.get("linkUrl") || "#";
    const order = formData.get("order") || 0;

    if (!name || !category || (!iconFile && !existingIconUrl)) {
      return NextResponse.json({ success: false, error: "Missing required fields." }, { status: 400 });
    }

    let iconUrl = existingIconUrl;

    if (iconFile && iconFile instanceof Blob) {
      const arrayBuffer = await iconFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

      const uploadResult = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: "portfolio_skills" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        uploadStream.end(buffer);
      });

      iconUrl = uploadResult.secure_url;
    }

    const result = await query(
      "INSERT INTO skills (name, category, icon_url, link_url, is_visible, display_order) VALUES (?, ?, ?, ?, ?, ?);",
      [name, category, iconUrl, linkUrl, true, order]
    );

    return NextResponse.json({ 
      success: true, 
      data: { id: result.insertId.toString(), name, category, iconUrl, linkUrl, isVisible: true, order: Number(order) } 
    });
  } catch (error) {
    console.error("Skills POST error:", error);
    return NextResponse.json({ success: false, error: "Failed to add skill." }, { status: 500 });
  }
}

export async function DELETE(request) {
  if (!(await verifyAdmin())) return NextResponse.json({ success: false, error: "Unauthorized." }, { status: 401 });
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    if (!id) return NextResponse.json({ success: false, error: "ID required." }, { status: 400 });
    
    await query("DELETE FROM skills WHERE id=?;", [id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to delete skill." }, { status: 500 });
  }
}
