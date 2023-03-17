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
    try {
        const validity = Object.entries(req.body as object)
            .filter((item) => item.toString().startsWith("validity"))
            .map((arr: string[], i) => {
                const splitValidityString: string[] = arr[1]
                    .replace("-", "")
                    .replace("No end date/time", "")
                    .split(" ")
                    .filter((v: string) => v);
                return {
                    id: (i + 1).toString(),
                    disruptionStartDate: splitValidityString[0],
                    disruptionStartTime: splitValidityString[1],
                    disruptionEndDate: splitValidityString.length > 2 ? splitValidityString[2] : "",
                    disruptionEndTime: splitValidityString.length > 2 ? splitValidityString[3] : "",
                    disruptionNoEndDateTime: splitValidityString.length > 2 ? "" : "true",
                };
            });

        const cleansedBody = Object.fromEntries(
            Object.entries(req.body as object).filter((item) => !item.toString().startsWith("validity")),
        );

        const validatedBody = createDisruptionsSchemaRefined.safeParse({ ...cleansedBody, validity });

        if (!validatedBody.success) {
            setCookieOnResponseObject(
                COOKIES_DISRUPTION_ERRORS,
                JSON.stringify({
                    inputs: { ...cleansedBody, validity },
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
