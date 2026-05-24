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
    const rows = await query("SELECT * FROM projects ORDER BY display_order ASC;");
    const data = rows.map(r => ({
      id: r.id,
      name: r.name,
      description: r.description,
      thumbnail: r.thumbnail_url,
      liveUrl: r.live_url,
      githubUrl: r.github_url,
      techStack: typeof r.tech_stack === 'string' ? JSON.parse(r.tech_stack) : r.tech_stack,
      order: r.display_order
    }));
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: "Failed to fetch projects." }, { status: 500 });
  }
}

export async function POST(request) {
  if (!(await verifyAdmin())) return NextResponse.json({ success: false, error: "Unauthorized." }, { status: 401 });
  
  try {
    const formData = await request.formData();
    const id = formData.get("id");
    const name = formData.get("name");
    const description = formData.get("description");
    const liveUrl = formData.get("liveUrl") || "";
    const githubUrl = formData.get("githubUrl") || "";
    const order = formData.get("order") || 0;
    const thumbnailFile = formData.get("thumbnail"); // Could be File or null
    const existingThumbnailUrl = formData.get("thumbnailUrl"); // String from library

    if (!id || !name || (!thumbnailFile && !existingThumbnailUrl)) {
      return NextResponse.json({ success: false, error: "Missing required fields." }, { status: 400 });
    }

    let thumbnailUrl = existingThumbnailUrl;

    if (thumbnailFile && thumbnailFile instanceof Blob) {
      const arrayBuffer = await thumbnailFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const uploadResult = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: "portfolio_projects" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        uploadStream.end(buffer);
      });

      thumbnailUrl = uploadResult.secure_url;
    }

    await query(
      "INSERT INTO projects (id, name, description, thumbnail_url, live_url, github_url, tech_stack, display_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?);",
      [id, name, description, thumbnailUrl, liveUrl, githubUrl, "[]", order]
    );

    return NextResponse.json({ 
      success: true, 
      data: { id, name, description, thumbnail: thumbnailUrl, liveUrl, githubUrl, techStack: [], order: Number(order) } 
    });
  } catch (error) {
    console.error("Project POST error:", error);
    return NextResponse.json({ success: false, error: "Failed to add project." }, { status: 500 });
  }
}

export async function DELETE(request) {
  if (!(await verifyAdmin())) return NextResponse.json({ success: false, error: "Unauthorized." }, { status: 401 });
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    if (!id) return NextResponse.json({ success: false, error: "ID required." }, { status: 400 });
    
    await query("DELETE FROM projects WHERE id=?;", [id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to delete project." }, { status: 500 });
  }
}
