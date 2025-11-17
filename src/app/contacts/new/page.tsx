"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ContactForm } from "@/components/ContactForm";
import { createContact } from "@/services/contactService";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ContactFormValue } from "@/types/contact";
import { getContactInitialFormValue } from "@/lib/contactHelpers";
import { Navigation } from "@/components/Navigation";

export default function NewContactPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState(getContactInitialFormValue());

  const handleSubmit = async (data: ContactFormValue) => {
    setIsSubmitting(true);

    try {
      await createContact(data);
      router.push("/contacts");
    } catch (error) {
      console.error("Error creating contact:", error);
      alert("Ошибка при создании контакта");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ProtectedRoute>
      <Navigation />
      <div className="container mx-auto pt-24 px-4 pb-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl">Новый контакт</CardTitle>
          </CardHeader>
          <CardContent>
            <ContactForm
              onSubmit={handleSubmit}
              submitButtonText="Создать контакт"
              isSubmitting={isSubmitting}
              formData={formData}
              setFormData={setFormData}
              showSaveButton
            />
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
}
