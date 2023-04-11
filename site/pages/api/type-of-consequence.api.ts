import { NextApiRequest, NextApiResponse } from "next";
import {
    TYPE_OF_CONSEQUENCE_PAGE_PATH,
    COOKIES_CONSEQUENCE_TYPE_ERRORS,
    CREATE_CONSEQUENCE_NETWORK_PATH,
    CREATE_CONSEQUENCE_OPERATOR_PATH,
    CREATE_CONSEQUENCE_STOPS_PATH,
    CREATE_CONSEQUENCE_SERVICES_PATH,
} from "../../constants/index";
import { upsertConsequenceTypeInDisruption } from "../../data/dynamo";
import { typeOfConsequenceSchema } from "../../schemas/type-of-consequence.schema";
import { flattenZodErrors } from "../../utils";
import {
    destroyCookieOnResponseObject,
    redirectTo,
    redirectToError,
    setCookieOnResponseObject,
} from "../../utils/apiUtils";

const addConsequence = async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
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
            redirectTo(res, TYPE_OF_CONSEQUENCE_PAGE_PATH);
            return;
        }

        await upsertConsequenceTypeInDisruption(validatedBody.data);
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
            case "services":
                redirectTo(res, CREATE_CONSEQUENCE_SERVICES_PATH);
                return;
            default:
                redirectTo(res, TYPE_OF_CONSEQUENCE_PAGE_PATH);
                return;
        }
    } catch (e) {
        if (e instanceof Error) {
            const message = "There was a problem creating a disruption.";
            redirectToError(res, message, "api.type-of-consequence", e);
            return;
        }

        redirectToError(res);
        return;
    }
};

export default addConsequence;
