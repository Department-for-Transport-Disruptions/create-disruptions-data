import { NextApiRequest, NextApiResponse } from "next";
import { ZodError } from "zod";
import {
    ADD_CONSEQUENCE_PAGE_PATH,
    COOKIES_CONSEQUENCE_TYPE_INFO,
    COOKIES_CONSEQUENCE_TYPE_ERRORS,
    CREATE_CONSEQUENCE_NETWORK_PATH,
    CREATE_CONSEQUENCE_OPERATOR_PATH,
} from "../../constants/index";
import { typeOfConsequenceSchema } from "../../schemas/type-of-consequence.schema";
import { flattenZodErrors, redirectTo, redirectToError, setCookieOnResponseObject } from "../../utils/apiUtils";

const addConsequence = (req: NextApiRequest, res: NextApiResponse): void => {
    try {
        const validatedBody = typeOfConsequenceSchema.parse(req.body);
        setCookieOnResponseObject(COOKIES_CONSEQUENCE_TYPE_INFO, JSON.stringify(validatedBody), res);
        setCookieOnResponseObject(COOKIES_CONSEQUENCE_TYPE_ERRORS, "", res, 0);

        switch (validatedBody.consequenceType) {
            case "networkWide":
                redirectTo(res, CREATE_CONSEQUENCE_NETWORK_PATH);
                return;
            case "operatorWide":
                redirectTo(res, CREATE_CONSEQUENCE_OPERATOR_PATH);
                return;
            default:
                redirectTo(res, ADD_CONSEQUENCE_PAGE_PATH);
                return;
        }
        return;
    } catch (e) {
        if (e instanceof ZodError) {
            setCookieOnResponseObject(
                COOKIES_CONSEQUENCE_TYPE_ERRORS,
                JSON.stringify({
                    inputs: req.body as object,
                    errors: flattenZodErrors(e),
                }),
                res,
            );
            setCookieOnResponseObject(COOKIES_CONSEQUENCE_TYPE_INFO, "", res, 0);
            redirectTo(res, ADD_CONSEQUENCE_PAGE_PATH);
            return;
        }

        if (e instanceof Error) {
            const message = "There was a problem creating a disruption.";
            redirectToError(res, message, "api.create-disruption", e);
            return;
        }

        redirectToError(res);
        return;
    }
};

export default addConsequence;
