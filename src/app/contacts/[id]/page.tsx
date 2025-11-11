"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ContactName, ContactContacts, Contact } from "@/types/contact";
import {
  getContactById,
  updateContact,
  deleteContact,
} from "@/services/contactService";
import { Plus, Trash2, ArrowLeft, Edit, Save, X } from "lucide-react";

export default function ContactDetailPage() {
  const router = useRouter();
  const params = useParams();
  const contactId = params.id as string;

  const [contact, setContact] = useState<Contact | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: {
      firstName: "",
      lastName: "",
      middleName: "",
      dignity: "",
    } as ContactName,
    address: "",
    group: "",
    contacts: {
      phones: [""],
      emails: [""],
    } as ContactContacts,
    events: {} as Record<string, string>,
  });

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

  const handleNameChange = (field: keyof ContactName, value: string) => {
    setFormData((prev) => ({
      ...prev,
      name: {
        ...prev.name,
        [field]: value,
      },
    }));
  };

  const handleAddressChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      address: value,
    }));
  };

  const handleGroupChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      group: value,
    }));
  };

  const handlePhoneChange = (index: number, value: string) => {
    const newPhones = [...formData.contacts.phones];
    newPhones[index] = value;
    setFormData((prev) => ({
      ...prev,
      contacts: {
        ...prev.contacts,
        phones: newPhones,
      },
    }));
  };

  const handleEmailChange = (index: number, value: string) => {
    const newEmails = [...formData.contacts.emails];
    newEmails[index] = value;
    setFormData((prev) => ({
      ...prev,
      contacts: {
        ...prev.contacts,
        emails: newEmails,
      },
    }));
  };

  const addPhoneField = () => {
    setFormData((prev) => ({
      ...prev,
      contacts: {
        ...prev.contacts,
        phones: [...prev.contacts.phones, ""],
      },
    }));
  };

  const removePhoneField = (index: number) => {
    const newPhones = formData.contacts.phones.filter((_, i) => i !== index);
    setFormData((prev) => ({
      ...prev,
      contacts: {
        ...prev.contacts,
        phones: newPhones.length > 0 ? newPhones : [""],
      },
    }));
  };

  const addEmailField = () => {
    setFormData((prev) => ({
      ...prev,
      contacts: {
        ...prev.contacts,
        emails: [...prev.contacts.emails, ""],
      },
    }));
  };

  const removeEmailField = (index: number) => {
    const newEmails = formData.contacts.emails.filter((_, i) => i !== index);
    setFormData((prev) => ({
      ...prev,
      contacts: {
        ...prev.contacts,
        emails: newEmails.length > 0 ? newEmails : [""],
      },
    }));
  };

  const handleEventChange = (key: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      events: {
        ...prev.events,
        [key]: value,
      },
    }));
  };

  const addEventField = () => {
    const key = prompt("Введите название события:");
    if (key) {
      handleEventChange(key, "");
    }
  };

  const removeEventField = (key: string) => {
    const newEvents = { ...formData.events };
    delete newEvents[key];
    setFormData((prev) => ({
      ...prev,
      events: newEvents,
    }));
  };

  const handleSave = async () => {
    setIsSubmitting(true);

    try {
      await updateContact(
        contactId,
        formData.name,
        formData.contacts,
        formData.address,
        formData.group,
        formData.events
      );

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
            <form className="space-y-6">
              {/* Name fields */}
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Имя</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">Имя</Label>
                    <Input
                      id="firstName"
                      value={formData.name.firstName}
                      onChange={(e) =>
                        handleNameChange("firstName", e.target.value)
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Фамилия</Label>
                    <Input
                      id="lastName"
                      value={formData.name.lastName}
                      onChange={(e) =>
                        handleNameChange("lastName", e.target.value)
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="middleName">Отчество</Label>
                    <Input
                      id="middleName"
                      value={formData.name.middleName}
                      onChange={(e) =>
                        handleNameChange("middleName", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="dignity">Должность</Label>
                    <Input
                      id="dignity"
                      value={formData.name.dignity}
                      onChange={(e) =>
                        handleNameChange("dignity", e.target.value)
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Address field */}
              <div className="space-y-2">
                <Label htmlFor="address">Адрес</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleAddressChange(e.target.value)}
                  rows={3}
                />
              </div>

              {/* Group field */}
              <div className="space-y-2">
                <Label htmlFor="group">Группа</Label>
                <Input
                  id="group"
                  value={formData.group}
                  onChange={(e) => handleGroupChange(e.target.value)}
                />
              </div>

              {/* Phone numbers */}
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Телефоны</h3>
                {formData.contacts.phones.map((phone, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={phone}
                      onChange={(e) => handlePhoneChange(index, e.target.value)}
                      placeholder="Номер телефона"
                    />
                    {formData.contacts.phones.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => removePhoneField(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={addPhoneField}
                  className="mt-2"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Добавить телефон
                </Button>
              </div>

              {/* Email addresses */}
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Email</h3>
                {formData.contacts.emails.map((email, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={email}
                      onChange={(e) => handleEmailChange(index, e.target.value)}
                      placeholder="Email адрес"
                      type="email"
                    />
                    {formData.contacts.emails.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => removeEmailField(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={addEmailField}
                  className="mt-2"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Добавить email
                </Button>
              </div>

              {/* Events */}
              <div className="space-y-2">
                <h3 className="text-lg font-medium">События</h3>
                {Object.entries(formData.events).map(([key, value]) => (
                  <div key={key} className="flex gap-2">
                    <div className="w-1/3">
                      <Input value={key} disabled />
                    </div>
                    <div className="flex-1">
                      <Input
                        value={value}
                        onChange={(e) => handleEventChange(key, e.target.value)}
                        placeholder="Дата или описание"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeEventField(key)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={addEventField}
                  className="mt-2"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Добавить событие
                </Button>
              </div>
            </form>
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
  );
}
