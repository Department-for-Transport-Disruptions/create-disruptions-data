import { cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_ORG_ID, mockViewAllDisruptionsData } from "../testData/mockData";
import ViewAllDisruptions from "./view-all-disruptions.page";

const disruptions = mockViewAllDisruptionsData;
const defaultNewDisruptionId = "acde070d-8c4c-4f0d-9d8a-162843c10333";

const fetchSpy = vi.spyOn(global, "fetch");
const useRouter = vi.spyOn(require("next/router"), "useRouter");

beforeEach(() => {
    useRouter.mockImplementation(() => ({
        query: "",
    }));
});

afterEach(() => {
    vi.resetAllMocks();
    cleanup();
});

describe("ViewAllDisruptions", () => {
    it("should render correctly when there are no disruptions", async () => {
        fetchSpy.mockResolvedValue({
            json: vi.fn().mockResolvedValue({ disruptions: [] }),
        } as unknown as Response);

        const { asFragment } = render(
            <ViewAllDisruptions
                newContentId={defaultNewDisruptionId}
                adminAreaCodes={["099"]}
                enableLoadingSpinnerOnPageLoad={false}
                orgId={DEFAULT_ORG_ID}
            />,
        );

        expect(asFragment()).toMatchSnapshot();
    });

    it("should render correctly when there are enough disruptions for no pagination", async () => {
        fetchSpy.mockResolvedValue({
            json: vi.fn().mockResolvedValue({ disruptions }),
        } as unknown as Response);

        const { asFragment } = render(
            <ViewAllDisruptions
                newContentId={defaultNewDisruptionId}
                adminAreaCodes={["099"]}
                enableLoadingSpinnerOnPageLoad={false}
                orgId={DEFAULT_ORG_ID}
            />,
        );

        expect(asFragment()).toMatchSnapshot();
    });

    it("should render correctly when there are enough disruptions for pagination", async () => {
        fetchSpy.mockResolvedValue({
            json: vi.fn().mockResolvedValue({
                disruptions: [
                    ...disruptions,
                    ...disruptions.map((d) => ({ ...d, id: `${d.id}1` })),
                    ...disruptions.map((d) => ({ ...d, id: `${d.id}2` })),
                    ...disruptions.map((d) => ({ ...d, id: `${d.id}3` })),
                ],
            }),
        } as unknown as Response);

        const { asFragment } = render(
            <ViewAllDisruptions
                newContentId={defaultNewDisruptionId}
                adminAreaCodes={["099"]}
                enableLoadingSpinnerOnPageLoad={false}
                orgId={DEFAULT_ORG_ID}
            />,
        );

        expect(asFragment()).toMatchSnapshot();
    });
});
