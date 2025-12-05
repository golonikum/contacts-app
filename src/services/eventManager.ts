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

  resetEvents(events: Event[]): void {
    this.events = [...events];
    this.sortEvents();
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

    this.showEventNotification(summaryEvent);
  }

  // Test function to trigger a notification immediately
  testNotification(): void {
    this.checkForEvents();
  }

  // Show notification for an event
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
