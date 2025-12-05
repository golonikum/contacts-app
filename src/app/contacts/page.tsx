"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Contact } from "@/types/contact";
import { getAllContacts } from "@/services/contactService";
import {
  Plus,
  Phone,
  Mail,
  MapPin,
  Download,
  Upload,
  Search,
  Trash2,
} from "lucide-react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Navigation } from "@/components/Navigation";
import { Toast } from "@/components/ui/toast";
import { Loader } from "@/components/Loader";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    isVisible: boolean;
    type?: "success" | "error";
  }>({
    message: "",
    isVisible: false,
    type: "success",
  });
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const router = useRouter();

  const showToast = (
    message: string,
    type: "success" | "error" = "success"
  ) => {
    setToast({ message, isVisible: true, type });
    // Auto-hide after 3 seconds
    setTimeout(() => {
      setToast((prev) => ({ ...prev, isVisible: false }));
    }, 3000);
  };

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const data = await getAllContacts();
        setContacts(data);
        setFilteredContacts(data);
      } catch (error) {
        console.error("Error fetching contacts:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContacts();
  }, []);

  // Filter contacts based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredContacts(contacts);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = contacts.filter(
      (contact) =>
        contact.name.firstName.toLowerCase().includes(query) ||
        contact.name.lastName.toLowerCase().includes(query) ||
        (contact.name.middleName &&
          contact.name.middleName.toLowerCase().includes(query)) ||
        (contact.group && contact.group.toLowerCase().includes(query))
    );
    setFilteredContacts(filtered);
  }, [searchQuery, contacts]);

  const exportContacts = () => {
    // Transform contacts to the required format
    const exportData: Record<string, any> = {};

    contacts.forEach((contact) => {
      const contactData: any = {};

      // Add group if exists
      if (contact.group) {
        contactData["группа"] = contact.group;
      }

      // Add name information
      contactData["фио"] = {
        фамилия: contact.name.lastName,
        имя: contact.name.firstName,
      };

      if (contact.name.middleName) {
        contactData["фио"]["отчество"] = contact.name.middleName;
      }

      if (contact.name.dignity) {
        contactData["фио"]["сан"] = contact.name.dignity;
      }

      // Add events if exist
      if (contact.events && Object.keys(contact.events).length > 0) {
        contactData["события"] = contact.events;
      }

      // Add address if exists
      if (contact.address) {
        contactData["адрес"] = contact.address;
      }

      // Add contacts
      const contactsObj: any = {};
      if (contact.contacts.phones && contact.contacts.phones.length > 0) {
        contactsObj["телефоны"] = contact.contacts.phones;
      }
      if (contact.contacts.emails && contact.contacts.emails.length > 0) {
        contactsObj["e-mails"] = contact.contacts.emails;
      }

      if (Object.keys(contactsObj).length > 0) {
        contactData["контакты"] = contactsObj;
      }

      // Use the contact ID as the key
      exportData[contact.id] = contactData;
    });

    // Create and download the JSON file
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri =
      "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

    const exportFileDefaultName = `contacts-${new Date().toISOString()}.json`;

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
  };

  const deleteAllContacts = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch("/api/contacts/delete-all", {
        method: "DELETE",
      });

      if (response.ok) {
        setContacts([]);
        setFilteredContacts([]);
        showToast("Все контакты успешно удалены", "success");
      } else {
        const errorData = await response.json();
        showToast(`Ошибка при удалении: ${errorData.error}`, "error");
      }
    } catch (error) {
      console.error("Error deleting all contacts:", error);
      showToast("Произошла ошибка при удалении контактов", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  const importContacts = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const content = e.target?.result as string;
        const importedData = JSON.parse(content);

        // Transform imported data to our contact format
        const contactsToImport: any[] = [];

        for (const [id, contactData] of Object.entries(importedData)) {
          const data = contactData as any;

          // Create a new contact in our format
          const newContact = {
            name: {
              firstName: data.фио?.имя || "",
              lastName: data.фио?.фамилия || "",
              middleName: data.фио?.отчество,
              dignity: data.фио?.сан,
            },
            group: data.группа,
            events: data.события,
            address: data.адрес,
            contacts: {
              phones: data.контакты?.телефоны || [],
              emails: data.контакты?.["e-mails"] || [],
            },
          };

          contactsToImport.push(newContact);
        }

        // Import all contacts at once using the new API endpoint
        if (contactsToImport.length > 0) {
          const response = await fetch("/api/contacts/import", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(contactsToImport),
          });

          if (response.ok) {
            // Refresh the contacts list
            const updatedContacts = await getAllContacts();
            setContacts(updatedContacts);
            setFilteredContacts(updatedContacts);
            showToast(
              `Успешно импортировано ${contactsToImport.length} контактов`,
              "success"
            );
          } else {
            const errorData = await response.json();
            showToast(`Ошибка при импорте: ${errorData.error}`, "error");
          }
        } else {
          showToast("В файле не найдено контактов для импорта", "error");
        }
      } catch (error) {
        console.error("Error importing contacts:", error);
        showToast(
          "Ошибка при импорте контактов. Проверьте формат файла.",
          "error"
        );
      }
    };

    reader.readAsText(file);
    // Reset the input value to allow importing the same file again
    event.target.value = "";
  };

  if (isLoading) {
    return <Loader />;
  }

  return (
    <>
      <ProtectedRoute>
        <Navigation />
        <div className="container mx-auto pt-24 px-4 pb-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Контакты</h1>
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            <div className="relative">
              <input
                type="file"
                accept=".json"
                onChange={importContacts}
                className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                id="import-input"
              />
              <Button variant="outline" asChild>
                <label
                  htmlFor="import-input"
                  className="cursor-pointer flex items-center"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Импорт
                </label>
              </Button>
            </div>
            <Button onClick={exportContacts} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Экспорт
            </Button>
            {contacts.length > 0 && (
              <Button
                onClick={() => setIsDeleteDialogOpen(true)}
                variant="outline"
                disabled={isDeleting}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {isDeleting ? "Удаление..." : "Удалить все"}
              </Button>
            )}
            <Button onClick={() => router.push("/contacts/new")}>
              <Plus className="h-4 w-4 mr-2" />
              Добавить
            </Button>
          </div>

          {/* Search bar */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Поиск по имени, фамилии или группе..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {filteredContacts.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">
                    {searchQuery
                      ? "Контакты не найдены"
                      : "У вас пока нет контактов"}
                  </p>
                  {!searchQuery && (
                    <Button onClick={() => router.push("/contacts/new")}>
                      <Plus className="h-4 w-4 mr-2" />
                      Добавить первый контакт
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredContacts.map((contact) => (
                <Card
                  key={contact.id}
                  className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => router.push(`/contacts/${contact.id}`)}
                >
                  <CardHeader>
                    <CardTitle>
                      {contact.name.lastName} {contact.name.firstName}{" "}
                      {contact.name.middleName}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {contact.name.dignity && (
                      <p className="text-sm text-muted-foreground mb-2">
                        {contact.name.dignity}
                      </p>
                    )}

                    {contact.contacts.phones &&
                      contact.contacts.phones.length > 0 && (
                        <div className="flex items-center gap-2 mb-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {contact.contacts.phones[0]}
                          </span>
                        </div>
                      )}

                    {contact.contacts.emails &&
                      contact.contacts.emails.length > 0 && (
                        <div className="flex items-center gap-2 mb-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {contact.contacts.emails[0]}
                          </span>
                        </div>
                      )}

                    {contact.address && (
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
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
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/contacts/${contact.id}`);
                        }}
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
      </ProtectedRoute>

      <Toast
        message={toast.message}
        isVisible={toast.isVisible}
        onClose={() => setToast((prev) => ({ ...prev, isVisible: false }))}
        type={toast.type}
      />

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={deleteAllContacts}
        title="Удаление всех контактов"
        description="Вы уверены, что хотите удалить все контакты? Это действие нельзя отменить."
        confirmText="Удалить"
        cancelText="Отмена"
        variant="destructive"
      />
    </>
  );
}
