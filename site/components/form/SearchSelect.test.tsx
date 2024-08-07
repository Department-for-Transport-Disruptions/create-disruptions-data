import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import SearchSelect from "./SearchSelect";

interface ColourOption {
    readonly value: string;
    readonly label: string;
}

describe("SearchSelect", () => {
    it("should render correctly with no errors", () => {
        const { asFragment } = render(
            <SearchSelect<ColourOption>
                selected={{ value: "ocean", label: "Ocean" }}
                inputName="test-id"
                handleChange={() => null}
                tableData={[]}
                getRows={() => [
                    {
                        header: "test row 1",
                        cells: ["1"],
                    },
                    {
                        header: "test row 2",
                        cells: ["2"],
                    },
                ]}
                display="Test Data"
                displaySize="l"
                inputId="test-id"
                inputValue=""
                setSearchInput={() => ""}
                placeholder="placeholder"
                options={[
                    { value: "ocean", label: "Ocean" },
                    { value: "blue", label: "Blue" },
                ]}
            />,
        );
        expect(asFragment()).toMatchSnapshot();
    });

    it("should render correctly with errors", () => {
        const { asFragment } = render(
            <SearchSelect<ColourOption>
                selected={{ value: "ocean", label: "Ocean" }}
                inputName="test-id"
                handleChange={() => null}
                tableData={[]}
                getRows={() => [
                    {
                        header: "test row 1",
                        cells: ["1"],
                    },
                    {
                        header: "test row 2",
                        cells: ["2"],
                    },
                ]}
                display="Test Data"
                displaySize="l"
                inputId="test-id"
                initialErrors={[{ errorMessage: "There was an error", id: "test-id" }]}
                inputValue=""
                setSearchInput={() => ""}
                placeholder="placeholder"
                options={[
                    { value: "ocean", label: "Ocean" },
                    { value: "blue", label: "Blue" },
                ]}
            />,
        );
        expect(asFragment()).toMatchSnapshot();
    });
});
