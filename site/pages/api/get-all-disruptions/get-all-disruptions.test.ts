import { MiscellaneousReason, PublishStatus, Severity, VehicleMode } from "@create-disruptions-data/shared-ts/enums";
import MockDate from "mockdate";
import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as db from "../../../data/db";
import { FullDisruption } from "../../../schemas/disruption.schema";
import { DEFAULT_ORG_ID, getMockRequestAndResponse, mockSession, sortedDisruption } from "../../../testData/mockData";
import * as session from "../../../utils/apiUtils/auth";
import getAllDisruptions, { formatSortedDisruption, GetDisruptionsApiRequest } from "./[organisationId].api";

describe("getAllDisruptions", () => {
    const writeHeadMock = vi.fn();

    vi.mock("../../data/db", () => ({
        getDisruptionsData: vi.fn(),
    }));

    const getDisruptionsDataSpy = vi.spyOn(db, "getDisruptionsData");
    const getSessionSpy = vi.spyOn(session, "getSession");

    beforeEach(() => {
        getSessionSpy.mockImplementation(() => {
            return mockSession;
        });
    });

    afterEach(() => {
        vi.resetAllMocks();
    });

    afterAll(() => {
        MockDate.reset();
    });

    const disruptions: FullDisruption[] = [
        {
            associatedLink: "",
            consequences: [
                {
                    consequenceIndex: 0,
                    consequenceType: "networkWide",
                    description: "testpending81",
                    disruptionDelay: "",
                    disruptionId: "00831a54-0ecb-4b0c-8d73-310888968747",
                    disruptionSeverity: Severity.unknown,
                    removeFromJourneyPlanners: "no",
                    vehicleMode: VehicleMode.bus,
                },
            ],
            description: "testpending81",
            displayId: "415351",
            id: "00831a54-0ecb-4b0c-8d73-310888968747",
            disruptionNoEndDateTime: "true",
            disruptionReason: MiscellaneousReason.accident,
            disruptionRepeats: "doesntRepeat",
            disruptionRepeatsEndDate: "",
            disruptionStartDate: "07/03/2023",
            disruptionStartTime: "1000",
            disruptionType: "planned",
            publishStartDate: "07/03/2023",
            publishStartTime: "1000",
            publishStatus: PublishStatus.draft,
            socialMediaPosts: [],
            summary: "testpending81",
            validity: [],
            template: false,
            publishStartTimestamp: "2023-03-07T10:00:00Z",
            publishEndTimestamp: null,
            validityStartTimestamp: "2023-03-07T10:00:00Z",
            validityEndTimestamp: null,
        },
        {
            associatedLink: "",
            consequences: [
                {
                    consequenceIndex: 0,
                    consequenceType: "networkWide",
                    description: "testfilter3",
                    disruptionDelay: "",
                    disruptionId: "01b15519-41b5-4ace-a212-5331a1622771",
                    disruptionSeverity: Severity.unknown,
                    removeFromJourneyPlanners: "no",
                    vehicleMode: VehicleMode.bus,
                },
            ],
            description: "testfilter3",
            displayId: "124b84",
            id: "01b15519-41b5-4ace-a212-5331a1622771",
            disruptionNoEndDateTime: "true",
            disruptionReason: MiscellaneousReason.accident,
            disruptionRepeats: "doesntRepeat",
            disruptionRepeatsEndDate: "",
            disruptionStartDate: "08/03/2023",
            disruptionStartTime: "1000",
            disruptionType: "planned",
            publishStartDate: "07/03/2023",
            publishStartTime: "1000",
            publishStatus: PublishStatus.published,
            socialMediaPosts: [],
            summary: "testfilter3",
            validity: [],
            template: false,
            publishStartTimestamp: "2023-03-07T10:00:00Z",
            publishEndTimestamp: null,
            validityStartTimestamp: "2023-03-08T10:00:00Z",
            validityEndTimestamp: null,
        },
    ];

    it("should be successful when session is set", async () => {
        getDisruptionsDataSpy.mockResolvedValue(disruptions);

        const { req, res } = getMockRequestAndResponse({
            query: {
                organisationId: DEFAULT_ORG_ID,
                type: "all",
            },
            mockWriteHeadFn: writeHeadMock,
        });

        const jsonMock = vi.fn();

        res.status = vi.fn().mockImplementation(() => ({
            json: jsonMock,
        }));

        await getAllDisruptions(req as GetDisruptionsApiRequest, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(jsonMock).toMatchSnapshot();
    });

    it("should redirect to error page when no session set", async () => {
        getSessionSpy.mockReturnValue(null);

        const { req, res } = getMockRequestAndResponse({
            query: {
                organisationId: DEFAULT_ORG_ID,
                type: "all",
            },
            mockWriteHeadFn: writeHeadMock,
        });

        res.status = vi.fn().mockImplementation(() => ({
            json: vi.fn(),
        }));

        await getAllDisruptions(req as GetDisruptionsApiRequest, res);

        expect(getDisruptionsDataSpy).not.toHaveBeenCalledOnce();

        expect(res.status).toHaveBeenCalledWith(403);
    });

    it("should call filterDisruptionsForOperatorUser for operator users", async () => {
        getSessionSpy.mockImplementation(() => {
            return { ...mockSession, isOperatorUser: true, operatorOrgId: "test-operator" };
        });

        const operatorDisruptions = disruptions.map((disruption) => {
            return { ...disruption, createdByOperatorOrgId: "test-operator" };
        });

        const disruptionsWithOperatorDisruptions = [...operatorDisruptions, ...disruptions];

        getDisruptionsDataSpy.mockResolvedValue(disruptionsWithOperatorDisruptions);

        const { req, res } = getMockRequestAndResponse({
            query: {
                organisationId: DEFAULT_ORG_ID,
                type: "all",
            },
            mockWriteHeadFn: writeHeadMock,
        });

        const jsonMock = vi.fn();

        res.status = vi.fn().mockImplementation(() => ({
            json: jsonMock,
        }));

        await getAllDisruptions(req as GetDisruptionsApiRequest, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(jsonMock).toMatchSnapshot();
    });

    describe("formatSortedDisruptions", () => {
        MockDate.set("2023-10-18");

        it("correctly formats disruptions", () => {
            const formatted = formatSortedDisruption(sortedDisruption);
            expect(formatted).toMatchSnapshot();
        });

        it("correctly formats disruptions to live", () => {
            const formatted = formatSortedDisruption({
                ...sortedDisruption,
                validity: [
                    {
                        disruptionStartDate: "25/03/2022",
                        disruptionStartTime: "1123",
                        disruptionEndDate: "30/03/2022",
                        disruptionEndTime: "1123",
                    },
                    {
                        disruptionStartDate: "25/12/2040",
                        disruptionStartTime: "1123",
                        disruptionEndDate: "30/12/2040",
                        disruptionEndTime: "1123",
                    },
                    {
                        disruptionStartDate: "25/03/2090",
                        disruptionStartTime: "1123",
                        disruptionEndDate: "30/03/2090",
                        disruptionEndTime: "1123",
                    },
                ],
            });

            expect(formatted.isLive).toEqual(true);
        });
        it("correctly formats disruptions to upcoming", () => {
            const formatted = formatSortedDisruption({
                ...sortedDisruption,
                validityStartTimestamp: "2023-10-19T11:23:00Z",
                validityEndTimestamp: null,
                publishStartTimestamp: "2023-10-19T11:23:00Z",
                publishEndTimestamp: null,
            });
            expect(formatted.isLive).toEqual(false);
        });
        it("correctly formats disruptions to recently closed", () => {
            const formatted = formatSortedDisruption({
                ...sortedDisruption,
                validityStartTimestamp: "2021-03-25T11:23:00Z",
                validityEndTimestamp: "2023-10-17T12:00:00Z",
                publishStartTimestamp: "2020-10-10T12:00:00Z",
                publishEndTimestamp: "2023-10-17T12:00:00Z",
            });

            expect(formatted.isLive).toEqual(false);
        });
    });
});
