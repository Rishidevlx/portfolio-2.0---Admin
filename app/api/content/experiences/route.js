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
    const rows = await query("SELECT * FROM experiences ORDER BY display_order ASC;");
    const data = rows.map(r => ({
      id: r.id,
      companyName: r.company_name,
      companyLink: r.company_link,
      companyLogo: r.company_logo_url,
      roles: typeof r.roles === 'string' ? JSON.parse(r.roles) : r.roles,
      skills: typeof r.skills === 'string' ? JSON.parse(r.skills) : r.skills,
      order: r.display_order
    }));
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: "Failed to fetch experiences." }, { status: 500 });
  }
}

export async function POST(request) {
  if (!(await verifyAdmin())) return NextResponse.json({ success: false, error: "Unauthorized." }, { status: 401 });
  
  try {
    const formData = await request.formData();
    const id = formData.get("id");
    const companyName = formData.get("companyName");
    const companyLink = formData.get("companyLink") || "#";
    const roles = formData.get("roles"); // JSON string
    const order = formData.get("order") || 0;
    const logoFile = formData.get("logo"); // Could be File or null
    const existingLogoUrl = formData.get("logoUrl"); // String from library

    if (!id || !companyName || (!logoFile && !existingLogoUrl)) {
      return NextResponse.json({ success: false, error: "Missing required fields." }, { status: 400 });
    }

    let companyLogo = existingLogoUrl;

    if (logoFile && logoFile instanceof Blob) {
      const arrayBuffer = await logoFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const uploadResult = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: "portfolio_experiences" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        uploadStream.end(buffer);
      });

      companyLogo = uploadResult.secure_url;
    }

    await query(
      "INSERT INTO experiences (id, company_name, company_link, company_logo_url, roles, skills, display_order) VALUES (?, ?, ?, ?, ?, ?, ?);",
      [id, companyName, companyLink, companyLogo, roles, "[]", order]
    );

    return NextResponse.json({ 
      success: true, 
      data: { id, companyName, companyLink, companyLogo, roles: JSON.parse(roles), skills: [], order: Number(order) } 
    });
  } catch (error) {
    console.error("Experience POST error:", error);
    return NextResponse.json({ success: false, error: "Failed to add experience." }, { status: 500 });
  }
}

export async function DELETE(request) {
  if (!(await verifyAdmin())) return NextResponse.json({ success: false, error: "Unauthorized." }, { status: 401 });
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    if (!id) return NextResponse.json({ success: false, error: "ID required." }, { status: 400 });
    
    await query("DELETE FROM experiences WHERE id=?;", [id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to delete experience." }, { status: 500 });
  }
}
