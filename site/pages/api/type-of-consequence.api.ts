import { NextApiRequest, NextApiResponse } from "next";
import {
    ADD_CONSEQUENCE_PAGE_PATH,
    COOKIES_CONSEQUENCE_TYPE_INFO,
    COOKIES_CONSEQUENCE_TYPE_ERRORS,
    CREATE_CONSEQUENCE_NETWORK_PATH,
    CREATE_CONSEQUENCE_OPERATOR_PATH,
    CREATE_CONSEQUENCE_STOPS_PATH,
} from "../../constants/index";
import { typeOfConsequenceSchema } from "../../schemas/type-of-consequence.schema";
import { flattenZodErrors } from "../../utils";
import {
    destroyCookieOnResponseObject,
    redirectTo,
    redirectToError,
    setCookieOnResponseObject,
} from "../../utils/apiUtils";

const addConsequence = (req: NextApiRequest, res: NextApiResponse): void => {
    try {
        const validatedBody = typeOfConsequenceSchema.safeParse(req.body);

        if (!validatedBody.success) {
            setCookieOnResponseObject(
                COOKIES_CONSEQUENCE_TYPE_ERRORS,
                JSON.stringify({
                    inputs: req.body as object,
                    errors: flattenZodErrors(validatedBody.error),
                }),
                res,
            );
            destroyCookieOnResponseObject(COOKIES_CONSEQUENCE_TYPE_INFO, res);
            redirectTo(res, ADD_CONSEQUENCE_PAGE_PATH);
            return;
        }

        setCookieOnResponseObject(COOKIES_CONSEQUENCE_TYPE_INFO, JSON.stringify(validatedBody.data), res);
        destroyCookieOnResponseObject(COOKIES_CONSEQUENCE_TYPE_ERRORS, res);

        switch (validatedBody.data.consequenceType) {
            case "networkWide":
                redirectTo(res, CREATE_CONSEQUENCE_NETWORK_PATH);
                return;
            case "operatorWide":
                redirectTo(res, CREATE_CONSEQUENCE_OPERATOR_PATH);
                return;
            case "stops":
                redirectTo(res, CREATE_CONSEQUENCE_STOPS_PATH);
                return;
            default:
                redirectTo(res, ADD_CONSEQUENCE_PAGE_PATH);
                return;
        }
    } catch (e) {
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
