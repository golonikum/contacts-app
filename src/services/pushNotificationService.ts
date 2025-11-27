// Push notification service for web applications

class PushNotificationService {
  private isSupported: boolean = false;
  private subscription: PushSubscription | null = null;
  private publicVapidKey: string =
    "BONwjJYTyjGm_vUUEIxbDB4st_0Md7M1RZazqPRpL9fE4ssD8aJLQNUga3J2pejn9PH_PxyZYMk45c2ErnDbnDw";

  constructor() {
    this.checkSupport();
  }

  // Check if push notifications are supported
  private checkSupport() {
    this.isSupported =
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      "PushManager" in window;
  }

  // Helper method to register or update service worker
  private async registerOrUpdateServiceWorker(): Promise<ServiceWorkerRegistration> {
    let registration = await navigator.serviceWorker.getRegistration();

    // If not registered, register it
    if (!registration) {
      registration = await navigator.serviceWorker.register("/sw.js");
      console.log("Service Worker registered with scope:", registration.scope);
    } else {
      // Update existing service worker
      await registration.update();
      console.log("Service Worker updated");
    }

    return registration;
  }

  // Initialize the service
  async initialize(): Promise<boolean> {
    if (!this.isSupported) {
      console.warn("Push notifications are not supported on this device");
      return false;
    }

    try {
      // Register or update service worker
      const registration = await this.registerOrUpdateServiceWorker();

      // Get existing subscription
      this.subscription = await registration.pushManager.getSubscription();

      return true;
    } catch (error) {
      console.error("Failed to initialize push notifications:", error);
      return false;
    }
  }

  // Subscribe to push notifications
  async subscribeToPush(): Promise<boolean> {
    if (!this.isSupported) {
      console.warn("Push notifications are not supported on this device");
      return false;
    }
    debugger;
    try {
      // Register or update service worker
      const registration = await this.registerOrUpdateServiceWorker();

      // Wait for service worker to be active
      if (!registration.active) {
        console.log("Waiting for Service Worker to become active...");
        await new Promise<void>((resolve) => {
          const checkState = () => {
            if (registration.active) {
              console.log("Service Worker is now active");
              resolve();
            } else {
              console.log(
                "Service Worker state:",
                registration.installing?.state || registration.waiting?.state
              );
              setTimeout(checkState, 100);
            }
          };
          checkState();
        });
      }

      // Unsubscribe if already subscribed
      if (this.subscription) {
        await this.subscription.unsubscribe();
      }

      // Subscribe to push notifications
      const applicationServerKey = this.urlBase64ToUint8Array(
        this.publicVapidKey
      );
      this.subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey as any as ArrayBuffer,
      });

      // Send subscription to server
      await this.sendSubscriptionToServer(this.subscription);

      console.log("User is subscribed to push notifications");
      return true;
    } catch (error) {
      console.error("Failed to subscribe to push notifications:", error);
      return false;
    }
  }

  // Unsubscribe from push notifications
  async unsubscribeFromPush(): Promise<boolean> {
    if (!this.subscription) {
      return true;
    }

    try {
      const unsubscribed = await this.subscription.unsubscribe();

      // Remove subscription from server
      await this.removeSubscriptionFromServer(this.subscription);
      this.subscription = null;

      console.log("User is unsubscribed from push notifications");
      return unsubscribed;
    } catch (error) {
      console.error("Failed to unsubscribe from push notifications:", error);
      return false;
    }
  }

  // Check if user is subscribed
  isSubscribed(): boolean {
    return this.subscription !== null;
  }

  // Get current subscription
  getSubscription(): PushSubscription | null {
    return this.subscription;
  }

  // Send a push notification through the service worker
  async sendLocalNotification(
    title: string,
    options?: NotificationOptions
  ): Promise<void> {
    if (!this.isSupported) {
      console.warn("Push notifications are not supported on this device");
      return;
    }

    try {
      // Register or update service worker
      const registration = await this.registerOrUpdateServiceWorker();

      // Post message to service worker to show notification
      registration.active?.postMessage({
        type: "SHOW_NOTIFICATION",
        payload: {
          title,
          options: {
            icon: "/icon-192x192.png",
            badge: "/icon-192x192.png",
            tag: "contacts-app-event",
            requireInteraction: false,
            ...options,
          },
        },
      });
    } catch (error) {
      console.error("Failed to send local notification:", error);
    }
  }

  // Helper method to convert VAPID key
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, "+")
      .replace(/_/g, "/");

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }

    return outputArray;
  }

  // Set the public VAPID key
  setPublicVapidKey(key: string): void {
    this.publicVapidKey = key;
  }

  // Send subscription to server
  private async sendSubscriptionToServer(
    subscription: PushSubscription
  ): Promise<void> {
    try {
      await fetch("/api/notifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "subscribe",
          subscription: subscription,
        }),
      });
      console.log("Subscription sent to server successfully");
    } catch (error) {
      console.error("Error sending subscription to server:", error);
    }
  }

  // Remove subscription from server
  private async removeSubscriptionFromServer(
    subscription: PushSubscription
  ): Promise<void> {
    try {
      await fetch("/api/notifications", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          endpoint: subscription.endpoint,
        }),
      });
      console.log("Subscription removed from server successfully");
    } catch (error) {
      console.error("Error removing subscription from server:", error);
    }
  }

  // Check if push notifications are supported
  getIsSupported(): boolean {
    return this.isSupported;
  }
}

// Export singleton instance
export default new PushNotificationService();
