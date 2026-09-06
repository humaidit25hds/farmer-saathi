"use client";

import {
  useEffect,
  useState,
} from "react";


type BeforeInstallPromptEvent =
  Event & {
    prompt: () => Promise<void>;

    userChoice: Promise<{
      outcome:
        | "accepted"
        | "dismissed";

      platform: string;
    }>;
  };


export default function InstallPWAButton() {

  const [
    installPrompt,
    setInstallPrompt,
  ] =
    useState<
      BeforeInstallPromptEvent | null
    >(null);

  const [
    installed,
    setInstalled,
  ] =
    useState(false);


  useEffect(() => {

    const isStandalone =
      window.matchMedia(
        "(display-mode: standalone)"
      ).matches;

    if (isStandalone) {
      setInstalled(true);
    }


    const handleBeforeInstall =
      (event: Event) => {

        event.preventDefault();

        setInstallPrompt(
          event as BeforeInstallPromptEvent
        );
      };


    const handleInstalled = () => {

      setInstalled(true);

      setInstallPrompt(null);
    };


    window.addEventListener(
      "beforeinstallprompt",
      handleBeforeInstall
    );

    window.addEventListener(
      "appinstalled",
      handleInstalled
    );


    return () => {

      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstall
      );

      window.removeEventListener(
        "appinstalled",
        handleInstalled
      );

    };

  }, []);


  async function installApp() {

    if (!installPrompt) {
      return;
    }


    await installPrompt.prompt();


    const choice =
      await installPrompt.userChoice;


    if (
      choice.outcome ===
      "accepted"
    ) {
      setInstallPrompt(null);
    }

  }


  if (
    installed ||
    !installPrompt
  ) {
    return null;
  }


  return (

    <button
      type="button"
      className="installFarmerSaathiButton"
      onClick={
        installApp
      }
    >

      <span>
        📲
      </span>

      Install FarmerSaathi

    </button>

  );
}