"use client";

import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Navigation } from "@/components/Navigation";

export default function EventsPage() {
  return (
    <ProtectedRoute>
      <Navigation />
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-6">События</h1>
        <p>TODO</p>
      </div>
    </ProtectedRoute>
  );
}
