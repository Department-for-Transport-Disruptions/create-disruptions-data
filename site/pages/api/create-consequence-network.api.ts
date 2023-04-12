import { NextApiRequest, NextApiResponse } from "next";
import {
    COOKIES_CONSEQUENCE_NETWORK_ERRORS,
    CREATE_CONSEQUENCE_NETWORK_PATH,
    ERROR_PATH,
    REVIEW_DISRUPTION_PAGE_PATH,
} from "../../constants";
import { upsertConsequence } from "../../data/dynamo";
import { NetworkConsequence, networkConsequenceSchema } from "../../schemas/consequence.schema";
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
            const body = req.body as NetworkConsequence;

            if (!body.disruptionId || !body.consequenceIndex) {
                redirectTo(res, ERROR_PATH);
                return;
            }

            setCookieOnResponseObject(
                COOKIES_CONSEQUENCE_NETWORK_ERRORS,
                JSON.stringify({
                    inputs: body,
                    errors: flattenZodErrors(validatedBody.error),
                }),
                res,
            );

            redirectTo(res, `${CREATE_CONSEQUENCE_NETWORK_PATH}/${body.disruptionId}/${body.consequenceIndex}`);
            return;
        }

        await upsertConsequence(validatedBody.data);
        destroyCookieOnResponseObject(COOKIES_CONSEQUENCE_NETWORK_ERRORS, res);

        redirectTo(res, `${REVIEW_DISRUPTION_PAGE_PATH}/${validatedBody.data.disruptionId}`);
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
