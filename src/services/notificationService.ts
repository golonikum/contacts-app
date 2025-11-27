// Notification service for mobile devices
import pushNotificationService from "./pushNotificationService";

class NotificationService {
  private isSupported: boolean = false;
  private permission: NotificationPermission = "default";
  private isInitialized: boolean = false;

  constructor() {
    this.checkSupport();
  }

  // Initialize the service
  async initialize(): Promise<boolean> {
    if (this.isInitialized) {
      return true;
    }

    // Initialize push notification service
    const pushInitialized = await pushNotificationService.initialize();

    this.isInitialized = true;
    return pushInitialized;
  }

  // Check if notifications are supported
  private checkSupport() {
    this.isSupported =
      typeof window !== "undefined" && "Notification" in window;
    if (this.isSupported) {
      this.permission = Notification.permission;
    }
  }

  // Request permission for notifications
  async requestPermission(): Promise<boolean> {
    // Initialize service if not already initialized
    await this.initialize();

    // Try to subscribe to push notifications first
    const pushSubscribed = await pushNotificationService.subscribeToPush();

    if (pushSubscribed) {
      return true;
    }

    // Fallback to regular notifications if push is not supported
    if (!this.isSupported) {
      console.warn("Notifications are not supported on this device");
      return false;
    }

    if (this.permission === "granted") {
      return true;
    }

    if (this.permission !== "denied") {
      const permission = await Notification.requestPermission();
      this.permission = permission;
      return permission === "granted";
    }

    return false;
  }

  // Show a notification
  async showNotification(
    title: string,
    options?: NotificationOptions
  ): Promise<void> {
    // Initialize service if not already initialized
    await this.initialize();

    // Try to use push notifications first
    if (pushNotificationService.getIsSupported()) {
      await pushNotificationService.sendLocalNotification(title, options);
      return;
    }

    // Fallback to regular notifications
    if (!this.isSupported) {
      console.warn("Notifications are not supported on this device");
      return;
    }

    if (this.permission !== "granted") {
      const granted = await this.requestPermission();
      if (!granted) {
        console.warn("Notification permission not granted");
        return;
      }
    }

    // Default options
    const defaultOptions: NotificationOptions = {
      icon: "/icon-192x192.png",
      badge: "/icon-192x192.png",
      // vibrate: [200, 100, 200],
      tag: "contacts-app-event",
      // renotify: true,
      requireInteraction: false,
      ...options,
    };

    // Create and show notification
    const notification = new Notification(title, defaultOptions);

    // Auto close after 5 seconds if not interacted with
    setTimeout(() => {
      notification.close();
    }, 5000);

    // Handle notification click
    notification.onclick = (event) => {
      event.preventDefault();
      window.focus();
      notification.close();

      // If URL is provided, navigate to it
      if (options?.data?.url) {
        window.location.href = options.data.url;
      }
    };
  }

  // Check if notifications are supported
  getIsSupported(): boolean {
    return this.isSupported || pushNotificationService.getIsSupported();
  }

  // Get current permission status
  getPermission(): NotificationPermission {
    return this.permission;
  }
}

// Export singleton instance
export default new NotificationService();
