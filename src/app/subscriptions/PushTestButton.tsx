"use client";

import { useState } from "react";

export function PushTestButton() {
  const [status, setStatus] = useState<string>("");
  const [title, setTitle] = useState<string>("Тестовое Push-уведомление");
  const [message, setMessage] = useState<string>(
    "Это тестовое push-уведомление, отправленное с сервера"
  );
  const [url, setUrl] = useState<string>("/events");

  /**
   * Function to send push notification to the server
   * Handles the entire process from sending the request to updating the status
   */
  const sendPushNotification = async () => {
    setStatus("Отправка...");

    try {
      const response = await fetch("/api/notifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "send",
          title,
          message,
          url,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setStatus(data.message);
      } else {
        setStatus(`Ошибка: ${data.message}`);
      }
    } catch (error) {
      console.error("Error sending push notification:", error);
      setStatus("Ошибка при отправке уведомления");
    }

    // Сброс статуса через 3 секунды
    setTimeout(() => setStatus(""), 3000);
  };

  return (
    <div className="mt-4 p-4 bg-gray-100 rounded-lg">
      <h3 className="text-lg font-semibold mb-2">
        Тестирование Push-уведомлений
      </h3>

      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Заголовок
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Сообщение
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            URL для перехода
          </label>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center">
          <button
            onClick={sendPushNotification}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
          >
            Отправить Push-уведомление
          </button>

          {status && (
            <span className="ml-2 text-sm text-gray-600">{status}</span>
          )}
        </div>
      </div>
    </div>
  );
}
