import { SendEmailCommand, SESClient } from "@aws-sdk/client-ses";
import { mockClient } from "aws-sdk-client-mock";
import { describe, it, vi, beforeAll, beforeEach, afterEach, expect } from "vitest";
import { getOrgAdminEmailsForStaffUserOrg, sendDisruptionApprovalEmail } from "./disruptionApprovalEmailer";
import * as cognito from "../../data/cognito";
import { DEFAULT_ORG_ID, mockOrgAdmins, mockSession } from "../../testData/mockData";
import * as session from "../../utils/apiUtils/auth";

const sesMock = mockClient(SESClient);
const mockSendApprovalEmailInput = {
    staffUserOrgId: mockSession.orgId,
    disruptionSummary: "test summary",
    disruptionDescription: "test description",
    staffUsername: mockSession.username,
    disruptionId: "123456",
};

describe("getOrgAdminEmailsForStaffUserOrg", () => {
    it("should return a list of org admins emails that are in the same organisation as a staff member", () => {
        expect(getOrgAdminEmailsForStaffUserOrg(mockOrgAdmins, DEFAULT_ORG_ID)).toEqual(["emailtoshow@test.com"]);
    });
    it("should return an empty array if no org admins are found for a staff user", () => {
        const mockAdminsNotForStaffUser = [mockOrgAdmins[1], mockOrgAdmins[1]];
        expect(getOrgAdminEmailsForStaffUserOrg(mockAdminsNotForStaffUser, DEFAULT_ORG_ID)).toEqual([]);
    });
    it("should return an empty array if given an empty array for orgAdmins", () => {
        expect(getOrgAdminEmailsForStaffUserOrg([], DEFAULT_ORG_ID)).toEqual([]);
    });
});

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
