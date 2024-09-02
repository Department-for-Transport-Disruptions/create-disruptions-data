import { cleanup, render } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import DeleteDisruptionButton from "./DeleteDisruptionButton";

afterEach(cleanup);
describe("DeleteDisruptionButton", () => {
    it("should render correctly", () => {
        const { asFragment } = render(<DeleteDisruptionButton disruptionId="123" csrfToken="csrf" />);
        expect(asFragment()).toMatchSnapshot();
    });

    it("shows modal when button is clicked", async () => {
        const { getByText, unmount } = render(<DeleteDisruptionButton disruptionId="123" csrfToken="csrf" />);

        await userEvent.click(getByText("Delete disruption"));

        expect(getByText("Are you sure you wish to delete the disruption?")).toBeTruthy();

        unmount();
    });

    it("closes modal when no is selected", async () => {
        const { getByText, queryByText, unmount } = render(
            <DeleteDisruptionButton disruptionId="123" csrfToken="csrf" />,
        );

        await userEvent.click(getByText("Delete disruption"));

        expect(queryByText("Are you sure you wish to delete the disruption?")).toBeTruthy();

        await userEvent.click(getByText("No, return"));

        expect(queryByText("Are you sure you wish to delete the disruption?")).toBeFalsy();

        unmount();
    });
});
