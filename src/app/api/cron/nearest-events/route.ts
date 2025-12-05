import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { Contact } from "@/types/contact";
import { getNearestEvents } from "@/lib/contactHelpers";

// This endpoint should be called by a cron job
export async function GET(req: NextRequest) {
  try {
    if (
      req.headers.get("Authorization") !== `Bearer ${process.env.CRON_SECRET}`
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all contacts for the user
    const contacts = await prisma.contact.findMany({
      // TODO: делать рассылку для всех пользователей
      // where: {
      //   userId: user.id,
      // },
      orderBy: {
        updatedAt: "desc",
      },
    });

    const { upcomingEvents, today } = getNearestEvents(
      contacts as any as Contact[]
    );

    // If no upcoming events, return early
    if (upcomingEvents.length === 0) {
      return NextResponse.json({
        message: "No upcoming events in the next week",
        eventsCount: 0,
      });
    }

    // Format events for email
    const eventsList = upcomingEvents
      .map(
        (event) =>
          `<li style="${
            event.eventDate.valueOf() === today.valueOf() ? "color: red" : ""
          }"><strong>${event.shortDateStr}</strong>: ${event.contactName}, ${
            event.eventDescription
          }</li>`
      )
      .join("");

    // Create email content
    const emailContent = `
      <html>
        <body style="font-family: monospace !important">
          <h2>Предстоящие события</h2>
          <ul>
            ${eventsList}
          </ul>
        </body>
      </html>
    `;

    // Send email
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: process.env.RESEND_FROM_EMAIL || "Acme <onboarding@resend.dev>",
        to: [process.env.ADMIN_EMAIL],
        subject: `Предстоящие события (${upcomingEvents.length})`,
        html: emailContent,
      }),
    });

    return NextResponse.json({
      message: "Email sent successfully",
      res: res,
      eventsCount: upcomingEvents.length,
    });
  } catch (error) {
    console.error("Error in nearest events cron:", error);
    return NextResponse.json(
      { error: "Failed to process nearest events" },
      { status: 500 }
    );
  }
}
