"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ContactName, ContactFormValue } from "@/types/contact";
import { Plus, Trash2 } from "lucide-react";

interface ContactFormProps {
  onSubmit: (data: ContactFormValue) => Promise<void>;
  submitButtonText: string;
  isSubmitting: boolean;
  formData: ContactFormValue;
  setFormData: React.Dispatch<React.SetStateAction<ContactFormValue>>;
  showSaveButton?: boolean;
}

export function ContactForm({
  formData,
  setFormData,
  onSubmit,
  submitButtonText,
  isSubmitting,
  showSaveButton,
}: ContactFormProps) {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Name fields */}
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Имя</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="firstName">Имя</Label>
            <Input
              id="firstName"
              value={formData.name.firstName}
              onChange={(e) => handleNameChange("firstName", e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="lastName">Фамилия</Label>
            <Input
              id="lastName"
              value={formData.name.lastName}
              onChange={(e) => handleNameChange("lastName", e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="middleName">Отчество</Label>
            <Input
              id="middleName"
              value={formData.name.middleName}
              onChange={(e) => handleNameChange("middleName", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="dignity">Должность</Label>
            <Input
              id="dignity"
              value={formData.name.dignity}
              onChange={(e) => handleNameChange("dignity", e.target.value)}
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
        {Object.entries(formData.events || {}).map(([key, value]) => (
          <div key={key} className="space-y-2">
            <div className="flex items-center gap-2">
              <Label>{key}</Label>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => removeEventField(key)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <Input
              value={value}
              onChange={(e) => handleEventChange(key, e.target.value)}
              placeholder="Дата события"
            />
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

      {showSaveButton && (
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Сохранение..." : submitButtonText}
        </Button>
      )}
    </form>
  );
}
