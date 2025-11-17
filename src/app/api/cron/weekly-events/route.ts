import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { Contact } from "@/types/contact";
import { formatYearsInRussian } from "@/lib/formatYearsInRussian";

// This endpoint should be called by a cron job weekly
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

    // Get current date and date one week from now
    const today = new Date();
    const year = today.getFullYear();
    today.setHours(0, 0, 0, 0); // Set to start of day
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 14);

    // Collect events happening in the next week
    const upcomingEvents: Array<{
      contactName: string;
      eventDate: Date;
      dateStr: string;
      eventDescription: string;
    }> = [];

    (contacts as any as Contact[]).forEach((contact) => {
      if (contact.events) {
        Object.entries(contact.events).forEach(([description, dateStr]) => {
          // Parse date in DD.MM.YYYY format
          const [day, month, yearFromEvent] = dateStr.split(".");
          const eventDate = new Date(year, parseInt(month) - 1, parseInt(day));
          const eventYear = yearFromEvent ? parseInt(yearFromEvent) : year;
          const howManyYears = year - eventYear;

          // Check if event is in the upcoming week
          if (eventDate >= today && eventDate <= nextWeek) {
            upcomingEvents.push({
              contactName: `${contact.name.lastName} ${
                contact.name.firstName
              } ${contact.name.middleName || ""}`,
              dateStr: dateStr,
              eventDate,
              eventDescription: `${description}${
                howManyYears ? ` (${formatYearsInRussian(howManyYears)})` : ""
              }`,
            });
          }
        });
      }
    });

    // If no upcoming events, return early
    if (upcomingEvents.length === 0) {
      return NextResponse.json({
        message: "No upcoming events in the next week",
        eventsCount: 0,
      });
    }

    // Sort events by date
    upcomingEvents.sort((a, b) => {
      return a.eventDate.getTime() - b.eventDate.getTime();
    });

    // Format events for email
    const eventsList = upcomingEvents
      .map(
        (event) =>
          `<li><strong>${event.dateStr}</strong>: ${event.contactName}, ${event.eventDescription}</li>`
      )
      .join("");

    // Create email content
    const emailContent = `
      <html>
        <body>
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
        to: ["goloniko@gmail.com"],
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
    console.error("Error in weekly events cron:", error);
    return NextResponse.json(
      { error: "Failed to process weekly events" },
      { status: 500 }
    );
  }
}
