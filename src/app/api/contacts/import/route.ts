import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyTokenFromCookie } from "@/lib/serverAuth";

export async function POST(request: NextRequest) {
  try {
    // Verify user is authenticated
    const user = await verifyTokenFromCookie();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const contacts = await request.json();

    if (!Array.isArray(contacts)) {
      return NextResponse.json(
        { error: "Contacts must be an array" },
        { status: 400 }
      );
    }

    // Create all contacts
    const createdContacts = await Promise.all(
      contacts.map(async (contact) => {
        return await prisma.contact.create({
          data: {
            userId: user.id,
            name: contact.name,
            address: contact.address,
            group: contact.group,
            events: contact.events || {},
            // TODO: пока убрал контакты для безопасности
            contacts: { phones: [], emails: [] },
          },
        });
      })
    );

    return NextResponse.json({
      message: "Contacts created successfully",
      contacts: createdContacts,
    });
  } catch (error) {
    console.error("Error creating contacts:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
