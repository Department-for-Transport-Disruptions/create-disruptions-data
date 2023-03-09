import renderer from "react-test-renderer";
import { describe, it, expect, vi } from "vitest";
import Radios from "./Radios";
import { PageInputs } from "../../pages/create-disruption";

describe("Radios", () => {
    it("should render correctly with no errors", () => {
        const tree = renderer
            .create(
                <Radios<PageInputs>
                    display="Type of disruption"
                    inputId="type-of-disruption"
                    radioDetail={[
                        {
                            value: "planned",
                            display: "Planned",
                        },
                        {
                            value: "unplanned",
                            display: "Unplanned",
                        },
                    ]}
                    inputName="typeOfDisruption"
                    stateUpdater={vi.fn()}
                    value={""}
                />,
            )
            .toJSON();
        expect(tree).toMatchSnapshot();
    });

    it("should render correctly with errors", () => {
        const tree = renderer
            .create(
                <Radios<PageInputs>
                    display="Type of disruption"
                    inputId="type-of-disruption"
                    initialErrors={[{ errorMessage: "There was an error", id: "type-of-disruption" }]}
                    radioDetail={[
                        {
                            value: "planned",
                            display: "Planned",
                        },
                        {
                            value: "unplanned",
                            display: "Unplanned",
                        },
                    ]}
                    inputName="typeOfDisruption"
                    stateUpdater={vi.fn()}
                    value={""}
                />,
            )
            .toJSON();
        expect(tree).toMatchSnapshot();
    });

    it("should render correctly with a padding", () => {
        const tree = renderer
            .create(
                <Radios<PageInputs>
                    display="Type of disruption"
                    inputId="type-of-disruption"
                    radioDetail={[
                        {
                            value: "planned",
                            display: "Planned",
                        },
                        {
                            value: "unplanned",
                            display: "Unplanned",
                        },
                    ]}
                    inputName="typeOfDisruption"
                    stateUpdater={vi.fn()}
                    value={""}
                    paddingTop={2}
                />,
            )
            .toJSON();
        expect(tree).toMatchSnapshot();
    });
});
