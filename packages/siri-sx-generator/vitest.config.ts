import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        include: ["**/*.{test,spec}.{js,ts}"],
        environment: "node",
        maxThreads: 1,
        minThreads: 1,
    },
});
