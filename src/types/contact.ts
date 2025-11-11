export interface ContactName {
  firstName: string;
  lastName: string;
  middleName?: string;
  dignity?: string;
}

export interface ContactContacts {
  phones: string[];
  emails: string[];
}

export interface ContactEvents {
  [key: string]: string;
}

export interface Contact {
  id: string;
  userId: string;
  name: ContactName | string; // Prisma stores this as JSON
  address?: string;
  group?: string;
  events?: ContactEvents | string; // Prisma stores this as JSON
  contacts: ContactContacts | string; // Prisma stores this as JSON
  createdAt: Date;
  updatedAt: Date;
}
