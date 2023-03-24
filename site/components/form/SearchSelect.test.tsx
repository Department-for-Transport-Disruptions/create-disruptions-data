import { describe, it, expect, vi } from "vitest";
import SearchSelect from "./SearchSelect";
import { TestInputs } from "../../interfaces";

describe("SearchSelect", () => {
    it("should render correctly with no errors", () => {
        const tree = renderer.create(<SearchSelect<TestInputs> />).toJSON();
    });
});
