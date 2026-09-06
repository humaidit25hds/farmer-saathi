import type { MetadataRoute } from "next";
export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "FarmerSaathi",
    short_name: "FarmerSaathi",

    description:
      "AI-powered farming assistant, marketplace, transport and emergency support for farmers.",

    start_url: "/",

    display: "standalone",

    background_color: "#f7faf5",

    theme_color: "#124b2a",

    orientation: "portrait",

    icons: [
      {
        src: "/icons/farmersaathi-icon.png",
        sizes: "1024x1024",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/farmersaathi-icon.png",
        sizes: "1024x1024",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}