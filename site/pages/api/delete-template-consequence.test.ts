import MockDate from "mockdate";
import { describe, it, expect, afterEach, vi, afterAll } from "vitest";
import deleteTemplateConsequence from "./delete-template-consequence.api";
import { ERROR_PATH, REVIEW_TEMPLATE_PAGE_PATH, TEMPLATE_OVERVIEW_PAGE_PATH } from "../../constants/index";
import * as dynamo from "../../data/dynamo";
import { getMockRequestAndResponse } from "../../testData/mockData";

const defaultDisruptionId = "acde070d-8c4c-4f0d-9d8a-162843c10333";
const defaultConsequenceId = "1";

describe("deleteTemplateConsequence", () => {
    const writeHeadMock = vi.fn();
    vi.mock("../../utils/apiUtils", async () => ({
        ...(await vi.importActual<object>("../../utils/apiUtils")),
        setCookieOnResponseObject: vi.fn(),
        destroyCookieOnResponseObject: vi.fn(),
        cleardownCookies: vi.fn(),
    }));

    vi.mock("../../data/dynamo", () => ({
        removeConsequenceFromDisruption: vi.fn(),
        upsertConsequence: vi.fn(),
    }));

    vi.mock("crypto", () => ({
        randomUUID: () => "id",
    }));

    MockDate.set("2023-03-03");

    const deleteConsequenceSpy = vi.spyOn(dynamo, "removeConsequenceFromDisruption");

    afterEach(() => {
        vi.resetAllMocks();
    });

    afterAll(() => {
        MockDate.reset();
    });

    it("should retrieve valid data from cookies, write to dynamo and redirect", async () => {
        const { req, res } = getMockRequestAndResponse({
            body: {
                id: defaultConsequenceId,
                disruptionId: defaultDisruptionId,
            },
            mockWriteHeadFn: writeHeadMock,
        });

        await deleteTemplateConsequence(req, res);

        expect(dynamo.removeConsequenceFromDisruption).toBeCalledTimes(1);
        expect(writeHeadMock).toBeCalledWith(302, {
            Location: `${REVIEW_TEMPLATE_PAGE_PATH}/${defaultDisruptionId}`,
        });
    });

    it("should redirect to /dashboard page after updating consequence when invoked from disruption details page", async () => {
        const { req, res } = getMockRequestAndResponse({
            body: {
                id: defaultConsequenceId,
                disruptionId: defaultDisruptionId,
                inEdit: "true",
            },
            mockWriteHeadFn: writeHeadMock,
        });

        await deleteTemplateConsequence(req, res);

        expect(dynamo.upsertConsequence).toBeCalledTimes(1);
        expect(writeHeadMock).toBeCalledWith(302, {
            Location: `${TEMPLATE_OVERVIEW_PAGE_PATH}/${defaultDisruptionId}`,
        });
    });

    it("should redirect to error page if consequenceId not passed", async () => {
        const { req, res } = getMockRequestAndResponse({
            mockWriteHeadFn: writeHeadMock,
        });

        await deleteTemplateConsequence(req, res);

        expect(dynamo.removeConsequenceFromDisruption).not.toBeCalled();
        expect(writeHeadMock).toBeCalledWith(302, { Location: ERROR_PATH });
    });

    it("should delete consequence data in dynamoDB"),
        async () => {
            const { req, res } = getMockRequestAndResponse({
                body: {
                    id: defaultConsequenceId,
                    disruptionId: defaultDisruptionId,
                },
                mockWriteHeadFn: writeHeadMock,
            });

            await deleteTemplateConsequence(req, res);

            expect(deleteConsequenceSpy.mock.calls[0][0]).toMatchSnapshot();
        };
});
