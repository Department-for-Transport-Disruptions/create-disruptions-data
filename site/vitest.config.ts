import react from "@vitejs/plugin-react";
import { defineConfig, UserConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()] as UserConfig["plugins"],
  test: {
    include: ["**/*.{test,spec}.{js,ts,tsx}"],
    environment: "jsdom",
    restoreMocks: true,
    setupFiles: ["vitestSetup.ts"],
  },
});
