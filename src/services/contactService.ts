import { Contact, ContactFormValue } from "@/types/contact";
import { parseContact } from "@/lib/contactHelpers";
import { getCookie } from "@/lib/clientCookies";

const API_URL = "/api/contacts";

// Get authorization header
const getAuthHeaders = () => {
  const token = getCookie("token");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

// Get all contacts for the current user
export const getAllContacts = async (): Promise<Contact[]> => {
  const response = await fetch(API_URL, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch contacts");
  }

  const data = await response.json();
  return data.contacts.map(parseContact);
};

// Get a specific contact by ID
export const getContactById = async (id: string): Promise<Contact> => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch contact");
  }

  const data = await response.json();
  return parseContact(data.contact);
};

// Create a new contact
export const createContact = async (
  formData: ContactFormValue
): Promise<Contact> => {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(formData),
  });

  if (!response.ok) {
    throw new Error("Failed to create contact");
  }

  const data = await response.json();
  return parseContact(data.contact);
};

// Update an existing contact
export const updateContact = async (
  id: string,
  formData: ContactFormValue
): Promise<Contact> => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(formData),
  });

  if (!response.ok) {
    throw new Error("Failed to update contact");
  }

  const data = await response.json();
  return parseContact(data.contact);
};

// Delete a contact
export const deleteContact = async (id: string): Promise<void> => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed to delete contact");
  }
};

// Delete all contacts for the current user (server-side only)
export const deleteAllContactsForUser = async (): Promise<void> => {
  // This function should only be called from server-side code
  // It will use server-side authentication
  const response = await fetch(`${API_URL}/delete-all`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed to delete all contacts");
  }
};
