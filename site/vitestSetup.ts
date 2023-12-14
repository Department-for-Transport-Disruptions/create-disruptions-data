// vitestSetup.ts
import { beforeAll, vi } from "vitest";
beforeAll(() => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    vi.mock("next/router", () => require("next-router-mock"));
});
