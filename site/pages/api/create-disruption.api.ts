import { NextApiRequest, NextApiResponse } from "next";
import {
    COOKIES_DISRUPTION_INFO,
    COOKIES_DISRUPTION_ERRORS,
    CREATE_DISRUPTION_PAGE_PATH,
    ADD_CONSEQUENCE_PAGE_PATH,
} from "../../constants/index";
import { createDisruptionsSchemaRefined } from "../../schemas/create-disruption.schema";
import { flattenZodErrors } from "../../utils";
import {
    destroyCookieOnResponseObject,
    redirectTo,
    redirectToError,
    setCookieOnResponseObject,
} from "../../utils/apiUtils";

export const formatCreateDisruptionBody = (body: object) => {
    const validity = Object.entries(body)
        .filter((item) => item.toString().startsWith("validity"))
        .map((arr: string[]) => {
            const [, values] = arr;

            return {
                disruptionStartDate: values[0],
                disruptionStartTime: values[1],
                disruptionEndDate: values[2],
                disruptionEndTime: values[3],
                disruptionNoEndDateTime: values[4],
            };
        });

    const cleansedBody = Object.fromEntries(
        Object.entries(body).filter((item) => !item.toString().startsWith("validity")),
    );

    return {
        ...cleansedBody,
        validity,
    };
};

const createDisruption = (req: NextApiRequest, res: NextApiResponse): void => {
    try {
        const formattedBody = formatCreateDisruptionBody(req.body as object);

        const validatedBody = createDisruptionsSchemaRefined.safeParse(formattedBody);

        if (!validatedBody.success) {
            setCookieOnResponseObject(
                COOKIES_DISRUPTION_ERRORS,
                JSON.stringify({
                    inputs: formattedBody,
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
