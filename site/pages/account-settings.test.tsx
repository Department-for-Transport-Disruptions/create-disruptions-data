import renderer from "react-test-renderer";
import { describe, it, expect } from "vitest";
import AccountSettings from "./account-settings.page";

describe("accountSettings", () => {
    it("should render correctly", () => {
        const tree = renderer.create(<AccountSettings />).toJSON();
        expect(tree).toMatchSnapshot();
    });
});
