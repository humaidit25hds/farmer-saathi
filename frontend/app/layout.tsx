import type {
  Metadata,
  Viewport,
} from "next";

import "./globals.css";

import AppShell from "@/components/AppShell";
import PWARegister from "@/components/PWARegister";


export const metadata: Metadata = {
  title: {
    default: "FarmerSaathi",
    template: "%s | FarmerSaathi",
  },

  description:
    "AI-powered farming assistant, marketplace, transport and emergency support for farmers.",

  applicationName: "FarmerSaathi",

  manifest: "/manifest.webmanifest",

  icons: {
    icon: [
      {
        url: "/icons/farmersaathi-icon.png",
        type: "image/png",
      },
    ],

    shortcut: [
      {
        url: "/icons/farmersaathi-icon.png",
        type: "image/png",
      },
    ],

    apple: [
      {
        url: "/icons/farmersaathi-icon.png",
        type: "image/png",
      },
    ],
  },

  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "FarmerSaathi",
  },

  formatDetection: {
    telephone: true,
  },
};


export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#124b2a",
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>

        <PWARegister />

        <AppShell>
          {children}
        </AppShell>

      </body>
    </html>
  );
}