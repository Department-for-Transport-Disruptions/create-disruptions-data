import { NextApiRequest, NextApiResponse } from "next";
import {
    COOKIES_DISRUPTION_INFO,
    COOKIES_DISRUPTION_ERRORS,
    CREATE_DISRUPTION_PAGE_PATH,
    ADD_CONSEQUENCE_PAGE_PATH,
} from "../../constants/index";
import { createDisruptionsSchemaRefined } from "../../schemas/create-disruption.schema";
import {
    destroyCookieOnResponseObject,
    flattenZodErrors,
    redirectTo,
    redirectToError,
    setCookieOnResponseObject,
} from "../../utils/apiUtils";

const createDisruption = (req: NextApiRequest, res: NextApiResponse): void => {
    res.send(req.body);

    // {"disruptionType":"planned","summary":"UI Test - Edit 'other' product Validation","description":"blah blah blah","associatedLink":"","disruptionReason":"routeDiversion","disruptionStartDate":"24/03/2023","disruptionStartTime":"1200","disruptionNoEndDateTime":"true","publishStartDate":"23/03/2023","publishStartTime":"1300","publishNoEndDateTime":"true"}

    try {
        const validatedBody = createDisruptionsSchemaRefined.safeParse(req.body);

        if (!validatedBody.success) {
            setCookieOnResponseObject(
                COOKIES_DISRUPTION_ERRORS,
                JSON.stringify({
                    inputs: req.body as object,
                    errors: flattenZodErrors(validatedBody.error),
                }),
                res,
            );
            destroyCookieOnResponseObject(COOKIES_DISRUPTION_INFO, res);
            redirectTo(res, CREATE_DISRUPTION_PAGE_PATH);
            return;
        }

        setCookieOnResponseObject(COOKIES_DISRUPTION_INFO, JSON.stringify(validatedBody.data), res);
        destroyCookieOnResponseObject(COOKIES_DISRUPTION_ERRORS, res);

        redirectTo(res, ADD_CONSEQUENCE_PAGE_PATH);
        return;
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

export default createDisruption;
