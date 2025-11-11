"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Contact } from "@/types/contact";
import { getAllContacts } from "@/services/contactService";
import { Plus, Phone, Mail, MapPin } from "lucide-react";

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const data = await getAllContacts();
        setContacts(data);
      } catch (error) {
        console.error("Error fetching contacts:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContacts();
  }, []);

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Контакты</h1>
        <Button onClick={() => router.push("/contacts/new")}>
          <Plus className="h-4 w-4 mr-2" />
          Добавить контакт
        </Button>
      </div>

      {contacts.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                У вас пока нет контактов
              </p>
              <Button onClick={() => router.push("/contacts/new")}>
                <Plus className="h-4 w-4 mr-2" />
                Добавить первый контакт
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {contacts.map((contact) => (
            <Card key={contact.id} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle>
                  {contact.name.firstName} {contact.name.lastName}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {contact.name.dignity && (
                  <p className="text-sm text-muted-foreground mb-2">
                    {contact.name.dignity}
                  </p>
                )}

                {contact.contacts.phones && contact.contacts.phones.length > 0 && (
                  <div className="flex items-center gap-2 mb-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{contact.contacts.phones[0]}</span>
                  </div>
                )}

                {contact.contacts.emails && contact.contacts.emails.length > 0 && (
                  <div className="flex items-center gap-2 mb-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{contact.contacts.emails[0]}</span>
                  </div>
                )}

                {contact.address && (
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{contact.address}</span>
                  </div>
                )}

                {contact.group && (
                  <div className="mt-2">
                    <span className="inline-block bg-secondary text-secondary-foreground text-xs px-2 py-1 rounded">
                      {contact.group}
                    </span>
                  </div>
                )}

                <div className="mt-4 flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/contacts/${contact.id}`)}
                  >
                    Подробнее
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
