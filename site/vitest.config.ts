import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
    plugins: [react()],
    test: {
        include: ["**/*.{test,spec}.{js,ts,tsx}"],
        environment: "jsdom",
        restoreMocks: true,
        setupFiles: ["vitestSetup.ts"],
        threads: false,
    },
});
