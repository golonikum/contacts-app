"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ContactForm } from "@/components/ContactForm";
import { Contact } from "@/types/contact";
import {
  getContactById,
  updateContact,
  deleteContact,
} from "@/services/contactService";
import { Trash2, ArrowLeft, Edit, Save, X } from "lucide-react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { getContactInitialFormValue } from "@/lib/contactHelpers";

export default function ContactDetailPage() {
  const router = useRouter();
  const params = useParams();
  const contactId = params.id as string;

  const [contact, setContact] = useState<Contact | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState(getContactInitialFormValue());

  useEffect(() => {
    const fetchContact = async () => {
      try {
        const data = await getContactById(contactId);
        setContact(data);

        // Initialize form data with contact data
        setFormData({
          name: data.name,
          address: data.address || "",
          group: data.group || "",
          contacts: data.contacts,
          events: data.events || {},
        });
      } catch (error) {
        console.error("Error fetching contact:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContact();
  }, [contactId]);

  const handleSave = async () => {
    setIsSubmitting(true);

    try {
      await updateContact(contactId, formData);

      // Refresh contact data
      const updatedContact = await getContactById(contactId);
      setContact(updatedContact);
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating contact:", error);
      alert("Ошибка при обновлении контакта");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (confirm("Вы уверены, что хотите удалить этот контакт?")) {
      try {
        await deleteContact(contactId);
        router.push("/contacts");
      } catch (error) {
        console.error("Error deleting contact:", error);
        alert("Ошибка при удалении контакта");
      }
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center">Загрузка...</div>
      </div>
    );
  }

  if (!contact) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center">Контакт не найден</div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="container mx-auto py-8 px-4">
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Назад
          </Button>
        </div>

        <Card className="max-w-2xl mx-auto">
          <CardHeader className="flex flex-row justify-between items-center">
            <CardTitle className="text-2xl">
              {isEditing ? "Редактирование контакта" : "Детали контакта"}
            </CardTitle>
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <Button
                    variant="outline"
                    onClick={() => setIsEditing(false)}
                    disabled={isSubmitting}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Отмена
                  </Button>
                  <Button onClick={handleSave} disabled={isSubmitting}>
                    <Save className="h-4 w-4 mr-2" />
                    {isSubmitting ? "Сохранение..." : "Сохранить"}
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" onClick={handleDelete}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Удалить
                  </Button>
                  <Button onClick={() => setIsEditing(true)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Редактировать
                  </Button>
                </>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <ContactForm
                onSubmit={handleSave}
                submitButtonText="Создать контакт"
                isSubmitting={isSubmitting}
                formData={formData}
                setFormData={setFormData}
              />
            ) : (
              <div className="space-y-6">
                {/* Name display */}
                <div>
                  <h3 className="text-lg font-medium mb-2">Имя</h3>
                  <p className="text-xl">
                    {contact.name.firstName} {contact.name.lastName}
                    {contact.name.middleName && ` ${contact.name.middleName}`}
                  </p>
                  {contact.name.dignity && (
                    <p className="text-muted-foreground">
                      {contact.name.dignity}
                    </p>
                  )}
                </div>

                {/* Address display */}
                {contact.address && (
                  <div>
                    <h3 className="text-lg font-medium mb-2">Адрес</h3>
                    <p>{contact.address}</p>
                  </div>
                )}

                {/* Group display */}
                {contact.group && (
                  <div>
                    <h3 className="text-lg font-medium mb-2">Группа</h3>
                    <span className="inline-block bg-secondary text-secondary-foreground px-2 py-1 rounded">
                      {contact.group}
                    </span>
                  </div>
                )}

                {/* Phone numbers display */}
                {contact.contacts.phones &&
                  contact.contacts.phones.length > 0 && (
                    <div>
                      <h3 className="text-lg font-medium mb-2">Телефоны</h3>
                      <div className="space-y-1">
                        {contact.contacts.phones.map((phone, index) => (
                          <p key={index}>{phone}</p>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Email addresses display */}
                {contact.contacts.emails &&
                  contact.contacts.emails.length > 0 && (
                    <div>
                      <h3 className="text-lg font-medium mb-2">Email</h3>
                      <div className="space-y-1">
                        {contact.contacts.emails.map((email, index) => (
                          <p key={index}>{email}</p>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Events display */}
                {contact.events && Object.keys(contact.events).length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium mb-2">События</h3>
                    <div className="space-y-1">
                      {Object.entries(contact.events).map(([key, value]) => (
                        <div key={key}>
                          <span className="font-medium">{key}:</span> {value}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
}
