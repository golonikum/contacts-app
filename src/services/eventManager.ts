import notificationService from "./notificationService";

// Event interface
export interface Event {
  id?: string;
  title: string;
  description?: string;
  date: Date;
  contactId?: string;
  contactName?: string;
  shortDateStr?: string;
}

class EventManager {
  private events: Event[] = [];
  private checkInterval: NodeJS.Timeout | null = null;
  private readonly CHECK_INTERVAL_MS = 24 * 60 * 60 * 1000; // Check every minute

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
    today.setHours(0, 0, 0, 0);
    const nextTwoWeeks = new Date(today);
    nextTwoWeeks.setDate(today.getDate() + 14);

    // Get events happening in the next 5 minutes
    const upcomingEvents = this.events.filter(
      (event) => event.date >= today && event.date <= nextTwoWeeks
    );

    console.log("Upcoming events for notification:", upcomingEvents);

    // Show notifications for upcoming events
    const summaryEvent: Event = upcomingEvents.reduce(
      (res, event) => ({
        ...res,
        ...event,
        description: `${res.description || ""}\n${event.shortDateStr}: ${
          event.contactName
        }, ${event.description}`,
      }),
      {} as Event
    );

    console.log(summaryEvent);

    this.showEventNotification(summaryEvent);
  }

  // Test function to trigger a notification immediately
  testNotification(): void {
    const testEvent: Event = {
      id: "test-" + Date.now(),
      title: "Тестовое уведомление",
      description: "Это тестовое уведомление для проверки работы системы",
      date: new Date(),
    };

    this.showEventNotification(testEvent);
  }

  // Show notification for an event
  /**
   * Displays a notification based on the event type
   * @param event - The event object containing notification details
   */
  /**
   * Displays a notification based on the event type and details
   * @param event - The event object containing notification details
   */
  private showEventNotification(event: Event): void {
    // Initialize default notification values
    const title = "Напоминание"; // Default title in Russian
    const body = event.description; // Use event description as body

    // Show the notification with the configured content
    notificationService.showNotification(title, {
      body, // Notification body text
      icon: "/icon-192x192.png", // App icon for notification
      data: {
        // Additional data for notification handling
        eventId: event.id, // ID of the event
        url: event.contactId ? `/contacts/${event.contactId}` : "/events", // Navigation URL based on contact ID
      },
    });
  }
}

// Export singleton instance
export default new EventManager();
