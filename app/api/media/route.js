import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";

    let sql = "SELECT * FROM media_library ORDER BY created_at DESC;";
    let params = [];

    if (search) {
      sql = "SELECT * FROM media_library WHERE name LIKE ? ORDER BY created_at DESC;";
      params = [`%${search}%`];
    }

    const results = await query(sql, params);
    return NextResponse.json({ success: true, data: results });
  } catch (error) {
    console.error("GET /api/media error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch media" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");
    const name = formData.get("name") || "Untitled Media";
    const type = formData.get("type") || "image";

    if (!file) {
      return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: "portfolio_media_library", resource_type: "auto" },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(buffer);
    });

    const realUrl = uploadResult.secure_url;

    await query("INSERT INTO media_library (name, url, type) VALUES (?, ?, ?);", [name, realUrl, type]);
    
    // Fetch the newly inserted record to return it
    const newMedia = await query("SELECT * FROM media_library ORDER BY id DESC LIMIT 1;");

    return NextResponse.json({ success: true, data: newMedia[0] });
  } catch (error) {
    console.error("POST /api/media error:", error);
    return NextResponse.json({ success: false, error: "Failed to upload media" }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "ID is required" }, { status: 400 });
    }

    await query("DELETE FROM media_library WHERE id = ?;", [id]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/media error:", error);
    return NextResponse.json({ success: false, error: "Failed to delete media" }, { status: 500 });
  }
}
