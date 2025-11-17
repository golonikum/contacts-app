"use client";

import { useEffect } from "react";

export default function PWALayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // Register service worker
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((registration) => {
            console.log("Service Worker registered: ", registration);
          })
          .catch((registrationError) => {
            console.log(
              "Service Worker registration failed: ",
              registrationError
            );
          });
      });
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
