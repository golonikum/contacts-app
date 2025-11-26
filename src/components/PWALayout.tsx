"use client";

import { getNearestEvents } from "@/lib/contactHelpers";
import { getAllContacts } from "@/services/contactService";
import eventManager from "@/services/eventManager";
import { useEffect } from "react";

export default function PWALayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    (async () => {
      const contacts = await getAllContacts();
      const { allEvents } = getNearestEvents(contacts);

      eventManager.resetEvents(
        allEvents.map((item) => ({
          date: item.eventDate,
          title: item.eventDescription,
          contactName: item.contactName,
          description: item.eventDescription,
        }))
      );
    })();

    // Register service worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("Service Worker registered: ", registration);

          // Check for service worker updates
          registration.addEventListener("updatefound", () => {
            const installingWorker = registration.installing;
            if (installingWorker) {
              installingWorker.addEventListener("statechange", () => {
                if (
                  installingWorker.state === "installed" &&
                  navigator.serviceWorker.controller
                ) {
                  // New content is available; refresh to get it
                  console.log("New content available, refreshing");
                  window.location.reload();
                }
              });
            }
          });
        })
        .catch((registrationError) => {
          console.error(
            "Service Worker registration failed: ",
            registrationError
          );
        });
    } else {
      console.error("Service workers are not supported in this browser");
    }

    // Add to home screen prompt
    let deferredPrompt: any = null;
    window.addEventListener("beforeinstallprompt", (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later
      deferredPrompt = e;
      // Update UI notify the user they can install the PWA
      // Optionally, show an install button or banner
      console.log("beforeinstallprompt fired");
    });

    // Optional: Show install button/banner
    const installButton = document.getElementById("pwa-install-button");
    if (installButton) {
      installButton.addEventListener("click", () => {
        if (deferredPrompt) {
          // Show the install prompt
          deferredPrompt.prompt();
          // Wait for the user to respond to the prompt
          deferredPrompt.userChoice.then((choiceResult: any) => {
            if (choiceResult.outcome === "accepted") {
              console.log("User accepted the A2HS prompt");
            } else {
              console.log("User dismissed the A2HS prompt");
            }
            // We don't need the prompt anymore
            deferredPrompt = null;
          });
        }
      });
    }
  }, []);

  return <>{children}</>;
}
