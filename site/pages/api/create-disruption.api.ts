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
    // {"publishEndTime":"1100","disruptionType":"planned","summary":"UI Test - Edit 'other' product Validation","description":"uhhguyguygyu","associatedLink":"","disruptionReason":"routeDiversion","validity":[{"id":"1","disruptionStartDate":"01/03/2023","disruptionEndDate":"10/03/2029","disruptionStartTime":"1100","disruptionEndTime":"1100","disruptionNoEndDateTime":""}],"publishStartDate":"01/03/2023","publishStartTime":"1300","publishEndDate":"10/04/2030"}

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
            // redirectTo(res, CREATE_DISRUPTION_PAGE_PATH);
            res.status(400).json({});

            return;
        }

        setCookieOnResponseObject(COOKIES_DISRUPTION_INFO, JSON.stringify(validatedBody.data), res);
        destroyCookieOnResponseObject(COOKIES_DISRUPTION_ERRORS, res);

        // redirectTo(res, ADD_CONSEQUENCE_PAGE_PATH);
        res.status(200).json({});
        return;
    } catch (e) {
        if (e instanceof Error) {
            const message = "There was a problem creating a disruption.";
            res.status(500).json({});
            // redirectToError(res, message, "api.create-disruption", e);
            return;
        }

        // redirectToError(res);
        res.status(500).json({});
        return;
    }
};

export default createDisruption;
