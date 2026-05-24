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

async function ensureTableExists() {
  await query(`
    CREATE TABLE IF NOT EXISTS testimonials (
      id VARCHAR(255) PRIMARY KEY,
      client_name VARCHAR(255) NOT NULL,
      company VARCHAR(255),
      review TEXT NOT NULL,
      rating INT DEFAULT 5,
      platform VARCHAR(255),
      avatar_url VARCHAR(500),
      display_order INT DEFAULT 0
    );
  `);
}

export async function GET() {
  try {
    await ensureTableExists();
    const rows = await query("SELECT * FROM testimonials ORDER BY display_order ASC;");
    const data = rows.map(r => ({
      id: r.id,
      clientName: r.client_name,
      company: r.company,
      review: r.review,
      rating: r.rating,
      platform: r.platform,
      avatarUrl: r.avatar_url,
      order: r.display_order
    }));
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Testimonials GET error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch testimonials." }, { status: 500 });
  }
}

import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request) {
  if (!(await verifyAdmin())) return NextResponse.json({ success: false, error: "Unauthorized." }, { status: 401 });
  
  try {
    const formData = await request.formData();
    const id = formData.get("id");
    const clientName = formData.get("clientName");
    const company = formData.get("company") || "";
    const review = formData.get("review");
    const rating = formData.get("rating") || 5;
    const platform = formData.get("platform") || "";
    const order = formData.get("order") || 0;
    const avatarFile = formData.get("avatar"); // Could be File or null
    const existingAvatarUrl = formData.get("avatarUrl"); // String from library

    if (!id || !clientName || !review) {
      return NextResponse.json({ success: false, error: "Missing required fields." }, { status: 400 });
    }

    let avatarUrl = existingAvatarUrl || null;

    if (avatarFile && avatarFile instanceof Blob) {
      const arrayBuffer = await avatarFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const uploadResult = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: "portfolio_testimonials" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        uploadStream.end(buffer);
      });
      avatarUrl = uploadResult.secure_url;
    }

    await query(
      "INSERT INTO testimonials (id, client_name, company, review, rating, platform, avatar_url, display_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?);",
      [id, clientName, company, review, rating, platform, avatarUrl, order]
    );

    return NextResponse.json({ 
      success: true, 
      data: { id, clientName, company, review, rating: Number(rating), platform, avatarUrl, order: Number(order) } 
    });
  } catch (error) {
    console.error("Testimonials POST error:", error);
    return NextResponse.json({ success: false, error: "Failed to add testimonial." }, { status: 500 });
  }
}

export async function DELETE(request) {
  if (!(await verifyAdmin())) return NextResponse.json({ success: false, error: "Unauthorized." }, { status: 401 });
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    if (!id) return NextResponse.json({ success: false, error: "ID required." }, { status: 400 });
    
    await query("DELETE FROM testimonials WHERE id=?;", [id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to delete testimonial." }, { status: 500 });
  }
}
