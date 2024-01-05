import renderer from "react-test-renderer";
import { describe, it, expect, vi, beforeEach } from "vitest";
import Dashboard from "./dashboard.page";
import { mockSessionWithOrgDetail } from "../testData/mockData";
import * as session from "../utils/apiUtils/auth";

const getSessionWithOrgDetailSpy = vi.spyOn(session, "getSessionWithOrgDetail");
vi.mock("../utils/apiUtils/auth", async () => ({
    ...(await vi.importActual<object>("../utils/apiUtils/auth")),
    getSession: vi.fn(),
}));

beforeEach(() => {
    getSessionWithOrgDetailSpy.mockResolvedValue(mockSessionWithOrgDetail);
});
const defaultNewDisruptionId = "acde070d-8c4c-4f0d-9d8a-162843c10333";

describe("pages", () => {
    describe("dashboard", () => {
        it("should render correctly", () => {
            const tree = renderer
                .create(
                    <Dashboard
                        newDisruptionId={defaultNewDisruptionId}
                        canPublish
                        orgName="Test Org"
                        orgId="test-id"
                        isOperatorUser={false}
                    />,
                )
                .toJSON();
            expect(tree).toMatchSnapshot();
        });

        it("should render correctly for an operator user", () => {
            const tree = renderer
                .create(
                    <Dashboard
                        newDisruptionId={defaultNewDisruptionId}
                        canPublish
                        orgName="Test Org"
                        orgId="test-id"
                        isOperatorUser={true}
                    />,
                )
                .toJSON();
            expect(tree).toMatchSnapshot();
        });
    });
});
