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

    // // Get current date and date one week from now
    // const today = new Date();
    // const year = today.getFullYear();
    // const nextYear = year + 1;
    // const todayMonthDay = `${today.getMonth() + 1}.${today.getDate()}`;
    // today.setHours(0, 0, 0, 0); // Set to start of day
    // const nextTwoWeeks = new Date(today);
    // nextTwoWeeks.setDate(today.getDate() + 14);

    // // Collect events happening in the next week
    // const upcomingEvents: Array<{
    //   contactName: string;
    //   eventDate: Date;
    //   shortDateStr: string;
    //   eventDescription: string;
    // }> = [];

    // (contacts as any as Contact[]).forEach((contact) => {
    //   if (contact.events) {
    //     Object.entries(contact.events).forEach(([description, dateStr]) => {
    //       // Parse date in DD.MM.YYYY format
    //       const [day, month, yearFromEvent] = dateStr.split(".");
    //       const eventMonthDay = `${month}.${day}`;
    //       const realYear = todayMonthDay > eventMonthDay ? nextYear : year;
    //       const eventDate = new Date(realYear, parseInt(month) - 1, parseInt(day));
    //       eventDate.setHours(0, 0, 0, 0);
    //       const eventYear = yearFromEvent ? parseInt(yearFromEvent) : realYear;
    //       const howManyYears = realYear - eventYear;

    //       // Check if event is in the upcoming week
    //       if (eventDate >= today && eventDate <= nextTwoWeeks) {
    //         upcomingEvents.push({
    //           contactName: getContactNameForEvent(contact),
    //           shortDateStr: `${day}.${month} ${eventDate
    //             .toLocaleDateString("ru-RU", {
    //               weekday: "short",
    //             })
    //             .toUpperCase()}`,
    //           eventDate,
    //           eventDescription: formatEventDescription({
    //             description,
    //             howManyYears,
    //           }),
    //         });
    //       }
    //     });
    //   }
    // });

    // If no upcoming events, return early
    if (upcomingEvents.length === 0) {
      return NextResponse.json({
        message: "No upcoming events in the next week",
        eventsCount: 0,
      });
    }

    // // Sort events by date
    // upcomingEvents.sort((a, b) => {
    //   return a.eventDate.getTime() - b.eventDate.getTime();
    // });

    // Format events for email
    const eventsList = upcomingEvents
      .map(
        (event) =>
          `<li style="${
            event.eventDate === today ? "color: red" : ""
          }"><strong>${event.shortDateStr}</strong>: ${event.contactName}, ${
            event.eventDescription
          }</li>`
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
    console.error("Error in nearest events cron:", error);
    return NextResponse.json(
      { error: "Failed to process nearest events" },
      { status: 500 }
    );
  }
}
