import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.farmersaathi.app",
  appName: "FarmerSaathi",
  webDir: "out",

  server: {
    androidScheme: "http",
    cleartext: true,
  },
};

export default config;