import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { db } from "~/server/db";
import { auth } from "~/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication using Better Auth
    const session = await auth.api.getSession({
      headers: request.headers
    });

    // if (!session?.user?.id) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // }

    const fileId = (await params).id;
    if (!fileId) {
      return NextResponse.json({ error: "File ID is required" }, { status: 400 });
    }

    // Get file from database with blog post information
    const file = await db.file.findUnique({
      where: { id: fileId },
      select: {
        userId: true,
        data: true,
        filename: true,
        mimeType: true,
        sizeBytes: true,
        type: true,
        blogPost: {
          select: {
            id: true,
            published: true,
            authorId: true,
          },
        },
      },
    });

    if (!file) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    // Check if it's a blog image
    if (file.type !== "BLOG_IMAGE") {
      return NextResponse.json({ error: "File is not a blog image" }, { status: 400 });
    }


    // Convert the file data to a Buffer
    const fileBuffer = Buffer.from(file.data);

    // Set appropriate headers for image display
    const headers = new Headers();
    headers.set("Content-Type", file.mimeType ?? "image/jpeg");
    headers.set("Content-Length", file.sizeBytes.toString());
    headers.set("Cache-Control", "public, max-age=31536000"); // Cache for 1 year
    headers.set("Content-Disposition", `inline; filename="${file.filename}"`);

    // Return the file as a response
    return new NextResponse(fileBuffer, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error("Error serving blog image:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
