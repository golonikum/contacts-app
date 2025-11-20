import notificationService from "./notificationService";

// Event types
export enum EventType {
  BIRTHDAY = "birthday",
  MEETING = "meeting",
  REMINDER = "reminder",
  TASK = "task",
}

// Event interface
export interface Event {
  id?: string;
  title: string;
  description?: string;
  date: Date;
  type?: EventType;
  contactId?: string;
  contactName?: string;
}

class EventManager {
  private events: Event[] = [];
  private checkInterval: NodeJS.Timeout | null = null;
  private readonly CHECK_INTERVAL_MS = 10000; // Check every minute

  constructor() {
    this.startEventChecking();
  }

  // Add a new event
  addEvent(event: Event): void {
    this.events.push(event);
    this.sortEvents();
  }

  resetEvents(events: Event[]): void {
    this.events = [...events];
    this.sortEvents();
  }

  // Remove an event
  removeEvent(id: string): void {
    this.events = this.events.filter((event) => event.id !== id);
  }

  // Get all events
  getEvents(): Event[] {
    return [...this.events];
  }

  // Get events for a specific date
  getEventsForDate(date: Date): Event[] {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return this.events.filter(
      (event) => event.date >= startOfDay && event.date <= endOfDay
    );
  }

  // Get upcoming events (within the next 14 days)
  getUpcomingEvents(): Event[] {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 14);

    return this.events.filter(
      (event) => event.date >= now && event.date <= tomorrow
    );
  }

  // Sort events by date
  private sortEvents(): void {
    this.events.sort((a, b) => a.date.getTime() - b.date.getTime());
  }

  // Start checking for events
  startEventChecking(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }

    // Check immediately
    this.checkForEvents();

    // Then check periodically
    this.checkInterval = setInterval(() => {
      this.checkForEvents();
    }, this.CHECK_INTERVAL_MS);
  }

  // Stop checking for events
  stopEventChecking(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  // Check for events that need notifications
  private checkForEvents(): void {
    const today = new Date();
    const nextTwoWeeks = new Date(today);
    today.setHours(0, 0, 0, 0);
    nextTwoWeeks.setDate(today.getDate() + 14);

    // Get events happening in the next 5 minutes
    const upcomingEvents = this.events.filter(
      (event) => event.date >= today && event.date <= nextTwoWeeks
    );

    console.log(upcomingEvents);

    // Show notifications for upcoming events
    upcomingEvents.forEach((event) => {
      this.showEventNotification(event);
    });
  }

  // Show notification for an event
  private showEventNotification(event: Event): void {
    let title = "";
    let body = "";
    let icon = "";

    switch (event.type) {
      case EventType.BIRTHDAY:
        title = `День рождения: ${event.contactName || "Контакт"}`;
        body = `Сегодня день рождения у ${event.contactName || "контакта"}!`;
        icon = "🎂";
        break;
      case EventType.MEETING:
        title = `Встреча: ${event.title}`;
        body = event.description || "Запланированная встреча";
        icon = "🤝";
        break;
      case EventType.REMINDER:
        title = `Напоминание: ${event.title}`;
        body = event.description || "Не забудьте!";
        icon = "📝";
        break;
      case EventType.TASK:
        title = `Задача: ${event.title}`;
        body = event.description || "Запланированная задача";
        icon = "✅";
        break;
    }

    notificationService.showNotification(title, {
      body,
      icon: "/icon-192x192.png",
      data: {
        eventId: event.id,
        url: event.contactId ? `/contacts/${event.contactId}` : "/events",
      },
    });
  }
}

// Export singleton instance
export default new EventManager();
