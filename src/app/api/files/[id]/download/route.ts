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

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user from database to check role
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });


    const fileId = (await params).id;
    if (!fileId) {
      return NextResponse.json({ error: "File ID is required" }, { status: 400 });
    }

    // Get file from database
    const file = await db.file.findUnique({
      where: { id: fileId },
      select: {
        userId: true,
        data: true,
        filename: true,
        mimeType: true,
        sizeBytes: true,
      },
    });

    if (!file) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }


    if (user?.role !== "ADMIN" && file.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Convert the file data to a Buffer
    const fileBuffer = Buffer.from(file.data);

    // Set appropriate headers for file download
    const headers = new Headers();
    headers.set("Content-Type", file.mimeType ?? "application/octet-stream");
    headers.set("Content-Length", file.sizeBytes.toString());
    headers.set("Content-Disposition", `attachment; filename="${file.filename}"`);
    headers.set("Cache-Control", "no-cache");

    // Return the file as a response
    return new NextResponse(fileBuffer, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error("Error downloading file:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
