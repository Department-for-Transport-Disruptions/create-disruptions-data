import MockDate from "mockdate";
import { afterAll, afterEach, describe, expect, it, vi } from "vitest";
import { DISRUPTION_DETAIL_PAGE_PATH, ERROR_PATH, REVIEW_DISRUPTION_PAGE_PATH } from "../../constants/index";
import * as db from "../../data/db";
import { getMockRequestAndResponse } from "../../testData/mockData";
import deleteConsequence from "./delete-consequence.api";

const defaultDisruptionId = "acde070d-8c4c-4f0d-9d8a-162843c10333";
const defaultConsequenceId = "1";

describe("deleteConsequence", () => {
    const writeHeadMock = vi.fn();
    vi.mock("../../utils/apiUtils", async () => ({
        ...(await vi.importActual<object>("../../utils/apiUtils")),
        setCookieOnResponseObject: vi.fn(),
        destroyCookieOnResponseObject: vi.fn(),
        cleardownCookies: vi.fn(),
    }));

    vi.mock("../../data/db", () => ({
        removeConsequenceFromDisruption: vi.fn(),
        upsertConsequence: vi.fn(),
    }));

    vi.mock("crypto", () => ({
        default: {
            randomUUID: () => "id",
        },
    }));

    MockDate.set("2023-03-03");

    const deleteConsequenceSpy = vi.spyOn(db, "removeConsequenceFromDisruption");

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

        await deleteConsequence(req, res);

        expect(db.removeConsequenceFromDisruption).toBeCalledTimes(1);
        expect(writeHeadMock).toBeCalledWith(302, {
            Location: `${REVIEW_DISRUPTION_PAGE_PATH}/${defaultDisruptionId}`,
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

        await deleteConsequence(req, res);

        expect(db.removeConsequenceFromDisruption).toBeCalledTimes(1);
        expect(writeHeadMock).toBeCalledWith(302, {
            Location: `${DISRUPTION_DETAIL_PAGE_PATH}/${defaultDisruptionId}`,
        });
    });

    it("should redirect to error page if consequenceId not passed", async () => {
        const { req, res } = getMockRequestAndResponse({
            mockWriteHeadFn: writeHeadMock,
        });

        await deleteConsequence(req, res);

        expect(db.removeConsequenceFromDisruption).not.toBeCalled();
        expect(writeHeadMock).toBeCalledWith(302, { Location: ERROR_PATH });
    });

    it("should delete consequence data in dynamoDB", async () => {
        const { req, res } = getMockRequestAndResponse({
            body: {
                id: defaultConsequenceId,
                disruptionId: defaultDisruptionId,
            },
            mockWriteHeadFn: writeHeadMock,
        });

        await deleteConsequence(req, res);

        expect(deleteConsequenceSpy.mock.calls[0][0]).toMatchSnapshot();
    });
});
