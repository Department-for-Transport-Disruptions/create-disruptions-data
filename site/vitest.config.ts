import { defineConfig } from 'vitest/config'
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react({ fastRefresh: false })],
  test: {
    include: ['**/*.{test,spec}.{js,ts,tsx}'],
    environment: 'jsdom'
  },
})