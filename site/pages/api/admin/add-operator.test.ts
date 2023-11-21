import { describe, it, expect, afterEach, vi } from "vitest";
import addOperator, { formatAddOperatorBody } from "./add-operator.api";
import {
    ADD_OPERATOR_PAGE_PATH,
    COOKIES_ADD_OPERATOR_ERRORS,
    MAX_OPERATOR_NOC_CODES,
    USER_MANAGEMENT_PAGE_PATH,
} from "../../../constants";
import * as dynamo from "../../../data/dynamo";
import { ErrorInfo } from "../../../interfaces";
import { DEFAULT_ORG_ID, getMockRequestAndResponse } from "../../../testData/mockData";
import { destroyCookieOnResponseObject, setCookieOnResponseObject } from "../../../utils/apiUtils";

const defaultOperator = { id: 203, nocCode: "TEST", operatorPublicName: "Test Operator" };

const defaultInput = {
    operatorName: "Test Operator",
    nocCodes1: JSON.stringify(defaultOperator),
    orgId: DEFAULT_ORG_ID,
};

describe("add-operator", () => {
    const writeHeadMock = vi.fn();
    vi.mock("../../../utils/apiUtils", async () => ({
        ...(await vi.importActual<object>("../../../utils/apiUtils")),
        setCookieOnResponseObject: vi.fn(),
        destroyCookieOnResponseObject: vi.fn(),
    }));

    const createOperatorSubOrganisationSpy = vi.spyOn(dynamo, "createOperatorSubOrganisation");
    const listOperatorsForOrgSpy = vi.spyOn(dynamo, "listOperatorsForOrg");

    vi.mock("../../../data/dynamo", () => ({
        createOperatorSubOrganisation: vi.fn(),
        listOperatorsForOrg: vi.fn(),
    }));

    afterEach(() => {
        vi.resetAllMocks();
        listOperatorsForOrgSpy.mockResolvedValue([]);
    });

    it("should add an operator when valid inputs are passed", async () => {
        const { req, res } = getMockRequestAndResponse({
            body: defaultInput,
            mockWriteHeadFn: writeHeadMock,
        });

        await addOperator(req, res);

        expect(createOperatorSubOrganisationSpy).toHaveBeenCalledTimes(1);
        expect(createOperatorSubOrganisationSpy).toHaveBeenCalledWith(DEFAULT_ORG_ID, defaultInput.operatorName, [
            "TEST",
        ]);
        expect(destroyCookieOnResponseObject).toHaveBeenCalledTimes(1);
        expect(writeHeadMock).toBeCalledWith(302, { Location: USER_MANAGEMENT_PAGE_PATH });
    });

    it("should redirect to /add-operator with appropriate errors when no inputs are passed", async () => {
        const { req, res } = getMockRequestAndResponse({
            body: { defaultInput },
            mockWriteHeadFn: writeHeadMock,
        });

        await addOperator(req, res);

        const errors: ErrorInfo[] = [
            { errorMessage: "Enter a name for the operator", id: "operatorName" },
            { errorMessage: "Select at least one NOC code", id: "nocCodes" },
        ];

        expect(setCookieOnResponseObject).toHaveBeenCalledTimes(1);
        expect(setCookieOnResponseObject).toHaveBeenCalledWith(
            COOKIES_ADD_OPERATOR_ERRORS,
            JSON.stringify({ inputs: formatAddOperatorBody(req.body as object), errors }),
            res,
        );
        expect(writeHeadMock).toBeCalledWith(302, { Location: ADD_OPERATOR_PAGE_PATH });
    });

    it("should redirect to /add-operator with appropriate errors when more then 5 NOC codes are assigned to an operator", async () => {
        const { req, res } = getMockRequestAndResponse({
            body: {
                ...defaultInput,
                nocCodes2: defaultInput.nocCodes1,
                nocCodes3: defaultInput.nocCodes1,
                nocCodes4: defaultInput.nocCodes1,
                nocCodes5: defaultInput.nocCodes1,
                nocCodes6: defaultInput.nocCodes1,
            },
            mockWriteHeadFn: writeHeadMock,
        });

        await addOperator(req, res);

        const errors: ErrorInfo[] = [
            {
                errorMessage: `Maximum of ${MAX_OPERATOR_NOC_CODES} NOC codes permitted per operator user`,
                id: "nocCodes",
            },
        ];

        expect(setCookieOnResponseObject).toHaveBeenCalledTimes(1);
        expect(setCookieOnResponseObject).toHaveBeenCalledWith(
            COOKIES_ADD_OPERATOR_ERRORS,
            JSON.stringify({ inputs: formatAddOperatorBody(req.body as object), errors }),
            res,
        );
        expect(writeHeadMock).toBeCalledWith(302, { Location: ADD_OPERATOR_PAGE_PATH });
    });

    it("should redirect to /add-operator with appropriate errors when an operator is created with a name that already exists", async () => {
        listOperatorsForOrgSpy.mockResolvedValue([
            {
                orgId: DEFAULT_ORG_ID,
                operatorOrgId: DEFAULT_ORG_ID,
                name: defaultOperator.operatorPublicName.toUpperCase(),
                nocCodes: [defaultOperator.nocCode],
            },
        ]);
        const { req, res } = getMockRequestAndResponse({
            body: {
                ...defaultInput,
            },
            mockWriteHeadFn: writeHeadMock,
        });

        await addOperator(req, res);

        const errors: ErrorInfo[] = [
            {
                errorMessage: "An operator with this name already exists.",
                id: "operatorName",
            },
        ];

        expect(setCookieOnResponseObject).toHaveBeenCalledTimes(1);
        expect(setCookieOnResponseObject).toHaveBeenCalledWith(
            COOKIES_ADD_OPERATOR_ERRORS,
            JSON.stringify({ inputs: formatAddOperatorBody(req.body as object), errors }),
            res,
        );
        expect(writeHeadMock).toBeCalledWith(302, { Location: ADD_OPERATOR_PAGE_PATH });
    });
});
