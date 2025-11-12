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

export interface ContactFormValue {
  name: ContactName;
  address?: string;
  group?: string;
  events?: ContactEvents;
  contacts: ContactContacts;
}

export interface Contact extends ContactFormValue {
  id: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}
