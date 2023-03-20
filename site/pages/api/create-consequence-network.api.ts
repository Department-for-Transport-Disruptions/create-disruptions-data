import { NextApiRequest, NextApiResponse } from "next";
import {
    COOKIES_CONSEQUENCE_INFO,
    COOKIES_CONSEQUENCE_NETWORK_ERRORS,
    CREATE_CONSEQUENCE_NETWORK_PATH,
    REVIEW_DISRUPTION_PAGE_PATH,
} from "../../constants";
import { createConsequenceNetworkSchema } from "../../schemas/create-consequence-network.schema";
import {
    destroyCookieOnResponseObject,
    flattenZodErrors,
    redirectTo,
    redirectToError,
    setCookieOnResponseObject,
} from "../../utils/apiUtils";

const createConsequenceNetwork = (req: NextApiRequest, res: NextApiResponse): void => {
    try {
        const validatedBody = createConsequenceNetworkSchema.safeParse(req.body);

        if (!validatedBody.success) {
            setCookieOnResponseObject(
                COOKIES_CONSEQUENCE_NETWORK_ERRORS,
                JSON.stringify({
                    inputs: req.body as object,
                    errors: flattenZodErrors(validatedBody.error),
                }),
                res,
            );
            destroyCookieOnResponseObject(COOKIES_CONSEQUENCE_INFO, res);
            redirectTo(res, CREATE_CONSEQUENCE_NETWORK_PATH);
            return;
        }

        setCookieOnResponseObject(COOKIES_CONSEQUENCE_INFO, JSON.stringify(validatedBody.data), res);
        destroyCookieOnResponseObject(COOKIES_CONSEQUENCE_NETWORK_ERRORS, res);

        redirectTo(res, REVIEW_DISRUPTION_PAGE_PATH);
        return;
    } catch (e) {
        if (e instanceof Error) {
            const message = "There was a problem adding a consequence network.";
            redirectToError(res, message, "api.create-consequence-network", e);
            return;
        }

        redirectToError(res);
        return;
    }
};

export default createConsequenceNetwork;
