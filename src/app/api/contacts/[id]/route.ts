import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

// GET /api/contacts/[id] - Get a specific contact by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify user authentication
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Get contact by ID and verify ownership
    const { id } = await params;
    const contact = await prisma.contact.findFirst({
      where: {
        id,
        userId: decoded.id,
      },
    });

    if (!contact) {
      return NextResponse.json({ error: "Contact not found" }, { status: 404 });
    }

    return NextResponse.json({ contact });
  } catch (error) {
    console.error("Error fetching contact:", error);
    return NextResponse.json(
      { error: "Failed to fetch contact" },
      { status: 500 }
    );
  }
}

// PUT /api/contacts/[id] - Update a specific contact
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify user authentication
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const { name, address, group, events, contacts } = body;

    // Get the ID from params
    const { id } = await params;

    // Verify contact exists and belongs to user
    const existingContact = await prisma.contact.findFirst({
      where: {
        id,
        userId: decoded.id,
      },
    });

    if (!existingContact) {
      return NextResponse.json({ error: "Contact not found" }, { status: 404 });
    }

    // Update contact
    const updatedContact = await prisma.contact.update({
      where: {
        id,
      },
      data: {
        name,
        address,
        group,
        events,
        contacts,
      },
    });

    return NextResponse.json({ contact: updatedContact });
  } catch (error) {
    console.error("Error updating contact:", error);
    return NextResponse.json(
      { error: "Failed to update contact" },
      { status: 500 }
    );
  }
}

// DELETE /api/contacts/[id] - Delete a specific contact
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify user authentication
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Get the ID from params
    const { id } = await params;

    // Verify contact exists and belongs to user
    const existingContact = await prisma.contact.findFirst({
      where: {
        id,
        userId: decoded.id,
      },
    });

    if (!existingContact) {
      return NextResponse.json({ error: "Contact not found" }, { status: 404 });
    }

    // Delete contact
    await prisma.contact.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({ message: "Contact deleted successfully" });
  } catch (error) {
    console.error("Error deleting contact:", error);
    return NextResponse.json(
      { error: "Failed to delete contact" },
      { status: 500 }
    );
  }
}
