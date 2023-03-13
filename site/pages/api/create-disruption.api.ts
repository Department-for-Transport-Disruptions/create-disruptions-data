import { NextApiRequest, NextApiResponse } from "next";
import { ZodError } from "zod";
import { COOKIES_DISRUPTION_INFO, COOKIES_DISRUPTION_ERRORS, CREATE_DISRUPTION_PAGE_PATH } from "../../constants/index";
import { createDisruptionsSchemaRefined } from "../../schemas/create-disruption.schema";
import { flattenZodErrors, redirectTo, redirectToError, setCookieOnResponseObject } from "../../utils/apiUtils";

const createDisruption = (req: NextApiRequest, res: NextApiResponse): void => {
    try {
        const validatedBody = createDisruptionsSchemaRefined.parse(req.body);
        setCookieOnResponseObject(COOKIES_DISRUPTION_INFO, JSON.stringify(validatedBody), res);
        setCookieOnResponseObject(COOKIES_DISRUPTION_ERRORS, "", res, 0);

        redirectTo(res, "/type-of-consequence");
        return;
    } catch (e) {
        if (e instanceof ZodError) {
            setCookieOnResponseObject(
                COOKIES_DISRUPTION_ERRORS,
                JSON.stringify({
                    inputs: req.body as object,
                    errors: flattenZodErrors(e),
                }),
                res,
            );
            setCookieOnResponseObject(COOKIES_DISRUPTION_INFO, "", res, 0);
            redirectTo(res, CREATE_DISRUPTION_PAGE_PATH);
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

export default createDisruption;
