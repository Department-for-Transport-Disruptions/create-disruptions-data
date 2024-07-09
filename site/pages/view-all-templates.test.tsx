import renderer, { act } from "react-test-renderer";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_ORG_ID, mockViewAllDisruptionsData } from "../testData/mockData";
import ViewAllTemplates from "./view-all-templates.page";

type Renderer = {
    toJSON: () => void;
};

const defaultRenderer: Renderer = {
    toJSON: () => {
        return;
    },
};

const templates = mockViewAllDisruptionsData;

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
});

describe("ViewAllTemplates", () => {
    vi.mock("./view-all-templates.page", async () => ({
        ...(await vi.importActual<object>("./view-all-templates.page")),
    }));

    describe("viewAllTemplates", () => {
        it("should render correctly when there are no templates", async () => {
            fetchSpy.mockResolvedValue({
                json: vi.fn().mockResolvedValue({ disruptions: [] }),
            } as unknown as Response);

            let component: Renderer = defaultRenderer;

            await act(() => {
                component = renderer.create(
                    <ViewAllTemplates
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
                json: vi.fn().mockResolvedValue({ disruptions: templates }),
            } as unknown as Response);

            let component: Renderer = defaultRenderer;

            await act(() => {
                component = renderer.create(
                    <ViewAllTemplates
                        newContentId={defaultNewDisruptionId}
                        adminAreaCodes={["099"]}
                        enableLoadingSpinnerOnPageLoad={false}
                        orgId={DEFAULT_ORG_ID}
                    />,
                );
            });

            expect(component.toJSON()).toMatchSnapshot();
        });

        it("should render correctly when there are enough templates for pagination", async () => {
            fetchSpy.mockResolvedValue({
                json: vi.fn().mockResolvedValue({
                    disruptions: [
                        ...templates,
                        ...templates.map((t) => ({ ...t, id: `${t.id}1` })),
                        ...templates.map((t) => ({ ...t, id: `${t.id}2` })),
                        ...templates.map((t) => ({ ...t, id: `${t.id}3` })),
                    ],
                }),
            } as unknown as Response);

            let component: Renderer = defaultRenderer;

            await act(() => {
                component = renderer.create(
                    <ViewAllTemplates
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
