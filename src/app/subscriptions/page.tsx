"use client";

import { useState, useEffect } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Navigation } from "@/components/Navigation";
import eventManager from "@/services/eventManager";
import notificationService from "@/services/notificationService";
import pushNotificationService from "@/services/pushNotificationService";
import { PushTestButton } from "./PushTestButton";

export default function SubscriptionsPage() {
  const [notificationStatus, setNotificationStatus] = useState<string>("");
  const [isPushSupported, setIsPushSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  // Initialize push notifications
  useEffect(() => {
    const initializePush = async () => {
      const supported = pushNotificationService.getIsSupported();
      setIsPushSupported(supported);

      if (supported) {
        await pushNotificationService.initialize();
        setIsSubscribed(pushNotificationService.isSubscribed());
      }
    };

    initializePush();
  }, []);

  return (
    <ProtectedRoute>
      <Navigation />
      <div className="container mx-auto pt-24 px-4 pb-8">
        <div className="flex items-center gap-2">
          <button
            onClick={async () => {
              setNotificationStatus("Запрос разрешения...");
              const hasPermission =
                await notificationService.requestPermission();

              if (hasPermission) {
                setNotificationStatus("Разрешение получено");
                eventManager.testNotification();
                setTimeout(() => setNotificationStatus(""), 3000);

                // Update subscription status
                setIsSubscribed(pushNotificationService.isSubscribed());
              } else {
                setNotificationStatus("Разрешение отклонено");
                setTimeout(() => setNotificationStatus(""), 3000);
              }
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Тест уведомления
          </button>

          {isPushSupported && (
            <button
              onClick={async () => {
                if (isSubscribed) {
                  const success =
                    await pushNotificationService.unsubscribeFromPush();
                  if (success) {
                    setNotificationStatus("Отписка от push-уведомлений");
                    setIsSubscribed(false);
                  } else {
                    setNotificationStatus("Ошибка при отписке");
                  }
                } else {
                  const success =
                    await pushNotificationService.subscribeToPush();
                  if (success) {
                    setNotificationStatus("Подписка на push-уведомления");
                    setIsSubscribed(true);
                  } else {
                    setNotificationStatus("Ошибка при подписке");
                  }
                }

                setTimeout(() => setNotificationStatus(""), 3000);
              }}
              className={`px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                isSubscribed
                  ? "bg-red-600 hover:bg-red-700 focus:ring-red-500 text-white"
                  : "bg-green-600 hover:bg-green-700 focus:ring-green-500 text-white"
              }`}
            >
              {isSubscribed ? "Отписаться от Push" : "Подписаться на Push"}
            </button>
          )}

          {notificationStatus && (
            <span className="text-sm text-gray-600">{notificationStatus}</span>
          )}
        </div>
        <PushTestButton />
      </div>
    </ProtectedRoute>
  );
}
