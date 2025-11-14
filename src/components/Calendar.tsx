import { getAllContacts } from "@/services/contactService";
import { Contact } from "@/types/contact";
import { useEffect, useState, useRef } from "react";

interface CalendarDay {
  date: Date;
  events: Array<{
    contactId: string;
    contactName: string;
    description: string;
  }>;
}

interface CalendarProps {
  year: number;
  isMobile?: boolean;
}

export function Calendar({ year, isMobile = false }: CalendarProps) {
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const currentDayRef = useRef<HTMLDivElement>(null);
  const today = new Date();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const contacts = await getAllContacts();
        const daysMap = new Map<string, CalendarDay>();

        // Initialize all days of the year
        const startDate = new Date(year, 0, 1); // January 1st
        const endDate = new Date(year, 11, 31); // December 31st

        for (
          let d = new Date(startDate);
          d <= endDate;
          d.setDate(d.getDate() + 1)
        ) {
          const dateKey = d.toISOString().split("T")[0].slice(5);
          daysMap.set(dateKey, {
            date: new Date(d),
            events: [],
          });
        }

        // Add events to the calendar
        contacts.forEach((contact) => {
          if (contact.events) {
            Object.entries(contact.events).forEach(([description, dateStr]) => {
              // Parse date in DD.MM.YYYY format
              const [eventDay, month, yearFromEvent] = dateStr.split(".");
              const eventDate = new Date(
                yearFromEvent ? parseInt(yearFromEvent) : year,
                parseInt(month) - 1,
                parseInt(eventDay)
              );

              if (!isNaN(eventDate.valueOf())) {
                const dateKey = eventDate.toISOString().split("T")[0].slice(5);
                const day = daysMap.get(dateKey);
                if (day) {
                  day.events.push({
                    contactId: contact.id,
                    contactName: `${contact.name.firstName} ${contact.name.lastName}`,
                    description,
                  });
                }
              }
            });
          }
        });

        setCalendarDays(Array.from(daysMap.values()));
      } catch (error) {
        console.error("Error fetching events:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, [year]);

  // Scroll to current day after loading
  useEffect(() => {
    if (!isLoading && currentDayRef.current && year === today.getFullYear()) {
      currentDayRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [isMobile, isLoading, year, today.getFullYear()]);

  const getDaysInMonth = (month: number) => {
    return calendarDays.filter((day) => day.date.getMonth() === month);
  };

  const getFirstDayOfMonth = (month: number) => {
    return new Date(year, month, 1).getDay() || 7; // Convert Sunday (0) to 7
  };

  const monthNames = [
    "Январь",
    "Февраль",
    "Март",
    "Апрель",
    "Май",
    "Июнь",
    "Июль",
    "Август",
    "Сентябрь",
    "Октябрь",
    "Ноябрь",
    "Декабрь",
  ];

  const weekDays = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

  if (isLoading) {
    return <div className="text-center py-8">Загрузка календаря...</div>;
  }

  const isToday = (date: Date) => {
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "long",
      weekday: "short",
    });
  };

  // Mobile view - compact list
  if (isMobile) {
    return (
      <div className="space-y-2">
        {calendarDays.map((day, index) => (
          <div
            key={index}
            ref={isToday(day.date) ? currentDayRef : null}
            className={`border rounded-lg p-3 ${
              isToday(day.date) ? "ring-2 ring-primary bg-primary/5" : ""
            }`}
          >
            <div className="flex justify-between items-center mb-2">
              <div className="font-medium">{formatDate(day.date)}</div>
              <div className="text-sm text-muted-foreground">
                {day.date.getDate()} {monthNames[day.date.getMonth()]}
              </div>
            </div>
            {day.events.length > 0 && (
              <div className="space-y-2">
                {day.events.map((event, eventIndex) => (
                  <div
                    key={eventIndex}
                    className="bg-primary/10 text-primary rounded p-2 text-sm"
                  >
                    <div className="font-medium">{event.contactName}</div>
                    <div>{event.description}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }

  // Desktop view - grid calendar
  return (
    <div className="space-y-8">
      {monthNames.map((monthName, monthIndex) => {
        const days = getDaysInMonth(monthIndex);
        const firstDay = getFirstDayOfMonth(monthIndex);

        return (
          <div key={monthIndex} className="bg-card rounded-lg shadow p-4">
            <h3 className="text-xl font-semibold mb-4">{monthName}</h3>
            <div className="grid grid-cols-7 gap-1">
              {weekDays.map((day) => (
                <div key={day} className="text-center text-sm font-medium p-2">
                  {day}
                </div>
              ))}
              {/* Empty cells for days before the first day of the month */}
              {Array.from({ length: firstDay - 1 }).map((_, index) => (
                <div key={`empty-${index}`} className="aspect-square"></div>
              ))}
              {/* Days of the month */}
              {days.map((day, index) => (
                <div
                  key={index}
                  ref={isToday(day.date) ? currentDayRef : null}
                  className={`aspect-square border rounded p-1 overflow-hidden hover:bg-muted transition-colors ${
                    isToday(day.date) ? "ring-2 ring-primary" : ""
                  }`}
                >
                  <div className="text-sm font-medium mb-1">
                    {day.date.getDate()}
                  </div>
                  {day.events.length > 0 && (
                    <div className="space-y-1">
                      {day.events.slice(0, 2).map((event, eventIndex) => (
                        <div
                          key={eventIndex}
                          className="text-xs bg-primary text-primary-foreground rounded p-1 truncate"
                          title={`${event.contactName}: ${event.description}`}
                        >
                          {event.contactName}: {event.description}
                        </div>
                      ))}
                      {day.events.length > 2 && (
                        <div className="text-xs text-muted-foreground">
                          +{day.events.length - 2} еще
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
