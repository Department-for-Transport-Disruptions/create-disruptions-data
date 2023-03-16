import { NextApiRequest, NextApiResponse } from "next";
import { COOKIES_DISRUPTION_INFO, COOKIES_DISRUPTION_ERRORS } from "../../constants/index";
import { createDisruptionsSchemaRefined } from "../../schemas/create-disruption.schema";
import { destroyCookieOnResponseObject, flattenZodErrors, setCookieOnResponseObject } from "../../utils/apiUtils";

const createDisruption = (req: NextApiRequest, res: NextApiResponse): void => {
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
            res.status(400).json({});
            return;
        }

        setCookieOnResponseObject(COOKIES_DISRUPTION_INFO, JSON.stringify(validatedBody.data), res);
        destroyCookieOnResponseObject(COOKIES_DISRUPTION_ERRORS, res);
        res.status(200).json({});
        return;
    } catch (e) {
        if (e instanceof Error) {
            const message = "There was a problem creating a disruption.";
            res.status(500).json({ message, error: e.stack });
            return;
        }
        res.status(500).json({});
        return;
    }
};

export default createDisruption;
