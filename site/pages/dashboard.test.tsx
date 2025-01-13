import { cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mockSessionWithOrgDetail } from "../testData/mockData";
import * as session from "../utils/apiUtils/auth";
import Dashboard from "./dashboard.page";

const getSessionWithOrgDetailSpy = vi.spyOn(session, "getSessionWithOrgDetail");
vi.mock("../utils/apiUtils/auth", async () => ({
    ...(await vi.importActual<object>("../utils/apiUtils/auth")),
    getSession: vi.fn(),
}));

beforeEach(() => {
    getSessionWithOrgDetailSpy.mockResolvedValue(mockSessionWithOrgDetail);
});

afterEach(cleanup);

const defaultNewDisruptionId = "acde070d-8c4c-4f0d-9d8a-162843c10333";

describe("pages", () => {
    describe("dashboard", () => {
        it("should render correctly", () => {
            const { asFragment } = render(
                <Dashboard
                    newDisruptionId={defaultNewDisruptionId}
                    canPublish
                    orgName="Test Org"
                    orgId="test-id"
                    isOperatorUser={false}
                    enableLoadingSpinnerOnPageLoad={false}
                    pendingApprovalCount={0}
                />,
            );
            expect(asFragment()).toMatchSnapshot();
        });

        it("should render correctly for an operator user", () => {
            const { asFragment } = render(
                <Dashboard
                    newDisruptionId={defaultNewDisruptionId}
                    canPublish
                    orgName="Test Org"
                    orgId="test-id"
                    isOperatorUser={true}
                    enableLoadingSpinnerOnPageLoad={false}
                    pendingApprovalCount={0}
                />,
            );
            expect(asFragment()).toMatchSnapshot();
        });
    });
});
