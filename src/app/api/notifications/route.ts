import { NextRequest, NextResponse } from "next/server";
import webpush from "web-push";

// Настройте VAPID ключи. В реальном приложении их следует хранить в переменных окружения
const publicVapidKey = process.env.VAPID_PUBLIC_KEY;
const privateVapidKey = process.env.VAPID_PRIVATE_KEY;

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT!,
  publicVapidKey!,
  privateVapidKey!
);

// Хранилище подписок (в реальном приложении используйте базу данных)
let subscriptions: any[] = [];

// POST - для подписки на уведомления или отправки уведомления
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, subscription, title, message, url } = body;

    if (action === "subscribe") {
      // Добавление новой подписки
      if (subscription) {
        // Проверяем, нет ли уже такой подписки
        const existingIndex = subscriptions.findIndex(
          (sub) => sub.endpoint === subscription.endpoint
        );

        if (existingIndex === -1) {
          subscriptions.push(subscription);
        } else {
          // Обновляем существующую подписку
          subscriptions[existingIndex] = subscription;
        }

        return NextResponse.json({
          success: true,
          message: "Подписка успешно сохранена",
        });
      } else {
        return NextResponse.json(
          { success: false, message: "Отсутствуют данные подписки" },
          { status: 400 }
        );
      }
    } else if (action === "send") {
      // Отправка уведомления всем подписчикам
      const notificationPayload = JSON.stringify({
        title: title || "Новое уведомление",
        options: {
          body: message || "У вас новое уведомление",
          icon: "/icon-192x192.png",
          badge: "/icon-192x192.png",
          tag: "contacts-app-event",
          requireInteraction: false,
          data: {
            url: url || "/events",
          },
        },
      });

      // Отправляем уведомление всем подписчикам
      const promises = subscriptions.map((sub) => {
        return webpush
          .sendNotification(sub, notificationPayload)
          .catch((error) => {
            console.error("Ошибка отправки уведомления:", error);
            // Если подписка недействительна, удаляем её
            if (error.statusCode === 410) {
              subscriptions = subscriptions.filter(
                (savedSub) => savedSub.endpoint !== sub.endpoint
              );
            }
            return null;
          });
      });

      await Promise.all(promises);

      return NextResponse.json({
        success: true,
        message: `Уведомление отправлено ${subscriptions.length} подписчикам`,
      });
    } else {
      return NextResponse.json(
        { success: false, message: "Неизвестное действие" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Ошибка обработки запроса:", error);
    return NextResponse.json(
      { success: false, message: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}

// GET - для получения количества подписчиков
export async function GET() {
  return NextResponse.json({
    success: true,
    count: subscriptions.length,
    message: `Количество активных подписчиков: ${subscriptions.length}`,
  });
}

// DELETE - для отписки
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { endpoint } = body;

    if (!endpoint) {
      return NextResponse.json(
        { success: false, message: "Отсутствует endpoint" },
        { status: 400 }
      );
    }

    // Удаляем подписку по endpoint
    subscriptions = subscriptions.filter((sub) => sub.endpoint !== endpoint);

    return NextResponse.json({
      success: true,
      message: "Подписка успешно удалена",
    });
  } catch (error) {
    console.error("Ошибка обработки запроса:", error);
    return NextResponse.json(
      { success: false, message: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}
