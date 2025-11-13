import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyTokenFromCookie } from "@/lib/serverAuth";

// GET /api/contacts - Get all contacts for the authenticated user
export async function GET() {
  try {
    // Verify user authentication
    const user = await verifyTokenFromCookie();
    if (!user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Get all contacts for the user
    const contacts = await prisma.contact.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return NextResponse.json({ contacts });
  } catch (error) {
    console.error("Error fetching contacts:", error);
    return NextResponse.json(
      { error: "Failed to fetch contacts" },
      { status: 500 }
    );
  }
}

// POST /api/contacts - Create a new contact
export async function POST(request: NextRequest) {
  try {
    // Verify user authentication
    const user = await verifyTokenFromCookie();
    if (!user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const { name, address, group, events, contacts } = body;

    // Validate required fields
    if (!name || !contacts || !contacts.phones || !contacts.emails) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create new contact
    const newContact = await prisma.contact.create({
      data: {
        userId: user.id,
        name,
        address,
        group,
        events,
        contacts,
      },
    });

    return NextResponse.json({ contact: newContact }, { status: 201 });
  } catch (error) {
    console.error("Error creating contact:", error);
    return NextResponse.json(
      { error: "Failed to create contact" },
      { status: 500 }
    );
  }
}
