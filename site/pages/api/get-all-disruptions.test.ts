import { MiscellaneousReason, PublishStatus, Severity, VehicleMode } from "@create-disruptions-data/shared-ts/enums";
import { describe, it, expect, afterEach, vi } from "vitest";
import { randomUUID } from "crypto";
import getAllDisruptions from "./get-all-disruptions.api";
import * as dynamo from "../../data/dynamo";
import { Disruption } from "../../schemas/disruption.schema";
import { getMockRequestAndResponse } from "../../testData/mockData";
import * as utils from "../../utils";

describe("getAllDisruptions", () => {
    const writeHeadMock = vi.fn();

    vi.mock("../../data/dynamo", () => ({
        getDisruptionsDataFromDynamo: vi.fn(),
    }));

    const getDisruptionsDataFromDynamoSpy = vi.spyOn(dynamo, "getDisruptionsDataFromDynamo");
    const sortDisruptionsByStartDateSpy = vi.spyOn(utils, "sortDisruptionsByStartDate");

    afterEach(() => {
        vi.resetAllMocks();
    });

    // beforeEach(() => {
    //     getDisruptionsDataFromDynamoSpy.mockImplementation(() => {
    //         return disruptions;
    //     });
    // });
    const disruptions: Disruption[] = [
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
        },
    ];

    it("should be successful when org id is passed", async () => {
        getDisruptionsDataFromDynamoSpy.mockResolvedValue(disruptions);

        const { req, res } = getMockRequestAndResponse({
            body: {
                orgId: randomUUID(),
            },
            mockWriteHeadFn: writeHeadMock,
        });

        await getAllDisruptions(req, res);

        expect(getDisruptionsDataFromDynamoSpy).toHaveBeenCalledOnce();
        expect(sortDisruptionsByStartDateSpy).toHaveBeenCalledOnce();
    });

    it("should throw an error when org id is not passed", async () => {
        getDisruptionsDataFromDynamoSpy.mockResolvedValue(disruptions);

        const { req, res } = getMockRequestAndResponse({
            body: {},
            mockWriteHeadFn: writeHeadMock,
        });

        try {
            await getAllDisruptions(req, res);
        } catch (error) {
            if (error instanceof Error) {
                expect(error.message).toBe("No Org Id passed");
            }
        }
        expect(getDisruptionsDataFromDynamoSpy).not.toHaveBeenCalledOnce();
        expect(sortDisruptionsByStartDateSpy).not.toHaveBeenCalledOnce();
    });
});
