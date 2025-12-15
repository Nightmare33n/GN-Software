import { NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";
import { getAuthenticatedUser } from "@/libs/auth";
import config from "@/config";

/**
 * POST /api/upload
 * Upload file to local storage (MVP) or AWS S3 (production)
 */
export async function POST(req) {
  try {
    // Require authentication
    const user = await getAuthenticatedUser();

    const formData = await req.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json(
        { error: "No file uploaded" },
        { status: 400 }
      );
    }

    // Validate file type
    if (!config.upload.allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: `File type ${file.type} not allowed` },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > config.upload.maxFileSize) {
      return NextResponse.json(
        { error: `File size exceeds ${config.upload.maxFileSize / 1024 / 1024}MB limit` },
        { status: 400 }
      );
    }

    // Get file buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique filename
    const timestamp = Date.now();
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const filename = `${timestamp}-${originalName}`;

    // Save to public/uploads directory (MVP - local storage)
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    const filepath = path.join(uploadDir, filename);

    await writeFile(filepath, buffer);

    // Return URL
    const url = `/uploads/${filename}`;

    return NextResponse.json({
      url,
      key: filename, // For potential S3 deletion later
      name: file.name,
      size: file.size,
      type: file.type,
    });
  } catch (error) {
    console.error("Error uploading file:", error);

    if (error.message === "Unauthorized - Please sign in") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}
