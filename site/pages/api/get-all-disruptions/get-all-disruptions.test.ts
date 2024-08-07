import { MiscellaneousReason, PublishStatus, Severity, VehicleMode } from "@create-disruptions-data/shared-ts/enums";
import * as sharedUtils from "@create-disruptions-data/shared-ts/utils";
import MockDate from "mockdate";
import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as dynamo from "../../../data/dynamo";
import { FullDisruption } from "../../../schemas/disruption.schema";
import { DEFAULT_ORG_ID, getMockRequestAndResponse, mockSession, sortedDisruption } from "../../../testData/mockData";
import * as utils from "../../../utils";
import * as session from "../../../utils/apiUtils/auth";
import getAllDisruptions, { formatSortedDisruption } from "./[organisationId].api";

describe("getAllDisruptions", () => {
    const writeHeadMock = vi.fn();

    vi.mock("../../data/dynamo", () => ({
        getDisruptionsDataFromDynamo: vi.fn(),
    }));

    vi.mock("../../utils", async () => ({
        ...(await vi.importActual<object>("../../utils")),
        filterDisruptionsForOperatorUser: vi.fn(),
    }));

    const getDisruptionsDataFromDynamoSpy = vi.spyOn(dynamo, "getDisruptionsDataFromDynamo");
    const sortDisruptionsByStartDateSpy = vi.spyOn(sharedUtils, "sortDisruptionsByStartDate");
    const getSessionSpy = vi.spyOn(session, "getSession");
    const filterDisruptionsForOperatorUserSpy = vi.spyOn(utils, "filterDisruptionsForOperatorUser");

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
            disruptionId: "00831a54-0ecb-4b0c-8d73-310888968747",
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
            disruptionId: "01b15519-41b5-4ace-a212-5331a1622771",
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
        },
    ];

    it("should be successful when session is set", async () => {
        getDisruptionsDataFromDynamoSpy.mockResolvedValue({ disruptions });

        const { req, res } = getMockRequestAndResponse({
            query: {
                organisationId: DEFAULT_ORG_ID,
            },
            mockWriteHeadFn: writeHeadMock,
        });

        res.status = vi.fn().mockImplementation(() => ({
            json: vi.fn(),
        }));

        await getAllDisruptions(req, res);

        expect(getDisruptionsDataFromDynamoSpy).toHaveBeenCalledOnce();
        expect(sortDisruptionsByStartDateSpy).toHaveBeenCalledOnce();

        expect(res.status).toHaveBeenCalledWith(200);
    });

    it("should redirect to error page when no session set", async () => {
        getSessionSpy.mockReturnValue(null);

        const { req, res } = getMockRequestAndResponse({
            body: {},
            mockWriteHeadFn: writeHeadMock,
        });

        res.status = vi.fn().mockImplementation(() => ({
            json: vi.fn(),
        }));

        await getAllDisruptions(req, res);

        expect(getDisruptionsDataFromDynamoSpy).not.toHaveBeenCalledOnce();
        expect(sortDisruptionsByStartDateSpy).not.toHaveBeenCalledOnce();

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

        filterDisruptionsForOperatorUserSpy.mockImplementation(() => {
            return operatorDisruptions;
        });

        getDisruptionsDataFromDynamoSpy.mockResolvedValue({ disruptions: disruptionsWithOperatorDisruptions });

        const { req, res } = getMockRequestAndResponse({
            query: {
                organisationId: DEFAULT_ORG_ID,
            },
            mockWriteHeadFn: writeHeadMock,
        });

        res.status = vi.fn().mockImplementation(() => ({
            json: vi.fn(),
        }));

        await getAllDisruptions(req, res);

        expect(getDisruptionsDataFromDynamoSpy).toHaveBeenCalledOnce();
        expect(sortDisruptionsByStartDateSpy).toHaveBeenCalledOnce();

        expect(filterDisruptionsForOperatorUserSpy).toHaveBeenCalledOnce();
        expect(res.status).toHaveBeenCalledWith(200);
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
                validity: [
                    {
                        disruptionStartDate: "25/03/2090",
                        disruptionStartTime: "1123",
                        disruptionEndDate: "30/03/2090",
                        disruptionEndTime: "1123",
                    },
                    {
                        disruptionStartDate: "25/12/2090",
                        disruptionStartTime: "1123",
                        disruptionEndDate: "30/12/2090",
                        disruptionEndTime: "1123",
                    },
                ],
            });
            expect(formatted.isLive).toEqual(false);
        });
        it("correctly formats disruptions to recently closed", () => {
            const formatted = formatSortedDisruption({
                ...sortedDisruption,
                validity: [
                    {
                        disruptionStartDate: "25/03/2021",
                        disruptionStartTime: "1123",
                        disruptionEndDate: "30/03/2021",
                        disruptionEndTime: "1123",
                    },
                    {
                        disruptionStartDate: "10/10/2023",
                        disruptionStartTime: "1123",
                        disruptionEndDate: "11/10/2023",
                        disruptionEndTime: "1123",
                    },
                ],
            });

            expect(formatted.isLive).toEqual(false);
        });
    });
});
