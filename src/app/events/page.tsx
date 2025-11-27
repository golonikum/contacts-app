"use client";

import { useState, useEffect } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Navigation } from "@/components/Navigation";
import { Calendar } from "@/components/Calendar";

export default function EventsPage() {
  const year = new Date().getFullYear();
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
        </div>
        <Calendar year={year} isMobile={isMobile} />
      </div>
    </ProtectedRoute>
  );
}
