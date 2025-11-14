"use client";

import { useState, useEffect } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Navigation } from "@/components/Navigation";
import { Calendar } from "@/components/Calendar";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

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

  const goToPreviousYear = () => {
    setYear(year - 1);
  };

  const goToNextYear = () => {
    setYear(year + 1);
  };

  return (
    <ProtectedRoute>
      <Navigation />
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">События</h1>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={goToPreviousYear}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-lg font-medium min-w-[80px] text-center">
              {year}
            </span>
            <Button variant="outline" size="icon" onClick={goToNextYear}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <Calendar year={year} isMobile={isMobile} />
      </div>
    </ProtectedRoute>
  );
}

