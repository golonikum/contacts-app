import { NextResponse } from "next/server";
import { verifyTokenFromCookie } from "@/lib/serverAuth";
import { prisma } from "@/lib/db";

export async function DELETE() {
  try {
    // Verify user authentication
    const user = await verifyTokenFromCookie();
    if (!user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Delete all contacts for this user
    await prisma.contact.deleteMany({
      where: {
        userId: user.id,
      },
    });

    return NextResponse.json({
      message: "All contacts deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting all contacts:", error);
    return NextResponse.json(
      { error: "Failed to delete contacts" },
      { status: 500 }
    );
  }
}
