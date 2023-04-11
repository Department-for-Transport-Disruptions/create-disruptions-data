import { NextApiRequest, NextApiResponse } from "next";
import {
    COOKIES_CONSEQUENCE_NETWORK_ERRORS,
    CREATE_CONSEQUENCE_NETWORK_PATH,
    REVIEW_DISRUPTION_PAGE_PATH,
} from "../../constants";
import { addConsequenceToDisruption } from "../../data/dynamo";
import { networkConsequenceSchema } from "../../schemas/consequence.schema";
import { flattenZodErrors } from "../../utils";
import {
    destroyCookieOnResponseObject,
    redirectTo,
    redirectToError,
    setCookieOnResponseObject,
} from "../../utils/apiUtils";

const createConsequenceNetwork = async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
    try {
        const validatedBody = networkConsequenceSchema.safeParse(req.body);

        if (!validatedBody.success) {
            setCookieOnResponseObject(
                COOKIES_CONSEQUENCE_NETWORK_ERRORS,
                JSON.stringify({
                    inputs: req.body as object,
                    errors: flattenZodErrors(validatedBody.error),
                }),
                res,
            );
            redirectTo(res, CREATE_CONSEQUENCE_NETWORK_PATH);
            return;
        }

        await addConsequenceToDisruption(validatedBody.data);
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
