import renderer, { act } from "react-test-renderer";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import ViewAllDisruptions from "./view-all-disruptions.page";
import { TableContents } from "../components/ViewAllContents";
import { DEFAULT_ORG_ID, mockViewAllDisruptionsData } from "../testData/mockData";

type Renderer = {
    toJSON: () => void;
};

const defaultRenderer: Renderer = {
    toJSON: () => {
        return;
    },
};

const disruptions: TableContents[] = mockViewAllDisruptionsData;

const defaultNewDisruptionId = "acde070d-8c4c-4f0d-9d8a-162843c10333";

const fetchSpy = vi.spyOn(global, "fetch");

// eslint-disable-next-line @typescript-eslint/no-var-requires
const useRouter = vi.spyOn(require("next/router"), "useRouter");
beforeEach(() => {
    useRouter.mockImplementation(() => ({
        query: "",
    }));
});

afterEach(() => {
    vi.resetAllMocks();
});

describe("ViewAllDisruption", () => {
    vi.mock("./view-all-disruptions.page", async () => ({
        ...(await vi.importActual<object>("./view-all-disruptions.page")),
    }));

    describe("viewAllDisruptions", () => {
        it("should render correctly when there are no disruptions", async () => {
            fetchSpy.mockResolvedValue({
                json: vi.fn().mockResolvedValue({ disruptions: [] }),
            } as unknown as Response);

            let component: Renderer = defaultRenderer;

            await act(() => {
                component = renderer.create(
                    <ViewAllDisruptions
                        newContentId={defaultNewDisruptionId}
                        adminAreaCodes={["099"]}
                        enableLoadingSpinnerOnPageLoad={false}
                        orgId={DEFAULT_ORG_ID}
                    />,
                );
            });

            expect(component.toJSON()).toMatchSnapshot();
        });

        it("should render correctly when there are enough disruptions for no pagination", async () => {
            fetchSpy.mockResolvedValue({
                json: vi.fn().mockResolvedValue({ disruptions }),
            } as unknown as Response);

            let component: Renderer = defaultRenderer;

            await act(() => {
                component = renderer.create(
                    <ViewAllDisruptions
                        newContentId={defaultNewDisruptionId}
                        adminAreaCodes={["099"]}
                        enableLoadingSpinnerOnPageLoad={false}
                        orgId={DEFAULT_ORG_ID}
                    />,
                );
            });

            expect(component.toJSON()).toMatchSnapshot();
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

            let component: Renderer = defaultRenderer;

            await act(() => {
                component = renderer.create(
                    <ViewAllDisruptions
                        newContentId={defaultNewDisruptionId}
                        adminAreaCodes={["099"]}
                        enableLoadingSpinnerOnPageLoad={false}
                        orgId={DEFAULT_ORG_ID}
                    />,
                );
            });

            expect(component.toJSON()).toMatchSnapshot();
        });
    });
});
