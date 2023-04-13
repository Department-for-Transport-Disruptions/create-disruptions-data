import MockDate from "mockdate";
import { describe, it, expect, afterEach, vi, afterAll } from "vitest";
import publish from "./publish.api";
import { ERROR_PATH } from "../../constants/index";
import * as dynamo from "../../data/dynamo";
import { Disruption } from "../../schemas/disruption.schema";
import {
    disruptionWithConsequences,
    ptSituationElementWithMultipleConsequences,
    getMockRequestAndResponse,
    disruptionWithNoConsequences,
} from "../../testData/mockData";

const defaultDisruptionId = "acde070d-8c4c-4f0d-9d8a-162843c10333";

describe("publish", () => {
    const writeHeadMock = vi.fn();
    vi.mock("../../utils/apiUtils", async () => ({
        ...(await vi.importActual<object>("../../utils/apiUtils")),
        setCookieOnResponseObject: vi.fn(),
        destroyCookieOnResponseObject: vi.fn(),
        cleardownCookies: vi.fn(),
    }));

    vi.mock("../../data/dynamo", () => ({
        insertPublishedDisruptionIntoDynamoAndUpdateDraft: vi.fn(),
        getDisruptionById: vi.fn(),
    }));

    vi.mock("crypto", () => ({
        randomUUID: () => "id",
    }));

    MockDate.set("2023-03-03");

    const insertDisruptionSpy = vi.spyOn(dynamo, "insertPublishedDisruptionIntoDynamoAndUpdateDraft");
    const getDisruptionSpy = vi.spyOn(dynamo, "getDisruptionById");

    afterEach(() => {
        vi.resetAllMocks();
    });

    afterAll(() => {
        MockDate.reset();
    });

    it("should retrieve valid data from cookies, write to dynamo and redirect", async () => {
        getDisruptionSpy.mockResolvedValue(disruptionWithConsequences);
        const { req, res } = getMockRequestAndResponse({
            body: {
                disruptionId: defaultDisruptionId,
            },
            mockWriteHeadFn: writeHeadMock,
        });

        await publish(req, res);

        expect(dynamo.insertPublishedDisruptionIntoDynamoAndUpdateDraft).toBeCalledTimes(1);
        expect(dynamo.insertPublishedDisruptionIntoDynamoAndUpdateDraft).toBeCalledWith(
            ptSituationElementWithMultipleConsequences,
            expect.any(String),
        );
        expect(writeHeadMock).toBeCalledWith(302, { Location: "/dashboard" });
    });

    it("should redirect to error page if disruptionId not passed", async () => {
        getDisruptionSpy.mockResolvedValue(disruptionWithConsequences);
        const { req, res } = getMockRequestAndResponse({
            mockWriteHeadFn: writeHeadMock,
        });

        await publish(req, res);

        expect(dynamo.insertPublishedDisruptionIntoDynamoAndUpdateDraft).not.toBeCalled();
        expect(writeHeadMock).toBeCalledWith(302, { Location: ERROR_PATH });
    });

    it("should redirect to error page if disruption is invalid", async () => {
        getDisruptionSpy.mockResolvedValue({} as Disruption);
        const { req, res } = getMockRequestAndResponse({
            body: {
                disruptionId: defaultDisruptionId,
            },
            mockWriteHeadFn: writeHeadMock,
        });

        await publish(req, res);

        expect(dynamo.insertPublishedDisruptionIntoDynamoAndUpdateDraft).not.toBeCalled();
        expect(writeHeadMock).toBeCalledWith(302, { Location: ERROR_PATH });
    });

    it.each([[disruptionWithConsequences], [disruptionWithNoConsequences]])(
        "should write the correct disruptions data to dynamoDB",
        async (disruption) => {
            getDisruptionSpy.mockResolvedValue(disruption);
            const { req, res } = getMockRequestAndResponse({
                body: {
                    disruptionId: disruption.disruptionId,
                },
                mockWriteHeadFn: writeHeadMock,
            });

            await publish(req, res);

            expect(insertDisruptionSpy.mock.calls[0][0]).toMatchSnapshot();
        },
    );
});
