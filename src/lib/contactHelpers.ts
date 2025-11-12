import {
  Contact,
  ContactName,
  ContactContacts,
  ContactEvents,
  ContactFormValue,
} from "@/types/contact";

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
