import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { db } from "~/server/db";
import { auth } from "~/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    // Check authentication using Better Auth
    const session = await auth.api.getSession({
      headers: request.headers
    });

    console.log("session", session);

    // if (!session?.user?.id) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // }

    const userId = (await params).userId;
    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    // Get the user's profile image file
    const profileImageFile = await db.file.findFirst({
      where: {
        userId: userId,
        type: "PROFILE_IMAGE",
      },
      select: {
        data: true,
        filename: true,
        mimeType: true,
        sizeBytes: true,
      },
      orderBy: {
        createdAt: "desc", // Get the most recent profile image
      },
    });

    if (!profileImageFile) {
      return NextResponse.json({ error: "Profile image not found" }, { status: 404 });
    }

    // Convert the file data to a Buffer
    const fileBuffer = Buffer.from(profileImageFile.data);

    // Set appropriate headers for image display
    const headers = new Headers();
    headers.set("Content-Type", profileImageFile.mimeType ?? "image/jpeg");
    headers.set("Content-Length", profileImageFile.sizeBytes.toString());
    headers.set("Cache-Control", "public, max-age=1"); // Cache for 1 hour
    headers.set("Content-Disposition", `inline; filename="${profileImageFile.filename}"`);

    // Return the image as a response
    return new NextResponse(fileBuffer, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error("Error fetching profile image:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
