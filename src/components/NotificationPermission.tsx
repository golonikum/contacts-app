"use client";

import { useEffect, useState } from "react";
import notificationService from "@/services/notificationService";

export default function NotificationPermission() {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] =
    useState<NotificationPermission>("default");
  const [isLoading, setIsLoading] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    setIsSupported(notificationService.getIsSupported());
    setPermission(notificationService.getPermission());

    // Check if user has already dismissed the prompt
    const dismissed =
      localStorage.getItem("notificationPromptDismissed") === "true";
    setIsDismissed(dismissed);
  }, []);

  const requestPermission = async () => {
    setIsLoading(true);
    const granted = await notificationService.requestPermission();
    setPermission(granted ? "granted" : "denied");
    setIsLoading(false);

    if (granted) {
      localStorage.setItem("notificationPermissionGranted", "true");
    }
  };

  const dismissPrompt = () => {
    setIsDismissed(true);
    localStorage.setItem("notificationPromptDismissed", "true");
  };

  // Don't show anything if notifications are not supported, already granted, or dismissed
  if (!isSupported || permission === "granted" || isDismissed) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 z-50">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg
            className="h-6 w-6 text-blue-500"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            Включить уведомления
          </p>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Получайте уведомления о предстоящих событиях, днях рождения и
            встречах.
          </p>
          <div className="mt-3 flex space-x-2">
            <button
              type="button"
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              onClick={requestPermission}
              disabled={isLoading}
            >
              {isLoading ? "Загрузка..." : "Включить"}
            </button>
            <button
              type="button"
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 text-xs font-medium rounded-full text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              onClick={dismissPrompt}
            >
              Не сейчас
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
