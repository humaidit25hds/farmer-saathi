"use client";

import { useEffect } from "react";

export default function PWARegister() {
  useEffect(() => {
    if (
      "serviceWorker" in navigator &&
      process.env.NODE_ENV === "production"
    ) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log(
            "FarmerSaathi service worker registered:",
            registration.scope
          );
        })
        .catch((error) => {
          console.warn(
            "FarmerSaathi service worker registration failed:",
            error
          );
        });
    }
  }, []);

  return null;
}