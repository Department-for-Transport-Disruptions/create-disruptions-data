import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import { mockClient } from "aws-sdk-client-mock";
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import * as cognito from "../../data/cognito";
import { mockOrgAdmins, mockSession } from "../../testData/mockData";
import * as session from "../../utils/apiUtils/auth";
import { sendDisruptionApprovalEmail } from "./disruptionApprovalEmailer";

const sesMock = mockClient(SESClient);
const mockSendApprovalEmailInput = {
    staffUserOrgId: mockSession.orgId,
    disruptionSummary: "test summary",
    disruptionDescription: "test description",
    staffUsername: mockSession.name,
    disruptionId: "123456",
};

describe("sendDisruptionApprovalEmail", () => {
    vi.mock("../../data/cognito", () => ({
        getAllUsersInGroup: vi.fn(),
    }));

    const getAllUsersInGroupSpy = vi.spyOn(cognito, "getAllUsersInGroup");
    const getSessionSpy = vi.spyOn(session, "getSession");

    beforeAll(() => {
        process.env.ROOT_DOMAIN = "test.com";
    });

    beforeEach(() => {
        sesMock.reset();
    });

    afterEach(() => {
        vi.resetAllMocks();
    });
    it("should send an approval email to org admins when a staff user creates/edits a disruption", async () => {
        getSessionSpy.mockImplementation(() => ({ ...mockSession, isOrgStaff: true, isSystemAdmin: false }));
        getAllUsersInGroupSpy.mockResolvedValue(mockOrgAdmins);

        await sendDisruptionApprovalEmail(
            mockSendApprovalEmailInput.staffUserOrgId,
            mockSendApprovalEmailInput.disruptionSummary,
            mockSendApprovalEmailInput.disruptionDescription,
            mockSendApprovalEmailInput.staffUsername,
            mockSendApprovalEmailInput.disruptionId,
        );

        expect(sesMock.send.calledOnce).toBeTruthy();
        expect(sesMock.commandCalls(SendEmailCommand)[0].args[0].input.Destination).toEqual({
            ToAddresses: ["emailtoshow@test.com"],
        });
    });

    it("should return if an org admin is not found for a given staff user", async () => {
        getSessionSpy.mockImplementation(() => ({ ...mockSession, isOrgStaff: true, isSystemAdmin: false }));
        getAllUsersInGroupSpy.mockResolvedValue([]);
        await sendDisruptionApprovalEmail(
            mockSendApprovalEmailInput.staffUserOrgId,
            mockSendApprovalEmailInput.disruptionSummary,
            mockSendApprovalEmailInput.disruptionDescription,
            mockSendApprovalEmailInput.staffUsername,
            mockSendApprovalEmailInput.disruptionId,
        );
        expect(sesMock.send.notCalled).toBeTruthy();
    });
});
