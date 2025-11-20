"use client";

import { useState, useEffect } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Navigation } from "@/components/Navigation";
import { Calendar } from "@/components/Calendar";
import eventManager from "@/services/eventManager";

export default function EventsPage() {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [isMobile, setIsMobile] = useState(false);

  // Check screen size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Initial check
    checkScreenSize();

    // Add event listener
    window.addEventListener("resize", checkScreenSize);

    // Clean up
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  return (
    <ProtectedRoute>
      <Navigation />
      <div className="container mx-auto pt-24 px-4 pb-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">События</h1>
          <button
            onClick={() => eventManager.testNotification()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Тест уведомления
          </button>
        </div>
        <Calendar year={year} isMobile={isMobile} />
      </div>
    </ProtectedRoute>
  );
}
