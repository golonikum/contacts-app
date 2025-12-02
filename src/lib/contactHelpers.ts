import {
  Contact,
  ContactName,
  ContactContacts,
  ContactEvents,
  ContactFormValue,
} from "@/types/contact";
import { formatYearsInRussian } from "./formatYearsInRussian";

// Helper function to convert name from JSON string to ContactName object
export function parseName(name: ContactName | string): ContactName {
  if (typeof name === "string") {
    return JSON.parse(name) as ContactName;
  }
  return name;
}

// Helper function to convert contacts from JSON string to ContactContacts object
export function parseContacts(
  contacts: ContactContacts | string
): ContactContacts {
  if (typeof contacts === "string") {
    return JSON.parse(contacts) as ContactContacts;
  }
  return contacts;
}

// Helper function to convert events from JSON string to ContactEvents object
export function parseEvents(
  events: ContactEvents | string | undefined
): ContactEvents | undefined {
  if (!events) return undefined;
  if (typeof events === "string") {
    return JSON.parse(events) as ContactEvents;
  }
  return events;
}

// Helper function to convert a Contact with JSON fields to a fully typed Contact
export function parseContact(contact: Contact): Contact {
  return {
    ...contact,
    name: parseName(contact.name),
    contacts: parseContacts(contact.contacts),
    events: parseEvents(contact.events),
  };
}

export function getContactInitialFormValue(
  initialData?: ContactFormValue
): ContactFormValue {
  return {
    name:
      initialData?.name ||
      ({
        firstName: "",
        lastName: "",
        middleName: "",
        dignity: "",
      } as ContactName),
    address: initialData?.address || "",
    group: initialData?.group || "",
    contacts:
      initialData?.contacts ||
      ({
        phones: [""],
        emails: [""],
      } as ContactContacts),
    events: initialData?.events || ({} as ContactEvents),
  };
}

export const getContactNameForEvent = (contact: Contact) =>
  contact.name.dignity
    ? `${contact.name.dignity} ${contact.name.firstName} (${contact.name.lastName})`
    : `${contact.name.lastName} ${contact.name.firstName}${
        contact.name.middleName ? ` ${contact.name.middleName}` : ""
      }`;

export const formatEventDescription = ({
  description,
  howManyYears,
}: {
  howManyYears: number;
  description: string;
}) =>
  `${description}${
    howManyYears ? ` (${formatYearsInRussian(howManyYears)})` : ""
  }`;

export type ContactEventType = {
  contactName: string;
  eventDate: Date;
  shortDateStr: string;
  eventDescription: string;
};

export const getNearestEvents = (
  contacts: Contact[]
): {
  today: Date;
  upcomingEvents: Array<ContactEventType>;
  allEvents: Array<ContactEventType>;
} => {
  // Get current date and date one week from now
  const today = new Date();
  const year = today.getFullYear();
  const nextYear = year + 1;
  const curMonth = today.getMonth() + 1;
  const curDay = today.getDate();
  const todayMonthDay = `${curMonth < 10 ? "0" : ""}${curMonth}.${
    curDay < 10 ? "0" : ""
  }${curDay}${today.getDate()}`;
  today.setHours(0, 0, 0, 0); // Set to start of day
  const nextTwoWeeks = new Date(today);
  nextTwoWeeks.setDate(today.getDate() + 14);

  // Collect events happening in the next week
  const allEvents: Array<ContactEventType> = [];
  const upcomingEvents: Array<ContactEventType> = [];

  contacts.forEach((contact) => {
    if (contact.events) {
      Object.entries(contact.events).forEach(([description, dateStr]) => {
        // Parse date in DD.MM.YYYY format
        const [day, month, yearFromEvent] = dateStr.split(".");
        const eventMonthDay = `${month}.${day}`;
        const realYear = todayMonthDay > eventMonthDay ? nextYear : year;
        const eventDate = new Date(
          realYear,
          parseInt(month) - 1,
          parseInt(day)
        );
        eventDate.setHours(0, 0, 0, 0);
        const eventYear = yearFromEvent ? parseInt(yearFromEvent) : realYear;
        const howManyYears = realYear - eventYear;

        const event = {
          contactName: getContactNameForEvent(contact),
          shortDateStr: `${day}.${month} ${eventDate
            .toLocaleDateString("ru-RU", {
              weekday: "short",
            })
            .toUpperCase()}`,
          eventDate,
          eventDescription: formatEventDescription({
            description,
            howManyYears,
          }),
        };

        allEvents.push(event);

        // Check if event is in the upcoming week
        if (eventDate >= today && eventDate <= nextTwoWeeks) {
          upcomingEvents.push(event);
        }
      });
    }
  });

  // Sort events by date
  upcomingEvents.sort((a, b) => {
    return a.eventDate.getTime() - b.eventDate.getTime();
  });

  return { today, upcomingEvents, allEvents };
};
