import * as React from "react";
import renderer from "react-test-renderer";
import DateSelector from "./DateSelector";
import { describe, it, expect } from "vitest";

describe("DateSelector", () => {
    it("should render correctly with no input", () => {
        const tree = renderer.create(<DateSelector input={null} startOrEnd={"start"} disabled={false} inputId={"publish-end-date"} />).toJSON();
        expect(tree).toMatchSnapshot();
    });

    it("should render correctly with an input", () => {
        const tree = renderer.create(<DateSelector input={new Date('01/01/2023')} startOrEnd={"start"} disabled={false} inputId={"publish-end-date"} />).toJSON();
        expect(tree).toMatchSnapshot();
    });

    it("should render correctly when disabled", () => {
        const tree = renderer.create(<DateSelector input={null} startOrEnd={"start"} inputId={"publish-end-date"} disabled />).toJSON();
        expect(tree).toMatchSnapshot();
    });
});
